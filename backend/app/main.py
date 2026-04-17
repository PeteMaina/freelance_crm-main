import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth
from app.database import engine, Base, get_db
from sqlalchemy.orm import Session
from app.models import models
from app.api import client_routes, project_routes, call_routes, notification_routes, client_portal
from app.api.call_routes import sprint_router, todo_router

logger = logging.getLogger(__name__)


def run_migrations():
    """
    Run alembic migrations programmatically on startup.
    This is the free-tier alternative to a pre-deploy command —
    migrations run before the app starts accepting requests.
    """
    try:
        from alembic.config import Config
        from alembic import command

        # Path is relative to where uvicorn runs (the backend/ directory)
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
        logger.info("Database migrations completed successfully.")
    except Exception as e:
        # Log the error with traceback for production debugging
        import traceback
        error_msg = f"Migration error (non-fatal): {e}\n{traceback.format_exc()}"
        logger.error(error_msg)
        print(f"CRITICAL MIGRATION ERROR: {error_msg}")  # Ensure it shows in container logs


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Runs on startup before requests are accepted, and on shutdown."""
    run_migrations()
    yield
    # Nothing to clean up on shutdown


app = FastAPI(
    title="ACTIVA Operations API",
    description="Operations hub for freelancers, founders, and small business owners - Clients, Projects, Tasks, and Roadmap Management",
    version="0.1.0",
    lifespan=lifespan
)

raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
if raw_origins == "*":
    cors_origins = ["*"]
else:
    cors_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True if "*" not in cors_origins else False, # allow_credentials must be False if origins is ['*']
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info(f"CORS origins configured: {cors_origins}")
print(f"CORS origins configured: {cors_origins}")

# create_all is kept as a safety net for brand new tables not yet in migrations
Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(client_routes.router)
app.include_router(project_routes.router)
app.include_router(call_routes.router)
app.include_router(sprint_router)
app.include_router(todo_router)
app.include_router(notification_routes.router)
app.include_router(client_portal.router)


@app.get("/")
def root():
    """Health check endpoint."""
    return {"message": "ACTIVA Operations API v1.0 is running."}


@app.get("/health/diagnostics")
def diagnostics(db: Session = Depends(get_db)):
    """Detailed diagnostics for production troubleshooting."""
    from sqlalchemy import text
    
    db_ok = False
    db_error = None
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception as e:
        db_error = str(e)
        
    return {
        "status": "online",
        "database": {
            "connected": db_ok,
            "error": db_error,
            "type": engine.url.drivername if engine else "unknown"
        },
        "cors": {
            "configured_origins": cors_origins,
            "raw_env": os.getenv("CORS_ORIGINS", "not set")
        },
        "environment": {
            "has_secret_key": bool(os.getenv("SECRET_KEY")),
            "database_url_provided": bool(os.getenv("DATABASE_URL")),
            "port": os.getenv("PORT", "8000")
        }
    }
