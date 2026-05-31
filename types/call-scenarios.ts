/**
 * Call Scenarios Library Type Definitions
 * Pre-built scenarios for AI voice training
 */

export interface CallScenario {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'support' | 'qualification' | 'appointment' | 'survey' | 'custom';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // minutes
  objectives: string[];
  script: ScenarioStep[];
  tags: string[];
  isActive: boolean;
}

export interface ScenarioStep {
  id: string;
  order: number;
  speaker: 'agent' | 'customer';
  text: string;
  notes?: string;
  expectedResponse?: string;
  alternatives?: string[];
  keyPoints?: string[];
}

export interface ScenarioLibrary {
  scenarios: CallScenario[];
  categories: Array<{
    id: string;
    name: string;
    count: number;
  }>;
}

export const PRESET_SCENARIOS: CallScenario[] = [
  {
    id: 'sales-demo-request',
    name: 'Product Demo Request',
    description: 'Handle inbound requests for product demonstrations',
    category: 'sales',
    difficulty: 'beginner',
    estimatedDuration: 5,
    objectives: [
      'Qualify the lead',
      'Understand their needs',
      'Schedule a demo',
      'Collect contact information',
    ],
    script: [
      {
        id: 'step-1',
        order: 1,
        speaker: 'agent',
        text: 'Thank you for calling! I understand you\'re interested in learning more about our product. Can you tell me a bit about what brought you to us today?',
        notes: 'Start with open-ended question to understand needs',
        keyPoints: ['Be friendly', 'Show genuine interest'],
      },
      {
        id: 'step-2',
        order: 2,
        speaker: 'customer',
        text: 'I saw your website and I\'m looking for a solution to help manage our customer communications.',
        expectedResponse: 'Express interest in communication management',
      },
      {
        id: 'step-3',
        order: 3,
        speaker: 'agent',
        text: 'That\'s great! We specialize in exactly that. Can you tell me how many team members would be using the system?',
        notes: 'Qualify by team size',
        keyPoints: ['Gather qualification data', 'Keep conversation flowing'],
      },
    ],
    tags: ['inbound', 'demo', 'qualification'],
    isActive: true,
  },
  {
    id: 'support-technical-issue',
    name: 'Technical Support Call',
    description: 'Handle technical support inquiries and troubleshooting',
    category: 'support',
    difficulty: 'intermediate',
    estimatedDuration: 10,
    objectives: [
      'Identify the issue',
      'Gather relevant information',
      'Provide solution or escalate',
      'Ensure customer satisfaction',
    ],
    script: [
      {
        id: 'step-1',
        order: 1,
        speaker: 'agent',
        text: 'Thank you for contacting support. I\'m here to help. Can you describe the issue you\'re experiencing?',
        notes: 'Empathetic opening, gather information',
        keyPoints: ['Show empathy', 'Active listening'],
      },
      {
        id: 'step-2',
        order: 2,
        speaker: 'customer',
        text: 'I\'m having trouble logging into my account. It keeps saying my password is incorrect.',
        expectedResponse: 'Login issue description',
      },
      {
        id: 'step-3',
        order: 3,
        speaker: 'agent',
        text: 'I understand how frustrating that can be. Let\'s get this sorted out. Can you confirm the email address you\'re using to log in?',
        notes: 'Validate account details',
        keyPoints: ['Acknowledge frustration', 'Start troubleshooting'],
      },
    ],
    tags: ['support', 'technical', 'troubleshooting'],
    isActive: true,
  },
  {
    id: 'qualification-discovery',
    name: 'Lead Qualification Call',
    description: 'Qualify inbound leads and determine fit',
    category: 'qualification',
    difficulty: 'intermediate',
    estimatedDuration: 8,
    objectives: [
      'Assess budget',
      'Understand timeline',
      'Identify decision makers',
      'Determine pain points',
    ],
    script: [
      {
        id: 'step-1',
        order: 1,
        speaker: 'agent',
        text: 'Thanks for your interest! To make sure I can provide the most relevant information, I\'d like to ask a few quick questions. Is now a good time?',
        notes: 'Set expectations for qualification',
        keyPoints: ['Get permission', 'Set agenda'],
      },
      {
        id: 'step-2',
        order: 2,
        speaker: 'customer',
        text: 'Yes, I have about 10 minutes.',
        expectedResponse: 'Confirmation of availability',
      },
      {
        id: 'step-3',
        order: 3,
        speaker: 'agent',
        text: 'Perfect. First, can you tell me what challenges you\'re currently facing that led you to look for a solution like ours?',
        notes: 'Identify pain points',
        keyPoints: ['Open-ended question', 'Uncover needs'],
      },
    ],
    tags: ['qualification', 'discovery', 'sales'],
    isActive: true,
  },
  {
    id: 'appointment-scheduling',
    name: 'Appointment Scheduling',
    description: 'Schedule appointments and confirm details',
    category: 'appointment',
    difficulty: 'beginner',
    estimatedDuration: 3,
    objectives: [
      'Find suitable time',
      'Confirm contact details',
      'Send confirmation',
      'Set expectations',
    ],
    script: [
      {
        id: 'step-1',
        order: 1,
        speaker: 'agent',
        text: 'I\'d be happy to schedule that for you. What days and times work best for you this week?',
        notes: 'Offer flexibility',
        keyPoints: ['Be accommodating', 'Offer options'],
      },
      {
        id: 'step-2',
        order: 2,
        speaker: 'customer',
        text: 'I\'m available Tuesday or Thursday afternoon.',
        expectedResponse: 'Availability confirmation',
      },
      {
        id: 'step-3',
        order: 3,
        speaker: 'agent',
        text: 'Great! I have Tuesday at 2 PM or Thursday at 3 PM available. Which works better for you?',
        notes: 'Provide specific options',
        keyPoints: ['Give choices', 'Be specific'],
      },
    ],
    tags: ['scheduling', 'appointment', 'calendar'],
    isActive: true,
  },
];

export const getScenariosByCategory = (category: CallScenario['category']): CallScenario[] => {
  return PRESET_SCENARIOS.filter(s => s.category === category && s.isActive);
};

export const getScenariosByDifficulty = (difficulty: CallScenario['difficulty']): CallScenario[] => {
  return PRESET_SCENARIOS.filter(s => s.difficulty === difficulty && s.isActive);
};

export const searchScenarios = (query: string): CallScenario[] => {
  const lowerQuery = query.toLowerCase();
  return PRESET_SCENARIOS.filter(
    s =>
      s.isActive &&
      (s.name.toLowerCase().includes(lowerQuery) ||
        s.description.toLowerCase().includes(lowerQuery) ||
        s.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
  );
};
