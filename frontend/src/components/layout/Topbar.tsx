import React from 'react';
import { Menu, Terminal, RefreshCw, ExternalLink, Activity } from 'lucide-react';
import { Badge } from '../common/Badge';

interface TopbarProps {
  onToggleSidebar: () => void;
  title: string;
  subtitle?: string;
  backendOnline: boolean | null;
  onRefreshHealth: () => void;
  loadingHealth: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleSidebar,
  title,
  subtitle,
  backendOnline,
  onRefreshHealth,
  loadingHealth,
}) => {
  return (
    <header
      className="h-14 px-4 sm:px-6 border-b sticky top-0 z-30 flex items-center justify-between"
      style={{
        background: 'rgba(3, 6, 15, 0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderColor: 'rgba(99, 125, 180, 0.1)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Subtle top highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

      {/* Left — hamburger + page title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] lg:hidden transition-colors shrink-0"
          aria-label="Toggle navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-slate-100 tracking-tight truncate leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-slate-500 hidden sm:block truncate max-w-sm leading-tight mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right — backend status + API docs */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Backend health button */}
        <button
          onClick={onRefreshHealth}
          disabled={loadingHealth}
          title="Click to check FastAPI backend connectivity"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono transition-all duration-200 group"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(6,182,212,0.3)';
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(6,182,212,0.05)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
          }}
        >
          {loadingHealth ? (
            <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" />
          ) : (
            <Activity className={`w-3.5 h-3.5 transition-colors ${backendOnline ? 'text-emerald-400' : 'text-slate-500'}`} />
          )}
          <span className="text-slate-500 hidden md:inline">API:</span>
          {backendOnline === null ? (
            <Badge variant="slate" size="sm">Connecting...</Badge>
          ) : backendOnline ? (
            <Badge variant="emerald" size="sm" dot pulse>:8000</Badge>
          ) : (
            <Badge variant="amber" size="sm">Offline</Badge>
          )}
        </button>

        {/* API Docs link */}
        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noreferrer"
          title="Open FastAPI Swagger docs"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-400 hover:text-cyan-300 transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(6,182,212,0.25)';
            (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(6,182,212,0.04)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.08)';
            (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.03)';
          }}
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-500" />
          <span>Swagger</span>
          <ExternalLink className="w-3 h-3 opacity-50" />
        </a>
      </div>
    </header>
  );
};
