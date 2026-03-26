from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.crud import client as client_crud
from app.crud import project as project_crud
from app.schemas.client import ClientPortalLogin, ClientResponse
from app.schemas.project import ProjectResponse, BugResponse, BugCreate
from app.core.security import create_access_token, get_current_client
from app.models.models import Client

router = APIRouter(prefix="/portal", tags=["Client Portal"])

@router.get("/check-token/{token}")
def check_token(token: str, db: Session = Depends(get_db)):
    """Check if a magic link token is valid and not expired"""
    client = client_crud.get_client_by_token(db, token)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or expired magic link"
        )
    return {"status": "valid", "client_name": client.name}

@router.post("/login")
def portal_login(login_data: ClientPortalLogin, db: Session = Depends(get_db)):
    """Authenticate a client via magic link token, phone, and password"""
    client = client_crud.get_client_by_token(db, login_data.token)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired magic link"
        )
    
    # Verify phone and password
    if client.phone != login_data.phone or client.magic_link_password != login_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create client-specific token
    access_token = create_access_token(data={"client_id": client.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "client_name": client.name
    }

@router.get("/projects", response_model=List[ProjectResponse])
def get_client_projects(
    db: Session = Depends(get_db),
    current_client: Client = Depends(get_current_client)
):
    """Get all projects belonging to the authenticated client"""
    return client_crud.get_client_detail(db, current_client.id).projects

@router.get("/projects/{project_id}/bugs", response_model=List[BugResponse])
def get_project_bugs(
    project_id: int,
    db: Session = Depends(get_db),
    current_client: Client = Depends(get_current_client)
):
    """Get bugs for a specific project, ensuring it belongs to the client"""
    # Verify project ownership
    project = project_crud.get_project(db, project_id)
    if not project or project.client_id != current_client.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this project"
        )
    
    return project_crud.get_bugs(db, project_id=project_id)

@router.post("/projects/{project_id}/bugs", response_model=BugResponse)
def report_bug(
    project_id: int,
    bug: BugCreate,
    db: Session = Depends(get_db),
    current_client: Client = Depends(get_current_client)
):
    """Report a bug for a specific project"""
    # Verify project ownership
    project = project_crud.get_project(db, project_id)
    if not project or project.client_id != current_client.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this project"
        )
    
    bug_data = bug.dict()
    bug_data["project_id"] = project_id
    bug_data["user_id"] = project.user_id # Assign to the project owner (freelancer)
    bug_data["reporter"] = f"Client: {current_client.name}"
    
    return project_crud.create_bug(db, bug_data)
