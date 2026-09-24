import { supabase, isSupabaseConfigured, SUPABASE_TABLES } from '../lib/supabase';
import {
  Profile,
  StudentSkill,
  Project,
  Certification,
  Internship,
  InternshipApplication,
  SavedInternship,
  SkillGap,
  LearningRoadmapItem,
  ProgressStats,
  AssessmentResult,
  TargetCareerTitle,
  ApplicationStatus,
  ChatMessage,
} from '../types';
import { calculateReadinessScore, calculateSkillGaps, TARGET_CAREERS } from './careerMatrix';

// Local state storage key for browser persistence fallback
const LOCAL_STORAGE_KEY = 'skillsync_ai_data_store_v1';

interface LocalStore {
  profiles: Record<string, Profile>;
  student_skills: StudentSkill[];
  projects: Project[];
  certifications: Certification[];
  internships: Internship[];
  internship_applications: InternshipApplication[];
  saved_internships: SavedInternship[];
  skill_gaps: SkillGap[];
  learning_roadmap: LearningRoadmapItem[];
  progress: Record<string, ProgressStats>;
  assessment_results: AssessmentResult[];
}

function loadLocalStore(): LocalStore {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Sanitize: Purge legacy fake demo data if present
      if (parsed.profiles) {
        delete parsed.profiles['demo-student-id'];
        delete parsed.profiles['demo-admin-id'];
        for (const [id, prof] of Object.entries(parsed.profiles)) {
          const name = (prof as any)?.full_name;
          if (
            name === 'Alex Rivera' ||
            name === 'Dr. Sarah Mitchell' ||
            name === 'Elena Rostova' ||
            name === 'Marcus Vance'
          ) {
            delete parsed.profiles[id];
          }
        }
      }
      if (Array.isArray(parsed.student_skills)) {
        parsed.student_skills = parsed.student_skills.filter(
          (s: any) => s.user_id !== 'demo-student-id' && s.student_id !== 'demo-student-id'
        );
      }
      if (Array.isArray(parsed.internship_applications)) {
        parsed.internship_applications = parsed.internship_applications.filter(
          (a: any) =>
            a.user_id !== 'demo-student-id' &&
            a.student_id !== 'demo-student-id' &&
            a.student_name !== 'Alex Rivera'
        );
      }
      if (Array.isArray(parsed.saved_internships)) {
        parsed.saved_internships = parsed.saved_internships.filter(
          (s: any) => s.user_id !== 'demo-student-id' && s.student_id !== 'demo-student-id'
        );
      }
      if (Array.isArray(parsed.assessment_results)) {
        parsed.assessment_results = parsed.assessment_results.filter(
          (r: any) => r.user_id !== 'demo-student-id' && r.student_id !== 'demo-student-id'
        );
      }
      if (Array.isArray(parsed.projects)) {
        parsed.projects = parsed.projects.filter(
          (p: any) =>
            p.user_id &&
            p.user_id !== 'demo-student-id' &&
            !['proj-1', 'proj-2', 'proj-3', 'proj-4'].includes(p.id)
        );
      }
      if (Array.isArray(parsed.learning_roadmap)) {
        parsed.learning_roadmap = parsed.learning_roadmap.filter(
          (r: any) =>
            r.user_id &&
            r.user_id !== 'demo-student-id' &&
            !['rm-1', 'rm-2', 'rm-3', 'rm-4', 'rm-5', 'rm-6'].includes(r.id)
        );
      }
      if (Array.isArray(parsed.internships)) {
        parsed.internships = parsed.internships.filter(
          (i: any) => !['int-1', 'int-2', 'int-3', 'int-4', 'int-5', 'int-6'].includes(i.id)
        );
      }
      if (parsed.progress) {
        delete parsed.progress['demo-student-id'];
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error loading local storage store', e);
  }

  // Initial clean store without fake student or admin accounts or demo content
  const initialStore: LocalStore = {
    profiles: {},
    student_skills: [],
    projects: [],
    certifications: [],
    internships: [],
    internship_applications: [],
    saved_internships: [],
    skill_gaps: [],
    learning_roadmap: [],
    progress: {},
    assessment_results: [],
  };

  saveLocalStore(initialStore);
  return initialStore;
}

function saveLocalStore(store: LocalStore) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Error saving local storage store', e);
  }
}

function parseListField(value: any): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch {}
    }
    return trimmed.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export function normalizeInternshipRecord(data: any): Internship {
  return {
    id: String(data.id),
    company: data.company || data.company_name || 'Tech Enterprise',
    company_logo: data.company_logo || data.logo_url,
    logo_text: data.logo_text,
    role: data.role || data.title || 'Engineering Intern',
    location: data.location || 'Remote',
    work_mode: (data.work_mode || data.mode || 'Remote') as any,
    duration: data.duration || '3 Months',
    stipend: data.stipend || data.salary || '$5,000 / month',
    required_skills: parseListField(data.required_skills || data.skills || data.requirements_skills),
    description: data.description || data.about_role || 'Engineering internship opportunity.',
    responsibilities: parseListField(data.responsibilities || data.duties),
    requirements: parseListField(data.requirements || data.qualifications),
    eligibility: data.eligibility || 'Open to CS and engineering students',
    perks: parseListField(data.perks || data.benefits),
    deadline: data.deadline || data.apply_by || '2026-10-31',
    target_careers: parseListField(data.target_careers || data.careers) as any,
    is_active: data.is_active !== false,
    posted_date: data.posted_date || (data.created_at ? new Date(data.created_at).toLocaleDateString() : 'Recently'),
    applicant_count: Number(data.applicant_count || 0),
    created_at: data.created_at || new Date().toISOString(),
  };
}

