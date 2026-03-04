from pydantic import BaseModel
from typing import Optional


class CallBase(BaseModel):
    title: str
    notes: Optional[str] = None
    project_id: int


class CallCreate(CallBase):
    pass


class CallResponse(CallBase):
    id: int
    completed: bool

    class Config:
        orm_mode = True
