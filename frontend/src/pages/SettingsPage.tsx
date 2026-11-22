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
  Lock,
  Code2,
  Globe,
} from 'lucide-react';

const SettingRow: React.FC<{ label: string; desc?: string; children: React.ReactNode }> = ({
  label,
  desc,
  children,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 border-b border-white/[0.05] last:border-0">
    <div>
      <p className="text-xs font-semibold text-slate-200 font-mono">{label}</p>
      {desc && <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{desc}</p>}
    </div>
    <div className="sm:w-64 shrink-0">{children}</div>
  </div>
);

const inputStyle = {
  background: 'rgba(3,6,15,0.9)',
  border: '1px solid rgba(99,125,180,0.15)',
  color: '#cbd5e1',
  borderRadius: '10px',
  padding: '8px 12px',
  fontSize: '12px',
  fontFamily: 'JetBrains Mono, monospace',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const selectStyle = {
  ...inputStyle,
  appearance: 'none' as const,
  WebkitAppearance: 'none' as const,
};

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleSave = () => {
    saveSettings(settings);
    setSavedNotice('Settings saved successfully!');
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

  const providerBadge = {
    mock: { label: 'Mock (Offline)', variant: 'slate' as const, color: '#94a3b8' },
    gemini: { label: 'Google Gemini', variant: 'cyan' as const, color: '#06b6d4' },
    openai: { label: 'OpenAI', variant: 'emerald' as const, color: '#10b981' },
  };

  const currentProvider = providerBadge[settings.defaultProvider as keyof typeof providerBadge] || providerBadge.mock;

  return (
    <div className="space-y-8 animate-fade-in-up max-w-4xl">
      {/* Page Header */}
      <div
        className="rounded-3xl p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
        style={{
          background: 'linear-gradient(135deg, rgba(5,12,30,0.95) 0%, rgba(8,15,38,0.9) 100%)',
          border: '1px solid rgba(99,125,180,0.12)',
        }}
      >
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-2">
            Platform Configuration
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Configure FastAPI gateway, LLM provider routing, and Monaco Editor preferences.
            API credentials stay securely on the backend — never exposed to the client.
          </p>
        </div>
        <Badge variant="cyan" size="md">Client v1.0</Badge>
      </div>

      {/* Saved Notice */}
      {savedNotice && (
        <div
          className="p-4 rounded-xl flex items-center gap-3 text-sm font-mono animate-fade-in-up"
          style={{
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.25)',
            color: '#6ee7b7',
          }}
        >
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* ═══ FastAPI Gateway ═══ */}
      <Card
        title="FastAPI Gateway Endpoint"
        subtitle="Backend API server location for translation and health checks"
        badge={<Server className="w-4 h-4 text-cyan-400" />}
        glowColor="cyan"
      >
        <SettingRow
          label="Backend URL"
          desc={`Default: http://localhost:8000. Vite dev proxy auto-routes /api/v1 requests.`}
        >
          <input
            id="backend-url"
            type="text"
            value={settings.backendUrl}
            onChange={(e) => setSettings({ ...settings, backendUrl: e.target.value })}
            style={inputStyle}
            placeholder="http://localhost:8000"
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(6,182,212,0.5)';
              e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.08)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(99,125,180,0.15)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </SettingRow>
      </Card>

      {/* ═══ LLM Provider ═══ */}
      <Card
        title="LLM Provider Configuration"
        subtitle="Primary translation and evaluation engine routing"
        badge={<Cpu className="w-4 h-4 text-purple-400" />}
        glowColor="purple"
      >
        <div className="space-y-1">
          <SettingRow
            label="Default Provider"
            desc="API credentials stay on the backend in .env — the frontend never sees keys."
          >
            <div className="relative">
              <select
                id="llm-provider"
                value={settings.defaultProvider}
                onChange={(e) =>
                  setSettings({ ...settings, defaultProvider: e.target.value as 'mock' | 'gemini' | 'openai' })
                }
                style={selectStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(139,92,246,0.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(99,125,180,0.15)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="mock">Mock Provider (Offline / Testing)</option>
                <option value="gemini">Google Gemini API</option>
                <option value="openai">OpenAI Compatible API</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Badge variant={currentProvider.variant} size="sm">{currentProvider.label}</Badge>
              </div>
            </div>
          </SettingRow>

          <SettingRow label="Gemini Model" desc="Model name for Gemini provider (backend .env takes precedence)">
            <input
              type="text"
              value={settings.geminiModel}
              onChange={(e) => setSettings({ ...settings, geminiModel: e.target.value })}
              style={inputStyle}
              placeholder="gemini-2.5-flash"
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(6,182,212,0.5)';
                e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(99,125,180,0.15)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </SettingRow>

          <SettingRow label="OpenAI Model" desc="Model name for OpenAI provider">
            <input
              type="text"
              value={settings.openaiModel}
              onChange={(e) => setSettings({ ...settings, openaiModel: e.target.value })}
              style={inputStyle}
              placeholder="gpt-4o"
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(6,182,212,0.5)';
                e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(99,125,180,0.15)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </SettingRow>
        </div>
      </Card>

      {/* ═══ Security Policies ═══ */}
      <Card
        title="Security & Sandbox Policies"
        subtitle="Host isolation invariants — always enforced"
        badge={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
        glowColor="emerald"
      >
        <div className="space-y-2.5">
          {[
            {
              icon: Lock,
              color: 'text-emerald-400',
              glow: 'rgba(16,185,129,0.1)',
              border: 'rgba(16,185,129,0.2)',
              label: 'Host Protection Invariant',
              desc: 'Arbitrary code is never executed directly on the host machine via exec() or subprocess.',
              status: { label: 'Enforced', variant: 'emerald' as const, dot: true },
            },
            {
              icon: Code2,
              color: 'text-cyan-400',
              glow: 'rgba(6,182,212,0.08)',
              border: 'rgba(6,182,212,0.15)',
              label: 'Static AST Verification',
              desc: 'Syntax validated via Python ast.parse() and Java javalang — zero execution.',
              status: { label: 'Active', variant: 'cyan' as const, dot: false },
            },
            {
              icon: Globe,
              color: 'text-slate-400',
              glow: 'rgba(148,163,184,0.06)',
              border: 'rgba(148,163,184,0.12)',
              label: 'API Key Isolation',
              desc: 'Frontend never receives LLM API credentials. Keys stored server-side only.',
              status: { label: 'Guaranteed', variant: 'slate' as const, dot: false },
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-xl"
                style={{
                  background: item.glow,
                  border: `1px solid ${item.border}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{item.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <Badge variant={item.status.variant} size="sm" dot={item.status.dot}>
                  {item.status.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ═══ Monaco Editor ═══ */}
      <Card
        title="Monaco Editor Preferences"
        subtitle="Font size, tab spacing, minimap, and word wrap settings"
        badge={<Sliders className="w-4 h-4 text-cyan-400" />}
        glowColor="blue"
      >
        <div className="space-y-1">
          <SettingRow label={`Font Size: ${settings.editorFontSize}px`} desc="Code editor font size (11–18px)">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-500">11</span>
              <input
                type="range"
                min="11" max="18" step="1"
                value={settings.editorFontSize}
                onChange={(e) => setSettings({ ...settings, editorFontSize: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-[11px] font-mono text-slate-500">18</span>
            </div>
          </SettingRow>

          <SettingRow label="Tab Size" desc="Indentation spaces in Monaco Editor">
            <select
              value={settings.editorTabSize}
              onChange={(e) => setSettings({ ...settings, editorTabSize: parseInt(e.target.value) })}
              style={selectStyle}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(6,182,212,0.5)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(99,125,180,0.15)'; }}
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces (Standard)</option>
            </select>
          </SettingRow>

          <SettingRow label="Minimap" desc="Show minimap overview in Monaco Editor">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.editorMinimap}
                onChange={(e) => setSettings({ ...settings, editorMinimap: e.target.checked })}
                className="sr-only"
              />
              <div
                className="w-10 h-5 rounded-full transition-all duration-200 relative"
                style={{ background: settings.editorMinimap ? '#06b6d4' : 'rgba(99,125,180,0.2)' }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
                  style={{ transform: settings.editorMinimap ? 'translateX(22px)' : 'translateX(2px)' }}
                />
              </div>
            </label>
          </SettingRow>

          <SettingRow label="Word Wrap" desc="Soft wrap long lines in the editor">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.editorWordWrap}
                onChange={(e) => setSettings({ ...settings, editorWordWrap: e.target.checked })}
                className="sr-only"
              />
              <div
                className="w-10 h-5 rounded-full transition-all duration-200 relative"
                style={{ background: settings.editorWordWrap ? '#06b6d4' : 'rgba(99,125,180,0.2)' }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
                  style={{ transform: settings.editorWordWrap ? 'translateX(22px)' : 'translateX(2px)' }}
                />
              </div>
            </label>
          </SettingRow>
        </div>
      </Card>

      {/* Save + Reset Actions */}
      <div
        className="flex items-center justify-between p-5 rounded-2xl"
        style={{
          background: 'rgba(7,14,32,0.6)',
          border: '1px solid rgba(99,125,180,0.1)',
        }}
      >
        <div>
          <p className="text-xs font-semibold text-slate-200">Save Configuration</p>
          <p className="text-[11px] text-slate-500">Changes are persisted to localStorage and applied on reload.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset Defaults
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            icon={<Check className="w-3.5 h-3.5" />}
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
};
