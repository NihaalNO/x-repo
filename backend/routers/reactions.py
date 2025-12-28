from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from middleware.auth import get_current_user_uid
from services.supabase_service import get_supabase
from services.websocket_service import manager
from datetime import datetime
import uuid
import json

router = APIRouter()

class ReactionCreate(BaseModel):
    post_id: str
    reaction_type: str  # 👍, ❤️, 🚀, 💡, 🤔

@router.post("")
async def add_reaction(
    reaction: ReactionCreate,
    uid: str = Depends(get_current_user_uid)
):
    """Add reaction to a post"""
    supabase = get_supabase()
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Check if reaction already exists
    existing = supabase.table("reactions").select("*").eq("post_id", reaction.post_id).eq("user_id", user_id).eq("reaction_type", reaction.reaction_type).execute()
    
    if existing.data:
        # Remove reaction
        supabase.table("reactions").delete().eq("id", existing.data[0]["id"]).execute()
        
        # Broadcast to all connected clients watching this post
        await manager.broadcast_to_post(reaction.post_id, json.dumps({
            "type": "reaction_removed",
            "post_id": reaction.post_id,
            "reaction_type": reaction.reaction_type,
            "user_id": user_id
        }))
        
        return {"added": False}
    else:
        # Remove any existing reaction from this user on this post
        supabase.table("reactions").delete().eq("post_id", reaction.post_id).eq("user_id", user_id).execute()
        
        # Add new reaction
        reaction_data = {
            "id": str(uuid.uuid4()),
            "post_id": reaction.post_id,
            "user_id": user_id,
            "reaction_type": reaction.reaction_type,
            "created_at": datetime.utcnow().isoformat(),
        }
        result = supabase.table("reactions").insert(reaction_data).execute()
        reaction_id = result.data[0]["id"] if result.data else None
        
        # Get updated reactions for the post
        reactions_result = supabase.table("reactions").select("*, user:users(*)").eq("post_id", reaction.post_id).execute()
        
        # Create notification for post author
        post_result = supabase.table("posts").select("user_id, title").eq("id", reaction.post_id).execute()
        if post_result.data:
            post_author_id = post_result.data[0]["user_id"]
            post_title = post_result.data[0]["title"]
            
            # Don't notify if the same user is reacting to their own post
            if post_author_id != user_id:
                notification_data = {
                    "id": str(uuid.uuid4()),
                    "recipient_id": post_author_id,
                    "type": "reaction",
                    "title": f"New {reaction.reaction_type} reaction to your post",
                    "content": f"{user_result.data[0].get('display_name', 'A user')} reacted to your post '{post_title}' with {reaction.reaction_type}",
                    "post_id": reaction.post_id,
                    "actor_id": user_id,
                    "is_read": False,
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat(),
                }
                supabase.table("notifications").insert(notification_data).execute()
        
        # Broadcast to all connected clients watching this post
        await manager.broadcast_to_post(reaction.post_id, json.dumps({
            "type": "reaction_update",
            "post_id": reaction.post_id,
            "reactions": reactions_result.data or [],
            "action": "added",
            "reaction_type": reaction.reaction_type,
            "reaction_id": reaction_id
        }))
        
        return {"added": True, "reaction_type": reaction.reaction_type}

@router.get("/posts/{post_id}")
async def get_post_reactions(post_id: str):
    """Get all reactions for a post"""
    supabase = get_supabase()
    
    result = supabase.table("reactions").select("*, user:users(*)").eq("post_id", post_id).execute()
    
    return {"reactions": result.data or []}

@router.delete("/{reaction_id}")
async def remove_reaction(
    reaction_id: str,
    uid: str = Depends(get_current_user_uid)
):
    """Remove a reaction"""
    supabase = get_supabase()
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Get reaction before deleting to get post_id
    reaction_result = supabase.table("reactions").select("user_id, post_id").eq("id", reaction_id).execute()
    if not reaction_result.data:
        raise HTTPException(status_code=404, detail="Reaction not found")
    
    if reaction_result.data[0]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    post_id = reaction_result.data[0]["post_id"]
    
    supabase.table("reactions").delete().eq("id", reaction_id).execute()
    
    # Broadcast to all connected clients watching this post
    await manager.broadcast_to_post(post_id, json.dumps({
        "type": "reaction_removed",
        "post_id": post_id,
        "reaction_id": reaction_id
    }))
    
    return {"message": "Reaction removed"}


@router.websocket("/ws/{post_id}")
async def websocket_reactions(websocket: WebSocket, post_id: str, uid: str = Depends(get_current_user_uid)):
    """WebSocket endpoint for real-time reactions"""
    supabase = get_supabase()
    
    # Verify user exists
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        await websocket.close(code=1008, reason="User not found")
        return
    
    user_id = user_result.data[0]["id"]
    
    await manager.connect(websocket, connection_type="reactions", post_id=post_id, user_id=user_id)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                action = message.get("action")
                
                if action == "add_reaction":
                    reaction_type = message.get("reaction_type")
                    if reaction_type:
                        # Check if reaction already exists
                        existing = supabase.table("reactions").select("*").eq("post_id", post_id).eq("user_id", user_id).eq("reaction_type", reaction_type).execute()
                        
                        if existing.data:
                            # Remove reaction
                            supabase.table("reactions").delete().eq("id", existing.data[0]["id"]).execute()
                            reaction_id = existing.data[0]["id"]
                            action_type = "removed"
                        else:
                            # Remove any existing reaction from this user on this post
                            supabase.table("reactions").delete().eq("post_id", post_id).eq("user_id", user_id).execute()
                            
                            # Add new reaction
                            reaction_data = {
                                "id": str(uuid.uuid4()),
                                "post_id": post_id,
                                "user_id": user_id,
                                "reaction_type": reaction_type,
                                "created_at": datetime.utcnow().isoformat(),
                            }
                            result = supabase.table("reactions").insert(reaction_data).execute()
                            reaction_id = result.data[0]["id"] if result.data else None
                            action_type = "added"
                        
                        # Get updated reactions for the post
                        reactions_result = supabase.table("reactions").select("*, user:users(*)").eq("post_id", post_id).execute()
                        
                        # Broadcast to all connected clients watching this post
                        await manager.broadcast_to_post(post_id, json.dumps({
                            "type": "reaction_update",
                            "post_id": post_id,
                            "reactions": reactions_result.data or [],
                            "action": action_type,
                            "reaction_type": reaction_type,
                            "reaction_id": reaction_id
                        }))
                
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"error": "Invalid JSON"}))
            except Exception as e:
                await websocket.send_text(json.dumps({"error": str(e)}))
    except WebSocketDisconnect:
        manager.disconnect(websocket, post_id=post_id, user_id=user_id)

