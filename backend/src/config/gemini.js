import { VertexAI } from '@google-cloud/vertexai';

// Initialize Vertex AI
const projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
const location = process.env.GCP_REGION || 'us-central1';

let vertexAI;
try {
  vertexAI = new VertexAI({ project: projectId, location: location });
} catch (error) {
  console.warn('Vertex AI initialization failed, will retry on first use:', error.message);
}

export const getVertexAIModel = (modelName = 'gemini-1.5-pro') => {
  if (!vertexAI) {
    vertexAI = new VertexAI({ project: projectId, location: location });
  }
  return vertexAI.getGenerativeModel({ model: modelName });
};

// Legacy export for backward compatibility
export const getGeminiModel = getVertexAIModel;

export default vertexAI;
