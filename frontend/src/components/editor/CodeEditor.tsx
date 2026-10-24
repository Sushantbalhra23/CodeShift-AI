import React from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Check, Terminal } from 'lucide-react';

interface CodeEditorProps {
  title: string;
  language: 'java' | 'python';
  value: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
  onLanguageChange?: (lang: 'java' | 'python') => void;
  height?: string;
  badge?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  title,
  language,
  value,
  onChange,
  readOnly = false,
  onLanguageChange,
  height = '480px',
  badge,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-xs tracking-wide uppercase text-slate-300">
            {title}
          </span>
          {badge && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onLanguageChange && (
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as 'java' | 'python')}
              className="bg-slate-950 border border-slate-700 text-xs rounded-md px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="java">Java</option>
              <option value="python">Python</option>
            </select>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 w-full relative">
        <Editor
          height={height}
          language={language}
          value={value}
          onChange={(val) => onChange && onChange(val || '')}
          theme="vs-dark"
          options={{
            readOnly,
            fontSize: 13,
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
};
