import { MedInput, Specialty } from '../types';

const specialties: Record<string, Specialty> = {
  'cardiology': {
    id: 'cardiology',
    label: 'Cardiology',
    icon: '❤️',
    color: '#DC2626',
    context: `
Focus on cardiovascular diseases: hypertension, coronary artery disease, heart failure, arrhythmias, valvular disease.
Consider: ECG findings, troponin levels, BNP, echocardiography results, drug interactions with cardiac medications.
Follow: ACC/AHA guidelines for hypertension, chest pain evaluation, heart failure management.
`
  },
  'pulmonology': {
    id: 'pulmonology',
    label: 'Pulmonology / Respiratory',
    icon: '🫁',
    color: '#0891B2',
    context: `
Focus on respiratory diseases: pneumonia, COPD, asthma, interstitial lung disease, pulmonary hypertension.
Consider: Chest X-ray, spirometry, ABG, SpO2, sputum culture, imaging findings.
Follow: GOLD guidelines (COPD), GINA guidelines (asthma), ATS guidelines for respiratory infections.
Assess: Smoking history, occupational exposure, sleep apnea risk.
`
  },
  'gastroenterology': {
    id: 'gastroenterology',
    label: 'Gastroenterology',
    icon: '🍽️',
    color: '#EA580C',
    context: `
Focus on GI diseases: peptic ulcer disease, GERD, inflammatory bowel disease, cirrhosis, hepatitis, pancreatitis.
Consider: Endoscopy findings, ultrasound/CT abdomen, LFTs, H. pylori status, albumin, INR.
Follow: ACG guidelines for GERD, IBD management protocols, hepatology guidelines for liver disease.
Monitor: Drug metabolism in liver disease, bleeding risk in portal hypertension.
`
  },
  'nephrology': {
    id: 'nephrology',
    label: 'Nephrology',
    icon: '🫘',
    color: '#7C3AED',
    context: `
Focus on kidney diseases: chronic kidney disease, acute kidney injury, glomerulonephritis, nephrotic syndrome, renal stone disease.
Consider: eGFR, serum creatinine, electrolytes, proteinuria, renal ultrasound, kidney biopsy findings.
Follow: KDIGO guidelines for CKD, hypertension in renal disease, mineral bone disorder.
Monitor: Drug clearance adjustments, phosphate/calcium/PTH levels, blood pressure targets.
`
  },
  'endocrinology': {
    id: 'endocrinology',
    label: 'Endocrinology',
    icon: '🔬',
    color: '#2563EB',
    context: `
Focus on endocrine diseases: diabetes (Type 1, 2, GDM), thyroid disorders, PCOS, Cushing's syndrome, adrenal insufficiency.
Consider: HbA1c, TSH, free T4, cortisol, ACTH, glucose curves, insulin resistance markers.
Follow: ADA guidelines for diabetes, Endocrine Society guidelines for other endocrine disorders.
Monitor: Glucose targets, hormone replacement adequacy, complications screening.
`
  },
  'rheumatology': {
    id: 'rheumatology',
    label: 'Rheumatology',
    icon: '🦴',
    color: '#8B5CF6',
    context: `
Focus on rheumatic diseases: rheumatoid arthritis, lupus, vasculitis, spondyloarthritis, gout, osteoarthritis.
Consider: ESR, CRP, RF, anti-CCP, ANA, complement levels, imaging (X-ray, MRI), synovial fluid analysis.
Follow: EULAR guidelines for RA, ACR guidelines for SLE, criteria for diagnosis and treatment.
Monitor: Disease activity, DMARDs efficacy, organ involvement, infection risk in immunosuppressed patients.
`
  },
  'hematology': {
    id: 'hematology',
    label: 'Hematology / Oncology',
    icon: '🩸',
    color: '#DC2626',
    context: `
Focus on blood/cancer disorders: anemia, thrombocytopenia, leukemia, lymphoma, bleeding disorders, DIC.
Consider: CBC, PT/INR, aPTT, blood smear, bone marrow biopsy, flow cytometry, imaging.
Follow: NCCN guidelines for cancer, ASH guidelines for hematologic disorders.
Monitor: Chemotherapy side effects, transfusion requirements, coagulopathy, infection risk.
`
  },
  'neurology': {
    id: 'neurology',
    label: 'Neurology',
    icon: '🧠',
    color: '#6366F1',
    context: `
Focus on neurological diseases: stroke, epilepsy, Parkinson's, Alzheimer's, MS, migraine, neuropathy.
Consider: CT/MRI brain, EEG, CSF analysis, neuropsychological testing, imaging findings.
Follow: AAN guidelines for stroke prevention, epilepsy management, neurodegenerative disease protocols.
Monitor: Seizure control, motor/cognitive function, medication interactions with neuro-drugs.
`
  },
  'infectious_disease': {
    id: 'infectious_disease',
    label: 'Infectious Diseases',
    icon: '🦠',
    color: '#DC2626',
    context: `
Focus on infections: pneumonia, sepsis, TB, HIV/AIDS, hepatitis, fungal infections, MDR infections.
Consider: Blood culture, sputum/CSF culture, PCR, serology, CD4 count, viral load, imaging findings.
Follow: CDC/IDSA guidelines for infections, TB guidelines, HIV treatment protocols.
Monitor: Antibiotic sensitivities, drug interactions with antiretrovirals, immune reconstitution.
`
  },
  'nephrology_hypertension': {
    id: 'nephrology_hypertension',
    label: 'Hypertension / Renal Hypertension',
    icon: '📊',
    color: '#DC2626',
    context: `
Focus on hypertension management and renovascular disease: resistant hypertension, secondary HTN, renal artery stenosis.
Consider: Home BP monitoring, ambulatory BP monitoring, renal artery imaging, renal function, electrolytes.
Follow: ACC/AHA hypertension guidelines, ESC guidelines for resistant hypertension.
Monitor: BP target achievement, proteinuria reduction, kidney function preservation.
`
  },
  'general_medicine': {
    id: 'general_medicine',
    label: 'General Internal Medicine',
    icon: '⚕️',
    color: '#1E40AF',
    context: `
Comprehensive internal medicine covering multiple organ systems and acute/chronic disease management.
Consider: Holistic patient assessment, drug-drug interactions, comorbidity management, preventive care.
Follow: Current guidelines across multiple specialties, evidence-based medicine.
Monitor: Overall patient health, medication safety, quality of life, preventive screening.
`
  }
};

export function getSpecialty(id: string): Specialty | undefined {
  return specialties[id];
}

export function getAllSpecialties(): Specialty[] {
  return Object.values(specialties);
}

export function buildSpecialtyContext(input: MedInput): string {
  const specialty = getSpecialty(input.specialty_id);
  if (!specialty) return '';

  return `== SPECIALTY CONTEXT (${specialty.label.toUpperCase()}) ==
${specialty.context}`;
}
