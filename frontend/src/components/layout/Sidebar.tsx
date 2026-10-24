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
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  backendOnline: boolean | null;
  provider: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  backendOnline,
  provider,
}) => {
  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      description: 'Platform overview & architecture',
      icon: LayoutDashboard,
    },
    {
      to: '/translate',
      label: 'Translate Workspace',
      description: 'Java ↔ Python editor studio',
      icon: ArrowLeftRight,
    },
    {
      to: '/experiments',
      label: 'Prompt Experiments',
      description: 'Strategies, parameters & CoT',
      icon: FlaskConical,
    },
    {
      to: '/benchmarks',
      label: 'Benchmark Results',
      description: 'Empirical telemetry & export',
      icon: BarChart3,
    },
    {
      to: '/settings',
      label: 'Settings',
      description: 'API, models & editor prefs',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white">CodeShift AI</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-800">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Academic Evaluation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Platform Workspaces
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
                  `group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/25 ring-1 ring-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'
                        }`}
                      />
                      <div className="min-w-0">
                        <span className="block truncate font-medium">{item.label}</span>
                        <span
                          className={`block truncate text-[10px] ${
                            isActive ? 'text-cyan-100' : 'text-slate-500 group-hover:text-slate-400'
                          }`}
                        >
                          {item.description}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
                        isActive ? 'opacity-100 text-cyan-200' : 'opacity-0 group-hover:opacity-60'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* System & Security Footer Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2">
          <div className="p-3 rounded-xl border border-slate-800/80 bg-slate-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Backend Status
              </span>
              {backendOnline === null ? (
                <Badge variant="slate" size="sm">
                  Checking...
                </Badge>
              ) : backendOnline ? (
                <Badge variant="emerald" size="sm" dot>
                  Online
                </Badge>
              ) : (
                <Badge variant="amber" size="sm">
                  Standby
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
              <span>Provider:</span>
              <span className="text-cyan-400 font-semibold uppercase">{provider}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400/90 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Safe AST Mode Active</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
