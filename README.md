# SocietySphere

Multi-tenant society management platform (MERN). This repo currently contains the **backend Phase 1 foundation**.

## Run
```
cd backend && cp .env.example .env   # fill MONGO_URI and JWT_SECRET
npm install && npm run dev
```
## Quick test
1. `POST /api/v1/auth/register-society` (sets HttpOnly cookie)
2. `POST /api/v1/buildings`, `POST /api/v1/flats`, `POST /api/v1/users/invite` (resident/guard/staff)
3. Log in as each role and try visitors, complaints, notices.

Every query is scoped by `req.user.societyId` from the JWT user, never from the request body.

## Frontend
```
cd frontend && npm install && npm run dev   # http://localhost:5173, proxies /api to :5000
```
Run backend first. Register a society at `/register`, then use **Society setup** to add a building, a flat, and people.
