import React from 'react';
import { ExplanationResponse } from '../../api/types';
import { AlertTriangle, BookOpen, Cpu, Info } from 'lucide-react';

interface ExplanationViewProps {
  explanation: ExplanationResponse | null;
  loading: boolean;
  onExplainRequest: () => void;
}

export const ExplanationView: React.FC<ExplanationViewProps> = ({
  explanation,
  loading,
  onExplainRequest,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm text-slate-300">Deconstructing language paradigm differences & invariants...</p>
      </div>
    );
  }

  if (!explanation) {
    return (
      <div className="flex flex-col items-center justify-center p-16 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 text-center">
        <BookOpen className="w-10 h-10 text-slate-600 mb-3" />
        <h4 className="text-sm font-semibold text-slate-300 mb-1">No Paradigm Analysis Generated Yet</h4>
        <p className="text-xs text-slate-500 max-w-md mb-4">
          Click below to analyze type systems, memory models, runtime differences, and architectural gotchas.
        </p>
        <button
          onClick={onExplainRequest}
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition shadow-lg shadow-cyan-600/20"
        >
          Analyze Paradigm Shifts
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* High-level Summary Card */}
      <div className="p-4 rounded-xl border border-cyan-900/50 bg-cyan-950/20 backdrop-blur">
        <div className="flex items-center gap-2 mb-2 text-cyan-400">
          <Info className="w-4 h-4" />
          <h4 className="text-xs font-semibold uppercase tracking-wider">Executive Architectural Summary</h4>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">{explanation.summary}</p>
      </div>

      {/* Grid: Paradigm Differences */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Core Paradigm Shifts ({explanation.differences.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {explanation.differences.map((diff, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  {diff.category}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-0.5">Source Concept</span>
                  <span className="text-slate-200 font-medium">{diff.source_concept}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-0.5">Target Concept</span>
                  <span className="text-cyan-300 font-medium">{diff.target_concept}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{diff.explanation}</p>

              {(diff.code_snippet_source || diff.code_snippet_target) && (
                <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-1.5 font-mono text-[11px]">
                  {diff.code_snippet_source && (
                    <div className="text-rose-400/90 bg-rose-950/20 px-2 py-1 rounded">
                      - {diff.code_snippet_source}
                    </div>
                  )}
                  {diff.code_snippet_target && (
                    <div className="text-emerald-400/90 bg-emerald-950/20 px-2 py-1 rounded">
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
        <div className="p-4 rounded-xl border border-amber-900/40 bg-amber-950/10">
          <div className="flex items-center gap-2 mb-3 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <h4 className="text-xs font-semibold uppercase tracking-wider">Language Gotchas & Invariants</h4>
          </div>
          <ul className="space-y-2">
            {explanation.gotchas_and_caveats.map((item, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Runtime Differences */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2 mb-3 text-cyan-400">
            <Cpu className="w-4 h-4" />
            <h4 className="text-xs font-semibold uppercase tracking-wider">Runtime & Execution Model</h4>
          </div>
          <ul className="space-y-2">
            {explanation.runtime_differences.map((item, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
