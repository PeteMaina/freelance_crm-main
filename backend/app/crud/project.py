from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from app.models.models import Project, ProjectPhase, Task, Milestone, Bug
from app.schemas.project import (
    ProjectCreate, ProjectUpdate, TaskCreate, TaskUpdate,
    MilestoneCreate, MilestoneUpdate, BugCreate, BugUpdate,
    PhaseCreate, PhaseUpdate
)
from typing import List, Optional
from datetime import datetime


STANDARD_PHASES = [
    "Discovery",
    "Requirements",
    "Design",
    "Development",
    "Testing",
    "Deployment",
    "Maintenance"
]


# Project CRUD
def create_project(db: Session, project_data: dict) -> Project:
    """Create a new project with default phases"""
    project = Project(**project_data)
    db.add(project)
    db.commit()
    db.refresh(project)

    # Automatically create standard phases
    for idx, phase_name in enumerate(STANDARD_PHASES):
        phase = ProjectPhase(
            name=phase_name,
            project_id=project.id,
            order=idx
        )
        db.add(phase)

    db.commit()
    return project


def calculate_progress(project: Project) -> int:
    """Calculate project progress based on phases"""
    total = len(project.phases)
    completed = len([p for p in project.phases if p.completed])

    if total == 0:
        return 0

    return int((completed / total) * 100)


def calculate_task_progress(project: Project) -> int:
    """Calculate project progress based on tasks"""
    if not project.tasks:
        return calculate_progress(project)
    
    total = len(project.tasks)
    completed = len([t for t in project.tasks if t.is_completed])

    if total == 0:
        return 0

    return int((completed / total) * 100)


def get_projects(db: Session, skip: int = 0, limit: int = 100, 
                 search: Optional[str] = None, 
                 status: Optional[str] = None,
                 client_id: Optional[int] = None,
                 is_personal: Optional[bool] = None,
                 is_growth: Optional[bool] = None,
                 priority: Optional[str] = None,
                 user_id: Optional[int] = None) -> List[Project]:
    """Get all projects with filters"""
    query = db.query(Project).options(joinedload(Project.phases))
    
    if user_id:
        query = query.filter(Project.user_id == user_id)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(Project.title.ilike(search_term))
    
    if status:
        query = query.filter(Project.status == status)
    
    if client_id:
        query = query.filter(Project.client_id == client_id)
    
    if is_personal is not None:
        query = query.filter(Project.is_personal == is_personal)
    
    if is_growth is not None:
        query = query.filter(Project.is_growth == is_growth)
    
    if priority:
        query = query.filter(Project.priority == priority)
    
    return query.offset(skip).limit(limit).all()


def get_project(db: Session, project_id: int, user_id: Optional[int] = None) -> Optional[Project]:
    """Get a single project with ownership check"""
    query = db.query(Project).options(
        joinedload(Project.phases),
        joinedload(Project.tasks),
        joinedload(Project.milestones),
        joinedload(Project.bugs)
    ).filter(Project.id == project_id)
    
    if user_id:
        query = query.filter(Project.user_id == user_id)
        
    return query.first()


def get_project_detail(db: Session, project_id: int, user_id: Optional[int] = None) -> Optional[Project]:
    """Get detailed project with all related data"""
    return get_project(db, project_id, user_id=user_id)


def update_project(db: Session, project_id: int, project_data: dict) -> Optional[Project]:
    """Update a project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if project:
        for key, value in project_data.items():
            if value is not None:
                setattr(project, key, value)
        project.updated_at = datetime.utcnow()
        
        # Recalculate progress
        project.progress = calculate_task_progress(project)
        
        db.commit()
        db.refresh(project)
    return project


def delete_project(db: Session, project_id: int) -> bool:
    """Delete a project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if project:
        db.delete(project)
        db.commit()
        return True
    return False


