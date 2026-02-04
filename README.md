# Apartment Shower Gift Registry

A simple gift registry app for apartment showers.

## Local Development

```bash
npm install
npm run dev:backend   # Terminal 1 - API on :3001
npm run dev:frontend  # Terminal 2 - App on :3000
```

## Deploy to Render

1. Push to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your repo (it will use `render.yaml`)
4. Set environment variables:
   - Backend: `ADMIN_PASSWORD` = your secret password
   - Frontend: `VITE_API_URL` = `https://your-backend-name.onrender.com/api/presents`
5. Deploy!

## Admin Access

Default password: `admin123` (change via `ADMIN_PASSWORD` env var)
