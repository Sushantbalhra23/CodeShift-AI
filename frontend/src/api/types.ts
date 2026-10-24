export type SupportedLanguage = 'java' | 'python';

export type PromptStrategy = 
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
}

export interface TranslationResponse {
  id?: number;
  source_language: SupportedLanguage;
  target_language: SupportedLanguage;
  source_code: string;
  translated_code: string;
  explanation?: string | null;
  metadata: TranslationMetadata;
  created_at: string;
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
}

export interface RepairIterationResponse {
  iteration: number;
  repaired_code: string;
  explanation_of_fix: string;
  is_ast_valid: boolean;
  ast_error?: string | null;
  converged: boolean;
}

export interface HealthResponse {
  status: string;
  service: string;
  environment: string;
  default_provider: string;
  docker_execution_enabled: boolean;
}
