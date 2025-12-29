import express from 'express';
import { rewriteText, rewriteTextAsMethodActor, generateCharacterDialogue, chatWithPersona, generateScript } from '../services/geminiService.js';

const router = express.Router();

// Generate Script Endpoint
router.post('/generate-script', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        error: 'Missing required field: prompt' 
      });
    }
    
    const script = await generateScript(prompt);
    res.json({ script });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to generate script',
      message: error.message 
    });
  }
});

// Method Actor endpoint - The core "perform" functionality
router.post('/perform', async (req, res) => {
  try {
    const { text, personaKey } = req.body;
    
    if (!text || !personaKey) {
      return res.status(400).json({ 
        error: 'Missing required fields: text and personaKey' 
      });
    }
    
    // Always use flash model for performance
    const modelName = 'gemini-flash-latest';
    
    // personaKey should be the full persona description
    const script = await rewriteTextAsMethodActor(text, personaKey, modelName);
    res.json({ script });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to perform text',
      message: error.message 
    });
  }
});

// Interactive Chat Endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, personaKey, history } = req.body;
    
    if (!message || !personaKey) {
      return res.status(400).json({ 
        error: 'Missing required fields: message and personaKey' 
      });
    }
    
    const response = await chatWithPersona(message, personaKey, history || []);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to chat with persona',
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
