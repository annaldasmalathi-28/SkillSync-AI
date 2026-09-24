import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: 'violet' | 'cyan' | 'emerald' | 'amber' | 'electric';
  height?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValue = false,
  color = 'violet',
  height = 'md',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  const gradientColors = {
    violet: 'bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-500 shadow-xs shadow-violet-500/50',
    cyan: 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 shadow-xs shadow-cyan-500/50',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-xs shadow-emerald-500/50',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-xs shadow-amber-500/50',
    electric: 'bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 shadow-xs shadow-indigo-500/50',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5 text-xs text-slate-300">
          {label && <span className="font-medium text-slate-300">{label}</span>}
          {showValue && <span className="font-semibold text-violet-300 font-mono-code">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-slate-800/80 ${heightClasses[height]}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${gradientColors[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
