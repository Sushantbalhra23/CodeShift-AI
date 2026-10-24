import React from 'react';
import { Menu, Terminal, RefreshCw, ExternalLink } from 'lucide-react';
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
    <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-semibold text-slate-100 tracking-tight">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-lg">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Backend health status badge */}
        <button
          onClick={onRefreshHealth}
          disabled={loadingHealth}
          title="Click to check FastAPI backend connectivity"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950/70 hover:border-slate-700 text-xs font-mono transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loadingHealth ? 'animate-spin' : ''}`} />
          <span className="text-slate-400 hidden md:inline">Backend API:</span>
          {backendOnline === null ? (
            <Badge variant="slate" size="sm">
              Connecting...
            </Badge>
          ) : backendOnline ? (
            <Badge variant="emerald" size="sm" dot>
              Connected (8000)
            </Badge>
          ) : (
            <Badge variant="amber" size="sm">
              Offline / Standby
            </Badge>
          )}
        </button>

        {/* Documentation / Fast link */}
        <a
          href="/api/v1/health"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-850 hover:bg-slate-800 text-xs font-mono text-slate-300 transition"
          title="Open FastAPI Swagger & Health in new tab"
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>API Docs</span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </a>
      </div>
    </header>
  );
};
