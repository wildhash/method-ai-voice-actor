# Method-AI Voice Actor

A Gemini-powered rehearsal engine that rewrites and performs any text into distinct character voices using ElevenLabs, hosted on Google Cloud.

## Features

- 🎭 **Character Rewriting**: Use Google's Gemini AI to rewrite text in different character voices and styles
- 🗣️ **Voice Synthesis**: Convert text to speech with ElevenLabs' premium voice library
- 🎬 **Dialogue Generation**: Generate authentic character dialogue for any scenario
- 🌐 **Modern Web Interface**: Built with React and Node.js for a seamless experience

## Tech Stack

### Backend
- Node.js with Express
- Google Gemini AI API
- ElevenLabs Text-to-Speech API
- CORS and environment variable support

### Frontend
- React with Vite
- React Router for navigation
- Axios for API calls
- Modern CSS with responsive design

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
- Google Cloud account with Gemini API access
- ElevenLabs API account

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

   Edit `.env` and add your API keys:
   ```env
   PORT=3001
   GEMINI_API_KEY=your_gemini_api_key_here
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ```

3. **Set up the frontend**
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

#### Gemini AI
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

1. **Navigate to the Home Page**: See an overview of features
2. **Go to Studio**: Start creating character voices
3. **Choose a Mode**:
   - **Rewrite Text**: Transform existing text into a character voice
   - **Generate Dialogue**: Create new character dialogue from scratch
4. **Generate Content**: Use AI to create character-specific text
5. **Synthesize Speech**: Convert the text to audio with a selected voice
6. **Listen and Download**: Play the generated audio

## Development

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

(To be added: Instructions for deploying to Google Cloud Platform)

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

