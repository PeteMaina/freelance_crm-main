import os
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
import bcrypt

from app.database import get_db
from app.models.user import User
from app.models.models import Client

# Bcrypt handles up to 72 bytes; truncate to avoid runtime errors on newer bcrypt builds.
def _normalize_password(password: str) -> bytes:
    return password.encode("utf-8")[:72]

# JWT configuration — reads from env var with a fallback for local dev
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

bearer_scheme = HTTPBearer()


def hash_password(password: str) -> str:
    """Hash a plain text password before storing it in the database."""
    normalized = _normalize_password(password)
    return bcrypt.hashpw(normalized, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compare a plain password with a hashed one."""
    try:
        normalized = _normalize_password(plain_password)
        return bcrypt.checkpw(normalized, hashed_password.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(data: dict) -> str:
    """Create JWT token for authenticated user."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency — validates the JWT token on every protected route
    and returns the authenticated User object.

    Usage in a route:
        @router.get("/")
        def my_route(current_user: User = Depends(get_current_user)):
            ...
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception

    return user


def get_current_client(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Client:
    """
    FastAPI dependency — validates the Client JWT token
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired portal token. Please log in again using your magic link.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        # We'll use 'client_id' in the payload instead of 'sub' (email) to distinguish from Users
        client_id: int = payload.get("client_id")
        if client_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    client = db.query(Client).filter(Client.id == client_id).first()
    if client is None:
        raise credentials_exception

    return client