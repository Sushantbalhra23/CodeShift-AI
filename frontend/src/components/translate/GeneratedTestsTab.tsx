import React, { useState } from 'react';
import { TestGenerationResponse, SupportedLanguage, SandboxExecutionResponse } from '../../api/types';
import { MonacoCodeEditor } from '../editor/MonacoCodeEditor';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Play, CheckCircle2, AlertCircle, FileCode2 } from 'lucide-react';
import { TranslationService } from '../../services/translationService';

interface GeneratedTestsTabProps {
  testResponse: TestGenerationResponse | null;
  loading: boolean;
  error: string | null;
  targetLanguage: SupportedLanguage;
  onGenerateTests: () => void;
  onLoadDemoTests: () => void;
}

export const GeneratedTestsTab: React.FC<GeneratedTestsTabProps> = ({
  testResponse,
  loading,
  error,
  targetLanguage,
  onGenerateTests,
  onLoadDemoTests,
}) => {
  const [executing, setExecuting] = useState(false);
  const [execResult, setExecResult] = useState<SandboxExecutionResponse | null>(null);
  const [execError, setExecError] = useState<string | null>(null);

  const handleRunExecution = async () => {
    if (!testResponse) return;
    setExecuting(true);
    setExecResult(null);
    setExecError(null);
    try {
      const res = await TranslationService.executeCodeSafely(
        testResponse.test_code,
        targetLanguage
      );
      setExecResult(res);
    } catch (e: any) {
      setExecError(
        e.response?.data?.message || e.message || 'Cannot reach isolated execution sandbox.'
      );
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 rounded-xl border border-slate-800 bg-slate-900/60 text-center">
        <div className="w-9 h-9 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h4 className="text-sm font-semibold text-slate-100 mb-1">
          Synthesizing Target Unit Tests
        </h4>
        <p className="text-xs text-slate-400 max-w-sm font-mono">
          Generating concrete test assertions, boundary edge cases, and framework-specific unit tests ({targetLanguage === 'python' ? 'pytest' : 'JUnit 5'})...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-rose-800/80 bg-rose-950/30 text-rose-200 space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400" />
          <h4 className="text-sm font-semibold text-rose-300">Test Synthesis Error</h4>
        </div>
        <p className="text-xs text-rose-300/80 leading-relaxed">{error}</p>
        <Button variant="secondary" size="sm" onClick={onLoadDemoTests}>
          Preview Demo Synthesized Tests
        </Button>
      </div>
    );
  }

  if (!testResponse) {
    return (
      <div className="p-12 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mb-4 border border-slate-700/60">
          <FileCode2 className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200 mb-1">
          No Unit Tests Generated Yet
        </h4>
        <p className="text-xs text-slate-400 max-w-md mb-5 leading-relaxed">
          Synthesize idiomatic unit tests ({targetLanguage === 'python' ? 'pytest' : 'JUnit 5'}) to empirically verify that the translated code preserves original behavioral specifications.
        </p>
        <div className="flex items-center gap-2.5">
          <Button variant="primary" size="sm" onClick={onGenerateTests}>
            Synthesize Verification Tests
          </Button>
          <Button variant="outline" size="sm" onClick={onLoadDemoTests}>
            Preview Demo Test Suite
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Test Vectors Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Concrete Test Vectors ({testResponse.test_cases.length})
            </h3>
            {testResponse.is_demo && (
              <Badge variant="demo" size="sm">
                [Demo Data - Not Live Result]
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="cyan" size="md">
              Framework: {testResponse.test_framework}
            </Badge>

            <Button
              variant="primary"
              size="sm"
              loading={executing}
              onClick={handleRunExecution}
              icon={<Play className="w-3.5 h-3.5" />}
            >
              Run Safe AST Verification
            </Button>
          </div>
        </div>

        {/* Test vectors cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {testResponse.test_cases.map((tc, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-semibold text-slate-200 truncate">
                    {tc.name}
                  </span>
                  <Badge variant="slate" size="sm">
                    #{idx + 1}
                  </Badge>
                </div>
                {tc.description && (
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">{tc.description}</p>
                )}
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1">
                <div className="text-slate-400 truncate">
                  <span className="text-cyan-400 font-semibold">Inputs:</span>{' '}
                  {JSON.stringify(tc.input_values)}
                </div>
                <div className="text-slate-400 truncate">
                  <span className="text-emerald-400 font-semibold">Expected:</span>{' '}
                  {JSON.stringify(tc.expected_output)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Execution Results Banner */}
      {execError && (
        <div className="p-4 rounded-xl border border-rose-800 bg-rose-950/30 text-rose-300 text-xs flex items-start gap-2.5 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-200">Execution Error Notice:</p>
            <p className="mt-0.5">{execError}</p>
          </div>
        </div>
      )}

      {execResult && (
        <div
          className={`p-4 rounded-xl border ${
            execResult.success
              ? 'border-emerald-800/80 bg-emerald-950/20'
              : 'border-rose-800/80 bg-rose-950/20'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {execResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
                Safe Verification Report
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {execResult.status_message}
            </span>
          </div>

          <div className="bg-slate-950/90 rounded-lg p-3 border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
            {execResult.stdout && <div>{execResult.stdout}</div>}
            {execResult.stderr && (
              <div className="text-rose-400">{execResult.stderr}</div>
            )}
          </div>
        </div>
      )}

      {/* Monaco Test Code View */}
      <MonacoCodeEditor
        title={`Synthesized Test Suite (${testResponse.test_framework.toUpperCase()})`}
        language={targetLanguage}
        value={testResponse.test_code}
        readOnly={true}
        height="400px"
        badge={
          testResponse.is_demo ? (
            <Badge variant="demo" size="sm">
              [Demo Test Code]
            </Badge>
          ) : (
            <Badge variant="emerald" size="sm">
              Runnable Suite
            </Badge>
          )
        }
      />
    </div>
  );
};
