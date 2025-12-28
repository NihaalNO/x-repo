from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from middleware.auth import get_current_user_uid
from services.supabase_service import get_supabase
from datetime import datetime, timedelta
import uuid

router = APIRouter()

class PostCreate(BaseModel):
    community_id: str
    title: str
    content: str
    post_type: str = "text"
    tags: Optional[list] = []

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[list] = None

@router.get("")
async def list_posts(
    limit: int = 25,
    offset: int = 0,
    community_id: Optional[str] = None,
    sort: str = "hot",
    time_range: Optional[str] = None  # day, week, month, year, all
):
    """List posts with various sorting options"""
    supabase = get_supabase()
    
    query = supabase.table("posts").select("*, user:users(*), community:communities(*)")
    
    # Filter by community if provided
    if community_id:
        query = query.eq("community_id", community_id)
    
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
    
    # Apply sorting
    if sort == "new":
        query = query.order("created_at", desc=True)
    elif sort == "top":
        # For top posts, we may want to filter by time_range as well
        query = query.order("upvotes", desc=True)
    elif sort == "controversial":
        # Controversial: posts with high upvote/downvote ratios
        # For now, we'll order by the absolute difference between upvotes and downvotes
        query = query.order("created_at", desc=True)  # Supabase doesn't support complex expressions in order, so we'll handle this in code
    else:  # hot
        # Simple hot algorithm: (upvotes - downvotes) / age_in_hours
        query = query.order("created_at", desc=True)  # Supabase doesn't support complex expressions in order, so we'll handle this in code
    
    result = query.limit(limit).offset(offset).execute()
    posts = result.data or []
    
    # Apply complex sorting algorithms after fetching from database
    if sort == "hot":
        import math
        from datetime import datetime
        
        def calculate_hot_score(post):
            upvotes = post.get('upvotes', 0) or 0
            downvotes = post.get('downvotes', 0) or 0
            created_at = datetime.fromisoformat(post['created_at'].replace('Z', '+00:00'))
            
            # Reddit-style hot algorithm
            score = upvotes - downvotes
            order = math.log10(max(abs(score), 1))
            sign = 1 if score > 0 else -1 if score < 0 else 0
            
            # Time in hours since post
            hours = (datetime.utcnow() - created_at.replace(tzinfo=None)).total_seconds() / 3600
            
            return round(order + sign * hours, 7)
        
        posts.sort(key=calculate_hot_score, reverse=True)
    elif sort == "controversial":
        def calculate_controversy(post):
            upvotes = post.get('upvotes', 0) or 0
            downvotes = post.get('downvotes', 0) or 0
            
            # Controversy score based on balance of upvotes and downvotes
            total_votes = upvotes + downvotes
            if total_votes == 0:
                return 0
            
            # Ratio closer to 0.5 is more controversial
            upvote_ratio = upvotes / total_votes
            balance = 1 - abs(0.5 - upvote_ratio) * 2  # This will be 1 when ratio is 0.5, 0 when ratio is 0 or 1
            return balance * total_votes
        
        posts.sort(key=calculate_controversy, reverse=True)
    
    # Get the total count for pagination (without the limit/offset)
    count_query = supabase.table("posts").select("count", count="exact")
    if community_id:
        count_query = count_query.eq("community_id", community_id)
    if time_range and time_range != "all":
        count_query = count_query.gte("created_at", from_date.isoformat())
    
    count_result = count_query.execute()
    total_count = count_result.data[0]['count'] if count_result.data else 0
    
    # Return the sorted posts and total count
    return {"posts": posts, "total": total_count}


