import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { dataService } from '../../services/dataService';
import { Profile, Internship, Application, StudentSkill } from '../../types';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { GlowButton } from '../../components/common/GlowButton';
import { ProgressBar } from '../../components/common/ProgressBar';
import {
  ShieldAlert,
  Users,
  Briefcase,
  Award,
  TrendingUp,
  FileCheck,
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Download,
  AlertCircle,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useNavigation();

  const [students, setStudents] = useState<Profile[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [stList, intList] = await Promise.all([
        dataService.getAllStudents(),
        dataService.getInternships(),
      ]);

      setStudents(stList);
      setInternships(intList);

      // Load all student applications
      const apps = await dataService.getAllApplications();
      setApplications(apps);
    } catch (e) {
      console.error('Error loading admin dashboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPlaced = applications.filter((a) => a.status === 'Offer Extended').length;
  const inReview = applications.filter((a) => a.status === 'Pending Review' || a.status === 'Shortlisted').length;
  const pendingScreenings = applications.filter((a) => a.status === 'Pending Review').length;
  const activeInterviews = applications.filter((a) => a.status === 'Interview Scheduled' || a.status === 'Shortlisted').length;
  const confirmedOffers = applications.filter((a) => a.status === 'Offer Extended').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Greeting Banner */}
      <div className="glass-card rounded-3xl p-6 md:p-8 border border-indigo-500/40 shadow-xl shadow-indigo-950/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-600/15 via-violet-600/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300">
                🛡️ University Placement Command Console
              </span>
              <span className="text-xs text-slate-400">Academic Year 2025–2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
              Institutional Placement & Skill Telemetry
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Monitor cohort-wide diagnostic verifications, campus hiring pipelines, and curriculum readiness metrics across all engineering branches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <GlowButton
              size="md"
              variant="cyan"
              onClick={() => navigate('/admin/internships')}
              icon={<Briefcase className="w-4 h-4" />}
            >
              Post Opportunity
            </GlowButton>
            <button
              onClick={() => navigate('/admin/reports')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-400" /> Export Compliance
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Registered Students"
          value={students.length}
          subtext="Active cohort candidates"
          icon={<Users className="w-5 h-5 text-indigo-400" />}
          glow="purple"
        />
        <StatCard
          label="Candidate Applications"
          value={applications.length}
          subtext="Submitted across roles"
          icon={<Award className="w-5 h-5 text-emerald-400" />}
          glow="cyan"
        />
        <StatCard
          label="Partner Internships"
          value={internships.length}
          subtext="Active campus postings"
          icon={<Briefcase className="w-5 h-5 text-cyan-400" />}
          glow="blue"
        />
        <StatCard
          label="Offers Extended"
          value={confirmedOffers}
          subtext="Placed students"
          icon={<TrendingUp className="w-5 h-5 text-violet-400" />}
          glow="none"
        />
      </div>

      {/* 2-Column: Department Breakdown & Placement Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3: Department Readiness Breakdown */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white font-heading">Departmental Distribution</h2>
              <p className="text-xs text-slate-400">Enrolled students across programs</p>
            </div>
            <button
              onClick={() => navigate('/admin/analytics')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              View Analytics →
            </button>
          </div>

          <div className="space-y-4 pt-2">
            {students.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No students enrolled yet. Once students create accounts, cohort analytics will automatically populate.
              </div>
            ) : (
              students.slice(0, 4).map((st) => (
                <div key={st.id} className="space-y-1.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{st.full_name} ({st.branch || st.degree})</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400">{st.college}</span>
                      <span className="font-mono-code font-bold text-cyan-300">{st.target_career}</span>
                    </div>
                  </div>
                  <ProgressBar value={75} color="violet" height="sm" />
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right 1/3: Quick Recruitment Pipeline Status */}
        <Card glow="purple" className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white font-heading">Recruitment Funnel</h2>
              <Badge variant="cyan">Real-time Pipeline</Badge>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Pending Screenings</span>
                </div>
                <span className="font-mono-code font-bold text-amber-400">{pendingScreenings}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Active Review & Interviews</span>
                </div>
                <span className="font-mono-code font-bold text-cyan-400">{activeInterviews}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Confirmed Offer Letters</span>
                </div>
                <span className="font-mono-code font-bold text-emerald-400">{confirmedOffers}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/applications')}
            className="w-full mt-4 py-2.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/50 text-xs font-semibold text-indigo-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileCheck className="w-3.5 h-3.5" />
            Review Student Applications Pool
          </button>
        </Card>
      </div>

      {/* Recent Student Profiles Table */}
      <Card>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white font-heading">Top Student Career Profiles</h2>
            <p className="text-xs text-slate-400">Live verified candidate roster</p>
          </div>
          <button
            onClick={() => navigate('/admin/students')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
          >
            Full Directory ({students.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono-code uppercase text-[10px]">
                <th className="pb-3">Candidate</th>
                <th className="pb-3">Target Career</th>
                <th className="pb-3">College / Branch</th>
                <th className="pb-3">Grad Year</th>
                <th className="pb-3">Readiness</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No student profiles registered yet
                  </td>
                </tr>
              ) : (
                students.slice(0, 5).map((st) => (
                  <tr key={st.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-violet-950 border border-violet-700/50 flex items-center justify-center text-xs font-bold text-violet-300 font-mono-code">
                          {st.full_name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <span className="font-semibold text-white block">{st.full_name || 'Anonymous Student'}</span>
                          <span className="text-[10px] text-slate-400">{st.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge variant="purple" size="sm">{st.target_career || 'General'}</Badge>
                    </td>
                    <td className="py-3 text-slate-300">
                      {st.degree} {st.branch ? `(${st.branch})` : ''}
                    </td>
                    <td className="py-3 text-slate-400 font-mono-code">
                      {st.graduation_year || '—'}
                    </td>
                    <td className="py-3">
                      <span className="font-mono-code font-bold text-emerald-400">{st.cgpa ? `CGPA ${st.cgpa}` : 'Active'}</span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => navigate('/admin/students')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 transition-colors cursor-pointer"
                      >
                        Inspect Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
