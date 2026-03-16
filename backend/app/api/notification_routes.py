from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.crud import notification as notification_crud
from app.schemas.notification import NotificationResponse
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all unread notifications for the authenticated user"""
    notification_crud.refresh_notifications(db, current_user.id)
    return notification_crud.get_notifications(db, current_user.id)


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a notification as read"""
    notif = notification_crud.mark_as_read(db, notification_id, current_user.id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notif


@router.post("/refresh")
def refresh_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Manually trigger a notification refresh"""
    notification_crud.refresh_notifications(db, current_user.id)
    return {"status": "success"}
