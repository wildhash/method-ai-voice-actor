import express from 'express';
import {
  loadPersonas,
  createPersona,
  deletePersona,
  deleteVoiceFromElevenLabs
} from '../services/personaService.js';
import { PERSONAS } from '../config/personas.js';

const router = express.Router();

/**
 * GET /api/personas
 * Get all personas (both default and custom)
 */
router.get('/', async (req, res) => {
  try {
    // Load custom personas from database
    const customPersonas = loadPersonas();
    
    // Merge with default personas from frontend
    const allPersonas = {
      ...PERSONAS,
      ...customPersonas
    };
    
    res.json(allPersonas);
  } catch (error) {
    console.error('Error fetching personas:', error);
    res.status(500).json({
      error: 'Failed to fetch personas',
      message: error.message
    });
  }
});

/**
 * POST /api/personas/create
 * Create a new custom persona with AI-generated voice and system prompt
 * 
 * Body: {
 *   name: "Character Name",
 *   description: "Character vibe/description for voice and prompt generation"
 * }
 */
router.post('/create', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validation
    if (!name || !description) {
      return res.status(400).json({
        error: 'Missing required fields: name and description'
      });
    }
    
    if (name.trim().length < 2) {
      return res.status(400).json({
        error: 'Name must be at least 2 characters long'
      });
    }
    
    if (description.trim().length < 10) {
      return res.status(400).json({
        error: 'Description must be at least 10 characters long'
      });
    }
    
    // Create the persona (this will call Gemini + ElevenLabs)
    console.log(`Creating new persona: ${name}`);
    const newPersona = await createPersona(name.trim(), description.trim());
    
    res.status(201).json(newPersona);
  } catch (error) {
    console.error('Error creating persona:', error);
    
    // Provide specific error messages
    let statusCode = 500;
    let errorMessage = error.message;
    
    if (error.message.includes('already exists')) {
      statusCode = 409; // Conflict
    } else if (error.message.includes('Invalid') || error.message.includes('not configured')) {
      statusCode = 400; // Bad request
    } else if (error.message.includes('rate limit')) {
      statusCode = 429; // Too many requests
    }
    
    res.status(statusCode).json({
      error: 'Failed to create persona',
      message: errorMessage
    });
  }
});

/**
 * DELETE /api/personas/:id
 * Delete a custom persona and its associated voice
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        error: 'Persona ID is required'
      });
    }
    
    // Load persona to get voice ID before deletion
    const personas = loadPersonas();
    const persona = personas[id];
    
    if (!persona) {
      return res.status(404).json({
        error: 'Persona not found'
      });
    }
    
    // Prevent deletion of default personas
    if (!persona.isCustom) {
      return res.status(403).json({
        error: 'Cannot delete default personas'
      });
    }
    
    // Delete from ElevenLabs (best effort, don't fail if this fails)
    if (persona.elevenLabsVoiceId) {
      await deleteVoiceFromElevenLabs(persona.elevenLabsVoiceId);
    }
    
    // Delete from database
    const deleted = deletePersona(id);
    
    if (deleted) {
      res.json({
        success: true,
        message: `Persona "${persona.label}" deleted successfully`
      });
    } else {
      res.status(404).json({
        error: 'Persona not found'
      });
    }
  } catch (error) {
    console.error('Error deleting persona:', error);
    res.status(500).json({
      error: 'Failed to delete persona',
      message: error.message
    });
  }
});

export default router;
