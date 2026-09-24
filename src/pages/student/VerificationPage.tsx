import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { dataService } from '../../services/dataService';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  getAssessmentForSkill,
  evaluateAssessment,
} from '../../services/assessmentQuestions';
import { AssessmentQuestion, AssessmentResult, StudentSkill } from '../../types';
import { Card } from '../../components/common/Card';
import { GlowButton } from '../../components/common/GlowButton';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Database,
  Layers,
  Plus,
  RotateCw,
  AlertOctagon,
  Award,
  ListCheck,
  Search,
  BookOpen,
} from 'lucide-react';

export const VerificationPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const { navigate } = useNavigation();

  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [pastResults, setPastResults] = useState<AssessmentResult[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Helper to obtain authenticated user ID from Supabase session
  const getAuthenticatedUserId = useCallback(async (): Promise<string> => {
    if (isSupabaseConfigured) {
      try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        if (supabaseUser?.id) {
          return supabaseUser.id;
        }
      } catch (authErr) {
        console.warn('Supabase auth session check in VerificationPage:', authErr);
      }
    }
    return authUser?.user_id || '';
  }, [authUser]);

  const loadVerificationData = useCallback(async () => {
    setIsLoading(true);
    setErrorState(null);

    try {
      const studentId = await getAuthenticatedUserId();
      if (!studentId) {
        setIsLoading(false);
        return;
      }
      const [loadedSkills, loadedResults] = await Promise.all([
        dataService.getStudentSkills(studentId),
        dataService.getAssessmentResults(studentId),
      ]);

      setSkills(loadedSkills);
      setPastResults(loadedResults);

      if (loadedSkills.length > 0 && !selectedSkill) {
        setSelectedSkill(loadedSkills[0].skill_name);
      }
    } catch (err: any) {
      console.error('Failed to load verification telemetry from Supabase:', err);
      setErrorState(
        err?.message || 'Unable to synchronize your skills and assessment logs from the database.'
      );
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, [getAuthenticatedUserId, selectedSkill]);

  useEffect(() => {
    loadVerificationData();
  }, [loadVerificationData]);

  const handleRetry = async () => {
    setIsRetrying(true);
    await loadVerificationData();
  };

  const handleStartAssessment = (skillToAssess: string) => {
    setSelectedSkill(skillToAssess);
    const qList = getAssessmentForSkill(skillToAssess);
    setQuestions(qList);
    setCurrentIndex(0);
    setAnswers({});
    setResult(null);
    setIsStarted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOption = (optionIndex: number) => {
    const activeQ = questions[currentIndex];
    setAnswers((prev) => ({
      ...prev,
      [activeQ.id]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitAssessment = async () => {
    const studentId = await getAuthenticatedUserId();
    setIsSubmitting(true);
    setErrorState(null);

    try {
      // 1. Calculate Score, Skill Level (Beginner / Intermediate / Advanced), Strengths & Areas to Improve
      const evaluation = evaluateAssessment(selectedSkill, answers, questions);

      // 2. Save Assessment Result to `assessment_results` table in Supabase
      // and update the matching student skill in `student_skills`
      const savedResult = await dataService.saveAssessmentResult({
        user_id: studentId,
        skill_name: selectedSkill,
        score: evaluation.score,
        skill_level: evaluation.level,
        verification_status: evaluation.status,
        strengths: evaluation.strengths,
        areas_to_improve: evaluation.areasToImprove,
        completed_at: new Date().toISOString(),
      });

      setResult(savedResult);
      setIsStarted(false);

      // 3. Trigger celebration confetti if verified
      if (evaluation.status === 'Verified') {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#8B5CF6', '#38BDF8', '#10B981'],
        });
      }

      // 4. Refresh skills & assessment logs
      await loadVerificationData();
    } catch (err: any) {
      console.error('Error submitting assessment to Supabase:', err);
      setErrorState(
        err?.message || 'Failed to record your assessment results in Supabase. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 max-w-4xl mx-auto">
        <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-violet-500/40 shadow-2xl shadow-violet-950/50 text-center relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 border-4 border-violet-500/20 border-t-cyan-400 border-r-violet-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Database className="w-5 h-5 text-violet-300 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-white font-heading">
                Loading Verification Engine
              </h2>
              <p className="text-xs text-slate-400 font-mono-code">
                Synchronizing student_skills and assessment_results...
              </p>
            </div>

            <div className="w-full bg-slate-900/80 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div className="h-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State with Retry
  if (errorState && skills.length === 0 && pastResults.length === 0 && !isStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 max-w-4xl mx-auto">
        <div className="glass-card max-w-lg w-full p-8 rounded-3xl border border-red-500/40 shadow-2xl shadow-red-950/40 text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center justify-center mx-auto mb-4">
            <AlertOctagon className="w-7 h-7 text-red-400" />
          </div>

          <h2 className="text-lg font-bold text-white font-heading mb-2">
            Assessment Service Connection Notice
          </h2>
          <p className="text-xs text-slate-300 mb-6">{errorState}</p>

          <GlowButton
            variant="primary"
            size="md"
            onClick={handleRetry}
            icon={<RotateCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />}
            className="w-full justify-center"
          >
            {isRetrying ? 'Reconnecting...' : 'Retry Connection'}
          </GlowButton>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPct = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  const filteredStudentSkills = skills.filter((s) =>
    s.skill_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-950/70 border border-violet-500/40 text-violet-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Connected to student_skills &amp; assessment_results
            </span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-white">Skill Verification Assessment</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Validate technical competencies through timed, objective diagnostic evaluations.
          </p>
        </div>
        <Badge variant="emerald" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
          Objective Testing Engine
        </Badge>
      </div>

      {/* Global Action Error Alert */}
      {errorState && (
        <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorState}</span>
          </div>
          <button
            onClick={() => setErrorState(null)}
            className="text-xs font-semibold text-red-300 hover:text-red-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* State 1: Active Assessment In Progress */}
      {isStarted && currentQ && (
        <Card glow="purple" className="space-y-6">
          {/* Header & Progress */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider font-mono-code">
                Skill Testing: {selectedSkill}
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">
                Question {currentIndex + 1} of {questions.length}
              </h3>
            </div>
            <div className="w-full sm:w-56">
              <ProgressBar
                value={progressPct}
                label={`Progress (${answeredCount}/${questions.length} answered)`}
                showValue={true}
                color="violet"
                height="sm"
              />
            </div>
          </div>

          {/* Question Topic and Statement */}
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="inline-block px-2.5 py-0.5 text-[10px] font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-700/40 rounded-full mb-3 font-mono-code">
              Topic: {currentQ.topic}
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-100 leading-relaxed font-heading">
              {currentQ.question}
            </h2>
          </div>

          {/* Multiple Choice Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = answers[currentQ.id] === idx;
              const optionLetter = String.fromCharCode(65 + idx);

              return (
                <div
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-violet-950/80 border-violet-500/80 text-white shadow-md shadow-violet-950/50'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-violet-500 text-white'
                        : 'bg-slate-800 border border-slate-700 text-slate-400'
                    }`}
                  >
                    {optionLetter}
                  </span>
                  <span className="text-xs sm:text-sm leading-relaxed">{opt}</span>
                </div>
              );
            })}
          </div>

          {/* Nav Controls: Previous, Next, Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to cancel this assessment? Your progress will not be saved.')) {
                    setIsStarted(false);
                  }
                }}
                className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>

              {currentIndex < questions.length - 1 ? (
                <GlowButton
                  size="md"
                  onClick={handleNext}
                  disabled={answers[currentQ.id] === undefined}
                  icon={<ChevronRight className="w-4 h-4" />}
                >
                  Next Question
                </GlowButton>
              ) : (
                <GlowButton
                  variant="cyan"
                  size="md"
                  onClick={handleSubmitAssessment}
                  isLoading={isSubmitting}
                  disabled={answeredCount < questions.length}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Submit Assessment
                </GlowButton>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* State 2: Assessment Results Screen */}
      {result && !isStarted && (
        <Card glow={result.verification_status === 'Verified' ? 'purple' : 'none'} className="space-y-6">
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 mx-auto mb-3 shadow-xl shadow-violet-950/60">
              <div className="w-full h-full bg-[#080B14] rounded-[14px] flex items-center justify-center">
                {result.verification_status === 'Verified' ? (
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-amber-400" />
                )}
              </div>
            </div>

            <span className="text-[11px] font-bold text-violet-400 uppercase tracking-widest font-mono-code">
              Diagnostic Evaluation Complete
            </span>
            <h2 className="text-2xl font-bold font-heading text-white mt-1">{result.skill_name}</h2>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
              <Badge variant={result.verification_status === 'Verified' ? 'emerald' : 'amber'}>
                Status: {result.verification_status}
              </Badge>
              <Badge variant="cyan">Assessed Level: {result.skill_level}</Badge>
              <Badge variant="purple">Score: {result.score}%</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Demonstrated Strengths
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {result.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas to improve */}
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/40">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" /> Areas to Improve
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {result.areas_to_improve.map((a, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Saved to assessment_results &amp; synchronized with student_skills in Supabase.</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => handleStartAssessment(result.skill_name)}
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retake Test
            </button>

            <div className="flex items-center gap-2">
              <GlowButton size="md" onClick={() => navigate('/skills')}>
                View My Skills
              </GlowButton>
              <GlowButton variant="secondary" size="md" onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </GlowButton>
            </div>
          </div>
        </Card>
      )}

      {/* State 3: Assessment Hub / Select Skill from student_skills */}
      {!isStarted && (
        <div className="space-y-6">
          <Card glow="cyan">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold font-heading text-white">
                  Select a Skill from Your Profile
                </h2>
                <p className="text-xs text-slate-400">
                  Choose any skill from your <span className="text-cyan-300 font-medium">student_skills</span> records to begin a diagnostic evaluation.
                </p>
              </div>

              {skills.length > 3 && (
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search my skills..."
                    className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl pl-8 pr-3 py-1 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              )}
            </div>

            {/* Empty state: Student has no skills registered in student_skills */}
            {skills.length === 0 ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-violet-950/60 border border-violet-500/40 flex items-center justify-center mx-auto text-violet-400">
                  <Layers className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white font-heading">
                    No Skills Found in Your Profile
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    You haven&apos;t added any technical competencies to your profile yet. Add your skills on the My Skills page or pick a suggested starter skill below to begin verification.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <GlowButton
                    size="md"
                    onClick={() => navigate('/skills')}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Go to My Skills
                  </GlowButton>
                  <button
                    onClick={() => handleStartAssessment('React / Next.js')}
                    className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 cursor-pointer"
                  >
                    Test React / Next.js
                  </button>
                  <button
                    onClick={() => handleStartAssessment('Python')}
                    className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 cursor-pointer"
                  >
                    Test Python
                  </button>
                </div>
              </div>
            ) : filteredStudentSkills.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No skills match &quot;{searchQuery}&quot;.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-4">
                {filteredStudentSkills.map((sk) => {
                  return (
                    <div
                      key={sk.id}
                      className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-violet-500/50 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider font-mono-code">
                            {sk.category || 'Technical'}
                          </span>
                          {sk.verified ? (
                            <Badge variant="emerald" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="amber" size="sm">
                              Unverified
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-slate-100">{sk.skill_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-slate-400">Level: {sk.level}</span>
                          {sk.score ? (
                            <span className="text-[11px] font-mono-code text-cyan-300">
                              • {sk.score}%
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartAssessment(sk.skill_name)}
                        className="mt-4 w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-violet-600/30 hover:bg-violet-600 text-violet-200 border border-violet-500/40 hover:border-transparent transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        {sk.verified ? 'Re-verify Assessment' : 'Start Assessment'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Past Assessment History Log */}
          {pastResults.length > 0 && (
            <Card>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ListCheck className="w-4 h-4 text-violet-400" />
                  <h2 className="text-sm font-bold font-heading text-white">Assessment Verification Log</h2>
                </div>
                <span className="text-xs text-slate-400">
                  {pastResults.length} {pastResults.length === 1 ? 'record' : 'records'} in Supabase
                </span>
              </div>

              <div className="space-y-3">
                {pastResults.map((ar) => (
                  <div
                    key={ar.id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-white">{ar.skill_name}</h3>
                        <Badge
                          variant={ar.verification_status === 'Verified' ? 'emerald' : 'amber'}
                          size="sm"
                        >
                          {ar.verification_status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Assessed as <span className="text-slate-200 font-semibold">{ar.skill_level}</span> • Completed{' '}
                        {new Date(ar.completed_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold font-mono-code text-cyan-300">
                        {ar.score}%
                      </span>
                      <button
                        onClick={() => handleStartAssessment(ar.skill_name)}
                        className="text-xs text-violet-400 hover:text-violet-300 font-medium cursor-pointer"
                      >
                        Retake →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
