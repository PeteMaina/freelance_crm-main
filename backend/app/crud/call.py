from sqlalchemy.orm import Session
from app.models.models import Call
from app.schemas.call import CallCreate, CallUpdate
from typing import List, Optional
from datetime import datetime


# Call CRUD
def create_call(db: Session, call_data: dict) -> Call:
    """Create a new call"""
    call = Call(**call_data)
    db.add(call)
    db.commit()
    db.refresh(call)
    return call


def get_calls(db: Session, project_id: Optional[int] = None, 
              completed: Optional[bool] = None,
              call_type: Optional[str] = None,
              user_id: Optional[int] = None) -> List[Call]:
    """Get calls with filters"""
    query = db.query(Call)
    
    if user_id:
        query = query.filter(Call.user_id == user_id)
    
    if project_id:
        query = query.filter(Call.project_id == project_id)
    
    if completed is not None:
        query = query.filter(Call.completed == completed)
    
    if call_type:
        query = query.filter(Call.call_type == call_type)
    
    return query.order_by(Call.scheduled_at.desc()).all()


def get_call(db: Session, call_id: int, user_id: Optional[int] = None) -> Optional[Call]:
    """Get a single call by ID and user"""
    query = db.query(Call).filter(Call.id == call_id)
    if user_id:
        query = query.filter(Call.user_id == user_id)
    return query.first()


def update_call(db: Session, call_id: int, call_data: dict) -> Optional[Call]:
    """Update a call"""
    call = get_call(db, call_id)
    if call:
        for key, value in call_data.items():
            if value is not None:
                setattr(call, key, value)
        db.commit()
        db.refresh(call)
    return call


def toggle_call(db: Session, call_id: int) -> Optional[Call]:
    """Toggle call completion status"""
    call = get_call(db, call_id)
    if call:
        call.completed = not call.completed
        db.commit()
        db.refresh(call)
    return call


def delete_call(db: Session, call_id: int) -> bool:
    """Delete a call"""
    call = get_call(db, call_id)
    if call:
        db.delete(call)
        db.commit()
        return True
    return False


# Get all calls across all projects (for dashboard)
def get_all_calls(db: Session, skip: int = 0, limit: int = 100, user_id: Optional[int] = None) -> List[Call]:
    """Get all calls"""
    query = db.query(Call)
    if user_id:
        query = query.filter(Call.user_id == user_id)
    return query.order_by(Call.scheduled_at.desc()).offset(skip).limit(limit).all()


# Get upcoming calls
def get_upcoming_calls(db: Session, days: int = 7, user_id: Optional[int] = None) -> List[Call]:
    """Get upcoming calls within specified days"""
    from datetime import timedelta
    now = datetime.utcnow()
    end_date = now + timedelta(days=days)
    
    query = db.query(Call).filter(
        Call.scheduled_at >= now,
        Call.scheduled_at <= end_date,
        Call.completed == False
    )
    if user_id:
        query = query.filter(Call.user_id == user_id)
    return query.order_by(Call.scheduled_at).all()


# Get overdue calls
def get_overdue_calls(db: Session, user_id: Optional[int] = None) -> List[Call]:
    """Get overdue incomplete calls"""
    now = datetime.utcnow()
    
    query = db.query(Call).filter(
        Call.scheduled_at < now,
        Call.completed == False
    )
    if user_id:
        query = query.filter(Call.user_id == user_id)
    return query.order_by(Call.scheduled_at).all()


# Sprint CRUD
from app.models.models import Sprint
from app.schemas.call import SprintCreate, SprintUpdate


def create_sprint(db: Session, sprint_data: dict) -> Sprint:
    """Create a new sprint"""
    sprint = Sprint(**sprint_data)
    db.add(sprint)
    db.commit()
    db.refresh(sprint)
    return sprint


def get_sprints(db: Session, project_id: Optional[int] = None, user_id: Optional[int] = None) -> List[Sprint]:
    """Get sprints with optional filter"""
    query = db.query(Sprint)
    if user_id:
        query = query.filter(Sprint.user_id == user_id)
    if project_id:
        query = query.filter(Sprint.project_id == project_id)
    return query.order_by(Sprint.start_date.desc()).all()


