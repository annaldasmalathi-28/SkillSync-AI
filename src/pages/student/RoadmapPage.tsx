import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { dataService } from '../../services/dataService';
import { LearningRoadmapItem, TargetCareerTitle } from '../../types';
import { Card } from '../../components/common/Card';
import { GlowButton } from '../../components/common/GlowButton';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import {
  Map,
  CheckCircle2,
  Clock,
  Code2,
  BookOpen,
  Sparkles,
  Award,
  ChevronRight,
  Flame,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RoadmapPage: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useNavigation();

  const [roadmap, setRoadmap] = useState<LearningRoadmapItem[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const targetCareer: TargetCareerTitle = user?.target_career || 'Software Developer';

  useEffect(() => {
    loadRoadmap();
  }, [user, targetCareer]);

  const loadRoadmap = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await dataService.getRoadmap(user.user_id, targetCareer);
      setRoadmap(data);
    } catch (e) {
      console.error('Error loading roadmap:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async (item: LearningRoadmapItem) => {
    const nextCompleted = !item.completed;
    const nextProgress = nextCompleted ? 100 : 0;

    // Optimistic UI update
    setRoadmap((prev) =>
      prev.map((r) =>
        r.id === item.id ? { ...r, completed: nextCompleted, progress_pct: nextProgress } : r
      )
    );

    if (nextCompleted) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#8B5CF6', '#38BDF8'],
      });
    }

    try {
      await dataService.updateRoadmapItem(
        item.id,
        {
          completed: nextCompleted,
          progress_pct: nextProgress,
        },
        user?.user_id
      );
    } catch (e) {
      console.error('Failed to update roadmap item:', e);
      await loadRoadmap();
    }
  };

  const completedCount = roadmap.filter((r) => r.completed).length;
  const overallProgress =
    roadmap.length > 0 ? Math.round((completedCount / roadmap.length) * 100) : 0;

  // Group by phases
  const phases = [1, 2, 3, 4, 5, 6];
  const activePhaseItems = roadmap.filter((r) => r.phase === selectedPhase);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest font-mono-code">
              Dynamic Curriculum
            </span>
            <Badge variant="cyan" size="sm">{targetCareer}</Badge>
          </div>
          <h1 className="text-2xl font-bold font-heading text-white">6-Phase Career Roadmap</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured step-by-step technical progression designed for college recruiting cycles.
          </p>
        </div>

        {/* Overall Completion Progress */}
        <div className="w-full md:w-64 glass-panel p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Roadmap Velocity</span>
            <span className="font-bold text-white font-mono-code">{overallProgress}%</span>
          </div>
          <ProgressBar value={overallProgress} showValue={false} color="violet" height="sm" />
        </div>
      </div>

      {/* Phase Selectors Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {phases.map((pNum) => {
          const phaseItems = roadmap.filter((r) => r.phase === pNum);
          const isPhaseDone = phaseItems.length > 0 && phaseItems.every((i) => i.completed);
          const isSelected = selectedPhase === pNum;

          return (
            <button
              key={pNum}
              onClick={() => setSelectedPhase(pNum)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-b from-violet-900/60 to-slate-900 border-violet-500/80 shadow-md shadow-violet-950/60'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-violet-400 font-mono-code">
                  PHASE {pNum}
                </span>
                {isPhaseDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-200 truncate">
                {phaseItems[0]?.phase_name.replace(`Phase ${pNum}: `, '') || `Stage ${pNum}`}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Phase Details */}
      <Card glow="purple" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest font-mono-code">
              Active Stage
            </span>
            <h2 className="text-lg font-bold text-white font-heading mt-0.5">
              {activePhaseItems[0]?.phase_name || `Phase ${selectedPhase}`}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="cyan">
              {activePhaseItems.filter((i) => i.completed).length} / {activePhaseItems.length} Completed
            </Badge>
          </div>
        </div>

        {/* Module Items in this Phase */}
        <div className="space-y-4">
          {activePhaseItems.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all ${
                item.completed
                  ? 'bg-emerald-950/20 border-emerald-800/40'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Left info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleComplete(item)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        item.completed
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'bg-slate-800 border-slate-600 hover:border-violet-400 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    <h3
                      className={`text-base font-bold font-heading ${
                        item.completed ? 'text-emerald-300 line-through' : 'text-white'
                      }`}
                    >
                      {item.topic}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-300 pl-9 leading-relaxed">
                    {item.learning_objectives}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pl-9 pt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {item.estimated_hours}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-violet-400" />
                      Capstone: <strong className="text-slate-200">{item.recommended_project}</strong>
                    </span>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 self-end lg:self-center">
                  <button
                    onClick={() => navigate('/projects')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                    View Project
                  </button>

                  <button
                    onClick={() => handleToggleComplete(item)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      item.completed
                        ? 'bg-emerald-950 border border-emerald-700/60 text-emerald-300'
                        : 'bg-violet-600 hover:bg-violet-500 text-white'
                    }`}
                  >
                    {item.completed ? 'Completed ✓' : 'Mark Done'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
