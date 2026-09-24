import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { GlowButton } from '../../components/common/GlowButton';
import { Card } from '../../components/common/Card';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { navigate } = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Failed to authenticate. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Cyber Lights */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 cursor-pointer mb-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 shadow-lg shadow-violet-900/40">
              <div className="w-full h-full bg-[#080B14] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <span className="font-heading font-bold text-2xl cyber-gradient-text">SkillSync AI</span>
          </div>
          <h2 className="text-2xl font-bold font-heading text-white">Student Sign In</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your verified skill telemetry, roadmaps & internship pipeline.
          </p>
        </div>

        <Card glow="purple" className="border-violet-500/30">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/70 border border-rose-700/60 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                University / Student Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setError('Please contact your university placement coordinator or check your email for recovery instructions.')}
                  className="text-[11px] text-violet-400 hover:text-violet-300 cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  required
                />
              </div>
            </div>

            <GlowButton
              type="submit"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to SkillSync
            </GlowButton>
          </form>
        </Card>

        {/* Links to Signup & Admin */}
        <div className="mt-6 flex flex-col items-center gap-2 text-xs text-slate-400">
          <div>
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
            >
              Sign up as Student
            </button>
          </div>
          <div className="pt-2 border-t border-slate-800/80 w-full text-center">
            Are you a University Placement Officer or Recruiter?{' '}
            <button
              onClick={() => navigate('/admin/login')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Admin Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
