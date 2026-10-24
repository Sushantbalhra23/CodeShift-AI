import { useEffect, useState } from 'react';
import { Navbar } from './components/common/Navbar';
import { CodeEditor } from './components/editor/CodeEditor';
import { DiffEditorView } from './components/editor/DiffEditorView';
import { StrategySelector } from './components/strategies/StrategySelector';
import { ExplanationView } from './components/explanation/ExplanationView';
import { TestSynthesisView } from './components/tests/TestSynthesisView';
import { IterativeRepairView } from './components/repair/IterativeRepairView';
import { BenchmarkDashboard } from './components/metrics/BenchmarkDashboard';
import {
  HealthResponse,
  TranslationResponse,
  ExplanationResponse,
  TestGenerationResponse,
  SupportedLanguage,
  PromptStrategy,
} from './api/types';
import {
  checkHealth,
  translateCode,
  batchTranslateCode,
  explainCodeDifference,
  generateTests,
} from './api/client';
import axios from 'axios';
import { Play, ArrowLeftRight, Layers } from 'lucide-react';

const SAMPLE_JAVA_CODE = `import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class DataTransformer {
    public static List<Integer> processScores(List<Integer> scores, int threshold) {
        if (scores == null) {
            return new ArrayList<>();
        }
        return scores.stream()
                     .filter(s -> s != null && s >= threshold)
                     .map(s -> s * 2)
                     .collect(Collectors.toList());
    }
}`;

const SAMPLE_PYTHON_CODE = `from typing import List, Optional

class DataTransformer:
    @staticmethod
    def process_scores(scores: Optional[List[Optional[int]]], threshold: int) -> List[int]:
        """Filters scores above threshold and doubles them."""
        if scores is None:
            return []
        return [s * 2 for s in scores if s is not None and s >= threshold]
`;

