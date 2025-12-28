import express from 'express';
import { rewriteText, rewriteTextAsMethodActor, generateCharacterDialogue } from '../services/geminiService.js';

const router = express.Router();

// Method Actor endpoint - The core "perform" functionality
router.post('/perform', async (req, res) => {
  try {
    const { text, personaKey } = req.body;
    
    if (!text || !personaKey) {
      return res.status(400).json({ 
        error: 'Missing required fields: text and personaKey' 
      });
    }
    
    // personaKey should be the full persona description
    const script = await rewriteTextAsMethodActor(text, personaKey);
    res.json({ script });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to perform text',
      message: error.message 
    });
  }
});

router.post('/rewrite', async (req, res) => {
  try {
    const { text, characterPrompt } = req.body;
    
    if (!text || !characterPrompt) {
      return res.status(400).json({ 
        error: 'Missing required fields: text and characterPrompt' 
      });
    }
    
    const rewrittenText = await rewriteText(text, characterPrompt);
    res.json({ rewrittenText });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to rewrite text',
      message: error.message 
    });
  }
});

router.post('/generate-dialogue', async (req, res) => {
  try {
    const { scenario, characterName, characterTraits } = req.body;
    
    if (!scenario || !characterName || !characterTraits) {
      return res.status(400).json({ 
        error: 'Missing required fields: scenario, characterName, and characterTraits' 
      });
    }
    
    const dialogue = await generateCharacterDialogue(scenario, characterName, characterTraits);
    res.json({ dialogue });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to generate dialogue',
      message: error.message 
    });
  }
});

export default router;
