from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import project as project_crud
from app.schemas.project import (
    ProjectCreate, ProjectUpdate, ProjectResponse, ProjectDetailResponse,
    TaskCreate, TaskUpdate, TaskResponse,
    MilestoneCreate, MilestoneUpdate, MilestoneResponse,
    BugCreate, BugUpdate, BugResponse,
    PhaseCreate, PhaseUpdate, PhaseResponse
)
from typing import List, Optional

router = APIRouter(prefix="/projects", tags=["Projects"])


# Project CRUD endpoints
@router.post("/", response_model=ProjectResponse, status_code=201)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project with default phases"""
    created = project_crud.create_project(db, project.dict())
    return project_crud.get_projects(db)[-1]


@router.get("/", response_model=List[ProjectResponse])
def list_projects(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status: Optional[str] = None,
    client_id: Optional[int] = None,
    is_personal: Optional[bool] = None,
    is_growth: Optional[bool] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all projects with optional filters"""
    return project_crud.get_projects(
        db, skip, limit, search, status, client_id, is_personal, is_growth, priority
    )


@router.get("/search")
def search_projects(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    """Search projects by title"""
    return project_crud.get_projects(db, search=q)


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get a single project"""
    project = project_crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.get("/{project_id}/detail", response_model=ProjectDetailResponse)
def get_project_detail(project_id: int, db: Session = Depends(get_db)):
    """Get project with all related data"""
    project = project_crud.get_project_detail(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: int, project: ProjectUpdate, db: Session = Depends(get_db)):
    """Update a project"""
    updated = project_crud.update_project(db, project_id, project.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Project not found")
    return updated


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    """Delete a project"""
    if not project_crud.delete_project(db, project_id):
        raise HTTPException(status_code=404, detail="Project not found")


@router.post("/{project_id}/clone", response_model=ProjectResponse)
def clone_project(project_id: int, new_title: str, db: Session = Depends(get_db)):
    """Clone a project"""
    cloned = project_crud.clone_project(db, project_id, new_title)
    if not cloned:
        raise HTTPException(status_code=404, detail="Project not found")
    return cloned


@router.get("/{project_id}/analytics")
def get_project_analytics(project_id: int, db: Session = Depends(get_db)):
    """Get analytics for a project"""
    return project_crud.get_project_analytics(db, project_id)


# Phase endpoints
@router.post("/{project_id}/phases", response_model=PhaseResponse, status_code=201)
def create_phase(project_id: int, phase: PhaseCreate, db: Session = Depends(get_db)):
    """Create a new phase"""
    phase_data = phase.dict()
    phase_data['project_id'] = project_id
    return project_crud.create_phase(db, phase_data)


@router.get("/{project_id}/phases", response_model=List[PhaseResponse])
def list_phases(project_id: int, db: Session = Depends(get_db)):
    """Get all phases for a project"""
    return project_crud.get_phases(db, project_id)


@router.patch("/phases/{phase_id}", response_model=PhaseResponse)
def update_phase(phase_id: int, phase: PhaseUpdate, db: Session = Depends(get_db)):
    """Update a phase"""
    updated = project_crud.update_phase(db, phase_id, phase.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Phase not found")
    return updated


@router.patch("/phases/{phase_id}/toggle")
def toggle_phase(phase_id: int, db: Session = Depends(get_db)):
    """Toggle phase completion status"""
    return project_crud.toggle_phase(db, phase_id)


@router.delete("/phases/{phase_id}", status_code=204)
def delete_phase(phase_id: int, db: Session = Depends(get_db)):
    """Delete a phase"""
    if not project_crud.delete_phase(db, phase_id):
        raise HTTPException(status_code=404, detail="Phase not found")


# Task endpoints
@router.post("/{project_id}/tasks", response_model=TaskResponse, status_code=201)
def create_task(project_id: int, task: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task"""
    task_data = task.dict()
    task_data['project_id'] = project_id
    return project_crud.create_task(db, task_data)


@router.get("/{project_id}/tasks", response_model=List[TaskResponse])
def list_tasks(
    project_id: int,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assignee: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all tasks for a project"""
    return project_crud.get_tasks(db, project_id, status, priority, assignee)


@router.get("/tasks/all", response_model=List[TaskResponse])
def list_all_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assignee: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all tasks across all projects"""
    return project_crud.get_tasks(db, None, status, priority, assignee)


@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """Get a single task"""
    task = project_crud.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task: TaskUpdate, db: Session = Depends(get_db)):
    """Update a task"""
    updated = project_crud.update_task(db, task_id, task.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated


@router.patch("/tasks/{task_id}/toggle")
def toggle_task(task_id: int, db: Session = Depends(get_db)):
    """Toggle task completion status"""
    return project_crud.toggle_task(db, task_id)


@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task"""
    if not project_crud.delete_task(db, task_id):
        raise HTTPException(status_code=404, detail="Task not found")


# Milestone endpoints
@router.post("/{project_id}/milestones", response_model=MilestoneResponse, status_code=201)
def create_milestone(project_id: int, milestone: MilestoneCreate, db: Session = Depends(get_db)):
    """Create a new milestone"""
    milestone_data = milestone.dict()
    milestone_data['project_id'] = project_id
    return project_crud.create_milestone(db, milestone_data)


@router.get("/{project_id}/milestones", response_model=List[MilestoneResponse])
def list_milestones(project_id: int, db: Session = Depends(get_db)):
    """Get all milestones for a project"""
    return project_crud.get_milestones(db, project_id)


@router.get("/milestones/all", response_model=List[MilestoneResponse])
def list_all_milestones(db: Session = Depends(get_db)):
    """Get all milestones across all projects"""
    return project_crud.get_milestones(db, None)


@router.patch("/milestones/{milestone_id}", response_model=MilestoneResponse)
def update_milestone(milestone_id: int, milestone: MilestoneUpdate, db: Session = Depends(get_db)):
    """Update a milestone"""
    updated = project_crud.update_milestone(db, milestone_id, milestone.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Milestone not found")
    return updated


@router.patch("/milestones/{milestone_id}/toggle")
def toggle_milestone(milestone_id: int, db: Session = Depends(get_db)):
    """Toggle milestone completion"""
    return project_crud.toggle_milestone(db, milestone_id)


@router.delete("/milestones/{milestone_id}", status_code=204)
def delete_milestone(milestone_id: int, db: Session = Depends(get_db)):
    """Delete a milestone"""
    if not project_crud.delete_milestone(db, milestone_id):
        raise HTTPException(status_code=404, detail="Milestone not found")


# Bug endpoints
@router.post("/{project_id}/bugs", response_model=BugResponse, status_code=201)
def create_bug(project_id: int, bug: BugCreate, db: Session = Depends(get_db)):
    """Create a new bug"""
    bug_data = bug.dict()
    bug_data['project_id'] = project_id
    return project_crud.create_bug(db, bug_data)


@router.get("/{project_id}/bugs", response_model=List[BugResponse])
def list_bugs(
    project_id: int,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all bugs for a project"""
    return project_crud.get_bugs(db, project_id, status, severity, priority)


@router.get("/bugs/all", response_model=List[BugResponse])
def list_all_bugs(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all bugs across all projects"""
    return project_crud.get_bugs(db, None, status, severity, priority)


@router.get("/bugs/{bug_id}", response_model=BugResponse)
def get_bug(bug_id: int, db: Session = Depends(get_db)):
    """Get a single bug"""
    bug = project_crud.get_bug(db, bug_id)
    if not bug:
        raise HTTPException(status_code=404, detail="Bug not found")
    return bug


@router.patch("/bugs/{bug_id}", response_model=BugResponse)
def update_bug(bug_id: int, bug: BugUpdate, db: Session = Depends(get_db)):
    """Update a bug"""
    updated = project_crud.update_bug(db, bug_id, bug.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Bug not found")
    return updated


@router.delete("/bugs/{bug_id}", status_code=204)
def delete_bug(bug_id: int, db: Session = Depends(get_db)):
    """Delete a bug"""
    if not project_crud.delete_bug(db, bug_id):
        raise HTTPException(status_code=404, detail="Bug not found")

