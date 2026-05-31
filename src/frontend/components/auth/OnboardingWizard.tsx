'use client';

/**
 * OnboardingWizard
 * 11-step (10 for non-Smart plans) onboarding flow shown after payment.
 * Step 11 (onboarding support upsell) only appears for Smart Flow plan.
 * All content lives inside a single white card — no inner scroll bar.
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

import {
  Lock, CheckCircle, ArrowLeft, ArrowRight,
  Phone, PhoneForwarded, PhoneIncoming, Check, Clock,
  Settings, Users, Home, Zap, Wrench, Shield,
  Heart, Scale, TrendingUp, ShoppingCart, Code2, MoreHorizontal,
  Calendar, RefreshCw, Target, MessageSquare, MessageCircle,
  FileText, Globe, Mail, User, Building2, Star,
} from 'lucide-react';
import { Logo } from '../shared/logo';


// ─── Types ────────────────────────────────────────────────────────────────────

type PlanKey = 'free' | 'smart' | 'ultra' | 'enterprise';

export interface OnboardingWizardProps {
  userName: string;
  selectedPlan: PlanKey;
  onComplete: () => void;
  onSkip: () => void;
}

interface OnboardingData {
  industry: string;
  industryOther: string;
  goals: string[];
  leadCaptureSources: string[];
  communicationChannels: string[];
  leadType: string;
  crm: string;
  teamSize: string;
  existingNumber: string;
  phoneNumberOption: string;
  selectedAINumber: string;
  businessHours: string;
  calendarProvider: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
{/*}
const industries = [
  { id: 'real-estate',   label: 'Real Estate',   icon: Home },
  { id: 'solar',         label: 'Solar',         icon: Zap },
  { id: 'home-services', label: 'Home Services', icon: Wrench },
  { id: 'insurance',     label: 'Insurance',     icon: Shield },
  { id: 'healthcare',    label: 'Healthcare',    icon: Heart },
  { id: 'legal',         label: 'Legal',         icon: Scale },
  { id: 'finance',       label: 'Finance',       icon: TrendingUp },
  { id: 'ecommerce',     label: 'E-commerce',    icon: ShoppingCart },
  { id: 'saas',          label: 'SaaS / Tech',   icon: Code2 },
  { id: 'other',         label: 'Other',         icon: MoreHorizontal },
];
*/}

const industries = [
  { id: 'Real-Estate & Property',   label: 'Real-Estate & Property',   icon: Home },
  { id: 'Service & Home-Improvement', label: 'Service & Home-Improvement', icon: Wrench },
  { id: 'Automotive',     label: 'Automotive',     icon: Shield },
  { id: 'Healthcare & Clinics',    label: 'Healthcare & Clinics',    icon: Heart },
  { id: 'Professional Sevice',         label: 'Professional Sevice',         icon: Scale },
  { id: 'Beauty, Wellness & Personal Care',       label: 'Beauty, Wellness & Personal Care',       icon: TrendingUp },
  { id: 'Retail & Ecommerce',     label: 'Retail & Ecommerce',    icon: ShoppingCart },
  { id: 'SaaS & Tech B2B',          label: 'SaaS & Tech B2B',   icon: Code2 },
  { id: 'other',         label: 'Other',         icon: MoreHorizontal },
];


const goals = [
  { id: 'Increase Sales & Conversations',     label: 'Increase Sales & Conversations',  icon: Target,     locked: false, plan: undefined as string | undefined },
  { id: 'Automate Follow-ups & Workflows', label: 'Automate Follow-ups & Workflows',            icon: Calendar,   locked: false, plan: undefined as string | undefined },
  { id: 'Generate QuicK Quotes',    label: 'Generate QuicK Quotes',                   icon: RefreshCw,      locked: false, plan: undefined as string | undefined },
  { id: 'Organise and Track Leads',    label: 'Organise and Track Leads',              icon: Calendar,  locked: false, plan: undefined as string | undefined },
  { id: 'Improve Customer Cmmunications',  label: 'Improve Customer Cmmunications',             icon: Zap,        locked: false, plan: undefined as string | undefined },
  { id: 'Book More Meetings',      label: 'Book More Meetings',              icon: Calendar, locked: false, plan: undefined as string | undefined },
  //{ id: 'outbound-calls',    label: 'Launch outbound calling campaigns', icon: Phone,      locked: true,  plan: 'Ultra' },
  { id: 'Send Proposals Automatically', label: 'Send Proposals Automatically',   icon: Globe,      locked: true,  plan: 'Ultra' },
];

