'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, PhoneOff, PhoneIncoming, PhoneOutgoing,
  Bot, User, Mic, MicOff, Volume2, CheckCircle,
} from 'lucide-react';

type CallMode = 'inbound' | 'outbound';
type CallStatus = 'idle' | 'ringing' | 'active' | 'ended';

interface ScriptLine {
  from: 'ai' | 'customer';
  text: string;
  delay: number;
}

const INBOUND_SCRIPT: ScriptLine[] = [
  { from: 'ai',       text: "Thank you for calling! You've reached QualiFlow AI. How can I assist you today?",                                                         delay: 800 },
  { from: 'customer', text: "Hi! I'm interested in your home renovation services. Do you have availability next week?",                                                 delay: 2800 },
  { from: 'ai',       text: "Absolutely! I'd love to help you schedule that. What type of renovation are you looking for?",                                             delay: 4600 },
  { from: 'customer', text: 'A kitchen remodel — mainly cabinets and countertops.',                                                                                      delay: 6400 },
  { from: 'ai',       text: "Great choice! We have openings on Tuesday at 2 PM or Thursday at 10 AM. Which works better for you?",                                      delay: 8200 },
  { from: 'customer', text: 'Tuesday at 2 PM sounds perfect.',                                                                                                           delay: 10000 },
  { from: 'ai',       text: "✅ You're booked! Tuesday at 2 PM for your kitchen remodel consultation. A confirmation SMS is on its way. Is there anything else I can help with?", delay: 11800 },
];

const OUTBOUND_SCRIPT: ScriptLine[] = [
  { from: 'ai',       text: "Hello! This is QualiFlow AI calling on behalf of Premier Services. Am I speaking with the homeowner?",                                     delay: 800 },
  { from: 'customer', text: 'Yes, this is they.',                                                                                                                       delay: 2600 },
  { from: 'ai',       text: "Wonderful! You recently requested a free estimate. I'm calling to schedule that for you. Are you still interested?",                       delay: 4200 },
  { from: 'customer', text: 'Yes, definitely!',                                                                                                                          delay: 6000 },
  { from: 'ai',       text: "Great! We have availability this week. Would Thursday morning or Friday afternoon work better for you?",                                    delay: 7600 },
  { from: 'customer', text: 'Thursday morning would be great.',                                                                                                          delay: 9400 },
  { from: 'ai',       text: "✅ Your free estimate is booked for Thursday at 10 AM. Our team will call 30 minutes before arrival. Looking forward to working with you!", delay: 11000 },
];

