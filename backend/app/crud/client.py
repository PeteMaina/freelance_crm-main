from sqlalchemy.orm import Session
from app.models.models import Client, ClientContact, ClientContract, Invoice, Communication
import uuid
import secrets
import string
from datetime import timedelta
from app.schemas.client import (
    ClientCreate, ClientUpdate, ClientContactCreate, ClientContractCreate,
    InvoiceCreate, CommunicationCreate
)
from typing import List, Optional
from datetime import datetime


def create_client(db: Session, client_data: dict) -> Client:
    """Create a new client"""
    client = Client(**client_data)
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


def get_clients(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None, user_id: Optional[int] = None) -> List[Client]:
    """Get all clients with optional search"""
    query = db.query(Client)
    if user_id:
        query = query.filter(Client.user_id == user_id)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Client.name.ilike(search_term)) |
            (Client.email.ilike(search_term)) |
            (Client.company.ilike(search_term))
        )
    return query.offset(skip).limit(limit).all()


def get_client(db: Session, client_id: int) -> Optional[Client]:
    """Get a single client by ID"""
    return db.query(Client).filter(Client.id == client_id).first()


def get_client_detail(db: Session, client_id: int) -> Optional[Client]:
    """Get client with all related data"""
    return db.query(Client).filter(Client.id == client_id).first()


def update_client(db: Session, client_id: int, client_data: dict) -> Optional[Client]:
    """Update a client"""
    client = get_client(db, client_id)
    if client:
        for key, value in client_data.items():
            if value is not None:
                setattr(client, key, value)
        client.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(client)
    return client


def delete_client(db: Session, client_id: int) -> bool:
    """Delete a client"""
    client = get_client(db, client_id)
    if client:
        db.delete(client)
        db.commit()
        return True
    return False


# Client Contact CRUD
def create_client_contact(db: Session, contact_data: dict) -> ClientContact:
    """Create a new client contact"""
    contact = ClientContact(**contact_data)
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


def get_client_contacts(db: Session, client_id: int, user_id: Optional[int] = None) -> List[ClientContact]:
    """Get all contacts for a client"""
    query = db.query(ClientContact).filter(ClientContact.client_id == client_id)
    if user_id:
        query = query.filter(ClientContact.user_id == user_id)
    return query.all()


def delete_client_contact(db: Session, contact_id: int) -> bool:
    """Delete a client contact"""
    contact = db.query(ClientContact).filter(ClientContact.id == contact_id).first()
    if contact:
        db.delete(contact)
        db.commit()
        return True
    return False


# Client Contract CRUD
def create_client_contract(db: Session, contract_data: dict) -> ClientContract:
    """Create a new client contract"""
    contract = ClientContract(**contract_data)
    db.add(contract)
    db.commit()
    db.refresh(contract)
    return contract


def get_client_contracts(db: Session, client_id: int, user_id: Optional[int] = None) -> List[ClientContract]:
    """Get all contracts for a client"""
    query = db.query(ClientContract).filter(ClientContract.client_id == client_id)
    if user_id:
        query = query.filter(ClientContract.user_id == user_id)
    return query.all()


def delete_client_contract(db: Session, contract_id: int) -> bool:
    """Delete a client contract"""
    contract = db.query(ClientContract).filter(ClientContract.id == contract_id).first()
    if contract:
        db.delete(contract)
        db.commit()
        return True
    return False


# Invoice CRUD
def create_invoice(db: Session, invoice_data: dict) -> Invoice:
    """Create a new invoice"""
    invoice = Invoice(**invoice_data)
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


def get_invoices(db: Session, client_id: Optional[int] = None, skip: int = 0, limit: int = 100, user_id: Optional[int] = None) -> List[Invoice]:
    """Get invoices, optionally filtered by client or user"""
    query = db.query(Invoice)
    if user_id:
        query = query.filter(Invoice.user_id == user_id)
    if client_id:
        query = query.filter(Invoice.client_id == client_id)
    return query.offset(skip).limit(limit).all()


