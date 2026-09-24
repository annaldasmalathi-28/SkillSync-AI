import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { ProgressBar } from '../../components/common/ProgressBar';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Briefcase,
  Layers,
  Sparkles,
  PieChart,
} from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
            Institutional Placement & Skill Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cohort-level telemetry, skill demand vs supply metrics, and corporate hiring insights.
          </p>
        </div>
      </div>

      {/* 3 Metric Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="College Readiness Average"
          value="82.4%"
          subtext="+4.6% vs previous academic term"
          icon={<TrendingUp className="w-5 h-5 text-indigo-400" />}
          glow="purple"
        />
        <StatCard
          label="Proctored Assessments"
          value="480+"
          subtext="SkillSync diagnostic tests passed"
          icon={<Award className="w-5 h-5 text-emerald-400" />}
          glow="cyan"
        />
        <StatCard
          label="Recruiter Offer Rate"
          value="89.2%"
          subtext="Interview to offer conversion"
          icon={<Briefcase className="w-5 h-5 text-cyan-400" />}
          glow="blue"
        />
      </div>

      {/* Skill Demand vs Supply Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white font-heading">Market Demand vs Cohort Supply</h2>
            <Badge variant="cyan">2026 Tech Hiring</Badge>
          </div>

          <div className="space-y-4">
            {[
              { skill: 'React & TypeScript', demand: 94, supply: 88 },
              { skill: 'System Design & Distributed Systems', demand: 92, supply: 64 },
              { skill: 'Cloud & Docker / Kubernetes', demand: 86, supply: 58 },
              { skill: 'Python / AI Frameworks', demand: 90, supply: 76 },
              { skill: 'SQL & Database Optimization', demand: 84, supply: 82 },
            ].map((item) => (
              <div key={item.skill} className="space-y-1.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between text-xs font-semibold text-slate-200">
                  <span>{item.skill}</span>
                  <span className="text-[11px] text-slate-400">
                    Demand: <strong className="text-cyan-400">{item.demand}%</strong> | Supply:{' '}
                    <strong className="text-violet-400">{item.supply}%</strong>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-mono-code mb-0.5">
                      Recruiter Demand
                    </span>
                    <ProgressBar value={item.demand} color="cyan" height="sm" />
                  </div>
                  <div>
                    <span className="text-[10px] text-violet-400 uppercase tracking-wider block font-mono-code mb-0.5">
                      Cohort Proficiency
                    </span>
                    <ProgressBar value={item.supply} color="violet" height="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Target Career Distribution */}
        <Card>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white font-heading">Student Career Aspirations</h2>
            <Badge variant="purple">Department Distribution</Badge>
          </div>

          <div className="space-y-3">
            {[
              { role: 'Full Stack Developer', percentage: 38, count: 54 },
              { role: 'Software Developer', percentage: 28, count: 40 },
              { role: 'Cloud Platform / DevOps Engineer', percentage: 16, count: 23 },
              { role: 'Data Scientist / ML Engineer', percentage: 12, count: 17 },
              { role: 'Cybersecurity Analyst', percentage: 6, count: 8 },
            ].map((career) => (
              <div key={career.role} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{career.role}</span>
                  <span className="font-mono-code text-slate-400">{career.count} Students ({career.percentage}%)</span>
                </div>
                <ProgressBar value={career.percentage * 2} color="violet" height="sm" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
