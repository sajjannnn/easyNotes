# Easy Notes

AI-powered YouTube learning extension with smart summaries, timestamp-based screenshots, and visual note-taking.

## What it does

Easy Notes is a browser extension that enhances YouTube learning. Instead of switching between notes and videos, users can capture screenshots directly from YouTube, attach comments, and instantly revisit exact moments using clickable timestamps. The extension also generates concise AI summaries from YouTube captions.

## How it works

1. **Install** the Chrome extension and open any YouTube video
2. **Capture** screenshots of the current video frame with exact timestamps
   <img width="708" height="470" alt="image" src="https://github.com/user-attachments/assets/2910ca15-aee7-48a6-ac04-04b0ba81a651" />


3. **Add comments** between screenshots for structured learning
   <img width="758" height="503" alt="image" src="https://github.com/user-attachments/assets/5a7bebbe-280a-444d-83a8-9e196328016a" />

4. **Generate summaries** with AI using Groq + YouTube captions
   <img width="903" height="1023" alt="Screenshot from 2026-06-08 19-38-15" src="https://github.com/user-attachments/assets/84729be3-ed07-4e29-a4b8-602cff5240fa" />

5. **Access dashboard** to organize, browse, and export notes as PDF
   <img width="1920" height="1080" alt="Screenshot from 2026-06-08 19-38-49" src="https://github.com/user-attachments/assets/6b654e5c-a605-4721-9ef1-2b1fd0f6f7ae" />
   <img width="1920" height="1080" alt="Screenshot from 2026-06-08 19-38-38" src="https://github.com/user-attachments/assets/cecdc3ca-8a10-4b05-9213-c557eed1cf0f" />
   <img width="1920" height="1080" alt="Screenshot from 2026-06-08 19-38-59" src="https://github.com/user-attachments/assets/ae40c21f-b4ab-4dc5-b0d9-84cde67d8dea" />




## Project structure

```
easyNotes/
├── extension/          Chrome extension (Manifest V3, JS)
├── web/backend/        Express API (Prisma, PostgreSQL, AWS S3, JWT auth)
├── web/frontend/       React dashboard (Vite, Tailwind CSS)
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
