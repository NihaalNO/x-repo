from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from middleware.auth import get_current_user_uid
from services.supabase_service import get_supabase
from datetime import datetime

router = APIRouter()

class RegisterRequest(BaseModel):
    username: str
    display_name: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    firebase_uid: str
    email: str
    username: str
    display_name: Optional[str]
    bio: Optional[str]
    profile_picture_url: Optional[str]
    created_at: str

@router.post("/register")
async def register(
    request: RegisterRequest,
    uid: str = Depends(get_current_user_uid)
):
    """Create user profile in Supabase after Firebase authentication"""
    supabase = get_supabase()
    
    # Get Firebase user email
    from firebase_admin import auth as firebase_auth
    firebase_user = firebase_auth.get_user(uid)
    
    # Check if username already exists
    existing = supabase.table("users").select("id").eq("username", request.username).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user profile
    user_data = {
        "firebase_uid": uid,
        "email": firebase_user.email,
        "username": request.username,
        "display_name": request.display_name,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    
    result = supabase.table("users").insert(user_data).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create user profile")
    
    return {"message": "User profile created", "user": result.data[0]}

@router.get("/me")
async def get_current_user(uid: str = Depends(get_current_user_uid)):
    """Get current user profile"""
    supabase = get_supabase()
    
    result = supabase.table("users").select("*").eq("firebase_uid", uid).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    return result.data[0]

@router.post("/verify-token")
async def verify_token(uid: str = Depends(get_current_user_uid)):
    """Verify Firebase token (already verified in middleware)"""
    return {"valid": True, "uid": uid}

