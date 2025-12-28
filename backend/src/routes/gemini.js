import express from 'express';
import { rewriteText, generateCharacterDialogue } from '../services/geminiService.js';

const router = express.Router();

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
