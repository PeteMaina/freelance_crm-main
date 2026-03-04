from sqlalchemy import Column, Integer, String, ForeignKey, Date, Boolean, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Client(Base):
    """
    Client model represents a freelance client.
    One client can have multiple projects.
    """
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)

    # Relationship: One client -> Many projects
    projects = relationship("Project", back_populates="client", cascade="all, delete")


class Project(Base):
    """
    Project model represents a unique software build for a specific client.
    """
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="active")

    start_date = Column(Date, nullable=True)
    expected_end_date = Column(Date, nullable=True)

    client_id = Column(Integer, ForeignKey("clients.id"))

    # Relationships
    client = relationship("Client", back_populates="projects")
    phases = relationship("ProjectPhase", back_populates="project", cascade="all, delete")
    calls = relationship("Call", back_populates="project", cascade="all, delete")


class ProjectPhase(Base):
    """
    Represents a build phase within a project.
    Each project will have multiple standard phases.
    """
    __tablename__ = "project_phases"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    completed = Column(Boolean, default=False)

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

    project_id = Column(Integer, ForeignKey("projects.id"))

    project = relationship("Project", back_populates="calls")
