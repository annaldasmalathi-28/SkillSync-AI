import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import {
  User,
  Mail,
  Building2,
  GraduationCap,
  BookOpen,
  Calendar,
  Award,
  Code2,
  Compass,
  FileText,
  Save,
  CheckCircle2,
  Github,
  Linkedin,
  Globe,
  Camera,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { GlowButton } from '../../components/common/GlowButton';
import { Badge } from '../../components/common/Badge';
import { TARGET_CAREERS } from '../../services/careerMatrix';
import { TargetCareerTitle } from '../../types';

export const ProfilePage: React.FC = () => {
  const { user, updateCurrentProfile } = useAuth();
  const { navigate } = useNavigation();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email] = useState(user?.email || '');
  const [college, setCollege] = useState(user?.college || '');
  const [degree, setDegree] = useState(user?.degree || '');
  const [branch, setBranch] = useState(user?.branch || '');
  const [graduationYear, setGraduationYear] = useState(user?.graduation_year || '');
  const [cgpa, setCgpa] = useState(user?.cgpa || '');
  const [codingExperience, setCodingExperience] = useState(user?.coding_experience || '');
  const [targetCareer, setTargetCareer] = useState<TargetCareerTitle>(
    user?.target_career || 'Software Developer'
  );
  const [bio, setBio] = useState(user?.bio || '');
  const [githubUrl, setGithubUrl] = useState(user?.github_url || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin_url || '');
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolio_url || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  useEffect(() => {
    if (user) {
      if (user.full_name) setFullName(user.full_name);
      if (user.college) setCollege(user.college);
      if (user.degree) setDegree(user.degree);
      if (user.branch) setBranch(user.branch);
      if (user.graduation_year) setGraduationYear(user.graduation_year);
      if (user.cgpa) setCgpa(user.cgpa);
      if (user.coding_experience) setCodingExperience(user.coding_experience);
      if (user.target_career) setTargetCareer(user.target_career as TargetCareerTitle);
      if (user.bio) setBio(user.bio);
      if (user.github_url) setGithubUrl(user.github_url);
      if (user.linkedin_url) setLinkedinUrl(user.linkedin_url);
      if (user.portfolio_url) setPortfolioUrl(user.portfolio_url);
      if (user.avatar_url) setAvatarUrl(user.avatar_url);
    }
  }, [user]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateCurrentProfile({
        full_name: fullName,
        college,
        degree,
        branch,
        graduation_year: graduationYear,
        cgpa,
        coding_experience: codingExperience,
        target_career: targetCareer,
        bio,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        portfolio_url: portfolioUrl,
        avatar_url: avatarUrl,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e) {
      console.error('Failed to update profile:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const cyclePresetAvatar = () => {
    const presets = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    ];
    const nextIdx = (presets.indexOf(avatarUrl) + 1) % presets.length;
    setAvatarUrl(presets[nextIdx]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Student Career Profile</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your academic credentials, target career alignment, and verified telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="purple" icon={<Award className="w-3.5 h-3.5" />}>
            Verified Student Profile
          </Badge>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-600/50 text-xs text-emerald-300 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Profile synchronized successfully with Supabase database!</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card & Avatar */}
        <Card glow="purple">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group">
              <img
                src={avatarUrl}
                alt="Profile Avatar"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-violet-500/50 shadow-lg shadow-violet-950/60"
              />
              <button
                type="button"
                onClick={cyclePresetAvatar}
                className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] text-white font-medium transition-opacity cursor-pointer"
              >
                <Camera className="w-5 h-5 mb-1 text-cyan-400" />
                Change Photo
              </button>
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-bold font-heading text-white">{fullName}</h2>
                <Badge variant="cyan">{degree}</Badge>
              </div>
              <p className="text-xs text-slate-400">{college}</p>
              <p className="text-xs text-violet-300 font-medium">
                Target Role: <span className="text-white font-semibold">{targetCareer}</span>
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate('/resume')}
                className="px-3 py-1.5 rounded-xl bg-violet-950/80 hover:bg-violet-900 border border-violet-700/50 text-xs font-semibold text-violet-300 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Resume & ATS
              </button>
            </div>
          </div>
        </Card>

        {/* Section 1: Academic & University Records */}
        <Card>
          <div className="pb-3 mb-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white font-heading">Academic & Institutional Records</h2>
            <p className="text-xs text-slate-400">Institutional validation for campus hiring pools</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">University / College</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Degree Program</label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Branch / Specialization</label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Graduation Year</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cumulative CGPA / GPA</label>
              <div className="relative">
                <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  placeholder="e.g. 3.88 / 4.0 or 9.2 / 10"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Section 2: Career Alignment & Experience */}
        <Card>
          <div className="pb-3 mb-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white font-heading">Career Strategy & Engineering Background</h2>
            <p className="text-xs text-slate-400">Drives customized gap analysis and roadmap generation</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Target Career</label>
              <div className="relative">
                <Compass className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={targetCareer}
                  onChange={(e) => setTargetCareer(e.target.value as TargetCareerTitle)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-violet-500 cursor-pointer"
                >
                  {TARGET_CAREERS.map((c) => (
                    <option key={c.title} value={c.title}>
                      {c.title} ({c.marketDemand} Market Demand)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Coding Experience Summary</label>
              <div className="relative">
                <Code2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={codingExperience}
                  onChange={(e) => setCodingExperience(e.target.value)}
                  placeholder="e.g. 3+ Years (TypeScript, React, Python, Docker)"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Professional Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>
        </Card>

        {/* Section 3: Social & Portfolio Links */}
        <Card>
          <div className="pb-3 mb-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white font-heading">Online Portfolio & Proof of Work</h2>
            <p className="text-xs text-slate-400">Visible to recruiter partner networks</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">GitHub Profile</label>
              <div className="relative">
                <Github className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">LinkedIn Profile</label>
              <div className="relative">
                <Linkedin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Portfolio Website</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://mywebsite.dev"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <GlowButton
            type="submit"
            size="lg"
            isLoading={isSaving}
            icon={<Save className="w-4 h-4" />}
          >
            Save Profile Changes
          </GlowButton>
        </div>
      </form>
    </div>
  );
};
