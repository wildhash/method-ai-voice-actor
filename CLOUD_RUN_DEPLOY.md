# Google Cloud Run Deployment Guide (Hackathon Edition)

## Why Cloud Run?

✅ **Judges want to see Google Cloud integration**  
✅ **Scale to Zero = $0 when idle** (great for "Potential Impact" criteria)  
✅ **Your Dockerfiles are already Cloud Run ready**

---

## Prerequisites

1. Google Cloud account with billing enabled
2. Google Cloud CLI installed (`gcloud`)
3. Your API keys:
   - `GEMINI_API_KEY` from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - `ELEVENLABS_API_KEY` from [ElevenLabs](https://try.elevenlabs.io/ynnoa7cat7j9)

---

## Step 0: Setup Google Cloud CLI

```powershell
# Login to Google Cloud
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

---

## Step 1: Deploy Backend (The Brain)

```powershell
cd backend

gcloud run deploy method-ai-backend `
  --source . `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars "GEMINI_API_KEY=YOUR_GEMINI_KEY,ELEVENLABS_API_KEY=YOUR_ELEVENLABS_KEY,NODE_ENV=production"
```

**⏱️ Wait 2-3 minutes for build + deploy**

Once complete, you'll see:
```
Service URL: https://method-ai-backend-XXXXX-uc.a.run.app
```

**📋 COPY THIS URL - you need it for the frontend!**

---

## Step 2: Configure Frontend for Production

Create/update `frontend/.env.production`:

```env
VITE_API_BASE_URL=https://method-ai-backend-XXXXX-uc.a.run.app/api
```

Replace `XXXXX` with your actual backend URL from Step 1.

---

## Step 3: Deploy Frontend (The Face)

```powershell
cd frontend

gcloud run deploy method-ai-frontend `
  --source . `
  --region us-central1 `
  --allow-unauthenticated
```

**⏱️ Wait 2-3 minutes**

Once complete:
```
Service URL: https://method-ai-frontend-XXXXX-uc.a.run.app
```

**🎉 This is your live app URL!**

---

## Step 4: Verify Deployment

1. Open the Frontend URL in your browser
2. Press F12 → Network Tab
3. Try the "Rehearse" feature
4. Verify requests go to your Cloud Run backend (not localhost)

---

## Quick Reference

| Service | URL Pattern | Health Check |
|---------|-------------|--------------|
| Backend | `https://method-ai-backend-xxx-uc.a.run.app` | `/api/health` |
| Frontend | `https://method-ai-frontend-xxx-uc.a.run.app` | `/` |

---

## Troubleshooting

### Build fails
```powershell
# Check Cloud Build logs
gcloud builds list --limit=5
gcloud builds log BUILD_ID
```

### CORS errors
Make sure to add your frontend URL to the CORS whitelist:
```powershell
gcloud run services update method-ai-backend `
  --set-env-vars "FRONTEND_URL=https://method-ai-frontend-xxx-uc.a.run.app"
```

### Check service logs
```powershell
gcloud run services logs read method-ai-backend --limit=50
gcloud run services logs read method-ai-frontend --limit=50
```

---

## Cost Estimate

- **Cloud Run**: Pay only for what you use
- **Idle**: $0 (scales to zero!)
- **Active usage**: ~$0.00002400 per vCPU-second
- **Typical hackathon demo**: < $1

---

## Hackathon Talking Points

When presenting to judges, emphasize:

1. **"Native Google Cloud"** - Uses Cloud Run, not third-party platforms
2. **"Serverless & Scalable"** - Automatically handles traffic spikes
3. **"Cost Efficient"** - Scales to zero when not in use
4. **"Production Ready"** - Health checks, proper CORS, rate limiting
5. **"Gemini 3.0 Flash"** - Latest Google AI for fast inference
