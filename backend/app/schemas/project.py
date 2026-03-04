from pydantic import BaseModel
from typing import Optional, List
from datetime import date


class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "active"
    start_date: Optional[date] = None
    expected_end_date: Optional[date] = None
    client_id: int


class ProjectCreate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: int
    progress: int

    class Config:
        orm_mode = True
