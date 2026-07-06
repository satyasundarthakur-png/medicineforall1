import { Document, Packer, Paragraph, Table, TableRow, TableCell, BorderStyle, WidthType, HeadingLevel, convertInchesToTwip, AlignmentType, TextRun, UnderlineType, VerticalAlign } from 'docx';
import { MedInput, MedPrescription } from '../types';
import { getSpecialty } from './specialties';

export async function exportToWord(input: MedInput, rx: MedPrescription): Promise<void> {
  const specialty = getSpecialty(input.specialty_id);

  const sections = [
    // Header
    new Paragraph({
      text: 'MEDICAL PRESCRIPTION',
      heading: HeadingLevel.HEADING_1,
      bold: true,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),

    new Paragraph({
      text: `Generated: ${new Date().toLocaleDateString()} | Specialty: ${specialty?.label || 'Internal Medicine'}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      fontSize: 20,
      color: '666666',
    }),

    // Patient Demographics
    new Paragraph({
      text: 'PATIENT INFORMATION',
      heading: HeadingLevel.HEADING_2,
      bold: true,
      spacing: { before: 200, after: 100 },
    }),

    createDemographicsTable(input),

    // Chief Complaint & History
    new Paragraph({
      text: 'CHIEF COMPLAINT & HISTORY OF PRESENT ILLNESS',
      heading: HeadingLevel.HEADING_2,
      bold: true,
      spacing: { before: 200, after: 100 },
    }),

    new Paragraph({
      text: input.chief_complaint,
      spacing: { after: 50 },
    }),

    new Paragraph({
      text: `Duration: ${input.duration}`,
      spacing: { after: 100 },
      italics: true,
    }),

    // PMH & Allergies
    new Paragraph({
      text: 'PAST MEDICAL HISTORY & ALLERGIES',
      heading: HeadingLevel.HEADING_2,
      bold: true,
      spacing: { before: 200, after: 100 },
    }),

    new Paragraph({
      text: input.past_medical_history || 'None reported',
      spacing: { after: 50 },
    }),

    new Paragraph({
      text: `Allergies: ${input.allergies || 'NKDA'}`,
      spacing: { after: 100 },
      color: 'DC2626',
      bold: true,
    }),

    // Clinical Findings
    new Paragraph({
      text: 'CLINICAL EXAMINATION FINDINGS',
      heading: HeadingLevel.HEADING_2,
      bold: true,
      spacing: { before: 200, after: 100 },
    }),

    new Paragraph({
      text: input.clinical_findings || 'Not documented',
      spacing: { after: 100 },
    }),

    // Diagnosis
    new Paragraph({
      text: 'DIAGNOSIS & ASSESSMENT',
      heading: HeadingLevel.HEADING_2,
      bold: true,
      spacing: { before: 200, after: 100 },
    }),

    new Paragraph({
      text: 'Primary Diagnosis:',
      bold: true,
      spacing: { after: 50 },
    }),

    new Paragraph({
      text: rx.primary_diagnosis,
      spacing: { after: 100 },
      color: '1E40AF',
    }),

    ...(rx.secondary_diagnoses && rx.secondary_diagnoses.length > 0
      ? [
          new Paragraph({
            text: 'Secondary Diagnoses:',
            bold: true,
            spacing: { after: 50 },
          }),
          ...rx.secondary_diagnoses.map(
            (diag) =>
              new Paragraph({
                text: `• ${diag}`,
                spacing: { after: 50 },
              })
          ),
        ]
      : []),

    new Paragraph({
      text: '',
      spacing: { after: 100 },
    }),

    new Paragraph({
      text: 'Urgency Level:',
      bold: true,
      spacing: { after: 50 },
    }),

    new Paragraph({
      text: rx.urgency,
      spacing: { after: 100 },
      color: rx.urgency === 'Emergency' ? 'DC2626' : rx.urgency === 'Urgent' ? 'EA580C' : '059669',
      bold: true,
    }),

    // Clinical Summary
    new Paragraph({
      text: 'Clinical Summary:',
      bold: true,
      spacing: { after: 50 },
    }),

    new Paragraph({
      text: rx.clinical_summary,
      spacing: { after: 200 },
      italics: true,
    }),

    // Medications
    new Paragraph({
      text: 'MEDICATIONS & PRESCRIPTIONS',
      heading: HeadingLevel.HEADING_2,
      bold: true,
      spacing: { before: 200, after: 100 },
    }),

    ...(rx.medications && rx.medications.length > 0
      ? rx.medications.map((med, idx) =>
          createMedicationSection(med, idx)
        )
      : [
          new Paragraph({
            text: 'No medications prescribed',
            italics: true,
            color: '666666',
          }),
        ]),

    new Paragraph({
      text: '',
      spacing: { after: 200 },
    }),

    // Drug Interactions & Contraindications
    ...(rx.drug_interactions && rx.drug_interactions.length > 0
      ? [
          new Paragraph({
            text: 'DRUG INTERACTIONS & CONTRAINDICATIONS',
            heading: HeadingLevel.HEADING_2,
            bold: true,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: 'Drug Interactions:',
            bold: true,
            spacing: { after: 50 },
          }),
          ...rx.drug_interactions.map(
            (interaction) =>
              new Paragraph({
                text: `⚠ ${interaction}`,
                spacing: { after: 50 },
                color: 'DC2626',
              })
          ),
          new Paragraph({
            text: '',
            spacing: { after: 100 },
          }),
        ]
      : []),

    // Non-pharmacological
    ...(rx.non_pharmacological && rx.non_pharmacological.length > 0
      ? [
          new Paragraph({
            text: 'NON-PHARMACOLOGICAL MANAGEMENT',
            heading: HeadingLevel.HEADING_2,
            bold: true,
            spacing: { before: 200, after: 100 },
          }),
          ...rx.non_pharmacological.map(
            (rec) =>
              new Paragraph({
                text: `• ${rec}`,
                spacing: { after: 50 },
              })
          ),
          new Paragraph({
            text: '',
            spacing: { after: 100 },
          }),
        ]
      : []),

    // Investigations
    ...(rx.investigations && rx.investigations.length > 0
      ? [
          new Paragraph({
            text: 'INVESTIGATIONS & MONITORING',
            heading: HeadingLevel.HEADING_2,
            bold: true,
            spacing: { before: 200, after: 100 },
          }),
          createInvestigationsTable(rx.investigations),
          new Paragraph({
            text: '',
            spacing: { after: 100 },
          }),
        ]
      : []),

    // Follow-up
    new Paragraph({
      text: 'FOLLOW-UP PLAN',
      heading: HeadingLevel.HEADING_2,
      bold: true,
      spacing: { before: 200, after: 100 },
    }),

    new Paragraph({
      text: `Recommended Follow-up: ${rx.follow_up_weeks} weeks`,
      bold: true,
      spacing: { after: 50 },
    }),

    new Paragraph({
      text: rx.follow_up_advice,
      spacing: { after: 200 },
    }),

    // Patient Education
    ...(rx.patient_education && rx.patient_education.length > 0
      ? [
          new Paragraph({
            text: 'PATIENT EDUCATION',
            heading: HeadingLevel.HEADING_2,
            bold: true,
            spacing: { before: 200, after: 100 },
          }),
          ...rx.patient_education.map(
            (edu) =>
              new Paragraph({
                text: `• ${edu}`,
                spacing: { after: 50 },
              })
          ),
          new Paragraph({
            text: '',
            spacing: { after: 100 },
          }),
        ]
      : []),

    // Warning Signs
    ...(rx.warning_signs && rx.warning_signs.length > 0
      ? [
          new Paragraph({
            text: 'RED FLAGS - SEEK IMMEDIATE MEDICAL ATTENTION IF:',
            heading: HeadingLevel.HEADING_2,
            bold: true,
            color: 'DC2626',
            spacing: { before: 200, after: 100 },
          }),
          ...rx.warning_signs.map(
            (sign) =>
              new Paragraph({
                text: `⚠ ${sign}`,
                spacing: { after: 50 },
                color: 'DC2626',
                bold: true,
              })
          ),
          new Paragraph({
            text: '',
            spacing: { after: 200 },
          }),
        ]
      : []),

    // Referral
    ...(rx.referral
      ? [
          new Paragraph({
            text: 'SPECIALIST REFERRAL RECOMMENDED',
            heading: HeadingLevel.HEADING_2,
            bold: true,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: rx.referral,
            spacing: { after: 200 },
            color: '1E40AF',
          }),
        ]
      : []),

    // Footer
    new Paragraph({
      text: '',
      spacing: { before: 400, after: 100 },
    }),

    new Paragraph({
      text: 'DISCLAIMER',
      heading: HeadingLevel.HEADING_3,
      bold: true,
      spacing: { after: 100 },
    }),

    new Paragraph({
      text: rx.disclaimer,
      spacing: { after: 100 },
      italics: true,
      color: '666666',
      fontSize: 18,
    }),

    new Paragraph({
      text: `AI Confidence Score: ${rx.confidence}%`,
      spacing: { after: 200 },
      color: '666666',
      fontSize: 18,
    }),

    new Paragraph({
      text: `Generated by MedScribe IM on ${new Date().toLocaleString()}`,
      spacing: { after: 100 },
      alignment: AlignmentType.CENTER,
      color: '999999',
      fontSize: 18,
    }),
  ];

  const doc = new Document({
    sections: [
      {
        children: sections.flat(),
        margins: {
          top: convertInchesToTwip(0.75),
          right: convertInchesToTwip(0.75),
          bottom: convertInchesToTwip(0.75),
          left: convertInchesToTwip(0.75),
        },
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `prescription_${input.name.replace(/\s+/g, '_')}_${Date.now()}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function createDemographicsTable(input: MedInput): Table {
  return new Table({
    rows: [
      new TableRow({
        cells: [
          createTableCell('Name'),
          createTableCell(input.name || 'N/A'),
          createTableCell('Age'),
          createTableCell(input.age || 'N/A'),
        ],
      }),
      new TableRow({
        cells: [
          createTableCell('Gender'),
          createTableCell(input.gender || 'N/A'),
          createTableCell('Occupation'),
          createTableCell(input.occupation || 'N/A'),
        ],
      }),
      new TableRow({
        cells: [
          createTableCell('Comorbidities'),
          new TableCell({
            columnSpan: 3,
            children: [
              new Paragraph(input.comorbidities || 'None reported'),
            ],
            borders: {
              top: { style: BorderStyle.SINGLE },
              bottom: { style: BorderStyle.SINGLE },
              left: { style: BorderStyle.SINGLE },
              right: { style: BorderStyle.SINGLE },
            },
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

function createTableCell(text: string, header = true): TableCell {
  return new TableCell({
    children: [new Paragraph(text)],
    shading: header ? { fill: '1E40AF', color: 'ffffff' } : undefined,
    textVerticalAlign: VerticalAlign.CENTER,
    borders: {
      top: { style: BorderStyle.SINGLE },
      bottom: { style: BorderStyle.SINGLE },
      left: { style: BorderStyle.SINGLE },
      right: { style: BorderStyle.SINGLE },
    },
  });
}

function createMedicationSection(med: any, idx: number): Paragraph[] {
  return [
    new Paragraph({
      text: `${idx + 1}. ${med.name}`,
      bold: true,
      spacing: { before: 100, after: 50 },
      border: {
        bottom: {
          color: 'D4CBB8',
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
    }),

    new Paragraph({
      text: `Dose: ${med.dose}`,
      spacing: { after: 25 },
    }),

    new Paragraph({
      text: `Route: ${med.route}`,
      spacing: { after: 25 },
    }),

    new Paragraph({
      text: `Frequency: ${med.frequency}`,
      spacing: { after: 25 },
    }),

    new Paragraph({
      text: `Duration: ${med.duration}`,
      spacing: { after: 25 },
    }),

    new Paragraph({
      text: `Indication: ${med.indication}`,
      spacing: { after: 25 },
      italics: true,
      color: '059669',
    }),

    new Paragraph({
      text: `Cautions & Monitoring: ${med.caution}`,
      spacing: { after: 50 },
      color: 'DC2626',
    }),

    new Paragraph({
      text: `Lab Monitoring: ${med.monitoring}`,
      spacing: { after: 100 },
      color: '0891B2',
    }),
  ];
}

function createInvestigationsTable(investigations: any[]): Table {
  return new Table({
    rows: [
      new TableRow({
        cells: [
          createTableCell('Test'),
          createTableCell('Reason'),
          createTableCell('Timeline'),
          createTableCell('Priority'),
        ],
      }),
      ...investigations.map(
        (inv) =>
          new TableRow({
            cells: [
              new TableCell({
                children: [new Paragraph(inv.test)],
                borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
              }),
              new TableCell({
                children: [new Paragraph(inv.reason)],
                borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
              }),
              new TableCell({
                children: [new Paragraph(inv.when)],
                borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
              }),
              new TableCell({
                children: [new Paragraph(inv.priority || 'Routine')],
                borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
              }),
            ],
          })
      ),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}
