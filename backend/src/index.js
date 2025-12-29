import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import geminiRoutes from './routes/gemini.js';
import voiceRoutes from './routes/voice.js';
import personaRoutes from './routes/personas.js';

dotenv.config();

// Validate required environment variables at startup
const validateEnv = () => {
  const required = ['GEMINI_API_KEY', 'ELEVENLABS_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Warning: Missing environment variables: ${missing.join(', ')}`);
    console.warn('   Some features may not work correctly.');
  }
  
  if (process.env.ELEVENLABS_API_KEY === 'test_key') {
    console.warn('⚠️  Warning: ELEVENLABS_API_KEY is set to test_key - voice synthesis will fail');
  }
};

validateEnv();

const app = express();
const PORT = process.env.PORT || 8080;

// CORS Configuration - allow Cloud Run frontend
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow all Cloud Run domains and localhost
    if (origin.includes('.run.app') || 
        origin.includes('localhost') || 
        origin.includes('127.0.0.1') ||
        process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-elevenlabs-key', 'x-client-id'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Method-AI Backend is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/gemini', geminiRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/personas', personaRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS not allowed' });
  }
  
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎭 Method-AI Backend running on port ${PORT}`);
});
