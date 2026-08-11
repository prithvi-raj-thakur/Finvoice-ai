'use client';

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/shadcn/utils';

export type ViewMode = 'voice' | 'messages' | 'outbound';

interface ModeSwitcherProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  className?: string;
}

export function ModeSwitcher({ mode, onModeChange, className }: ModeSwitcherProps) {
  return (
    <div className={cn('flex gap-1 p-1 rounded-full bg-[#111116]/80 border border-white/[0.06] backdrop-blur-sm', className)}>
      <button
        onClick={() => onModeChange('voice')}
        aria-label="Switch to voice mode"
        className={cn(
          'relative flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-medium rounded-full transition-colors duration-200 cursor-pointer',
          mode === 'voice' ? 'text-white' : 'text-[#8A8A94] hover:text-white/70'
        )}
      >
        {mode === 'voice' && (
          <motion.div
            layoutId="mode-pill"
            className="absolute inset-0 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/40"
            transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
          />
        )}
        <svg className="relative z-10 w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
        <span className="relative z-10">Voice</span>
      </button>

      <button
        onClick={() => onModeChange('messages')}
        aria-label="Switch to messages mode"
        className={cn(
          'relative flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-medium rounded-full transition-colors duration-200 cursor-pointer',
          mode === 'messages' ? 'text-white' : 'text-[#8A8A94] hover:text-white/70'
        )}
      >
        {mode === 'messages' && (
          <motion.div
            layoutId="mode-pill"
            className="absolute inset-0 rounded-full bg-[#6366F1]/20 border border-[#6366F1]/40"
            transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
          />
        )}
        <svg className="relative z-10 w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
        <span className="relative z-10">Messages</span>
      </button>

      <button
        onClick={() => onModeChange('outbound')}
        aria-label="Switch to outbound mode"
        className={cn(
          'relative flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-medium rounded-full transition-colors duration-200 cursor-pointer',
          mode === 'outbound' ? 'text-white' : 'text-[#8A8A94] hover:text-white/70'
        )}
      >
        {mode === 'outbound' && (
          <motion.div
            layoutId="mode-pill"
            className="absolute inset-0 rounded-full bg-[#10B981]/20 border border-[#10B981]/40"
            transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
          />
        )}
        <svg className="relative z-10 w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
        <span className="relative z-10">Outbound</span>
      </button>
    </div>
  );
}
