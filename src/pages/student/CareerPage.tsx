import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { TARGET_CAREERS } from '../../services/careerMatrix';
import { TargetCareerTitle } from '../../types';
import { Card } from '../../components/common/Card';
import { GlowButton } from '../../components/common/GlowButton';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Compass,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Layers,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';

export const CareerPage: React.FC = () => {
  const { user, updateCurrentProfile } = useAuth();
  const { navigate } = useNavigation();

  const [activeCareer, setActiveCareer] = useState<TargetCareerTitle>(
    user?.target_career || 'Software Developer'
  );
  const [selectedModalCareer, setSelectedModalCareer] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSelectCareer = async (careerTitle: TargetCareerTitle) => {
    setIsUpdating(true);
    try {
      await updateCurrentProfile({ target_career: careerTitle });
      setActiveCareer(careerTitle);
      setSuccessMessage(`Target career updated to "${careerTitle}"!`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (e) {
      console.error('Error updating target career:', e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Target Career Matrix</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Select your primary engineering discipline to align skill assessments, roadmaps, and internship pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="cyan" icon={<Compass className="w-3.5 h-3.5" />}>
            Active Target: {activeCareer}
          </Badge>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-600/50 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Target Careers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {TARGET_CAREERS.map((c) => {
          const isSelected = c.title === activeCareer;

          return (
            <Card
              key={c.title}
              glow={isSelected ? 'purple' : 'none'}
              className={`flex flex-col justify-between transition-all ${
                isSelected
                  ? 'border-violet-500/80 bg-gradient-to-b from-violet-950/40 to-slate-900/90'
                  : 'border-slate-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white font-heading">{c.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="cyan" size="sm">
                        {c.marketDemand} Demand
                      </Badge>
                      <span className="text-[11px] text-emerald-400 font-mono-code font-semibold">
                        {c.growthRate}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="p-1 rounded-lg bg-violet-600/30 text-violet-300 border border-violet-500/50">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{c.description}</p>

                {/* Core Required Skills */}
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono-code block mb-1.5">
                    Core Competencies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(c.coreSkills || c.requiredSkills.map((r) => r.skill)).map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 text-[10px] rounded-lg bg-slate-800/90 text-slate-300 border border-slate-700/80 font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Salary Info */}
                <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>Compensation:</span>
                  <span className="font-semibold text-slate-200 font-mono-code">
                    {c.averageSalary}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedModalCareer(c)}
                  className="flex-1 py-2 text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
                >
                  View Details
                </button>

                {isSelected ? (
                  <button
                    disabled
                    className="flex-1 py-2 text-xs font-semibold bg-violet-600/40 text-violet-200 border border-violet-500/50 rounded-xl text-center"
                  >
                    Active Target
                  </button>
                ) : (
                  <GlowButton
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSelectCareer(c.title as TargetCareerTitle)}
                    disabled={isUpdating}
                  >
                    Select Role
                  </GlowButton>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Career Details Modal */}
      {selectedModalCareer && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedModalCareer(null)}
          title={selectedModalCareer.title}
          subtitle={`Market Intelligence & Hiring Requirements (${selectedModalCareer.marketDemand} Demand)`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedModalCareer.description}
            </p>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Average Tech Salary</span>
                <span className="font-bold text-white font-mono-code text-sm">
                  {selectedModalCareer.averageSalary}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">5-Year Industry Growth</span>
                <span className="font-bold text-emerald-400 font-mono-code text-sm">
                  {selectedModalCareer.growthRate}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 font-mono-code">
                Mandatory Core Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedModalCareer.coreSkills.map((sk: string) => (
                  <span
                    key={sk}
                    className="px-2.5 py-1 text-xs rounded-xl bg-violet-950/80 text-violet-300 border border-violet-700/50"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 font-mono-code">
                Advanced / Differentiation Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedModalCareer.advancedSkills.map((sk: string) => (
                  <span
                    key={sk}
                    className="px-2.5 py-1 text-xs rounded-xl bg-cyan-950/80 text-cyan-300 border border-cyan-700/50"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedModalCareer(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Close
              </button>
              <GlowButton
                size="md"
                onClick={() => {
                  handleSelectCareer(selectedModalCareer.title as TargetCareerTitle);
                  setSelectedModalCareer(null);
                }}
              >
                Set as My Target Career
              </GlowButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
