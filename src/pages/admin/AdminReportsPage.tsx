import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { GlowButton } from '../../components/common/GlowButton';
import {
  FileSpreadsheet,
  Download,
  ShieldCheck,
  Building,
  GraduationCap,
  FileText,
  CheckCircle2,
} from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const handleDownloadReport = (title: string) => {
    alert(`Generating institutional report: "${title}". File download initiated.`);
  };

  const reports = [
    {
      title: 'NBA & NAAC Accreditation Placement Metrics',
      description: 'Comprehensive graduate outcomes, placement ratios, verified skill matrices, and employer partner endorsements.',
      format: 'PDF / XLSX',
      date: 'Generated on demand',
      badge: 'NBA Tier-1 Standard',
    },
    {
      title: 'Corporate Skill Verification Audit Trail',
      description: 'Timestamped proctoring logs, algorithmic assessment scores, and identity verification data for all students.',
      format: 'CSV / Encrypted PDF',
      date: 'Updated Daily',
      badge: 'Audit Verified',
    },
    {
      title: 'Departmental Career Readiness Index Report',
      description: 'Granular breakdown of average readiness index by branch (CSE, IT, ECE, AIDS) and graduation year.',
      format: 'XLSX Spreadsheet',
      date: 'Q1 2026',
      badge: 'Dean Executive Brief',
    },
    {
      title: 'Campus Internship Conversion & PPO Forecast',
      description: 'Active corporate applications, shortlisting conversion rates, and projected Pre-Placement Offers for final years.',
      format: 'PDF Presentation',
      date: 'Active Term',
      badge: 'Recruiter Operations',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
            Accreditation & Compliance Reports
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Download audited placement data, skill verification telemetry, and university accreditation dossiers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((rep) => (
          <Card key={rep.title} className="flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-heading">{rep.title}</h3>
                    <span className="text-[10px] text-slate-400 font-mono-code">{rep.format} • {rep.date}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 my-2.5 leading-relaxed">{rep.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <Badge variant="indigo" size="sm">{rep.badge}</Badge>

              <button
                onClick={() => handleDownloadReport(rep.title)}
                className="px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/50 text-xs font-semibold text-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" /> Download
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
