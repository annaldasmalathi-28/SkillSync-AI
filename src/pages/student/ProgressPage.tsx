import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { dataService } from '../../services/dataService';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  Profile,
  StudentSkill,
  LearningRoadmapItem,
  Project,
  AssessmentResult,
  InternshipApplication,
  ProgressStats,
  TargetCareerTitle,
} from '../../types';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { GlowButton } from '../../components/common/GlowButton';
import { ProgressBar } from '../../components/common/ProgressBar';
import { ReadinessGauge, ProgressHistoryChart } from '../../components/common/Charts';
import { calculateReadinessScore, calculateSkillGaps } from '../../services/careerMatrix';
import confetti from 'canvas-confetti';
import {
  TrendingUp,
  Flame,
  Award,
  CheckCircle2,
  Calendar,
  Zap,
  Target,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Code2,
  Briefcase,
  Layers,
  Database,
  RotateCw,
  AlertOctagon,
  ExternalLink,
  ChevronRight,
  Check,
  Compass,
  FileText,
  Activity,
} from 'lucide-react';

interface MilestoneItem {
  id: string;
  title: string;
  category: 'assessment' | 'roadmap' | 'project' | 'internship' | 'skill';
  date: string;
  relativeDate: string;
  points: string;
  icon: React.ElementType;
  color: string;
  badgeVariant: 'purple' | 'cyan' | 'emerald' | 'amber';
  actionPath?: string;
}

