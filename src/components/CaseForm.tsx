import React from 'react';
import { MedInput } from '../types';
import { SpecialtySelector } from './SpecialtySelector';
import { Send } from 'lucide-react';

interface CaseFormProps {
  input: MedInput;
  onInputChange: (field: keyof MedInput, value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  apiKeySet: boolean;
}

const SECTION_COLORS = ['#6366F1','#0891B2','#059669','#EA580C','#7C3AED','#DC2626'];

const SectionHeader = ({ icon, title, color }: { icon: string; title: string; color: string }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
      style={{ background: `linear-gradient(135deg, ${color}25, ${color}10)`, border: `1.5px solid ${color}40` }}>
      {icon}
    </div>
    <h3 className="text-base font-bold" style={{ color: '#1e293b' }}>{title}</h3>
    <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${color}40, transparent)` }} />
  </div>
);

export const CaseForm: React.FC<CaseFormProps> = ({ input, onInputChange, onSubmit, loading, apiKeySet }) => {
  const [hoverSubmit, setHoverSubmit] = React.useState(false);
  return (
    <div className="space-y-8">
      {/* Specialty */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
        <SpecialtySelector selectedId={input.specialty_id} onSelect={id => onInputChange('specialty_id', id)} />
      </div>

      {/* Demographics */}
      <div className="animate-fade-in-up p-6 rounded-2xl"
        style={{ animationDelay: '60ms', background: 'linear-gradient(135deg,rgba(99,102,241,0.05),rgba(99,102,241,0.02))', border: '1.5px solid rgba(99,102,241,0.15)' }}>
        <SectionHeader icon="👤" title="Patient Demographics" color={SECTION_COLORS[0]} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'name', label: 'Full Name', placeholder: 'Mr. John Doe', type: 'text' },
            { key: 'age', label: 'Age (years)', placeholder: '45', type: 'number' },
          ].map(f => (
            <div key={f.key} className="input-group">
              <label className="label">{f.label}</label>
              <input type={f.type} className="field" placeholder={f.placeholder}
                value={input[f.key as keyof MedInput] as string}
                onChange={e => onInputChange(f.key as keyof MedInput, e.target.value)} />
            </div>
          ))}
          <div className="input-group">
            <label className="label">Gender</label>
            <select className="field" value={input.gender} onChange={e => onInputChange('gender', e.target.value)}>
              <option value="">Select gender</option>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
          <div className="input-group">
            <label className="label">Occupation</label>
            <input type="text" className="field" placeholder="e.g., Teacher, Engineer"
              value={input.occupation} onChange={e => onInputChange('occupation', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Chief Complaint */}
      <div className="animate-fade-in-up p-6 rounded-2xl"
        style={{ animationDelay: '120ms', background: 'linear-gradient(135deg,rgba(8,145,178,0.05),rgba(8,145,178,0.02))', border: '1.5px solid rgba(8,145,178,0.2)' }}>
        <SectionHeader icon="🩺" title="Chief Complaint & Duration" color={SECTION_COLORS[1]} />
        <div className="space-y-4">
          <div className="input-group">
            <label className="label">Chief Complaint <span style={{ color: '#DC2626' }}>*</span></label>
            <textarea className="field" rows={3}
              placeholder="e.g., Chest pain and shortness of breath for 3 days..."
              value={input.chief_complaint} onChange={e => onInputChange('chief_complaint', e.target.value)} />
          </div>
          <div className="input-group">
            <label className="label">Duration of Symptoms</label>
            <input type="text" className="field" placeholder="e.g., 3 days, 2 weeks"
              value={input.duration} onChange={e => onInputChange('duration', e.target.value)} />
          </div>
        </div>
      </div>

      {/* History */}
      <div className="animate-fade-in-up p-6 rounded-2xl"
        style={{ animationDelay: '180ms', background: 'linear-gradient(135deg,rgba(5,150,105,0.05),rgba(5,150,105,0.02))', border: '1.5px solid rgba(5,150,105,0.2)' }}>
        <SectionHeader icon="📋" title="Medical History & Comorbidities" color={SECTION_COLORS[2]} />
        <div className="space-y-4">
          {[
            { key: 'past_medical_history', label: 'Past Medical History', rows: 3, placeholder: 'Hypertension × 5 yrs, Diabetes Type 2...' },
            { key: 'comorbidities', label: 'Comorbidities', rows: 2, placeholder: 'CKD stage 3, COPD...' },
          ].map(f => (
            <div key={f.key} className="input-group">
              <label className="label">{f.label}</label>
              <textarea className="field" rows={f.rows} placeholder={f.placeholder}
                value={input[f.key as keyof MedInput] as string}
                onChange={e => onInputChange(f.key as keyof MedInput, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Findings */}
      <div className="animate-fade-in-up p-6 rounded-2xl"
        style={{ animationDelay: '240ms', background: 'linear-gradient(135deg,rgba(234,88,12,0.05),rgba(234,88,12,0.02))', border: '1.5px solid rgba(234,88,12,0.2)' }}>
        <SectionHeader icon="🔍" title="Clinical Examination & Findings" color={SECTION_COLORS[3]} />
        <div className="space-y-4">
          <div className="input-group">
            <label className="label">Clinical Examination Findings</label>
            <textarea className="field" rows={4}
              placeholder="BP 150/90 mmHg, HR 88/min, RR 20, SpO₂ 98%, mild pedal edema..."
              value={input.clinical_findings} onChange={e => onInputChange('clinical_findings', e.target.value)} />
          </div>
          <div className="input-group">
            <label className="label">Provisional / Suspected Diagnosis</label>
            <textarea className="field" rows={2}
              placeholder="Acute decompensated heart failure, NYHA class III..."
              value={input.provisional_diagnosis} onChange={e => onInputChange('provisional_diagnosis', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Medications & Allergies */}
      <div className="animate-fade-in-up p-6 rounded-2xl"
        style={{ animationDelay: '300ms', background: 'linear-gradient(135deg,rgba(124,58,237,0.05),rgba(124,58,237,0.02))', border: '1.5px solid rgba(124,58,237,0.2)' }}>
        <SectionHeader icon="💊" title="Current Medications & Allergies" color={SECTION_COLORS[4]} />
        <div className="space-y-4">
          <div className="input-group">
            <label className="label">Current Medications</label>
            <textarea className="field" rows={3}
              placeholder="Aspirin 75 mg OD, Metformin 1000 mg BD, Lisinopril 10 mg OD..."
              value={input.current_medications} onChange={e => onInputChange('current_medications', e.target.value)} />
          </div>
          <div className="input-group">
            <label className="label">Drug Allergies</label>
            <input type="text" className="field" placeholder="Penicillin (anaphylaxis), Aspirin (GI upset)..."
              value={input.allergies} onChange={e => onInputChange('allergies', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="animate-fade-in-up p-6 rounded-2xl"
        style={{ animationDelay: '360ms', background: 'linear-gradient(135deg,rgba(220,38,38,0.04),rgba(220,38,38,0.01))', border: '1.5px solid rgba(220,38,38,0.15)' }}>
        <SectionHeader icon="📝" title="Additional Clinical Notes" color={SECTION_COLORS[5]} />
        <div className="input-group">
          <label className="label">Notes (labs, imaging, investigations done)</label>
          <textarea className="field" rows={3}
            placeholder="HbA1c 9.2%, eGFR 52 mL/min, Echo: EF 35%..."
            value={input.notes} onChange={e => onInputChange('notes', e.target.value)} />
        </div>
      </div>

      {/* Submit */}
      <div className="animate-fade-in-up pt-2" style={{ animationDelay: '420ms' }}>
        <button
          onClick={onSubmit}
          disabled={loading || !apiKeySet || !input.specialty_id || !input.chief_complaint.trim()}
          onMouseEnter={() => setHoverSubmit(true)}
          onMouseLeave={() => setHoverSubmit(false)}
          style={{
            width: '100%', padding: '1rem 2rem',
            background: loading || !apiKeySet || !input.specialty_id || !input.chief_complaint.trim()
              ? '#9CA3AF'
              : hoverSubmit
                ? 'linear-gradient(135deg,#4F46E5,#7C3AED,#EC4899)'
                : 'linear-gradient(135deg,#1E40AF,#6366F1,#7C3AED)',
            backgroundSize: '200% 200%',
            color: '#fff', fontWeight: '700', fontSize: '1.05rem',
            borderRadius: '1rem', border: 'none', cursor: loading || !apiKeySet ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            transition: 'all 0.3s ease',
            boxShadow: hoverSubmit ? '0 8px 30px rgba(99,102,241,0.5)' : '0 4px 15px rgba(30,64,175,0.3)',
            transform: hoverSubmit && !loading ? 'translateY(-2px)' : undefined,
          }}
        >
          <Send size={18} />
          Generate AI Prescription
        </button>

        {!apiKeySet && (
          <p className="text-sm text-center mt-3 px-4 py-2 rounded-xl"
            style={{ background: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', color: '#92400E', border: '1px solid #FCD34D' }}>
            ⚠ Set your Groq API key in the header to generate prescriptions
          </p>
        )}
      </div>
    </div>
  );
};
