import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { Project } from '../../types';
import { Card } from '../../components/common/Card';
import { GlowButton } from '../../components/common/GlowButton';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Code2,
  Clock,
  Github,
  ExternalLink,
  CheckCircle2,
  Layers,
  Sparkles,
  Plus,
  Play,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Submit project repo modal
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await dataService.getProjects(user.user_id);
      setProjects(data);
    } catch (e) {
      console.error('Error loading projects:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (proj: Project, newStatus: 'Not Started' | 'In Progress' | 'Completed') => {
    // Optimistic UI update
    setProjects((prev) =>
      prev.map((p) => (p.id === proj.id ? { ...p, status: newStatus } : p))
    );

    if (newStatus === 'Completed') {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#38BDF8', '#8B5CF6', '#10B981'],
      });
    }

    try {
      await dataService.updateProject(
        proj.id,
        { status: newStatus, completed: newStatus === 'Completed' },
        user?.user_id
      );
    } catch (e) {
      console.error('Failed to update project status:', e);
      await loadProjects();
    }
  };

  const handleSaveRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !repoUrl) return;
    setIsSubmitting(true);

    try {
      await dataService.updateProject(activeProject.id, {
        github_url: repoUrl,
        status: 'In Progress',
      });
      await loadProjects();
      setActiveProject(null);
      setRepoUrl('');
    } catch (e) {
      console.error('Failed to save project repo:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (selectedDifficulty === 'All') return true;
    return p.difficulty === selectedDifficulty;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Recommended Capstone Projects</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Production-grade software architectures engineered to showcase senior competencies to hiring managers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="cyan" icon={<Code2 className="w-3.5 h-3.5" />}>
            {projects.filter((p) => p.status === 'Completed').length} / {projects.length} Completed
          </Badge>
        </div>
      </div>

      {/* Difficulty Filter */}
      <div className="flex items-center gap-2">
        {['All', 'Intermediate', 'Advanced'].map((diff) => (
          <button
            key={diff}
            onClick={() => setSelectedDifficulty(diff)}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
              selectedDifficulty === diff
                ? 'bg-violet-600 text-white shadow-xs shadow-violet-900/60'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {diff}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProjects.map((proj) => {
          const isDone = proj.status === 'Completed';
          const isInProgress = proj.status === 'In Progress';

          return (
            <Card
              key={proj.id}
              glow={isDone ? 'none' : isInProgress ? 'purple' : 'none'}
              className="flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest font-mono-code">
                      {proj.category}
                    </span>
                    <h3 className="text-base font-bold text-white font-heading mt-0.5">
                      {proj.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={proj.difficulty === 'Advanced' ? 'purple' : 'cyan'} size="sm">
                      {proj.difficulty}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>

                {/* Tech Stack */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono-code block mb-1.5">
                    Architecture Stack
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300 border border-slate-700/80"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {proj.estimated_time}
                  </span>
                  {proj.github_url && (
                    <a
                      href={proj.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-violet-400 hover:text-violet-300 font-mono-code text-[11px]"
                    >
                      <Github className="w-3.5 h-3.5" />
                      Repo Linked
                    </a>
                  )}
                </div>
              </div>

              {/* Status / Actions */}
              <div className="pt-4 mt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant={isDone ? 'emerald' : isInProgress ? 'purple' : 'slate'}
                    size="sm"
                  >
                    Status: {proj.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveProject(proj);
                      setRepoUrl(proj.github_url || '');
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
                    title="Link GitHub Repository"
                  >
                    <Github className="w-3.5 h-3.5" />
                    {proj.github_url ? 'Update Repo' : 'Link Repo'}
                  </button>

                  {isDone ? (
                    <button
                      onClick={() => handleUpdateStatus(proj, 'In Progress')}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                    >
                      Reopen
                    </button>
                  ) : (
                    <GlowButton
                      size="sm"
                      onClick={() => handleUpdateStatus(proj, 'Completed')}
                      icon={<Check className="w-3.5 h-3.5" />}
                    >
                      Mark Complete
                    </GlowButton>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Link GitHub Modal */}
      {activeProject && (
        <Modal
          isOpen={true}
          onClose={() => setActiveProject(null)}
          title={`Link Code Repository: ${activeProject.title}`}
          subtitle="Add your GitHub repository to link it to your career portfolio and verification profile"
        >
          <form onSubmit={handleSaveRepo} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                GitHub Repository URL *
              </label>
              <div className="relative">
                <Github className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/your-username/my-project"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveProject(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <GlowButton type="submit" size="md" isLoading={isSubmitting}>
                Save Repository Link
              </GlowButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
