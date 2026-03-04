from pydantic import BaseModel


class PhaseResponse(BaseModel):
    id: int
    name: str
    completed: bool

    class Config:
        orm_mode = True
