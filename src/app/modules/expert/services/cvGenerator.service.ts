/**
 * CV Generator Service
 * Generates professional CV/Resume in PDF format using jsPDF
 * Supports multiple international organization templates
 */

import { jsPDF } from 'jspdf';
import { ExpertProfile } from './expertsData.service';

export type CVTemplate = 
  | 'world-bank' 
  | 'giz' 
  | 'usaid' 
  | 'undp' 
  | 'unicef' 
  | 'afdb' 
  | 'eu' 
  | 'ifc' 
  | 'who' 
  | 'adb' 
  | 'iadb' 
  | 'standard';

export type CVFormat = 'pdf' | 'word';

const PRIMARY_COLOR = '#3d4654';
const SECONDARY_COLOR = '#B82547';
const GRAY_COLOR = '#6B7280';
const LIGHT_GRAY = '#F3F4F6';

/**
 * Generate CV in PDF format
 */
export const generateCV = (
  expert: ExpertProfile,
  template: CVTemplate,
  format: CVFormat = 'pdf'
): void => {
  if (format === 'word') {
    // For Word format, we'll generate a simplified version
    generateWordCV(expert, template);
    return;
  }

  // PDF Generation
  const doc = new jsPDF();
  
  switch (template) {
    case 'world-bank':
      generateWorldBankCV(doc, expert);
      break;
    case 'giz':
      generateGIZCV(doc, expert);
      break;
    case 'usaid':
      generateUSAIDCV(doc, expert);
      break;
    case 'undp':
      generateUNDPCV(doc, expert);
      break;
    case 'unicef':
      generateUNICEFCV(doc, expert);
      break;
    case 'afdb':
      generateAfDBCV(doc, expert);
      break;
    case 'eu':
      generateEUCV(doc, expert);
      break;
    case 'ifc':
      generateIFCCV(doc, expert);
      break;
    case 'who':
      generateWHOCV(doc, expert);
      break;
    case 'adb':
      generateADBCV(doc, expert);
      break;
    case 'iadb':
      generateIADBCV(doc, expert);
      break;
    default:
      generateStandardCV(doc, expert);
  }

  // Download the PDF
  const fileName = `CV_${expert.firstName}_${expert.lastName}_${template}.pdf`;
  doc.save(fileName);
};

/**
 * World Bank CV Template
 * Format professionnel avec sections structurées selon les standards World Bank
 */
