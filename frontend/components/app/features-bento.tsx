import { motion } from 'motion/react';
import { Mic, ShieldAlert, Globe, GraduationCap, Sparkles } from 'lucide-react';

export function FeaturesBento() {
  return (
    <div className="w-full bg-[#050505] py-24 px-6 md:px-12 flex flex-col items-center justify-center border-t border-white/5">
      <div className="max-w-[1200px] w-full grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(180px,auto)]">
        
        {/* Left tall card */}
        <div className="md:col-span-1 md:row-span-2 bg-[#121216] rounded-[32px] p-8 flex flex-col relative overflow-hidden group border border-white/5 transition-colors hover:border-white/10">
          <Sparkles className="text-[#8B5CF6] w-8 h-8 mb-6" />
          <h3 className="text-2xl font-semibold text-white mb-2 leading-tight">Finvoice AI Financial Mentor</h3>
          <p className="text-gray-400 text-sm mt-auto">Always ready to guide you towards better financial decisions.</p>
        </div>

        {/* Center large card */}
        <div className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-[#5B21B6] to-[#3B0764] rounded-[32px] p-10 flex flex-col items-center justify-center relative overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(91,33,182,0.3)]">
          <div className="absolute top-8 text-white/80 font-medium flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
            <Mic className="w-4 h-4" /> Finvoice AI
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center leading-tight mt-8 z-10">Your Personal Voice Assistant</h2>
          {/* Glowing Orb effect */}
          <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-orange-500 via-purple-500 to-blue-500 blur-3xl opacity-50 absolute bottom-[-50px]"></div>
          <div className="w-32 h-32 rounded-full bg-white blur-2xl opacity-20 absolute"></div>
        </div>

        {/* Right top small toggle/icon card */}
        <div className="md:col-span-1 md:row-span-1 bg-[#121216] rounded-[32px] flex items-center justify-center border border-white/5 p-6 transition-colors hover:border-white/10">
           <div className="w-20 h-10 rounded-full bg-white/10 flex items-center p-1.5 cursor-pointer shadow-inner relative">
              <div className="w-7 h-7 rounded-full bg-orange-400 flex items-center justify-center shadow-lg absolute right-1.5">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
           </div>
        </div>

        {/* Right middle card */}
        <div className="md:col-span-1 md:row-span-1 bg-[#121216] rounded-[32px] p-8 flex flex-col justify-center items-center border border-white/5 transition-colors hover:border-white/10">
          <h3 className="text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-2">100+</h3>
          <p className="text-gray-400 text-sm text-center">Financial Topics</p>
        </div>

        {/* Left middle card (users) */}
        <div className="md:col-span-1 md:row-span-1 bg-[#121216] rounded-[32px] p-8 flex flex-col justify-center items-center border border-white/5 transition-colors hover:border-white/10">
           <h3 className="text-4xl font-bold text-orange-400 mb-2">24/7</h3>
           <p className="text-gray-400 text-sm text-center">Availability</p>
        </div>

        {/* Left bottom button */}
        <div className="md:col-span-1 md:row-span-1 bg-[#121216] rounded-[32px] p-6 flex justify-center items-center border border-white/5 transition-colors hover:border-white/10">
           <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3.5 px-8 rounded-full shadow-[0_0_20px_rgba(147,51,234,0.3)] flex items-center gap-2 hover:scale-105 transition-transform w-full justify-center">
             <Sparkles className="w-4 h-4" /> Try Now
           </button>
        </div>

        {/* Bottom center-left card */}
        <div className="md:col-span-1 md:row-span-2 bg-[#121216] rounded-[32px] p-8 flex flex-col border border-white/5 transition-colors hover:border-white/10">
          <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mb-6">
            <Globe className="w-6 h-6 text-orange-400" />
          </div>
          <h4 className="text-white font-semibold text-lg mb-2 mt-auto">Multilingual Support</h4>
          <p className="text-gray-400 text-sm">Speak naturally in English, Hindi, or Hinglish without switching.</p>
        </div>

        {/* Bottom center-right card */}
        <div className="md:col-span-1 md:row-span-2 bg-[#121216] rounded-[32px] p-8 flex flex-col border border-white/5 transition-colors hover:border-white/10">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-6">
            <ShieldAlert className="w-6 h-6 text-purple-400" />
          </div>
          <h4 className="text-white font-semibold text-lg mb-2 mt-auto">Scam Protection</h4>
          <p className="text-gray-400 text-sm">Stay safe with our advanced fraud awareness and guidance.</p>
        </div>

        {/* Bottom right card */}
        <div className="md:col-span-1 md:row-span-2 bg-[#121216] rounded-[32px] p-8 flex flex-col border border-white/5 relative overflow-hidden transition-colors hover:border-white/10">
          <h4 className="text-white font-semibold text-lg mb-2">Financial Literacy</h4>
          <p className="text-gray-400 text-sm mb-6 relative z-10">Learn budgeting, investments, and personal finance easily.</p>
          
          <div className="flex-1 rounded-2xl bg-gradient-to-br from-[#1E1B4B] to-[#312E81] border border-white/10 flex flex-col justify-end p-4 relative mt-auto min-h-[140px] group-hover:scale-[1.02] transition-transform">
             <GraduationCap className="w-16 h-16 text-indigo-300 absolute right-4 bottom-4 opacity-30" />
             <div className="text-xs font-medium bg-black/40 text-white w-fit px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">Learn More</div>
          </div>
        </div>

      </div>
    </div>
  );
}
