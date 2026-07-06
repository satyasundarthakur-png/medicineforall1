import React from 'react';
import { getAllSpecialties } from '../lib/specialties';

interface SpecialtySelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export const SpecialtySelector: React.FC<SpecialtySelectorProps> = ({ selectedId, onSelect }) => {
  const specialties = getAllSpecialties();

  return (
    <div>
      <label className="label">Select Specialty / Sub-specialty</label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {specialties.map((spec) => (
          <button
            key={spec.id}
            onClick={() => onSelect(spec.id)}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              selectedId === spec.id
                ? 'border-[#1E40AF] bg-blue-50'
                : 'border-[#D4CBB8] bg-white hover:border-[#1E40AF]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{spec.icon}</span>
              <span className="font-bold text-[#3D2B1F]">{spec.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
