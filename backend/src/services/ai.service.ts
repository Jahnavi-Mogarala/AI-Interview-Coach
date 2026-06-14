import OpenAI from 'openai';

// Initialize OpenAI client if key is provided
const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

export class AIService {
  private static isSandbox() {
    return !openai;
  }

  // Generate onboarding roadmaps
  static async generateRoadmap(data: {
    name: string;
    college: string;
    year: string;
    degree: string;
    domainInterest: string;
    targetRole: string;
    preferredLanguages: string[];
    dreamCompanies: string[];
    skillLevel: string;
  }): Promise<any> {
    if (this.isSandbox()) {
      // Return high-quality, simulated roadmap
      const steps = [
        {
          id: 'step_1',
          title: `Master ${data.preferredLanguages.join(' & ') || 'C++ & Python'} Core Foundations`,
          desc: 'Revise syntax, object-oriented concepts, runtime complexities, memory layouts, and basic STL/collection templates.',
          timeframe: 'Weeks 1-2',
          topics: ['Variables & Loops', 'OOPs concepts', 'Standard Libraries', 'Pointers & Memory']
        },
        {
          id: 'step_2',
          title: 'Core Data Structures & Algorithms',
          desc: 'Strengthen DS concepts and solve medium complexity problems on arrays, lists, strings, stacks, and queues.',
          timeframe: 'Weeks 3-6',
          topics: ['Sliding Window', 'Linked Lists', 'Hash Maps', 'Recursion', 'Binary Trees']
        },
        {
          id: 'step_3',
          title: `Target Preparation for ${data.dreamCompanies.join(', ') || 'Dream Companies'}`,
          desc: `Solve previous coding contest patterns and analyze online assessment expectations for target roles.`,
          timeframe: 'Weeks 7-9',
          topics: ['Dynamic Programming', 'Graph traversals (BFS/DFS)', 'Trie', 'Heap algorithms']
        },
        {
          id: 'step_4',
          title: 'System Design & Computer Science Fundamentals',
          desc: 'Prepare for core CS subjects (OS, DBMS, Computer Networks) and basic scalable system designs.',
          timeframe: 'Weeks 10-12',
          topics: ['SQL Indexing', 'Multi-threading', 'Caching', 'Load Balancers']
        }
      ];

      const weeklyGoals = [
        'Solve 15 DSA Medium problems in Arrays & Strings',
        'Complete 1 SQL Mock Test (Schema Design)',
        'Refactor resume based on target ATS suggestions'
      ];

      const studyPlanner = {
        dailyCodingHours: data.skillLevel === 'BEGINNER' ? 2 : 4,
        suggestedMockFrequency: 'Every Saturday',
        focusAreas: ['Data Structures', 'Database Normalization', 'OOPs design']
      };

      return {
        isMock: true,
        steps,
        weeklyGoals,
        studyPlanner,
        message: 'Loaded custom AI roadmap (Sandbox Fallback Mode)'
      };
    }

    try {
      const prompt = `You are a world-class AI Career Coach. Generate a comprehensive placement preparation roadmap for a student with these details:
      Name: ${data.name}
      College: ${data.college}
      Year: ${data.year}
      Degree: ${data.degree}
      Domain: ${data.domainInterest}
      Role: ${data.targetRole}
      Languages: ${data.preferredLanguages.join(', ')}
      Dream Companies: ${data.dreamCompanies.join(', ')}
      Skill Level: ${data.skillLevel}
      
      Respond STRICTLY with a JSON object (no markdown, no wrap) containing:
      {
        "steps": [{"id": "string", "title": "string", "desc": "string", "timeframe": "string", "topics": ["string"]}],
        "weeklyGoals": ["string"],
        "studyPlanner": {"dailyCodingHours": number, "suggestedMockFrequency": "string", "focusAreas": ["string"]}
      }`;

      const response = await openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (err) {
      console.error('OpenAI Error, falling back:', err);
      return this.generateRoadmap(data); // Recurse to mock
    }
  }

  // AI Debugger, explanation, complexity analyzer
  static async analyzeCode(problemTitle: string, problemDesc: string, code: string, language: string): Promise<any> {
    if (this.isSandbox()) {
      const hasErrors = code.includes('syntax_error') || code.includes('undefined') || code.trim().length < 20;
      return {
        isMock: true,
        debug: {
          hasError: hasErrors,
          line: hasErrors ? 4 : null,
          errorDesc: hasErrors ? 'Reference or declaration error detected.' : 'No compile errors spotted.',
          fix: hasErrors ? 'Verify variable scoping or check imports.' : 'Code syntax looks clean.'
        },
        timeComplexity: 'O(N log N)',
        spaceComplexity: 'O(N)',
        explanation: 'The code iterates through the collection elements, sorting them or caching them in a hash set to detect repeats, ensuring rapid search checks.',
        suggestions: [
          'Consider pre-allocating structure sizes where possible to decrease rehashing overhead.',
          'Double check edge cases with empty arrays or null bounds.'
        ]
      };
    }

    try {
      const prompt = `Analyze this code submission for the problem "${problemTitle}".
      Problem description: ${problemDesc}
      Language: ${language}
      Code:
      ${code}

      Provide a JSON output matching:
      {
        "debug": { "hasError": boolean, "line": number_or_null, "errorDesc": "string", "fix": "string" },
        "timeComplexity": "string",
        "spaceComplexity": "string",
        "explanation": "string",
        "suggestions": ["string"]
      }`;

      const response = await openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (err) {
      console.error('OpenAI Error, falling back:', err);
      return this.analyzeCode(problemTitle, problemDesc, code, language);
    }
  }

  // Interview Question & Follow-up Evaluator
  static async evaluateInterviewResponse(
    type: string,
    transcript: { role: 'interviewer' | 'user'; text: string }[],
    latestUserResponse: string
  ): Promise<any> {
    if (this.isSandbox()) {
      // Mock interview responses
      const confidence = 85;
      const communication = 80;
      const logic = 90;
      const optimization = 75;

      const followUpQuestions = [
        "Excellent point. How would you scale this specific component if traffic increased by 10x?",
        "Can you discuss the database index implications of that choice?",
        "What are the trade-offs of using WebSockets vs Server-Sent Events here?"
      ];

      const mistakes = [
        "Slight hesitation when describing database isolation levels.",
        "Could have explicitly detailed memory constraints of in-memory caching."
      ];

      return {
        isMock: true,
        scoreConfidence: confidence,
        scoreCommunication: communication,
        scoreLogic: logic,
        scoreOptimization: optimization,
        feedback: "Solid technical knowledge. Good communication flow. Remember to mention potential bottlenecks early in design rounds.",
        mistakes,
        nextQuestion: followUpQuestions[Math.floor(Math.random() * followUpQuestions.length)],
        isFinished: transcript.length >= 8
      };
    }

    try {
      const prompt = `You are a premium AI Mock Interviewer conducting a ${type} interview.
      Full Transcript so far:
      ${JSON.stringify(transcript)}
      
      Latest User Response: "${latestUserResponse}"

      Evaluate the response, check if the interview is complete (usually 6-8 turns), and output a JSON object:
      {
        "scoreConfidence": number_0_100,
        "scoreCommunication": number_0_100,
        "scoreLogic": number_0_100,
        "scoreOptimization": number_0_100,
        "feedback": "string",
        "mistakes": ["string"],
        "nextQuestion": "string_or_null",
        "isFinished": boolean
      }`;

      const response = await openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (err) {
      console.error('OpenAI Error, falling back:', err);
      return this.evaluateInterviewResponse(type, transcript, latestUserResponse);
    }
  }

  // HR Voice/Tone/Speed Analyzer
  static analyzeHRResponse(speechText: string, speedWpm: number) {
    // Check speech patterns
    const fillers = ['uh', 'um', 'like', 'actually', 'basically', 'so'];
    const fillerCount = fillers.reduce((acc, f) => {
      const regex = new RegExp(`\\b${f}\\b`, 'gi');
      const matches = speechText.match(regex);
      return acc + (matches ? matches.length : 0);
    }, 0);

    let speedFeedback = 'Perfect pacing.';
    if (speedWpm < 100) speedFeedback = 'A bit slow. Practice speaking slightly more dynamically to keep engagement.';
    if (speedWpm > 160) speedFeedback = 'A bit fast. Try to pause between points to appear calm and collected.';

    return {
      wpm: speedWpm,
      fillerCount,
      speedFeedback,
      tone: speedWpm > 140 ? 'Energetic / Anxious' : speedWpm < 100 ? 'Cautious / Reserved' : 'Confident & Articulate',
      grammarIssues: speechText.includes(' i has ') || speechText.includes(' dont knows ') ? ['Minor subject-verb agreement issues.'] : []
    };
  }

  // Resume ATS Analyzer
  static async analyzeResumeText(resumeText: string, targetRole: string): Promise<any> {
    if (this.isSandbox()) {
      return {
        isMock: true,
        atsScore: 78,
        formattingScore: 85,
        keywordsMatched: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Git', 'Agile'],
        keywordsMissing: ['CI/CD', 'AWS', 'Redis', 'Docker', 'System Design'],
        weakSections: [
          {
            section: 'Experience Details',
            reason: 'Bullet points do not list quantitative results (e.g., improved load speed by 20%, reduced database latency).'
          },
          {
            section: 'Projects',
            reason: 'Lacks details about system scalability or architectural decisions.'
          }
        ],
        suggestions: [
          'Use the STAR method (Situation, Task, Action, Result) for bullet points.',
          'Inject cloud deployment references (AWS, GCP, Vercel) and CI/CD pipelines.',
          'Add a dedicated skills classification matrix to boost search hits.'
        ],
        optimizedBulletPoints: [
          'Designed and deployed a highly responsive task management app, reducing loading latency by 35% with state-caching and lazy-loading.',
          'Configured CI/CD integrations on GitHub actions, speeding up release times by 40%.'
        ]
      };
    }

    try {
      const prompt = `Analyze this resume content for the target role: "${targetRole}".
      Resume Text Content:
      ${resumeText}

      Return a complete ATS feedback review strictly as a JSON object:
      {
        "atsScore": number_0_100,
        "formattingScore": number_0_100,
        "keywordsMatched": ["string"],
        "keywordsMissing": ["string"],
        "weakSections": [{"section": "string", "reason": "string"}],
        "suggestions": ["string"],
        "optimizedBulletPoints": ["string"]
      }`;

      const response = await openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (err) {
      console.error('OpenAI Error, falling back:', err);
      return this.analyzeResumeText(resumeText, targetRole);
    }
  }
}
