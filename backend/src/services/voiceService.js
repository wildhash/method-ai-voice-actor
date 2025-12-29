import { ElevenLabsClient } from 'elevenlabs';

// Default client using our API key
let defaultClient = null;

/**
 * Get ElevenLabs client - uses user's key if provided, otherwise our default
 */
const getClient = (userApiKey = null) => {
  if (userApiKey) {
    // Create a new client with user's API key
    return new ElevenLabsClient({ apiKey: userApiKey });
  }
  
  // Use default client
  if (!defaultClient) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey || apiKey === 'test_key') {
      throw new Error('ElevenLabs API key is not configured.');
    }
    defaultClient = new ElevenLabsClient({ apiKey });
  }
  
  return defaultClient;
};

/**
 * Convert text to speech
 * @param {string} text - Text to synthesize
 * @param {string} voiceId - ElevenLabs voice ID
 * @param {string} userApiKey - Optional user's own API key
 */
export const textToSpeech = async (text, voiceId = 'default', userApiKey = null) => {
  try {
    const client = getClient(userApiKey);
    const audio = await client.textToSpeech.convert(voiceId, {
      text,
      model_id: 'eleven_flash_v2_5',
    });
    
    return audio;
  } catch (error) {
    console.error('Error in ElevenLabs service:', error);
    throw error;
  }
};

/**
 * Get available voices
 * @param {string} userApiKey - Optional user's own API key
 */
export const getAvailableVoices = async (userApiKey = null) => {
  try {
    const client = getClient(userApiKey);
    const voices = await client.voices.getAll();
    return voices;
  } catch (error) {
    console.error('Error fetching voices:', error);
    throw error;
  }
};

// Legacy export for backward compatibility
export const getElevenLabsClient = () => getClient();

export default { textToSpeech, getAvailableVoices };
