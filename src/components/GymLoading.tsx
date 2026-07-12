import React from 'react';

export default function GymLoading({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
  };
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Barbell weights base bar */}
        <div className="absolute inset-x-0 h-1 bg-zinc-700 rounded-full"></div>
        
        {/* Left weight plates */}
        <div className="absolute left-0 w-3 h-10 bg-zinc-800 rounded border border-zinc-700"></div>
        <div className="absolute left-3 w-3.5 h-12 bg-zinc-900 rounded border border-zinc-800"></div>
        <div className="absolute left-7 w-1.5 h-6 bg-zinc-700 rounded"></div>
        
        {/* Right weight plates */}
        <div className="absolute right-0 w-3 h-10 bg-zinc-800 rounded border border-zinc-700"></div>
        <div className="absolute right-3 w-3.5 h-12 bg-zinc-900 rounded border border-zinc-800"></div>
        <div className="absolute right-7 w-1.5 h-6 bg-zinc-700 rounded"></div>
        
        {/* The lift-bar moving up and down */}
        <div className="absolute inset-x-9 h-1.5 bg-gradient-to-r from-[#ff6b00] to-[#ff2a2a] rounded shadow-lg shadow-orange-500/25 animate-benchpress"></div>
      </div>
      <p className="text-[10px] uppercase font-black tracking-widest text-[#ff6b00] animate-pulse">
        💪 Loading Gains...
      </p>
    </div>
  );
}
