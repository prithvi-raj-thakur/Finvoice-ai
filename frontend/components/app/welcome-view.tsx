'use client';

import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { Navbar } from '@/components/landing-page/Navbar';
import { HeroSection } from '@/components/landing-page/HeroSection';
import {
  SocialProofSection,
  StorySection,
  CapabilitiesSection,
  MultiAgentSection,
  MultilingualSection,
  TrustSection,
  CTASection,
  Footer
} from '@/components/landing-page/LandingSections';

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLElement>(null);
  const dashboardMockRef = useRef<HTMLDivElement>(null);
  const transitionCurtainRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);

  const [langIndex, setLangIndex] = useState(0);
  const langPhrases = [
    "मुझे सरकारी योजना के बारे में जानना है।",
    "Which schemes am I eligible for?",
    "আমি এই প্রকল্পের জন্য যোগ্য কি?",
    "मला शिष्यवृत्ती बद्दल माहिती हवी आहे."
  ];

  useEffect(() => {
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
        gsap.to(loaderRef.current, { yPercent: -100, duration: 1.2, ease: 'power4.inOut' });

        const tl = gsap.timeline({ defaults: { ease: "power4.out" }, delay: 0.6 });

        if (navbarRef.current) {
          tl.from(navbarRef.current, { y: -30, opacity: 0, duration: 1.5 }, 0);
        }

        tl.from('.hero-section .word-reveal', { y: '100%', rotateZ: 10, opacity: 0, duration: 1.2, stagger: 0.05 }, 0.4);

        tl.from('.hero-fade', { y: 30, opacity: 0, duration: 1.5, stagger: 0.1 }, 1.0);

        if (dashboardMockRef.current) {
          tl.from(dashboardMockRef.current, { y: 150, opacity: 0, rotateX: 15, scale: 0.95, duration: 2, ease: "power3.out" }, 1.0);
        }
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

    if (containerRef.current) {
      if (navbarRef.current) {
        gsap.to(navbarRef.current, {
          width: "80%",
          backgroundColor: "rgba(3, 7, 18, 0.8)",
          backdropFilter: "blur(12px)", // Reduced blur to improve performance
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 10px 20px -10px rgba(0,0,0,0.8)", // Optimized shadow
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top -50",
            end: "top -150",
            scrub: true
          }
        });

        ScrollTrigger.create({
          start: 'top -200',
          onUpdate: (self) => {
            if (self.direction === 1) {
              gsap.to(navbarRef.current, { yPercent: -150, duration: 0.4, ease: "power3.out" });
            } else {
              gsap.to(navbarRef.current, { yPercent: 0, duration: 0.4, ease: "power3.out" });
            }
          }
        });
      }

      if (dashboardMockRef.current) {
        gsap.to(dashboardMockRef.current, {
          y: '-20%', // Slightly reduced parallax distance
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          }
        });
      }

      const sections = gsap.utils.toArray<HTMLElement>('.scroll-section');
      sections.forEach((section) => {
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

        const elements = section.querySelectorAll('.scroll-fade');
        if (elements.length) {
          gsap.fromTo(elements,
            { y: 40, opacity: 0 },
            {
              y: 0, opacity: 1,
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
    const tl = gsap.timeline({
      onComplete: () => {
        onStartCall();
      }
    });

    if (transitionCurtainRef.current) {
      tl.to(transitionCurtainRef.current, {
        scaleY: 1,
        duration: 0.8,
        ease: "power4.inOut"
      });
    }

    if (containerRef.current) {
      tl.to(containerRef.current, {
        scale: 0.95,
        filter: 'blur(10px)',
        duration: 0.8,
        ease: "power4.inOut"
      }, 0);
    }
  };

  return (
    <>
      <div
        ref={transitionCurtainRef}
        className="fixed inset-0 w-full h-full bg-[#030712] z-[9999] origin-bottom pointer-events-none flex items-center justify-center"
        style={{ transform: 'scaleY(0)' }}
      >
        <div className="w-12 h-12 border-4 border-[#38bdf8]/20 border-t-[#38bdf8] rounded-full animate-spin" />
      </div>

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
        <Navbar navbarRef={navbarRef} onStartInteraction={handleStartInteraction} />
        
        <HeroSection dashboardMockRef={dashboardMockRef} onStartInteraction={handleStartInteraction} />
        
        <SocialProofSection />
        
        <StorySection />
        
        <CapabilitiesSection />
        
        <MultiAgentSection />
        
        <MultilingualSection langIndex={langIndex} langPhrases={langPhrases} />
        
        <TrustSection />
        
        <CTASection onStartInteraction={handleStartInteraction} />
        
        <Footer />
      </div>
    </>
  );
};
