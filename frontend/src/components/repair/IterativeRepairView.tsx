import React from 'react';
import { RepairIterationResponse } from '../../api/types';
import { CodeEditor } from '../editor/CodeEditor';
import { Sparkles, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { repairCode } from '../../api/client';

interface IterativeRepairViewProps {
  sourceCode: string;
  currentCode: string;
  sourceLanguage: 'java' | 'python';
  targetLanguage: 'java' | 'python';
  onCodeRepaired: (newCode: string) => void;
}

export const IterativeRepairView: React.FC<IterativeRepairViewProps> = ({
  sourceCode,
  currentCode,
  sourceLanguage,
  targetLanguage,
  onCodeRepaired,
}) => {
  const [errorFeedback, setErrorFeedback] = React.useState<string>(
    'SyntaxError: line 4 - mismatched types or unhandled exception'
  );
  const [iteration, setIteration] = React.useState<number>(1);
  const [history, setHistory] = React.useState<RepairIterationResponse[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleTriggerRepair = async () => {
    setLoading(true);
    try {
      const resp = await repairCode(
        sourceCode,
        currentCode,
        sourceLanguage,
        targetLanguage,
        errorFeedback,
        iteration
      );
      setHistory((prev) => [resp, ...prev]);
      setIteration((prev) => prev + 1);
      onCodeRepaired(resp.repaired_code);
    } catch (e: any) {
      alert(`Repair request failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Configuration Card */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Closed-Loop Self-Repair Engine (Iteration #{iteration})
            </h4>
          </div>

          <button
            onClick={handleTriggerRepair}
            disabled={loading || !currentCode}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-medium transition shadow-md shadow-cyan-600/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Synthesizing Fix...' : 'Run Repair Iteration'}</span>
          </button>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Diagnostic Error Feedback (Compiler Traces, AST Syntax Errors, Test Failures):
          </label>
          <textarea
            value={errorFeedback}
            onChange={(e) => setErrorFeedback(e.target.value)}
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            placeholder="Paste syntax or compiler error here..."
          />
        </div>
      </div>

      {/* Timeline of repair iterations */}
      {history.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Repair Convergence History ({history.length} iterations)
          </h4>

          <div className="space-y-3">
            {history.map((rep, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center text-xs font-mono font-bold">
                      #{rep.iteration}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      Iteration Fix Report
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        rep.is_ast_valid
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {rep.is_ast_valid ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>AST Valid</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3" />
                          <span>AST Invalid</span>
                        </>
                      )}
                    </span>

                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                        rep.converged
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {rep.converged ? 'Converged' : 'Needs Iteration'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-cyan-400 font-semibold">Diagnosis & Patch: </span>
                  {rep.explanation_of_fix}
                </div>

                <CodeEditor
                  title={`Repaired Candidate (Iteration #${rep.iteration})`}
                  language={targetLanguage}
                  value={rep.repaired_code}
                  readOnly={true}
                  height="220px"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
