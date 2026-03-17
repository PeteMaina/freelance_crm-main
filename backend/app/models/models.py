from sqlalchemy import Column, Integer, String, ForeignKey, Date, Boolean, Text, Float, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime


class Client(Base):
    """
    Client model represents a freelance client.
    One client can have multiple projects.
    """
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    company = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    industry = Column(String, nullable=True)
    source = Column(String, nullable=True)  # How client was acquired
    status = Column(String, default="active")  # Active, Prospect, On Hold, Archived
    rating = Column(Integer, default=0)  # 1-5 stars
    budget_range_min = Column(Float, nullable=True)
    budget_range_max = Column(Float, nullable=True)
    timezone = Column(String, nullable=True)
    language = Column(String, default="en")
    notes = Column(Text, nullable=True)
    tags = Column(String, nullable=True)  # Comma-separated tags
    avatar_url = Column(String, nullable=True)
    
    # Analytics fields
    lifetime_value = Column(Float, default=0)
    total_revenue = Column(Float, default=0)
    project_count = Column(Integer, default=0)
    health_score = Column(Integer, default=100)  # 0-100
    engagement_score = Column(Integer, default=0)
    satisfaction_score = Column(Integer, default=0)
    communication_frequency = Column(Integer, default=0)  # communications per month
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_contacted = Column(DateTime, nullable=True)
    contract_expiry = Column(Date, nullable=True)
    
    # Custom fields (stored as JSON string)
    custom_fields = Column(Text, nullable=True)
    
    # Payment terms
    payment_terms = Column(String, default="net30")  # net15, net30, net45, etc.
    average_project_value = Column(Float, default=0)

    # Relationship: One client -> Many projects
    projects = relationship("Project", back_populates="client", cascade="all, delete")
    contacts = relationship("ClientContact", back_populates="client", cascade="all, delete")
    contracts = relationship("ClientContract", back_populates="client", cascade="all, delete")
    invoices = relationship("Invoice", back_populates="client", cascade="all, delete")
    communications = relationship("Communication", back_populates="client", cascade="all, delete")


class ClientContact(Base):
    """Multiple contact persons per client"""
    __tablename__ = "client_contacts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, default=1)
    client_id = Column(Integer, ForeignKey("clients.id"))
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    role = Column(String, nullable=True)
    is_primary = Column(Boolean, default=False)
    
    client = relationship("Client", back_populates="contacts")


class ClientContract(Base):
    """Contract documents for clients"""
    __tablename__ = "client_contracts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, default=1)
    client_id = Column(Integer, ForeignKey("clients.id"))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    value = Column(Float, default=0)
    status = Column(String, default="draft")  # draft, active, expired, terminated
    document_url = Column(String, nullable=True)
    
    client = relationship("Client", back_populates="contracts")


class Invoice(Base):
    """Invoice records for clients"""
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, default=1)
    client_id = Column(Integer, ForeignKey("clients.id"))
    invoice_number = Column(String, nullable=False)
    amount = Column(Float, default=0)
    status = Column(String, default="pending")  # pending, paid, overdue, cancelled
    issue_date = Column(Date, nullable=True)
    due_date = Column(Date, nullable=True)
    paid_date = Column(Date, nullable=True)
    description = Column(Text, nullable=True)
    
    client = relationship("Client", back_populates="invoices")


class Communication(Base):
    """Communication log with clients"""
    __tablename__ = "communications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, default=1)
    client_id = Column(Integer, ForeignKey("clients.id"))
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    type = Column(String, nullable=False)  # email, call, meeting, chat
    direction = Column(String, nullable=False)  # inbound, outbound
    subject = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    duration = Column(Integer, nullable=True)  # in minutes
    occurred_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    client = relationship("Client", back_populates="communications")
    project = relationship("Project", back_populates="communications")


class Project(Base):
    """
    Project model represents a unique software build for a specific client.
    """
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="active")
    
    # New project fields
    priority = Column(String, default="medium")  # critical, high, medium, low
    category = Column(String, nullable=True)
    tags = Column(String, nullable=True)  # Comma-separated tags
    is_personal = Column(Boolean, default=False)  # Personal/growth project
    is_growth = Column(Boolean, default=False)  # Growth project
    
    # Budget and billing
    budget = Column(Float, nullable=True)
    hourly_rate = Column(Float, nullable=True)
    currency = Column(String, default="USD")
    billing_type = Column(String, default="hourly")  # hourly, fixed
    
    # Timeline
    start_date = Column(Date, nullable=True)
    expected_end_date = Column(Date, nullable=True)
    actual_end_date = Column(Date, nullable=True)
    
    # Progress
    progress = Column(Integer, default=0)
    
    # Client association (nullable — client can be assigned later)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    
    # Custom fields
    custom_fields = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    client = relationship("Client", back_populates="projects")
    phases = relationship("ProjectPhase", back_populates="project", cascade="all, delete")
    calls = relationship("Call", back_populates="project", cascade="all, delete")
    sprints = relationship("Sprint", back_populates="project", cascade="all, delete")
    communications = relationship("Communication", back_populates="project", cascade="all, delete")
    tasks = relationship("Task", back_populates="project", cascade="all, delete")
    milestones = relationship("Milestone", back_populates="project", cascade="all, delete")
    bugs = relationship("Bug", back_populates="project", cascade="all, delete")
    notifications = relationship("Notification", back_populates="project", cascade="all, delete")


