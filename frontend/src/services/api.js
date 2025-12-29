import axios from 'axios';

// Use relative path so nginx can proxy to backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Storage key for user's ElevenLabs API key
const ELEVENLABS_KEY_STORAGE = 'elevenlabs_api_key';
const CLIENT_ID_STORAGE = 'method_ai_client_id';

// Generate or retrieve client ID for rate limiting
const getClientId = () => {
  let clientId = localStorage.getItem(CLIENT_ID_STORAGE);
  if (!clientId) {
    clientId = 'client_' + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem(CLIENT_ID_STORAGE, clientId);
  }
  return clientId;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include API key and client ID in requests
api.interceptors.request.use((config) => {
  const userApiKey = localStorage.getItem(ELEVENLABS_KEY_STORAGE);
  const clientId = getClientId();
  
  if (userApiKey) {
    config.headers['x-elevenlabs-key'] = userApiKey;
  }
  config.headers['x-client-id'] = clientId;
  
  return config;
});

// Helper functions for managing API key
export const setUserApiKey = (apiKey) => {
  if (apiKey) {
    localStorage.setItem(ELEVENLABS_KEY_STORAGE, apiKey);
  } else {
    localStorage.removeItem(ELEVENLABS_KEY_STORAGE);
  }
};

export const getUserApiKey = () => {
  return localStorage.getItem(ELEVENLABS_KEY_STORAGE);
};

export const hasUserApiKey = () => {
  return !!localStorage.getItem(ELEVENLABS_KEY_STORAGE);
};

export default api;
