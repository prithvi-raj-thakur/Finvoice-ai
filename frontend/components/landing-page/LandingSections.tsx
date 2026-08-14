import React from 'react';
import { SplitText } from './SplitText';
import { CardSpotlight } from '@/components/site/card-spotlight';
import BorderGlow from '@/components/site/BorderGlow';

export const SocialProofSection = () => (
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
);

export const StorySection = () => (
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
);

export const CapabilitiesSection = () => (
  <section className="scroll-section w-full py-40 px-6 bg-[#050A14]">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:gap-12">
      {[
        { num: '01', title: 'UNDERSTAND', desc: 'Ask financial questions naturally in your own language.' },
        { num: '02', title: 'CHECK', desc: 'Explore schemes and eligibility without navigating complicated portals.' },
        { num: '03', title: 'ACT', desc: 'Know exactly what to do next, with clear step-by-step guidance.' }
      ].map((block, i) => (
        <CardSpotlight key={i} className="scroll-fade flex-1 flex flex-col p-8 hover:border-[#38bdf8]/50 transition-colors duration-500">
          <span className="text-[13px] font-mono text-[#38bdf8]/80 mb-12">{block.num}</span>
          <h3 className="text-[28px] md:text-[36px] font-semibold text-white tracking-tight mb-6">{block.title}</h3>
          <p className="text-[18px] text-white/50 font-light leading-relaxed">{block.desc}</p>
        </CardSpotlight>
      ))}
    </div>
  </section>
);

