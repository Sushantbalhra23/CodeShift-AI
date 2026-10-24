import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  badge,
  className = '',
  footer,
}) => {
  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg shadow-black/20 overflow-hidden ${className}`}
    >
      {(title || action || badge) && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2">
              {typeof title === 'string' ? (
                <h3 className="text-sm font-semibold text-slate-200 tracking-tight">{title}</h3>
              ) : (
                title
              )}
              {badge}
            </div>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}

      <div className="p-5">{children}</div>

      {footer && (
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
};
