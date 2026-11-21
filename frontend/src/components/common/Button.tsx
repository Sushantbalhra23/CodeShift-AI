import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  title?: string;
}

const variantStyles = {
  primary: [
    'bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500',
    'bg-[length:200%_100%] bg-left',
    'hover:bg-right',
    'text-white font-semibold',
    'shadow-[0_0_20px_rgba(6,182,212,0.35)]',
    'hover:shadow-[0_0_30px_rgba(6,182,212,0.55),0_4px_16px_rgba(6,182,212,0.3)]',
    'border border-cyan-400/40',
    'transition-all duration-500',
  ],
  secondary: [
    'bg-slate-800/80 hover:bg-slate-700/80',
    'text-slate-200 hover:text-white',
    'border border-white/[0.08] hover:border-white/[0.15]',
    'shadow-inner-glow',
    'transition-all duration-200',
  ],
  outline: [
    'bg-transparent hover:bg-white/[0.04]',
    'text-slate-300 hover:text-white',
    'border border-white/[0.12] hover:border-cyan-500/40',
    'hover:shadow-[0_0_12px_rgba(6,182,212,0.15)]',
    'transition-all duration-200',
  ],
  ghost: [
    'bg-transparent hover:bg-white/[0.05]',
    'text-slate-400 hover:text-slate-100',
    'border border-transparent',
    'transition-all duration-200',
  ],
  danger: [
    'bg-gradient-to-r from-rose-600 to-red-600',
    'text-white font-semibold',
    'shadow-[0_0_16px_rgba(244,63,94,0.3)]',
    'hover:shadow-[0_0_24px_rgba(244,63,94,0.5)]',
    'border border-rose-500/40',
    'transition-all duration-200',
  ],
  success: [
    'bg-gradient-to-r from-emerald-600 to-teal-600',
    'text-white font-semibold',
    'shadow-[0_0_16px_rgba(16,185,129,0.3)]',
    'hover:shadow-[0_0_24px_rgba(16,185,129,0.5)]',
    'border border-emerald-500/40',
    'transition-all duration-200',
  ],
};

const sizeStyles = {
  xs: 'px-2.5 py-1 text-[11px] rounded-lg gap-1.5',
  sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-2xl gap-2.5',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  type = 'button',
  className,
  title,
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      title={title}
      className={clsx(
        'relative inline-flex items-center justify-center font-medium',
        'select-none whitespace-nowrap',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        sizeStyles[size],
        ...variantStyles[variant],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
    >
      {/* Subtle inner shine overlay for primary */}
      {variant === 'primary' && (
        <span className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      )}

      {loading ? (
        <svg
          className="w-3.5 h-3.5 animate-spin shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}

      <span>{children}</span>

      {iconRight && !loading && (
        <span className="shrink-0">{iconRight}</span>
      )}
    </button>
  );
};
