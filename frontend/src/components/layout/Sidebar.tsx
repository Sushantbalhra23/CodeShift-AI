import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Code2,
  LayoutDashboard,
  ArrowLeftRight,
  FlaskConical,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronRight,
  X,
  Zap,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  backendOnline: boolean | null;
  provider: string;
}

const navItems = [
  {
    to: '/',
    label: 'Dashboard',
    description: 'Platform overview & architecture',
    icon: LayoutDashboard,
    color: 'from-cyan-500 to-blue-500',
    activeGlow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',
    activeBg: 'bg-gradient-to-r from-cyan-600/20 to-blue-600/10 border-cyan-500/30',
  },
  {
    to: '/translate',
    label: 'Translate Workspace',
    description: 'Java ↔ Python editor studio',
    icon: ArrowLeftRight,
    color: 'from-blue-500 to-indigo-500',
    activeGlow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    activeBg: 'bg-gradient-to-r from-blue-600/20 to-indigo-600/10 border-blue-500/30',
  },
  {
    to: '/experiments',
    label: 'Prompt Experiments',
    description: 'Strategies, parameters & CoT',
    icon: FlaskConical,
    color: 'from-purple-500 to-violet-500',
    activeGlow: 'shadow-[0_0_20px_rgba(139,92,246,0.3)]',
    activeBg: 'bg-gradient-to-r from-purple-600/20 to-violet-600/10 border-purple-500/30',
  },
  {
    to: '/benchmarks',
    label: 'Benchmark Results',
    description: 'Empirical telemetry & export',
    icon: BarChart3,
    color: 'from-emerald-500 to-teal-500',
    activeGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    activeBg: 'bg-gradient-to-r from-emerald-600/20 to-teal-600/10 border-emerald-500/30',
  },
  {
    to: '/settings',
    label: 'Settings',
    description: 'API, models & editor prefs',
    icon: Settings,
    color: 'from-slate-400 to-slate-500',
    activeGlow: 'shadow-[0_0_20px_rgba(148,163,184,0.3)]',
    activeBg: 'bg-gradient-to-r from-slate-600/20 to-slate-700/10 border-slate-500/30',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  backendOnline,
  provider,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, rgba(5, 10, 24, 0.97) 0%, rgba(3, 6, 15, 0.98) 100%)',
          borderRight: '1px solid rgba(99, 125, 180, 0.1)',
          boxShadow: '4px 0 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Subtle top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

        {/* Brand header */}
        <div className="h-16 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.4), 0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              <Code2 className="w-5 h-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className="font-bold text-sm tracking-tight"
                  style={{
                    background: 'linear-gradient(90deg, #e2e8f0, #94a3b8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  CodeShift AI
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Academic Platform</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] lg:hidden transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          <div className="px-2 pb-2 text-[10px] font-mono uppercase tracking-widest text-slate-600 font-semibold">
            Platform Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border ${
                    isActive
                      ? `${item.activeBg} text-white ${item.activeGlow}`
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border-transparent hover:border-white/[0.06]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Icon with gradient background when active */}
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                          isActive
                            ? `bg-gradient-to-br ${item.color} shadow-lg`
                            : 'bg-white/[0.04] group-hover:bg-white/[0.07]'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      </div>

                      <div className="min-w-0">
                        <span className="block truncate font-medium leading-tight">{item.label}</span>
                        <span className={`block truncate text-[10px] mt-0.5 ${isActive ? 'text-white/60' : 'text-slate-600 group-hover:text-slate-500'}`}>
                          {item.description}
                        </span>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-3.5 h-3.5 shrink-0 transition-all duration-200 ${
                        isActive ? 'opacity-80 text-white/60' : 'opacity-0 group-hover:opacity-40'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* System Status Footer */}
        <div className="p-3 shrink-0 border-t border-white/[0.05]">
          <div
            className="p-3 rounded-xl space-y-2.5"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Backend status row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-slate-500" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Backend</span>
              </div>
              {backendOnline === null ? (
                <Badge variant="slate" size="sm">Checking...</Badge>
              ) : backendOnline ? (
                <Badge variant="emerald" size="sm" dot pulse>Online</Badge>
              ) : (
                <Badge variant="amber" size="sm">Standby</Badge>
              )}
            </div>

            {/* Provider row */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
              <span className="text-[10px] font-mono text-slate-500">Provider</span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wide">{provider}</span>
            </div>

            {/* Security row */}
            <div className="flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
              <span className="text-[10px] font-mono text-emerald-500/80">Host-Safe AST Mode</span>
            </div>
          </div>
        </div>

        {/* Subtle bottom gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      </aside>
    </>
  );
};
