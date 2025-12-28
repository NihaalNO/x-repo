from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime
import os

router = APIRouter()

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

@router.post("/contact")
async def send_contact(request: ContactRequest):
    """Send contact form message"""
    # TODO: Implement email sending via service (Resend, SendGrid, etc.)
    # For now, just log it
    
    print(f"Contact form submission:")
    print(f"Name: {request.name}")
    print(f"Email: {request.email}")
    print(f"Subject: {request.subject}")
    print(f"Message: {request.message}")
    
    # In production, you would:
    # 1. Send email via email service
    # 2. Store in database for record keeping
    # 3. Implement rate limiting
    
    return {"message": "Contact form submitted successfully", "received_at": datetime.utcnow().isoformat()}

