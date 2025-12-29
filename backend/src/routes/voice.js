import express from 'express';
import { Readable } from 'stream';
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
    
    // Handle different audio response formats from ElevenLabs SDK
    if (audio.pipe && typeof audio.pipe === 'function') {
      // Node.js stream
      audio.pipe(res);
    } else if (audio instanceof Readable) {
      audio.pipe(res);
    } else if (audio[Symbol.asyncIterator]) {
      // Async iterator (newer SDK versions)
      for await (const chunk of audio) {
        res.write(chunk);
      }
      res.end();
    } else if (Buffer.isBuffer(audio)) {
      // Buffer
      res.send(audio);
    } else {
      // Fallback - try to convert to buffer
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
    const result = await getAvailableVoices();
    // If result already has voices array (standard ElevenLabs response), return it directly
    if (result && result.voices && Array.isArray(result.voices)) {
      res.json(result);
    } else if (Array.isArray(result)) {
      // If it returns just an array
      res.json({ voices: result });
    } else {
      // Fallback or unexpected format
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

export default router;
