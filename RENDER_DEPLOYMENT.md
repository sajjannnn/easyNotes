# Render Deployment — Backend

## Service Type

Deploy as a **Web Service** from the `web/backend` directory.

| Setting | Value |
|---|---|
| **Root Directory** | `web/backend` |
| **Build Command** | `npm install && npx prisma generate` |
| **Start Command** | `node src/index.js` |
| **Node Version** | 18+ |

After first deploy, open a **Shell** tab in Render and run:

```
npx prisma db push
```

This creates the database tables from the Prisma schema.

---

## Environment Variables

### Required (code will crash if missing)

| Variable | Purpose | Example Value |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string used by Prisma ORM | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `JWT_SECRET` | Secret key for signing and verifying JWT auth tokens | `openssl rand -base64 48` output |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key ID for S3 screenshot storage | `AKIAYD5IPBFU4WUK5DPL` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret access key for S3 | `xxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `AWS_REGION` | AWS region where your S3 bucket is located | `eu-north-1` |
| `AWS_S3_BUCKET` | Name of the S3 bucket for storing screenshots | `extension-yt` |

### Optional (have sensible defaults)

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `5000` | Server port (Render auto-sets this) |
| `JWT_EXPIRES_IN` | `7d` | Token expiry duration |

---

## Validation

### Prisma

- `DATABASE_URL` is read by both `prisma/schema.prisma` (`env("DATABASE_URL")`) and `src/config/index.js` (`requireEnv('DATABASE_URL')`)
- Must use PostgreSQL format with `?sslmode=require` for Render's internal DB

### AWS S3

- All 4 `AWS_*` vars are required by `src/config/index.js`
- The S3 bucket must already exist in the specified region
- Access key must have `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` permissions
- No ACL needed — bucket uses default S3 settings

### JWT

- `JWT_SECRET` is required — no fallback
- `JWT_EXPIRES_IN` controls how long login sessions last

### CORS

Currently `app.use(cors())` allows **all origins**. This is fine for development.
If you need to restrict it for production:

1. Change `app.use(cors())` in `src/index.js` to:
   ```js
   app.use(cors({ origin: 'https://your-vercel-app.vercel.app' }));
   ```
2. No `CORS_ORIGIN` env var is used by the current code

---

## Post-Deploy Checklist

- [ ] Database tables created (`npx prisma db push`)
- [ ] Health endpoint responds: `GET /api/health`
- [ ] Auth registers and logs in: `POST /api/auth/register`, `POST /api/auth/login`
- [ ] S3 upload works: `POST /api/screenshots`
