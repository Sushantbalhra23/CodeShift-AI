import {
  PromptStrategyDefinition,
  TranslationResponse,
  BenchmarkStatsResponse,
  ExplanationResponse,
  TestGenerationResponse,
} from '../api/types';

export const PROMPT_STRATEGY_DEFINITIONS: PromptStrategyDefinition[] = [
  {
    id: 'zero_shot',
    name: 'Zero-Shot Direct Translation',
    version: '1.0.0',
    tag: 'Baseline Capability',
    description: 'Direct code translation without in-context exemplars. Tests the intrinsic multilingual syntax modeling of the foundation LLM.',
    academicRationale: 'Establishes the experimental lower-bound baseline. Reveals whether the base LLM produces hallucinations in API mappings when unsupported by domain exemplars.',
    defaultTemperature: 0.1,
    maxTokens: 4096,
    yamlTemplatePreview: [
      'version: "1.0.0"',
      'task: "translation"',
      'strategy: "zero_shot"',
      'parameters:',
      '  temperature: 0.1',
      '  max_tokens: 4096',
      'system_prompt: |',
      '  You are an expert compiler and polyglot engineer.',
      '  Output ONLY the translated code in a target markdown block.',
      'user_template: |',
      '  Translate {source_language} to {target_language}:',
      '  ```{source_language}',
      '  {source_code}',
      '  ```',
    ].join('\n'),
  },
  {
    id: 'few_shot',
    name: 'Few-Shot In-Context Learning',
    version: '1.0.0',
    tag: 'Exemplar-Guided',
    description: 'Augments the user prompt with carefully curated bidirectional translation pairs covering idioms, null safety, and exception patterns.',
    academicRationale: 'Evaluates in-context alignment. Exemplars demonstrate target language idioms (e.g., Python list comprehensions instead of Java iterative loops).',
    defaultTemperature: 0.2,
    maxTokens: 4096,
    yamlTemplatePreview: [
      'version: "1.0.0"',
      'task: "translation"',
      'strategy: "few_shot"',
      'parameters:',
      '  temperature: 0.2',
      '  max_tokens: 4096',
      'system_prompt: |',
      '  Follow the idiomatic conversions demonstrated in the exemplars below.',
      'user_template: |',
      '  ### Example 1: Stream Filtering',
      '  ...',
      '  ### Example 2: Map Frequencies',
      '  ...',
      '  Translate:',
      '  ```{source_language}',
      '  {source_code}',
      '  ```',
    ].join('\n'),
  },
  {
    id: 'chain_of_thought',
    name: 'Chain-of-Thought (CoT)',
    version: '1.0.0',
    tag: 'Multi-Stage Reasoning',
    description: 'Decomposes translation into 4 explicit stages: State & Control Flow Analysis -> Type & Nullability Mapping -> Standard Library Equivalence -> Target Synthesis.',
    academicRationale: 'Tests whether intermediate symbolic reasoning reduces algorithmic translation errors and preserves memory model invariants.',
    defaultTemperature: 0.2,
    maxTokens: 4096,
    yamlTemplatePreview: [
      'version: "1.0.0"',
      'task: "translation"',
      'strategy: "chain_of_thought"',
      'parameters:',
      '  temperature: 0.2',
      'system_prompt: |',
      '  Step 1: Semantic & State Analysis',
      '  Step 2: Type System Mapping',
      '  Step 3: Standard Library Equivalence',
      '  Step 4: Target Synthesis',
      '  Format output strictly as JSON.',
    ].join('\n'),
  },
  {
    id: 'role_expert',
    name: 'Role-Prompted Expert Transpiler',
    version: '1.0.0',
    tag: 'Compiler Persona',
    description: 'Instructs the LLM to adopt the persona of a Principal Systems & Compiler Architect with 25+ years experience enforcing zero-defect invariants.',
    academicRationale: 'Evaluates the impact of persona conditioning on code defensiveness, strict typing annotations, and algorithmic performance retention.',
    defaultTemperature: 0.1,
    maxTokens: 4096,
    yamlTemplatePreview: [
      'version: "1.0.0"',
      'task: "translation"',
      'strategy: "role_expert"',
      'parameters:',
      '  temperature: 0.1',
      'system_prompt: |',
      '  You are a Principal Polyglot Compiler Architect.',
      '  Guarantee exact semantic equivalence and zero regression in asymptotic complexity.',
    ].join('\n'),
  },
  {
    id: 'iterative_repair',
    name: 'Closed-Loop Iterative Self-Repair',
    version: '1.0.0',
    tag: 'Diagnostic Repair',
    description: 'Feeds syntax errors, AST diagnostic exceptions, or test failure traces back into the prompt loop to achieve convergence.',
    academicRationale: 'Evaluates self-correction bounds, convergence speed, and whether automated feedback loops can resolve compiler errors autonomously.',
    defaultTemperature: 0.1,
    maxTokens: 4096,
    yamlTemplatePreview: [
      'version: "1.0.0"',
      'task: "repair"',
      'strategy: "iterative_repair"',
      'parameters:',
      '  temperature: 0.1',
      'system_prompt: |',
      '  Inspect the error diagnostics and synthesize a targeted patch.',
      '  Format output strictly as JSON.',
    ].join('\n'),
  },
];

