# Deployment notes for Railway / Vercel / Supabase

See README.md "Deployment" section.

Railway start command:
  uvicorn app.main:app --host 0.0.0.0 --port $PORT

Required secrets:
  DATABASE_URL, JWT_SECRET_KEY, CORS_ORIGINS, AI_*, CLOUDINARY_*
