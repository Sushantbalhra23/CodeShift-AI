import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { BenchmarkService } from '../services/benchmarkService';
import { TranslationResponse, BenchmarkStatsResponse } from '../api/types';
import { DEMO_BENCHMARK_HISTORY, DEMO_BENCHMARK_STATS } from '../data/demoData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Cell,
} from 'recharts';
import {
  Download,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Database,
  Code2,
} from 'lucide-react';

const strategyColors: Record<string, string> = {
  zero_shot: '#06b6d4',
  few_shot: '#3b82f6',
  chain_of_thought: '#8b5cf6',
  role_expert: '#10b981',
  iterative_repair: '#f59e0b',
  baseline: '#94a3b8',
};

// Custom tooltip for recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl px-4 py-3 text-xs font-mono"
        style={{
          background: 'rgba(7, 14, 32, 0.95)',
          border: '1px solid rgba(99,125,180,0.2)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}
      >
        <p className="text-slate-300 font-semibold mb-1">{label?.replace(/_/g, ' ')}</p>
        {payload.map((p: any, idx: number) => (
          <p key={idx} style={{ color: p.color }}>
            {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
            {p.name === 'AST Pass Rate' ? '%' : p.name === 'Avg Latency' ? ' ms' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

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
        setNotice(`Successfully connected! Loaded ${liveHistory.length} live records from SQLite.`);
      } else {
        setNotice('Connected to database — no live runs yet. Displaying demo dataset.');
      }
    } catch {
      setNotice('FastAPI backend offline (:8000). Displaying demo benchmark dataset.');
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

  const filteredHistory = history.filter((item) =>
    filterStrategy === 'all' ? true : item.metadata.strategy === filterStrategy
  );

  const handleExportCSV = () => {
    const headers = ['ID', 'Source_Lang', 'Target_Lang', 'Strategy', 'Prompt_Version', 'Model', 'Latency_ms', 'Tokens', 'AST_Valid', 'Timestamp'];
    const rows = filteredHistory.map((item) => [
      item.id || 'N/A', item.source_language, item.target_language,
      item.metadata.strategy, item.metadata.prompt_version, item.metadata.model,
      item.metadata.latency_ms, item.metadata.total_tokens,
      item.metadata.ast_valid ? 'VALID' : 'INVALID', item.created_at,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `codeshift_benchmarks_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ stats, history: filteredHistory }, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `codeshift_benchmarks_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Chart data
  const passRateData = stats.strategies.map((s) => ({
    name: s.strategy.replace(/_/g, ' '),
    'AST Pass Rate': s.ast_pass_rate,
    fill: strategyColors[s.strategy] || '#94a3b8',
  }));

  const latencyData = stats.strategies.map((s) => ({
    name: s.strategy.replace(/_/g, ' '),
    'Avg Latency': s.avg_latency_ms,
    fill: strategyColors[s.strategy] || '#94a3b8',
  }));

  const tokenData = stats.strategies.map((s) => ({
    name: s.strategy.replace(/_/g, ' '),
    'Total Tokens': s.total_tokens,
    fill: strategyColors[s.strategy] || '#94a3b8',
  }));

  const radarData = stats.strategies.map((s) => ({
    subject: s.strategy.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    'AST Rate': s.ast_pass_rate,
    'Speed Score': Math.max(0, 100 - s.avg_latency_ms / 10),
    'Efficiency': Math.max(0, 100 - s.total_tokens / 100),
  }));

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page header */}
      <div
        className="rounded-3xl p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
        style={{
          background: 'linear-gradient(135deg, rgba(5,12,30,0.95) 0%, rgba(8,15,38,0.9) 100%)',
          border: '1px solid rgba(99,125,180,0.12)',
        }}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">
              Empirical Translation Benchmarks
            </h2>
            {isDemoData ? (
              <Badge variant="demo" size="md">[Demo Dataset]</Badge>
            ) : (
              <Badge variant="emerald" size="md" dot pulse>Live SQLite DB</Badge>
            )}
          </div>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Quantitatively compare AST validity, latency, and token usage across prompting strategies.
            Filter results or export for academic publications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={fetchLiveBenchmarks} loading={loading} icon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh DB
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExportCSV} icon={<Download className="w-3.5 h-3.5" />}>
            CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExportJSON} icon={<Download className="w-3.5 h-3.5" />}>
            JSON
          </Button>
        </div>
      </div>

      {/* Notice banner */}
      {notice && (
        <div
          className="p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs font-mono"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(99,125,180,0.1)',
            color: 'rgba(148,163,184,0.8)',
          }}
        >
          <span>{notice}</span>
          {isDemoData && <Badge variant="demo" size="sm">[Demo Enforced]</Badge>}
        </div>
      )}

      {/* ═══ TOP STAT CARDS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.strategies.map((st, idx) => {
          const color = strategyColors[st.strategy] || '#94a3b8';
          return (
            <div
              key={idx}
              className="rounded-2xl p-4 transition-all duration-300"
              style={{
                background: 'rgba(7, 14, 32, 0.8)',
                border: '1px solid rgba(99,125,180,0.1)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
                  {st.strategy.replace(/_/g, ' ')}
                </span>
                <Badge variant="slate" size="sm">{st.total_runs} runs</Badge>
              </div>

              <div className="space-y-1.5 text-xs font-mono mb-3">
                <div className="flex justify-between text-slate-400">
                  <span>Avg Latency:</span>
                  <span className="text-slate-200 font-semibold">{st.avg_latency_ms} ms</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Tokens:</span>
                  <span className="text-slate-300">{st.total_tokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>AST Pass Rate:</span>
                  <span className="font-bold" style={{ color }}>{st.ast_pass_rate}%</span>
                </div>
              </div>

              {/* Animated progress bar */}
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
                  style={{ width: `${st.ast_pass_rate}%`, background: color }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ CHARTS ROW ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AST Pass Rate Chart */}
        <Card
          title="AST Pass Rate by Strategy"
          subtitle="Syntactic validity percentage across all runs"
          badge={<Badge variant="emerald" size="sm">Pass Rate</Badge>}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={passRateData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,125,180,0.08)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: 'rgba(99,125,180,0.1)' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="AST Pass Rate" radius={[6, 6, 0, 0]} maxBarSize={50}>
                {passRateData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Latency Comparison Chart */}
        <Card
          title="Average Latency per Strategy"
          subtitle="Translation response time in milliseconds"
          badge={<Badge variant="amber" size="sm">Latency</Badge>}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={latencyData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,125,180,0.08)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: 'rgba(99,125,180,0.1)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}ms`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="Avg Latency" radius={[6, 6, 0, 0]} maxBarSize={50}>
                {latencyData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Token Usage Chart */}
        <Card
          title="Total Token Consumption"
          subtitle="Cumulative tokens across all runs per strategy"
          badge={<Badge variant="blue" size="sm">Tokens</Badge>}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tokenData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,125,180,0.08)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: 'rgba(99,125,180,0.1)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="Total Tokens" radius={[6, 6, 0, 0]} maxBarSize={50}>
                {tokenData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Radar Chart */}
        <Card
          title="Multi-Metric Strategy Radar"
          subtitle="Composite view: AST rate, speed score, and efficiency"
          badge={<Badge variant="purple" size="sm">Radar</Badge>}
        >
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(99,125,180,0.12)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              />
              <Radar name="AST Rate" dataKey="AST Rate" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
              <Radar name="Speed" dataKey="Speed Score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} />
              <Radar name="Efficiency" dataKey="Efficiency" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ═══ HISTORY TABLE ═══ */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-cyan-500" />
            <h3 className="text-sm font-semibold text-slate-200 font-mono uppercase tracking-wide">
              Experiment Log ({filteredHistory.length} records)
            </h3>
            {isDemoData && <Badge variant="demo" size="sm">[Demo]</Badge>}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-500 font-mono">Strategy:</span>
            <select
              value={filterStrategy}
              onChange={(e) => setFilterStrategy(e.target.value)}
              className="rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none"
              style={{
                background: 'rgba(7,14,32,0.9)',
                border: '1px solid rgba(99,125,180,0.15)',
              }}
            >
              <option value="all">All Strategies</option>
              <option value="zero_shot">Zero-Shot</option>
              <option value="few_shot">Few-Shot</option>
              <option value="chain_of_thought">Chain-of-Thought</option>
              <option value="role_expert">Role-Expert</option>
            </select>
          </div>
        </div>

        <div
          className="overflow-x-auto rounded-2xl"
          style={{
            border: '1px solid rgba(99,125,180,0.1)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}
        >
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr
                className="text-[11px] font-mono text-slate-500"
                style={{
                  background: 'rgba(5,10,25,0.95)',
                  borderBottom: '1px solid rgba(99,125,180,0.08)',
                }}
              >
                {['ID', 'Direction', 'Strategy', 'Prompt Ver.', 'Model', 'Latency', 'Tokens', 'AST Status', 'Dataset'].map((h) => (
                  <th key={h} className="p-3.5 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item, idx) => {
                const sc = strategyColors[item.metadata.strategy] || '#94a3b8';
                return (
                  <tr
                    key={item.id ?? idx}
                    className="transition-all duration-150 group"
                    style={{
                      background: idx % 2 === 0 ? 'rgba(7,14,32,0.7)' : 'rgba(5,10,22,0.6)',
                      borderBottom: '1px solid rgba(99,125,180,0.05)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(6,182,212,0.04)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? 'rgba(7,14,32,0.7)' : 'rgba(5,10,22,0.6)';
                    }}
                  >
                    <td className="p-3.5 font-mono text-slate-600 font-bold">#{item.id ?? idx + 100}</td>
                    <td className="p-3.5 capitalize text-slate-200">
                      <span className="inline-flex items-center gap-1.5">
                        <Code2 className="w-3 h-3 text-slate-500" />
                        {item.source_language} → {item.target_language}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono capitalize" style={{ color: sc }}>
                      {item.metadata.strategy.replace(/_/g, ' ')}
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono">v{item.metadata.prompt_version}</td>
                    <td className="p-3.5 text-slate-400 font-mono">{item.metadata.model}</td>
                    <td className="p-3.5 text-slate-300 font-mono">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-600" />
                        {item.metadata.latency_ms} ms
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 font-mono">{item.metadata.total_tokens}</td>
                    <td className="p-3.5">
                      {item.metadata.ast_valid ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold font-mono text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Valid AST
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-rose-400 font-semibold font-mono text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Syntax Error
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {item.metadata.is_demo ? (
                        <Badge variant="demo" size="sm">Demo</Badge>
                      ) : (
                        <Badge variant="emerald" size="sm">Live DB</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
