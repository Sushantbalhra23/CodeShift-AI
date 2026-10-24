import React from 'react';
import { SAMPLE_PROGRAMS, SampleProgram } from '../../data/samplePrograms';
import { BookOpen, Sparkles } from 'lucide-react';
import { SupportedLanguage } from '../../api/types';

interface SampleSelectorProps {
  onSelectSample: (sample: SampleProgram) => void;
  currentSourceLanguage?: SupportedLanguage;
}

export const SampleSelector: React.FC<SampleSelectorProps> = ({
  onSelectSample,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
        <span>Load Sample:</span>
      </span>

      <div className="flex flex-wrap items-center gap-1.5">
        {SAMPLE_PROGRAMS.map((sample) => (
          <button
            key={sample.id}
            onClick={() => onSelectSample(sample)}
            className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 hover:border-cyan-500/50 hover:bg-slate-800/80 text-xs text-slate-300 hover:text-white transition flex items-center gap-1"
            title={`${sample.category}: ${sample.description}`}
          >
            <Sparkles className="w-3 h-3 text-cyan-400/80" />
            <span>{sample.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
