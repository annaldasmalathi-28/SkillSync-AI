import { CareerInfo, SkillGap, SkillLevel, StudentSkill, TargetCareerTitle } from '../types';

export interface RequiredSkillDef {
  skill: string;
  minLevel: SkillLevel;
  category: string;
  importance: number;
  whyItMatters: string;
}

export interface DetailedCareerInfo extends Omit<CareerInfo, 'requiredSkills'> {
  requiredSkills: RequiredSkillDef[];
}

export const TARGET_CAREERS: DetailedCareerInfo[] = [
  {
    title: 'Software Developer',
    description: 'Build enterprise-grade software applications, design system architecture, and write robust, maintainable code.',
    averageSalary: '$118,000 / yr',
    marketDemand: 'Very High',
    growthRate: '+25% (Next 5 Years)',
    overview: 'Core software engineering spanning object-oriented design, algorithms, testing, and modern language paradigms.',
    coreSkills: ['Data Structures & Algorithms', 'TypeScript / JavaScript', 'Python', 'Git & Version Control', 'SQL & Relational DBs', 'System Design Basics'],
    requiredSkills: [
      {
        skill: 'Data Structures & Algorithms',
        minLevel: 'Advanced',
        category: 'Core CS',
        importance: 5,
        whyItMatters: 'Essential for technical coding interviews, computational complexity optimization, and memory-efficient data processing.',
      },
      {
        skill: 'TypeScript / JavaScript',
        minLevel: 'Intermediate',
        category: 'Languages',
        importance: 4,
        whyItMatters: 'Industry standard for modern type-safe application logic, scalable web engines, and asynchronous workflows.',
      },
      {
        skill: 'Python',
        minLevel: 'Intermediate',
        category: 'Languages',
        importance: 4,
        whyItMatters: 'Crucial for automation scripting, backend services, prototyping, and data pipeline manipulation.',
      },
      {
        skill: 'Git & Version Control',
        minLevel: 'Intermediate',
        category: 'Dev Tools',
        importance: 4,
        whyItMatters: 'Fundamental for professional team collaboration, branching strategies, conflict resolution, and code reviews.',
      },
      {
        skill: 'SQL & Relational DBs',
        minLevel: 'Intermediate',
        category: 'Databases',
        importance: 4,
        whyItMatters: 'Required to model normalized relational schemas, write ACID-compliant transactions, and index complex queries.',
      },
      {
        skill: 'Software Testing & CI/CD',
        minLevel: 'Intermediate',
        category: 'Engineering',
        importance: 3,
        whyItMatters: 'Prevents regressions with unit and integration tests while automating quality gates across deployment pipelines.',
      },
      {
        skill: 'Object-Oriented Design',
        minLevel: 'Advanced',
        category: 'Core CS',
        importance: 5,
        whyItMatters: 'Enables decoupled, modular, and maintainable software architecture using proven design patterns.',
      },
      {
        skill: 'System Design Basics',
        minLevel: 'Intermediate',
        category: 'Architecture',
        importance: 4,
        whyItMatters: 'Demonstrates ability to architect scalable distributed systems, caching layers, and load-balanced microservices.',
      },
    ],
  },
  {
    title: 'Full Stack Developer',
    description: 'Master end-to-end web engineering, from modern responsive UIs to scalable REST/GraphQL APIs and microservices.',
    averageSalary: '$124,000 / yr',
    marketDemand: 'Very High',
    growthRate: '+27% (Next 5 Years)',
    overview: 'Seamless frontend client architecture paired with rock-solid server-side APIs, database management, and cloud deployment.',
    coreSkills: ['React / Next.js', 'Node.js & Express', 'TypeScript', 'PostgreSQL / Supabase', 'REST & GraphQL APIs', 'Docker & Containerization'],
    requiredSkills: [
      {
        skill: 'React / Next.js',
        minLevel: 'Advanced',
        category: 'Frontend',
        importance: 5,
        whyItMatters: 'Core modern UI framework for server-side rendering, component-driven development, and dynamic SPAs.',
      },
      {
        skill: 'Node.js & Express',
        minLevel: 'Advanced',
        category: 'Backend',
        importance: 5,
        whyItMatters: 'Powers asynchronous runtime backend servers, API routers, middleware auth layers, and background workers.',
      },
      {
        skill: 'TypeScript',
        minLevel: 'Intermediate',
        category: 'Languages',
        importance: 4,
        whyItMatters: 'Eliminates whole classes of runtime bugs through static typing across both client and server codebases.',
      },
      {
        skill: 'PostgreSQL / Supabase',
        minLevel: 'Intermediate',
        category: 'Databases',
        importance: 4,
        whyItMatters: 'Standard relational storage with support for real-time streaming, JSON operators, and row-level security (RLS).',
      },
      {
        skill: 'Tailwind CSS',
        minLevel: 'Intermediate',
        category: 'Frontend',
        importance: 3,
        whyItMatters: 'Accelerates rapid responsive UI development and maintains design consistency without bloated CSS stylesheets.',
      },
      {
        skill: 'REST & GraphQL APIs',
        minLevel: 'Advanced',
        category: 'Backend',
        importance: 4,
        whyItMatters: 'Crucial for designing clean contracts between microservices, clients, and third-party SaaS integrations.',
      },
      {
        skill: 'Docker & Containerization',
        minLevel: 'Intermediate',
        category: 'DevOps',
        importance: 3,
        whyItMatters: 'Ensures reproducible builds across local development and production cloud environments.',
      },
      {
        skill: 'State Management & Auth',
        minLevel: 'Intermediate',
        category: 'Fullstack',
        importance: 4,
        whyItMatters: 'Guards protected endpoints with JWT/OAuth session tokens and orchestrates complex frontend state.',
      },
    ],
  },
  {
    title: 'Data Analyst',
    description: 'Transform raw enterprise telemetry and business metrics into actionable visual dashboards and data models.',
    averageSalary: '$92,000 / yr',
    marketDemand: 'High',
    growthRate: '+23% (Next 5 Years)',
    overview: 'Deep exploratory analysis, statistical modeling, SQL query optimization, and executive reporting.',
    coreSkills: ['SQL Query Optimization', 'Python (Pandas, NumPy)', 'Data Visualization (PowerBI/Tableau)', 'Statistical Analysis'],
    requiredSkills: [
      {
        skill: 'SQL Query Optimization',
        minLevel: 'Advanced',
        category: 'Databases',
        importance: 5,
        whyItMatters: 'Allows fast querying of massive multi-million row datasets with window functions, CTEs, and query plan tuning.',
      },
      {
        skill: 'Python (Pandas, NumPy)',
        minLevel: 'Intermediate',
        category: 'Analytics',
        importance: 5,
        whyItMatters: 'Essential for data munging, matrix computations, time-series aggregations, and automated transformations.',
      },
      {
        skill: 'Data Visualization (PowerBI/Tableau)',
        minLevel: 'Advanced',
        category: 'BI Tools',
        importance: 4,
        whyItMatters: 'Translates raw figures into clear visual dashboards that enable executive stakeholders to make data-driven decisions.',
      },
      {
        skill: 'Statistical Analysis',
        minLevel: 'Intermediate',
        category: 'Math/Stats',
        importance: 4,
        whyItMatters: 'Provides statistical rigor for hypothesis testing, A/B experiment evaluation, and trend regression analysis.',
      },
      {
        skill: 'Excel & Advanced Modeling',
        minLevel: 'Advanced',
        category: 'Business',
        importance: 3,
        whyItMatters: 'Ubiquitous for rapid ad-hoc scenario modeling, financial forecasts, and business cross-tabs.',
      },
      {
        skill: 'Data Cleaning & ETL',
        minLevel: 'Intermediate',
        category: 'Data Eng',
        importance: 4,
        whyItMatters: 'Ensures high data integrity by sanitizing null values, removing duplicates, and normalizing ingestion feeds.',
      },
    ],
  },
  {
    title: 'Data Scientist',
    description: 'Develop predictive models, advanced statistical experiments, and deep algorithmic feature pipelines.',
    averageSalary: '$135,000 / yr',
    marketDemand: 'Very High',
    growthRate: '+31% (Next 5 Years)',
    overview: 'Mathematical and scientific formulation to unearth deep patterns from massive unstructured datasets.',
    coreSkills: ['Python & Scikit-Learn', 'Probability & Statistics', 'Machine Learning Algorithms', 'SQL & BigQuery', 'Deep Learning (PyTorch/TF)'],
    requiredSkills: [
      {
        skill: 'Python & Scikit-Learn',
        minLevel: 'Advanced',
        category: 'Data Science',
        importance: 5,
        whyItMatters: 'The primary environment for statistical modeling, cross-validation, and productionizing predictive estimators.',
      },
      {
        skill: 'Probability & Statistics',
        minLevel: 'Advanced',
        category: 'Math/Stats',
        importance: 5,
        whyItMatters: 'The theoretical foundation for Bayesian inference, distribution modeling, and confidence interval estimation.',
      },
      {
        skill: 'Machine Learning Algorithms',
        minLevel: 'Advanced',
        category: 'AI/ML',
        importance: 5,
        whyItMatters: 'Enables model selection across random forests, XGBoost, clustering, and ensemble architectures.',
      },
      {
        skill: 'SQL & BigQuery',
        minLevel: 'Intermediate',
        category: 'Databases',
        importance: 4,
        whyItMatters: 'Queries petabyte-scale cloud data warehouses to engineer rich training feature sets.',
      },
      {
        skill: 'Feature Engineering',
        minLevel: 'Advanced',
        category: 'Data Science',
        importance: 4,
        whyItMatters: 'Directly impacts predictive accuracy by creating domain-specific signals and scaling variables.',
      },
      {
        skill: 'Deep Learning (PyTorch/TF)',
        minLevel: 'Intermediate',
        category: 'AI/ML',
        importance: 4,
        whyItMatters: 'Essential for tackling high-dimensional data including computer vision, speech, and embeddings.',
      },
    ],
  },
  {
    title: 'AI/ML Engineer',
    description: 'Deploy, fine-tune, and optimize large language models, neural networks, and scalable AI inference pipelines.',
    averageSalary: '$148,000 / yr',
    marketDemand: 'Very High',
    growthRate: '+40% (Next 5 Years)',
    overview: 'Productionizing cutting-edge AI, transformer models, embeddings, vector databases, and high-throughput GPU inference.',
    coreSkills: ['PyTorch / TensorFlow', 'Python', 'LLM Fine-Tuning & Prompt Eng', 'Vector Databases (Pinecone/Milvus)', 'MLOps & Model Serving'],
    requiredSkills: [
      {
        skill: 'PyTorch / TensorFlow',
        minLevel: 'Advanced',
        category: 'Deep Learning',
        importance: 5,
        whyItMatters: 'Standard framework for training custom neural network topologies, attention layers, and autograd graphs.',
      },
      {
        skill: 'Python',
        minLevel: 'Advanced',
        category: 'Languages',
        importance: 5,
        whyItMatters: 'The foundational language for GPU-accelerated computing, AI libraries, and inference microservices.',
      },
      {
        skill: 'LLM Fine-Tuning & Prompt Eng',
        minLevel: 'Intermediate',
        category: 'Generative AI',
        importance: 5,
        whyItMatters: 'Adapts base foundation models using LoRA/QLoRA and constructs reliable prompt pipelines with structured outputs.',
      },
      {
        skill: 'Vector Databases (Pinecone/Milvus)',
        minLevel: 'Intermediate',
        category: 'AI Infra',
        importance: 4,
        whyItMatters: 'Powers retrieval-augmented generation (RAG) by conducting sub-second cosine similarity searches across millions of embeddings.',
      },
      {
        skill: 'MLOps & Model Serving',
        minLevel: 'Intermediate',
        category: 'MLOps',
        importance: 4,
        whyItMatters: 'Deploys models to production with vLLM/Triton, autoscaling GPU nodes, latency monitoring, and drift detection.',
      },
      {
        skill: 'Math (Linear Algebra & Calculus)',
        minLevel: 'Advanced',
        category: 'Math/Stats',
        importance: 4,
        whyItMatters: 'Required to grasp backpropagation gradients, matrix transformations, and loss function convergence.',
      },
      {
        skill: 'Data Structures & Algorithms',
        minLevel: 'Intermediate',
        category: 'Core CS',
        importance: 3,
        whyItMatters: 'Optimizes tensor batching algorithms, graph traversals, and high-throughput data pipelines.',
      },
    ],
  },
  {
    title: 'Cybersecurity Analyst',
    description: 'Guard network perimeters, execute vulnerability assessments, detect threats, and secure enterprise infrastructure.',
    averageSalary: '$112,000 / yr',
    marketDemand: 'Very High',
    growthRate: '+33% (Next 5 Years)',
    overview: 'Threat intelligence, SIEM monitoring, pen testing, encryption protocols, and zero-trust identity architectures.',
    coreSkills: ['Network Security & Protocols', 'Threat Detection & SIEM', 'Vulnerability Assessment & PenTest', 'Linux System Administration'],
    requiredSkills: [
      {
        skill: 'Network Security & Protocols',
        minLevel: 'Advanced',
        category: 'Networking',
        importance: 5,
        whyItMatters: 'Enables packet inspection, firewall configuration, DNS security, and defense against MITM attacks.',
      },
      {
        skill: 'Threat Detection & SIEM',
        minLevel: 'Intermediate',
        category: 'SecOps',
        importance: 5,
        whyItMatters: 'Monitors real-time logs with Splunk/Wazuh to identify anomaly indicators of compromise (IoCs) and triage incidents.',
      },
      {
        skill: 'Vulnerability Assessment & PenTest',
        minLevel: 'Intermediate',
        category: 'Offensive Sec',
        importance: 4,
        whyItMatters: 'Proactively identifies zero-day flaws, SQL injections, and auth bypass vulnerabilities before adversaries exploit them.',
      },
      {
        skill: 'Linux System Administration',
        minLevel: 'Intermediate',
        category: 'Systems',
        importance: 4,
        whyItMatters: 'Critical for hardening server operating systems, auditing permissions, and forensic log examination.',
      },
      {
        skill: 'Cryptography & Identity Management',
        minLevel: 'Intermediate',
        category: 'Crypto',
        importance: 4,
        whyItMatters: 'Implements PKI certificates, asymmetric hashing, TLS handshakes, and SAML/OAuth zero-trust access control.',
      },
      {
        skill: 'Python / Bash Scripting',
        minLevel: 'Intermediate',
        category: 'Scripting',
        importance: 3,
        whyItMatters: 'Automates security workflows, incident response scripts, and threat hunting telemetry extraction.',
      },
    ],
  },
  {
    title: 'Cloud Engineer',
    description: 'Design and provision multi-region cloud infrastructures across AWS, Google Cloud, and Azure with high availability.',
    averageSalary: '$130,000 / yr',
    marketDemand: 'Very High',
    growthRate: '+28% (Next 5 Years)',
    overview: 'Infrastructure as code, serverless cloud topologies, resilient VPC networking, and cloud cost governance.',
    coreSkills: ['AWS / Google Cloud Platform', 'Terraform & IaC', 'Docker & Kubernetes', 'Cloud Networking & VPCs'],
    requiredSkills: [
      {
        skill: 'AWS / Google Cloud Platform',
        minLevel: 'Advanced',
        category: 'Cloud',
        importance: 5,
        whyItMatters: 'Core cloud platforms for provisioning compute instances, managed databases, IAM policies, and cloud storage.',
      },
      {
        skill: 'Terraform & IaC',
        minLevel: 'Intermediate',
        category: 'DevOps',
        importance: 5,
        whyItMatters: 'Automates cloud resource provisioning declaratively with state management and disaster recovery parity.',
      },
      {
        skill: 'Docker & Kubernetes',
        minLevel: 'Intermediate',
        category: 'Containers',
        importance: 4,
        whyItMatters: 'Orchestrates containerized microservices with auto-healing pods, ingress controllers, and rolling updates.',
      },
      {
        skill: 'Cloud Networking & VPCs',
        minLevel: 'Intermediate',
        category: 'Networking',
        importance: 4,
        whyItMatters: 'Configures subnets, route tables, NAT gateways, and secure private peering connections across availability zones.',
      },
      {
        skill: 'Linux & Shell Scripting',
        minLevel: 'Intermediate',
        category: 'Systems',
        importance: 4,
        whyItMatters: 'Standard interface for cloud node administration, systemd service management, and cron automation.',
      },
      {
        skill: 'Cloud Security & IAM',
        minLevel: 'Intermediate',
        category: 'Security',
        importance: 4,
        whyItMatters: 'Enforces the principle of least privilege, service account roles, and KMS secret encryption at rest and in transit.',
      },
    ],
  },
  {
    title: 'DevOps Engineer',
    description: 'Accelerate release velocity with robust automated CI/CD pipelines, Kubernetes orchestration, and site reliability.',
    averageSalary: '$138,000 / yr',
    marketDemand: 'Very High',
    growthRate: '+29% (Next 5 Years)',
    overview: 'Bridging development and cloud operations through automated testing, GitOps, and real-time observability.',
    coreSkills: ['Kubernetes & Helm', 'Docker & Microservices', 'CI/CD (GitHub Actions, GitLab)', 'Linux Administration'],
    requiredSkills: [
      {
        skill: 'Kubernetes & Helm',
        minLevel: 'Advanced',
        category: 'Containers',
        importance: 5,
        whyItMatters: 'Packages and manages complex multi-container distributed applications with dynamic cluster scaling.',
      },
      {
        skill: 'Docker & Microservices',
        minLevel: 'Advanced',
        category: 'Containers',
        importance: 5,
        whyItMatters: 'Creates minimal multi-stage image builds, manages container networking, and isolates service dependencies.',
      },
      {
        skill: 'CI/CD (GitHub Actions, GitLab)',
        minLevel: 'Advanced',
        category: 'Automation',
        importance: 5,
        whyItMatters: 'Automates linting, test suites, vulnerability scans, and blue/green production rollouts without downtime.',
      },
      {
        skill: 'Linux Administration',
        minLevel: 'Advanced',
        category: 'Systems',
        importance: 4,
        whyItMatters: 'Troubleshoots kernel I/O bottlenecks, network sockets, memory limits, and cgroups in high-load environments.',
      },
      {
        skill: 'Prometheus & Grafana Observability',
        minLevel: 'Intermediate',
        category: 'Monitoring',
        importance: 4,
        whyItMatters: 'Provides real-time dashboards for latency, error rates, request saturation, and automated alerting thresholds.',
      },
      {
        skill: 'Terraform / Ansible',
        minLevel: 'Intermediate',
        category: 'IaC',
        importance: 4,
        whyItMatters: 'Maintains consistent infrastructure configurations across multi-cloud environments.',
      },
    ],
  },
  {
    title: 'Mobile App Developer',
    description: 'Craft fluid, native-performance iOS and Android mobile experiences using React Native, Flutter, Swift, or Kotlin.',
    averageSalary: '$120,000 / yr',
    marketDemand: 'High',
    growthRate: '+24% (Next 5 Years)',
    overview: 'Client-side performance, mobile offline synchronization, device sensors, and app store deployment lifecycles.',
    coreSkills: ['React Native / Flutter', 'TypeScript / Dart', 'Mobile UI/UX & Responsive Layouts', 'State Management & Offline Storage'],
    requiredSkills: [
      {
        skill: 'React Native / Flutter',
        minLevel: 'Advanced',
        category: 'Mobile',
        importance: 5,
        whyItMatters: 'Cross-platform mobile frameworks delivering 60fps native performance from a single shared codebase.',
      },
      {
        skill: 'TypeScript / Dart',
        minLevel: 'Advanced',
        category: 'Languages',
        importance: 5,
        whyItMatters: 'Core typed languages powering mobile component lifecycles, memory safety, and compile-time verification.',
      },
      {
        skill: 'Mobile UI/UX & Responsive Layouts',
        minLevel: 'Intermediate',
        category: 'Design',
        importance: 4,
        whyItMatters: 'Ensures intuitive gesture handling, accessible typography, dark mode support, and adaptive notch screen layouts.',
      },
      {
        skill: 'State Management & Offline Storage',
        minLevel: 'Intermediate',
        category: 'Mobile',
        importance: 4,
        whyItMatters: 'Allows smooth offline-first usage with SQLite/WatermelonDB and conflict-free background data synchronization.',
      },
      {
        skill: 'REST APIs & Push Notifications',
        minLevel: 'Intermediate',
        category: 'Mobile',
        importance: 4,
        whyItMatters: 'Connects mobile apps to backend services and handles FCM/APNs background push notifications.',
      },
      {
        skill: 'App Store & Play Store CI/CD',
        minLevel: 'Intermediate',
        category: 'Release',
        importance: 3,
        whyItMatters: 'Automates provisioning profiles, app signing certificates, TestFlight builds, and Fastlane submission tracks.',
      },
    ],
  },
];

