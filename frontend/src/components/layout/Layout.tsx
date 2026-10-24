import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { TranslationService } from '../../services/translationService';
import { loadSettings } from '../../services/settingsService';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const settings = loadSettings();
  const location = useLocation();

  const getPageMeta = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'Project Overview & Dashboard',
          subtitle: 'Academic code translation, paradigm preservation & prompt strategy evaluation',
        };
      case '/translate':
        return {
          title: 'Translate Workspace',
          subtitle: 'Monaco code editor with bidirectional Java ↔ Python translation & inspection tabs',
        };
      case '/experiments':
        return {
          title: 'Prompt Engineering Experiments',
          subtitle: 'Versioned prompt templates, reasoning taxonomies, and parameter configurations',
        };
      case '/benchmarks':
        return {
          title: 'Benchmark Results & Empirical Telemetry',
          subtitle: 'Head-to-head metrics, AST validity rates, token usage, and dataset export',
        };
      case '/settings':
        return {
          title: 'Platform Settings & Environment',
          subtitle: 'FastAPI gateway endpoints, LLM credentials, and editor customization',
        };
      default:
        return {
          title: 'CodeShift AI Studio',
          subtitle: 'Prompt engineering code translation platform',
        };
    }
  };

  const checkBackendHealth = async () => {
    setLoadingHealth(true);
    try {
      const data = await TranslationService.getHealth();
      setBackendOnline(data.status === 'healthy');
    } catch (e) {
      setBackendOnline(false);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const meta = getPageMeta();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Persistent / responsive sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        backendOnline={backendOnline}
        provider={settings.defaultProvider}
      />

      {/* Main app body */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Topbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          title={meta.title}
          subtitle={meta.subtitle}
          backendOnline={backendOnline}
          onRefreshHealth={checkBackendHealth}
          loadingHealth={loadingHealth}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>

        <footer className="h-12 border-t border-slate-800/80 bg-slate-950 px-6 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div>CodeShift AI &bull; Academic Prompt Engineering Research</div>
          <div className="flex items-center gap-3">
            <span>Isolation: Host-Safe AST</span>
            <span>&bull;</span>
            <span>Scope: Java ↔ Python</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
