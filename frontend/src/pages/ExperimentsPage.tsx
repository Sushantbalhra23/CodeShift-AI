import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { PROMPT_STRATEGY_DEFINITIONS } from '../data/demoData';
import { PromptStrategyDefinition } from '../api/types';
import {
  FlaskConical,
  Sliders,
  Sparkles,
  Layers,
  GitBranch,
  Shield,
  RefreshCw,
  Eye,
  Thermometer,
  Cpu,
  Hash,
} from 'lucide-react';

const strategyMeta: Record<string, {
  icon: React.ComponentType<{ className?: string; color?: string }>;
  color: string;
  glow: string;
  activeBg: string;
  activeBorder: string;
  badge: string;
  badgeVariant: string;
}> = {
  zero_shot: {
    icon: Sparkles,
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.2)',
    activeBg: 'rgba(6,182,212,0.07)',
    activeBorder: 'rgba(6,182,212,0.4)',
    badge: 'Baseline',
    badgeVariant: 'cyan',
  },
  few_shot: {
    icon: Layers,
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.2)',
    activeBg: 'rgba(59,130,246,0.07)',
    activeBorder: 'rgba(59,130,246,0.4)',
    badge: 'In-Context',
    badgeVariant: 'blue',
  },
  chain_of_thought: {
    icon: GitBranch,
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.2)',
    activeBg: 'rgba(139,92,246,0.07)',
    activeBorder: 'rgba(139,92,246,0.4)',
    badge: 'Reasoning',
    badgeVariant: 'purple',
  },
  role_expert: {
    icon: Shield,
    color: '#10b981',
    glow: 'rgba(16,185,129,0.2)',
    activeBg: 'rgba(16,185,129,0.07)',
    activeBorder: 'rgba(16,185,129,0.4)',
    badge: 'Persona',
    badgeVariant: 'emerald',
  },
  iterative_repair: {
    icon: RefreshCw,
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.2)',
    activeBg: 'rgba(245,158,11,0.07)',
    activeBorder: 'rgba(245,158,11,0.4)',
    badge: 'Self-Repair',
    badgeVariant: 'amber',
  },
};

