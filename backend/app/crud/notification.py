from sqlalchemy.orm import Session
from app.models.models import Notification, Project, Task, Milestone
from datetime import datetime, timedelta
from typing import List, Optional

def get_notifications(db: Session, user_id: int, skip: int = 0, limit: int = 50) -> List[Notification]:
    return db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

def mark_as_read(db: Session, notification_id: int, user_id: int) -> Optional[Notification]:
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    if notification:
        notification.is_read = True
        db.commit()
        db.refresh(notification)
    return notification

def refresh_notifications(db: Session, user_id: int):
    """
    Check all entities for upcoming deadlines and create notifications.
    Alerts: 6h before, 1h before, and on due time.
    """
    now = datetime.utcnow()
    
    # Check Milestones
    milestones = db.query(Milestone).join(Project).filter(
        Project.user_id == user_id,
        Milestone.is_completed == False,
        Milestone.due_date != None
    ).all()
    
    for m in milestones:
        # Pydantic date to datetime
        due_datetime = datetime.combine(m.due_date, datetime.min.time())
        create_alerts_if_needed(db, user_id, "milestone", m.id, m.title, due_datetime, m.project_id)

    # Check Tasks
    tasks = db.query(Task).join(Project).filter(
        Project.user_id == user_id,
        Task.is_completed == False,
        Task.due_date != None
    ).all()
    
    for t in tasks:
        due_datetime = datetime.combine(t.due_date, datetime.min.time())
        create_alerts_if_needed(db, user_id, "task", t.id, t.title, due_datetime, t.project_id)

    # Check Projects
    projects = db.query(Project).filter(
        Project.user_id == user_id,
        Project.status == "active",
        Project.expected_end_date != None
    ).all()
    
    for p in projects:
        due_datetime = datetime.combine(p.expected_end_date, datetime.min.time())
        create_alerts_if_needed(db, user_id, "project", p.id, p.title, due_datetime, p.id)

def create_alerts_if_needed(db: Session, user_id: int, entity_type: str, entity_id: int, title: str, due_time: datetime, project_id: Optional[int]):
    now = datetime.utcnow()
    time_diff = due_time - now
    
    alerts = [
        {"type": "6h", "delta": timedelta(hours=6), "message": f"{entity_type.capitalize()} '{title}' is due in 6 hours."},
        {"type": "1h", "delta": timedelta(hours=1), "message": f"{entity_type.capitalize()} '{title}' is due in 1 hour."},
        {"type": "due", "delta": timedelta(seconds=0), "message": f"{entity_type.capitalize()} '{title}' is due now!"}
    ]
    
    for alert in alerts:
        # If we are past the alert threshold but not too far past (e.g. within the last 24h to avoid spamming old stuff)
        # And we haven't reached the next threshold yet
        if time_diff <= alert["delta"] and time_diff > (alert["delta"] - timedelta(minutes=30)):
            # Check if notification already exists
            existing = db.query(Notification).filter(
                Notification.user_id == user_id,
                Notification.type == entity_type,
                Notification.related_id == entity_id,
                Notification.alert_type == alert["type"]
            ).first()
            
            if not existing:
                notif = Notification(
                    user_id=user_id,
                    title=f"Upcoming {entity_type.capitalize()} Deadline",
                    message=alert["message"],
                    type=entity_type,
                    related_id=entity_id,
                    alert_type=alert["type"],
                    project_id=project_id
                )
                db.add(notif)
                db.commit()