export function normalizeApplicationRecord(data: any, internshipMap?: Map<string, Internship>): InternshipApplication {
  const internshipId = String(data.internship_id || data.internshipId || '');
  const matchedInt = internshipMap?.get(internshipId);

  return {
    id: String(data.id),
    user_id: String(data.user_id || data.student_id || ''),
    internship_id: internshipId,
    status: (data.status || 'Applied') as ApplicationStatus,
    applied_at: data.applied_at || data.applied_date || data.created_at || new Date().toISOString().split('T')[0],
    applied_date: data.applied_date || data.applied_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    notes: data.notes || data.cover_note || '',
    internship: matchedInt || (data.internship ? normalizeInternshipRecord(data.internship) : undefined),
    role: data.role || matchedInt?.role || 'Engineering Intern',
    company: data.company || matchedInt?.company || 'Tech Company',
    match_score: typeof data.match_score === 'number' ? data.match_score : 85,
    resume_url: data.resume_url || 'https://skillsync.ai/resumes/verified-profile.pdf',
    cover_note: data.cover_note || data.notes || '',
    student_name: data.student_name || 'Student Candidate',
    student_email: data.student_email || 'student@university.edu',
    student_college: data.student_college || 'Technology Institute',
    student_target_career: data.student_target_career || 'Software Developer',
    created_at: data.created_at || new Date().toISOString(),
  };
}

