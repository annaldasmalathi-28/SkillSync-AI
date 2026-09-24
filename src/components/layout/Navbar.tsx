import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import {
  Sparkles,
  Search,
  Bell,
  LogOut,
  User,
  Shield,
  GraduationCap,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  Target,
} from 'lucide-react';
import { GlowButton } from '../common/GlowButton';
import { Badge } from '../common/Badge';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const { user, role, logout } = useAuth();
  const { currentPath, navigate } = useNavigation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => navigate(user ? (role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-0.5 shadow-md shadow-violet-900/40 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#080B14] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-lg tracking-tight cyber-gradient-text">
                  SkillSync
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-violet-600/30 text-violet-300 border border-violet-500/40 rounded tracking-widest">
                  AI
                </span>
              </div>
              <p className="text-[9px] text-slate-400 font-mono-code -mt-0.5 hidden sm:block">
                Verify. Identify. Build.
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search or Active Career Target Badge */}
        {user && role === 'student' && (
          <div className="hidden md:flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-full px-4 py-1.5">
            <Target className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs text-slate-400">Target Career:</span>
            <span className="text-xs font-semibold text-violet-200">{user.target_career}</span>
            <button
              onClick={() => navigate('/career')}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-medium ml-1 cursor-pointer"
            >
              Change
            </button>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Active Role Indicator */}
          {user && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-medium">
              {role === 'admin' ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-indigo-300">Admin Portal</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-violet-300">Student Portal</span>
                </>
              )}
            </div>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/80 border border-slate-800 transition-colors cursor-pointer"
              >
                <img
                  src={
                    user.avatar_url ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.full_name)}`
                  }
                  alt={user.full_name}
                  className="w-8 h-8 rounded-lg object-cover border border-violet-500/40 bg-slate-800"
                />
                <div className="text-left hidden xl:block">
                  <div className="text-xs font-semibold text-slate-200 leading-tight">
                    {user.full_name}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">{user.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 glass-card rounded-2xl border border-violet-500/30 p-2 shadow-xl shadow-violet-950/60 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2.5 border-b border-slate-800 mb-1">
                      <p className="text-xs font-bold text-slate-100">{user.full_name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <div className="mt-1.5">
                        <Badge variant={user.role === 'admin' ? 'purple' : 'cyan'} size="sm">
                          {user.role === 'admin' ? 'Administrator' : 'Verified Student'}
                        </Badge>
                      </div>
                    </div>

                    {user.role === 'student' ? (
                      <>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate('/profile');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg text-left cursor-pointer"
                        >
                          <User className="w-4 h-4 text-violet-400" />
                          View Profile
                        </button>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate('/resume');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg text-left cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-cyan-400" />
                          Resume & ATS Review
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/admin/dashboard');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg text-left cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-indigo-400" />
                        Admin Overview
                      </button>
                    )}

                    <div className="border-t border-slate-800 my-1 pt-1">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-300 hover:bg-rose-950/60 rounded-lg text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/login')}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Log In
              </button>
              <GlowButton size="sm" onClick={() => navigate('/signup')}>
                Get Started
              </GlowButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
