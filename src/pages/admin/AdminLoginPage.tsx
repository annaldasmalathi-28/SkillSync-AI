import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { Shield, ShieldAlert, Mail, Lock, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { GlowButton } from '../../components/common/GlowButton';
import { Card } from '../../components/common/Card';

export const AdminLoginPage: React.FC = () => {
  const { adminLogin, isLoading } = useAuth();
  const { navigate } = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await adminLogin(email, password);
    if (res.success) {
      navigate('/admin/dashboard');
    } else {
      setError(res.error || 'Administrator access denied. Check your authorized credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050711] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Red/Indigo Cyber Glows */}
      <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-indigo-700/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[450px] h-[450px] bg-violet-700/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-400 mb-3 shadow-lg shadow-indigo-950/80">
            <ShieldAlert className="w-7 h-7 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-white">SkillSync Admin Portal</h2>
          <p className="text-xs text-slate-400 mt-1">
            Restricted to University Placement Deans & Enterprise Coordinators.
          </p>
        </div>

        <Card className="border-indigo-500/40 shadow-2xl shadow-indigo-950/70">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-700/60 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Administrator Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@skillsync.ai"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Master Passcode
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <GlowButton
              type="submit"
              size="lg"
              variant="cyan"
              className="w-full mt-2"
              isLoading={isLoading}
              icon={<Shield className="w-4 h-4" />}
            >
              Verify Authority & Enter Console
            </GlowButton>
          </form>
        </Card>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Student Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
