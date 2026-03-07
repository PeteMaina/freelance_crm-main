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
              call_type: Optional[str] = None) -> List[Call]:
    """Get calls with filters"""
    query = db.query(Call)
    
    if project_id:
        query = query.filter(Call.project_id == project_id)
    
    if completed is not None:
        query = query.filter(Call.completed == completed)
    
    if call_type:
        query = query.filter(Call.call_type == call_type)
    
    return query.order_by(Call.scheduled_at.desc()).all()


def get_call(db: Session, call_id: int) -> Optional[Call]:
    """Get a single call"""
    return db.query(Call).filter(Call.id == call_id).first()


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


def delete_call(db: Call, call_id: int) -> bool:
    """Delete a call"""
    call = get_call(db, call_id)
    if call:
        db.delete(call)
        db.commit()
        return True
    return False


# Get all calls across all projects (for dashboard)
def get_all_calls(db: Session, skip: int = 0, limit: int = 100) -> List[Call]:
    """Get all calls"""
    return db.query(Call).order_by(Call.scheduled_at.desc()).offset(skip).limit(limit).all()


# Get upcoming calls
def get_upcoming_calls(db: Session, days: int = 7) -> List[Call]:
    """Get upcoming calls within specified days"""
    from datetime import timedelta
    now = datetime.utcnow()
    end_date = now + timedelta(days=days)
    
    return db.query(Call).filter(
        Call.scheduled_at >= now,
        Call.scheduled_at <= end_date,
        Call.completed == False
    ).order_by(Call.scheduled_at).all()


# Get overdue calls
def get_overdue_calls(db: Session) -> List[Call]:
    """Get overdue incomplete calls"""
    now = datetime.utcnow()
    
    return db.query(Call).filter(
        Call.scheduled_at < now,
        Call.completed == False
    ).order_by(Call.scheduled_at).all()

