'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import dynamic from 'next/dynamic';

const GradientWaves = dynamic(() => import('@/components/site/Hero'), { ssr: false });

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Helper for splitting text into words for stagger animations
const SplitText = ({ text, className = '' }: { text: string; className?: string }) => {
  return (
    <span className={`inline-block ${className}`}>
      {text.split(' ').map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pr-2 pb-2">
          <span className="word-reveal inline-block translate-y-[100%] rotate-6 opacity-0">
            {word}
          </span>
        </span>
      ))}
    </span>
  );
};

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLElement>(null);
  const dashboardMockRef = useRef<HTMLDivElement>(null);
  const leftGlowRef = useRef<HTMLDivElement>(null);
  const rightGlowRef = useRef<HTMLDivElement>(null);
  const transitionCurtainRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);

  // Multilingual text rotation state
  const [langIndex, setLangIndex] = useState(0);
  const langPhrases = [
    "मुझे सरकारी योजना के बारे में जानना है।",
    "Which schemes am I eligible for?",
    "আমি এই প্রকল্পের জন্য যোগ্য কি?",
    "मला शिष्यवृत्ती बद्दल माहिती हवी आहे."
  ];

  useEffect(() => {
    // Lenis Smooth Scrolling Setup
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    const interval = setInterval(() => {
      setLangIndex(prev => (prev + 1) % langPhrases.length);
    }, 2500);

    return () => {
      clearInterval(interval);
      lenis.destroy();
      gsap.ticker.remove((time) => { lenis.raf(time * 1000); });
    };
  }, []);

  useGSAP(() => {
    // 0. Loader animation
    const tlLoader = gsap.timeline({
      onComplete: () => {
        // Slide out loader
        gsap.to(loaderRef.current, { yPercent: -100, duration: 1.2, ease: 'power4.inOut' });

        // 1. Initial Page Load Animations (Hero)
        const tl = gsap.timeline({ defaults: { ease: "power4.out" }, delay: 0.6 });

        // Navbar drops down
        tl.fromTo(navbarRef.current,
          { y: -30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.5 }, 0
        );



        // Hero Text Word Stagger Reveal
        tl.fromTo('.hero-section .word-reveal',
          { y: '100%', rotateZ: 10, opacity: 0 },
          { y: '0%', rotateZ: 0, opacity: 1, duration: 1.2, stagger: 0.05 }, 0.4
        );

        // Other simple hero fades
        tl.fromTo('.hero-fade',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.5, stagger: 0.1 }, 1.0
        );

        // Dashboard mockup floats up and rotates into place (3D)
        tl.fromTo(dashboardMockRef.current,
          { y: 150, opacity: 0, rotateX: 15, scale: 0.95 },
          { y: 0, opacity: 1, rotateX: 0, scale: 1, duration: 2, ease: "power3.out" }, 1.0
        );
      }
    });

    tlLoader.to({ val: 0 }, {
      val: 100,
      duration: 2.2,
      ease: "power2.inOut",
      onUpdate: function () {
        setProgress(Math.floor(this.targets()[0].val));
      }
    });

    // 2. Scroll Animations
    if (containerRef.current) {
      // Navbar shrink on scroll
      gsap.to(navbarRef.current, {
        width: "80%",
        backgroundColor: "rgba(3, 7, 18, 0.6)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.8)",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top -50",
          end: "top -150",
          scrub: true
        }
      });

      // Hide navbar on scroll down, show on scroll up
      ScrollTrigger.create({
        start: 'top -200',
        onUpdate: (self) => {
          if (self.direction === 1) { // scrolling down
            gsap.to(navbarRef.current, { yPercent: -150, duration: 0.4, ease: "power3.out" });
          } else { // scrolling up
            gsap.to(navbarRef.current, { yPercent: 0, duration: 0.4, ease: "power3.out" });
          }
        }
      });

      // Parallax for Dashboard Mockup
      gsap.to(dashboardMockRef.current, {
        y: '-25%',
        scale: 1.05,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      });

      // Section Reveals (Intense stagger masks)
      const sections = gsap.utils.toArray<HTMLElement>('.scroll-section');
      sections.forEach((section) => {
        // Words reveal
        const words = section.querySelectorAll('.word-reveal');
        if (words.length) {
          gsap.fromTo(words,
            { y: '100%', rotateZ: 5, opacity: 0 },
            {
              y: '0%', rotateZ: 0, opacity: 1,
              duration: 1.2, stagger: 0.03, ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 80%",
              }
            }
          );
        }

        // Simple elements reveal
        const elements = section.querySelectorAll('.scroll-fade');
        if (elements.length) {
          gsap.fromTo(elements,
            { y: 40, opacity: 0, filter: 'blur(10px)' },
            {
              y: 0, opacity: 1, filter: 'blur(0px)',
              duration: 1.2, stagger: 0.1, ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 85%",
              }
            }
          );
        }
      });
    }



  }, { scope: containerRef, dependencies: [] });

  const handleStartInteraction = () => {
    // Page Transition Animation (Curtain dropping)
    const tl = gsap.timeline({
      onComplete: () => {
        onStartCall();
      }
    });

    // The curtain sweeps across the screen from bottom to top
    tl.to(transitionCurtainRef.current, {
      scaleY: 1,
      duration: 0.8,
      ease: "power4.inOut"
    });

    // Scale down the entire site slightly as it gets covered
    tl.to(containerRef.current, {
      scale: 0.95,
      filter: 'blur(10px)',
      duration: 0.8,
      ease: "power4.inOut"
    }, 0);
  };

  return (
    <>
      {/* EXPLICIT PAGE TRANSITION CURTAIN */}
      <div
        ref={transitionCurtainRef}
        className="fixed inset-0 w-full h-full bg-[#030712] z-[9999] origin-bottom pointer-events-none flex items-center justify-center"
        style={{ transform: 'scaleY(0)' }}
      >
        <div className="w-12 h-12 border-4 border-[#38bdf8]/20 border-t-[#38bdf8] rounded-full animate-spin" />
      </div>

      {/* 100% GSAP LOADER SCREEN */}
      <div
        ref={loaderRef}
        className="fixed inset-0 w-full h-full bg-[#030712] z-[10000] flex flex-col items-center justify-center loader-overlay origin-top"
      >
        <div className="flex flex-col items-center">
          <div className="text-[120px] md:text-[180px] font-medium tracking-tighter text-white font-sans leading-none mb-6">{progress}<span className="text-[60px] md:text-[80px] text-white/50">%</span></div>
          <div className="w-64 md:w-96 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#0284c7] to-[#38bdf8] rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="w-full bg-[#030712] text-white flex flex-col relative selection:bg-[#38bdf8]/30 overflow-x-hidden font-sans origin-center"
      >
        {/* ─── NAVBAR ─── */}
        <nav
          ref={navbarRef}
          className="fixed top-6 left-0 right-0 mx-auto z-50 flex items-center justify-between px-3 py-3 w-[95%] max-w-5xl rounded-full bg-white/[0.02] border border-white/[0.08] backdrop-blur-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] transition-colors duration-500"
        >
          {/* ─── LOGO (Left) ─── */}
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

          {/* ─── LINKS (Center) ─── */}
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

          {/* ─── CTA (Right) ─── */}
          <div className="flex items-center">
            <button
              onClick={handleStartInteraction}
              className="group relative flex items-center justify-center gap-2 px-7 py-2.5 rounded-full bg-white text-[#030712] text-[13px] font-semibold hover:scale-[1.02] transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] overflow-hidden"
            >
              <span className="relative z-10">Start Agent</span>
              <svg className="w-3.5 h-3.5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </button>
          </div>
        </nav>

        {/* ─── HERO SECTION ─── */}
        <section className="hero-section relative w-full min-h-[130svh] flex flex-col items-center pt-36 pb-20 px-6 perspective-1000">

          {/* ─── NEW GRADIENT WAVES HERO BACKGROUND ─── */}
          <div className="absolute inset-0 w-full h-full z-0 opacity-80 pointer-events-none">
            <GradientWaves
              horizonColor="#0284c7"
              waveColor="#0ea5e9"
              crestColor="#bae6fd"
              speed={0.3}
              amplitude={2.5}
              waveScale={0.7}
              waveRatio={0.9}
              swell={30}
              turbulence={15}
              tilt={1.1}
              zoom={1.2}
              height={5.0}
              fogDepth={20}
              detail="high"
              brightness={1.0}
              opacity={1.0}
              mouseInteraction={true}
              parallaxStrength={0.5}
              grain={true}
              grainIntensity={0.05}
            />
          </div>
          
          {/* Subtle top fade for navbar contrast */}
          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#030712] to-transparent -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#030712] to-transparent -z-10 pointer-events-none" />

          {/* Hero Content */}
          <div className="relative z-10 text-center flex flex-col items-center mt-10 w-full">

            {/* Eyebrow Pill */}
            <div className="hero-fade flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-12">
              <span className="text-[11px] text-white/70 font-medium tracking-wide">Simplify your workflow</span>
              <div className="w-1 h-1 rounded-full bg-white/40" />
              <span className="text-[11px] text-white/70 font-medium tracking-wide">AI Assistant</span>
            </div>

            {/* Headline with Stagger Animation */}
            <h1 className="text-[52px] sm:text-[72px] md:text-[90px] font-semibold text-white tracking-tight leading-[1.05] mb-8 max-w-5xl">
              <SplitText text="Enhance your financial control with FinVoice" />
            </h1>

            {/* Supporting Statement */}
            <p className="hero-fade text-[16px] md:text-[20px] text-white/50 max-w-2xl font-light leading-relaxed mb-12">
              Streamline your business's financial management with our intuitive, scalable platform. Designed for modern enterprises, our solutions simplify complex processes.
            </p>

            {/* CTA */}
            <div className="hero-fade">
              <button
                onClick={handleStartInteraction}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative flex items-center justify-center px-10 py-4 rounded-full bg-white text-[#030712] transition-all duration-300 overflow-hidden"
                style={{
                  boxShadow: isHovered
                    ? '0 0 30px rgba(255,255,255,0.4), 0 0 60px rgba(56,189,248,0.4)'
                    : '0 0 15px rgba(255,255,255,0.1)',
                  transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                }}
              >
                <span className="relative z-10 text-[15px] font-semibold tracking-tight">Get started</span>
              </button>
            </div>
          </div>

          {/* ─── DASHBOARD MOCKUP ─── */}
          <div
            ref={dashboardMockRef}
            className="relative z-10 mt-24 w-full max-w-[1200px] aspect-[16/9] rounded-[24px] bg-[#0A101C]/80 backdrop-blur-2xl border border-white/10 shadow-[0_40px_120px_-10px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col p-8"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.06)_0%,transparent_60%)] pointer-events-none" />

            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div>
                  <h3 className="text-[20px] font-medium text-white">Welcome back, Prithvi!</h3>
                  <p className="text-[13px] text-white/40">Voice AI is ready to assist.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                  <div className="w-3.5 h-3.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 flex-1">
              {/* Card 1 */}
              <div className="rounded-[20px] bg-white/[0.02] border border-white/5 p-8 flex flex-col relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
                <span className="text-[14px] text-white/50 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  Total Balance
                </span>
                <h4 className="text-[40px] font-semibold text-white mb-3 tracking-tight">$14,090,090.00</h4>
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full font-medium">+12%</span>
                  <span className="text-white/30">from last month</span>
                </div>

                <div className="mt-auto space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-6 bg-gradient-to-r from-orange-400 to-red-500 rounded flex items-center justify-center text-[9px] font-bold">MC</div>
                      <span className="text-[14px] text-white/80">Mastercard</span>
                    </div>
                    <span className="text-[14px] text-white/60">$1,250.00</span>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="rounded-[20px] bg-white/[0.02] border border-white/5 p-8 flex flex-col group hover:bg-white/[0.04] transition-colors">
                <span className="text-[14px] text-white/50 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  Monthly Income
                </span>
                <h4 className="text-[40px] font-semibold text-white mb-3 tracking-tight">$1,083,043.00</h4>
                <div className="flex items-center gap-2 text-[13px] mb-8">
                  <span className="text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full font-medium">+8%</span>
                  <span className="text-white/30">from last month</span>
                </div>

                <div className="flex-1 flex items-end gap-3 pb-2 pt-10">
                  {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                    <div key={i} className="flex-1 bg-white/5 rounded-t-sm relative group/bar h-full flex flex-col justify-end">
                      <div
                        className={`w-full rounded-t-sm transition-all duration-500 ${i === 5 ? 'bg-[#38bdf8] shadow-[0_0_20px_rgba(56,189,248,0.4)]' : 'bg-white/20 group-hover/bar:bg-white/40'}`}
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 9. SOCIAL PROOF / MICRO SECTION ─── */}
        <section className="scroll-section w-full py-32 px-6 bg-[#030712]">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            <span className="scroll-fade text-[11px] uppercase tracking-widest text-white/40 font-semibold mb-8 block">Built for Bharat</span>
            <h3 className="text-[24px] md:text-[36px] font-light text-white/80 leading-relaxed max-w-3xl mb-12">
              <SplitText text="Financial information shouldn't depend on how well you speak English." />
            </h3>
            <div className="scroll-fade flex flex-wrap justify-center gap-4">
              {['Hindi', 'English', 'বাংলা', '+ more Indian languages'].map((lang, i) => (
                <span key={i} className="px-6 py-3 rounded-full border border-white/10 bg-white/[0.02] text-[14px] text-white/60 hover:bg-white/[0.05] transition-colors cursor-default">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 10. PRODUCT STORY SECTION ─── */}
        <section id="story" className="scroll-section w-full py-48 px-6 bg-gradient-to-b from-[#030712] to-[#050A14] relative overflow-hidden">
          <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
            <h2 className="text-[56px] md:text-[90px] font-semibold tracking-tighter text-white leading-[1.05] mb-8">
              <SplitText text="Finance shouldn't feel complicated." />
            </h2>
            <p className="scroll-fade text-[20px] md:text-[28px] text-white/50 max-w-3xl font-light leading-relaxed mb-24">
              FinVoice turns complex financial information into a natural conversation.
            </p>

            <div className="scroll-fade flex items-center justify-center gap-1.5 h-40 w-full max-w-lg mx-auto opacity-60">
              {[...Array(32)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-[#38bdf8]/50 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.3)]"
                  style={{
                    height: `${Math.round(Math.max(10, Math.sin(i * 0.4) * 60 + 40))}%`,
                    animation: `pulse 1.5s ease-in-out ${i * 0.08}s infinite alternate`
                  }}
                />
              ))}
            </div>
            <style dangerouslySetInnerHTML={{ __html: `@keyframes pulse { 0% { transform: scaleY(0.4); opacity: 0.3; } 100% { transform: scaleY(1.3); opacity: 1; } }` }} />
          </div>
        </section>

        {/* ─── 11. THREE CORE CAPABILITIES ─── */}
        <section className="scroll-section w-full py-40 px-6 bg-[#050A14]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:gap-12">
            {[
              { num: '01', title: 'UNDERSTAND', desc: 'Ask financial questions naturally in your own language.' },
              { num: '02', title: 'CHECK', desc: 'Explore schemes and eligibility without navigating complicated portals.' },
              { num: '03', title: 'ACT', desc: 'Know exactly what to do next, with clear step-by-step guidance.' }
            ].map((block, i) => (
              <div key={i} className="scroll-fade flex-1 flex flex-col border-l-2 border-white/5 pl-10 hover:border-[#38bdf8]/50 transition-colors duration-500">
                <span className="text-[13px] font-mono text-[#38bdf8]/80 mb-12">{block.num}</span>
                <h3 className="text-[28px] md:text-[36px] font-semibold text-white tracking-tight mb-6">{block.title}</h3>
                <p className="text-[18px] text-white/50 font-light leading-relaxed">{block.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 12. MULTILINGUAL STORY ─── */}
        <section className="scroll-section w-full py-48 px-6 bg-[#030712] relative border-y border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(14,165,233,0.05)_0%,transparent_50%)] pointer-events-none" />
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-20">
            <div className="flex-1">
              <h2 className="text-[56px] md:text-[80px] font-semibold tracking-tighter text-white leading-[1.05] mb-8">
                <SplitText text="Speak naturally. We'll follow." />
              </h2>
            </div>
            <div className="flex-1 w-full relative h-[120px] flex items-center border-l-2 border-[#38bdf8]/20 pl-10">
              <p
                key={langIndex}
                className="text-[28px] md:text-[36px] text-white/90 font-light leading-relaxed absolute animate-in fade-in slide-in-from-bottom-6 duration-700"
              >
                "{langPhrases[langIndex]}"
              </p>
            </div>
          </div>
        </section>

        {/* ─── 13. TRUST / SAFETY SECTION ─── */}
        <section className="scroll-section w-full py-48 px-6 bg-[#02040A]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-[48px] md:text-[72px] font-semibold tracking-tighter text-white leading-[1.05] mb-24">
              <SplitText text="Helpful. Not reckless." />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
              {[
                'Never asks for OTP or Passwords',
                'Never asks for your PIN',
                'Never asks for Bank Account numbers',
                'Never guarantees loan approval',
                'Escalates when human help is needed'
              ].map((item, i) => (
                <div key={i} className="scroll-fade flex items-center gap-5 py-6 border-b border-white/5 hover:border-white/20 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-[#38bdf8]/80 shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
                  <span className="text-[18px] text-white/80 font-light">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 15. FINAL CTA ─── */}
        <section className="scroll-section w-full py-48 px-6 relative overflow-hidden bg-[#030712]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.15)_0%,transparent_70%)] blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
            <h2 className="text-[64px] md:text-[100px] font-semibold tracking-tighter text-white leading-[1.05] mb-8">
              <SplitText text="Have a question? Just ask." />
            </h2>
            <p className="scroll-fade text-[20px] md:text-[26px] text-white/50 font-light mb-16 max-w-2xl">
              Talk to FinVoice in the language you're comfortable with.
            </p>
            <button
              onClick={handleStartInteraction}
              className="scroll-fade flex items-center gap-4 px-10 py-5 rounded-full bg-[#38bdf8] text-[#030712] text-[18px] font-semibold hover:bg-white transition-all duration-300 shadow-[0_0_30px_rgba(56,189,248,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] group"
            >
              Start a conversation
              <span className="transition-transform duration-300 group-hover:translate-x-2">→</span>
            </button>
          </div>
        </section>

        {/* ─── 16. FOOTER ─── */}
        <footer className="scroll-section w-full pt-40 bg-[#02040A] border-t border-white/5 flex flex-col items-center overflow-hidden">
          <div className="w-full max-w-7xl mx-auto flex flex-col items-center px-6 md:px-12">

            {/* Nav Links / Social */}
            <div className="scroll-fade w-full grid grid-cols-2 md:grid-cols-4 gap-16 mb-24">
              <div className="flex flex-col gap-5">
                <span className="text-[14px] font-medium text-white/80 mb-2">Product</span>
                <span className="text-[14px] text-white/40 hover:text-white transition-colors cursor-pointer block">Experience</span>
                <span className="text-[14px] text-white/40 hover:text-white transition-colors cursor-pointer block">Technology</span>
                <a href="https://github.com/prithvi-raj-thakur" target="_blank" rel="noopener noreferrer" className="text-[14px] text-white/40 hover:text-white transition-colors cursor-pointer block">GitHub</a>
              </div>
              <div className="flex flex-col gap-5">
                <span className="text-[14px] font-medium text-white/80 mb-2">Challenge</span>
                <span className="text-[14px] text-white/40">10 Days of Voice Agents</span>
                <span className="text-[14px] text-white/40">Voice For Bharat</span>
              </div>
              <div className="flex flex-col gap-5">
                <span className="text-[14px] font-medium text-white/80 mb-2">Social</span>
                <a href="https://www.linkedin.com/in/prithvi-raj-thakur-606500312/" target="_blank" rel="noopener noreferrer" className="text-[14px] text-white/40 hover:text-white transition-colors cursor-pointer block">LinkedIn</a>
                <a href="https://github.com/prithvi-raj-thakur" target="_blank" rel="noopener noreferrer" className="text-[14px] text-white/40 hover:text-white transition-colors cursor-pointer block">GitHub</a>
              </div>
            </div>

            {/* Copyright */}
            <div className="scroll-fade w-full flex flex-col md:flex-row items-center justify-between gap-6 pb-12 text-[13px] text-white/30">
              <span>© 2026 FinVoice AI. All rights reserved.</span>
              <span>Designed with Murf Falcon & LiveKit.</span>
            </div>
          </div>

          {/* HUGE EDGE-TO-EDGE TYPOGRAPHY */}
          <div className="w-full flex justify-center items-end mt-auto pointer-events-none select-none">
            <h2 className="text-[17vw] font-semibold tracking-tighter leading-[0.75] whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-b from-[#38bdf8]/40 to-[#0284c7]/5">
              FinVoice AI
            </h2>
          </div>
        </footer>
      </div>
    </>
  );
};
