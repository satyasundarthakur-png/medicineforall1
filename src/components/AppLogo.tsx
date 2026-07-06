import React from 'react';
import { Stethoscope } from 'lucide-react';

interface AppLogoProps {
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 48 }) => {
  return (
    <div className="flex items-center justify-center rounded-xl bg-[#1E40AF]" style={{ width: size, height: size }}>
      <Stethoscope size={size * 0.6} className="text-white" strokeWidth={1.5} />
    </div>
  );
};
