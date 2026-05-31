"use client";

import { useState, useEffect } from "react";
import { Users, Calendar, Check, MessageCircle, Phone } from "lucide-react";

type AnimationPhase = "idle" | "updating" | "syncing" | "synced" | "complete";

// Contact data with source and intent
const contacts = [
  {
    name: "Sarah Johnson",
    initials: "SJ",
    email: "sarah.j@company.com",
    source: "Web Chat",
    intent: "Hot",
    newStatus: "New",
    updatedStatus: "Qualified",
    newScore: 68,
    updatedScore: 92,
    color: "from-[#6B2D9E] to-[#FF5722]"
  },
  {
    name: "Michael Chen",
    initials: "MC",
    email: "mike.chen@email.com",
    source: "Facebook",
    intent: "Warm",
    newStatus: "New",
    updatedStatus: "Interested",
    newScore: 74,
    updatedScore: 85,
    color: "from-[#3B82F6] to-[#06B6D4]"
  },
  {
    name: "Lisa Rodriguez",
    initials: "LR",
    email: "l.rodriguez@corp.com",
    source: "Phone",
    intent: "Hot",
    newStatus: "New",
    updatedStatus: "Qualified",
    newScore: 82,
    updatedScore: 96,
    color: "from-[#EC4899] to-[#F97316]"
  },
  {
    name: "David Park",
    initials: "DP",
    email: "david.p@business.io",
    source: "Instagram",
    intent: "Warm",
    newStatus: "New",
    updatedStatus: "Follow-up",
    newScore: 65,
    updatedScore: 79,
    color: "from-[#8B5CF6] to-[#EC4899]"
  }
];

