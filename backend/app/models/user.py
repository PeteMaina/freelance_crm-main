from sqlalchemy import Column, Integer, String
from app.database import Base

class User(Base):
    """
    This class represents the 'users' table in PostgreSQL.
    
    Each attribute becomes a column in the database.
    """
    
    __tablename__ = "users"  # Name of the table in PostgreSQL

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)