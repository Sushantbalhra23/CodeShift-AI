import React from 'react';
import { TranslationResponse } from '../../api/types';
import { Sparkles, Clock, CheckCircle2, AlertCircle, BarChart3, Database } from 'lucide-react';

interface BenchmarkDashboardProps {
  batchResults: TranslationResponse[];
  history: TranslationResponse[];
  stats: {
    total_experiments: number;
    strategies: Array<{
      strategy: string;
      total_runs: number;
      avg_latency_ms: number;
      total_tokens: number;
      valid_ast_count: number;
      ast_pass_rate: number;
    }>;
  } | null;
  onSelectRun?: (run: TranslationResponse) => void;
}

export const BenchmarkDashboard: React.FC<BenchmarkDashboardProps> = ({
  batchResults,
  history,
  stats,
  onSelectRun,
}) => {
  return (
    <div className="space-y-6">
      {/* Comparative Batch Results Matrix */}
      {batchResults.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Multi-Strategy Head-to-Head Comparison ({batchResults.length} Strategies)</span>
            </h3>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 shadow-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono text-[11px]">
                  <th className="p-3 font-semibold">Strategy</th>
                  <th className="p-3 font-semibold">Prompt Version</th>
                  <th className="p-3 font-semibold">Model</th>
                  <th className="p-3 font-semibold">Latency</th>
                  <th className="p-3 font-semibold">Total Tokens</th>
                  <th className="p-3 font-semibold">AST Validity</th>
                  <th className="p-3 font-semibold">Lines of Code</th>
                  <th className="p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {batchResults.map((res, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition">
                    <td className="p-3 font-sans font-medium text-slate-200">
                      <span className="capitalize">{res.metadata.strategy.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="p-3 text-cyan-400">v{res.metadata.prompt_version}</td>
                    <td className="p-3 text-slate-300">{res.metadata.model}</td>
                    <td className="p-3 text-slate-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {res.metadata.latency_ms} ms
                    </td>
                    <td className="p-3 text-slate-300">{res.metadata.total_tokens}</td>
                    <td className="p-3">
                      {res.metadata.ast_valid ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Valid</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400" title={res.metadata.ast_error || ''}>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Syntax Error</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-400">
                      {res.translated_code.split('\n').length} lines
                    </td>
                    <td className="p-3 font-sans">
                      {onSelectRun && (
                        <button
                          onClick={() => onSelectRun(res)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 text-xs transition"
                        >
                          Inspect Code
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Aggregate Empirical Statistics */}
      {stats && stats.strategies.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Cumulative Empirical Benchmarks ({stats.total_experiments} Total Experiment Runs)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.strategies.map((st, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    {st.strategy.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-mono text-cyan-400">{st.total_runs} runs</span>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Avg Latency:</span>
                    <span className="text-slate-200">{st.avg_latency_ms} ms</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Total Tokens:</span>
                    <span className="text-slate-200">{st.total_tokens}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>AST Pass Rate:</span>
                    <span className="text-emerald-400 font-bold">{st.ast_pass_rate}%</span>
                  </div>
                </div>

                {/* Mini progress bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${st.ast_pass_rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Persistent History Table */}
      {history.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Persistent SQLite History ({history.length} logged runs)</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono text-[11px]">
                  <th className="p-3">ID</th>
                  <th className="p-3">Direction</th>
                  <th className="p-3">Strategy</th>
                  <th className="p-3">Model</th>
                  <th className="p-3">Latency</th>
                  <th className="p-3">Tokens</th>
                  <th className="p-3">AST Status</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3 text-slate-500">#{h.id}</td>
                    <td className="p-3 capitalize font-sans text-slate-300">
                      {h.source_language} &rarr; {h.target_language}
                    </td>
                    <td className="p-3 text-cyan-400 capitalize font-sans">{h.metadata.strategy.replace(/_/g, ' ')}</td>
                    <td className="p-3 text-slate-400">{h.metadata.model}</td>
                    <td className="p-3 text-slate-400">{h.metadata.latency_ms} ms</td>
                    <td className="p-3 text-slate-400">{h.metadata.total_tokens}</td>
                    <td className="p-3">
                      {h.metadata.ast_valid ? (
                        <span className="text-emerald-400">Valid</span>
                      ) : (
                        <span className="text-rose-400">Invalid</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500 text-[10px]">
                      {h.created_at ? new Date(h.created_at).toLocaleTimeString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
