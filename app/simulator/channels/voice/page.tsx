'use client';

/**
 * Voice Call Simulator Page
 * Test voice calls and AI voice agents
 */

import { useState, useEffect } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  FileText,
  Bot,
  User,
  Radio,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { simulatorWebhooksService, ProvisionedNumber } from '@/services/api/simulator-webhooks.service';
import { useSimulatorTheme } from '../../SimulatorThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type CallStatus = 'idle' | 'ringing' | 'connected' | 'ended';

interface TranscriptEntry {
  id: string;
  speaker: 'ai' | 'caller';
  text: string;
  timestamp: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

const callScripts = [
  { id: 'sales', name: 'Sales Inquiry', description: 'Handles product questions and pricing' },
  { id: 'support', name: 'Support Call', description: 'Technical support and troubleshooting' },
  { id: 'booking', name: 'Appointment Booking', description: 'Schedule appointments and demos' },
  { id: 'follow-up', name: 'Follow-up Call', description: 'Post-purchase check-in' },
];

const mockTranscript: TranscriptEntry[] = [
  { id: '1', speaker: 'ai', text: 'Hello! Thank you for calling Qualiflow AI. How can I assist you today?', timestamp: 0, sentiment: 'positive' },
  { id: '2', speaker: 'caller', text: "Hi, I'm interested in learning more about your pricing plans.", timestamp: 5, sentiment: 'neutral' },
  { id: '3', speaker: 'ai', text: "Great! I'd be happy to help you with that. We have three main plans: SmartFlow at $99/month, UltraFlow at $199/month, and Enterprise with custom pricing. What size is your team?", timestamp: 8, sentiment: 'positive' },
  { id: '4', speaker: 'caller', text: 'We have about 25 people on our sales team.', timestamp: 18, sentiment: 'neutral' },
  { id: '5', speaker: 'ai', text: 'Perfect! For a team of 25, I would recommend our UltraFlow plan. It includes unlimited agents, 2000 AI interactions per month, and priority support. Would you like me to schedule a demo with one of our specialists?', timestamp: 22, sentiment: 'positive' },
];

export default function VoiceSimulatorPage() {
  const { darkMode } = useSimulatorTheme();
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [selectedScript, setSelectedScript] = useState(callScripts[0]);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentTranscriptIndex, setCurrentTranscriptIndex] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('+15551234567');
  const [provisionedNumbers, setProvisionedNumbers] = useState<ProvisionedNumber[]>([]);
  const [selectedBusinessNumber, setSelectedBusinessNumber] = useState<string>('');
  const [isLoadingNumbers, setIsLoadingNumbers] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);
  const [twimlResponse, setTwimlResponse] = useState<string | null>(null);

  // Fetch provisioned phone numbers on mount
  useEffect(() => {
    const fetchNumbers = async () => {
      setIsLoadingNumbers(true);
      try {
        const numbers = await simulatorWebhooksService.getProvisionedNumbers();
        setProvisionedNumbers(numbers);
        if (numbers.length > 0) {
          setSelectedBusinessNumber(numbers[0].phoneNumber);
        }
      } catch (error) {
        console.error('Error fetching provisioned numbers:', error);
      } finally {
        setIsLoadingNumbers(false);
      }
    };
    fetchNumbers();
  }, []);

  // Simulate call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  // Simulate transcript appearing during call
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (callStatus === 'connected' && currentTranscriptIndex < mockTranscript.length) {
      const nextEntry = mockTranscript[currentTranscriptIndex];
      const delay = currentTranscriptIndex === 0 ? 2000 : (nextEntry.timestamp - (mockTranscript[currentTranscriptIndex - 1]?.timestamp || 0)) * 1000;
      
      timeout = setTimeout(() => {
        setTranscript((prev) => [...prev, nextEntry]);
        setCurrentTranscriptIndex((i) => i + 1);
      }, delay);
    }
    return () => clearTimeout(timeout);
  }, [callStatus, currentTranscriptIndex]);

  const handleStartCall = async () => {
    if (!selectedBusinessNumber) {
      setLastError('No business number configured');
      return;
    }

    setCallStatus('ringing');
    setCallDuration(0);
    setTranscript([]);
    setCurrentTranscriptIndex(0);
    setLastError(null);
    setTwimlResponse(null);

    try {
      // Call the real Twilio voice webhook
      const result = await simulatorWebhooksService.simulateInboundVoice({
        from: phoneNumber,
        to: selectedBusinessNumber,
        callerCity: 'Test City',
        callerState: 'CA',
        callerCountry: 'US',
      });

      if (result.success) {
        setCallStatus('connected');
        setTwimlResponse(result.twimlResponse || null);
        
        // Add initial AI response to transcript
        setTranscript([{
          id: '1',
          speaker: 'ai',
          text: 'Call connected. Lead created/updated. Recording started.',
          timestamp: 0,
          sentiment: 'positive',
        }]);
      } else {
        setCallStatus('ended');
        setLastError(result.error || 'Failed to connect call');
        setTimeout(() => setCallStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('Error simulating voice call:', error);
      setCallStatus('ended');
      setLastError('Failed to connect to webhook endpoint');
      setTimeout(() => setCallStatus('idle'), 2000);
    }
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    setTimeout(() => {
      setCallStatus('idle');
    }, 2000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500">
                <Radio className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold">Voice Call Simulator</h1>
                <p className="text-xs text-slate-400">Test AI voice agents and call scripts</p>
              </div>
            </div>
            {isLoadingNumbers ? (
              <Badge variant="outline" className="border-slate-500/50 text-slate-400 gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading...
              </Badge>
            ) : provisionedNumbers.length > 0 ? (
              <Badge variant="outline" className="border-rose-500/50 text-rose-400 gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Voice Ready
              </Badge>
            ) : (
              <Badge variant="outline" className="border-amber-500/50 text-amber-400 gap-1.5">
                <AlertCircle className="w-3 h-3" />
                No Numbers Configured
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Configuration Panel */}
        <aside className={cn(
          "w-80 shrink-0 border-r overflow-y-auto",
          darkMode ? "border-slate-800 bg-slate-900/30" : "border-slate-200 bg-slate-50"
        )}>
          <div className="p-4 space-y-6">
            {/* Business Number Selection */}
            {provisionedNumbers.length > 0 && (
              <div>
                <Label className={cn("text-xs uppercase tracking-wider mb-3 block", darkMode ? "text-slate-400" : "text-slate-500")}>
                  Business Number (To)
                </Label>
                <Select value={selectedBusinessNumber} onValueChange={setSelectedBusinessNumber}>
                  <SelectTrigger className={cn(darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-300")}>
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    {provisionedNumbers.map((num) => (
                      <SelectItem key={num.id} value={num.phoneNumber}>
                        {num.friendlyName || num.phoneNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {provisionedNumbers.length === 0 && !isLoadingNumbers && (
              <div className={cn("p-4 rounded-lg border", darkMode ? "bg-amber-500/10 border-amber-500/30" : "bg-amber-50 border-amber-200")}>
                <p className={cn("text-sm font-medium", darkMode ? "text-amber-400" : "text-amber-700")}>No Phone Numbers</p>
                <p className={cn("text-xs mt-1", darkMode ? "text-amber-400/70" : "text-amber-600")}>
                  Configure a Twilio phone number in Channels settings to test voice.
                </p>
              </div>
            )}

            <Separator className={darkMode ? "bg-slate-800" : "bg-slate-200"} />

            {/* Caller Phone Number */}
            <div>
              <Label className={cn("text-xs uppercase tracking-wider mb-3 block", darkMode ? "text-slate-400" : "text-slate-500")}>
                Caller Phone Number (From)
              </Label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={cn("font-mono", darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-300")}
                placeholder="+15551234567"
              />
            </div>

            <Separator className={darkMode ? "bg-slate-800" : "bg-slate-200"} />

            {/* Call Script */}
            <div>
              <Label className={cn("text-xs uppercase tracking-wider mb-3 block", darkMode ? "text-slate-400" : "text-slate-500")}>
                AI Call Script
              </Label>
              <div className="space-y-2">
                {callScripts.map((script) => (
                  <button
                    key={script.id}
                    onClick={() => setSelectedScript(script)}
                    className={cn(
                      'w-full p-3 rounded-lg text-left transition-all border',
                      selectedScript.id === script.id
                        ? 'bg-rose-500/20 border-rose-500/50'
                        : darkMode
                          ? 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <p className={cn("font-medium text-sm", darkMode ? "text-white" : "text-slate-900")}>{script.name}</p>
                    <p className={cn("text-xs", darkMode ? "text-slate-500" : "text-slate-400")}>{script.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <Separator className={darkMode ? "bg-slate-800" : "bg-slate-200"} />

            {/* Audio Settings */}
            <div>
              <Label className={cn("text-xs uppercase tracking-wider mb-3 block", darkMode ? "text-slate-400" : "text-slate-500")}>
                Audio Settings
              </Label>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {volume > 0 ? (
                      <Volume2 className="w-4 h-4 text-slate-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="text-sm">Volume</span>
                  </div>
                  <span className="text-xs text-slate-500">{volume}%</span>
                </div>
                <Slider
                  value={[volume]}
                  onValueChange={([v]) => setVolume(v)}
                  max={100}
                  step={1}
                />
              </div>
            </div>

            <Separator className={darkMode ? "bg-slate-800" : "bg-slate-200"} />

            {/* Call Stats */}
            <div>
              <Label className={cn("text-xs uppercase tracking-wider mb-3 block", darkMode ? "text-slate-400" : "text-slate-500")}>
                Session Stats
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className={cn(
                  "p-3 rounded-lg border text-center",
                  darkMode ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200"
                )}>
                  <p className="text-lg font-bold text-rose-400">3</p>
                  <p className={cn("text-[10px]", darkMode ? "text-slate-500" : "text-slate-400")}>Calls Today</p>
                </div>
                <div className={cn(
                  "p-3 rounded-lg border text-center",
                  darkMode ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200"
                )}>
                  <p className="text-lg font-bold text-blue-400">4:32</p>
                  <p className={cn("text-[10px]", darkMode ? "text-slate-500" : "text-slate-400")}>Avg Duration</p>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {lastError && (
              <>
                <Separator className={darkMode ? "bg-slate-800" : "bg-slate-200"} />
                <div className={cn("p-3 rounded-lg border", darkMode ? "bg-red-500/10 border-red-500/30" : "bg-red-50 border-red-200")}>
                  <p className={cn("text-xs font-medium", darkMode ? "text-red-400" : "text-red-700")}>Last Error</p>
                  <p className={cn("text-xs mt-1", darkMode ? "text-red-400/70" : "text-red-600")}>{lastError}</p>
                </div>
              </>
            )}

            {/* TwiML Response */}
            {twimlResponse && (
              <>
                <Separator className={darkMode ? "bg-slate-800" : "bg-slate-200"} />
                <div>
                  <Label className={cn("text-xs uppercase tracking-wider mb-3 block", darkMode ? "text-slate-400" : "text-slate-500")}>
                    TwiML Response
                  </Label>
                  <pre className={cn(
                    "p-3 rounded-lg border text-xs overflow-auto max-h-32",
                    darkMode ? "bg-slate-800/50 border-slate-700/50 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"
                  )}>
                    {twimlResponse}
                  </pre>
                </div>
              </>
            )}
          </div>
        </aside>

        {/* Call Interface */}
        <div className={cn("flex-1 flex flex-col", darkMode ? "bg-slate-950" : "bg-white")}>
          <div className="flex-1 flex">
            {/* Call View */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              {/* Caller Avatar */}
              <div className={cn(
                'relative mb-6',
                callStatus === 'connected' && 'animate-pulse'
              )}>
                <div className={cn(
                  'w-32 h-32 rounded-full flex items-center justify-center',
                  callStatus === 'idle' ? 'bg-slate-800' :
                  callStatus === 'ringing' ? 'bg-amber-500/20' :
                  callStatus === 'connected' ? 'bg-emerald-500/20' :
                  'bg-red-500/20'
                )}>
                  <User className={cn(
                    'w-16 h-16',
                    callStatus === 'idle' ? 'text-slate-600' :
                    callStatus === 'ringing' ? 'text-amber-400' :
                    callStatus === 'connected' ? 'text-emerald-400' :
                    'text-red-400'
                  )} />
                </div>
                {callStatus === 'connected' && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <Badge className="bg-emerald-500 text-white gap-1">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      Live
                    </Badge>
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <p className="text-xl font-mono text-white mb-2">{phoneNumber}</p>

              {/* Status */}
              <p className={cn(
                'text-sm mb-6',
                callStatus === 'idle' ? 'text-slate-500' :
                callStatus === 'ringing' ? 'text-amber-400' :
                callStatus === 'connected' ? 'text-emerald-400' :
                'text-red-400'
              )}>
                {callStatus === 'idle' && 'Ready to simulate call'}
                {callStatus === 'ringing' && 'Connecting...'}
                {callStatus === 'connected' && `Connected • ${formatDuration(callDuration)}`}
                {callStatus === 'ended' && 'Call ended'}
              </p>

              {/* Call Controls */}
              <div className="flex items-center gap-4">
                {callStatus === 'idle' && (
                  <Button
                    size="lg"
                    className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600"
                    onClick={handleStartCall}
                  >
                    <Phone className="w-7 h-7" />
                  </Button>
                )}

                {(callStatus === 'ringing' || callStatus === 'connected') && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className={cn(
                        'w-14 h-14 rounded-full border-slate-700',
                        isMuted && 'bg-red-500/20 border-red-500/50'
                      )}
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? (
                        <MicOff className="w-6 h-6 text-red-400" />
                      ) : (
                        <Mic className="w-6 h-6" />
                      )}
                    </Button>
                    <Button
                      size="lg"
                      className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600"
                      onClick={handleEndCall}
                    >
                      <PhoneOff className="w-7 h-7" />
                    </Button>
                  </>
                )}

                {callStatus === 'ended' && (
                  <Button
                    size="lg"
                    className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600"
                    onClick={handleStartCall}
                  >
                    <Phone className="w-7 h-7" />
                  </Button>
                )}
              </div>

              {/* Script Info */}
              <div className="mt-8 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 max-w-sm text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-rose-400" />
                  <span className="text-sm font-medium">Active Script</span>
                </div>
                <p className="text-slate-400 text-sm">{selectedScript.name}</p>
                <p className="text-slate-500 text-xs mt-1">{selectedScript.description}</p>
              </div>
            </div>

            {/* Transcript Panel */}
            <div className="w-96 border-l border-slate-800 bg-slate-900/30 flex flex-col">
              <div className="shrink-0 px-4 py-3 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-rose-400" />
                    <span className="font-medium">Live Transcript</span>
                  </div>
                  {transcript.length > 0 && (
                    <Badge variant="secondary" className="text-[10px]">
                      {transcript.length} entries
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {transcript.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center h-full">
                    <div className="text-center">
                      <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">Transcript will appear here</p>
                      <p className="text-xs text-slate-600 mt-1">Start a call to see live transcription</p>
                    </div>
                  </div>
                ) : (
                  transcript.map((entry) => (
                    <div key={entry.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className={entry.speaker === 'ai' ? 'bg-rose-500/20' : 'bg-slate-700'}>
                            {entry.speaker === 'ai' ? (
                              <Bot className="w-3 h-3 text-rose-400" />
                            ) : (
                              <User className="w-3 h-3" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">
                          {entry.speaker === 'ai' ? 'AI Agent' : 'Caller'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {formatDuration(entry.timestamp)}
                        </span>
                        {entry.sentiment && (
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-[9px] px-1.5',
                              entry.sentiment === 'positive' && 'bg-emerald-500/20 text-emerald-400',
                              entry.sentiment === 'negative' && 'bg-red-500/20 text-red-400'
                            )}
                          >
                            {entry.sentiment}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 pl-8">{entry.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
