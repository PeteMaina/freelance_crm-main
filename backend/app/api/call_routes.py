from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import call as call_crud
from app.schemas.call import CallCreate, CallUpdate, CallResponse, SprintCreate, SprintUpdate, SprintResponse, PersonalTodoCreate, PersonalTodoUpdate, PersonalTodoResponse
from typing import List, Optional

router = APIRouter(prefix="/calls", tags=["Calls"])


# Call endpoints
@router.post("/", response_model=CallResponse, status_code=201)
def create_call(call: CallCreate, db: Session = Depends(get_db)):
    """Create a new call"""
    call_data = call.dict()
    # Default user_id until auth context is ready
    if "user_id" not in call_data or not call_data.get("user_id"):
        call_data["user_id"] = 1
    created = call_crud.create_call(db, call_data)
    return created


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


# Sprint endpoints
sprint_router = APIRouter(prefix="/sprints", tags=["Sprints"])


@sprint_router.post("/", response_model=SprintResponse, status_code=201)
def create_sprint(sprint: SprintCreate, db: Session = Depends(get_db)):
    """Create a new sprint"""
    sprint_data = sprint.dict()
    # Default user_id until auth context is ready
    if "user_id" not in sprint_data or not sprint_data.get("user_id"):
        sprint_data["user_id"] = 1
    created = call_crud.create_sprint(db, sprint_data)
    return created


@sprint_router.get("/", response_model=List[SprintResponse])
def list_sprints(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all sprints with optional filter"""
    return call_crud.get_sprints(db, project_id)


@sprint_router.get("/{sprint_id}", response_model=SprintResponse)
def get_sprint(sprint_id: int, db: Session = Depends(get_db)):
    """Get a single sprint"""
    sprint = call_crud.get_sprint(db, sprint_id)
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
    return sprint


@sprint_router.patch("/{sprint_id}", response_model=SprintResponse)
def update_sprint(sprint_id: int, sprint: SprintUpdate, db: Session = Depends(get_db)):
    """Update a sprint"""
    updated = call_crud.update_sprint(db, sprint_id, sprint.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Sprint not found")
    return updated


@sprint_router.delete("/{sprint_id}", status_code=204)
def delete_sprint(sprint_id: int, db: Session = Depends(get_db)):
    """Delete a sprint"""
    if not call_crud.delete_sprint(db, sprint_id):
        raise HTTPException(status_code=404, detail="Sprint not found")


# Personal TODO endpoints
todo_router = APIRouter(prefix="/todos", tags=["Personal Todos"])


@todo_router.post("/", response_model=PersonalTodoResponse, status_code=201)
def create_personal_todo(todo: PersonalTodoCreate, db: Session = Depends(get_db)):
    """Create a new personal todo"""
    todo_data = todo.dict()
    # Default user_id until auth context is ready
    if "user_id" not in todo_data or not todo_data.get("user_id"):
        todo_data["user_id"] = 1
    created = call_crud.create_personal_todo(db, todo_data)
    return created


@todo_router.get("/", response_model=List[PersonalTodoResponse])
def list_personal_todos(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    is_completed: Optional[bool] = None,
    is_waiting: Optional[bool] = None,
    is_someday: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Get all personal todos with optional filters"""
    return call_crud.get_personal_todos(
        db, status, priority, category, is_completed, is_waiting, is_someday
    )


@todo_router.get("/{todo_id}", response_model=PersonalTodoResponse)
def get_personal_todo(todo_id: int, db: Session = Depends(get_db)):
    """Get a single personal todo"""
    todo = call_crud.get_personal_todo(db, todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo


@todo_router.patch("/{todo_id}", response_model=PersonalTodoResponse)
def update_personal_todo(todo_id: int, todo: PersonalTodoUpdate, db: Session = Depends(get_db)):
    """Update a personal todo"""
    updated = call_crud.update_personal_todo(db, todo_id, todo.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Todo not found")
    return updated


@todo_router.patch("/{todo_id}/toggle")
def toggle_personal_todo(todo_id: int, db: Session = Depends(get_db)):
    """Toggle personal todo completion"""
    return call_crud.toggle_personal_todo(db, todo_id)


@todo_router.delete("/{todo_id}", status_code=204)
def delete_personal_todo(todo_id: int, db: Session = Depends(get_db)):
    """Delete a personal todo"""
    if not call_crud.delete_personal_todo(db, todo_id):
        raise HTTPException(status_code=404, detail="Todo not found")

