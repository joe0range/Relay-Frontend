# Linguist — AI Translator

A full-stack AI translation app with a **Python / FastAPI** backend (Groq) and a **React / Vite** frontend.

```
linguist/
├── backend/
│   ├── main.py              # FastAPI app — streaming translation via Groq
│   ├── requirements.txt
│   ├── render.yaml          # Render deployment config
│   └── .env.example
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── vercel.json          # Vercel deployment config
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js           # fetch + SSE streaming helpers
        ├── styles/global.css
        └── components/
            ├── LanguageBar.jsx
            ├── TranslatorPanel.jsx
            └── RecentTranslations.jsx
```

---

## Local Development

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export GROQ_API_KEY=gsk_...
uvicorn main:app --reload
# → http://localhost:8000
```

### Frontend (separate terminal)
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

No extra config needed locally — Vite proxies `/translate` and `/languages` to port 8000.

---

## Deployment

### Step 1 — Deploy backend to Render

1. Push the project to a GitHub repository.

2. Go to https://render.com → **New → Web Service** → connect your repo.

3. Set the following in the Render dashboard:

   | Setting | Value |
   |---|---|
   | **Root Directory** | `backend` |
   | **Runtime** | `Python 3` |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

4. Under **Environment Variables**, add:

   | Key | Value |
   |---|---|
   | `GROQ_API_KEY` | `gsk_...` (your Groq key) |
   | `ALLOWED_ORIGINS` | *(leave blank for now — fill in after Step 2)* |

5. Click **Deploy**. Once live, copy your backend URL, e.g.:
   ```
   https://linguist-backend.onrender.com
   ```

---

### Step 2 — Deploy frontend to Vercel

1. Go to https://vercel.com → **Add New Project** → import your repo.

2. Set the following in Vercel's project settings:

   | Setting | Value |
   |---|---|
   | **Root Directory** | `frontend` |
   | **Framework Preset** | `Vite` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

3. Under **Environment Variables**, add:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://linguist-backend.onrender.com` (your Render URL from Step 1) |

4. Click **Deploy**. Once live, copy your frontend URL, e.g.:
   ```
   https://linguist.vercel.app
   ```

---

### Step 3 — Connect them (fix CORS)

Go back to **Render → Environment Variables** and set:

| Key | Value |
|---|---|
| `ALLOWED_ORIGINS` | `https://linguist.vercel.app` |

Then trigger a **Manual Deploy** on Render so the new env var takes effect.

Your app is now fully live. 🎉

---

## Environment Variables Reference

### Backend (Render)
| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Your Groq API key (`gsk_...`) |
| `ALLOWED_ORIGINS` | Yes (prod) | Comma-separated list of allowed frontend URLs |

### Frontend (Vercel)
| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes (prod) | Full URL of your Render backend, no trailing slash |

---

## Features
- 35+ languages, auto language detection
- Real-time streaming (SSE)
- Swap languages, copy to clipboard
- Recent translations history
- Dark mode, responsive layout
- Keyboard shortcut: `Ctrl+Enter` / `⌘+Enter`
