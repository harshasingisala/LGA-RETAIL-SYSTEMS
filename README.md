# PURPOSE: Documents how to configure, run, and deploy the warehouse management monorepo.
# USAGE: Start here when onboarding, running locally, or deploying the frontend/backend services.

# Warehouse Management System

Mobile-first internal admin infrastructure for a wholesale FMCG godown/warehouse management system.

## Tech Stack

- Frontend: React 18, Vite 8, Tailwind CSS, React Router, Axios, Recharts
- Backend: FastAPI, Pydantic Settings, Supabase Python client
- Database: Supabase PostgreSQL
- Deployment: Vercel frontend, Render backend

## First-Time Setup

Create local environment files from the examples. Do not commit real `.env` files.

Backend:

```bash
cd warehouse-mgmt/backend
copy .env.example .env
```

Set these backend values in `backend/.env` for local development:

```env
APP_ENV=development
APP_VERSION=1.0.0
DATA_MODE=local
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

Frontend:

```bash
cd warehouse-mgmt/frontend
copy .env.example .env
```

Set these frontend values in `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=LGA Retail
VITE_DEV_ADMIN_EMAIL=admin@lga.local
VITE_DEV_ADMIN_PASSWORD=admin123
```

Development login:

```text
Email: admin@lga.local
Password: admin123
```

Inventory, billing, and sales are stored in browser local storage while the
application is being developed. Clear the site's browser storage to reset the
sample data.

## Running The Project

Backend:

```bash
cd backend
npm install
npm run dev
```

The backend runs on `http://localhost:8000`. Health is available at `http://localhost:8000/api/health`.

Frontend:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Folder Structure

```text
warehouse-mgmt/
+-- backend/
|   +-- config/
|   +-- database/
|   +-- models/
|   +-- routers/
|   +-- schemas/
|   +-- services/
|   +-- main.py
|   +-- requirements.txt
|   +-- requirements-dev.txt
|   +-- render.yaml
|   +-- Procfile
+-- frontend/
    +-- src/
    |   +-- components/
    |   +-- data/
    |   +-- hooks/
    |   +-- layouts/
    |   +-- pages/
    |   +-- services/
    |   +-- utils/
    +-- vite.config.js
    +-- tailwind.config.js
    +-- postcss.config.js
    +-- vercel.json
```

## Deployment

### Vercel Frontend

1. Connect the repository to Vercel.
2. Set the project root to `warehouse-mgmt/frontend`.
3. Set environment variable `VITE_API_URL` to the deployed Render backend API URL ending in `/api`.
4. Deploy. `vercel.json` rewrites all SPA routes to `index.html` so browser refreshes work.

### Render Backend

1. Connect the repository to Render.
2. Set the service root to `backend`.
3. Use `render.yaml` or configure:
   - Build command: `npm install`
   - Start command: `npm start`
4. Set these Render environment variables:
   - `APP_ENV=production`
   - `APP_VERSION=1.0.0`
   - `API_RATE_LIMIT_MAX=120`
   - `DATA_MODE=local`
   - `ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app`

No secrets are stored in the repository.

## Production Later

The current local login is only for development and must not be used for a
public deployment. Before launch, replace it with server-backed authentication
and persisted data storage, then review the security checklist and existing
database hardening migration.
