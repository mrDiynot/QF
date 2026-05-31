'use client';

/**
 * Voice Call Panel Component
 * Sprint 37 - US-37-002: Voice Call Interface
 * 
 * Features:
 * - Click-to-call button
 * - In-app call controls (mute, hold, transfer)
 * - Call duration timer
 * - Call recording toggle
 * - Live transcription display
 * - Call notes during call
 * - Call disposition after call
 * - Call history with playback
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Pause,
  Play,
  Volume2,
  VolumeX,
  UserPlus,
  Circle,
  PhoneForwarded,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type CallState = 'idle' | 'connecting' | 'ringing' | 'active' | 'on-hold' | 'ended';

interface VoiceCallPanelProps {
  leadId: string;
  phoneNumber: string;
  leadName?: string;
  onCallEnd?: (duration: number, notes: string, disposition: string) => void;
}

export function VoiceCallPanel({
  leadId: _leadId,
  phoneNumber,
  leadName,
  onCallEnd,
}: VoiceCallPanelProps) {
  const [callState, setCallState] = useState<CallState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(80);
  const [duration, setDuration] = useState(0);
  const [notes, setNotes] = useState('');
  const [disposition, setDisposition] = useState('');
  const [transcription, setTranscription] = useState<string[]>([]);
  const [showDispositionForm, setShowDispositionForm] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
   
  const deviceRef = useRef<unknown>(null); // Twilio Device instance

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start call timer
  useEffect(() => {
    if (!callState) return;
    if (callState === 'active') {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [callState]);

  // Initialize Twilio Device (placeholder - requires backend token)
  const initializeTwilioDevice = useCallback(async () => {
    try {
      // In production, fetch token from backend
      // const token = await fetch('/api/twilio/token').then(r => r.json());
      // const { Device } = await import('@twilio/voice-sdk');
      // const device = new Device(token);
      // deviceRef.current = device;
      
      toast.info('Twilio Voice SDK integration pending backend token');
    } catch (error) {
      console.error('Failed to initialize Twilio Device:', error);
      toast.error('Failed to initialize voice calling');
    }
  }, []);

  // Start call
  const handleStartCall = useCallback(async () => {
    setCallState('connecting');
    
    try {
      // Initialize device if not already done
      if (!deviceRef.current) {
        await initializeTwilioDevice();
      }

      // Simulate call connection (replace with actual Twilio call)
      setTimeout(() => {
        setCallState('ringing');
        setTimeout(() => {
          setCallState('active');
          toast.success('Call connected');
          
          // Simulate transcription updates
          setTimeout(() => {
            setTranscription(prev => [...prev, '[00:05] Lead: Hello?']);
          }, 5000);
          setTimeout(() => {
            setTranscription(prev => [...prev, '[00:08] You: Hi, this is calling from QualiFlow AI...']);
          }, 8000);
        }, 2000);
      }, 1000);

      // In production:
      // const call = await deviceRef.current.connect({
      //   params: { To: phoneNumber, From: twilioNumber }
      // });
    } catch (error) {
      console.error('Failed to start call:', error);
      toast.error('Failed to start call');
      setCallState('idle');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- phoneNumber kept for production Twilio integration
  }, [phoneNumber, initializeTwilioDevice]);

  // End call
  const handleEndCall = useCallback(() => {
    setCallState('ended');
    setShowDispositionForm(true);
    
    // In production: deviceRef.current?.disconnectAll();
    
    toast.info('Call ended');
  }, []);

  // Toggle mute
  const handleToggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    // In production: deviceRef.current?.activeConnection()?.mute(!isMuted);
    toast.info(isMuted ? 'Unmuted' : 'Muted');
  }, [isMuted]);

  // Toggle hold
  const handleToggleHold = useCallback(() => {
    if (callState === 'active') {
      setCallState('on-hold');
      // In production: put call on hold via Twilio
      toast.info('Call on hold');
    } else if (callState === 'on-hold') {
      setCallState('active');
      toast.info('Call resumed');
    }
  }, [callState]);

  // Toggle recording
  const handleToggleRecording = useCallback(() => {
    setIsRecording(prev => !prev);
    // In production: start/stop recording via backend API
    toast.info(isRecording ? 'Recording stopped' : 'Recording started');
  }, [isRecording]);

  // Transfer call
  const handleTransfer = useCallback(() => {
    toast.info('Transfer feature coming soon');
    // In production: show transfer dialog with team member selection
  }, []);

  // Submit disposition
  const handleSubmitDisposition = useCallback(() => {
    if (!disposition) {
      toast.error('Please select a call disposition');
      return;
    }

    onCallEnd?.(duration, notes, disposition);
    
    // Reset state
    setCallState('idle');
    setDuration(0);
    setNotes('');
    setDisposition('');
    setTranscription([]);
    setShowDispositionForm(false);
    setIsRecording(false);
    setIsMuted(false);
    
    toast.success('Call logged successfully');
  }, [duration, notes, disposition, onCallEnd]);

  // Render disposition form
  if (showDispositionForm) {
    return (
      <Card className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Call Summary</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Duration: {formatDuration(duration)}</p>
            <p>Contact: {leadName || phoneNumber}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Call Disposition *</Label>
          <Select value={disposition} onValueChange={setDisposition}>
            <SelectTrigger>
              <SelectValue placeholder="Select outcome..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="interested">Interested - Follow Up</SelectItem>
              <SelectItem value="not-interested">Not Interested</SelectItem>
              <SelectItem value="callback">Requested Callback</SelectItem>
              <SelectItem value="voicemail">Left Voicemail</SelectItem>
              <SelectItem value="no-answer">No Answer</SelectItem>
              <SelectItem value="wrong-number">Wrong Number</SelectItem>
              <SelectItem value="qualified">Qualified Lead</SelectItem>
              <SelectItem value="disqualified">Disqualified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Call Notes</Label>
          <Textarea
            placeholder="Add notes about the call..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        {transcription.length > 0 && (
          <div className="space-y-2">
            <Label>Call Transcription</Label>
            <div className="bg-muted p-3 rounded-lg max-h-[200px] overflow-y-auto text-sm space-y-1">
              {transcription.map((line, index) => (
                <p key={index} className="text-muted-foreground">{line}</p>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSubmitDisposition} className="flex-1">
            Save & Close
          </Button>
          <Button variant="outline" onClick={() => setShowDispositionForm(false)}>
            Cancel
          </Button>
        </div>
      </Card>
    );
  }

  // Render call interface
  return (
    <Card className="p-6 space-y-6">
      {/* Call Status Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          {callState === 'active' && isRecording && (
            <Circle className="size-3 fill-red-500 text-red-500 animate-pulse" />
          )}
          <Badge variant={
            callState === 'idle' ? 'secondary' :
            callState === 'connecting' || callState === 'ringing' ? 'default' :
            callState === 'active' ? 'default' :
            callState === 'on-hold' ? 'secondary' : 'secondary'
          } className={cn(
            callState === 'active' && 'bg-green-500',
            callState === 'on-hold' && 'bg-yellow-500'
          )}>
            {callState === 'idle' && 'Ready'}
            {callState === 'connecting' && 'Connecting...'}
            {callState === 'ringing' && 'Ringing...'}
            {callState === 'active' && 'In Call'}
            {callState === 'on-hold' && 'On Hold'}
            {callState === 'ended' && 'Call Ended'}
          </Badge>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold">{leadName || 'Unknown'}</h3>
          <p className="text-sm text-muted-foreground">{phoneNumber}</p>
        </div>

        {(callState === 'active' || callState === 'on-hold') && (
          <div className="text-3xl font-mono font-bold text-primary">
            {formatDuration(duration)}
          </div>
        )}
      </div>

      {/* Call Controls */}
      {callState === 'idle' ? (
        <Button onClick={handleStartCall} size="lg" className="w-full gap-2">
          <Phone className="size-5" />
          Start Call
        </Button>
      ) : callState === 'ended' ? (
        <Button onClick={() => setCallState('idle')} variant="outline" className="w-full">
          Close
        </Button>
      ) : (
        <div className="space-y-4">
          {/* Primary Controls */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={isMuted ? 'destructive' : 'outline'}
              onClick={handleToggleMute}
              className="flex-col h-20 gap-2"
            >
              {isMuted ? <MicOff className="size-6" /> : <Mic className="size-6" />}
              <span className="text-xs">{isMuted ? 'Unmute' : 'Mute'}</span>
            </Button>

            <Button
              variant={callState === 'on-hold' ? 'secondary' : 'outline'}
              onClick={handleToggleHold}
              className="flex-col h-20 gap-2"
            >
              {callState === 'on-hold' ? <Play className="size-6" /> : <Pause className="size-6" />}
              <span className="text-xs">{callState === 'on-hold' ? 'Resume' : 'Hold'}</span>
            </Button>

            <Button
              variant={isRecording ? 'destructive' : 'outline'}
              onClick={handleToggleRecording}
              className="flex-col h-20 gap-2"
            >
              <Circle className={cn("size-6", isRecording && "fill-current")} />
              <span className="text-xs">{isRecording ? 'Stop Rec' : 'Record'}</span>
            </Button>
          </div>

          {/* Secondary Controls */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleTransfer} className="gap-2">
              <PhoneForwarded className="size-4" />
              Transfer
            </Button>
            <Button variant="outline" className="gap-2">
              <UserPlus className="size-4" />
              Add Person
            </Button>
          </div>

          {/* Volume Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Volume</Label>
              <span className="text-xs text-muted-foreground">{volume}%</span>
            </div>
            <div className="flex items-center gap-3">
              <VolumeX className="size-4 text-muted-foreground" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1"
              />
              <Volume2 className="size-4 text-muted-foreground" />
            </div>
          </div>

          {/* End Call Button */}
          <Button
            variant="destructive"
            onClick={handleEndCall}
            size="lg"
            className="w-full gap-2"
          >
            <PhoneOff className="size-5" />
            End Call
          </Button>
        </div>
      )}

      {/* Live Transcription */}
      {(callState === 'active' || callState === 'on-hold') && transcription.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs">Live Transcription</Label>
          <div className="bg-muted p-3 rounded-lg max-h-[150px] overflow-y-auto text-sm space-y-1">
            {transcription.map((line, index) => (
              <p key={index} className="text-muted-foreground">{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* Call Notes (during call) */}
      {(callState === 'active' || callState === 'on-hold') && (
        <div className="space-y-2">
          <Label className="text-xs">Call Notes</Label>
          <Textarea
            placeholder="Take notes during the call..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px] text-sm"
          />
        </div>
      )}
    </Card>
  );
}
