from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    """
    Schema for creating a new user.
    """
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    """
    Schema for login request.
    """
    email: EmailStr
    password: str


class Token(BaseModel):
    """
    Schema returned after successful login.
    """
    access_token: str
    token_type: str