export const ProgressPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const { navigate } = useNavigation();

  // Primary real data state from 7 Supabase tables
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [roadmap, setRoadmap] = useState<LearningRoadmapItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [storedProgress, setStoredProgress] = useState<ProgressStats | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingStep, setLoadingStep] = useState<string>('Connecting to Supabase telemetry...');
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  // Authenticated User ID resolution
  const getAuthenticatedUserId = useCallback(async (): Promise<string> => {
    if (isSupabaseConfigured) {
      try {
        const {
          data: { user: supabaseUser },
        } = await supabase.auth.getUser();
        if (supabaseUser?.id) {
          return supabaseUser.id;
        }
      } catch (authErr) {
        console.warn('Supabase auth session check in ProgressPage:', authErr);
      }
    }
    return authUser?.user_id || '';
  }, [authUser]);

  // Load all data from Supabase tables
  const loadStudentTelemetry = useCallback(async () => {
    setIsLoading(true);
    setErrorState(null);

    try {
      setLoadingStep('Authenticating student session...');
      const studentId = await getAuthenticatedUserId();
      if (!studentId) {
        setIsLoading(false);
        return;
      }

      // 1. Fetch Profile
      setLoadingStep('Retrieving student profile & career target from profiles...');
      const fetchedProfile = await dataService.getProfile(studentId);
      const activeProfile = fetchedProfile || authUser;
      setProfile(activeProfile);

      const targetCareer: TargetCareerTitle =
        activeProfile?.target_career || (activeProfile as any)?.target_role || 'Software Developer';

      // 2. Fetch all real data in parallel
      setLoadingStep('Synchronizing telemetry across 7 Supabase tables...');
      const [
        loadedSkills,
        loadedRoadmap,
        loadedProjects,
        loadedAssessments,
        loadedApplications,
        progressRecord,
      ] = await Promise.all([
        dataService.getStudentSkills(studentId),
        dataService.getRoadmap(studentId, targetCareer),
        dataService.getProjects(studentId),
        dataService.getAssessmentResults(studentId),
        dataService.getApplications(studentId),
        dataService.getProgress(studentId),
      ]);

      setSkills(loadedSkills);
      setRoadmap(loadedRoadmap);
      setProjects(loadedProjects);
      setAssessments(loadedAssessments);
      setApplications(loadedApplications);
      setStoredProgress(progressRecord);

      // 3. Recalculate and persist updated stats to Supabase progress table
      setLoadingStep('Persisting computed metrics to progress table...');
      const computedStats = await dataService.recalculateAndSaveProgress(studentId, targetCareer);
      setStoredProgress(computedStats);
    } catch (err: any) {
      console.error('Failed to load student progress telemetry from Supabase:', err);
      setErrorState(
        err?.message || 'Unable to synchronize your progress telemetry with Supabase database.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [authUser, getAuthenticatedUserId]);

  useEffect(() => {
    loadStudentTelemetry();
  }, [loadStudentTelemetry]);

  // Manual Sync Telemetry button handler
  const handleSyncTelemetry = async () => {
    setIsSyncing(true);
    setSyncSuccessMessage(null);
    try {
      const studentId = await getAuthenticatedUserId();
      const targetCareer: TargetCareerTitle =
        profile?.target_career || (profile as any)?.target_role || 'Software Developer';

      const updated = await dataService.recalculateAndSaveProgress(studentId, targetCareer);
      setStoredProgress(updated);

      // Refresh all lists
      const [
        loadedSkills,
        loadedRoadmap,
        loadedProjects,
        loadedAssessments,
        loadedApplications,
      ] = await Promise.all([
        dataService.getStudentSkills(studentId),
        dataService.getRoadmap(studentId, targetCareer),
        dataService.getProjects(studentId),
        dataService.getAssessmentResults(studentId),
        dataService.getApplications(studentId),
      ]);

      setSkills(loadedSkills);
      setRoadmap(loadedRoadmap);
      setProjects(loadedProjects);
      setAssessments(loadedAssessments);
      setApplications(loadedApplications);

      setSyncSuccessMessage('Telemetry synced & saved to Supabase progress table');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#8B5CF6', '#38BDF8', '#10B981'],
      });

      setTimeout(() => {
        setSyncSuccessMessage(null);
      }, 4000);
    } catch (e: any) {
      console.error('Failed to manually sync telemetry:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Target Career
  const targetCareer: TargetCareerTitle =
    profile?.target_career || (profile as any)?.target_role || 'Software Developer';

  // Real Counts & Derived Metrics
  const verifiedSkills = useMemo(() => skills.filter((s) => s.verified), [skills]);
  const verifiedCount = verifiedSkills.length;
  const totalSkillsCount = skills.length;
  const verifiedSkillsPct =
    totalSkillsCount > 0 ? Math.round((verifiedCount / totalSkillsCount) * 100) : 0;

  const completedRoadmap = useMemo(
    () => roadmap.filter((r) => r.completed || r.progress_pct === 100),
    [roadmap]
  );
  const completedRoadmapCount = completedRoadmap.length;
  const totalRoadmapCount = roadmap.length;
  const roadmapPct =
    totalRoadmapCount > 0
      ? Math.round((completedRoadmapCount / totalRoadmapCount) * 100)
      : 0;

  const completedProjects = useMemo(
    () => projects.filter((p) => p.completed || p.status === 'Completed'),
    [projects]
  );
  const completedProjectsCount = completedProjects.length;
  const totalProjectsCount = projects.length;

  const assessmentsCount = assessments.length;
  const averageAssessmentScore = useMemo(() => {
    if (assessments.length === 0) return 0;
    const sum = assessments.reduce((acc, a) => acc + (a.score || 0), 0);
    return Math.round(sum / assessments.length);
  }, [assessments]);

  const applicationsCount = applications.length;

  // Career Readiness Score
  const readinessScore = useMemo(() => {
    return calculateReadinessScore(
      targetCareer,
      skills,
      completedProjectsCount,
      roadmapPct,
      assessmentsCount
    );
  }, [targetCareer, skills, completedProjectsCount, roadmapPct, assessmentsCount]);

  // Candidate Level
  const candidateLevel = useMemo(() => {
    if (readinessScore >= 90) return 'Level 5 • Principal Ready';
    if (readinessScore >= 80) return 'Level 4 • Industry Ready';
    if (readinessScore >= 65) return 'Level 3 • Competitive Candidate';
    if (readinessScore >= 50) return 'Level 2 • Developing Specialist';
    return 'Level 1 • Foundational Cadet';
  }, [readinessScore]);

  // Real Streak & Activity calculation
  const { streakDays, activityMap, activeDaysCount, lastActiveDateStr } = useMemo(() => {
    const actMap = new Map<string, string[]>();

    assessments.forEach((a) => {
      if (a.completed_at) {
        const d = a.completed_at.split('T')[0];
        const list = actMap.get(d) || [];
        list.push(`Passed ${a.skill_name} test (${a.score}%)`);
        actMap.set(d, list);
      }
    });

    skills.forEach((s) => {
      if (s.verified_at) {
        const d = s.verified_at.split('T')[0];
        const list = actMap.get(d) || [];
        list.push(`Verified skill ${s.skill_name}`);
        actMap.set(d, list);
      }
      if (s.created_at) {
        const d = s.created_at.split('T')[0];
        const list = actMap.get(d) || [];
        list.push(`Logged skill ${s.skill_name}`);
        actMap.set(d, list);
      }
    });

    projects.forEach((p) => {
      if (p.created_at) {
        const d = p.created_at.split('T')[0];
        const list = actMap.get(d) || [];
        list.push(`Added project ${p.title}`);
        actMap.set(d, list);
      }
    });

    applications.forEach((app) => {
      const d = (app.applied_at || app.applied_date || '').split('T')[0];
      if (d) {
        const list = actMap.get(d) || [];
        list.push(`Applied to ${app.role} at ${app.company}`);
        actMap.set(d, list);
      }
    });

    if (profile?.updated_at) {
      const d = profile.updated_at.split('T')[0];
      const list = actMap.get(d) || [];
      list.push('Profile updated');
      actMap.set(d, list);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    let streak = 0;

    const activeToday = actMap.has(todayStr);
    const checkDate = new Date();
    if (!activeToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (actMap.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    const finalStreak = Math.max(
      streak,
      storedProgress?.learning_streak_days || (actMap.size > 0 ? 1 : 0)
    );

    return {
      streakDays: finalStreak,
      activityMap: actMap,
      activeDaysCount: actMap.size,
      lastActiveDateStr: storedProgress?.last_active_date || todayStr,
    };
  }, [assessments, skills, projects, applications, profile, storedProgress]);

  // 14-Day Activity Array
  const last14Days = useMemo(() => {
    const days: { dateStr: string; dayLabel: string; active: boolean; events: string[] }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });
      const events = activityMap.get(dateStr) || [];
      days.push({
        dateStr,
        dayLabel,
        active: events.length > 0 || (i === 0 && streakDays > 0),
        events,
      });
    }
    return days;
  }, [activityMap, streakDays]);

  // Trajectory Chart Data
  const trajectoryChartData = useMemo(() => {
    if (assessments.length > 0) {
      const sorted = [...assessments].sort((a, b) =>
        (a.completed_at || '').localeCompare(b.completed_at || '')
      );
      return sorted.slice(-6).map((item, idx) => ({
        week: `T${idx + 1}`,
        score: Math.min(100, Math.max(40, item.score)),
      }));
    }

    // Default curve anchored to student readiness score
    const base = Math.max(30, readinessScore - 30);
    return [
      { week: 'W1', score: Math.round(base) },
      { week: 'W2', score: Math.round(base + (readinessScore - base) * 0.25) },
      { week: 'W3', score: Math.round(base + (readinessScore - base) * 0.5) },
      { week: 'W4', score: Math.round(base + (readinessScore - base) * 0.7) },
      { week: 'W5', score: Math.round(base + (readinessScore - base) * 0.88) },
      { week: 'W6', score: readinessScore },
    ];
  }, [assessments, readinessScore]);

  // Skill Categories Breakdown
  const categoryMastery = useMemo(() => {
    const catMap = new Map<string, { total: number; verified: number; scores: number[] }>();
    skills.forEach((s) => {
      const cat = s.category || 'General';
      const entry = catMap.get(cat) || { total: 0, verified: 0, scores: [] };
      entry.total++;
      if (s.verified) {
        entry.verified++;
        if (s.score) entry.scores.push(s.score);
      }
      catMap.set(cat, entry);
    });

    const result: { category: string; total: number; verified: number; pct: number }[] = [];
    catMap.forEach((val, cat) => {
      result.push({
        category: cat,
        total: val.total,
        verified: val.verified,
        pct: val.total > 0 ? Math.round((val.verified / val.total) * 100) : 0,
      });
    });

    return result.sort((a, b) => b.pct - a.pct);
  }, [skills]);

  // Application Pipeline Breakdown
  const applicationStatusCounts = useMemo(() => {
    const counts = { Applied: 0, 'Under Review': 0, Shortlisted: 0, Selected: 0, Rejected: 0 };
    applications.forEach((app) => {
      const st = app.status as keyof typeof counts;
      if (counts[st] !== undefined) {
        counts[st]++;
      } else {
        counts.Applied++;
      }
    });
    return counts;
  }, [applications]);

  // Dynamic Real Milestone Feed
  const milestones = useMemo((): MilestoneItem[] => {
    const list: MilestoneItem[] = [];

    // Assessments
    assessments.forEach((a) => {
      list.push({
        id: `ms-ass-${a.id}`,
        title: `Passed Diagnostic Assessment in ${a.skill_name}`,
        category: 'assessment',
        date: a.completed_at || new Date().toISOString(),
        relativeDate: a.completed_at ? new Date(a.completed_at).toLocaleDateString() : 'Recent',
        points: `+${Math.round(a.score * 1.5)} XP`,
        icon: ShieldCheck,
        color: 'text-cyan-400',
        badgeVariant: 'cyan',
        actionPath: '/verification',
      });
    });

    // Verified Skills
    verifiedSkills.forEach((s) => {
      list.push({
        id: `ms-sk-${s.id}`,
        title: `Verified Technical Competency: ${s.skill_name} (${s.level})`,
        category: 'skill',
        date: s.verified_at || s.created_at || new Date().toISOString(),
        relativeDate: s.verified_at ? new Date(s.verified_at).toLocaleDateString() : 'Verified',
        points: '+100 XP',
        icon: Award,
        color: 'text-violet-400',
        badgeVariant: 'purple',
        actionPath: '/skills',
      });
    });

    // Completed Roadmap
    completedRoadmap.forEach((r) => {
      list.push({
        id: `ms-rd-${r.id}`,
        title: `Completed Roadmap Module: ${r.topic}`,
        category: 'roadmap',
        date: r.created_at || new Date().toISOString(),
        relativeDate: `Phase ${r.phase}`,
        points: '+120 XP',
        icon: CheckCircle2,
        color: 'text-emerald-400',
        badgeVariant: 'emerald',
        actionPath: '/roadmap',
      });
    });

    // Completed Projects
    completedProjects.forEach((p) => {
      list.push({
        id: `ms-pj-${p.id}`,
        title: `Finished Capstone Project: ${p.title}`,
        category: 'project',
        date: p.created_at || new Date().toISOString(),
        relativeDate: p.difficulty || 'Project',
        points: '+250 XP',
        icon: Code2,
        color: 'text-indigo-400',
        badgeVariant: 'cyan',
        actionPath: '/projects',
      });
    });

    // Applications
    applications.forEach((app) => {
      list.push({
        id: `ms-app-${app.id}`,
        title: `Submitted Application for ${app.role} at ${app.company}`,
        category: 'internship',
        date: app.applied_at || app.applied_date || new Date().toISOString(),
        relativeDate: app.applied_date || 'Applied',
        points: `Match ${app.match_score}%`,
        icon: Briefcase,
        color: 'text-amber-400',
        badgeVariant: 'amber',
        actionPath: '/applications',
      });
    });

    // Sort by date descending
    list.sort((a, b) => b.date.localeCompare(a.date));

    // If empty, return placeholder guidance
    if (list.length === 0) {
      return [
        {
          id: 'ms-init-1',
          title: 'Career Profile Initialized on SkillSync AI',
          category: 'skill',
          date: new Date().toISOString(),
          relativeDate: 'Today',
          points: '+50 XP',
          icon: Compass,
          color: 'text-violet-400',
          badgeVariant: 'purple',
          actionPath: '/skills',
        },
      ];
    }

    return list.slice(0, 8);
  }, [assessments, verifiedSkills, completedRoadmap, completedProjects, applications]);

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-800 rounded-md" />
            <div className="h-8 w-64 bg-slate-800 rounded-lg" />
            <div className="h-3 w-80 bg-slate-800/60 rounded-md" />
          </div>
          <div className="h-10 w-36 bg-slate-800 rounded-2xl" />
        </div>

        {/* Status notice */}
        <div className="p-4 rounded-2xl bg-violet-950/20 border border-violet-800/40 flex items-center gap-3 text-violet-300 text-xs">
          <RotateCw className="w-4 h-4 animate-spin text-violet-400" />
          <span>{loadingStep}</span>
        </div>

        {/* Top 4 Stat Skeleton Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
              <div className="h-4 w-24 bg-slate-800 rounded" />
              <div className="h-7 w-20 bg-slate-800 rounded" />
              <div className="h-3 w-32 bg-slate-800/60 rounded" />
            </div>
          ))}
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 rounded-2xl bg-slate-900 border border-slate-800" />
          <div className="lg:col-span-2 h-80 rounded-2xl bg-slate-900 border border-slate-800" />
        </div>
      </div>
    );
  }

  // 2. Error State
  if (errorState) {
    return (
      <div className="space-y-6 pb-12">
        <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-600/40 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-900/50 border border-rose-500/50 flex items-center justify-center mx-auto text-rose-300">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h2 className="text-base font-bold text-white">Database Telemetry Synchronization Error</h2>
            <p className="text-xs text-rose-300/80 mt-1">{errorState}</p>
          </div>
          <GlowButton
            variant="cyan"
            size="sm"
            onClick={loadStudentTelemetry}
            icon={<RotateCw className="w-4 h-4" />}
          >
            Retry Database Telemetry
          </GlowButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest font-mono-code flex items-center gap-1">
              <Database className="w-3 h-3 text-cyan-400" />
              Authenticated Student Telemetry
            </span>
            <Badge variant="purple" size="sm">
              {candidateLevel}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold font-heading text-white">
            Career Progress & Activity Streaks
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time readiness metrics calculated from your verified skills, roadmap items, projects, and applications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Learning Streak Pill */}
          <div
            id="streak-badge"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-xs shadow-amber-950/50"
            title={`Active streak computed from your daily database logs. Last active: ${lastActiveDateStr}`}
          >
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-mono-code">{streakDays} Day Streak 🔥</span>
          </div>

          {/* Sync Button */}
          <GlowButton
            id="btn-sync-telemetry"
            size="sm"
            variant="ghost"
            onClick={handleSyncTelemetry}
            disabled={isSyncing}
            icon={<RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />}
          >
            {isSyncing ? 'Recalculating...' : 'Sync Telemetry'}
          </GlowButton>
        </div>
      </div>

      {/* Sync Success Toast Notice */}
      {syncSuccessMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{syncSuccessMessage}</span>
          </div>
          <span className="text-[10px] text-emerald-400/80 font-mono-code font-bold">SAVED</span>
        </div>
      )}

      {/* Top 4 Primary KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Career Readiness Index"
          value={`${readinessScore}%`}
          subtext={`Target Career: ${targetCareer}`}
          icon={<Target className="w-5 h-5 text-cyan-400" />}
          glow="cyan"
        />
        <StatCard
          label="Verified Skills"
          value={`${verifiedCount} / ${totalSkillsCount}`}
          subtext={`${verifiedSkillsPct}% of logged skills verified`}
          icon={<Award className="w-5 h-5 text-violet-400" />}
          glow="purple"
        />
        <StatCard
          label="Roadmap Modules"
          value={`${completedRoadmapCount} / ${totalRoadmapCount}`}
          subtext={`${roadmapPct}% curriculum velocity`}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          glow="none"
        />
        <StatCard
          label="Capstone Projects"
          value={`${completedProjectsCount} / ${totalProjectsCount}`}
          subtext="Verified portfolio repositories"
          icon={<Code2 className="w-5 h-5 text-indigo-400" />}
          glow="blue"
        />
      </div>

      {/* Secondary Progress Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Assessments Diagnostic Card */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Assessments Passed
            </span>
            <div className="text-xl font-bold font-mono-code text-white mt-0.5">
              {assessmentsCount}{' '}
              <span className="text-xs font-normal text-slate-400">
                (Avg: {averageAssessmentScore}%)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Objective skill tests</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Internships Applied Card */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Applications Active
            </span>
            <div className="text-xl font-bold font-mono-code text-white mt-0.5">
              {applicationsCount}{' '}
              <span className="text-xs font-normal text-slate-400">
                ({applicationStatusCounts.Shortlisted + applicationStatusCounts.Selected} advanced)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Direct recruiting pipeline</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        {/* Continuous Active Days Card */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Active Days Logged
            </span>
            <div className="text-xl font-bold font-mono-code text-white mt-0.5">
              {activeDaysCount} Days
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Real database event days</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-950/60 border border-violet-500/40 flex items-center justify-center text-violet-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1/3: Gauge & Breakdown */}
        <Card glow="purple" className="flex flex-col justify-between items-center text-center">
          <div className="w-full text-left">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-white font-heading">Benchmark Readiness</h2>
              <Badge variant="cyan" size="sm">{targetCareer}</Badge>
            </div>
            <p className="text-xs text-slate-400">Weighted evaluation across your profile</p>
          </div>

          <div className="my-4">
            <ReadinessGauge score={readinessScore} size={190} showTier={true} />
          </div>

          {/* Mathematical Weight Breakdown */}
          <div className="w-full space-y-2 text-left mb-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono-code block">
              Readiness Weight Distribution
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-violet-400" />
                  Verified Skills Factor (50%)
                </span>
                <span className="font-mono-code text-violet-300 font-bold">
                  {verifiedCount} verified
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  Capstone Projects (20%)
                </span>
                <span className="font-mono-code text-indigo-300 font-bold">
                  {completedProjectsCount} done
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Roadmap Curriculum (20%)
                </span>
                <span className="font-mono-code text-emerald-300 font-bold">{roadmapPct}%</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Diagnostic Tests (10%)
                </span>
                <span className="font-mono-code text-cyan-300 font-bold">
                  {assessmentsCount} tests
                </span>
              </div>
            </div>
          </div>

          <div className="w-full pt-3 border-t border-slate-800/80">
            <GlowButton
              id="btn-take-verification"
              size="sm"
              className="w-full"
              onClick={() => navigate('/verification')}
              icon={<Award className="w-4 h-4" />}
            >
              Take Next Verification Test
            </GlowButton>
          </div>
        </Card>

        {/* Right 2/3: Readiness History & Real 14-Day Activity Heatmap */}
        <Card glow="blue" className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-white font-heading">
                  Continuous Readiness Trajectory
                </h2>
                <p className="text-xs text-slate-400">
                  Performance progression curve across diagnostic tests and milestones
                </p>
              </div>
              <Badge variant="cyan" size="sm">
                Score: {readinessScore}%
              </Badge>
            </div>

            <ProgressHistoryChart data={trajectoryChartData} />
          </div>

          {/* Practice Streak Activity Heatmap */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                14-Day Activity Telemetry Grid
              </span>
              <span className="text-[11px] text-amber-400 font-mono-code font-bold">
                {streakDays} Days Current Streak
              </span>
            </div>

            <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 pt-1">
              {last14Days.map((day, idx) => (
                <div
                  key={idx}
                  title={`${day.dateStr}: ${
                    day.active
                      ? day.events.join(', ') || 'Active student study telemetry'
                      : 'No activity recorded'
                  }`}
                  className={`h-9 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition-all ${
                    day.active
                      ? 'bg-gradient-to-t from-violet-700 via-indigo-600 to-cyan-400 text-white shadow-xs shadow-violet-900/40 border border-cyan-400/40'
                      : 'bg-slate-900/80 text-slate-600 border border-slate-800/80'
                  }`}
                >
                  <span>{day.dayLabel}</span>
                  <span className="text-[8px] font-mono-code leading-none mt-0.5">
                    {day.active ? '✓' : '·'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Category Mastery & Pipeline Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Category Mastery */}
        <Card>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-bold text-white font-heading">
                Skill Mastery by Category
              </h2>
            </div>
            <button
              onClick={() => navigate('/skills')}
              className="text-xs text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
            >
              Manage Skills →
            </button>
          </div>

          {categoryMastery.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              No skills logged yet. Add your skills to track category progress.
            </div>
          ) : (
            <div className="space-y-4">
              {categoryMastery.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{cat.category}</span>
                    <span className="text-slate-400 font-mono-code">
                      <strong className="text-white">{cat.verified}</strong> / {cat.total} verified (
                      <span className="text-violet-300 font-bold">{cat.pct}%</span>)
                    </span>
                  </div>
                  <ProgressBar
                    value={cat.pct}
                    color={
                      cat.pct >= 75
                        ? 'emerald'
                        : cat.pct >= 50
                        ? 'violet'
                        : cat.pct >= 25
                        ? 'cyan'
                        : 'amber'
                    }
                    height="sm"
                    showValue={false}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Application Pipeline & Actions */}
        <Card>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white font-heading">
                Internship Application Pipeline
              </h2>
            </div>
            <button
              onClick={() => navigate('/applications')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              View Pipeline →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Applied</span>
              <span className="text-lg font-bold font-mono-code text-white">
                {applicationStatusCounts.Applied}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">In Review</span>
              <span className="text-lg font-bold font-mono-code text-cyan-400">
                {applicationStatusCounts['Under Review']}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Shortlisted</span>
              <span className="text-lg font-bold font-mono-code text-violet-400">
                {applicationStatusCounts.Shortlisted}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Selected</span>
              <span className="text-lg font-bold font-mono-code text-emerald-400">
                {applicationStatusCounts.Selected}
              </span>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono-code block">
              Quick Career Accelerators
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => navigate('/internships')}
                className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-left flex items-center justify-between text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                  Explore Matched Internships
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/projects')}
                className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-left flex items-center justify-between text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                  Log Capstone Project
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Real Milestone Accomplishments Stream */}
      <Card>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-bold text-white font-heading">
              Recent Milestone Accomplishments
            </h2>
          </div>
          <button
            onClick={() => navigate('/roadmap')}
            className="text-xs text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
          >
            Continue Roadmap →
          </button>
        </div>

        <div className="space-y-3">
          {milestones.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                onClick={() => m.actionPath && navigate(m.actionPath)}
                className={`p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex items-center justify-between gap-3 transition-colors ${
                  m.actionPath ? 'hover:border-slate-700 cursor-pointer' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                    <Icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{m.title}</h3>
                    <p className="text-[11px] text-slate-400">{m.relativeDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 text-xs font-mono-code font-bold rounded-lg bg-violet-950/80 text-violet-300 border border-violet-700/50">
                    {m.points}
                  </span>
                  {m.actionPath && <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
