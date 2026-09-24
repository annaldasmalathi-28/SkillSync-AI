export type UserRole = 'student' | 'admin';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type VerificationStatus = 'Verified' | 'Needs Practice' | 'Pending';

export type SkillGapPriority = 'Strong' | 'Moderate Gap' | 'High Priority Gap';

export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';

export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Pending Review'
  | 'Interview'
  | 'Interview Scheduled'
  | 'Shortlisted'
  | 'Offered'
  | 'Offer Extended'
  | 'Rejected'
  | 'Selected'
  | 'Accepted';

export type TargetCareerTitle =
  | 'Software Developer'
  | 'Full Stack Developer'
  | 'Data Analyst'
  | 'Data Scientist'
  | 'AI/ML Engineer'
  | 'Cybersecurity Analyst'
  | 'Cloud Engineer'
  | 'DevOps Engineer'
  | 'Mobile App Developer';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  college: string;
  degree: string;
  branch: string;
  graduation_year: number | string;
  cgpa?: number | string;
  coding_experience?: string;
  target_career: TargetCareerTitle;
  target_role?: TargetCareerTitle;
  resume_url?: string;
  avatar_url?: string;
  bio?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentSkill {
  id: string;
  user_id: string;
  student_id?: string;
  skill_name: string;
  category: string;
  level: SkillLevel;
  verified: boolean;
  score?: number;
  verified_at?: string;
  created_at?: string;
}

export interface Project {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  technologies: string[];
  skills_gained: string[];
  estimated_duration: string;
  github_url?: string;
  live_url?: string;
  completed?: boolean;
  status?: 'Not Started' | 'In Progress' | 'Completed';
  is_recommended?: boolean;
  target_careers?: TargetCareerTitle[];
  created_at?: string;
}

export interface Certification {
  id: string;
  user_id: string;
  name: string;
  issuer: string;
  issue_date: string;
  credential_url?: string;
  created_at?: string;
}

export interface Internship {
  id: string;
  company: string;
  company_logo?: string;
  logo_text?: string;
  role: string;
  location: string;
  work_mode: WorkMode;
  duration: string;
  stipend: string;
  required_skills: string[];
  description: string;
  responsibilities?: string[];
  requirements?: string[];
  eligibility?: string;
  perks?: string[];
  deadline: string;
  target_careers?: TargetCareerTitle[];
  is_active?: boolean;
  posted_date?: string;
  applicant_count?: number;
  created_at?: string;
}

export interface InternshipApplication {
  id: string;
  user_id: string;
  internship_id: string;
  status: ApplicationStatus;
  applied_at: string;
  applied_date?: string;
  notes?: string;
  internship?: Internship;
  role?: string;
  company?: string;
  match_score?: number;
  resume_url?: string;
  cover_note?: string;
  student_name?: string;
  student_email?: string;
  student_college?: string;
  student_target_career?: string;
  created_at?: string;
}

export type Application = InternshipApplication;
export type RoadmapMilestone = LearningRoadmapItem;

export interface SavedInternship {
  id: string;
  user_id: string;
  internship_id: string;
  saved_at: string;
  internship?: Internship;
}

export interface SkillGap {
  id: string;
  user_id?: string;
  student_id?: string;
  target_career: TargetCareerTitle;
  target_role?: TargetCareerTitle;
  skill: string;
  skill_name?: string;
  current_level: SkillLevel | 'Not Started';
  required_level: SkillLevel;
  gap_percentage: number;
  priority: SkillGapPriority;
  recommended_action: string;
  why_it_matters?: string;
}

export interface LearningRoadmapItem {
  id: string;
  user_id?: string;
  target_career: TargetCareerTitle;
  phase_number: number;
  phase_name: string;
  topic: string;
  description: string;
  resource_url: string;
  duration: string;
  project_idea: string;
  completed: boolean;
  progress_pct: number;
  order_index: number;
}

export interface ProgressStats {
  id?: string;
  user_id: string;
  career_readiness_score: number;
  verified_skills_count: number;
  skill_gaps_count: number;
  roadmap_progress_pct: number;
  internship_match_avg: number;
  assessments_completed: number;
  projects_completed: number;
  internships_applied: number;
  learning_streak_days: number;
  last_active_date?: string;
}

export interface AssessmentQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
}

export interface AssessmentResult {
  id: string;
  user_id: string;
  skill_name: string;
  score: number;
  skill_level: SkillLevel;
  verification_status: VerificationStatus;
  strengths: string[];
  areas_to_improve: string[];
  completed_at: string;
}

export interface CareerInfo {
  title: TargetCareerTitle;
  description: string;
  averageSalary: string;
  marketDemand: 'Very High' | 'High' | 'Moderate';
  requiredSkills: { skill: string; minLevel: SkillLevel; category: string; importance: number }[];
  overview: string;
  growthRate: string;
  coreSkills?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'ai';
  text: string;
  timestamp: string;
  actionSuggestions?: string[];
  suggestedRoute?: string;
}

export interface ResumeAnalysis {
  completenessScore: number;
  skillsDetected: string[];
  missingSkills: string[];
  suggestedImprovements: string[];
  careerAlignmentScore: number;
  formattingFeedback: string[];
  summary: string;
  // Aliases for component convenience
  atsScore: number;
  foundKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}
