import axios from 'axios';
import {
  HealthResponse,
  TranslationResponse,
  ExplanationResponse,
  TestGenerationResponse,
  RepairIterationResponse,
  SupportedLanguage,
  PromptStrategy,
} from './types';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

export const checkHealth = async (): Promise<HealthResponse> => {
  const { data } = await api.get<HealthResponse>('/health');
  return data;
};

export const translateCode = async (
  sourceCode: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage,
  strategy: PromptStrategy = 'zero_shot',
  temperature: number = 0.2
): Promise<TranslationResponse> => {
  const { data } = await api.post<TranslationResponse>('/translate', {
    source_code: sourceCode,
    source_language: sourceLanguage,
    target_language: targetLanguage,
    strategy,
    temperature,
  });
  return data;
};

export const batchTranslateCode = async (
  sourceCode: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage,
  strategies: PromptStrategy[],
  temperature: number = 0.2
): Promise<{ results: TranslationResponse[] }> => {
  const { data } = await api.post<{ results: TranslationResponse[] }>('/translate/batch', {
    source_code: sourceCode,
    source_language: sourceLanguage,
    target_language: targetLanguage,
    strategies,
    temperature,
  });
  return data;
};

export const explainCodeDifference = async (
  sourceCode: string,
  translatedCode: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage
): Promise<ExplanationResponse> => {
  const { data } = await api.post<ExplanationResponse>('/explain', {
    source_code: sourceCode,
    translated_code: translatedCode,
    source_language: sourceLanguage,
    target_language: targetLanguage,
  });
  return data;
};

export const generateTests = async (
  sourceCode: string,
  translatedCode: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage,
  numTests: number = 3
): Promise<TestGenerationResponse> => {
  const { data } = await api.post<TestGenerationResponse>('/tests/generate', {
    source_code: sourceCode,
    translated_code: translatedCode,
    source_language: sourceLanguage,
    target_language: targetLanguage,
    num_tests: numTests,
  });
  return data;
};

export const repairCode = async (
  sourceCode: string,
  currentCode: string,
  sourceLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage,
  errorFeedback: string,
  iteration: number = 1
): Promise<RepairIterationResponse> => {
  const { data } = await api.post<RepairIterationResponse>('/repair', {
    source_code: sourceCode,
    current_code: currentCode,
    source_language: sourceLanguage,
    target_language: targetLanguage,
    error_feedback: errorFeedback,
    iteration,
  });
  return data;
};

export default api;