class Task(Base):
    """Tasks within a project"""
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, default=1)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="todo")  # todo, in_progress, done
    priority = Column(String, default="medium")
    assignee = Column(String, nullable=True)
    
    due_date = Column(Date, nullable=True)
    start_date = Column(Date, nullable=True)
    estimated_hours = Column(Float, nullable=True)
    actual_hours = Column(Float, default=0)
    
    progress = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    
    # Subtask support
    parent_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    
    # Dependencies
    depends_on = Column(String, nullable=True)  # comma-separated task IDs
    
    tags = Column(String, nullable=True)
    order = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    project = relationship("Project", back_populates="tasks")


class Milestone(Base):
    """Project milestones"""
    __tablename__ = "milestones"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, default=1)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(Date, nullable=True)
    status = Column(String, default="pending")  # pending, completed, delayed
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    
    project = relationship("Project", back_populates="milestones")


class Bug(Base):
    """Bug tracking within projects"""
    __tablename__ = "bugs"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, default=1)
    
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String, default="medium")  # critical, high, medium, low
    priority = Column(String, default="medium")  # p1, p2, p3, p4
    status = Column(String, default="open")  # open, in_progress, resolved, closed
    
    steps_to_reproduce = Column(Text, nullable=True)
    expected_behavior = Column(Text, nullable=True)
    actual_behavior = Column(Text, nullable=True)
    
    environment = Column(String, nullable=True)  # dev, staging, production
    browser = Column(String, nullable=True)
    operating_system = Column(String, nullable=True)
    device = Column(String, nullable=True)
    
    assignee = Column(String, nullable=True)
    reporter = Column(String, nullable=True)
    
    attachment_url = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    
    project = relationship("Project", back_populates="bugs")


class ProjectPhase(Base):
    """
    Represents a build phase within a project.
    Each project will have multiple standard phases.
    """
    __tablename__ = "project_phases"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    completed = Column(Boolean, default=False)
    order = Column(Integer, default=0)
    
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)

    project_id = Column(Integer, ForeignKey("projects.id"))

    project = relationship("Project", back_populates="phases")


class Call(Base):
    """
    Represents scheduled calls or follow-ups with a client.
    """
    __tablename__ = "calls"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    completed = Column(Boolean, default=False)
    
    scheduled_at = Column(DateTime, nullable=True)
    duration = Column(Integer, nullable=True)  # in minutes
    
    call_type = Column(String, default="general")  # discovery, follow_up, retrospective, etc.
    
    project_id = Column(Integer, ForeignKey("projects.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, default=1)

    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="calls")


class Sprint(Base):
    """
    Sprint model for agile project management.
    """
    __tablename__ = "sprints"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    goal = Column(Text, nullable=True)
    status = Column(String, default="planning")  # planning, active, completed
    
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    
    velocity = Column(Float, default=0)
    capacity = Column(Float, default=0)
    
    project_id = Column(Integer, ForeignKey("projects.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, default=1)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    project = relationship("Project", back_populates="sprints")


class PersonalTodo(Base):
    """
    Personal TODO list for standalone tasks not tied to projects.
    """
    __tablename__ = "personal_todos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="todo")  # todo, in_progress, done
    priority = Column(String, default="medium")  # critical, high, medium, low
    
    due_date = Column(Date, nullable=True)
    start_date = Column(Date, nullable=True)
    
    estimated_hours = Column(Float, nullable=True)
    actual_hours = Column(Float, default=0)
    
    progress = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    
    # Recurrence
    is_recurring = Column(Boolean, default=False)
    recurrence_pattern = Column(String, nullable=True)  # daily, weekly, monthly
    
    # Context/location tags
    context = Column(String, nullable=True)  # @office, @home, etc.
    location = Column(String, nullable=True)
    
    # Categories
    category = Column(String, nullable=True)
    tags = Column(String, nullable=True)
    
    # Waiting for / Someday
    is_waiting = Column(Boolean, default=False)
    waiting_for = Column(String, nullable=True)
    is_someday = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Order for manual sorting
    order = Column(Integer, default=0)


class Notification(Base):
    """
    Notifications for deadlines and events.
    """
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=True)
    type = Column(String, nullable=False)  # milestone, task, project
    related_id = Column(Integer, nullable=False)
    alert_type = Column(String, nullable=False)  # 6h, 1h, due
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)

    project = relationship("Project", back_populates="notifications")
