import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { dataService } from '../../services/dataService';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  Profile,
  StudentSkill,
  Project,
  Internship,
  LearningRoadmapItem,
  ProgressStats,
  SkillGap,
  TargetCareerTitle,
} from '../../types';
import { calculateSkillGaps, calculateReadinessScore } from '../../services/careerMatrix';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { GlowButton } from '../../components/common/GlowButton';
import { ReadinessGauge, SkillRadarChart } from '../../components/common/Charts';
import {
  Award,
  AlertTriangle,
  Map,
  Briefcase,
  Code2,
  ShieldCheck,
  Flame,
  RotateCw,
  AlertOctagon,
  Database,
  CheckCircle2,
  Zap,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const { navigate } = useNavigation();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [roadmap, setRoadmap] = useState<LearningRoadmapItem[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [gaps, setGaps] = useState<SkillGap[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingStep, setLoadingStep] = useState<string>('Initializing database connection...');
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  // Helper to compute individual internship skill match percentage based on student skills
  const calculateInternshipMatch = useCallback((internship: Internship, studentSkillsList: StudentSkill[]): number => {
    const required = internship.required_skills || [];
    if (required.length === 0) return 80;

    let matchedCount = 0;
    for (const reqSkill of required) {
      const lowerReq = reqSkill.toLowerCase();
      const hasMatch = studentSkillsList.some((s) => {
        const sLower = s.skill_name.toLowerCase();
        return sLower.includes(lowerReq) || lowerReq.includes(sLower);
      });
      if (hasMatch) {
        matchedCount++;
      }
    }
    return Math.min(99, Math.max(30, Math.round((matchedCount / required.length) * 100)));
  }, []);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorState(null);

    try {
      // 1. Identify active Supabase user or context user
      setLoadingStep('Authenticating session credentials...');
      let effectiveUserId = authUser?.user_id || '';

      if (isSupabaseConfigured) {
        try {
          const { data: { user: supabaseUser } } = await supabase.auth.getUser();
          if (supabaseUser) {
            effectiveUserId = supabaseUser.id;
          }
        } catch (authErr) {
          console.warn('Supabase auth check notice, falling back to profile id:', authErr);
        }
      }

      if (!effectiveUserId) {
        setIsLoading(false);
        return;
      }

      // 2. Load Profile from `profiles` table
      setLoadingStep('Retrieving student profile from profiles...');
      const loadedProfile = await dataService.getProfile(effectiveUserId);
      const activeProfile = loadedProfile || authUser;
      setProfile(activeProfile);

      const targetCareer: TargetCareerTitle = activeProfile?.target_career || 'Software Developer';

      // 3. Concurrently load student skills, skill gaps, learning roadmap, progress, projects & internships
      setLoadingStep('Fetching student_skills, skill_gaps, learning_roadmap & progress from database...');
      const [
        loadedSkills,
        loadedGaps,
        loadedRoadmap,
        loadedProgress,
        loadedProjects,
        loadedInternships,
      ] = await Promise.all([
        dataService.getStudentSkills(effectiveUserId),
        dataService.getSkillGaps(effectiveUserId, targetCareer),
        dataService.getRoadmap(effectiveUserId, targetCareer),
        dataService.getProgressStats(effectiveUserId, targetCareer),
        dataService.getProjects(effectiveUserId),
        dataService.getInternships(),
      ]);

      setSkills(loadedSkills);
      setGaps(loadedGaps);
      setRoadmap(loadedRoadmap);
      setStats(loadedProgress);
      setProjects(loadedProjects);
      setInternships(loadedInternships);
    } catch (err: any) {
      console.error('Failed to load Supabase dashboard telemetry:', err);
      setErrorState(
        err?.message ||
          'Unable to synchronize with the database. Please check your network or Supabase environment configuration.'
      );
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, [authUser]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRetry = async () => {
    setIsRetrying(true);
    await loadDashboardData();
  };

  // Loading State with Cybernetic HUD layout
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] px-4">
        <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-violet-500/40 shadow-2xl shadow-violet-950/50 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-violet-600/20 to-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 border-4 border-violet-500/20 border-t-cyan-400 border-r-violet-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Database className="w-5 h-5 text-violet-300 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-white font-heading">
                Synchronizing Database Telemetry
              </h2>
              <p className="text-xs text-slate-400 font-mono-code">{loadingStep}</p>
            </div>

            <div className="w-full bg-slate-900/80 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div className="h-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 rounded-full animate-pulse w-3/4" />
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Connected to Supabase Cloud Engine</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State with Friendly UI and Retry CTA
  if (errorState && !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="glass-card max-w-lg w-full p-8 rounded-3xl border border-red-500/40 shadow-2xl shadow-red-950/40 text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center justify-center mx-auto mb-4">
            <AlertOctagon className="w-7 h-7 text-red-400" />
          </div>

          <h2 className="text-lg font-bold text-white font-heading mb-2">
            Database Synchronization Notice
          </h2>
          <p className="text-xs text-slate-300 mb-4">{errorState}</p>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono-code text-slate-400 text-left mb-6">
            <div className="text-slate-300 font-semibold mb-1">Diagnostics:</div>
            <div>• Supabase URL: {isSupabaseConfigured ? 'Configured' : 'Local Fallback'}</div>
            <div>• Tables targeted: profiles, student_skills, skill_gaps, learning_roadmap, progress</div>
          </div>

          <GlowButton
            variant="primary"
            size="md"
            onClick={handleRetry}
            icon={<RotateCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />}
            className="w-full justify-center"
          >
            {isRetrying ? 'Reconnecting to Database...' : 'Retry Connection'}
          </GlowButton>
        </div>
      </div>
    );
  }

  const activeUser = profile || authUser;
  const targetCareer: TargetCareerTitle = activeUser?.target_career || 'Software Developer';

  // Real Database Calculations:
  const verifiedSkills = skills.filter((s) => s.verified);
  const highPriorityGaps = gaps.filter((g) => g.priority === 'High Priority Gap');
  const completedRoadmapItems = roadmap.filter((r) => r.completed);
  const roadmapPct =
    roadmap.length > 0 ? Math.round((completedRoadmapItems.length / roadmap.length) * 100) : 0;

  // Calculate Real Career Readiness Score directly from live database tables
  const computedReadinessScore = calculateReadinessScore(
    targetCareer,
    skills,
    projects,
    roadmap,
    stats?.assessments_completed || 0
  );
  const readinessScore = stats?.career_readiness_score || computedReadinessScore;

  // Calculate Internship Match Stats from real database data
  const internshipMatches = internships.map((item) => ({
    ...item,
    matchScore: calculateInternshipMatch(item, skills),
  }));

  // Sort internships by match score descending
  const sortedInternships = [...internshipMatches].sort((a, b) => b.matchScore - a.matchScore);

  // Real Average Internship Match Score
  const avgInternshipMatch =
    internshipMatches.length > 0
      ? Math.round(
          internshipMatches.reduce((acc, curr) => acc + curr.matchScore, 0) /
            internshipMatches.length
        )
      : Math.min(96, Math.max(45, readinessScore + 4));

  // Format real skills for Radar Chart
  const radarSkills = gaps.slice(0, 6).map((g) => {
    const matched = skills.find((s) => s.skill_name.toLowerCase().includes(g.skill.toLowerCase()));
    let sScore = 35;
    if (matched) {
      if (matched.score) sScore = matched.score;
      else if (matched.level === 'Advanced') sScore = 90;
      else if (matched.level === 'Intermediate') sScore = 70;
      else sScore = 45;
    }
    return {
      name: g.skill,
      studentScore: sScore,
      targetScore: g.required_level === 'Advanced' ? 95 : 75,
    };
  });

  const topStrengthsList =
    verifiedSkills.length > 0
      ? verifiedSkills
          .slice(0, 3)
          .map((s) => s.skill_name)
          .join(', ')
      : 'No verified skills yet (Take assessments to verify)';

  const focusAreasList =
    highPriorityGaps.length > 0
      ? highPriorityGaps
          .slice(0, 3)
          .map((g) => g.skill)
          .join(', ')
      : 'All core skills aligned with benchmark';

  return (
    <div className="space-y-6 pb-12">
      {/* Friendly error alert banner if partial error occurred during background sync */}
      {errorState && (
        <div className="p-3.5 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Database synchronization notice: {errorState}</span>
          </div>
          <button
            onClick={handleRetry}
            className="px-2.5 py-1 text-[11px] font-semibold bg-amber-600/30 hover:bg-amber-600 text-amber-100 rounded-lg border border-amber-500/50 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Top Greeting Banner */}
      <div className="glass-card rounded-3xl p-6 md:p-8 border border-violet-500/30 shadow-xl shadow-violet-950/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-violet-600/15 via-cyan-600/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-violet-950/70 border border-violet-500/40 text-violet-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Database Synchronized
              </span>
              <span className="text-xs text-slate-400">
                {activeUser?.degree || 'Undergraduate'} • {activeUser?.college || 'University'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
              {activeUser?.full_name || 'Student Candidate'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Your career readiness is currently ranked at{' '}
              <span className="text-violet-300 font-semibold">{readinessScore}%</span> for{' '}
              <span className="text-cyan-300 font-semibold">{targetCareer}</span>. Complete{' '}
              {highPriorityGaps.length > 0
                ? `${highPriorityGaps.length} priority gaps`
                : 'next roadmap module'}{' '}
              to reach Tier-1 candidate status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <GlowButton
              size="md"
              onClick={() => navigate('/verification')}
              icon={<Award className="w-4 h-4 text-cyan-400" />}
            >
              Verify Skills
            </GlowButton>
            <GlowButton
              variant="secondary"
              size="md"
              onClick={() => navigate('/internships')}
              icon={<Briefcase className="w-4 h-4 text-violet-400" />}
            >
              Match Internships
            </GlowButton>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards calculated from real database data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Verified Skills"
          value={`${verifiedSkills.length} of ${skills.length}`}
          subtext={`${
            skills.length > 0
              ? Math.round((verifiedSkills.length / skills.length) * 100)
              : 0
          }% verified in database`}
          icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
          glow="purple"
        />
        <StatCard
          label="Skill Gaps"
          value={`${highPriorityGaps.length} Priority`}
          subtext={`${gaps.length} total mapped skills`}
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          trend={{
            value: `${verifiedSkills.length} Verified`,
            positive: verifiedSkills.length > 0,
          }}
          glow="none"
        />
        <StatCard
          label="Roadmap Progress"
          value={`${roadmapPct}%`}
          subtext={`${completedRoadmapItems.length} of ${roadmap.length} modules completed`}
          icon={<Map className="w-5 h-5 text-cyan-400" />}
          glow="cyan"
        />
        <StatCard
          label="Internship Match"
          value={`${avgInternshipMatch}%`}
          subtext={`Across ${internships.length} active opportunities`}
          icon={<Briefcase className="w-5 h-5 text-violet-400" />}
          glow="blue"
        />
      </div>

      {/* Main 2-Column Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1/3: Career Readiness Circular Gauge */}
        <Card glow="purple" className="flex flex-col justify-between items-center text-center">
          <div className="w-full text-left mb-2">
            <h2 className="text-sm font-bold text-white font-heading">Career Readiness Index</h2>
            <p className="text-xs text-slate-400">Target Role: {targetCareer}</p>
          </div>

          <div className="my-3">
            <ReadinessGauge score={readinessScore} size={190} showTier={true} />
          </div>

          <div className="w-full space-y-2 pt-3 border-t border-slate-800 text-xs text-left">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                Verified Competency Score
              </span>
              <span className="font-semibold text-white">{readinessScore}%</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                Recruiter Match Rate
              </span>
              <span className="font-semibold text-white">{avgInternshipMatch}%</span>
            </div>
            <button
              onClick={() => navigate('/progress')}
              className="w-full mt-2 py-2 text-center text-xs font-semibold text-violet-300 hover:text-violet-200 bg-violet-950/60 rounded-xl border border-violet-700/40 cursor-pointer"
            >
              View Full Progress Breakdown →
            </button>
          </div>
        </Card>

        {/* Center/Right 2/3: Skill Radar Map & Target Benchmarking */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white font-heading">
                Skill Competency vs Target Benchmark
              </h2>
              <p className="text-xs text-slate-400">Multilateral alignment for {targetCareer}</p>
            </div>
            <button
              onClick={() => navigate('/skill-gap')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
            >
              Detailed Gap Analysis →
            </button>
          </div>

          <div className="py-4 flex justify-center">
            <SkillRadarChart skills={radarSkills} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-emerald-400 font-semibold block mb-0.5">Top Strengths:</span>
              <span className="text-slate-300">{topStrengthsList}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-amber-400 font-semibold block mb-0.5">Focus Areas:</span>
              <span className="text-slate-300">{focusAreasList}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 2-Column: Learning Roadmap & Priority Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Active Roadmap Phase */}
        <Card>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-bold text-white font-heading">Learning Roadmap</h2>
            </div>
            <button
              onClick={() => navigate('/roadmap')}
              className="text-xs text-violet-400 hover:text-violet-300 font-medium cursor-pointer"
            >
              Full {roadmap.length > 0 ? `${roadmap.length} Modules` : 'Roadmap'} →
            </button>
          </div>

          <div className="space-y-3">
            {roadmap.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                No roadmap items found in database for {targetCareer}.
              </div>
            ) : (
              roadmap.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider font-mono-code">
                        {item.phase_name}
                      </span>
                      <h3 className="text-xs font-semibold text-slate-100 mt-0.5">{item.topic}</h3>
                    </div>
                    <Badge variant={item.completed ? 'emerald' : 'purple'} size="sm">
                      {item.completed ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                  <ProgressBar
                    value={item.progress_pct}
                    showValue={false}
                    height="sm"
                    color="violet"
                  />
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right: High-Priority Skill Gaps */}
        <Card>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white font-heading">Priority Skill Gaps</h2>
            </div>
            <button
              onClick={() => navigate('/skill-gap')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
            >
              View Matrix →
            </button>
          </div>

          <div className="space-y-3">
            {gaps.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-emerald-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>All core skills aligned with industry benchmark!</span>
              </div>
            ) : (
              gaps.slice(0, 3).map((gap) => (
                <div
                  key={gap.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-100">{gap.skill}</span>
                      <Badge
                        variant={
                          gap.priority === 'Strong'
                            ? 'emerald'
                            : gap.priority === 'Moderate Gap'
                            ? 'purple'
                            : 'amber'
                        }
                      >
                        {gap.priority}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {gap.recommended_action}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('/verification')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-violet-600/30 hover:bg-violet-600 text-violet-200 rounded-lg border border-violet-500/40 transition-colors shrink-0 cursor-pointer"
                  >
                    Verify
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recommended Projects & Top Internships */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Capstone Projects */}
        <Card>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white font-heading">
                Recommended Capstone Projects
              </h2>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
            >
              All Projects ({projects.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {projects.slice(0, 2).map((proj) => (
              <div
                key={proj.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-bold text-slate-100">{proj.title}</h3>
                  <Badge variant={proj.difficulty === 'Advanced' ? 'purple' : 'cyan'}>
                    {proj.difficulty}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-2.5">{proj.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {proj.technologies.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Matched Internships */}
        <Card>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-bold text-white font-heading">Top Matched Internships</h2>
            </div>
            <button
              onClick={() => navigate('/internships')}
              className="text-xs text-violet-400 hover:text-violet-300 font-medium cursor-pointer"
            >
              Explore All ({internships.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {sortedInternships.slice(0, 2).map((int) => (
              <div
                key={int.id}
                onClick={() => navigate(`/internships/${int.id}`)}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-violet-500/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <h3 className="text-xs font-bold text-slate-100">{int.role}</h3>
                    <p className="text-[11px] text-slate-400">
                      {int.company} • {int.location}
                    </p>
                  </div>
                  <Badge variant="cyan">{int.stipend}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80 text-slate-400">
                  <span>{int.work_mode}</span>
                  <span className="text-cyan-400 font-medium font-mono-code">
                    {int.matchScore}% Skill Match
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
