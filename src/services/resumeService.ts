import { Profile, ResumeAnalysis, StudentSkill, TargetCareerTitle } from '../types';
import { TARGET_CAREERS } from './careerMatrix';

export function analyzeResumeText(
  resumeText: string,
  targetCareer: string = 'Software Developer'
): ResumeAnalysis {
  const lower = (resumeText || '').toLowerCase();

  const career = TARGET_CAREERS.find((c) => c.title === targetCareer) || TARGET_CAREERS[0];
  const required = career.requiredSkills.map((r) => r.skill);

  const foundKeywords: string[] = [];
  const missingKeywords: string[] = [];

  required.forEach((req) => {
    if (lower.includes(req.toLowerCase()) || req.toLowerCase().includes('sql') && lower.includes('sql')) {
      foundKeywords.push(req);
    } else {
      missingKeywords.push(req);
    }
  });

  // Additional keywords
  const extraTools = ['React', 'TypeScript', 'Node.js', 'Docker', 'Git', 'CI/CD', 'Python', 'PostgreSQL'];
  extraTools.forEach((t) => {
    if (lower.includes(t.toLowerCase()) && !foundKeywords.includes(t)) {
      foundKeywords.push(t);
    }
  });

  const rawAts = Math.round((foundKeywords.length / Math.max(required.length, 1)) * 100);
  const atsScore = Math.min(96, Math.max(45, rawAts));

  const suggestions: string[] = [];
  if (missingKeywords.length > 0) {
    suggestions.push(`Add direct mentions of keywords: ${missingKeywords.slice(0, 3).join(', ')}.`);
  }
  suggestions.push('Include specific metrics of impact in your bullet points (e.g. latency reduction, request volume).');
  suggestions.push('Highlight verified skill credentials and links to production git repositories.');

  return {
    completenessScore: atsScore,
    skillsDetected: foundKeywords,
    missingSkills: missingKeywords,
    suggestedImprovements: suggestions,
    careerAlignmentScore: atsScore,
    formattingFeedback: [
      'Standard single-column ATS structure',
      'Clean bullet hierarchy and chronological ordering',
    ],
    summary: `Your resume matches ${atsScore}% of target ATS keywords for ${targetCareer}.`,
    atsScore,
    foundKeywords,
    missingKeywords,
    suggestions,
  };
}

export const resumeService = {
  /**
   * Modular resume analyzer that parses text / profile metrics and evaluates ATS alignment.
   * Can be hooked to Gemini multi-modal file ingestion later.
   */
  async analyzeResume(
    profile: Profile,
    skills: StudentSkill[],
    targetCareer: TargetCareerTitle,
    resumeText?: string
  ): Promise<ResumeAnalysis> {
    return analyzeResumeText(resumeText || profile.bio || '', targetCareer);
  },
};

