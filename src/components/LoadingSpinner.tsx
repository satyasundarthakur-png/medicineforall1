import React from 'react';

interface LoadingSpinnerProps { message: string; }

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-6 animate-fade-in-up">
    {/* 3-ring spinner */}
    <div className="relative w-24 h-24">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full"
        style={{ border: '4px solid transparent', borderTopColor: '#6366F1', borderRightColor: '#6366F140', animation: 'spinCW 1.2s linear infinite' }} />
      {/* Mid ring */}
      <div className="absolute inset-3 rounded-full"
        style={{ border: '4px solid transparent', borderTopColor: '#7C3AED', borderLeftColor: '#7C3AED40', animation: 'spinCCW 1.6s linear infinite' }} />
      {/* Inner ring */}
      <div className="absolute inset-6 rounded-full"
        style={{ border: '4px solid transparent', borderTopColor: '#EC4899', animation: 'spinCW 2s linear infinite' }} />
      {/* Center */}
      <div className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse-scale">⚕️</div>
    </div>

    {/* EKG pulse SVG */}
    <svg width="200" height="40" viewBox="0 0 200 40">
      <polyline
        points="0,20 30,20 40,5 50,35 60,20 80,20 90,8 100,32 110,20 130,20 140,5 150,35 160,20 200,20"
        fill="none" stroke="url(#ekgGrad)" strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray="400" style={{ animation: 'ekg 1.8s ease-in-out infinite' }} />
      <defs>
        <linearGradient id="ekgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
    </svg>

    <div className="text-center">
      <p className="text-lg font-bold gradient-text">{message}</p>
      <p className="text-sm text-gray-500 mt-1">Analysing clinical data with AI…</p>
    </div>

    {/* Dots */}
    <div className="flex gap-2">
      {['#6366F1','#7C3AED','#EC4899'].map((c, i) => (
        <div key={i} className="w-2.5 h-2.5 rounded-full"
          style={{ background: c, animation: `pulse-scale 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
    </div>
  </div>
);