export const MultiAgentSection = () => (
  <section className="scroll-section w-full py-48 px-4 bg-[#030712] relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />
    
    <div className="w-[98%] max-w-[1800px] mx-auto flex flex-col items-center relative z-10">
      <div className="flex flex-col items-center mb-24">
        <span className="scroll-fade text-[12px] md:text-[14px] font-mono tracking-[0.2em] text-[#38bdf8] uppercase mb-4 px-4 py-1.5 rounded-full border border-[#38bdf8]/30 bg-[#38bdf8]/10">
          Dynamic Routing Architecture
        </span>
        <h2 className="text-[48px] md:text-[72px] font-semibold tracking-tighter text-white leading-[1.05] text-center mb-6">
          <SplitText text="One Voice." />
          <br />
          <span className="text-white/40 italic font-light"><SplitText text="Five Experts." /></span>
        </h2>
        <p className="scroll-fade text-[18px] md:text-[22px] text-white/50 max-w-2xl text-center font-light leading-relaxed">
          The Main Agent acts as your intelligent conversational router, instantly understanding your context and handing you off to the perfect specialist.
        </p>
      </div>

      <div className="scroll-fade relative w-full flex flex-col items-center mt-8">
        
        {/* Main Agent (Center Top) */}
        <div className="relative z-20 bg-[#0A0D18]/80 backdrop-blur-2xl border border-white/10 hover:border-[#38bdf8]/50 rounded-[2rem] p-8 text-center w-80 shadow-[0_0_40px_rgba(56,189,248,0.15)] transition-all duration-500 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#38bdf8]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(56,189,248,0.5)] group-hover:scale-110 transition-transform duration-500">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
          </div>
          <h3 className="text-[28px] font-semibold text-white tracking-tight leading-none mb-2">Main Agent</h3>
          <p className="text-[11px] font-mono tracking-widest text-[#38bdf8] uppercase">Core Router Engine</p>
        </div>

        {/* SVG Curved Connections */}
        <div className="relative w-full h-[180px] -mt-4 -mb-4 z-10 pointer-events-none">
          <svg 
            viewBox="0 0 1000 200" 
            preserveAspectRatio="none" 
            className="w-full h-full absolute inset-0 overflow-visible"
          >
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="200" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            {/* Background Paths */}
            <path d="M 500 0 C 500 100, 100 100, 100 200" fill="none" stroke="url(#lineGrad)" strokeWidth="2" />
            <path d="M 500 0 C 500 100, 300 100, 300 200" fill="none" stroke="url(#lineGrad)" strokeWidth="2" />
            <path d="M 500 0 C 500 100, 500.1 100, 500.1 200" fill="none" stroke="url(#lineGrad)" strokeWidth="2" />
            <path d="M 500 0 C 500 100, 700 100, 700 200" fill="none" stroke="url(#lineGrad)" strokeWidth="2" />
            <path d="M 500 0 C 500 100, 900 100, 900 200" fill="none" stroke="url(#lineGrad)" strokeWidth="2" />
            
            {/* Animated Flow Lines */}
            <path d="M 500 0 C 500 100, 100 100, 100 200" fill="none" stroke="#38bdf8" strokeWidth="2" className="animate-flow-1" strokeDasharray="100 1000" strokeLinecap="round" />
            <path d="M 500 0 C 500 100, 300 100, 300 200" fill="none" stroke="#38bdf8" strokeWidth="2" className="animate-flow-2" strokeDasharray="100 1000" strokeLinecap="round" />
            <path d="M 500 0 C 500 100, 500.1 100, 500.1 200" fill="none" stroke="#38bdf8" strokeWidth="2" className="animate-flow-3" strokeDasharray="100 1000" strokeLinecap="round" />
            <path d="M 500 0 C 500 100, 700 100, 700 200" fill="none" stroke="#38bdf8" strokeWidth="2" className="animate-flow-4" strokeDasharray="100 1000" strokeLinecap="round" />
            <path d="M 500 0 C 500 100, 900 100, 900 200" fill="none" stroke="#38bdf8" strokeWidth="2" className="animate-flow-5" strokeDasharray="100 1000" strokeLinecap="round" />
          </svg>
        </div>

        {/* Specialists Row */}
        <div className="relative z-20 w-full grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 px-2">
          {[
            { title: 'Schemes', subtitle: 'ELIGIBILITY', desc: 'Finds and matches you with government schemes based on your profile.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { title: 'Documents', subtitle: 'CHECKLISTS', desc: 'Prepares detailed document checklists for any application.', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { title: 'Application', subtitle: 'GUIDANCE', desc: 'Walks you step-by-step through complex application forms.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { title: 'Fraud & Safety', subtitle: 'PROTECTION', desc: 'Detects scams and warns you before you make risky decisions.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
            { title: 'Literacy', subtitle: 'EDUCATION', desc: 'Breaks down complex financial concepts into simple terms.', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
          ].map((bot, i) => (
            <BorderGlow 
              key={i} 
              borderRadius={32}
              className="group transition-all duration-700 p-6 lg:p-8 text-center flex flex-col items-center hover:-translate-y-4 hover:shadow-[0_20px_40px_-10px_rgba(255,255,255,0.05)] cursor-default overflow-hidden"
            >
              <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 lg:mb-8 group-hover:scale-110 transition-transform duration-700 group-hover:bg-white/[0.08] relative z-10 shrink-0">
                <svg className="w-7 h-7 lg:w-8 lg:h-8 text-white/40 group-hover:text-white/90 transition-colors duration-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={bot.icon} />
                </svg>
              </div>
              <h4 className="text-[20px] lg:text-[24px] font-semibold text-white/90 tracking-tight mb-2 relative z-10">{bot.title}</h4>
              <p className="text-[9px] lg:text-[10px] font-bold tracking-[0.2em] text-white/30 mb-4 lg:mb-6 relative z-10">{bot.subtitle}</p>
              <p className="text-[13px] lg:text-[14px] text-white/40 font-light leading-relaxed group-hover:text-white/60 transition-colors duration-700 relative z-10">{bot.desc}</p>
            </BorderGlow>
          ))}
        </div>
      </div>
      
      {/* Add the custom animation styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flowDash {
          0% { stroke-dashoffset: 1100; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-flow-1 { animation: flowDash 3s linear infinite; }
        .animate-flow-2 { animation: flowDash 3.5s linear infinite 0.5s; }
        .animate-flow-3 { animation: flowDash 2.5s linear infinite 1s; }
        .animate-flow-4 { animation: flowDash 3.2s linear infinite 0.2s; }
        .animate-flow-5 { animation: flowDash 3.8s linear infinite 0.8s; }
      `}} />
    </div>
  </section>
);

export const MultilingualSection = ({ langIndex, langPhrases }: { langIndex: number, langPhrases: string[] }) => (
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
);

export const TrustSection = () => (
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
          <BorderGlow key={i} className="scroll-fade">
            <div className="flex items-center gap-5 py-6 px-6 border-b border-white/5 rounded-xl hover:border-white/20 transition-colors">
              <div className="w-2 h-2 rounded-full bg-[#38bdf8]/80 shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
              <span className="text-[18px] text-white/80 font-light">{item}</span>
            </div>
          </BorderGlow>
        ))}
      </div>
    </div>
  </section>
);

export const CTASection = ({ onStartInteraction }: { onStartInteraction: () => void }) => (
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
        onClick={onStartInteraction}
        className="scroll-fade flex items-center gap-4 px-10 py-5 rounded-full bg-[#38bdf8] text-[#030712] text-[18px] font-semibold hover:bg-white transition-all duration-300 shadow-[0_0_30px_rgba(56,189,248,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] group"
      >
        Start a conversation
        <span className="transition-transform duration-300 group-hover:translate-x-2">→</span>
      </button>
    </div>
  </section>
);

export const Footer = () => (
  <footer className="scroll-section w-full pt-40 bg-[#02040A] border-t border-white/5 flex flex-col items-center overflow-hidden">
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center px-6 md:px-12">
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
      <div className="scroll-fade w-full flex flex-col md:flex-row items-center justify-between gap-6 pb-12 text-[13px] text-white/30">
        <span>© 2026 FinVoice AI. All rights reserved.</span>
        <span>Designed with Murf Falcon & LiveKit.</span>
      </div>
    </div>
    <div className="w-full flex justify-center items-end mt-auto pointer-events-none select-none">
      <h2 className="text-[17vw] font-semibold tracking-tighter leading-[0.75] whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-b from-[#38bdf8]/40 to-[#0284c7]/5">
        FinVoice AI
      </h2>
    </div>
  </footer>
);
