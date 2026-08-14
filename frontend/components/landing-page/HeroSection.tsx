import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { SplitText } from './SplitText';
import { DashboardMockup } from './DashboardMockup';

const GradientWaves = dynamic(() => import('@/components/site/Hero'), { ssr: false });

interface HeroSectionProps {
  onStartInteraction: () => void;
  dashboardMockRef: React.RefObject<HTMLDivElement | null>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartInteraction,
  dashboardMockRef,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
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
            onClick={onStartInteraction}
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

      <DashboardMockup ref={dashboardMockRef} />
    </section>
  );
};
