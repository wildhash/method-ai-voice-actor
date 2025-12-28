# Method-AI Voice Actor

A Vertex AI-powered rehearsal engine that transforms dry text into vivid character performances using Google Cloud and ElevenLabs.

## 🎭 The Method AI Experience

**Method AI** is a "Rehearsal Engine" that takes dry text (documentation, scripts, manuals) and performs them in specific character personas. It uses:
- **Google Vertex AI (Gemini 1.5 Pro)** for intelligent script rewriting with method acting techniques
- **ElevenLabs** for premium voice synthesis and vocal performance
- **Google Cloud Run** for scalable deployment

## Features

- 🎭 **Method Actor Rewriting**: Transforms text into character-specific performances while maintaining factual accuracy
- 🎬 **Three Personas**: Noir Detective, SoCal Surfer, and 1920s News Anchor (easily extensible)
- 🗣️ **Voice Synthesis**: High-quality text-to-speech with ElevenLabs premium voices
- 🎨 **Three-Column Studio**: Intuitive interface - Script, Director's Chair, and Performance
- 🌐 **Modern Web Stack**: React frontend with Node.js/Express backend
- ☁️ **Cloud-Ready**: Designed for Google Cloud Run deployment

## Tech Stack

### Backend
- Node.js with Express
- **Google Vertex AI** with Gemini 1.5 Pro model
- ElevenLabs Text-to-Speech API
- CORS and environment variable support

### Frontend
- React with Vite
- React Router for navigation
- Axios for API calls
- ElevenLabs React SDK
- Modern CSS with responsive three-column layout

## Project Structure

```
method-ai-voice-actor/
├── backend/              # Node.js Express backend
│   ├── src/
│   │   ├── config/      # API configuration files
│   │   ├── routes/      # Express route handlers
│   │   ├── services/    # Business logic services
│   │   └── index.js     # Main server file
│   ├── .env.example     # Environment variables template
│   └── package.json
│
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service functions
│   │   └── App.jsx      # Main app component
│   ├── .env.example     # Environment variables template
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- **Google Cloud account** with Vertex AI API enabled
- **ElevenLabs API account**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/wildhash/method-ai-voice-actor.git
   cd method-ai-voice-actor
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```

   Edit `.env` and add your configuration:
   ```env
   PORT=3001
   
   # For Vertex AI (Method AI)
   GCP_PROJECT_ID=your_gcp_project_id
   GCP_REGION=us-central1
   
   # For ElevenLabs
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   
   # Legacy Gemini API (for Classic Studio)
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Authenticate with Google Cloud (for Vertex AI)**
   ```bash
   # Install gcloud CLI if not already installed
   # Then authenticate:
   gcloud auth application-default login
   
   # Set your project
   gcloud config set project YOUR_PROJECT_ID
   ```

4. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   ```

   Edit `.env` if needed:
   ```env
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on http://localhost:3001

2. **Start the frontend development server** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on http://localhost:5173

3. **Open your browser**
   Navigate to http://localhost:5173 to use the application

## API Endpoints

### Backend API

#### Health Check
- `GET /api/health` - Check if the server is running

#### Method AI (The Director)
- `POST /api/gemini/perform` - Transform text using Method Actor technique
  ```json
  {
    "text": "Your raw text here",
    "personaKey": "Full persona description including character traits, speech patterns, etc."
  }
  ```
  Returns:
  ```json
  {
    "script": "The rewritten text in character"
  }
  ```

#### Gemini AI (Classic Studio)
- `POST /api/gemini/rewrite` - Rewrite text in character voice
  ```json
  {
    "text": "Your text here",
    "characterPrompt": "Character description"
  }
  ```

- `POST /api/gemini/generate-dialogue` - Generate character dialogue
  ```json
  {
    "scenario": "Scene description",
    "characterName": "Character name",
    "characterTraits": "Character traits"
  }
  ```

#### Voice Synthesis
- `POST /api/voice/synthesize` - Convert text to speech
  ```json
  {
    "text": "Text to synthesize",
    "voiceId": "voice_id_from_elevenlabs"
  }
  ```

- `GET /api/voice/voices` - Get available voices

## Usage

### Method AI Studio (The Main Feature)

1. **Navigate to Method Studio** at http://localhost:5173/method
2. **The Three-Column Interface**:
   - **Left: The Script** - Paste your raw text (documentation, scripts, manuals)
   - **Center: The Director's Chair** - Select your persona and hit REHEARSE
   - **Right: The Performance** - View the rewritten text and play the audio
3. **Choose a Persona**:
   - **Gritty Noir Detective** - Cynical 1940s private eye
   - **SoCal Surfer** - Laid-back, enthusiastic beach dude
   - **1920s Transatlantic News Anchor** - Fast-talking, high-energy reporter
4. **Click REHEARSE**: The system will rewrite your text in character and generate audio
5. **Listen and Download**: Play the generated audio performance

### Classic Studio

1. **Navigate to Classic Studio** at http://localhost:5173/studio
2. **Choose a Mode**:
   - **Rewrite Text**: Transform existing text into a character voice
   - **Generate Dialogue**: Create new character dialogue from scratch
3. **Generate Content**: Use AI to create character-specific text
4. **Synthesize Speech**: Convert the text to audio with a selected voice
5. **Listen and Download**: Play the generated audio

## Development

### Adding New Personas

Personas are defined in `frontend/src/personas.js`. To add a new persona:

```javascript
export const PERSONAS = {
  // ... existing personas
  
  your_persona_key: {
    label: "Display Name for Your Persona",
    systemPrompt: "Detailed character description including speech patterns, vocabulary, tone, and any character-specific traits...",
    elevenLabsVoiceId: "voice_id_from_elevenlabs"
  }
};
```

**Finding ElevenLabs Voice IDs:**
1. Visit [ElevenLabs Voice Library](https://elevenlabs.io/voice-library)
2. Choose a voice that matches your persona
3. Copy the voice ID from the voice details

### Backend Development
```bash
cd backend
npm run dev  # Runs with nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Runs Vite dev server with HMR
```

### Building for Production

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm run preview  # Preview production build
```

## Deployment to Google Cloud

### Deploying to Cloud Run

1. **Enable Required APIs**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable aiplatform.googleapis.com
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   gcloud run deploy method-ai-backend \
     --source . \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars GCP_PROJECT_ID=YOUR_PROJECT_ID,GCP_REGION=us-central1,ELEVENLABS_API_KEY=YOUR_KEY
   ```

3. **Deploy Frontend**
   ```bash
   cd frontend
   npm run build
   gcloud run deploy method-ai-frontend \
     --source . \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars VITE_API_BASE_URL=https://your-backend-url/api
   ```

For detailed Cloud Run deployment instructions, see [Google Cloud Run Documentation](https://cloud.google.com/run/docs/quickstarts/build-and-deploy).

## API Keys

### Getting Google Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your backend `.env` file

### Getting ElevenLabs API Key
1. Sign up at [ElevenLabs](https://elevenlabs.io/)
2. Navigate to your profile settings
3. Copy your API key
4. Add it to your backend `.env` file

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.

