"use client";

import { useState, useEffect } from "react";
import { Phone, Mail, Calendar, Check, Brain, Target, MessageCircle, Instagram, QrCode, FileText, Facebook, MessageSquare } from "lucide-react";

type AnimationPhase = "notifications" | "inbox" | "qualifying" | "conversation" | "reasoning" | "action" | "execution" | "learning";

interface InboxItem {
  id: number;
  channel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  contact: string;
  message: string;
  status: "new" | "qualifying" | "qualified";
  time: string;
}

const ALL_INBOX_ITEMS: InboxItem[] = [
  {
    id: 1,
    channel: "Instagram DM",
    icon: Instagram,
    color: "bg-pink-500",
    contact: "Sarah M.",
    message: "Hey, are you still offering lawn care services?",
    status: "new",
    time: "Just now"
  },
  {
    id: 2,
    channel: "Email",
    icon: Mail,
    color: "bg-blue-500",
    contact: "Michael C.",
    message: "Looking for enterprise consultation...",
    status: "new",
    time: "1 min ago"
  },
  {
    id: 3,
    channel: "SMS",
    icon: MessageCircle,
    color: "bg-green-500",
    contact: "Emma D.",
    message: "Can I schedule a consultation?",
    status: "new",
    time: "2 min ago"
  },
  {
    id: 4,
    channel: "Missed Call",
    icon: Phone,
    color: "bg-cyan-500",
    contact: "Alex M.",
    message: "Missed call",
    status: "new",
    time: "3 min ago"
  },
  {
    id: 5,
    channel: "QR Scan",
    icon: QrCode,
    color: "bg-purple-500",
    contact: "Jessica W.",
    message: "Scanned booth QR at trade show",
    status: "new",
    time: "4 min ago"
  },
  {
    id: 6,
    channel: "Form",
    icon: Target,
    color: "bg-orange-500",
    contact: "David B.",
    message: "Submitted contact form",
    status: "new",
    time: "5 min ago"
  }
];

