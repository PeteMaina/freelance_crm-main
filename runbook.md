# Freelance CRM - Local Development Runbook

This guide provides detailed instructions for running the Freelance CRM application locally without Docker.

## Prerequisites

Before starting, ensure you have the following installed:
- Python 3.11+
- PostgreSQL 15+
- Node.js and npm (for frontend)

---

## Backend Setup

### 1. Database Setup

#### Option A: Using Docker for PostgreSQL Only

If you don't want to install PostgreSQL locally, you can run just the database container:

```bash
docker run -d \
  --name crm_postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=crm_db \
  -p 5432:5432 \
  postgres:15
```

#### Option B: Local PostgreSQL Installation

1. Install PostgreSQL 15 from https://www.postgresql.org/download/
2. During installation, set:
   - Username: `postgres`
   - Password: `postgres`
3. Create a database named `crm_db`:
   ```bash
   psql -U postgres
   CREATE DATABASE crm_db;
   \q
   ```

### 2. Python Environment Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### 3. Environment Variables

Backend now auto-loads `backend/.env` using `python-dotenv`.

- Recommended for local development: create `backend/.env`
- Also supported: set shell environment variables directly
- Docker behavior is unchanged (`docker-compose.yml` still injects env vars)

Set the following variables (either in shell or in `backend/.env`):

#### Windows (Command Prompt):
```cmd
set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crm_db
set CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

#### Windows (PowerShell):
```powershell
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crm_db"
$env:CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
```

#### Linux/Mac:
```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crm_db"
export CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
```

#### Or create a `.env` file in the backend directory:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crm_db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### 4. Run the Backend

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

If `DATABASE_URL` is missing, startup now fails fast with a clear error message.
Fix by setting env vars in your shell or by creating `backend/.env` with `DATABASE_URL`.

The backend will be available at: http://localhost:8000

- API documentation (Swagger UI): http://localhost:8000/docs
- Alternative API docs (ReDoc): http://localhost:8000/redoc
- Health check: http://localhost:8000/

---

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the frontend directory (if not already present):
```env
VITE_API_BASE_URL=http://localhost:8000
```

### 4. Run the Frontend

```bash
npm run dev
```

The frontend will be available at: http://localhost:5173

---

## Quick Start (Summary)

### One-liner for Windows:

```cmd
# Terminal 1 - Backend
cd backend
pip install -r requirements.txt
set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crm_db
set CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

Alternative Windows local backend startup using `.env`:

```powershell
cd backend
pip install -r requirements.txt
@"
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crm_db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
"@ | Set-Content .env
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### One-liner for Linux/Mac:

```bash
# Terminal 1 - Backend
cd backend
pip install -r requirements.txt
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crm_db"
export CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

---

## Troubleshooting

### "Connection refused" errors
- Ensure PostgreSQL is running
- Verify DATABASE_URL is correct
- Check that the database `crm_db` exists

### "DATABASE_URL is not set" error
- Create `backend/.env` with:
  - `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crm_db`
  - `CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173`
- Or export/set those values in your shell before running `uvicorn`

### Module not found errors
- Ensure you're in the correct directory (backend/)
- Verify virtual environment is activated
- Try reinstalling requirements: `pip install -r requirements.txt`

### CORS errors in browser
- Verify CORS_ORIGINS includes your frontend URL
- Frontend runs on port 5173 by default

### Port already in use
- Backend default port: 8000
- Frontend default port: 5173
- Kill the process using the port or specify a different port with `--port <number>`

---

## Database Migrations

If you need to run database migrations:

```bash
cd backend
alembic upgrade head
```

To create a new migration after model changes:
```bash
alembic revision --autogenerate -m "description of changes"
alembic upgrade head
```

---

## Useful Commands

| Task | Command |
|------|---------|
| Install backend deps | `pip install -r requirements.txt` |
| Run backend | `uvicorn app.main:app --reload` |
| Install frontend deps | `npm install` |
| Run frontend | `npm run dev` |
| Run migrations | `alembic upgrade head` |
| Create migration | `alembic revision --autogenerate -m "message"` |

---

## Project Structure

```
freelance_crm-main/
├── backend/
│   ├── app/
│   │   ├── api/          # API route handlers
│   │   ├── core/         # Core functionality (security)
│   │   ├── crud/         # Database operations
│   │   ├── models/       # SQLAlchemy models
│   │   ├── routes/       # Authentication routes
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── database.py   # Database configuration
│   │   └── main.py       # FastAPI application
│   ├── alembic/          # Database migrations
│   ├── requirements.txt  # Python dependencies
│   └── Dockerfile
├── frontend/
│   ├── src/              # React source code
│   ├── package.json      # Node dependencies
│   └── vite.config.js
├── docker-compose.yml
└── runbook.md           # This file
```

