'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, LayoutGroup, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import {
  useVoiceAssistant,
  useSessionContext,
  useLocalParticipant,
  useDataChannel,
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
import dynamic from 'next/dynamic';

const GradientWaves = dynamic(() => import('@/components/site/Hero'), { ssr: false });

type AgentType = 'main' | 'scheme' | 'fraud' | 'literacy' | 'document' | 'application';

const AGENT_INFO: Record<AgentType, { title: string; subtitle: string; visualizer: VisualizerType }> = {
  main: { title: 'FinVoice AI', subtitle: 'Your premium financial voice companion.', visualizer: 'aura' },
  scheme: { title: 'Scheme Specialist', subtitle: 'Dedicated Government Schemes Expert.', visualizer: 'wave' },
  fraud: { title: 'Fraud & Safety', subtitle: 'Financial Security & Fraud Protection.', visualizer: 'radial' },
  literacy: { title: 'Financial Literacy', subtitle: 'Simple Financial Explanations.', visualizer: 'bar' },
  document: { title: 'Document Guide', subtitle: 'Document Preparation & Checklists.', visualizer: 'grid' },
  application: { title: 'Application Assistant', subtitle: 'Step-by-Step Application Guide.', visualizer: 'wave' },
};

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

  // Intelligence Layer State
  const [schemes, setSchemes] = useState<any[]>([]);
  const [escalation, setEscalation] = useState<any>(null);
  const [journeyProgress, setJourneyProgress] = useState(15);
  const [nextAction, setNextAction] = useState("Explain your financial situation");

  // Multi-Agent State
  const [activeAgent, setActiveAgent] = useState<AgentType>('main');
  const [nextAgent, setNextAgent] = useState<AgentType | null>('main');
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [handoffContext, setHandoffContext] = useState('');

  // Play sound on initial mount (when main agent starts)
  useEffect(() => {
    const audio = new Audio('/sounds/bot-change.mp3');
    audio.play().catch(e => console.log('Audio playback failed:', e));
    
    // Clear initial transition after 6 seconds
    const timer = setTimeout(() => {
      setIsTransitioning(false);
      setNextAgent(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  // Play sound during handoffs
  useEffect(() => {
    if (isTransitioning) {
      const audio = new Audio('/sounds/bot-change.mp3');
      audio.play().catch(e => console.log('Audio playback failed:', e));
    }
  }, [isTransitioning]);

  useDataChannel((msg) => {
    if (msg.payload) {
      try {
        const text = new TextDecoder().decode(msg.payload);
        const parsed = JSON.parse(text);
        if (parsed.type === 'scheme_results') {
          setSchemes(parsed.data.schemes || []);
          setJourneyProgress(60);
          setNextAction("Review eligibility requirements");
        } else if (parsed.type === 'escalation_created') {
          setEscalation(parsed.data);
          setJourneyProgress(100);
          setNextAction("Wait for human follow-up");
        } else if (parsed.type === 'agent_handoff') {
          // Start transition immediately
          setIsTransitioning(true);
          const target = parsed.data.to as AgentType;
          
          setNextAgent(target);
          setHandoffContext(parsed.data.context || '');
          setVisualizerType(AGENT_INFO[target]?.visualizer || 'aura');

          // Clear schemes and reset progress if we leave the Scheme Specialist
          if (target !== 'scheme') {
            setSchemes([]);
            setJourneyProgress(15);
            setNextAction("Explain your financial situation");
          }

          setTimeout(() => {
            setActiveAgent(target);
            setNextAgent(null);
            setIsTransitioning(false);
          }, 6000); // Wait for the beautiful transition animation and sound to complete
        }
      } catch (e) {}
    }
  });

  const isSpeaking = agentState === 'speaking';
  const isListening = agentState === 'listening';

  // Determine language display (static for now since no detection API)
  const language = 'Multi-lingual';

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
      <div className="fixed inset-0 bg-[#030712] flex flex-col items-center justify-center overflow-hidden z-50">
        
        {/* ─── HANDOFF TRANSITION OVERLAY ─── */}
        <AnimatePresence>
          {isTransitioning && nextAgent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#030712]/80 backdrop-blur-3xl overflow-hidden"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="relative flex flex-col items-center"
              >
                <div className="absolute inset-0 rounded-full blur-[100px] bg-gradient-to-tr from-sky-500/40 to-indigo-500/40 w-[300px] h-[300px] -z-10" />
                
                <div className="size-20 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-8 relative overflow-hidden">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(255,255,255,0.8)_360deg)]"
                  />
                  <div className="absolute inset-1 rounded-full bg-[#030712] flex items-center justify-center">
                    <svg className="w-8 h-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                </div>

                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-2xl font-semibold text-white tracking-tight mb-3 text-center"
                >
                  {nextAgent === 'main' 
                    ? (activeAgent === 'main' && isTransitioning ? 'Connecting to FinVoice AI...' : 'Returning to Main Assistant...') 
                    : `Connecting to ${AGENT_INFO[nextAgent]?.title}...`}
                </motion.h2>
                
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-sm text-[#8A8A94] max-w-sm text-center leading-relaxed"
                >
                  {nextAgent === 'main' && activeAgent === 'main' && isTransitioning
                    ? "Initializing secure financial environment..."
                    : "Passing secure conversation context to ensure a seamless continuation of your journey."}
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── NEW GRADIENT WAVES BACKGROUND ─── */}
        <div className="absolute inset-0 w-full h-full z-0 opacity-60 pointer-events-none">
          <GradientWaves
            horizonColor="#0284c7"
            waveColor="#0ea5e9"
            crestColor="#bae6fd"
            speed={0.2}
            amplitude={1.5}
            waveScale={0.8}
            waveRatio={0.9}
            swell={20}
            turbulence={10}
            tilt={1.2}
            zoom={1.5}
            height={4.0}
            fogDepth={25}
            detail="medium"
            brightness={0.8}
            mouseInteraction={true}
            parallaxStrength={0.3}
            grain={true}
            grainIntensity={0.03}
          />
        </div>

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
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-lg bg-gradient-to-br from-[#38bdf8] to-[#0284c7] flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
              </div>
              <span className="text-[13px] font-semibold text-[#F5F5F7] tracking-tight">
                {activeAgent === 'main' ? 'FinVoice AI' : AGENT_INFO[activeAgent]?.title}
              </span>
            </div>
          </div>

          {/* Center Indicator */}
          <div className="hidden md:flex flex-col items-center gap-1 absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
              <span className="text-[11px] font-medium text-[#F5F5F7] tracking-wider uppercase">
                Live Session
              </span>
            </div>
            {/* Visual Agent Network Indicator */}
            <div className="flex items-center gap-2 opacity-60">
              <span className="text-[9px] font-medium text-[#8A8A94] tracking-widest uppercase">CORE</span>
              {activeAgent !== 'main' && (
                <>
                  <svg className="w-3 h-3 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <span className="text-[9px] font-bold text-[#38bdf8] tracking-widest uppercase flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
                    {AGENT_INFO[activeAgent]?.title}
                  </span>
                </>
              )}
            </div>
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
            <Link href="/support" target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-colors" title="Open Human Support Dashboard">
              <svg className="w-3 h-3 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
              </svg>
              <span className="text-[10px] text-sky-300 font-medium whitespace-nowrap">Support Dashboard</span>
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
            className="hidden lg:flex flex-col gap-6 w-[360px] shrink-0 bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl rounded-3xl p-8 overflow-y-auto max-h-[80vh] custom-scrollbar"
          >
            {schemes.length > 0 ? (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-2xl font-semibold text-[#F5F5F7] tracking-tight">Opportunities Found</h2>
                  <p className="text-xs text-[#8A8A94] mt-1">Based on your shared context</p>
                </div>
                <div className="flex flex-col gap-4">
                  {schemes.map((scheme, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-colors">
                      <h3 className="text-[14px] font-semibold text-white/90 mb-2 leading-snug">{scheme.name}</h3>
                      <p className="text-[12px] text-white/60 leading-relaxed mb-4">{scheme.why_relevant}</p>
                      
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-[#38bdf8] font-medium">Required Documents</span>
                        <ul className="flex flex-col gap-1.5">
                          {scheme.documents?.map((doc: string, i: number) => (
                            <li key={i} className="text-[11px] text-white/70 flex items-start gap-1.5">
                              <svg className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-white/[0.05] flex justify-between items-center">
                        <span className="text-[9px] text-white/40 uppercase tracking-widest">Source: {scheme.source}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : escalation ? (
              <div className="flex flex-col gap-6">
                <div className="size-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[#F5F5F7] tracking-tight">Escalation Created</h2>
                  <p className="text-sm text-[#8A8A94] mt-2">A human expert will review your case.</p>
                </div>
                <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex flex-col gap-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-amber-500/60 uppercase tracking-widest">Reference ID</span>
                    <span className="text-[16px] font-mono text-amber-400">{escalation.reference_id}</span>
                  </div>
                  <div className="flex flex-col mt-2">
                    <span className="text-[10px] text-amber-500/60 uppercase tracking-widest">Issue Summary</span>
                    <span className="text-[13px] text-amber-100/80 leading-relaxed">{escalation.summary}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                <div>
                  <h1 className="text-4xl font-semibold text-[#F5F5F7] tracking-tight leading-tight">
                    {AGENT_INFO[activeAgent]?.title}
                  </h1>
                  <p className="text-sm text-[#8A8A94] mt-2 leading-relaxed">
                    {AGENT_INFO[activeAgent]?.subtitle}
                  </p>
                </div>
                <div className="h-px bg-white/[0.06]" />
                
                {activeAgent !== 'main' && handoffContext && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-xs text-[#8A8A94]/80 uppercase tracking-wider font-medium">Context Received</span>
                    </div>
                    <p className="text-xs text-[#F5F5F7]/80 leading-relaxed p-3 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                      "{handoffContext}"
                    </p>
                    <div className="h-px bg-white/[0.06] mt-4" />
                  </div>
                )}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-[#8A8A94]/60 uppercase tracking-wider font-medium">Voice Active</span>
                    <span className="text-sm text-[#F5F5F7] font-medium">{language}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <p className="text-xs text-[#8A8A94]/80 leading-[1.8]">
                    Ask questions naturally.<br />
                    Understand financial concepts.<br />
                    Make more informed decisions.
                  </p>
                </div>
              </div>
            )}
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
                background: `radial-gradient(ellipse at center, ${isSpeaking ? '#38bdf840' : '#0284c730'}, transparent 60%)`,
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
                  <div className="w-full h-full bg-[#030712] flex flex-col items-center justify-center p-6 text-center">
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
            {/* Journey Progress (Application Readiness) */}
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-xs text-[#8A8A94]/60 uppercase tracking-[0.2em] font-medium">
                  Journey Progress
                </span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${journeyProgress}%` }} 
                />
              </div>
              <div className="flex items-start gap-3 mt-1">
                <div className="mt-1 size-1.5 rounded-full bg-sky-400 shrink-0 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#8A8A94]/60 uppercase tracking-wider">Next Best Action</span>
                  <span className="text-[13px] text-[#F5F5F7] font-medium leading-snug mt-0.5">{nextAction}</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-white/[0.06]" />

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
