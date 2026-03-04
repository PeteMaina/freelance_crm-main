from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import call as call_crud
from app.schemas.call import CallCreate, CallResponse

router = APIRouter(prefix="/calls", tags=["Calls"])


@router.post("/", response_model=CallResponse)
def create_call(call: CallCreate, db: Session = Depends(get_db)):
    return call_crud.create_call(db, call)


@router.get("/{project_id}", response_model=list[CallResponse])
def list_calls(project_id: int, db: Session = Depends(get_db)):
    return call_crud.get_calls(db, project_id)


@router.patch("/{call_id}")
def toggle_call(call_id: int, db: Session = Depends(get_db)):
    return call_crud.toggle_call(db, call_id)