export function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>('translate');

  // Languages & Code state
  const [sourceLanguage, setSourceLanguage] = useState<SupportedLanguage>('java');
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>('python');
  const [sourceCode, setSourceCode] = useState<string>(SAMPLE_JAVA_CODE);
  const [translatedCode, setTranslatedCode] = useState<string>(SAMPLE_PYTHON_CODE);

  // Strategy & View controls
  const [selectedStrategy, setSelectedStrategy] = useState<PromptStrategy>('zero_shot');
  const [batchStrategies, setBatchStrategies] = useState<PromptStrategy[]>([
    'zero_shot',
    'few_shot',
    'chain_of_thought',
    'role_expert',
  ]);
  const [editorViewMode, setEditorViewMode] = useState<'split' | 'diff'>('split');

  // API Responses & Loading States
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [lastTranslation, setLastTranslation] = useState<TranslationResponse | null>(null);
  const [batchResults, setBatchResults] = useState<TranslationResponse[]>([]);
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [testResponse, setTestResponse] = useState<TestGenerationResponse | null>(null);
  const [history, setHistory] = useState<TranslationResponse[]>([]);
  const [stats, setStats] = useState<any>(null);

  const [loadingTranslate, setLoadingTranslate] = useState<boolean>(false);
  const [loadingBatch, setLoadingBatch] = useState<boolean>(false);
  const [loadingExplain, setLoadingExplain] = useState<boolean>(false);
  const [loadingTests, setLoadingTests] = useState<boolean>(false);

  // Initial load
  useEffect(() => {
    fetchHealthAndHistory();
  }, []);

  const fetchHealthAndHistory = async () => {
    try {
      const h = await checkHealth();
      setHealth(h);
      const histResp = await axios.get('/api/v1/benchmark/history');
      setHistory(histResp.data);
      const statsResp = await axios.get('/api/v1/benchmark/stats');
      setStats(statsResp.data);
    } catch (e) {
      console.error('Failed to load initial metadata:', e);
    }
  };

  const handleSwapLanguages = () => {
    const nextSource = targetLanguage;
    const nextTarget = sourceLanguage;
    setSourceLanguage(nextSource);
    setTargetLanguage(nextTarget);

    if (nextSource === 'java') {
      setSourceCode(SAMPLE_JAVA_CODE);
      setTranslatedCode(SAMPLE_PYTHON_CODE);
    } else {
      setSourceCode(SAMPLE_PYTHON_CODE);
      setTranslatedCode(SAMPLE_JAVA_CODE);
    }
  };

  const handleTranslateSingle = async () => {
    setLoadingTranslate(true);
    try {
      const resp = await translateCode(
        sourceCode,
        sourceLanguage,
        targetLanguage,
        selectedStrategy
      );
      setLastTranslation(resp);
      setTranslatedCode(resp.translated_code);
      fetchHealthAndHistory();
    } catch (e: any) {
      alert(`Translation failed: ${e.response?.data?.message || e.message}`);
    } finally {
      setLoadingTranslate(false);
    }
  };

  const handleTranslateBatch = async () => {
    setLoadingBatch(true);
    try {
      const resp = await batchTranslateCode(
        sourceCode,
        sourceLanguage,
        targetLanguage,
        batchStrategies
      );
      setBatchResults(resp.results);
      if (resp.results.length > 0) {
        setTranslatedCode(resp.results[0].translated_code);
        setLastTranslation(resp.results[0]);
      }
      setActiveTab('benchmark');
      fetchHealthAndHistory();
    } catch (e: any) {
      alert(`Batch translation failed: ${e.response?.data?.message || e.message}`);
    } finally {
      setLoadingBatch(false);
    }
  };

  const handleGenerateExplanation = async () => {
    setLoadingExplain(true);
    try {
      const resp = await explainCodeDifference(
        sourceCode,
        translatedCode,
        sourceLanguage,
        targetLanguage
      );
      setExplanation(resp);
    } catch (e: any) {
      alert(`Explanation failed: ${e.response?.data?.message || e.message}`);
    } finally {
      setLoadingExplain(false);
    }
  };

  const handleGenerateTests = async () => {
    setLoadingTests(true);
    try {
      const resp = await generateTests(
        sourceCode,
        translatedCode,
        sourceLanguage,
        targetLanguage,
        3
      );
      setTestResponse(resp);
    } catch (e: any) {
      alert(`Test generation failed: ${e.response?.data?.message || e.message}`);
    } finally {
      setLoadingTests(false);
    }
  };

  const handleToggleBatchStrategy = (strat: PromptStrategy) => {
    setBatchStrategies((prev) =>
      prev.includes(strat) ? prev.filter((s) => s !== strat) : [...prev, strat]
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar health={health} activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Translation Flow:
            </span>
            <span className="px-3 py-1 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono text-xs font-medium uppercase">
              {sourceLanguage}
            </span>
            <button
              onClick={handleSwapLanguages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Swap languages"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono text-xs font-medium uppercase">
              {targetLanguage}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditorViewMode(editorViewMode === 'split' ? 'diff' : 'split')}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-medium hover:bg-slate-700 text-slate-300 transition"
            >
              Mode: {editorViewMode === 'split' ? 'Split Panes' : 'Diff Editor'}
            </button>

            <button
              onClick={handleTranslateSingle}
              disabled={loadingTranslate}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-medium transition shadow-md shadow-cyan-600/25"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{loadingTranslate ? 'Translating...' : 'Translate'}</span>
            </button>

            <button
              onClick={handleTranslateBatch}
              disabled={loadingBatch}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-medium transition shadow-md shadow-indigo-600/25"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{loadingBatch ? 'Benchmarking...' : 'Run Benchmark'}</span>
            </button>
          </div>
        </div>

        {/* Strategy Selector (Shown on Translate Studio) */}
        {activeTab === 'translate' && (
          <StrategySelector
            selectedStrategy={selectedStrategy}
            onSelectStrategy={setSelectedStrategy}
          />
        )}

        {/* Active Tab Content */}
        {activeTab === 'translate' && (
          <div>
            {editorViewMode === 'split' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CodeEditor
                  title={`Source Code (${sourceLanguage.toUpperCase()})`}
                  language={sourceLanguage}
                  value={sourceCode}
                  onChange={setSourceCode}
                  height="500px"
                  badge="Original Input"
                />

                <CodeEditor
                  title={`Translated Code (${targetLanguage.toUpperCase()})`}
                  language={targetLanguage}
                  value={translatedCode}
                  onChange={setTranslatedCode}
                  height="500px"
                  badge={
                    lastTranslation?.metadata.ast_valid
                      ? 'AST Validated'
                      : lastTranslation
                      ? 'AST Error'
                      : 'Candidate'
                  }
                />
              </div>
            ) : (
              <DiffEditorView
                original={sourceCode}
                modified={translatedCode}
                originalLanguage={sourceLanguage}
                modifiedLanguage={targetLanguage}
                height="500px"
              />
            )}

            {/* Translation Metadata Bar */}
            {lastTranslation && (
              <div className="mt-4 p-3 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
                <div className="flex items-center gap-4">
                  <span>Strategy: <strong className="text-cyan-400">{lastTranslation.metadata.strategy}</strong></span>
                  <span>Model: <strong className="text-slate-200">{lastTranslation.metadata.model}</strong></span>
                  <span>Latency: <strong className="text-slate-200">{lastTranslation.metadata.latency_ms} ms</strong></span>
                  <span>Tokens: <strong className="text-slate-200">{lastTranslation.metadata.total_tokens}</strong></span>
                </div>
                <div>
                  Status:{' '}
                  {lastTranslation.metadata.ast_valid ? (
                    <span className="text-emerald-400 font-semibold">AST Syntactically Valid</span>
                  ) : (
                    <span className="text-rose-400 font-semibold">{lastTranslation.metadata.ast_error || 'Syntax Error'}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'benchmark' && (
          <div className="space-y-6">
            <StrategySelector
              selectedStrategy={selectedStrategy}
              onSelectStrategy={setSelectedStrategy}
              multiSelect={true}
              selectedStrategies={batchStrategies}
              onToggleStrategy={handleToggleBatchStrategy}
            />

            <BenchmarkDashboard
              batchResults={batchResults}
              history={history}
              stats={stats}
              onSelectRun={(run) => {
                setTranslatedCode(run.translated_code);
                setLastTranslation(run);
                setActiveTab('translate');
              }}
            />
          </div>
        )}

        {activeTab === 'explanation' && (
          <ExplanationView
            explanation={explanation}
            loading={loadingExplain}
            onExplainRequest={handleGenerateExplanation}
          />
        )}

        {activeTab === 'tests' && (
          <TestSynthesisView
            testResponse={testResponse}
            loading={loadingTests}
            onGenerateTests={handleGenerateTests}
            targetLanguage={targetLanguage}
          />
        )}

        {activeTab === 'repair' && (
          <IterativeRepairView
            sourceCode={sourceCode}
            currentCode={translatedCode}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            onCodeRepaired={(code) => {
              setTranslatedCode(code);
            }}
          />
        )}

        {activeTab === 'history' && (
          <BenchmarkDashboard
            batchResults={[]}
            history={history}
            stats={stats}
            onSelectRun={(run) => {
              setTranslatedCode(run.translated_code);
              setLastTranslation(run);
              setActiveTab('translate');
            }}
          />
        )}
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        CodeShift AI &bull; Academic Prompt Engineering & Code Translation Platform &bull; Safe Isolated Sandbox Mode
      </footer>
    </div>
  );
}

export default App;
