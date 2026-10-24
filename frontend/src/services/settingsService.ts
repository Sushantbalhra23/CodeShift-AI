import { AppSettings } from '../api/types';

const STORAGE_KEY = 'codeshift_ai_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  backendUrl: 'http://localhost:8000',
  defaultProvider: 'mock',
  geminiModel: 'gemini-2.5-flash',
  openaiModel: 'gpt-4o',
  allowDockerExecution: false,
  editorFontSize: 13,
  editorTabSize: 4,
  editorMinimap: false,
  editorWordWrap: true,
};

export const loadSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Failed to load settings from localStorage, using defaults.', e);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage:', e);
  }
};
