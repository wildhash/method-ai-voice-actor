import { VertexAI } from '@google-cloud/vertexai';

// Initialize Vertex AI with validation
const projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
const location = process.env.GCP_REGION || 'us-central1';

let vertexAI;

const initializeVertexAI = () => {
  if (!projectId) {
    throw new Error(
      'GCP_PROJECT_ID environment variable is required. ' +
      'Please set it in your .env file or run "gcloud config set project YOUR_PROJECT_ID"'
    );
  }
  
  if (!location) {
    throw new Error('GCP_REGION environment variable is required.');
  }
  
  return new VertexAI({ project: projectId, location: location });
};

export const getVertexAIModel = (modelName = 'gemini-3.0-flash', generationConfig = null) => {
  if (!vertexAI) {
    vertexAI = initializeVertexAI();
  }
  
  const modelConfig = { model: modelName };
  
  // Add generation config if provided, otherwise use defaults for gemini-3.0-flash
  if (generationConfig) {
    modelConfig.generationConfig = generationConfig;
  } else if (modelName === 'gemini-3.0-flash' || modelName === 'gemini-3.0-pro') {
    modelConfig.generationConfig = {
      maxOutputTokens: 2048,
      temperature: 0.9, // High temp = better "creative acting"
      topP: 0.95,
    };
  }
  
  return vertexAI.getGenerativeModel(modelConfig);
};

// Legacy export for backward compatibility
export const getGeminiModel = getVertexAIModel;

export default vertexAI;
