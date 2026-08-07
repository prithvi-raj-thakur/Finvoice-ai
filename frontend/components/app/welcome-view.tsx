import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Mic } from 'lucide-react';
import { FeaturesBento } from './features-bento';

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {

  return (
    <div ref={ref} className="w-full h-full overflow-y-auto overflow-x-hidden bg-black text-white flex flex-col" style={{ fontFamily: "'Outfit', sans-serif" }}>
      
      {/* Hero Section */}
      <div className="relative min-h-[100svh] w-full flex flex-col overflow-hidden shrink-0">
      {/* Import Modern Font */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
      `}} />

      {/* Video Background */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/hero2.mp4" type="video/mp4" />
      </video>
      
      {/* Subtle Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 z-0 pointer-events-none" />

      {/* Pill Navbar */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] w-max max-w-[90vw] pointer-events-auto"
      >
        <div className="flex items-center gap-1 bg-[#0F0F0F] rounded-full p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-xl">
           
           <button 
             onClick={() => onStartCall()}
             className="px-5 py-2.5 bg-[#FFCC00] text-black hover:bg-[#F0C000] rounded-full text-sm font-bold transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,204,0,0.3)] hover:scale-105 cursor-pointer"
           >
             <Mic className="size-4" />
             {startButtonText}
           </button>

           <button className="px-5 py-2.5 text-gray-400 hover:text-white rounded-full text-sm font-medium transition-colors hidden sm:block">
             Features
           </button>
           <button className="px-5 py-2.5 text-gray-400 hover:text-white rounded-full text-sm font-medium transition-colors hidden sm:block">
             Technology
           </button>
           <button className="px-5 py-2.5 text-gray-400 hover:text-white rounded-full text-sm font-medium transition-colors hidden sm:block">
             About
           </button>
        </div>
      </motion.div>

      {/* Content aligned to bottom */}
      <div className="relative z-10 flex-1 flex flex-col justify-end w-full pb-0 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="px-6 md:px-12 max-w-[1800px] mx-auto w-full mb-2 md:mb-4 pointer-events-auto"
        >
          <h2 className="text-[28px] sm:text-[36px] md:text-[44px] lg:text-[52px] font-semibold tracking-tight text-white/90 leading-[1.1]">
            Your Intelligent Voice Financial Companion.
          </h2>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="w-full flex justify-center items-end"
        >
          <h1 
            className="w-full text-center font-bold text-white select-none whitespace-nowrap"
            style={{ 
              fontSize: "19.5vw", 
              lineHeight: "0.85",
              letterSpacing: "-0.06em",
              marginBottom: "-1.5vw"
            }}
          >
            Finvoice ai
          </h1>
        </motion.div>
      </div>

      </div>

      {/* Bento Grid Features */}
      <FeaturesBento />

    </div>
  );
};
