// Default feature categories for fallback when CMS data is unavailable
export interface FeatureItem {
  feature: string;
  freeFlow: string | boolean;
  smartFlow: string | boolean;
  ultraFlow: string | boolean;
  enterprise: string | boolean;
}

export interface FeatureCategory {
  category: string;
  features: FeatureItem[];
}

export function getDefaultFeatureCategories(): FeatureCategory[] {
  return [
    {
      category: 'Core AI Modules',
      features: [
        { feature: 'AI Voice Agents', freeFlow: '3 test', smartFlow: '5', ultraFlow: 'Unlimited', enterprise: 'Unlimited' },
        { feature: 'AI Chat + Web Widget', freeFlow: 'Basic', smartFlow: 'Full', ultraFlow: 'Full', enterprise: 'Full' },
        { feature: 'AI SMS', freeFlow: false, smartFlow: true, ultraFlow: 'Full', enterprise: 'Full' },
        { feature: 'AI Email', freeFlow: false, smartFlow: 'upgrade', ultraFlow: true, enterprise: true },
        { feature: 'AI Follow-Up', freeFlow: false, smartFlow: 'Basic', ultraFlow: 'Full', enterprise: 'Full' },
        { feature: 'AI Qualification', freeFlow: 'Limited', smartFlow: true, ultraFlow: 'Advanced', enterprise: 'Custom' },
        { feature: 'AI Scoring', freeFlow: false, smartFlow: 'Basic', ultraFlow: 'Predictive', enterprise: 'Custom' },
        { feature: 'Lead Routing', freeFlow: false, smartFlow: 'Basic', ultraFlow: 'Multi-agent', enterprise: 'Enterprise' },
        { feature: 'Task Suggestions', freeFlow: false, smartFlow: 'Basic', ultraFlow: true, enterprise: true },
        { feature: 'Summaries / Transcriptions', freeFlow: 'Test only', smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Voice + Text + Email Flows', freeFlow: false, smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Knowledge Base', freeFlow: '5MB', smartFlow: '20MB', ultraFlow: '100MB', enterprise: '250MB+' },
      ],
    },
    {
      category: 'Communication Channels',
      features: [
        { feature: 'Voice (Inbound)', freeFlow: 'Test only', smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Voice (Outbound AI)', freeFlow: false, smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'SMS', freeFlow: 'Limited', smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Email', freeFlow: false, smartFlow: 'upgrade', ultraFlow: true, enterprise: true },
        { feature: 'Social (FB/IG)', freeFlow: false, smartFlow: 'upgrade', ultraFlow: true, enterprise: true },
        { feature: 'Webchat', freeFlow: 'Basic', smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Forms & Surveys', freeFlow: false, smartFlow: true, ultraFlow: true, enterprise: true },
      ],
    },
    {
      category: 'Lead Capture Channels',
      features: [
        { feature: 'Voice (Inbound)', freeFlow: 'Test', smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'SMS', freeFlow: 'Limited', smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Email (Inbound Only)', freeFlow: false, smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Social (FB/IG) Capture', freeFlow: 'upgrade', smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Webchat', freeFlow: 'Basic', smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Forms', freeFlow: false, smartFlow: true, ultraFlow: true, enterprise: true },
      ],
    },
    {
      category: 'Automation System',
      features: [
        { feature: 'Prebuilt Journeys', freeFlow: 'View Only', smartFlow: 'Full', ultraFlow: 'Full+Advanced', enterprise: 'Full+Custom' },
        { feature: 'Custom Journey Builder', freeFlow: 'View', smartFlow: false, ultraFlow: '5/mo + Unlimited', enterprise: 'Unlimited' },
        { feature: 'AI-Driven Actions', freeFlow: false, smartFlow: 'Basic', ultraFlow: 'Advanced Multi-Intent', enterprise: 'Custom' },
        { feature: 'Timers & Delays', freeFlow: false, smartFlow: 'Basic', ultraFlow: 'Enhanced', enterprise: 'Custom' },
        { feature: 'Smart Fallback AI', freeFlow: false, smartFlow: true, ultraFlow: 'Advanced', enterprise: 'Custom' },
        { feature: 'Proposal Automation', freeFlow: false, smartFlow: 'upgrade', ultraFlow: true, enterprise: true },
      ],
    },
    {
      category: 'Booking System',
      features: [
        { feature: 'Smart Calendar', freeFlow: false, smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Multi-Calendar Routing', freeFlow: false, smartFlow: false, ultraFlow: true, enterprise: true },
        { feature: 'Smart Availability Logic', freeFlow: false, smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'No-Show Prevention AI', freeFlow: false, smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Appointment Reminders', freeFlow: false, smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Missed Appointment Flows', freeFlow: false, smartFlow: false, ultraFlow: true, enterprise: true },
      ],
    },
    {
      category: 'Reviews & Retention',
      features: [
        { feature: 'Review Requests', freeFlow: 'Limited', smartFlow: 'Basic', ultraFlow: 'Full Engine', enterprise: 'Full Engine' },
        { feature: 'Multi-Channel Review Funnels', freeFlow: false, smartFlow: false, ultraFlow: true, enterprise: true },
        { feature: 'Retention AI', freeFlow: false, smartFlow: false, ultraFlow: true, enterprise: true },
        { feature: 'Winback & Re-Activation', freeFlow: false, smartFlow: 'Basic', ultraFlow: 'Full', enterprise: 'Custom' },
      ],
    },
    {
      category: 'CRM Integrations',
      features: [
        { feature: 'Built-in CRM', freeFlow: true, smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'HubSpot', freeFlow: 'View Only', smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Zoho', freeFlow: false, smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Pipedrive', freeFlow: false, smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'GoHighLevel', freeFlow: false, smartFlow: false, ultraFlow: true, enterprise: true },
        { feature: 'Monday', freeFlow: false, smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Close CRM', freeFlow: false, smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'FreshSales', freeFlow: false, smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'ActiveCampaign', freeFlow: false, smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Copper', freeFlow: false, smartFlow: false, ultraFlow: true, enterprise: true },
        { feature: 'Salesforce', freeFlow: false, smartFlow: false, ultraFlow: true, enterprise: true },
        { feature: 'Other CRM', freeFlow: false, smartFlow: '*Setup Call*', ultraFlow: '*Setup Call*', enterprise: 'Custom' },
      ],
    },
    {
      category: 'Admin / Dashboard',
      features: [
        { feature: 'Usage Meters', freeFlow: 'Basic', smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Team Management', freeFlow: '1 user', smartFlow: '3 users', ultraFlow: '10 users', enterprise: 'Unlimited' },
        { feature: 'User Roles', freeFlow: false, smartFlow: 'Basic', ultraFlow: 'Full', enterprise: 'Full' },
        { feature: 'Billing Portal', freeFlow: false, smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Standard Analytics', freeFlow: false, smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Enterprise Analytics', freeFlow: false, smartFlow: false, ultraFlow: false, enterprise: true },
        { feature: 'File Storage', freeFlow: '5MB', smartFlow: '20MB', ultraFlow: '100MB', enterprise: '200MB+' },
        { feature: 'Audit Logs', freeFlow: false, smartFlow: false, ultraFlow: 'Basic', enterprise: 'SOC2' },
      ],
    },
    {
      category: 'Onboarding & Training',
      features: [
        { feature: 'Implementation Setup', freeFlow: false, smartFlow: 'Optional $700', ultraFlow: 'Required $1500', enterprise: 'Required $1500' },
        { feature: '1-Hour Kickoff Call', freeFlow: false, smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Training Sessions', freeFlow: false, smartFlow: '1', ultraFlow: '3', enterprise: '3' },
        { feature: 'Team Member Setup', freeFlow: false, smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Knowledge Base Setup', freeFlow: false, smartFlow: 'Limited', ultraFlow: 'Full', enterprise: 'Full' },
        { feature: 'Email Configuration + Domain', freeFlow: false, smartFlow: false, ultraFlow: true, enterprise: true },
        { feature: 'CRM Setup', freeFlow: false, smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Channel Configuration', freeFlow: false, smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Social Channel Setup', freeFlow: false, smartFlow: false, ultraFlow: true, enterprise: true },
        { feature: 'Booking Calendar Setup', freeFlow: false, smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Prebuilt Journey Activation', freeFlow: false, smartFlow: true, ultraFlow: true, enterprise: true },
        { feature: 'Daily Workflow Training', freeFlow: false, smartFlow: true, ultraFlow: true, enterprise: true },
      ],
    },
  ];
}

