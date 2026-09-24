import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { dataService } from '../../services/dataService';
import { Internship } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { GlowButton } from '../../components/common/GlowButton';
import { Modal } from '../../components/common/Modal';
import {
  Briefcase,
  Plus,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Trash2,
  Edit,
  Search,
  ExternalLink,
  Users,
} from 'lucide-react';

export const AdminInternshipsPage: React.FC = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [stipend, setStipend] = useState('');
  const [duration, setDuration] = useState('6 Months');
  const [workMode, setWorkMode] = useState<'Remote' | 'Hybrid' | 'On-site'>('Hybrid');
  const [description, setDescription] = useState('');
  const [skillsStr, setSkillsStr] = useState('React, TypeScript, Node.js');

  useEffect(() => {
    loadInternships();
  }, []);

  const loadInternships = async () => {
    const data = await dataService.getInternships();
    setInternships(data);
  };

  const handleCreateInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !company) return;
    setIsSaving(true);

    try {
      const newInt: Internship = {
        id: `int-admin-${Date.now()}`,
        role,
        company,
        company_logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(company)}`,
        location,
        stipend,
        duration,
        work_mode: workMode,
        description,
        required_skills: skillsStr.split(',').map((s) => s.trim()).filter(Boolean),
        responsibilities: [
          'Develop full-stack modular features with TypeScript & modern frameworks',
          'Collaborate with engineering managers on weekly production releases',
          'Participate in sprint retrospectives and code review cycles',
        ],
        perks: ['Mentorship program', 'Pre-Placement Offer (PPO) conversion opportunity', 'Flexible hours'],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        is_active: true,
      };

      await dataService.saveInternships([...internships, newInt]);
      await loadInternships();
      setIsModalOpen(false);
    } catch (e) {
      console.error('Error creating internship:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = internships.filter(
    (i) =>
      i.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
            Corporate Internship Listings
            <Badge variant="cyan" size="sm">{internships.length} Active Postings</Badge>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Publish, manage, and coordinate campus placement partnerships and verified student recruitment drives.
          </p>
        </div>

        <GlowButton
          size="md"
          variant="cyan"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Post New Opportunity
        </GlowButton>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles or enterprise recruiters..."
            className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Internships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <Card key={item.id} className="flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 p-1 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-heading">{item.role}</h3>
                    <p className="text-xs text-indigo-300 font-medium">{item.company}</p>
                  </div>
                </div>

                <Badge variant={item.work_mode === 'Remote' ? 'emerald' : 'cyan'}>
                  {item.work_mode}
                </Badge>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 my-2.5">{item.description}</p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {item.required_skills.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-mono-code"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-slate-400">
                <span className="font-semibold text-emerald-400 font-mono-code">{item.stipend}</span>
                <span>• {item.location}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-400" /> 18 Applicants
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Post Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post Corporate Internship Opportunity"
        subtitle="Make this listing visible immediately to eligible verified students"
      >
        <form onSubmit={handleCreateInternship} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Role Title *</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Cloud Platform Engineer Intern"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Enterprise Company *</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Microsoft, Google, Razorpay"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bengaluru, KA"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Stipend</label>
              <input
                type="text"
                value={stipend}
                onChange={(e) => setStipend(e.target.value)}
                placeholder="e.g. ₹65,000 / mo"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Work Mode</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Required Skills (Comma separated)</label>
            <input
              type="text"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              placeholder="e.g. React, TypeScript, GraphQL, Docker"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Role description, team overview, and impact expectations..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <GlowButton type="submit" size="md" variant="cyan" isLoading={isSaving}>
              Publish Opportunity
            </GlowButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};
