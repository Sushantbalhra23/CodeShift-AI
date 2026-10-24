import { BenchmarkStatsResponse, TranslationResponse } from '../api/types';
import { api } from './apiClient';

export class BenchmarkService {
  /**
   * Fetches translation experiment history from SQLite database.
   */
  static async getHistory(limit: number = 50, strategy?: string): Promise<TranslationResponse[]> {
    const params: Record<string, any> = { limit };
    if (strategy) params.strategy = strategy;

    const { data } = await api.get<TranslationResponse[]>('/benchmark/history', { params });
    return data;
  }

  /**
   * Fetches aggregate empirical statistics across all strategies.
   */
  static async getStats(): Promise<BenchmarkStatsResponse> {
    const { data } = await api.get<BenchmarkStatsResponse>('/benchmark/stats');
    return data;
  }

  /**
   * Clears benchmark run history.
   */
  static async clearHistory(): Promise<{ message: string }> {
    const { data } = await api.delete<{ message: string }>('/benchmark/clear');
    return data;
  }
}
