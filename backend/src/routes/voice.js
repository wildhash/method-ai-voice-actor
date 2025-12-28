import express from 'express';
import { textToSpeech, getAvailableVoices } from '../services/voiceService.js';

const router = express.Router();

router.post('/synthesize', async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        error: 'Missing required field: text' 
      });
    }
    
    const audio = await textToSpeech(text, voiceId);
    
    // Set appropriate headers for audio stream
    res.set({
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
    });
    
    // Stream the audio response
    audio.pipe(res);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to synthesize speech',
      message: error.message 
    });
  }
});

router.get('/voices', async (req, res) => {
  try {
    const voices = await getAvailableVoices();
    res.json({ voices });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch voices',
      message: error.message 
    });
  }
});

export default router;
