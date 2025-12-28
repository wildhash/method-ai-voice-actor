# Method-AI Backend

This is the backend server for the Method-AI Voice Actor application.

## Features

- RESTful API built with Express.js
- Google Gemini AI integration for text rewriting and dialogue generation
- ElevenLabs integration for text-to-speech synthesis
- CORS enabled for cross-origin requests
- Environment-based configuration

## API Endpoints

### Health Check
```
GET /api/health
```

### Gemini AI Endpoints

#### Rewrite Text
```
POST /api/gemini/rewrite
Content-Type: application/json

{
  "text": "Text to rewrite",
  "characterPrompt": "Character description and style"
}
```

#### Generate Dialogue
```
POST /api/gemini/generate-dialogue
Content-Type: application/json

{
  "scenario": "Scene description",
  "characterName": "Character name",
  "characterTraits": "Character personality traits"
}
```

### Voice Endpoints

#### Synthesize Speech
```
POST /api/voice/synthesize
Content-Type: application/json

{
  "text": "Text to convert to speech",
  "voiceId": "elevenlabs_voice_id" (optional)
}
```

#### Get Available Voices
```
GET /api/voice/voices
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

3. Add your API keys to `.env`:
   ```env
   PORT=3001
   GEMINI_API_KEY=your_gemini_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Development

The server runs on port 3001 by default. Use `npm run dev` to start with auto-reload.

## Production

For production, use:
```bash
npm start
```

## Docker

Build and run with Docker:
```bash
docker build -t method-ai-backend .
docker run -p 3001:3001 --env-file .env method-ai-backend
```
