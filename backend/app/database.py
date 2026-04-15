import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

from sqlalchemy.orm import Session
from fastapi import Depends

load_dotenv()

def get_db():
    """
    Create a new database session for each request.
    Automatically closes after request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Read database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Set it in your shell or backend/.env "
        "(e.g. postgresql://postgres:postgres@localhost:5432/crm_db)."
    )

# Render/Heroku often provide postgres://, but SQLAlchemy 1.4+ requires postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Create SQLAlchemy engine
# Engine is responsible for managing database connection pool
engine = create_engine(DATABASE_URL)

# Create session factory
# A session is used to talk to the database
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for all database models
Base = declarative_base()