const LEVEL_WEIGHTS: Record<SkillLevel | 'Not Started', number> = {
  'Not Started': 0,
  'Beginner': 35,
  'Intermediate': 70,
  'Advanced': 100,
};

export function calculateSkillGaps(
  targetCareer: TargetCareerTitle,
  studentSkills: StudentSkill[]
): SkillGap[] {
  const career = TARGET_CAREERS.find((c) => c.title === targetCareer) || TARGET_CAREERS[0];
  
  return career.requiredSkills.map((req, idx) => {
    // Look for matching skill name (case insensitive or substring)
    const match = studentSkills.find(
      (s) => s.skill_name.toLowerCase().trim().includes(req.skill.toLowerCase().trim()) || 
             req.skill.toLowerCase().trim().includes(s.skill_name.toLowerCase().trim())
    );

    const currentLevel: SkillLevel | 'Not Started' = match ? match.level : 'Not Started';
    const isVerified = match ? match.verified : false;
    
    let currentScore = LEVEL_WEIGHTS[currentLevel];
    if (isVerified) currentScore = Math.min(100, currentScore + 10);
    
    const requiredScore = LEVEL_WEIGHTS[req.minLevel];
    const diff = requiredScore - currentScore;

    let gapPct = Math.max(0, Math.round((diff / requiredScore) * 100));
    if (diff <= 0) gapPct = 0;

    let priority: SkillGap['priority'] = 'Strong';
    if (gapPct > 45) {
      priority = 'High Priority Gap';
    } else if (gapPct > 0) {
      priority = 'Moderate Gap';
    }

    let recommendedAction = `Maintain mastery with production project implementations and verify your score.`;
    if (priority === 'High Priority Gap') {
      recommendedAction = `Take the interactive SkillSync verification assessment and complete the foundational roadmap module for ${req.skill}.`;
    } else if (priority === 'Moderate Gap') {
      recommendedAction = `Upgrade to ${req.minLevel} level by building an end-to-end milestone feature and passing verification.`;
    }

    return {
      id: `gap-${idx}-${req.skill.replace(/\s+/g, '-').toLowerCase()}`,
      target_career: targetCareer,
      target_role: targetCareer,
      skill: req.skill,
      skill_name: req.skill,
      current_level: currentLevel,
      required_level: req.minLevel,
      gap_percentage: gapPct,
      priority,
      recommended_action: recommendedAction,
      why_it_matters: req.whyItMatters,
    };
  });
}

