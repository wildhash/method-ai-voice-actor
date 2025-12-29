import express from 'express';
import { Readable } from 'stream';
import { textToSpeech, getAvailableVoices } from '../services/voiceService.js';
import { checkRateLimit, getRateLimitStatus, TIER_LIMITS } from '../services/rateLimitService.js';

const router = express.Router();

// Affiliate link for ElevenLabs
const ELEVENLABS_AFFILIATE_LINK = 'https://try.elevenlabs.io/ynnoa7cat7j9';

// Get rate limit status and affiliate info
router.get('/status', (req, res) => {
  const clientId = req.headers['x-client-id'] || req.ip;
  const apiKey = req.headers['x-elevenlabs-key'];
  
  const status = getRateLimitStatus(clientId, !!apiKey);
  
  res.json({
    ...status,
    affiliateLink: ELEVENLABS_AFFILIATE_LINK,
    message: status.tier === 'free' 
      ? `You have ${status.remaining} free requests left today. Get unlimited access with your own API key!`
      : 'Using your own API key - unlimited requests!'
  });
});

router.post('/synthesize', async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    const clientId = req.headers['x-client-id'] || req.ip;
    const userApiKey = req.headers['x-elevenlabs-key'];
    
    if (!text) {
      return res.status(400).json({ 
        error: 'Missing required field: text' 
      });
    }

    // Check rate limit for free tier users
    if (!userApiKey) {
      const { allowed, remaining, resetTime } = checkRateLimit(clientId);
      
      if (!allowed) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `Free tier limit reached. Get your own ElevenLabs API key for unlimited access!`,
          affiliateLink: ELEVENLABS_AFFILIATE_LINK,
          resetTime,
          upgradeMessage: 'Sign up through our link to support the project!'
        });
      }
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': resetTime.toString(),
        'X-RateLimit-Tier': 'free'
      });
    } else {
      res.set({ 'X-RateLimit-Tier': 'unlimited' });
    }
    
    // Use user's API key if provided, otherwise use ours
    const audio = await textToSpeech(text, voiceId, userApiKey);
    
    // Set appropriate headers for audio stream
    res.set({
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
    });
    
    // Handle different audio response formats from ElevenLabs SDK
    if (audio.pipe && typeof audio.pipe === 'function') {
      audio.pipe(res);
    } else if (audio instanceof Readable) {
      audio.pipe(res);
    } else if (audio[Symbol.asyncIterator]) {
      for await (const chunk of audio) {
        res.write(chunk);
      }
      res.end();
    } else if (Buffer.isBuffer(audio)) {
      res.send(audio);
    } else {
      const chunks = [];
      for await (const chunk of audio) {
        chunks.push(chunk);
      }
      res.send(Buffer.concat(chunks));
    }
  } catch (error) {
    console.error('Voice synthesis error:', error);
    res.status(500).json({ 
      error: 'Failed to synthesize speech',
      message: error.message 
    });
  }
});

router.get('/voices', async (req, res) => {
  try {
    const userApiKey = req.headers['x-elevenlabs-key'];
    const result = await getAvailableVoices(userApiKey);
    
    if (result && result.voices && Array.isArray(result.voices)) {
      res.json(result);
    } else if (Array.isArray(result)) {
      res.json({ voices: result });
    } else {
      console.warn('Unexpected voice format:', result);
      res.json({ voices: [] });
    }
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch voices',
      message: error.message 
    });
  }
});

// Info endpoint about tiers
router.get('/tiers', (req, res) => {
  res.json({
    tiers: {
      free: {
        name: 'Free Tier',
        limit: TIER_LIMITS.FREE_DAILY_LIMIT,
        period: 'daily',
        description: 'Perfect for trying out Method AI'
      },
      unlimited: {
        name: 'Bring Your Own Key',
        limit: 'unlimited',
        description: 'Use your own ElevenLabs API key for unlimited access'
      }
    },
    affiliateLink: ELEVENLABS_AFFILIATE_LINK,
    affiliateMessage: 'Sign up through our link to support Method AI development!'
  });
});

export default router;
