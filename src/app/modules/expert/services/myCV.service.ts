import {
  CVFormatType,
  CVLanguageType,
  ExpertMyCVDashboardDTO,
  ExpertMyCVDocumentDTO,
  ExpertMyCVExperienceLinkDTO,
  ExpertMyCVInfoDTO,
  ExpertMyCVSectionDTO,
  ExpertMyCVUpdatePayloadDTO,
} from '@app/modules/expert/types/my-cv.dto';

const nowIso = new Date('2026-04-09T09:30:00.000Z').toISOString();

const defaultSections = (
  format: CVFormatType,
  language: CVLanguageType
): ExpertMyCVSectionDTO[] => {
  const suffix = `[${format.toUpperCase()} | ${language.toUpperCase()}]`;

  return [
    {
      id: 'personal-information',
      content: [
        `${suffix} Aziz M. - Senior Infrastructure Specialist`,
        'Email: aziz.expert@example.com | Phone: +212 600 000 000',
      ],
    },
    {
      id: 'education',
      content: [
        'MSc Civil Engineering - Ecole Hassania des Travaux Publics',
        'BSc Structural Engineering - University of Rabat',
      ],
    },
    {
      id: 'training',
      content: [
        'FIDIC Contract Management Certification',
        'Public Procurement and Bid Management',
      ],
    },
    {
      id: 'professional-experience',
      content: [
        '15+ years of consulting in transport, urban development, and donor-funded projects.',
      ],
    },
    {
      id: 'employment-record-projects',
      content: [
        'Team Lead - Regional Infrastructure Program (2022-2025)',
        'Senior Consultant - City Mobility Upgrade Project (2019-2022)',
      ],
    },
    {
      id: 'language-skills',
      content: ['English: Fluent | French: Fluent | Spanish: Intermediate'],
    },
    {
      id: 'other',
      content: ['Available for missions from September 2026.'],
    },
    {
      id: 'permanent-address',
      content: ['35 Avenue Atlas, Rabat, Morocco'],
    },
    {
      id: 'current-address',
      content: ['Remote with availability for international travel.'],
    },
  ];
};

let documentsStore: ExpertMyCVDocumentDTO[] = [
  {
    id: 'doc-1',
    name: 'passport.pdf',
    category: 'private',
    uploadedAt: nowIso,
    sizeLabel: '1.2 MB',
  },
  {
    id: 'doc-2',
    name: 'project-report-mobility.pdf',
    category: 'report',
    uploadedAt: nowIso,
    sizeLabel: '2.7 MB',
  },
  {
    id: 'doc-3',
    name: 'assortis-cv-2026.pdf',
    category: 'cv',
    uploadedAt: nowIso,
    sizeLabel: '820 KB',
  },
];

const experienceLinksStore: ExpertMyCVExperienceLinkDTO[] = [
  {
    id: 'link-1',
    experienceTitle: 'Regional Infrastructure Program Team Lead',
    projectTitle: 'Awarded Lot 4 - Transport Planning Assistance',
    confidenceScore: 92,
  },
  {
    id: 'link-2',
    experienceTitle: 'Senior Consultant, Urban Mobility Upgrade',
    projectTitle: 'Awarded TA - City Mobility Implementation Support',
    confidenceScore: 88,
  },
];

let dashboardStore: ExpertMyCVDashboardDTO = {
  kpis: {
    views: 246,
    downloads: 71,
    relevanceScore: 84,
  },
  recentActivity: [
    {
      id: 'a-1',
      type: 'download',
      organizationName: 'Global Infrastructure Advisory',
      happenedAt: '2026-04-08T14:00:00.000Z',
    },
    {
      id: 'a-2',
      type: 'view',
      organizationName: 'Sustainable Growth Partners',
      happenedAt: '2026-04-08T11:22:00.000Z',
    },
    {
      id: 'a-3',
      type: 'view',
      organizationName: 'Development Impact Network',
      happenedAt: '2026-04-07T18:15:00.000Z',
    },
  ],
  status: {
    lastUpdatedAt: nowIso,
    validationStatus: 'pending_validation',
  },
  organizationsWhoViewed: [
    'Global Infrastructure Advisory',
    'Sustainable Growth Partners',
    'Development Impact Network',
    'Strategic Build Group',
  ],
  preferences: {
    isVisible: true,
    matchingEnabled: true,
    notifyOnDownload: true,
    broadcastEnabled: true,
  },
};

