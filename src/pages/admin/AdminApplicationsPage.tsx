import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { dataService } from '../../services/dataService';
import { Application, ApplicationStatus, Internship } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { GlowButton } from '../../components/common/GlowButton';
import { Modal } from '../../components/common/Modal';
import {
  FileCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  Award,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

export const AdminApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const [apps, ints] = await Promise.all([
        dataService.getAllApplications(),
        dataService.getInternships(),
      ]);
      setApplications(apps);
      setInternships(ints);
    } catch (e) {
      console.error('Error loading applications:', e);
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      await dataService.updateApplicationStatus(appId, newStatus);
      await loadApplications();
      if (selectedApp?.id === appId) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
    } catch (e) {
      console.error('Error updating application status:', e);
    }
  };

  const filtered = applications.filter((app) => {
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesSearch =
      app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
            Institutional Applications Pool
            <Badge variant="indigo" size="sm">{applications.length} Submissions</Badge>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review student candidates, manage hiring pipeline status, and coordinate interview stages with recruiters.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search role or enterprise sponsor..."
            className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Pending Review', 'Shortlisted', 'Interview Scheduled', 'Offer Extended', 'Rejected'].map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-medium rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>
      </div>

      {/* Applications Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono-code uppercase text-[10px]">
                <th className="py-3.5 px-4">Opportunity</th>
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-4">Applied Date</th>
                <th className="py-3.5 px-4">Match Index</th>
                <th className="py-3.5 px-4">Pipeline Status</th>
                <th className="py-3.5 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((app) => (
                <tr key={app.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-white block">{app.role}</span>
                    <span className="text-[11px] text-indigo-300 font-medium">{app.company}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <div className="font-medium text-slate-100">{app.student_name || 'Candidate'}</div>
                    <div className="text-[10px] text-slate-400">{app.student_college || app.student_email || 'Engineering'}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono-code text-slate-400">
                    {app.applied_date}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono-code font-bold text-emerald-400">{app.match_score}% Match</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        app.status === 'Offer Extended'
                          ? 'emerald'
                          : app.status === 'Interview Scheduled'
                          ? 'cyan'
                          : app.status === 'Shortlisted'
                          ? 'purple'
                          : app.status === 'Rejected'
                          ? 'rose'
                          : 'amber'
                      }
                      size="sm"
                    >
                      {app.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <select
                      value={app.status}
                      onChange={(e) => handleUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Pending Review">Pending Review</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Offer Extended">Offer Extended</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
