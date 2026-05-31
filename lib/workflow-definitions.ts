/**
 * Visual Workflow Definitions
 * Contains the step-by-step definitions for all 10 prebuilt workflows
 * Used by the VisualWorkflowBuilder component
 */

export type StepType = 'trigger' | 'action' | 'condition' | 'delay' | 'end';

export interface WorkflowStep {
  id: string;
  type: StepType;
  name: string;
  description: string;
  icon: string;
  config?: Record<string, unknown>;
  branches?: {
    condition: string;
    nextStepId: string;
  }[];
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: 'FreeFlow' | 'SmartFlow' | 'UltraFlow' | 'Enterprise';
  icon: string;
  steps: WorkflowStep[];
  estimatedDuration: string;
}

export const WORKFLOW_DEFINITIONS: WorkflowDefinition[] = [
  // 1. Lead Qualification → Booking (SmartFlow+ - all paid tiers get all 10 workflows per Figma)
  {
    id: 'lead-qualification-workflow',
    name: 'Lead Qualification → Booking',
    description: 'AI responds instantly, qualifies leads using BANT criteria, scores them, and books appointments automatically.',
    category: 'Lead Management',
    tier: 'SmartFlow',
    icon: '🎯',
    estimatedDuration: '5-10 mins',
    steps: [
      {
        id: 'trigger-new-lead',
        type: 'trigger',
        name: 'New Lead Created',
        description: 'Workflow starts when a new lead is captured',
        icon: '⚡',
      },
      {
        id: 'ai-qualification',
        type: 'action',
        name: 'AI Qualification',
        description: 'AI analyzes lead using BANT criteria (Budget, Authority, Need, Timeline)',
        icon: '🤖',
      },
      {
        id: 'score-lead',
        type: 'action',
        name: 'Calculate Lead Score',
        description: 'Assign score 0-100 based on qualification responses',
        icon: '📊',
      },
      {
        id: 'check-score',
        type: 'condition',
        name: 'Score Check',
        description: 'Route based on lead score',
        icon: '🔀',
        branches: [
          { condition: 'Score ≥ 70 (Hot Lead)', nextStepId: 'send-booking' },
          { condition: 'Score 40-69 (Warm Lead)', nextStepId: 'nurture-sequence' },
          { condition: 'Score < 40 (Cold Lead)', nextStepId: 'add-to-newsletter' },
        ],
      },
      {
        id: 'send-booking',
        type: 'action',
        name: 'Send Booking Link',
        description: 'Send calendar booking link via preferred channel',
        icon: '📅',
      },
      {
        id: 'nurture-sequence',
        type: 'action',
        name: 'Add to Nurture',
        description: 'Add to email nurture campaign',
        icon: '📧',
      },
      {
        id: 'add-to-newsletter',
        type: 'action',
        name: 'Add to Newsletter',
        description: 'Subscribe to newsletter for future engagement',
        icon: '📰',
      },
      {
        id: 'update-crm',
        type: 'action',
        name: 'Update CRM',
        description: 'Sync lead status and score to CRM',
        icon: '💾',
      },
      {
        id: 'end',
        type: 'end',
        name: 'Workflow Complete',
        description: 'Lead has been qualified and routed',
        icon: '✅',
      },
    ],
  },

  // 2. Review + Survey Flow (SmartFlow+ - all paid tiers)
  {
    id: 'review-survey-workflow',
    name: 'Review + Survey Flow',
    description: 'After completed appointments, sends thank-you messages, review requests, and surveys.',
    category: 'Engagement',
    tier: 'SmartFlow',
    icon: '⭐',
    estimatedDuration: '3 days',
    steps: [
      {
        id: 'trigger-appointment-complete',
        type: 'trigger',
        name: 'Appointment Completed',
        description: 'Triggered when an appointment is marked as completed',
        icon: '⚡',
      },
      {
        id: 'send-thank-you',
        type: 'action',
        name: 'Send Thank You',
        description: 'Send personalized thank-you email immediately',
        icon: '💌',
      },
      {
        id: 'delay-24h',
        type: 'delay',
        name: 'Wait 24 Hours',
        description: 'Allow time for service experience',
        icon: '⏰',
      },
      {
        id: 'send-review-request',
        type: 'action',
        name: 'Request Review',
        description: 'Send review request with direct link to Google/Yelp',
        icon: '⭐',
      },
      {
        id: 'delay-3d',
        type: 'delay',
        name: 'Wait 3 Days',
        description: 'Give time for review submission',
        icon: '⏰',
      },
      {
        id: 'send-survey',
        type: 'action',
        name: 'Send Feedback Survey',
        description: 'Send detailed feedback survey for improvement insights',
        icon: '📋',
      },
      {
        id: 'end',
        type: 'end',
        name: 'Workflow Complete',
        description: 'Review flow completed',
        icon: '✅',
      },
    ],
  },

  // 3. Email Nurture Campaign (SmartFlow)
  {
    id: 'email-nurture-campaign-workflow',
    name: 'Email Nurture Campaign',
    description: '5-email drip campaign with configurable delays for lead nurturing.',
    category: 'Email Nurture',
    tier: 'SmartFlow',
    icon: '📧',
    estimatedDuration: '15 days',
    steps: [
      {
        id: 'trigger-add-to-nurture',
        type: 'trigger',
        name: 'Added to Nurture List',
        description: 'Lead is added to nurture campaign',
        icon: '⚡',
      },
      {
        id: 'email-1-welcome',
        type: 'action',
        name: 'Email 1: Welcome',
        description: 'Send welcome email with brand introduction',
        icon: '📧',
      },
      {
        id: 'delay-3d-1',
        type: 'delay',
        name: 'Wait 3 Days',
        description: 'Allow time for email engagement',
        icon: '⏰',
      },
      {
        id: 'email-2-product',
        type: 'action',
        name: 'Email 2: Product Intro',
        description: 'Introduce main product/service benefits',
        icon: '📧',
      },
      {
        id: 'delay-3d-2',
        type: 'delay',
        name: 'Wait 3 Days',
        description: 'Continue nurture sequence',
        icon: '⏰',
      },
      {
        id: 'email-3-case-study',
        type: 'action',
        name: 'Email 3: Success Story',
        description: 'Share customer success story/case study',
        icon: '📧',
      },
      {
        id: 'delay-3d-3',
        type: 'delay',
        name: 'Wait 3 Days',
        description: 'Build trust over time',
        icon: '⏰',
      },
      {
        id: 'email-4-offer',
        type: 'action',
        name: 'Email 4: Special Offer',
        description: 'Present limited-time offer or discount',
        icon: '📧',
      },
      {
        id: 'delay-3d-4',
        type: 'delay',
        name: 'Wait 3 Days',
        description: 'Final nurture phase',
        icon: '⏰',
      },
      {
        id: 'email-5-final',
        type: 'action',
        name: 'Email 5: Final Follow-up',
        description: 'Last chance to connect, offer consultation',
        icon: '📧',
      },
      {
        id: 'end',
        type: 'end',
        name: 'Campaign Complete',
        description: 'Nurture campaign finished',
        icon: '✅',
      },
    ],
  },

  // 4. Follow-Up Sequence (SmartFlow)
  {
    id: 'follow-up-sequence-workflow',
    name: 'Follow-Up Sequence',
    description: 'Score-based follow-up sequence with priority-based timing.',
    category: 'Follow-Up',
    tier: 'SmartFlow',
    icon: '🔄',
    estimatedDuration: '7 days',
    steps: [
      {
        id: 'trigger-qualified',
        type: 'trigger',
        name: 'Lead Qualified',
        description: 'Lead status changed to Qualified',
        icon: '⚡',
      },
      {
        id: 'check-priority',
        type: 'condition',
        name: 'Check Lead Score',
        description: 'Determine follow-up urgency based on score',
        icon: '🔀',
        branches: [
          { condition: 'High Priority (Score ≥ 80)', nextStepId: 'immediate-call' },
          { condition: 'Medium Priority (60-79)', nextStepId: 'same-day-email' },
          { condition: 'Standard Priority (<60)', nextStepId: 'next-day-sequence' },
        ],
      },
      {
        id: 'immediate-call',
        type: 'action',
        name: 'Immediate Call',
        description: 'AI initiates call within 5 minutes',
        icon: '📞',
      },
      {
        id: 'same-day-email',
        type: 'action',
        name: 'Same-Day Email',
        description: 'Send personalized email within 2 hours',
        icon: '📧',
      },
      {
        id: 'next-day-sequence',
        type: 'action',
        name: 'Standard Sequence',
        description: 'Begin next-business-day follow-up',
        icon: '📋',
      },
      {
        id: 'delay-24h',
        type: 'delay',
        name: 'Wait 24 Hours',
        description: 'Allow response time',
        icon: '⏰',
      },
      {
        id: 'check-response',
        type: 'condition',
        name: 'Response Check',
        description: 'Did lead respond?',
        icon: '🔀',
        branches: [
          { condition: 'Responded', nextStepId: 'continue-conversation' },
          { condition: 'No Response', nextStepId: 'send-reminder' },
        ],
      },
      {
        id: 'continue-conversation',
        type: 'action',
        name: 'Continue Conversation',
        description: 'Move to active sales process',
        icon: '💬',
      },
      {
        id: 'send-reminder',
        type: 'action',
        name: 'Send Reminder',
        description: 'Send gentle reminder message',
        icon: '🔔',
      },
      {
        id: 'end',
        type: 'end',
        name: 'Sequence Complete',
        description: 'Follow-up sequence finished',
        icon: '✅',
      },
    ],
  },

  // 5. Missed Call Recovery (SmartFlow)
  {
    id: 'missed-call-recovery-workflow',
    name: 'Missed Call Recovery',
    description: 'When a call is missed, AI sends SMS and email to recover the lead.',
    category: 'Recovery',
    tier: 'SmartFlow',
    icon: '📞',
    estimatedDuration: '3 hours',
    steps: [
      {
        id: 'trigger-missed-call',
        type: 'trigger',
        name: 'Call Missed',
        description: 'Inbound call was not answered',
        icon: '⚡',
      },
      {
        id: 'delay-5m',
        type: 'delay',
        name: 'Wait 5 Minutes',
        description: 'Brief delay before recovery attempt',
        icon: '⏰',
      },
      {
        id: 'send-recovery-sms',
        type: 'action',
        name: 'Send Recovery SMS',
        description: 'Apologize and offer callback scheduling',
        icon: '💬',
      },
      {
        id: 'send-recovery-email',
        type: 'action',
        name: 'Send Recovery Email',
        description: 'Detailed email with contact options',
        icon: '📧',
      },
      {
        id: 'delay-2h',
        type: 'delay',
        name: 'Wait 2 Hours',
        description: 'Allow time for response',
        icon: '⏰',
      },
      {
        id: 'check-response',
        type: 'condition',
        name: 'Check Response',
        description: 'Did caller respond?',
        icon: '🔀',
        branches: [
          { condition: 'Responded', nextStepId: 'schedule-callback' },
          { condition: 'No Response', nextStepId: 'send-final-reminder' },
        ],
      },
      {
        id: 'schedule-callback',
        type: 'action',
        name: 'Schedule Callback',
        description: 'Send calendar link for scheduled callback',
        icon: '📅',
      },
      {
        id: 'send-final-reminder',
        type: 'action',
        name: 'Final Reminder',
        description: 'Last attempt to reconnect',
        icon: '🔔',
      },
      {
        id: 'end',
        type: 'end',
        name: 'Recovery Complete',
        description: 'Missed call recovery finished',
        icon: '✅',
      },
    ],
  },

  // 6. No-Show Recovery (SmartFlow)
  {
    id: 'no-show-recovery-workflow',
    name: 'No-Show Recovery',
    description: 'Automatically re-engages customers who miss appointments and helps them rebook.',
    category: 'Recovery',
    tier: 'SmartFlow',
    icon: '🔄',
    estimatedDuration: '24 hours',
    steps: [
      {
        id: 'trigger-no-show',
        type: 'trigger',
        name: 'No-Show Detected',
        description: 'Customer missed scheduled appointment',
        icon: '⚡',
      },
      {
        id: 'delay-15m',
        type: 'delay',
        name: 'Wait 15 Minutes',
        description: 'Grace period for late arrivals',
        icon: '⏰',
      },
      {
        id: 'send-no-show-email',
        type: 'action',
        name: 'Send No-Show Email',
        description: 'Friendly email offering to reschedule',
        icon: '📧',
      },
      {
        id: 'update-lead-status',
        type: 'action',
        name: 'Update Lead Status',
        description: 'Mark as no-show in CRM',
        icon: '💾',
      },
      {
        id: 'delay-24h',
        type: 'delay',
        name: 'Wait 24 Hours',
        description: 'Give time to respond',
        icon: '⏰',
      },
      {
        id: 'send-incentive',
        type: 'action',
        name: 'Send Special Offer',
        description: 'Offer incentive to rebook',
        icon: '🎁',
      },
      {
        id: 'check-rebooked',
        type: 'condition',
        name: 'Check Rebooking',
        description: 'Did customer rebook?',
        icon: '🔀',
        branches: [
          { condition: 'Rebooked', nextStepId: 'send-confirmation' },
          { condition: 'No Response', nextStepId: 'add-to-reengagement' },
        ],
      },
      {
        id: 'send-confirmation',
        type: 'action',
        name: 'Send Confirmation',
        description: 'Confirm new appointment',
        icon: '✉️',
      },
      {
        id: 'add-to-reengagement',
        type: 'action',
        name: 'Add to Re-engagement',
        description: 'Move to long-term re-engagement campaign',
        icon: '📋',
      },
      {
        id: 'end',
        type: 'end',
        name: 'Recovery Complete',
        description: 'No-show recovery finished',
        icon: '✅',
      },
    ],
  },

  // 7. Cold Lead Revival (SmartFlow+ - all paid tiers)
  {
    id: 'cold-lead-revival-workflow',
    name: 'Cold Lead Revival',
    description: 'AI reactivates leads who stopped responding using smart timing and personalized messaging.',
    category: 'Re-engagement',
    tier: 'SmartFlow',
    icon: '⚡',
    estimatedDuration: '14 days',
    steps: [
      {
        id: 'trigger-cold-lead',
        type: 'trigger',
        name: 'Lead Gone Cold',
        description: 'Lead inactive for 30+ days',
        icon: '⚡',
      },
      {
        id: 'analyze-history',
        type: 'action',
        name: 'Analyze History',
        description: 'AI reviews past interactions for personalization',
        icon: '🤖',
      },
      {
        id: 'send-reengagement-1',
        type: 'action',
        name: 'Re-engagement Email 1',
        description: '"We miss you" personalized message',
        icon: '📧',
      },
      {
        id: 'delay-3d',
        type: 'delay',
        name: 'Wait 3 Days',
        description: 'Allow time for response',
        icon: '⏰',
      },
      {
        id: 'check-engaged',
        type: 'condition',
        name: 'Check Engagement',
        description: 'Did lead engage?',
        icon: '🔀',
        branches: [
          { condition: 'Engaged', nextStepId: 'warm-handoff' },
          { condition: 'No Engagement', nextStepId: 'send-value-prop' },
        ],
      },
      {
        id: 'warm-handoff',
        type: 'action',
        name: 'Warm Handoff',
        description: 'Transfer to sales for immediate follow-up',
        icon: '🤝',
      },
      {
        id: 'send-value-prop',
        type: 'action',
        name: 'Send Value Update',
        description: 'Share new features/improvements',
        icon: '📧',
      },
      {
        id: 'delay-5d',
        type: 'delay',
        name: 'Wait 5 Days',
        description: 'Final attempt timing',
        icon: '⏰',
      },
      {
        id: 'send-final-offer',
        type: 'action',
        name: 'Send Exclusive Offer',
        description: 'Limited-time returning customer discount',
        icon: '🎁',
      },
      {
        id: 'end',
        type: 'end',
        name: 'Revival Complete',
        description: 'Cold lead revival finished',
        icon: '✅',
      },
    ],
  },

  // 8. Retention & Re-Engagement (SmartFlow+ - all paid tiers)
  {
    id: 'retention-reengagement-workflow',
    name: 'Retention & Re-Engagement',
    description: 'AI targets inactive customers with personalized offers based on lifetime value.',
    category: 'Retention',
    tier: 'SmartFlow',
    icon: '👥',
    estimatedDuration: '21 days',
    steps: [
      {
        id: 'trigger-inactive',
        type: 'trigger',
        name: 'Customer Inactive',
        description: 'Customer inactive for 60+ days',
        icon: '⚡',
      },
      {
        id: 'calculate-ltv',
        type: 'action',
        name: 'Calculate LTV',
        description: 'Determine customer lifetime value',
        icon: '💰',
      },
      {
        id: 'segment-customer',
        type: 'condition',
        name: 'Segment by Value',
        description: 'Route based on customer value',
        icon: '🔀',
        branches: [
          { condition: 'High Value (LTV ≥ $1000)', nextStepId: 'vip-treatment' },
          { condition: 'Medium Value ($100-999)', nextStepId: 'standard-reengagement' },
          { condition: 'Low Value (<$100)', nextStepId: 'promotional-content' },
        ],
      },
      {
        id: 'vip-treatment',
        type: 'action',
        name: 'VIP Outreach',
        description: 'Personal email with exclusive 25% discount',
        icon: '👑',
      },
      {
        id: 'standard-reengagement',
        type: 'action',
        name: 'Standard Offer',
        description: 'Email with 15% comeback discount',
        icon: '📧',
      },
      {
        id: 'promotional-content',
        type: 'action',
        name: 'Promotional Email',
        description: 'Share new features and updates',
        icon: '📰',
      },
      {
        id: 'delay-7d',
        type: 'delay',
        name: 'Wait 7 Days',
        description: 'Allow time for re-engagement',
        icon: '⏰',
      },
      {
        id: 'send-final-reminder',
        type: 'action',
        name: 'Final Reminder',
        description: 'Last chance offer expiration notice',
        icon: '🔔',
      },
      {
        id: 'end',
        type: 'end',
        name: 'Re-engagement Complete',
        description: 'Retention workflow finished',
        icon: '✅',
      },
    ],
  },

  // 9. Proposal Creation + Sending (SmartFlow+ - all paid tiers)
  {
    id: 'proposal-workflow',
    name: 'Proposal Creation + Sending',
    description: 'AI creates proposals, sends them to leads, and handles acceptance/rejection automatically.',
    category: 'Sales',
    tier: 'SmartFlow',
    icon: '📄',
    estimatedDuration: '7 days',
    steps: [
      {
        id: 'trigger-proposal-request',
        type: 'trigger',
        name: 'Proposal Requested',
        description: 'Lead requests a proposal',
        icon: '⚡',
      },
      {
        id: 'update-lead-status',
        type: 'action',
        name: 'Update Lead Status',
        description: 'Mark lead as "Proposal Pending"',
        icon: '💾',
      },
      {
        id: 'send-proposal',
        type: 'action',
        name: 'Send Proposal Email',
        description: 'Deliver proposal with tracking link',
        icon: '📧',
      },
      {
        id: 'notify-sales',
        type: 'action',
        name: 'Notify Sales Team',
        description: 'Alert sales rep of sent proposal',
        icon: '🔔',
      },
      {
        id: 'delay-24h',
        type: 'delay',
        name: 'Wait 24 Hours',
        description: 'Allow time for review',
        icon: '⏰',
      },
      {
        id: 'send-reminder-1',
        type: 'action',
        name: 'Send View Reminder',
        description: 'Reminder if proposal not viewed',
        icon: '📧',
      },
      {
        id: 'delay-5d',
        type: 'delay',
        name: 'Wait 5 Days',
        description: 'Decision time',
        icon: '⏰',
      },
      {
        id: 'send-final-followup',
        type: 'action',
        name: 'Final Follow-up',
        description: 'Ask if they have questions',
        icon: '❓',
      },
      {
        id: 'end',
        type: 'end',
        name: 'Proposal Flow Complete',
        description: 'Proposal workflow finished',
        icon: '✅',
      },
    ],
  },

  // 10. Abandoned Form Recovery (SmartFlow+ - all paid tiers)
  {
    id: 'abandoned-form-recovery-workflow',
    name: 'Abandoned Form Recovery',
    description: 'When someone starts but doesn\'t submit a form, AI follows up instantly to recover them.',
    category: 'Recovery',
    tier: 'SmartFlow',
    icon: '✅',
    estimatedDuration: '24 hours',
    steps: [
      {
        id: 'trigger-form-abandoned',
        type: 'trigger',
        name: 'Form Abandoned',
        description: 'User started but didn\'t complete form',
        icon: '⚡',
      },
      {
        id: 'delay-10m',
        type: 'delay',
        name: 'Wait 10 Minutes',
        description: 'Brief delay to confirm abandonment',
        icon: '⏰',
      },
      {
        id: 'send-recovery-email-1',
        type: 'action',
        name: 'Recovery Email 1',
        description: '"Need help?" with saved progress link',
        icon: '📧',
      },
      {
        id: 'delay-30m',
        type: 'delay',
        name: 'Wait 30 Minutes',
        description: 'Short follow-up window',
        icon: '⏰',
      },
      {
        id: 'send-recovery-email-2',
        type: 'action',
        name: 'Recovery Email 2',
        description: '"Your progress is saved" reminder',
        icon: '📧',
      },
      {
        id: 'delay-24h',
        type: 'delay',
        name: 'Wait 24 Hours',
        description: 'Final recovery window',
        icon: '⏰',
      },
      {
        id: 'send-final-recovery',
        type: 'action',
        name: 'Final Recovery Email',
        description: '"Form expires soon" urgency message',
        icon: '📧',
      },
      {
        id: 'check-completed',
        type: 'condition',
        name: 'Check Completion',
        description: 'Did user complete form?',
        icon: '🔀',
        branches: [
          { condition: 'Completed', nextStepId: 'thank-you' },
          { condition: 'Still Abandoned', nextStepId: 'mark-lost' },
        ],
      },
      {
        id: 'thank-you',
        type: 'action',
        name: 'Send Thank You',
        description: 'Acknowledge form completion',
        icon: '🎉',
      },
      {
        id: 'mark-lost',
        type: 'action',
        name: 'Mark as Lost',
        description: 'Update status for future campaigns',
        icon: '💾',
      },
      {
        id: 'end',
        type: 'end',
        name: 'Recovery Complete',
        description: 'Form recovery workflow finished',
        icon: '✅',
      },
    ],
  },
];

export function getWorkflowDefinition(workflowId: string): WorkflowDefinition | undefined {
  return WORKFLOW_DEFINITIONS.find(w => w.id === workflowId);
}

export function getWorkflowsByTier(_tier: string): WorkflowDefinition[] {
  // Per Figma spec: All paid tiers (SmartFlow+) get ALL 10 workflows
  // FreeFlow can VIEW all workflows but cannot execute them
  // So we return all workflows for viewing - execution restriction is handled elsewhere
  return WORKFLOW_DEFINITIONS;
}
