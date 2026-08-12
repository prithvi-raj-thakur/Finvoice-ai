'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  useVoiceAssistant,
  useSessionContext,
  useLocalParticipant,
  useRemoteParticipants,
  useSessionMessages,
  useRoomContext,
} from '@livekit/components-react';
import { Track, RoomEvent } from 'livekit-client';
import type { AgentState } from '@livekit/components-react';
import { cn } from '@/lib/shadcn/utils';
import type { VisualizerType } from './VisualizerSwitcher';
import type { ViewMode } from './ModeSwitcher';

// Visualizer components
import { AgentAudioVisualizerAura } from '@/components/agents-ui/agent-audio-visualizer-aura';
import { AgentAudioVisualizerBar } from '@/components/agents-ui/agent-audio-visualizer-bar';
import { AgentAudioVisualizerGrid } from '@/components/agents-ui/agent-audio-visualizer-grid';
import { AgentAudioVisualizerRadial } from '@/components/agents-ui/agent-audio-visualizer-radial';
import { AgentAudioVisualizerWave } from '@/components/agents-ui/agent-audio-visualizer-wave';

// Chat components
import { AgentChatTranscript } from '@/components/agents-ui/agent-chat-transcript';

/* ─── State config ─── */

interface StateConfig {
  title: string;
  subtitle: string;
  dotColor: string;
  dotLabel: string;
}

function getStateConfig(
  agentState: AgentState | undefined,
  options: { isConnected: boolean; hasEnded: boolean }
): StateConfig {
  const { isConnected, hasEnded } = options;

  if (hasEnded) {
    return {
      title: 'Conversation ended',
      subtitle: 'Thank you for using FinVoice AI',
      dotColor: 'bg-red-500',
      dotLabel: 'Ended',
    };
  }

  if (!isConnected) {
    return {
      title: 'Connecting to FinVoice...',
      subtitle: 'Securing your voice session...',
      dotColor: 'bg-amber-400',
      dotLabel: 'Connecting',
    };
  }

  switch (agentState) {
    case 'speaking':
      return {
        title: 'FinVoice is speaking',
        subtitle: '',
        dotColor: 'bg-[#8B5CF6]',
        dotLabel: 'Speaking',
      };
    case 'thinking':
      return {
        title: 'Processing',
        subtitle: 'Thinking about your request...',
        dotColor: 'bg-[#6366F1]',
        dotLabel: 'Thinking',
      };
    case 'listening':
      return {
        title: 'Listening',
        subtitle: "I'm listening to you",
        dotColor: 'bg-[#38BDF8]',
        dotLabel: 'Listening',
      };
    default:
      return {
        title: 'Connected',
        subtitle: 'Ready to assist you',
        dotColor: 'bg-[#22C55E]',
        dotLabel: 'Ready',
      };
  }
}

/* ─── Phone Screen Content ─── */

interface PhoneScreenProps {
  viewMode: ViewMode;
  visualizerType: VisualizerType;
  className?: string;
}

