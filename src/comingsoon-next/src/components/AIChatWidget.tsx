'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, CheckCircle, Hand } from 'lucide-react';
import { chatApi, type StartChatSessionResponse, type ChatMessageDto } from '@/lib/chat-api';
import { ChatSignalRService } from '@/lib/signalr-chat';
import { findBestFAQResponse } from '@/lib/faq-data';
import { PriorityAccessModal } from './PriorityAccessModal';
import { validateEmail } from '@/lib/validation';
import { isDisposableEmail } from '@/lib/disposable-domains';

// Email detection regex - matches valid email addresses
function detectEmailInMessage(content: string): string | null {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const match = content.match(emailRegex);
  return match ? match[0] : null;
}

// Common greetings/words that should NOT be detected as names
const NOT_A_NAME = new Set([
  'hi', 'hey', 'hello', 'hiya', 'howdy', 'sup', 'yo', 'hola', 'greetings',
  'thanks', 'thank', 'okay', 'ok', 'sure', 'yes', 'no', 'nope', 'yep', 'yeah',
  'bye', 'goodbye', 'ciao', 'cheers', 'cool', 'great', 'nice', 'awesome',
  'please', 'help', 'what', 'when', 'where', 'who', 'why', 'how',
  'the', 'and', 'but', 'for', 'not', 'you', 'all', 'can', 'had', 'her',
  'was', 'one', 'our', 'out', 'are', 'has', 'his', 'its', 'let', 'may',
  'new', 'now', 'old', 'see', 'way', 'may', 'say', 'she', 'two', 'use',
  'boy', 'did', 'get', 'put', 'too', 'any',
  // Status/mood words that follow "I'm" but are NOT names
  'good', 'well', 'fine', 'great', 'okay', 'alright', 'interested', 'curious',
  'happy', 'excited', 'looking', 'trying', 'wondering', 'here', 'back', 'ready',
  'just', 'also', 'still', 'really', 'very', 'quite', 'pretty', 'so',
  'not', 'doing', 'feeling', 'having', 'going', 'getting', 'coming', 'waiting',
]);

// Phrases after "I'm" / "I am" that indicate status, NOT a name introduction
// e.g., "I'm doing good", "I'm feeling great", "I'm looking for..."
const IM_STATUS_PATTERNS = /^(?:doing|feeling|looking|trying|wondering|having|going|getting|coming|waiting|interested|curious|excited|happy|ready|just|also|still|really|very|quite|pretty|so|not|good|well|fine|great|okay|alright|back|here)\b/i;

// Greeting words that precede someone's name (e.g., "Hey Alex" = greeting, not a name)
const GREETING_PREFIXES = new Set([
  'hey', 'hi', 'hello', 'hiya', 'howdy', 'sup', 'yo', 'hola',
  'dear', 'greetings', 'morning', 'evening', 'afternoon',
]);

// AI assistant names — greetings directed at these are NOT visitor names
const AI_ASSISTANT_NAMES = new Set(['alex']);

// Name detection result with confidence level
interface NameDetectionResult {
  name: string;
  isExplicit: boolean; // true = "My name is X" (high confidence, can override)
}

