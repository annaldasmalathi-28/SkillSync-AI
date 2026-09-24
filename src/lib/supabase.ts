import { createClient } from '@supabase/supabase-js';

// Read client-side environment variables as requested
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
);

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const SUPABASE_TABLES = {
  PROFILES: 'profiles',
  STUDENT_SKILLS: 'student_skills',
  PROJECTS: 'projects',
  CERTIFICATIONS: 'certifications',
  INTERNSHIPS: 'internships',
  INTERNSHIP_APPLICATIONS: 'internship_applications',
  SAVED_INTERNSHIPS: 'saved_internships',
  SKILL_GAPS: 'skill_gaps',
  LEARNING_ROADMAP: 'learning_roadmap',
  PROGRESS: 'progress',
  ASSESSMENT_RESULTS: 'assessment_results',
} as const;
