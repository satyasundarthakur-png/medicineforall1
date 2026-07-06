import React, { useState } from 'react';
import { MedInput, MedPrescription } from '../types';
import { exportToWord } from '../lib/wordExport';
import { exportToPDF } from '../lib/pdfExport';
import { getSpecialty } from '../lib/specialties';
import { FileText, Download, AlertCircle, CheckCircle } from 'lucide-react';

interface PrescriptionPanelProps {
  input: MedInput;
  rx: MedPrescription;
  onNewCase: () => void;
}

export const PrescriptionPanel: React.FC<PrescriptionPanelProps> = ({
  input,
  rx,
  onNewCase,
}) => {
  const [exporting, setExporting] = useState<'word' | 'pdf' | null>(null);
  const specialty = getSpecialty(input.specialty_id);

  const handleExportWord = async () => {
    setExporting('word');
    try {
      await exportToWord(input, rx);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = async () => {
    setExporting('pdf');
    try {
      await exportToPDF(input, rx);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Export Buttons */}
      <div className="card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#3D2B1F] mb-1">Prescription Generated</h2>
          <p className="text-[#6B5B3F]">{specialty?.label || 'Internal Medicine'} • {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExportWord}
            disabled={exporting === 'word'}
            className="btn-primary flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            {exporting === 'word' ? 'Exporting...' : 'Download DOCX'}
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exporting === 'pdf'}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {exporting === 'pdf' ? 'Exporting...' : 'Download PDF'}
          </button>
          <button
            onClick={onNewCase}
            className="btn-ghost"
          >
            New Case
          </button>
        </div>
      </div>

      {/* Patient Info */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-[#3D2B1F] mb-4">Patient Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-[#6B5B3F] font-semibold">Name</p>
            <p className="text-lg font-bold text-[#1E40AF]">{input.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-[#6B5B3F] font-semibold">Age</p>
            <p className="text-lg font-bold text-[#1E40AF]">{input.age || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-[#6B5B3F] font-semibold">Gender</p>
            <p className="text-lg font-bold text-[#1E40AF]">{input.gender || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-[#6B5B3F] font-semibold">Allergies</p>
            <p className="text-lg font-bold text-red-700">{input.allergies || 'NKDA'}</p>
          </div>
        </div>
      </div>

      {/* Diagnosis */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-[#3D2B1F] mb-4">Diagnosis</h3>
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-[#1E40AF]">
            <p className="text-xs text-[#6B5B3F] font-semibold">PRIMARY DIAGNOSIS</p>
            <p className="text-lg font-bold text-[#1E40AF] mt-1">{rx.primary_diagnosis}</p>
          </div>

          {rx.secondary_diagnoses?.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-[#6B5B3F] font-semibold mb-2">SECONDARY DIAGNOSES</p>
              <ul className="space-y-1">
                {rx.secondary_diagnoses.map((diag, idx) => (
                  <li key={idx} className="text-sm text-[#3D2B1F]">• {diag}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-[#6B5B3F] font-semibold">URGENCY LEVEL</p>
              <p className={`text-lg font-bold mt-1 ${
                rx.urgency === 'Emergency' ? 'text-red-700' :
                rx.urgency === 'Urgent' ? 'text-orange-600' :
                'text-green-700'
              }`}>
                {rx.urgency}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#6B5B3F] font-semibold">AI CONFIDENCE</p>
              <p className="text-lg font-bold text-[#1E40AF] mt-1">{rx.confidence}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Summary */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-[#3D2B1F] mb-4">Clinical Summary</h3>
        <p className="text-[#3D2B1F] leading-relaxed italic">{rx.clinical_summary}</p>
      </div>

      {/* Medications */}
      {rx.medications?.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-[#3D2B1F] mb-4">Medications & Prescriptions</h3>
          <div className="space-y-4">
            {rx.medications.map((med, idx) => (
              <div key={idx} className="p-4 border-l-4 border-[#1E40AF] bg-blue-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-[#1E40AF]">{idx + 1}. {med.name}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-[#6B5B3F]">Dose</p>
                        <p className="font-bold text-[#3D2B1F]">{med.dose}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#6B5B3F]">Route</p>
                        <p className="font-bold text-[#3D2B1F]">{med.route}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#6B5B3F]">Frequency</p>
                        <p className="font-bold text-[#3D2B1F]">{med.frequency}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#6B5B3F]">Duration</p>
                        <p className="font-bold text-[#3D2B1F]">{med.duration}</p>
                      </div>
                    </div>
                    <p className="text-sm mt-2 text-[#6B5B3F]"><strong>Indication:</strong> {med.indication}</p>
                    <p className="text-sm mt-1 text-red-700"><strong>⚠ Cautions:</strong> {med.caution}</p>
                    <p className="text-sm mt-1 text-blue-700"><strong>🔬 Monitoring:</strong> {med.monitoring}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drug Interactions */}
      {rx.drug_interactions?.length > 0 && (
        <div className="card p-6 border-l-4 border-red-500 bg-red-50">
          <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Drug Interactions & Contraindications
          </h3>
          <ul className="space-y-2">
            {rx.drug_interactions.map((interaction, idx) => (
              <li key={idx} className="text-sm text-red-700">⚠ {interaction}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Non-Pharmacological */}
      {rx.non_pharmacological?.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-[#3D2B1F] mb-4">Non-Pharmacological Management</h3>
          <ul className="space-y-2">
            {rx.non_pharmacological.map((rec, idx) => (
              <li key={idx} className="text-sm text-[#3D2B1F] flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Investigations */}
      {rx.investigations?.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-[#3D2B1F] mb-4">Investigations & Monitoring</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1E40AF] text-white">
                  <th className="p-3 text-left">Test</th>
                  <th className="p-3 text-left">Reason</th>
                  <th className="p-3 text-left">Timeline</th>
                  <th className="p-3 text-left">Priority</th>
                </tr>
              </thead>
              <tbody>
                {rx.investigations.map((inv, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-3 font-semibold text-[#3D2B1F]">{inv.test}</td>
                    <td className="p-3 text-[#6B5B3F]">{inv.reason}</td>
                    <td className="p-3 text-[#6B5B3F]">{inv.when}</td>
                    <td className="p-3 font-bold text-[#1E40AF]">{inv.priority || 'Routine'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Follow-up */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-[#3D2B1F] mb-4">Follow-up Plan</h3>
        <p className="text-sm font-semibold text-[#6B5B3F] mb-2">Recommended Follow-up: {rx.follow_up_weeks} weeks</p>
        <p className="text-[#3D2B1F] leading-relaxed">{rx.follow_up_advice}</p>
      </div>

      {/* Patient Education */}
      {rx.patient_education?.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-[#3D2B1F] mb-4">Patient Education</h3>
          <ul className="space-y-2">
            {rx.patient_education.map((edu, idx) => (
              <li key={idx} className="text-sm text-[#3D2B1F] flex items-start gap-2">
                <span className="text-[#1E40AF] font-bold mt-0.5">→</span>
                {edu}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warning Signs */}
      {rx.warning_signs?.length > 0 && (
        <div className="card p-6 border-l-4 border-red-500 bg-red-50">
          <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Red Flags - Seek Immediate Medical Attention
          </h3>
          <ul className="space-y-2">
            {rx.warning_signs.map((sign, idx) => (
              <li key={idx} className="text-sm text-red-700 font-semibold">⚠ {sign}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Referral */}
      {rx.referral && (
        <div className="card p-6 bg-blue-50 border-l-4 border-[#1E40AF]">
          <h3 className="text-lg font-bold text-[#1E40AF] mb-2">Specialist Referral Recommended</h3>
          <p className="text-[#3D2B1F]">{rx.referral}</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="card p-6 bg-amber-50 border-l-4 border-amber-600">
        <h3 className="text-lg font-bold text-amber-900 mb-2">Disclaimer</h3>
        <p className="text-sm text-amber-900 italic">{rx.disclaimer}</p>
      </div>
    </div>
  );
};
