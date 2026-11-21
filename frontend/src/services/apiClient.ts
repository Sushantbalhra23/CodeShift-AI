import axios, { AxiosError } from 'axios';
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

type ApiErrorBody = {
  message?: string;
  details?: Array<{ field?: string; message?: string }> | string;
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorBody>;
    const data = axiosError.response?.data;
    if (data?.message) {
      if (Array.isArray(data.details) && data.details.length > 0) {
        const extra = data.details
          .map((item) => (item.field ? `${item.field}: ${item.message}` : item.message))
          .filter(Boolean);
        if (extra.length) {
          return `${data.message} (${extra.join('; ')})`;
        }
      }
      return data.message;
    }
    if (!axiosError.response) {
      return fallback;
    }
    return axiosError.message || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
