import React, { useState } from 'react';
import { MedInput, MedPrescription } from '../types';
import { exportToWord } from '../lib/wordExport';
import { exportToPDF } from '../lib/pdfExport';
import { getSpecialty } from '../lib/specialties';
import { FileText, Download, AlertCircle, CheckCircle } from 'lucide-react';

interface PrescriptionPanelProps { input: MedInput; rx: MedPrescription; onNewCase: () => void; }

const URGENCY = {
  Emergency: { color: '#DC2626', bg: 'linear-gradient(135deg,#FEF2F2,#FEE2E2)', border: '#FCA5A5', pulse: true },
  Urgent:    { color: '#EA580C', bg: 'linear-gradient(135deg,#FFF7ED,#FFEDD5)', border: '#FED7AA', pulse: false },
  Routine:   { color: '#059669', bg: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)', border: '#A7F3D0', pulse: false },
};

const SectionCard = ({ title, icon, color, children }: { title: string; icon: React.ReactNode; color: string; children: React.ReactNode }) => (
  <div className="animate-fade-in-up rounded-2xl overflow-hidden"
    style={{ border: `1.5px solid ${color}30`, background: 'rgba(255,255,255,0.9)', boxShadow: `0 4px 20px ${color}12` }}>
    <div className="px-6 py-4 flex items-center gap-3"
      style={{ background: `linear-gradient(135deg, ${color}12, ${color}06)`, borderBottom: `1.5px solid ${color}20` }}>
      <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
        style={{ background: `${color}20`, color }}>{icon}</span>
      <h3 className="font-bold text-gray-800">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

export const PrescriptionPanel: React.FC<PrescriptionPanelProps> = ({ input, rx, onNewCase }) => {
  const [exporting, setExporting] = useState<'word'|'pdf'|null>(null);
  const specialty = getSpecialty(input.specialty_id);
  const urg = URGENCY[rx.urgency] ?? URGENCY.Routine;

  const handleExportWord = async () => { setExporting('word'); try { await exportToWord(input, rx); } finally { setExporting(null); } };
  const handleExportPDF  = async () => { setExporting('pdf');  try { await exportToPDF(input, rx);  } finally { setExporting(null); } };

  return (
    <div className="space-y-5">
      {/* Top action bar */}
      <div className="card p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up"
        style={{ background: 'linear-gradient(135deg,rgba(30,64,175,0.06),rgba(124,58,237,0.04))' }}>
        <div>
          <h2 className="text-2xl font-extrabold gradient-text">Prescription Generated</h2>
          <p className="text-sm text-gray-500 mt-0.5">{specialty?.label || 'Internal Medicine'} • {new Date().toLocaleDateString('en-IN')}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleExportWord} disabled={!!exporting} className="btn-primary flex items-center gap-2">
            <FileText size={15} />{exporting === 'word' ? 'Exporting…' : 'DOCX'}
          </button>
          <button onClick={handleExportPDF} disabled={!!exporting} className="btn-secondary flex items-center gap-2">
            <Download size={15} />{exporting === 'pdf' ? 'Exporting…' : 'PDF'}
          </button>
          <button onClick={onNewCase} className="btn-ghost">New Case</button>
        </div>
      </div>

      {/* Patient info */}
      <div className="card p-5 animate-fade-in-up" style={{ animationDelay:'60ms' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label:'Name',   value: input.name || 'N/A',         color:'#6366F1' },
            { label:'Age',    value: input.age || 'N/A',           color:'#0891B2' },
            { label:'Gender', value: input.gender || 'N/A',        color:'#059669' },
            { label:'Allergies', value: input.allergies || 'NKDA', color:'#DC2626' },
          ].map(item => (
            <div key={item.label}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{item.label}</p>
              <p className="text-lg font-bold mt-0.5" style={{ color: item.color }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnosis */}
      <SectionCard title="Diagnosis & Assessment" icon="🩺" color="#1E40AF">
        <div className="space-y-3">
          <div className="p-4 rounded-xl" style={{ background:'linear-gradient(135deg,#EFF6FF,#DBEAFE)', border:'1.5px solid #BFDBFE' }}>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Primary Diagnosis</p>
            <p className="text-lg font-bold text-blue-800 mt-1">{rx.primary_diagnosis}</p>
          </div>
          {rx.secondary_diagnoses?.length > 0 && (
            <div className="p-4 rounded-xl bg-gray-50">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Secondary</p>
              {rx.secondary_diagnoses.map((d,i) => <p key={i} className="text-sm text-gray-700">• {d}</p>)}
            </div>
          )}
          <div className="flex gap-3 flex-wrap">
            <div className="px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm"
              style={{ background: urg.bg, border: `1.5px solid ${urg.border}`, color: urg.color,
                ...(urg.pulse ? { animation:'urgencyPulse 1.5s ease-in-out infinite' } : {}) }}>
              {rx.urgency === 'Emergency' && '🚨'}{rx.urgency === 'Urgent' && '⚠️'}{rx.urgency === 'Routine' && '✅'}
              &nbsp;{rx.urgency}
            </div>
            <div className="px-4 py-2 rounded-xl font-bold text-sm"
              style={{ background:'linear-gradient(135deg,#F0F9FF,#E0F2FE)', border:'1.5px solid #BAE6FD', color:'#0369A1' }}>
              AI Confidence: {rx.confidence}%
            </div>
          </div>
          <p className="text-sm text-gray-600 italic leading-relaxed">{rx.clinical_summary}</p>
        </div>
      </SectionCard>

      {/* Medications */}
      {rx.medications?.length > 0 && (
        <SectionCard title={`Medications (${rx.medications.length})`} icon="💊" color="#059669">
          <div className="space-y-4">
            {rx.medications.map((med, i) => {
              const colors = ['#6366F1','#0891B2','#059669','#EA580C','#7C3AED','#DC2626','#0D9488'];
              const c = colors[i % colors.length];
              return (
                <div key={i} className="rounded-xl overflow-hidden" style={{ border:`1.5px solid ${c}25`, boxShadow:`0 2px 12px ${c}12` }}>
                  <div className="px-4 py-3 flex items-center gap-2"
                    style={{ background:`linear-gradient(135deg,${c}18,${c}08)`, borderBottom:`1px solid ${c}20` }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: c }}>{i+1}</span>
                    <span className="font-bold" style={{ color: c }}>{med.name}</span>
                  </div>
                  <div className="p-4 bg-white grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {[['Dose',med.dose],['Route',med.route],['Frequency',med.frequency],['Duration',med.duration]].map(([lbl,val]) => (
                      <div key={lbl}><p className="text-xs text-gray-400 font-semibold">{lbl}</p><p className="font-bold text-gray-700">{val}</p></div>
                    ))}
                    <div className="col-span-2 md:col-span-4">
                      <p className="text-xs text-gray-400 font-semibold">Indication</p>
                      <p className="text-sm text-green-700">{med.indication}</p>
                    </div>
                    <div className="col-span-2 md:col-span-4">
                      <p className="text-xs text-gray-400 font-semibold">⚠ Cautions</p>
                      <p className="text-sm text-red-600">{med.caution}</p>
                    </div>
                    <div className="col-span-2 md:col-span-4">
                      <p className="text-xs text-gray-400 font-semibold">🔬 Monitoring</p>
                      <p className="text-sm text-blue-600">{med.monitoring}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Drug Interactions */}
      {rx.drug_interactions?.length > 0 && (
        <div className="animate-fade-in-up rounded-2xl p-5" style={{ background:'linear-gradient(135deg,#FEF2F2,#FFF1F2)', border:'1.5px solid #FECDD3' }}>
          <h3 className="font-bold text-red-700 flex items-center gap-2 mb-3"><AlertCircle size={16}/>Drug Interactions & Contraindications</h3>
          {rx.drug_interactions.map((d,i) => <p key={i} className="text-sm text-red-700 py-1">⚠ {d}</p>)}
        </div>
      )}

      {/* Non-pharm */}
      {rx.non_pharmacological?.length > 0 && (
        <SectionCard title="Non-Pharmacological Management" icon={<CheckCircle size={14}/>} color="#059669">
          <ul className="space-y-2">
            {rx.non_pharmacological.map((r,i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <CheckCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color:'#059669' }}/>{r}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {/* Investigations */}
      {rx.investigations?.length > 0 && (
        <SectionCard title="Investigations & Monitoring" icon="🔬" color="#0891B2">
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background:'linear-gradient(135deg,#1E40AF,#6366F1)', color:'#fff' }}>
                  {['Test','Reason','Timeline','Priority'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {rx.investigations.map((inv, i) => (
                  <tr key={i} style={{ background: i%2===0 ? 'rgba(239,246,255,0.6)' : '#fff' }}>
                    <td className="px-4 py-3 font-semibold text-blue-800">{inv.test}</td>
                    <td className="px-4 py-3 text-gray-600">{inv.reason}</td>
                    <td className="px-4 py-3 text-gray-600">{inv.when}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-bold"
                        style={{ background: inv.priority==='High' ? '#FEE2E2' : '#F0FDF4', color: inv.priority==='High' ? '#DC2626' : '#059669' }}>
                        {inv.priority || 'Routine'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* Follow-up */}
      <SectionCard title="Follow-up Plan" icon="📅" color="#7C3AED">
        <p className="text-sm font-semibold text-purple-700 mb-1">Review in {rx.follow_up_weeks} weeks</p>
        <p className="text-sm text-gray-700 leading-relaxed">{rx.follow_up_advice}</p>
      </SectionCard>

      {/* Patient Education */}
      {rx.patient_education?.length > 0 && (
        <SectionCard title="Patient Education" icon="📚" color="#0891B2">
          <ul className="space-y-2">
            {rx.patient_education.map((e,i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span style={{ color:'#0891B2', fontWeight:700, flexShrink:0 }}>→</span>{e}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {/* Warning signs */}
      {rx.warning_signs?.length > 0 && (
        <div className="animate-fade-in-up rounded-2xl p-5 animate-urgency"
          style={{ background:'linear-gradient(135deg,#FEF2F2,#FEE2E2)', border:'2px solid #FECACA' }}>
          <h3 className="font-bold text-red-700 flex items-center gap-2 mb-3">
            <AlertCircle size={16}/>🚨 Red Flags — Seek Immediate Attention
          </h3>
          {rx.warning_signs.map((s,i) => <p key={i} className="text-sm text-red-700 font-semibold py-1">⚠ {s}</p>)}
        </div>
      )}

      {/* Referral */}
      {rx.referral && (
        <div className="animate-fade-in-up rounded-2xl p-5"
          style={{ background:'linear-gradient(135deg,#EFF6FF,#DBEAFE)', border:'1.5px solid #BFDBFE' }}>
          <h3 className="font-bold text-blue-700 mb-2">🏥 Specialist Referral Recommended</h3>
          <p className="text-sm text-blue-800">{rx.referral}</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="animate-fade-in-up rounded-2xl p-5"
        style={{ background:'linear-gradient(135deg,#FFFBEB,#FEF3C7)', border:'1.5px solid #FDE68A' }}>
        <h3 className="font-bold text-amber-800 mb-1">Disclaimer</h3>
        <p className="text-xs text-amber-800 italic">{rx.disclaimer}</p>
      </div>
    </div>
  );
};
