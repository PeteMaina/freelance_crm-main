# ACTIVA Frontend

React + MUI frontend for the FastAPI backend in this repository.

## Stack

- React (Vite)
- MUI (`@mui/material`)
- Plain JavaScript `.js` files

## Local run

1. Install dependencies:
   - `npm install`
2. Copy env template:
   - `copy .env.example .env` (Windows PowerShell)
3. Start dev server:
   - `npm run dev`

Frontend default URL: `http://localhost:5173`  
Backend default URL: `http://localhost:8000`

## Docker Compose

From repository root:

- `docker compose up --build`

This now starts:
- `db` (Postgres)
- `backend` (FastAPI on `8000`)
- `frontend` (Vite on `5173`)
