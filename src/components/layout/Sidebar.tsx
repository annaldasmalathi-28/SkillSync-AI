import React from 'react';
import { useNavigation, AppRoute } from '../../context/NavigationContext';
import {
  LayoutDashboard,
  User,
  CheckCircle2,
  Award,
  AlertTriangle,
  Compass,
  Map,
  Code2,
  Briefcase,
  Bookmark,
  Send,
  FileText,
  Bot,
  TrendingUp,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onCloseMobile }) => {
  const { currentRoute, currentPath, navigate } = useNavigation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Skills', path: '/skills', icon: CheckCircle2 },
    { label: 'Skill Verification', path: '/verification', icon: Award, highlight: true },
    { label: 'Skill Gap Analysis', path: '/skill-gap', icon: AlertTriangle },
    { label: 'Target Career', path: '/career', icon: Compass },
    { label: 'Learning Roadmap', path: '/roadmap', icon: Map },
    { label: 'Projects', path: '/projects', icon: Code2 },
    { label: 'Discover Internships', path: '/internships', icon: Briefcase },
    { label: 'Saved Internships', path: '/saved', icon: Bookmark },
    { label: 'Applications', path: '/applications', icon: Send },
    { label: 'Resume & ATS', path: '/resume', icon: FileText },
    { label: 'AI Assistant', path: '/assistant', icon: Bot, badge: 'AI' },
    { label: 'Progress & Streaks', path: '/progress', icon: TrendingUp },
    { label: 'Student Profile', path: '/profile', icon: User },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-[#060913]/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-[65px] left-0 h-screen lg:h-[calc(100vh-65px)] w-64 glass-panel border-r border-slate-800/80 p-4 flex flex-col justify-between z-30 transition-transform duration-300 overflow-y-auto ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          <div className="px-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono-code mb-2">
              Career Intelligence
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path || currentRoute === item.path;

                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/20 text-white border border-violet-500/40 shadow-xs shadow-violet-950/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                        {item.badge}
                      </span>
                    )}
                    {item.highlight && !isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-xs shadow-violet-400" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Pro Career Assistance Card in Sidebar */}
        <div className="mt-4 p-3 rounded-2xl bg-gradient-to-br from-violet-950/70 to-indigo-950/80 border border-violet-500/30 text-center">
          <div className="w-8 h-8 rounded-lg bg-violet-600/30 border border-violet-400/40 flex items-center justify-center mx-auto mb-2">
            <Bot className="w-4 h-4 text-violet-300" />
          </div>
          <p className="text-xs font-bold text-slate-100">Need Guidance?</p>
          <p className="text-[10px] text-slate-400 mt-0.5 mb-2">
            Ask SkillSync AI to evaluate your profile & gaps.
          </p>
          <button
            onClick={() => handleNav('/assistant')}
            className="w-full py-1.5 text-[11px] font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors cursor-pointer"
          >
            Launch Assistant
          </button>
        </div>
      </aside>
    </>
  );
};