export default function AIVoiceCallSimulator() {
  const [mode, setMode] = useState<CallMode>('inbound');
  const [status, setStatus] = useState<CallStatus>('idle');
  const [messages, setMessages] = useState<ScriptLine[]>([]);
  const [muted, setMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const script = mode === 'inbound' ? INBOUND_SCRIPT : OUTBOUND_SCRIPT;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const clearAll = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const startCall = () => {
    clearAll();
    setMessages([]);
    setCallDuration(0);
    setStatus('ringing');

    const ringTimeout = setTimeout(() => {
      setStatus('active');
      intervalRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);

      script.forEach((line) => {
        const t = setTimeout(() => {
          setMessages(prev => [...prev, line]);
        }, line.delay);
        timeoutsRef.current.push(t);
      });

      const endTimeout = setTimeout(() => {
        setStatus('ended');
        if (intervalRef.current) clearInterval(intervalRef.current);
      }, script[script.length - 1].delay + 3000);
      timeoutsRef.current.push(endTimeout);
    }, 1800);

    timeoutsRef.current.push(ringTimeout);
  };

  const endCall = () => {
    clearAll();
    setStatus('ended');
  };

  const reset = () => {
    clearAll();
    setStatus('idle');
    setMessages([]);
    setCallDuration(0);
  };

  useEffect(() => () => clearAll(), []);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Mode Toggle */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-1 gap-1">
          {(['inbound', 'outbound'] as CallMode[]).map((m) => (
            <button
              key={m}
              onClick={() => { reset(); setMode(m); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                mode === m
                  ? 'bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white shadow-lg'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              {m === 'inbound' ? <PhoneIncoming className="w-4 h-4" /> : <PhoneOutgoing className="w-4 h-4" />}
              {m === 'inbound' ? 'Inbound Call' : 'Outbound Call'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 items-stretch">
        {/* Left — Phone UI */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-[#2D1B4E] to-[#1a0f2e] border border-white/20 rounded-3xl p-6 flex flex-col items-center gap-6 h-full min-h-[380px] justify-between">

            {/* Status */}
            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-3 ${
                status === 'idle'    ? 'bg-white/10 text-purple-200' :
                status === 'ringing' ? 'bg-blue-500/20 text-blue-300' :
                status === 'active'  ? 'bg-green-500/20 text-green-300' :
                                       'bg-gray-500/20 text-gray-300'
              }`}>
                {status === 'idle'    && <Phone className="w-3.5 h-3.5" />}
                {status === 'ringing' && <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-2 rounded-full bg-blue-400 inline-block" />}
                {status === 'active'  && <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-green-400 inline-block" />}
                {status === 'ended'   && <CheckCircle className="w-3.5 h-3.5" />}
                {status === 'idle'    ? 'Ready' : status === 'ringing' ? 'Connecting...' : status === 'active' ? `Active  ${formatDuration(callDuration)}` : 'Call Ended'}
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-purple-500/30">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <p className="text-white font-semibold mt-3">QualiFlow AI</p>
              <p className="text-purple-300 text-sm">Voice Agent</p>
            </div>

            {/* Waveform (active state) */}
            <AnimatePresence>
              {status === 'active' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1 h-10">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 bg-gradient-to-t from-purple-500 to-orange-400 rounded-full"
                      animate={{ height: [8, Math.random() * 32 + 8, 8] }}
                      transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5, delay: i * 0.05, ease: 'easeInOut' }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Call Controls */}
            <div className="flex gap-3">
              {status === 'active' && (
                <button
                  onClick={() => setMuted(!muted)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${muted ? 'bg-red-500/30 text-red-300' : 'bg-white/10 text-purple-200 hover:bg-white/20'}`}
                >
                  {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}

              {(status === 'idle' || status === 'ended') ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startCall}
                  className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/40 hover:shadow-green-500/60 transition-all"
                >
                  {mode === 'inbound' ? <PhoneIncoming className="w-6 h-6 text-white" /> : <PhoneOutgoing className="w-6 h-6 text-white" />}
                </motion.button>
              ) : status === 'ringing' ? (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <Phone className="w-6 h-6 text-white" />
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={endCall}
                  className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/40"
                >
                  <PhoneOff className="w-6 h-6 text-white" />
                </motion.button>
              )}

              {status === 'active' && (
                <button className="w-12 h-12 rounded-full bg-white/10 text-purple-200 hover:bg-white/20 flex items-center justify-center transition-all">
                  <Volume2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <p className="text-purple-300/60 text-xs text-center">
              {status === 'idle' ? `Click to simulate ${mode} call` : status === 'ended' ? 'Call completed successfully' : ''}
            </p>
          </div>
        </div>

        {/* Right — Conversation */}
        <div className="lg:col-span-3">
          <div className="bg-[#2D1B4E]/60 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden flex flex-col h-full min-h-[380px]">
            <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-white/80 text-sm font-medium">Live Transcript</span>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <AnimatePresence>
                {messages.length === 0 && status === 'idle' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-40 text-center">
                    <Phone className="w-10 h-10 text-purple-400/40 mb-3" />
                    <p className="text-purple-300/50 text-sm">Start a call to see the AI transcript</p>
                  </motion.div>
                )}
                {status === 'ringing' && messages.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-40 text-center">
                    <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 0.9 }}>
                      <Phone className="w-10 h-10 text-blue-400 mb-3" />
                    </motion.div>
                    <p className="text-blue-300 text-sm font-medium">Connecting...</p>
                  </motion.div>
                )}
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.from === 'customer' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                      msg.from === 'ai' ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gradient-to-br from-blue-500 to-blue-700'
                    }`}>
                      {msg.from === 'ai' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                    </div>
                    <div className={`flex-1 max-w-[80%] ${msg.from === 'customer' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <span className={`text-[10px] font-semibold uppercase tracking-wide ${msg.from === 'ai' ? 'text-purple-400' : 'text-blue-400'}`}>
                        {msg.from === 'ai' ? 'AI Agent' : 'Customer'}
                      </span>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.from === 'ai'
                          ? 'bg-purple-500/20 text-purple-100 border border-purple-500/30'
                          : 'bg-blue-500/20 text-blue-100 border border-blue-500/30'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {status === 'ended' && (
              <div className="px-5 py-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Appointment booked automatically
                </div>
                <button onClick={reset} className="text-xs text-purple-300 hover:text-white transition-colors underline underline-offset-2">
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
