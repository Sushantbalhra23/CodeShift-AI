import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate' | 'demo';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  dot = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-mono',
    md: 'text-xs px-2.5 py-1 font-mono',
  }[size];

  const variantClasses = {
    cyan: 'bg-cyan-950/70 border-cyan-800 text-cyan-300',
    emerald: 'bg-emerald-950/70 border-emerald-800 text-emerald-300',
    amber: 'bg-amber-950/70 border-amber-800 text-amber-300',
    rose: 'bg-rose-950/70 border-rose-800 text-rose-300',
    purple: 'bg-purple-950/70 border-purple-800 text-purple-300',
    slate: 'bg-slate-800/80 border-slate-700 text-slate-300',
    demo: 'bg-indigo-950/80 border-indigo-700 text-indigo-300 font-bold',
  }[variant];

  const dotClasses = {
    cyan: 'bg-cyan-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    purple: 'bg-purple-400',
    slate: 'bg-slate-400',
    demo: 'bg-indigo-400 animate-pulse',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${sizeClasses} ${variantClasses} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotClasses}`} />}
      {children}
    </span>
  );
};
