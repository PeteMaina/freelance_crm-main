import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth
from app.database import engine, Base
from app.models import models
from app.api import client_routes, project_routes, call_routes

# Create FastAPI application instance
app = FastAPI(
    title="Freelance CRM API",
    description="Backend API for managing clients, projects and progress",
    version="1.0.0"
)

raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
cors_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(client_routes.router)
app.include_router(project_routes.router)
app.include_router(call_routes.router)


@app.get("/")
def root():
    """
    Health check endpoint.
    This helps us confirm the backend is running correctly.
    """
    return {"message": "Freelance CRM API is running this means the backednd of this  app is fully functional. Copyright Insuarance claims software by Pete"}
