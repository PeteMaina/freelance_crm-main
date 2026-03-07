from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import call as call_crud
from app.schemas.call import CallCreate, CallUpdate, CallResponse
from typing import List, Optional

router = APIRouter(prefix="/calls", tags=["Calls"])


@router.post("/", response_model=CallResponse, status_code=201)
def create_call(call: CallCreate, db: Session = Depends(get_db)):
    """Create a new call"""
    call_data = call.dict()
    return call_crud.create_call(db, call_data)


@router.get("/", response_model=List[CallResponse])
def list_calls(
    project_id: Optional[int] = None,
    completed: Optional[bool] = None,
    call_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all calls with optional filters"""
    if project_id:
        return call_crud.get_calls(db, project_id, completed, call_type)
    return call_crud.get_all_calls(db, skip, limit)


@router.get("/upcoming")
def get_upcoming_calls(days: int = 7, db: Session = Depends(get_db)):
    """Get upcoming calls within specified days"""
    return call_crud.get_upcoming_calls(db, days)


@router.get("/overdue")
def get_overdue_calls(db: Session = Depends(get_db)):
    """Get overdue incomplete calls"""
    return call_crud.get_overdue_calls(db)


@router.get("/{call_id}", response_model=CallResponse)
def get_call(call_id: int, db: Session = Depends(get_db)):
    """Get a single call"""
    call = call_crud.get_call(db, call_id)
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    return call


@router.patch("/{call_id}", response_model=CallResponse)
def update_call(call_id: int, call: CallUpdate, db: Session = Depends(get_db)):
    """Update a call"""
    updated = call_crud.update_call(db, call_id, call.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Call not found")
    return updated


@router.patch("/{call_id}/toggle")
def toggle_call(call_id: int, db: Session = Depends(get_db)):
    """Toggle call completion status"""
    return call_crud.toggle_call(db, call_id)


@router.delete("/{call_id}", status_code=204)
def delete_call(call_id: int, db: Session = Depends(get_db)):
    """Delete a call"""
    if not call_crud.delete_call(db, call_id):
        raise HTTPException(status_code=404, detail="Call not found")