def clone_project(db: Session, project_id: int, new_title: str, user_id: Optional[int] = None) -> Optional[Project]:
    """Clone a project with all its data"""
    original = get_project(db, project_id)
    if not original:
        return None
    
    # Create new project
    new_project = Project(
        title=new_title,
        description=original.description,
        status="active",
        priority=original.priority,
        category=original.category,
        tags=original.tags,
        budget=original.budget,
        hourly_rate=original.hourly_rate,
        currency=original.currency,
        billing_type=original.billing_type,
        client_id=original.client_id,
        is_personal=original.is_personal,
        is_growth=original.is_growth,
        user_id=user_id or original.user_id
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    # Clone phases
    for phase in original.phases:
        new_phase = ProjectPhase(
            name=phase.name,
            description=phase.description,
            completed=False,
            order=phase.order,
            project_id=new_project.id
        )
        db.add(new_phase)
    
    db.commit()
    return new_project


# Phase CRUD
def create_phase(db: Session, phase_data: dict) -> ProjectPhase:
    """Create a new phase"""
    phase = ProjectPhase(**phase_data)
    db.add(phase)
    db.commit()
    db.refresh(phase)
    return phase


def get_phases(db: Session, project_id: int) -> List[ProjectPhase]:
    """Get all phases for a project"""
    return db.query(ProjectPhase).filter(
        ProjectPhase.project_id == project_id
    ).order_by(ProjectPhase.order).all()


def update_phase(db: Session, phase_id: int, phase_data: dict) -> Optional[ProjectPhase]:
    """Update a phase"""
    phase = db.query(ProjectPhase).filter(ProjectPhase.id == phase_id).first()
    if phase:
        for key, value in phase_data.items():
            if value is not None:
                setattr(phase, key, value)
        db.commit()
        db.refresh(phase)
        
        # Update project progress
        if phase.project:
            phase.project.progress = calculate_progress(phase.project)
            db.commit()
    
    return phase


def toggle_phase(db: Session, phase_id: int):
    """Toggle phase completion status"""
    phase = db.query(ProjectPhase).filter(ProjectPhase.id == phase_id).first()
    phase.completed = not phase.completed
    db.commit()
    db.refresh(phase)
    
    # Update project progress
    if phase.project:
        phase.project.progress = calculate_progress(phase.project)
        db.commit()
    
    return phase


def delete_phase(db: Session, phase_id: int) -> bool:
    """Delete a phase"""
    phase = db.query(ProjectPhase).filter(ProjectPhase.id == phase_id).first()
    if phase:
        db.delete(phase)
        db.commit()
        return True
    return False


# Task CRUD
def create_task(db: Session, task_data: dict) -> Task:
    """Create a new task"""
    task = Task(**task_data)
    db.add(task)
    db.commit()
    db.refresh(task)
    
    # Update project progress
    if task.project:
        task.project.progress = calculate_task_progress(task.project)
        db.commit()
    
    return task


def get_tasks(db: Session, project_id: Optional[int] = None, 
              status: Optional[str] = None,
              priority: Optional[str] = None,
              assignee: Optional[str] = None,
              user_id: Optional[int] = None) -> List[Task]:
    """Get tasks with filters"""
    query = db.query(Task)
    
    if user_id:
        query = query.filter(Task.user_id == user_id)
    
    if project_id:
        query = query.filter(Task.project_id == project_id)
    
    if status:
        query = query.filter(Task.status == status)
    
    if priority:
        query = query.filter(Task.priority == priority)
    
    if assignee:
        query = query.filter(Task.assignee == assignee)
    
    return query.order_by(Task.order).all()


def get_task(db: Session, task_id: int, user_id: Optional[int] = None) -> Optional[Task]:
    """Get a single task"""
    query = db.query(Task).filter(Task.id == task_id)
    if user_id:
        query = query.filter(Task.user_id == user_id)
    return query.first()


def update_task(db: Session, task_id: int, task_data: dict) -> Optional[Task]:
    """Update a task"""
    task = get_task(db, task_id)
    if task:
        for key, value in task_data.items():
            if value is not None:
                setattr(task, key, value)
        
        # Sync status and is_completed
        if task_data.get('status') == 'done' or task_data.get('is_completed'):
            task.is_completed = True
            task.status = "done"
            task.progress = 100
            if not task.completed_at:
                task.completed_at = datetime.utcnow()
        elif task_data.get('status') in ['todo', 'in_progress'] or task_data.get('is_completed') is False:
            task.is_completed = False
            if task_data.get('status'):
                task.status = task_data.get('status')
            if task.progress == 100:
                task.progress = 0
            task.completed_at = None
        
        task.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(task)
        
        # Update project progress
        if task.project:
            task.project.progress = calculate_task_progress(task.project)
            db.commit()
    
    return task


def toggle_task(db: Session, task_id: int) -> Optional[Task]:
    """Toggle task completion"""
    task = get_task(db, task_id)
    if task:
        task.is_completed = not task.is_completed
        task.status = "done" if task.is_completed else "todo"
        task.progress = 100 if task.is_completed else 0
        task.completed_at = datetime.utcnow() if task.is_completed else None
        task.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(task)
        
        # Update project progress
        if task.project:
            task.project.progress = calculate_task_progress(task.project)
            db.commit()
    
    return task


def delete_task(db: Session, task_id: int) -> bool:
    """Delete a task"""
    task = get_task(db, task_id)
    if task:
        db.delete(task)
        db.commit()
        return True
    return False


# Milestone CRUD
def create_milestone(db: Session, milestone_data: dict) -> Milestone:
    """Create a new milestone"""
    milestone = Milestone(**milestone_data)
    db.add(milestone)
    db.commit()
    db.refresh(milestone)
    return milestone


def get_milestones(db: Session, project_id: Optional[int] = None, user_id: Optional[int] = None) -> List[Milestone]:
    """Get milestones with optional filter"""
    query = db.query(Milestone)
    if user_id:
        query = query.filter(Milestone.user_id == user_id)
    if project_id:
        query = query.filter(Milestone.project_id == project_id)
    return query.order_by(Milestone.due_date).all()


def update_milestone(db: Session, milestone_id: int, milestone_data: dict) -> Optional[Milestone]:
    """Update a milestone"""
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if milestone:
        for key, value in milestone_data.items():
            if value is not None:
                setattr(milestone, key, value)
        
        if milestone_data.get('is_completed') and not milestone.completed_at:
            milestone.completed_at = datetime.utcnow()
            milestone.status = "completed"
        
        db.commit()
        db.refresh(milestone)
    
    return milestone


def toggle_milestone(db: Session, milestone_id: int) -> Optional[Milestone]:
    """Toggle milestone completion"""
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if milestone:
        milestone.is_completed = not milestone.is_completed
        milestone.status = "completed" if milestone.is_completed else "pending"
        milestone.completed_at = datetime.utcnow() if milestone.is_completed else None
        db.commit()
        db.refresh(milestone)
    
    return milestone


def delete_milestone(db: Session, milestone_id: int) -> bool:
    """Delete a milestone"""
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if milestone:
        db.delete(milestone)
        db.commit()
        return True
    return False


# Bug CRUD
def create_bug(db: Session, bug_data: dict) -> Bug:
    """Create a new bug"""
    bug = Bug(**bug_data)
    db.add(bug)
    db.commit()
    db.refresh(bug)
    return bug


def get_bugs(db: Session, project_id: Optional[int] = None,
             status: Optional[str] = None,
             severity: Optional[str] = None,
             priority: Optional[str] = None,
             user_id: Optional[int] = None) -> List[Bug]:
    """Get bugs with filters"""
    query = db.query(Bug)
    
    if user_id:
        query = query.filter(Bug.user_id == user_id)
    
    if project_id:
        query = query.filter(Bug.project_id == project_id)
    
    if status:
        query = query.filter(Bug.status == status)
    
    if severity:
        query = query.filter(Bug.severity == severity)
    
    if priority:
        query = query.filter(Bug.priority == priority)
    
    return query.order_by(Bug.created_at.desc()).all()


def get_bug(db: Session, bug_id: int, user_id: Optional[int] = None) -> Optional[Bug]:
    """Get a single bug"""
    query = db.query(Bug).filter(Bug.id == bug_id)
    if user_id:
        query = query.filter(Bug.user_id == user_id)
    return query.first()


def update_bug(db: Session, bug_id: int, bug_data: dict) -> Optional[Bug]:
    """Update a bug"""
    bug = get_bug(db, bug_id)
    if bug:
        for key, value in bug_data.items():
            if value is not None:
                setattr(bug, key, value)
        
        # Handle resolution/closure
        if bug_data.get('status') == 'resolved' and not bug.resolved_at:
            bug.resolved_at = datetime.utcnow()
        elif bug_data.get('status') == 'closed' and not bug.closed_at:
            bug.closed_at = datetime.utcnow()
        
        bug.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(bug)
    
    return bug


def delete_bug(db: Session, bug_id: int) -> bool:
    """Delete a bug"""
    bug = get_bug(db, bug_id)
    if bug:
        db.delete(bug)
        db.commit()
        return True
    return False


# Analytics
def get_project_analytics(db: Session, project_id: int) -> dict:
    """Get analytics for a project"""
    project = get_project(db, project_id)
    if not project:
        return {}
    
    tasks = project.tasks or []
    bugs = project.bugs or []
    
    return {
        "total_tasks": len(tasks),
        "completed_tasks": len([t for t in tasks if t.is_completed]),
        "in_progress_tasks": len([t for t in tasks if t.status == "in_progress"]),
        "todo_tasks": len([t for t in tasks if t.status == "todo"]),
        "total_bugs": len(bugs),
        "open_bugs": len([b for b in bugs if b.status == "open"]),
        "resolved_bugs": len([b for b in bugs if b.status == "resolved"]),
        "critical_bugs": len([b for b in bugs if b.severity == "critical"]),
        "total_hours": sum(t.actual_hours for t in tasks),
        "estimated_hours": sum(t.estimated_hours or 0 for t in tasks),
        "progress": project.progress,
        "phases_completed": len([p for p in project.phases if p.completed]),
        "total_phases": len(project.phases)
    }

