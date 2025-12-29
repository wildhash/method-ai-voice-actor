import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { getVertexAIModel } from '../config/gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to our persona database (simple JSON file)
const DB_FILE = path.join(__dirname, '../data/personas.json');

/**
 * Load all custom personas from the JSON database
 * @returns {Object} Personas object keyed by persona ID
 */
export const loadPersonas = () => {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(DB_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (!fs.existsSync(DB_FILE)) {
      // Initialize with empty object
      fs.writeFileSync(DB_FILE, JSON.stringify({}, null, 2));
      return {};
    }
    
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading personas:', error);
    return {};
  }
};

/**
 * Save a persona to the database
 * @param {Object} persona - The persona object to save
 */
export const savePersona = (persona) => {
  try {
    const personas = loadPersonas();
    personas[persona.id] = persona;
    fs.writeFileSync(DB_FILE, JSON.stringify(personas, null, 2));
  } catch (error) {
    console.error('Error saving persona:', error);
    throw error;
  }
};

/**
 * Delete a persona from the database
 * @param {string} personaId - The ID of the persona to delete
 * @returns {boolean} Success status
 */
export const deletePersona = (personaId) => {
  try {
    const personas = loadPersonas();
    if (personas[personaId]) {
      delete personas[personaId];
      fs.writeFileSync(DB_FILE, JSON.stringify(personas, null, 2));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting persona:', error);
    throw error;
  }
};

/**
 * Generate a detailed system prompt using Gemini
 * @param {string} name - Character name
 * @param {string} description - Character description/vibe
 * @returns {Promise<string>} The generated system prompt
 */
export const generateSystemPrompt = async (name, description) => {
  try {
    const model = getVertexAIModel('gemini-3.0-flash');
    
    const prompt = `You are a professional acting coach creating a detailed "Method Acting" system prompt for an AI voice actor.

Character Name: ${name}
Character Vibe/Description: ${description}

Create a VERBOSE, highly detailed system prompt (3-5 sentences minimum) that includes:
1. Who they are and their background
2. Their vocal rhythm and speech patterns
3. Specific vocabulary, slang, or catchphrases they use
4. References to their world/environment
5. Their philosophy or worldview

Make it rich and specific so a language model can fully embody this character.

IMPORTANT: Output ONLY the system prompt itself, starting with "You are". Do NOT include any preamble like "Here is the prompt:" or explanations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const systemPrompt = response.text().trim();
    
    // Clean up any potential wrapper text
    return systemPrompt.replace(/^(Here is|Here's).*?:\s*/i, '').trim();
  } catch (error) {
    console.error('Error generating system prompt:', error);
    // Fallback to a template if Gemini fails
    return `You are ${name}. Your character is described as: ${description}. Fully embody this persona in every word you speak. Use vocabulary, rhythm, and tone that matches this character perfectly.`;
  }
};

/**
 * Generate a custom voice using ElevenLabs Voice Design API
 * @param {string} name - Character name
 * @param {string} description - Voice description
 * @returns {Promise<string>} The generated voice ID
 */
export const generateVoice = async (name, description) => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY is not configured');
  }
  
  try {
    // Step 1: Generate voice preview using Voice Design API
    const designResponse = await axios.post(
      'https://api.elevenlabs.io/v1/text-to-voice/create-previews',
      {
        voice_description: description,
        text: `Hello, I am ${name}. This is a sample of my voice.`,
        model_id: 'eleven_multilingual_v2'
      },
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!designResponse.data.previews || designResponse.data.previews.length === 0) {
      throw new Error('No voice previews generated');
    }
    
    // Get the first preview's generated voice ID
    const previewVoiceId = designResponse.data.previews[0].generated_voice_id;
    const previewAudioBase64 = designResponse.data.previews[0].audio_base_64;
    
    // Step 2: Add the voice to the voice library permanently
    const addResponse = await axios.post(
      'https://api.elevenlabs.io/v1/voices/add',
      {
        name: name,
        description: description,
        files: [
          {
            file_name: `${name}_sample.mp3`,
            file_data: previewAudioBase64
          }
        ]
      },
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return addResponse.data.voice_id;
  } catch (error) {
    console.error('Error generating voice:', error.response?.data || error.message);
    
    // If voice design/add fails, we can fall back to an existing voice
    // or throw the error to let the user know
    if (error.response?.status === 401) {
      throw new Error('Invalid ElevenLabs API key');
    } else if (error.response?.status === 429) {
      throw new Error('ElevenLabs rate limit exceeded. Please try again later.');
    }
    
    throw new Error(`Failed to generate voice: ${error.message}`);
  }
};

/**
 * Create a new persona with AI-generated prompt and voice
 * @param {string} name - Character name
 * @param {string} description - Character description/vibe
 * @param {string} [voiceId] - Optional existing voice ID to use
 * @returns {Promise<Object>} The created persona object
 */
export const createPersona = async (name, description, voiceId = null) => {
  try {
    // Generate persona ID from name
    const personaId = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    
    // Check if persona already exists
    const existingPersonas = loadPersonas();
    if (existingPersonas[personaId]) {
      throw new Error(`Persona with name "${name}" already exists`);
    }
    
    // Step 1: Generate system prompt using Gemini
    console.log(`Generating system prompt for ${name}...`);
    const systemPrompt = await generateSystemPrompt(name, description);
    
    // Step 2: Handle Voice (Generate or Use Existing)
    let finalVoiceId = voiceId;
    
    if (!finalVoiceId) {
      console.log(`Generating voice for ${name}...`);
      finalVoiceId = await generateVoice(name, description);
    } else {
      console.log(`Using existing voice ID: ${finalVoiceId}`);
    }
    
    // Step 3: Create and save the persona
    const newPersona = {
      id: personaId,
      label: name,
      systemPrompt: systemPrompt,
      elevenLabsVoiceId: finalVoiceId,
      description: description,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    
    savePersona(newPersona);
    
    return newPersona;
  } catch (error) {
    console.error('Error creating persona:', error);
    throw error;
  }
};

/**
 * Delete a voice from ElevenLabs
 * @param {string} voiceId - The ElevenLabs voice ID to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteVoiceFromElevenLabs = async (voiceId) => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    console.warn('ELEVENLABS_API_KEY not configured, skipping voice deletion');
    return false;
  }
  
  try {
    await axios.delete(
      `https://api.elevenlabs.io/v1/voices/${voiceId}`,
      {
        headers: {
          'xi-api-key': apiKey
        }
      }
    );
    return true;
  } catch (error) {
    console.error('Error deleting voice from ElevenLabs:', error.response?.data || error.message);
    // Don't throw - we still want to delete from our database even if ElevenLabs fails
    return false;
  }
};
