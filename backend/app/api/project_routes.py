from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import project as project_crud
from app.schemas.project import ProjectCreate, ProjectResponse

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("/", response_model=ProjectResponse)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    created = project_crud.create_project(db, project.dict())
    return project_crud.get_projects(db)[-1]


@router.get("/", response_model=list[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    return project_crud.get_projects(db)


@router.patch("/phase/{phase_id}")
def toggle_phase(phase_id: int, db: Session = Depends(get_db)):
    return project_crud.toggle_phase(db, phase_id)
