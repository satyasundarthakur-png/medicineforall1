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

export const CaseForm: React.FC<CaseFormProps> = ({
  input,
  onInputChange,
  onSubmit,
  loading,
  apiKeySet,
}) => {
  return (
    <div className="space-y-8">
      {/* Specialty Selection */}
      <div>
        <SpecialtySelector 
          selectedId={input.specialty_id} 
          onSelect={(id) => onInputChange('specialty_id', id)} 
        />
      </div>

      {/* Demographics */}
      <div>
        <h3 className="text-lg font-bold text-[#3D2B1F] mb-4">Patient Demographics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="input-group">
            <label className="label">Full Name</label>
            <input
              type="text"
              className="field"
              placeholder="Mr. John Doe"
              value={input.name}
              onChange={(e) => onInputChange('name', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="label">Age (years)</label>
            <input
              type="number"
              className="field"
              placeholder="45"
              value={input.age}
              onChange={(e) => onInputChange('age', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="label">Gender</label>
            <select
              className="field"
              value={input.gender}
              onChange={(e) => onInputChange('gender', e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="input-group">
            <label className="label">Occupation</label>
            <input
              type="text"
              className="field"
              placeholder="E.g., Software Engineer, Teacher"
              value={input.occupation}
              onChange={(e) => onInputChange('occupation', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Chief Complaint */}
      <div className="input-group">
        <label className="label">Chief Complaint *</label>
        <textarea
          className="field"
          placeholder="E.g., Chest pain, shortness of breath, palpitations..."
          rows={3}
          value={input.chief_complaint}
          onChange={(e) => onInputChange('chief_complaint', e.target.value)}
        />
      </div>

      {/* Duration */}
      <div className="input-group">
        <label className="label">Duration of Symptoms</label>
        <input
          type="text"
          className="field"
          placeholder="E.g., 3 days, 2 weeks, 6 months"
          value={input.duration}
          onChange={(e) => onInputChange('duration', e.target.value)}
        />
      </div>

      {/* Past Medical History */}
      <div className="input-group">
        <label className="label">Past Medical History</label>
        <textarea
          className="field"
          placeholder="E.g., Hypertension x 5 years, Diabetes Type 2 x 3 years, Previous MI..."
          rows={3}
          value={input.past_medical_history}
          onChange={(e) => onInputChange('past_medical_history', e.target.value)}
        />
      </div>

      {/* Comorbidities */}
      <div className="input-group">
        <label className="label">Comorbidities</label>
        <textarea
          className="field"
          placeholder="E.g., Hypertension, Diabetes, Chronic Kidney Disease, COPD..."
          rows={2}
          value={input.comorbidities}
          onChange={(e) => onInputChange('comorbidities', e.target.value)}
        />
      </div>

      {/* Clinical Findings */}
      <div className="input-group">
        <label className="label">Clinical Examination Findings</label>
        <textarea
          className="field"
          placeholder="E.g., BP 150/90, HR 88, RR 20, SpO2 98%, mild edema in lower extremities..."
          rows={4}
          value={input.clinical_findings}
          onChange={(e) => onInputChange('clinical_findings', e.target.value)}
        />
      </div>

      {/* Provisional Diagnosis */}
      <div className="input-group">
        <label className="label">Provisional Diagnosis / Suspected Diagnosis</label>
        <textarea
          className="field"
          placeholder="E.g., Acute Coronary Syndrome, Acute Decompensated Heart Failure, Community-acquired Pneumonia..."
          rows={3}
          value={input.provisional_diagnosis}
          onChange={(e) => onInputChange('provisional_diagnosis', e.target.value)}
        />
      </div>

      {/* Current Medications */}
      <div className="input-group">
        <label className="label">Current Medications</label>
        <textarea
          className="field"
          placeholder="E.g., Aspirin 75mg daily, Metformin 1000mg BD, Lisinopril 10mg daily..."
          rows={3}
          value={input.current_medications}
          onChange={(e) => onInputChange('current_medications', e.target.value)}
        />
      </div>

      {/* Allergies */}
      <div className="input-group">
        <label className="label">Drug Allergies</label>
        <input
          type="text"
          className="field"
          placeholder="E.g., Penicillin (anaphylaxis), Aspirin (GI upset)..."
          value={input.allergies}
          onChange={(e) => onInputChange('allergies', e.target.value)}
        />
      </div>

      {/* Additional Notes */}
      <div className="input-group">
        <label className="label">Additional Clinical Notes</label>
        <textarea
          className="field"
          placeholder="Any other relevant information (lab values, imaging findings, recent test results, etc.)"
          rows={3}
          value={input.notes}
          onChange={(e) => onInputChange('notes', e.target.value)}
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onSubmit}
          disabled={loading || !apiKeySet || !input.specialty_id || !input.chief_complaint.trim()}
          className="btn-primary flex items-center gap-2 flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          Generate Prescription
        </button>
      </div>

      {!apiKeySet && (
        <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
          ⚠ Please set your Groq API key in the header to generate prescriptions.
        </p>
      )}
    </div>
  );
};
