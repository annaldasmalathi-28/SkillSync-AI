import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { analyzeResumeText } from '../../services/resumeService';
import { ResumeAnalysis } from '../../types';
import { Card } from '../../components/common/Card';
import { GlowButton } from '../../components/common/GlowButton';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Search,
  FileCheck,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ResumePage: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useNavigation();

  const [resumeText, setResumeText] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>(user?.target_career || 'Software Developer');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      setTargetRole(user.target_career || 'Software Developer');
      const savedResume = localStorage.getItem(`skillsync_resume_${user.user_id}`);
      if (savedResume) {
        setResumeText(savedResume);
        setAnalysis(analyzeResumeText(savedResume, user.target_career || 'Software Developer'));
      } else if (user.full_name) {
        const initialTemplate = `${user.full_name}
${user.email || ''} | ${user.college || ''}

EDUCATION
${user.degree || 'Degree Program'} in ${user.branch || 'Specialization'} | Class of ${user.graduation_year || '2026'}

TARGET CAREER
${user.target_career || 'Software Developer'}

TECHNICAL SKILLS & COMPETENCIES
(Upload your resume file or paste your resume text here to analyze ATS pass probability, detected skills, and career alignment...)`;
        setResumeText(initialTemplate);
        setAnalysis(analyzeResumeText(initialTemplate, user.target_career || 'Software Developer'));
      }
    }
  }, [user]);

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const res = analyzeResumeText(resumeText, targetRole);
      setAnalysis(res);
      setIsAnalyzing(false);

      if (user) {
        localStorage.setItem(`skillsync_resume_${user.user_id}`, resumeText);
      }

      if (res.atsScore >= 80) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#38BDF8', '#8B5CF6'],
        });
      }
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setResumeText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resumeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Resume & ATS Optimizer</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit your resume against technical applicant tracking systems and target role keyword algorithms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors">
            <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
            Upload File (.txt / .md)
            <input type="file" accept=".txt,.md,.pdf" onChange={handleFileUpload} className="hidden" />
          </label>
          <GlowButton
            size="md"
            onClick={handleRunAnalysis}
            isLoading={isAnalyzing}
            icon={<Sparkles className="w-4 h-4 text-cyan-400" />}
          >
            Audit ATS Score
          </GlowButton>
        </div>
      </div>

      {/* Main 2-Column: Editor & ATS Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Resume Markdown / Text Editor */}
        <Card glow="purple" className="flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-bold text-white font-heading">Resume Raw Text & Content</h2>
            </div>
            <button
              onClick={handleCopy}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>
          </div>

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={18}
            className="w-full bg-[#070A14] border border-slate-800 rounded-2xl p-4 text-xs font-mono-code text-slate-200 leading-relaxed focus:outline-none focus:border-violet-500 resize-y"
            placeholder="Paste your plain text resume or Markdown here..."
          />

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Word Count: {resumeText.trim().split(/\s+/).length} words</span>
            <span>Auditing Target: <strong className="text-violet-300">{targetRole}</strong></span>
          </div>
        </Card>

        {/* Right Column: ATS Score & Feedback */}
        {analysis && (
          <div className="space-y-6">
            {/* ATS Score Meter Card */}
            <Card glow={analysis.atsScore >= 80 ? 'purple' : 'none'}>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-sm font-bold text-white font-heading">ATS Pass Probability</h2>
                  <p className="text-xs text-slate-400">Benchmarked for {targetRole}</p>
                </div>
                <Badge variant={analysis.atsScore >= 80 ? 'emerald' : analysis.atsScore >= 60 ? 'cyan' : 'amber'}>
                  {analysis.atsScore >= 80 ? 'ATS Optimized' : 'Needs Optimization'}
                </Badge>
              </div>

              <div className="flex items-center gap-6 mb-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 shrink-0 shadow-lg shadow-violet-950/50">
                  <div className="w-full h-full bg-[#080B14] rounded-[14px] flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold font-mono-code text-white">
                      {analysis.atsScore}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono-code">/ 100</span>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <ProgressBar
                    value={analysis.atsScore}
                    showValue={false}
                    color={analysis.atsScore >= 80 ? 'violet' : 'cyan'}
                    height="md"
                  />
                  <p className="text-xs text-slate-300">
                    {analysis.atsScore >= 80
                      ? 'High recruiter pass rate! Your resume contains essential keywords and high-impact metrics.'
                      : 'Missing key technical keywords. Inject missing tools listed below to increase interview callbacks.'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Keyword Density Grid */}
            <Card>
              <div className="pb-3 mb-4 border-b border-slate-800">
                <h2 className="text-sm font-bold text-white font-heading">Industry Keyword Telemetry</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block font-mono-code mb-1.5">
                    Found Keywords ({analysis.foundKeywords.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.foundKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-2 py-0.5 text-[10px] rounded-lg bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 flex items-center gap-1 font-medium"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5" /> {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {analysis.missingKeywords.length > 0 && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block font-mono-code mb-1.5">
                      Suggested Keywords to Add ({analysis.missingKeywords.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.missingKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="px-2 py-0.5 text-[10px] rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-medium"
                        >
                          + {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Recommendations & Formatting */}
            <Card>
              <div className="pb-3 mb-3 border-b border-slate-800">
                <h2 className="text-sm font-bold text-white font-heading">Actionable Polish Suggestions</h2>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {analysis.suggestions.map((sug, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-violet-400 font-bold">•</span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
