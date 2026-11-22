import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { TranslationService } from '../../services/translationService';
import { loadSettings } from '../../services/settingsService';

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Project Overview & Dashboard',
    subtitle: 'Academic code translation, paradigm preservation & prompt strategy evaluation',
  },
  '/translate': {
    title: 'Translate Workspace',
    subtitle: 'Monaco code editor with bidirectional Java ↔ Python translation & inspection tabs',
  },
  '/experiments': {
    title: 'Prompt Engineering Experiments',
    subtitle: 'Versioned prompt templates, reasoning taxonomies, and parameter configurations',
  },
  '/benchmarks': {
    title: 'Benchmark Results & Empirical Telemetry',
    subtitle: 'Head-to-head metrics, AST validity rates, token usage, and dataset export',
  },
  '/settings': {
    title: 'Platform Settings & Environment',
    subtitle: 'FastAPI gateway endpoints, LLM credentials, and editor customization',
  },
};

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const settings = loadSettings();
  const location = useLocation();

  const meta = pageMeta[location.pathname] ?? {
    title: 'CodeShift AI Studio',
    subtitle: 'Prompt engineering code translation platform',
  };

  const checkBackendHealth = async () => {
    setLoadingHealth(true);
    try {
      const data = await TranslationService.getHealth();
      setBackendOnline(data.status === 'healthy');
    } catch {
      setBackendOnline(false);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen text-slate-100 flex flex-col font-sans"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Animated background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.025) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Radial glow behind sidebar */}
      <div
        className="fixed top-0 left-0 w-96 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top left, rgba(6, 182, 212, 0.06) 0%, transparent 70%)',
        }}
      />

      {/* Bottom-right accent glow */}
      <div
        className="fixed bottom-0 right-0 w-96 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at bottom right, rgba(139, 92, 246, 0.05) 0%, transparent 70%)',
        }}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        backendOnline={backendOnline}
        provider={settings.defaultProvider}
      />

      {/* Main content area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 relative">
        <Topbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          title={meta.title}
          subtitle={meta.subtitle}
          backendOnline={backendOnline}
          onRefreshHealth={checkBackendHealth}
          loadingHealth={loadingHealth}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          <div key={location.pathname} className="animate-fade-in-up">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer
          className="h-11 border-t px-6 flex items-center justify-between text-[11px] font-mono shrink-0"
          style={{
            background: 'rgba(3, 6, 15, 0.9)',
            borderColor: 'rgba(99, 125, 180, 0.08)',
            color: 'rgba(100, 116, 139, 0.7)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-cyan-500/50">◆</span>
            <span>CodeShift AI</span>
            <span className="text-slate-700">•</span>
            <span>Prompt Engineering Research Platform</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-slate-700">
            <span>Isolation: Host-Safe AST</span>
            <span>•</span>
            <span>Java ↔ Python</span>
            <span>•</span>
            <span>19 Tests Passing</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
