import React from 'react';
import { Stethoscope } from 'lucide-react';

interface AppLogoProps { size?: number; }

export const AppLogo: React.FC<AppLogoProps> = ({ size = 48 }) => (
  <div className="relative" style={{ width: size, height: size }}>
    {/* Pulse rings */}
    <span className="absolute inset-0 rounded-xl opacity-60"
      style={{ background: 'linear-gradient(135deg,#6366F1,#7C3AED)', animation: 'pulseRing 2s ease-out infinite' }} />
    <span className="absolute inset-0 rounded-xl opacity-40"
      style={{ background: 'linear-gradient(135deg,#6366F1,#7C3AED)', animation: 'pulseRing 2s ease-out 0.5s infinite' }} />
    {/* Logo body */}
    <div className="relative flex items-center justify-center rounded-xl w-full h-full"
      style={{ background: 'linear-gradient(135deg,#1E40AF,#6366F1,#7C3AED)', animation: 'pulseGlow 3s ease-in-out infinite' }}>
      <Stethoscope size={size * 0.58} className="text-white" strokeWidth={1.5} />
    </div>
  </div>
);
