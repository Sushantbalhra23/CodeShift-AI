import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'slate' | 'demo' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

const variantStyles: Record<string, string> = {
  cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25 ring-cyan-500/10',
  blue: 'bg-blue-500/10 text-blue-300 border-blue-500/25 ring-blue-500/10',
  purple: 'bg-purple-500/10 text-purple-300 border-purple-500/25 ring-purple-500/10',
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25 ring-emerald-500/10',
  amber: 'bg-amber-500/10 text-amber-300 border-amber-500/25 ring-amber-500/10',
  rose: 'bg-rose-500/10 text-rose-300 border-rose-500/25 ring-rose-500/10',
  slate: 'bg-slate-800/60 text-slate-400 border-white/[0.08]',
  demo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25',
  gradient: 'bg-transparent text-white border-transparent',
};

const dotColors: Record<string, string> = {
  cyan: 'bg-cyan-400',
  blue: 'bg-blue-400',
  purple: 'bg-purple-400',
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
  rose: 'bg-rose-400',
  slate: 'bg-slate-500',
  demo: 'bg-indigo-400',
  gradient: 'bg-white',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px] rounded-md gap-1.5',
  md: 'px-2.5 py-1 text-xs rounded-lg gap-2',
  lg: 'px-3 py-1.5 text-sm rounded-xl gap-2',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  dot = false,
  pulse = false,
  className,
}) => {
  if (variant === 'gradient') {
    return (
      <span
        className={clsx(
          'inline-flex items-center font-mono font-semibold',
          'bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400',
          '-webkit-background-clip-text bg-clip-text',
          '[background-clip:text] [-webkit-text-fill-color:transparent]',
          sizeStyles[size],
          className
        )}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center font-mono font-semibold border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span className="relative inline-flex">
          {pulse && (
            <span
              className={clsx(
                'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
                dotColors[variant]
              )}
            />
          )}
          <span
            className={clsx(
              'relative inline-flex rounded-full w-1.5 h-1.5',
              dotColors[variant]
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
};
