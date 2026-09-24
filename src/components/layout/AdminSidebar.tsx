import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import {
  ShieldAlert,
  Users,
  Briefcase,
  FileCheck,
  BarChart3,
  FileSpreadsheet,
  ArrowLeft,
} from 'lucide-react';

interface AdminSidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { currentPath, navigate } = useNavigation();

  const adminNavItems = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: ShieldAlert },
    { label: 'Student Directory', path: '/admin/students', icon: Users },
    { label: 'Manage Internships', path: '/admin/internships', icon: Briefcase },
    { label: 'Applications Pool', path: '/admin/applications', icon: FileCheck },
    { label: 'Placement Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Audit & Reports', path: '/admin/reports', icon: FileSpreadsheet },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-[#060913]/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-[65px] left-0 h-screen lg:h-[calc(100vh-65px)] w-64 glass-panel border-r border-indigo-900/40 p-4 flex flex-col justify-between z-30 transition-transform duration-300 overflow-y-auto ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          <div className="px-2">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-indigo-900/40">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 font-mono-code">
                Administration Console
              </p>
            </div>

            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');

                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600/30 to-violet-600/20 text-white border border-indigo-500/40 shadow-xs shadow-indigo-950/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-cyan-400' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <p className="text-xs text-slate-300 font-medium">Testing as Student?</p>
          <button
            onClick={() => handleNav('/dashboard')}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-violet-300 hover:text-white bg-violet-950/60 hover:bg-violet-900 border border-violet-700/50 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Switch to Student View
          </button>
        </div>
      </aside>
    </>
  );
};
