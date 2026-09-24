import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { dataService } from '../../services/dataService';
import { calculateInternshipMatch } from '../../services/careerMatrix';
import { Internship, StudentSkill, TargetCareerTitle } from '../../types';
import { Card } from '../../components/common/Card';
import { GlowButton } from '../../components/common/GlowButton';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Briefcase,
  Search,
  Bookmark,
  BookmarkCheck,
  Send,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Sparkles,
  ShieldCheck,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  X,
  Compass,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const InternshipsPage: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useNavigation();

  const [internships, setInternships] = useState<Internship[]>([]);
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [appliedStatusMap, setAppliedStatusMap] = useState<Map<string, string>>(new Map());

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('All');
  const [selectedRoleTrack, setSelectedRoleTrack] = useState<string>('All');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('All');
  const [selectedDeadlineFilter, setSelectedDeadlineFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'match' | 'deadline' | 'stipend'>('match');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);

  // Async States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Apply Modal
  const [applyingInternship, setApplyingInternship] = useState<Internship | null>(null);
  const [resumeUrl, setResumeUrl] = useState(user?.portfolio_url || '');
  const [coverNote, setCoverNote] = useState('');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const studentId = user.user_id;
      const [intList, skList, savedList, appList] = await Promise.all([
        dataService.getInternships(),
        dataService.getStudentSkills(studentId),
        dataService.getSavedInternships(studentId),
        dataService.getApplications(studentId),
      ]);

      setInternships(intList);
      setSkills(skList);
      setSavedIds(new Set(savedList.map((s) => s.internship_id)));

      const appMap = new Map<string, string>();
      appList.forEach((a) => {
        appMap.set(a.internship_id, a.status);
      });
      setAppliedStatusMap(appMap);
    } catch (e: any) {
      console.error('Error loading internships from Supabase:', e);
      setLoadError('Failed to synchronize internships from the career database. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = async (int: Internship, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) return;
    const isCurrentlySaved = savedIds.has(int.id);

    // Optimistic state toggle
    const nextSaved = new Set(savedIds);
    if (isCurrentlySaved) nextSaved.delete(int.id);
    else nextSaved.add(int.id);
    setSavedIds(nextSaved);

    try {
      if (isCurrentlySaved) {
        await dataService.unsaveInternship(user.user_id, int.id);
      } else {
        await dataService.saveInternship({
          user_id: user.user_id,
          internship_id: int.id,
          saved_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Failed to toggle save status:', err);
      // Revert on error
      const revert = new Set(savedIds);
      setSavedIds(revert);
    }
  };

  const handleOpenApply = (int: Internship, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (appliedStatusMap.has(int.id)) return;
    setApplyingInternship(int);
    setApplyError(null);
    const targetRole = user?.target_role || user?.target_career || 'Software Engineer';
    setCoverNote(
      `Hello ${int.company} Recruiting Team,\n\nI am applying for the ${int.role} position. As an aspiring ${targetRole}, my verified technical profile demonstrates strong competency across your stack, especially in ${int.required_skills.slice(0, 3).join(', ')}.`
    );
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !applyingInternship) return;
    setIsSubmittingApp(true);
    setApplyError(null);

    try {
      const matchResult = calculateInternshipMatch(
        applyingInternship.required_skills,
        skills,
        user.target_career || user.target_role,
        applyingInternship.role,
        applyingInternship.target_careers
      );

      await dataService.submitApplication({
        user_id: user.user_id,
        internship_id: applyingInternship.id,
        role: applyingInternship.role,
        company: applyingInternship.company,
        applied_date: new Date().toISOString().split('T')[0],
        status: 'Applied',
        match_score: matchResult.matchScore,
        resume_url: resumeUrl,
        cover_note: coverNote,
        student_name: user.full_name,
        student_email: user.email,
        student_college: user.college,
        student_target_career: user.target_career || user.target_role,
      });

      const nextAppMap = new Map(appliedStatusMap);
      nextAppMap.set(applyingInternship.id, 'Applied');
      setAppliedStatusMap(nextAppMap);
      setApplyingInternship(null);

      confetti({
        particleCount: 80,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#38BDF8', '#10B981', '#F59E0B'],
      });
    } catch (err: any) {
      console.error('Application submission error:', err);
      setApplyError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmittingApp(false);
    }
  };

  // Collect unique skills for filter dropdown
  const allUniqueSkills = useMemo(() => {
    const set = new Set<string>();
    internships.forEach((i) => {
      i.required_skills.forEach((s) => set.add(s));
    });
    return Array.from(set).sort();
  }, [internships]);

  // Compute matches and filter
  const processedInternships = useMemo(() => {
    const studentTarget = user?.target_career || user?.target_role;

    return internships
      .map((int) => {
        const match = calculateInternshipMatch(
          int.required_skills,
          skills,
          studentTarget,
          int.role,
          int.target_careers
        );
        return {
          ...int,
          computedMatch: match,
        };
      })
      .filter((int) => {
        // Keyword Search (Role, Company, Location, Description, Skills)
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          int.role.toLowerCase().includes(q) ||
          int.company.toLowerCase().includes(q) ||
          int.location.toLowerCase().includes(q) ||
          int.description.toLowerCase().includes(q) ||
          int.required_skills.some((s) => s.toLowerCase().includes(q));

        // Work Mode Filter
        const matchesMode =
          selectedWorkMode === 'All' ||
          int.work_mode.toLowerCase() === selectedWorkMode.toLowerCase();

        // Role / Track Filter
        const matchesRole =
          selectedRoleTrack === 'All' ||
          int.role.toLowerCase().includes(selectedRoleTrack.toLowerCase()) ||
          (int.target_careers &&
            int.target_careers.some((tc) =>
              tc.toLowerCase().includes(selectedRoleTrack.toLowerCase())
            ));

        // Specific Skill Filter
        const matchesSkill =
          selectedSkillFilter === 'All' ||
          int.required_skills.some(
            (s) => s.toLowerCase() === selectedSkillFilter.toLowerCase()
          );

        // Deadline Filter
        let matchesDeadline = true;
        if (selectedDeadlineFilter !== 'All') {
          const deadlineDate = new Date(int.deadline).getTime();
          const now = Date.now();
          const daysDiff = (deadlineDate - now) / (1000 * 60 * 60 * 24);

          if (selectedDeadlineFilter === '14days') matchesDeadline = daysDiff <= 14 && daysDiff >= 0;
          else if (selectedDeadlineFilter === '30days') matchesDeadline = daysDiff <= 30 && daysDiff >= 0;
          else if (selectedDeadlineFilter === '60days') matchesDeadline = daysDiff <= 60 && daysDiff >= 0;
        }

        return matchesSearch && matchesMode && matchesRole && matchesSkill && matchesDeadline;
      })
      .sort((a, b) => {
        if (sortBy === 'match') {
          return b.computedMatch.matchScore - a.computedMatch.matchScore;
        }
        if (sortBy === 'deadline') {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (sortBy === 'stipend') {
          return b.stipend.localeCompare(a.stipend);
        }
        return 0;
      });
  }, [
    internships,
    skills,
    user,
    searchQuery,
    selectedWorkMode,
    selectedRoleTrack,
    selectedSkillFilter,
    selectedDeadlineFilter,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedWorkMode('All');
    setSelectedRoleTrack('All');
    setSelectedSkillFilter('All');
    setSelectedDeadlineFilter('All');
    setSortBy('match');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedWorkMode !== 'All' ||
    selectedRoleTrack !== 'All' ||
    selectedSkillFilter !== 'All' ||
    selectedDeadlineFilter !== 'All';

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest font-mono-code px-2.5 py-0.5 bg-violet-950/70 border border-violet-500/30 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
              Live Career Intelligence Feed
            </span>
            {user?.target_career && (
              <span className="text-[10px] text-slate-400 font-medium hidden md:inline">
                Targeting: <strong className="text-slate-200">{user.target_career}</strong>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            Discover Tech Internships
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified opportunities ranked dynamically by your real skill graph, target career, and benchmark telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/saved')}
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Bookmark className="w-4 h-4 text-violet-400" />
            <span>Saved ({savedIds.size})</span>
          </button>
          <button
            onClick={() => navigate('/applications')}
            className="px-3.5 py-2 rounded-xl bg-violet-950/80 hover:bg-violet-900 text-xs font-semibold text-violet-300 border border-violet-700/50 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4 text-cyan-400" />
            <span>My Applications ({appliedStatusMap.size})</span>
          </button>
        </div>
      </div>

      {/* Search and Primary Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800/90 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, company, skills, or city..."
              className="w-full bg-slate-900/90 border border-slate-700/60 rounded-xl pl-10 pr-9 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Work Mode Quick Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {['All', 'Remote', 'Hybrid', 'On-site'].map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedWorkMode(mode)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  selectedWorkMode === mode
                    ? 'bg-violet-600 text-white shadow-xs shadow-violet-900/60 font-semibold'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Advanced Filter & Sort Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className={`px-3 py-2 text-xs font-medium rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isFilterPanelOpen || hasActiveFilters
                  ? 'bg-violet-950/80 border-violet-500/60 text-violet-200'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              )}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900/80 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="match">Sort: Highest Match</option>
              <option value="deadline">Sort: Deadline Soonest</option>
              <option value="stipend">Sort: Stipend</option>
            </select>
          </div>
        </div>

        {/* Collapsible Advanced Filters Tray */}
        {isFilterPanelOpen && (
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Career Track Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Role Track / Target Career
              </label>
              <select
                value={selectedRoleTrack}
                onChange={(e) => setSelectedRoleTrack(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-violet-500"
              >
                <option value="All">All Engineering Tracks</option>
                <option value="Software Developer">Software Developer</option>
                <option value="Full Stack">Full Stack Developer</option>
                <option value="AI/ML">AI/ML Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Cybersecurity">Cybersecurity Analyst</option>
                <option value="Cloud">Cloud Engineer</option>
                <option value="DevOps">DevOps Engineer</option>
                <option value="Mobile">Mobile App Developer</option>
              </select>
            </div>

            {/* Specific Required Skill Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Required Skill Filter
              </label>
              <select
                value={selectedSkillFilter}
                onChange={(e) => setSelectedSkillFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-violet-500"
              >
                <option value="All">All Required Skills</option>
                {allUniqueSkills.map((sk) => (
                  <option key={sk} value={sk}>
                    {sk}
                  </option>
                ))}
              </select>
            </div>

            {/* Deadline Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Application Deadline
              </label>
              <select
                value={selectedDeadlineFilter}
                onChange={(e) => setSelectedDeadlineFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-violet-500"
              >
                <option value="All">Any Deadline</option>
                <option value="14days">Next 14 Days (Urgent)</option>
                <option value="30days">Next 30 Days</option>
                <option value="60days">Next 60 Days</option>
              </select>
            </div>

            {hasActiveFilters && (
              <div className="sm:col-span-3 flex justify-end pt-1">
                <button
                  onClick={resetFilters}
                  className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Reset all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl p-5 border border-slate-800 animate-pulse space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-24 bg-slate-800 rounded-md" />
                  <div className="h-5 w-44 bg-slate-700 rounded-md" />
                </div>
                <div className="h-8 w-8 bg-slate-800 rounded-xl" />
              </div>
              <div className="flex gap-2">
                <div className="h-5 w-20 bg-slate-800 rounded-lg" />
                <div className="h-5 w-16 bg-slate-800 rounded-lg" />
              </div>
              <div className="h-12 bg-slate-800/60 rounded-xl" />
              <div className="h-8 bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && loadError && (
        <Card className="text-center py-10 border-rose-500/30">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white font-heading">Database Sync Error</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">{loadError}</p>
          <GlowButton size="sm" className="mt-4" onClick={loadData} icon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry Synchronization
          </GlowButton>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !loadError && processedInternships.length === 0 && (
        <Card className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white font-heading">No Matching Internships Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, work mode filter, or career track selection to see more opportunities.
          </p>
          <GlowButton size="sm" className="mt-4" onClick={resetFilters}>
            Clear All Filters
          </GlowButton>
        </Card>
      )}

      {/* Internships Grid */}
      {!isLoading && !loadError && processedInternships.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {processedInternships.map((int) => {
            const isSaved = savedIds.has(int.id);
            const applicationStatus = appliedStatusMap.get(int.id);
            const isApplied = Boolean(applicationStatus);
            const match = int.computedMatch;
            const matchPct = match.matchScore;

            return (
              <Card
                key={int.id}
                glow={matchPct >= 80 ? 'purple' : matchPct >= 65 ? 'cyan' : 'none'}
                className="flex flex-col justify-between hover:border-violet-500/50 transition-all duration-200"
              >
                <div className="space-y-3.5">
                  {/* Header: Company & Bookmark */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider font-mono-code truncate">
                          {int.company}
                        </span>
                      </div>
                      <h3
                        onClick={() => navigate(`/internships/${int.id}`)}
                        className="text-base font-bold text-white font-heading mt-0.5 hover:text-cyan-300 transition-colors cursor-pointer line-clamp-1"
                        title={int.role}
                      >
                        {int.role}
                      </h3>
                    </div>

                    <button
                      onClick={(e) => handleToggleSave(int, e)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                        isSaved
                          ? 'bg-violet-950/90 border-violet-500/80 text-cyan-300'
                          : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-white'
                      }`}
                      title={isSaved ? 'Remove from Saved' : 'Save for Later'}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Badges: Match Score, Mode, Stipend, Duration */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant={matchPct >= 80 ? 'emerald' : matchPct >= 60 ? 'cyan' : 'purple'}
                      size="sm"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      {matchPct}% Match
                    </Badge>
                    <Badge variant="slate" size="sm">
                      {int.work_mode}
                    </Badge>
                    <Badge variant="purple" size="sm">
                      {int.stipend}
                    </Badge>
                    {int.duration && (
                      <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 bg-slate-900 rounded-lg border border-slate-800">
                        {int.duration}
                      </span>
                    )}
                  </div>

                  {/* Why this matches you rationale callout */}
                  <div className="p-2.5 rounded-xl bg-violet-950/40 border border-violet-500/30 text-[11px] text-violet-200/90 leading-relaxed">
                    <div className="flex items-center gap-1 font-semibold text-violet-300 mb-0.5">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>Why this matches you:</span>
                    </div>
                    <p className="line-clamp-2">{match.whyItMatches}</p>
                  </div>

                  {/* Brief Description */}
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {int.description}
                  </p>

                  {/* Skills Breakdown: Student Has vs Needs to Improve */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono-code">
                      <span>Required Tech Stack</span>
                      <span className="text-emerald-400">
                        {match.matchedSkills.length}/{int.required_skills.length} Matched
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                      {int.required_skills.map((reqSk) => {
                        const isStudentVerified = skills.some(
                          (s) =>
                            s.skill_name.toLowerCase().trim() === reqSk.toLowerCase().trim() && s.verified
                        );
                        const isStudentKnown = match.matchedSkills.includes(reqSk);

                        return (
                          <span
                            key={reqSk}
                            className={`px-2 py-0.5 text-[10px] rounded-lg border font-medium flex items-center gap-1 ${
                              isStudentVerified
                                ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300'
                                : isStudentKnown
                                ? 'bg-cyan-950/60 border-cyan-700/60 text-cyan-300'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                            title={
                              isStudentVerified
                                ? 'Verified Skill in your Profile'
                                : isStudentKnown
                                ? 'Skill in your profile'
                                : 'Skill to improve for this role'
                            }
                          >
                            {isStudentVerified ? (
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                            ) : isStudentKnown ? (
                              <ShieldCheck className="w-2.5 h-2.5 text-cyan-400" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                            )}
                            {reqSk}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Location & Deadline Meta */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                    <span className="flex items-center gap-1 truncate max-w-[50%]">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{int.location}</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 shrink-0">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>Deadline: {int.deadline}</span>
                    </span>
                  </div>
                </div>

                {/* Card Footer Action Buttons */}
                <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/internships/${int.id}`)}
                    className="flex-1 py-2 text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors cursor-pointer text-center"
                  >
                    View Details
                  </button>

                  {isApplied ? (
                    <div
                      onClick={() => navigate('/applications')}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl text-center flex items-center justify-center gap-1 cursor-pointer transition-colors border ${
                        applicationStatus === 'Selected' || applicationStatus === 'Accepted'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                          : applicationStatus === 'Shortlisted'
                          ? 'bg-purple-950/80 text-purple-300 border-purple-700/60'
                          : applicationStatus === 'Under Review'
                          ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60'
                          : applicationStatus === 'Rejected'
                          ? 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{applicationStatus || 'Applied'}</span>
                    </div>
                  ) : (
                    <GlowButton
                      size="sm"
                      className="flex-1"
                      onClick={(e) => handleOpenApply(int, e)}
                      icon={<Send className="w-3.5 h-3.5" />}
                    >
                      Apply Now
                    </GlowButton>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Apply Fast-Track Modal */}
      {applyingInternship && (
        <Modal
          isOpen={true}
          onClose={() => setApplyingInternship(null)}
          title={`Apply for ${applyingInternship.role}`}
          subtitle={`${applyingInternship.company} • ${applyingInternship.location} • ${applyingInternship.stipend}`}
        >
          <form onSubmit={handleSubmitApplication} className="space-y-4">
            {applyError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-xs text-rose-200">
                {applyError}
              </div>
            )}

            <div className="p-3 rounded-xl bg-violet-950/60 border border-violet-500/40 text-xs text-violet-200 space-y-1">
              <span className="font-semibold block text-cyan-300">
                SkillSync Fast-Track Direct Submission:
              </span>
              <p>
                Your verified skill telemetry and current readiness score will be securely routed directly to the {applyingInternship.company} recruitment pipeline.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Verified Candidate Resume Link (PDF)
              </label>
              <input
                type="text"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Candidate Note / Portfolio Statement
              </label>
              <textarea
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                rows={4}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setApplyingInternship(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <GlowButton
                type="submit"
                size="md"
                isLoading={isSubmittingApp}
                icon={<Send className="w-4 h-4" />}
              >
                Confirm Application
              </GlowButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
