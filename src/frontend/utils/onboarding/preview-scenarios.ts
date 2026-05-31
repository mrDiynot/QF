/**
 * AI Preview Scenarios
 * Realistic conversation demos for different business types and goals
 */

export interface PreviewMessage {
  id: number;
  type: 'ai' | 'lead';
  text: string;
  delay: number; // ms delay before showing this message
}

export interface PreviewScenario {
  title: string;
  subtitle: string;
  conversation: PreviewMessage[];
  finalScore: number;
  priority: 'High Priority' | 'Medium Priority' | 'Low Priority';
}

const scenarios: Record<string, Record<string, PreviewScenario>> = {
  // Real Estate scenarios
  real_estate: {
    qualify_leads: {
      title: 'AI Qualifying Real Estate Lead',
      subtitle: 'Smart questions based on your industry',
      conversation: [
        { id: 1, type: 'ai', text: 'Hi! Are you looking to buy or sell a property?', delay: 0 },
        { id: 2, type: 'lead', text: 'Looking to buy a home in the next 3 months', delay: 1200 },
        { id: 3, type: 'ai', text: 'Great! What\'s your budget range for the purchase?', delay: 1500 },
        { id: 4, type: 'lead', text: 'Between $400K and $550K', delay: 1200 },
        { id: 5, type: 'ai', text: 'Perfect! Are you pre-approved for a mortgage?', delay: 1500 },
        { id: 6, type: 'lead', text: 'Yes, just got pre-approved last week', delay: 1200 },
      ],
      finalScore: 92,
      priority: 'High Priority',
    },
    book_meetings: {
      title: 'AI Booking Property Viewing',
      subtitle: 'Automated scheduling for showings',
      conversation: [
        { id: 1, type: 'ai', text: 'I can help schedule a property viewing. What days work best?', delay: 0 },
        { id: 2, type: 'lead', text: 'This weekend would be ideal', delay: 1200 },
        { id: 3, type: 'ai', text: 'I have Saturday 2PM or Sunday 11AM available. Which works?', delay: 1500 },
        { id: 4, type: 'lead', text: 'Saturday at 2 PM please', delay: 1200 },
        { id: 5, type: 'ai', text: 'Perfect! I\'ll send you a calendar invite with the address.', delay: 1500 },
      ],
      finalScore: 88,
      priority: 'High Priority',
    },
    default: {
      title: 'AI Qualifying Real Estate Lead',
      subtitle: 'Smart questions for your business',
      conversation: [
        { id: 1, type: 'ai', text: 'Hi! How can I help you today?', delay: 0 },
        { id: 2, type: 'lead', text: 'I\'m interested in properties in downtown', delay: 1200 },
        { id: 3, type: 'ai', text: 'Great! Are you looking to buy or rent?', delay: 1500 },
        { id: 4, type: 'lead', text: 'Buy, hopefully in the next 6 months', delay: 1200 },
      ],
      finalScore: 75,
      priority: 'High Priority',
    },
  },

  // Home Services scenarios
  home_services: {
    qualify_leads: {
      title: 'AI Qualifying HVAC Service Lead',
      subtitle: 'Understanding urgency and needs',
      conversation: [
        { id: 1, type: 'ai', text: 'What service do you need help with?', delay: 0 },
        { id: 2, type: 'lead', text: 'My AC stopped working yesterday', delay: 1200 },
        { id: 3, type: 'ai', text: 'I understand that\'s urgent! Is this for a home or business?', delay: 1500 },
        { id: 4, type: 'lead', text: 'Home, and it\'s getting really hot', delay: 1200 },
        { id: 5, type: 'ai', text: 'When would you like a technician to come by?', delay: 1500 },
        { id: 6, type: 'lead', text: 'As soon as possible today', delay: 1200 },
      ],
      finalScore: 95,
      priority: 'High Priority',
    },
    book_meetings: {
      title: 'AI Scheduling Service Call',
      subtitle: 'Fast appointment booking',
      conversation: [
        { id: 1, type: 'ai', text: 'I can schedule a service call. We have slots today at 3PM or tomorrow 9AM?', delay: 0 },
        { id: 2, type: 'lead', text: 'Today at 3 PM works perfectly', delay: 1200 },
        { id: 3, type: 'ai', text: 'Booked! You\'ll receive a confirmation text shortly.', delay: 1500 },
      ],
      finalScore: 90,
      priority: 'High Priority',
    },
    default: {
      title: 'AI Qualifying Service Lead',
      subtitle: 'Quick assessment of customer needs',
      conversation: [
        { id: 1, type: 'ai', text: 'What can we help you with today?', delay: 0 },
        { id: 2, type: 'lead', text: 'Need maintenance for my HVAC system', delay: 1200 },
        { id: 3, type: 'ai', text: 'When was your last service?', delay: 1500 },
        { id: 4, type: 'lead', text: 'About 18 months ago', delay: 1200 },
      ],
      finalScore: 70,
      priority: 'Medium Priority',
    },
  },

  // SaaS scenarios
  saas: {
    qualify_leads: {
      title: 'AI Qualifying SaaS Lead',
      subtitle: 'Understanding company fit',
      conversation: [
        { id: 1, type: 'ai', text: 'Tell me about your company. How many employees do you have?', delay: 0 },
        { id: 2, type: 'lead', text: 'We\'re a team of 25 people', delay: 1200 },
        { id: 3, type: 'ai', text: 'Perfect! What\'s your current solution for [your product category]?', delay: 1500 },
        { id: 4, type: 'lead', text: 'Using spreadsheets and it\'s getting messy', delay: 1200 },
        { id: 5, type: 'ai', text: 'What\'s your timeline for implementing a new solution?', delay: 1500 },
        { id: 6, type: 'lead', text: 'Looking to decide within the next month', delay: 1200 },
      ],
      finalScore: 85,
      priority: 'High Priority',
    },
    book_meetings: {
      title: 'AI Booking Product Demo',
      subtitle: 'Scheduling qualified demos',
      conversation: [
        { id: 1, type: 'ai', text: 'I\'d love to show you a personalized demo. What time zone are you in?', delay: 0 },
        { id: 2, type: 'lead', text: 'Pacific Time (PST)', delay: 1200 },
        { id: 3, type: 'ai', text: 'I have slots Tuesday 2PM or Thursday 10AM. Which works better?', delay: 1500 },
        { id: 4, type: 'lead', text: 'Thursday at 10 AM is great', delay: 1200 },
      ],
      finalScore: 82,
      priority: 'High Priority',
    },
    default: {
      title: 'AI Qualifying SaaS Interest',
      subtitle: 'Identifying the right customers',
      conversation: [
        { id: 1, type: 'ai', text: 'What brings you here today?', delay: 0 },
        { id: 2, type: 'lead', text: 'Checking out your platform', delay: 1200 },
        { id: 3, type: 'ai', text: 'Great! What\'s your biggest challenge right now?', delay: 1500 },
        { id: 4, type: 'lead', text: 'Managing our customer data efficiently', delay: 1200 },
      ],
      finalScore: 65,
      priority: 'Medium Priority',
    },
  },

  // Healthcare scenarios
  healthcare: {
    qualify_leads: {
      title: 'AI Qualifying Patient Lead',
      subtitle: 'Understanding patient needs',
      conversation: [
        { id: 1, type: 'ai', text: 'Hi! What type of care are you looking for today?', delay: 0 },
        { id: 2, type: 'lead', text: 'I need to see a dermatologist', delay: 1200 },
        { id: 3, type: 'ai', text: 'Are you a new patient or returning?', delay: 1500 },
        { id: 4, type: 'lead', text: 'New patient, first time', delay: 1200 },
        { id: 5, type: 'ai', text: 'What type of insurance do you have?', delay: 1500 },
        { id: 6, type: 'lead', text: 'Blue Cross Blue Shield', delay: 1200 },
      ],
      finalScore: 88,
      priority: 'High Priority',
    },
    book_meetings: {
      title: 'AI Booking Patient Appointment',
      subtitle: 'Seamless appointment scheduling',
      conversation: [
        { id: 1, type: 'ai', text: 'I can schedule your appointment. Do you prefer morning or afternoon?', delay: 0 },
        { id: 2, type: 'lead', text: 'Morning works better for me', delay: 1200 },
        { id: 3, type: 'ai', text: 'We have Monday 9AM or Wednesday 10AM. Which works?', delay: 1500 },
        { id: 4, type: 'lead', text: 'Monday at 9 AM please', delay: 1200 },
      ],
      finalScore: 90,
      priority: 'High Priority',
    },
    default: {
      title: 'AI Handling Patient Inquiry',
      subtitle: 'Compassionate care starts here',
      conversation: [
        { id: 1, type: 'ai', text: 'Hello! How can I assist you with your healthcare needs?', delay: 0 },
        { id: 2, type: 'lead', text: 'Looking for a new primary care physician', delay: 1200 },
        { id: 3, type: 'ai', text: 'We have several accepting new patients. Any specific requirements?', delay: 1500 },
        { id: 4, type: 'lead', text: 'Someone who speaks Spanish would be great', delay: 1200 },
      ],
      finalScore: 75,
      priority: 'High Priority',
    },
  },

  // Legal scenarios
  legal: {
    qualify_leads: {
      title: 'AI Qualifying Legal Client',
      subtitle: 'Case intake qualification',
      conversation: [
        { id: 1, type: 'ai', text: 'What type of legal matter can we help you with?', delay: 0 },
        { id: 2, type: 'lead', text: 'I was injured in a car accident', delay: 1200 },
        { id: 3, type: 'ai', text: 'I\'m sorry to hear that. When did the accident occur?', delay: 1500 },
        { id: 4, type: 'lead', text: 'About 3 weeks ago', delay: 1200 },
        { id: 5, type: 'ai', text: 'Were there any police reports or witnesses?', delay: 1500 },
        { id: 6, type: 'lead', text: 'Yes, police came and I have the report', delay: 1200 },
      ],
      finalScore: 94,
      priority: 'High Priority',
    },
    book_meetings: {
      title: 'AI Scheduling Consultation',
      subtitle: 'Free case evaluation booking',
      conversation: [
        { id: 1, type: 'ai', text: 'We offer free consultations. When would you like to come in?', delay: 0 },
        { id: 2, type: 'lead', text: 'Can I come this week?', delay: 1200 },
        { id: 3, type: 'ai', text: 'Yes! We have Thursday 3PM or Friday 11AM. Preference?', delay: 1500 },
        { id: 4, type: 'lead', text: 'Thursday afternoon works', delay: 1200 },
      ],
      finalScore: 85,
      priority: 'High Priority',
    },
    default: {
      title: 'AI Legal Intake',
      subtitle: 'Initial case assessment',
      conversation: [
        { id: 1, type: 'ai', text: 'How can our legal team assist you today?', delay: 0 },
        { id: 2, type: 'lead', text: 'Need help with a contract dispute', delay: 1200 },
        { id: 3, type: 'ai', text: 'Is this for business or personal matter?', delay: 1500 },
        { id: 4, type: 'lead', text: 'It\'s for my small business', delay: 1200 },
      ],
      finalScore: 72,
      priority: 'Medium Priority',
    },
  },

  // Agency/Marketing scenarios
  agency: {
    qualify_leads: {
      title: 'AI Qualifying Agency Lead',
      subtitle: 'Understanding client needs',
      conversation: [
        { id: 1, type: 'ai', text: 'What marketing services are you looking for?', delay: 0 },
        { id: 2, type: 'lead', text: 'We need help with social media and content', delay: 1200 },
        { id: 3, type: 'ai', text: 'What\'s your current monthly marketing budget?', delay: 1500 },
        { id: 4, type: 'lead', text: 'Around $5,000-$10,000', delay: 1200 },
        { id: 5, type: 'ai', text: 'Great! What industry are you in?', delay: 1500 },
        { id: 6, type: 'lead', text: 'E-commerce, selling fashion accessories', delay: 1200 },
      ],
      finalScore: 87,
      priority: 'High Priority',
    },
    default: {
      title: 'AI Agency Intake',
      subtitle: 'Finding the right clients',
      conversation: [
        { id: 1, type: 'ai', text: 'Tell me about your business goals.', delay: 0 },
        { id: 2, type: 'lead', text: 'We want to increase our online presence', delay: 1200 },
        { id: 3, type: 'ai', text: 'Do you currently have a marketing team?', delay: 1500 },
        { id: 4, type: 'lead', text: 'Just one person handling everything', delay: 1200 },
      ],
      finalScore: 70,
      priority: 'Medium Priority',
    },
  },

  // Finance scenarios
  finance: {
    qualify_leads: {
      title: 'AI Qualifying Finance Lead',
      subtitle: 'Understanding financial needs',
      conversation: [
        { id: 1, type: 'ai', text: 'What financial services are you interested in?', delay: 0 },
        { id: 2, type: 'lead', text: 'Looking for help with retirement planning', delay: 1200 },
        { id: 3, type: 'ai', text: 'What\'s your target retirement age?', delay: 1500 },
        { id: 4, type: 'lead', text: 'Hoping to retire by 60', delay: 1200 },
        { id: 5, type: 'ai', text: 'Do you have existing retirement accounts?', delay: 1500 },
        { id: 6, type: 'lead', text: 'Yes, a 401k and some savings', delay: 1200 },
      ],
      finalScore: 82,
      priority: 'High Priority',
    },
    default: {
      title: 'AI Finance Intake',
      subtitle: 'Financial planning qualification',
      conversation: [
        { id: 1, type: 'ai', text: 'What brings you here today?', delay: 0 },
        { id: 2, type: 'lead', text: 'Need help managing my investments', delay: 1200 },
        { id: 3, type: 'ai', text: 'What\'s your current investment portfolio size?', delay: 1500 },
        { id: 4, type: 'lead', text: 'Around $250,000', delay: 1200 },
      ],
      finalScore: 78,
      priority: 'High Priority',
    },
  },

  // Coaching scenarios
  coaching: {
    qualify_leads: {
      title: 'AI Qualifying Coaching Lead',
      subtitle: 'Understanding client goals',
      conversation: [
        { id: 1, type: 'ai', text: 'What area of your life are you looking to improve?', delay: 0 },
        { id: 2, type: 'lead', text: 'Career development and leadership skills', delay: 1200 },
        { id: 3, type: 'ai', text: 'What\'s your current role?', delay: 1500 },
        { id: 4, type: 'lead', text: 'I\'m a senior manager looking to become VP', delay: 1200 },
        { id: 5, type: 'ai', text: 'Have you worked with a coach before?', delay: 1500 },
        { id: 6, type: 'lead', text: 'No, this would be my first time', delay: 1200 },
      ],
      finalScore: 85,
      priority: 'High Priority',
    },
    default: {
      title: 'AI Coaching Intake',
      subtitle: 'Finding the right fit',
      conversation: [
        { id: 1, type: 'ai', text: 'What inspired you to seek coaching?', delay: 0 },
        { id: 2, type: 'lead', text: 'Feeling stuck in my career', delay: 1200 },
        { id: 3, type: 'ai', text: 'What would success look like for you?', delay: 1500 },
        { id: 4, type: 'lead', text: 'Getting a promotion within 6 months', delay: 1200 },
      ],
      finalScore: 75,
      priority: 'High Priority',
    },
  },

  // Default fallback for all other business types
  default: {
    qualify_leads: {
      title: 'AI Qualifying Your Lead',
      subtitle: 'Smart conversations tailored to you',
      conversation: [
        { id: 1, type: 'ai', text: 'Hi! What can I help you with today?', delay: 0 },
        { id: 2, type: 'lead', text: 'I\'m interested in learning more about your services', delay: 1200 },
        { id: 3, type: 'ai', text: 'Great! Can you tell me a bit about your needs?', delay: 1500 },
        { id: 4, type: 'lead', text: 'We need to streamline our lead qualification process', delay: 1200 },
        { id: 5, type: 'ai', text: 'How many leads do you typically handle per month?', delay: 1500 },
        { id: 6, type: 'lead', text: 'Around 200-300 leads', delay: 1200 },
      ],
      finalScore: 78,
      priority: 'High Priority',
    },
    book_meetings: {
      title: 'AI Scheduling Consultation',
      subtitle: 'Automated appointment booking',
      conversation: [
        { id: 1, type: 'ai', text: 'I can schedule a consultation for you. What times work best?', delay: 0 },
        { id: 2, type: 'lead', text: 'Weekday afternoons are best', delay: 1200 },
        { id: 3, type: 'ai', text: 'I have Wednesday 2PM or Friday 3PM available. Prefer one?', delay: 1500 },
        { id: 4, type: 'lead', text: 'Friday at 3 PM works well', delay: 1200 },
      ],
      finalScore: 80,
      priority: 'High Priority',
    },
    default: {
      title: 'AI in Action',
      subtitle: 'See how your AI qualifies leads',
      conversation: [
        { id: 1, type: 'ai', text: 'Hello! How can I assist you today?', delay: 0 },
        { id: 2, type: 'lead', text: 'Just browsing your services', delay: 1200 },
        { id: 3, type: 'ai', text: 'No problem! What industry are you in?', delay: 1500 },
        { id: 4, type: 'lead', text: 'We\'re in the consulting space', delay: 1200 },
      ],
      finalScore: 60,
      priority: 'Medium Priority',
    },
  },
};

export function getPreviewScenario(businessType: string, goal: string): PreviewScenario {
  const normalizedBusinessType = businessType.toLowerCase();
  const normalizedGoal = goal.toLowerCase();

  // Try exact match
  if (scenarios[normalizedBusinessType]?.[normalizedGoal]) {
    return scenarios[normalizedBusinessType][normalizedGoal];
  }

  // Try business type with default goal
  if (scenarios[normalizedBusinessType]?.default) {
    return scenarios[normalizedBusinessType].default;
  }

  // Fallback to default business + goal
  if (scenarios.default[normalizedGoal]) {
    return scenarios.default[normalizedGoal];
  }

  // Ultimate fallback
  return scenarios.default.default;
}
