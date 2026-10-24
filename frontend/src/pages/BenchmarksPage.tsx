import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { BenchmarkService } from '../services/benchmarkService';
import { TranslationResponse, BenchmarkStatsResponse } from '../api/types';
import { DEMO_BENCHMARK_HISTORY, DEMO_BENCHMARK_STATS } from '../data/demoData';
import {
  Download,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Database,
} from 'lucide-react';

export const BenchmarksPage: React.FC = () => {
  const [history, setHistory] = useState<TranslationResponse[]>(DEMO_BENCHMARK_HISTORY);
  const [stats, setStats] = useState<BenchmarkStatsResponse>(DEMO_BENCHMARK_STATS);
  const [isDemoData, setIsDemoData] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterStrategy, setFilterStrategy] = useState<string>('all');
  const [notice, setNotice] = useState<string | null>(null);

  const fetchLiveBenchmarks = async () => {
    setLoading(true);
    setNotice(null);
    try {
      const [liveHistory, liveStats] = await Promise.all([
        BenchmarkService.getHistory(50),
        BenchmarkService.getStats(),
      ]);

      if (liveHistory && liveHistory.length > 0) {
        setHistory(liveHistory);
        setStats(liveStats);
        setIsDemoData(false);
        setNotice(`Successfully connected! Loaded ${liveHistory.length} live records from SQLite database.`);
      } else {
        setNotice('Connected to FastAPI database, but no live translation runs have been recorded yet. Displaying demo dataset.');
      }
    } catch (e: any) {
      setNotice('FastAPI backend offline (port 8000). Displaying demo benchmark dataset with explicit preview labels.');
      setIsDemoData(true);
      setHistory(DEMO_BENCHMARK_HISTORY);
      setStats(DEMO_BENCHMARK_STATS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveBenchmarks();
  }, []);

  const filteredHistory = history.filter((item) => {
    if (filterStrategy === 'all') return true;
    return item.metadata.strategy === filterStrategy;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Source_Lang', 'Target_Lang', 'Strategy', 'Prompt_Version', 'Model', 'Latency_ms', 'Tokens', 'AST_Valid', 'Timestamp'];
    const rows = filteredHistory.map((item) => [
      item.id || 'N/A',
      item.source_language,
      item.target_language,
      item.metadata.strategy,
      item.metadata.prompt_version,
      item.metadata.model,
      item.metadata.latency_ms,
      item.metadata.total_tokens,
      item.metadata.ast_valid ? 'VALID' : 'INVALID',
      item.created_at,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `codeshift_benchmarks_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ stats, history: filteredHistory }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `codeshift_benchmarks_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Banner & Dataset Status */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              Empirical Translation Benchmarks & Telemetry
            </h2>
            {isDemoData ? (
              <Badge variant="demo" size="sm">
                [Demo Dataset Preview]
              </Badge>
            ) : (
              <Badge variant="emerald" size="sm" dot>
                Live SQLite Database
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Quantitatively compare AST validity, latency, and token consumption across prompting strategies. Filter results or export data for academic publications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLiveBenchmarks}
            loading={loading}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Live DB
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportJSON}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export JSON
          </Button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 text-xs text-slate-300 flex items-center justify-between font-mono">
          <span>{notice}</span>
          {isDemoData && (
            <span className="text-indigo-400 font-semibold">[Demo Data Badge Enforced]</span>
          )}
        </div>
      )}

      {/* Aggregate Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.strategies.map((st, idx) => (
          <Card key={idx} className="p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
                  {st.strategy.replace(/_/g, ' ')}
                </span>
                <Badge variant="slate" size="sm">
                  {st.total_runs} runs
                </Badge>
              </div>

              <div className="space-y-1.5 text-xs font-mono mb-3">
                <div className="flex justify-between text-slate-400">
                  <span>Avg Latency:</span>
                  <span className="text-slate-200 font-semibold">{st.avg_latency_ms} ms</span>
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
            </div>

            <div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${st.ast_pass_rate}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Benchmark History Log */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Individual Experiment Runs ({filteredHistory.length})
            </h3>
            {isDemoData && (
              <Badge variant="demo" size="sm">
                [Demo Records]
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 font-mono">Filter Strategy:</span>
            <select
              value={filterStrategy}
              onChange={(e) => setFilterStrategy(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs font-mono rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="all">All Strategies</option>
              <option value="zero_shot">Zero-Shot</option>
              <option value="few_shot">Few-Shot</option>
              <option value="chain_of_thought">Chain-of-Thought</option>
              <option value="role_expert">Role-Expert</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 shadow-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono text-[11px]">
                <th className="p-3 font-semibold">ID</th>
                <th className="p-3 font-semibold">Direction</th>
                <th className="p-3 font-semibold">Strategy</th>
                <th className="p-3 font-semibold">Prompt Version</th>
                <th className="p-3 font-semibold">Model</th>
                <th className="p-3 font-semibold">Latency</th>
                <th className="p-3 font-semibold">Tokens</th>
                <th className="p-3 font-semibold">AST Validity</th>
                <th className="p-3 font-semibold">Dataset Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition">
                  <td className="p-3 text-slate-500 font-bold">#{item.id}</td>
                  <td className="p-3 capitalize font-sans text-slate-200">
                    {item.source_language} &rarr; {item.target_language}
                  </td>
                  <td className="p-3 text-cyan-400 font-sans capitalize">
                    {item.metadata.strategy.replace(/_/g, ' ')}
                  </td>
                  <td className="p-3 text-slate-400">v{item.metadata.prompt_version}</td>
                  <td className="p-3 text-slate-300">{item.metadata.model}</td>
                  <td className="p-3 text-slate-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {item.metadata.latency_ms} ms
                  </td>
                  <td className="p-3 text-slate-300">{item.metadata.total_tokens}</td>
                  <td className="p-3">
                    {item.metadata.ast_valid ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Valid AST</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Syntax Error</span>
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {item.metadata.is_demo ? (
                      <Badge variant="demo" size="sm">
                        Demo
                      </Badge>
                    ) : (
                      <Badge variant="emerald" size="sm">
                        Live DB
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
