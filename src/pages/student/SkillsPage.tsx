import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { dataService } from '../../services/dataService';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { StudentSkill, SkillLevel } from '../../types';
import { Card } from '../../components/common/Card';
import { GlowButton } from '../../components/common/GlowButton';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Modal } from '../../components/common/Modal';
import {
  Plus,
  Award,
  ShieldCheck,
  Trash2,
  Edit2,
  CheckCircle2,
  Search,
  Layers,
  Zap,
  RotateCw,
  AlertOctagon,
  Database,
  Check,
  X,
} from 'lucide-react';

export const SkillsPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const { navigate } = useNavigation();

  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState('Languages');
  const [level, setLevel] = useState<SkillLevel>('Intermediate');
  const [isVerified, setIsVerified] = useState(false);
  const [score, setScore] = useState<number>(85);
  const [isSaving, setIsSaving] = useState(false);
  const [togglingSkillId, setTogglingSkillId] = useState<string | null>(null);

  // Helper to determine the effective authenticated user ID
  const getAuthenticatedUserId = useCallback(async (): Promise<string> => {
    if (isSupabaseConfigured) {
      try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        if (supabaseUser?.id) {
          return supabaseUser.id;
        }
      } catch (authErr) {
        console.warn('Supabase auth session check in SkillsPage:', authErr);
      }
    }
    return authUser?.user_id || '';
  }, [authUser]);

  const loadSkills = useCallback(async () => {
    setIsLoading(true);
    setErrorState(null);

    try {
      const studentId = await getAuthenticatedUserId();
      if (!studentId) {
        setIsLoading(false);
        return;
      }
      const loadedSkills = await dataService.getStudentSkills(studentId);
      setSkills(loadedSkills);
    } catch (err: any) {
      console.error('Failed to load student skills from Supabase:', err);
      setErrorState(
        err?.message || 'Unable to retrieve your skills from the database. Please try again.'
      );
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, [getAuthenticatedUserId]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const handleRetry = async () => {
    setIsRetrying(true);
    await loadSkills();
  };

  const handleOpenAdd = () => {
    setEditingSkillId(null);
    setSkillName('');
    setCategory('Languages');
    setLevel('Intermediate');
    setIsVerified(false);
    setScore(85);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (skill: StudentSkill) => {
    setEditingSkillId(skill.id);
    setSkillName(skill.skill_name);
    setCategory(skill.category);
    setLevel(skill.level);
    setIsVerified(Boolean(skill.verified));
    setScore(skill.score || (skill.level === 'Advanced' ? 92 : skill.level === 'Intermediate' ? 78 : 55));
    setIsModalOpen(true);
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    setIsSaving(true);
    setErrorState(null);

    try {
      const studentId = await getAuthenticatedUserId();

      if (editingSkillId) {
        await dataService.updateStudentSkill(editingSkillId, {
          skill_name: skillName.trim(),
          category,
          level,
          verified: isVerified,
          score: isVerified ? score : undefined,
          verified_at: isVerified ? new Date().toISOString().split('T')[0] : undefined,
        });
      } else {
        await dataService.addStudentSkill({
          user_id: studentId,
          student_id: studentId,
          skill_name: skillName.trim(),
          category,
          level,
          verified: isVerified,
          score: isVerified ? score : undefined,
          verified_at: isVerified ? new Date().toISOString().split('T')[0] : undefined,
        });
      }

      await loadSkills();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving skill to Supabase:', err);
      setErrorState(err?.message || 'Failed to save skill changes to the database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSkill = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from your skills profile?`)) {
      return;
    }

    try {
      await dataService.deleteStudentSkill(id);
      await loadSkills();
    } catch (err: any) {
      console.error('Error deleting skill from Supabase:', err);
      setErrorState(err?.message || 'Failed to delete skill from the database.');
    }
  };

  const handleToggleVerification = async (skill: StudentSkill) => {
    setTogglingSkillId(skill.id);
    const newVerifiedStatus = !skill.verified;

    try {
      await dataService.updateStudentSkill(skill.id, {
        verified: newVerifiedStatus,
        score: newVerifiedStatus ? (skill.score || (skill.level === 'Advanced' ? 90 : 75)) : undefined,
        verified_at: newVerifiedStatus ? new Date().toISOString().split('T')[0] : undefined,
      });
      await loadSkills();
    } catch (err: any) {
      console.error('Error toggling skill verification status:', err);
      setErrorState(err?.message || 'Failed to update verification status in database.');
    } finally {
      setTogglingSkillId(null);
    }
  };

  // Extract unique categories from current skills
  const availableCategories = Array.from(new Set(skills.map((s) => s.category).filter(Boolean)));
  const categories = ['All', ...availableCategories];

  const filteredSkills = skills.filter((s) => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch = s.skill_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const verifiedCount = skills.filter((s) => s.verified).length;

  // Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-violet-500/40 shadow-2xl shadow-violet-950/50 text-center relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 border-4 border-violet-500/20 border-t-cyan-400 border-r-violet-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Database className="w-5 h-5 text-violet-300 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-white font-heading">
                Loading Skills from Supabase
              </h2>
              <p className="text-xs text-slate-400 font-mono-code">
                Synchronizing student_skills records...
              </p>
            </div>

            <div className="w-full bg-slate-900/80 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div className="h-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 rounded-full animate-pulse w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State with fallback and retry
  if (errorState && skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="glass-card max-w-lg w-full p-8 rounded-3xl border border-red-500/40 shadow-2xl shadow-red-950/40 text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center justify-center mx-auto mb-4">
            <AlertOctagon className="w-7 h-7 text-red-400" />
          </div>

          <h2 className="text-lg font-bold text-white font-heading mb-2">
            Skill Records Synchronization Error
          </h2>
          <p className="text-xs text-slate-300 mb-6">{errorState}</p>

          <GlowButton
            variant="primary"
            size="md"
            onClick={handleRetry}
            icon={<RotateCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />}
            className="w-full justify-center"
          >
            {isRetrying ? 'Retrying Database Sync...' : 'Retry Connection'}
          </GlowButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-950/70 border border-violet-500/40 text-violet-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Connected to student_skills
            </span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-white">My Technical Skills</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your verified competencies, level progressions, and diagnostic assessment status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <GlowButton
            size="md"
            onClick={handleOpenAdd}
            icon={<Plus className="w-4 h-4" />}
          >
            Add New Skill
          </GlowButton>
          <GlowButton
            variant="cyan"
            size="md"
            onClick={() => navigate('/verification')}
            icon={<Award className="w-4 h-4" />}
          >
            Verify Skills
          </GlowButton>
        </div>
      </div>

      {/* Dynamic Error Alert if action failed */}
      {errorState && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-center justify-between gap-2">
          <span>{errorState}</span>
          <button
            onClick={() => setErrorState(null)}
            className="text-red-400 hover:text-red-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary Stat Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card glow="purple" className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Tracked Skills</span>
            <Layers className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-2xl font-bold font-heading text-white mt-1">{skills.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Across {Math.max(1, availableCategories.length)} {availableCategories.length === 1 ? 'category' : 'categories'}
          </p>
        </Card>

        <Card glow="cyan" className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">SkillSync Verified</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-heading text-emerald-400 mt-1">{verifiedCount}</p>
          <p className="text-[11px] text-emerald-400/80 mt-0.5">
            {skills.length > 0 ? Math.round((verifiedCount / skills.length) * 100) : 0}% verified in database
          </p>
        </Card>

        <Card glow="blue" className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pending Verification</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold font-heading text-cyan-400 mt-1">
            {skills.length - verifiedCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Mark verified or take assessments</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-3 rounded-2xl border border-slate-800">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills (e.g. React, Python)..."
            className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white shadow-xs shadow-violet-900/60'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid / Empty State */}
      {skills.length === 0 ? (
        <Card className="text-center py-16">
          <div className="w-14 h-14 rounded-3xl bg-violet-950/60 border border-violet-500/40 flex items-center justify-center mx-auto mb-4 text-violet-400">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white font-heading">No Skills Added Yet</h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto">
            You haven&apos;t added any technical competencies to your profile yet. Start adding your programming languages, frameworks, and databases to track career readiness.
          </p>
          <GlowButton size="md" className="mt-5" onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
            Add Your First Skill
          </GlowButton>
        </Card>
      ) : filteredSkills.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white font-heading">No skills matched</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query &quot;{searchQuery}&quot; or category filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-4 px-3 py-1.5 text-xs font-semibold text-violet-300 bg-violet-950/60 rounded-xl border border-violet-700/40 cursor-pointer"
          >
            Clear Filters
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => {
            const levelPct =
              skill.level === 'Advanced' ? 95 : skill.level === 'Intermediate' ? 70 : 40;

            const isToggling = togglingSkillId === skill.id;

            return (
              <Card
                key={skill.id}
                glow={skill.verified ? 'purple' : 'none'}
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider font-mono-code">
                        {skill.category}
                      </span>
                      <h3 className="text-base font-bold text-white font-heading mt-0.5">
                        {skill.skill_name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(skill)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
                        title="Edit Skill"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSkill(skill.id, skill.skill_name)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete Skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      variant={
                        skill.level === 'Advanced'
                          ? 'emerald'
                          : skill.level === 'Intermediate'
                          ? 'purple'
                          : 'slate'
                      }
                      size="sm"
                    >
                      {skill.level}
                    </Badge>

                    {skill.verified ? (
                      <Badge variant="emerald" icon={<ShieldCheck className="w-3 h-3" />} size="sm">
                        Verified {skill.score ? `(${skill.score}%)` : ''}
                      </Badge>
                    ) : (
                      <Badge variant="amber" size="sm">
                        Unverified
                      </Badge>
                    )}
                  </div>

                  <ProgressBar
                    value={levelPct}
                    color={skill.verified ? 'violet' : 'cyan'}
                    height="sm"
                    className="mb-2"
                  />
                </div>

                <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {skill.verified_at ? `Verified on ${skill.verified_at}` : 'Awaiting Test'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleVerification(skill)}
                      disabled={isToggling}
                      title={skill.verified ? 'Mark as Unverified' : 'Mark as Verified'}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
                        skill.verified
                          ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/50'
                      }`}
                    >
                      {isToggling ? (
                        <RotateCw className="w-3 h-3 animate-spin" />
                      ) : skill.verified ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Verified</span>
                        </>
                      ) : (
                        <span>Mark Verified</span>
                      )}
                    </button>

                    {!skill.verified && (
                      <button
                        onClick={() => navigate('/verification')}
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer"
                      >
                        Test →
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Skill Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSkillId ? 'Edit Technical Skill' : 'Add New Skill'}
        subtitle="Manage competency level and Supabase verification status"
      >
        <form onSubmit={handleSaveSkill} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Skill Name *</label>
            <input
              type="text"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="e.g. React, Docker, Python, PostgreSQL"
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value="Languages">Languages</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Databases">Databases</option>
                <option value="Core CS">Core CS & Algorithms</option>
                <option value="DevOps">DevOps & Cloud</option>
                <option value="AI/ML">AI & Machine Learning</option>
                <option value="Security">Cybersecurity</option>
                <option value="Mobile">Mobile Development</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Self-Assessed Level *</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as SkillLevel)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value="Beginner">Beginner (Foundational)</option>
                <option value="Intermediate">Intermediate (Project-Ready)</option>
                <option value="Advanced">Advanced (Production-Grade)</option>
              </select>
            </div>
          </div>

          {/* Verification Checkbox & Score */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Verification Status</span>
                <span className="text-[11px] text-slate-400">
                  Mark as verified competency in Supabase
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
              </label>
            </div>

            {isVerified && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-4">
                <label className="text-xs font-medium text-slate-300">Proficiency Score (%)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={score}
                  onChange={(e) => setScore(Math.min(100, Math.max(1, parseInt(e.target.value) || 0)))}
                  className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-emerald-400 font-mono-code text-right focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <GlowButton type="submit" size="md" isLoading={isSaving}>
              {editingSkillId ? 'Save Changes' : 'Save Skill to Supabase'}
            </GlowButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};
