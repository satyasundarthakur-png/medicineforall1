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
      <label className="label mb-3">Select Specialty / Sub-specialty</label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {specialties.map((spec, i) => {
          const selected = selectedId === spec.id;
          return (
            <button
              key={spec.id}
              onClick={() => onSelect(spec.id)}
              className="animate-fade-in-up"
              style={{
                animationDelay: `${i * 40}ms`,
                padding: '1rem',
                borderRadius: '1rem',
                border: `2px solid ${selected ? spec.color : '#E5E0D5'}`,
                background: selected
                  ? `linear-gradient(135deg, ${spec.color}18, ${spec.color}08)`
                  : 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                boxShadow: selected
                  ? `0 4px 20px ${spec.color}35, 0 0 0 1px ${spec.color}30`
                  : '0 2px 8px rgba(0,0,0,0.05)',
                transform: selected ? 'translateY(-2px)' : undefined,
              }}
              onMouseEnter={e => {
                if (!selected) {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 20px ${spec.color}28`;
                  (e.currentTarget as HTMLElement).style.borderColor = spec.color + '80';
                }
              }}
              onMouseLeave={e => {
                if (!selected) {
                  (e.currentTarget as HTMLElement).style.transform = '';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                  (e.currentTarget as HTMLElement).style.borderColor = '#E5E0D5';
                }
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${spec.color}22, ${spec.color}12)`, fontSize: '1.4rem' }}>
                  {spec.icon}
                </span>
                <div>
                  <p className="font-bold text-sm" style={{ color: selected ? spec.color : '#3D2B1F' }}>
                    {spec.label}
                  </p>
                  {selected && (
                    <p className="text-xs mt-0.5 font-medium" style={{ color: spec.color + 'cc' }}>
                      ✓ Selected
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
