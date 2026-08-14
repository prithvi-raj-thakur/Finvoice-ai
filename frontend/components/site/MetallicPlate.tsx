'use client';

import React from 'react';

export const MetallicPlate = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-[24px] border border-white/10 shadow-[0_40px_120px_-10px_rgba(0,0,0,0.9)] bg-[#0A101C]/80 backdrop-blur-2xl ${className}`}
      style={{
        backgroundImage: `
          linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 25%, rgba(255,255,255,0) 75%, rgba(255,255,255,0.05) 100%),
          linear-gradient(to bottom, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.2) 100%)
        `,
        boxShadow: `
          inset 0 1px 1px rgba(255,255,255,0.15),
          0 20px 40px rgba(0,0,0,0.5)
        `
      }}
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.06)_0%,transparent_60%)] pointer-events-none" />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
};

export default MetallicPlate;