export function AIDecisionEngineAnimation() {
  const [phase, setPhase] = useState<AnimationPhase>("notifications");
  const [notificationCount, setNotificationCount] = useState(0);
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [conversationStep, setConversationStep] = useState(0);
  const [reasoningStep, setReasoningStep] = useState(0);
  const [qualifyingStep, setQualifyingStep] = useState(0);

  // Main animation loop - runs continuously forever
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "notifications") {
      if (notificationCount < 6) {
        timer = setTimeout(() => {
          setNotificationCount(notificationCount + 1);
        }, 150);
      } else {
        timer = setTimeout(() => {
          setPhase("inbox");
          setInboxItems(ALL_INBOX_ITEMS);
        }, 600);
      }
    } else if (phase === "inbox") {
      timer = setTimeout(() => {
        setPhase("qualifying");
        setQualifyingStep(0);
      }, 1200);
    } else if (phase === "qualifying") {
      // Simplified qualifying phase - no nested timeouts
      if (qualifyingStep < 6) {
        timer = setTimeout(() => {
          setInboxItems(prev => {
            const newItems = [...prev];
            if (qualifyingStep < 6) {
              const targetItem = newItems[qualifyingStep];
              if (targetItem) {
                targetItem.status = qualifyingStep === 5 ? "qualified" : "qualifying";
              }
            }
            return newItems;
          });
          setQualifyingStep(qualifyingStep + 1);
        }, 250);
      } else {
        timer = setTimeout(() => {
          setPhase("conversation");
          setConversationStep(0);
        }, 300);
      }
    } else if (phase === "conversation") {
      if (conversationStep < 3) {
        timer = setTimeout(() => {
          setConversationStep(conversationStep + 1);
        }, conversationStep === 1 ? 800 : 700);
      } else {
        timer = setTimeout(() => {
          setPhase("reasoning");
          setReasoningStep(0);
        }, 600);
      }
    } else if (phase === "reasoning") {
      if (reasoningStep < 3) {
        timer = setTimeout(() => {
          setReasoningStep(reasoningStep + 1);
        }, 400);
      } else {
        timer = setTimeout(() => {
          setPhase("action");
        }, 500);
      }
    } else if (phase === "action") {
      timer = setTimeout(() => {
        setPhase("execution");
      }, 900);
    } else if (phase === "execution") {
      timer = setTimeout(() => {
        setPhase("learning");
      }, 1200);
    } else if (phase === "learning") {
      // Loop back to start - continuous infinite loop
      timer = setTimeout(() => {
        setPhase("notifications");
        setNotificationCount(0);
        setInboxItems([]);
        setConversationStep(0);
        setReasoningStep(0);
        setQualifyingStep(0);
      }, 900);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [phase, notificationCount, conversationStep, reasoningStep, qualifyingStep]);

  const reasoningSteps = [
    { label: "Intent detected: Lawn care booking" },
    { label: "Confidence score: High" },
    { label: "Urgency: Immediate" },
    { label: "Availability found" }
  ];

  const actions = [
    { label: "Book appointment", isSelected: true },
    { label: "Send info email", isSelected: false },
    { label: "Add to nurture", isSelected: false }
  ];

  const notificationItems = ALL_INBOX_ITEMS.slice(0, notificationCount);

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-3xl mx-auto lg:w-[650px]">
      {/* macOS Window Header */}
      <div className="bg-gradient-to-b from-gray-100 to-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shrink-0">
        {/* Window Controls */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>

        {/* Status */}
        <div className="text-xs text-gray-500">Real-Time</div>
      </div>

      {/* Main Dashboard Panel */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 h-[320px] sm:h-[350px] lg:h-[480px] relative overflow-hidden overflow-y-auto">
        {/* PHASE 1: NOTIFICATIONS */}
        {phase === "notifications" && (
          <div className="p-6">
            <div className="space-y-2 mb-6">
              {notificationItems.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-gray-800 border-l-2 border-orange-500 rounded-lg animate-in slide-in-from-right"
                  >
                    <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <IconComp className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-300">{item.channel} received</p>
                      <p className="text-sm text-white font-medium truncate">{item.contact}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></div>
                  </div>
                );
              })}
            </div>
            <div className="text-center text-xs text-gray-400 mt-8">
              <div className="flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                <span>Incoming leads detected</span>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 2: INBOX */}
        {phase === "inbox" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-200">Inbox</h3>
              <div className="px-2 py-1 bg-slate-700 rounded text-xs text-gray-300">
                {inboxItems.length} new
              </div>
            </div>
            <div className="space-y-2">
              {inboxItems.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 transition-colors"
                  >
                    <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <IconComp className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-white">{item.contact}</p>
                        <span className="text-xs text-gray-400">• {item.time}</span>
                      </div>
                      <p className="text-xs text-gray-300 truncate">{item.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.channel}</p>
                    </div>
                    <div className="px-2 py-1 bg-blue-500/20 border border-blue-500/50 rounded text-xs text-blue-400 font-semibold">
                      New
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PHASE 3: QUALIFYING */}
        {phase === "qualifying" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-200">Inbox</h3>
              <div className="px-2 py-1 bg-slate-700 rounded text-xs text-gray-300">
                AI qualifying...
              </div>
            </div>
            <div className="space-y-2">
              {inboxItems.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-gray-800 border border-gray-700 rounded-lg transition-all"
                  >
                    <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <IconComp className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-white">{item.contact}</p>
                        <span className="text-xs text-gray-400">• {item.time}</span>
                      </div>
                      <p className="text-xs text-gray-300 truncate">{item.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.channel}</p>
                    </div>
                    {item.status === "new" && (
                      <div className="px-2 py-1 bg-blue-500/20 border border-blue-500/50 rounded text-xs text-blue-400 font-semibold">
                        New
                      </div>
                    )}
                    {item.status === "qualifying" && (
                      <div className="px-2 py-1 bg-orange-500/20 border border-orange-500/50 rounded text-xs text-orange-400 font-semibold animate-pulse">
                        Qualifying
                      </div>
                    )}
                    {item.status === "qualified" && (
                      <div className="px-2 py-1 bg-green-500/20 border border-green-500/50 rounded text-xs text-green-400 font-semibold">
                        Qualified
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PHASE 4: CONVERSATION */}
        {phase === "conversation" && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
              <div className={`w-10 h-10 ${inboxItems[0]?.color} rounded-lg flex items-center justify-center`}>
                {inboxItems[0]?.icon && (() => {
                  const IconComp = inboxItems[0].icon;
                  return <IconComp className="w-5 h-5 text-white" />;
                })()}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{inboxItems[0]?.contact}</p>
                <p className="text-xs text-gray-400">{inboxItems[0]?.channel}</p>
              </div>
            </div>
            <div className="space-y-4">
              {conversationStep >= 0 && (
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6B2D9E] to-[#FF5722] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    SM
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 max-w-[75%]">
                    <p className="text-sm text-white">Hey, are you still offering lawn care services?</p>
                  </div>
                </div>
              )}
              {conversationStep >= 1 && (
                <div className="flex justify-center">
                  <div className="px-3 py-1 bg-gradient-to-r from-[#6B2D9E]/20 to-[#FF5722]/20 border border-[#6B2D9E]/50 rounded-full">
                    <p className="text-xs text-purple-300">AI qualifying lead...</p>
                  </div>
                </div>
              )}
              {conversationStep >= 2 && (
                <div className="flex justify-end">
                  <div className="bg-gray-700 rounded-lg p-3 max-w-[75%]">
                    <p className="text-xs text-gray-400 mb-1">QualiflowAI</p>
                    <p className="text-sm text-white">Yes — we are currently accepting new lawn care clients. What type of service are you looking for?</p>
                  </div>
                </div>
              )}
              {conversationStep >= 3 && (
                <>
                  <div className="flex justify-center">
                    <div className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full">
                      <p className="text-xs text-gray-400">Intent detected • Service identified • Ready to book</p>
                    </div>
                  </div>
                  <div className="flex justify-center mt-2">
                    <div className="px-3 py-1.5 bg-gray-800/50 border border-gray-700/50 rounded-lg flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#6B2D9E] to-[#FF5722] flex items-center justify-center text-white text-xs font-bold">
                        AM
                      </div>
                      <p className="text-xs text-gray-500">Assigned to Alex M.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* PHASE 5: AI REASONING */}
        {phase === "reasoning" && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#6B2D9E] to-[#FF5722] rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">AI Reasoning</p>
                <p className="text-xs text-gray-400">Analyzing context...</p>
              </div>
            </div>
            <div className="space-y-3">
              {reasoningSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 ${
                    idx <= reasoningStep
                      ? "bg-gray-800 border-gray-700 opacity-100"
                      : "bg-gray-800/30 border-gray-700/30 opacity-30"
                  }`}
                >
                  {idx <= reasoningStep ? (
                    <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 bg-gray-700 rounded flex-shrink-0 mt-0.5"></div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{step.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHASE 6: NEXT BEST ACTION */}
        {phase === "action" && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#FF5722] rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Next Best Action</p>
                <p className="text-xs text-gray-400">Selecting optimal response...</p>
              </div>
            </div>
            <div className="space-y-3">
              {actions.map((action, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    action.isSelected
                      ? "bg-gradient-to-r from-[#6B2D9E]/30 to-[#FF5722]/30 border-[#FF5722] shadow-lg"
                      : "bg-gray-800/50 border-gray-700/50 opacity-40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {action.isSelected && (
                        <div className="w-6 h-6 bg-[#FF5722] rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <p className="text-sm font-semibold text-white">{action.label}</p>
                    </div>
                    {action.isSelected && (
                      <div className="px-2 py-1 bg-green-500/20 border border-green-500/50 rounded">
                        <span className="text-xs font-semibold text-green-400">Selected</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHASE 7: EXECUTION */}
        {phase === "execution" && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">AI Execution</p>
                <p className="text-xs text-gray-400">Booking appointment...</p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-4">
              <p className="text-xs text-gray-500 mb-3">Available Time Slots</p>
              <div className="grid grid-cols-2 gap-2">
                {["Tomorrow 2:00 PM", "Tomorrow 3:30 PM", "Friday 10:00 AM", "Friday 2:00 PM"].map((slot, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded text-center text-xs font-medium transition-all ${
                      idx === 1
                        ? "bg-gradient-to-r from-[#6B2D9E] to-[#FF5722] text-white"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {slot}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <p className="text-sm font-semibold text-green-400">Appointment booked automatically</p>
              </div>
              <p className="text-xs text-gray-400 mt-1 ml-7">Confirmation sent to customer</p>
            </div>
          </div>
        )}

        {/* PHASE 8: LEARNING */}
        {phase === "learning" && (
          <div className="p-6 flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 bg-gradient-to-br from-[#6B2D9E] to-[#FF5722] rounded-2xl flex items-center justify-center mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white mb-1">Outcome Recorded</p>
              <p className="text-xs text-gray-400">Decision model updated</p>
            </div>
            <div className="flex gap-2 mt-4">
              <div className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full">
                <span className="text-xs text-gray-400">Adaptive AI</span>
              </div>
              <div className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full">
                <span className="text-xs text-gray-400">Continuous Learning</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* System Activity Indicator */}
      <div className="mt-4 flex items-center justify-between px-4">
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
          <span className="text-xs text-white/70">Processing leads</span>
        </div>
        <div className="text-xs text-white/70">
          {phase === "notifications" && "Incoming leads"}
          {phase === "inbox" && "Unified inbox"}
          {phase === "qualifying" && "AI qualifying"}
          {phase === "conversation" && "In conversation"}
          {phase === "reasoning" && "Analyzing"}
          {phase === "action" && "Selecting action"}
          {phase === "execution" && "Executing"}
          {phase === "learning" && "Learning"}
        </div>
      </div>

      {/* Static Channel Icons */}
      <div className="mt-3 px-4 pb-3">
        <div className="flex items-center justify-center gap-2 lg:gap-3">
          {/* Phone */}
          <div className="relative group">
            <button 
              className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
              aria-label="Phone channel: 127 leads"
            >
              <Phone className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                <p className="text-xs font-semibold">Phone</p>
                <p className="text-sm font-bold text-cyan-400">127 leads</p>
              </div>
              <div className="w-2 h-2 bg-gray-900 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
            </div>
          </div>

          {/* QR Scan */}
          <div className="relative group">
            <button 
              className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
              aria-label="QR Scan channel: 89 leads"
            >
              <QrCode className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                <p className="text-xs font-semibold">QR Scan</p>
                <p className="text-sm font-bold text-purple-400">89 leads</p>
              </div>
              <div className="w-2 h-2 bg-gray-900 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
            </div>
          </div>

          {/* Form */}
          <div className="relative group">
            <button 
              className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
              aria-label="Form channel: 203 leads"
            >
              <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                <p className="text-xs font-semibold">Form</p>
                <p className="text-sm font-bold text-orange-400">203 leads</p>
              </div>
              <div className="w-2 h-2 bg-gray-900 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
            </div>
          </div>

          {/* Email */}
          <div className="relative group">
            <button 
              className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
              aria-label="Email channel: 312 leads"
            >
              <Mail className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                <p className="text-xs font-semibold">Email</p>
                <p className="text-sm font-bold text-blue-400">312 leads</p>
              </div>
              <div className="w-2 h-2 bg-gray-900 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
            </div>
          </div>

          {/* Instagram */}
          <div className="relative group">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200">
              <Instagram className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                <p className="text-xs font-semibold">Instagram</p>
                <p className="text-sm font-bold text-pink-400">178 leads</p>
              </div>
              <div className="w-2 h-2 bg-gray-900 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
            </div>
          </div>

          {/* Facebook */}
          <div className="relative group">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200">
              <Facebook className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                <p className="text-xs font-semibold">Facebook</p>
                <p className="text-sm font-bold text-blue-400">156 leads</p>
              </div>
              <div className="w-2 h-2 bg-gray-900 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
            </div>
          </div>

          {/* Web Chat */}
          <div className="relative group">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200">
              <MessageCircle className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                <p className="text-xs font-semibold">Web Chat</p>
                <p className="text-sm font-bold text-green-400">245 leads</p>
              </div>
              <div className="w-2 h-2 bg-gray-900 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
            </div>
          </div>

          {/* SMS */}
          <div className="relative group">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200">
              <MessageSquare className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                <p className="text-xs font-semibold">SMS</p>
                <p className="text-sm font-bold text-emerald-400">134 leads</p>
              </div>
              <div className="w-2 h-2 bg-gray-900 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
