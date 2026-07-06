import React from 'react';
import { SavedCase } from '../types';
import { getSpecialty } from '../lib/specialties';
import { Trash2, ChevronRight } from 'lucide-react';

interface HistoryPanelProps {
  cases: SavedCase[];
  onLoadCase: (case_: SavedCase) => void;
  onDeleteCase: (id: string) => void;
  onClose: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  cases,
  onLoadCase,
  onDeleteCase,
  onClose,
}) => {
  if (cases.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-lg text-[#6B5B3F] mb-4">No prescriptions history yet</p>
        <button onClick={onClose} className="btn-primary">
          Create First Prescription
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-[#3D2B1F]">Case History</h2>
        <p className="text-sm text-[#6B5B3F]">{cases.length} prescriptions saved</p>
      </div>

      <div className="space-y-3">
        {cases.map((case_, idx) => {
          const date = new Date(case_.timestamp);
          const specialty = getSpecialty(case_.specialty_label.toLowerCase().replace(/\s+/g, '_'));

          return (
            <div
              key={case_.id}
              className="card p-6 hover:shadow-md transition-all cursor-pointer"
            >
              <div
                onClick={() => onLoadCase(case_)}
                className="flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{specialty?.icon || '⚕️'}</span>
                    <div>
                      <h3 className="font-bold text-[#3D2B1F]">{case_.input.name || 'Anonymous'}</h3>
                      <p className="text-xs text-[#6B5B3F]">{case_.specialty_label}</p>
                    </div>
                  </div>

                  <p className="text-sm text-[#3D2B1F] mb-2">
                    <strong>Chief Complaint:</strong> {case_.input.chief_complaint.substring(0, 80)}
                    {case_.input.chief_complaint.length > 80 ? '...' : ''}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-blue-50 text-[#1E40AF] px-2 py-1 rounded-full">
                      {case_.rx.primary_diagnosis.substring(0, 40)}
                      {case_.rx.primary_diagnosis.length > 40 ? '...' : ''}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                      case_.rx.urgency === 'Emergency' ? 'bg-red-100 text-red-700' :
                      case_.rx.urgency === 'Urgent' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {case_.rx.urgency}
                    </span>
                  </div>

                  <p className="text-xs text-[#6B5B3F] mt-2">
                    {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onLoadCase(case_)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1E40AF] text-white rounded-lg hover:bg-[#1E3A8A] font-bold text-sm transition-all"
                  >
                    View
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCase(case_.id);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-bold text-sm transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onClose}
        className="btn-ghost w-full mt-8"
      >
        Close History
      </button>
    </div>
  );
};
