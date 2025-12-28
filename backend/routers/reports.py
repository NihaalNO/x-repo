from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from middleware.auth import get_current_user_uid
from services.supabase_service import get_supabase
from datetime import datetime
import uuid

router = APIRouter()

class ReportCreate(BaseModel):
    report_type: str  # post, comment, user
    item_id: str      # id of the post, comment, or user being reported
    reason: str       # reason for the report
    description: str = ""  # optional detailed description

@router.post("")
async def report_content(
    report: ReportCreate,
    uid: str = Depends(get_current_user_uid)
):
    """Report inappropriate content"""
    supabase = get_supabase()
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Validate report type and check if item exists
    if report.report_type == "post":
        item_result = supabase.table("posts").select("id").eq("id", report.item_id).execute()
    elif report.report_type == "comment":
        item_result = supabase.table("comments").select("id").eq("id", report.item_id).execute()
    elif report.report_type == "user":
        item_result = supabase.table("users").select("id").eq("id", report.item_id).execute()
    else:
        raise HTTPException(status_code=400, detail="Invalid report type. Must be 'post', 'comment', or 'user'")
    
    if not item_result.data:
        raise HTTPException(status_code=404, detail=f"{report.report_type.title()} not found")
    
    # Check if user has already reported this item
    existing = supabase.table("reports").select("*").eq("report_type", report.report_type).eq("item_id", report.item_id).eq("user_id", user_id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Content already reported by this user")
    
    # Create report
    report_data = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "report_type": report.report_type,
        "item_id": report.item_id,
        "reason": report.reason,
        "description": report.description,
        "status": "pending",  # pending, reviewed, resolved
        "created_at": datetime.utcnow().isoformat(),
    }
    
    result = supabase.table("reports").insert(report_data).execute()
    
    return {"message": "Report submitted successfully", "report_id": result.data[0]["id"] if result.data else None}


@router.get("/user")
async def get_user_reports(
    uid: str = Depends(get_current_user_uid),
    limit: int = 20,
    offset: int = 0
):
    """Get user's submitted reports"""
    supabase = get_supabase()
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    result = supabase.table("reports").select("*").eq("user_id", user_id).limit(limit).offset(offset).order("created_at", desc=True).execute()
    
    return {"reports": result.data or [], "total": len(result.data or [])}


@router.get("/moderation")
async def get_reports_for_moderation(
    uid: str = Depends(get_current_user_uid),
    status: str = "pending",
    limit: int = 20,
    offset: int = 0
):
    """Get reports for moderation (requires moderator privileges)"""
    supabase = get_supabase()
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # For now, just return reports (in a real app, you'd check if user is a moderator)
    result = supabase.table("reports").select("*, reporter:users(*)").eq("status", status).limit(limit).offset(offset).order("created_at", desc=True).execute()
    
    return {"reports": result.data or [], "total": len(result.data or [])}


@router.patch("/{report_id}/status")
async def update_report_status(
    report_id: str,
    status: str,  # reviewed, resolved
    uid: str = Depends(get_current_user_uid)
):
    """Update report status (moderation)"""
    supabase = get_supabase()
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Update report status
    result = supabase.table("reports").update({"status": status}).eq("id", report_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {"message": f"Report status updated to {status}"}