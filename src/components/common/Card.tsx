import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'none' | 'purple' | 'blue' | 'cyan';
  hoverEffect?: boolean;
  onClick?: () => void;
  id?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = 'none',
  hoverEffect = false,
  onClick,
  id,
}) => {
  const glowClasses = {
    none: '',
    purple: 'glow-purple border-purple-500/30',
    blue: 'glow-blue border-blue-500/30',
    cyan: 'glow-cyan border-cyan-500/30',
  };

  const hoverClass = hoverEffect
    ? 'transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-950/40 cursor-pointer'
    : '';

  return (
    <div
      id={id}
      onClick={onClick}
      className={`glass-panel rounded-2xl p-5 md:p-6 text-slate-100 relative overflow-hidden transition-colors ${glowClasses[glow]} ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
};