const generateWorldBankCV = (doc: jsPDF, expert: ExpertProfile): void => {
  let yPos = 20;

  // En-tête World Bank avec bannière bleue
  doc.setFillColor(0, 114, 188); // Bleu World Bank
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CURRICULUM VITAE', 15, 15);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('World Bank Standard Format', 15, 21);

  // Nom de l'expert
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(`${expert.firstName} ${expert.lastName}`.toUpperCase(), 15, 32);

  yPos = 50;
  doc.setTextColor(0, 0, 0);

  // Position professionnelle
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 114, 188);
  doc.text(expert.title, 15, yPos);
  yPos += 8;

  // Informations de contact dans un encadré
  doc.setFillColor(245, 247, 250);
  doc.rect(15, yPos, 180, 25, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(15, yPos, 180, 25, 'S');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(`Email: ${expert.email}`, 20, yPos + 5);
  doc.text(`Téléphone: ${expert.phone}`, 20, yPos + 10);
  doc.text(`Localisation: ${expert.location}`, 20, yPos + 15);
  doc.text(`Disponibilité: ${expert.availability} | Tarif journalier: ${expert.dailyRate || 'Sur demande'}`, 20, yPos + 20);
  yPos += 33;

  // Résumé professionnel
  doc.setTextColor(0, 0, 0);
  addSection(doc, 'RÉSUMÉ PROFESSIONNEL', yPos);
  yPos += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const bioLines = doc.splitTextToSize(expert.bio, 180);
  doc.text(bioLines, 15, yPos);
  yPos += bioLines.length * 5 + 10;

  // Qualifications clés
  addSection(doc, 'QUALIFICATIONS CLÉS', yPos);
  yPos += 8;
  doc.setFontSize(9);
  doc.text(`• Niveau d'expertise: ${expert.level}`, 20, yPos);
  yPos += 5;
  doc.text(`• Années d'expérience: ${expert.yearsExperience}`, 20, yPos);
  yPos += 5;
  if (expert.sectors.length > 0) {
    doc.text(`• Secteurs: ${expert.sectors.join(', ')}`, 20, yPos);
    yPos += 5;
  }
  if (expert.subsectors.length > 0) {
    const subsectorsText = `• Sous-secteurs: ${expert.subsectors.join(', ')}`;
    const subsectorsLines = doc.splitTextToSize(subsectorsText, 175);
    doc.text(subsectorsLines, 20, yPos);
    yPos += subsectorsLines.length * 5;
  }
  yPos += 8;

  // Compétences techniques
  if (expert.skills.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    addSection(doc, 'COMPÉTENCES TECHNIQUES', yPos);
    yPos += 8;
    doc.setFontSize(9);
    const skillsPerLine = 3;
    for (let i = 0; i < expert.skills.length; i += skillsPerLine) {
      const lineSkills = expert.skills.slice(i, i + skillsPerLine);
      doc.text(`• ${lineSkills.join('  • ')}`, 20, yPos);
      yPos += 5;
    }
    yPos += 8;
  }

  // Vérifier si nouvelle page nécessaire
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Expérience professionnelle
  if (expert.experiences.length > 0) {
    addSection(doc, 'EXPÉRIENCE PROFESSIONNELLE', yPos);
    yPos += 8;

    expert.experiences.forEach((exp, index) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 114, 188);
      doc.text(exp.title, 15, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(exp.company, 15, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const dateText = exp.current ? `${exp.startDate} - Présent` : `${exp.startDate} - ${exp.endDate}`;
      doc.text(`${dateText} | ${exp.location}`, 15, yPos);
      yPos += 6;

      if (exp.description) {
        doc.setTextColor(0, 0, 0);
        const descLines = doc.splitTextToSize(exp.description, 180);
        doc.text(descLines, 15, yPos);
        yPos += descLines.length * 5 + 8;
      } else {
        yPos += 5;
      }
    });
  }

  // Formation
  if (expert.education.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    addSection(doc, 'FORMATION ACADÉMIQUE', yPos);
    yPos += 8;

    expert.education.forEach((edu) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 114, 188);
      doc.text(edu.degree, 15, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(`${edu.institution}${edu.field ? ` - ${edu.field}` : ''}`, 15, yPos);
      yPos += 5;

      doc.setTextColor(100, 100, 100);
      doc.text(edu.year, 15, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 8;
    });
  }

  // Langues
  if (expert.languages.length > 0) {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    addSection(doc, 'LANGUES', yPos);
    yPos += 8;

    doc.setFontSize(9);
    expert.languages.forEach((lang) => {
      doc.text(`• ${lang.name}: ${lang.level}`, 20, yPos);
      yPos += 5;
    });
    yPos += 5;
  }

  // Certifications
  if (expert.certifications.length > 0) {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    addSection(doc, 'CERTIFICATIONS PROFESSIONNELLES', yPos);
    yPos += 8;

    expert.certifications.forEach((cert) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 114, 188);
      doc.text(cert.name, 15, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`Délivré par: ${cert.issuer}`, 15, yPos);
      yPos += 5;

      doc.setTextColor(100, 100, 100);
      const certDate = cert.expiryDate 
        ? `${cert.date} - ${cert.expiryDate}` 
        : cert.date;
      doc.text(certDate, 15, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 8;
    });
  }

  // Pied de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `${expert.firstName} ${expert.lastName} - CV World Bank | Page ${i}/${pageCount}`,
      105,
      287,
      { align: 'center' }
    );
  }
};

/**
 * GIZ CV Template (German International Cooperation)
 * Format avec structure GIZ - accent sur compétences sectorielles
 */