{/*}
const goals = [
  { id: 'qualify-leads',     label: 'Qualify more leads automatically',  icon: Target,     locked: false, plan: undefined as string | undefined },
  { id: 'book-appointments', label: 'Book more appointments',            icon: Calendar,   locked: false, plan: undefined as string | undefined },
  { id: 'reduce-noshows',    label: 'Reduce no-shows',                   icon: Clock,      locked: false, plan: undefined as string | undefined },
  { id: 'reengage-leads',    label: 'Re-engage cold leads',              icon: RefreshCw,  locked: false, plan: undefined as string | undefined },
  { id: 'improve-response',  label: 'Improve response time',             icon: Zap,        locked: false, plan: undefined as string | undefined },
  { id: 'scale-hiring',      label: 'Scale without hiring',              icon: TrendingUp, locked: false, plan: undefined as string | undefined },
  { id: 'outbound-calls',    label: 'Launch outbound calling campaigns', icon: Phone,      locked: true,  plan: 'Ultra' },
  { id: 'social-automation', label: 'Automate social media messaging',   icon: Globe,      locked: true,  plan: 'Ultra' },
];
*/}

const leadCaptureSources = [
  { id: 'Web-Chat',  label: 'Web Chat',         desc: 'Live chat widget',  icon: MessageSquare, locked: false, plan: undefined as string | undefined },
  { id: 'landing-web-forms',  label: 'Web Forms',    desc: 'Web forms',         icon: FileText,      locked: false, plan: undefined as string | undefined },
  { id: 'incoming-phone-calls',   label: 'Incoming Calls',          desc: 'Inbound calls',     icon: Phone,         locked: false, plan: undefined as string | undefined },
  { id: 'outbound-phone-calls',   label: 'Outbound Calls',          desc: 'Outbound calls',     icon: Phone,         locked: false, plan: undefined as string | undefined },
  { id: 'sms',           label: 'SMS',           desc: 'Text messages',     icon: MessageCircle, locked: false, plan: undefined as string | undefined },
  { id: 'email',         label: 'Email (Inbound Only)',                desc: 'We can capture custormer emails without requiring domain setup',   icon: Mail,          locked: false, plan: undefined as string | undefined },
  //{ id: 'in-person',     label: 'Walk-ins',             desc: 'Physical visits',   icon: Users,         locked: false, plan: undefined as string | undefined },
  { id: 'social-messaging',      label: 'Facebook, Instagram & WhatsApp', desc: 'Social DMs',        icon: Globe,         locked: true,  plan: 'Ultra' },
  { id: 'Surveys',      label: 'Surveys',             desc: '', icon: MessageCircle, locked: true,  plan: 'Ultra' },
];

