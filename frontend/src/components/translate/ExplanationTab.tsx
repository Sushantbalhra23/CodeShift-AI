import React from 'react';
import { ExplanationResponse } from '../../api/types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Cpu, AlertTriangle, BookOpen, Layers } from 'lucide-react';

interface ExplanationTabProps {
  explanation: ExplanationResponse | null;
  loading: boolean;
  error: string | null;
  onGenerateExplanation: () => void;
  onLoadDemoExplanation: () => void;
}

export const ExplanationTab: React.FC<ExplanationTabProps> = ({
  explanation,
  loading,
  error,
  onGenerateExplanation,
  onLoadDemoExplanation,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 rounded-xl border border-slate-800 bg-slate-900/60 text-center">
        <div className="w-9 h-9 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h4 className="text-sm font-semibold text-slate-100 mb-1">
          Analyzing Language Paradigm Shifts
        </h4>
        <p className="text-xs text-slate-400 max-w-sm font-mono">
          Evaluating type system mappings, memory management, exception handling, and runtime execution differences...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-rose-800/80 bg-rose-950/30 text-rose-200 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          <h4 className="text-sm font-semibold text-rose-300">Explanation Service Error</h4>
        </div>
        <p className="text-xs text-rose-300/80 leading-relaxed">{error}</p>
        <Button variant="secondary" size="sm" onClick={onLoadDemoExplanation}>
          Preview Demo Paradigm Analysis
        </Button>
      </div>
    );
  }

  if (!explanation) {
    return (
      <div className="p-12 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mb-4 border border-slate-700/60">
          <BookOpen className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200 mb-1">
          No Paradigm Explanation Generated Yet
        </h4>
        <p className="text-xs text-slate-400 max-w-md mb-5 leading-relaxed">
          Analyze deep conceptual shifts between Java and Python: type safety, garbage collection models, collections equivalence, and runtime edge cases.
        </p>
        <div className="flex items-center gap-2.5">
          <Button variant="primary" size="sm" onClick={onGenerateExplanation}>
            Analyze Paradigm Differences
          </Button>
          <Button variant="outline" size="sm" onClick={onLoadDemoExplanation}>
            Preview Demo Analysis
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* High-level Summary Card */}
      <div className="p-5 rounded-xl border border-cyan-900/50 bg-cyan-950/20 backdrop-blur relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-cyan-400">
            <Cpu className="w-4 h-4" />
            <h4 className="text-xs font-semibold uppercase tracking-wider">
              Executive Architectural Analysis
            </h4>
          </div>
          {explanation.is_demo && (
            <Badge variant="demo" size="sm">
              [Demo Dataset - Not Live Result]
            </Badge>
          )}
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">{explanation.summary}</p>
      </div>

      {/* Grid: Paradigm Differences */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2 font-mono">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Core Paradigm Shifts ({explanation.differences.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {explanation.differences.map((diff, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <Badge variant="purple" size="sm">
                    {diff.category}
                  </Badge>
                </div>

                <div className="space-y-2 mb-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-0.5">
                      Source Concept
                    </span>
                    <span className="text-slate-200 font-medium">{diff.source_concept}</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-800/60">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-500 block mb-0.5">
                      Target Mapping
                    </span>
                    <span className="text-cyan-300 font-medium">{diff.target_concept}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">{diff.explanation}</p>
              </div>

              {(diff.code_snippet_source || diff.code_snippet_target) && (
                <div className="pt-2 border-t border-slate-800/60 space-y-1.5 font-mono text-[11px]">
                  {diff.code_snippet_source && (
                    <div className="text-rose-400/90 bg-rose-950/20 px-2 py-1 rounded truncate">
                      - {diff.code_snippet_source}
                    </div>
                  )}
                  {diff.code_snippet_target && (
                    <div className="text-emerald-400/90 bg-emerald-950/20 px-2 py-1 rounded truncate">
                      + {diff.code_snippet_target}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Gotchas & Runtime Caveats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gotchas */}
        <div className="p-5 rounded-xl border border-amber-900/40 bg-amber-950/15 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <h4 className="text-xs font-semibold uppercase tracking-wider font-mono">
              Invariants & Behavioral Gotchas
            </h4>
          </div>
          <ul className="space-y-2.5">
            {explanation.gotchas_and_caveats.map((item, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2.5">
                <span className="text-amber-400 font-bold shrink-0 mt-0.5">&bull;</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Runtime Differences */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Cpu className="w-4 h-4" />
            <h4 className="text-xs font-semibold uppercase tracking-wider font-mono">
              Runtime & Execution Model
            </h4>
          </div>
          <ul className="space-y-2.5">
            {explanation.runtime_differences.map((item, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2.5">
                <span className="text-cyan-400 font-bold shrink-0 mt-0.5">&bull;</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
