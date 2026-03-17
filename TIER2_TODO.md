# Tier 2 Implementation TODO

## Phase 1: Fix Existing Issues ✅

### 1.1 Fix Call API Routes ✅
- [x] Fix frontend callApi.js to use proper query parameters
- [x] Verify backend call routes handle project_id correctly
- [x] Test calls functionality end-to-end

### 1.2 Fix Client API ✅
- [x] Add proper status filter in client listing
- [x] Test client CRUD operations

### 1.3 Fix Project API ✅
- [x] Verify all project endpoints work
- [x] Test phase, task, milestone, bug CRUD

## Phase 2: Tier 2 Features Implementation ✅

### 2.1 Project Phases (141-160) - Already in code ✅
- [x] Verify phase creation works
- [x] Verify phase toggle/completion works
- [x] Test phase progress calculation

### 2.2 Sprint Management (241-260) ✅
- [x] Add Sprint model
- [x] Add Sprint CRUD routes
- [x] Add Sprint frontend API functions

### 2.3 Personal TODO (221-240) ✅
- [x] Add PersonalTodo model
- [x] Add TODO CRUD routes
- [x] Add TODO frontend API functions

### 2.4 Progress Tracking (321-340) ✅
- [x] Verify progress auto-calculation
- [x] Progress history tracking (via timestamps)

### 2.5 Bug Tracking (401-420) ✅
- [x] Verify bug creation works
- [x] Verify bug status transitions
- [x] Test bug filtering

## Phase 3: Testing

### 3.1 Backend Testing
- [ ] Run database migration
- [ ] Test all API endpoints
- [ ] Verify database operations

### 3.2 Frontend Testing
- [ ] Build frontend
- [ ] Test all UI components
- [ ] Verify data flow

### 3.3 Integration Testing
- [ ] Test end-to-end workflows
- [ ] Verify data consistency

---

## Summary of Changes Made:

### Backend Changes:
1. **models.py**: Added Sprint and PersonalTodo models
2. **schemas/call.py**: Added schemas for Sprint and PersonalTodo
3. **crud/call.py**: Added CRUD operations for Sprint and PersonalTodo
4. **api/call_routes.py**: Added API routes for Sprint and PersonalTodo
5. **main.py**: Registered new routers
6. **tier2_sprints_todos.py**: Created Alembic migration

### Frontend Changes:
1. **callApi.js**: Fixed listCalls function signature, added Sprint and PersonalTodo API functions
2. **DashboardPage.js**: Fixed listCalls call to match new signature

### New API Endpoints:
- `POST /sprints/` - Create sprint
- `GET /sprints/` - List sprints (with optional project_id filter)
- `GET /sprints/{id}` - Get sprint
- `PATCH /sprints/{id}` - Update sprint
- `DELETE /sprints/{id}` - Delete sprint

- `POST /todos/` - Create personal todo
- `GET /todos/` - List personal todos (with filters)
- `GET /todos/{id}` - Get personal todo
- `PATCH /todos/{id}` - Update personal todo
- `PATCH /todos/{id}/toggle` - Toggle todo completion
- `DELETE /todos/{id}` - Delete todo