const channels = [
  { id: 'sms',       label: 'SMS',         icon: MessageSquare, locked: false, plan: undefined as string | undefined },
  { id: 'Inbound-calls',     label: 'Inbound Calls',        icon: Phone,         locked: false, plan: undefined as string | undefined },
  { id: 'Outbound-calls',     label: 'Outbound Calls',        icon: Phone,         locked: true, plan: undefined as string | undefined },
  { id: 'Web Forms',     label: 'Web Forms',        icon: FileText,         locked: false, plan: undefined as string | undefined },
  { id: 'email',     label: 'Email',              icon: Mail,          locked: true, plan: undefined as string | undefined },
  { id: 'Surveys',      label: 'Web Surveys',             desc: '', icon: MessageCircle, locked: false,  plan: 'Ultra' },
  { id: 'social-messaging',      label: 'Social Messaging (Facebook, Instagram & WhatsApp)', desc: 'Ultra Flow',        icon: MessageCircle,         locked: true,  plan: 'Ultra' },
  { id: 'web-chat', label: 'Web Chat',          icon: MessageCircle, locked: false, plan: undefined as string | undefined },

  //{ id: 'whatsapp',  label: 'WhatsApp',           icon: Globe,         locked: true,  plan: 'Ultra' },
  //{ id: 'instagram', label: 'Instagram DM',       icon: Star,          locked: true,  plan: 'Ultra' },
  //{ id: 'facebook',  label: 'Facebook Messenger', icon: Globe,         locked: true,  plan: 'Ultra' },
];

const leadTypes = [
  { id: 'b2c',  label: 'B2C — Consumers',  desc: 'Selling directly to people', icon: User },
  { id: 'b2b',  label: 'B2B — Clients', desc: 'Selling to other companies', icon: Building2 },
  { id: 'both', label: 'Both B2B & B2C',   desc: 'Mixed customer base',        icon: Users },
];

const crms = [
  { id: 'qualiflow',   label: 'Built-In-CRM',  desc: 'Recommended',   logo: '🎯', recommended: true },
  { id: 'hubspot',     label: 'HubSpot',        desc: 'Popular for SMBs',        logo: '🟠', recommended: false },
  { id: 'zoho',  label: 'Zoho',     desc: 'Affordable & Powerful',     logo: '☁️', recommended: false },
  { id: 'gohighlevel', label: 'GoHighLevel',    desc: 'Agency platform',     logo: '🚀', recommended: false },
  { id: 'mondaycrm', label: 'Monday CRM',    desc: 'Visual Workflow',     logo: '🎯', recommended: false },
  { id: 'pipedrive',   label: 'Pipedrive',      desc: 'Sales-focused CRM',       logo: '🔧', recommended: false },      
  { id: 'acticecampagn',  label: 'Active Campagn',     desc: 'Marketing automation',     logo: '☁️', recommended: false },
  { id: 'salesforce',  label: 'Salesforce',     desc: 'Enterprise standard',     logo: '☁️', recommended: false },
  { id: 'freshsales',  label: 'Freshsales',     desc: 'Intuitive CRM',     Logo:'', recommended: false },
  { id: 'close-CRM',  label: 'Close CRM',     desc: 'Built for Sales',     logo: '☁️', recommended: false },
  { id: 'copper',  label: 'Copper',     desc: 'google-Integration',     logo: '🟠', recommended: false },
  { id: 'other',       label: 'Other CRM', desc: "Custom Integration", logo: '+', recommended: false },
  ////continue from here




];

const teamSizes = [
  { id: 'solo',  label: 'Just me (solo)' },
  { id: '2-5',   label: '2–5 members' },
  { id: '6-15',  label: '6–20 members' },
  { id: '16-50', label: '21–50 members' },
  { id: '50+',   label: '50+ members' },
];

const calendarProviders = [
  { id: 'google',    label: 'Google Calendar',         desc: 'Gmail / Google Workspace', logo: '📅' },
  { id: 'outlook',   label: 'Outlook / Microsoft 365', desc: 'Office 365 calendar',       logo: '📆' },
  //{ id: 'calcom',    label: 'Cal.com',                 desc: 'Open-source scheduling',    logo: '🔗' },
  //{ id: 'calendly',  label: 'Calendly',                desc: 'Popular scheduling tool',   logo: '📋' },
  { id: 'qualiflow', label: 'QualiFlow Calendar',      desc: 'Built-in calendar',         logo: '🎯' },
];



// ─── Helper ───────────────────────────────────────────────────────────────────

