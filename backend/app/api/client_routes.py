from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import client as client_crud
from app.schemas.client import (
    ClientCreate, ClientUpdate, ClientResponse, ClientDetailResponse,
    ClientContactCreate, ClientContactResponse,
    ClientContractCreate, ClientContractResponse,
    InvoiceCreate, InvoiceResponse,
    CommunicationCreate, CommunicationResponse
)
from app.core.security import get_current_user
from app.models.user import User
from typing import List, Optional

router = APIRouter(prefix="/clients", tags=["Clients"])


# Client CRUD endpoints
@router.post("/", response_model=ClientResponse, status_code=201)
def create_client(
    client: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new client"""
    client_data = client.dict()
    client_data["user_id"] = current_user.id  # ← real user, not hardcoded 1
    return client_crud.create_client(db, client_data)


@router.get("/", response_model=List[ClientResponse])
def list_clients(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all clients belonging to the authenticated user"""
    clients = client_crud.get_clients(db, skip, limit, search, user_id=current_user.id)
    if status:
        clients = [c for c in clients if c.status == status]
    return clients


@router.get("/search")
def search_clients(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search clients by name, email, or company"""
    return client_crud.get_clients(db, search=q, user_id=current_user.id)


@router.get("/invoices", response_model=List[InvoiceResponse])
def list_invoices(
    client_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all invoices with optional filters"""
    invoices = client_crud.get_invoices(db, client_id, skip, limit, user_id=current_user.id)
    if status:
        invoices = [i for i in invoices if i.status == status]
    return invoices


@router.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a single invoice"""
    invoice = client_crud.get_invoice(db, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


@router.patch("/invoices/{invoice_id}", response_model=InvoiceResponse)
def update_invoice(
    invoice_id: int,
    invoice: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an invoice"""
    updated = client_crud.update_invoice(db, invoice_id, invoice)
    if not updated:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return updated


@router.delete("/invoices/{invoice_id}", status_code=204)
def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an invoice"""
    if not client_crud.delete_invoice(db, invoice_id):
        raise HTTPException(status_code=404, detail="Invoice not found")


@router.get("/communications", response_model=List[CommunicationResponse])
def list_communications(
    client_id: Optional[int] = None,
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get communications with optional filters"""
    return client_crud.get_communications(db, client_id, project_id, user_id=current_user.id)


@router.post("/invoices", response_model=InvoiceResponse, status_code=201)
def create_invoice(
    invoice: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new invoice"""
    invoice_data = invoice.dict()
    invoice_data["user_id"] = current_user.id
    return client_crud.create_invoice(db, invoice_data)


@router.post("/communications", response_model=CommunicationResponse, status_code=201)
def create_communication(
    comm: CommunicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new communication log"""
    comm_data = comm.dict()
    comm_data["user_id"] = current_user.id
    return client_crud.create_communication(db, comm_data)


@router.delete("/communications/{comm_id}", status_code=204)
def delete_communication(
    comm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a communication"""
    if not client_crud.delete_communication(db, comm_id):
        raise HTTPException(status_code=404, detail="Communication not found")


@router.get("/{client_id}", response_model=ClientResponse)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a single client"""
    client = client_crud.get_client(db, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.get("/{client_id}/detail", response_model=ClientDetailResponse)
def get_client_detail(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get client with all related data"""
    client = client_crud.get_client_detail(db, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.patch("/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: int,
    client: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a client"""
    updated = client_crud.update_client(db, client_id, client.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Client not found")
    return updated


@router.delete("/{client_id}", status_code=204)
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a client"""
    if not client_crud.delete_client(db, client_id):
        raise HTTPException(status_code=404, detail="Client not found")


@router.get("/{client_id}/metrics")
def get_client_metrics(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get analytics metrics for a client"""
    return client_crud.get_client_metrics(db, client_id)


@router.post("/{client_id}/contacts", response_model=ClientContactResponse, status_code=201)
def create_client_contact(
    client_id: int,
    contact: ClientContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new contact for a client"""
    client = client_crud.get_client(db, client_id)
    if not client or client.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Client not found")
    contact_data = contact.dict()
    contact_data["client_id"] = client_id
    contact_data["user_id"] = current_user.id
    return client_crud.create_client_contact(db, contact_data)


@router.get("/{client_id}/contacts", response_model=List[ClientContactResponse])
def list_client_contacts(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all contacts for a client"""
    return client_crud.get_client_contacts(db, client_id, user_id=current_user.id)


@router.delete("/contacts/{contact_id}", status_code=204)
def delete_client_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a client contact"""
    if not client_crud.delete_client_contact(db, contact_id):
        raise HTTPException(status_code=404, detail="Contact not found")


@router.post("/{client_id}/contracts", response_model=ClientContractResponse, status_code=201)
def create_client_contract(
    client_id: int,
    contract: ClientContractCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new contract for a client"""
    client = client_crud.get_client(db, client_id)
    if not client or client.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Client not found")
    contract_data = contract.dict()
    contract_data["client_id"] = client_id
    contract_data["user_id"] = current_user.id
    return client_crud.create_client_contract(db, contract_data)


@router.get("/{client_id}/contracts", response_model=List[ClientContractResponse])
def list_client_contracts(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all contracts for a client"""
    return client_crud.get_client_contracts(db, client_id, user_id=current_user.id)


@router.get("/{client_id}/export")
def export_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export client data"""
    client = client_crud.get_client_detail(db, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return {
        "client": client,
        "contacts": client.contacts,
        "contracts": client.contracts,
        "invoices": client.invoices,
        "communications": client.communications,
        "projects": client.projects
    }