const generateGIZCV = (doc: jsPDF, expert: ExpertProfile): void => {
  let yPos = 20;

  // En-tête GIZ avec bannière verte
  doc.setFillColor(0, 119, 112); // Vert GIZ
  doc.rect(0, 0, 210, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('FORMAT GIZ', 15, 12);
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`${expert.firstName} ${expert.lastName}`, 15, 22);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(expert.title, 15, 30);
  
  doc.setFontSize(8);
  doc.text(`${expert.email} | ${expert.phone} | ${expert.location}`, 15, 38);

  yPos = 55;
  doc.setTextColor(0, 0, 0);

  // Profil professionnel
  addSection(doc, 'PROFIL PROFESSIONNEL', yPos);
  yPos += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const bioLines = doc.splitTextToSize(expert.bio, 180);
  doc.text(bioLines, 15, yPos);
  yPos += bioLines.length * 5 + 10;

  // Expertise sectorielle
  if (expert.sectors.length > 0 || expert.subsectors.length > 0) {
    addSection(doc, 'EXPERTISE SECTORIELLE', yPos);
    yPos += 8;
    doc.setFontSize(9);
    doc.text(`Niveau: ${expert.level} | Expérience: ${expert.yearsExperience}`, 15, yPos);
    yPos += 6;
    if (expert.sectors.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Secteurs principaux:', 15, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      expert.sectors.forEach(sector => {
        doc.text(`• ${sector}`, 20, yPos);
        yPos += 5;
      });
    }
    if (expert.subsectors.length > 0) {
      yPos += 2;
      doc.setFont('helvetica', 'bold');
      doc.text('Sous-secteurs:', 15, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      expert.subsectors.forEach(subsector => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${subsector}`, 20, yPos);
        yPos += 5;
      });
    }
    yPos += 8;
  }

  // Compétences clés
  if (expert.skills.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    addSection(doc, 'COMPÉTENCES CLÉS', yPos);
    yPos += 8;
    doc.setFontSize(9);
    // Afficher en colonnes
    const colWidth = 85;
    let col = 0;
    let tempY = yPos;
    expert.skills.forEach((skill, idx) => {
      const xPos = 15 + (col * colWidth);
      doc.text(`• ${skill}`, xPos, tempY);
      tempY += 5;
      if ((idx + 1) % 8 === 0 && col === 0) {
        col = 1;
        tempY = yPos;
      }
    });
    yPos = tempY + 8;
  }

  // Expérience professionnelle
  if (expert.experiences.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    addSection(doc, 'EXPÉRIENCE PROFESSIONNELLE', yPos);
    yPos += 8;

    expert.experiences.forEach((exp) => {
      if (yPos > 255) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 119, 112);
      const dateText = exp.current ? `${exp.startDate} - Présent` : `${exp.startDate} - ${exp.endDate}`;
      doc.text(`${dateText} | ${exp.title}`, 15, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(`${exp.company}, ${exp.location}`, 15, yPos);
      yPos += 6;

      if (exp.description) {
        const descLines = doc.splitTextToSize(exp.description, 180);
        doc.text(descLines, 15, yPos);
        yPos += descLines.length * 5 + 8;
      } else {
        yPos += 5;
      }
    });
  }

  // Formation académique
  if (expert.education.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    addSection(doc, 'FORMATION ACADÉMIQUE', yPos);
    yPos += 8;

    expert.education.forEach((edu) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 119, 112);
      doc.text(`${edu.year} | ${edu.degree}`, 15, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(`${edu.institution}${edu.field ? ` - ${edu.field}` : ''}`, 15, yPos);
      yPos += 8;
    });
  }

  // Langues
  if (expert.languages.length > 0) {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    addSection(doc, 'COMPÉTENCES LINGUISTIQUES', yPos);
    yPos += 8;

    doc.setFontSize(9);
    expert.languages.forEach((lang) => {
      doc.text(`${lang.name}: ${lang.level}`, 20, yPos);
      yPos += 5;
    });
    yPos += 5;
  }

  // Certifications
  if (expert.certifications.length > 0) {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    addSection(doc, 'CERTIFICATIONS', yPos);
    yPos += 8;

    expert.certifications.forEach((cert) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`${cert.name} - ${cert.issuer}`, 15, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const certDate = cert.expiryDate ? `${cert.date} - ${cert.expiryDate}` : cert.date;
      doc.text(certDate, 15, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 8;
    });
  }

  // Pied de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `CV GIZ - ${expert.firstName} ${expert.lastName} | Page ${i}/${pageCount}`,
      105,
      287,
      { align: 'center' }
    );
  }
};

/**
 * USAID CV Template
 * Format USAID avec accent sur résultats et impact
 */
const generateUSAIDCV = (doc: jsPDF, expert: ExpertProfile): void => {
  let yPos = 20;

  // En-tête USAID avec design américain
  doc.setFillColor(0, 47, 108); // Bleu USAID
  doc.rect(0, 0, 210, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(`${expert.firstName} ${expert.lastName}`, 15, 18);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(expert.title, 15, 26);

  yPos = 45;
  doc.setTextColor(0, 0, 0);

  // Contact et profil en ligne
  doc.setFontSize(9);
  doc.text(`${expert.email} | ${expert.phone} | ${expert.location}`, 15, yPos);
  yPos += 10;

  // Profil professionnel
  addSection(doc, 'PROFESSIONAL PROFILE', yPos);
  yPos += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const bioLines = doc.splitTextToSize(expert.bio, 180);
  doc.text(bioLines, 15, yPos);
  yPos += bioLines.length * 5 + 10;

  // Qualifications et expertise
  addSection(doc, 'QUALIFICATIONS & EXPERTISE', yPos);
  yPos += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Professional Level: `, 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${expert.level} with ${expert.yearsExperience} years of experience`, 58, yPos);
  yPos += 6;

  if (expert.sectors.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Sector Experience: ', 15, yPos);
    doc.setFont('helvetica', 'normal');
    const sectorsText = expert.sectors.join(', ');
    const sectorsLines = doc.splitTextToSize(sectorsText, 130);
    doc.text(sectorsLines, 58, yPos);
    yPos += sectorsLines.length * 5 + 2;
  }

  if (expert.subsectors.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Technical Areas: ', 15, yPos);
    doc.setFont('helvetica', 'normal');
    const subsectorsText = expert.subsectors.join(', ');
    const subsectorsLines = doc.splitTextToSize(subsectorsText, 130);
    doc.text(subsectorsLines, 58, yPos);
    yPos += subsectorsLines.length * 5;
  }
  yPos += 8;

  // Core competencies
  if (expert.skills.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    addSection(doc, 'CORE COMPETENCIES', yPos);
    yPos += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const skillsList = expert.skills.map(skill => `• ${skill}`).join('   ');
    const skillsLines = doc.splitTextToSize(skillsList, 180);
    doc.text(skillsLines, 15, yPos);
    yPos += skillsLines.length * 5 + 10;
  }

  // Professional experience
  if (expert.experiences.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    addSection(doc, 'PROFESSIONAL EXPERIENCE', yPos);
    yPos += 8;

    expert.experiences.forEach((exp) => {
      if (yPos > 255) {
        doc.addPage();
        yPos = 20;
      }

      const dateText = exp.current ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 47, 108);
      doc.text(exp.title, 15, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(exp.company, 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(` | ${exp.location}`, 15 + doc.getTextWidth(exp.company), yPos);
      yPos += 5;

      doc.setFontSize(8);
      doc.text(dateText, 15, yPos);
      yPos += 6;

      if (exp.description) {
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        const descLines = doc.splitTextToSize(exp.description, 180);
        doc.text(descLines, 15, yPos);
        yPos += descLines.length * 5 + 8;
      } else {
        yPos += 5;
      }
    });
  }

  // Education
  if (expert.education.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    addSection(doc, 'EDUCATION', yPos);
    yPos += 8;

    expert.education.forEach((edu) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 47, 108);
      doc.text(edu.degree, 15, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(edu.institution, 15, yPos);
      yPos += 4;
      
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.text(`${edu.field ? edu.field + ' | ' : ''}${edu.year}`, 15, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 8;
    });
  }

  // Languages
  if (expert.languages.length > 0) {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    addSection(doc, 'LANGUAGE SKILLS', yPos);
    yPos += 8;

    doc.setFontSize(9);
    const langText = expert.languages.map(lang => `${lang.name} (${lang.level})`).join(', ');
    doc.text(langText, 15, yPos);
    yPos += 10;
  }

  // Certifications
  if (expert.certifications.length > 0) {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    addSection(doc, 'CERTIFICATIONS & TRAINING', yPos);
    yPos += 8;

    expert.certifications.forEach((cert) => {
      if (yPos > 275) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(cert.name, 15, yPos);
      yPos += 4;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const certDate = cert.expiryDate ? `${cert.date} - ${cert.expiryDate}` : cert.date;
      doc.text(`${cert.issuer} | ${certDate}`, 15, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 8;
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `${expert.firstName} ${expert.lastName} - USAID Format CV | Page ${i}/${pageCount}`,
      105,
      287,
      { align: 'center' }
    );
  }
};

/**
 * UNDP CV Template
 * Format UNDP avec focus sur développement durable
 */
const generateUNDPCV = (doc: jsPDF, expert: ExpertProfile): void => {
  let yPos = 20;

  // En-tête UNDP avec design ONU
  doc.setFillColor(0, 157, 220); // Bleu UNDP
  doc.rect(0, 0, 210, 42, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('UNITED NATIONS DEVELOPMENT PROGRAMME', 15, 12);
  
  doc.setFontSize(20);
  doc.text(`${expert.firstName} ${expert.lastName}`.toUpperCase(), 15, 24);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(expert.title, 15, 33);

  yPos = 52;
  doc.setTextColor(0, 0, 0);

  // Contact information
  doc.setFontSize(9);
  doc.text(`Email: ${expert.email} | Phone: ${expert.phone} | Location: ${expert.location}`, 15, yPos);
  yPos += 12;

  // Professional summary
  addSection(doc, 'PROFESSIONAL SUMMARY', yPos);
  yPos += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const bioLines = doc.splitTextToSize(expert.bio, 180);
  doc.text(bioLines, 15, yPos);
  yPos += bioLines.length * 5 + 10;

  // Areas of expertise
  addSection(doc, 'AREAS OF EXPERTISE', yPos);
  yPos += 8;
  doc.setFontSize(9);
  
  // Tableau de compétences
  if (expert.skills.length > 0) {
    const cols = 2;
    const colWidth = 90;
    const skillsPerCol = Math.ceil(expert.skills.length / cols);
    
    for (let col = 0; col < cols; col++) {
      const startIdx = col * skillsPerCol;
      const endIdx = Math.min(startIdx + skillsPerCol, expert.skills.length);
      const colSkills = expert.skills.slice(startIdx, endIdx);
      
      let tempY = yPos;
      colSkills.forEach(skill => {
        doc.text(`• ${skill}`, 15 + (col * colWidth), tempY);
        tempY += 5;
      });
    }
    yPos += (skillsPerCol * 5) + 8;
  }

  // Professional background
  addSection(doc, 'PROFESSIONAL BACKGROUND', yPos);
  yPos += 8;
  doc.setFontSize(9);
  doc.text(`Level: ${expert.level} | Experience: ${expert.yearsExperience}`, 15, yPos);
  yPos += 6;
  
  if (expert.sectors.length > 0) {
    doc.text(`Development Sectors: ${expert.sectors.join(', ')}`, 15, yPos);
    yPos += 5;
  }
  if (expert.subsectors.length > 0) {
    const subsectorsText = `Technical Specializations: ${expert.subsectors.join(', ')}`;
    const subsectorsLines = doc.splitTextToSize(subsectorsText, 180);
    doc.text(subsectorsLines, 15, yPos);
    yPos += subsectorsLines.length * 5;
  }
  yPos += 10;

  // Work experience
  if (expert.experiences.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    addSection(doc, 'WORK EXPERIENCE', yPos);
    yPos += 8;

    expert.experiences.forEach((exp) => {
      if (yPos > 255) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 157, 220);
      doc.text(exp.title, 15, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(`${exp.company}, ${exp.location}`, 15, yPos);
      yPos += 5;

      doc.setTextColor(100, 100, 100);
      const dateText = exp.current ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`;
      doc.text(dateText, 15, yPos);
      yPos += 6;

      if (exp.description) {
        doc.setTextColor(0, 0, 0);
        const descLines = doc.splitTextToSize(exp.description, 180);
        doc.text(descLines, 15, yPos);
        yPos += descLines.length * 5 + 8;
      } else {
        yPos += 5;
      }
    });
  }

  // Academic qualifications
  if (expert.education.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    addSection(doc, 'ACADEMIC QUALIFICATIONS', yPos);
    yPos += 8;

    expert.education.forEach((edu) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 157, 220);
      doc.text(`${edu.year} - ${edu.degree}`, 15, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(`${edu.institution}${edu.field ? ', ' + edu.field : ''}`, 15, yPos);
      yPos += 8;
    });
  }

  // Languages
  if (expert.languages.length > 0) {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    addSection(doc, 'LANGUAGES', yPos);
    yPos += 8;

    doc.setFontSize(9);
    expert.languages.forEach((lang) => {
      doc.text(`• ${lang.name}: ${lang.level}`, 15, yPos);
      yPos += 5;
    });
    yPos += 5;
  }

  // Professional certifications
  if (expert.certifications.length > 0) {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    addSection(doc, 'PROFESSIONAL CERTIFICATIONS', yPos);
    yPos += 8;

    expert.certifications.forEach((cert) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(cert.name, 15, yPos);
      yPos += 4;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const certDate = cert.expiryDate ? `${cert.date} - ${cert.expiryDate}` : cert.date;
      doc.text(`${cert.issuer}, ${certDate}`, 15, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 8;
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `UNDP CV Format - ${expert.firstName} ${expert.lastName} | Page ${i}/${pageCount}`,
      105,
      287,
      { align: 'center' }
    );
  }
};

