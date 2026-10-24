import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { AppSettings } from '../api/types';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../services/settingsService';
import {
  Server,
  Cpu,
  ShieldCheck,
  Check,
  RotateCcw,
  Sliders,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleSave = () => {
    saveSettings(settings);
    setSavedNotice('Settings saved successfully! Reloading active preferences...');
    setTimeout(() => {
      setSavedNotice(null);
      window.location.reload();
    }, 1200);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    setSavedNotice('Settings reset to platform defaults.');
    setTimeout(() => setSavedNotice(null), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150 max-w-4xl">
      {/* Page Title */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight">
            Platform Configuration & Environment Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure FastAPI gateway connection, LLM provider routing, and Monaco Editor parameters.
          </p>
        </div>
        <Badge variant="cyan" size="md">
          Client v1.0
        </Badge>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-xl border border-emerald-800 bg-emerald-950/30 text-emerald-300 text-xs flex items-center gap-2 font-mono">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Backend & Gateway Config */}
      <Card
        title="FastAPI Gateway Endpoint"
        subtitle="Specify the backend API server location"
        badge={<Server className="w-4 h-4 text-cyan-400" />}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label
              htmlFor="backend-url"
              className="block font-medium text-slate-300 mb-1.5 font-mono"
            >
              Backend URL:
            </label>
            <input
              id="backend-url"
              type="text"
              value={settings.backendUrl}
              onChange={(e) => setSettings({ ...settings, backendUrl: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="http://localhost:8000"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Default is <code className="text-cyan-400 font-mono">http://localhost:8000</code>. When running Vite with dev proxy, requests to <code className="text-cyan-400 font-mono">/api/v1</code> route automatically.
            </span>
          </div>
        </div>
      </Card>

      {/* LLM Provider Routing */}
      <Card
        title="LLM Provider Configuration"
        subtitle="Manage primary translation and evaluation engine routing"
        badge={<Cpu className="w-4 h-4 text-purple-400" />}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label
              htmlFor="llm-provider"
              className="block font-medium text-slate-300 mb-1.5 font-mono"
            >
              Default Provider:
            </label>
            <select
              id="llm-provider"
              value={settings.defaultProvider}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultProvider: e.target.value as 'mock' | 'gemini' | 'openai',
                })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="mock">Deterministic Mock Provider (Offline & Testing)</option>
              <option value="gemini">Google Gemini API (Backend Configured)</option>
              <option value="openai">OpenAI Compatible API (Backend Configured)</option>
            </select>
            <span className="text-[11px] text-slate-500 mt-1 block">
              API credentials remain securely on the backend in <code className="text-slate-400 font-mono">.env</code>. Frontend never exposes API keys.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label
                htmlFor="gemini-model"
                className="block font-medium text-slate-300 mb-1 font-mono"
              >
                Gemini Model:
              </label>
              <input
                id="gemini-model"
                type="text"
                value={settings.geminiModel}
                onChange={(e) => setSettings({ ...settings, geminiModel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label
                htmlFor="openai-model"
                className="block font-medium text-slate-300 mb-1 font-mono"
              >
                OpenAI Model:
              </label>
              <input
                id="openai-model"
                type="text"
                value={settings.openaiModel}
                onChange={(e) => setSettings({ ...settings, openaiModel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Security & Sandboxing Policies */}
      <Card
        title="Execution & Sandbox Policies"
        subtitle="Hardware isolation and host safety rules"
        badge={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
      >
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/60">
            <div>
              <span className="font-semibold text-slate-200 block">Host Protection Invariant</span>
              <span className="text-[11px] text-slate-400">
                Arbitrary code is never executed directly on the host machine.
              </span>
            </div>
            <Badge variant="emerald" size="sm" dot>
              Enforced
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/60">
            <div>
              <span className="font-semibold text-slate-200 block">Static AST Verification</span>
              <span className="text-[11px] text-slate-400">
                Safe syntactic checks using Python ast and Java javalang parsers.
              </span>
            </div>
            <Badge variant="cyan" size="sm">
              Active
            </Badge>
          </div>
        </div>
      </Card>

      {/* Monaco Code Editor Preferences */}
      <Card
        title="Monaco Editor Preferences"
        subtitle="Customize code font size, tab spacing, and viewing options"
        badge={<Sliders className="w-4 h-4 text-cyan-400" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <label htmlFor="editor-font-size" className="block text-slate-300 mb-1">
              Font Size: {settings.editorFontSize}px
            </label>
            <input
              id="editor-font-size"
              type="range"
              min="11"
              max="18"
              step="1"
              value={settings.editorFontSize}
              onChange={(e) =>
                setSettings({ ...settings, editorFontSize: parseInt(e.target.value) })
              }
              className="w-full accent-cyan-500 bg-slate-800 rounded-lg h-1.5"
            />
          </div>

          <div>
            <label htmlFor="editor-tab-size" className="block text-slate-300 mb-1">
              Tab Size: {settings.editorTabSize} spaces
            </label>
            <select
              id="editor-tab-size"
              value={settings.editorTabSize}
              onChange={(e) =>
                setSettings({ ...settings, editorTabSize: parseInt(e.target.value) })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces (Standard)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950">
            <span className="text-slate-300">Minimap</span>
            <input
              type="checkbox"
              checked={settings.editorMinimap}
              onChange={(e) => setSettings({ ...settings, editorMinimap: e.target.checked })}
              className="accent-cyan-500 w-4 h-4 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950">
            <span className="text-slate-300">Word Wrap</span>
            <input
              type="checkbox"
              checked={settings.editorWordWrap}
              onChange={(e) => setSettings({ ...settings, editorWordWrap: e.target.checked })}
              className="accent-cyan-500 w-4 h-4 rounded cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* Save and Reset Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          icon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Reset to Defaults
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          icon={<Check className="w-4 h-4" />}
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
};
