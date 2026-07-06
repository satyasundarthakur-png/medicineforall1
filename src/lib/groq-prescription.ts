import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PatientSchema = z.object({
  name: z.string(),
  age: z.string(),
  gender: z.string(),
  weight: z.string(),
  chiefComplaint: z.string(),
  duration: z.string(),
  symptoms: z.array(z.string()),
  medicalHistory: z.string(),
  allergies: z.string(),
  currentMeds: z.string(),
  bp: z.string(),
  temp: z.string(),
  pulse: z.string(),
  spo2: z.string(),
});

export const generatePrescriptionFn = createServerFn()
  .validator(PatientSchema)
  .handler(async ({ data }) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not configured");

    const systemPrompt = `You are an expert General Medicine physician with 20+ years of clinical experience practising in India. Generate a detailed, structured clinical prescription. Use Indian drug formulary (generic names preferred). Structure your response EXACTLY as follows:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLINICAL ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Working Diagnosis:
Differential Diagnoses:
Clinical Notes:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rx — PRESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. [Drug Name] [Dose] [Route] [Frequency] × [Duration]   — [Purpose]
2. ...
(list all medications with clear dosing)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INVESTIGATIONS ADVISED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- (list relevant investigations)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIETARY & LIFESTYLE ADVICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- (specific actionable advice)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FOLLOW-UP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Review after: 
Red flag symptoms requiring immediate attention:

⚠️  AI-GENERATED — For clinical assistance only. Verify before dispensing.`;

    const userPrompt = `Patient Details:
Name: ${data.name || "Not provided"}
Age: ${data.age} years | Gender: ${data.gender} | Weight: ${data.weight ? data.weight + " kg" : "Not recorded"}
Chief Complaint: ${data.chiefComplaint}
Duration: ${data.duration || "Not specified"}
Associated Symptoms: ${data.symptoms.length > 0 ? data.symptoms.join(", ") : "None reported"}
Past Medical History: ${data.medicalHistory || "Nil significant"}
Known Allergies: ${data.allergies || "NKDA"}
Current Medications: ${data.currentMeds || "None"}

Vitals:
  Blood Pressure: ${data.bp || "Not recorded"} mmHg
  Temperature: ${data.temp || "Not recorded"} °F
  Pulse: ${data.pulse || "Not recorded"} /min
  SpO₂: ${data.spo2 || "Not recorded"} %

Generate a complete prescription:`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1800,
        temperature: 0.25,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error ${response.status}: ${errText}`);
    }

    const result = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return result.choices[0].message.content;
  });
