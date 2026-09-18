"""
# SkillSwap AI — Production Deploy Checklist

## 1. Supabase (PostgreSQL)
1. Create project at https://supabase.com/dashboard
2. Project Settings → Database → copy **URI** connection string
3. Replace `[YOUR-PASSWORD]` with the DB password
4. Use form: `postgresql+psycopg2://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres`
   (Session mode / direct `db.[ref].supabase.co:5432` also works)

## 2. GitHub
Push this repo, then connect Railway + Vercel to it.

## 3. Railway (Backend)
1. New project → Deploy from GitHub → select this repo
2. Set **Root Directory** to `backend`
3. Add variables (see below)
4. Generate public domain

### Railway env vars
```
DATABASE_URL=<supabase postgres uri with +psycopg2>
JWT_SECRET_KEY=<long random string>
CORS_ORIGINS=https://YOUR_VERCEL_DOMAIN,http://localhost:5173,http://127.0.0.1:5173
APP_ENV=production
DEBUG=false
AI_ENABLED=false
AI_API_KEY=
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RATE_LIMIT_DEFAULT=100/minute
```

## 4. Vercel (Frontend)
1. Import GitHub repo
2. **Root Directory** = `frontend`
3. Framework = Vite
4. Env:
   `VITE_API_URL=https://YOUR_RAILWAY_DOMAIN/api/v1`
5. Deploy

## 5. Wire CORS
Update Railway `CORS_ORIGINS` with the final Vercel URL, redeploy backend.
"""
