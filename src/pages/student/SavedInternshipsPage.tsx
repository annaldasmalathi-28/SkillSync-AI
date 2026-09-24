import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { dataService } from '../../services/dataService';
import { calculateInternshipMatch } from '../../services/careerMatrix';
import { SavedInternship, StudentSkill } from '../../types';
import { Card } from '../../components/common/Card';
import { GlowButton } from '../../components/common/GlowButton';
import { Badge } from '../../components/common/Badge';
import {
  Bookmark,
  BookmarkX,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Trash2,
  Sparkles,
  ArrowRight,
  Send,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Compass,
} from 'lucide-react';

export const SavedInternshipsPage: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useNavigation();

  const [savedItems, setSavedItems] = useState<SavedInternship[]>([]);
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadSaved();
  }, [user]);

  const loadSaved = async () => {
    if (!user) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const studentId = user.user_id;
      const [saved, studentSkills, apps] = await Promise.all([
        dataService.getSavedInternships(studentId),
        dataService.getStudentSkills(studentId),
        dataService.getApplications(studentId),
      ]);

      setSavedItems(saved);
      setSkills(studentSkills);
      setAppliedIds(new Set(apps.map((a) => a.internship_id)));
    } catch (e: any) {
      console.error('Error loading saved internships:', e);
      setLoadError('Failed to load saved internships. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSaved = async (internshipId: string) => {
    if (!user) return;
    // Optimistic removal
    const previous = [...savedItems];
    setSavedItems(savedItems.filter((item) => item.internship_id !== internshipId));

    try {
      await dataService.removeSavedInternship(user.user_id, internshipId);
    } catch (e) {
      console.error('Error removing saved internship:', e);
      // Revert if error
      setSavedItems(previous);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest font-mono-code px-2.5 py-0.5 bg-violet-950/70 border border-violet-500/30 rounded-full flex items-center gap-1.5">
              <Bookmark className="w-3 h-3 text-cyan-400" />
              Bookmarked Opportunities
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            Saved Internships
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage and fast-track applications for roles you have bookmarked during discovery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/internships')}
            className="px-3.5 py-2 rounded-xl bg-violet-950/80 hover:bg-violet-900 text-xs font-semibold text-violet-300 border border-violet-700/50 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Discover More Roles</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl p-5 border border-slate-800 animate-pulse space-y-4"
            >
              <div className="h-4 w-28 bg-slate-800 rounded" />
              <div className="h-6 w-48 bg-slate-700 rounded" />
              <div className="h-10 bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && loadError && (
        <Card className="text-center py-10 border-rose-500/30">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white font-heading">Failed to Load Saved Roles</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">{loadError}</p>
          <GlowButton size="sm" className="mt-4" onClick={loadSaved} icon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry
          </GlowButton>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !loadError && savedItems.length === 0 && (
        <Card className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center mx-auto mb-4 text-violet-400">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white font-heading">No Saved Internships Yet</h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">
            Explore active tech internships and bookmark roles that align with your career roadmap to review them here.
          </p>
          <GlowButton
            size="md"
            className="mt-6"
            onClick={() => navigate('/internships')}
            icon={<Compass className="w-4 h-4" />}
          >
            Explore Internships
          </GlowButton>
        </Card>
      )}

      {/* Saved Internships Grid */}
      {!isLoading && !loadError && savedItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedItems.map((item) => {
            const int = item.internship;
            if (!int) return null;

            const isApplied = appliedIds.has(int.id);
            const match = calculateInternshipMatch(
              int.required_skills,
              skills,
              user?.target_career || user?.target_role,
              int.role,
              int.target_careers
            );

            return (
              <Card
                key={item.id}
                glow={match.matchScore >= 80 ? 'purple' : 'none'}
                className="flex flex-col justify-between hover:border-violet-500/50 transition-all duration-200"
              >
                <div className="space-y-3">
                  {/* Header: Company & Remove Bookmark */}
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
                      >
                        {int.role}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleRemoveSaved(int.id)}
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/80 border border-slate-700/80 hover:border-rose-700/60 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer shrink-0"
                      title="Remove from Saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Badges: Match Score, Mode, Stipend */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant={match.matchScore >= 80 ? 'emerald' : match.matchScore >= 60 ? 'cyan' : 'purple'}
                      size="sm"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      {match.matchScore}% Match
                    </Badge>
                    <Badge variant="slate" size="sm">
                      {int.work_mode}
                    </Badge>
                    <Badge variant="purple" size="sm">
                      {int.stipend}
                    </Badge>
                  </div>

                  {/* Why this matches you */}
                  <div className="p-2.5 rounded-xl bg-violet-950/40 border border-violet-500/30 text-[11px] text-violet-200/90 leading-relaxed">
                    <p className="line-clamp-2">{match.whyItMatches}</p>
                  </div>

                  {/* Skills preview */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {int.required_skills.slice(0, 4).map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 text-[10px] rounded-lg bg-slate-900 border border-slate-800 text-slate-400 font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                    {int.required_skills.length > 4 && (
                      <span className="text-[10px] text-slate-500 font-mono-code self-center">
                        +{int.required_skills.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Meta: Location & Deadline */}
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

                {/* Footer Action Buttons */}
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
                      className="flex-1 py-2 text-xs font-semibold rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 text-center flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Applied</span>
                    </div>
                  ) : (
                    <GlowButton
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/internships/${int.id}`)}
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
    </div>
  );
};
