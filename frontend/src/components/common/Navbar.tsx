import React from 'react';
import { ShieldCheck, Cpu, Code2, Sparkles, Database } from 'lucide-react';
import { HealthResponse } from '../../api/types';

interface NavbarProps {
  health: HealthResponse | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ health, activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'translate', label: 'Translation Studio', icon: Code2 },
    { id: 'benchmark', label: 'Strategy Benchmark', icon: Sparkles },
    { id: 'explanation', label: 'Paradigm Explainer', icon: Cpu },
    { id: 'tests', label: 'Test Synthesis', icon: ShieldCheck },
    { id: 'repair', label: 'Iterative Repair', icon: Sparkles },
    { id: 'history', label: 'Experiment History', icon: Database },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  CodeShift AI
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                  Academic v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Prompt Engineering Code Translation & Evaluation</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* System & Security Badges */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-400">Provider:</span>
              <span className="font-mono font-medium text-cyan-400">{health?.default_provider || 'mock'}</span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono ${
                health?.docker_execution_enabled
                  ? 'bg-emerald-950/50 border-emerald-800 text-emerald-400'
                  : 'bg-amber-950/40 border-amber-800/80 text-amber-300'
              }`}
              title={
                health?.docker_execution_enabled
                  ? 'Isolated Docker execution active'
                  : 'Host execution disabled. Safe static AST verification enforced.'
              }
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{health?.docker_execution_enabled ? 'Docker Sandbox' : 'AST Safe-Mode'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
