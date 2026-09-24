import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole, TargetCareerTitle } from '../types';
import { supabase, isSupabaseConfigured, SUPABASE_TABLES } from '../lib/supabase';
import { dataService } from '../services/dataService';

interface StudentSignupData {
  fullName: string;
  email: string;
  password: string;
  college: string;
  degree: string;
  branch: string;
  graduationYear: string;
  targetCareer?: TargetCareerTitle;
}

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signupStudent: (data: StudentSignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateCurrentProfile: (updates: Partial<Profile>) => Promise<void>;
  switchRoleDemo?: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session on mount
  useEffect(() => {
    async function initAuth() {
      setIsLoading(true);
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            let profile = await dataService.getProfile(session.user.id);
            if (!profile) {
              // Create baseline profile in Supabase if newly created auth user
              profile = {
                id: `prof-${session.user.id}`,
                user_id: session.user.id,
                full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Student',
                email: session.user.email || '',
                role: (session.user.user_metadata?.role as any) || 'student',
                college: 'University',
                degree: 'Computer Science',
                branch: 'Engineering',
                graduation_year: '2026',
                target_career: 'Software Developer',
                created_at: new Date().toISOString(),
              };
              await dataService.updateProfile(session.user.id, profile);
            }
            if (profile) {
              setUser(profile);
              localStorage.setItem('skillsync_current_user_id', profile.user_id);
              setIsLoading(false);
              return;
            }
          }
        }

        // Check local storage session for registered real user
        const savedUserId = localStorage.getItem('skillsync_current_user_id');
        if (savedUserId) {
          if (savedUserId === 'demo-student-id' || savedUserId === 'demo-admin-id') {
            localStorage.removeItem('skillsync_current_user_id');
          } else {
            const profile = await dataService.getProfile(savedUserId);
            if (profile) {
              setUser(profile);
              setIsLoading(false);
              return;
            }
          }
        }

        // No logged-in session: user remains null so Login page is presented
        setUser(null);
      } catch (e) {
        console.error('Auth initialization error:', e);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase Auth state changes if configured
    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const profile = await dataService.getProfile(session.user.id);
          if (profile) {
            setUser(profile);
            localStorage.setItem('skillsync_current_user_id', profile.user_id);
          }
        } else {
          localStorage.removeItem('skillsync_current_user_id');
          setUser(null);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (email.toLowerCase().includes('admin')) {
            return { success: false, error: 'Please use the dedicated Admin Portal to log in.' };
          }
          return { success: false, error: error.message };
        } else if (data.user) {
          let profile = await dataService.getProfile(data.user.id);
          if (!profile) {
            profile = {
              id: `prof-${data.user.id}`,
              user_id: data.user.id,
              full_name: data.user.user_metadata?.full_name || email.split('@')[0],
              email: data.user.email || email,
              role: (data.user.user_metadata?.role as any) || 'student',
              college: 'University',
              degree: 'Computer Science',
              branch: 'Engineering',
              graduation_year: '2026',
              target_career: 'Software Developer',
              created_at: new Date().toISOString(),
            };
            await dataService.updateProfile(data.user.id, profile);
          }
          if (profile.role === 'admin') {
            return { success: false, error: 'Admin accounts must log in via /admin/login' };
          }
          setUser(profile);
          localStorage.setItem('skillsync_current_user_id', profile.user_id);
          return { success: true };
        }
      }

      if (email.toLowerCase().includes('admin')) {
        return { success: false, error: 'Admins must login through the Admin Portal at /admin/login' };
      }

      // Check registered students in database/store
      const allStudents = await dataService.getAllStudents();
      const matched = allStudents.find((s) => s.email.toLowerCase() === email.toLowerCase());

      if (matched) {
        setUser(matched);
        localStorage.setItem('skillsync_current_user_id', matched.user_id);
        return { success: true };
      }

      return { success: false, error: 'No account found with this email. Please check your credentials or create a student account.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data.user) {
          let profile = await dataService.getProfile(data.user.id);
          if (profile && profile.role === 'admin') {
            setUser(profile);
            localStorage.setItem('skillsync_current_user_id', profile.user_id);
            return { success: true };
          } else if (profile && profile.role !== 'admin') {
            return { success: false, error: 'Access denied: You do not have administrator privileges.' };
          }
        } else if (error) {
          return { success: false, error: error.message };
        }
      }

      // Offline / Local administrative verification
      if (email.toLowerCase() === 'admin@skillsync.ai' || (email.toLowerCase().includes('admin') && password.length >= 6)) {
        const adminId = `admin-${encodeURIComponent(email.toLowerCase().replace(/[^a-z0-9]/g, ''))}`;
        let adminProfile = await dataService.getProfile(adminId);
        if (!adminProfile) {
          adminProfile = {
            id: `prof-${adminId}`,
            user_id: adminId,
            full_name: email.split('@')[0].toUpperCase() === 'ADMIN' ? 'Placement Director' : email.split('@')[0],
            email: email,
            role: 'admin',
            college: 'University Placement Division',
            degree: 'Engineering Administration',
            branch: 'Institutional Operations',
            graduation_year: '2020',
            target_career: 'Software Developer',
            created_at: new Date().toISOString(),
          };
          await dataService.updateProfile(adminId, adminProfile);
        }
        setUser(adminProfile);
        localStorage.setItem('skillsync_current_user_id', adminProfile.user_id);
        return { success: true };
      }

      return { success: false, error: 'Invalid administrator credentials. Access restricted to university staff.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Admin authentication failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signupStudent = async (data: StudentSignupData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      let createdUserId = `student-${Date.now()}`;

      if (isSupabaseConfigured) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              role: 'student',
            },
          },
        });

        if (authError) {
          console.warn('Supabase Auth signup notice:', authError.message);
        } else if (authData.user) {
          createdUserId = authData.user.id;
        }
      }

      // Create student profile record
      const newProfile: Profile = {
        id: `prof-${Date.now()}`,
        user_id: createdUserId,
        full_name: data.fullName,
        email: data.email,
        role: 'student',
        college: data.college,
        degree: data.degree,
        branch: data.branch,
        graduation_year: data.graduationYear,
        target_career: data.targetCareer || 'Software Developer',
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.fullName)}`,
        created_at: new Date().toISOString(),
      };

      const saved = await dataService.updateProfile(createdUserId, newProfile);
      setUser(saved);
      localStorage.setItem('skillsync_current_user_id', createdUserId);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Signup failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase sign out error:', e);
      }
    }
    localStorage.removeItem('skillsync_current_user_id');
    setUser(null);
  };

  const updateCurrentProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const updated = await dataService.updateProfile(user.user_id, updates);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        adminLogin,
        signupStudent,
        logout,
        updateCurrentProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