@router.get("/feed/home")
async def get_home_feed(
    uid: str = Depends(get_current_user_uid),
    limit: int = 25,
    offset: int = 0,
    sort: str = "hot",
    time_range: Optional[str] = None  # day, week, month, year, all
):
    """Get posts from communities the user is following"""
    supabase = get_supabase()
    
    # Get user's joined communities
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Get communities the user is following
    membership_result = supabase.table("community_memberships").select("community_id").eq("user_id", user_id).execute()
    community_ids = [m["community_id"] for m in membership_result.data] if membership_result.data else []
    
    # If user is not in any communities, return empty result
    if not community_ids:
        return {"posts": [], "total": 0}
    
    # Build query for posts in user's communities
    query = supabase.table("posts").select("*, user:users(*), community:communities(*)")
    query = query.in_("community_id", community_ids)
    
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
    
    result = query.execute()
    all_posts = result.data or []
    
    # Apply complex sorting algorithms after fetching from database
    if sort == "hot":
        import math
        from datetime import datetime
        
        def calculate_hot_score(post):
            upvotes = post.get('upvotes', 0) or 0
            downvotes = post.get('downvotes', 0) or 0
            created_at = datetime.fromisoformat(post['created_at'].replace('Z', '+00:00'))
            
            # Reddit-style hot algorithm
            score = upvotes - downvotes
            order = math.log10(max(abs(score), 1))
            sign = 1 if score > 0 else -1 if score < 0 else 0
            
            # Time in hours since post
            hours = (datetime.utcnow() - created_at.replace(tzinfo=None)).total_seconds() / 3600
            
            return round(order + sign * hours, 7)
        
        all_posts.sort(key=calculate_hot_score, reverse=True)
    elif sort == "controversial":
        def calculate_controversy(post):
            upvotes = post.get('upvotes', 0) or 0
            downvotes = post.get('downvotes', 0) or 0
            
            # Controversy score based on balance of upvotes and downvotes
            total_votes = upvotes + downvotes
            if total_votes == 0:
                return 0
            
            # Ratio closer to 0.5 is more controversial
            upvote_ratio = upvotes / total_votes
            balance = 1 - abs(0.5 - upvote_ratio) * 2  # This will be 1 when ratio is 0.5, 0 when ratio is 0 or 1
            return balance * total_votes
        
        all_posts.sort(key=calculate_controversy, reverse=True)
    elif sort == "new":
        all_posts.sort(key=lambda x: x['created_at'], reverse=True)
    elif sort == "top":
        all_posts.sort(key=lambda x: x['upvotes'], reverse=True)
    
    # Apply pagination
    paginated_posts = all_posts[offset:offset+limit]
    
    return {"posts": paginated_posts, "total": len(all_posts)}


@router.get("/feed/explore")
async def get_explore_feed(
    limit: int = 25,
    offset: int = 0,
    sort: str = "hot",
    time_range: Optional[str] = None  # day, week, month, year, all
):
    """Get trending posts across all communities"""
    supabase = get_supabase()
    
    query = supabase.table("posts").select("*, user:users(*), community:communities(*)")
    
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
    
    result = query.execute()
    all_posts = result.data or []
    
    # Apply complex sorting algorithms after fetching from database
    if sort == "hot":
        import math
        from datetime import datetime
        
        def calculate_hot_score(post):
            upvotes = post.get('upvotes', 0) or 0
            downvotes = post.get('downvotes', 0) or 0
            created_at = datetime.fromisoformat(post['created_at'].replace('Z', '+00:00'))
            
            # Reddit-style hot algorithm
            score = upvotes - downvotes
            order = math.log10(max(abs(score), 1))
            sign = 1 if score > 0 else -1 if score < 0 else 0
            
            # Time in hours since post
            hours = (datetime.utcnow() - created_at.replace(tzinfo=None)).total_seconds() / 3600
            
            return round(order + sign * hours, 7)
        
        all_posts.sort(key=calculate_hot_score, reverse=True)
    elif sort == "controversial":
        def calculate_controversy(post):
            upvotes = post.get('upvotes', 0) or 0
            downvotes = post.get('downvotes', 0) or 0
            
            # Controversy score based on balance of upvotes and downvotes
            total_votes = upvotes + downvotes
            if total_votes == 0:
                return 0
            
            # Ratio closer to 0.5 is more controversial
            upvote_ratio = upvotes / total_votes
            balance = 1 - abs(0.5 - upvote_ratio) * 2  # This will be 1 when ratio is 0.5, 0 when ratio is 0 or 1
            return balance * total_votes
        
        all_posts.sort(key=calculate_controversy, reverse=True)
    elif sort == "new":
        all_posts.sort(key=lambda x: x['created_at'], reverse=True)
    elif sort == "top":
        all_posts.sort(key=lambda x: x['upvotes'], reverse=True)
    
    # Apply pagination
    paginated_posts = all_posts[offset:offset+limit]
    
    return {"posts": paginated_posts, "total": len(all_posts)}


