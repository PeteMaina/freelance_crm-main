from pydantic import BaseModel
from typing import Optional


class ClientBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None


class ClientCreate(ClientBase):
    pass


class ClientResponse(ClientBase):
    id: int

    class Config:
        orm_mode = True
