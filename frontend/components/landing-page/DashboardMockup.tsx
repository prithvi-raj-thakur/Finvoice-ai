import React, { RefObject } from 'react';
import MetallicPlate from '@/components/site/MetallicPlate';

export const DashboardMockup = React.forwardRef<HTMLDivElement, {}>((props, ref) => {
  return (
    <div ref={ref} className="relative z-10 mt-24 w-full max-w-[1200px] perspective-1000">
      <MetallicPlate className="aspect-[16/9] flex flex-col p-8">
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
      </MetallicPlate>
    </div>
  );
});

DashboardMockup.displayName = 'DashboardMockup';
