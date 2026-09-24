import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'purple' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  icon,
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm font-medium';

  const variantStyles = {
    primary: 'bg-violet-950/70 text-violet-300 border border-violet-700/50 shadow-xs shadow-violet-900/30',
    purple: 'bg-purple-950/70 text-purple-300 border border-purple-700/50 shadow-xs shadow-purple-900/30',
    cyan: 'bg-cyan-950/70 text-cyan-300 border border-cyan-700/50 shadow-xs shadow-cyan-900/30',
    emerald: 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/50 shadow-xs shadow-emerald-900/30',
    amber: 'bg-amber-950/70 text-amber-300 border border-amber-700/50 shadow-xs shadow-amber-900/30',
    rose: 'bg-rose-950/70 text-rose-300 border border-rose-700/50 shadow-xs shadow-rose-900/30',
    slate: 'bg-slate-800/80 text-slate-300 border border-slate-700/60',
    outline: 'bg-transparent text-slate-300 border border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium tracking-wide whitespace-nowrap ${sizeClasses} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
