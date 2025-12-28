from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from middleware.auth import get_current_user_uid
from services.supabase_service import get_supabase
from datetime import datetime
import uuid
import io
import zipfile

router = APIRouter()

class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    readme_content: Optional[str] = None
    visibility: str = "public"
    tags: List[str] = []

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    readme_content: Optional[str] = None
    visibility: Optional[str] = None
    tags: Optional[List[str]] = None

@router.get("")
async def list_projects(
    limit: int = 20,
    offset: int = 0,
    search: Optional[str] = None,
    tags: Optional[str] = None,
    visibility: str = "public"
):
    """List projects with filters"""
    supabase = get_supabase()
    
    query = supabase.table("projects").select("*, user:users(*)").eq("visibility", visibility)
    
    if search:
        query = query.ilike("title", f"%{search}%")
    
    if tags:
        tag_list = tags.split(",")
        query = query.contains("tags", tag_list)
    
    result = query.limit(limit).offset(offset).order("created_at", desc=True).execute()
    
    return {"projects": result.data or [], "total": len(result.data or [])}

@router.post("")
async def create_project(
    project: ProjectCreate,
    uid: str = Depends(get_current_user_uid)
):
    """Create a new project"""
    supabase = get_supabase()
    
    # Get user ID
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    user_id = user_result.data[0]["id"]
    
    project_data = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "title": project.title,
        "description": project.description,
        "readme_content": project.readme_content,
        "visibility": project.visibility,
        "tags": project.tags,
        "star_count": 0,
        "fork_count": 0,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    
    result = supabase.table("projects").insert(project_data).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create project")
    
    return result.data[0]

