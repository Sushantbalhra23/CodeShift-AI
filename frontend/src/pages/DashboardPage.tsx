import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  ArrowLeftRight,
  FlaskConical,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import { PROMPT_STRATEGY_DEFINITIONS } from '../data/demoData';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const metrics = [
    {
      title: 'Language Scope',
      value: 'Java ↔ Python',
      subtitle: 'Bidirectional transpilation',
      icon: ArrowLeftRight,
      color: 'text-cyan-400',
    },
    {
      title: 'Prompt Strategies',
      value: '5 Versioned',
      subtitle: 'Zero-shot, CoT, Role, Repair',
      icon: FlaskConical,
      color: 'text-purple-400',
    },
    {
      title: 'AST Verification',
      value: 'Host-Safe AST',
      subtitle: 'Zero arbitrary host execution',
      icon: ShieldCheck,
      color: 'text-emerald-400',
    },
    {
      title: 'Evaluation Invariant',
      value: 'Empirical Telemetry',
      subtitle: 'Syntactic, tokens & latency',
      icon: BarChart3,
      color: 'text-amber-400',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/30 p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <Badge variant="cyan" size="md">
              Academic Prompt Engineering Platform
            </Badge>
            <Badge variant="emerald" size="md" dot>
              System Operational
            </Badge>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            CodeShift AI — Cross-Language Translation & Evaluation Studio
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            A specialized research platform built to systematically benchmark prompt engineering techniques across Java and Python. Analyze semantic preservation, measure type paradigm shifts, synthesize unit tests, and test automated self-repair loops.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/translate')}
              icon={<ArrowLeftRight className="w-3.5 h-3.5" />}
            >
              Open Translate Workspace
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/experiments')}
              icon={<FlaskConical className="w-3.5 h-3.5" />}
            >
              Explore Prompt Strategies
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/benchmarks')}
              icon={<BarChart3 className="w-3.5 h-3.5" />}
            >
              View Benchmark Telemetry
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Card key={idx} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    {m.title}
                  </p>
                  <p className="text-lg font-bold text-slate-100 mt-1">{m.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{m.subtitle}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${m.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Architectural Workflow Diagram */}
      <Card
        title="CodeShift AI Execution Pipeline"
        subtitle="End-to-end flow from prompt template resolution to isolated verification"
        badge={<Badge variant="purple" size="sm">Architecture</Badge>}
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2 text-xs font-mono">
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1.5">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Source Input</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Java or Python source code input into Monaco Editor with boundary delimiter encapsulation.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1.5">
            <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
              <span className="w-5 h-5 rounded-full bg-purple-950 border border-purple-800 flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Prompt Strategy</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              YAML template retrieved by version (Zero-Shot, Few-Shot, CoT, Role-Expert) and rendered.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1.5">
            <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
              <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-800 flex items-center justify-center text-[10px]">
                3
              </span>
              <span>LLM Gateway</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Dispatched through backend multi-provider client (Gemini, OpenAI, or Mock provider).
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-[10px]">
                4
              </span>
              <span>AST Static Check</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Zero execution on host: parses abstract syntax tree with ast.parse or javalang to verify syntax.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-800 flex items-center justify-center text-[10px]">
                5
              </span>
              <span>Repair Loop</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              If AST syntax fails, diagnostic error feedback is injected for autonomous self-repair convergence.
            </p>
          </div>
        </div>
      </Card>

      {/* Prompt Strategy Taxonomy Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 tracking-tight">
              Evaluated Prompt Engineering Strategies
            </h3>
            <p className="text-xs text-slate-400">
              Comparative analysis of five versioned prompting paradigms implemented in CodeShift AI
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/experiments')}
          >
            Configure Experiments
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROMPT_STRATEGY_DEFINITIONS.map((strat) => (
            <Card
              key={strat.id}
              title={strat.name}
              badge={<Badge variant="cyan" size="sm">{strat.tag}</Badge>}
              className="flex flex-col justify-between"
            >
              <div className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {strat.description}
                </p>

                <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 text-xs font-mono space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    Academic Rationale:
                  </span>
                  <p className="text-slate-400 font-sans text-xs leading-relaxed">
                    {strat.academicRationale}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Version: v{strat.version}</span>
                <span>Temp: {strat.defaultTemperature}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
