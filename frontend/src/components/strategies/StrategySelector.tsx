import React from 'react';
import { PromptStrategy } from '../../api/types';
import { Sparkles, Layers, GitBranch, Shield, Zap } from 'lucide-react';

interface StrategyOption {
  id: PromptStrategy;
  name: string;
  tag: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const STRATEGY_OPTIONS: StrategyOption[] = [
  {
    id: 'zero_shot',
    name: 'Zero-Shot Direct',
    tag: 'Baseline',
    description: 'Direct translation without in-context exemplars. Tests raw foundational model competence.',
    icon: Zap,
  },
  {
    id: 'few_shot',
    name: 'Few-Shot In-Context',
    tag: 'Exemplar-Guided',
    description: 'Includes curated bidirectional translation exemplars mapping collections, streams, and exceptions.',
    icon: Layers,
  },
  {
    id: 'chain_of_thought',
    name: 'Chain-of-Thought (CoT)',
    tag: 'Multi-Stage Reasoning',
    description: 'Decomposes task into semantic analysis, type mapping, and standard library equivalence.',
    icon: GitBranch,
  },
  {
    id: 'role_expert',
    name: 'Role-Prompted Expert',
    tag: 'Persona / Invariants',
    description: 'Simulates a Principal Polyglot Compiler Architect enforcing zero-defect invariant safety.',
    icon: Shield,
  },
];

interface StrategySelectorProps {
  selectedStrategy: PromptStrategy;
  onSelectStrategy: (strat: PromptStrategy) => void;
  multiSelect?: boolean;
  selectedStrategies?: PromptStrategy[];
  onToggleStrategy?: (strat: PromptStrategy) => void;
}

export const StrategySelector: React.FC<StrategySelectorProps> = ({
  selectedStrategy,
  onSelectStrategy,
  multiSelect = false,
  selectedStrategies = ['zero_shot', 'few_shot', 'chain_of_thought', 'role_expert'],
  onToggleStrategy,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Prompt Engineering Strategy</span>
        </h3>
        {multiSelect && (
          <span className="text-xs text-slate-400">
            Selected: <span className="text-cyan-400 font-mono">{selectedStrategies.length}</span> strategies
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {STRATEGY_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = multiSelect
            ? selectedStrategies.includes(opt.id)
            : selectedStrategy === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => {
                if (multiSelect && onToggleStrategy) {
                  onToggleStrategy(opt.id);
                } else {
                  onSelectStrategy(opt.id);
                }
              }}
              className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-500/30'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {opt.tag}
                </span>
              </div>

              <span className={`text-sm font-semibold mb-1 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                {opt.name}
              </span>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
