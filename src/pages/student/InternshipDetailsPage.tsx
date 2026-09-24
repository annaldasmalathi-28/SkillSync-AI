import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { dataService } from '../../services/dataService';
import { calculateInternshipMatch } from '../../services/careerMatrix';
import { Internship, StudentSkill, InternshipApplication } from '../../types';
import { Card } from '../../components/common/Card';
import { GlowButton } from '../../components/common/GlowButton';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Send,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  ShieldCheck,
  Clock,
  Check,
  Layers,
  ArrowRight,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface InternshipDetailsPageProps {
  internshipId?: string;
}

export const InternshipDetailsPage: React.FC<InternshipDetailsPageProps> = ({ internshipId }) => {
  const { user } = useAuth();
  const { currentPath, navigate } = useNavigation();

  // Extract ID from path if not passed as prop
  const idFromPath = currentPath.split('/internships/')[1];
  const targetId = internshipId || idFromPath;

  const [internship, setInternship] = useState<Internship | null>(null);
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [application, setApplication] = useState<InternshipApplication | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Apply Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [resumeUrl, setResumeUrl] = useState(user?.portfolio_url || '');
  const [coverNote, setCoverNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    loadDetails();
  }, [user, targetId]);

  const loadDetails = async () => {
    if (!user || !targetId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const studentId = user.user_id;
      const [targetInt, studentSkills, savedList, appsList] = await Promise.all([
        dataService.getInternshipById(targetId),
        dataService.getStudentSkills(studentId),
        dataService.getSavedInternships(studentId),
        dataService.getApplications(studentId),
      ]);

      if (targetInt) {
        setInternship(targetInt);
        const targetRole = user.target_role || user.target_career || 'Software Engineer';
        setCoverNote(
          `Dear ${targetInt.company} Recruiting Team,\n\nI am writing to express my strong enthusiasm for the ${targetInt.role} position. As a student specializing in ${targetRole}, my verified technical skill profile demonstrates strong alignment with your required technologies.`
        );
      } else {
        setLoadError('Internship record not found or no longer active in database.');
      }

      setSkills(studentSkills);
      setIsSaved(savedList.some((s) => s.internship_id === targetId));

      const existingApp = appsList.find((a) => a.internship_id === targetId);
      setApplication(existingApp || null);
    } catch (e: any) {
      console.error('Error loading internship details from Supabase:', e);
      setLoadError('Failed to load internship specifications. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!user || !internship) return;
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    try {
      if (nextSaved) {
        await dataService.saveInternship({
          user_id: user.user_id,
          internship_id: internship.id,
          saved_at: new Date().toISOString(),
        });
      } else {
        await dataService.unsaveInternship(user.user_id, internship.id);
      }
    } catch (e) {
      console.error('Failed to toggle save status:', e);
      setIsSaved(!nextSaved);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !internship) return;
    setIsSubmitting(true);
    setApplyError(null);

    try {
      const match = calculateInternshipMatch(
        internship.required_skills,
        skills,
        user.target_career || user.target_role,
        internship.role,
        internship.target_careers
      );

      const newApp = await dataService.submitApplication({
        user_id: user.user_id,
        internship_id: internship.id,
        role: internship.role,
        company: internship.company,
        applied_date: new Date().toISOString().split('T')[0],
        status: 'Applied',
        match_score: match.matchScore,
        resume_url: resumeUrl,
        cover_note: coverNote,
        student_name: user.full_name,
        student_email: user.email,
        student_college: user.college,
        student_target_career: user.target_career || user.target_role,
      });

      setApplication(newApp);
      setIsApplyModalOpen(false);

      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#38BDF8', '#10B981', '#F59E0B'],
      });
    } catch (err: any) {
      console.error('Failed to submit application:', err);
      setApplyError(err.message || 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-mono-code">Retrieving Role Specifications...</p>
        </div>
      </div>
    );
  }

  if (loadError || !internship) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <Card className="border-rose-500/40 p-8">
          <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white font-heading">Internship Record Unavailable</h2>
          <p className="text-xs text-slate-300 mt-1">{loadError || 'The requested internship could not be located in Supabase.'}</p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => navigate('/internships')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
            >
              Back to Catalog
            </button>
            <GlowButton size="sm" onClick={loadDetails} icon={<RefreshCw className="w-3.5 h-3.5" />}>
              Retry Sync
            </GlowButton>
          </div>
        </Card>
      </div>
    );
  }

  const matchData = calculateInternshipMatch(
    internship.required_skills,
    skills,
    user?.target_career || user?.target_role,
    internship.role,
    internship.target_careers
  );

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/internships')}
          className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Discover Internships
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/saved')}
            className="text-xs text-violet-400 hover:text-violet-300 inline-flex items-center gap-1 cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5" /> View Saved Roles
          </button>
        </div>
      </div>

      {/* Main Role Banner Card */}
      <div className="glass-card rounded-3xl p-6 md:p-8 border border-violet-500/30 shadow-xl shadow-violet-950/40 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-violet-300 uppercase tracking-widest font-mono-code px-3 py-1 bg-violet-950/80 border border-violet-500/40 rounded-full flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-violet-400" />
                {internship.company}
              </span>
              <Badge variant="cyan">{internship.work_mode}</Badge>
              {internship.duration && <Badge variant="slate">{internship.duration}</Badge>}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-white">
              {internship.role}
            </h1>

            <div className="flex flex-wrap items-center gap-5 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-violet-400" /> {internship.location}
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <strong className="text-slate-100">{internship.stipend}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Deadline: {internship.deadline}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleToggleSave}
              className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-violet-950/80 border-violet-500/80 text-cyan-300'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-white'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save for Later'}
            >
              {isSaved ? <BookmarkCheck className="w-5 h-5 text-cyan-400" /> : <Bookmark className="w-5 h-5" />}
            </button>

            {application ? (
              <div
                onClick={() => navigate('/applications')}
                className="px-4 py-3 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 text-xs font-bold text-emerald-300 flex items-center gap-2 cursor-pointer hover:bg-emerald-900/80 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Application Submitted ({application.status})</span>
              </div>
            ) : (
              <GlowButton
                size="lg"
                onClick={() => setIsApplyModalOpen(true)}
                icon={<Send className="w-4 h-4" />}
              >
                Apply Now
              </GlowButton>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column: Match Analytics & Full Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1/3): Match Score & Skill Analysis */}
        <div className="space-y-6">
          {/* Match Score Card */}
          <Card glow={matchData.matchScore >= 80 ? 'purple' : 'cyan'}>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white font-heading flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-violet-400" />
                Skill Match Analysis
              </span>
              <Badge
                variant={matchData.matchScore >= 80 ? 'emerald' : matchData.matchScore >= 60 ? 'cyan' : 'purple'}
              >
                {matchData.matchScore}% Overall
              </Badge>
            </div>

            <div className="text-center py-2 mb-3">
              <div className="text-4xl font-extrabold font-heading text-white font-mono-code">
                {matchData.matchScore}%
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {matchData.matchedSkills.length} of {internship.required_skills.length} skills in profile
              </p>
            </div>

            {/* Why This Internship Matches You */}
            <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-500/30 text-xs text-violet-200 space-y-1 mb-4">
              <span className="font-semibold text-cyan-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Why this internship matches you:
              </span>
              <p className="text-[11px] leading-relaxed text-slate-300">
                {matchData.whyItMatches}
              </p>
            </div>

            {/* Skills You Already Have */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block font-mono-code">
                Skills You Already Have ({matchData.matchedSkills.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchData.matchedSkills.map((sk) => {
                  const isVerified = matchData.verifiedMatchedSkills.includes(sk);
                  return (
                    <span
                      key={sk}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 flex items-center gap-1 font-medium"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {sk}
                      {isVerified && <span className="text-[9px] text-emerald-400 font-mono-code">(Verified)</span>}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Skills You Need to Improve */}
            {matchData.missingSkills.length > 0 && (
              <div className="space-y-2 mt-4 pt-3 border-t border-slate-800">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block font-mono-code">
                  Skills to Improve ({matchData.missingSkills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {matchData.missingSkills.map((sk) => (
                    <span
                      key={sk}
                      className="px-2.5 py-1 text-[10px] rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => navigate('/verification')}
              className="w-full mt-5 py-2.5 rounded-xl bg-violet-950/80 hover:bg-violet-900 border border-violet-700/50 text-xs font-semibold text-violet-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4 text-cyan-400" />
              Take Skill Assessments
            </button>
          </Card>

          {/* Quick Overview Card */}
          <Card>
            <h3 className="text-xs font-bold text-white font-heading pb-2 mb-3 border-b border-slate-800">
              Role Snapshot
            </h3>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Work Mode:</span>
                <span className="font-semibold text-slate-100">{internship.work_mode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Duration:</span>
                <span className="font-semibold text-slate-100">{internship.duration}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Stipend:</span>
                <span className="font-semibold text-emerald-400">{internship.stipend}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Application Deadline:</span>
                <span className="font-semibold text-cyan-400">{internship.deadline}</span>
              </div>
              {internship.applicant_count !== undefined && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Active Applicants:</span>
                  <span className="font-semibold text-slate-100">{internship.applicant_count}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column (2/3): Description, Responsibilities, Requirements */}
        <div className="lg:col-span-2 space-y-6">
          {/* About the Role */}
          <Card>
            <div className="pb-3 mb-4 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white font-heading">Role Description</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {internship.description}
            </p>
          </Card>

          {/* Responsibilities */}
          {internship.responsibilities && internship.responsibilities.length > 0 && (
            <Card>
              <div className="pb-3 mb-4 border-b border-slate-800">
                <h2 className="text-sm font-bold text-white font-heading">Key Responsibilities</h2>
              </div>
              <ul className="space-y-2.5">
                {internship.responsibilities.map((resp, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Requirements & Eligibility */}
          <Card>
            <div className="pb-3 mb-4 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white font-heading">Qualifications & Eligibility</h2>
            </div>

            {internship.eligibility && (
              <div className="mb-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <span className="font-semibold text-violet-300 block mb-1">Academic Eligibility:</span>
                {internship.eligibility}
              </div>
            )}

            {internship.requirements && internship.requirements.length > 0 ? (
              <ul className="space-y-2.5">
                {internship.requirements.map((req, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">
                Candidates with coursework or demonstrated personal projects in {internship.required_skills.join(', ')} are strongly encouraged to apply.
              </p>
            )}
          </Card>

          {/* Perks / Benefits */}
          {internship.perks && internship.perks.length > 0 && (
            <Card>
              <div className="pb-3 mb-4 border-b border-slate-800">
                <h2 className="text-sm font-bold text-white font-heading">Internship Perks & Mentorship</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {internship.perks.map((perk, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-xs text-slate-200"
                  >
                    <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Bottom Action Card */}
          <div className="glass-card p-6 rounded-2xl border border-violet-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white font-heading">Ready to join {internship.company}?</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Fast-track your application with verified diagnostic scores and student credentials.
              </p>
            </div>

            {application ? (
              <div className="px-4 py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-xs font-bold text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Application Already Submitted</span>
              </div>
            ) : (
              <GlowButton size="md" onClick={() => setIsApplyModalOpen(true)} icon={<Send className="w-4 h-4" />}>
                Apply Now
              </GlowButton>
            )}
          </div>
        </div>
      </div>

      {/* Apply Fast-Track Modal */}
      {isApplyModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsApplyModalOpen(false)}
          title={`Apply for ${internship.role}`}
          subtitle={`${internship.company} • ${internship.location} • ${internship.stipend}`}
        >
          <form onSubmit={handleSubmitApplication} className="space-y-4">
            {applyError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-xs text-rose-200">
                {applyError}
              </div>
            )}

            <div className="p-3 rounded-xl bg-violet-950/60 border border-violet-500/40 text-xs text-violet-200 space-y-1">
              <span className="font-semibold block text-cyan-300">
                Verified Fast-Track Direct Submission:
              </span>
              <p>
                Your diagnostic verified scores and current match score ({matchData.matchScore}%) will be forwarded directly to the university campus recruiting portal.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Resume Document Link (PDF)
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
                Personal Statement & Technical Portfolio Links
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
                onClick={() => setIsApplyModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <GlowButton
                type="submit"
                size="md"
                isLoading={isSubmitting}
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