def get_sprint(db: Session, sprint_id: int, user_id: Optional[int] = None) -> Optional[Sprint]:
    """Get a single sprint"""
    query = db.query(Sprint).filter(Sprint.id == sprint_id)
    if user_id:
        query = query.filter(Sprint.user_id == user_id)
    return query.first()


def update_sprint(db: Session, sprint_id: int, sprint_data: dict) -> Optional[Sprint]:
    """Update a sprint"""
    sprint = get_sprint(db, sprint_id)
    if sprint:
        for key, value in sprint_data.items():
            if value is not None:
                setattr(sprint, key, value)
        db.commit()
        db.refresh(sprint)
    return sprint


def delete_sprint(db: Session, sprint_id: int) -> bool:
    """Delete a sprint"""
    sprint = get_sprint(db, sprint_id)
    if sprint:
        db.delete(sprint)
        db.commit()
        return True
    return False


# Personal TODO CRUD
from app.models.models import PersonalTodo
from app.schemas.call import PersonalTodoCreate, PersonalTodoUpdate


def create_personal_todo(db: Session, todo_data: dict) -> PersonalTodo:
    """Create a new personal todo"""
    todo = PersonalTodo(**todo_data)
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


def get_personal_todos(db: Session, 
                       status: Optional[str] = None,
                       priority: Optional[str] = None,
                       category: Optional[str] = None,
                       is_completed: Optional[bool] = None,
                       is_waiting: Optional[bool] = None,
                       is_someday: Optional[bool] = None,
                       user_id: Optional[int] = None) -> List[PersonalTodo]:
    """Get personal todos with filters"""
    query = db.query(PersonalTodo)
    
    if user_id:
        query = query.filter(PersonalTodo.user_id == user_id)
    
    if status:
        query = query.filter(PersonalTodo.status == status)
    
    if priority:
        query = query.filter(PersonalTodo.priority == priority)
    
    if category:
        query = query.filter(PersonalTodo.category == category)
    
    if is_completed is not None:
        query = query.filter(PersonalTodo.is_completed == is_completed)
    
    if is_waiting is not None:
        query = query.filter(PersonalTodo.is_waiting == is_waiting)
    
    if is_someday is not None:
        query = query.filter(PersonalTodo.is_someday == is_someday)
    
    return query.order_by(PersonalTodo.order).all()


def get_personal_todo(db: Session, todo_id: int, user_id: Optional[int] = None) -> Optional[PersonalTodo]:
    """Get a single personal todo"""
    query = db.query(PersonalTodo).filter(PersonalTodo.id == todo_id)
    if user_id:
        query = query.filter(PersonalTodo.user_id == user_id)
    return query.first()


def update_personal_todo(db: Session, todo_id: int, todo_data: dict) -> Optional[PersonalTodo]:
    """Update a personal todo"""
    todo = get_personal_todo(db, todo_id)
    if todo:
        for key, value in todo_data.items():
            if value is not None:
                setattr(todo, key, value)
        
        # Handle completion
        if todo_data.get('is_completed') and not todo.completed_at:
            todo.completed_at = datetime.utcnow()
            todo.status = "done"
            todo.progress = 100
        
        todo.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(todo)
    
    return todo


def toggle_personal_todo(db: Session, todo_id: int) -> Optional[PersonalTodo]:
    """Toggle personal todo completion"""
    todo = get_personal_todo(db, todo_id)
    if todo:
        todo.is_completed = not todo.is_completed
        todo.status = "done" if todo.is_completed else "todo"
        todo.progress = 100 if todo.is_completed else 0
        todo.completed_at = datetime.utcnow() if todo.is_completed else None
        todo.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(todo)
    
    return todo


def delete_personal_todo(db: Session, todo_id: int) -> bool:
    """Delete a personal todo"""
    todo = get_personal_todo(db, todo_id)
    if todo:
        db.delete(todo)
        db.commit()
        return True
    return False

