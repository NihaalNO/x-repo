from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from middleware.auth import get_current_user_uid
from services.supabase_service import get_supabase
from datetime import datetime
import uuid

router = APIRouter()

class CommunityCreate(BaseModel):
    name: str
    display_name: str
    description: Optional[str] = None
    rules: Optional[str] = None

@router.get("")
async def list_communities(limit: int = 20, offset: int = 0):
    """List all communities"""
    supabase = get_supabase()
    
    result = supabase.table("communities").select("*, created_by_user:users(*)").limit(limit).offset(offset).order("member_count", desc=True).execute()
    
    return {"communities": result.data or [], "total": len(result.data or [])}

@router.post("")
async def create_community(
    community: CommunityCreate,
    uid: str = Depends(get_current_user_uid)
):
    """Create a new community"""
    supabase = get_supabase()
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Check if name already exists
    existing = supabase.table("communities").select("id").eq("name", community.name).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Community name already taken")
    
    community_data = {
        "id": str(uuid.uuid4()),
        "name": community.name,
        "display_name": community.display_name,
        "description": community.description,
        "rules": community.rules,
        "created_by": user_id,
        "member_count": 0,
        "created_at": datetime.utcnow().isoformat(),
    }
    
    result = supabase.table("communities").insert(community_data).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create community")
    
    # Auto-join creator
    supabase.table("community_members").insert({
        "community_id": result.data[0]["id"],
        "user_id": user_id
    }).execute()
    
    return result.data[0]

@router.get("/{name}")
async def get_community(name: str):
    """Get community details"""
    supabase = get_supabase()
    
    result = supabase.table("communities").select("*, created_by_user:users(*)").eq("name", name).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Community not found")
    
    return result.data[0]

@router.post("/{name}/join")
async def join_community(
    name: str,
    uid: str = Depends(get_current_user_uid)
):
    """Join a community"""
    supabase = get_supabase()
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    community_result = supabase.table("communities").select("id").eq("name", name).execute()
    if not community_result.data:
        raise HTTPException(status_code=404, detail="Community not found")
    
    community_id = community_result.data[0]["id"]
    
    # Check if already member
    existing = supabase.table("community_members").select("*").eq("community_id", community_id).eq("user_id", user_id).execute()
    if existing.data:
        return {"message": "Already a member", "joined": True}
    
    # Join
    supabase.table("community_members").insert({
        "community_id": community_id,
        "user_id": user_id
    }).execute()
    
    # Increment member count
    supabase.rpc("increment", {"table_name": "communities", "column_name": "member_count", "id": community_id}).execute()
    
    return {"message": "Joined community", "joined": True}

@router.post("/{name}/leave")
async def leave_community(
    name: str,
    uid: str = Depends(get_current_user_uid)
):
    """Leave a community"""
    supabase = get_supabase()
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    community_result = supabase.table("communities").select("id").eq("name", name).execute()
    if not community_result.data:
        raise HTTPException(status_code=404, detail="Community not found")
    
    community_id = community_result.data[0]["id"]
    
    # Leave
    supabase.table("community_members").delete().eq("community_id", community_id).eq("user_id", user_id).execute()
    
    # Decrement member count
    supabase.rpc("decrement", {"table_name": "communities", "column_name": "member_count", "id": community_id}).execute()
    
    return {"message": "Left community", "joined": False}

@router.get("/{name}/posts")
async def get_community_posts(
    name: str,
    limit: int = 25,
    offset: int = 0,
    sort: str = "hot",
    time_range: Optional[str] = None,  # day, week, month, year, all
    search: Optional[str] = None  # search query
):
    """Get posts in a community with various sorting options"""
    from typing import Optional
    
    supabase = get_supabase()
    
    community_result = supabase.table("communities").select("id").eq("name", name).execute()
    if not community_result.data:
        raise HTTPException(status_code=404, detail="Community not found")
    
    community_id = community_result.data[0]["id"]
    
    query = supabase.table("posts").select("*, user:users(*)").eq("community_id", community_id)
    
    # Filter by time range if specified
    if time_range and time_range != "all":
        from datetime import datetime, timedelta
        now = datetime.utcnow()
        if time_range == "day":
            from_date = now - timedelta(days=1)
        elif time_range == "week":
            from_date = now - timedelta(weeks=1)
        elif time_range == "month":
            from_date = now - timedelta(days=30)
        elif time_range == "year":
            from_date = now - timedelta(days=365)
        else:
            from_date = now  # fallback
        
        query = query.gte("created_at", from_date.isoformat())
    
    # Apply search filter if provided
    if search:
        query = query.text_search("title,content", f"{search}", {"type": "websearch"})
    
    # Apply sorting
    if sort == "new":
        query = query.order("created_at", desc=True)
    elif sort == "top":
        query = query.order("upvotes", desc=True)
    elif sort == "controversial":
        # Controversial: posts with high upvote/downvote ratios
        query = query.order("created_at", desc=True)  # Simplified for now
    else:  # hot
        # Simple hot algorithm: (upvotes - downvotes) / age_in_hours
        query = query.order("created_at", desc=True)  # Simplified for now
    
    result = query.limit(limit).offset(offset).execute()
    
    return {"posts": result.data or [], "total": len(result.data or [])}

