# Easy Notes

AI-powered YouTube learning extension with smart summaries, timestamp-based screenshots, and visual note-taking.

## What it does

Easy Notes is a browser extension that enhances YouTube learning. Instead of switching between notes and videos, users can capture screenshots directly from YouTube, attach comments, and instantly revisit exact moments using clickable timestamps. The extension also generates concise AI summaries from YouTube captions.

## How it works

1. **Install** the Chrome extension and open any YouTube video
2. **Capture** screenshots of the current video frame with exact timestamps
3. **Add comments** between screenshots for structured learning
4. **Generate summaries** with AI using Groq + YouTube captions
5. **Access dashboard** to organize, browse, and export notes as PDF

## Project structure

```
easyNotes/
├── extension/          Chrome extension (Manifest V3, JS)
├── web/backend/        Express API (Prisma, PostgreSQL, AWS S3, JWT auth)
├── web/frontend/       React dashboard (Vite, Tailwind CSS)
├── RENDER_DEPLOYMENT.md
├── DEPLOYMENT_VARIABLES.md
└── .gitignore
```

## Tech stack

### Extension
- JavaScript, Webpack, YouTube Captions API, Chrome Extensions (MV3)

### Backend
- Node.js, Express, Prisma, PostgreSQL, JWT (jsonwebtoken, bcryptjs)
- AWS S3 (client-s3, s3-request-presigner), multer

### Frontend
- React, Vite, Tailwind CSS, react-router-dom, axios, date-fns, lucide-react

### External services
- Groq AI (summary generation), AWS S3 (screenshot storage)

## Development

**Extension:**
```bash
cd extension
npm install
API_BASE=http://localhost:5000/api npm run build
```

**Backend:**
```bash
cd web/backend
cp .env.example .env   # fill in values
npm install
npx prisma db push
npm run dev
```

**Frontend:**
```bash
cd web/frontend
cp .env.example .env   # fill in VITE_API_URL
npm install
npm run dev
```
