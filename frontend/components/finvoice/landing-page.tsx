'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { useSessionContext, useVoiceAssistant } from '@livekit/components-react';
import { IPhone } from '@/components/ui/iphone';
import { PhoneScreen } from '@/components/finvoice/PhoneScreen';
import { ModeSwitcher, type ViewMode } from '@/components/finvoice/ModeSwitcher';
import { VisualizerSwitcher, type VisualizerType } from '@/components/finvoice/VisualizerSwitcher';
import { AgentControlBar } from '@/components/agents-ui/agent-control-bar';

export function LandingPage() {
  const { isConnected, start, disconnect } = useSessionContext();
  const { state: agentState } = useVoiceAssistant();
  
  const [viewMode, setViewMode] = useState<ViewMode>('voice');
  const [visualizerType, setVisualizerType] = useState<VisualizerType>('aura');
  const [micError, setMicError] = useState(false);
  
  const [scrolled, setScrolled] = useState(false);
  
  const voiceSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartCall = () => {
    start();
    // Smooth scroll to voice section
    voiceSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full min-h-screen bg-[#05070A] text-white selection:bg-white/20 overflow-x-hidden font-sans">
      {/* Global CSS for custom typography if needed */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #05070A; }
      `}} />

      {/* ─── NAVBAR ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#05070A]/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-6 rounded-full bg-white/10 flex items-center justify-center">
              <div className="size-2 rounded-full bg-[#38BDF8]" />
            </div>
            <span className="text-[14px] font-semibold tracking-tight text-white/90 leading-none">
              FINVOICE<br/><span className="text-[10px] text-white/50 tracking-widest uppercase">AI</span>
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-8">
            {['Product', 'How it works', 'Memory', 'Tools', 'Trust'].map(item => (
              <span key={item} className="text-[12px] font-medium text-white/60 hover:text-white transition-colors cursor-pointer">
                {item}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden md:block text-[12px] font-medium text-white/60">Languages</span>
            <button 
              onClick={handleStartCall}
              className="text-[12px] font-semibold bg-white text-black px-5 py-2.5 rounded-full hover:bg-white/90 transition-all"
            >
              Try FinVoice
            </button>
          </div>
        </div>
      </nav>

      {/* ─── SECTION 1: HERO ─── */}
      <section className="relative w-full h-screen min-h-[800px] flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            style={{ filter: 'brightness(0.7) contrast(1.1)' }}
          >
            <source src="/hero2.mp4" type="video/mp4" />
          </video>
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070A]/40 via-transparent to-[#05070A]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#05070A_100%)] opacity-80" />
        </div>

        <div className="relative z-10 max-w-[1400px] w-full px-6 md:px-12 pt-20 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-[11px] sm:text-[13px] text-white/50 font-medium tracking-[0.3em] uppercase mb-8 block">
              FinVoice AI
            </span>
            <h1 className="text-[60px] sm:text-[90px] md:text-[120px] font-bold text-white tracking-tighter leading-[0.95] mb-8">
              Your finances.<br />
              <span className="text-white/40">Should speak</span><br />
              your language.
            </h1>
            <p className="text-[16px] sm:text-[20px] text-white/60 max-w-2xl mx-auto font-light leading-relaxed mb-12">
              Talk naturally. Understand schemes. Remember what matters. Get help when you need it. A proactive financial voice companion built for Bharat.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={handleStartCall}
                className="group relative px-8 py-4 bg-white text-black rounded-full font-medium text-[15px] transition-all hover:scale-105"
              >
                Talk to FinVoice
              </button>
              <button 
                onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-[14px] text-white/60 hover:text-white transition-colors flex items-center gap-2"
              >
                See how it works 
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── SECTION 2: THE PROBLEM ─── */}
      <section id="problem" className="w-full py-40 px-6 md:px-12 bg-[#05070A] relative z-10 flex flex-col items-center text-center">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0, transition: { duration: 1, staggerChildren: 0.2 } }
          }}
          className="max-w-5xl w-full"
        >
          <motion.h2 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-[40px] md:text-[72px] font-medium tracking-tight leading-tight mb-16 text-white/90">
            Financial systems<br/>were built for <span className="text-white">screens.</span>
          </motion.h2>

          <motion.p variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="text-[18px] md:text-[24px] text-white/50 max-w-3xl mx-auto font-light leading-relaxed mb-32">
            Millions of people shouldn't have to understand complex financial language before they can access financial opportunities.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left max-w-4xl mx-auto border-t border-white/5 pt-20">
            <div className="space-y-4">
              <div className="size-10 rounded-full border border-white/10 flex items-center justify-center">
                <span className="text-[12px] font-mono text-white/40">01</span>
              </div>
              <h3 className="text-[24px] text-white font-medium">Too much<br/>information.</h3>
            </div>
            <div className="space-y-4">
              <div className="size-10 rounded-full border border-white/10 flex items-center justify-center">
                <span className="text-[12px] font-mono text-white/40">02</span>
              </div>
              <h3 className="text-[24px] text-white font-medium">Too many<br/>forms.</h3>
            </div>
            <div className="space-y-4">
              <div className="size-10 rounded-full border border-white/10 flex items-center justify-center">
                <span className="text-[12px] font-mono text-white/40">03</span>
              </div>
              <h3 className="text-[24px] text-white font-medium">Too much<br/>uncertainty.</h3>
            </div>
          </div>
          
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mt-40">
            <span className="text-[20px] md:text-[32px] font-light text-white/80">FinVoice changes the interface.</span>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── SECTION 3 & 4: THE VOICE EXPERIENCE ─── */}
      <section ref={voiceSectionRef} id="voice-experience" className="w-full py-40 px-6 md:px-12 bg-[#070B12] relative overflow-hidden">
        {/* Cinematic glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#38BDF8]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-[1400px] mx-auto relative z-10 flex flex-col items-center">
          <div className="text-center mb-24">
            <h2 className="text-[60px] md:text-[100px] font-semibold tracking-tighter text-white mb-6">Just talk.</h2>
            <p className="text-[20px] text-white/50 font-light">
              No dashboards to learn. No complicated menus.<br/>Just a conversation.
            </p>
          </div>

          {/* Interactive Voice Area */}
          <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-32">
            
            {/* Left Context (Appears when active) */}
            <div className="hidden lg:flex flex-col gap-12 w-[280px]">
              <div className="space-y-2 opacity-50 hover:opacity-100 transition-opacity">
                <span className="text-[11px] uppercase tracking-widest text-[#38BDF8] font-semibold">Listening</span>
                <p className="text-[14px] text-white/80">Natural language understanding across dialects and code-switching.</p>
              </div>
              <div className="space-y-2 opacity-50 hover:opacity-100 transition-opacity">
                <span className="text-[11px] uppercase tracking-widest text-[#8B5CF6] font-semibold">Checking</span>
                <p className="text-[14px] text-white/80">Real-time database queries to verify scheme eligibility.</p>
              </div>
            </div>

            {/* Center Phone */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="relative z-10"
              >
                {/* Phone shadow */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-12 bg-black/80 blur-2xl rounded-[100%]" />
                
                <IPhone width={320} height={650}>
                  {micError ? (
                    <div className="w-full h-full bg-[#050507] flex flex-col items-center justify-center p-6 text-center">
                      <div className="size-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      </div>
                      <p className="text-[12px] text-white/60 mb-6">FinVoice needs microphone access to start a voice conversation.</p>
                      <button onClick={() => setMicError(false)} className="px-6 py-2 rounded-full bg-white text-black text-[12px] font-semibold">Allow microphone</button>
                    </div>
                  ) : !isConnected ? (
                    <div className="w-full h-full bg-[#050507] flex flex-col items-center justify-center p-6 text-center">
                      <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                        <div className="size-6 bg-[#8B5CF6] rounded-full animate-pulse" />
                      </div>
                      <h3 className="text-[18px] font-medium text-white mb-2">Ready to talk?</h3>
                      <p className="text-[12px] text-white/50 mb-8">Start the live voice experience</p>
                      <button onClick={handleStartCall} className="px-8 py-3 rounded-full bg-white text-black text-[13px] font-semibold hover:scale-105 transition-transform">
                        Start Conversation
                      </button>
                    </div>
                  ) : (
                    <PhoneScreen viewMode={viewMode} visualizerType={visualizerType} />
                  )}
                </IPhone>
              </motion.div>
            </div>

            {/* Right Context */}
            <div className="hidden lg:flex flex-col gap-12 w-[280px]">
              <div className="space-y-2 opacity-50 hover:opacity-100 transition-opacity">
                <span className="text-[11px] uppercase tracking-widest text-[#22C55E] font-semibold">Remembering</span>
                <p className="text-[14px] text-white/80">Consent-based memory builds continuity between calls.</p>
              </div>
              <div className="space-y-2 opacity-50 hover:opacity-100 transition-opacity">
                <span className="text-[11px] uppercase tracking-widest text-rose-500 font-semibold">Human help</span>
                <p className="text-[14px] text-white/80">Seamless escalation to human operators for sensitive issues.</p>
              </div>
            </div>
          </div>

          {/* Bottom Controls for Phone */}
          {isConnected && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-16 flex flex-col items-center gap-6"
            >
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/10">
                <ModeSwitcher mode={viewMode} onModeChange={setViewMode} />
                <div className="w-px h-6 bg-white/10 mx-2" />
                <VisualizerSwitcher selected={visualizerType} onSelect={setVisualizerType} />
              </div>
              
              <AgentControlBar
                variant="livekit"
                controls={{ leave: true, microphone: true, chat: false, camera: false, screenShare: false }}
                isConnected={isConnected}
                onDisconnect={disconnect}
                onDeviceError={() => setMicError(true)}
              />
            </motion.div>
          )}

        </div>
      </section>

      {/* ─── SECTION 5: MULTILINGUAL INDIA ─── */}
      <section className="w-full py-40 px-6 md:px-12 bg-[#0B1220] relative">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 space-y-8">
            <h2 className="text-[48px] md:text-[72px] font-semibold leading-[1.1] text-white tracking-tight">
              One voice.<br/>Many languages.
            </h2>
            <p className="text-[18px] text-white/60 font-light max-w-md leading-relaxed">
              FinVoice adapts to the way people actually speak. It seamlessly understands code-switching between regional dialects and English.
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              {['English', 'Hindi', 'বাংলা', 'Hinglish', 'Tamil', 'Telugu', 'Marathi'].map(lang => (
                <span key={lang} className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[14px] text-white/80">
                  {lang}
                </span>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full max-w-lg">
            <div className="p-8 rounded-3xl bg-[#05070A] border border-white/5 shadow-2xl space-y-6">
              <div className="flex items-start gap-4">
                <div className="size-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">U</div>
                <div className="bg-white/10 p-4 rounded-2xl rounded-tl-sm text-[14px] text-white/90">
                  Mujhe student ke liye koi scheme check karni hai.
                </div>
              </div>
              <div className="flex items-start gap-4 flex-row-reverse">
                <div className="size-8 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center shrink-0 text-[#8B5CF6]">FV</div>
                <div className="bg-[#8B5CF6]/10 p-4 rounded-2xl rounded-tr-sm text-[14px] text-white/90">
                  ज़रूर। मैं आपके लिए relevant schemes check कर सकती हूँ।
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="size-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">U</div>
                <div className="bg-white/10 p-4 rounded-2xl rounded-tl-sm text-[14px] text-white/90">
                  বাংলায় বলবেন?
                </div>
              </div>
              <div className="flex items-start gap-4 flex-row-reverse">
                <div className="size-8 rounded-full bg-[#38BDF8]/20 flex items-center justify-center shrink-0 text-[#38BDF8]">FV</div>
                <div className="bg-[#38BDF8]/10 p-4 rounded-2xl rounded-tr-sm text-[14px] text-white/90">
                  অবশ্যই। আমি বাংলায় কথা বলতে পারি।
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: MEMORY ─── */}
      <section className="w-full py-40 px-6 md:px-12 bg-[#05070A]">
        <div className="max-w-[1400px] mx-auto text-center flex flex-col items-center">
          <h2 className="text-[48px] md:text-[72px] font-semibold tracking-tight text-white mb-6">
            It remembers.<br/><span className="text-white/40">Only when you allow it.</span>
          </h2>
          <p className="text-[18px] text-white/50 max-w-2xl font-light mb-20">
            Your information is remembered only with your permission. This allows FinVoice to pick up exactly where you left off.
          </p>
          
          <div className="w-full max-w-3xl p-1 bg-gradient-to-b from-white/10 to-transparent rounded-[2rem]">
            <div className="bg-[#070B12] rounded-[1.9rem] p-10 flex flex-col lg:flex-row gap-10 text-left">
              <div className="flex-1 space-y-6">
                <div className="text-[11px] uppercase tracking-widest text-[#38BDF8] font-semibold mb-8">FinVoice Memory</div>
                <h3 className="text-2xl text-white font-medium">Prithvi</h3>
                
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-white/40">Language</span>
                    <span className="text-[13px] text-white">Hindi + English</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-white/40">User type</span>
                    <span className="text-[13px] text-white">Student</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-white/40">Previously explored</span>
                    <span className="text-[13px] text-white">Education schemes</span>
                  </div>
                </div>
              </div>
              <div className="w-px bg-white/5 hidden lg:block" />
              <div className="flex-1 space-y-6 pt-12 lg:pt-0">
                <div className="space-y-4 mt-12">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-white/40">Pending</span>
                    <span className="text-[13px] text-amber-400">Document verification</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-white/40">Last interaction</span>
                    <span className="text-[13px] text-white">12 Aug 2026</span>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-green-500/10 rounded-xl border border-green-500/20 flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-[12px] text-green-400">Consent provided for memory storage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: OPPORTUNITY RADAR ─── */}
      <section className="w-full py-40 px-6 md:px-12 bg-[#070B12]">
        <div className="max-w-[1400px] mx-auto text-center">
          <h2 className="text-[48px] md:text-[72px] font-semibold tracking-tight text-white mb-6">
            Don't just ask.<br/>Discover.
          </h2>
          <p className="text-[18px] text-white/50 max-w-2xl mx-auto font-light mb-24">
            The proactive nature of FinVoice. We find relevant opportunities based on your profile.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/5 text-left hover:bg-white/10 transition-colors">
              <div className="size-10 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center mb-6">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h4 className="text-[18px] font-medium text-white mb-2">Education</h4>
              <p className="text-[14px] text-white/50">New scholarship opportunity matches your profile.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/5 text-left hover:bg-white/10 transition-colors">
              <div className="size-10 rounded-full bg-[#38BDF8]/20 text-[#38BDF8] flex items-center justify-center mb-6">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h4 className="text-[18px] font-medium text-white mb-2">Financial Support</h4>
              <p className="text-[14px] text-white/50">Scheme deadline approaching next week.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/5 text-left hover:bg-white/10 transition-colors">
              <div className="size-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mb-6">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h4 className="text-[18px] font-medium text-white mb-2">Documents</h4>
              <p className="text-[14px] text-white/50">One document still missing for application readiness.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 8: FINANCIAL TOOLS ─── */}
      <section className="w-full py-40 px-6 md:px-12 bg-[#05070A]">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-[48px] md:text-[72px] font-semibold tracking-tight text-white mb-6">
              From conversation<br/>to action.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {[{num: '01', title: 'Eligibility', desc: 'Understand whether you may meet published criteria.'},
              {num: '02', title: 'Scheme Discovery', desc: 'Find relevant financial opportunities.'},
              {num: '03', title: 'Document Readiness', desc: 'Know what you may need before applying.'},
              {num: '04', title: 'What-if Simulator', desc: 'Explore simple financial scenarios.'}].map(tool => (
              <div key={tool.num} className="group relative p-10 rounded-3xl bg-white/[0.02] border border-white/[0.05] overflow-hidden hover:bg-white/[0.04] transition-all duration-500">
                <span className="absolute top-10 right-10 text-[60px] font-light text-white/5 group-hover:text-white/10 transition-colors">{tool.num}</span>
                <h3 className="text-[24px] text-white font-medium mb-4 relative z-10">{tool.title}</h3>
                <p className="text-[16px] text-white/50 relative z-10">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 9: DOCUMENT READINESS ─── */}
      <section className="w-full py-40 px-6 md:px-12 bg-[#0B1220] flex flex-col items-center">
        <div className="max-w-[1400px] mx-auto text-center mb-20">
          <h2 className="text-[48px] md:text-[72px] font-semibold tracking-tight text-white mb-6">
            Application Readiness
          </h2>
          <p className="text-[18px] text-white/50 max-w-2xl mx-auto font-light">
            FinVoice helps you understand what is missing before you apply.
          </p>
        </div>
        
        <div className="w-full max-w-lg bg-white/[0.03] border border-white/10 rounded-[32px] p-10 shadow-2xl relative">
          <div className="flex items-center gap-4 mb-10">
            <div className="size-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <span className="text-[12px] uppercase tracking-widest text-white/40 font-semibold block mb-1">Student Scheme</span>
              <h4 className="text-[20px] font-medium text-white leading-none">Required Documents</h4>
            </div>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
              <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span className="text-[15px] text-white/90">Identity document</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
              <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span className="text-[15px] text-white/90">Student ID</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 opacity-60">
              <div className="w-5 h-5 rounded-full border-2 border-white/20 shrink-0" />
              <span className="text-[15px] text-white/70">Income certificate</span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 opacity-60">
              <div className="w-5 h-5 rounded-full border-2 border-white/20 shrink-0" />
              <span className="text-[15px] text-white/70">Institution certificate</span>
            </div>
          </div>
          
          <div className="flex justify-center">
            <span className="px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-[12px] font-medium tracking-wide">
              2 items remaining
            </span>
          </div>
        </div>
      </section>

      {/* ─── SECTION 10: SCAM SHIELD / TRUST ─── */}
      <section className="w-full py-40 px-6 md:px-12 bg-[#070B12] relative">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 space-y-12">
            <h2 className="text-[48px] md:text-[72px] font-semibold tracking-tight text-white leading-tight">
              Some questions<br/>should never be<br/>answered by AI.
            </h2>
            
            <div className="space-y-4">
              <span className="text-[11px] uppercase tracking-widest text-green-400 font-semibold block mb-6">FinVoice Trust</span>
              {['Never asks for OTP', 'Never asks for PIN', 'Never asks for passwords', 'Never guarantees approval', 'Requires consent before saving', 'Escalates sensitive cases'].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-[16px] text-white/80">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-lg">
            <div className="p-8 rounded-3xl bg-[#05070A] border border-red-500/20 shadow-2xl space-y-6">
              <div className="flex items-start gap-4">
                <div className="size-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">U</div>
                <div className="bg-white/10 p-4 rounded-2xl rounded-tl-sm text-[14px] text-white/90">
                  Someone called and asked me for my OTP to process the scheme. Should I share it?
                </div>
              </div>
              <div className="flex items-start gap-4 flex-row-reverse">
                <div className="size-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 text-red-400">FV</div>
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl rounded-tr-sm text-[14px] text-white/90">
                  Don't share it. I will never ask for your OTP, PIN or password. No legitimate official will ask for this over the phone.
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <span className="px-4 py-2 rounded-full bg-red-500/20 text-red-400 text-[11px] font-semibold tracking-widest uppercase">
                  Human Help Available
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 11: HUMAN ESCALATION ─── */}
      <section className="w-full py-40 px-6 md:px-12 bg-[#05070A]">
        <div className="max-w-[1400px] mx-auto text-center flex flex-col items-center">
          <h2 className="text-[48px] md:text-[72px] font-semibold tracking-tight text-white mb-20">
            AI should know<br/>when to step aside.
          </h2>
          
          <div className="w-full max-w-md bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 text-left">
            <div className="flex items-center justify-between mb-8">
              <span className="text-[11px] uppercase tracking-widest text-[#F5F5F7] font-semibold">Human Assist Request</span>
              <span className="text-[12px] text-rose-400 font-mono">FV-2841</span>
            </div>
            
            <div className="space-y-6">
              <div>
                <span className="text-[11px] text-white/40 uppercase block mb-1">Issue</span>
                <span className="text-[15px] text-white">Possible financial fraud</span>
              </div>
              <div>
                <span className="text-[11px] text-white/40 uppercase block mb-1">Language</span>
                <span className="text-[15px] text-white">Hindi + English</span>
              </div>
              <div className="flex gap-12">
                <div>
                  <span className="text-[11px] text-white/40 uppercase block mb-1">Priority</span>
                  <span className="text-[13px] text-rose-400 font-medium px-3 py-1 bg-rose-500/10 rounded-full">HIGH</span>
                </div>
                <div>
                  <span className="text-[11px] text-white/40 uppercase block mb-1">Status</span>
                  <span className="text-[13px] text-amber-400 font-medium px-3 py-1 bg-amber-500/10 rounded-full">Waiting for human</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 flex items-center justify-center gap-4 text-[12px] text-white/40 font-mono uppercase tracking-widest flex-wrap max-w-2xl mx-auto">
            <span>Detect</span> <span className="text-white/20">→</span>
            <span>Ask permission</span> <span className="text-white/20">→</span>
            <span>Create request</span> <span className="text-white/20">→</span>
            <span>Human assistance</span>
          </div>
        </div>
      </section>

      {/* ─── SECTION 12: OUTBOUND VOICE ─── */}
      <section className="w-full py-40 px-6 md:px-12 bg-[#0B1220] relative">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 space-y-8">
            <h2 className="text-[48px] md:text-[72px] font-semibold leading-[1.1] text-white tracking-tight">
              Sometimes,<br/>FinVoice calls you.
            </h2>
            <p className="text-[18px] text-white/60 font-light max-w-md leading-relaxed">
              We proactively reach out when important events happen — like when we find a relevant scheme or a deadline is approaching.
            </p>
            <div className="flex flex-col gap-4 mt-8">
              <span className="text-[14px] text-white/80 font-medium bg-white/5 border border-white/10 px-4 py-2 rounded-full inline-flex w-max">
                Why we're calling
              </span>
              <span className="text-[14px] text-white/80 font-medium bg-white/5 border border-white/10 px-4 py-2 rounded-full inline-flex w-max">
                How to opt out
              </span>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-md mx-auto">
            <div className="rounded-[40px] bg-[#05070A] border border-white/10 shadow-2xl p-6 relative overflow-hidden aspect-[9/16] flex flex-col items-center">
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-green-500/20 to-transparent pointer-events-none" />
              
              <div className="mt-12 mb-8 flex flex-col items-center">
                <h3 className="text-[24px] font-medium text-white tracking-tight mb-2">FINVOICE AI</h3>
                <span className="text-[14px] text-green-400 font-medium animate-pulse">Calling...</span>
              </div>
              
              <div className="w-32 h-32 rounded-full border border-green-500/30 flex items-center justify-center relative mb-12">
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-50" />
                <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/40" />
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 w-full mt-auto mb-10">
                <p className="text-[13px] text-white/90 leading-relaxed italic">
                  "Hi Prithvi, this is FinVoice. You previously asked me to notify you about relevant student financial opportunities. I found something that may be worth checking."
                </p>
              </div>
              
              <div className="flex items-center gap-12 mt-auto pb-4">
                <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors">
                  <svg className="w-8 h-8 text-white rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.82 2.29a1 1 0 0 0-1.41 0l-4.12 4.12a1 1 0 0 0 0 1.41l3.53 3.54a1 1 0 0 1 0 1.41l-6.36 6.37a1 1 0 0 1-1.42 0l-3.53-3.54a1 1 0 0 0-1.42 0L2.29 16.41a1 1 0 0 0 0 1.42l3.54 3.53a1 1 0 0 0 1.41 0c4.32-4.32 11.31-11.31 15.63-15.63a1 1 0 0 0 0-1.41l-3.54-3.53z"/></svg>
                </div>
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 13: VOICE RECEIPT ─── */}
      <section className="w-full py-40 px-6 md:px-12 bg-[#05070A] flex flex-col items-center">
        <div className="max-w-[1400px] mx-auto text-center mb-20">
          <h2 className="text-[48px] md:text-[72px] font-semibold tracking-tight text-white mb-6">
            Never forget<br/>what happened on a call.
          </h2>
        </div>
        
        <div className="w-full max-w-sm bg-white/[0.03] border border-white/10 rounded-[32px] p-8 shadow-2xl relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/20 rounded-b-lg" />
          
          <div className="text-center mb-10 mt-4">
            <span className="text-[12px] uppercase tracking-widest text-white/50 font-semibold">Voice Receipt</span>
            <h4 className="text-[24px] font-medium text-white mt-2">Call Summary</h4>
          </div>
          
          <div className="space-y-4 border-b border-white/10 pb-8 mb-8">
            <div className="flex items-start gap-4">
              <svg className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span className="text-[15px] text-white/80">Scheme checked</span>
            </div>
            <div className="flex items-start gap-4">
              <svg className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span className="text-[15px] text-white/80">Eligibility discussed</span>
            </div>
            <div className="flex items-start gap-4">
              <svg className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span className="text-[15px] text-white/80">2 documents identified</span>
            </div>
            <div className="flex items-start gap-4">
              <svg className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span className="text-[15px] text-white/80">Follow-up requested</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-[12px] uppercase tracking-widest text-white/40">
            <span>Reference</span>
            <span className="text-white">FV-2841</span>
          </div>
        </div>
      </section>

      {/* ─── SECTION 14: CALL ANALYTICS ─── */}
      <section className="w-full py-40 px-6 md:px-12 bg-[#070B12]">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-[48px] md:text-[72px] font-semibold tracking-tight text-white mb-6">
              Every conversation<br/>becomes measurable.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 text-center flex flex-col items-center justify-center">
              <span className="text-[12px] uppercase tracking-widest text-white/40 mb-4">Total Calls</span>
              <span className="text-[64px] font-light text-white leading-none">42</span>
            </div>
            <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 text-center flex flex-col items-center justify-center">
              <span className="text-[12px] uppercase tracking-widest text-green-400/80 mb-4">Successful</span>
              <span className="text-[64px] font-light text-green-400 leading-none">35</span>
            </div>
            <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 text-center flex flex-col items-center justify-center">
              <span className="text-[12px] uppercase tracking-widest text-rose-400/80 mb-4">Failed</span>
              <span className="text-[64px] font-light text-rose-400 leading-none">7</span>
            </div>
            <div className="p-8 rounded-[32px] bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-center flex flex-col items-center justify-center">
              <span className="text-[12px] uppercase tracking-widest text-[#8B5CF6] mb-4">Success Rate</span>
              <span className="text-[64px] font-light text-white leading-none">83.3%</span>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mt-12 text-[14px] text-white/60">
            <span className="px-6 py-3 rounded-full border border-white/10 bg-white/5">Average duration: 3m 42s</span>
            <span className="px-6 py-3 rounded-full border border-white/10 bg-white/5">Tool success rate: 94%</span>
            <span className="px-6 py-3 rounded-full border border-white/10 bg-white/5">Human escalations: 2</span>
            <span className="px-6 py-3 rounded-full border border-white/10 bg-white/5">Languages used: English, Hindi, Hinglish</span>
          </div>
        </div>
      </section>

      {/* ─── SECTION 15: THE FINVOICE LOOP ─── */}
      <section className="w-full py-40 px-6 md:px-12 bg-[#070B12] overflow-hidden">
        <div className="max-w-[1400px] mx-auto text-center flex flex-col items-center">
          <h2 className="text-[48px] md:text-[72px] font-semibold tracking-tight text-white mb-6">
            One conversation.<br/>An entire financial journey.
          </h2>
          <p className="text-[18px] text-white/50 max-w-2xl font-light mb-32">
            FinVoice doesn't treat every call as a new conversation. It builds continuity — with consent.
          </p>
          
          {/* Animated loop visualization (abstract text flow) */}
          <div className="relative w-full max-w-3xl aspect-square max-h-[600px] rounded-full border border-white/10 flex items-center justify-center">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)]" />
             
             {/* Simple static representation of the loop */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 text-[14px] md:text-[18px] text-white/60 font-medium tracking-wide uppercase">
                <span className="text-white">Talk</span>
                <span>Understand</span>
                <span>Remember</span>
                <span>Discover</span>
                <span>Verify</span>
                <span>Act</span>
                <span>Escalate</span>
                <span>Follow Up</span>
             </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 16: PRODUCT PHILOSOPHY ─── */}
      <section className="w-full py-40 px-6 md:px-12 bg-[#05070A] flex flex-col items-center justify-center min-h-[70vh] text-center">
        <h2 className="text-[50px] md:text-[100px] font-bold tracking-tighter text-white leading-[0.95] mb-12 max-w-5xl">
          Technology should<br/>meet people<br/><span className="text-white/40">where they are.</span>
        </h2>
        <p className="text-[20px] md:text-[28px] text-white/50 font-light max-w-3xl">
          Not everyone should have to learn a financial application.<br/><br/>
          <span className="text-white/90 font-medium">Sometimes the best interface is a conversation.</span>
        </p>
      </section>

      {/* ─── SECTION 17: FINAL CTA ─── */}
      <section className="w-full py-40 px-6 md:px-12 bg-gradient-to-b from-[#05070A] to-[#0B1220] text-center flex flex-col items-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#8B5CF6]/10 blur-[100px] pointer-events-none" />
        
        <h2 className="text-[60px] md:text-[80px] font-bold tracking-tighter text-white mb-4 relative z-10">
          Ready to talk?
        </h2>
        <p className="text-[24px] text-white/60 font-light mb-16 relative z-10">
          Meet FinVoice AI.
        </p>
        
        <div className="flex flex-col items-center gap-8 relative z-10">
          <button 
            onClick={handleStartCall}
            className="px-12 py-5 bg-white text-black rounded-full font-semibold text-[16px] hover:scale-105 transition-transform"
          >
            Talk to FinVoice
          </button>
          <span className="text-[12px] text-white/30 uppercase tracking-widest font-medium">
            Voice powered by Murf Falcon
          </span>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="w-full py-12 px-6 md:px-12 bg-[#05070A] border-t border-white/5 text-center md:text-left">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h4 className="text-[16px] font-semibold text-white tracking-tight mb-2">FINVOICE AI</h4>
            <p className="text-[12px] text-white/40">A proactive financial voice companion for Bharat.</p>
          </div>
          
          <div className="flex gap-6 text-[12px] text-white/60 font-medium">
            <span className="hover:text-white cursor-pointer">Product</span>
            <span className="hover:text-white cursor-pointer">Trust</span>
            <Link href="/support" className="hover:text-white">Human Help</Link>
          </div>
          
          <div className="text-[10px] text-white/30 space-y-1">
            <p>Technology:</p>
            <p>LiveKit • Murf Falcon • Groq • Deepgram • SQLite</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
