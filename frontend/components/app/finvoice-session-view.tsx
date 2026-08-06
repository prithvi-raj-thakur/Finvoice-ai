'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useVoiceAssistant, useSessionContext, useLocalParticipant } from '@livekit/components-react';
import { AgentControlBar } from '@/components/agents-ui/agent-control-bar';
import { AgentAudioVisualizerWave } from '@/components/agents-ui/agent-audio-visualizer-wave';
import { Track } from 'livekit-client';

export function FinvoiceSessionView() {
  const session = useSessionContext();
  const { state: agentState, audioTrack: agentAudioTrack } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  
  const localMicrophoneTrack = localParticipant?.getTrackPublication(Track.Source.Microphone)?.track;

  const isListening = agentState === 'listening';
  const isSpeaking = agentState === 'speaking';
  const isThinking = agentState === 'thinking';

  // Make the visualizer react to the user when listening, and the agent when speaking
  const activeTrack = isSpeaking ? agentAudioTrack : localMicrophoneTrack;

  let statusText = 'Connecting...';
  if (session.isConnected) {
    if (isSpeaking) statusText = 'Speaking...';
    else if (isThinking) statusText = 'Thinking...';
    else if (isListening) statusText = 'Listening...';
    else statusText = 'Connected';
  }

  return (
    <div className="absolute inset-0 bg-[#050816] flex flex-col items-center justify-center overflow-hidden z-50">
      
      {/* Background ambient glows depending on state */}
      <motion.div 
        animate={{ 
          opacity: isSpeaking ? 0.4 : isListening ? 0.2 : 0.1,
          scale: isSpeaking ? 1.2 : 1 
        }}
        transition={{ duration: 1 }}
        className="absolute w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-cyan-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" 
      />

      {/* Center Console */}
      <div className="relative flex flex-col items-center justify-center w-full max-w-2xl px-6">
        
        {/* Status Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3 shadow-xl"
        >
          <motion.div 
            animate={{ 
              scale: isListening || isSpeaking ? [1, 1.5, 1] : 1,
              opacity: isListening || isSpeaking ? [0.5, 1, 0.5] : 0.5
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`size-2.5 rounded-full ${isSpeaking ? 'bg-indigo-400' : isListening ? 'bg-cyan-400' : 'bg-slate-400'}`}
          />
          <span className="text-sm font-medium tracking-wide uppercase text-slate-200">
            {statusText}
          </span>
        </motion.div>

        {/* The Animated Orb / Waveform Box */}
        <motion.div 
          animate={{
            scale: isSpeaking ? 1.05 : isThinking ? 0.95 : 1,
            boxShadow: isSpeaking 
              ? '0 0 100px rgba(79,70,229,0.4), inset 0 0 50px rgba(79,70,229,0.2)'
              : isListening 
              ? '0 0 60px rgba(0,229,255,0.2), inset 0 0 30px rgba(0,229,255,0.1)'
              : '0 0 0px rgba(0,0,0,0)',
            borderColor: isSpeaking ? 'rgba(79,70,229,0.5)' : isListening ? 'rgba(0,229,255,0.3)' : 'rgba(255,255,255,0.1)'
          }}
          transition={{ duration: 0.5 }}
          className="relative size-64 md:size-80 rounded-[40px] bg-white/[0.02] backdrop-blur-3xl border border-white/10 flex items-center justify-center overflow-hidden"
        >
           {/* Inner noise overlay */}
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
           
           <div className="absolute inset-0 flex items-center justify-center p-8">
             <AgentAudioVisualizerWave
                lineWidth={4}
                color={isSpeaking ? '#4F46E5' : '#00E5FF'}
                audioTrack={activeTrack as any}
                state={agentState}
                className="w-full h-full scale-150"
              />
           </div>
        </motion.div>

        {/* Realtime Action Hint */}
        <p className="mt-16 text-slate-400 text-lg font-light text-center">
          {isListening 
            ? "I'm listening, you can speak now..." 
            : isThinking 
            ? "Processing your request..." 
            : isSpeaking 
            ? "" 
            : session.isConnected 
            ? "Ready to assist you."
            : "Connecting to FinVoice AI..."}
        </p>

      </div>

      {/* Control Bar */}
      <div className="absolute bottom-12 w-full max-w-md px-6">
        <AgentControlBar
          variant="livekit"
          controls={{
            leave: true,
            microphone: true,
            chat: false,
            camera: false,
            screenShare: false,
          }}
          isConnected={session.isConnected}
          onDisconnect={session.end}
        />
      </div>
    </div>
  );
}
