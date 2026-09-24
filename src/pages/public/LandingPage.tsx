import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  ShieldCheck,
  Target,
  Briefcase,
  Compass,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Zap,
  TrendingUp,
  Award,
} from 'lucide-react';
import { GlowButton } from '../../components/common/GlowButton';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { TARGET_CAREERS } from '../../services/careerMatrix';

export const LandingPage: React.FC = () => {
  const { navigate } = useNavigation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 relative overflow-hidden">
      {/* Background Cyber Grid Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-3xl" />
        <div className="absolute -top-20 right-1/4 w-[450px] h-[450px] bg-cyan-600/15 rounded-full blur-3xl" />
      </div>

      {/* Main Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-violet-500/30 text-xs font-semibold text-violet-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next-Gen Student Career Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold font-heading tracking-tight text-white leading-tight">
            Verify Skills. <br />
            <span className="cyber-gradient-text">Identify Gaps.</span> <br />
            Build High-Impact Careers.
          </h1>

          <p className="text-base sm:text-lg text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto">
            SkillSync AI empowers college students to objectively benchmark coding skills, discover real-time curriculum gaps against industry standards, and fast-track top tech internships.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <GlowButton
              size="lg"
              onClick={() => navigate(user ? '/dashboard' : '/signup')}
              icon={<ArrowRight className="w-5 h-5" />}
            >
              {user ? 'Go to My Dashboard' : 'Get Started Free'}
            </GlowButton>
            <GlowButton
              variant="secondary"
              size="lg"
              onClick={() => navigate('/login')}
              icon={<Zap className="w-4 h-4 text-cyan-400" />}
            >
              Explore Live Demo
            </GlowButton>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 text-xs text-slate-400 border-t border-slate-800/80 max-w-lg mx-auto">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Real Supabase Persistence</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Objective Diagnostic Tests</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% Student Focused</span>
            </div>
          </div>
        </div>

        {/* Cyber Hero Dashboard Mockup Card */}
        <div className="mt-16 relative">
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-violet-500/30 shadow-2xl shadow-violet-950/60 max-w-5xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600/30 border border-violet-400/40 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white font-heading">Live Career Readiness Engine</h2>
                  <p className="text-xs text-slate-400">Target Role: Software Developer • Stanford Univ.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="emerald" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                  Verification Active
                </Badge>
                <Badge variant="cyan">82% Readiness Index</Badge>
              </div>
            </div>

            {/* Quick 3-Pillar preview inside hero card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400">Verified Skills</span>
                  <Award className="w-4 h-4 text-violet-400" />
                </div>
                <div className="text-2xl font-bold text-white font-heading">4 / 6 Verified</div>
                <p className="text-[11px] text-emerald-400 mt-1">TypeScript (92%), React (95%), Python (84%)</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400">Identified Gaps</span>
                  <Target className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-amber-400 font-heading">2 Moderate Gaps</div>
                <p className="text-[11px] text-slate-400 mt-1">SQL Optimization & Docker Containers</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400">Internship Matches</span>
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-cyan-400 font-heading">88% Avg Match</div>
                <p className="text-[11px] text-slate-400 mt-1">6 Active Opportunities Filtered</p>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Core Functional Modules */}
        <div className="mt-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              Complete End-to-End Career Architecture
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Everything college students need to bridge the gap between academic theory and high-paying tech placements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card glow="purple" className="flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-violet-950/80 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-heading mb-2">Skill Verification Tests</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Take multi-stage diagnostic assessments across React, Python, DSA, SQL, and DevOps. Earn verifiable badges backed by detailed strengths breakdowns.
                </p>
              </div>
              <button
                onClick={() => navigate('/verification')}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300 hover:text-violet-200 cursor-pointer"
              >
                Try Assessment <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Card>

            <Card glow="cyan" className="flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-heading mb-2">Skill Gap Analysis</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Compare your verified competencies against 9 top target tech roles. Get high-priority action alerts and customized milestone suggestions.
                </p>
              </div>
              <button
                onClick={() => navigate('/skill-gap')}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 cursor-pointer"
              >
                Inspect Gaps <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Card>

            <Card glow="blue" className="flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-heading mb-2">Dynamic Roadmaps</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  6-phase curated learning trajectories covering data structures, distributed architectures, database transactions, and technical interview mock patterns.
                </p>
              </div>
              <button
                onClick={() => navigate('/roadmap')}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-indigo-200 cursor-pointer"
              >
                View Roadmap <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Card>
          </div>
        </div>

        {/* Target Careers Grid */}
        <div className="mt-28">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              Target Top Industry Roles
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Select your career path to unlock tailored roadmaps, project recommendations, and vetted internships.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TARGET_CAREERS.map((c) => (
              <div
                key={c.title}
                onClick={() => navigate('/career')}
                className="p-5 rounded-2xl glass-panel glass-panel-hover border border-slate-800 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white font-heading">{c.title}</h3>
                  <Badge variant="cyan" size="sm">{c.marketDemand}</Badge>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">{c.description}</p>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
                  <span className="text-slate-400 font-mono-code">{c.averageSalary}</span>
                  <span className="text-violet-300 font-medium text-[11px] flex items-center gap-1">
                    {c.growthRate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Footer */}
        <div className="mt-28 p-8 md:p-12 rounded-3xl bg-gradient-to-r from-violet-950/80 via-indigo-950/90 to-[#0B0F19] border border-violet-500/30 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-3xl font-bold font-heading text-white">
              Ready to Accelerate Your Tech Career?
            </h2>
            <p className="text-sm text-slate-300">
              Join thousands of undergraduate and graduate engineering students using SkillSync AI to land dream internships.
            </p>
            <div className="pt-4 flex items-center justify-center gap-4">
              <GlowButton size="lg" onClick={() => navigate('/signup')}>
                Create Free Student Account
              </GlowButton>
              <GlowButton variant="secondary" size="lg" onClick={() => navigate('/admin/login')}>
                Admin Portal
              </GlowButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
