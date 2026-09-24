import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AdminSidebar } from './components/layout/AdminSidebar';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { SignupPage } from './pages/public/SignupPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';

// Student Pages
import { DashboardPage } from './pages/student/DashboardPage';
import { SkillsPage } from './pages/student/SkillsPage';
import { VerificationPage } from './pages/student/VerificationPage';
import { SkillGapPage } from './pages/student/SkillGapPage';
import { CareerPage } from './pages/student/CareerPage';
import { RoadmapPage } from './pages/student/RoadmapPage';
import { ProjectsPage } from './pages/student/ProjectsPage';
import { InternshipsPage } from './pages/student/InternshipsPage';
import { InternshipDetailsPage } from './pages/student/InternshipDetailsPage';
import { SavedInternshipsPage } from './pages/student/SavedInternshipsPage';
import { ApplicationsPage } from './pages/student/ApplicationsPage';
import { ResumePage } from './pages/student/ResumePage';
import { AssistantPage } from './pages/student/AssistantPage';
import { ProfilePage } from './pages/student/ProfilePage';
import { ProgressPage } from './pages/student/ProgressPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminInternshipsPage } from './pages/admin/AdminInternshipsPage';
import { AdminApplicationsPage } from './pages/admin/AdminApplicationsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';

const AppContent: React.FC = () => {
  const { user, role, isLoading } = useAuth();
  const { currentRoute, currentPath, navigate } = useNavigation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Loading state while verifying credentials or Supabase session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#060913] flex flex-col items-center justify-center p-4 text-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-950/60 animate-pulse">
          <span className="text-xl font-black text-white font-mono-code tracking-tighter">S</span>
        </div>
        <div className="text-sm font-semibold font-heading text-white">SkillSync AI</div>
        <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          Synchronizing secure credentials...
        </div>
      </div>
    );
  }

  // 1. Unauthenticated Users: Force Login or explicit Auth pages
  if (!user) {
    if (currentRoute === '/signup') {
      return <SignupPage />;
    }
    if (currentRoute === '/admin/login' || currentPath.startsWith('/admin')) {
      return <AdminLoginPage />;
    }
    // Landing page is accessible if explicitly navigated to
    if (currentPath === '/landing') {
      return (
        <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col font-sans">
          <Navbar onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
          <main className="flex-1">
            <LandingPage />
          </main>
        </div>
      );
    }
    // Default / first page shown when the app opens is LoginPage
    return <LoginPage />;
  }

  // 2. Authenticated Users: If on auth entry pages (/login, /signup, /admin/login, /), route to respective dashboard
  const isAdminRoute = currentPath.startsWith('/admin');

  // Admin user access
  if (user.role === 'admin') {
    return (
      <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col font-sans">
        <Navbar
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <AdminSidebar
            isMobileOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
            {(currentRoute === '/admin/dashboard' || currentRoute === '/' || currentRoute === '/login' || currentRoute === '/admin/login' || !isAdminRoute) && <AdminDashboardPage />}
            {currentRoute === '/admin/students' && <AdminStudentsPage />}
            {currentRoute === '/admin/students/:id' && <AdminStudentsPage />}
            {currentRoute === '/admin/internships' && <AdminInternshipsPage />}
            {currentRoute === '/admin/applications' && <AdminApplicationsPage />}
            {currentRoute === '/admin/analytics' && <AdminAnalyticsPage />}
            {currentRoute === '/admin/reports' && <AdminReportsPage />}
          </main>
        </div>
      </div>
    );
  }

  // Student user trying to access admin portal directly
  if (isAdminRoute && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-900/90 border border-red-500/40 rounded-3xl p-8 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
            !
          </div>
          <h2 className="text-xl font-bold font-heading text-white mb-2">Administrator Access Required</h2>
          <p className="text-xs text-slate-400 mb-6">
            Your authenticated account ({user.email}) has a student role. The University Admin Portal requires verified administrative credentials.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Return to Student Dashboard
          </button>
        </div>
      </div>
    );
  }

  // 3. Authenticated Student Portal Shell (for all student routes)
  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col font-sans">
      <Navbar
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {(currentRoute === '/dashboard' || currentRoute === '/' || currentRoute === '/login' || currentRoute === '/signup') && <DashboardPage />}
          {currentRoute === '/skills' && <SkillsPage />}
          {currentRoute === '/verification' && <VerificationPage />}
          {currentRoute === '/skill-gap' && <SkillGapPage />}
          {currentRoute === '/career' && <CareerPage />}
          {currentRoute === '/roadmap' && <RoadmapPage />}
          {currentRoute === '/projects' && <ProjectsPage />}
          {currentRoute === '/internships' && <InternshipsPage />}
          {currentRoute === '/internships/:id' && <InternshipDetailsPage />}
          {currentRoute === '/saved' && <SavedInternshipsPage />}
          {currentRoute === '/applications' && <ApplicationsPage />}
          {currentRoute === '/resume' && <ResumePage />}
          {currentRoute === '/assistant' && <AssistantPage />}
          {currentRoute === '/progress' && <ProgressPage />}
          {currentRoute === '/profile' && <ProfilePage />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </AuthProvider>
  );
}
