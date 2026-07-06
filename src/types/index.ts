// Patient Input
export interface MedInput {
  name: string;
  age: string;
  gender: string;
  occupation: string;
  chief_complaint: string;
  duration: string;
  past_medical_history: string;
  clinical_findings: string;
  provisional_diagnosis: string;
  current_medications: string;
  allergies: string;
  comorbidities: string;
  notes: string;
  specialty_id: string;
  image?: string;
}

// Medication in prescription
export interface Medication {
  name: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  indication: string;
  caution: string;
  monitoring: string;
}

// Investigation/Test
export interface Investigation {
  test: string;
  reason: string;
  when: string;
  priority?: 'High' | 'Routine';
}

// Complete prescription
export interface MedPrescription {
  primary_diagnosis: string;
  secondary_diagnoses: string[];
  clinical_summary: string;
  urgency: 'Routine' | 'Urgent' | 'Emergency';
  specialty_assessment: string;
  medications: Medication[];
  non_pharmacological: string[];
  investigations: Investigation[];
  referral: string | null;
  follow_up_weeks: number;
  follow_up_advice: string;
  patient_education: string[];
  warning_signs: string[];
  confidence: number;
  disclaimer: string;
  differential_diagnoses?: string[];
  drug_interactions?: string[];
  contraindications?: string[];
}

// Saved case
export interface SavedCase {
  id: string;
  timestamp: string;
  input: MedInput;
  rx: MedPrescription;
  specialty_label: string;
}

// Specialty definition
export interface Specialty {
  id: string;
  label: string;
  icon: string;
  color: string;
  context: string;
}
