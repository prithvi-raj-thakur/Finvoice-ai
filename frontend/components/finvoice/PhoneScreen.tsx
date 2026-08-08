'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  useVoiceAssistant,
  useSessionContext,
  useLocalParticipant,
  useSessionMessages,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
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
  const { state: agentState, audioTrack: agentAudioTrack } =
    useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const { messages: chatMessages } = useSessionMessages(session);

  const [hasConnectedOnce, setHasConnectedOnce] = React.useState(false);

  React.useEffect(() => {
    if (session.isConnected) {
      setHasConnectedOnce(true);
    }
  }, [session.isConnected]);

  const hasEnded = hasConnectedOnce && !session.isConnected;

  const localMicrophoneTrack =
    localParticipant?.getTrackPublication(Track.Source.Microphone)?.track;

  const isSpeaking = agentState === 'speaking';
  const isListening = agentState === 'listening';

  // Reactive audio track: user mic when listening, agent when speaking
  const activeTrack = isSpeaking ? agentAudioTrack : localMicrophoneTrack;

  const stateConfig = getStateConfig(agentState, {
    isConnected: session.isConnected,
    hasEnded,
  });

  const accentColor = useMemo<`#${string}`>(() => {
    if (isSpeaking) return '#8B5CF6';
    if (isListening) return '#38BDF8';
    return '#6366F1';
  }, [isSpeaking, isListening]);

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
          {viewMode === 'voice' ? (
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
