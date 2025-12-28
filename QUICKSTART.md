# Method AI - Quick Start Guide

## 🎭 What is Method AI?

Method AI is a "Rehearsal Engine" that transforms dry text into character performances. It uses Google Vertex AI for intelligent script rewriting and ElevenLabs for voice synthesis.

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend  
cd frontend
npm install
```

### 2. Configure Environment

**Backend (.env):**
```env
PORT=3001
GCP_PROJECT_ID=your_gcp_project_id
GCP_REGION=us-central1
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

**Authenticate with Google Cloud:**
```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

### 3. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Access:** http://localhost:5173/method

## 🎬 The Three-Column Interface

### Left: The Script
Paste your raw text (documentation, scripts, manuals, etc.)

### Center: The Director's Chair
- Select a persona from the dropdown
- Click **REHEARSE** to transform the text

### Right: The Performance
- View the rewritten text in character
- Listen to the AI-generated audio performance
- Download the audio file

## 🎭 Available Personas

1. **Gritty Noir Detective** 🕵️
   - 1940s private investigator
   - Cynical, world-weary tone
   - Voice: Josh (Deep & Storytelling)

2. **SoCal Surfer** 🏄
   - Laid-back beach enthusiast
   - Uses slang like "gnarly", "dude", "stoked"
   - Voice: Joseph (Chill)

3. **1920s Transatlantic News Anchor** 📰
   - Fast-talking, high-energy reporter
   - Dramatic, formal language
   - Voice: Antoni (Well-spoken)

## 🔧 Adding Your Own Persona

Edit `frontend/src/personas.js`:

```javascript
export const PERSONAS = {
  your_key: {
    label: "Your Persona Name",
    systemPrompt: "Detailed character description with speech patterns and tone...",
    elevenLabsVoiceId: "voice_id_from_elevenlabs"
  }
};
```

Find ElevenLabs Voice IDs at: https://elevenlabs.io/voice-library

## 📡 API Endpoints

### Method AI Endpoint
```
POST /api/gemini/perform
{
  "text": "Your raw text",
  "personaKey": "Persona description"
}

Response:
{
  "script": "Rewritten text in character"
}
```

### Voice Synthesis
```
POST /api/voice/synthesize
{
  "text": "Text to speak",
  "voiceId": "elevenlabs_voice_id"
}

Response: Audio blob
```

## 🐛 Troubleshooting

### "Unable to infer your project"
Run: `gcloud auth application-default login`

### "ElevenLabs API key is not configured"
Add `ELEVENLABS_API_KEY` to backend/.env

### Port 3001 already in use
Change `PORT` in backend/.env

### Frontend can't connect to backend
Check `VITE_API_BASE_URL` in frontend/.env

## 🌩️ Deploying to Google Cloud Run

```bash
# Backend
cd backend
gcloud run deploy method-ai-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GCP_PROJECT_ID=YOUR_PROJECT,ELEVENLABS_API_KEY=YOUR_KEY

# Frontend
cd frontend
npm run build
gcloud run deploy method-ai-frontend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

## 📚 Project Structure

```
method-ai-voice-actor/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── gemini.js         # Vertex AI configuration
│   │   │   └── elevenlabs.js     # ElevenLabs client
│   │   ├── routes/
│   │   │   ├── gemini.js         # /api/gemini/perform endpoint
│   │   │   └── voice.js          # /api/voice/* endpoints
│   │   ├── services/
│   │   │   ├── geminiService.js  # Method Actor logic
│   │   │   └── voiceService.js   # ElevenLabs integration
│   │   └── index.js              # Express server
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── MethodStudio.jsx  # Three-column interface
    │   │   └── Studio.jsx         # Classic studio (legacy)
    │   ├── personas.js            # Persona configurations
    │   └── App.jsx                # Router
    └── package.json
```

## 🎯 Key Features Implemented

✅ Vertex AI integration with Gemini 1.5 Pro
✅ Method Actor system instruction
✅ Three-column "Stage, Director, Performance" UI
✅ Three pre-configured personas
✅ Automatic TTS generation
✅ Audio playback and download
✅ Clean architecture with separation of concerns
✅ Error handling and input validation
✅ Memory leak prevention
✅ Lazy initialization for better startup
✅ Google Cloud Run ready

## 📖 For More Information

See the main [README.md](README.md) for detailed documentation.
