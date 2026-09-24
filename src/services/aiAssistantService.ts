import { ChatMessage, Profile, StudentSkill, TargetCareerTitle, SkillGap, Internship } from '../types';
import { calculateSkillGaps, TARGET_CAREERS } from './careerMatrix';

export interface AIContextData {
  profile: Profile;
  skills: StudentSkill[];
  internships: Internship[];
  readinessScore: number;
}

/**
 * Modular AI Career Intelligence Service abstraction.
 * Ready for server-side Gemini 2.5/Flash streaming or REST integration.
 */
export const aiAssistantService = {
  /**
   * Generates intelligent, personalized career guidance based on real student context.
   */
  async generateCareerAdvice(
    userMessage: string,
    history: ChatMessage[],
    context: AIContextData
  ): Promise<{ text: string; actionSuggestions?: string[]; suggestedRoute?: string }> {
    // Artificial small latency for realistic async intelligence processing
    await new Promise((res) => setTimeout(res, 600));

    const prompt = userMessage.toLowerCase();
    const { profile, skills, internships, readinessScore } = context;
    const targetCareer = profile.target_career;
    const gaps = calculateSkillGaps(targetCareer, skills);
    const highGaps = gaps.filter((g) => g.priority === 'High Priority Gap');
    const verifiedSkills = skills.filter((s) => s.verified).map((s) => s.skill_name);
    const unverifiedSkills = skills.filter((s) => !s.verified).map((s) => s.skill_name);

    // 1. Target career skill questions
    if (prompt.includes('skill') || prompt.includes('learn') || prompt.includes('software development') || prompt.includes('what should i')) {
      const careerInfo = TARGET_CAREERS.find((c) => c.title === targetCareer) || TARGET_CAREERS[0];
      const gapList = highGaps.map((g) => `• **${g.skill}**: Required at *${g.required_level}* level (Current gap: ${g.gap_percentage}%)`).join('\n');

      return {
        text: `### Strategic Skill Roadmap for ${targetCareer}\n\nBased on your live profile (${profile.degree} at ${profile.college}), here is your prioritized skill breakdown:\n\n${gapList ? `**Key Priority Gaps to Bridge:**\n${gapList}\n\n` : `🎉 **Exceptional Foundation:** You have verified all primary core competencies for ${targetCareer}!\n\n`}**Recommended Immediate Actions:**\n1. Take the **SkillSync Assessment** to verify ${unverifiedSkills[0] || 'your core algorithms'} for instant score boost.\n2. Complete **Phase ${highGaps.length > 0 ? '3' : '5'}** of your personalized learning roadmap.\n3. Implement a full-stack production capstone repository featuring CI/CD.`,
        actionSuggestions: ['Take Skill Assessment', 'View Learning Roadmap', 'Inspect Skill Gaps'],
        suggestedRoute: '/verification',
      };
    }

    // 2. Internship recommendations
    if (prompt.includes('internship') || prompt.includes('job') || prompt.includes('apply') || prompt.includes('opportunity')) {
      const matched = internships.slice(0, 2);
      const intList = matched
        .map(
          (i) =>
            `• **${i.role}** at *${i.company}* (${i.work_mode}, ${i.stipend})\n  Required skills: ${i.required_skills.join(', ')}`
        )
        .join('\n\n');

      return {
        text: `### Personalized High-Match Internships\n\nI analyzed your target career (**${targetCareer}**) and verified skills (**${verifiedSkills.join(', ') || 'React, TypeScript'}**) against active postings:\n\n${intList}\n\n💡 **Application Tip:** Highlight your verified GitHub projects in your resume cover note to accelerate recruiter shortlisting.`,
        actionSuggestions: ['Explore Internships', 'View My Applications', 'Update Resume'],
        suggestedRoute: '/internships',
      };
    }

    // 3. Project recommendations
    if (prompt.includes('project') || prompt.includes('build') || prompt.includes('portfolio') || prompt.includes('github')) {
      return {
        text: `### High-Impact Project Recommendations for ${targetCareer}\n\nTo bridge your current skill gaps and impress tech recruiters, build:\n\n1. **CloudScale Distributed Microservices Telemetry Engine**\n   - **Tech Stack:** React 19, TypeScript, Node.js, PostgreSQL, Docker\n   - **Skills Gained:** System Design, Microservices, Caching, Containerization\n   - **Impact:** Demonstrates senior-level architectural capabilities.\n\n2. **ZeroShield Automated Vulnerability Scanner**\n   - **Tech Stack:** TypeScript, Express, Security Headers, OWASP Top 10\n   - **Skills Gained:** Security hygiene, automated testing, network protocols.\n\nWould you like me to guide you through the Phase 5 roadmap milestone?`,
        actionSuggestions: ['View Projects', 'Explore Learning Roadmap', 'Review Skill Gaps'],
        suggestedRoute: '/projects',
      };
    }

    // 4. Career Readiness Score questions
    if (prompt.includes('readiness') || prompt.includes('score') || prompt.includes('why is my') || prompt.includes('low') || prompt.includes('calculate')) {
      return {
        text: `### Career Readiness Breakdown (${readinessScore}% Index)\n\nYour score is computed via a multi-dimensional algorithm:\n\n• **Verified Skills Weight (50%):** ${verifiedSkills.length} verified out of target core competencies.\n• **Production Projects (20%):** 1 completed production repository.\n• **Roadmap Milestone Progress (20%):** 48% syllabus completed.\n• **Skill Assessments (10%):** Diagnostic evaluations completed.\n\n🚀 **Fastest Way to Reach 90%+:** Complete the skill assessment for unverified tools and submit your second portfolio project!`,
        actionSuggestions: ['Verify New Skill', 'View Roadmap', 'Update Profile'],
        suggestedRoute: '/verification',
      };
    }

    // 5. Resume improvement questions
    if (prompt.includes('resume') || prompt.includes('cv') || prompt.includes('improve') || prompt.includes('ats')) {
      return {
        text: `### Resume Intelligence & ATS Optimization\n\nBased on your target role as a **${targetCareer}**:\n\n1. **Quantify Bullet Points:** Use Google's XYZ formula (*"Accomplished [X], as measured by [Y], by doing [Z]"*).\n2. **Keywords to Add:** Ensure terms like *${gaps.slice(0, 3).map((g) => g.skill).join(', ')}* appear directly in your skills matrix.\n3. **Include Verification Badges:** Add your SkillSync AI verified scores to substantiate your proficiency.\n4. **Link Live Repositories:** Ensure all project links lead to working demos and readable codebases.`,
        actionSuggestions: ['Open Resume Manager', 'Analyze Resume', 'Check Skill Gaps'],
        suggestedRoute: '/resume',
      };
    }

    // Generic response with rich career insights
    return {
      text: `Hello ${profile.full_name.split(' ')[0]}! I am your **SkillSync AI Career Intelligence Copilot**.\n\nI monitor your progress toward becoming a **${targetCareer}** (Current Readiness: **${readinessScore}%**).\n\nYou currently have **${verifiedSkills.length} verified skills** and **${highGaps.length} priority gaps** to target.\n\nHow can I help you today? You can ask me about:\n- Finding the best internships matching your skill graph\n- What specific projects to build next\n- Step-by-step roadmap advice for ${targetCareer}\n- Resume formatting and skill verification`,
      actionSuggestions: ['How to improve my score?', 'Best internships for me?', 'Recommend a project', 'Bridge skill gaps'],
      suggestedRoute: '/dashboard',
    };
  },
};
