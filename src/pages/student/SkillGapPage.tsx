import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { dataService } from '../../services/dataService';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  calculateSkillGaps,
  calculateReadinessScore,
  TARGET_CAREERS,
} from '../../services/careerMatrix';
import { Profile, SkillGap, StudentSkill, TargetCareerTitle } from '../../types';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { GlowButton } from '../../components/common/GlowButton';
import { ProgressBar } from '../../components/common/ProgressBar';
import { ReadinessGauge } from '../../components/common/Charts';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Compass,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  BookOpen,
  Filter,
  RotateCw,
  Zap,
  TrendingUp,
  Target,
  Layers,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Database,
} from 'lucide-react';

export const SkillGapPage: React.FC = () => {
  const { user: authUser, updateCurrentProfile } = useAuth();
  const { navigate } = useNavigation();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [targetCareer, setTargetCareer] = useState<TargetCareerTitle>('Software Developer');
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [gaps, setGaps] = useState<SkillGap[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdatingCareer, setIsUpdatingCareer] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isSavedInSupabase, setIsSavedInSupabase] = useState<boolean>(false);

  // Load profile and skills from Supabase
  const loadSkillGapData = useCallback(async () => {
    setIsLoading(true);
    setErrorState(null);

    try {
      // 1. Determine effective Supabase Auth ID
      let effectiveUserId = authUser?.user_id || '';
      if (isSupabaseConfigured) {
        try {
          const { data: { user: supabaseUser } } = await supabase.auth.getUser();
          if (supabaseUser) {
            effectiveUserId = supabaseUser.id;
          }
        } catch (authErr) {
          console.warn('Supabase auth notice in SkillGapPage:', authErr);
        }
      }

      if (!effectiveUserId) {
        setIsLoading(false);
        return;
      }

      // 2. Fetch student profile from `profiles` table to read `target_role` / `target_career`
      const fetchedProfile = await dataService.getProfile(effectiveUserId);
      const studentProfile = fetchedProfile || authUser;
      setProfile(studentProfile);

      const resolvedTargetCareer: TargetCareerTitle =
        (studentProfile?.target_role || studentProfile?.target_career || 'Software Developer') as TargetCareerTitle;
      setTargetCareer(resolvedTargetCareer);

      // 3. Fetch student's real skills from `student_skills` table
      const studentSkills = await dataService.getStudentSkills(effectiveUserId);
      setSkills(studentSkills);

      // 4. Calculate skill gaps against target career matrix
      const computedGaps = calculateSkillGaps(resolvedTargetCareer, studentSkills);
      setGaps(computedGaps);

      // 5. Persist calculated analysis in Supabase `skill_gaps` table for this student
      await dataService.syncSkillGaps(effectiveUserId, resolvedTargetCareer, computedGaps);
      setIsSavedInSupabase(true);
    } catch (err: any) {
      console.error('Error loading Skill Gap data from Supabase:', err);
      setErrorState(err.message || 'Failed to load skill gap data from database.');
    } finally {
      setIsLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    loadSkillGapData();
  }, [loadSkillGapData]);

  // Handle target role change and save immediately to Supabase
  const handleCareerChange = async (newCareer: TargetCareerTitle) => {
    if (newCareer === targetCareer) return;
    setIsUpdatingCareer(true);
    setTargetCareer(newCareer);

    try {
      let effectiveUserId = authUser?.user_id || '';
      if (isSupabaseConfigured) {
        try {
          const { data: { user: supabaseUser } } = await supabase.auth.getUser();
          if (supabaseUser) effectiveUserId = supabaseUser.id;
        } catch (e) {
          console.warn('Supabase user check notice:', e);
        }
      }

      if (!effectiveUserId) {
        setIsUpdatingCareer(false);
        return;
      }

      // Update student profile in Supabase
      await dataService.updateProfile(effectiveUserId, {
        target_career: newCareer,
        target_role: newCareer,
      });

      if (updateCurrentProfile) {
        await updateCurrentProfile({
          target_career: newCareer,
          target_role: newCareer,
        });
      }

      // Recalculate skill gaps
      const newComputedGaps = calculateSkillGaps(newCareer, skills);
      setGaps(newComputedGaps);

      // Save/update in Supabase `skill_gaps` table
      await dataService.syncSkillGaps(effectiveUserId, newCareer, newComputedGaps);
      setIsSavedInSupabase(true);
    } catch (err: any) {
      console.error('Error updating target career in Supabase:', err);
    } finally {
      setIsUpdatingCareer(false);
    }
  };

  // Metrics
  const readinessScore = useMemo(() => {
    return calculateReadinessScore(targetCareer, skills);
  }, [targetCareer, skills]);

  const highPriorityGaps = useMemo(() => {
    return gaps.filter((g) => g.priority === 'High Priority Gap');
  }, [gaps]);

  const moderateGaps = useMemo(() => {
    return gaps.filter((g) => g.priority === 'Moderate Gap');
  }, [gaps]);

  const strongSkills = useMemo(() => {
    return gaps.filter((g) => g.priority === 'Strong');
  }, [gaps]);

  // Biggest skill gaps (sorted by descending gap percentage, only showing gaps > 0)
  const biggestGaps = useMemo(() => {
    return [...gaps]
      .filter((g) => g.gap_percentage > 0)
      .sort((a, b) => b.gap_percentage - a.gap_percentage)
      .slice(0, 3);
  }, [gaps]);

  // Recommended next skills to study or verify (prioritizing high gaps then moderate)
  const recommendedNextSkills = useMemo(() => {
    const high = gaps.filter((g) => g.priority === 'High Priority Gap');
    const mod = gaps.filter((g) => g.priority === 'Moderate Gap');
    return [...high, ...mod].slice(0, 3);
  }, [gaps]);

  // Filtered list based on priority tab
  const filteredGaps = useMemo(() => {
    if (filterPriority === 'All') return gaps;
    if (filterPriority === 'High Priority') return highPriorityGaps;
    if (filterPriority === 'Moderate') return moderateGaps;
    if (filterPriority === 'Strong') return strongSkills;
    return gaps;
  }, [gaps, filterPriority, highPriorityGaps, moderateGaps, strongSkills]);

  const activeCareerMeta = TARGET_CAREERS.find((c) => c.title === targetCareer) || TARGET_CAREERS[0];

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        {/* Cybernetic Loading Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="h-7 w-64 bg-slate-800/80 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-96 bg-slate-800/50 rounded-md animate-pulse" />
          </div>
          <div className="h-10 w-48 bg-slate-800/80 rounded-2xl animate-pulse" />
        </div>

        {/* Cybernetic Skeleton Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card glow="purple" className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="w-40 h-40 rounded-full border-4 border-violet-500/20 border-t-violet-400 animate-spin flex items-center justify-center">
              <Zap className="w-8 h-8 text-violet-400 animate-pulse" />
            </div>
            <p className="text-xs font-mono text-cyan-300">CALCULATING SKILL GAP MATRIX...</p>
            <p className="text-[11px] text-slate-400">Comparing verified Supabase skills with {targetCareer}</p>
          </Card>
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-28 bg-slate-900/90 border border-slate-800/80 rounded-2xl animate-pulse" />
              ))}
            </div>
            <div className="h-32 bg-slate-900/90 border border-slate-800/80 rounded-2xl animate-pulse" />
          </div>
        </div>

        {/* Skeleton items */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-24 bg-slate-900/80 border border-slate-800/70 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (errorState) {
    return (
      <div className="space-y-6 pb-12">
        <div className="p-8 bg-rose-950/20 border border-rose-800/50 rounded-2xl text-center max-w-xl mx-auto space-y-4 mt-8">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white font-heading">Database Connection Error</h2>
          <p className="text-xs text-slate-300 leading-relaxed">{errorState}</p>
          <GlowButton variant="primary" onClick={loadSkillGapData} className="mx-auto flex items-center gap-2">
            <RotateCw className="w-4 h-4" />
            Retry Skill Gap Analysis
          </GlowButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold font-heading text-white">Skill Gap Analysis</h1>
            {isSavedInSupabase && (
              <Badge variant="cyan" size="sm" className="flex items-center gap-1 font-mono text-[10px]">
                <Database className="w-3 h-3" />
                Supabase Synced
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Objective matrix comparing verified student competency against industry standards for {targetCareer}.
          </p>
        </div>

        {/* Target Career Quick Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 px-3 shadow-inner">
          <Compass className="w-4 h-4 text-violet-400 shrink-0" />
          <label className="text-xs text-slate-400 font-medium">Target Role:</label>
          <select
            value={targetCareer}
            onChange={(e) => handleCareerChange(e.target.value as TargetCareerTitle)}
            disabled={isUpdatingCareer}
            className="bg-transparent text-xs font-semibold text-violet-200 focus:outline-none cursor-pointer pr-2"
          >
            {TARGET_CAREERS.map((c) => (
              <option key={c.title} value={c.title} className="bg-slate-900 text-white">
                {c.title}
              </option>
            ))}
          </select>
          {isUpdatingCareer && <RotateCw className="w-3.5 h-3.5 text-violet-400 animate-spin" />}
        </div>
      </div>

      {/* Readiness Overview Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1/3: Gauge */}
        <Card glow="purple" className="flex flex-col justify-between items-center text-center p-6">
          <div className="w-full text-left flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white font-heading">Benchmark Readiness</h2>
              <p className="text-xs text-slate-400">{targetCareer}</p>
            </div>
            <Badge
              variant={readinessScore >= 75 ? 'emerald' : readinessScore >= 50 ? 'amber' : 'rose'}
              size="sm"
            >
              {readinessScore >= 75 ? 'Tier 1 Ready' : readinessScore >= 50 ? 'Developing' : 'Foundational'}
            </Badge>
          </div>

          <div className="my-3">
            <ReadinessGauge score={readinessScore} size={180} showTier={true} />
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 w-full text-left">
            {readinessScore >= 80
              ? 'Excellent standing! You meet baseline hiring criteria for competitive internships in this target role.'
              : 'Target your high-priority gaps below to unlock tier-1 internship pipelines and boost candidate ranking.'}
          </p>
        </Card>

        {/* Right 2/3: Gap Metrics & Role Market Intel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard
              label="High Priority Gaps"
              value={highPriorityGaps.length}
              subtext="Critical hiring blockers"
              icon={<AlertCircle className="w-5 h-5 text-rose-400" />}
              glow="none"
            />
            <StatCard
              label="Moderate Gaps"
              value={moderateGaps.length}
              subtext="Needs deeper mastery"
              icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
              glow="none"
            />
            <StatCard
              label="Strong Verified"
              value={strongSkills.length}
              subtext="Meets/exceeds industry bar"
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              glow="purple"
            />
          </div>

          {activeCareerMeta && (
            <Card glow="blue" className="p-4 border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-cyan-300 font-heading flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-cyan-400" />
                  Role Market Intelligence: {activeCareerMeta.title}
                </span>
                <Badge variant="cyan" size="sm">
                  {activeCareerMeta.marketDemand} Demand
                </Badge>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {activeCareerMeta.description}
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-2.5 border-t border-slate-800/80">
                <span>
                  Avg Compensation: <strong className="text-white font-mono">{activeCareerMeta.averageSalary}</strong>
                </span>
                <span>
                  Growth Rate: <strong className="text-violet-300 font-mono">{activeCareerMeta.growthRate}</strong>
                </span>
                <span>
                  Required Skills: <strong className="text-cyan-200">{activeCareerMeta.requiredSkills.length} core competencies</strong>
                </span>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Two Column Focused Intelligence Panels: Biggest Gaps & Recommended Next Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Biggest Skill Gaps */}
        <Card glow="none" className="border-rose-900/40 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-bold text-white font-heading">Biggest Skill Gaps</h2>
            </div>
            <span className="text-[11px] text-slate-400">Ranked by severity</span>
          </div>

          {biggestGaps.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              No severe skill gaps detected! All required skills meet target proficiency.
            </div>
          ) : (
            <div className="space-y-3">
              {biggestGaps.map((gap, index) => (
                <div
                  key={gap.id}
                  className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 text-[10px] flex items-center justify-center font-mono">
                        {index + 1}
                      </span>
                      {gap.skill}
                    </span>
                    <Badge variant="rose" size="sm">
                      {gap.gap_percentage}% Gap
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Current: <strong className="text-slate-200">{gap.current_level}</strong></span>
                    <span>Target: <strong className="text-violet-300">{gap.required_level}</strong></span>
                  </div>
                  <ProgressBar progress={100 - gap.gap_percentage} height={5} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recommended Next Skills */}
        <Card glow="purple" className="border-violet-900/40 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-bold text-white font-heading">Recommended Next Skills</h2>
            </div>
            <span className="text-[11px] text-violet-300">Highest ROI focus</span>
          </div>

          {recommendedNextSkills.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              Great work! You have covered all priority milestones for this role.
            </div>
          ) : (
            <div className="space-y-3">
              {recommendedNextSkills.map((gap) => (
                <div
                  key={gap.id}
                  className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white truncate">{gap.skill}</span>
                      <Badge variant={gap.priority === 'High Priority Gap' ? 'rose' : 'amber'} size="sm">
                        {gap.priority === 'High Priority Gap' ? 'High' : 'Moderate'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {gap.recommended_action}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/verification')}
                    className="px-2.5 py-1.5 rounded-lg bg-violet-600/30 hover:bg-violet-600 text-violet-200 border border-violet-500/40 text-[11px] font-semibold transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Award className="w-3 h-3" />
                    Verify
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Filter Tabs & Roadmap Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['All', 'High Priority', 'Moderate', 'Strong'].map((f) => {
            const count =
              f === 'All'
                ? gaps.length
                : f === 'High Priority'
                ? highPriorityGaps.length
                : f === 'Moderate'
                ? moderateGaps.length
                : strongSkills.length;

            return (
              <button
                key={f}
                onClick={() => setFilterPriority(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  filterPriority === f
                    ? 'bg-violet-600 text-white shadow-xs shadow-violet-900/60'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{f}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    filterPriority === f ? 'bg-violet-800 text-violet-100' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => navigate('/roadmap')}
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          View Complete Learning Roadmap →
        </button>
      </div>

      {/* Skill Gaps Breakdown Grid with "Why Each Skill Matters" */}
      <div className="space-y-3">
        {filteredGaps.length === 0 ? (
          <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-2xl text-center text-slate-400 text-xs">
            No skills found in the "{filterPriority}" category for {targetCareer}.
          </div>
        ) : (
          filteredGaps.map((gap) => {
            const isHigh = gap.priority === 'High Priority Gap';
            const isMod = gap.priority === 'Moderate Gap';
            const isStrong = gap.priority === 'Strong';
            const isExpanded = expandedSkillId === gap.id;

            return (
              <Card
                key={gap.id}
                glow="none"
                className={`border transition-all p-4 ${
                  isHigh
                    ? 'border-rose-800/40 bg-slate-900/90'
                    : isMod
                    ? 'border-amber-800/30 bg-slate-900/70'
                    : 'border-emerald-800/30 bg-slate-900/50'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-sm font-bold text-white font-heading">{gap.skill}</h3>
                      <Badge
                        variant={isStrong ? 'emerald' : isMod ? 'amber' : 'rose'}
                        size="sm"
                      >
                        {gap.priority}
                      </Badge>
                      <span className="text-[11px] text-slate-400">
                        Current: <strong className="text-slate-200">{gap.current_level}</strong>
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Target: <strong className="text-violet-300">{gap.required_level}</strong>
                      </span>
                      {gap.gap_percentage > 0 ? (
                        <span className="text-[11px] text-rose-300 font-mono">
                          {gap.gap_percentage}% Gap
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          0% Gap (Satisfied)
                        </span>
                      )}
                    </div>

                    {/* Action Plan */}
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong className="text-violet-300">Action Plan: </strong>
                      {gap.recommended_action}
                    </p>

                    {/* Why This Skill Matters section */}
                    {gap.why_it_matters && (
                      <div className="text-xs text-cyan-200/90 bg-cyan-950/30 border border-cyan-900/40 rounded-xl p-2.5 space-y-1">
                        <span className="font-semibold text-cyan-300 text-[11px] flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                          Why this skill matters for {targetCareer}:
                        </span>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {gap.why_it_matters}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
                    <button
                      onClick={() => navigate('/verification')}
                      className="px-3 py-1.5 rounded-xl bg-violet-600/30 hover:bg-violet-600 text-violet-200 border border-violet-500/40 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Award className="w-3.5 h-3.5" />
                      Verify Skill
                    </button>

                    <button
                      onClick={() => navigate('/roadmap')}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Study Path
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
