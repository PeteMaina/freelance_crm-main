import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth
from app.database import engine, Base
from app.models import models
from app.api import client_routes, project_routes, call_routes, notification_routes
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
        # Log the error but don't crash the server — if migrations fail
        # due to an already-applied migration or a transient DB issue,
        # we still want the app to start.
        logger.error(f"Migration error (non-fatal): {e}")


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

# create_all is kept as a safety net for brand new tables not yet in migrations
Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(client_routes.router)
app.include_router(project_routes.router)
app.include_router(call_routes.router)
app.include_router(sprint_router)
app.include_router(todo_router)
app.include_router(notification_routes.router)


@app.get("/")
def root():
    """Health check endpoint."""
    return {"message": "ACTIVA Operations API v1.0 is running."}
