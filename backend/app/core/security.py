from datetime import datetime, timedelta
from jose import jwt
import bcrypt

# Bcrypt handles up to 72 bytes; truncate to avoid runtime errors on newer bcrypt builds.
def _normalize_password(password: str) -> bytes:
    return password.encode("utf-8")[:72]

# JWT configuration
SECRET_KEY = "supersecretkey"  # later we move this to env variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def hash_password(password: str) -> str:
    """
    Hash a plain text password before storing it in the database.
    """
    normalized = _normalize_password(password)
    return bcrypt.hashpw(normalized, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Compare a plain password with a hashed one.
    """
    try:
        normalized = _normalize_password(plain_password)
        return bcrypt.checkpw(normalized, hashed_password.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(data: dict):
    """
    Create JWT token for authenticated user.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
