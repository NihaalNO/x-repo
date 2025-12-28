from fastapi import APIRouter, Depends, HTTPException
from services.supabase_service import get_supabase
from middleware.auth import get_current_user_uid
from typing import Optional

router = APIRouter()

@router.get("/{username}")
async def get_user(username: str):
    """Get user profile by username"""
    supabase = get_supabase()
    
    result = supabase.table("users").select("*").eq("username", username).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return result.data[0]

@router.get("/{username}/projects")
async def get_user_projects(username: str, limit: int = 20, offset: int = 0):
    """Get user's projects"""
    supabase = get_supabase()
    
    # First get user
    user_result = supabase.table("users").select("id").eq("username", username).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Get projects
    result = supabase.table("projects").select("*, user:users(*)").eq("user_id", user_id).eq("visibility", "public").limit(limit).offset(offset).order("created_at", desc=True).execute()
    
    return {"projects": result.data or [], "total": len(result.data or [])}

@router.get("/{username}/posts")
async def get_user_posts(username: str, limit: int = 20, offset: int = 0):
    """Get user's posts"""
    supabase = get_supabase()
    
    # First get user
    user_result = supabase.table("users").select("id").eq("username", username).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Get posts
    result = supabase.table("posts").select("*, user:users(*), community:communities(*)").eq("user_id", user_id).limit(limit).offset(offset).order("created_at", desc=True).execute()
    
    return {"posts": result.data or [], "total": len(result.data or [])}


@router.get("/{username}/reputation")
async def get_user_reputation(username: str):
    """Calculate user's reputation based on posts and comments"""
    supabase = get_supabase()
    
    # First get user
    user_result = supabase.table("users").select("id").eq("username", username).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Calculate reputation from posts
    posts_result = supabase.table("posts").select("upvotes, downvotes").eq("user_id", user_id).execute()
    post_karma = 0
    if posts_result.data:
        for post in posts_result.data:
            post_karma += post["upvotes"] - post["downvotes"]
    
    # Calculate reputation from comments
    comments_result = supabase.table("comments").select("upvotes, downvotes").eq("user_id", user_id).execute()
    comment_karma = 0
    if comments_result.data:
        for comment in comments_result.data:
            comment_karma += comment["upvotes"] - comment["downvotes"]
    
    total_karma = post_karma + comment_karma
    
    return {
        "user_id": user_id,
        "username": username,
        "post_karma": post_karma,
        "comment_karma": comment_karma,
        "total_karma": total_karma
    }

