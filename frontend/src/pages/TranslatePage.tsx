import React, { useState } from 'react';
import { SampleSelector } from '../components/translate/SampleSelector';
import { TranslationTab } from '../components/translate/TranslationTab';
import { ExplanationTab } from '../components/translate/ExplanationTab';
import { GeneratedTestsTab } from '../components/translate/GeneratedTestsTab';
import { VerificationTab } from '../components/translate/VerificationTab';
import { StrategySelector } from '../components/strategies/StrategySelector';
import { Button } from '../components/common/Button';
import {
  SupportedLanguage,
  PromptStrategy,
  TranslationResponse,
  ExplanationResponse,
  TestGenerationResponse,
} from '../api/types';
import { SAMPLE_PROGRAMS, SampleProgram } from '../data/samplePrograms';
import {
  DEMO_BENCHMARK_HISTORY,
  DEMO_EXPLANATION,
  DEMO_TESTS,
} from '../data/demoData';
import { TranslationService } from '../services/translationService';
import {
  ArrowLeftRight,
  Play,
  RotateCcw,
  Sparkles,
  GitCompare,
  Cpu,
  FileCode2,
  ShieldCheck,
} from 'lucide-react';

export const TranslatePage: React.FC = () => {
  // Tabs: 'translation' | 'explanation' | 'tests' | 'verification'
  const [activeTab, setActiveTab] = useState<'translation' | 'explanation' | 'tests' | 'verification'>(
    'translation'
  );

  // Languages & Code state
  const [sourceLanguage, setSourceLanguage] = useState<SupportedLanguage>('java');
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>('python');
  const [sourceCode, setSourceCode] = useState<string>(SAMPLE_PROGRAMS[0].javaCode);
  const [translatedCode, setTranslatedCode] = useState<string>('');

  // Strategy & View controls
  const [selectedStrategy, setSelectedStrategy] = useState<PromptStrategy>('zero_shot');
  const [viewMode, setViewMode] = useState<'split' | 'diff'>('split');

  // Translation execution states
  const [loadingTranslate, setLoadingTranslate] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [translationResult, setTranslationResult] = useState<TranslationResponse | null>(null);

  // Explanation states
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);

  // Test generation states
  const [loadingTests, setLoadingTests] = useState(false);
  const [testsError, setTestsError] = useState<string | null>(null);
  const [testResponse, setTestResponse] = useState<TestGenerationResponse | null>(null);

  // Handle language swap
  const handleSwapLanguages = () => {
    const nextSource = targetLanguage;
    const nextTarget = sourceLanguage;
    setSourceLanguage(nextSource);
    setTargetLanguage(nextTarget);

    // Swap editors or load corresponding sample if available
    const curSource = sourceCode;
    const curTarget = translatedCode;
    setSourceCode(curTarget || (nextSource === 'java' ? SAMPLE_PROGRAMS[0].javaCode : SAMPLE_PROGRAMS[0].pythonCode));
    setTranslatedCode(curSource);
    setTranslationResult(null);
  };

  // Handle sample selection
  const handleSelectSample = (sample: SampleProgram) => {
    if (sourceLanguage === 'java') {
      setSourceCode(sample.javaCode);
      setTranslatedCode('');
    } else {
      setSourceCode(sample.pythonCode);
      setTranslatedCode('');
    }
    setTranslationResult(null);
    setExplanation(null);
    setTestResponse(null);
    setTranslateError(null);
  };

  // Clear workspace
  const handleClear = () => {
    setSourceCode('');
    setTranslatedCode('');
    setTranslationResult(null);
    setExplanation(null);
    setTestResponse(null);
    setTranslateError(null);
    setExplainError(null);
    setTestsError(null);
  };

  // Execute Translation via typed API service
  const handleTranslate = async () => {
    if (!sourceCode || !sourceCode.trim()) {
      setTranslateError('Source code cannot be empty. Please enter or select a sample code snippet.');
      return;
    }

    setLoadingTranslate(true);
    setTranslateError(null);
    try {
      const resp = await TranslationService.translate(
        sourceCode,
        sourceLanguage,
        targetLanguage,
        selectedStrategy
      );
      setTranslationResult(resp);
      setTranslatedCode(resp.translated_code);
    } catch (e: any) {
      const msg =
        e.response?.data?.message ||
        e.message ||
        'Cannot connect to FastAPI backend at http://localhost:8000. Start backend server or click "Preview Demo Translation".';
      setTranslateError(msg);
    } finally {
      setLoadingTranslate(false);
    }
  };

  // Preview Demo Translation (Explicitly badged as Demo Data)
  const handleLoadDemoTranslation = () => {
    const demo = DEMO_BENCHMARK_HISTORY[0];
    const demoCode =
      targetLanguage === 'python'
        ? SAMPLE_PROGRAMS[0].pythonCode
        : SAMPLE_PROGRAMS[0].javaCode;

    setTranslatedCode(demoCode);
    setTranslationResult({
      ...demo,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      source_code: sourceCode,
      translated_code: demoCode,
      metadata: {
        ...demo.metadata,
        strategy: selectedStrategy,
        is_demo: true,
      },
    });
    setTranslateError(null);
  };

  // Generate Explanation
  const handleGenerateExplanation = async () => {
    if (!sourceCode) return;
    setLoadingExplain(true);
    setExplainError(null);
    try {
      const resp = await TranslationService.explainDifferences(
        sourceCode,
        translatedCode || sourceCode,
        sourceLanguage,
        targetLanguage
      );
      setExplanation(resp);
    } catch (e: any) {
      setExplainError(
        e.response?.data?.message ||
          e.message ||
          'Failed to connect to backend explanation service. Start the backend or use Demo Preview.'
      );
    } finally {
      setLoadingExplain(false);
    }
  };

  // Generate Tests
  const handleGenerateTests = async () => {
    if (!sourceCode) return;
    setLoadingTests(true);
    setTestsError(null);
    try {
      const resp = await TranslationService.generateTests(
        sourceCode,
        translatedCode || sourceCode,
        sourceLanguage,
        targetLanguage,
        3
      );
      setTestResponse(resp);
    } catch (e: any) {
      setTestsError(
        e.response?.data?.message ||
          e.message ||
          'Failed to connect to backend test generator. Start the backend or use Demo Preview.'
      );
    } finally {
      setLoadingTests(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Workspace Toolbar */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Language selector controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Source:
            </span>
            <select
              value={sourceLanguage}
              onChange={(e) => {
                const newSource = e.target.value as SupportedLanguage;
                setSourceLanguage(newSource);
                setTargetLanguage(newSource === 'java' ? 'python' : 'java');
              }}
              aria-label="Source Language"
              className="bg-slate-950 border border-slate-700 text-xs font-mono rounded-lg px-3 py-1.5 text-cyan-300 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="java">Java (OpenJDK)</option>
              <option value="python">Python (CPython)</option>
            </select>

            <button
              onClick={handleSwapLanguages}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Swap source and target languages"
              aria-label="Swap languages"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Target:
            </span>
            <select
              value={targetLanguage}
              onChange={(e) => {
                const newTarget = e.target.value as SupportedLanguage;
                setTargetLanguage(newTarget);
                setSourceLanguage(newTarget === 'java' ? 'python' : 'java');
              }}
              aria-label="Target Language"
              className="bg-slate-950 border border-slate-700 text-xs font-mono rounded-lg px-3 py-1.5 text-emerald-300 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="python">Python (CPython)</option>
              <option value="java">Java (OpenJDK)</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'split' ? 'diff' : 'split')}
              icon={<GitCompare className="w-3.5 h-3.5" />}
            >
              {viewMode === 'split' ? 'Diff View' : 'Split Panes'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleClear}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Clear
            </Button>

            <Button
              variant="primary"
              size="sm"
              loading={loadingTranslate}
              onClick={handleTranslate}
              icon={<Play className="w-3.5 h-3.5" />}
            >
              Translate
            </Button>
          </div>
        </div>

        {/* Sample programs loader */}
        <div className="pt-2 border-t border-slate-800/70">
          <SampleSelector
            onSelectSample={handleSelectSample}
            currentSourceLanguage={sourceLanguage}
          />
        </div>
      </div>

      {/* Strategy selector row */}
      <StrategySelector
        selectedStrategy={selectedStrategy}
        onSelectStrategy={setSelectedStrategy}
      />

      {/* Workspace Inspection Tabs */}
      <div className="space-y-4">
        {/* Tab navigation pills */}
        <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('translation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'translation'
                ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Translation Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('explanation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'explanation'
                ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Paradigm Explanation</span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'tests'
                ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Generated Tests</span>
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'verification'
                ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verification & Self-Repair</span>
          </button>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'translation' && (
          <TranslationTab
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            sourceCode={sourceCode}
            setSourceCode={setSourceCode}
            translatedCode={translatedCode}
            setTranslatedCode={setTranslatedCode}
            translationResult={translationResult}
            loading={loadingTranslate}
            error={translateError}
            viewMode={viewMode}
            onTranslateClick={handleTranslate}
            onLoadDemoTranslation={handleLoadDemoTranslation}
          />
        )}

        {activeTab === 'explanation' && (
          <ExplanationTab
            explanation={explanation}
            loading={loadingExplain}
            error={explainError}
            onGenerateExplanation={handleGenerateExplanation}
            onLoadDemoExplanation={() => setExplanation(DEMO_EXPLANATION)}
          />
        )}

        {activeTab === 'tests' && (
          <GeneratedTestsTab
            testResponse={testResponse}
            loading={loadingTests}
            error={testsError}
            targetLanguage={targetLanguage}
            onGenerateTests={handleGenerateTests}
            onLoadDemoTests={() => setTestResponse(DEMO_TESTS)}
          />
        )}

        {activeTab === 'verification' && (
          <VerificationTab
            sourceCode={sourceCode}
            currentCode={translatedCode}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            onApplyRepairedCode={(newCode) => {
              setTranslatedCode(newCode);
            }}
          />
        )}
      </div>
    </div>
  );
};
