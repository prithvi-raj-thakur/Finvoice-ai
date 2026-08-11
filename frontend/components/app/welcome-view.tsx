'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={ref}
      className="w-full min-h-svh overflow-x-hidden bg-[#050505] text-white flex flex-col relative"
      style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}
    >
      {/* Import Google Fonts */}
      <style
        dangerouslySetInnerHTML={{
          __html: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');`,
        }}
      />

      {/* ─── Cinematic Video Background ─── */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-black pointer-events-none">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-[1.02] opacity-80"
          style={{ filter: 'brightness(0.6) contrast(1.1)' }}
        >
          <source src="/hero2.mp4" type="video/mp4" />
        </video>
        {/* Subtle gradient overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/50" />
        {/* Subtle radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,5,0.7)_100%)] pointer-events-none" />
      </div>

      {/* ─── Minimal Navigation ─── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-30 flex items-center justify-between px-6 md:px-12 py-6 w-full"
      >
        <div className="flex items-center gap-3">
          <div className="size-6 sm:size-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
          </div>
          <span className="text-[14px] sm:text-[16px] font-semibold tracking-tight text-white/90">
            FinVoice AI
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <span className="text-[12px] font-medium text-white/60 hover:text-white transition-colors cursor-pointer">
            How it works
          </span>
          <span className="text-[12px] font-medium text-white/60 hover:text-white transition-colors cursor-pointer">
            Security
          </span>
          <span className="text-[12px] font-medium text-white/60 hover:text-white transition-colors cursor-pointer">
            Languages
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-[11px] text-[#8B5CF6] font-medium tracking-[0.2em] uppercase bg-[#8B5CF6]/10 px-3 py-1.5 rounded-full border border-[#8B5CF6]/20">
            Voice AI for Bharat
          </span>
        </div>
      </motion.nav>

      {/* ─── Main Content ─── */}
      <div className="relative z-20 flex-1 flex flex-col w-full h-full">
        {/* Hero Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 w-full min-h-[70vh] pb-10">
          <motion.div
            initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-4xl mx-auto flex flex-col items-center"
          >
            <h1 className="text-[56px] sm:text-[72px] md:text-[96px] lg:text-[112px] font-bold text-white tracking-tight leading-[1.05] mb-6 drop-shadow-2xl">
              Your Money.
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-300 to-blue-400">
                Your Voice.
              </span>
            </h1>

            <p className="text-[16px] sm:text-[18px] md:text-[22px] text-white/70 max-w-2xl font-light leading-relaxed mb-12">
              Meet FinVoice AI — a voice-first financial companion built for Bharat.
            </p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-4"
            >
              <button
                onClick={onStartCall}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative group flex items-center justify-center gap-3 px-10 py-5 sm:px-12 sm:py-6 rounded-full bg-white text-black transition-all duration-500 overflow-hidden"
                style={{
                  boxShadow: isHovered
                    ? '0 0 40px rgba(255,255,255,0.4), 0 10px 40px rgba(0,0,0,0.5)'
                    : '0 0 20px rgba(255,255,255,0.1), 0 5px 20px rgba(0,0,0,0.4)',
                  transform: isHovered ? 'scale(1.02) translateY(-2px)' : 'scale(1) translateY(0)',
                }}
                aria-label="Start a Conversation with FinVoice AI"
              >
                {/* Button inner gradient hover effect */}
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-purple-100 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                
                <span className="relative z-10 text-[16px] sm:text-[18px] font-semibold tracking-tight">
                  Start a Conversation
                </span>
                
                <div className="relative z-10 size-8 sm:size-10 rounded-full bg-black flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                </div>
              </button>

              <p className="text-[11px] sm:text-[12px] font-medium tracking-wide text-white/50 uppercase mt-4">
                Voice-first • Hindi + English • Powered by Murf Falcon
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
