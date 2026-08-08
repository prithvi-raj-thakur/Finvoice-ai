'use client';

import React from 'react';
import { cn } from '@/lib/shadcn/utils';

interface IPhoneProps {
  children?: React.ReactNode;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * A realistic iPhone 15 Pro frame component.
 * Renders an SVG phone frame with a slot for content inside the screen area.
 */
export function IPhone({
  children,
  className,
  width = 320,
  height = 652,
}: IPhoneProps) {
  // Aspect ratio of the iPhone 15 Pro: roughly 432 x 882
  const VIEWBOX_W = 432;
  const VIEWBOX_H = 882;
  const SCREEN_X = 21.25;
  const SCREEN_Y = 19.25;
  const SCREEN_W = VIEWBOX_W - SCREEN_X * 2;
  const SCREEN_H = VIEWBOX_H - SCREEN_Y * 2;

  return (
    <div
      className={cn('relative inline-block', className)}
      style={{ width, height }}
    >
      {/* Screen content area — below the frame */}
      <div
        className="absolute overflow-hidden z-0"
        style={{
          top: `${(SCREEN_Y / VIEWBOX_H) * 100}%`,
          left: `${(SCREEN_X / VIEWBOX_W) * 100}%`,
          width: `${(SCREEN_W / VIEWBOX_W) * 100}%`,
          height: `${(SCREEN_H / VIEWBOX_H) * 100}%`,
          borderRadius: `${(55 / VIEWBOX_W) * width}px`,
        }}
      >
        {children}
      </div>

      {/* SVG Phone Frame — on top, but pointer-events-none so content is interactive */}
      <svg
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      >
        <defs>
          {/* Mask: white = visible frame, black = screen hole */}
          <mask id="iphone-frame-mask">
            {/* Entire viewbox is white (show frame) */}
            <rect width={VIEWBOX_W} height={VIEWBOX_H} fill="white" />
            {/* Screen area is black (cut out) */}
            <rect
              x={SCREEN_X}
              y={SCREEN_Y}
              width={SCREEN_W}
              height={SCREEN_H}
              rx="55"
              ry="55"
              fill="black"
            />
          </mask>
        </defs>

        {/* Frame group with screen cutout mask */}
        <g mask="url(#iphone-frame-mask)">
          {/* Outer bezel */}
          <rect
            x="1"
            y="1"
            width="430"
            height="880"
            rx="72"
            ry="72"
            fill="#1A1A1A"
            stroke="#2A2A2A"
            strokeWidth="1"
          />

          {/* Inner body */}
          <rect
            x="6"
            y="4"
            width="420"
            height="874"
            rx="70"
            ry="70"
            fill="#111111"
          />
        </g>

        {/* Side buttons (outside the mask so they always show) */}
        {/* Left - Silent switch */}
        <rect x="0" y="148" width="3" height="28" rx="1.5" fill="#2A2A2A" />
        {/* Left - Volume Up */}
        <rect x="0" y="205" width="3" height="56" rx="1.5" fill="#2A2A2A" />
        {/* Left - Volume Down */}
        <rect x="0" y="279" width="3" height="56" rx="1.5" fill="#2A2A2A" />
        {/* Right - Power */}
        <rect x="429" y="230" width="3" height="80" rx="1.5" fill="#2A2A2A" />

        {/* Dynamic Island — rendered on top of content via z-index */}
        <rect
          x="156"
          y="22"
          width="120"
          height="33"
          rx="16.5"
          fill="black"
        />

        {/* Subtle screen border ring */}
        <rect
          x={SCREEN_X}
          y={SCREEN_Y}
          width={SCREEN_W}
          height={SCREEN_H}
          rx="55"
          ry="55"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.5"
        />
      </svg>
    </div>
  );
}

