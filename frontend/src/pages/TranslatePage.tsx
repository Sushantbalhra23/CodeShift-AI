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
import { getApiErrorMessage } from '../services/apiClient';
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
  const [selectedStrategy, setSelectedStrategy] = useState<PromptStrategy>('baseline');
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
    setTranslationResult(null);
    setTranslatedCode('');
    try {
      const resp = await TranslationService.translate(
        sourceCode,
        sourceLanguage,
        targetLanguage,
        selectedStrategy
      );
      if (!resp?.translated_code) {
        setTranslateError('Translation service returned an empty result. No code was generated.');
        return;
      }
      setTranslationResult(resp);
      setTranslatedCode(resp.translated_code);
    } catch (e: unknown) {
      setTranslationResult(null);
      setTranslatedCode('');
      setTranslateError(
        getApiErrorMessage(
          e,
          'Cannot connect to FastAPI backend at http://localhost:8000. Start the backend and retry Translate.'
        )
      );
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
    <div className="space-y-6 animate-fade-in-up">
      {/* ═══ Top Workspace Toolbar ═══ */}
      <div
        className="p-5 rounded-2xl space-y-4"
        style={{
          background: 'rgba(7, 14, 32, 0.85)',
          border: '1px solid rgba(99,125,180,0.1)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Premium language pill toggles */}
          <div className="flex items-center gap-2">
            {/* Source language pill */}
            <div
              className="flex items-center rounded-xl overflow-hidden text-xs font-mono font-semibold"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(99,125,180,0.15)',
              }}
            >
              {(['java', 'python'] as SupportedLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setSourceLanguage(lang);
                    setTargetLanguage(lang === 'java' ? 'python' : 'java');
                  }}
                  className="px-3 py-1.5 transition-all duration-200 capitalize"
                  style={{
                    background: sourceLanguage === lang
                      ? 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.15))'
                      : 'transparent',
                    color: sourceLanguage === lang ? '#67e8f9' : '#64748b',
                    borderRight: lang === 'java' ? '1px solid rgba(99,125,180,0.1)' : 'none',
                  }}
                >
                  {lang === 'java' ? '☕ Java' : '🐍 Python'}
                </button>
              ))}
            </div>

            {/* Animated swap button */}
            <button
              onClick={handleSwapLanguages}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 group"
              title="Swap source and target languages"
              aria-label="Swap languages"
              style={{
                background: 'rgba(6,182,212,0.08)',
                border: '1px solid rgba(6,182,212,0.2)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 16px rgba(6,182,212,0.3)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(6,182,212,0.5)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(6,182,212,0.2)';
              }}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-180 transition-transform duration-300" />
            </button>

            {/* Target language pill */}
            <div
              className="flex items-center rounded-xl overflow-hidden text-xs font-mono font-semibold"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(99,125,180,0.15)',
              }}
            >
              {(['python', 'java'] as SupportedLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setTargetLanguage(lang);
                    setSourceLanguage(lang === 'java' ? 'python' : 'java');
                  }}
                  className="px-3 py-1.5 transition-all duration-200 capitalize"
                  style={{
                    background: targetLanguage === lang
                      ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.15))'
                      : 'transparent',
                    color: targetLanguage === lang ? '#6ee7b7' : '#64748b',
                    borderRight: lang === 'python' ? '1px solid rgba(99,125,180,0.1)' : 'none',
                  }}
                >
                  {lang === 'java' ? '☕ Java' : '🐍 Python'}
                </button>
              ))}
            </div>

            {/* Language direction indicator */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-mono"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <span className="text-cyan-400 capitalize">{sourceLanguage}</span>
              <ArrowLeftRight className="w-3 h-3 text-slate-600" />
              <span className="text-emerald-400 capitalize">{targetLanguage}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'split' ? 'diff' : 'split')}
              icon={<GitCompare className="w-3.5 h-3.5" />}
            >
              {viewMode === 'split' ? 'Diff View' : 'Split View'}
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
        <div className="pt-3 border-t border-white/[0.05]">
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
        {/* Premium tab navigation */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl"
          style={{
            background: 'rgba(7,14,32,0.7)',
            border: '1px solid rgba(99,125,180,0.08)',
          }}
        >
          {[
            { id: 'translation' as const, label: 'Translation Studio', icon: Sparkles, color: '#06b6d4' },
            { id: 'explanation' as const, label: 'Paradigm Explain', icon: Cpu, color: '#8b5cf6' },
            { id: 'tests' as const, label: 'Generated Tests', icon: FileCode2, color: '#10b981' },
            { id: 'verification' as const, label: 'Self-Repair', icon: ShieldCheck, color: '#f59e0b' },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex-1 justify-center sm:flex-none sm:justify-start"
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${tab.color}22, ${tab.color}11)`
                    : 'transparent',
                  color: isActive ? tab.color : '#64748b',
                  border: isActive ? `1px solid ${tab.color}44` : '1px solid transparent',
                  boxShadow: isActive ? `0 0 12px ${tab.color}20` : 'none',
                }}
              >
                <TabIcon className="w-3.5 h-3.5" style={{ color: isActive ? tab.color : '#64748b' }} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
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
