from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from middleware.auth import get_current_user_uid
from services.supabase_service import get_supabase
from datetime import datetime
import uuid

router = APIRouter()

class NotificationCreate(BaseModel):
    recipient_id: str
    type: str  # 'mention', 'reply', 'reaction', 'comment_reply'
    title: str
    content: Optional[str] = None
    post_id: Optional[str] = None
    comment_id: Optional[str] = None
    actor_id: Optional[str] = None  # ID of user who triggered the notification

@router.get("")
async def get_user_notifications(
    uid: str = Depends(get_current_user_uid),
    limit: int = 50,
    offset: int = 0,
    unread_only: bool = False
):
    """Get user's notifications"""
    supabase = get_supabase()
    
    # Get user ID
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Build query
    query = supabase.table("notifications").select("*, actor:users(display_name, username, avatar_url)")
    query = query.eq("recipient_id", user_id)
    
    if unread_only:
        query = query.eq("is_read", False)
    
    query = query.order("created_at", desc=True)
    
    result = query.limit(limit).offset(offset).execute()
    
    return {
        "notifications": result.data or [],
        "total": len(result.data or [])
    }

@router.post("")
async def create_notification(notification: NotificationCreate):
    """Create a new notification (internal use)"""
    supabase = get_supabase()
    
    notification_data = {
        "id": str(uuid.uuid4()),
        "recipient_id": notification.recipient_id,
        "type": notification.type,
        "title": notification.title,
        "content": notification.content,
        "post_id": notification.post_id,
        "comment_id": notification.comment_id,
        "actor_id": notification.actor_id,
        "is_read": False,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    
    result = supabase.table("notifications").insert(notification_data).execute()
    
    return result.data[0] if result.data else None

@router.patch("/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: str,
    uid: str = Depends(get_current_user_uid)
):
    """Mark a notification as read"""
    supabase = get_supabase()
    
    # Get user ID
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Verify notification belongs to user
    notification_result = supabase.table("notifications").select("recipient_id").eq("id", notification_id).execute()
    if not notification_result.data:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if notification_result.data[0]["recipient_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update notification as read
    supabase.table("notifications").update({"is_read": True}).eq("id", notification_id).execute()
    
    return {"message": "Notification marked as read"}

@router.patch("/read-all")
async def mark_all_notifications_as_read(
    uid: str = Depends(get_current_user_uid)
):
    """Mark all user's notifications as read"""
    supabase = get_supabase()
    
    # Get user ID
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Update all notifications as read
    supabase.table("notifications").update({"is_read": True}).eq("recipient_id", user_id).execute()
    
    return {"message": "All notifications marked as read"}

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    uid: str = Depends(get_current_user_uid)
):
    """Delete a notification"""
    supabase = get_supabase()
    
    # Get user ID
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Verify notification belongs to user
    notification_result = supabase.table("notifications").select("recipient_id").eq("id", notification_id).execute()
    if not notification_result.data:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if notification_result.data[0]["recipient_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Delete notification
    supabase.table("notifications").delete().eq("id", notification_id).execute()
    
    return {"message": "Notification deleted"}