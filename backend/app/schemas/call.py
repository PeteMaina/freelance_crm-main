from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class CallBase(BaseModel):
    title: str
    notes: Optional[str] = None
    project_id: int
    scheduled_at: Optional[datetime] = None
    duration: Optional[int] = None
    call_type: str = "general"


class CallCreate(CallBase):
    pass


class CallUpdate(BaseModel):
    title: Optional[str] = None
    notes: Optional[str] = None
    project_id: Optional[int] = None
    scheduled_at: Optional[datetime] = None
    duration: Optional[int] = None
    call_type: Optional[str] = None
    completed: Optional[bool] = None


class CallResponse(CallBase):
    id: int
    completed: bool
    created_at: datetime

    class Config:
        orm_mode = True


# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "todo"
    priority: str = "medium"
    assignee: Optional[str] = None
    due_date: Optional[date] = None
    start_date: Optional[date] = None
    estimated_hours: Optional[float] = None
    actual_hours: float = 0
    progress: int = 0
    is_completed: bool = False
    parent_task_id: Optional[int] = None
    depends_on: Optional[str] = None
    tags: Optional[str] = None
    order: int = 0


class TaskCreate(TaskBase):
    project_id: int


class TaskResponse(TaskBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        orm_mode = True


# Milestone Schemas
class MilestoneBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    status: str = "pending"
    is_completed: bool = False


class MilestoneCreate(MilestoneBase):
    project_id: int


class MilestoneResponse(MilestoneBase):
    id: int
    project_id: int
    completed_at: Optional[datetime] = None

    class Config:
        orm_mode = True


# Bug Schemas
class BugBase(BaseModel):
    title: str
    description: Optional[str] = None
    severity: str = "medium"
    priority: str = "medium"
    status: str = "open"
    steps_to_reproduce: Optional[str] = None
    expected_behavior: Optional[str] = None
    actual_behavior: Optional[str] = None
    environment: Optional[str] = None
    browser: Optional[str] = None
    operating_system: Optional[str] = None
    device: Optional[str] = None
    assignee: Optional[str] = None
    reporter: Optional[str] = None
    attachment_url: Optional[str] = None


class BugCreate(BugBase):
    project_id: int


class BugResponse(BugBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None

    class Config:
        orm_mode = True

