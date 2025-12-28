from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from middleware.auth import get_current_user_uid
from services.supabase_service import get_supabase
from datetime import datetime
import uuid
import re

router = APIRouter()

class CommentCreate(BaseModel):
    post_id: str
    content: str
    parent_comment_id: Optional[str] = None

class CommentUpdate(BaseModel):
    content: str

@router.post("")
async def create_comment(
    comment: CommentCreate,
    uid: str = Depends(get_current_user_uid)
):
    """Create a comment"""
    supabase = get_supabase()
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    comment_data = {
        "id": str(uuid.uuid4()),
        "post_id": comment.post_id,
        "parent_comment_id": comment.parent_comment_id,
        "user_id": user_id,
        "content": comment.content,
        "upvotes": 0,
        "downvotes": 0,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    
    result = supabase.table("comments").insert(comment_data).execute()
    created_comment = result.data[0] if result.data else None
    
    # Increment comment count on post
    supabase.rpc("increment", {"table_name": "posts", "column_name": "comment_count", "id": comment.post_id}).execute()
    
    # Trigger notifications
    if created_comment:
        # Get the post to notify the post author
        post_result = supabase.table("posts").select("user_id, title").eq("id", comment.post_id).execute()
        if post_result.data:
            post_author_id = post_result.data[0]["user_id"]
            post_title = post_result.data[0]["title"]
            
            # Don't notify the post author if they're the one commenting
            if post_author_id != user_id:
                # Create notification for post author
                notification_data = {
                    "id": str(uuid.uuid4()),
                    "recipient_id": post_author_id,
                    "type": "comment",
                    "title": "New comment on your post",
                    "content": f"{user_result.data[0].get('display_name', 'A user')} commented on your post '{post_title}'",
                    "post_id": comment.post_id,
                    "comment_id": created_comment["id"],
                    "actor_id": user_id,
                    "is_read": False,
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat(),
                }
                supabase.table("notifications").insert(notification_data).execute()
        
        # If this is a reply to another comment, notify the parent comment author
        if comment.parent_comment_id:
            parent_comment_result = supabase.table("comments").select("user_id").eq("id", comment.parent_comment_id).execute()
            if parent_comment_result.data:
                parent_comment_author_id = parent_comment_result.data[0]["user_id"]
                
                # Don't notify if the same user is replying to their own comment
                if parent_comment_author_id != user_id:
                    # Create notification for parent comment author
                    notification_data = {
                        "id": str(uuid.uuid4()),
                        "recipient_id": parent_comment_author_id,
                        "type": "comment_reply",
                        "title": "New reply to your comment",
                        "content": f"{user_result.data[0].get('display_name', 'A user')} replied to your comment",
                        "post_id": comment.post_id,
                        "comment_id": created_comment["id"],
                        "actor_id": user_id,
                        "is_read": False,
                        "created_at": datetime.utcnow().isoformat(),
                        "updated_at": datetime.utcnow().isoformat(),
                    }
                    supabase.table("notifications").insert(notification_data).execute()
        
        # Check for mentions in the comment content
        # Find mentions like @username
        mentions = re.findall(r'@([a-zA-Z0-9_]+)', comment.content)
        if mentions:
            for username in mentions:
                # Find the user by username
                user_lookup = supabase.table("users").select("id").eq("username", username).execute()
                if user_lookup.data:
                    mentioned_user_id = user_lookup.data[0]["id"]
                    # Don't notify if the same user is mentioning themselves
                    if mentioned_user_id != user_id:
                        # Create notification for mentioned user
                        notification_data = {
                            "id": str(uuid.uuid4()),
                            "recipient_id": mentioned_user_id,
                            "type": "mention",
                            "title": "You were mentioned in a comment",
                            "content": f"{user_result.data[0].get('display_name', 'A user')} mentioned you in a comment on post '{post_title if 'post_title' in locals() else 'a post'}'",
                            "post_id": comment.post_id,
                            "comment_id": created_comment["id"],
                            "actor_id": user_id,
                            "is_read": False,
                            "created_at": datetime.utcnow().isoformat(),
                            "updated_at": datetime.utcnow().isoformat(),
                        }
                        supabase.table("notifications").insert(notification_data).execute()
    
    return created_comment

@router.patch("/{comment_id}")
async def update_comment(
    comment_id: str,
    comment: CommentUpdate,
    uid: str = Depends(get_current_user_uid)
):
    """Update comment"""
    supabase = get_supabase()
    
    # Verify ownership
    comment_result = supabase.table("comments").select("user_id").eq("id", comment_id).execute()
    if not comment_result.data:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data or comment_result.data[0]["user_id"] != user_result.data[0]["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = supabase.table("comments").update({
        "content": comment.content,
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", comment_id).execute()
    
    return result.data[0] if result.data else None

@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: str,
    uid: str = Depends(get_current_user_uid)
):
    """Delete comment"""
    supabase = get_supabase()
    
    # Verify ownership
    comment_result = supabase.table("comments").select("user_id, post_id").eq("id", comment_id).execute()
    if not comment_result.data:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data or comment_result.data[0]["user_id"] != user_result.data[0]["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    post_id = comment_result.data[0]["post_id"]
    
    supabase.table("comments").delete().eq("id", comment_id).execute()
    
    # Decrement comment count on post
    supabase.rpc("decrement", {"table_name": "posts", "column_name": "comment_count", "id": post_id}).execute()
    
    return {"message": "Comment deleted"}

@router.post("/{comment_id}/vote")
async def vote_comment(
    comment_id: str,
    vote_type: str,
    uid: str = Depends(get_current_user_uid)
):
    """Vote on a comment"""
    supabase = get_supabase()
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Get the comment to find the author
    comment_result = supabase.table("comments").select("user_id").eq("id", comment_id).execute()
    if not comment_result.data:
        raise HTTPException(status_code=404, detail="Comment not found")
    comment_author_id = comment_result.data[0]["user_id"]
    
    # Check existing vote
    existing = supabase.table("votes").select("*").eq("votable_type", "comment").eq("votable_id", comment_id).eq("user_id", user_id).execute()
    
    if existing.data:
        existing_vote = existing.data[0]
        if existing_vote["vote_type"] == vote_type:
            # Remove vote
            supabase.table("votes").delete().eq("id", existing_vote["id"]).execute()
            if vote_type == "upvote":
                supabase.rpc("decrement", {"table_name": "comments", "column_name": "upvotes", "id": comment_id}).execute()
                # Update author's reputation (decrement for removing upvote)
                # We could implement reputation update here if needed
            else:
                supabase.rpc("decrement", {"table_name": "comments", "column_name": "downvotes", "id": comment_id}).execute()
                # Update author's reputation (increment for removing downvote)
                # We could implement reputation update here if needed
            return {"voted": False, "vote_type": None}
        else:
            # Change vote
            supabase.table("votes").update({"vote_type": vote_type}).eq("id", existing_vote["id"]).execute()
            if vote_type == "upvote":
                supabase.rpc("increment", {"table_name": "comments", "column_name": "upvotes", "id": comment_id}).execute()
                supabase.rpc("decrement", {"table_name": "comments", "column_name": "downvotes", "id": comment_id}).execute()
            else:
                supabase.rpc("increment", {"table_name": "comments", "column_name": "downvotes", "id": comment_id}).execute()
                supabase.rpc("decrement", {"table_name": "comments", "column_name": "upvotes", "id": comment_id}).execute()
            return {"voted": True, "vote_type": vote_type}
    else:
        # New vote
        supabase.table("votes").insert({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "votable_type": "comment",
            "votable_id": comment_id,
            "vote_type": vote_type,
            "created_at": datetime.utcnow().isoformat(),
        }).execute()
        
        if vote_type == "upvote":
            supabase.rpc("increment", {"table_name": "comments", "column_name": "upvotes", "id": comment_id}).execute()
        else:
            supabase.rpc("increment", {"table_name": "comments", "column_name": "downvotes", "id": comment_id}).execute()
        
        return {"voted": True, "vote_type": vote_type}