export const DEMO_BENCHMARK_STATS: BenchmarkStatsResponse = {
  total_experiments: 28,
  strategies: [
    {
      strategy: 'zero_shot',
      total_runs: 8,
      avg_latency_ms: 382.4,
      total_tokens: 3120,
      valid_ast_count: 7,
      ast_pass_rate: 87.5,
    },
    {
      strategy: 'few_shot',
      total_runs: 8,
      avg_latency_ms: 541.2,
      total_tokens: 6840,
      valid_ast_count: 8,
      ast_pass_rate: 100.0,
    },
    {
      strategy: 'chain_of_thought',
      total_runs: 6,
      avg_latency_ms: 812.6,
      total_tokens: 8250,
      valid_ast_count: 6,
      ast_pass_rate: 100.0,
    },
    {
      strategy: 'role_expert',
      total_runs: 6,
      avg_latency_ms: 410.8,
      total_tokens: 4320,
      valid_ast_count: 6,
      ast_pass_rate: 100.0,
    },
  ],
};

export const DEMO_BENCHMARK_HISTORY: TranslationResponse[] = [
  {
    id: 101,
    source_language: 'java',
    target_language: 'python',
    source_code: 'public class Adder { public static int add(int a, int b) { return a + b; } }',
    translated_code: 'class Adder:\n    @staticmethod\n    def add(a: int, b: int) -> int:\n        return a + b\n',
    explanation: 'Simple static method translation with type hints.',
    metadata: {
      strategy: 'zero_shot',
      prompt_version: '1.0.0',
      model: 'mock-compiler-v1',
      provider: 'mock',
      latency_ms: 18.4,
      prompt_tokens: 24,
      completion_tokens: 22,
      total_tokens: 46,
      ast_valid: true,
      is_demo: true,
    },
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 102,
    source_language: 'java',
    target_language: 'python',
    source_code: 'public static List<Integer> doubleScores(List<Integer> list) { return list.stream().map(x -> x * 2).collect(Collectors.toList()); }',
    translated_code: 'from typing import List\n\ndef double_scores(numbers: List[int]) -> List[int]:\n    return [x * 2 for x in numbers]\n',
    explanation: 'Mapped Java Stream.map() pipeline directly to idiomatic Python list comprehension.',
    metadata: {
      strategy: 'few_shot',
      prompt_version: '1.0.0',
      model: 'mock-compiler-v1',
      provider: 'mock',
      latency_ms: 24.1,
      prompt_tokens: 95,
      completion_tokens: 38,
      total_tokens: 133,
      ast_valid: true,
      is_demo: true,
    },
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 103,
    source_language: 'python',
    target_language: 'java',
    source_code: 'def count_tokens(tokens: list[str]) -> dict[str, int]:\n    return {t: tokens.count(t) for t in set(tokens)}\n',
    translated_code: 'import java.util.*;\n\npublic class TokenUtils {\n    public static Map<String, Integer> countTokens(List<String> tokens) {\n        Map<String, Integer> map = new HashMap<>();\n        if (tokens == null) return map;\n        for (String t : tokens) map.put(t, map.getOrDefault(t, 0) + 1);\n        return map;\n    }\n}\n',
    explanation: 'Optimized quadratic Python comprehension count() into linear O(N) HashMap counter in Java.',
    metadata: {
      strategy: 'chain_of_thought',
      prompt_version: '1.0.0',
      model: 'mock-compiler-v1',
      provider: 'mock',
      latency_ms: 45.8,
      prompt_tokens: 184,
      completion_tokens: 88,
      total_tokens: 272,
      ast_valid: true,
      is_demo: true,
    },
    created_at: new Date(Date.now() - 10800000).toISOString(),
  },
];

