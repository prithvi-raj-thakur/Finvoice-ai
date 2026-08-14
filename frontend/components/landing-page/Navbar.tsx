'use client';
import React, { RefObject, useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface NavbarProps {
  navbarRef: RefObject<HTMLElement | null>;
  onStartInteraction: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ navbarRef, onStartInteraction }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/sounds/landing-page.mp3');
    audioRef.current.loop = true;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleSound = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log('Audio playback failed:', e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <nav
      ref={navbarRef}
      className="fixed top-6 left-0 right-0 mx-auto z-50 flex items-center justify-between px-3 py-3 w-[95%] max-w-5xl rounded-full bg-white/[0.02] border border-white/[0.08] backdrop-blur-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] transition-colors duration-500"
    >
      <div className="flex items-center gap-3 pl-3 pr-5 py-2 rounded-full hover:bg-white/[0.04] transition-colors cursor-pointer group">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] flex items-center justify-center p-[1px] group-hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-shadow duration-300">
          <div className="w-full h-full rounded-full bg-[#030712] flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-white group-hover:scale-110 transition-transform duration-300" />
          </div>
        </div>
        <span className="text-[14px] font-semibold tracking-tight text-white/90 group-hover:text-white transition-colors duration-300">
          FinVoice AI
        </span>
      </div>

      <div className="hidden md:flex items-center gap-1 px-4 py-2 rounded-full bg-black/40 border border-white/[0.03] shadow-inner">
        <Link href="/" className="px-5 py-1.5 rounded-full text-[13px] font-medium text-white bg-white/[0.08] shadow-[0_2px_10px_rgba(0,0,0,0.2)] transition-all cursor-pointer">
          Overview
        </Link>
        <Link href="/analytics" className="px-5 py-1.5 rounded-full text-[13px] font-medium text-white/50 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer flex items-center gap-2 group">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500/40 group-hover:bg-green-400 group-hover:shadow-[0_0_8px_rgba(74,222,128,0.8)] transition-all duration-300" />
          Analytics
        </Link>
        <Link href="/support" className="px-5 py-1.5 rounded-full text-[13px] font-medium text-white/50 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer">
          Support
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleSound}
          className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${isPlaying ? 'bg-sky-500/20 border-sky-500/40 text-sky-400' : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:bg-white/[0.08] hover:text-white/80'}`}
          title={isPlaying ? "Mute Background Music" : "Play Background Music"}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.657 6.343a8 8 0 010 11.314M11 5L6 9H2v6h4l5 4V5z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h2.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
        </button>

        <button
          onClick={() => {
            if (audioRef.current) audioRef.current.pause();
            onStartInteraction();
          }}
          className="group relative flex items-center justify-center gap-2 px-7 py-2.5 rounded-full bg-white text-[#030712] text-[13px] font-semibold hover:scale-[1.02] transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] overflow-hidden"
        >
          <span className="relative z-10">Start Agent</span>
          <svg className="w-3.5 h-3.5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
          </svg>
        </button>
      </div>
    </nav>
  );
};
