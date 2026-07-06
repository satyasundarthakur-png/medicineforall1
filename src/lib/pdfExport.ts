import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { MedInput, MedPrescription } from '../types';
import { getSpecialty } from './specialties';

export async function exportToPDF(input: MedInput, rx: MedPrescription): Promise<void> {
  const specialty = getSpecialty(input.specialty_id);
  
  // Create HTML content
  const htmlContent = generatePrescriptionHTML(input, rx, specialty);
  
  // Create a temporary container
  const container = document.createElement('div');
  container.innerHTML = htmlContent;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '8.5in';
  container.style.padding = '0.75in';
  container.style.backgroundColor = 'white';
  container.style.fontFamily = 'Arial, sans-serif';
  
  document.body.appendChild(container);

  try {
    // Wait for fonts to load
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#FFFFFF',
      allowTaint: true,
      useCORS: true,
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 0.75;
    const contentWidth = pageWidth - 2 * margin;
    const contentHeight = (canvas.height / canvas.width) * contentWidth;

    let yPosition = margin;
    let imgData = canvas.toDataURL('image/png');

    // Add first page
    pdf.addImage(imgData, 'PNG', margin, yPosition, contentWidth, contentHeight);
    let remainingHeight = contentHeight;
    let pageNumber = 1;

    // Add additional pages if needed
    while (remainingHeight > pageHeight - 2 * margin) {
      pdf.addPage();
      pageNumber++;
      yPosition = margin;
      remainingHeight -= pageHeight - 2 * margin;
      pdf.addImage(imgData, 'PNG', margin, yPosition - (pageNumber - 1) * (pageHeight - 2 * margin), contentWidth, contentHeight);
    }

    // Add page numbers
    for (let i = 1; i <= pdf.getNumberOfPages(); i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.text(`Page ${i} of ${pdf.getNumberOfPages()}`, pageWidth / 2, pageHeight - 0.5, { align: 'center' });
    }

    pdf.save(`prescription_${input.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}

function generatePrescriptionHTML(input: MedInput, rx: MedPrescription, specialty: any): string {
  const today = new Date().toLocaleDateString();

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <!-- Header -->
      <div style="text-align: center; border-bottom: 2px solid #1E40AF; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="margin: 0; color: #1E40AF; font-size: 24px;">MEDICAL PRESCRIPTION</h1>
        <p style="margin: 5px 0; font-size: 12px; color: #666;">Generated: ${today} | Specialty: ${specialty?.label || 'Internal Medicine'}</p>
      </div>

      <!-- Patient Demographics -->
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 14px; color: #1E40AF; border-bottom: 1px solid #1E40AF; padding-bottom: 5px;">PATIENT INFORMATION</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tr>
            <td style="padding: 5px; border: 1px solid #ddd; font-weight: bold;">Name:</td>
            <td style="padding: 5px; border: 1px solid #ddd;">${input.name || 'N/A'}</td>
            <td style="padding: 5px; border: 1px solid #ddd; font-weight: bold;">Age:</td>
            <td style="padding: 5px; border: 1px solid #ddd;">${input.age || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #ddd; font-weight: bold;">Gender:</td>
            <td style="padding: 5px; border: 1px solid #ddd;">${input.gender || 'N/A'}</td>
            <td style="padding: 5px; border: 1px solid #ddd; font-weight: bold;">Occupation:</td>
            <td style="padding: 5px; border: 1px solid #ddd;">${input.occupation || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #ddd; font-weight: bold;">Comorbidities:</td>
            <td colspan="3" style="padding: 5px; border: 1px solid #ddd;">${input.comorbidities || 'None reported'}</td>
          </tr>
        </table>
      </div>

      <!-- Chief Complaint -->
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 14px; color: #1E40AF; border-bottom: 1px solid #1E40AF; padding-bottom: 5px;">CHIEF COMPLAINT & HISTORY</h2>
        <p style="margin-top: 10px;"><strong>Complaint:</strong> ${input.chief_complaint || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>Duration:</strong> ${input.duration || 'N/A'}</p>
      </div>

      <!-- PMH & Allergies -->
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 14px; color: #1E40AF; border-bottom: 1px solid #1E40AF; padding-bottom: 5px;">PAST MEDICAL HISTORY & ALLERGIES</h2>
        <p style="margin-top: 10px;"><strong>PMH:</strong> ${input.past_medical_history || 'None reported'}</p>
        <p style="margin: 5px 0; color: #DC2626; font-weight: bold;"><strong>Allergies:</strong> ${input.allergies || 'NKDA'}</p>
      </div>

      <!-- Clinical Findings -->
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 14px; color: #1E40AF; border-bottom: 1px solid #1E40AF; padding-bottom: 5px;">CLINICAL FINDINGS</h2>
        <p style="margin-top: 10px;">${input.clinical_findings || 'Not documented'}</p>
      </div>

      <!-- Diagnosis -->
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 14px; color: #1E40AF; border-bottom: 1px solid #1E40AF; padding-bottom: 5px;">DIAGNOSIS & ASSESSMENT</h2>
        <p style="margin-top: 10px;"><strong>Primary:</strong> <span style="color: #1E40AF;">${rx.primary_diagnosis}</span></p>
        ${rx.secondary_diagnoses?.length ? `<p style="margin: 5px 0;"><strong>Secondary:</strong><br>${rx.secondary_diagnoses.map(d => `• ${d}`).join('<br>')}</p>` : ''}
        <p style="margin: 5px 0;"><strong>Urgency:</strong> <span style="color: ${rx.urgency === 'Emergency' ? '#DC2626' : rx.urgency === 'Urgent' ? '#EA580C' : '#059669'}; font-weight: bold;">${rx.urgency}</span></p>
        <p style="margin: 5px 0; font-style: italic; color: #666;"><strong>Summary:</strong> ${rx.clinical_summary}</p>
      </div>

      <!-- Medications -->
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 14px; color: #1E40AF; border-bottom: 1px solid #1E40AF; padding-bottom: 5px;">MEDICATIONS & PRESCRIPTIONS</h2>
        ${rx.medications?.length ? rx.medications.map((med, idx) => `
          <div style="margin-top: 10px; padding: 10px; border-left: 3px solid #1E40AF; background-color: #f9f9f9;">
            <p style="margin: 0; font-weight: bold;">${idx + 1}. ${med.name}</p>
            <p style="margin: 5px 0; font-size: 12px;"><strong>Dose:</strong> ${med.dose} | <strong>Route:</strong> ${med.route} | <strong>Frequency:</strong> ${med.frequency}</p>
            <p style="margin: 5px 0; font-size: 12px;"><strong>Duration:</strong> ${med.duration}</p>
            <p style="margin: 5px 0; font-size: 12px;"><strong>Indication:</strong> ${med.indication}</p>
            <p style="margin: 5px 0; font-size: 12px; color: #DC2626;"><strong>Cautions:</strong> ${med.caution}</p>
            <p style="margin: 5px 0; font-size: 12px; color: #0891B2;"><strong>Monitor:</strong> ${med.monitoring}</p>
          </div>
        `).join('') : '<p style="font-style: italic; color: #666;">No medications prescribed</p>'}
      </div>

      <!-- Drug Interactions -->
      ${rx.drug_interactions?.length ? `
        <div style="margin-bottom: 20px; padding: 10px; background-color: #FEE2E2; border-left: 3px solid #DC2626;">
          <h2 style="font-size: 14px; color: #DC2626; margin-top: 0;">DRUG INTERACTIONS & CONTRAINDICATIONS</h2>
          ${rx.drug_interactions.map(d => `<p style="margin: 5px 0; font-size: 12px;">⚠ ${d}</p>`).join('')}
        </div>
      ` : ''}

      <!-- Non-pharmacological -->
      ${rx.non_pharmacological?.length ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 14px; color: #1E40AF; border-bottom: 1px solid #1E40AF; padding-bottom: 5px;">NON-PHARMACOLOGICAL MANAGEMENT</h2>
          ${rx.non_pharmacological.map(rec => `<p style="margin: 5px 0; font-size: 12px;">• ${rec}</p>`).join('')}
        </div>
      ` : ''}

      <!-- Investigations -->
      ${rx.investigations?.length ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 14px; color: #1E40AF; border-bottom: 1px solid #1E40AF; padding-bottom: 5px;">INVESTIGATIONS & MONITORING</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px;">
            <tr style="background-color: #1E40AF; color: white;">
              <th style="padding: 5px; border: 1px solid #ddd;">Test</th>
              <th style="padding: 5px; border: 1px solid #ddd;">Reason</th>
              <th style="padding: 5px; border: 1px solid #ddd;">Timeline</th>
              <th style="padding: 5px; border: 1px solid #ddd;">Priority</th>
            </tr>
            ${rx.investigations.map(inv => `
              <tr>
                <td style="padding: 5px; border: 1px solid #ddd;">${inv.test}</td>
                <td style="padding: 5px; border: 1px solid #ddd;">${inv.reason}</td>
                <td style="padding: 5px; border: 1px solid #ddd;">${inv.when}</td>
                <td style="padding: 5px; border: 1px solid #ddd;">${inv.priority || 'Routine'}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      ` : ''}

      <!-- Follow-up -->
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 14px; color: #1E40AF; border-bottom: 1px solid #1E40AF; padding-bottom: 5px;">FOLLOW-UP PLAN</h2>
        <p style="margin-top: 10px;"><strong>Recommended Follow-up:</strong> ${rx.follow_up_weeks} weeks</p>
        <p style="margin: 5px 0;"><strong>Instructions:</strong> ${rx.follow_up_advice}</p>
      </div>

      <!-- Patient Education -->
      ${rx.patient_education?.length ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 14px; color: #1E40AF; border-bottom: 1px solid #1E40AF; padding-bottom: 5px;">PATIENT EDUCATION</h2>
          ${rx.patient_education.map(edu => `<p style="margin: 5px 0; font-size: 12px;">• ${edu}</p>`).join('')}
        </div>
      ` : ''}

      <!-- Warning Signs -->
      ${rx.warning_signs?.length ? `
        <div style="margin-bottom: 20px; padding: 10px; background-color: #FEE2E2; border-left: 3px solid #DC2626;">
          <h2 style="font-size: 14px; color: #DC2626; margin-top: 0;">RED FLAGS - SEEK IMMEDIATE MEDICAL ATTENTION</h2>
          ${rx.warning_signs.map(sign => `<p style="margin: 5px 0; font-size: 12px;">⚠ ${sign}</p>`).join('')}
        </div>
      ` : ''}

      <!-- Referral -->
      ${rx.referral ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 14px; color: #1E40AF; border-bottom: 1px solid #1E40AF; padding-bottom: 5px;">SPECIALIST REFERRAL</h2>
          <p style="margin-top: 10px;">${rx.referral}</p>
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="border-top: 2px solid #1E40AF; padding-top: 15px; margin-top: 30px;">
        <h3 style="font-size: 12px; color: #333; margin-bottom: 10px;">DISCLAIMER</h3>
        <p style="font-size: 11px; color: #666; font-style: italic; margin: 5px 0;">${rx.disclaimer}</p>
        <p style="font-size: 11px; color: #666; margin: 5px 0;"><strong>AI Confidence Score:</strong> ${rx.confidence}%</p>
        <p style="font-size: 10px; color: #999; text-align: center; margin-top: 10px;">Generated by MedScribe IM on ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;
}
