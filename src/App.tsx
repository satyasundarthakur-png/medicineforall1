import React, { useState, useEffect } from 'react';
import { AppLogo } from './components/AppLogo';
import { CaseForm } from './components/CaseForm';
import { PrescriptionPanel } from './components/PrescriptionPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { LoadingSpinner } from './components/LoadingSpinner';
import { MedInput, MedPrescription, SavedCase } from './types';
import { callGroq } from './lib/groq';
import { getSpecialty } from './lib/specialties';
import { Key, History, X, Plus } from 'lucide-react';

const STORAGE_KEY = 'medscribe_im_cases';
const MAX_CASES = 50;

const initialInput: MedInput = {
  name:'', age:'', gender:'', occupation:'',
  chief_complaint:'', duration:'',
  past_medical_history:'', clinical_findings:'',
  provisional_diagnosis:'', current_medications:'',
  allergies:'', comorbidities:'', notes:'', specialty_id:'',
};

function App() {
  const [input, setInput] = useState<MedInput>(initialInput);
  const [rx, setRx] = useState<MedPrescription | null>(null);
  const [view, setView] = useState<'form'|'rx'|'history'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [cases, setCases] = useState<SavedCase[]>([]);

  useEffect(() => {
    const k = localStorage.getItem('groq_api_key') || '';
    if (k) setApiKey(k);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { try { setCases(JSON.parse(saved)); } catch {} }
  }, []);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('groq_api_key', key);
    setShowKeyInput(false);
  };

  const updateInput = (field: keyof MedInput, value: string) =>
    setInput(prev => ({ ...prev, [field]: value }));

  const saveCase = (newRx: MedPrescription) => {
    const specialty = getSpecialty(input.specialty_id);
    const newCase: SavedCase = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      timestamp: new Date().toISOString(),
      input: { ...input }, rx: newRx,
      specialty_label: specialty?.label || 'Internal Medicine',
    };
    const updated = [newCase, ...cases].slice(0, MAX_CASES);
    setCases(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSubmit = async () => {
    if (!input.chief_complaint.trim() || !input.specialty_id) {
      setError('Please select a specialty and enter a chief complaint.');
      return;
    }
    setLoading(true); setError(null);
    try {
      const result = await callGroq(apiKey, input);
      setRx(result); saveCase(result); setView('rx');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate prescription.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInput(initialInput); setRx(null); setError(null); setView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadCase = (savedCase: SavedCase) => {
    setInput(savedCase.input); setRx(savedCase.rx);
    setView('rx'); setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteCase = (id: string) => {
    const updated = cases.filter(c => c.id !== id);
    setCases(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const envKey = (import.meta as any).env?.VITE_GROQ_API_KEY || '';
  const apiKeySet = (envKey && envKey.length > 10) || apiKey.trim().length > 20;

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'linear-gradient(160deg,#EEF2FF 0%,#F0FDFA 40%,#FDF4FF 100%)' }}>

      {/* Animated background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="animate-blob absolute w-96 h-96 rounded-full opacity-20"
          style={{ background:'linear-gradient(135deg,#6366F1,#8B5CF6)', top:'-8rem', left:'-8rem', animationDuration:'12s' }} />
        <div className="animate-blob absolute w-80 h-80 rounded-full opacity-15"
          style={{ background:'linear-gradient(135deg,#06B6D4,#0891B2)', top:'20%', right:'-6rem', animationDuration:'15s', animationDelay:'3s' }} />
        <div className="animate-blob absolute w-72 h-72 rounded-full opacity-15"
          style={{ background:'linear-gradient(135deg,#EC4899,#F43F5E)', bottom:'10%', left:'20%', animationDuration:'10s', animationDelay:'6s' }} />
        <div className="animate-blob absolute w-64 h-64 rounded-full opacity-10"
          style={{ background:'linear-gradient(135deg,#10B981,#059669)', bottom:'-4rem', right:'15%', animationDuration:'18s', animationDelay:'2s' }} />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/30"
        style={{ background:'linear-gradient(135deg,rgba(30,64,175,0.92),rgba(99,102,241,0.92),rgba(124,58,237,0.92))', backgroundSize:'200% 200%', animation:'gradientShift 8s ease infinite' }}>
        <div className="max-w-[1400px] mx-auto px-6 h-18 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AppLogo size={46} />
            <div>
              <div className="font-extrabold text-2xl tracking-tighter text-white leading-tight">MedScribe IM</div>
              <div className="text-[10px] text-blue-200 font-bold tracking-[3px]">INTERNAL MEDICINE AI</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!envKey && (
              <button onClick={() => setShowKeyInput(!showKeyInput)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border backdrop-blur-sm"
                style={ apiKeySet
                  ? { background:'rgba(16,185,129,0.2)', color:'#6EE7B7', borderColor:'rgba(16,185,129,0.4)' }
                  : { background:'rgba(245,158,11,0.2)', color:'#FCD34D', borderColor:'rgba(245,158,11,0.4)' }
                }>
                <Key size={14} />
                {apiKeySet ? 'Key Set ✓' : 'Set API Key'}
              </button>
            )}

            <button onClick={() => setView(view === 'history' ? 'form' : 'history')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border backdrop-blur-sm"
              style={{ background:'rgba(255,255,255,0.15)', color:'white', borderColor:'rgba(255,255,255,0.3)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'}>
              <History size={14} />
              History
              {cases.length > 0 && (
                <span className="px-1.5 py-0.5 text-xs rounded-full font-mono"
                  style={{ background:'rgba(255,255,255,0.25)', color:'white' }}>{cases.length}</span>
              )}
            </button>

            {view !== 'form' && (
              <button onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border backdrop-blur-sm"
                style={{ background:'rgba(255,255,255,0.15)', color:'white', borderColor:'rgba(255,255,255,0.3)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'}>
                <Plus size={14} /> New Case
              </button>
            )}
          </div>
        </div>

        {/* API Key input panel */}
        {showKeyInput && (
          <div className="border-t border-white/20" style={{ background:'rgba(15,23,42,0.7)', backdropFilter:'blur(20px)' }}>
            <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-col md:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-bold text-blue-200 mb-1.5 tracking-widest">GROQ API KEY — console.groq.com</label>
                <input type="password" className="field font-mono text-sm"
                  style={{ background:'rgba(255,255,255,0.1)', color:'white', borderColor:'rgba(255,255,255,0.3)' }}
                  placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveApiKey(apiKey)} />
                <p className="text-xs text-blue-300 mt-1">Stored only in your browser — never sent to our servers.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => saveApiKey(apiKey)} className="btn-primary px-6">Save Key</button>
                <button onClick={() => setShowKeyInput(false)} className="btn-ghost text-white border-white/30 px-4">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Main ── */}
      <main className="relative z-10 max-w-[1400px] mx-auto px-6 pb-24 pt-10">

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl flex items-start gap-3 animate-fade-in-up"
            style={{ background:'linear-gradient(135deg,#FEF2F2,#FEE2E2)', border:'1.5px solid #FECACA' }}>
            <span className="text-lg">⚠️</span>
            <p className="flex-1 text-sm text-red-700 font-medium">{error}</p>
            <button onClick={() => setError(null)}><X size={16} className="text-red-400" /></button>
          </div>
        )}

        {loading && <LoadingSpinner message="Generating evidence-based prescription with AI…" />}

        {/* Form view */}
        {!loading && view === 'form' && (
          <>
            {/* Hero */}
            <div className="text-center mb-10 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-extrabold tracking-widest mb-4"
                style={{ background:'linear-gradient(135deg,#EEF2FF,#F5F3FF)', color:'#6366F1', border:'1.5px solid #C7D2FE' }}>
                ⚡ POWERED BY GROQ · openai/gpt-oss-120b
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-4 leading-tight">
                <span className="gradient-text">AI Prescriptions</span>
                <br />
                <span className="text-gray-700">in seconds</span>
              </h1>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                Evidence-based internal medicine prescriptions across Cardiology, Pulmonology,
                Nephrology, Endocrinology, Gastroenterology &amp; more
              </p>

              {/* Stats row */}
              <div className="flex justify-center gap-6 mt-8 flex-wrap">
                {[
                  { icon:'🏥', label:'11 Specialties', color:'#6366F1' },
                  { icon:'💊', label:'Full Drug Details', color:'#059669' },
                  { icon:'📄', label:'DOCX + PDF Export', color:'#0891B2' },
                  { icon:'🔒', label:'Runs in Browser', color:'#7C3AED' },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold animate-pulse-scale"
                    style={{ background:'rgba(255,255,255,0.7)', border:`1.5px solid ${stat.color}25`, color: stat.color, animationDuration:'3s' }}>
                    {stat.icon} {stat.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-8 md:p-10">
              <CaseForm input={input} onInputChange={updateInput} onSubmit={handleSubmit} loading={loading} apiKeySet={apiKeySet} />
            </div>
          </>
        )}

        {!loading && view === 'rx' && rx && (
          <PrescriptionPanel input={input} rx={rx} onNewCase={handleReset} />
        )}

        {!loading && view === 'history' && (
          <HistoryPanel cases={cases} onLoadCase={loadCase} onDeleteCase={deleteCase} onClose={() => setView('form')} />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-xs text-gray-400 border-t border-white/40"
        style={{ background:'rgba(255,255,255,0.4)', backdropFilter:'blur(8px)' }}>
        <span className="gradient-text font-bold">MedScribe IM</span> · AI-Assisted Internal Medicine · Verify before patient use
      </footer>
    </div>
  );
}

export default App;
