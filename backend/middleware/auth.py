from fastapi import HTTPException, Depends, Header
from firebase_admin import auth
import firebase_admin
from typing import Optional
import os
import json

# Initialize Firebase Admin
if not firebase_admin._apps:
    # Try to load from environment variable or file
    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
    if cred_path and os.path.exists(cred_path):
        cred = firebase_admin.credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        # Try to load from JSON string in environment
        cred_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
        if cred_json:
            cred_dict = json.loads(cred_json)
            cred = firebase_admin.credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
        else:
            # Default initialization (will use default credentials if available)
            firebase_admin.initialize_app()

async def verify_firebase_token(authorization: Optional[str] = Header(None)) -> str:
    """
    Verify Firebase JWT token and return user UID
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        # Extract token from "Bearer <token>"
        token = authorization.replace("Bearer ", "")
        decoded_token = auth.verify_id_token(token)
        return decoded_token['uid']
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication: {str(e)}")

# Dependency for protected routes
async def get_current_user_uid(uid: str = Depends(verify_firebase_token)) -> str:
    return uid

