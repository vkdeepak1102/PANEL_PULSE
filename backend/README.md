# Panel Pulse — Backend (local run)

Quick start:

1. Copy environment variables:

```bash
cp backend/.env.example backend/.env
# Edit backend/.env to point to your MongoDB instance if needed
```

2. Install dependencies and run:

```bash
cd backend
npm install
npm run dev   # or npm start
```

Endpoints:
- `GET /api/v1/health` — returns basic service health
- `GET /api/v1/health/db` — checks MongoDB connectivity

Notes:
- This scaffold provides a minimal Express server and a `mongoClient` service for reuse.
- Extend `src/services/` with `PanelDataRepository`, `LLMService`, etc.
