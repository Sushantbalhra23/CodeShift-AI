import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  glowColor?: 'cyan' | 'blue' | 'purple' | 'emerald' | 'amber' | 'none';
  noPadding?: boolean;
  onClick?: () => void;
}

const glowMap = {
  cyan: 'hover:shadow-glow-cyan hover:border-cyan-500/30',
  blue: 'hover:shadow-glow-blue hover:border-blue-500/30',
  purple: 'hover:shadow-glow-purple hover:border-purple-500/30',
  emerald: 'hover:shadow-glow-emerald hover:border-emerald-500/30',
  amber: 'hover:border-amber-500/30',
  none: '',
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  subtitle,
  badge,
  glowColor = 'cyan',
  noPadding = false,
  onClick,
}) => {
  const hasHeader = title || subtitle || badge;

  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-2xl border border-white/[0.06] bg-[#07101f]/80 backdrop-blur-md',
        'shadow-[0_4px_24px_rgba(0,0,0,0.5)] transition-all duration-300',
        glowColor !== 'none' && glowMap[glowColor],
        onClick && 'cursor-pointer',
        className
      )}
    >
      {hasHeader && (
        <div className="px-5 pt-4 pb-3 border-b border-white/[0.05]">
          <div className="flex items-center justify-between gap-3">
            <div>
              {title && (
                <h3 className="text-sm font-semibold text-slate-100 tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
        </div>
      )}
      <div className={clsx(!noPadding && (hasHeader ? 'p-5' : 'p-5'))}>
        {children}
      </div>
    </div>
  );
};