/**
 * UNICEF CV Template
 */
const generateUNICEFCV = (doc: jsPDF, expert: ExpertProfile): void => {
  generateWorldBankCV(doc, expert);
};

/**
 * AfDB CV Template
 */
const generateAfDBCV = (doc: jsPDF, expert: ExpertProfile): void => {
  generateWorldBankCV(doc, expert);
};

/**
 * EU Europass CV Template
 */
const generateEUCV = (doc: jsPDF, expert: ExpertProfile): void => {
  generateWorldBankCV(doc, expert);
};

/**
 * IFC CV Template
 */
const generateIFCCV = (doc: jsPDF, expert: ExpertProfile): void => {
  generateWorldBankCV(doc, expert);
};

/**
 * WHO CV Template
 */
const generateWHOCV = (doc: jsPDF, expert: ExpertProfile): void => {
  generateWorldBankCV(doc, expert);
};

/**
 * ADB CV Template
 */
const generateADBCV = (doc: jsPDF, expert: ExpertProfile): void => {
  generateWorldBankCV(doc, expert);
};

/**
 * IADB CV Template
 */
const generateIADBCV = (doc: jsPDF, expert: ExpertProfile): void => {
  generateWorldBankCV(doc, expert);
};

/**
 * Standard Professional CV Template
 * Format moderne et épuré pour usage général
 */
