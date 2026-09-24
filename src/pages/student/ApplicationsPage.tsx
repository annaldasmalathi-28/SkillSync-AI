import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { dataService } from '../../services/dataService';
import { InternshipApplication, ApplicationStatus } from '../../types';
import { Card } from '../../components/common/Card';
import { GlowButton } from '../../components/common/GlowButton';
import { Badge } from '../../components/common/Badge';
import {
  Send,
  Building2,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Briefcase,
  Search,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Compass,
  XCircle,
} from 'lucide-react';

export const ApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useNavigation();

  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, [user]);

  const loadApplications = async () => {
    if (!user) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const apps = await dataService.getApplications(user.user_id);
      setApplications(apps);
    } catch (e: any) {
      console.error('Error loading applications from Supabase:', e);
      setLoadError('Failed to fetch applications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const statusVariants: Record<string, { badge: 'purple' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate'; icon: any; color: string }> = {
    Applied: { badge: 'purple', icon: Clock, color: 'text-violet-400' },
    'Under Review': { badge: 'cyan', icon: Clock, color: 'text-cyan-400' },
    'Pending Review': { badge: 'cyan', icon: Clock, color: 'text-cyan-400' },
    Shortlisted: { badge: 'purple', icon: Sparkles, color: 'text-violet-300' },
    'Interview Scheduled': { badge: 'purple', icon: Calendar, color: 'text-violet-300' },
    Selected: { badge: 'emerald', icon: CheckCircle2, color: 'text-emerald-400' },
    Accepted: { badge: 'emerald', icon: CheckCircle2, color: 'text-emerald-400' },
    'Offer Extended': { badge: 'emerald', icon: CheckCircle2, color: 'text-emerald-400' },
    Rejected: { badge: 'rose', icon: XCircle, color: 'text-rose-400' },
  };

  const filteredApplications = applications.filter((app) => {
    if (selectedStatusFilter === 'All') return true;
    if (selectedStatusFilter === 'Active') {
      return app.status !== 'Rejected';
    }
    return app.status.toLowerCase().includes(selectedStatusFilter.toLowerCase());
  });

  // Calculate statistics
  const totalApplied = applications.length;
  const underReviewCount = applications.filter(
    (a) => a.status === 'Under Review' || a.status === 'Applied' || a.status === 'Pending Review'
  ).length;
  const shortlistedCount = applications.filter(
    (a) => a.status === 'Shortlisted' || a.status === 'Interview Scheduled'
  ).length;
  const selectedCount = applications.filter(
    (a) => a.status === 'Selected' || a.status === 'Accepted' || a.status === 'Offer Extended'
  ).length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest font-mono-code px-2.5 py-0.5 bg-violet-950/70 border border-violet-500/30 rounded-full flex items-center gap-1.5">
              <Send className="w-3 h-3 text-cyan-400" />
              Application Pipeline Tracker
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            My Applications
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time status tracking for your submitted tech internship applications and recruiter evaluations.
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

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="text-center py-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono-code">
            Total Submitted
          </span>
          <div className="text-2xl font-extrabold text-white font-heading mt-1">{totalApplied}</div>
        </Card>
        <Card className="text-center py-4">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block font-mono-code">
            Under Review
          </span>
          <div className="text-2xl font-extrabold text-cyan-300 font-heading mt-1">{underReviewCount}</div>
        </Card>
        <Card className="text-center py-4">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider block font-mono-code">
            Shortlisted
          </span>
          <div className="text-2xl font-extrabold text-violet-300 font-heading mt-1">{shortlistedCount}</div>
        </Card>
        <Card className="text-center py-4">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block font-mono-code">
            Offers / Selected
          </span>
          <div className="text-2xl font-extrabold text-emerald-400 font-heading mt-1">{selectedCount}</div>
        </Card>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800/80">
        {['All', 'Active', 'Applied', 'Under Review', 'Shortlisted', 'Selected', 'Rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedStatusFilter(tab)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              selectedStatusFilter === tab
                ? 'bg-violet-600 text-white shadow-xs shadow-violet-900/50'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl p-5 border border-slate-800 animate-pulse space-y-3"
            >
              <div className="h-4 w-32 bg-slate-800 rounded" />
              <div className="h-6 w-56 bg-slate-700 rounded" />
              <div className="h-4 w-40 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && loadError && (
        <Card className="text-center py-10 border-rose-500/30">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white font-heading">Failed to Load Applications</h3>
          <p className="text-xs text-slate-300 mt-1">{loadError}</p>
          <GlowButton size="sm" className="mt-4" onClick={loadApplications} icon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry
          </GlowButton>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !loadError && filteredApplications.length === 0 && (
        <Card className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center mx-auto mb-4 text-violet-400">
            <Send className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white font-heading">
            {selectedStatusFilter === 'All' ? 'No Applications Submitted Yet' : `No ${selectedStatusFilter} Applications`}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">
            {selectedStatusFilter === 'All'
              ? 'Find matched engineering roles and submit fast-track applications with your verified skills.'
              : 'You do not have any applications matching the selected filter state.'}
          </p>
          <GlowButton
            size="md"
            className="mt-6"
            onClick={() => navigate('/internships')}
            icon={<Compass className="w-4 h-4" />}
          >
            Discover Opportunities
          </GlowButton>
        </Card>
      )}

      {/* Applications List */}
      {!isLoading && !loadError && filteredApplications.length > 0 && (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const role = app.role || app.internship?.role || 'Software Engineering Intern';
            const company = app.company || app.internship?.company || 'Tech Enterprise';
            const statusConfig = statusVariants[app.status] || {
              badge: 'purple',
              icon: Clock,
              color: 'text-violet-400',
            };
            const StatusIcon = statusConfig.icon;

            return (
              <Card
                key={app.id}
                className="hover:border-violet-500/50 transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-400 uppercase font-mono-code">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{company}</span>
                      </div>
                      <Badge variant={statusConfig.badge} size="sm">
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {app.status}
                      </Badge>
                      {app.match_score !== undefined && (
                        <span className="text-[10px] font-semibold text-emerald-400 px-2 py-0.5 bg-emerald-950/60 border border-emerald-700/50 rounded-lg flex items-center gap-1 font-mono-code">
                          <Sparkles className="w-2.5 h-2.5" />
                          {app.match_score}% Match
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => app.internship_id && navigate(`/internships/${app.internship_id}`)}
                      className="text-base font-bold text-white font-heading hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      {role}
                    </h3>

                    {app.internship && (
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span>{app.internship.location}</span>
                        <span>•</span>
                        <span>{app.internship.work_mode}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">{app.internship.stipend}</span>
                      </div>
                    )}

                    {app.notes && (
                      <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 line-clamp-2">
                        {app.notes}
                      </p>
                    )}
                  </div>

                  {/* Right Meta Column */}
                  <div className="flex md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-400 block font-mono-code">Applied on</span>
                      <span className="text-xs font-semibold text-slate-200">
                        {app.applied_date || app.applied_at?.split('T')[0] || 'Recently'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {app.internship_id && (
                        <button
                          onClick={() => navigate(`/internships/${app.internship_id}`)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>View Role</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