def get_invoice(db: Session, invoice_id: int) -> Optional[Invoice]:
    """Get a single invoice"""
    return db.query(Invoice).filter(Invoice.id == invoice_id).first()


def update_invoice(db: Session, invoice_id: int, invoice_data: dict) -> Optional[Invoice]:
    """Update an invoice"""
    invoice = get_invoice(db, invoice_id)
    if invoice:
        for key, value in invoice_data.items():
            if value is not None:
                setattr(invoice, key, value)
        db.commit()
        db.refresh(invoice)
    return invoice


def delete_invoice(db: Session, invoice_id: int) -> bool:
    """Delete an invoice"""
    invoice = get_invoice(db, invoice_id)
    if invoice:
        db.delete(invoice)
        db.commit()
        return True
    return False


# Communication CRUD
def create_communication(db: Session, comm_data: dict) -> Communication:
    """Create a new communication log"""
    if 'occurred_at' not in comm_data or comm_data['occurred_at'] is None:
        comm_data['occurred_at'] = datetime.utcnow()
    comm = Communication(**comm_data)
    db.add(comm)
    db.commit()
    db.refresh(comm)
    return comm


def get_communications(db: Session, client_id: Optional[int] = None, project_id: Optional[int] = None, user_id: Optional[int] = None) -> List[Communication]:
    """Get communications, optionally filtered"""
    query = db.query(Communication)
    if user_id:
        query = query.filter(Communication.user_id == user_id)
    if client_id:
        query = query.filter(Communication.client_id == client_id)
    if project_id:
        query = query.filter(Communication.project_id == project_id)
    return query.order_by(Communication.occurred_at.desc()).all()


def delete_communication(db: Session, comm_id: int) -> bool:
    """Delete a communication"""
    comm = db.query(Communication).filter(Communication.id == comm_id).first()
    if comm:
        db.delete(comm)
        db.commit()
        return True
    return False


# Analytics functions
def get_client_metrics(db: Session, client_id: int) -> dict:
    """Get analytics metrics for a client"""
    client = get_client(db, client_id)
    if not client:
        return {}
    
    # Calculate from database
    project_count = len(client.projects)
    
    # Get total revenue from invoices
    total_revenue = db.query(Invoice).filter(
        Invoice.client_id == client_id,
        Invoice.status == "paid"
    ).all()
    total_revenue_sum = sum(inv.amount for inv in total_revenue)
    
    # Count communications
    comm_count = db.query(Communication).filter(
        Communication.client_id == client_id
    ).count()
    
    return {
        "project_count": project_count,
        "total_revenue": total_revenue_sum,
        "lifetime_value": total_revenue_sum,
        "communication_count": comm_count,
        "average_project_value": total_revenue_sum / project_count if project_count > 0 else 0
    }


def generate_magic_link(db: Session, client_id: int) -> Optional[Client]:
    """Generate a unique magic link token and password for a client, valid for 30 days"""
    client = get_client(db, client_id)
    if not client:
        return None
    
    # Generate unique token
    client.magic_link_token = str(uuid.uuid4())
    
    # Generate a readable 8-character password (letters and digits)
    alphabet = string.ascii_letters + string.digits
    client.magic_link_password = ''.join(secrets.choice(alphabet) for _ in range(8))
    
    # Set expiration to 30 days from now
    client.magic_link_expires_at = datetime.utcnow() + timedelta(days=30)
    
    db.commit()
    db.refresh(client)
    return client


def get_client_by_token(db: Session, token: str) -> Optional[Client]:
    """Retrieve client by magic link token if not expired"""
    client = db.query(Client).filter(Client.magic_link_token == token).first()
    if client and client.magic_link_expires_at and client.magic_link_expires_at > datetime.utcnow():
        return client
    return None