export function CRMSyncVisualScreen() {
  const [phase, setPhase] = useState<AnimationPhase>("idle");
  const [activeContactIndex, setActiveContactIndex] = useState(0);
  const [contactStatus, setContactStatus] = useState(contacts[0].newStatus);
  const [leadScore, setLeadScore] = useState(contacts[0].newScore);
  const [showAppointment, setShowAppointment] = useState(false);
  const [salesforceUpdated, setSalesforceUpdated] = useState(false);
  const [hubspotUpdated, setHubspotUpdated] = useState(false);
  const [zohoUpdated, setZohoUpdated] = useState(false);
  const [mondayUpdated, setMondayUpdated] = useState(false);
  const [pipedriveUpdated, setPipedriveUpdated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const activeContact = contacts[activeContactIndex];

  useEffect(() => {
    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "idle") {
      timer = setTimeout(() => {
        setPhase("updating");
      }, 400);
    } else if (phase === "updating") {
      // Update QualiflowAI CRM
      timer = setTimeout(() => {
        setContactStatus(activeContact.updatedStatus);
        setLeadScore(activeContact.updatedScore);
        setShowAppointment(true);
        setTimeout(() => {
          setPhase("syncing");
        }, 200);
      }, 150);
    } else if (phase === "syncing") {
      // Sync to external CRMs
      timer = setTimeout(() => {
        setSalesforceUpdated(true);
        setTimeout(() => {
          setHubspotUpdated(true);
          setTimeout(() => {
            setZohoUpdated(true);
            // On mobile, continue to Monday only, then stop. On desktop, continue to Monday and Pipedrive
            setTimeout(() => {
              setMondayUpdated(true);
              if (isMobile) {
                setTimeout(() => {
                  setPhase("synced");
                }, 150);
              } else {
                setTimeout(() => {
                  setPipedriveUpdated(true);
                  setTimeout(() => {
                    setPhase("synced");
                  }, 150);
                }, 120);
              }
            }, 120);
          }, 120);
        }, 120);
      }, 200);
    } else if (phase === "synced") {
      timer = setTimeout(() => {
        setPhase("complete");
      }, 400);
    } else if (phase === "complete") {
      timer = setTimeout(() => {
        // Cycle to next contact
        const nextIndex = (activeContactIndex + 1) % contacts.length;
        setActiveContactIndex(nextIndex);

        // Reset with new contact's data
        setPhase("idle");
        setContactStatus(contacts[nextIndex].newStatus);
        setLeadScore(contacts[nextIndex].newScore);
        setShowAppointment(false);
        setSalesforceUpdated(false);
        setHubspotUpdated(false);
        setZohoUpdated(false);
        setMondayUpdated(false);
        setPipedriveUpdated(false);
      }, 400);
    }

    return () => clearTimeout(timer);
  }, [phase, isMobile, activeContactIndex, activeContact]);

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* macOS Window Header */}
      <div className="bg-gradient-to-b from-gray-100 to-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
        {/* Window Controls */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>

        {/* Title */}
        <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            CRM Sync Engine
          </span>
        </div>

        {/* Status */}
        <div className="text-xs text-gray-500">Real-Time</div>
      </div>

      {/* Main Visual Frame - Light Mode System Screen */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl relative overflow-hidden">
        {/* Three-Column Layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 p-4 lg:p-6 lg:min-h-[700px]">
          {/* LEFT: QualiFlow CRM */}
          <div className="lg:col-span-5">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-3 lg:p-4 h-full">
              {/* Header */}
              <div className="flex items-center gap-2 mb-3 lg:mb-4 pb-2 lg:pb-3 border-b border-gray-700">
                <div className="w-8 h-8 bg-gradient-to-br from-[#6B2D9E] to-[#FF5722] rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400">QualiflowAI CRM</p>
                  <p className="text-sm font-semibold text-white">Contact Record</p>
                </div>
                {(phase === "synced" || phase === "complete") && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-700/50 rounded">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#6B2D9E] to-[#FF5722] flex items-center justify-center text-white text-xs font-bold">
                      JR
                    </div>
                    <span className="text-xs text-gray-500">Jordan R.</span>
                  </div>
                )}
              </div>

              {/* Contact Card */}
              <div className={`space-y-4 transition-all duration-500 ${
                phase === "updating" ? "ring-2 ring-[#6B2D9E] rounded-lg p-3 -m-3" : ""
              }`}>
                {/* Contact Info */}
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${activeContact.color} flex items-center justify-center text-white text-sm font-bold`}>
                    {activeContact.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{activeContact.name}</p>
                    <p className="text-xs text-gray-400">{activeContact.email}</p>
                  </div>
                </div>

                {/* Source & Intent */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Lead Info</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Source Badge */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full">
                      {activeContact.source === "Web Chat" && <MessageCircle className="w-3 h-3 text-blue-400" />}
                      {activeContact.source === "Facebook" && (
                        <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      )}
                      {activeContact.source === "Phone" && <Phone className="w-3 h-3 text-blue-400" />}
                      {activeContact.source === "Instagram" && (
                        <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                        </svg>
                      )}
                      <span className="text-xs font-semibold text-blue-400">{activeContact.source}</span>
                    </div>

                    {/* Intent Badge */}
                    <div className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                      activeContact.intent === "Hot"
                        ? "bg-red-500/20 text-red-400 border border-red-500/50"
                        : "bg-orange-500/20 text-orange-400 border border-orange-500/50"
                    }`}>
                      {activeContact.intent}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Status</p>
                  <div className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-500 ${
                    contactStatus === "New" || contactStatus === activeContact.newStatus
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                      : "bg-green-500/20 text-green-400 border border-green-500/50"
                  }`}>
                    {contactStatus}
                  </div>
                </div>

                {/* Lead Score */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500">Lead Score</p>
                    <p className="text-xs font-semibold text-white">{leadScore}</p>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#6B2D9E] to-[#FF5722] transition-all duration-700 ease-out"
                      style={{ width: `${leadScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Appointment (appears when updated) */}
                <div className={`transition-opacity duration-500 ${showAppointment ? 'opacity-100' : 'opacity-0'}`}>
                  <p className="text-xs text-gray-500 mb-2">Upcoming</p>
                  <div className="flex items-center gap-2 p-2 bg-gray-700/50 rounded-lg border border-gray-600">
                    <Calendar className="w-4 h-4 text-green-400" />
                    <div>
                      <p className="text-xs font-semibold text-white">Consultation Call</p>
                      <p className="text-xs text-gray-400">Tomorrow at 2:00 PM</p>
                    </div>
                  </div>
                </div>

                {/* Activity Log */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Recent Activity</p>
                  <div className="space-y-1.5">
                    {phase === "updating" && (
                      <div className="flex items-center gap-2 text-xs text-orange-400 animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                        <span className="font-semibold">Updating record...</span>
                      </div>
                    )}
                    {(phase === "syncing" || phase === "synced" || phase === "complete") && (
                      <>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                          <span>Status changed to Qualified</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                          <span>Appointment booked</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER: Sync Layer */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center py-4 lg:py-0">
            {/* Sync Indicators */}
            {phase === "syncing" && (
              <div className="space-y-4">
                {/* Animated sync bars */}
                <div className="flex flex-col gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1 h-8 bg-[#6B2D9E] rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* System Text */}
                <div className="text-center">
                  <p className="text-xs text-purple-300 font-semibold mb-1">Syncing in real time</p>
                  <p className="text-xs text-gray-500">CRM update in progress</p>
                </div>

                {/* Connecting Lines */}
                <div className="flex flex-col gap-2 items-center">
                  <div className="w-px h-8 bg-gradient-to-b from-[#6B2D9E] to-transparent animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-[#FF5722] animate-pulse"></div>
                  <div className="w-px h-8 bg-gradient-to-b from-transparent to-[#6B2D9E] animate-pulse"></div>
                </div>
              </div>
            )}

            {(phase === "synced" || phase === "complete") && (
              <div className="text-center">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <Check className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-xs text-green-400 font-semibold">All CRMs up to date</p>
              </div>
            )}
          </div>

          {/* RIGHT: External CRMs */}
          <div className="lg:col-span-5 space-y-3 lg:space-y-4">
            {/* Salesforce Panel */}
            <div className={`bg-gray-800 rounded-xl border transition-all duration-500 p-4 ${
              salesforceUpdated ? "border-green-500/50 bg-gray-800" : "border-gray-700"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">External CRM</p>
                    <p className="text-sm font-semibold text-white">Salesforce</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/50 rounded transition-opacity duration-500 ${
                  salesforceUpdated ? 'opacity-100' : 'opacity-0'
                }`}>
                  <Check className="w-3 h-3 text-green-400" />
                  <span className="text-xs font-semibold text-green-400">Synced</span>
                </div>
              </div>
              <div className={`flex items-center gap-3 flex-wrap text-xs transition-opacity duration-500 ${
                salesforceUpdated ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Check className="w-3 h-3 text-green-400" />
                  <span>Contact</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Check className="w-3 h-3 text-green-400" />
                  <span>Activity</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Check className="w-3 h-3 text-green-400" />
                  <span>Appointment</span>
                </div>
              </div>
            </div>

            {/* HubSpot Panel */}
            <div className={`bg-gray-800 rounded-xl border transition-all duration-500 p-4 ${
              hubspotUpdated ? "border-green-500/50 bg-gray-800" : "border-gray-700"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">External CRM</p>
                    <p className="text-sm font-semibold text-white">HubSpot</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/50 rounded transition-opacity duration-500 ${
                  hubspotUpdated ? 'opacity-100' : 'opacity-0'
                }`}>
                  <Check className="w-3 h-3 text-green-400" />
                  <span className="text-xs font-semibold text-green-400">Synced</span>
                </div>
              </div>
              <div className={`flex items-center gap-3 flex-wrap text-xs transition-opacity duration-500 ${
                hubspotUpdated ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Check className="w-3 h-3 text-green-400" />
                  <span>Contact</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Check className="w-3 h-3 text-green-400" />
                  <span>Activity</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Check className="w-3 h-3 text-green-400" />
                  <span>Appointment</span>
                </div>
              </div>
            </div>

            {/* Zoho Panel */}
            <div className={`bg-gray-800 rounded-xl border transition-all duration-500 p-4 ${
              zohoUpdated ? "border-green-500/50 bg-gray-800" : "border-gray-700"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">External CRM</p>
                    <p className="text-sm font-semibold text-white">Zoho</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/50 rounded transition-opacity duration-500 ${
                  zohoUpdated ? 'opacity-100' : 'opacity-0'
                }`}>
                  <Check className="w-3 h-3 text-green-400" />
                  <span className="text-xs font-semibold text-green-400">Synced</span>
                </div>
              </div>
              <div className={`flex items-center gap-3 flex-wrap text-xs transition-opacity duration-500 ${
                zohoUpdated ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Check className="w-3 h-3 text-green-400" />
                  <span>Contact</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Check className="w-3 h-3 text-green-400" />
                  <span>Activity</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Check className="w-3 h-3 text-green-400" />
                  <span>Appointment</span>
                </div>
              </div>
            </div>

            {/* Monday Panel */}
            <div className={`bg-gray-800 rounded-xl border transition-all duration-500 p-4 ${
              mondayUpdated ? "border-green-500/50 bg-gray-800" : "border-gray-700"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">External CRM</p>
                    <p className="text-sm font-semibold text-white">Monday</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/50 rounded transition-opacity duration-500 ${
                  mondayUpdated ? 'opacity-100' : 'opacity-0'
                }`}>
                  <Check className="w-3 h-3 text-green-400" />
                  <span className="text-xs font-semibold text-green-400">Synced</span>
                </div>
              </div>
              <div className={`flex items-center gap-3 flex-wrap text-xs transition-opacity duration-500 ${
                mondayUpdated ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Check className="w-3 h-3 text-green-400" />
                  <span>Contact</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Check className="w-3 h-3 text-green-400" />
                  <span>Activity</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Check className="w-3 h-3 text-green-400" />
                  <span>Appointment</span>
                </div>
              </div>
            </div>

            {/* Pipedrive Panel */}
            <div className={`bg-gray-800 rounded-xl border transition-all duration-500 p-4 hidden md:block ${
              pipedriveUpdated ? "border-green-500/50 bg-gray-800" : "border-gray-700"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">External CRM</p>
                    <p className="text-sm font-semibold text-white">Pipedrive</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/50 rounded transition-opacity duration-500 ${
                  pipedriveUpdated ? 'opacity-100' : 'opacity-0'
                }`}>
                  <Check className="w-3 h-3 text-green-400" />
                  <span className="text-xs font-semibold text-green-400">Synced</span>
                </div>
              </div>
              <div className={`flex items-center gap-3 flex-wrap text-xs transition-opacity duration-500 ${
                pipedriveUpdated ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Check className="w-3 h-3 text-green-400" />
                  <span>Contact</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Check className="w-3 h-3 text-green-400" />
                  <span>Activity</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Check className="w-3 h-3 text-green-400" />
                  <span>Appointment</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Activity Indicator */}
        <div className="mt-4 flex items-center justify-between px-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 h-3 bg-[#FF5722] rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>
            <span className="text-xs text-gray-600">System active</span>
          </div>
          <div className="text-xs text-gray-500">
            {phase === "idle" && "Monitoring"}
            {phase === "updating" && "Updating QualiflowAI"}
            {phase === "syncing" && "Syncing CRMs"}
            {phase === "synced" && "Sync complete"}
            {phase === "complete" && "All systems synced"}
          </div>
        </div>
      </div>
    </div>
  );
}
