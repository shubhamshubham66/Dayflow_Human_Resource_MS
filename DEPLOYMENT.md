# 🚀 Deployment Guide — Dayflow HRMS

## Architecture

```
┌─────────────────────┐       ┌──────────────────────┐
│   Vercel (Frontend) │ ────→ │   Render (Backend)   │
│   React + Vite      │       │   Node.js + Express  │
│                     │       │         ↓            │
│   yourapp.vercel.app│       │   MongoDB Atlas      │
└─────────────────────┘       └──────────────────────┘
```

---

## Step 1: Set Up MongoDB Atlas (Free Tier)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0)
3. Create a database user (username + password)
4. Whitelist IP: `0.0.0.0/0` (allow from anywhere for Render)
5. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/dayflow_hrms?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy Backend on Render

1. Go to [render.com](https://render.com) → New → **Web Service**
2. Connect your GitHub repo: `shubhamshubham66/Dayflow_Human_Resource_MS`
3. Configure:
   - **Name:** `dayflow-api`
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Plan:** Free

4. Add Environment Variables in Render dashboard:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGODB_URI` | `mongodb+srv://...` (from Step 1) |
   | `JWT_SECRET` | Generate: `openssl rand -hex 32` |
   | `JWT_REFRESH_SECRET` | Generate: `openssl rand -hex 32` |
   | `JWT_EXPIRES_IN` | `15m` |
   | `JWT_REFRESH_EXPIRES_IN` | `7d` |
   | `CLIENT_URL` | `https://your-app.vercel.app` (from Step 3) |
   | `EMAIL_HOST` | `smtp.gmail.com` |
   | `EMAIL_PORT` | `587` |
   | `EMAIL_USER` | Your Gmail address |
   | `EMAIL_PASS` | Gmail App Password |
   | `EMAIL_FROM` | `noreply@dayflow.com` |

5. Click **Create Web Service** → Wait for deploy
6. Copy your Render URL: `https://dayflow-api.onrender.com`

> ⚠️ **Gmail App Password:** Go to Google Account → Security → 2FA → App Passwords → Generate one for "Mail"

---

## Step 3: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo: `shubhamshubham66/Dayflow_Human_Resource_MS`
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. Add Environment Variable:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://dayflow-api.onrender.com/api` |

5. Click **Deploy** → Wait for build

6. Copy your Vercel URL: `https://your-app.vercel.app`

---

## Step 4: Update Render with Vercel URL

Go back to Render → Your service → Environment → Update:

| Key | Value |
|-----|-------|
| `CLIENT_URL` | `https://your-app.vercel.app` |

This ensures CORS allows your frontend domain.

---

## Step 5: Verify Deployment

1. Open your Vercel URL
2. You should see the Dayflow landing page
3. Try signing up → Check email verification → Sign in
4. Test both Employee and Admin roles

### Health Check
```bash
curl https://dayflow-api.onrender.com/api/health
# Should return: { "success": true, "message": "Dayflow HRMS API is running" }
```

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Check `CLIENT_URL` in Render matches your Vercel URL exactly |
| 502 on Render | Check Render logs, ensure `MONGODB_URI` is correct |
| Auth not working | Ensure both JWT secrets are set in Render |
| Email not sending | Verify Gmail App Password (not regular password) |
| Blank page on Vercel | Check `VITE_API_URL` is set correctly |
| Render sleeps (free) | First request takes ~30s to wake up (free tier limitation) |

---

## 🔑 Generating Secure Secrets

```bash
# Generate JWT secrets (run in terminal)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📝 Post-Deployment Checklist

- [ ] MongoDB Atlas cluster created & connection string working
- [ ] Backend deploys without errors on Render
- [ ] Health check endpoint responds
- [ ] Frontend deploys on Vercel
- [ ] `VITE_API_URL` points to Render backend
- [ ] `CLIENT_URL` on Render points to Vercel frontend
- [ ] Sign up works & email verification sent
- [ ] Sign in works & redirects correctly
- [ ] Both Employee and Admin dashboards accessible

---

## 🆓 Free Tier Notes

| Service | Limitation |
|---------|-----------|
| **Render Free** | Sleeps after 15min inactivity, ~30s cold start |
| **Vercel Free** | 100GB bandwidth/month, serverless functions limit |
| **MongoDB Atlas Free** | 512MB storage, shared cluster |

For production use, consider upgrading to paid tiers for always-on backend.