export function PhoneScreen({
  viewMode,
  visualizerType,
  className,
}: PhoneScreenProps) {
  const session = useSessionContext();
  const room = useRoomContext();
  const { state: agentState, audioTrack: agentAudioTrack, agent } =
    useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const { messages: chatMessages } = useSessionMessages(session);

  // Phone participant (remote participant that is NOT the agent)
  const phoneParticipant = remoteParticipants.find(p => p.identity !== agent?.identity && !p.name?.toLowerCase().includes('agent'));
  const phoneMicTrack = phoneParticipant?.getTrackPublication(Track.Source.Microphone)?.track;
  const phoneIsSpeaking = phoneParticipant?.isSpeaking;

  const [hasConnectedOnce, setHasConnectedOnce] = React.useState(false);
  const [schemeData, setSchemeData] = React.useState<any>(null);
  const [escalationData, setEscalationData] = React.useState<any>(null);

  const [outboundStatus, setOutboundStatus] = React.useState<'setup' | 'calling' | 'ringing' | 'connected' | 'completed' | 'failed' | 'no_answer'>('setup');
  const [outboundName, setOutboundName] = React.useState('Rahul');
  const [outboundPhone, setOutboundPhone] = React.useState('');
  const [outboundReason, setOutboundReason] = React.useState('Scheme Follow-up');
  const [outboundCallId, setOutboundCallId] = React.useState<string | null>(null);
  const [outboundDuration, setOutboundDuration] = React.useState(0);
  const [outboundHovered, setOutboundHovered] = React.useState(false);

  // Timer for outbound call
  React.useEffect(() => {
    let interval: any;
    if (outboundStatus === 'connected') {
      interval = setInterval(() => {
        setOutboundDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [outboundStatus]);

  // Mute website when in outbound mode so call is only executed on phone
  React.useEffect(() => {
    if (viewMode !== 'outbound') {
      document.querySelectorAll('audio, video').forEach((a: any) => { a.muted = false; a.volume = 1; });
      if (localParticipant && !localParticipant.isMicrophoneEnabled) {
        localParticipant.setMicrophoneEnabled(true).catch(e => console.error(e));
      }
      return;
    }

    // Force disable local microphone
    if (localParticipant && localParticipant.isMicrophoneEnabled) {
      localParticipant.setMicrophoneEnabled(false);
    }

    const muteAll = () => {
      document.querySelectorAll('audio, video').forEach((el: any) => {
        el.muted = true;
        el.volume = 0;
      });
    };

    muteAll();

    // Use MutationObserver to instantly mute any new audio elements LiveKit injects
    const observer = new MutationObserver(() => {
      muteAll();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [viewMode, localParticipant, remoteParticipants]);

  const handleStartOutbound = async () => {
    if (!outboundPhone || outboundPhone.length < 10) return alert("Enter valid phone number");
    setOutboundStatus('calling');
    try {
      const generatedUserId = outboundName.toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000);
      
      const res = await fetch('http://localhost:8000/api/outbound-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: outboundPhone,
          user_id: generatedUserId,
          reason: outboundReason,
          room_name: room?.name,
        }),
      });
      if (!res.ok) throw new Error('Call failed to initiate');
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed');
      
      const callId = data.call_id;
      setOutboundCallId(callId);
      pollOutboundStatus(callId);
    } catch (e) {
      console.error(e);
      setOutboundStatus('failed');
    }
  };

  const pollOutboundStatus = (callId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:8000/api/outbound-calls');
        const data = await res.json();
        const call = data.calls.find((c: any) => c.id === callId);
        if (call) {
          setOutboundStatus(call.status);
          if (['completed', 'failed', 'no_answer', 'busy', 'opted_out'].includes(call.status)) {
            clearInterval(interval);
          }
        }
      } catch (e) {
        console.error("Error polling status", e);
      }
    }, 2000);
  };

  React.useEffect(() => {
    if (session.isConnected) {
      setHasConnectedOnce(true);
    }
  }, [session.isConnected]);

  React.useEffect(() => {
    if (!room) return;
    const handleData = (payload: Uint8Array, participant: any, kind: any, topic: any) => {
      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text);
        if (data.type === 'scheme_results') {
          setSchemeData(data.data);
        } else if (data.type === 'escalation_created') {
          setEscalationData(data.data);
        }
      } catch (e) {
        console.error("Failed to parse data message", e);
      }
    };
    room.on(RoomEvent.DataReceived, handleData);
    return () => { room.off(RoomEvent.DataReceived, handleData); };
  }, [room]);

  const hasEnded = hasConnectedOnce && !session.isConnected;

  const localMicrophoneTrack =
    localParticipant?.getTrackPublication(Track.Source.Microphone)?.track;

  const isSpeaking = agentState === 'speaking';
  const isListening = agentState === 'listening';

  // In outbound mode, the active track is the agent's if speaking, otherwise the phone user's!
  // In inbound mode, it's the agent's if speaking, otherwise the local microphone.
  const activeTrack = viewMode === 'outbound'
    ? (isSpeaking ? agentAudioTrack : phoneMicTrack)
    : (isSpeaking ? agentAudioTrack : localMicrophoneTrack);

  // Determine active speaker label for outbound
  let outboundSpeakerLabel = '';
  if (viewMode === 'outbound') {
    if (isSpeaking) outboundSpeakerLabel = 'FinVoice Speaking';
    else if (phoneIsSpeaking) outboundSpeakerLabel = 'User Speaking';
    else outboundSpeakerLabel = 'Listening...';
  }

  const stateConfig = getStateConfig(agentState, {
    isConnected: session.isConnected,
    hasEnded,
  });

  const accentColor = useMemo<`#${string}`>(() => {
    if (viewMode === 'outbound' && phoneIsSpeaking && !isSpeaking) return '#10B981'; // Green for phone user
    if (isSpeaking) return '#8B5CF6';
    if (isListening) return '#38BDF8';
    return '#6366F1';
  }, [isSpeaking, isListening, viewMode, phoneIsSpeaking]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div
      className={cn(
        'w-full h-full bg-[#050507] flex flex-col overflow-hidden relative',
        className
      )}
    >
      {/* ─── Status Bar ─── */}
      <div className="flex items-center justify-between px-5 pt-14 pb-2 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#F5F5F7] tracking-wide">
            FINVOICE AI
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={{
              scale: session.isConnected ? [1, 1.3, 1] : 1,
              opacity: session.isConnected ? [0.6, 1, 0.6] : 0.4,
            }}
            transition={{
              repeat: session.isConnected ? Infinity : 0,
              duration: 2,
            }}
            className={cn('size-1.5 rounded-full', stateConfig.dotColor)}
          />
          <span className="text-[9px] font-medium text-[#8A8A94] tracking-wider uppercase">
            {stateConfig.dotLabel}
          </span>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          {viewMode === 'outbound' ? (
            <motion.div
              key="outbound-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center w-full h-full px-4 relative"
            >
              {outboundStatus === 'setup' ? (
                <div className="w-full max-w-[260px] flex flex-col bg-[#111115]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative">
                  <div className="text-center mb-6">
                    <h2 className="text-[15px] font-semibold text-white tracking-tight">Outbound Call</h2>
                    <p className="text-[10px] text-white/50 mt-1">Select recipient</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-semibold text-white/60 uppercase tracking-wider pl-1">Recipient Name</label>
                      <input 
                        type="text"
                        value={outboundName}
                        onChange={(e) => setOutboundName(e.target.value)}
                        placeholder="e.g. Rahul"
                        suppressHydrationWarning
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#10B981]/50 focus:bg-white/10 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-semibold text-white/60 uppercase tracking-wider pl-1">Phone Number</label>
                      <input 
                        type="tel"
                        value={outboundPhone}
                        onChange={(e) => setOutboundPhone(e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                        suppressHydrationWarning
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#10B981]/50 focus:bg-white/10 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-semibold text-white/60 uppercase tracking-wider pl-1">Reason</label>
                      <select 
                        value={outboundReason}
                        onChange={(e) => setOutboundReason(e.target.value)}
                        suppressHydrationWarning
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-[12px] text-white appearance-none focus:outline-none focus:border-[#10B981]/50 focus:bg-white/10 transition-all cursor-pointer"
                      >
                        <option value="Scheme Follow-up" className="bg-[#111115]">Scheme Follow-up</option>
                        <option value="Application Deadline" className="bg-[#111115]">Application Deadline</option>
                      </select>
                    </div>

                    <button
                      onClick={handleStartOutbound}
                      onMouseEnter={() => setOutboundHovered(true)}
                      onMouseLeave={() => setOutboundHovered(false)}
                      suppressHydrationWarning
                      className="w-full py-3 rounded-xl font-semibold text-[12px] bg-white text-black hover:bg-gray-100 flex items-center justify-center gap-2 transition-all mt-2"
                      style={{ boxShadow: outboundHovered ? '0 0 15px rgba(255,255,255,0.2)' : 'none' }}
                    >
                      CALL USER
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center relative">
                   {/* Live Call Header */}
                   <div className="absolute top-4 left-0 right-0 flex flex-col items-center">
                      <span className="text-[15px] font-semibold text-white tracking-tight">{outboundName || 'Unknown User'}</span>
                      <span className="text-[9px] text-[#10B981] font-semibold uppercase tracking-widest mt-1">Live Call</span>
                      
                      <div className="flex items-center justify-center gap-2 mt-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
                         {outboundStatus === 'connected' ? <div className="size-1.5 bg-[#10B981] rounded-full animate-pulse" /> : null}
                         <span className="text-[10px] font-medium text-white/80 uppercase tracking-wider">
                           {outboundStatus.replace('_', ' ')}
                         </span>
                         {outboundStatus === 'connected' && (
                           <>
                             <div className="w-px h-3 bg-white/20 mx-1" />
                             <span className="text-[10px] font-medium text-white font-mono tracking-wider">{formatDuration(outboundDuration)}</span>
                           </>
                         )}
                      </div>
                   </div>

                   {/* Main Display Area */}
                   {outboundStatus === 'completed' || outboundStatus === 'failed' || outboundStatus === 'no_answer' || outboundStatus === 'opted_out' ? (
                     <div className="flex flex-col items-center gap-4 text-center">
                       <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                          <svg className="w-5 h-5 text-[#8A8A94]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                          </svg>
                       </div>
                       <h3 className="text-[14px] font-semibold text-white uppercase tracking-widest">Call {outboundStatus.replace('_', ' ')}</h3>
                       {outboundStatus === 'completed' && <span className="text-[11px] text-[#8A8A94]">Duration: {formatDuration(outboundDuration)}</span>}
                       <span className="text-[10px] text-[#8A8A94]">Conversation saved</span>
                       <button onClick={() => {
                         setOutboundStatus('setup');
                         setOutboundDuration(0);
                       }} className="mt-4 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition-colors">
                         Call Again
                       </button>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center justify-center gap-6">
                       <div className="relative flex items-center justify-center">
                         <motion.div
                           animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                           transition={{ repeat: Infinity, duration: 2 }}
                           className="absolute inset-0 rounded-full bg-[#10B981] blur-xl"
                         />
                         <div className="relative size-24 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center">
                           <svg className="w-8 h-8 text-[#10B981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                             <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                           </svg>
                         </div>
                       </div>
                       <div className="text-center">
                         <h3 className="text-[16px] font-semibold text-white tracking-wide">Call Initiated</h3>
                         <p className="text-[12px] text-[#8A8A94] mt-2 max-w-[200px] leading-relaxed">
                           FinVoice is currently speaking with the user on their phone.
                         </p>
                       </div>
                     </div>
                   )}
                </div>
              )}
            </motion.div>
          ) : viewMode === 'voice' ? (
            <motion.div
              key="voice-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center w-full h-full px-4"
            >
              {/* State text */}
              <motion.p
                key={stateConfig.title}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[13px] font-medium text-[#F5F5F7] mb-1 text-center"
              >
                {stateConfig.title}
              </motion.p>
              {stateConfig.subtitle && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] text-[#8A8A94] mb-6 text-center"
                >
                  {stateConfig.subtitle}
                </motion.p>
              )}

              {/* Scheme Card Overlay */}
              <AnimatePresence>
                {schemeData && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="absolute inset-x-4 top-20 bottom-24 bg-[#050507]/90 backdrop-blur-xl border border-white/[0.1] rounded-2xl p-5 z-50 flex flex-col shadow-2xl overflow-y-auto"
                  >
                    <div className="flex items-center justify-between mb-4 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-full bg-indigo-500/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-[13px] font-semibold text-[#F5F5F7] tracking-wide uppercase">Government Scheme Match</span>
                      </div>
                      <button onClick={() => setSchemeData(null)} className="p-1 rounded-full hover:bg-white/[0.1] transition-colors">
                        <svg className="w-4 h-4 text-[#8A8A94]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {schemeData.schemes && schemeData.schemes.length > 0 ? (
                      <div className="flex flex-col gap-6">
                        {schemeData.schemes.map((scheme: any, idx: number) => (
                          <div key={idx} className="flex flex-col gap-4 border-b border-white/[0.06] pb-6 last:border-0 last:pb-0">
                            <h3 className="text-[16px] font-medium text-white leading-tight">{scheme.name}</h3>
                            
                            <div className="space-y-1">
                              <span className="text-[10px] text-indigo-400 uppercase tracking-wider font-semibold">Why it may be relevant</span>
                              <p className="text-[12px] text-[#8A8A94] leading-relaxed">{scheme.why_relevant}</p>
                            </div>
                            
                            <div className="space-y-1">
                              <span className="text-[10px] text-indigo-400 uppercase tracking-wider font-semibold">Benefits</span>
                              <p className="text-[12px] text-[#F5F5F7] leading-relaxed">{scheme.benefits}</p>
                            </div>
                            
                            <div className="space-y-1">
                              <span className="text-[10px] text-indigo-400 uppercase tracking-wider font-semibold">Required Documents</span>
                              <ul className="list-disc pl-4 text-[12px] text-[#8A8A94]">
                                {scheme.documents.map((doc: string, i: number) => (
                                  <li key={i}>{doc}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="mt-2 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-[#8A8A94]">
                               <span>Source: {scheme.source}</span>
                               <span>Updated: {scheme.last_updated}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
                        <span className="text-[14px] font-medium text-white">No matches found</span>
                        <p className="text-[12px] text-[#8A8A94] leading-relaxed">Could not find a specific government scheme in the active dataset matching your criteria.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Escalation Card Overlay */}
              <AnimatePresence>
                {escalationData && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="absolute inset-x-4 top-20 bottom-24 bg-[#050507]/90 backdrop-blur-xl border border-rose-500/[0.2] rounded-2xl p-5 z-50 flex flex-col shadow-2xl overflow-y-auto"
                  >
                    <div className="flex items-center justify-between mb-4 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-full bg-rose-500/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <span className="text-[13px] font-semibold text-[#F5F5F7] tracking-wide uppercase">Support Escalation</span>
                      </div>
                      <button onClick={() => setEscalationData(null)} className="p-1 rounded-full hover:bg-white/[0.1] transition-colors">
                        <svg className="w-4 h-4 text-[#8A8A94]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex flex-col gap-5 mt-2">
                      <div className="flex flex-col items-center justify-center py-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                        <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-widest mb-1">Reference ID</span>
                        <span className="text-[20px] font-mono text-white tracking-wider">{escalationData.reference_id}</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-[#8A8A94] uppercase tracking-wider font-semibold">User</span>
                        <p className="text-[14px] text-[#F5F5F7] font-medium">{escalationData.user_id}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-[#8A8A94] uppercase tracking-wider font-semibold">Purpose & Need</span>
                        <p className="text-[13px] text-[#8A8A94] leading-relaxed">
                          An official escalation ticket has been generated to route this critical request to our human support team. This ensures the user's complex financial issue or potential fraud report is handled securely and correctly by a specialized operator. The AI agent has safely handed off control.
                        </p>
                      </div>

                      <div className="mt-auto pt-4">
                        <a 
                          href="/support" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full py-3 rounded-xl font-semibold text-[13px] bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-colors"
                        >
                          View in Support Dashboard
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Visualizer */}
              {!hasEnded && (
                <div className="relative flex items-center justify-center w-full aspect-square max-w-[180px]">
                  {/* Ambient glow behind the visualizer */}
                  <motion.div
                    animate={{
                      opacity: isSpeaking ? 0.35 : isListening ? 0.2 : 0.08,
                      scale: isSpeaking ? 1.3 : 1,
                    }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-[-30%] rounded-full blur-[40px]"
                    style={{
                      background: `radial-gradient(circle, ${accentColor}40, transparent 70%)`,
                    }}
                  />

                  <VisualizerRenderer
                    type={visualizerType}
                    state={agentState}
                    audioTrack={activeTrack}
                    color={accentColor}
                  />
                </div>
              )}

              {/* Bottom hint or End Call restart */}
              {hasEnded ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 flex justify-center"
                >
                  <button
                    onClick={() => session.start()}
                    className="px-6 py-2.5 rounded-full bg-white text-black text-[12px] font-semibold transition-transform hover:scale-105"
                  >
                    Start again
                  </button>
                </motion.div>
              ) : !isSpeaking ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  className="mt-6 text-[10px] text-[#8A8A94] text-center"
                >
                  {isListening
                    ? 'Speak now...'
                    : agentState === 'thinking'
                      ? 'Processing your request...'
                      : ''}
                </motion.p>
              ) : null}
            </motion.div>
          ) : (
            <motion.div
              key="messages-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col w-full h-full"
            >
              {/* Messages header */}
              <div className="px-5 py-3 border-b border-white/[0.06] shrink-0">
                <p className="text-[12px] font-medium text-[#F5F5F7]">
                  Conversation
                </p>
                <p className="text-[9px] text-[#8A8A94] mt-0.5">
                  {chatMessages && chatMessages.length > 0
                    ? `${chatMessages.length} messages`
                    : 'No messages yet'}
                </p>
              </div>

              {/* Transcript */}
              <div className="flex-1 overflow-hidden finvoice-transcript">
                {chatMessages && chatMessages.length > 0 ? (
                  <AgentChatTranscript
                    agentState={agentState}
                    messages={chatMessages}
                    className="h-full"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 px-6">
                    <div className="size-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-[#8A8A94]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                      </svg>
                    </div>
                    <p className="text-[11px] text-[#8A8A94] text-center leading-relaxed">
                      Start a conversation to see
                      <br />
                      messages here
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Trust footer ─── */}
      <div className="px-5 pb-4 pt-2 flex items-center justify-center gap-1.5 shrink-0">
        <svg
          className="w-2.5 h-2.5 text-[#22C55E]/60"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
        </svg>
        <span className="text-[8px] text-[#8A8A94]/60 tracking-wide">
          Never asks for OTP, PIN, or account numbers
        </span>
      </div>
    </div>
  );
}

/* ─── Visualizer Renderer ─── */

interface VisualizerRendererProps {
  type: VisualizerType;
  state?: AgentState;
  audioTrack?: any;
  color: `#${string}`;
}

function VisualizerRenderer({
  type,
  state = 'connecting',
  audioTrack,
  color,
}: VisualizerRendererProps) {
  const commonProps = {
    state,
    audioTrack,
    color,
    className: 'w-full h-full',
  };

  switch (type) {
    case 'aura':
      return (
        <AgentAudioVisualizerAura
          {...commonProps}
          size="lg"
          colorShift={0.3}
          themeMode="dark"
        />
      );
    case 'wave':
      return (
        <AgentAudioVisualizerWave
          {...commonProps}
          size="lg"
          lineWidth={3}
          colorShift={0.2}
        />
      );
    case 'bar':
      return (
        <AgentAudioVisualizerBar
          {...commonProps}
          size="lg"
          barCount={5}
        />
      );
    case 'grid':
      return (
        <AgentAudioVisualizerGrid
          {...commonProps}
          size="lg"
          rowCount={5}
          columnCount={5}
        />
      );
    case 'radial':
      return (
        <AgentAudioVisualizerRadial
          {...commonProps}
          size="lg"
          barCount={24}
        />
      );
    default:
      return null;
  }
}