export function calculateReadinessScore(
  targetCareer: TargetCareerTitle,
  studentSkills: StudentSkill[],
  projectsOrCount: number | any[] = 0,
  roadmapOrPct: number | any[] = 0,
  assessmentsCount: number = 0
): number {
  if (studentSkills.length === 0 && (!projectsOrCount || projectsOrCount === 0) && (!roadmapOrPct || roadmapOrPct === 0) && assessmentsCount === 0) {
    return 0;
  }
  const gaps = calculateSkillGaps(targetCareer, studentSkills);
  if (gaps.length === 0) return 0;

  // Skills component (50% weight)
  const totalSkillsWeight = gaps.reduce((acc, curr) => {
    const completeness = 100 - curr.gap_percentage;
    return acc + completeness;
  }, 0);
  const skillsScore = totalSkillsWeight / gaps.length;

  // Verified boost
  const verifiedCount = studentSkills.filter((s) => s.verified).length;
  const verifiedBoost = Math.min(15, verifiedCount * 3);

  // Projects component (20% weight)
  const projectsCount = Array.isArray(projectsOrCount)
    ? projectsOrCount.filter((p: any) => p.completed || p.status === 'Completed').length
    : projectsOrCount;
  const projectsScore = Math.min(100, projectsCount * 25);

  // Roadmap component (20% weight)
  let roadmapPct = 0;
  if (Array.isArray(roadmapOrPct)) {
    const completed = roadmapOrPct.filter((r: any) => r.completed).length;
    roadmapPct = roadmapOrPct.length > 0 ? (completed / roadmapOrPct.length) * 100 : 0;
  } else {
    roadmapPct = roadmapOrPct;
  }
  const roadmapScore = Math.min(100, roadmapPct);

  // Assessment component (10% weight)
  const assessScore = Math.min(100, assessmentsCount * 20);

  const rawScore = (skillsScore * 0.50) + (projectsScore * 0.20) + (roadmapScore * 0.20) + (assessScore * 0.10) + verifiedBoost;
  return Math.min(98, Math.max(0, Math.round(rawScore)));
}

