from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.crud import notification as notification_crud
from app.schemas.notification import NotificationResponse, NotificationUpdate

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=List[NotificationResponse])
def get_notifications(db: Session = Depends(get_db)):
    # Default user_id=1 until auth is fully integrated
    user_id = 1
    # Trigger a refresh so the user sees latest alerts
    notification_crud.refresh_notifications(db, user_id)
    return notification_crud.get_notifications(db, user_id)

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(notification_id: int, db: Session = Depends(get_db)):
    user_id = 1
    notif = notification_crud.mark_as_read(db, notification_id, user_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notif

@router.post("/refresh")
def refresh_notifications(db: Session = Depends(get_db)):
    user_id = 1
    notification_crud.refresh_notifications(db, user_id)
    return {"status": "success"}
