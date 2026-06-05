# Deployment Variables

Required environment variables grouped by service.

---

## Backend (`web/backend`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string (Prisma format) |
| `JWT_SECRET` | Yes | — | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | No | `7d` | JWT token expiry duration |
| `PORT` | No | `5000` | Server port |
| `AWS_ACCESS_KEY_ID` | Yes | — | AWS access key for S3 |
| `AWS_SECRET_ACCESS_KEY` | Yes | — | AWS secret key for S3 |
| `AWS_REGION` | Yes | — | AWS region for S3 bucket (e.g. `eu-north-1`) |
| `AWS_S3_BUCKET` | Yes | — | S3 bucket name (e.g. `extension-yt`) |

### Example values

```
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
JWT_SECRET=your-random-64-char-secret
JWT_EXPIRES_IN=7d
PORT=5000
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=eu-north-1
AWS_S3_BUCKET=extension-yt
```

---

## Frontend (`web/frontend`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | No | `/api` | Backend API URL for production (e.g. `https://your-api.railway.app`) |

---

## Extension (`extension/`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `API_BASE` | No | `http://localhost:5000/api` | Build-time webpack var — passed as `API_BASE=https://... npm run build` |

---

## Platform Assignment

### Railway (Backend)
| Variable | Source |
|---|---|
| `DATABASE_URL` | Prisma/PostgreSQL provider (Railway can auto-provision this) |
| `JWT_SECRET` | Generate via `openssl rand -base64 48` |
| `JWT_EXPIRES_IN` | Optional, defaults to `7d` |
| `PORT` | Railway sets this automatically; fallback `5000` |
| `AWS_ACCESS_KEY_ID` | AWS IAM user credentials |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM user credentials |
| `AWS_REGION` | Your S3 bucket region |
| `AWS_S3_BUCKET` | Your S3 bucket name |

### Vercel (Frontend)
| Variable | Source |
|---|---|
| `VITE_API_URL` | Your Railway app URL (e.g. `https://your-api.up.railway.app`) |

### Extension (Build-time)
| Variable | How to set |
|---|---|
| `API_BASE` | `API_BASE=https://your-api.railway.app/api npx webpack` |

---

## Deployment Architecture

```
User's Browser
    │
    ├── YouTube (extension injects sidebar)
    │       └── Extension sends API calls → API_BASE
    │
    └── Web App (Vercel / your-domain.com)
            └── Frontend calls API → VITE_API_URL
```

### 1. Backend — Railway
1. Deploy `web/backend` to Railway
2. Railway auto-provisions a PostgreSQL database — set `DATABASE_URL` from Railway's dashboard
3. Set all other backend variables in Railway dashboard
4. Run `npx prisma db push` to create tables

### 2. Frontend — Vercel
1. Deploy `web/frontend` to Vercel
2. Set `VITE_API_URL` to your Railway backend URL (no trailing `/api`)

### 3. Extension — Build
1. Update `extension/manifest.json` `host_permissions` to include your backend domain
2. Build with:
   ```bash
   API_BASE=https://your-api.railway.app/api npm run build
   ```
3. Upload `extension/dist/` to Chrome Web Store

---

## Quick Fill Template

A `deployment-variables-template.txt` is in the repo root. Open it, fill in values, then copy-paste into each platform's dashboard.

---

## Secrets Management

- **Never commit real `.env` files** — `.env.*` patterns are in `.gitignore` (`.env.example` files are explicitly allowed)
- Real secrets are stored locally in `.secrets.md` (gitignored)
- Backend will refuse to start if any required env var is missing
