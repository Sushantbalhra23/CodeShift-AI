import React from 'react';
import { TestGenerationResponse } from '../../api/types';
import { CodeEditor } from '../editor/CodeEditor';
import { ShieldCheck, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface TestSynthesisViewProps {
  testResponse: TestGenerationResponse | null;
  loading: boolean;
  onGenerateTests: () => void;
  targetLanguage: 'java' | 'python';
}

export const TestSynthesisView: React.FC<TestSynthesisViewProps> = ({
  testResponse,
  loading,
  onGenerateTests,
  targetLanguage,
}) => {
  const [executing, setExecuting] = React.useState(false);
  const [executionResult, setExecutionResult] = React.useState<{
    success: boolean;
    stdout: string;
    stderr: string;
    status_message: string;
    sandboxed: boolean;
  } | null>(null);

  const handleRunExecution = async () => {
    if (!testResponse) return;
    setExecuting(true);
    setExecutionResult(null);
    try {
      const res = await axios.post('/api/v1/tests/execute', {
        code: testResponse.test_code,
        language: targetLanguage,
      });
      setExecutionResult(res.data);
    } catch (e: any) {
      setExecutionResult({
        success: false,
        stdout: '',
        stderr: e.message || 'Execution error',
        status_message: 'Request failed.',
        sandboxed: false,
      });
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm text-slate-300">Synthesizing comprehensive unit test vectors & assertions...</p>
      </div>
    );
  }

  if (!testResponse) {
    return (
      <div className="flex flex-col items-center justify-center p-16 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 text-center">
        <ShieldCheck className="w-10 h-10 text-slate-600 mb-3" />
        <h4 className="text-sm font-semibold text-slate-300 mb-1">No Unit Tests Synthesized Yet</h4>
        <p className="text-xs text-slate-500 max-w-md mb-4">
          Generate target language unit tests ({targetLanguage === 'python' ? 'pytest' : 'JUnit 5'}) to empirically verify semantic behavior.
        </p>
        <button
          onClick={onGenerateTests}
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition shadow-lg shadow-cyan-600/20"
        >
          Synthesize Verification Tests
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Test cases vector cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Concrete Test Vectors ({testResponse.test_cases.length})</span>
          </h3>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800">
              Framework: {testResponse.test_framework}
            </span>
            <button
              onClick={handleRunExecution}
              disabled={executing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium transition shadow-md shadow-emerald-600/20"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{executing ? 'Evaluating...' : 'Run Safe Verification'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {testResponse.test_cases.map((tc, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-slate-200">{tc.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  Case #{idx + 1}
                </span>
              </div>
              {tc.description && <p className="text-xs text-slate-400">{tc.description}</p>}
              <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 text-[11px] font-mono space-y-1">
                <div className="text-slate-400">
                  <span className="text-cyan-400">Inputs:</span> {JSON.stringify(tc.input_values)}
                </div>
                <div className="text-slate-400">
                  <span className="text-emerald-400">Expected:</span> {JSON.stringify(tc.expected_output)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Execution Results Banner if available */}
      {executionResult && (
        <div
          className={`p-4 rounded-xl border ${
            executionResult.success
              ? 'border-emerald-800/80 bg-emerald-950/20'
              : 'border-rose-800/80 bg-rose-950/20'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {executionResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                Sandbox Execution Report
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{executionResult.status_message}</span>
          </div>

          <div className="bg-slate-950/90 rounded-lg p-3 border border-slate-800/90 font-mono text-xs text-slate-300">
            {executionResult.stdout && <div>{executionResult.stdout}</div>}
            {executionResult.stderr && (
              <div className="text-rose-400 mt-1">{executionResult.stderr}</div>
            )}
          </div>
        </div>
      )}

      {/* Test Code Editor */}
      <div>
        <CodeEditor
          title={`Generated ${testResponse.test_framework.toUpperCase()} Test Suite`}
          language={targetLanguage}
          value={testResponse.test_code}
          readOnly={true}
          height="380px"
          badge="Verified Test Code"
        />
      </div>
    </div>
  );
};
