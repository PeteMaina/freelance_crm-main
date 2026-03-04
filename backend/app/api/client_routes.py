from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import client as client_crud
from app.schemas.client import ClientCreate, ClientResponse

router = APIRouter(prefix="/clients", tags=["Clients"])


@router.post("/", response_model=ClientResponse)
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    return client_crud.create_client(db, client)


@router.get("/", response_model=list[ClientResponse])
def list_clients(db: Session = Depends(get_db)):
    return client_crud.get_clients(db)
