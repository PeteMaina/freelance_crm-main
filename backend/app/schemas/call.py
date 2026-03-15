from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class CallBase(BaseModel):
    title: str
    notes: Optional[str] = None
    project_id: Optional[int] = None
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
        from_attributes = True


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
    project_id: Optional[int] = None


class TaskResponse(TaskBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Milestone Schemas
class MilestoneBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    status: str = "pending"
    is_completed: bool = False


class MilestoneCreate(MilestoneBase):
    project_id: Optional[int] = None


class MilestoneResponse(MilestoneBase):
    id: int
    project_id: int
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


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
    project_id: Optional[int] = None


class BugResponse(BugBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Sprint Schemas
class SprintBase(BaseModel):
    name: str
    goal: Optional[str] = None
    status: str = "planning"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    velocity: float = 0
    capacity: float = 0


class SprintCreate(SprintBase):
    project_id: Optional[int] = None


class SprintUpdate(BaseModel):
    name: Optional[str] = None
    goal: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    velocity: Optional[float] = None
    capacity: Optional[float] = None


class SprintResponse(SprintBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Personal TODO Schemas
class PersonalTodoBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "todo"
    priority: str = "medium"
    due_date: Optional[date] = None
    start_date: Optional[date] = None
    estimated_hours: Optional[float] = None
    actual_hours: float = 0
    progress: int = 0
    is_completed: bool = False
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = None
    context: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    is_waiting: bool = False
    waiting_for: Optional[str] = None
    is_someday: bool = False
    order: int = 0


class PersonalTodoCreate(PersonalTodoBase):
    pass


class PersonalTodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None
    start_date: Optional[date] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    progress: Optional[int] = None
    is_completed: Optional[bool] = None
    is_recurring: Optional[bool] = None
    recurrence_pattern: Optional[str] = None
    context: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    is_waiting: Optional[bool] = None
    waiting_for: Optional[str] = None
    is_someday: Optional[bool] = None
    order: Optional[int] = None


class PersonalTodoResponse(PersonalTodoBase):
    id: int
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

