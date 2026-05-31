'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Users, MessageCircle, Target, TrendingUp } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

type CRMPhase = 'idle' | 'updating' | 'syncing' | 'synced' | 'complete';

const contacts = [
  { name: 'Sarah M.', avatar: 'SM', newScore: 82, updatedScore: 82, updatedStatus: 'Qualified', intent: 'Hot' },
  { name: 'James T.', avatar: 'JT', newScore: 65, updatedScore: 65, updatedStatus: 'Warm', intent: 'Warm' },
  { name: 'Lisa K.',  avatar: 'LK', newScore: 91, updatedScore: 91, updatedStatus: 'Qualified', intent: 'Hot' },
];

function CRMSyncVisualScreen() {
  const [phase, setPhase] = useState<CRMPhase>('idle');
  const [activeContactIndex, setActiveContactIndex] = useState(0);
  const [contactStatus, setContactStatus] = useState(contacts[0].updatedStatus);
  const [leadScore, setLeadScore] = useState(contacts[0].updatedScore);
  const [showAppointment, setShowAppointment] = useState(false);
  const [salesforceUpdated, setSalesforceUpdated] = useState(false);
  const [hubspotUpdated, setHubspotUpdated] = useState(false);
  const [zohoUpdated, setZohoUpdated] = useState(false);
  const [mondayUpdated, setMondayUpdated] = useState(false);
  const [pipedriveUpdated, setPipedriveUpdated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const activeContact = contacts[activeContactIndex];

    if (phase === 'idle') {
      timer = setTimeout(() => {
        setSalesforceUpdated(false); setHubspotUpdated(false); setZohoUpdated(false); setMondayUpdated(false); setPipedriveUpdated(false);
        setPhase('updating');
      }, 1000);
    } else if (phase === 'updating') {
      timer = setTimeout(() => {
        setContactStatus(activeContact.updatedStatus);
        setLeadScore(activeContact.updatedScore);
        setShowAppointment(true);
        setTimeout(() => setPhase('syncing'), 200);
      }, 1500);
    } else if (phase === 'syncing') {
      timer = setTimeout(() => {
        setSalesforceUpdated(true);
        setTimeout(() => { setHubspotUpdated(true); setTimeout(() => { setZohoUpdated(true); setTimeout(() => { setMondayUpdated(true); if (isMobile) { setTimeout(() => setPhase('synced'), 150); } else { setTimeout(() => { setPipedriveUpdated(true); setTimeout(() => setPhase('synced'), 150); }, 120); } }, 120); }, 120); }, 120);
      }, 200);
    } else if (phase === 'synced') {
      timer = setTimeout(() => setPhase('complete'), 400);
    } else if (phase === 'complete') {
      timer = setTimeout(() => {
        const nextIndex = (activeContactIndex + 1) % contacts.length;
        setActiveContactIndex(nextIndex);
        setPhase('idle');
        setContactStatus(contacts[nextIndex].updatedStatus);
        setLeadScore(contacts[nextIndex].updatedScore);
        setShowAppointment(false);
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [phase, activeContactIndex, isMobile]);

  const activeContact = contacts[activeContactIndex];

  const crmPanels = [
    { name: 'Salesforce', updated: salesforceUpdated, color: 'bg-blue-500' },
    { name: 'HubSpot', updated: hubspotUpdated, color: 'bg-orange-500' },
    { name: 'Zoho', updated: zohoUpdated, color: 'bg-blue-500' },
    { name: 'Monday', updated: mondayUpdated, color: 'bg-purple-500' },
    { name: 'Pipedrive', updated: pipedriveUpdated, color: 'bg-green-500', hideMobile: true },
  ];

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-gray-400 ml-2">Qualiflow AI CRM Sync</span>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${phase === 'syncing' ? 'bg-orange-500/20 text-orange-400' : phase === 'synced' || phase === 'complete' ? 'bg-green-500/20 text-green-400' : 'bg-green-500/20 text-green-400'}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {phase === 'syncing' ? 'Syncing...' : phase === 'synced' || phase === 'complete' ? 'Synced' : 'Live'}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-0">
        {/* Left: Qualiflow AI CRM */}
        <div className="lg:col-span-5 p-5 border-b lg:border-b-0 lg:border-r border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-[#6B2D9E] to-[#FF5722] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">Q</span>
            </div>
            <div>
              <p className="text-xs text-gray-400">Built-in CRM</p>
              <p className="text-sm font-semibold text-white">Qualiflow AI</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6B2D9E] to-[#FF5722] flex items-center justify-center text-white font-bold text-sm">{activeContact.avatar}</div>
              <div>
                <p className="text-sm font-semibold text-white">{activeContact.name}</p>
                <div className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${activeContact.intent === 'Hot' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-orange-500/20 text-orange-400 border border-orange-500/50'}`}>{activeContact.intent}</div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Status</p>
              <div className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-500 bg-green-500/20 text-green-400 border border-green-500/50`}>{contactStatus}</div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500">Lead Score</p>
                <p className="text-xs font-semibold text-white">{leadScore}</p>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#6B2D9E] to-[#FF5722] transition-all duration-700 ease-out" style={{ width: `${leadScore}%` }} />
              </div>
            </div>

            <div className="transition-opacity duration-500" style={{ opacity: showAppointment ? 1 : 0 }}>
              <p className="text-xs text-gray-500 mb-2">Upcoming</p>
              <div className="flex items-center gap-2 p-2 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="w-4 h-4 text-green-400">📅</div>
                <div>
                  <p className="text-xs font-semibold text-white">Consultation Call</p>
                  <p className="text-xs text-gray-400">Tomorrow at 2:00 PM</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Recent Activity</p>
              <div className="relative min-h-[44px]">
                <div className={`absolute inset-x-0 top-0 transition-opacity duration-300 space-y-1.5 ${phase === 'syncing' || phase === 'synced' || phase === 'complete' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <div className="flex items-center gap-2 text-xs text-gray-400"><div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" /><span>Status changed to Qualified</span></div>
                  <div className="flex items-center gap-2 text-xs text-gray-400"><div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" /><span>Appointment booked</span></div>
                </div>
                <div className={`absolute inset-x-0 top-0 transition-opacity duration-300 ${phase === 'updating' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <div className="flex items-center gap-2 text-xs text-orange-400 animate-pulse"><div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" /><span className="font-semibold">Updating record...</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Sync indicator — fixed height to prevent layout shift */}
        <div className="lg:col-span-2 relative flex flex-col items-center justify-center py-4 lg:py-0 border-b lg:border-b-0 lg:border-r border-gray-700 min-h-[120px] overflow-hidden">
          {/* Syncing state */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 ${phase === 'syncing' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="space-y-3 text-center">
              <div className="flex flex-col gap-2 items-center">
                <div className="flex gap-1">{[0, 1, 2].map(i => <div key={i} className="w-1 h-8 bg-[#6B2D9E] rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}</div>
              </div>
              <p className="text-xs text-purple-300 font-semibold">Syncing in real time</p>
              <div className="flex flex-col gap-2 items-center">
                <div className="w-px h-8 bg-gradient-to-b from-[#6B2D9E] to-transparent animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-[#FF5722] animate-pulse" />
                <div className="w-px h-8 bg-gradient-to-b from-transparent to-[#6B2D9E] animate-pulse" />
              </div>
            </div>
          </div>
          {/* Synced/complete state */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 ${phase === 'synced' || phase === 'complete' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="text-center">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mb-3 mx-auto"><Check className="w-5 h-5 text-green-400" /></div>
              <p className="text-xs text-green-400 font-semibold">All CRMs up to date</p>
            </div>
          </div>
        </div>

        {/* Right: External CRMs */}
        <div className="lg:col-span-5 space-y-3 p-5">
          {crmPanels.map((crm) => (
            <div key={crm.name} className={`bg-gray-800 rounded-xl border transition-all duration-500 p-4 ${crm.hideMobile ? 'hidden md:block' : ''} ${crm.updated ? 'border-green-500/50' : 'border-gray-700'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 ${crm.color} rounded-lg flex items-center justify-center`}>
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/></svg>
                  </div>
                  <div><p className="text-xs text-gray-400">External CRM</p><p className="text-sm font-semibold text-white">{crm.name}</p></div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/50 rounded transition-opacity duration-500 ${crm.updated ? 'opacity-100' : 'opacity-0'}`}>
                  <Check className="w-3 h-3 text-green-400" /><span className="text-xs font-semibold text-green-400">Synced</span>
                </div>
              </div>
              <div className={`flex items-center gap-3 flex-wrap text-xs transition-opacity duration-500 ${crm.updated ? 'opacity-100' : 'opacity-0'}`}>
                {['Contact', 'Activity', 'Appointment'].map(label => (
                  <div key={label} className="flex items-center gap-1.5 text-gray-400"><Check className="w-3 h-3 text-green-400" /><span>{label}</span></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between px-4 pb-3 border-t border-gray-700 pt-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">{[0, 1, 2].map(i => <div key={i} className="w-1 h-3 bg-[#FF5722] rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}</div>
          <span className="text-xs text-gray-500">System active</span>
        </div>
        <div className="text-xs text-gray-500">
          {phase === 'idle' && 'Monitoring'}
          {phase === 'updating' && 'Updating Qualiflow AI'}
          {phase === 'syncing' && 'Syncing CRMs'}
          {phase === 'synced' && 'Sync complete'}
          {phase === 'complete' && 'All systems synced'}
        </div>
      </div>
    </div>
  );
}

export function CRMBuiltInSection() {
  return (
    <section className="py-28 px-6 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' stroke=\'%23fff\' stroke-width=\'1\'%3E%3Cpath d=\'M0 0h40v40H0z\'/%3E%3C/g%3E%3C/svg%3E")' }} />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-[#6B2D9E]/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-[#FF5722]/10 to-transparent rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <ScrollReveal className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-medium text-white/80">CRM Integration</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Built-in CRM, designed to work with yours
          </h2>
          <p className="text-lg text-white/70 max-w-3xl">
            Start immediately with our built-in CRM, or seamlessly sync with the tools you already use.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2} className="mb-12">
          <CRMSyncVisualScreen />
        </ScrollReveal>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, label: 'Contact Sync', sub: 'Instant updates' },
              { icon: MessageCircle, label: 'Conversation History', sub: 'Full timeline' },
              { icon: Target, label: 'Appointments', sub: 'Auto-booked' },
              { icon: TrendingUp, label: 'Lead Status', sub: 'Real-time scores' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-lg bg-[#6B2D9E] flex items-center justify-center shadow-lg">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 h-14 px-10 bg-gradient-to-r from-[#FF5722] to-[#FF6D3F] hover:from-[#E64A19] hover:to-[#FF5722] text-white font-bold text-base rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CRMBuiltInSection;