@router.get("/{project_id}")
async def get_project(project_id: str):
    """Get project details"""
    supabase = get_supabase()
    
    result = supabase.table("projects").select("*, user:users(*)").eq("id", project_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get files
    files_result = supabase.table("project_files").select("*").eq("project_id", project_id).execute()
    
    project = result.data[0]
    project["files"] = files_result.data or []
    
    return project

@router.patch("/{project_id}")
async def update_project(
    project_id: str,
    project: ProjectUpdate,
    uid: str = Depends(get_current_user_uid)
):
    """Update project"""
    supabase = get_supabase()
    
    # Verify ownership
    project_result = supabase.table("projects").select("user_id").eq("id", project_id).execute()
    if not project_result.data:
        raise HTTPException(status_code=404, detail="Project not found")
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data or project_result.data[0]["user_id"] != user_result.data[0]["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = project.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    result = supabase.table("projects").update(update_data).eq("id", project_id).execute()
    
    return result.data[0] if result.data else None

@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    uid: str = Depends(get_current_user_uid)
):
    """Delete project"""
    supabase = get_supabase()
    
    # Verify ownership
    project_result = supabase.table("projects").select("user_id").eq("id", project_id).execute()
    if not project_result.data:
        raise HTTPException(status_code=404, detail="Project not found")
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data or project_result.data[0]["user_id"] != user_result.data[0]["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    supabase.table("projects").delete().eq("id", project_id).execute()
    
    return {"message": "Project deleted"}

@router.post("/{project_id}/star")
async def star_project(
    project_id: str,
    uid: str = Depends(get_current_user_uid)
):
    """Star/unstar a project"""
    supabase = get_supabase()
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Check if already starred
    existing = supabase.table("project_stars").select("*").eq("project_id", project_id).eq("user_id", user_id).execute()
    
    if existing.data:
        # Unstar
        supabase.table("project_stars").delete().eq("project_id", project_id).eq("user_id", user_id).execute()
        # Decrement star count
        supabase.rpc("decrement", {"table_name": "projects", "column_name": "star_count", "id": project_id}).execute()
        return {"starred": False}
    else:
        # Star
        supabase.table("project_stars").insert({"project_id": project_id, "user_id": user_id}).execute()
        # Increment star count
        supabase.rpc("increment", {"table_name": "projects", "column_name": "star_count", "id": project_id}).execute()
        return {"starred": True}

@router.post("/{project_id}/fork")
async def fork_project(
    project_id: str,
    uid: str = Depends(get_current_user_uid)
):
    """Fork a project (create a copy)"""
    supabase = get_supabase()
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Get original project
    original_result = supabase.table("projects").select("*").eq("id", project_id).execute()
    if not original_result.data:
        raise HTTPException(status_code=404, detail="Project not found")
    
    original_project = original_result.data[0]
    
    # Check if project is public or user owns it
    if original_project["visibility"] == "private" and original_project["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Cannot fork private project")
    
    # Create forked project
    forked_project_data = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "title": f"{original_project['title']} (forked)",
        "description": original_project.get("description"),
        "readme_content": original_project.get("readme_content"),
        "visibility": "public",  # Forked projects are public by default
        "tags": original_project.get("tags", []),
        "star_count": 0,
        "fork_count": 0,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    
    result = supabase.table("projects").insert(forked_project_data).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to fork project")
    
    forked_project_id = result.data[0]["id"]
    
    # Copy files (create references to original files)
    files_result = supabase.table("project_files").select("*").eq("project_id", project_id).execute()
    if files_result.data:
        for file in files_result.data:
            supabase.table("project_files").insert({
                "id": str(uuid.uuid4()),
                "project_id": forked_project_id,
                "file_name": file["file_name"],
                "file_path": file["file_path"],  # Reference to same file
                "file_type": file.get("file_type"),
                "file_size": file.get("file_size", 0),
                "created_at": datetime.utcnow().isoformat(),
            }).execute()
    
    # Increment fork count on original project
    supabase.rpc("increment", {"table_name": "projects", "column_name": "fork_count", "id": project_id}).execute()
    
    return {"message": "Project forked successfully", "forked_project_id": forked_project_id}

@router.get("/{project_id}/download")
async def download_project(project_id: str):
    """Download project as ZIP file"""
    supabase = get_supabase()
    
    # Get project and files
    project_result = supabase.table("projects").select("*").eq("id", project_id).execute()
    if not project_result.data:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = project_result.data[0]
    
    # Check visibility
    if project["visibility"] == "private":
        raise HTTPException(status_code=403, detail="Cannot download private project")
    
    files_result = supabase.table("project_files").select("*").eq("project_id", project_id).execute()
    files = files_result.data or []
    
    # Create ZIP file in memory
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Add README if exists
        if project.get("readme_content"):
            zip_file.writestr("README.md", project["readme_content"])
        
        # Add files (would need to fetch file content from storage)
        # For now, create placeholder files
        for file in files:
            zip_file.writestr(file["file_name"], f"[File content from: {file['file_path']}]")
    
    zip_buffer.seek(0)
    
    return StreamingResponse(
        io.BytesIO(zip_buffer.read()),
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="{project["title"]}.zip"'
        }
    )

@router.post("/{project_id}/files")
async def upload_file(
    project_id: str,
    file: UploadFile = File(...),
    uid: str = Depends(get_current_user_uid)
):
    """Upload file to project"""
    # Validate file extension
    valid_extensions = {'.qasm', '.ipynb', '.py'}
    file_extension = '.' + file.filename.split('.')[-1].lower() if '.' in file.filename else ''
    
    if file_extension not in valid_extensions:
        raise HTTPException(status_code=400, detail=f"File type not supported. Valid types: {', '.join(valid_extensions)}")
    
    supabase = get_supabase()
    
    # Verify ownership
    project_result = supabase.table("projects").select("user_id").eq("id", project_id).execute()
    if not project_result.data:
        raise HTTPException(status_code=404, detail="Project not found")
    
    user_result = supabase.table("users").select("id").eq("firebase_uid", uid).execute()
    if not user_result.data or project_result.data[0]["user_id"] != user_result.data[0]["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Upload to Supabase Storage
    file_content = await file.read()
    file_path = f"projects/{project_id}/{file.filename}"
    
    storage_result = supabase.storage.from_("project-files").upload(file_path, file_content)
    
    if not storage_result:
        raise HTTPException(status_code=500, detail="Failed to upload file")
    
    # Get public URL
    url_result = supabase.storage.from_("project-files").get_public_url(file_path)
    
    # Save file metadata
    file_data = {
        "id": str(uuid.uuid4()),
        "project_id": project_id,
        "file_name": file.filename,
        "file_path": url_result,
        "file_type": file.content_type or "application/octet-stream",
        "file_size": len(file_content),
        "created_at": datetime.utcnow().isoformat(),
    }
    
    result = supabase.table("project_files").insert(file_data).execute()
    
    return result.data[0] if result.data else None