// Name detection - comprehensive pattern matching for all ways a visitor might share their name
function detectNameInMessage(content: string): NameDetectionResult | null {
  const trimmed = content.trim();

  // Pre-check: Strip trailing punctuation/emoji for cleaner matching
  const cleaned = trimmed.replace(/[.!?,;:)\s]+$/, '').trim();

  // Strip leading greeting/filler prefixes so "Hey, I'm Edem" → "I'm Edem"
  // Also handles: "Yeah, I'm Edem", "Sure, call me Edem", "Well, my name is Edem"
  const withoutGreeting = cleaned.replace(
    /^(?:hey|hi|hello|hiya|howdy|sup|yo|hola|yeah|yep|sure|well|ok|okay|so)[,!.\s]+/i, ''
  ).trim();

  // GUARD: Detect greetings directed at the AI assistant
  // "Hey Alex", "Hi Alex", "Hello Alex, how are you?" → NOT a name
  const greetingToAI = cleaned.match(/^(hey|hi|hello|hiya|howdy|sup|yo|hola)\s+(\w+)/i);
  if (greetingToAI && greetingToAI[2]) {
    const target = greetingToAI[2].toLowerCase();
    if (AI_ASSISTANT_NAMES.has(target)) return null;
  }

  // GUARD: Generic greeting pattern "Hey/Hi/Hello [Word]" is a greeting, not a name
  // Nobody introduces themselves as "Hey John" — they say "My name is John"
  const greetingPattern = cleaned.match(/^(hey|hi|hello|hiya|howdy|sup|yo|hola)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)$/i);
  if (greetingPattern) return null;

  // Use withoutGreeting for all pattern matching below so prefixed greetings are stripped
  const input = withoutGreeting || cleaned;

  // ── HIGH CONFIDENCE (isExplicit: true) ─────────────────────────────

  // Pattern 1a: "My name is X", "I'm X", "I am X", "Call me X"
  const explicitMatch = input.match(
    /(?:my name is|i'm|i am|call me)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i
  );
  if (explicitMatch && explicitMatch[1]) {
    const name = explicitMatch[1].trim();
    // Guard: "I'm doing good", "I'm feeling great", "I'm looking for..." are NOT names
    if (!IM_STATUS_PATTERNS.test(name) && isValidName(name)) return { name, isExplicit: true };
  }

  // Pattern 1b: "My name's X", "The name is X", "The name's X", "Name's X"
  const nameIsMatch = input.match(
    /(?:my name's|the name is|the name's|name's|name is)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i
  );
  if (nameIsMatch && nameIsMatch[1]) {
    const name = nameIsMatch[1].trim();
    if (isValidName(name)) return { name, isExplicit: true };
  }

  // Pattern 1c: REVERSE — "X is my name", "Edem Akoussanh is my name, yours?"
  const reverseMatch = input.match(
    /^([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+is (?:my name|the name)/i
  );
  if (reverseMatch && reverseMatch[1]) {
    const name = reverseMatch[1].trim();
    if (isValidName(name)) return { name, isExplicit: true };
  }

  // Pattern 1d: Extended "call me" variants
  // "They call me X", "People call me X", "Everyone calls me X",
  // "You can call me X", "Just call me X", "You may call me X"
  const callMeExtended = input.match(
    /(?:they call me|people call me|everyone calls? me|you (?:can|may) call me|just call me)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i
  );
  if (callMeExtended && callMeExtended[1]) {
    const name = callMeExtended[1].trim();
    if (isValidName(name)) return { name, isExplicit: true };
  }

  // Pattern 1e: "I go by X", "I'm called X", "I'm known as X"
  const goByMatch = input.match(
    /(?:i go by|i'm called|i am called|i'm known as|i am known as)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i
  );
  if (goByMatch && goByMatch[1]) {
    const name = goByMatch[1].trim();
    if (isValidName(name)) return { name, isExplicit: true };
  }

  // Pattern 1f: "Name: X" or "Name - X" (form-style input)
  const nameColonMatch = input.match(
    /^name\s*[:\-]\s*([A-Za-z]+(?:\s+[A-Za-z]+)?)/i
  );
  if (nameColonMatch && nameColonMatch[1]) {
    const name = nameColonMatch[1].trim();
    if (isValidName(name)) return { name, isExplicit: true };
  }

  // ── MEDIUM CONFIDENCE (isExplicit: false) ──────────────────────────

  // Pattern 2a: "It's X" / "This is X"
  const introMatch = input.match(
    /(?:it's|this is)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i
  );
  if (introMatch && introMatch[1]) {
    const name = introMatch[1].trim();
    if (isValidName(name) && !AI_ASSISTANT_NAMES.has(name.toLowerCase().split(/\s+/)[0])) {
      return { name, isExplicit: false };
    }
  }

  // Pattern 2b: "X here" / "X here!" (e.g., "Edem here", "Edem Akoussanh here")
  const hereMatch = input.match(
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+here$/i
  );
  if (hereMatch && hereMatch[1]) {
    const name = hereMatch[1].trim();
    if (isValidName(name) && !NOT_A_NAME.has(name.toLowerCase()) && !GREETING_PREFIXES.has(name.toLowerCase().split(/\s+/)[0])) {
      return { name, isExplicit: false };
    }
  }

  // Pattern 2c: "X, nice to meet you" / "X, pleased to meet you"
  const niceToMeetMatch = input.match(
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)[,.]?\s+(?:nice|pleased|glad|happy|good)\s+to\s+meet/i
  );
  if (niceToMeetMatch && niceToMeetMatch[1]) {
    const name = niceToMeetMatch[1].trim();
    if (isValidName(name) && !NOT_A_NAME.has(name.toLowerCase())) {
      return { name, isExplicit: false };
    }
  }

  // Pattern 2d: "Nice to meet you, I'm X" / "Pleased to meet you, my name is X"
  // This is handled by Pattern 1a after greeting strip — the "nice to meet you" prefix
  // plus "I'm X" is caught once we strip the preamble
  const niceToMeetReverse = input.match(
    /(?:nice|pleased|glad|happy|good)\s+to\s+meet\s+you[,.]?\s+(?:i'm|i am|my name is|call me)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i
  );
  if (niceToMeetReverse && niceToMeetReverse[1]) {
    const name = niceToMeetReverse[1].trim();
    if (isValidName(name)) return { name, isExplicit: true };
  }

  // ── LOW CONFIDENCE (isExplicit: false) ─────────────────────────────

  // Pattern 3a: Just a single capitalized name (response to "what's your name?")
  const singleNameMatch = cleaned.match(/^([A-Z][a-z]+)$/);
  if (singleNameMatch && singleNameMatch[1] && !NOT_A_NAME.has(singleNameMatch[1].toLowerCase())) {
    return { name: singleNameMatch[1], isExplicit: false };
  }

  // Pattern 3b: First and last name alone
  const fullNameMatch = cleaned.match(/^([A-Z][a-z]+)\s+([A-Z][a-z]+)$/);
  if (fullNameMatch && fullNameMatch[1] && fullNameMatch[2]) {
    const firstName = fullNameMatch[1];
    const lastName = fullNameMatch[2];
    if (GREETING_PREFIXES.has(firstName.toLowerCase())) return null;
    if (NOT_A_NAME.has(firstName.toLowerCase())) return null;
    if (AI_ASSISTANT_NAMES.has(lastName.toLowerCase())) return null;
    const fullName = `${firstName} ${lastName}`;
    if (isValidName(fullName)) return { name: fullName, isExplicit: false };
  }

  return null;
}

function isValidName(name: string): boolean {
  const lower = name.toLowerCase();
  if (NOT_A_NAME.has(lower)) return false;
  // Also check each word in multi-word names
  const words = lower.split(/\s+/);
  if (words.length === 1 && NOT_A_NAME.has(words[0])) return false;
  // Reject if any word is a greeting prefix (catches "Hey" in multi-word)
  if (words.some(w => GREETING_PREFIXES.has(w))) return false;
  return name.length >= 2 && name.length <= 30 && /^[A-Za-z\s'-]+$/.test(name);
}

// Brevo webchat capture form URL (from webchat_form_capture.html template)
const BREVO_WEBCHAT_CAPTURE_URL = 'https://bc74bff7.sibforms.com/serve/MUIFAMJYlI2B44wHH84nTvs03WUTQj1wLTEEIz1KqXrha41jaywKuah38GiYrhk3lJspissJoiv5ekf0SptyoN6yyZ6JOFTP4OZqoqomttjOFmPOj8xuer0m03qP2yHG8SCQaR1qLEIV5ATLEW8E-Du6I7KyJzv3SCQVnodwSqJT48z9PoGWoNKKnV1BxcI1Lefm8KVO4-1qBhFiQQ==';

// Submit name+email to Brevo webchat capture form (fire-and-forget)
async function submitToBrevoWebchatCapture(fullName: string, email: string): Promise<boolean> {
  try {
    // Validate email before submission
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      console.warn('[BrevoWebchat] Email validation failed:', emailValidation.error);
      return false;
    }

    if (isDisposableEmail(email)) {
      console.warn('[BrevoWebchat] Disposable email rejected:', email);
      return false;
    }

    const formData = new URLSearchParams();
    formData.append('FULL_NAME', fullName);
    formData.append('EMAIL', email);
    formData.append('email_address_check', ''); // Honeypot field - must be empty
    formData.append('locale', 'en');

    console.log('[BrevoWebchat] Submitting name+email to Brevo webchat capture...');

    await fetch(BREVO_WEBCHAT_CAPTURE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
      mode: 'no-cors', // Required for cross-origin Brevo form submission
    });

    console.log('[BrevoWebchat] Submission complete (no-cors, fire-and-forget)');
    return true;
  } catch (error) {
    console.warn('[BrevoWebchat] Submission failed:', error);
    return false;
  }
}

// Off-topic detection - returns scope limitation response for clearly unrelated questions
// This ensures we don't send off-topic questions to OpenAI
function detectOffTopicQuestion(input: string): string | null {
  const normalized = input.toLowerCase().trim();
  
  // Keywords that indicate QualiFlow-related questions (don't block these)
  // Updated with keywords from unified KB (ai_kb_qualiflow)
  const qualiflowKeywords = [
    // Brand & Core
    'qualiflow', 'qualflow', 'quali flow', 'platform', 'how does it work', 'what is',
    'tell me about', 'interested', 'curious', 'learn more',
    
    // Pricing & Plans
    'pricing', 'price', 'cost', 'plan', 'tier', 'freeflow', 'smartflow', 'ultraflow',
    'enterprise', 'subscribe', 'trial', 'demo',
    
    // Channels & Communication
    'channel', 'sms', 'text', 'email', 'phone', 'call', 'voice', 'chat', 'inbox',
    'instagram', 'facebook', 'whatsapp', 'messenger', 'social', 'dm', 'message',
    'omnichannel', 'unified inbox', 'missed call',
    
    // AI & Automation
    'ai', 'automation', 'automate', 'automatic', 'receptionist', 'assistant',
    'journey', 'workflow', 'engine', 'prebuilt', 'turnkey',
    
    // Lead Management
    'lead', 'capture', 'qualify', 'qualification', 'convert', 'follow up', 'followup',
    'nurture', 'warm', 'cold', 'hot', 'score', 'scoring',
    
    // CRM & Integration
    'crm', 'integration', 'integrate', 'hubspot', 'salesforce', 'pipedrive', 'zoho',
    'sync', 'connect', 'calendar', 'google', 'outlook',
    
    // Features
    'booking', 'appointment', 'schedule', 'proposal', 'form', 'survey', 'qr code',
    'review', 'analytics', 'dashboard', 'report',
    
    // Business
    'business', 'company', 'team', 'startup', 'smb', 'agency', 'dealership',
    'clinic', 'salon', 'dentist', 'realtor', 'gym',
    
    // Actions
    'sign up', 'signup', 'join', 'waitlist', 'early access', 'get started'
  ];
  
  // Check if question is about QualiFlow
  const isAboutQualiFlow = qualiflowKeywords.some(keyword => normalized.includes(keyword));
  if (isAboutQualiFlow) {
    return null; // Let it through to backend AI
  }
  
  // Common off-topic patterns (recipes, general knowledge, etc.)
  const offTopicPatterns = [
    /how (do|can|to) (i |you )?(make|cook|bake|prepare|create|build|fix|repair)/i,
    /recipe for/i,
    /what is the (weather|time|date|capital|population)/i,
    /who (is|was|are|were) /i,
    /when (did|was|is|will)/i,
    /where (is|are|can i find)/i,
    /(tell me|explain) (about|how) (the |a )?(history|science|math|geography)/i,
    /\b(cook|recipe|food|meal|dinner|lunch|breakfast|coffee|tea|drink)\b/i,
    /\b(weather|sports|news|movie|music|game|travel|vacation)\b/i,
    /\b(math|physics|chemistry|biology|history|geography)\b/i,
  ];
  
  const isOffTopic = offTopicPatterns.some(pattern => pattern.test(normalized));
  
  if (isOffTopic) {
    return "I can only help with questions related to QualiFlow AI at the moment. Is there anything about our platform I can help you with?";
  }
  
  return null;
}

interface AIChatWidgetProps {
  widgetKey?: string;
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
}

// Quick reply suggestions for guiding users
const QUICK_REPLIES = [
  { label: '🌟 What is QualiflowAI?', query: 'What is QualiFlow and what features does it include?' },
  { label: '💰 Pricing & Plans', query: 'How much does QualiFlow cost?' },
  { label: '🔗 Integrations', query: 'Does QualiFlow integrate with my CRM?' },
  { label: '🤖 AI Chat Features', query: 'How does the AI chat work?' },
  { label: '✨ Join Waitlist', query: 'How do I get early access?' },
];

const DEFAULT_GREETING = "Hi — thanks for checking out QualiFlow AI! I'm Alex, your virtual assistant. How can I help you today?";

// Instant responses for simple greetings - no backend needed (industry best practice)
const INSTANT_RESPONSES: Record<string, string> = {
  'hi': "Hello! 👋 How can I help you learn about QualiflowAI today?",
  'hello': "Hi there! What would you like to know about QualiflowAI?",
  'hey': "Hey! I'm here to help. What questions do you have?",
  'hii': "Hello! 👋 How can I help you today?",
  'hiii': "Hey there! What would you like to know?",
  'yo': "Hey! How can I assist you today?",
  'sup': "Hey! What can I help you with?",
  'hi there': "Hello! What would you like to know about QualiflowAI?",
  'hello there': "Hi! How can I assist you today?",
  'good morning': "Good morning! ☀️ How can I help you today?",
  'good afternoon': "Good afternoon! How can I assist you?",
  'good evening': "Good evening! What can I help you with?",
  'thanks': "You're welcome! Is there anything else I can help with?",
  'thank you': "Happy to help! Let me know if you have more questions.",
  'thx': "You're welcome! Anything else you'd like to know?",
  'ok': "Great! Let me know if you have any questions about QualiflowAI.",
  'okay': "Sure! Feel free to ask me anything about our platform.",
  'cool': "Glad I could help! Any other questions?",
  'nice': "Thanks! Is there anything else you'd like to know?",
  'bye': "Goodbye! Feel free to come back anytime. 👋",
  'goodbye': "Take care! We're here whenever you need us.",
  'see you': "See you! Don't hesitate to reach out again.",
};

// Check if input is a simple greeting or acknowledgment that deserves instant response
function getInstantResponse(input: string): string | null {
  const normalized = input.toLowerCase().trim();
  
  // Exact match for simple greetings/acknowledgments
  if (INSTANT_RESPONSES[normalized]) {
    return INSTANT_RESPONSES[normalized];
  }
  
  // Check for greetings with punctuation ("Hi!", "Hello?", etc.)
  const withoutPunctuation = normalized.replace(/[!?.,:;]+$/, '');
  if (INSTANT_RESPONSES[withoutPunctuation]) {
    return INSTANT_RESPONSES[withoutPunctuation];
  }
  
  return null;
}

// Detect if the visitor wants to end the chat session
function detectClosureIntent(input: string): boolean {
  const normalized = input.toLowerCase().trim().replace(/[!?.,:;]+$/, '');

  // Exact-match closure phrases (only triggers when the ENTIRE message is a closure)
  const closurePhrases = new Set([
    'bye', 'goodbye', 'good bye', 'see you', 'see ya', 'take care',
    'gotta go', 'got to go', 'i have to go', 'i need to go',
    'end chat', 'close chat', 'end the chat', 'close the chat',
    "i'm done", 'im done', "that's all", 'thats all', "that's it", 'thats it',
    'thanks bye', 'thank you bye', 'thanks goodbye', 'thank you goodbye',
    'ok bye', 'okay bye', 'alright bye',
    'nothing else', 'no more questions', 'no thanks bye',
    'have a good day', 'have a great day', 'have a nice day',
    'talk later', 'talk to you later', 'ttyl', 'ciao', 'adios', 'cheers bye',
    'we can end the chat', 'you can end the chat', 'let\'s end the chat',
    'end this chat', 'close this chat', 'end this conversation',
    'no that\'s all', 'nope that\'s all', 'no thanks that\'s all',
  ]);

  if (closurePhrases.has(normalized)) return true;

  // Pattern-based detection for variations
  // NOTE: "good" removed from (done|finished|good|all set) — "I'm good" is conversational, not closure
  const closurePatterns = [
    /\b(bye|goodbye|good bye)\b/i,
    /\b(end|close|finish|stop)\s+(the\s+)?(chat|conversation|session)\b/i,
    /\b(i'?m|i am)\s+(done|finished|all set)\b/i,
    /\bthat'?s\s+(all|it|everything)\b.*\b(thanks?|thank\s*you)?\b/i,
    /\b(gotta|got to|have to|need to)\s+go\b/i,
    /\b(take care|see you|see ya)\b/i,
    /\bnothing\s+(else|more)\b.*\b(thanks?|thank\s*you)?\b/i,
  ];

  const matchesClosure = closurePatterns.some(pattern => pattern.test(normalized));
  if (!matchesClosure) return false;

  // Continuation guard — if the message contains additional content beyond the
  // closure phrase (a question, a request for info, or substantial text), it's
  // NOT a closure; the visitor is still engaging
  const hasQuestion = /\?/.test(input);
  const hasRequestForInfo = /\b(tell me|show me|explain|what|how|when|where|why|can you|could you|do you|is there|are there|i('?d| would) like)\b/i.test(input);
  const wordCount = input.trim().split(/\s+/).length;

  if (hasQuestion || hasRequestForInfo || wordCount > 8) {
    return false;
  }

  return true;
}

interface Message {
  id: string;
  content: string;
  type: 'visitor' | 'ai' | 'system';
  timestamp: Date;
}

export function AIChatWidget({ 
  widgetKey = 'coming-soon-widget',
  position = 'bottom-right',
  primaryColor = '#6B2D9E'
}: AIChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [session, setSession] = useState<StartChatSessionResponse | null>(null);
  const sessionRef = useRef<StartChatSessionResponse | null>(null); // Sync access to session
  const sessionReadyRef = useRef<{ resolve: () => void; promise: Promise<void> } | null>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [, setMessageCount] = useState(0);
  const [aiProcessingStatus, setAiProcessingStatus] = useState<string>('');
  const [, setAiElapsedTime] = useState(0);
  const [canCancelAI, setCanCancelAI] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [capturedEmail, setCapturedEmail] = useState('');
  const [capturedName, setCapturedName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const aiStartTimeRef = useRef<number>(0);
  const aiTimerRef = useRef<NodeJS.Timeout | null>(null);
  const aiCancelledRef = useRef(false);
  const streamingContentRef = useRef<string>('');
  const brevoWebchatSubmittedRef = useRef(false); // Prevent duplicate Brevo submissions
  const [sessionEnded, setSessionEnded] = useState(false); // Chat session closed by visitor

  // Idle detection — prompts visitor after inactivity
  const IDLE_PROMPT_SECONDS = 300; // 5 minutes before showing idle prompt
  const IDLE_AWAY_SECONDS = 600;   // 10 minutes before showing "Away" status
  const [isIdle, setIsIdle] = useState(false);
  const [isAway, setIsAway] = useState(false);
  const [idlePromptShown, setIdlePromptShown] = useState(false);
  // eslint-disable-next-line react-hooks/purity -- initializing ref with current timestamp
  const lastUserActivityRef = useRef<number>(Date.now());
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // On mount: check if visitor already subscribed via other mechanisms (hero, waitlist, newsletter, etc.)
  useEffect(() => {
    try {
      // isEmailAlreadySubmitted checks localStorage for any previously submitted email
      // This covers: hero section, journey section, /waitlist, /newsletter, footer signups
      const storedEmails = typeof window !== 'undefined' ? localStorage.getItem('qualiflow_submitted_emails') : null;
      if (storedEmails) {
        const emails: string[] = JSON.parse(storedEmails);
        if (emails.length > 0) {
          setEmailSubmitted(true);
          setCapturedEmail(emails[0]); // Use first stored email
          brevoWebchatSubmittedRef.current = true; // Don't re-submit to Brevo
        }
      }
    } catch {
      // Silently fail if localStorage is unavailable
    }
  }, []);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // ── Idle detection: check every 30s if the visitor has gone quiet ──
  useEffect(() => {
    if (!isOpen || messages.length === 0) return; // Only track after chat starts

    idleTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - lastUserActivityRef.current) / 1000;

      // 10 min → "Away" status
      if (elapsed >= IDLE_AWAY_SECONDS && !isAway) {
        setIsAway(true);
        setIsIdle(true);
      }
      // 5 min → idle prompt (inject AI message once)
      else if (elapsed >= IDLE_PROMPT_SECONDS && !idlePromptShown) {
        setIsIdle(true);
        setIdlePromptShown(true);
        setMessages(prev => [...prev, {
          id: `ai-idle-${Date.now()}`,
          content: "Hey, are you still there? 👋 Feel free to continue our conversation whenever you're ready — or let me know if you have any other questions!",
          type: 'ai',
          timestamp: new Date(),
        }]);
      }
    }, 30_000); // Check every 30 seconds

    return () => {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    };
  }, [isOpen, messages.length, idlePromptShown, isAway]);

  // Reset idle state when user sends a message (called from handleSendMessage)
  const resetIdleState = useCallback(() => {
    lastUserActivityRef.current = Date.now();
    setIsIdle(false);
    setIsAway(false);
    // Allow showing idle prompt again after user resumes
    setIdlePromptShown(false);
  }, []);

  // SignalR service ref
  const signalRServiceRef = useRef<ChatSignalRService | null>(null);
  const [isSignalRReady, setIsSignalRReady] = useState(false);
  const signalRReadyPromiseRef = useRef<{ resolve: () => void } | null>(null);
  const isPreloadingRef = useRef(false);

  // Preload session and SignalR connection on component mount
  // This ensures SignalR is ready before the user even opens the chat
  useEffect(() => {
    const preloadConnection = async () => {
      if (isPreloadingRef.current || session) return;
      isPreloadingRef.current = true;

      // Create a promise that resolves when session is ready
      let resolveSession: () => void;
      const sessionPromise = new Promise<void>((resolve) => {
        resolveSession = resolve;
      });
      sessionReadyRef.current = { resolve: resolveSession!, promise: sessionPromise };

      try {

        const sessionResponse = await chatApi.startSession({
          widgetKey,
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
          referrerUrl: typeof document !== 'undefined' ? document.referrer : undefined,
        });

        if (sessionResponse) {
          sessionRef.current = sessionResponse; // Store in ref for sync access
          setSession(sessionResponse);
          
          // Initialize SignalR connection
          try {
            const signalRService = new ChatSignalRService();
            await signalRService.connect(sessionResponse.sessionToken);
            
            // Listen for streaming AI tokens via SignalR (P1 optimization)
            signalRService.onAIStreamToken((messageId: string, token: string, isComplete: boolean) => {
              if (isComplete) {
                // Streaming complete - finalize the message

                const finalContent = streamingContentRef.current;
                streamingContentRef.current = '';
                setStreamingMessageId(null);
                setStreamingContent('');
                // eslint-disable-next-line react-hooks/immutability -- stopAIProgressTracking is defined later but only called in callback
                stopAIProgressTracking();
                setIsTyping(false);

                // Add the complete message (will be deduped if final ReceiveAIResponse arrives)
                if (finalContent) {
                  setMessages(prev => {
                    if (prev.some(m => m.id === messageId)) {
                      return prev;
                    }
                    return [...prev, {
                      id: messageId,
                      content: finalContent,
                      type: 'ai',
                      timestamp: new Date(),
                    }];
                  });
                }
                setShowQuickReplies(true);
              } else {
                // Streaming token - accumulate and display progressively
                streamingContentRef.current += token;
                setStreamingMessageId(messageId);
                setStreamingContent(streamingContentRef.current);
                setIsTyping(false); // Hide typing indicator, show streaming content instead
              }
            });

            // Listen for final AI responses via SignalR (fallback/dedup)
            signalRService.onAIResponse((message: ChatMessageDto) => {

              // Clear any streaming state
              streamingContentRef.current = '';
              setStreamingMessageId(null);
              setStreamingContent('');
              stopAIProgressTracking();
              setIsTyping(false);
              setMessages(prev => {
                if (prev.some(m => m.id === message.id)) {
                  return prev;
                }
                return [...prev, {
                  id: message.id,
                  content: message.content,
                  type: 'ai',
                  timestamp: new Date(message.sentAt),
                }];
              });
              setShowQuickReplies(true);
            });
            
            signalRServiceRef.current = signalRService;
            setIsSignalRReady(true);
            if (signalRReadyPromiseRef.current) {
              signalRReadyPromiseRef.current.resolve();
              signalRReadyPromiseRef.current = null;
            }

          } catch (signalRError) {
            void signalRError; // SignalR failure is non-critical — falls back to polling
            setIsSignalRReady(false);
          }
          
          if (sessionReadyRef.current) {
            sessionReadyRef.current.resolve();
          }
        }
      } catch {

        if (sessionReadyRef.current) {
          sessionReadyRef.current.resolve();
        }
      }
    };

    preloadConnection();
  }, [widgetKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize chat UI - just show greeting (connection already preloaded)
  const initializeChat = useCallback(() => {
    if (messages.length === 0) {
      // Show greeting immediately
      const greeting = session?.greetingMessage || DEFAULT_GREETING;
      const initialMessages: Message[] = [{
        id: 'greeting',
        content: greeting,
        type: 'ai',
        timestamp: new Date(),
      }];

      // If user is already subscribed (detected from localStorage), show welcome-back notification
      if (emailSubmitted && capturedEmail) {
        // Mask email for privacy: "j***n@example.com"
        const maskedEmail = capturedEmail.replace(/^(.{1})(.*)(@.*)$/, (_, first, middle, domain) =>
          first + '*'.repeat(Math.min(middle.length, 3)) + domain
        );
        initialMessages.push({
          id: 'welcome-back-notification',
          content: `Welcome back! You're already on our waitlist (${maskedEmail}). Feel free to ask me anything about QualiFlow AI! 🎉`,
          type: 'system',
          timestamp: new Date(),
        });
      }

      setMessages(initialMessages);
    }
  }, [messages.length, session, emailSubmitted, capturedEmail]);

  // Cleanup SignalR on unmount
  useEffect(() => {
    return () => {
      if (signalRServiceRef.current) {
        signalRServiceRef.current.disconnect();
        signalRServiceRef.current = null;
      }
    };
  }, []);

  // Handle opening the chat
  const handleOpen = () => {
    setIsOpen(true);
    setHasUnread(false);
    initializeChat();
  };


  // Handle quick reply click
  const handleQuickReply = async (query: string) => {
    setInputValue(query);
    setShowQuickReplies(false);
    
    // Wait for session to be ready (same as handleSendMessage)
    if (sessionReadyRef.current?.promise) {

      await Promise.race([
        sessionReadyRef.current.promise,
        new Promise(resolve => setTimeout(resolve, 3000))
      ]);
    }
    
    // Also wait for SignalR to be ready for real-time responses
    if (!isSignalRReady && signalRReadyPromiseRef.current === null) {

      await waitForSignalR(2000);
    }
    
    // Small delay for UX, then send
    await new Promise(resolve => setTimeout(resolve, 100));
    setInputValue('');

    await sendMessageWithContent(query);
  };


  // Send message with specific content
  const sendMessageWithContent = async (content: string) => {
    const userMessage: Message = {
      // eslint-disable-next-line react-hooks/purity -- Date.now() in event handler, not render
      id: `user-${Date.now()}`,
      content: content.trim(),
      type: 'visitor',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessageCount(prev => prev + 1);
    setShowQuickReplies(false);

    // Detect name in user message (always scan - name may come at any point)
    const nameResult = detectNameInMessage(content);
    if (nameResult) {
      // Explicit declarations ("My name is X") ALWAYS override previous captures
      // Implicit detections (single name, full name) only set if no name captured yet
      if (nameResult.isExplicit || !capturedName) {
        setCapturedName(nameResult.name);
      }
    }

    // Detect email in user message
    const detectedEmail = detectEmailInMessage(content);
    if (detectedEmail && !emailSubmitted && !showPriorityModal) {
      setCapturedEmail(detectedEmail);
    }

    // When we have email captured, submit to Brevo and trigger priority modal
    const currentName = (nameResult?.name) || capturedName;
    const currentEmail = detectedEmail || capturedEmail;
    if (currentEmail && !emailSubmitted && !showPriorityModal && !brevoWebchatSubmittedRef.current) {
      // Ensure capturedName is set for the modal (nameResult may have just detected it)
      if (currentName && currentName !== capturedName) {
        setCapturedName(currentName);
      }
      // Submit to Brevo webchat capture form
      const nameForBrevo = currentName || 'Chat Visitor'; // Fallback if name not yet captured
      brevoWebchatSubmittedRef.current = true;
      submitToBrevoWebchatCapture(nameForBrevo, currentEmail).then((success) => {
        if (success) {
          // Show confirmation notification in chat
          setMessages(prev => [...prev, {
            id: `brevo-confirm-${Date.now()}`,
            content: `✅ Your details have been saved to our waitlist! A priority access form will appear shortly.`,
            type: 'system',
            timestamp: new Date(),
          }]);
        }
      }).catch(() => {
        // Reset flag on failure so it can retry
        brevoWebchatSubmittedRef.current = false;
      });

      // Show PriorityAccessModal after a longer delay so visitor can read the notification
      // and AI response before the modal appears (1.5s was too fast)
      setTimeout(() => {
        setShowPriorityModal(true);
      }, 5000);
    }


    // ── Closure intent detection ──
    // If visitor wants to end the chat, send to backend AI for a farewell response,
    // then trigger session closure after the response arrives
    const isClosure = detectClosureIntent(content);
    if (isClosure) {
      aiCancelledRef.current = false;
      setIsTyping(true);
      startAIProgressTracking();
      await tryBackendAI(content, userMessage);
      stopAIProgressTracking();

      // End session after AI farewell is delivered
      const currentSession = sessionRef.current;
      if (currentSession?.sessionToken) {
        await chatApi.endSession(currentSession.sessionToken, 'visitor_initiated');
      }
      setSessionEnded(true);
      return;
    }

    // Check for instant response first (greetings, acknowledgments)
    const instantResponse = getInstantResponse(content);
    if (instantResponse) {

      setIsTyping(true);
      // Small delay for natural feel (not instant-instant)
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `ai-instant-${Date.now()}`,
          content: instantResponse,
          type: 'ai',
          timestamp: new Date(),
        }]);
        setIsTyping(false);
      }, 300);
      return;
    }

    // Check for off-topic questions (scope limitation)
    const offTopicResponse = detectOffTopicQuestion(content);
    if (offTopicResponse) {

      setIsTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `ai-scope-${Date.now()}`,
          content: offTopicResponse,
          type: 'ai',
          timestamp: new Date(),
        }]);
        setIsTyping(false);
        setShowQuickReplies(true);
      }, 400);
      return;
    }

    // Try FAQ matching for common questions (fast, no backend needed)
    const faqResponse = findBestFAQResponse(content);
    if (faqResponse) {

      setIsTyping(true);
      // Slightly longer delay for FAQ (feels like "thinking")
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `ai-faq-${Date.now()}`,
          content: faqResponse,
          type: 'ai',
          timestamp: new Date(),
        }]);
        setIsTyping(false);
      }, 500);
      return;
    }

    // Fall through to backend AI for complex/novel questions

    aiCancelledRef.current = false;
    setIsTyping(true);
    startAIProgressTracking();
    await tryBackendAI(content, userMessage);
    stopAIProgressTracking();
  };

  // Start AI progress tracking - minimal, professional approach
  const startAIProgressTracking = () => {
    // eslint-disable-next-line react-hooks/purity -- Date.now() in event handler, not render
    aiStartTimeRef.current = Date.now();
    setAiElapsedTime(0);
    setAiProcessingStatus(''); // No initial message - just show typing dots
    setCanCancelAI(false);

    // Only show cancel option after extended wait (10s+)
    aiTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - aiStartTimeRef.current) / 1000);
      setAiElapsedTime(elapsed);

      // Only show status for genuinely long waits
      if (elapsed >= 10 && !canCancelAI) {
        setCanCancelAI(true);
        setAiProcessingStatus('Taking a moment...');
      }
    }, 1000);
  };

  // Stop AI progress tracking
  const stopAIProgressTracking = () => {
    if (aiTimerRef.current) {
      clearInterval(aiTimerRef.current);
      aiTimerRef.current = null;
    }
    setAiProcessingStatus('');
    setAiElapsedTime(0);
    setCanCancelAI(false);
  };

  // Cancel AI request
  const handleCancelAI = () => {
    aiCancelledRef.current = true;
    stopAIProgressTracking();
    setIsTyping(false);
    
    // Add cancellation message
    setMessages(prev => [...prev, {
      id: `system-${Date.now()}`,
      content: "Request cancelled. Feel free to ask another question or try rephrasing!",
      type: 'ai',
      timestamp: new Date(),
    }]);
    setShowQuickReplies(true);
  };

  // Send message - try real AI first, fall back to FAQ
  const handleSendMessage = async () => {
    if (!inputValue.trim() || sessionEnded) return;
    const content = inputValue.trim();
    setInputValue('');

    // Reset idle state — visitor is active again
    resetIdleState();

    // Wait for session to be ready (silently, in background)
    if (sessionReadyRef.current?.promise) {
      await Promise.race([
        sessionReadyRef.current.promise,
        new Promise(resolve => setTimeout(resolve, 3000)) // Max 3s wait
      ]);
    }

    await sendMessageWithContent(content);
  };

  // Wait for SignalR to be ready (with timeout)
  const waitForSignalR = async (timeoutMs: number = 2000): Promise<boolean> => {
    if (isSignalRReady && signalRServiceRef.current?.isConnected()) {
      return true;
    }
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        signalRReadyPromiseRef.current = null;
        resolve(false);
      }, timeoutMs);
      
      signalRReadyPromiseRef.current = {
        resolve: () => {
          clearTimeout(timeout);
          resolve(true);
        }
      };
    });
  };

  // Try backend AI (only called when no FAQ match found)
  const tryBackendAI = async (userInput: string, userMessage: Message) => {
    // Check if cancelled before starting
    if (aiCancelledRef.current) {
      return;
    }

    // CRITICAL: Wait for session to be ready (preload might still be in progress)
    // This ensures we don't fall back to FAQ just because preload hasn't completed yet
    if (sessionReadyRef.current?.promise) {

      await Promise.race([
        sessionReadyRef.current.promise,
        new Promise(resolve => setTimeout(resolve, 5000)) // Max 5s wait
      ]);
    }

    // Use ref for sync access (state might not be updated yet due to React async)
    const currentSession = sessionRef.current;


    // Try backend AI first if session exists and has valid token
    if (currentSession?.sessionToken && currentSession.enableAIResponses) {
      // Wait briefly for SignalR if it's connecting
      if (!isSignalRReady) {
        const signalRConnected = await waitForSignalR(2000);
        void signalRConnected;
      }
      try {
        const response = await chatApi.sendMessage({
          sessionToken: currentSession.sessionToken,
          content: userInput,
        });



        if (response && !aiCancelledRef.current) {
          // If SignalR is connected, AI response will arrive via SignalR push
          if (isSignalRReady && signalRServiceRef.current?.isConnected()) {

            // SignalR will handle the response via onAIResponse callback
            // Add a timeout fallback in case SignalR fails
            setTimeout(() => {
              if (!aiCancelledRef.current) {

                pollForAIResponseWithCancel(
                  currentSession.sessionToken,
                  userMessage.timestamp,
                  10,
                  1500
                ).then(aiResponse => {
                  if (aiResponse && !aiCancelledRef.current) {
                    setIsTyping(false);
                    setMessages(prev => {
                      // Deduplicate - don't add if message with same ID exists
                      if (prev.some(m => m.id === aiResponse.id)) {

                        return prev;
                      }
                      return [...prev, {
                        id: aiResponse.id,
                        content: aiResponse.content,
                        type: 'ai',
                        timestamp: new Date(aiResponse.sentAt),
                      }];
                    });
                    setShowQuickReplies(true);
                  }
                });
              }
            }, 8000); // PERFORMANCE: Reduced from 15s to 8s for faster fallback
            
            // Store timeout ID for cleanup
            return;
          } else {
            // Fallback to polling if SignalR is not connected

            const aiResponse = await pollForAIResponseWithCancel(
              currentSession.sessionToken,
              userMessage.timestamp,
              20, // max attempts (30 seconds)
              1500 // interval in ms
            );

            if (aiResponse && !aiCancelledRef.current) {
              setIsTyping(false);
              setMessages(prev => {
                // Deduplicate - don't add if message with same ID exists
                if (prev.some(m => m.id === aiResponse.id)) {

                  return prev;
                }
                return [...prev, {
                  id: aiResponse.id,
                  content: aiResponse.content,
                  type: 'ai',
                  timestamp: new Date(aiResponse.sentAt),
                }];
              });
              setShowQuickReplies(true);
              return;
            }
          }
        }
      } catch (error) {
        void error; // Backend AI failure — fall through to generic fallback
      }
    }

    // Generic fallback when backend unavailable, timeout, or cancelled
    if (!aiCancelledRef.current) {
      executeGenericFallback();
    }
  };

  // Poll for AI response with cancellation support
  const pollForAIResponseWithCancel = async (
    sessionToken: string,
    afterTimestamp: Date,
    maxAttempts: number,
    intervalMs: number
  ) => {
    // Subtract 5 seconds from afterTimestamp to account for clock skew between client and server
    const adjustedTimestamp = new Date(afterTimestamp.getTime() - 5000);
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Check if cancelled
      if (aiCancelledRef.current) {
        return null;
      }

      // Wait before checking (give backend time to process on first attempt)
      if (attempt === 0) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s on first attempt
      } else {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
      
      // Check again after delay
      if (aiCancelledRef.current) {
        return null;
      }

      try {
        const messages = await chatApi.getMessages(sessionToken, 0, 30);
        const aiResponse = messages.find(m =>
          m.type.toLowerCase() === 'ai' && 
          new Date(m.sentAt) > adjustedTimestamp
        );

        if (aiResponse) {

          return aiResponse;
        } else {

        }
      } catch (error) {
        void error; // Poll failure is expected during timeout
      }
    }
    return null;
  };

  // Generic fallback when no FAQ match and backend unavailable
  const executeGenericFallback = () => {
    setTimeout(() => {
      setIsTyping(false);
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: "That's a great question! While I don't have a specific answer for that, I'd love to help. QualiflowAI is launching soon with powerful AI-driven customer journey automation. Join our waitlist to be the first to experience it, or ask me about our features, pricing plans, or integrations!",
        type: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setShowQuickReplies(true);
    // eslint-disable-next-line react-hooks/purity -- Math.random() in callback, not render
    }, 800 + Math.random() * 400);
  };

  // Handle key down (Enter to send)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const positionClasses = position === 'bottom-right' 
    ? 'right-4 sm:right-6' 
    : 'left-4 sm:left-6';

  // Derive lighter/darker shades from primaryColor for gradients
  const headerGradient = `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 50%, ${primaryColor}bb 100%)`;

  return (
    <>
      {/* CSS Keyframes for custom animations */}
      <style jsx global>{`
        @keyframes chat-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chat-slide-up-mobile {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes chat-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes chat-bubble-pop {
          0% { opacity: 0; transform: scale(0.8) translateY(4px); }
          60% { transform: scale(1.02) translateY(-1px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes chat-fab-pulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(107, 45, 158, 0.4); }
          50% { box-shadow: 0 4px 30px rgba(107, 45, 158, 0.6); }
        }
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        .chat-widget-enter { animation: chat-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .chat-widget-enter-mobile { animation: chat-slide-up-mobile 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .chat-message-enter { animation: chat-bubble-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .chat-fade-enter { animation: chat-fade-in 0.25s ease-out forwards; }
        .chat-fab-idle { animation: chat-fab-pulse 3s ease-in-out infinite; }
        .typing-dot { animation: typing-bounce 1.4s ease-in-out infinite; }
        .typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .typing-dot:nth-child(3) { animation-delay: 0.3s; }
      `}</style>

      {/* ── FAB (Floating Action Button) ── */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className={`fixed bottom-20 lg:bottom-6 ${positionClasses} z-40 group`}
          aria-label="Open chat"
        >
          {/* Outer ring pulse */}
          <span className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" style={{ animationDuration: '3s' }} />
          {/* Button */}
          <span
            className="relative flex items-center justify-center w-[60px] h-[60px] rounded-full shadow-xl transition-all duration-300 group-hover:scale-110 group-active:scale-95 chat-fab-idle"
            style={{ backgroundColor: primaryColor }}
          >
            <MessageCircle className="w-6 h-6 text-white" strokeWidth={2.2} />
          </span>
          {/* Unread badge */}
          {hasUnread && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          )}
          {/* Tooltip */}
          <span className="absolute bottom-full mb-2 right-0 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
            Chat with us
            <span className="absolute top-full right-5 -mt-px border-4 border-transparent border-t-gray-900" />
          </span>
        </button>
      )}

      {/* ── Chat Window ── */}
      {isOpen && (
        <>
          {/* Mobile backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            className={[
              'fixed z-50 flex flex-col bg-white overflow-hidden',
              // Mobile: full-screen overlay
              'inset-0 chat-widget-enter-mobile',
              // Desktop: floating widget
              'md:inset-auto md:bottom-20 lg:bottom-6',
              position === 'bottom-right' ? 'md:right-6' : 'md:left-6',
              'md:w-[400px] md:h-[560px] md:max-h-[calc(100vh-6rem)]',
              'md:rounded-2xl md:shadow-2xl md:border md:border-gray-200/80',
            ].join(' ')}
            role="dialog"
            aria-label="Chat with QualiflowAI"
            aria-modal="true"
          >
            {/* ── Header ── */}
            <div
              className="relative flex items-center justify-between px-4 py-3.5 md:px-5 md:py-4 flex-shrink-0 md:rounded-t-2xl"
              style={{ background: headerGradient }}
            >
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

              <div className="flex items-center gap-3 flex-1 min-w-0 relative z-10">
                {/* Bot avatar with online pulse */}
                <div className="relative">
                  <div className="w-10 h-10 md:w-11 md:h-11 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-white/30">
                    <Bot className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  {/* Status dot — green=online, amber=idle, gray=away */}
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                    isAway ? 'bg-gray-400' : isIdle ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-semibold text-base leading-tight tracking-tight">QualiflowAI</h3>
                  <p className="text-white/70 text-xs mt-0.5 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                      isAway ? 'bg-gray-400' : isIdle ? 'bg-amber-400' : 'bg-emerald-400'
                    }`} />
                    {isAway ? 'Session paused' : isIdle ? 'Still here — waiting for you' : 'Online now'}
                  </p>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="relative z-10 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white/15 hover:bg-white/30 rounded-full transition-all duration-200 flex-shrink-0 ml-2"
                aria-label="Close chat"
              >
                <X className="w-5 h-5 text-white" strokeWidth={2.5} />
              </button>
            </div>

            {/* ── Messages Area ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 md:px-5 space-y-3 bg-gradient-to-b from-gray-50/80 to-white">
              {messages.map((message) => (
                message.type === 'system' ? (
                  /* System notification banner (e.g., welcome-back for already-subscribed users) */
                  <div key={message.id} className="chat-fade-enter">
                    <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200/60 rounded-xl px-3.5 py-2.5 mx-1">
                      <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                      <p className="text-[13px] text-emerald-700 leading-snug">{message.content}</p>
                    </div>
                  </div>
                ) : (
                <div
                  key={message.id}
                  className={`flex chat-message-enter ${message.type === 'visitor' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-2.5 max-w-[82%] ${message.type === 'visitor' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    {message.type !== 'visitor' ? (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm ring-1 ring-black/5"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-gray-100 shadow-sm ring-1 ring-black/5">
                        <User className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`px-4 py-2.5 text-[14px] leading-relaxed ${
                        message.type === 'visitor'
                          ? 'rounded-2xl rounded-br-md text-white shadow-md'
                          : 'rounded-2xl rounded-bl-md bg-white text-gray-800 shadow-sm ring-1 ring-gray-100'
                      }`}
                      style={message.type === 'visitor' ? { backgroundColor: primaryColor } : undefined}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
                )
              ))}

            {/* Streaming AI Response */}
            {streamingMessageId && streamingContent && (
              <div className="flex justify-start chat-message-enter">
                <div className="flex items-end gap-2.5 max-w-[82%]">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ring-1 ring-black/5"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="px-4 py-2.5 rounded-2xl rounded-bl-md bg-white text-gray-800 text-[14px] leading-relaxed shadow-sm ring-1 ring-gray-100">
                    {streamingContent}
                    <span className="inline-block w-0.5 h-4 ml-0.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                  </div>
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && !streamingContent && (
              <div className="flex justify-start chat-fade-enter">
                <div className="flex flex-col gap-2 max-w-[82%]">
                  <div className="flex items-end gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ring-1 ring-black/5"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="px-4 py-3.5 rounded-2xl rounded-bl-md bg-white shadow-sm ring-1 ring-gray-100">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                      </div>
                    </div>
                  </div>

                  {/* Cancel option - only for extended waits */}
                  {canCancelAI && (
                    <div className="flex items-center gap-2 ml-10">
                      <p className="text-[11px] text-gray-400">{aiProcessingStatus}</p>
                      <button
                        onClick={handleCancelAI}
                        className="text-[11px] text-gray-500 hover:text-gray-700 underline transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Reply Pills */}
            {showQuickReplies && messages.length <= 2 && !isTyping && !sessionEnded && (
              <div className="space-y-2.5 chat-fade-enter">
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Suggested questions</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_REPLIES.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply.query)}
                      className="px-3.5 py-2 text-[13px] bg-white border border-gray-200 text-gray-700 rounded-full hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50 hover:shadow-sm transition-all duration-200 shadow-xs ring-1 ring-transparent hover:ring-purple-200"
                    >
                      {reply.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Session Ended Card ── */}
            {sessionEnded && (
              <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 border border-purple-100/80 rounded-2xl p-4 space-y-3 shadow-sm chat-fade-enter">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Hand className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Chat ended</p>
                    <p className="text-xs text-gray-500">Thanks for chatting with us!</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  We hope we answered your questions. Feel free to start a new chat anytime — we&apos;re always here to help.
                </p>
                <button
                  onClick={() => {
                    // Reset entire chat state for a fresh session
                    setSessionEnded(false);
                    setMessages([]);
                    setSession(null);
                    sessionRef.current = null;
                    sessionReadyRef.current = null;
                    setShowQuickReplies(true);
                    setIsOpen(false);
                  }}
                  className="w-full py-2.5 text-sm font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-xl transition-colors duration-200"
                >
                  Close Chat
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input Area ── */}
          {sessionEnded ? (
            <div className="border-t border-gray-100 px-4 py-3 md:px-5 md:py-4 bg-gray-50 flex-shrink-0 md:rounded-b-2xl">
              <p className="text-xs text-gray-400 text-center py-1">
                This conversation has ended.
              </p>
              <p className="text-[10px] text-gray-300 text-center mt-2 tracking-wide">
                Powered by <span className="font-medium text-gray-400">QualiflowAI</span>
              </p>
            </div>
          ) : (
          <div className="border-t border-gray-100 px-4 py-3 md:px-5 md:py-4 bg-white flex-shrink-0 md:rounded-b-2xl">
            <div className="flex items-center gap-2.5">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 focus:bg-white transition-all"
                aria-label="Type your message"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm ${
                  inputValue.trim()
                    ? 'hover:scale-105 hover:shadow-md active:scale-95'
                    : 'opacity-40 cursor-not-allowed'
                }`}
                style={{ backgroundColor: primaryColor }}
                aria-label="Send message"
              >
                <Send className="w-4.5 h-4.5 text-white" />
              </button>
            </div>
            <p className="text-[10px] text-gray-300 text-center mt-2.5 tracking-wide">
              Powered by <span className="font-medium text-gray-400">QualiflowAI</span>
            </p>
          </div>
          )}
        </div>
        </>
      )}

      {/* Priority Access Modal - triggered when email detected in chat */}
      <PriorityAccessModal
        isOpen={showPriorityModal}
        onClose={(submitted) => {
          setShowPriorityModal(false);
          // Only add success message if the form was actually submitted
          // The modal calls onClose(true) after submission, onClose(false) on dismiss
          if (submitted && !emailSubmitted) {
            setEmailSubmitted(true);
            setMessages(prev => [...prev, {
              id: `system-success-${Date.now()}`,
              content: "🎉 Thanks for completing the form! You're now on our priority list. We'll be in touch soon!",
              type: 'ai',
              timestamp: new Date(),
            }]);
          }
        }}
        prefilledEmail={capturedEmail}
        prefilledName={capturedName}
        source='web-chat'
      />
    </>
  );
}
