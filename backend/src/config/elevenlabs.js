import { ElevenLabsClient } from 'elevenlabs';

let elevenlabs = null;

export const getElevenLabsClient = () => {
  if (!elevenlabs) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey || apiKey === 'test_key') {
      throw new Error('ElevenLabs API key is not configured. Please set ELEVENLABS_API_KEY environment variable.');
    }
    elevenlabs = new ElevenLabsClient({ apiKey });
  }
  return elevenlabs;
};

export default getElevenLabsClient;
