import { jsPDF } from 'jspdf';
import { ProjectReferenceFicheDTO } from '@app/types/project-reference-fiche.dto';

const safeText = (value?: string): string => value?.trim() || '-';

const sanitizeFilePart = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'project';
};

const writeKeyValue = (doc: jsPDF, y: number, label: string, value: string): number => {
  doc.setFont('helvetica', 'bold');
  doc.text(`${label}:`, 14, y);
  doc.setFont('helvetica', 'normal');

  const wrapped = doc.splitTextToSize(value, 130);
  doc.text(wrapped, 70, y);
  return y + Math.max(8, wrapped.length * 6);
};

export const downloadProjectReferenceFichePdf = (
  fiche: ProjectReferenceFicheDTO,
  labels: {
    title: string;
    sectionDetails: string;
    sectionMetadata: string;
    sectionDates: string;
    fieldReferenceNumber: string;
    fieldProjectTitle: string;
    fieldDescription: string;
    fieldOrganization: string;
    fieldSector: string;
    fieldSubSector: string;
    fieldCountry: string;
    fieldDonor: string;
    fieldBudget: string;
    fieldProjectStatus: string;
    fieldState: string;
    fieldStartDate: string;
    fieldEndDate: string;
    fieldDeadline: string;
    notProvided: string;
  }
) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = 16;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(labels.title, 14, y);

  y += 10;
  doc.setDrawColor(220, 220, 220);
  doc.line(14, y, 196, y);
  y += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(labels.sectionDetails, 14, y);
  y += 8;

  doc.setFontSize(10);
  y = writeKeyValue(doc, y, labels.fieldReferenceNumber, safeText(fiche.referenceNumber));
  y = writeKeyValue(doc, y, labels.fieldProjectTitle, safeText(fiche.title));
  y = writeKeyValue(doc, y, labels.fieldDescription, safeText(fiche.description));
  y = writeKeyValue(doc, y, labels.fieldOrganization, safeText(fiche.organizationName));

  y += 4;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(labels.sectionMetadata, 14, y);
  y += 8;
  doc.setFontSize(10);

  y = writeKeyValue(doc, y, labels.fieldSector, safeText(fiche.sector));
  y = writeKeyValue(doc, y, labels.fieldSubSector, safeText(fiche.subSector || labels.notProvided));
  y = writeKeyValue(doc, y, labels.fieldCountry, safeText(fiche.country));
  y = writeKeyValue(doc, y, labels.fieldDonor, safeText(fiche.donor || labels.notProvided));
  y = writeKeyValue(doc, y, labels.fieldBudget, safeText(fiche.budgetFormatted || labels.notProvided));
  y = writeKeyValue(doc, y, labels.fieldProjectStatus, safeText(fiche.projectStatus));
  y = writeKeyValue(doc, y, labels.fieldState, safeText(fiche.referenceState));

  y += 4;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(labels.sectionDates, 14, y);
  y += 8;
  doc.setFontSize(10);

  y = writeKeyValue(doc, y, labels.fieldStartDate, safeText(fiche.startDate));
  y = writeKeyValue(doc, y, labels.fieldEndDate, safeText(fiche.endDate));
  writeKeyValue(doc, y, labels.fieldDeadline, safeText(fiche.deadline || labels.notProvided));

  const fileName = `project-fiche-${sanitizeFilePart(fiche.title)}.pdf`;
  doc.save(fileName);
};
