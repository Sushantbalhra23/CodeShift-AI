export type SupportedLanguage = 'java' | 'python';

export type PromptStrategy =
  | 'baseline'
  | 'zero_shot'
  | 'few_shot'
  | 'chain_of_thought'
  | 'role_expert'
  | 'iterative_repair';

export interface TranslationMetadata {
  strategy: PromptStrategy;
  prompt_version: string;
  model: string;
  provider: string;
  latency_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  ast_valid: boolean;
  ast_error?: string | null;
  is_demo?: boolean;
}

export interface TranslationResponse {
  id?: number;
  source_language: SupportedLanguage;
  target_language: SupportedLanguage;
  source_code?: string;
  translated_code: string;
  explanation?: string | null;
  /** Assumptions made by the model during translation */
  assumptions?: string[];
  /** Semantic or runtime warnings about the translation */
  warnings?: string[];
  metadata: TranslationMetadata;
  created_at?: string;
}

export interface ParadigmDifference {
  category: string;
  source_concept: string;
  target_concept: string;
  explanation: string;
  code_snippet_source?: string | null;
  code_snippet_target?: string | null;
}

export interface ExplanationResponse {
  summary: string;
  differences: ParadigmDifference[];
  gotchas_and_caveats: string[];
  runtime_differences: string[];
  is_demo?: boolean;
}

export interface TestCase {
  name: string;
  description?: string;
  input_values: Record<string, any>;
  expected_output?: any;
}

export interface TestGenerationResponse {
  target_language: SupportedLanguage;
  test_framework: string;
  test_code: string;
  test_cases: TestCase[];
  explanation?: string | null;
  is_demo?: boolean;
}

export interface RepairIterationResponse {
  iteration: number;
  repaired_code: string;
  explanation_of_fix: string;
  is_ast_valid: boolean;
  ast_error?: string | null;
  converged: boolean;
  is_demo?: boolean;
}

export interface SandboxExecutionResponse {
  success: boolean;
  exit_code: number;
  stdout: string;
  stderr: string;
  execution_time_ms: number;
  sandboxed: boolean;
  status_message: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  environment: string;
  default_provider: string;
  docker_execution_enabled: boolean;
}

export interface BenchmarkStat {
  strategy: string;
  total_runs: number;
  avg_latency_ms: number;
  total_tokens: number;
  valid_ast_count: number;
  ast_pass_rate: number;
}

export interface BenchmarkStatsResponse {
  total_experiments: number;
  strategies: BenchmarkStat[];
}

export interface PromptStrategyDefinition {
  id: PromptStrategy;
  name: string;
  version: string;
  tag: string;
  description: string;
  academicRationale: string;
  defaultTemperature: number;
  maxTokens: number;
  yamlTemplatePreview: string;
}

export interface AppSettings {
  backendUrl: string;
  defaultProvider: 'mock' | 'gemini' | 'openai';
  geminiModel: string;
  openaiModel: string;
  allowDockerExecution: boolean;
  editorFontSize: number;
  editorTabSize: number;
  editorMinimap: boolean;
  editorWordWrap: boolean;
}
