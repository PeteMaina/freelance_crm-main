# Backend Issues & Fixes

## 1. DB Schema Mismatch (Critical)
**Symptoms:**
- `sqlite3.OperationalError: no such column: clients.company`
- `no such column: projects.priority`
- Affects client/project CRUD (create/list)

**Root Cause:**
- Existing crm.db has outdated schema (missing columns from model evolution).
- `Base.metadata.create_all()` creates tables but doesn't add columns to existing tables.
- Alembic migrations exist (680_features_expansion.py adds company/priority) but:
  - `upgrade head` had no output (DB locked by uvicorn or already applied).
  - Migration adds then DROPS columns - confusing logic.

**Fixes (execute in order, Ctrl+C all uvicorn first):**
```
# 1. Stop all backend terminals (Ctrl+C)
# 2. Delete old DB
del backend\crm.db
# 3. Fresh start with migrations
cd backend
$env:DATABASE_URL="sqlite:///./crm.db"
alembic stamp head
alembic upgrade head
# 4. Start backend
$env:CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Test: http://localhost:8000/docs → POST /clients/ succeeds.

**Alternative:** Use PostgreSQL (docker-compose up db).

## 2. Pydantic v2 Deprecation Warnings (High)
**Symptoms:**
```
UserWarning: Valid config keys have changed in V2: 'orm_mode' has been renamed to 'from_attributes'
```
- All schemas/client.py, project.py, call.py etc.

**Root Cause:**
- Pydantic v1 `orm_mode = True` → v2 `from_attributes = True`

**Fix:**
- Global find/replace in backend/app/schemas/*.py:
  ```
  orm_mode = True  →  from_attributes = True
  ```
- Files: schemas/client.py, project.py, call.py, user.py

## 3. Multiple Uvicorn Instances (Medium)
**Symptoms:**
- Port 8000 conflict, old logs persist.
- 3 active backend terminals.

**Fix:**
- Kill extras: Ctrl+C all but one backend terminal.

## 4. Incomplete/Inconsistent Models (Medium)
**Symptoms:**
- alembic references User from app.models.user, but models/models.py has Client/Project.
- Sprint/PersonalTodo in schemas but check relationships.

**Fix:**
- Verify all models imported in app/models/__init__.py:
  ```
  from .models import *
  ```
- Check alembic/env.py target_metadata = Base.metadata

## 5. Migration Revisions (Low)
**Issue:**
- 680_features_expansion.py adds then drops columns (cleanup?).

**Fix:**
- Review/edit migration logic or regenerate with `alembic revision --autogenerate`.

## 6. Startup Warnings (Low)
**Fix:**
- Fix pydantic Config above.

## Verification Steps
1. Post-fix: test POST /clients/, GET /clients/, POST /projects/
2. Check logs: no OperationalError, no pydantic warnings.
3. Frontend: http://localhost:5173/ → Clients tab create works.

**Priority:** 1>2>3

Review & greenlight to implement.
