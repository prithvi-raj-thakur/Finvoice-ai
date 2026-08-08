'use client';

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/shadcn/utils';

export type VisualizerType = 'aura' | 'bar' | 'grid' | 'radial' | 'wave';

const VISUALIZER_OPTIONS: { id: VisualizerType; label: string }[] = [
  { id: 'aura', label: 'Aura' },
  { id: 'wave', label: 'Wave' },
  { id: 'bar', label: 'Bar' },
  { id: 'grid', label: 'Grid' },
  { id: 'radial', label: 'Radial' },
];

interface VisualizerSwitcherProps {
  selected: VisualizerType;
  onSelect: (type: VisualizerType) => void;
  className?: string;
}

export function VisualizerSwitcher({
  selected,
  onSelect,
  className,
}: VisualizerSwitcherProps) {
  return (
    <div className={cn('flex gap-1 p-1 rounded-full bg-[#111116]/80 border border-white/[0.06] backdrop-blur-sm', className)}>
      {VISUALIZER_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onSelect(opt.id)}
          aria-label={`Select ${opt.label} visualizer`}
          className={cn(
            'relative px-3 py-1.5 text-[11px] font-medium rounded-full transition-colors duration-200 cursor-pointer',
            selected === opt.id
              ? 'text-white'
              : 'text-[#8A8A94] hover:text-white/70'
          )}
        >
          {selected === opt.id && (
            <motion.div
              layoutId="visualizer-pill"
              className="absolute inset-0 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/40"
              transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
            />
          )}
          <span className="relative z-10">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
