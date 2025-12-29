# Railway Deployment Guide

This guide explains how to deploy Method-AI Voice Actor to Railway.

## Prerequisites

1. A [Railway](https://railway.app) account
2. Your API keys:
   - `GEMINI_API_KEY` - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - `ELEVENLABS_API_KEY` - Get from [ElevenLabs](https://try.elevenlabs.io/ynnoa7cat7j9)

## Deployment Steps

### Option 1: One-Click Deploy (Recommended)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/method-ai)

### Option 2: Manual Deployment

#### Step 1: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub account and select `wildhash/method-ai-voice-actor`

#### Step 2: Deploy Backend Service

1. In your Railway project, click "New" → "GitHub Repo"
2. Select the same repo
3. Click on the new service and go to "Settings"
4. Set the following:
   - **Root Directory**: `backend`
   - **Builder**: Dockerfile
5. Go to "Variables" and add:
   ```
   GEMINI_API_KEY=your_key_here
   ELEVENLABS_API_KEY=your_key_here
   NODE_ENV=production
   ```
6. Deploy will start automatically

#### Step 3: Deploy Frontend Service

1. Click "New" → "GitHub Repo" again
2. Select the same repo
3. Go to "Settings":
   - **Root Directory**: `frontend`
   - **Builder**: Dockerfile
4. Go to "Variables" and add:
   ```
   VITE_API_BASE_URL=https://your-backend-url.railway.app/api
   ```
   (Replace with your actual backend URL from Step 2)
5. Deploy will start automatically

#### Step 4: Configure Networking

1. Click on the backend service → "Settings" → "Networking"
2. Generate a public domain (e.g., `method-ai-backend-xxx.railway.app`)
3. Repeat for frontend service
4. Update the frontend's `VITE_API_BASE_URL` with the backend's public URL

## Environment Variables Reference

### Backend Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `ELEVENLABS_API_KEY` | Yes | ElevenLabs API key |
| `PORT` | No | Server port (default: 3001) |
| `NODE_ENV` | No | Environment (production/development) |
| `FRONTEND_URL` | No | Frontend URL for CORS |

### Frontend Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | Backend API URL |

## Monitoring

- Railway provides built-in logs and metrics
- Health check endpoints:
  - Backend: `/api/health`
  - Frontend: `/health`

## Custom Domain

1. Go to service Settings → Networking
2. Click "Custom Domain"
3. Add your domain and follow DNS configuration instructions

## Troubleshooting

### Build fails with memory error

Railway free tier has 512MB memory. If builds fail:
1. Upgrade to a paid plan
2. Or deploy to a VPS instead (see DEPLOYMENT.md)

### API errors

1. Check that all environment variables are set correctly
2. Verify API keys are valid
3. Check service logs in Railway dashboard

## Cost Estimate

- **Hobby Plan** ($5/month): Includes $5 of usage
- Typical usage: ~$3-10/month depending on traffic
- Free tier available with limitations

## Support

For issues, please open a GitHub issue or contact the maintainers.
