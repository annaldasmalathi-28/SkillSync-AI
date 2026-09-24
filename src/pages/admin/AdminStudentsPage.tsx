import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { dataService } from '../../services/dataService';
import { Profile, StudentSkill, Project } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { GlowButton } from '../../components/common/GlowButton';
import { Modal } from '../../components/common/Modal';
import { ProgressBar } from '../../components/common/ProgressBar';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  Award,
  Mail,
  GraduationCap,
  ExternalLink,
  Code2,
  FileSpreadsheet,
} from 'lucide-react';

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const [studentProjects, setStudentProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const data = await dataService.getAllStudents();
      setStudents(data);
    } catch (e) {
      console.error('Failed to load students:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInspectStudent = async (student: Profile) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
    try {
      const [sk, pr] = await Promise.all([
        dataService.getStudentSkills(student.user_id),
        dataService.getProjects(student.user_id),
      ]);
      setStudentSkills(sk);
      setStudentProjects(pr);
    } catch (e) {
      console.error('Error fetching student details:', e);
    }
  };

  const branches = ['All', ...Array.from(new Set(students.map((s) => s.branch)))];

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.target_career.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = selectedBranch === 'All' || s.branch === selectedBranch;
    return matchesSearch && matchesBranch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center gap-2">
            Student Placement Roster
            <Badge variant="indigo" size="sm">{students.length} Total</Badge>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Search, filter, and inspect verified competencies, academic transcripts, and candidate project portfolios.
          </p>
        </div>

        <button
          onClick={() => alert('Student roster export initiated.')}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" /> Export CSV Roster
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name, email, target role..."
            className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium">Branch:</span>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono-code uppercase text-[10px]">
                <th className="py-3.5 px-4">Student Profile</th>
                <th className="py-3.5 px-4">Department / College</th>
                <th className="py-3.5 px-4">Target Career</th>
                <th className="py-3.5 px-4">Grad Year</th>
                <th className="py-3.5 px-4">Readiness</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No student profiles found matching the criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-950 border border-indigo-700/50 flex items-center justify-center font-bold text-indigo-300 font-mono-code">
                          {student.full_name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <span className="font-semibold text-white block">{student.full_name || 'Anonymous Student'}</span>
                          <span className="text-[11px] text-slate-400">{student.email}</span>
                        </div>
                      </div>
                    </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <div className="font-medium text-slate-200">{student.branch}</div>
                    <div className="text-[10px] text-slate-400">{student.college}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="purple" size="sm">
                      {student.target_career}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-mono-code text-slate-300">
                    {student.graduation_year}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-code font-bold text-emerald-400">88%</span>
                      <Badge variant="emerald" size="sm">Tier 1</Badge>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleInspectStudent(student)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-xs font-semibold text-indigo-200 transition-colors cursor-pointer"
                    >
                      View Dossier
                    </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Student Dossier Detail Modal */}
      {selectedStudent && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Candidate Dossier: ${selectedStudent.full_name}`}
          subtitle={`${selectedStudent.degree} in ${selectedStudent.branch} (${selectedStudent.graduation_year})`}
        >
          <div className="space-y-5">
            {/* Header info */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono-code text-slate-400 block">Target Role</span>
                <span className="text-sm font-bold text-white">{selectedStudent.target_career}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono-code text-slate-400 block">Readiness Index</span>
                <span className="text-sm font-bold text-emerald-400 font-mono-code">88% (Tier 1 Certified)</span>
              </div>
            </div>

            {/* Skills Matrix */}
            <div>
              <h4 className="text-xs font-bold text-slate-200 font-heading mb-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-indigo-400" /> Verified Competencies
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {studentSkills.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-200 font-medium">{s.skill_name}</span>
                    <Badge variant={s.verified ? 'emerald' : 'slate'} size="sm">
                      {s.verified ? `${s.score || 85}%` : s.level}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div>
              <h4 className="text-xs font-bold text-slate-200 font-heading mb-2 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" /> Production Repositories
              </h4>
              <div className="space-y-2">
                {studentProjects.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{p.title}</span>
                      <span className="text-[10px] text-cyan-400 font-mono-code">{p.technologies.join(', ')}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