let infoStore: ExpertMyCVInfoDTO = {
  metadata: {
    expertId: 'EXP-2026-00147',
    lastUpdatedAt: nowIso,
    validationStatus: 'pending_validation',
  },
  controls: {
    format: 'assortis',
    language: 'en',
  },
  sections: defaultSections('assortis', 'en'),
  documents: documentsStore,
  experienceLinks: experienceLinksStore,
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const myCVService = {
  getDashboard(): ExpertMyCVDashboardDTO {
    return clone(dashboardStore);
  },

  getCVInfo(): ExpertMyCVInfoDTO {
    return clone(infoStore);
  },

  setControls(format: CVFormatType, language: CVLanguageType): ExpertMyCVInfoDTO {
    infoStore = {
      ...infoStore,
      controls: { format, language },
      sections: defaultSections(format, language),
    };

    return clone(infoStore);
  },

  refreshPreview(): ExpertMyCVInfoDTO {
    const refreshedAt = new Date().toISOString();

    infoStore = {
      ...infoStore,
      metadata: {
        ...infoStore.metadata,
        lastUpdatedAt: refreshedAt,
      },
    };

    dashboardStore = {
      ...dashboardStore,
      status: {
        ...dashboardStore.status,
        lastUpdatedAt: refreshedAt,
      },
    };

    return clone(infoStore);
  },

  updatePreferences(
    payload: Partial<ExpertMyCVDashboardDTO['preferences']>
  ): ExpertMyCVDashboardDTO {
    dashboardStore = {
      ...dashboardStore,
      preferences: {
        ...dashboardStore.preferences,
        ...payload,
      },
    };

    return clone(dashboardStore);
  },

  updateCVInfo(payload: ExpertMyCVUpdatePayloadDTO): ExpertMyCVInfoDTO {
    const updatedAt = new Date().toISOString();

    const nextDocs = [...documentsStore];

    if (payload.cvFileName) {
      nextDocs.push({
        id: `doc-cv-${Date.now()}`,
        name: payload.cvFileName,
        category: 'cv',
        uploadedAt: updatedAt,
        sizeLabel: 'New',
      });
    }

    payload.torFileNames.forEach((name) => {
      nextDocs.push({
        id: `doc-tor-${Date.now()}-${name}`,
        name,
        category: 'tor',
        uploadedAt: updatedAt,
        sizeLabel: 'New',
      });
    });

    payload.reportFileNames.forEach((name) => {
      nextDocs.push({
        id: `doc-report-${Date.now()}-${name}`,
        name,
        category: 'report',
        uploadedAt: updatedAt,
        sizeLabel: 'New',
      });
    });

    documentsStore = nextDocs;

    infoStore = {
      ...infoStore,
      metadata: {
        ...infoStore.metadata,
        lastUpdatedAt: updatedAt,
        validationStatus: 'pending_validation',
      },
      documents: documentsStore,
    };

    dashboardStore = {
      ...dashboardStore,
      status: {
        lastUpdatedAt: updatedAt,
        validationStatus: 'pending_validation',
      },
      kpis: {
        ...dashboardStore.kpis,
        relevanceScore: Math.min(100, dashboardStore.kpis.relevanceScore + 1),
      },
    };

    return clone(infoStore);
  },

  addPrivateDocument(fileName: string): ExpertMyCVInfoDTO {
    const updatedAt = new Date().toISOString();

    documentsStore = [
      {
        id: `doc-private-${Date.now()}`,
        name: fileName,
        category: 'private',
        uploadedAt: updatedAt,
        sizeLabel: 'New',
      },
      ...documentsStore,
    ];

    infoStore = {
      ...infoStore,
      documents: documentsStore,
    };

    return clone(infoStore);
  },
};
