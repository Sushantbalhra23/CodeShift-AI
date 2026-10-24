import axios from 'axios';
import { loadSettings } from './settingsService';

export const createApiClient = () => {
  const settings = loadSettings();
  // If running in Vite development with proxy, use relative '/api/v1', or fallback to settings.backendUrl
  const baseURL = window.location.port === '5173' ? '/api/v1' : `${settings.backendUrl.replace(/\/$/, '')}/api/v1`;

  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });

  return instance;
};

export const api = createApiClient();
