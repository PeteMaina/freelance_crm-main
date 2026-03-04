from sqlalchemy.orm import Session
from app.models.models import Call


def create_call(db: Session, call_data):
    call = Call(**call_data.dict())
    db.add(call)
    db.commit()
    db.refresh(call)
    return call


def get_calls(db: Session, project_id: int):
    return db.query(Call).filter(Call.project_id == project_id).all()


def toggle_call(db: Session, call_id: int):
    call = db.query(Call).filter(Call.id == call_id).first()
    call.completed = not call.completed
    db.commit()
    db.refresh(call)
    return call
