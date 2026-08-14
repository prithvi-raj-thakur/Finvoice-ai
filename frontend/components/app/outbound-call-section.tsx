'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/shadcn/utils';

export const OutboundCallSection = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [reason, setReason] = useState('Scheme Follow-up');
  const [status, setStatus] = useState<'ready' | 'calling' | 'ringing' | 'connected' | 'completed' | 'failed' | 'no_answer' | 'busy' | 'opted_out'>('ready');
  const [isHovered, setIsHovered] = useState(false);

  const handleCall = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert("Please enter a valid phone number (e.g. +919876543210)");
      return;
    }

    setStatus('calling');
    try {
      const res = await fetch('http://localhost:8000/api/outbound-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          user_id: "rahul-001",
          reason: "a government scheme you previously checked may have an upcoming application deadline",
        }),
      });

      if (!res.ok) {
        throw new Error('Call failed to initiate');
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed');
      }

      const callId = data.call_id;
      pollStatus(callId);
    } catch (e) {
      console.error(e);
      setStatus('failed');
      setTimeout(() => setStatus('ready'), 3000);
    }
  };

  const pollStatus = async (callId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:8000/api/outbound-calls');
        const data = await res.json();
        const call = data.calls.find((c: any) => c.id === callId);
        if (call) {
          setStatus(call.status);
          if (['completed', 'failed', 'no_answer', 'busy', 'opted_out'].includes(call.status)) {
            clearInterval(interval);
            setTimeout(() => setStatus('ready'), 4000);
          }
        }
      } catch (e) {
        console.error("Error polling status", e);
      }
    }, 2000);
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-24 pb-12 relative z-30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="bg-[#111115]/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        
        <div className="text-center mb-8">
          <h2 className="text-[20px] font-semibold text-white tracking-tight mb-2">Outbound Calls</h2>
          <p className="text-[13px] text-white/50">Proactive financial assistance</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-white/60 uppercase tracking-wider pl-1">Recipient</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center justify-center pointer-events-none">
                <svg className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <input 
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                disabled={status !== 'ready' && status !== 'failed'}
                suppressHydrationWarning
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[15px] text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-white/60 uppercase tracking-wider pl-1">Reminder</label>
            <div className="relative">
              <select 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={status !== 'ready' && status !== 'failed'}
                suppressHydrationWarning
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-[15px] text-white appearance-none focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all cursor-pointer"
              >
                <option value="Scheme Follow-up" className="bg-[#111115]">Scheme Follow-up</option>
                <option value="Application Deadline" className="bg-[#111115]">Application Deadline</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center justify-center pointer-events-none">
                <svg className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          <button
            onClick={handleCall}
            disabled={status !== 'ready' && status !== 'failed'}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            suppressHydrationWarning
            className={cn(
              "w-full py-4 rounded-2xl font-semibold text-[15px] flex items-center justify-center gap-2 transition-all duration-300 mt-2",
              status === 'ready' || status === 'failed'
                ? "bg-white text-black hover:bg-gray-100"
                : "bg-white/10 text-white/50 cursor-not-allowed"
            )}
            style={{
              boxShadow: (status === 'ready' || status === 'failed') && isHovered ? '0 0 20px rgba(255,255,255,0.2)' : 'none'
            }}
          >
            {status === 'ready' || status === 'failed' ? (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Call Now
              </>
            ) : status === 'calling' ? (
              'Calling...'
            ) : status === 'ringing' ? (
              'Ringing...'
            ) : status === 'connected' ? (
              'Connected'
            ) : status === 'completed' || status === 'opted_out' ? (
              'Call Completed'
            ) : (
              status
            )}
          </button>
          
          {/* Status Animation */}
          {status !== 'ready' && status !== 'failed' && (
            <div className="mt-4 flex items-center justify-center gap-2">
               <motion.div 
                 animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                 transition={{ repeat: Infinity, duration: 1.5 }}
                 className={cn("size-2 rounded-full", status === 'connected' ? "bg-green-500" : "bg-purple-500")}
               />
               <span className="text-[12px] text-white/70 capitalize">{status.replace('_', ' ')}</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
