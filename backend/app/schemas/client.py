from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


# Client Schemas
class ClientContactBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_primary: bool = False


class ClientContactCreate(ClientContactBase):
    pass


class ClientContactResponse(ClientContactBase):
    id: int

    class Config:
        from_attributes = True


class ClientContractBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    value: float = 0
    status: str = "draft"
    document_url: Optional[str] = None


class ClientContractCreate(ClientContractBase):
    client_id: int


class ClientContractResponse(ClientContractBase):
    id: int

    class Config:
        from_attributes = True


class InvoiceBase(BaseModel):
    invoice_number: str
    amount: float = 0
    status: str = "pending"
    issue_date: Optional[date] = None
    due_date: Optional[date] = None
    paid_date: Optional[date] = None
    description: Optional[str] = None


class InvoiceCreate(InvoiceBase):
    client_id: int


class InvoiceResponse(InvoiceBase):
    id: int

    class Config:
        from_attributes = True


class CommunicationBase(BaseModel):
    type: str  # email, call, meeting, chat
    direction: str  # inbound, outbound
    subject: Optional[str] = None
    notes: Optional[str] = None
    duration: Optional[int] = None
    occurred_at: Optional[datetime] = None


class CommunicationCreate(CommunicationBase):
    client_id: int
    project_id: Optional[int] = None


class CommunicationResponse(CommunicationBase):
    id: int
    client_id: int
    project_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ClientBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None
    industry: Optional[str] = None
    source: Optional[str] = None
    status: str = "active"
    rating: int = 0
    budget_range_min: Optional[float] = None
    budget_range_max: Optional[float] = None
    timezone: Optional[str] = None
    language: str = "en"
    notes: Optional[str] = None
    tags: Optional[str] = None
    avatar_url: Optional[str] = None
    payment_terms: str = "net30"
    average_project_value: float = 0


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None
    industry: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = None
    rating: Optional[int] = None
    budget_range_min: Optional[float] = None
    budget_range_max: Optional[float] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[str] = None
    avatar_url: Optional[str] = None
    payment_terms: Optional[str] = None
    average_project_value: Optional[float] = None
    lifetime_value: Optional[float] = None
    total_revenue: Optional[float] = None
    project_count: Optional[int] = None
    health_score: Optional[int] = None
    engagement_score: Optional[int] = None
    satisfaction_score: Optional[int] = None
    communication_frequency: Optional[int] = None
    contract_expiry: Optional[date] = None
    custom_fields: Optional[str] = None
    # Magic Link fields
    magic_link_token: Optional[str] = None
    magic_link_password: Optional[str] = None
    magic_link_expires_at: Optional[datetime] = None


class ClientResponse(ClientBase):
    id: int
    lifetime_value: float = 0
    total_revenue: float = 0
    project_count: int = 0
    health_score: int = 100
    engagement_score: int = 0
    satisfaction_score: int = 0
    communication_frequency: int = 0
    created_at: datetime
    updated_at: datetime
    last_contacted: Optional[datetime] = None
    contract_expiry: Optional[date] = None
    custom_fields: Optional[str] = None
    magic_link_token: Optional[str] = None
    magic_link_expires_at: Optional[datetime] = None
    # magic_link_password intentionally omitted from response for security

    class Config:
        from_attributes = True


class ClientDetailResponse(ClientResponse):
    contacts: List[ClientContactResponse] = []
    contracts: List[ClientContractResponse] = []
    invoices: List[InvoiceResponse] = []

class Config:
        from_attributes = True


class MagicLinkResponse(BaseModel):
    client_id: int
    client_name: str
    phone: Optional[str] = None
    magic_link_token: str
    magic_link_password: str
    magic_link_expires_at: datetime


class ClientPortalTokenCheckResponse(BaseModel):
    status: str
    client_name: str
    client_phone: Optional[str] = None


class ClientPortalLogin(BaseModel):
    token: str
    phone: str
    password: str


