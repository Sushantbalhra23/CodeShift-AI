import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Check, Terminal } from 'lucide-react';
import { loadSettings } from '../../services/settingsService';

export interface MonacoCodeEditorProps {
  title: string;
  language: 'java' | 'python';
  value: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
  height?: string;
  badge?: React.ReactNode;
  ariaLabel?: string;
  placeholder?: string;
}

export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  title,
  language,
  value,
  onChange,
  readOnly = false,
  height = '480px',
  badge,
  ariaLabel,
}) => {
  const [copied, setCopied] = useState(false);
  const settings = loadSettings();

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = value ? value.split('\n').length : 0;
  const charCount = value ? value.length : 0;

  return (
    <div
      role="region"
      aria-label={ariaLabel || title}
      className="flex flex-col rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl"
    >
      {/* Editor top control bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-semibold text-xs tracking-wide uppercase text-slate-200 truncate">
            {title}
          </span>
          {badge}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-500">
            <span>{lineCount} lines</span>
            <span>&bull;</span>
            <span>{charCount} chars</span>
          </div>

          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
            {language}
          </span>

          <button
            onClick={handleCopy}
            disabled={!value}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-40 rounded transition"
            title="Copy code to clipboard"
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 w-full relative bg-[#1e1e1e]">
        <Editor
          height={height}
          language={language}
          value={value}
          onChange={(val) => onChange && onChange(val || '')}
          theme="vs-dark"
          options={{
            readOnly,
            fontSize: settings.editorFontSize || 13,
            tabSize: settings.editorTabSize || 4,
            minimap: { enabled: settings.editorMinimap || false },
            wordWrap: settings.editorWordWrap ? 'on' : 'off',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
};
