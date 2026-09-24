import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  glow?: 'none' | 'purple' | 'blue' | 'cyan';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  trend,
  glow = 'none',
  className = '',
}) => {
  return (
    <Card glow={glow} className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">{label}</p>
          <h3 className="text-2xl md:text-3xl font-bold font-heading text-slate-100 tracking-tight">{value}</h3>
        </div>
        <div className="p-3 rounded-xl bg-violet-950/60 border border-violet-500/20 text-violet-400 shadow-inner">
          {icon}
        </div>
      </div>

      {(subtext || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          {subtext && <span className="text-slate-400">{subtext}</span>}
          {trend && (
            <span
              className={`font-semibold px-2 py-0.5 rounded-full ${
                trend.positive
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                  : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
              }`}
            >
              {trend.positive ? '↑ ' : '↓ '}
              {trend.value}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