export const DEMO_EXPLANATION: ExplanationResponse = {
  is_demo: true,
  summary: 'Translating between Java and Python involves moving between a statically-typed, nominal class system on the JVM and a dynamically-typed, duck-typed runtime on CPython.',
  differences: [
    {
      category: 'Type System',
      source_concept: 'Static compile-time checking with generic type erasure',
      target_concept: 'Runtime dynamic binding with optional PEP 484 type annotations',
      explanation: 'Java requires explicit type declarations for every variable and parameter. Python allows duck typing where behavior defines compatibility.',
      code_snippet_source: 'List<Integer> list = new ArrayList<>();',
      code_snippet_target: 'numbers: List[int] = []',
    },
    {
      category: 'Idiomatic Style',
      source_concept: 'Streams API and Collectors pipelines',
      target_concept: 'List comprehensions and generator expressions',
      explanation: 'Python idioms favor concise list comprehensions over method-chained functional streams.',
      code_snippet_source: 'scores.stream().filter(x -> x > 0).map(x -> x * 2).collect(Collectors.toList());',
      code_snippet_target: '[x * 2 for x in scores if x > 0]',
    },
    {
      category: 'Null & None Safety',
      source_concept: 'null references cause NullPointerException at runtime',
      target_concept: 'None singleton handled via explicit identity checks',
      explanation: 'Java methods commonly guard with if (obj == null); Python uses if obj is None: or truthy checks.',
      code_snippet_source: 'if (scores == null) return List.of();',
      code_snippet_target: 'if scores is None: return []',
    },
  ],
  gotchas_and_caveats: [
    'Integer Precision: Python 3 integers have arbitrary precision (no 32-bit overflow), whereas Java int overflows at 2^31 - 1.',
    'Pass-by-Value vs Object References: Both pass references by value, but Python mutable default parameters persist across calls.',
    'Equality Invariant: Java .equals() compares value, while == compares reference. Python == compares value, while is compares identity.',
  ],
  runtime_differences: [
    'Execution: Java bytecode runs JIT-compiled in the HotSpot JVM; Python bytecode runs interpreted in CPython with the GIL.',
    'Memory Management: JVM relies on generational garbage collectors (G1, ZGC); CPython relies primarily on reference counting with a cycle detector.',
  ],
};

export const DEMO_TESTS: TestGenerationResponse = {
  is_demo: true,
  target_language: 'python',
  test_framework: 'pytest',
  test_code: `import pytest
from score_processor import ScoreProcessor

def test_filter_and_double_positive_scores():
    raw = [45, 80, 92, 10, 65]
    result = ScoreProcessor.filter_and_double_scores(raw, 50)
    assert result == [160, 184, 130]

def test_filter_and_double_empty_list():
    assert ScoreProcessor.filter_and_double_scores([], 50) == []

def test_filter_and_double_none_guard():
    assert ScoreProcessor.filter_and_double_scores(None, 50) == []

def test_filter_and_double_with_internal_nones():
    raw = [100, None, 20]
    result = ScoreProcessor.filter_and_double_scores(raw, 50)
    assert result == [200]
`,
  test_cases: [
    {
      name: 'test_filter_and_double_positive_scores',
      description: 'Verifies numbers above threshold 50 are doubled in order.',
      input_values: { rawScores: [45, 80, 92, 10, 65], threshold: 50 },
      expected_output: [160, 184, 130],
    },
    {
      name: 'test_filter_and_double_empty_list',
      description: 'Boundary limit test: empty input collection returns empty list.',
      input_values: { rawScores: [], threshold: 50 },
      expected_output: [],
    },
    {
      name: 'test_filter_and_double_none_guard',
      description: 'Robustness test: None input returns safe empty list without raising TypeError.',
      input_values: { rawScores: null, threshold: 50 },
      expected_output: [],
    },
  ],
  explanation: 'Comprehensive pytest suite testing normal flow, threshold limits, empty input, and null boundary handling.',
};
