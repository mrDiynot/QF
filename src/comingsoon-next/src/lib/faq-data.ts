// FAQ content trained from docs/comingsoonfaq.md with keywords for fuzzy matching
// Responses are concise and structured for better readability

export interface FAQEntry {
  keywords: string[];
  excludeKeywords?: string[];
  response: string;
  weight: number;
}

export const FAQ_DATA: FAQEntry[] = [
  {
    keywords: ['qualiflow', 'qualiflowai', 'platform', 'product', 'company', 'explain'],
    excludeKeywords: ['price', 'pricing', 'cost', 'plan', 'integration', 'journey', 'feature'],
    response: `**QualiflowAI** is an AI-powered platform designed to turn leads into revenue automatically.

✨ **Key capabilities (coming soon):**
• Will capture leads from multiple channels
• Will engage with conversational AI 24/7
• Will qualify & score leads
• Will book appointments automatically
• Will follow up & collect reviews

Want to be first in line? Join our waitlist! 🚀`,
    weight: 5,
  },
  {
    keywords: ['how', 'work', 'works', 'automate', 'automation', 'process'],
    excludeKeywords: ['are you', 'doing', 'today', 'hello', 'hi', 'hey', 'subscribe', 'subscription', 'long', 'time'],
    response: `**How QualiflowAI Will Work:**

1️⃣ **Capture** — Leads will come in from any channel
2️⃣ **Engage** — AI will respond instantly
3️⃣ **Qualify** — Smart questions + lead scoring
4️⃣ **Book** — Appointments scheduled automatically
5️⃣ **Follow up** — Nurture until conversion
6️⃣ **Retain** — Reviews & re-engagement

All powered by our Journey Automation Engine™ 🔥`,
    weight: 9,
  },
  {
    keywords: ['feature', 'features', 'module', 'modules', 'capability', 'capabilities', 'can', 'include'],
    response: `**Core Features (Planned):**

🤖 **AI Engine** — Journey Automation Engine™
📞 **AI Voice** — Inbound & outbound calls
💬 **Omnichannel** — Chat, SMS, social, email
📊 **Built-in CRM** — AI-powered segmentation
📋 **Forms & Surveys** — Lead capture tools
📈 **Analytics** — Real-time dashboards

Asked about a specific feature? Let me know!`,
    weight: 8,
  },
  {
    keywords: ['crm', 'salesforce', 'hubspot', 'zoho', 'pipedrive', 'monday', 'sync'],
    response: `**CRM Integration:**

✅ **Built-in CRM** will be included — start immediately!

🔄 **Will also sync with:**
• Salesforce
• HubSpot
• Zoho CRM
• Pipedrive
• Monday.com

Contacts, conversations, and lead status will sync in real-time.`,
    weight: 8,
  },
  {
    keywords: ['integration', 'integrate', 'integrations', 'connect', 'connected', 'tool', 'tools'],
    response: `**Planned Integrations:**

📱 **CRMs:** Salesforce, HubSpot, Zoho, Pipedrive, Monday
📅 **Calendars:** Google Calendar, Outlook
💬 **Channels:** SMS, Voice, WhatsApp, Instagram, Facebook

More integrations coming soon! Any specific tool you need?`,
    weight: 8,
  },
  {
    keywords: ['ai', 'artificial', 'intelligence', 'smart', 'bot', 'chatbot'],
    response: `**Our AI is designed to feel human:**

🧠 Will learn from every conversation
⚡ Will respond instantly 24/7
🎯 Will ask smart qualification questions
📅 Will book appointments seamlessly
🔄 Will re-engage cold leads automatically

You'll be able to customize scripts, questions, and knowledge base content.`,
    weight: 7,
  },
  {
    keywords: ['channel', 'channels', 'sms', 'text', 'whatsapp', 'instagram', 'facebook', 'email', 'omnichannel'],
    response: `**Omnichannel Support (Planned):**

💬 Web Chat
📱 SMS/Text
📞 Phone/Voice
💚 WhatsApp
📸 Instagram
👥 Facebook
📧 Email
📲 QR Codes

All conversations will be unified in one inbox!`,
    weight: 7,
  },
  {
    keywords: ['voice', 'call', 'calls', 'phone', 'inbound', 'outbound'],
    response: `**AI Voice Features (Coming Soon):**

📞 Will answer inbound calls automatically
📤 Will place outbound calls
✅ Will qualify leads by phone
📅 Will book appointments
🔄 Will retry missed calls
🔥 Will route hot leads to your team

Fully automated voice AI — launching soon!`,
    weight: 7,
  },
  {
    keywords: ['journey', 'journeys', 'workflow', 'workflows', 'prebuilt', 'pre-built', 'automation', 'automations'],
    response: `**10 Pre-built AI Journeys (Planned):**

1. New Lead → Qualification → Booking
2. Missed Call Recovery
3. No-Show Recovery
4. Review & Survey Follow-Up
5. Cold Lead Revival
6. Retention & Re-Engagement
7. Proposal Creation
8. Proposal Acceptance
9. Abandoned Form Recovery
10. Post-Purchase Follow-Up

All will work out of the box! 🎯`,
    weight: 9,
  },
  {
    keywords: ['analytics', 'report', 'reports', 'dashboard', 'metrics', 'data', 'insights'],
    response: `**Analytics Dashboard (Planned):**

📊 Lead volume & conversion rates
📱 Channel performance
📅 Appointment metrics
💰 Revenue influence & ROI
⏰ Peak engagement times
🔄 Drop-off & recovery insights

Real-time data to help optimize your business!`,
    weight: 6,
  },
  {
    keywords: ['early', 'access', 'waitlist', 'join', 'signup', 'sign', 'register'],
    response: `**Join the Waitlist!** 🚀

✨ **Early access benefits:**
• Priority product access
• Exclusive webinars
• Feature previews
• Founding member pricing

Enter your email on this page to join the waitlist! Would you like to know more about QualiFlow AI?`,
    weight: 10,
  },
  {
    keywords: ['launch', 'when', 'release', 'available', 'date', 'coming'],
    response: `**Launching Soon!** 🎉

No public date announced yet, but early-access members get:
• First access when we launch
• Founding member benefits
• Exclusive updates

Join the waitlist to be notified first!`,
    weight: 8,
  },
  {
    keywords: ['price', 'pricing', 'cost', 'costs', 'pay', 'payment', 'subscription', 'fee', 'much', 'money', 'dollar', 'affordable', 'expensive', 'cheap'],
    response: `**Pricing Plans:**

🆓 **Free Flow** — Preview/evaluation
💡 **Smart Flow** — Small teams
🚀 **Ultra Flow** — Growing teams
🏢 **Enterprise** — Custom solutions

Pricing details coming soon! Early-access members get first look + founding pricing.`,
    weight: 15,
  },
  {
    keywords: ['plan', 'plans', 'tier', 'tiers', 'package', 'packages'],
    response: `**4 Plans Planned:**

🆓 **Free Flow** — Try the platform
💡 **Smart Flow** — Start automating
🚀 **Ultra Flow** — Scale up
🏢 **Enterprise** — Full customization

Upgrade as you grow!`,
    weight: 8,
  },
  {
    keywords: ['free', 'trial', 'try', 'test', 'demo'],
    response: `**Free Flow Plan:**

Perfect for exploring QualiflowAI!
• Evaluate the platform
• Understand capabilities
• No commitment required

Join the waitlist for early access! 🚀`,
    weight: 7,
  },
  {
    keywords: ['enterprise', 'custom', 'large', 'corporation', 'company'],
    response: `**Enterprise Flow:**

🏢 For large organizations needing:
• Advanced automation
• Higher usage limits
• Deeper integrations
• Dedicated support
• Custom configuration

Contact us for tailored pricing!`,
    weight: 6,
  },
  {
    keywords: ['security', 'secure', 'safe', 'privacy', 'data', 'protection', 'gdpr', 'compliance'],
    response: `**Security & Compliance:**

🔒 Secure data handling
🔄 Safe CRM synchronization
🛡️ Privacy best practices
📋 Enterprise compliance options

Your data security is our priority.`,
    weight: 6,
  },
  {
    keywords: ['support', 'help', 'onboard', 'onboarding', 'training', 'assistance'],
    response: `**Support Options:**

📚 Documentation & guides
🎓 Onboarding sessions
💬 Chat support
👤 Dedicated success manager (higher tiers)

Early-access members get special onboarding!`,
    weight: 6,
  },
  {
    keywords: ['business', 'businesses', 'industry', 'industries', 'use', 'case', 'healthcare', 'services'],
    response: `**Designed for service businesses:**

🏥 Healthcare
🏠 Home Services
💼 Professional Services
📢 Agencies
🛠️ And more!

Modular system will adapt to your industry.`,
    weight: 5,
  },
  {
    keywords: ['contact', 'reach', 'social', 'linkedin', 'twitter'],
    response: `**Connect with us:**

🔗 LinkedIn: /company/qualiflowai
🐦 Twitter: @qualiflowai
📸 Instagram: @qualiflowai
👥 Facebook: QualiflowAI

We'd love to hear from you!`,
    weight: 5,
  },
  {
    keywords: ['mobile', 'app', 'tablet', 'responsive'],
    response: `**Mobile Access (Planned):**

✅ Will be fully web-based
📱 Will work on any device
💻 Desktop, tablet, or phone
🌐 Any modern browser

No app download will be needed!`,
    weight: 4,
  },
];

// Find best FAQ response using fuzzy matching
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function findBestFAQResponse(input: string): string | null {
  // DISABLED: Always use backend AI for conversational, smart responses
  // Frontend FAQ matching was causing feature dumps and overriding the AI personality
  return null;
}
