import {
  HealthResponse,
  TranslationResponse,
  ExplanationResponse,
  TestGenerationResponse,
  RepairIterationResponse,
  SandboxExecutionResponse,
  SupportedLanguage,
  PromptStrategy,
} from '../api/types';
import { api } from './apiClient';

export class TranslationService {
  /**
   * Health status of backend FastAPI server.
   */
  static async getHealth(): Promise<HealthResponse> {
    const { data } = await api.get<HealthResponse>('/health');
    return data;
  }

  /**
   * Translates code using a specified prompt engineering strategy.
   */
  static async translate(
    sourceCode: string,
    sourceLanguage: SupportedLanguage,
    targetLanguage: SupportedLanguage,
    strategy: PromptStrategy = 'zero_shot',
    temperature?: number
  ): Promise<TranslationResponse> {
    const { data } = await api.post<TranslationResponse>('/translate', {
      source_code: sourceCode,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      prompt_strategy: strategy,
      temperature,
    });
    return data;
  }

  /**
   * Runs multiple prompt engineering strategies concurrently on the same source code.
   */
  static async batchTranslate(
    sourceCode: string,
    sourceLanguage: SupportedLanguage,
    targetLanguage: SupportedLanguage,
    strategies: PromptStrategy[],
    temperature?: number
  ): Promise<{ results: TranslationResponse[] }> {
    const { data } = await api.post<{ results: TranslationResponse[] }>('/translate/batch', {
      source_code: sourceCode,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      strategies,
      temperature,
    });
    return data;
  }

  /**
   * Analyzes language paradigm shifts, type system mappings, and runtime invariants.
   */
  static async explainDifferences(
    sourceCode: string,
    translatedCode: string,
    sourceLanguage: SupportedLanguage,
    targetLanguage: SupportedLanguage
  ): Promise<ExplanationResponse> {
    const { data } = await api.post<ExplanationResponse>('/explain', {
      source_code: sourceCode,
      translated_code: translatedCode,
      source_language: sourceLanguage,
      target_language: targetLanguage,
    });
    return data;
  }

  /**
   * Synthesizes target language unit tests and assertion vectors.
   */
  static async generateTests(
    sourceCode: string,
    translatedCode: string,
    sourceLanguage: SupportedLanguage,
    targetLanguage: SupportedLanguage,
    numTests: number = 3
  ): Promise<TestGenerationResponse> {
    const { data } = await api.post<TestGenerationResponse>('/tests/generate', {
      source_code: sourceCode,
      translated_code: translatedCode,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      num_tests: numTests,
    });
    return data;
  }

  /**
   * Evaluates code safely through isolated Docker runner or host-safe static AST parser.
   */
  static async executeCodeSafely(
    code: string,
    language: SupportedLanguage
  ): Promise<SandboxExecutionResponse> {
    const { data } = await api.post<SandboxExecutionResponse>('/tests/execute', {
      code,
      language,
    });
    return data;
  }

  /**
   * Iteratively repairs broken code using compiler/AST error feedback.
   */
  static async repairCode(
    sourceCode: string,
    currentCode: string,
    sourceLanguage: SupportedLanguage,
    targetLanguage: SupportedLanguage,
    errorFeedback: string,
    iteration: number = 1
  ): Promise<RepairIterationResponse> {
    const { data } = await api.post<RepairIterationResponse>('/repair', {
      source_code: sourceCode,
      current_code: currentCode,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      error_feedback: errorFeedback,
      iteration,
    });
    return data;
  }
}
