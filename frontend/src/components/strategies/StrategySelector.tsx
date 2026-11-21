import React from 'react';
import { PromptStrategy } from '../../api/types';
import { Sparkles, Layers, GitBranch, Shield, RefreshCw, Zap } from 'lucide-react';

interface StrategySelectorProps {
  selectedStrategy: PromptStrategy;
  onSelectStrategy: (s: PromptStrategy) => void;
}

const strategies: {
  id: PromptStrategy;
  label: string;
  shortDesc: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  glow: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;
}[] = [
  {
    id: 'baseline',
    label: 'Baseline',
    shortDesc: 'Direct zero-shot',
    icon: Zap,
    color: 'text-slate-400',
    glow: 'rgba(148,163,184,0.25)',
    activeBg: 'rgba(148,163,184,0.08)',
    activeBorder: 'rgba(148,163,184,0.35)',
    activeText: 'text-slate-200',
  },
  {
    id: 'zero_shot',
    label: 'Zero-Shot',
    shortDesc: 'No exemplars',
    icon: Sparkles,
    color: 'text-cyan-400',
    glow: 'rgba(6,182,212,0.3)',
    activeBg: 'rgba(6,182,212,0.08)',
    activeBorder: 'rgba(6,182,212,0.4)',
    activeText: 'text-cyan-300',
  },
  {
    id: 'few_shot',
    label: 'Few-Shot',
    shortDesc: 'Exemplar guided',
    icon: Layers,
    color: 'text-blue-400',
    glow: 'rgba(59,130,246,0.3)',
    activeBg: 'rgba(59,130,246,0.08)',
    activeBorder: 'rgba(59,130,246,0.4)',
    activeText: 'text-blue-300',
  },
  {
    id: 'chain_of_thought',
    label: 'Chain-of-Thought',
    shortDesc: 'Multi-stage',
    icon: GitBranch,
    color: 'text-purple-400',
    glow: 'rgba(139,92,246,0.3)',
    activeBg: 'rgba(139,92,246,0.08)',
    activeBorder: 'rgba(139,92,246,0.4)',
    activeText: 'text-purple-300',
  },
  {
    id: 'role_expert',
    label: 'Role-Expert',
    shortDesc: 'Compiler persona',
    icon: Shield,
    color: 'text-emerald-400',
    glow: 'rgba(16,185,129,0.3)',
    activeBg: 'rgba(16,185,129,0.08)',
    activeBorder: 'rgba(16,185,129,0.4)',
    activeText: 'text-emerald-300',
  },
  {
    id: 'iterative_repair',
    label: 'Self-Repair',
    shortDesc: 'Closed loop',
    icon: RefreshCw,
    color: 'text-amber-400',
    glow: 'rgba(245,158,11,0.3)',
    activeBg: 'rgba(245,158,11,0.08)',
    activeBorder: 'rgba(245,158,11,0.4)',
    activeText: 'text-amber-300',
  },
];

export const StrategySelector: React.FC<StrategySelectorProps> = ({
  selectedStrategy,
  onSelectStrategy,
}) => {
  return (
    <div
      className="p-3 rounded-2xl"
      style={{
        background: 'rgba(7, 14, 32, 0.6)',
        border: '1px solid rgba(99,125,180,0.1)',
      }}
    >
      <div className="flex items-center gap-1.5 mb-2.5 px-1">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600">Prompt Strategy</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {strategies.map((s) => {
          const Icon = s.icon;
          const isActive = selectedStrategy === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelectStrategy(s.id)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200"
              style={{
                background: isActive ? s.activeBg : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? s.activeBorder : 'rgba(255,255,255,0.06)'}`,
                boxShadow: isActive ? `0 0 16px ${s.glow}` : 'none',
                color: isActive ? undefined : 'rgb(100, 116, 139)',
              }}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? s.color : 'text-slate-600'} transition-colors`} />
              <span className={`font-semibold ${isActive ? s.activeText : ''}`}>{s.label}</span>
              <span
                className={`text-[10px] font-mono hidden sm:inline ${isActive ? 'opacity-70' : 'opacity-40'}`}
              >
                {s.shortDesc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
