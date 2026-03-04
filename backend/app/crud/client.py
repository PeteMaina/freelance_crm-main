from sqlalchemy.orm import Session
from app.models.models import Client


def create_client(db: Session, client_data):
    client = Client(**client_data.dict())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


def get_clients(db: Session):
    return db.query(Client).all()
