# Dynamic Persona System - Casting Director Feature

## Overview

The **Casting Director** feature allows you to dynamically create and manage custom personas (characters) with AI-generated voices and system prompts. This transforms Method AI from a static set of characters to a fully customizable voice acting platform.

## Features

### 🎭 Dynamic Persona Creation
- Create custom characters on-the-fly with just a name and description
- AI-powered system prompt generation using **Gemini 3.0 Flash**
- Custom voice synthesis using **ElevenLabs Voice Design API**
- Permanent voice library storage

### 🗑️ Persona Management
- View all personas (default + custom)
- Delete custom personas (with automatic ElevenLabs cleanup)
- Custom personas marked with ⭐ in the UI

### 💾 Persistent Storage
- Custom personas stored in JSON database
- Survives server restarts
- Simple file-based storage (easily upgradable to SQL/NoSQL)

## Architecture

### Backend Components

1. **Service Layer** (`backend/src/services/personaService.js`)
   - `createPersona()` - Full persona creation pipeline
   - `generateSystemPrompt()` - Uses Gemini to create detailed acting prompts
   - `generateVoice()` - Creates custom voice via ElevenLabs Voice Design
   - `loadPersonas()` / `savePersona()` / `deletePersona()` - JSON database operations

2. **API Routes** (`backend/src/routes/personas.js`)
   - `GET /api/personas` - Fetch all personas (default + custom)
   - `POST /api/personas/create` - Create new persona
   - `DELETE /api/personas/:id` - Delete custom persona

3. **Database** (`backend/src/data/personas.json`)
   - Simple JSON file storing custom personas
   - Auto-created on first use

### Frontend Components

1. **PersonaManager** (`frontend/src/pages/PersonaManager.jsx`)
   - Modal UI for creating/viewing/deleting personas
   - Form validation and loading states
   - Real-time persona list updates

2. **Integration** (`frontend/src/pages/MethodStudio.jsx`)
   - "Manage Cast" button in Director's Chair
   - Dynamic persona dropdown with custom personas
   - Auto-refresh on create/delete

3. **Service Layer** (`frontend/src/services/personaService.js`)
   - API communication helpers

## Usage

### Creating a Custom Persona

1. **Open Method Studio** page
2. **Click "🎭 Manage Cast"** button in the Director's Chair section
3. **Fill in the form:**
   - **Name**: Character name (e.g., "Cyborg Ninja", "Swamp Witch")
   - **Description**: Detailed character vibe/voice description
     - Example: *"Old, creaky, cackling, evil witch with a high-pitched voice from the depths of a murky swamp"*
     - Be specific! Include: age, accent, tone, pitch, personality, background
4. **Click "🎬 Audition Character"**
5. **Wait 15-30 seconds** while:
   - Gemini generates a detailed system prompt
   - ElevenLabs designs and adds a custom voice
6. **New persona appears** in the dropdown with ⭐

### Using Custom Personas

Once created, custom personas work exactly like default personas:
1. Select from the persona dropdown
2. Enter your text
3. Click "REHEARSE"
4. Get AI-rewritten script + custom voice audio

### Deleting Custom Personas

1. Open "🎭 Manage Cast"
2. Find the persona in the "Custom Characters" section
3. Click the 🗑️ button
4. Confirm deletion
5. Voice is removed from ElevenLabs library

## API Reference

### Create Persona

```http
POST /api/personas/create
Content-Type: application/json

{
  "name": "Cyborg Ninja",
  "description": "A raspy, metallic whisper from a 3025 assassin. Speaks in short, clipped sentences with robotic undertones."
}
```

**Response:**
```json
{
  "id": "cyborg_ninja",
  "label": "Cyborg Ninja",
  "systemPrompt": "You are Unit 734, a cyborg assassin from the year 3025...",
  "elevenLabsVoiceId": "abc123xyz",
  "description": "A raspy, metallic whisper...",
  "isCustom": true,
  "createdAt": "2025-12-28T12:00:00.000Z"
}
```

### Get All Personas

```http
GET /api/personas
```

**Response:**
```json
{
  "noir_detective": { "label": "Gritty Noir Detective", ... },
  "cyborg_ninja": { "label": "Cyborg Ninja", "isCustom": true, ... }
}
```

### Delete Persona

```http
DELETE /api/personas/cyborg_ninja
```

**Response:**
```json
{
  "success": true,
  "message": "Persona \"Cyborg Ninja\" deleted successfully"
}
```

## Technical Details

### Voice Generation Process

1. **Preview Creation**: Call ElevenLabs `/v1/text-to-voice/create-previews`
   - Generates voice samples based on description
   - Returns `generated_voice_id` and audio samples
   
2. **Library Addition**: Call ElevenLabs `/v1/voices/add`
   - Uploads audio sample as base64
   - Creates permanent voice in user's library
   - Returns permanent `voice_id`

3. **Persona Storage**: Save persona object with voice ID to JSON database

### System Prompt Generation

Gemini 3.0 Flash receives a detailed prompt engineering template:
- Character name and description
- Instructions to create verbose, detailed acting prompts
- Specific format requirements (vocal rhythm, slang, worldview, etc.)
- Output cleaning to remove wrapper text

### Error Handling

- **ElevenLabs Rate Limits**: Returns 429 with retry message
- **Invalid API Keys**: Returns 401 with configuration instructions
- **Duplicate Names**: Returns 409 conflict error
- **Voice Generation Failure**: Throws detailed error message
- **Database Operations**: Graceful fallbacks to default personas

## Configuration

### Required API Keys

Add to `backend/.env`:

```env
# ElevenLabs API Key (with Voice Design access)
ELEVENLABS_API_KEY=xi_your_key_here

# Google Cloud Project (for Gemini)
GCP_PROJECT_ID=your-project-id
GCP_REGION=us-central1
```

### ElevenLabs Requirements

- Account with Voice Design API access
- Sufficient quota for voice generation
- Voices count against your account limit

## Future Enhancements

### Planned Features
- 🎨 Voice previews before committing
- 🔄 Regenerate voice for existing persona
- 📊 Usage statistics per persona
- 🏷️ Tags/categories for organization
- 🔍 Search/filter personas
- 📤 Export/import persona packs
- 👥 Share personas with team

### Database Upgrades
- SQLite for better querying
- MongoDB for cloud deployments
- Redis caching for frequently used personas

### UI Improvements
- Drag-and-drop persona ordering
- Visual voice waveform previews
- Character portrait uploads
- Quick-edit persona descriptions

## Testing

Test the complete flow:

```bash
# 1. Start backend
cd backend
npm run dev

# 2. Start frontend
cd frontend
npm run dev

# 3. Open browser to Method Studio
# 4. Click "Manage Cast"
# 5. Create a test persona
# 6. Use it in a rehearsal
# 7. Delete it
```

## Troubleshooting

### "Failed to create persona"
- Check ElevenLabs API key is valid
- Ensure Voice Design API is enabled in your account
- Verify you haven't hit voice quota limits

### "Persona not appearing in dropdown"
- Check browser console for errors
- Verify `personas.json` was created in `backend/src/data/`
- Try refreshing the page

### Voice generation takes too long
- Normal: 15-30 seconds for first generation
- ElevenLabs Voice Design API is computationally intensive
- Consider caching/reusing voices for similar descriptions

## License

Part of Method AI Voice Actor project - see main LICENSE file.
