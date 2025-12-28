from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from middleware.auth import get_current_user_uid
from services.supabase_service import get_supabase
from datetime import datetime
import uuid

router = APIRouter()

class BookmarkCreate(BaseModel):
    post_id: str

@router.post("")
async def save_post(
    bookmark: BookmarkCreate,
    uid: str = Depends(get_current_user_uid)
):
    """Save/bookmark a post"""
    supabase = get_supabase()
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Check if post exists
    post_result = supabase.table("posts").select("id").eq("id", bookmark.post_id).execute()
    if not post_result.data:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if already bookmarked
    existing = supabase.table("bookmarks").select("*").eq("post_id", bookmark.post_id).eq("user_id", user_id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Post already bookmarked")
    
    # Create bookmark
    bookmark_data = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "post_id": bookmark.post_id,
        "created_at": datetime.utcnow().isoformat(),
    }
    
    result = supabase.table("bookmarks").insert(bookmark_data).execute()
    
    return {"message": "Post bookmarked successfully", "bookmark_id": result.data[0]["id"] if result.data else None}


@router.delete("/{post_id}")
async def remove_bookmark(
    post_id: str,
    uid: str = Depends(get_current_user_uid)
):
    """Remove a bookmark"""
    supabase = get_supabase()
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Delete bookmark
    supabase.table("bookmarks").delete().eq("post_id", post_id).eq("user_id", user_id).execute()
    
    return {"message": "Bookmark removed successfully"}


@router.get("/user")
async def get_user_bookmarks(
    uid: str = Depends(get_current_user_uid),
    limit: int = 20,
    offset: int = 0
):
    """Get user's saved/bookmarked posts"""
    supabase = get_supabase()
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Get bookmarked posts with details
    result = supabase.table("bookmarks").select("*, post:posts(*), user:users(*)").eq("user_id", user_id).limit(limit).offset(offset).order("created_at", desc=True).execute()
    
    return {"bookmarks": result.data or [], "total": len(result.data or [])}


@router.get("/check/{post_id}")
async def check_bookmark_status(
    post_id: str,
    uid: str = Depends(get_current_user_uid)
):
    """Check if a post is bookmarked by the user"""
    supabase = get_supabase()
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Check if bookmark exists
    existing = supabase.table("bookmarks").select("*").eq("post_id", post_id).eq("user_id", user_id).execute()
    
    return {"bookmarked": bool(existing.data)}