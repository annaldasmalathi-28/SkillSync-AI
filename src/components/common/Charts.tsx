import React from 'react';

interface ReadinessGaugeProps {
  score: number; // 0 - 100
  size?: number;
  label?: string;
  showTier?: boolean;
}

export const ReadinessGauge: React.FC<ReadinessGaugeProps> = ({
  score,
  size = 180,
  label = 'Career Readiness Score',
  showTier = true,
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let tier = 'Developing';
  let tierColor = 'text-amber-400 border-amber-500/30 bg-amber-950/40';
  if (clampedScore >= 80) {
    tier = 'Industry Ready';
    tierColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40';
  } else if (clampedScore >= 65) {
    tier = 'Competitive Candidate';
    tierColor = 'text-violet-300 border-violet-500/30 bg-violet-950/40';
  }

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <defs>
            <linearGradient id="cyberGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1E293B"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#cyberGaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            filter="url(#gaugeGlow)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl md:text-4xl font-extrabold font-heading text-white tracking-tight">
            {clampedScore}
            <span className="text-lg font-normal text-violet-400">%</span>
          </span>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
            Index
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-200">{label}</p>
      {showTier && (
        <span className={`mt-1.5 px-3 py-0.5 text-xs font-semibold rounded-full border ${tierColor}`}>
          {tier}
        </span>
      )}
    </div>
  );
};

interface SkillRadarProps {
  skills: { name: string; studentScore: number; targetScore: number }[];
}

export const SkillRadarChart: React.FC<SkillRadarProps> = ({ skills }) => {
  const size = 260;
  const center = size / 2;
  const radius = 95;
  const numAxes = skills.length || 6;
  const angleStep = (2 * Math.PI) / numAxes;

  // Grid levels (25%, 50%, 75%, 100%)
  const levels = [0.25, 0.5, 0.75, 1.0];

  // Calculate coordinates for student score polygon
  const studentPoints = skills
    .map((s, i) => {
      const r = (s.studentScore / 100) * radius;
      const angle = i * angleStep - Math.PI / 2;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');

  // Calculate coordinates for target benchmark polygon
  const targetPoints = skills
    .map((s, i) => {
      const r = (s.targetScore / 100) * radius;
      const angle = i * angleStep - Math.PI / 2;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        <defs>
          <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0.45)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0.2)" />
          </linearGradient>
        </defs>

        {/* Concentric grid circles */}
        {levels.map((lvl, idx) => (
          <polygon
            key={idx}
            points={skills
              .map((_, i) => {
                const r = lvl * radius;
                const angle = i * angleStep - Math.PI / 2;
                return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
              })
              .join(' ')}
            fill="transparent"
            stroke="#1E293B"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {skills.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#1E293B"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          );
        })}

        {/* Target Benchmark polygon (dotted) */}
        <polygon
          points={targetPoints}
          fill="transparent"
          stroke="#475569"
          strokeWidth="1.5"
          strokeDasharray="3,3"
        />

        {/* Student Verified Score Polygon */}
        <polygon
          points={studentPoints}
          fill="url(#radarFill)"
          stroke="#A855F7"
          strokeWidth="2"
        />

        {/* Vertices and Labels */}
        {skills.map((s, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelRadius = radius + 22;
          const lx = center + labelRadius * Math.cos(angle);
          const ly = center + labelRadius * Math.sin(angle);

          const r = (s.studentScore / 100) * radius;
          const px = center + r * Math.cos(angle);
          const py = center + r * Math.sin(angle);

          return (
            <g key={i}>
              <circle cx={px} cy={py} r="4" fill="#38BDF8" stroke="#0F172A" strokeWidth="2" />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[10px] fill-slate-300 font-medium font-heading"
              >
                {s.name.length > 12 ? s.name.substring(0, 10) + '..' : s.name}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex items-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-violet-500 shadow-xs shadow-violet-500/50" />
          <span className="text-slate-300 font-medium">Your Verified Score</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border border-dashed border-slate-400" />
          <span className="text-slate-400">Industry Target</span>
        </div>
      </div>
    </div>
  );
};

interface ProgressHistoryProps {
  data?: { week: string; score: number }[];
}

export const ProgressHistoryChart: React.FC<ProgressHistoryProps> = ({
  data = [
    { week: 'W1', score: 45 },
    { week: 'W2', score: 52 },
    { week: 'W3', score: 60 },
    { week: 'W4', score: 68 },
    { week: 'W5', score: 74 },
    { week: 'W6', score: 82 },
  ],
}) => {
  const height = 140;
  const width = 340;
  const padding = 25;

  const maxScore = 100;
  const minScore = 30;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((d.score - minScore) / (maxScore - minScore)) * (height - 2 * padding);
    return { x, y, score: d.score, week: d.week };
  });

  const pathD = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="w-full flex flex-col items-center">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="progressArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(124, 58, 237, 0.4)" />
            <stop offset="100%" stopColor="rgba(14, 165, 233, 0.0)" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
          const y = height - padding - ratio * (height - 2 * padding);
          return (
            <line
              key={idx}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#1E293B"
              strokeDasharray="3,3"
            />
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#progressArea)" />

        {/* Line stroke */}
        <path d={pathD} fill="transparent" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#38BDF8" stroke="#060913" strokeWidth="2" />
            <text
              x={p.x}
              y={height - 6}
              textAnchor="middle"
              className="text-[10px] fill-slate-400 font-mono-code"
            >
              {p.week}
            </text>
            <text
              x={p.x}
              y={p.y - 8}
              textAnchor="middle"
              className="text-[9px] fill-violet-300 font-bold font-mono-code"
            >
              {p.score}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};
