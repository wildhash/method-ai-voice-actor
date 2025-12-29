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
  
  // Check for placeholder values
  if (process.env.ELEVENLABS_API_KEY === 'test_key') {
    console.warn('⚠️  Warning: ELEVENLABS_API_KEY is set to test_key - voice synthesis will fail');
  }
};

validateEnv();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration - secure for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:80',
  'http://localhost',
  process.env.FRONTEND_URL,
  process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (allowedOrigins.some(allowed => origin.startsWith(allowed) || allowed === '*')) {
      return callback(null, true);
    }
    
    // In development, be more permissive
    if (process.env.NODE_ENV !== 'production') {
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

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint (used by Docker/Railway)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Method-AI Backend is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes
app.use('/api/gemini', geminiRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/personas', personaRoutes);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS not allowed' });
  }
  
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎭 Method-AI Backend is running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});
