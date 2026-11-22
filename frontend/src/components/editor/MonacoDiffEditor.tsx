import React from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { GitCompare } from 'lucide-react';
import { loadSettings } from '../../services/settingsService';

export interface MonacoDiffEditorProps {
  original: string;
  modified: string;
  originalLanguage: string;
  modifiedLanguage: string;
  height?: string;
  title?: string;
  badge?: React.ReactNode;
  renderSideBySide?: boolean;
}

export const MonacoDiffEditor: React.FC<MonacoDiffEditorProps> = ({
  original,
  modified,
  originalLanguage,
  modifiedLanguage,
  height = '480px',
  title = 'Structural & Syntactic Diff View',
  badge,
  renderSideBySide = true,
}) => {
  const settings = loadSettings();

  return (
    <div
      role="region"
      aria-label="Code Diff Viewer"
      className="flex flex-col rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl"
    >
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-semibold text-xs tracking-wide uppercase text-slate-200">
            {title}
          </span>
          {badge}
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Original ({originalLanguage})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Target ({modifiedLanguage})
          </span>
        </div>
      </div>

      <div className="flex-1 w-full relative bg-[#1e1e1e]">
        <DiffEditor
          height={height}
          original={original}
          modified={modified}
          language={modifiedLanguage}
          theme="vs-dark"
          options={{
            readOnly: true,
            fontSize: settings.editorFontSize || 13,
            lineNumbers: 'on',
            minimap: { enabled: false },
            renderSideBySide,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: settings.editorWordWrap ? 'on' : 'off',
          }}
        />
      </div>
    </div>
  );
};
