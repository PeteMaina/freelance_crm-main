from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from app.schemas.project import ProjectResponse
from app.models.models import Project, ProjectPhase

STANDARD_PHASES = [
    "Discovery",
    "Requirements",
    "Design",
    "Development",
    "Testing",
    "Deployment",
    "Maintenance"
]


def create_project(db: Session, project_data):
    project = Project(**project_data)
    db.add(project)
    db.commit()
    db.refresh(project)

    # Automatically create standard phases
    for phase_name in STANDARD_PHASES:
        phase = ProjectPhase(
            name=phase_name,
            project_id=project.id
        )
        db.add(phase)

    db.commit()
    return project


def calculate_progress(project: Project):
    total = len(project.phases)
    completed = len([p for p in project.phases if p.completed])

    if total == 0:
        return 0

    return int((completed / total) * 100)


def get_projects(db: Session):
    projects = db.query(Project).options(joinedload(Project.phases)).all()

    response = []
    for project in projects:
        progress = calculate_progress(project)

        response.append(
            ProjectResponse(
                id=project.id,
                title=project.title,
                description=project.description,
                status=project.status,
                start_date=project.start_date,
                expected_end_date=project.expected_end_date,
                client_id=project.client_id,
                progress=progress
            )
        )

    return response


def toggle_phase(db: Session, phase_id: int):
    phase = db.query(ProjectPhase).filter(ProjectPhase.id == phase_id).first()
    phase.completed = not phase.completed
    db.commit()
    db.refresh(phase)
    return phase
