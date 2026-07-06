import { MedInput, MedPrescription } from '../types';
import { buildSpecialtyContext, getSpecialty } from './specialties';

export function buildPrompt(input: MedInput): string {
  const specialty = getSpecialty(input.specialty_id);
  const specialtyContext = buildSpecialtyContext(input);

  return `You are an expert Internal Medicine physician with 20+ years of clinical experience. You follow current international guidelines (ACC/AHA, ESC, EASD, IDSA, EULAR, etc.) and are well-versed in complex polypharmacy, drug interactions, and multisystem disease management.

== PATIENT DEMOGRAPHICS ==
Name: ${input.name || 'Not provided'}
Age: ${input.age || 'Not provided'} years
Gender: ${input.gender || 'Not provided'}
Occupation: ${input.occupation || 'Not provided'}

== CHIEF COMPLAINT ==
${input.chief_complaint || 'Not provided'}
Duration: ${input.duration || 'Not provided'}

== PAST MEDICAL HISTORY ==
${input.past_medical_history || 'None reported'}

== CLINICAL FINDINGS / EXAMINATION ==
${input.clinical_findings || 'Not provided'}

== PROVISIONAL DIAGNOSIS ==
${input.provisional_diagnosis || 'Not provided'}

== CURRENT MEDICATIONS ==
${input.current_medications || 'None reported'}

== ALLERGIES & COMORBIDITIES ==
Allergies: ${input.allergies || 'None known'}
Comorbidities: ${input.comorbidities || 'None reported'}
Additional notes: ${input.notes || 'None'}

${specialtyContext}

CRITICAL INSTRUCTIONS:
1. Respond ONLY with valid JSON — no markdown, no backticks, no explanations outside the JSON object.
2. Provide evidence-based recommendations aligned with current clinical guidelines.
3. Include comprehensive medication details with cautions and monitoring parameters.
4. Consider drug interactions, renal/hepatic clearance, and contraindications.
5. Provide specific, actionable follow-up advice.

The JSON must strictly follow this schema:
{
  "primary_diagnosis": "Primary diagnosis with ICD-10/ICD-11 code if possible",
  "secondary_diagnoses": ["List of secondary diagnoses"],
  "clinical_summary": "2-3 sentence clinical summary synthesizing key findings",
  "urgency": "Routine | Urgent | Emergency",
  "differential_diagnoses": ["Alternative diagnoses to consider"],
  "specialty_assessment": "Detailed assessment paragraph focused on ${specialty?.label || 'Internal Medicine'} management",
  "medications": [
    {
      "name": "Drug name",
      "dose": "Specific dose",
      "route": "Oral / SC / IV / IM",
      "frequency": "Once daily / BD / TDS / QID / PRN",
      "duration": "Duration of treatment",
      "indication": "Clear indication for this medication",
      "caution": "Drug interactions, contraindications, side effects",
      "monitoring": "Specific labs or clinical monitoring required"
    }
  ],
  "drug_interactions": ["List any significant drug-drug interactions"],
  "contraindications": ["Any absolute or relative contraindications"],
  "non_pharmacological": ["Array of lifestyle/non-drug recommendations"],
  "investigations": [
    {
      "test": "Name of investigation",
      "reason": "Clinical reason for test",
      "when": "Baseline / In 2 weeks / Monthly / As needed",
      "priority": "High | Routine"
    }
  ],
  "referral": "Specialist referral if needed or null",
  "follow_up_weeks": 4,
  "follow_up_advice": "Specific, actionable follow-up instructions",
  "patient_education": ["Array of key education points"],
  "warning_signs": ["Array of red-flag symptoms requiring immediate attention"],
  "confidence": 85,
  "disclaimer": "This is an AI-assisted draft prescription. Final clinical decisions rest with the treating physician. Verify all recommendations before patient counseling."
}`;
}

function resolveApiKey(localStorageKey: string): string {
  // Try Lovable/Vite env var first (set VITE_GROQ_API_KEY in Lovable secrets)
  const envKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GROQ_API_KEY) || '';
  if (envKey && envKey.length > 10) return envKey;
  // Fall back to user-supplied key stored in localStorage
  return localStorageKey;
}

export async function callGroq(apiKey: string, input: MedInput): Promise<MedPrescription> {
  const key = resolveApiKey(apiKey);
  if (!key || key.trim().length < 10) {
    throw new Error('Please enter a valid Groq API key from console.groq.com');
  }

  const prompt = buildPrompt(input);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 5000,
      top_p: 0.95,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(`Groq API error (${response.status}): ${errorData?.error?.message || 'Unknown error'}`);
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  let content = data.choices?.[0]?.message?.content || '';

  // Strip markdown fences if present
  content = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();

  try {
    const parsed: MedPrescription = JSON.parse(content);
    if (!parsed.medications) parsed.medications = [];
    if (!parsed.non_pharmacological) parsed.non_pharmacological = [];
    if (!parsed.investigations) parsed.investigations = [];
    if (!parsed.patient_education) parsed.patient_education = [];
    if (!parsed.warning_signs) parsed.warning_signs = [];
    if (!parsed.secondary_diagnoses) parsed.secondary_diagnoses = [];
    if (!parsed.differential_diagnoses) parsed.differential_diagnoses = [];
    if (!parsed.drug_interactions) parsed.drug_interactions = [];
    if (!parsed.contraindications) parsed.contraindications = [];
    if (!parsed.follow_up_weeks) parsed.follow_up_weeks = 4;
    if (!parsed.urgency) parsed.urgency = 'Routine';
    if (!parsed.confidence) parsed.confidence = 85;
    return parsed;
  } catch {
    console.error('Failed to parse Groq response:', content);
    throw new Error('AI returned invalid JSON. Please try again.');
  }
}
