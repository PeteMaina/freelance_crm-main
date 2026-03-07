from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


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


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[date] = None
    start_date: Optional[date] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    progress: Optional[int] = None
    is_completed: Optional[bool] = None
    parent_task_id: Optional[int] = None
    depends_on: Optional[str] = None
    tags: Optional[str] = None
    order: Optional[int] = None


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


class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[str] = None
    is_completed: Optional[bool] = None


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


class BugUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
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


class BugResponse(BugBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None

    class Config:
        orm_mode = True


# Phase Schemas
class PhaseBase(BaseModel):
    name: str
    description: Optional[str] = None
    completed: bool = False
    order: int = 0
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class PhaseCreate(PhaseBase):
    project_id: int


class PhaseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    order: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class PhaseResponse(PhaseBase):
    id: int
    project_id: int

    class Config:
        orm_mode = True


# Project Schemas
class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "active"
    priority: str = "medium"
    category: Optional[str] = None
    tags: Optional[str] = None
    is_personal: bool = False
    is_growth: bool = False
    budget: Optional[float] = None
    hourly_rate: Optional[float] = None
    currency: str = "USD"
    billing_type: str = "hourly"
    start_date: Optional[date] = None
    expected_end_date: Optional[date] = None
    actual_end_date: Optional[date] = None
    progress: int = 0
    client_id: int
    custom_fields: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    is_personal: Optional[bool] = None
    is_growth: Optional[bool] = None
    budget: Optional[float] = None
    hourly_rate: Optional[float] = None
    currency: Optional[str] = None
    billing_type: Optional[str] = None
    start_date: Optional[date] = None
    expected_end_date: Optional[date] = None
    actual_end_date: Optional[date] = None
    progress: Optional[int] = None
    client_id: Optional[int] = None
    custom_fields: Optional[str] = None


class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class ProjectDetailResponse(ProjectResponse):
    phases: List[PhaseResponse] = []
    tasks: List[TaskResponse] = []
    milestones: List[MilestoneResponse] = []
    bugs: List[BugResponse] = []

    class Config:
        orm_mode = True

