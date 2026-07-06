import React, { useState, useEffect } from 'react';
import { AppLogo } from './components/AppLogo';
import { CaseForm } from './components/CaseForm';
import { PrescriptionPanel } from './components/PrescriptionPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { LoadingSpinner } from './components/LoadingSpinner';
import { MedInput, MedPrescription, SavedCase } from './types';
import { callGroq } from './lib/groq';
import { getSpecialty } from './lib/specialties';
import { Key, History, X } from 'lucide-react';

const STORAGE_KEY = 'medscribe_im_cases';
const MAX_CASES = 50;

const initialInput: MedInput = {
  name: '',
  age: '',
  gender: '',
  occupation: '',
  chief_complaint: '',
  duration: '',
  past_medical_history: '',
  clinical_findings: '',
  provisional_diagnosis: '',
  current_medications: '',
  allergies: '',
  comorbidities: '',
  notes: '',
  specialty_id: '',
};

function App() {
  const [input, setInput] = useState<MedInput>(initialInput);
  const [rx, setRx] = useState<MedPrescription | null>(null);
  const [view, setView] = useState<'form' | 'rx' | 'history'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [cases, setCases] = useState<SavedCase[]>([]);

  useEffect(() => {
    const savedKey = localStorage.getItem('groq_api_key') || '';
    if (savedKey) setApiKey(savedKey);

    const savedCases = localStorage.getItem(STORAGE_KEY);
    if (savedCases) {
      try {
        setCases(JSON.parse(savedCases));
      } catch (e) {
        console.error('Failed to parse saved cases');
      }
    }
  }, []);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('groq_api_key', key);
    setShowKeyInput(false);
  };

  const updateInput = (field: keyof MedInput, value: string) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  const saveCase = (newRx: MedPrescription) => {
    const specialty = getSpecialty(input.specialty_id);
    const newCase: SavedCase = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      timestamp: new Date().toISOString(),
      input: { ...input },
      rx: newRx,
      specialty_label: specialty?.label || 'Internal Medicine',
    };
    const updatedCases = [newCase, ...cases].slice(0, MAX_CASES);
    setCases(updatedCases);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCases));
  };

  const handleSubmit = async () => {
    if (!input.chief_complaint.trim() || !input.specialty_id) {
      setError('Please select a specialty and enter a chief complaint.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await callGroq(apiKey, input);
      setRx(result);
      saveCase(result);
      setView('rx');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate prescription.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInput(initialInput);
    setRx(null);
    setError(null);
    setView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadCase = (savedCase: SavedCase) => {
    setInput(savedCase.input);
    setRx(savedCase.rx);
    setView('rx');
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteCase = (id: string) => {
    const updated = cases.filter(c => c.id !== id);
    setCases(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Check env var OR localStorage key
  const envKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GROQ_API_KEY) || '';
  const apiKeySet = (envKey && envKey.length > 10) || apiKey.trim().length > 20;

  return (
    <div className="min-h-screen bg-[#FFFDF5]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5E0D5]">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AppLogo size={46} />
            <div>
              <div className="font-extrabold text-3xl tracking-tighter text-[#3D2B1F]">MedScribe IM</div>
              <div className="text-[10px] text-[#1E40AF] font-bold -mt-1 tracking-[3px]">INTERNAL MEDICINE</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Hide API key button if env var is set */}
            {!envKey && (
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all border ${
                  apiKeySet
                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <Key className="w-4 h-4" />
                {apiKeySet ? 'API Key Set ✓' : 'Set Groq API Key'}
              </button>
            )}

            <button
              onClick={() => setView(view === 'history' ? 'form' : 'history')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold border border-[#D4CBB8] hover:bg-[#FEF9E7] transition-all"
            >
              <History className="w-4 h-4" />
              History
              {cases.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-[#1E40AF] text-white rounded-full font-mono">{cases.length}</span>
              )}
            </button>

            {view !== 'form' && (
              <button onClick={handleReset} className="btn-ghost text-sm px-5 py-2.5">
                New Case
              </button>
            )}
          </div>
        </div>

        {/* Collapsible API Key Input */}
        {showKeyInput && (
          <div className="border-t border-[#E5E0D5] bg-white">
            <div className="max-w-[1400px] mx-auto px-6 py-5 flex flex-col md:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="label">Groq API Key (from console.groq.com)</label>
                <input
                  type="password"
                  className="field font-mono text-sm"
                  placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveApiKey(apiKey)}
                />
                <p className="text-xs text-[#6B5B3F] mt-1.5">Stored only in your browser's localStorage. Never shared.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => saveApiKey(apiKey)} className="btn-primary px-8">Save Key</button>
                <button onClick={() => setShowKeyInput(false)} className="btn-ghost px-6">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-[1400px] mx-auto px-6 pb-20 pt-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3">
            <div className="font-bold mt-0.5">⚠</div>
            <div className="flex-1 text-sm">{error}</div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
          </div>
        )}

        {loading && <LoadingSpinner message="Generating evidence-based internal medicine prescription..." />}

        {!loading && view === 'form' && (
          <>
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-blue-50 text-[#1E40AF] text-xs font-extrabold tracking-widest rounded-full mb-3">
                POWERED BY GROQ LLAMA-3.3-70B
              </div>
              <h1 className="text-5xl font-extrabold tracking-tighter mb-3">
                Generate precise medical prescriptions in seconds
              </h1>
              <p className="text-xl text-[#6B5B3F] max-w-2xl mx-auto">
                AI-assisted comprehensive internal medicine prescription generator covering cardiology, pulmonology,
                gastroenterology, nephrology, endocrinology, and more
              </p>
            </div>

            <div className="card p-8 md:p-10">
              <CaseForm
                input={input}
                onInputChange={updateInput}
                onSubmit={handleSubmit}
                loading={loading}
                apiKeySet={apiKeySet}
              />
            </div>
          </>
        )}

        {!loading && view === 'rx' && rx && (
          <PrescriptionPanel input={input} rx={rx} onNewCase={handleReset} />
        )}

        {!loading && view === 'history' && (
          <HistoryPanel
            cases={cases}
            onLoadCase={loadCase}
            onDeleteCase={deleteCase}
            onClose={() => setView('form')}
          />
        )}
      </main>

      <footer className="text-center py-8 text-xs text-[#6B5B3F] border-t border-[#E5E0D5]">
        MedScribe IM • AI-assisted Internal Medicine Prescription Generator •
        AI output requires physician verification • Not for direct patient use without review
      </footer>
    </div>
  );
}

export default App;
