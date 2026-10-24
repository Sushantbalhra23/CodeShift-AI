import React, { useState } from 'react';
import { SupportedLanguage, RepairIterationResponse } from '../../api/types';
import { MonacoCodeEditor } from '../editor/MonacoCodeEditor';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { TranslationService } from '../../services/translationService';
import {
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Terminal,
} from 'lucide-react';

interface VerificationTabProps {
  sourceCode: string;
  currentCode: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  onApplyRepairedCode: (code: string) => void;
}

export const VerificationTab: React.FC<VerificationTabProps> = ({
  sourceCode,
  currentCode,
  sourceLanguage,
  targetLanguage,
  onApplyRepairedCode,
}) => {
  const [errorFeedback, setErrorFeedback] = useState<string>(
    'SyntaxError: line 4 - mismatched types or unhandled exception boundary.'
  );
  const [iteration, setIteration] = useState<number>(1);
  const [history, setHistory] = useState<RepairIterationResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [repairError, setRepairError] = useState<string | null>(null);

  const handleTriggerRepair = async () => {
    if (!currentCode) return;
    setLoading(true);
    setRepairError(null);
    try {
      const resp = await TranslationService.repairCode(
        sourceCode,
        currentCode,
        sourceLanguage,
        targetLanguage,
        errorFeedback,
        iteration
      );
      setHistory((prev) => [resp, ...prev]);
      setIteration((prev) => prev + 1);
      onApplyRepairedCode(resp.repaired_code);
    } catch (e: any) {
      setRepairError(
        e.response?.data?.message ||
          e.message ||
          'Failed to connect to backend repair service.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemoRepair = () => {
    const demoRepair: RepairIterationResponse = {
      iteration,
      repaired_code:
        targetLanguage === 'python'
          ? `from typing import List, Optional\n\nclass FixedProcessor:\n    @staticmethod\n    def process_data(items: Optional[List[int]]) -> List[int]:\n        if items is None:\n            return []\n        return [x * 2 for x in items if x is not None and x > 0]\n`
          : `import java.util.ArrayList;\nimport java.util.List;\n\npublic class FixedProcessor {\n    public static List<Integer> processData(List<Integer> items) {\n        List<Integer> res = new ArrayList<>();\n        if (items == null) return res;\n        for (Integer x : items) {\n            if (x != null && x > 0) res.add(x * 2);\n        }\n        return res;\n    }\n}\n`,
      explanation_of_fix:
        'Resolved unhandled None/null reference and added boundary guard identified in compiler trace.',
      is_ast_valid: true,
      converged: true,
      is_demo: true,
    };
    setHistory((prev) => [demoRepair, ...prev]);
    setIteration((prev) => prev + 1);
    onApplyRepairedCode(demoRepair.repaired_code);
  };

  return (
    <div className="space-y-6">
      {/* Host Safety Notice Card */}
      <div className="p-4 rounded-xl border border-amber-900/50 bg-amber-950/20 text-xs text-amber-200/90 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-300 font-mono uppercase tracking-wider">
            Host Execution Protection Policy
          </p>
          <p className="leading-relaxed">
            Arbitrary user-submitted code is never executed on the host system. Verification relies on safe static AST parsing (Python <code className="text-amber-300 font-mono">ast.parse</code> and Java <code className="text-amber-300 font-mono">javalang</code>), or resource-capped Docker sandboxes when enabled.
          </p>
        </div>
      </div>

      {/* Iterative Repair Control Center */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
              Closed-Loop Self-Repair Engine (Iteration #{iteration})
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadDemoRepair}
            >
              Preview Demo Repair
            </Button>

            <Button
              variant="primary"
              size="sm"
              loading={loading}
              onClick={handleTriggerRepair}
              disabled={!currentCode}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Synthesize Fix Patch
            </Button>
          </div>
        </div>

        <div>
          <label
            htmlFor="error-feedback"
            className="block text-xs font-medium text-slate-300 mb-1.5"
          >
            Diagnostic Error Feedback (Compiler Traces, AST Syntax Errors, Assertion Failures):
          </label>
          <textarea
            id="error-feedback"
            value={errorFeedback}
            onChange={(e) => setErrorFeedback(e.target.value)}
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-slate-600"
            placeholder="Paste syntax or compiler error trace here..."
          />
        </div>

        {repairError && (
          <div className="p-3 rounded-lg border border-rose-800 bg-rose-950/30 text-rose-300 text-xs font-mono">
            {repairError}
          </div>
        )}
      </div>

      {/* Timeline of repair iterations */}
      {history.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Repair Convergence Timeline ({history.length} iterations)</span>
          </h4>

          <div className="space-y-4">
            {history.map((rep, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center text-xs font-mono font-bold">
                      #{rep.iteration}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      Iteration Patch Report
                    </span>
                    {rep.is_demo && (
                      <Badge variant="demo" size="sm">
                        [Demo Data - Not Live Result]
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={rep.is_ast_valid ? 'emerald' : 'rose'}
                      size="sm"
                      dot={rep.is_ast_valid}
                    >
                      {rep.is_ast_valid ? 'AST Valid' : 'AST Syntax Error'}
                    </Badge>

                    <Badge
                      variant={rep.converged ? 'cyan' : 'amber'}
                      size="sm"
                    >
                      {rep.converged ? 'Converged' : 'Needs Repair'}
                    </Badge>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                  <span className="text-cyan-400 font-semibold font-mono">Diagnosis & Patch: </span>
                  {rep.explanation_of_fix}
                </div>

                <MonacoCodeEditor
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
