import React from 'react';

interface LoadingSpinnerProps {
  message: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-[#E5E0D5]"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1E40AF] animate-spin"></div>
      </div>
      <p className="text-lg font-semibold text-[#3D2B1F]">{message}</p>
      <p className="text-sm text-[#6B5B3F]">Please wait while AI processes the clinical data...</p>
    </div>
  );
};