@router.post("")
async def create_post(
    post: PostCreate,
    uid: str = Depends(get_current_user_uid)
):
    """Create a new post"""
    supabase = get_supabase()
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    post_data = {
        "id": str(uuid.uuid4()),
        "community_id": post.community_id,
        "user_id": user_id,
        "title": post.title,
        "content": post.content,
        "post_type": post.post_type,
        "tags": post.tags,
        "upvotes": 0,
        "downvotes": 0,
        "comment_count": 0,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    
    result = supabase.table("posts").insert(post_data).execute()
    
    return result.data[0] if result.data else None

@router.get("/{post_id}")
async def get_post(post_id: str):
    """Get post details"""
    supabase = get_supabase()
    
    result = supabase.table("posts").select("*, user:users(*), community:communities(*)").eq("id", post_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return result.data[0]

@router.patch("/{post_id}")
async def update_post(
    post_id: str,
    post: PostUpdate,
    uid: str = Depends(get_current_user_uid)
):
    """Update post"""
    supabase = get_supabase()
    
    # Verify ownership
    post_result = supabase.table("posts").select("user_id").eq("id", post_id).execute()
    if not post_result.data:
        raise HTTPException(status_code=404, detail="Post not found")
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data or post_result.data[0]["user_id"] != user_result.data[0]["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = post.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    # Ensure tags are properly handled
    if hasattr(post, 'tags') and post.tags is not None:
        update_data['tags'] = post.tags
    
    result = supabase.table("posts").update(update_data).eq("id", post_id).execute()
    
    return result.data[0] if result.data else None

@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    uid: str = Depends(get_current_user_uid)
):
    """Delete post"""
    supabase = get_supabase()
    
    # Verify ownership
    post_result = supabase.table("posts").select("user_id").eq("id", post_id).execute()
    if not post_result.data:
        raise HTTPException(status_code=404, detail="Post not found")
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data or post_result.data[0]["user_id"] != user_result.data[0]["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    supabase.table("posts").delete().eq("id", post_id).execute()
    
    return {"message": "Post deleted"}

@router.post("/{post_id}/vote")
async def vote_post(
    post_id: str,
    vote_type: str,  # "upvote" or "downvote"
    uid: str = Depends(get_current_user_uid)
):
    """Vote on a post"""
    supabase = get_supabase()
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Get the post to find the author
    post_result = supabase.table("posts").select("user_id").eq("id", post_id).execute()
    if not post_result.data:
        raise HTTPException(status_code=404, detail="Post not found")
    post_author_id = post_result.data[0]["user_id"]
    
    # Check existing vote
    existing = supabase.table("votes").select("*").eq("votable_type", "post").eq("votable_id", post_id).eq("user_id", user_id).execute()
    
    if existing.data:
        existing_vote = existing.data[0]
        if existing_vote["vote_type"] == vote_type:
            # Remove vote
            supabase.table("votes").delete().eq("id", existing_vote["id"]).execute()
            if vote_type == "upvote":
                supabase.rpc("decrement", {"table_name": "posts", "column_name": "upvotes", "id": post_id}).execute()
                # Update author's reputation (decrement for removing upvote)
                # We could implement reputation update here if needed
            else:
                supabase.rpc("decrement", {"table_name": "posts", "column_name": "downvotes", "id": post_id}).execute()
                # Update author's reputation (increment for removing downvote)
                # We could implement reputation update here if needed
            return {"voted": False, "vote_type": None}
        else:
            # Change vote
            supabase.table("votes").update({"vote_type": vote_type}).eq("id", existing_vote["id"]).execute()
            if vote_type == "upvote":
                supabase.rpc("increment", {"table_name": "posts", "column_name": "upvotes", "id": post_id}).execute()
                supabase.rpc("decrement", {"table_name": "posts", "column_name": "downvotes", "id": post_id}).execute()
            else:
                supabase.rpc("increment", {"table_name": "posts", "column_name": "downvotes", "id": post_id}).execute()
                supabase.rpc("decrement", {"table_name": "posts", "column_name": "upvotes", "id": post_id}).execute()
            return {"voted": True, "vote_type": vote_type}
    else:
        # New vote
        supabase.table("votes").insert({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "votable_type": "post",
            "votable_id": post_id,
            "vote_type": vote_type,
            "created_at": datetime.utcnow().isoformat(),
        }).execute()
        
        if vote_type == "upvote":
            supabase.rpc("increment", {"table_name": "posts", "column_name": "upvotes", "id": post_id}).execute()
        else:
            supabase.rpc("increment", {"table_name": "posts", "column_name": "downvotes", "id": post_id}).execute()
        
        return {"voted": True, "vote_type": vote_type}

@router.get("/{post_id}/comments")
async def get_post_comments(post_id: str):
    """Get comments for a post"""
    supabase = get_supabase()
    
    result = supabase.table("comments").select("*, user:users(*)").eq("post_id", post_id).is_("parent_comment_id", "null").order("created_at", desc=False).execute()
    
    # TODO: Build nested comment structure
    return {"comments": result.data or []}

