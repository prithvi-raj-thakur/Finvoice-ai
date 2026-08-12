'use client';

import React, { useState, useMemo } from 'react';
import { motion, LayoutGroup } from 'motion/react';
import Link from 'next/link';
import {
  useVoiceAssistant,
  useSessionContext,
  useLocalParticipant,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { IPhone } from '@/components/ui/iphone';
import { PhoneScreen } from '@/components/finvoice/PhoneScreen';
import {
  VisualizerSwitcher,
  type VisualizerType,
} from '@/components/finvoice/VisualizerSwitcher';
import { ModeSwitcher, type ViewMode } from '@/components/finvoice/ModeSwitcher';
import { AgentControlBar } from '@/components/agents-ui/agent-control-bar';

interface FinvoiceSessionViewProps {
  onBack?: () => void;
}

export function FinvoiceSessionView({ onBack }: FinvoiceSessionViewProps) {
  const session = useSessionContext();
  const { state: agentState } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();

  const [visualizerType, setVisualizerType] = useState<VisualizerType>('aura');
  const [viewMode, setViewMode] = useState<ViewMode>('voice');
  const [micError, setMicError] = useState(false);

  const isSpeaking = agentState === 'speaking';
  const isListening = agentState === 'listening';

  // Determine language display (static for now since no detection API)
  const language = 'Hindi + English';

  // Ambient glow intensity based on state
  const glowOpacity = useMemo(() => {
    if (isSpeaking) return 0.25;
    if (isListening) return 0.15;
    if (agentState === 'thinking') return 0.1;
    return 0.06;
  }, [agentState, isSpeaking, isListening]);

  const glowScale = useMemo(() => {
    if (isSpeaking) return 1.15;
    if (isListening) return 1.05;
    return 1;
  }, [isSpeaking, isListening]);

  return (
    <LayoutGroup>
      <div className="fixed inset-0 bg-[#050507] flex flex-col items-center justify-center overflow-hidden z-50">
        {/* Background Video */}
        <video
          src="/futuristic-tunnel.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 mix-blend-screen"
        />
        {/* Dark gradient overlay to ensure UI legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050507]/80 via-[#050507]/60 to-[#050507]/90 z-0 pointer-events-none" />

        {/* ─── Top Nav ─── */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 md:px-8 py-4"
        >
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={() => {
                  session.end();
                  onBack();
                }}
                className="flex items-center justify-center p-2 rounded-full bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors cursor-pointer"
                aria-label="Go back"
              >
                <svg className="w-4 h-4 text-[#F5F5F7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            )}
            <div className="flex items-center gap-2 hidden sm:flex">
              <div className="size-6 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
              </div>
              <span className="text-[13px] font-semibold text-[#F5F5F7] tracking-tight">
                FinVoice AI
              </span>
            </div>
          </div>

          {/* Center Indicator */}
          <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <div className="size-1.5 rounded-full bg-[#8B5CF6] animate-pulse" />
            <span className="text-[11px] font-medium text-[#F5F5F7] tracking-wider uppercase">
              Live Session
            </span>
          </div>

          {/* Language selector & Memory Indicator */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
              <svg className="w-3 h-3 text-[#8A8A94]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span className="text-[10px] text-[#8A8A94] font-medium">{language}</span>
            </div>
            
            {/* Support dashboard link */}
            <Link href="/support" target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors" title="Open Human Support Dashboard">
              <svg className="w-3 h-3 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
              </svg>
              <span className="text-[10px] text-purple-300 font-medium whitespace-nowrap">Support Dashboard</span>
            </Link>
          </div>
        </motion.nav>

        {/* ─── Desktop Layout: Left Panel / iPhone / Right Panel ─── */}
        <div className="flex flex-1 items-center justify-between w-full max-w-[1400px] px-8 lg:px-12 py-4 mt-8">
          {/* Left Panel */}
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex flex-col gap-8 w-[320px] shrink-0 bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl rounded-3xl p-8"
          >
            <div>
              <h1 className="text-4xl font-semibold text-[#F5F5F7] tracking-tight leading-tight">
                FinVoice AI
              </h1>
              <p className="text-sm text-[#8A8A94] mt-2 leading-relaxed">
                Your premium financial
                <br />
                voice companion.
              </p>
            </div>

            <div className="h-px bg-white/[0.06]" />

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-[#8A8A94]/60 uppercase tracking-wider font-medium">
                  Voice Active
                </span>
                <span className="text-sm text-[#F5F5F7] font-medium">{language}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <p className="text-xs text-[#8A8A94]/80 leading-[1.8]">
                Ask questions naturally.
                <br />
                Understand financial concepts.
                <br />
                Make more informed decisions.
              </p>
            </div>
          </motion.aside>

          {/* ─── Center: iPhone ─── */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex-shrink-0"
          >
            {/* Ambient glow behind the phone */}
            <motion.div
              animate={{
                opacity: glowOpacity,
                scale: glowScale,
              }}
              transition={{ duration: 1 }}
              className="absolute inset-[-60%] pointer-events-none z-0"
              style={{
                background: `radial-gradient(ellipse at center, ${isSpeaking ? '#8B5CF640' : '#6366F130'}, transparent 60%)`,
              }}
            />

            {/* Stable iPhone container */}
            <motion.div
              className="relative z-10"
            >
              {/* Phone shadow */}
              <div
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[70%] h-8 rounded-[100%] blur-xl pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse, rgba(0,0,0,0.5), transparent 70%)',
                }}
              />

              <IPhone width={300} height={612}>
                {micError ? (
                  <div className="w-full h-full bg-[#050507] flex flex-col items-center justify-center p-6 text-center">
                    <div className="size-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="2" x2="12" y2="22" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                      </svg>
                    </div>
                    <h2 className="text-[14px] font-semibold text-[#F5F5F7] mb-2">MICROPHONE ACCESS REQUIRED</h2>
                    <p className="text-[11px] text-[#8A8A94] mb-6 leading-relaxed">
                      FinVoice needs microphone access to hear you. Allow microphone access in your browser settings.
                    </p>
                    <button
                      onClick={() => setMicError(false)}
                      className="px-6 py-2.5 rounded-full bg-white text-black text-[12px] font-semibold"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <PhoneScreen
                    viewMode={viewMode}
                    visualizerType={visualizerType}
                  />
                )}
              </IPhone>
            </motion.div>
          </motion.div>

          {/* Right Panel */}
          <motion.aside
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex flex-col gap-8 w-[320px] shrink-0 bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl rounded-3xl p-8"
          >
            <div>
              <span className="text-xs text-[#8A8A94]/60 uppercase tracking-[0.2em] font-medium">
                Current Session
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#8A8A94]/60 uppercase tracking-wider">Status</span>
                  <span className="text-sm text-[#F5F5F7] font-medium capitalize">
                    {agentState ?? 'Ready'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#8A8A94]/60 uppercase tracking-wider">Mode</span>
                  <span className="text-sm text-[#F5F5F7] font-medium capitalize">{viewMode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#8A8A94]/60 uppercase tracking-wider">Visualizer</span>
                  <span className="text-sm text-[#F5F5F7] font-medium capitalize">{visualizerType}</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Trust section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#22C55E]/60" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                </svg>
                <span className="text-xs text-[#8A8A94]/60 uppercase tracking-[0.15em] font-medium">
                  FinVoice Trust
                </span>
              </div>
              <div className="text-xs text-[#8A8A94]/60 leading-[1.8] space-y-1.5">
                <p>✓ Never asks for OTP, PIN or account numbers.</p>
                <p>✓ Never promises loan approval.</p>
                <p>✓ Never guarantees returns.</p>
              </div>
            </div>
          </motion.aside>
        </div>

        {/* ─── Bottom Controls ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full z-30 flex flex-col items-center gap-4 px-4 pb-8 shrink-0"
        >
          {/* Mode + Visualizer controls row */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <ModeSwitcher mode={viewMode} onModeChange={setViewMode} />
            <VisualizerSwitcher
              selected={visualizerType}
              onSelect={setVisualizerType}
            />
          </div>

          {/* Agent control bar */}
          <div className="w-full max-w-md">
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
              onDeviceError={() => setMicError(true)}
            />
          </div>
        </motion.div>
      </div>
    </LayoutGroup>
  );
}