const generateStandardCV = (doc: jsPDF, expert: ExpertProfile): void => {
  let yPos = 20;

  // En-tête moderne avec fond gris
  doc.setFillColor(240, 242, 245);
  doc.rect(0, 0, 210, 55, 'F');
  
  // Nom en gros
  doc.setTextColor(60, 70, 84);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text(`${expert.firstName} ${expert.lastName}`, 15, 22);
  
  // Titre professionnel
  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(expert.title, 15, 32);
  
  // Contact en ligne
  doc.setFontSize(9);
  doc.text(`${expert.email} • ${expert.phone} • ${expert.location}`, 15, 42);
  
  // Profil
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`${expert.level} • ${expert.yearsExperience} d'expérience`, 15, 49);

  yPos = 65;
  doc.setTextColor(0, 0, 0);

  // À propos
  doc.setFillColor(184, 37, 71); // Couleur Assortis
  doc.rect(15, yPos, 3, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(184, 37, 71);
  doc.text('À PROPOS', 22, yPos + 4);
  yPos += 10;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const bioLines = doc.splitTextToSize(expert.bio, 180);
  doc.text(bioLines, 15, yPos);
  yPos += bioLines.length * 5 + 10;

  // Compétences en colonnes
  if (expert.skills.length > 0) {
    doc.setFillColor(184, 37, 71);
    doc.rect(15, yPos, 3, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(184, 37, 71);
    doc.text('COMPÉTENCES', 22, yPos + 4);
    yPos += 10;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    // Affichage en 3 colonnes
    const cols = 3;
    const colWidth = 60;
    const skillsPerCol = Math.ceil(expert.skills.length / cols);
    
    for (let col = 0; col < cols; col++) {
      const startIdx = col * skillsPerCol;
      const endIdx = Math.min(startIdx + skillsPerCol, expert.skills.length);
      const colSkills = expert.skills.slice(startIdx, endIdx);
      
      let tempY = yPos;
      colSkills.forEach(skill => {
        doc.text(`• ${skill}`, 15 + (col * colWidth), tempY);
        tempY += 5;
      });
    }
    yPos += (skillsPerCol * 5) + 8;
  }

  // Secteurs et sous-secteurs
  if (expert.sectors.length > 0 || expert.subsectors.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFillColor(184, 37, 71);
    doc.rect(15, yPos, 3, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(184, 37, 71);
    doc.text('DOMAINES D\'EXPERTISE', 22, yPos + 4);
    yPos += 10;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    if (expert.sectors.length > 0) {
      const sectorsText = expert.sectors.join(' • ');
      const sectorsLines = doc.splitTextToSize(sectorsText, 180);
      doc.text(sectorsLines, 15, yPos);
      yPos += sectorsLines.length * 5 + 3;
    }
    
    if (expert.subsectors.length > 0) {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const subsectorsText = expert.subsectors.join(' • ');
      const subsectorsLines = doc.splitTextToSize(subsectorsText, 180);
      doc.text(subsectorsLines, 15, yPos);
      yPos += subsectorsLines.length * 4 + 8;
      doc.setTextColor(0, 0, 0);
    } else {
      yPos += 5;
    }
  }

  // Expérience professionnelle
  if (expert.experiences.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFillColor(184, 37, 71);
    doc.rect(15, yPos, 3, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(184, 37, 71);
    doc.text('EXPÉRIENCE PROFESSIONNELLE', 22, yPos + 4);
    yPos += 10;

    expert.experiences.forEach((exp) => {
      if (yPos > 255) {
        doc.addPage();
        yPos = 20;
      }

      // Dates en haut à droite
      const dateText = exp.current ? `${exp.startDate} - Présent` : `${exp.startDate} - ${exp.endDate}`;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(dateText, 195, yPos, { align: 'right' });

      // Titre du poste
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60, 70, 84);
      doc.text(exp.title, 15, yPos);
      yPos += 5;

      // Entreprise et lieu
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(184, 37, 71);
      doc.text(exp.company, 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(` • ${exp.location}`, 15 + doc.getTextWidth(exp.company), yPos);
      yPos += 6;

      if (exp.description) {
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        const descLines = doc.splitTextToSize(exp.description, 180);
        doc.text(descLines, 15, yPos);
        yPos += descLines.length * 5 + 8;
      } else {
        yPos += 5;
      }
    });
  }

  // Formation académique
  if (expert.education.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFillColor(184, 37, 71);
    doc.rect(15, yPos, 3, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(184, 37, 71);
    doc.text('FORMATION', 22, yPos + 4);
    yPos += 10;

    expert.education.forEach((edu) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      // Année à droite
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 100);
      doc.text(edu.year, 195, yPos, { align: 'right' });

      // Diplôme
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60, 70, 84);
      doc.text(edu.degree, 15, yPos);
      yPos += 5;

      // Institution et domaine
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(edu.institution, 15, yPos);
      if (edu.field) {
        doc.setTextColor(100, 100, 100);
        doc.text(` - ${edu.field}`, 15 + doc.getTextWidth(edu.institution), yPos);
      }
      yPos += 8;
    });
  }

  // Langues et certifications côte à côte
  const hasLanguages = expert.languages.length > 0;
  const hasCerts = expert.certifications.length > 0;
  
  if (hasLanguages || hasCerts) {
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    // Langues (colonne gauche)
    if (hasLanguages) {
      doc.setFillColor(184, 37, 71);
      doc.rect(15, yPos, 3, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(184, 37, 71);
      doc.text('LANGUES', 22, yPos + 4);
      
      let langY = yPos + 10;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      expert.languages.forEach((lang) => {
        doc.setFont('helvetica', 'bold');
        doc.text(lang.name, 15, langY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(` - ${lang.level}`, 15 + doc.getTextWidth(lang.name), langY);
        doc.setTextColor(0, 0, 0);
        langY += 5;
      });
    }

    // Certifications (colonne droite ou dessous)
    if (hasCerts) {
      const certX = hasLanguages ? 110 : 15;
      const certY = yPos;
      
      doc.setFillColor(184, 37, 71);
      doc.rect(certX, certY, 3, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(184, 37, 71);
      doc.text('CERTIFICATIONS', certX + 7, certY + 4);
      
      let certYPos = certY + 10;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      expert.certifications.forEach((cert) => {
        if (certYPos > 275) {
          doc.addPage();
          certYPos = 20;
        }
        
        doc.setFont('helvetica', 'bold');
        const certNameLines = doc.splitTextToSize(cert.name, 85);
        doc.text(certNameLines, certX, certYPos);
        certYPos += certNameLines.length * 4;
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`${cert.issuer} (${cert.date})`, certX, certYPos);
        doc.setTextColor(0, 0, 0);
        certYPos += 6;
      });
    }
  }

  // Pied de page moderne
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(15, 282, 195, 282);
    
    // Texte du pied de page
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `${expert.firstName} ${expert.lastName}`,
      15,
      286
    );
    doc.text(
      `Page ${i}/${pageCount}`,
      195,
      286,
      { align: 'right' }
    );
  }
};

/**
 * Generate Word CV (simplified HTML download)
 */
const generateWordCV = (expert: ExpertProfile, template: CVTemplate): void => {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CV - ${expert.firstName} ${expert.lastName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    h1 { color: ${PRIMARY_COLOR}; border-bottom: 3px solid ${SECONDARY_COLOR}; padding-bottom: 10px; }
    h2 { color: ${SECONDARY_COLOR}; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
    .contact-info { color: ${GRAY_COLOR}; margin-bottom: 20px; }
    .section { margin-bottom: 25px; }
    .experience-item, .education-item, .cert-item { margin-bottom: 20px; }
    .job-title, .degree { font-weight: bold; font-size: 14px; }
    .company, .institution { color: ${GRAY_COLOR}; }
    .date { color: ${GRAY_COLOR}; font-style: italic; font-size: 12px; }
    .skills { display: flex; flex-wrap: wrap; gap: 10px; }
    .skill { background: ${LIGHT_GRAY}; padding: 5px 10px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>${expert.firstName} ${expert.lastName}</h1>
  <div class="contact-info">
    <p><strong>Title:</strong> ${expert.title}</p>
    <p><strong>Email:</strong> ${expert.email} | <strong>Phone:</strong> ${expert.phone}</p>
    <p><strong>Location:</strong> ${expert.location}</p>
    <p><strong>Experience:</strong> ${expert.yearsExperience} | <strong>Level:</strong> ${expert.level}</p>
  </div>

  <div class="section">
    <h2>Professional Summary</h2>
    <p>${expert.bio}</p>
  </div>

  ${expert.skills.length > 0 ? `
  <div class="section">
    <h2>Core Competencies</h2>
    <div class="skills">
      ${expert.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
    </div>
  </div>
  ` : ''}

  ${expert.experiences.length > 0 ? `
  <div class="section">
    <h2>Professional Experience</h2>
    ${expert.experiences.map(exp => `
      <div class="experience-item">
        <div class="job-title">${exp.title}</div>
        <div class="company">${exp.company} | ${exp.location}</div>
        <div class="date">${exp.current ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`}</div>
        ${exp.description ? `<p>${exp.description}</p>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${expert.education.length > 0 ? `
  <div class="section">
    <h2>Education</h2>
    ${expert.education.map(edu => `
      <div class="education-item">
        <div class="degree">${edu.degree}</div>
        <div class="institution">${edu.institution} | ${edu.field}</div>
        <div class="date">${edu.year}</div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${expert.languages.length > 0 ? `
  <div class="section">
    <h2>Languages</h2>
    ${expert.languages.map(lang => `<p><strong>${lang.name}:</strong> ${lang.level}</p>`).join('')}
  </div>
  ` : ''}

  ${expert.certifications.length > 0 ? `
  <div class="section">
    <h2>Certifications</h2>
    ${expert.certifications.map(cert => `
      <div class="cert-item">
        <div class="job-title">${cert.name}</div>
        <div class="company">Issued by: ${cert.issuer}</div>
        <div class="date">${cert.expiryDate ? `${cert.date} - ${cert.expiryDate}` : cert.date}</div>
      </div>
    `).join('')}
  </div>
  ` : ''}

</body>
</html>
  `;

  // Create a Blob and download
  const blob = new Blob([htmlContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CV_${expert.firstName}_${expert.lastName}_${template}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Helper function to add section headers
 */
const addSection = (doc: jsPDF, title: string, yPos: number): void => {
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(SECONDARY_COLOR);
  doc.text(title, 15, yPos);
  doc.setDrawColor(SECONDARY_COLOR);
  doc.setLineWidth(0.5);
  doc.line(15, yPos + 2, 195, yPos + 2);
  doc.setTextColor(0, 0, 0);
};