export const ExperimentsPage: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<PromptStrategyDefinition>(
    PROMPT_STRATEGY_DEFINITIONS[0]
  );
  const [temperature, setTemperature] = useState<number>(0.1);
  const [topP, setTopP] = useState<number>(0.95);
  const [maxTokens, setMaxTokens] = useState<number>(4096);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [inspectedTemplate, setInspectedTemplate] = useState<PromptStrategyDefinition | null>(null);

  const meta = strategyMeta[selectedStrategy.id] || {
    icon: FlaskConical,
    color: '#94a3b8',
    glow: 'rgba(148,163,184,0.2)',
    activeBg: 'rgba(148,163,184,0.07)',
    activeBorder: 'rgba(148,163,184,0.4)',
    badge: 'Strategy',
    badgeVariant: 'slate',
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
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
              Prompt Engineering Studio
            </h2>
            <Badge variant="cyan" size="md">v1.0.0 Registry</Badge>
          </div>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Configure, inspect, and benchmark prompt topologies. Templates are strictly versioned
            in YAML and fully decoupled from application business logic.
          </p>
        </div>
        <Badge variant="demo" size="md">[Configuration Preview]</Badge>
      </div>

      {/* Strategy Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 font-semibold px-1">
          Available Strategies ({PROMPT_STRATEGY_DEFINITIONS.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {PROMPT_STRATEGY_DEFINITIONS.map((strat) => {
            const m = strategyMeta[strat.id] || { icon: FlaskConical, color: '#94a3b8', glow: 'rgba(148,163,184,0.2)', activeBg: 'rgba(148,163,184,0.07)', activeBorder: 'rgba(148,163,184,0.3)', badge: '', badgeVariant: 'slate' };
            const Icon = m.icon;
            const isSelected = selectedStrategy.id === strat.id;

            return (
              <div
                key={strat.id}
                onClick={() => { setSelectedStrategy(strat); setTemperature(strat.defaultTemperature); }}
                className="relative p-4 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col"
                style={{
                  background: isSelected ? m.activeBg : 'rgba(7,14,32,0.7)',
                  border: `1px solid ${isSelected ? m.activeBorder : 'rgba(99,125,180,0.1)'}`,
                  boxShadow: isSelected ? `0 0 24px ${m.glow}, 0 4px 20px rgba(0,0,0,0.3)` : '0 2px 12px rgba(0,0,0,0.3)',
                  transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
                }}
              >
                {/* Gradient top line when selected */}
                {isSelected && (
                  <div
                    className="absolute top-0 left-4 right-4 h-px rounded-full"
                    style={{ background: `linear-gradient(90deg, transparent, ${m.color}, transparent)` }}
                  />
                )}

                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                    style={{
                      background: isSelected ? m.glow.replace('0.2)', '0.3)') : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isSelected ? m.activeBorder : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <Icon className="w-4 h-4" color={isSelected ? m.color : '#64748b'} />
                  </div>
                </div>

                <h4 className="text-xs font-semibold text-slate-100 mb-1 leading-tight">{strat.name}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-3 flex-1 line-clamp-2">
                  {strat.description}
                </p>

                <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.05]">
                  <span className="text-[10px] font-mono text-slate-600">v{strat.version}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectedTemplate(strat);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-lg transition-all"
                    style={{
                      color: m.color,
                      background: m.glow.replace('0.2)', '0.08)'),
                      border: `1px solid ${m.activeBorder.replace('0.4)', '0.2)')}`,
                    }}
                  >
                    <Eye className="w-2.5 h-2.5" />
                    YAML
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail + Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strategy Deep-Dive */}
        <Card
          className="lg:col-span-2"
          title={`Strategy Analysis: ${selectedStrategy.name}`}
          badge={<Badge variant={meta.badgeVariant as any} size="sm">v{selectedStrategy.version}</Badge>}
          glowColor="blue"
        >
          <div className="space-y-4 text-xs">
            {/* Hypothesis */}
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-600 block mb-2">
                Formal Hypothesis & Research Objective
              </span>
              <div
                className="p-3.5 rounded-xl leading-relaxed text-slate-300"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderLeft: `2px solid ${meta.color}`,
                }}
              >
                {selectedStrategy.academicRationale}
              </div>
            </div>

            {/* Architecture */}
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-600 block mb-2">
                Mechanism & Prompt Architecture
              </span>
              <p className="text-slate-400 leading-relaxed">{selectedStrategy.description}</p>
            </div>

            {/* Template path */}
            <div
              className="flex items-center justify-between pt-3 border-t border-white/[0.05]"
            >
              <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                <span>Path:</span>
                <code style={{ color: meta.color }}>
                  prompts/translation/{selectedStrategy.id}_v1.yaml
                </code>
              </div>
              <Button
                variant="outline"
                size="xs"
                icon={<Eye className="w-3 h-3" />}
                onClick={() => { setInspectedTemplate(selectedStrategy); setIsModalOpen(true); }}
              >
                Inspect YAML
              </Button>
            </div>
          </div>
        </Card>

        {/* Hyperparameter Tuning */}
        <Card
          title="Inference Parameters"
          subtitle="Model sampling controls"
          badge={<Sliders className="w-4 h-4 text-cyan-400" />}
          glowColor="purple"
        >
          <div className="space-y-5 text-xs">
            {/* Temperature */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 font-mono text-slate-300">
                  <Thermometer className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Temperature</span>
                </div>
                <span
                  className="font-mono font-bold text-sm"
                  style={{ color: meta.color }}
                >
                  {temperature}
                </span>
              </div>
              <input
                type="range"
                min="0.0" max="1.0" step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-[10px] text-slate-600 mt-1 font-mono">
                0.0–0.2 = strict deterministic · 0.5–1.0 = creative
              </p>
            </div>

            {/* Top P */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 font-mono text-slate-300">
                  <Cpu className="w-3.5 h-3.5 text-purple-500" />
                  <span>Top P (Nucleus)</span>
                </div>
                <span className="font-mono font-bold text-sm text-purple-400">{topP}</span>
              </div>
              <input
                type="range"
                min="0.5" max="1.0" step="0.05"
                value={topP}
                onChange={(e) => setTopP(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Max Tokens */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 font-mono text-slate-300">
                  <Hash className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Max Tokens</span>
                </div>
                <span className="font-mono font-bold text-sm text-emerald-400">{maxTokens.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1024" max="8192" step="512"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-[10px] text-slate-600 mt-1 font-mono">Range: 1,024 – 8,192 tokens</p>
            </div>

            {/* Summary box */}
            <div
              className="p-3 rounded-xl text-[11px] font-mono text-slate-400"
              style={{
                background: meta.glow.replace('0.2)', '0.06)'),
                border: `1px solid ${meta.activeBorder.replace('0.4)', '0.15)')}`,
              }}
            >
              Parameters serialize into prompt requests during benchmark and translation runs.
            </div>
          </div>
        </Card>
      </div>

      {/* YAML Template Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Prompt Template: ${inspectedTemplate?.name} (v${inspectedTemplate?.version})`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Raw YAML specification — parameters, system invariants, and user template formatting:
          </p>
          <pre
            className="p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed"
            style={{
              background: 'rgba(3,6,15,0.9)',
              border: '1px solid rgba(99,125,180,0.12)',
              color: '#94a3b8',
            }}
          >
            {inspectedTemplate?.yamlTemplatePreview}
          </pre>
          <div className="flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
