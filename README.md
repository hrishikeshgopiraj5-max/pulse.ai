# Pulse AI

> Healthcare guidance, powered by intelligence.

Pulse AI is building a smarter way to understand health information, navigate care, and connect with the right healthcare support. An AI-powered healthcare assistance platform — **not** a replacement for professional medical care.

---

## 📁 Project Structure

```
pulse-ai/
├── frontend/                         # Static frontend (deployed on Vercel)
│   ├── index.html                    # Landing page + chat widget
│   ├── css/styles.css                # Design system
│   ├── js/main.js                    # Client-side JS
│   ├── assets/favicon.svg            # Logo
│   └── vercel.json                   # Vercel config
│
├── backend/                          # API server (deployed on Render)
│   └── src/
│       ├── server.js                 # Entry point
│       ├── app.js                    # Express app (API only)
│       ├── config/index.js           # Environment config
│       ├── lib/                      # Shared utilities
│       │   ├── ai.js                 # OpenRouter AI client
│       │   ├── database.js           # PostgreSQL pool
│       │   ├── errors.js             # Error classes
│       │   ├── logger.js             # Pino logger
│       │   ├── response.js           # Response helpers
│       │   ├── token.js              # JWT utilities
│       │   └── validation.js         # Validation schemas
│       ├── middleware/                # Express middleware
│       ├── models/                   # Data access (PostgreSQL queries)
│       ├── services/                 # Business logic
│       ├── controllers/              # HTTP handlers
│       └── routes/v1/               # API routes
│
├── database/
│   └── schema.sql                    # PostgreSQL schema (Neon-compatible)
│
├── .env / .env.example
├── render.yaml                       # Render deployment config
├── package.json
└── README.md
```

---

## 🚀 Deployment Guide

### 1. Database — Neon.tech

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string (it looks like `postgresql://...@ep-xxx.us-east-2.aws.neon.tech/pulsedb?sslmode=require`)
4. Run the migration:
   ```bash
   # Set DATABASE_URL in your .env first, then:
   npm run db:migrate
   ```

### 2. Backend — Render

1. Push your code to GitHub (already done ✅)
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `node backend/src/server.js`
   - **Plan:** Free
5. Add environment variables in Render dashboard:
   ```
   NODE_ENV=production
   DATABASE_URL=<your Neon connection string>
   JWT_SECRET=<generate a random string>
   FRONTEND_URL=<your Vercel URL, e.g. https://pulse-ai.vercel.app>
   CORS_ORIGINS=<same as FRONTEND_URL>
   OPENROUTER_API_KEY=<your OpenRouter key>
   OPENROUTER_PRIMARY_MODEL=deepseek/deepseek-chat-v3-0324:free
   ```
6. Deploy — Render will auto-deploy on push

### 3. Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `frontend`
   - **Build Command:** (leave empty — static site)
   - **Output Directory:** `.` (current directory)
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-app.onrender.com/api/v1
   ```
5. Deploy — Vercel will auto-deploy on push

### 4. Update Frontend API URL

After both are deployed, update `frontend/index.html`:

```html
<script>window.__PULSE_API_URL__ = 'https://your-app.onrender.com/api/v1';</script>
```

Or set it as a Vercel environment variable and inject it at build time.

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env (DATABASE_URL can be empty for local dev)

# Start backend (port 8000)
npm run dev

# Open frontend
# Just open frontend/index.html in your browser
# Or use: npx serve frontend -p 3000
```

---

## 📡 API Endpoints

| Endpoint                          | Method | Description              | Auth |
|-----------------------------------|--------|--------------------------|------|
| `GET  /api/`                      | GET    | API index                | No   |
| `GET  /api/v1/health`             | GET    | Health check             | No   |
| `POST /api/v1/auth/register`      | POST   | Register                 | No   |
| `POST /api/v1/auth/login`         | POST   | Login                    | No   |
| `POST /api/v1/auth/refresh`       | POST   | Refresh tokens           | No   |
| `GET  /api/v1/auth/me`            | GET    | User profile             | Yes  |
| `POST /api/v1/chat`               | POST   | Send chat message        | Yes  |
| `GET  /api/v1/chat/conversations` | GET    | List conversations       | Yes  |
| `GET  /api/v1/chat/:id`           | GET    | Get conversation         | Yes  |
| `DELETE /api/v1/chat/:id`         | DELETE | Delete conversation      | Yes  |
| `POST /api/v1/early-access`       | POST   | Join waitlist            | No   |
| `GET  /api/v1/early-access/count` | GET    | Sign-up count            | No   |

---

## ⚙️ Environment Variables

| Variable                | Where to set | Description                    |
|-------------------------|-------------|--------------------------------|
| `DATABASE_URL`          | Render      | Neon PostgreSQL connection string|
| `JWT_SECRET`            | Render      | Random string for JWT signing  |
| `FRONTEND_URL`          | Render      | Your Vercel deployment URL     |
| `CORS_ORIGINS`          | Render      | Same as FRONTEND_URL           |
| `OPENROUTER_API_KEY`    | Render      | OpenRouter API key             |

---

## ⚠️ Medical Disclaimer

Pulse AI provides general health information and guidance. It is **not** a doctor, does **not** diagnose conditions or prescribe medication. Always consult a qualified healthcare provider.

---

## 📄 License

© 2026 Pulse AI. All rights reserved.
