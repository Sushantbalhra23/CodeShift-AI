import React from 'react';
import { MonacoCodeEditor } from '../editor/MonacoCodeEditor';
import { MonacoDiffEditor } from '../editor/MonacoDiffEditor';
import { Badge } from '../common/Badge';
import { SupportedLanguage, TranslationResponse } from '../../api/types';
import {
  Sparkles,
  Clock,
  Coins,
  CheckCircle2,
  AlertCircle,
  Code2,
} from 'lucide-react';

interface TranslationTabProps {
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  sourceCode: string;
  setSourceCode: (code: string) => void;
  translatedCode: string;
  setTranslatedCode: (code: string) => void;
  translationResult: TranslationResponse | null;
  loading: boolean;
  error: string | null;
  viewMode: 'split' | 'diff';
  onTranslateClick: () => void;
  onLoadDemoTranslation: () => void;
}

export const TranslationTab: React.FC<TranslationTabProps> = ({
  sourceLanguage,
  targetLanguage,
  sourceCode,
  setSourceCode,
  translatedCode,
  setTranslatedCode,
  translationResult,
  loading,
  error,
  viewMode,
  onTranslateClick,
  onLoadDemoTranslation,
}) => {
  return (
    <div className="space-y-4">
      {/* Error state banner */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl border border-rose-800/80 bg-rose-950/30 text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-start sm:items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="font-semibold text-rose-300">Translation Service Notice</p>
              <p className="text-rose-300/80 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={onLoadDemoTranslation}
            className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 border border-rose-700 text-rose-100 font-medium whitespace-nowrap transition"
          >
            Load Demo Translation Preview
          </button>
        </div>
      )}

      {/* Editor Main Canvas */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Source Editor */}
          <MonacoCodeEditor
            title={`Source Code (${sourceLanguage.toUpperCase()})`}
            language={sourceLanguage}
            value={sourceCode}
            onChange={setSourceCode}
            height="520px"
            badge={
              <Badge variant="cyan" size="sm">
                Original Input
              </Badge>
            }
            ariaLabel="Source Code Editor"
          />

          {/* Target Editor / State container */}
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-sm rounded-xl border border-slate-800 p-6 text-center">
                <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
                <h4 className="text-sm font-semibold text-slate-100 mb-1">
                  Synthesizing Target Translation
                </h4>
                <p className="text-xs text-slate-400 max-w-xs font-mono">
                  Executing prompt strategy, enforcing type invariants, and validating AST...
                </p>
              </div>
            )}

            {!loading && !translatedCode ? (
              /* Empty state */
              <div className="h-[520px] rounded-xl border border-dashed border-slate-800 bg-slate-900/40 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500 mb-4 border border-slate-700/60">
                  <Code2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200 mb-1">
                  No Translation Generated Yet
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mb-5 leading-relaxed">
                  Enter or edit your source code on the left, then click{' '}
                  <span className="text-cyan-400 font-mono font-medium">Translate</span> to execute
                  the selected prompt strategy.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={onTranslateClick}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition shadow-sm"
                  >
                    Translate Source Code
                  </button>
                  <button
                    onClick={onLoadDemoTranslation}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                  >
                    Preview Demo Translation
                  </button>
                </div>
              </div>
            ) : (
              /* Success / Candidate state */
              <MonacoCodeEditor
                title={`Translated Code (${targetLanguage.toUpperCase()})`}
                language={targetLanguage}
                value={translatedCode}
                onChange={setTranslatedCode}
                height="520px"
                badge={
                  translationResult?.metadata?.is_demo ? (
                    <Badge variant="demo" size="sm">
                      Demo Data Preview
                    </Badge>
                  ) : translationResult?.metadata?.ast_valid ? (
                    <Badge variant="emerald" size="sm" dot>
                      AST Validated
                    </Badge>
                  ) : translationResult ? (
                    <Badge variant="rose" size="sm">
                      AST Error
                    </Badge>
                  ) : (
                    <Badge variant="purple" size="sm">
                      Candidate Code
                    </Badge>
                  )
                }
                ariaLabel="Translated Code Editor"
              />
            )}
          </div>
        </div>
      ) : (
        /* Diff Editor View */
        <MonacoDiffEditor
          original={sourceCode}
          modified={translatedCode || '// No translated code available for comparison.'}
          originalLanguage={sourceLanguage}
          modifiedLanguage={targetLanguage}
          height="520px"
          badge={
            translationResult?.metadata?.is_demo ? (
              <Badge variant="demo" size="sm">
                Demo Data Preview
              </Badge>
            ) : undefined
          }
        />
      )}

      {/* Success Telemetry Bar */}
      {translationResult && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-300">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Strategy:</span>
              <span className="text-cyan-300 font-semibold capitalize">
                {translationResult.metadata.strategy.replace(/_/g, ' ')}
              </span>
            </span>

            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Latency:</span>
              <span className="text-slate-200">{translationResult.metadata.latency_ms} ms</span>
            </span>

            <span className="flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Tokens:</span>
              <span className="text-slate-200">{translationResult.metadata.total_tokens}</span>
            </span>

            <span className="text-slate-500">
              Model: <span className="text-slate-400">{translationResult.metadata.model}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {translationResult.metadata.is_demo ? (
              <Badge variant="demo" size="sm">
                [Demo Data - Not Live Result]
              </Badge>
            ) : translationResult.metadata.ast_valid ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>AST Syntactically Valid</span>
              </span>
            ) : (
              <span
                className="flex items-center gap-1.5 text-rose-400 font-semibold truncate max-w-xs"
                title={translationResult.metadata.ast_error || 'Syntax Error'}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{translationResult.metadata.ast_error || 'AST Syntax Error'}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
