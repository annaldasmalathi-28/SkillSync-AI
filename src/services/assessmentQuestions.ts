import { AssessmentQuestion, SkillLevel } from '../types';

export const SKILL_ASSESSMENTS: Record<string, AssessmentQuestion[]> = {
  'React / Next.js': [
    {
      id: 1,
      question: 'What is the primary benefit of the React Virtual DOM diffing algorithm (Reconciliation)?',
      options: [
        'It parses and executes JavaScript directly inside the GPU',
        'It computes minimal batches of real DOM mutations by comparing fiber subtrees, minimizing browser repaints',
        'It prevents components from ever re-rendering when state changes',
        'It converts React components into pure WebAssembly binaries',
      ],
      correctIndex: 1,
      explanation: 'Reconciliation creates a virtual representation of the UI in memory and batches updates to only touch dirty nodes in the real DOM.',
      topic: 'Reconciliation & Virtual DOM',
    },
    {
      id: 2,
      question: 'When using useEffect with an empty dependency array [], when will the effect run?',
      options: [
        'On every render cycle of the component',
        'Only when the parent component updates',
        'Once when the component mounts, and its cleanup function runs when the component unmounts',
        'Only if the window triggers an asynchronous resize event',
      ],
      correctIndex: 2,
      explanation: 'An empty dependency array [] indicates the effect does not depend on any reactive values from props or state, running once on mount.',
      topic: 'React Hooks Lifecycle',
    },
    {
      id: 3,
      question: 'What is the primary purpose of React.useMemo()?',
      options: [
        'To memoize expensive calculation results between renders unless dependencies change',
        'To persist component state into localStorage automatically',
        'To create an asynchronous worker thread in the background',
        'To automatically bind class methods to the component instance',
      ],
      correctIndex: 0,
      explanation: 'useMemo caches the result of a calculation between re-renders to avoid repeating heavy computations when dependencies are unchanged.',
      topic: 'Performance Optimization',
    },
    {
      id: 4,
      question: 'In React 18 / 19 Server Components (RSC), what is a key architectural advantage?',
      options: [
        'Server components must always include client state using useState and useEffect',
        'Server components render on the server and send zero client-side JavaScript bundle footprint for static dependencies',
        'They can only be styled using vanilla CSS-in-JS style tags',
        'They execute only inside service workers on mobile devices',
      ],
      correctIndex: 1,
      explanation: 'RSC allows developers to execute data fetching directly on the server without shipping heavy libraries or JS runtimes to the browser.',
      topic: 'Server Components & Architecture',
    },
    {
      id: 5,
      question: 'Why should keys in React lists be stable, unique identifiers rather than array indices?',
      options: [
        'Array indices crash the JavaScript runtime engine in strict mode',
        'Using array indices can cause incorrect state persistence and animation bugs when items are reordered, inserted, or deleted',
        'Keys are required by CSS grid layout engines for positioning',
        'Array indices cannot be converted into strings',
      ],
      correctIndex: 1,
      explanation: 'Using indices as keys breaks item identity during reordering or splicing, leading to corrupted component state and inefficient DOM updates.',
      topic: 'List Reconciliation',
    },
  ],
  'TypeScript': [
    {
      id: 1,
      question: 'What is the key difference between TypeScript "interface" and "type" alias for object shapes?',
      options: [
        'Interfaces can be merged via declaration merging, while type aliases cannot be redeclared',
        'Types can only define primitives and cannot represent objects',
        'Interfaces are evaluated at runtime, whereas types are stripped',
        'There are zero technical differences in any scenario',
      ],
      correctIndex: 0,
      explanation: 'Interfaces in TypeScript support declaration merging across files, which is essential for library extensibility, whereas type aliases cannot be duplicated in the same scope.',
      topic: 'Type System Fundamentals',
    },
    {
      id: 2,
      question: 'What does the TypeScript "unknown" type represent compared to "any"?',
      options: [
        'unknown is a type-safe counterpart to any; operations on unknown require explicit type narrowing before usage',
        'unknown disables all compiler type checks completely',
        'unknown is synonymous with null and undefined only',
        'unknown is deprecated in modern TypeScript versions',
      ],
      correctIndex: 0,
      explanation: 'unknown forces the developer to verify the type with typeof, instanceof, or custom type guards before invoking methods or properties on it.',
      topic: 'Type Safety & Narrowing',
    },
    {
      id: 3,
      question: 'Which utility type constructs a type with all properties of Type set to optional?',
      options: ['Required<T>', 'Partial<T>', 'Readonly<T>', 'Omit<T, K>'],
      correctIndex: 1,
      explanation: 'Partial<T> transforms all keys of an interface or object type into optional properties.',
      topic: 'Utility Types',
    },
    {
      id: 4,
      question: 'What is a Discriminated Union in TypeScript?',
      options: [
        'A union of object types that share a common literal property used for exhaustive pattern matching',
        'A database SQL join statement compiled into TypeScript types',
        'A generic function that accepts multiple arguments without types',
        'A special TypeScript syntax for declaring multithreaded workers',
      ],
      correctIndex: 0,
      explanation: 'A discriminated union uses a common literal field (like type: "success" | "error") to allow TypeScript to narrow down the union automatically in switch/if branches.',
      topic: 'Advanced Type Patterns',
    },
  ],
  'Python': [
    {
      id: 1,
      question: 'What is a Python Generator, and how does it save memory?',
      options: [
        'A generator compiles Python into C binary code ahead of time',
        'A function using "yield" that produces items lazily on demand rather than storing the entire collection in memory',
        'A multithreading process manager in the standard library',
        'A class decorator that enforces strict typing on runtime attributes',
      ],
      correctIndex: 1,
      explanation: 'Generators return an iterator that yields one value at a time with yield, allowing processing of large datasets without exhausting RAM.',
      topic: 'Iterators & Generators',
    },
    {
      id: 2,
      question: 'What is the Global Interpreter Lock (GIL) in standard CPython?',
      options: [
        'A lock that prevents unauthorized network requests across sockets',
        'A mutex that allows only one native thread to hold the control of the Python interpreter at any one time',
        'A security feature that encrypts Python source code files',
        'A file locking mechanism for SQLite databases in Python',
      ],
      correctIndex: 1,
      explanation: 'CPython uses the GIL to manage memory safely, meaning CPU-bound tasks in multithreaded Python scripts do not run in parallel on multiple cores unless using multiprocessing.',
      topic: 'Concurrency & CPython Internals',
    },
    {
      id: 3,
      question: 'What is the time complexity of looking up a key in a Python dict on average?',
      options: ['O(n)', 'O(log n)', 'O(1)', 'O(n^2)'],
      correctIndex: 2,
      explanation: 'Python dictionaries are implemented as hash tables with efficient hash computation and collision resolution, providing O(1) average lookup time.',
      topic: 'Data Structures & Complexity',
    },
  ],
  'Data Structures & Algorithms': [
    {
      id: 1,
      question: 'Which algorithmic paradigm does Binary Search belong to, and what is its time complexity?',
      options: [
        'Divide and Conquer, O(log n)',
        'Greedy Algorithm, O(n log n)',
        'Dynamic Programming, O(n)',
        'Backtracking, O(2^n)',
      ],
      correctIndex: 0,
      explanation: 'Binary Search repeatedly divides the sorted search space in half, yielding O(log n) logarithmic time complexity.',
      topic: 'Searching Algorithms',
    },
    {
      id: 2,
      question: 'What is the space and time complexity for finding the shortest path in an unweighted graph using BFS?',
      options: [
        'Time: O(V + E), Space: O(V)',
        'Time: O(V * E), Space: O(1)',
        'Time: O(V^2), Space: O(V^2)',
        'Time: O(log V), Space: O(E)',
      ],
      correctIndex: 0,
      explanation: 'Breadth-First Search traverses vertices and edges linearly, requiring a queue and visited set bounded by the number of vertices.',
      topic: 'Graph Algorithms',
    },
    {
      id: 3,
      question: 'When is a Red-Black Tree or AVL Tree preferred over a standard Binary Search Tree (BST)?',
      options: [
        'When you want to guarantee O(log n) worst-case lookup by keeping the tree self-balanced and preventing degradation to O(n)',
        'When only numeric floating point numbers are being stored',
        'When memory is extremely constrained and no pointers are allowed',
        'When you want O(1) constant time insertion in all scenarios',
      ],
      correctIndex: 0,
      explanation: 'Self-balancing trees prevent degenerate linked-list shapes from unbalanced insertions, ensuring guaranteed logarithmic operations.',
      topic: 'Balanced Trees',
    },
  ],
  'SQL & Relational DBs': [
    {
      id: 1,
      question: 'What are the four ACID properties in relational database transactions?',
      options: [
        'Atomicity, Consistency, Isolation, Durability',
        'Availability, Concurrency, Integrity, Distribution',
        'Authentication, Compression, Indexing, Decoupling',
        'Aggregation, Clustering, Iteration, Deletion',
      ],
      correctIndex: 0,
      explanation: 'ACID guarantees that database transactions are processed reliably even in the event of hardware failures or concurrent conflicts.',
      topic: 'Transactions & ACID',
    },
    {
      id: 2,
      question: 'What is the primary difference between an INNER JOIN and a LEFT OUTER JOIN?',
      options: [
        'INNER JOIN returns only matching rows from both tables; LEFT JOIN returns all rows from the left table and matched rows from the right table (or NULLs)',
        'INNER JOIN modifies the table schema; LEFT JOIN is read-only',
        'INNER JOIN is only for primary keys, while LEFT JOIN is only for foreign keys',
        'There is no performance or functional difference in SQL standards',
      ],
      correctIndex: 0,
      explanation: 'A LEFT JOIN guarantees every row from the left table is represented in the output, substituting NULL when right table matches are absent.',
      topic: 'Relational Joins',
    },
    {
      id: 3,
      question: 'Why does adding a B-Tree index accelerate SELECT queries on filtered columns while adding slight overhead to INSERTs?',
      options: [
        'B-Trees allow O(log n) binary search lookups, but every INSERT/UPDATE must maintain the balanced tree structure on disk',
        'Indices compress the entire table into RAM',
        'Indices remove the need for table locks during writes',
        'Indices convert SQL queries into machine code on compilation',
      ],
      correctIndex: 0,
      explanation: 'Indexes provide direct pointer navigation for queries, but write operations must update both the base table and the index tree.',
      topic: 'Indexing & Performance',
    },
  ],
  'Docker & Containerization': [
    {
      id: 1,
      question: 'What is the fundamental difference between a Docker container and a Virtual Machine (VM)?',
      options: [
        'Containers share the host OS kernel and isolate user spaces via cgroups and namespaces; VMs run a full guest OS on top of a hypervisor',
        'Containers require dedicated hardware chipsets while VMs run on software',
        'VMs start in milliseconds whereas containers take minutes to boot',
        'Containers can only run on Linux while VMs only run on Windows',
      ],
      correctIndex: 0,
      explanation: 'Containers are lightweight processes sharing the host kernel with namespaces for process/network isolation, making them far faster and less resource-heavy than VMs.',
      topic: 'Container Architecture',
    },
    {
      id: 2,
      question: 'What is multi-stage building in a Dockerfile used for?',
      options: [
        'To compile build tools in intermediate stages and copy only the final artifacts into a slim production image, drastically reducing size',
        'To run Docker simultaneously on multiple cloud servers',
        'To convert Docker containers into Kubernetes clusters automatically',
        'To encrypt container storage at rest',
      ],
      correctIndex: 0,
      explanation: 'Multi-stage builds allow developers to keep SDKs and build dependencies out of the final runtime image, improving both image size and security.',
      topic: 'Dockerfile Best Practices',
    },
  ],
  'Cybersecurity Fundamentals': [
    {
      id: 1,
      question: 'What is the principle of Least Privilege in enterprise security?',
      options: [
        'Granting users and services only the minimum necessary permissions required to perform their assigned functions',
        'Using the shortest possible passwords to save disk space',
        'Restricting network access exclusively to daytime hours',
        'Disabling all logging to reduce storage overhead',
      ],
      correctIndex: 0,
      explanation: 'Least Privilege minimizes blast radius in the event of credential compromise by restricting accounts to essential capabilities only.',
      topic: 'Security Principles',
    },
    {
      id: 2,
      question: 'How does SQL Injection (SQLi) occur, and what is the primary defense against it?',
      options: [
        'It occurs when unsanitized user inputs are concatenated directly into SQL queries; defense is using parameterized queries / prepared statements',
        'It occurs when the database runs out of RAM; defense is adding more memory',
        'It occurs when SSL certificates expire; defense is auto-renewing TLS',
        'It occurs when passwords are stored in plain text; defense is using bcrypt',
      ],
      correctIndex: 0,
      explanation: 'Parameterized queries treat user input strictly as literal data rather than executable SQL code, completely neutralizing injection vectors.',
      topic: 'Application Security (OWASP)',
    },
  ],
};

