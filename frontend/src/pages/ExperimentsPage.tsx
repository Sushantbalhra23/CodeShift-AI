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
} from 'lucide-react';

export const ExperimentsPage: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<PromptStrategyDefinition>(
    PROMPT_STRATEGY_DEFINITIONS[0]
  );
  const [temperature, setTemperature] = useState<number>(0.1);
  const [topP, setTopP] = useState<number>(0.95);
  const [maxTokens, setMaxTokens] = useState<number>(4096);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [inspectedTemplate, setInspectedTemplate] = useState<PromptStrategyDefinition | null>(null);

  const getIconForStrategy = (id: string) => {
    switch (id) {
      case 'zero_shot':
        return Sparkles;
      case 'few_shot':
        return Layers;
      case 'chain_of_thought':
        return GitBranch;
      case 'role_expert':
        return Shield;
      case 'iterative_repair':
        return RefreshCw;
      default:
        return FlaskConical;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Page Header Banner */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              Prompt Engineering Experimentation Studio
            </h2>
            <Badge variant="cyan" size="sm">
              v1.0.0 Registry
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Configure, inspect, and benchmark prompt topologies. Prompt templates are strictly versioned in YAML and decoupled from application business logic.
          </p>
        </div>

        <Badge variant="demo" size="md">
          [Configuration Preview Mode]
        </Badge>
      </div>

      {/* Strategy Cards Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
          Available Prompt Strategies ({PROMPT_STRATEGY_DEFINITIONS.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROMPT_STRATEGY_DEFINITIONS.map((strat) => {
            const Icon = getIconForStrategy(strat.id);
            const isSelected = selectedStrategy.id === strat.id;

            return (
              <div
                key={strat.id}
                onClick={() => {
                  setSelectedStrategy(strat);
                  setTemperature(strat.defaultTemperature);
                }}
                className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500/40'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <Badge variant="purple" size="sm">
                      {strat.tag}
                    </Badge>
                  </div>

                  <h4 className={`text-sm font-semibold mb-1.5 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {strat.name}
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-3">
                    {strat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    Template: <strong className="text-cyan-400">v{strat.version}</strong>
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectedTemplate(strat);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 transition"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View YAML</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Strategy Deep-Dive & Parameter Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Academic Rationale Card */}
        <Card
          className="lg:col-span-2"
          title={`Strategy Invariant Analysis: ${selectedStrategy.name}`}
          badge={<Badge variant="cyan" size="sm">v{selectedStrategy.version}</Badge>}
        >
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1">
                Formal Hypothesis & Objective
              </span>
              <p className="text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                {selectedStrategy.academicRationale}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1">
                Mechanism & Prompt Architecture
              </span>
              <p className="text-slate-300 leading-relaxed">
                {selectedStrategy.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="font-mono text-slate-400">
                Storage: <code className="text-cyan-400">prompts/translation/{selectedStrategy.id}_v1.yaml</code>
              </span>
              <Button
                variant="outline"
                size="sm"
                icon={<Eye className="w-3.5 h-3.5" />}
                onClick={() => {
                  setInspectedTemplate(selectedStrategy);
                  setIsModalOpen(true);
                }}
              >
                Inspect Template Schema
              </Button>
            </div>
          </div>
        </Card>

        {/* Hyperparameter Configuration Tuning */}
        <Card
          title="Inference Hyperparameters"
          subtitle="Model sampling controls for prompt evaluation"
          badge={<Sliders className="w-4 h-4 text-cyan-400" />}
        >
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5 font-mono">
                <span className="text-slate-300">Temperature</span>
                <span className="text-cyan-400 font-bold">{temperature}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 rounded-lg h-1.5"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Lower values (0.0-0.2) prioritize strict deterministic syntactic compliance.
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-1.5 font-mono">
                <span className="text-slate-300">Top P (Nucleus Sampling)</span>
                <span className="text-cyan-400 font-bold">{topP}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.05"
                value={topP}
                onChange={(e) => setTopP(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 rounded-lg h-1.5"
              />
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-1.5 font-mono">
                <span className="text-slate-300">Max Tokens</span>
                <span className="text-cyan-400 font-bold">{maxTokens}</span>
              </div>
              <input
                type="range"
                min="1024"
                max="8192"
                step="512"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 rounded-lg h-1.5"
              />
            </div>

            <div className="pt-3">
              <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/60 text-[11px] text-cyan-200">
                Parameters are serialized into prompt requests during benchmark and translation runs.
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal: View Prompt YAML */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Prompt Template Definition: ${inspectedTemplate?.name} (v${inspectedTemplate?.version})`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Raw YAML specification demonstrating parameters, system invariants, and user template formatting:
          </p>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
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