export const dataService = {
  // PROFILES
  async getProfile(userId: string): Promise<Profile | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLES.PROFILES)
          .select('*')
          .or(`user_id.eq.${userId},id.eq.${userId}`)
          .single();
        if (!error && data) {
          const targetCareer = data.target_role || data.target_career || 'Software Developer';
          return {
            ...data,
            target_career: targetCareer as TargetCareerTitle,
            target_role: targetCareer as TargetCareerTitle,
          } as Profile;
        }
      } catch (e) {
        console.warn('Supabase getProfile fallback:', e);
      }
    }
    const store = loadLocalStore();
    return store.profiles[userId] || null;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const targetCareer = updates.target_role || updates.target_career;
    const payload: any = {
      user_id: userId,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    if (targetCareer) {
      payload.target_career = targetCareer;
      payload.target_role = targetCareer;
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLES.PROFILES)
          .upsert(payload)
          .select()
          .single();
        if (!error && data) {
          const resolvedCareer = data.target_role || data.target_career || targetCareer || 'Software Developer';
          return {
            ...data,
            target_career: resolvedCareer as TargetCareerTitle,
            target_role: resolvedCareer as TargetCareerTitle,
          } as Profile;
        }
      } catch (e) {
        console.warn('Supabase updateProfile fallback:', e);
      }
    }

    const store = loadLocalStore();
    const existing = store.profiles[userId] || {
      id: `prof-${Date.now()}`,
      user_id: userId,
      full_name: 'Student User',
      email: 'student@skillsync.ai',
      role: 'student' as const,
      college: 'University of Technology',
      degree: 'B.Tech / B.S. in Computer Science',
      branch: 'Computer Science',
      graduation_year: '2026',
      target_career: 'Software Developer' as TargetCareerTitle,
    };

    const updated: Profile = {
      ...existing,
      ...updates,
      target_career: (targetCareer || existing.target_career || 'Software Developer') as TargetCareerTitle,
      target_role: (targetCareer || existing.target_role || existing.target_career || 'Software Developer') as TargetCareerTitle,
      updated_at: new Date().toISOString(),
    };

    store.profiles[userId] = updated;
    saveLocalStore(store);
    return updated;
  },

  async getAllStudents(): Promise<Profile[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLES.PROFILES)
          .select('*')
          .eq('role', 'student');
        if (!error && data) return data as Profile[];
      } catch (e) {
        console.warn('Supabase getAllStudents fallback:', e);
      }
    }

    const store = loadLocalStore();
    return Object.values(store.profiles).filter((p) => p.role === 'student');
  },

  async getStudentById(studentUserId: string): Promise<Profile | null> {
    return this.getProfile(studentUserId);
  },

  // SKILLS
  async getStudentSkills(userId: string): Promise<StudentSkill[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLES.STUDENT_SKILLS)
          .select('*')
          .or(`user_id.eq.${userId},student_id.eq.${userId}`)
          .order('verified', { ascending: false });
        if (!error && data) {
          return data.map((d: any) => ({
            ...d,
            user_id: d.user_id || d.student_id || userId,
          })) as StudentSkill[];
        } else if (error) {
          const fallbackRes = await supabase
            .from(SUPABASE_TABLES.STUDENT_SKILLS)
            .select('*')
            .eq('user_id', userId)
            .order('verified', { ascending: false });
          if (!fallbackRes.error && fallbackRes.data) {
            return fallbackRes.data as StudentSkill[];
          }
        }
      } catch (e) {
        console.warn('Supabase getStudentSkills fallback:', e);
      }
    }
    const store = loadLocalStore();
    return store.student_skills.filter((s) => s.user_id === userId);
  },

  async addStudentSkill(skill: Omit<StudentSkill, 'id'>): Promise<StudentSkill> {
    if (isSupabaseConfigured) {
      try {
        const payload: any = {
          user_id: skill.user_id,
          skill_name: skill.skill_name,
          category: skill.category,
          level: skill.level,
          verified: skill.verified ?? false,
          score: skill.score,
          verified_at: skill.verified_at,
          created_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from(SUPABASE_TABLES.STUDENT_SKILLS)
          .insert(payload)
          .select()
          .single();

        if (!error && data) {
          return {
            ...data,
            user_id: data.user_id || data.student_id || skill.user_id,
          } as StudentSkill;
        }

        if (error && error.message?.toLowerCase().includes('user_id')) {
          const altPayload = { ...payload, student_id: skill.user_id };
          delete altPayload.user_id;
          const altRes = await supabase
            .from(SUPABASE_TABLES.STUDENT_SKILLS)
            .insert(altPayload)
            .select()
            .single();
          if (!altRes.error && altRes.data) {
            return {
              ...altRes.data,
              user_id: altRes.data.user_id || altRes.data.student_id || skill.user_id,
            } as StudentSkill;
          }
        }
      } catch (e) {
        console.warn('Supabase addStudentSkill fallback:', e);
      }
    }

    const store = loadLocalStore();
    const newSkill: StudentSkill = {
      ...skill,
      id: `sk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    store.student_skills.push(newSkill);
    saveLocalStore(store);

    if (skill.user_id) {
      this.recalculateAndSaveProgress(skill.user_id).catch(() => {});
    }

    return newSkill;
  },

  async updateStudentSkill(skillId: string, updates: Partial<StudentSkill>): Promise<StudentSkill> {
    let affectedUserId: string | undefined = undefined;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLES.STUDENT_SKILLS)
          .update(updates)
          .eq('id', skillId)
          .select()
          .single();
        if (!error && data) {
          affectedUserId = data.user_id || data.student_id;
          if (affectedUserId) {
            this.recalculateAndSaveProgress(affectedUserId).catch(() => {});
          }
          return {
            ...data,
            user_id: data.user_id || data.student_id,
          } as StudentSkill;
        }
      } catch (e) {
        console.warn('Supabase updateStudentSkill fallback:', e);
      }
    }

    const store = loadLocalStore();
    const idx = store.student_skills.findIndex((s) => s.id === skillId);
    if (idx !== -1) {
      store.student_skills[idx] = { ...store.student_skills[idx], ...updates };
      affectedUserId = store.student_skills[idx].user_id;
      saveLocalStore(store);
      if (affectedUserId) {
        this.recalculateAndSaveProgress(affectedUserId).catch(() => {});
      }
      return store.student_skills[idx];
    }
    throw new Error('Skill not found');
  },

  async deleteStudentSkill(skillId: string, userId?: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from(SUPABASE_TABLES.STUDENT_SKILLS).delete().eq('id', skillId);
      } catch (e) {
        console.warn('Supabase deleteStudentSkill fallback:', e);
      }
    }
    const store = loadLocalStore();
    const target = store.student_skills.find((s) => s.id === skillId);
    const effectiveUserId = userId || target?.user_id;
    store.student_skills = store.student_skills.filter((s) => s.id !== skillId);
    saveLocalStore(store);

    if (effectiveUserId) {
      this.recalculateAndSaveProgress(effectiveUserId).catch(() => {});
    }
  },

  // PROJECTS
  async getProjects(userId: string): Promise<Project[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLES.PROJECTS)
          .select('*')
          .eq('user_id', userId);
        if (!error && data) return data as Project[];
      } catch (e) {
        console.warn('Supabase getProjects fallback:', e);
      }
    }
    const store = loadLocalStore();
    return store.projects.filter((p) => p.user_id === userId);
  },

  async addProject(project: Omit<Project, 'id'>): Promise<Project> {
    let created: Project | null = null;
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLES.PROJECTS)
          .insert(project)
          .select()
          .single();
        if (!error && data) {
          created = data as Project;
        }
      } catch (e) {
        console.warn('Supabase addProject fallback:', e);
      }
    }

    if (!created) {
      const store = loadLocalStore();
      const newProj: Project = {
        ...project,
        id: `proj-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      store.projects.unshift(newProj);
      saveLocalStore(store);
      created = newProj;
    }

    if (project.user_id) {
      this.recalculateAndSaveProgress(project.user_id).catch(() => {});
    }

    return created;
  },

  async toggleProjectCompletion(projectId: string, completed: boolean, userId?: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from(SUPABASE_TABLES.PROJECTS)
          .update({ completed, status: completed ? 'Completed' : 'In Progress' })
          .eq('id', projectId);
      } catch (e) {
        console.warn('Supabase toggleProjectCompletion fallback:', e);
      }
    }
    const store = loadLocalStore();
    const p = store.projects.find((item) => item.id === projectId);
    const targetUserId = userId || p?.user_id;
    if (p) {
      p.completed = completed;
      p.status = completed ? 'Completed' : 'In Progress';
      saveLocalStore(store);
    }

    if (targetUserId) {
      this.recalculateAndSaveProgress(targetUserId).catch(() => {});
    }
  },

  async updateProject(projectId: string, updates: Partial<Project>, userId?: string): Promise<Project> {
    let updated: Project | null = null;
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLES.PROJECTS)
          .update(updates)
          .eq('id', projectId)
          .select()
          .single();
        if (!error && data) updated = data as Project;
      } catch (e) {
        console.warn('Supabase updateProject fallback:', e);
      }
    }
    const store = loadLocalStore();
    const idx = store.projects.findIndex((p) => p.id === projectId);
    if (idx !== -1) {
      store.projects[idx] = { ...store.projects[idx], ...updates };
      saveLocalStore(store);
      if (!updated) updated = store.projects[idx];
    }
    
    const targetUserId = userId || updated?.user_id || store.projects.find((p) => p.id === projectId)?.user_id;
    if (targetUserId) {
      this.recalculateAndSaveProgress(targetUserId).catch(() => {});
    }

    if (updated) return updated;
    throw new Error('Project not found');
  },

  // INTERNSHIPS
  async getInternships(): Promise<Internship[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLES.INTERNSHIPS)
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map(normalizeInternshipRecord);
        }
      } catch (e) {
        console.warn('Supabase getInternships fallback:', e);
      }
    }
    const store = loadLocalStore();
    return store.internships.map(normalizeInternshipRecord);
  },

  async getInternshipById(id: string): Promise<Internship | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLES.INTERNSHIPS)
          .select('*')
          .eq('id', id)
          .single();
        if (!error && data) {
          return normalizeInternshipRecord(data);
        }
      } catch (e) {
        console.warn('Supabase getInternshipById fallback:', e);
      }
    }
    const all = await this.getInternships();
    return all.find((i) => i.id === id) || null;
  },

  async createInternship(internship: Omit<Internship, 'id'>): Promise<Internship> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLES.INTERNSHIPS)
          .insert(internship)
          .select()
          .single();
        if (!error && data) return normalizeInternshipRecord(data);
      } catch (e) {
        console.warn('Supabase createInternship fallback:', e);
      }
    }

    const store = loadLocalStore();
    const newInt: Internship = {
      ...internship,
      id: `int-${Date.now()}`,
      posted_date: 'Just now',
      applicant_count: 0,
      created_at: new Date().toISOString(),
    };
    store.internships.unshift(newInt);
    saveLocalStore(store);
    return newInt;
  },

  async saveInternships(internships: Internship[]): Promise<void> {
    const store = loadLocalStore();
    store.internships = internships;
    saveLocalStore(store);
  },

  async deleteInternship(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from(SUPABASE_TABLES.INTERNSHIPS).delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteInternship fallback:', e);
      }
    }
    const store = loadLocalStore();
    store.internships = store.internships.filter((i) => i.id !== id);
    saveLocalStore(store);
  },

  // APPLICATIONS
  async getApplications(userId: string): Promise<InternshipApplication[]> {
    const internships = await this.getInternships();
    const internshipMap = new Map<string, Internship>(internships.map((i) => [i.id, i]));

    if (isSupabaseConfigured) {
      try {
        let appRecords: any[] | null = null;
        const { data, error } = await supabase
          .from(SUPABASE_TABLES.INTERNSHIP_APPLICATIONS)
          .select('*')
          .or(`user_id.eq.${userId},student_id.eq.${userId}`)
          .order('created_at', { ascending: false });

        if (!error && data) {
          appRecords = data;
        } else {
          // Fallback if specific column query fails
          const { data: altData, error: altError } = await supabase
            .from(SUPABASE_TABLES.INTERNSHIP_APPLICATIONS)
            .select('*')
            .eq('user_id', userId);
          if (!altError && altData) appRecords = altData;
        }

        if (appRecords) {
          return appRecords.map((app) => normalizeApplicationRecord(app, internshipMap));
        }
      } catch (e) {
        console.warn('Supabase getApplications fallback:', e);
      }
    }

    const store = loadLocalStore();
    return store.internship_applications
      .filter((app) => app.user_id === userId || (app as any).student_id === userId)
      .map((app) => normalizeApplicationRecord(app, internshipMap));
  },

  async getAllApplications(): Promise<InternshipApplication[]> {
    const internships = await this.getInternships();
    const internshipMap = new Map<string, Internship>(internships.map((i) => [i.id, i]));

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLES.INTERNSHIP_APPLICATIONS)
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map((app) => normalizeApplicationRecord(app, internshipMap));
        }
      } catch (e) {
        console.warn('Supabase getAllApplications fallback:', e);
      }
    }

    const store = loadLocalStore();
    return store.internship_applications.map((app) => normalizeApplicationRecord(app, internshipMap));
  },

  async checkHasApplied(userId: string, internshipId: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLES.INTERNSHIP_APPLICATIONS)
          .select('id')
          .or(`user_id.eq.${userId},student_id.eq.${userId}`)
          .eq('internship_id', internshipId)
          .limit(1);
        if (!error && data && data.length > 0) return true;
      } catch (e) {
        console.warn('Supabase checkHasApplied fallback:', e);
      }
    }
    const store = loadLocalStore();
    return store.internship_applications.some(
      (a) => (a.user_id === userId || (a as any).student_id === userId) && a.internship_id === internshipId
    );
  },

  async applyForInternship(
    userId: string,
    internshipId: string,
    notes?: string,
    studentInfo?: { name: string; email: string; college: string; career: string }
  ): Promise<InternshipApplication> {
    return this.submitApplication({
      user_id: userId,
      internship_id: internshipId,
      notes,
      student_name: studentInfo?.name,
      student_email: studentInfo?.email,
      student_college: studentInfo?.college,
      student_target_career: studentInfo?.career,
    });
  },

  async submitApplication(appData: Partial<InternshipApplication> & { user_id: string; internship_id: string }): Promise<InternshipApplication> {
    const isAlreadyApplied = await this.checkHasApplied(appData.user_id, appData.internship_id);
    if (isAlreadyApplied) {
      throw new Error('You have already applied for this internship position.');
    }

    const internships = await this.getInternships();
    const matchedInt = internships.find((i) => i.id === appData.internship_id);

    const newApp: InternshipApplication = {
      id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: appData.user_id,
      internship_id: appData.internship_id,
      status: appData.status || 'Applied',
      applied_at: appData.applied_at || appData.applied_date || new Date().toISOString(),
      applied_date: appData.applied_date || new Date().toISOString().split('T')[0],
      notes: appData.notes || appData.cover_note || 'Applied via SkillSync AI Career Portal',
      role: appData.role || matchedInt?.role || 'Engineering Intern',
      company: appData.company || matchedInt?.company || 'Tech Company',
      match_score: appData.match_score ?? 85,
      resume_url: appData.resume_url || 'https://skillsync.ai/resumes/verified-profile.pdf',
      cover_note: appData.cover_note || '',
      student_name: appData.student_name || 'Student Candidate',
      student_email: appData.student_email || 'student@university.edu',
      student_college: appData.student_college || 'Technology Institute',
      student_target_career: appData.student_target_career || 'Software Developer',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, any> = {
          user_id: appData.user_id,
          student_id: appData.user_id,
          internship_id: appData.internship_id,
          status: newApp.status,
          role: newApp.role,
          company: newApp.company,
          match_score: newApp.match_score,
          resume_url: newApp.resume_url,
          cover_note: newApp.cover_note,
          applied_at: newApp.applied_at,
          applied_date: newApp.applied_date,
          created_at: newApp.created_at,
        };

        const { data, error } = await supabase
          .from(SUPABASE_TABLES.INTERNSHIP_APPLICATIONS)
          .insert(payload)
          .select()
          .single();

        if (!error && data) {
          const internshipMap = new Map<string, Internship>(internships.map((i) => [i.id, i]));
          this.recalculateAndSaveProgress(appData.user_id).catch(() => {});
          return normalizeApplicationRecord(data, internshipMap);
        }
      } catch (e) {
        console.warn('Supabase submitApplication fallback:', e);
      }
    }

    const store = loadLocalStore();
    store.internship_applications.unshift(newApp);
    const targetInt = store.internships.find((i) => i.id === appData.internship_id);
    if (targetInt) {
      targetInt.applicant_count = (targetInt.applicant_count || 0) + 1;
    }
    saveLocalStore(store);
    newApp.internship = matchedInt;

    this.recalculateAndSaveProgress(appData.user_id).catch(() => {});

    return newApp;
  },

  async updateApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from(SUPABASE_TABLES.INTERNSHIP_APPLICATIONS)
          .update({ status })
          .eq('id', applicationId);
      } catch (e) {
        console.warn('Supabase updateApplicationStatus fallback:', e);
      }
    }

    const store = loadLocalStore();
    const app = store.internship_applications.find((a) => a.id === applicationId);
    if (app) {
      app.status = status;
      saveLocalStore(store);
    }
  },

  // SAVED INTERNSHIPS
  async getSavedInternships(userId: string): Promise<SavedInternship[]> {
    const internships = await this.getInternships();
    const map = new Map<string, Internship>(internships.map((i) => [i.id, i]));

    if (isSupabaseConfigured) {
      try {
        let records: any[] | null = null;
        const { data, error } = await supabase
          .from(SUPABASE_TABLES.SAVED_INTERNSHIPS)
          .select('*')
          .or(`user_id.eq.${userId},student_id.eq.${userId}`);

        if (!error && data) {
          records = data;
        } else {
          const { data: altData, error: altError } = await supabase
            .from(SUPABASE_TABLES.SAVED_INTERNSHIPS)
            .select('*')
            .eq('user_id', userId);
          if (!altError && altData) records = altData;
        }

        if (records) {
          return records.map((s) => ({
            id: String(s.id),
            user_id: s.user_id || s.student_id || userId,
            internship_id: s.internship_id,
            saved_at: s.saved_at || s.created_at || new Date().toISOString(),
            internship: map.get(s.internship_id),
          })) as SavedInternship[];
        }
      } catch (e) {
        console.warn('Supabase getSavedInternships fallback:', e);
      }
    }

    const store = loadLocalStore();
    return store.saved_internships
      .filter((s) => s.user_id === userId || (s as any).student_id === userId)
      .map((s) => ({
        ...s,
        internship: map.get(s.internship_id),
      })) as unknown as SavedInternship[];
  },

  async saveInternship(
    userIdOrData: string | { user_id: string; internship_id: string; saved_at?: string },
    maybeInternshipId?: string
  ): Promise<void> {
    const userId = typeof userIdOrData === 'string' ? userIdOrData : userIdOrData.user_id;
    const internshipId = typeof userIdOrData === 'string' ? maybeInternshipId! : userIdOrData.internship_id;

    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, any> = {
          user_id: userId,
          student_id: userId,
          internship_id: internshipId,
          saved_at: new Date().toISOString(),
        };
        await supabase.from(SUPABASE_TABLES.SAVED_INTERNSHIPS).insert(payload);
      } catch (e) {
        console.warn('Supabase saveInternship fallback:', e);
      }
    }

    const store = loadLocalStore();
    const exists = store.saved_internships.some(
      (s) => (s.user_id === userId || (s as any).student_id === userId) && s.internship_id === internshipId
    );
    if (!exists) {
      store.saved_internships.push({
        id: `saved-${Date.now()}`,
        user_id: userId,
        internship_id: internshipId,
        saved_at: new Date().toISOString(),
      });
      saveLocalStore(store);
    }
  },

  async unsaveInternship(userId: string, internshipId: string): Promise<void> {
    return this.removeSavedInternship(userId, internshipId);
  },

  async removeSavedInternship(userId: string, internshipId: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from(SUPABASE_TABLES.SAVED_INTERNSHIPS)
          .delete()
          .or(`user_id.eq.${userId},student_id.eq.${userId}`)
          .eq('internship_id', internshipId);
      } catch (e) {
        console.warn('Supabase removeSavedInternship fallback:', e);
      }
    }

    const store = loadLocalStore();
    store.saved_internships = store.saved_internships.filter(
      (s) => !((s.user_id === userId || (s as any).student_id === userId) && s.internship_id === internshipId)
    );
    saveLocalStore(store);
  },

  // SKILL GAPS
  async getSkillGaps(userId: string, targetCareer: TargetCareerTitle): Promise<SkillGap[]> {
    const skills = await this.getStudentSkills(userId);
    const computed = calculateSkillGaps(targetCareer, skills);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLES.SKILL_GAPS)
          .select('*')
          .or(`user_id.eq.${userId},student_id.eq.${userId}`);

        if (!error && data && data.length > 0) {
          // Check if data matches current target career
          const matchesCareer = data.filter(
            (d: any) =>
              (d.target_career === targetCareer || d.target_role === targetCareer) &&
              (d.user_id === userId || d.student_id === userId)
          );
          if (matchesCareer.length > 0) {
            return matchesCareer.map((d: any) => ({
              id: d.id || `gap-${d.skill || d.skill_name}`,
              user_id: d.user_id || d.student_id || userId,
              student_id: d.student_id || d.user_id || userId,
              target_career: (d.target_career || d.target_role || targetCareer) as TargetCareerTitle,
              target_role: (d.target_role || d.target_career || targetCareer) as TargetCareerTitle,
              skill: d.skill || d.skill_name,
              skill_name: d.skill_name || d.skill,
              current_level: d.current_level || 'Not Started',
              required_level: d.required_level || 'Intermediate',
              gap_percentage: typeof d.gap_percentage === 'number' ? d.gap_percentage : 0,
              priority: d.priority || 'Moderate Gap',
              recommended_action: d.recommended_action || 'Continue mastering foundational concepts.',
              why_it_matters: d.why_it_matters || computed.find((c) => c.skill === (d.skill || d.skill_name))?.why_it_matters,
            })) as SkillGap[];
          }
        }
      } catch (e) {
        console.warn('Supabase getSkillGaps fallback:', e);
      }
    }

    return computed;
  },

  async syncSkillGaps(userId: string, targetCareer: TargetCareerTitle, gaps: SkillGap[]): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        // Remove prior calculated gaps for this user to avoid stale records
        await supabase
          .from(SUPABASE_TABLES.SKILL_GAPS)
          .delete()
          .or(`user_id.eq.${userId},student_id.eq.${userId}`);

        const rows = gaps.map((g) => ({
          user_id: userId,
          student_id: userId,
          target_career: targetCareer,
          target_role: targetCareer,
          skill: g.skill,
          skill_name: g.skill,
          current_level: g.current_level,
          required_level: g.required_level,
          gap_percentage: g.gap_percentage,
          priority: g.priority,
          recommended_action: g.recommended_action,
        }));

        await supabase.from(SUPABASE_TABLES.SKILL_GAPS).insert(rows);
      } catch (e) {
        console.warn('Supabase syncSkillGaps notice:', e);
      }
    }

    const store = loadLocalStore();
    store.skill_gaps = [
      ...store.skill_gaps.filter((g) => g.user_id !== userId),
      ...gaps.map((g) => ({ ...g, user_id: userId, student_id: userId })),
    ];
    saveLocalStore(store);
  },

  // ROADMAP
  async getRoadmap(userId: string, targetCareer: TargetCareerTitle): Promise<LearningRoadmapItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLES.LEARNING_ROADMAP)
          .select('*')
          .eq('user_id', userId)
          .order('order_index', { ascending: true });
        if (!error && data) return data as LearningRoadmapItem[];
      } catch (e) {
        console.warn('Supabase getRoadmap fallback:', e);
      }
    }

    const store = loadLocalStore();
    return store.learning_roadmap.filter((r) => r.user_id === userId);
  },

  async getRoadmapMilestones(userId: string, targetCareer: TargetCareerTitle): Promise<LearningRoadmapItem[]> {
    return this.getRoadmap(userId, targetCareer);
  },

  async updateRoadmapItem(itemId: string, updates: Partial<LearningRoadmapItem>, userId?: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from(SUPABASE_TABLES.LEARNING_ROADMAP)
          .update(updates)
          .eq('id', itemId);
      } catch (e) {
        console.warn('Supabase updateRoadmapItem fallback:', e);
      }
    }

    const store = loadLocalStore();
    const item = store.learning_roadmap.find((i) => i.id === itemId);
    const targetUserId = userId || item?.user_id;
    if (item) {
      Object.assign(item, updates);
      saveLocalStore(store);
    }

    if (targetUserId) {
      this.recalculateAndSaveProgress(targetUserId).catch(() => {});
    }
  },

  async toggleRoadmapItem(itemId: string, completed: boolean, userId?: string): Promise<void> {
    const progress_pct = completed ? 100 : 0;
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from(SUPABASE_TABLES.LEARNING_ROADMAP)
          .update({ completed, progress_pct })
          .eq('id', itemId);
      } catch (e) {
        console.warn('Supabase toggleRoadmapItem fallback:', e);
      }
    }

    const store = loadLocalStore();
    const item = store.learning_roadmap.find((i) => i.id === itemId);
    const targetUserId = userId || item?.user_id;
    if (item) {
      item.completed = completed;
      item.progress_pct = progress_pct;
      saveLocalStore(store);
    }

    if (targetUserId) {
      this.recalculateAndSaveProgress(targetUserId).catch(() => {});
    }
  },

  // CHAT MESSAGES
  async getChatMessages(userId: string): Promise<ChatMessage[]> {
    try {
      const stored = localStorage.getItem(`skillsync_chat_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  async saveChatMessage(userId: string, message: ChatMessage): Promise<void> {
    try {
      const existing = await this.getChatMessages(userId);
      const updated = [...existing, message];
      localStorage.setItem(`skillsync_chat_${userId}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save chat message:', e);
    }
  },

  async clearChatMessages(userId: string): Promise<void> {
    try {
      localStorage.removeItem(`skillsync_chat_${userId}`);
    } catch (e) {
      console.warn('Failed to clear chat messages:', e);
    }
  },

  // ASSESSMENT RESULTS
  async getAssessmentResults(userId: string): Promise<AssessmentResult[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLES.ASSESSMENT_RESULTS)
          .select('*')
          .or(`user_id.eq.${userId},student_id.eq.${userId}`)
          .order('completed_at', { ascending: false });
        if (!error && data) {
          return data.map((d: any) => ({
            ...d,
            user_id: d.user_id || d.student_id || userId,
            strengths: Array.isArray(d.strengths)
              ? d.strengths
              : typeof d.strengths === 'string'
              ? JSON.parse(d.strengths)
              : [],
            areas_to_improve: Array.isArray(d.areas_to_improve)
              ? d.areas_to_improve
              : typeof d.areas_to_improve === 'string'
              ? JSON.parse(d.areas_to_improve)
              : [],
          })) as AssessmentResult[];
        }
      } catch (e) {
        console.warn('Supabase getAssessmentResults fallback:', e);
      }
    }

    const store = loadLocalStore();
    return store.assessment_results.filter(
      (ar) => ar.user_id === userId
    );
  },

  async saveAssessmentResult(result: Omit<AssessmentResult, 'id'>): Promise<AssessmentResult> {
    const newResult: AssessmentResult = {
      ...result,
      id: `ar-${Date.now()}`,
    };

    if (isSupabaseConfigured) {
      try {
        const payload: any = {
          user_id: result.user_id,
          skill_name: result.skill_name,
          score: result.score,
          skill_level: result.skill_level,
          verification_status: result.verification_status,
          strengths: result.strengths,
          areas_to_improve: result.areas_to_improve,
          completed_at: result.completed_at || new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from(SUPABASE_TABLES.ASSESSMENT_RESULTS)
          .insert(payload)
          .select()
          .single();

        // Also update or insert in Supabase student_skills
        try {
          const { data: existingSkills } = await supabase
            .from(SUPABASE_TABLES.STUDENT_SKILLS)
            .select('*')
            .or(`user_id.eq.${result.user_id},student_id.eq.${result.user_id}`);

          const matchedSkill = existingSkills?.find(
            (s: any) => s.skill_name?.toLowerCase()?.trim() === result.skill_name?.toLowerCase()?.trim()
          );

          if (matchedSkill) {
            await supabase
              .from(SUPABASE_TABLES.STUDENT_SKILLS)
              .update({
                verified: result.verification_status === 'Verified',
                score: result.score,
                level: result.skill_level,
                verified_at: new Date().toISOString().split('T')[0],
              })
              .eq('id', matchedSkill.id);
          } else {
            await supabase.from(SUPABASE_TABLES.STUDENT_SKILLS).insert({
              user_id: result.user_id,
              student_id: result.user_id,
              skill_name: result.skill_name,
              category: 'Technical',
              level: result.skill_level,
              verified: result.verification_status === 'Verified',
              score: result.score,
              verified_at: new Date().toISOString().split('T')[0],
              created_at: new Date().toISOString(),
            });
          }
        } catch (syncSkillErr) {
          console.warn('Supabase skill sync notice in saveAssessmentResult:', syncSkillErr);
        }

        if (!error && data) {
          return {
            ...data,
            user_id: data.user_id || data.student_id || result.user_id,
            strengths: Array.isArray(data.strengths)
              ? data.strengths
              : typeof data.strengths === 'string'
              ? JSON.parse(data.strengths)
              : result.strengths,
            areas_to_improve: Array.isArray(data.areas_to_improve)
              ? data.areas_to_improve
              : typeof data.areas_to_improve === 'string'
              ? JSON.parse(data.areas_to_improve)
              : result.areas_to_improve,
          } as AssessmentResult;
        }
      } catch (e) {
        console.warn('Supabase saveAssessmentResult fallback:', e);
      }
    }

    const store = loadLocalStore();
    store.assessment_results.unshift(newResult);

    // Also update or add corresponding student skill verified status
    const existingSkill = store.student_skills.find(
      (s) => s.skill_name.toLowerCase().trim() === result.skill_name.toLowerCase().trim() && s.user_id === result.user_id
    );

    if (existingSkill) {
      existingSkill.verified = result.verification_status === 'Verified';
      existingSkill.score = result.score;
      existingSkill.level = result.skill_level;
      existingSkill.verified_at = new Date().toISOString().split('T')[0];
    } else {
      store.student_skills.push({
        id: `sk-${Date.now()}`,
        user_id: result.user_id,
        skill_name: result.skill_name,
        category: 'Technical',
        level: result.skill_level,
        verified: result.verification_status === 'Verified',
        score: result.score,
        verified_at: new Date().toISOString().split('T')[0],
      });
    }

    saveLocalStore(store);

    // Recalculate and persist progress to Supabase
    this.recalculateAndSaveProgress(result.user_id).catch((err) =>
      console.warn('Background progress update notice:', err)
    );

    return newResult;
  },

  // PROGRESS STATS
  async getProgress(userId: string): Promise<ProgressStats | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLES.PROGRESS)
          .select('*')
          .or(`user_id.eq.${userId},student_id.eq.${userId}`)
          .single();
        if (!error && data) {
          return {
            ...data,
            user_id: data.user_id || data.student_id || userId,
          } as ProgressStats;
        }
      } catch (e) {
        console.warn('Supabase getProgress fallback:', e);
      }
    }
    const store = loadLocalStore();
    return store.progress[userId] || null;
  },

  async recalculateAndSaveProgress(userId: string, targetCareerInput?: TargetCareerTitle): Promise<ProgressStats> {
    if (!userId) {
      throw new Error('User ID is required to calculate progress');
    }

    // 1. Fetch profile to know target career if not supplied
    let targetCareer = targetCareerInput;
    let studentProfile: Profile | null = null;
    try {
      studentProfile = await this.getProfile(userId);
      if (!targetCareer && (studentProfile?.target_career || (studentProfile as any)?.target_role)) {
        targetCareer = (studentProfile?.target_career || (studentProfile as any)?.target_role) as TargetCareerTitle;
      }
    } catch {
      // ignore
    }
    if (!targetCareer) {
      targetCareer = 'Software Developer';
    }

    // 2. Fetch all real student records in parallel from Supabase/Local
    const [skills, projects, roadmap, assessments, apps] = await Promise.all([
      this.getStudentSkills(userId),
      this.getProjects(userId),
      this.getRoadmap(userId, targetCareer),
      this.getAssessmentResults(userId),
      this.getApplications(userId),
    ]);

    // 3. Compute real counts
    const completedRoadmapCount = roadmap.filter((r) => r.completed || r.progress_pct === 100).length;
    const roadmapPct = roadmap.length > 0 ? Math.round((completedRoadmapCount / roadmap.length) * 100) : 0;
    const completedProjectsCount = projects.filter((p) => p.completed || p.status === 'Completed').length;
    const verifiedSkillsCount = skills.filter((s) => s.verified).length;
    const gaps = calculateSkillGaps(targetCareer, skills);
    const highGapsCount = gaps.filter((g) => g.priority === 'High Priority Gap').length;

    // 4. Calculate Career Readiness Score using real weights
    const readinessScore = calculateReadinessScore(
      targetCareer,
      skills,
      completedProjectsCount,
      roadmapPct,
      assessments.length
    );

    // 5. Calculate real learning streak from activity timestamps
    const activityDates = new Set<string>();
    assessments.forEach((a) => {
      if (a.completed_at) activityDates.add(a.completed_at.split('T')[0]);
    });
    skills.forEach((s) => {
      if (s.verified_at) activityDates.add(s.verified_at.split('T')[0]);
      if (s.created_at) activityDates.add(s.created_at.split('T')[0]);
    });
    projects.forEach((p) => {
      if (p.created_at) activityDates.add(p.created_at.split('T')[0]);
    });
    apps.forEach((app) => {
      if (app.applied_at) activityDates.add(app.applied_at.split('T')[0]);
      if (app.applied_date) activityDates.add(app.applied_date.split('T')[0]);
    });
    if (studentProfile?.updated_at) {
      activityDates.add(studentProfile.updated_at.split('T')[0]);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    let streakDays = 0;

    const activeToday = activityDates.has(todayStr);
    const checkDate = new Date();
    if (!activeToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (activityDates.has(dateStr)) {
        streakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    streakDays = Math.max(streakDays, activityDates.size > 0 ? 1 : 0);

    const internshipMatchAvg = Math.min(98, Math.max(35, readinessScore + 6));

    const stats: ProgressStats = {
      user_id: userId,
      career_readiness_score: readinessScore,
      verified_skills_count: verifiedSkillsCount,
      skill_gaps_count: highGapsCount,
      roadmap_progress_pct: roadmapPct,
      internship_match_avg: internshipMatchAvg,
      assessments_completed: assessments.length,
      projects_completed: completedProjectsCount,
      internships_applied: apps.length,
      learning_streak_days: streakDays,
      last_active_date: todayStr,
    };

    // 6. Persist to Supabase progress table
    if (isSupabaseConfigured) {
      try {
        const payload: any = {
          user_id: userId,
          student_id: userId,
          career_readiness_score: stats.career_readiness_score,
          verified_skills_count: stats.verified_skills_count,
          skill_gaps_count: stats.skill_gaps_count,
          roadmap_progress_pct: stats.roadmap_progress_pct,
          internship_match_avg: stats.internship_match_avg,
          assessments_completed: stats.assessments_completed,
          projects_completed: stats.projects_completed,
          internships_applied: stats.internships_applied,
          learning_streak_days: stats.learning_streak_days,
          last_active_date: stats.last_active_date,
        };

        const { error } = await supabase
          .from(SUPABASE_TABLES.PROGRESS)
          .upsert(payload, { onConflict: 'user_id' });

        if (error) {
          await supabase
            .from(SUPABASE_TABLES.PROGRESS)
            .upsert({
              user_id: userId,
              career_readiness_score: stats.career_readiness_score,
              verified_skills_count: stats.verified_skills_count,
              skill_gaps_count: stats.skill_gaps_count,
              roadmap_progress_pct: stats.roadmap_progress_pct,
              internship_match_avg: stats.internship_match_avg,
              assessments_completed: stats.assessments_completed,
              projects_completed: stats.projects_completed,
              internships_applied: stats.internships_applied,
              learning_streak_days: stats.learning_streak_days,
              last_active_date: stats.last_active_date,
            });
        }
      } catch (e) {
        console.warn('Supabase recalculateAndSaveProgress fallback:', e);
      }
    }

    const store = loadLocalStore();
    store.progress[userId] = stats;
    saveLocalStore(store);

    return stats;
  },

  async getProgressStats(userId: string, targetCareer: TargetCareerTitle): Promise<ProgressStats> {
    return this.recalculateAndSaveProgress(userId, targetCareer);
  },
};
