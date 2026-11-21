import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { StatCounter } from '../components/common/StatCounter';
import {
  ArrowLeftRight,
  FlaskConical,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Code2,
  GitBranch,
  Layers,
  Shield,
  RefreshCw,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { PROMPT_STRATEGY_DEFINITIONS } from '../data/demoData';

// Pipeline step definitions
const pipelineSteps = [
  {
    num: '01',
    label: 'Source Input',
    desc: 'Java or Python code entered into Monaco Editor with boundary encapsulation.',
    color: 'from-cyan-500 to-blue-500',
    glow: 'rgba(6,182,212,0.3)',
    border: 'rgba(6,182,212,0.25)',
    textColor: 'text-cyan-400',
  },
  {
    num: '02',
    label: 'Strategy Select',
    desc: 'YAML template retrieved by version — Zero-Shot, Few-Shot, CoT, Role-Expert.',
    color: 'from-blue-500 to-indigo-500',
    glow: 'rgba(59,130,246,0.3)',
    border: 'rgba(59,130,246,0.25)',
    textColor: 'text-blue-400',
  },
  {
    num: '03',
    label: 'LLM Gateway',
    desc: 'Dispatched through multi-provider client — Gemini, OpenAI, or Mock.',
    color: 'from-purple-500 to-violet-500',
    glow: 'rgba(139,92,246,0.3)',
    border: 'rgba(139,92,246,0.25)',
    textColor: 'text-purple-400',
  },
  {
    num: '04',
    label: 'AST Verification',
    desc: 'Zero host execution: syntax validated via ast.parse() / javalang.',
    color: 'from-emerald-500 to-teal-500',
    glow: 'rgba(16,185,129,0.3)',
    border: 'rgba(16,185,129,0.25)',
    textColor: 'text-emerald-400',
  },
  {
    num: '05',
    label: 'Self-Repair Loop',
    desc: 'On failure: diagnostic errors re-injected for autonomous convergence.',
    color: 'from-amber-500 to-orange-500',
    glow: 'rgba(245,158,11,0.3)',
    border: 'rgba(245,158,11,0.25)',
    textColor: 'text-amber-400',
  },
];

// Strategy icons
const strategyIcons: Record<string, React.FC<{ className?: string }>> = {
  zero_shot: Sparkles,
  few_shot: Layers,
  chain_of_thought: GitBranch,
  role_expert: Shield,
  iterative_repair: RefreshCw,
};

const strategyColors: Record<string, { from: string; glow: string; badge: string }> = {
  zero_shot: { from: 'from-cyan-500 to-blue-500', glow: 'rgba(6,182,212,0.15)', badge: 'cyan' },
  few_shot: { from: 'from-blue-500 to-indigo-500', glow: 'rgba(59,130,246,0.15)', badge: 'blue' },
  chain_of_thought: { from: 'from-purple-500 to-violet-500', glow: 'rgba(139,92,246,0.15)', badge: 'purple' },
  role_expert: { from: 'from-emerald-500 to-teal-500', glow: 'rgba(16,185,129,0.15)', badge: 'emerald' },
  iterative_repair: { from: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.15)', badge: 'amber' },
};

// Quick stats
const stats = [
  {
    label: 'Translation Scope',
    value: 'Java ↔ Python',
    sub: 'Bidirectional transpilation',
    icon: ArrowLeftRight,
    iconColor: 'from-cyan-500 to-blue-500',
    glow: 'rgba(6,182,212,0.2)',
    isText: true,
  },
  {
    label: 'Prompt Strategies',
    value: 5,
    suffix: ' Versioned',
    sub: 'Zero-shot → Iterative Repair',
    icon: FlaskConical,
    iconColor: 'from-purple-500 to-violet-500',
    glow: 'rgba(139,92,246,0.2)',
    isText: false,
  },
  {
    label: 'Automated Tests',
    value: 19,
    suffix: ' Passing',
    sub: 'pytest + vitest suite',
    icon: CheckCircle2,
    iconColor: 'from-emerald-500 to-teal-500',
    glow: 'rgba(16,185,129,0.2)',
    isText: false,
  },
  {
    label: 'AST Pass Rate',
    value: 100,
    suffix: '%',
    sub: 'Mock provider validation',
    icon: ShieldCheck,
    iconColor: 'from-amber-500 to-orange-500',
    glow: 'rgba(245,158,11,0.2)',
    isText: false,
  },
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activePipelineStep, setActivePipelineStep] = useState<number | null>(null);
  const [hoveredStrategy, setHoveredStrategy] = useState<string | null>(null);

  return (
    <div className="space-y-8">

      {/* ═══════════════════════════════════════════════════
          HERO BANNER
      ═══════════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden rounded-3xl p-8 sm:p-10"
        style={{
          background: 'linear-gradient(135deg, rgba(5,12,30,0.95) 0%, rgba(8,15,38,0.9) 50%, rgba(5,8,25,0.95) 100%)',
          border: '1px solid rgba(99,125,180,0.12)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.5)',
        }}
      >
        {/* Background decorative elements */}
        <div
          className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at top right, rgba(6,182,212,0.08) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-72 h-72 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 65%)',
          }}
        />

        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        <div className="relative z-10 max-w-3xl">
          {/* Badge row */}
          <div className="flex flex-wrap items-center gap-2.5 mb-5">
            <Badge variant="cyan" size="md" dot pulse>
              Academic Platform
            </Badge>
            <Badge variant="emerald" size="md" dot>
              System Operational
            </Badge>
            <Badge variant="purple" size="md">
              Prompt Engineering Research
            </Badge>
          </div>

          {/* Headline */}
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight mb-4"
          >
            <span
              style={{
                background: 'linear-gradient(90deg, #e2e8f0 0%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              CodeShift AI
            </span>
            <br />
            <span
              style={{
                background: 'linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Translation & Evaluation Studio
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-7 max-w-2xl">
            A specialized research platform built to systematically benchmark prompt engineering
            techniques across Java and Python. Analyze semantic preservation, measure paradigm shifts,
            synthesize unit tests, and test automated self-repair loops — all with zero arbitrary host execution.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/translate')}
              icon={<ArrowLeftRight className="w-4 h-4" />}
            >
              Open Translate Workspace
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/experiments')}
              icon={<FlaskConical className="w-4 h-4" />}
            >
              Prompt Strategies
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => navigate('/benchmarks')}
              icon={<BarChart3 className="w-4 h-4" />}
            >
              Benchmarks
            </Button>
          </div>
        </div>

        {/* Decorative floating code icon */}
        <div
          className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:flex w-32 h-32 rounded-3xl items-center justify-center animate-float"
          style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(139,92,246,0.06) 100%)',
            border: '1px solid rgba(6,182,212,0.15)',
            boxShadow: '0 0 40px rgba(6,182,212,0.08)',
          }}
        >
          <Code2
            className="w-16 h-16"
            style={{
              filter: 'drop-shadow(0 0 12px rgba(6,182,212,0.4))',
              color: 'rgba(6,182,212,0.6)',
            }}
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          ANIMATED STAT CARDS
      ═══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] animate-fade-in-up group"
              style={{
                animationDelay: `${idx * 0.08}s`,
                background: 'rgba(7, 14, 32, 0.8)',
                border: '1px solid rgba(99,125,180,0.1)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 24px rgba(0,0,0,0.4), 0 0 20px ${stat.glow}`;
                (e.currentTarget as HTMLDivElement).style.borderColor = stat.glow;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,125,180,0.1)';
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-white leading-none">
                    {stat.isText ? (
                      <span style={{
                        background: `linear-gradient(135deg, ${stat.iconColor.replace('from-', '').split(' to-')[0].replace(/[a-z]+-(\d+)/, 'rgba(6,182,212,1)')}, white)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}>
                        {stat.value}
                      </span>
                    ) : (
                      <>
                        <StatCounter value={stat.value as number} duration={1200} />
                        <span className="text-lg text-slate-400">{stat.suffix}</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{stat.sub}</p>
                </div>

                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${stat.glow}, rgba(0,0,0,0))`,
                    border: `1px solid ${stat.glow}`,
                  }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{
                      color: stat.glow.replace('0.2)', '0.9)').replace('rgba', 'rgba'),
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════
          EXECUTION PIPELINE
      ═══════════════════════════════════════════════════ */}
      <Card
        title="CodeShift AI Execution Pipeline"
        subtitle="End-to-end flow from prompt template resolution to isolated verification"
        badge={<Badge variant="blue" size="sm">Architecture</Badge>}
      >
        <div className="space-y-3 mt-1">
          {/* Connecting line */}
          <div className="relative">
            <div className="hidden md:block absolute top-6 left-[32px] right-[32px] h-px bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-amber-500/30" />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {pipelineSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="relative p-4 rounded-xl cursor-pointer transition-all duration-300"
                  style={{
                    background: activePipelineStep === idx
                      ? `linear-gradient(135deg, ${step.border}22, ${step.border}11)`
                      : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${activePipelineStep === idx ? step.border : 'rgba(255,255,255,0.05)'}`,
                    boxShadow: activePipelineStep === idx ? `0 0 20px ${step.glow}` : 'none',
                  }}
                  onMouseEnter={() => setActivePipelineStep(idx)}
                  onMouseLeave={() => setActivePipelineStep(null)}
                >
                  {/* Step number badge */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 font-mono text-xs font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${step.color.replace('from-', '').split(' to-')[0]}, ${step.color.split('to-')[1]})`,
                      backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                      boxShadow: `0 0 12px ${step.glow}`,
                    }}
                  >
                    <span className={`font-bold ${step.textColor}`}>{step.num}</span>
                  </div>
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center mb-2"
                    style={{
                      background: `linear-gradient(135deg, ${step.glow.replace('0.3)', '0.2)')}, transparent)`,
                    }}
                  >
                    <span className={`text-xs font-bold font-mono ${step.textColor}`}>{step.num}</span>
                  </div>

                  <p className={`text-xs font-semibold mb-1.5 ${step.textColor}`}>{step.label}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">{step.desc}</p>

                  {/* Arrow on right side for desktop */}
                  {idx < pipelineSteps.length - 1 && (
                    <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                      <ChevronRight className="w-4 h-4 text-slate-700" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 border-t border-white/[0.05] text-[11px] text-slate-600 font-mono">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-emerald-600" /> No arbitrary host execution</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-amber-600" /> Static AST only</span>
            <span className="flex items-center gap-1.5"><GitBranch className="w-3 h-3 text-blue-600" /> Closed-loop repair</span>
          </div>
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════
          STRATEGY TAXONOMY GRID
      ═══════════════════════════════════════════════════ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-100 tracking-tight">
              Prompt Engineering Strategies
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              5 versioned prompting paradigms — each with distinct hypothesis and academic rationale
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/experiments')}
            iconRight={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Configure
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROMPT_STRATEGY_DEFINITIONS.map((strat, idx) => {
            const Icon = strategyIcons[strat.id] || FlaskConical;
            const colors = strategyColors[strat.id] || strategyColors.zero_shot;
            const isHovered = hoveredStrategy === strat.id;

            return (
              <div
                key={strat.id}
                className="rounded-2xl p-5 cursor-pointer transition-all duration-300 animate-fade-in-up"
                style={{
                  animationDelay: `${idx * 0.07}s`,
                  background: isHovered
                    ? `linear-gradient(135deg, ${colors.glow}, rgba(255,255,255,0.01))`
                    : 'rgba(7, 14, 32, 0.8)',
                  border: `1px solid ${isHovered ? colors.glow.replace('0.15)', '0.35)') : 'rgba(99,125,180,0.1)'}`,
                  boxShadow: isHovered
                    ? `0 8px 32px rgba(0,0,0,0.4), 0 0 24px ${colors.glow}`
                    : '0 4px 24px rgba(0,0,0,0.3)',
                  transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                }}
                onMouseEnter={() => setHoveredStrategy(strat.id)}
                onMouseLeave={() => setHoveredStrategy(null)}
                onClick={() => navigate('/experiments')}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${colors.from.replace('from-', '').split(' to-')[0].replace(/([a-z]+-\d+)/, '$1') })`,
                      backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                      boxShadow: `0 0 16px ${colors.glow}`,
                    }}
                  >
                    <Icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <Badge variant={colors.badge as any} size="sm">{strat.tag}</Badge>
                </div>

                {/* Name + description */}
                <h4 className="text-sm font-semibold text-slate-100 mb-1.5">{strat.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
                  {strat.description}
                </p>

                {/* Academic rationale box */}
                <div
                  className="p-2.5 rounded-lg text-[11px] text-slate-400 leading-relaxed mb-3"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {strat.academicRationale.slice(0, 90)}...
                </div>

                {/* Footer row */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-3 border-t border-white/[0.05]">
                  <span>Template v{strat.version}</span>
                  <span>T={strat.defaultTemperature}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          QUICK LINKS ROW
      ═══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: ArrowLeftRight,
            label: 'Start Translating',
            desc: 'Open the Monaco editor workspace',
            path: '/translate',
            color: 'from-cyan-500 to-blue-500',
            glow: 'rgba(6,182,212,0.2)',
          },
          {
            icon: BarChart3,
            label: 'View Benchmarks',
            desc: 'Empirical telemetry & CSV export',
            path: '/benchmarks',
            color: 'from-emerald-500 to-teal-500',
            glow: 'rgba(16,185,129,0.2)',
          },
          {
            icon: FlaskConical,
            label: 'Configure Prompts',
            desc: 'Tune hyperparameters & strategies',
            path: '/experiments',
            color: 'from-purple-500 to-violet-500',
            glow: 'rgba(139,92,246,0.2)',
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] group"
              style={{
                background: 'rgba(7, 14, 32, 0.8)',
                border: '1px solid rgba(99,125,180,0.1)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 24px rgba(0,0,0,0.4), 0 0 20px ${item.glow}`;
                (e.currentTarget as HTMLButtonElement).style.borderColor = item.glow;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,125,180,0.1)';
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg, ${item.glow.replace('0.2)', '0.3)')}, transparent)`, border: `1px solid ${item.glow}` }}
              >
                <Icon className="w-5 h-5 text-white/80" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-100">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
