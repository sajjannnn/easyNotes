# Deployment Variables

Required environment variables grouped by service.

---

## Backend (extension-web/backend)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Prisma format) |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | JWT token expiry duration (default: `7d`) |
| `PORT` | Server port (default: `5000`) |
| `AWS_ACCESS_KEY_ID` | AWS access key for S3 |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for S3 |
| `AWS_REGION` | AWS region for S3 bucket |
| `AWS_S3_BUCKET` | S3 bucket name for screenshot storage |

## Frontend (extension-web/frontend)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL for production (e.g. `https://your-api.railway.app`) |

---

## Deployment Architecture (User-Facing)

The goal is: **end users only need a URL — no cloud setup required.**

### How It Works

```
User's Browser
    │
    ├── YouTube (extension injects sidebar)
    │       └── Extension sends API calls → Backend URL
    │
    └── Web App (Vercel / your-domain.com)
            └── Frontend calls API → Backend URL
```

### 1. Backend (Railway — set up once by developer)

- Deploy `extension-web/backend` to Railway
- Railway auto-provisions a PostgreSQL database
- Set all `DATABASE_URL`, `JWT_SECRET`, `AWS_*` vars in Railway dashboard
- Run `npx prisma db push` to create tables

### 2. Frontend (Vercel — set up once by developer)

- Deploy `extension-web/frontend` to Vercel
- Set `VITE_API_URL` to your Railway backend URL

### 3. Chrome Extension (for end users)

Users need the extension to know your backend URL. Two options:

**Option A: Pre-build with your URL**
```bash
API_BASE=https://your-api.railway.app/api npx webpack --config webpack.config.js
```
Then distribute the built `dist/` folder or publish to Chrome Web Store.

**Option B: Configurable URL in extension settings**
After building, the `API_BASE` constant in `src/content.js` uses `__API_BASE__` from the webpack `DefinePlugin`. At build time:
```bash
API_BASE=https://your-api.railway.app/api npm run build
```

### Extension Host Permissions

The `manifest.json` lists `http://localhost:5000/*` as a host permission. Before publishing to the Chrome Web Store, update it to your production backend domain:

```json
"host_permissions": [
  "*://*.youtube.com/*",
  "https://your-api.railway.app/*"
]
```

---

## Deploying with Changes

If you modify the extension's API URL:
1. Update `manifest.json` host_permissions
2. Build with `API_BASE=https://your-api.railway.app/api npx webpack`
3. Deploy `dist/` to Chrome Web Store

If you modify the frontend's backend URL:
1. Set `VITE_API_URL` in Vercel dashboard
2. Redeploy

---

## Secrets Management

- **Never** commit `.env` files
- All secrets are stored in `.secrets.md` locally (gitignored)
- Backend will refuse to start if any required env var is missing (`config/index.js` throws on missing vars)
