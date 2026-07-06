import React from 'react';
import { SavedCase } from '../types';
import { getSpecialty } from '../lib/specialties';
import { Trash2, Eye, X, ClockIcon } from 'lucide-react';

interface HistoryPanelProps {
  cases: SavedCase[];
  onLoadCase: (c: SavedCase) => void;
  onDeleteCase: (id: string) => void;
  onClose: () => void;
}

const URGENCY_COLORS: Record<string, string> = {
  Emergency: '#DC2626', Urgent: '#EA580C', Routine: '#059669',
};

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ cases, onLoadCase, onDeleteCase, onClose }) => (
  <div className="animate-fade-in-up">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-extrabold gradient-text">Case History</h2>
        <p className="text-sm text-gray-500 mt-0.5">{cases.length} saved case{cases.length !== 1 ? 's' : ''}</p>
      </div>
      <button onClick={onClose} className="btn-ghost flex items-center gap-2">
        <X size={16} /> Close
      </button>
    </div>

    {cases.length === 0 ? (
      <div className="card p-16 text-center"
        style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.05),rgba(124,58,237,0.03))' }}>
        <div className="text-6xl mb-4 animate-float">📂</div>
        <p className="text-xl font-bold text-gray-500">No cases yet</p>
        <p className="text-sm text-gray-400 mt-1">Generate your first prescription to see it here</p>
      </div>
    ) : (
      <div className="space-y-4">
        {cases.map((c, i) => {
          const spec = getSpecialty(c.input.specialty_id);
          const color = spec?.color || '#6366F1';
          const urgColor = URGENCY_COLORS[c.rx.urgency] || '#059669';
          return (
            <div
              key={c.id}
              className="animate-fade-in-up rounded-2xl overflow-hidden"
              style={{
                animationDelay: `${i * 50}ms`,
                border: `1.5px solid ${color}25`,
                background: 'rgba(255,255,255,0.92)',
                boxShadow: `0 4px 16px ${color}10`,
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 10px 30px ${color}25`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = '';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${color}10`;
              }}
            >
              {/* Colored top strip */}
              <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }} />

              <div className="p-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Specialty icon */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `linear-gradient(135deg,${color}20,${color}10)`, border: `1.5px solid ${color}30` }}>
                    {spec?.icon || '🏥'}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Patient + Diagnosis */}
                    <p className="font-bold text-gray-800 truncate">
                      {c.input.name || 'Anonymous'} · {c.input.age ? `${c.input.age}y` : ''} {c.input.gender || ''}
                    </p>
                    <p className="text-sm font-semibold mt-0.5 truncate" style={{ color }}>
                      {c.rx.primary_diagnosis}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 truncate">{c.input.chief_complaint}</p>

                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                        {c.specialty_label}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: `${urgColor}15`, color: urgColor, border: `1px solid ${urgColor}30` }}>
                        {c.rx.urgency}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <ClockIcon size={10} />
                        {new Date(c.timestamp).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => onLoadCase(c)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-all"
                    style={{ background: `linear-gradient(135deg,${color}20,${color}10)`, color, border: `1.5px solid ${color}30` }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `linear-gradient(135deg,${color}35,${color}20)`}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = `linear-gradient(135deg,${color}20,${color}10)`}
                  >
                    <Eye size={14} /> View
                  </button>
                  <button
                    onClick={() => onDeleteCase(c.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm transition-all"
                    style={{ background: '#FEF2F2', color: '#DC2626', border: '1.5px solid #FECACA' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEE2E2'; (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLElement).style.transform = ''; }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);