export function getAssessmentForSkill(skillName: string): AssessmentQuestion[] {
  // Direct match or substring match
  for (const [key, questions] of Object.entries(SKILL_ASSESSMENTS)) {
    if (skillName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(skillName.toLowerCase())) {
      return questions;
    }
  }

  // General Software Engineering assessment fallback
  return [
    {
      id: 1,
      question: `What is the most critical design principle when implementing modular code in ${skillName}?`,
      options: [
        'High cohesion and low coupling with well-defined interface contracts',
        'Writing all logic into a single monolithic script file',
        'Avoiding comments and documentation',
        'Hardcoding credentials directly into source files',
      ],
      correctIndex: 0,
      explanation: 'Modular design relies on high cohesion within modules and low coupling between modules to ensure testability and maintainability.',
      topic: 'Architecture & Modularity',
    },
    {
      id: 2,
      question: `Which approach best prevents race conditions in concurrent ${skillName} operations?`,
      options: [
        'Using atomic transactions, mutexes, or immutable state transitions',
        'Adding random arbitrary sleep delays throughout the codebase',
        'Disabling error handling',
        'Running only on single-core mobile hardware',
      ],
      correctIndex: 0,
      explanation: 'Concurrency safety requires synchronization primitives (locks/mutexes) or immutable data structures rather than unreliable timing heuristics.',
      topic: 'Concurrency & State',
    },
    {
      id: 3,
      question: `Why is automated unit and integration testing essential when developing enterprise solutions in ${skillName}?`,
      options: [
        'It prevents regressions, verifies edge-case contracts, and enables confident refactoring',
        'It reduces the need for code review by human engineers',
        'It guarantees 100% bug-free software in every scenario',
        'It is a mandatory requirement enforced by CPU microprocessors',
      ],
      correctIndex: 0,
      explanation: 'Automated test suites provide rapid feedback loops and verify that existing functionality remains intact during feature development.',
      topic: 'Quality Assurance & CI/CD',
    },
  ];
}

export function evaluateAssessment(
  skillName: string,
  answers: Record<number, number>,
  questions: AssessmentQuestion[]
): {
  score: number;
  level: SkillLevel;
  status: 'Verified' | 'Needs Practice';
  strengths: string[];
  areasToImprove: string[];
} {
  let correct = 0;
  const strengths: string[] = [];
  const areasToImprove: string[] = [];

  questions.forEach((q) => {
    const chosen = answers[q.id];
    if (chosen === q.correctIndex) {
      correct++;
      strengths.push(q.topic);
    } else {
      areasToImprove.push(q.topic);
    }
  });

  const pct = Math.round((correct / questions.length) * 100);

  let level: SkillLevel = 'Beginner';
  if (pct >= 80) level = 'Advanced';
  else if (pct >= 60) level = 'Intermediate';

  const status = pct >= 65 ? 'Verified' : 'Needs Practice';

  if (strengths.length === 0) {
    strengths.push('Assessment participation and diagnostic test completion');
  }
  if (areasToImprove.length === 0) {
    areasToImprove.push('Continue building advanced production architectures to maintain high percentile score');
  }

  return {
    score: pct,
    level,
    status,
    strengths,
    areasToImprove,
  };
}