function computeLocked(
  itemLocked: boolean,
  requiredPlan: string | undefined,
  selectedPlan: PlanKey,
): boolean {
  if (!itemLocked) return false;
  if (requiredPlan === 'Ultra') {
    return selectedPlan !== 'ultra' && selectedPlan !== 'enterprise';
  }
  return true;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function OnboardingWizard({ userName, selectedPlan, onComplete, onSkip }: OnboardingWizardProps) {
  const totalSteps = 10;

  const [step, setStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    industry: '',
    industryOther: '',
    goals: [],
    leadCaptureSources: [],
    communicationChannels: [],
    leadType: '',
    crm: '',
    teamSize: '',
    existingNumber: '',
    phoneNumberOption: '',
    selectedAINumber: '',
    businessHours: '9-5',
    calendarProvider: '',
  });

  const [showOtherIndustryInput, setShowOtherIndustryInput] = useState(false);
  const [showOtherCrmInput, setShowOtherCrmInput] = useState(false);
  const [showOtherCrmMessage, setShowOtherCrmMessage] = useState(false);
  const [otherCrmInputValue, setOtherCrmInputValue] = useState('');
  const [phoneNumberReady, setPhoneNumberReady] = useState(false);


  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleIndustrySelect = (id: string) => {
    setOnboardingData(prev => ({ ...prev, industry: id }));
    setShowOtherIndustryInput(id === 'other');
  };

  const handleGoalClick = (id: string, isLocked: boolean) => {
    if (isLocked) { toast.info('Upgrade to Ultra or Enterprise to unlock this goal.'); return; }
    setOnboardingData(prev => ({
      ...prev,
      goals: prev.goals.includes(id) ? prev.goals.filter(g => g !== id) : [...prev.goals, id],
    }));
  };

  const handleLeadCaptureSourceClick = (id: string, isLocked: boolean, plan?: string) => {
    if (isLocked) { toast.info(`Upgrade to ${plan ?? 'a higher plan'} to unlock this source.`); return; }
    setOnboardingData(prev => ({
      ...prev,
      leadCaptureSources: prev.leadCaptureSources.includes(id)
        ? prev.leadCaptureSources.filter(s => s !== id)
        : [...prev.leadCaptureSources, id],
    }));
  };

  const handleChannelClick = (id: string, isLocked: boolean, plan?: string) => {
    if (isLocked) { toast.info(`Upgrade to ${plan ?? 'a higher plan'} to unlock this channel.`); return; }
    setOnboardingData(prev => ({
      ...prev,
      communicationChannels: prev.communicationChannels.includes(id)
        ? prev.communicationChannels.filter(c => c !== id)
        : [...prev.communicationChannels, id],
    }));
  };

  const handleCrmSelect = (id: string) => {
    setOnboardingData(prev => ({ ...prev, crm: id }));
    setShowOtherCrmMessage(false);
    setShowOtherCrmInput(id === 'other');
  };

  const handleOtherCrmSubmit = () => {
    if (otherCrmInputValue.trim()) { setShowOtherCrmMessage(true); setShowOtherCrmInput(false); }
  };

  const handlePhoneNumberOption = (type: 'existing' | 'new' | 'multiple') => {
    if (type === 'multiple') { toast.info('Upgrade your plan to add multiple phone numbers.'); return; }
    if (type === 'new') {
      const r3 = () => String(Math.floor(Math.random() * 900) + 100);
      const r4 = () => String(Math.floor(Math.random() * 9000) + 1000);
      setOnboardingData(prev => ({ ...prev, phoneNumberOption: 'new', selectedAINumber: `+1 (${r3()}) ${r3()}-${r4()}` }));
    } else {
      setOnboardingData(prev => ({ ...prev, phoneNumberOption: 'existing' }));
    }
    setPhoneNumberReady(true);
  };

  const handleBack = () => { if (step > 1) setStep(s => s - 1); };
  const handleNext = () => { step === totalSteps ? onComplete() : setStep(s => s + 1); };

  const isStepValid = (): boolean => {
    switch (step) {
      case 1:  return !!onboardingData.industry;
      case 2:  return onboardingData.goals.length > 0;
      case 3:  return onboardingData.leadCaptureSources.length > 0;
      case 4:  return onboardingData.communicationChannels.length > 0;
      case 5:  return !!onboardingData.leadType;
      case 6:  return !!onboardingData.crm;
      case 7:  return !!onboardingData.teamSize;
      case 8:  return phoneNumberReady;
      case 9:  return true;
      case 10: return !!onboardingData.calendarProvider;
      default: return false;
    }
  };

  // ── Shared style helpers ─────────────────────────────────────────────────────

  const selBtn = (selected: boolean, locked = false) =>
    `border-2 rounded-xl transition-all relative ${
      selected  ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-100' :
      locked    ? 'border-purple-100 bg-purple-50/20 opacity-60' :
                  'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 hover:shadow-sm'
    }`;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-purple-200"
    >
      {/* ── Top accent strip ── */}
      <div className="h-1 bg-gradient-to-r from-purple-800 via-purple-500 to-orange-500" />

      {/* ── Card Header ── */}
      <div className="px-6 pt-5 pb-4 bg-gradient-to-br from-[#16063a] via-[#2a0d60] to-[#3b1278] border-b border-purple-900/40">
        {/* Logo + skip row */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-base font-extrabold text-white tracking-wide">QualiFlow</span>
          <button
            onClick={onSkip}
            className="text-xs text-purple-300 hover:text-white transition-colors"
          >
            Skip Setup →
          </button>
        </div>

        {/* Title row */}
        <div className="mb-4">
          <h1 className="text-lg font-bold text-white leading-tight">Account Setup</h1>
          <p className="text-xs text-purple-300 mt-0.5">
            Welcome, {userName || 'there'}! Configure your perfect workflow.
          </p>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-purple-300">Step {step} of {totalSteps}</span>
            <span className="text-[11px] font-semibold text-orange-400">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-orange-500 to-pink-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* ── Step Content ── */}
      <div className="px-6 py-5 bg-gradient-to-b from-purple-50/30 to-white">
        <AnimatePresence mode="wait">

          {/* ── STEP 1: Industry ── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-base font-semibold text-purple-950 mb-0.5">Which best describes your business?</h2>
              <p className="text-xs text-purple-400 mb-3">We use this to load the right responses and booking flows.</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {industries.map((ind) => {
                  const Icon = ind.icon;
                  const sel = onboardingData.industry === ind.id;
                  return (
                    <button key={ind.id} onClick={() => handleIndustrySelect(ind.id)}
                      className={`${selBtn(sel)} p-3 flex items-center gap-2`}>
                      <Icon className={`w-4 h-4 flex-shrink-0 ${sel ? 'text-orange-600' : 'text-purple-400'}`} />
                       <span className={`text-xs ${sel ? 'text-orange-900 font-medium' : 'text-gray-700'}`}>{ind.label}</span>
                    </button>
                  );
                })}
              </div>
              {showOtherIndustryInput && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <label className="block text-xs text-gray-700 mb-1">Tell us more about your business</label>
                  <input type="text" value={onboardingData.industryOther}
                    onChange={(e) => setOnboardingData(prev => ({ ...prev, industryOther: e.target.value }))}
                    placeholder="Describe your industry..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── STEP 2: Goals ── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-base font-semibold text-purple-950 mb-0.5">What are your top goals with QualiFlow?</h2>
              <p className="text-xs text-purple-400 mb-3">Multi-select — choose all that apply.</p>
              <div className="space-y-2">
                {goals.map((goal) => {
                  const Icon = goal.icon;
                  const isLocked = computeLocked(goal.locked, goal.plan, selectedPlan);
                  const sel = onboardingData.goals.includes(goal.id);
                  return (
                    <button key={goal.id} onClick={() => handleGoalClick(goal.id, isLocked)}
                      className={`${selBtn(sel, isLocked)} w-full p-3 flex items-center gap-3`}>
                      {isLocked && (
                        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-purple-500 text-white text-[10px] rounded-full flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" />{goal.plan}
                        </span>
                      )}
                      <Icon className={`w-4 h-4 flex-shrink-0 ${sel ? 'text-orange-600' : 'text-purple-400'}`} />
                      <span className={`text-xs flex-1 text-left ${sel ? 'text-orange-900 font-medium' : 'text-gray-700'}`}>{goal.label}</span>
                      {sel && !isLocked && <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Lead Capture Sources ── */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-base font-semibold text-purple-950 mb-0.5">Where will QualiFlow capture your leads?</h2>
              <p className="text-xs text-purple-400 mb-3">Select all the ways customers contact you today.</p>
              <div className="grid grid-cols-2 gap-2">
                {leadCaptureSources.map((src) => {
                  const Icon = src.icon;
                  const isLocked = computeLocked(src.locked, src.plan, selectedPlan);
                  const sel = onboardingData.leadCaptureSources.includes(src.id);
                  return (
                    <button key={src.id} onClick={() => handleLeadCaptureSourceClick(src.id, isLocked, src.plan)}
                      className={`${selBtn(sel, isLocked)} p-3`}>
                      {isLocked && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                          <Lock className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                      <Icon className={`w-5 h-5 mb-1.5 mx-auto ${sel ? 'text-orange-600' : 'text-purple-400'}`} />
                       <div className={`text-xs text-center ${sel ? 'text-orange-900 font-medium' : 'text-gray-700'}`}>{src.label}</div>
                      {src.desc && <div className="text-[10px] text-purple-300 text-center mt-0.5">{src.desc}</div>}
                      {isLocked && <div className="text-[10px] text-purple-500 text-center mt-0.5">{src.plan}</div>}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: Channels ── */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-base font-semibold text-purple-950 mb-0.5">Which channels do you want to use?</h2>
              <p className="text-xs text-purple-400 mb-3">Select all communication channels you&apos;d like to enable.</p>
              <div className="grid grid-cols-2 gap-2">
                {channels.map((ch) => {
                  const Icon = ch.icon;
                  const isLocked = computeLocked(ch.locked, ch.plan, selectedPlan);
                  const sel = onboardingData.communicationChannels.includes(ch.id);
                  return (
                    <button key={ch.id} onClick={() => handleChannelClick(ch.id, isLocked, ch.plan)}
                      className={`${selBtn(sel, isLocked)} p-3`}>
                      {isLocked && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                          <Lock className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                      <Icon className={`w-5 h-5 mb-1.5 mx-auto ${sel ? 'text-orange-600' : 'text-purple-400'}`} />
                       <div className={`text-xs text-center ${sel ? 'text-orange-900 font-medium' : 'text-gray-700'}`}>{ch.label}</div>
                      {isLocked && <div className="text-[10px] text-purple-500 text-center mt-0.5">{ch.plan}</div>}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── STEP 5: Lead Type ── */}
          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-base font-semibold text-purple-950 mb-0.5">What type of leads do you work with?</h2>
              <p className="text-xs text-purple-400 mb-3">This helps us understand your customer base.</p>
              <div className="space-y-2">
                {leadTypes.map((lt) => {
                  const Icon = lt.icon;
                  const sel = onboardingData.leadType === lt.id;
                  return (
                    <button key={lt.id} onClick={() => setOnboardingData(prev => ({ ...prev, leadType: lt.id }))}
                      className={`${selBtn(sel)} w-full p-3 flex items-center gap-3`}>
                      <Icon className={`w-5 h-5 flex-shrink-0 ${sel ? 'text-orange-600' : 'text-purple-400'}`} />
                      <div className="text-left flex-1">
                        <div className={`text-sm ${sel ? 'text-orange-900 font-medium' : 'text-gray-700'}`}>{lt.label}</div>
                        <div className="text-xs text-gray-500">{lt.desc}</div>
                      </div>
                      {sel && <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── STEP 6: CRM ── */}
          {step === 6 && (
            <motion.div key="s6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-base font-semibold text-purple-950 mb-0.5">Connect your CRM</h2>
              <p className="text-xs text-purple-400 mb-3">Select your CRM for seamless syncing and data updates.</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {crms.map((crm) => {
                  const sel = onboardingData.crm === crm.id;
                  return (
                    <button key={crm.id} onClick={() => handleCrmSelect(crm.id)}
                      className={`${selBtn(sel)} ${crm.recommended ? 'ring-1 ring-green-400' : ''} p-3`}>
                      {crm.recommended && (
                        <div className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-green-500 text-white text-[10px] rounded-full">Rec.</div>
                      )}
                      <div className="text-2xl mb-1 text-center">{crm.logo}</div>
                      <div className={`text-xs text-center font-medium ${sel ? 'text-orange-900' : 'text-gray-700'}`}>{crm.label}</div>
                      <div className="text-[10px] text-gray-400 text-center">{crm.desc}</div>
                    </button>
                  );
                })}
              </div>
              {showOtherCrmInput && !showOtherCrmMessage && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <label className="block text-xs text-gray-700 mb-1">Type your CRM name...</label>
                  <input type="text" value={otherCrmInputValue}
                    onChange={(e) => setOtherCrmInputValue(e.target.value)}
                    placeholder="e.g., Custom CRM, Notion..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  <button onClick={handleOtherCrmSubmit}
                    className="w-full py-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white text-sm rounded-lg">Continue</button>
                </motion.div>
              )}
              {showOtherCrmMessage && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-blue-950">We&apos;ll configure with <strong>{otherCrmInputValue}</strong>.</p>
                    <button className="mt-1 text-xs text-orange-600 hover:underline">Book Setup Call (Optional)</button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── STEP 7: Team Size ── */}
          {step === 7 && (
            <motion.div key="s7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-base font-semibold text-purple-950 mb-0.5">How many team members will use QualiFlow?</h2>
              <p className="text-xs text-purple-400 mb-3">We&apos;ll configure access and roles based on your team size.</p>
              <div className="space-y-2">
                {teamSizes.map((sz) => {
                  const sel = onboardingData.teamSize === sz.id;
                  return (
                    <button key={sz.id} onClick={() => setOnboardingData(prev => ({ ...prev, teamSize: sz.id }))}
                      className={`${selBtn(sel)} w-full p-3 flex items-center gap-3`}>
                      <Users className={`w-4 h-4 flex-shrink-0 ${sel ? 'text-orange-600' : 'text-purple-400'}`} />
                      <span className={`text-sm flex-1 text-left ${sel ? 'text-orange-900 font-medium' : 'text-gray-700'}`}>{sz.label}</span>
                      {sel && <CheckCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── STEP 8: Phone Setup ── */}
          {step === 8 && (
            <motion.div key="s8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-base font-semibold text-purple-950 mb-0.5">Set up your QualiFlow phone number</h2>
              <p className="text-xs text-purple-400 mb-3">Choose how you&apos;d like to configure your phone system.</p>

              {!phoneNumberReady && (
                <div className="space-y-3">
                  <div className="p-4 border-2 border-gray-200 rounded-xl hover:border-orange-300 transition-all">
                    <h3 className="text-sm font-medium text-blue-950 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-600" />Use My Existing Number
                    </h3>
                    <input type="tel" placeholder="+1 (555) 123-4567"
                      value={onboardingData.existingNumber}
                      onChange={(e) => setOnboardingData(prev => ({ ...prev, existingNumber: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    <button onClick={() => handlePhoneNumberOption('existing')}
                      disabled={!onboardingData.existingNumber}
                      className="w-full py-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white text-sm rounded-lg disabled:opacity-50">Connect</button>
                  </div>
                  <div className="p-4 border-2 border-gray-200 rounded-xl hover:border-orange-300 transition-all">
                    <h3 className="text-sm font-medium text-blue-950 mb-2 flex items-center gap-2">
                      <PhoneForwarded className="w-4 h-4 text-green-600" />Get a QualiFlow Number
                    </h3>
                    <button onClick={() => handlePhoneNumberOption('new')}
                      className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm rounded-lg">Generate</button>
                  </div>
                  <div className="p-4 border-2 border-purple-200 rounded-xl bg-purple-50 relative">
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-purple-500 text-white text-[10px] rounded-full flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" />Upgrade
                    </span>
                    <h3 className="text-sm font-medium text-blue-950 mb-2 flex items-center gap-2">
                      <PhoneIncoming className="w-4 h-4 text-purple-600" />Add Multiple Numbers
                    </h3>
                    <button onClick={() => handlePhoneNumberOption('multiple')}
                      className="w-full py-2 bg-purple-600 text-white text-sm rounded-lg">Learn more</button>
                  </div>
                </div>
              )}

              {phoneNumberReady && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-blue-950 mb-1">Your AI phone number is ready!</h3>
                  <p className="text-sm text-green-700">
                    {onboardingData.selectedAINumber || onboardingData.existingNumber}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── STEP 9: Business Hours ── */}
          {step === 9 && (
            <motion.div key="s9" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-base font-semibold text-purple-950 mb-0.5">Business Hours</h2>
              <p className="text-xs text-purple-400 mb-4">
                These hours only affect scheduling and routing. QualiFlow still responds 24/7.
              </p>
              <div className="p-5 bg-purple-50/60 rounded-xl border-2 border-purple-200 mb-4 flex items-center gap-4">
                <Clock className="w-10 h-10 text-purple-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Current hours:</p>
                  <p className="text-lg font-semibold text-blue-950">9 AM – 5 PM (Mon–Fri)</p>
                </div>
              </div>
              <button onClick={() => setOnboardingData(prev => ({ ...prev, businessHours: '9-5' }))}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white text-sm rounded-xl flex items-center justify-center gap-2">
                <Settings className="w-4 h-4" />Edit Business Hours →
              </button>
            </motion.div>
          )}

          {/* ── STEP 10: Calendar ── */}
          {step === 10 && (
            <motion.div key="s10" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-base font-semibold text-purple-950 mb-0.5">Connect your calendar</h2>
              <p className="text-xs text-purple-400 mb-3">
                QualiFlow reads your availability and books appointments automatically.
              </p>
              <div className="space-y-2 mb-3">
                {calendarProviders.map((pv) => {
                  const sel = onboardingData.calendarProvider === pv.id;
                  return (
                    <button key={pv.id} onClick={() => setOnboardingData(prev => ({ ...prev, calendarProvider: pv.id }))}
                      className={`${selBtn(sel)} w-full p-3 flex items-center gap-3`}>
                      <span className="text-2xl flex-shrink-0">{pv.logo}</span>
                      <div className="text-left flex-1">
                        <div className={`text-sm ${sel ? 'text-orange-900 font-medium' : 'text-gray-700'}`}>{pv.label}</div>
                        <div className="text-xs text-gray-500">{pv.desc}</div>
                      </div>
                      {sel ? <CheckCircle className="w-4 h-4 text-orange-600" /> : <ArrowRight className="w-4 h-4 text-purple-300" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-purple-500 text-center">
                ℹ️ We never modify or delete events — read-only access only.
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Navigation ── */}
      <div className="px-6 pb-6 pt-4 flex items-center justify-between border-t border-purple-100 bg-purple-50/20">
        <button
          onClick={handleBack}
          disabled={step === 1}
          className="px-4 py-2.5 border-2 border-purple-200 text-purple-700 rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />Back
        </button>
        <button
          onClick={handleNext}
          disabled={!isStepValid()}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-700 via-orange-500 to-pink-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm font-medium"
        >
          {step === totalSteps ? 'Complete Setup' : 'Continue'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </motion.div>
  );
}