export interface DetailedInternshipMatch {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  verifiedMatchedSkills: string[];
  whyItMatches: string;
  careerAlignment: 'Direct Career Track' | 'High Technical Overlap' | 'Adjacent Tech Stack';
}

export function calculateDetailedInternshipMatch(
  internshipSkills: string[],
  studentSkills: StudentSkill[],
  targetCareer?: string,
  internshipRole?: string,
  internshipTargetCareers?: string[]
): DetailedInternshipMatch {
  if (!internshipSkills || internshipSkills.length === 0) {
    return {
      matchScore: 80,
      matchedSkills: [],
      missingSkills: [],
      verifiedMatchedSkills: [],
      whyItMatches: 'This role offers broad technical exposure applicable across engineering tracks.',
      careerAlignment: 'Adjacent Tech Stack',
    };
  }

  const matchedSkills: string[] = [];
  const verifiedMatchedSkills: string[] = [];
  const missingSkills: string[] = [];
  let matchPoints = 0;

  internshipSkills.forEach((reqSkill) => {
    const cleanReq = reqSkill.toLowerCase().trim();
    const match = studentSkills.find((s) => {
      const cleanStudent = s.skill_name.toLowerCase().trim();
      return (
        cleanStudent.includes(cleanReq) ||
        cleanReq.includes(cleanStudent) ||
        (cleanReq.includes('react') && cleanStudent.includes('react')) ||
        (cleanReq.includes('python') && cleanStudent.includes('python')) ||
        (cleanReq.includes('sql') && cleanStudent.includes('sql')) ||
        (cleanReq.includes('node') && cleanStudent.includes('node')) ||
        (cleanReq.includes('docker') && cleanStudent.includes('docker')) ||
        (cleanReq.includes('aws') && cleanStudent.includes('aws')) ||
        (cleanReq.includes('pytorch') && cleanStudent.includes('pytorch')) ||
        (cleanReq.includes('machine learning') && cleanStudent.includes('ml'))
      );
    });

    if (match) {
      matchedSkills.push(reqSkill);
      if (match.verified) {
        verifiedMatchedSkills.push(reqSkill);
        matchPoints += 1.0;
      } else if (match.level === 'Advanced') {
        matchPoints += 0.85;
      } else if (match.level === 'Intermediate') {
        matchPoints += 0.70;
      } else {
        matchPoints += 0.50;
      }
    } else {
      missingSkills.push(reqSkill);
    }
  });

  // Target Career Alignment Check
  let careerBonus = 0;
  let isDirectCareerMatch = false;

  if (targetCareer) {
    const normTarget = targetCareer.toLowerCase();
    const normRole = (internshipRole || '').toLowerCase();
    const roleTargets = (internshipTargetCareers || []).map((t) => t.toLowerCase());

    if (
      normRole.includes(normTarget) ||
      normTarget.includes(normRole) ||
      roleTargets.includes(normTarget)
    ) {
      isDirectCareerMatch = true;
      careerBonus = 12;
    } else {
      // Check if target career matrix shares skills
      const careerDef = TARGET_CAREERS.find((tc) => tc.title.toLowerCase() === normTarget);
      if (careerDef) {
        const sharedSkillsCount = careerDef.coreSkills.filter((cs) =>
          internshipSkills.some((is) => is.toLowerCase().includes(cs.toLowerCase()) || cs.toLowerCase().includes(is.toLowerCase()))
        ).length;
        if (sharedSkillsCount >= 2) {
          careerBonus = 8;
        }
      }
    }
  }

  const baseRatio = matchPoints / internshipSkills.length;
  const rawPct = Math.round(baseRatio * 85 + careerBonus);
  const finalScore = Math.min(98, Math.max(35, rawPct));

  // Determine alignment classification
  let careerAlignment: 'Direct Career Track' | 'High Technical Overlap' | 'Adjacent Tech Stack' =
    'Adjacent Tech Stack';
  if (isDirectCareerMatch || finalScore >= 80) {
    careerAlignment = 'Direct Career Track';
  } else if (matchedSkills.length >= 2 || finalScore >= 65) {
    careerAlignment = 'High Technical Overlap';
  }

  // Generate "Why this internship matches you" explanation
  let whyItMatches = '';
  if (matchedSkills.length > 0) {
    const verifiedPart =
      verifiedMatchedSkills.length > 0
        ? `verified mastery in ${verifiedMatchedSkills.slice(0, 2).join(' & ')}`
        : `familiarity with ${matchedSkills.slice(0, 2).join(' & ')}`;

    if (isDirectCareerMatch && targetCareer) {
      whyItMatches = `Directly aligns with your target career track (${targetCareer}) and leverages your ${verifiedPart}.`;
    } else if (matchedSkills.length === internshipSkills.length) {
      whyItMatches = `Complete 100% skill parity with your profile including ${verifiedPart}.`;
    } else {
      whyItMatches = `Strong technical overlap based on your ${verifiedPart}. Focusing on ${missingSkills.slice(0, 2).join(' & ')} will maximize your interview readiness.`;
    }
  } else {
    if (isDirectCareerMatch && targetCareer) {
      whyItMatches = `Matches your target career goal of becoming a ${targetCareer}. Excellent growth opportunity to build hands-on experience in ${internshipSkills.slice(0, 2).join(' and ')}.`;
    } else {
      whyItMatches = `Great exploratory opportunity to expand your portfolio into ${internshipSkills.slice(0, 2).join(', ')}.`;
    }
  }

  return {
    matchScore: finalScore,
    matchedSkills,
    missingSkills,
    verifiedMatchedSkills,
    whyItMatches,
    careerAlignment,
  };
}

export function calculateInternshipMatch(
  internshipSkills: string[],
  studentSkills: StudentSkill[],
  targetCareer?: string,
  internshipRole?: string,
  internshipTargetCareers?: string[]
): DetailedInternshipMatch {
  return calculateDetailedInternshipMatch(
    internshipSkills,
    studentSkills,
    targetCareer,
    internshipRole,
    internshipTargetCareers
  );
}
