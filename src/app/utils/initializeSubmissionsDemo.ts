/**
 * Utility to initialize demo submissions data
 * This adds sample submissions to the pipeline for demonstration purposes
 */

import { SubmissionStatusEnum } from '../types/tender.dto';

export interface DemoSubmissionData {
  tenderId: string;
  stage: string;
  submissionStatus: SubmissionStatusEnum;
  notes?: string;
  addedAt: string;
  submittedAt?: string;
  lastModified: string;
}

export const DEMO_SUBMISSIONS: DemoSubmissionData[] = [
  {
    tenderId: 'tender-1',
    stage: 'submitted',
    submissionStatus: SubmissionStatusEnum.SUBMITTED,
    notes: 'Strong proposal submitted with comprehensive technical approach',
    addedAt: '2024-02-15T10:00:00.000Z',
    submittedAt: '2024-02-20T14:30:00.000Z',
    lastModified: '2024-02-20T14:30:00.000Z',
  },
  {
    tenderId: 'tender-2',
    stage: 'submitted',
    submissionStatus: SubmissionStatusEnum.UNDER_REVIEW,
    notes: 'Proposal under evaluation by procurement committee',
    addedAt: '2024-02-10T09:00:00.000Z',
    submittedAt: '2024-02-18T16:45:00.000Z',
    lastModified: '2024-02-22T10:15:00.000Z',
  },
  {
    tenderId: 'tender-3',
    stage: 'submitted',
    submissionStatus: SubmissionStatusEnum.SHORTLISTED,
    notes: 'Excellent match! Shortlisted for final round',
    addedAt: '2024-01-20T08:30:00.000Z',
    submittedAt: '2024-02-01T11:20:00.000Z',
    lastModified: '2024-02-18T14:00:00.000Z',
  },
  {
    tenderId: 'tender-4',
    stage: 'preparing',
    submissionStatus: SubmissionStatusEnum.DRAFT,
    notes: 'Draft proposal in progress - need to add budget breakdown',
    addedAt: '2024-02-22T13:45:00.000Z',
    lastModified: '2024-02-25T09:30:00.000Z',
  },
  {
    tenderId: 'tender-5',
    stage: 'submitted',
    submissionStatus: SubmissionStatusEnum.AWARDED,
    notes: 'CONTRACT AWARDED! Negotiations to begin next week',
    addedAt: '2024-01-15T07:00:00.000Z',
    submittedAt: '2024-01-28T10:00:00.000Z',
    lastModified: '2024-02-20T15:30:00.000Z',
  },
];

/**
 * Initialize demo submissions in localStorage
 * This should be called once to populate demo data
 */
export function initializeSubmissionsDemo(): void {
  const existingData = localStorage.getItem('pipeline_items');
  
  if (existingData) {
    console.log('⚠️ Pipeline data already exists. Skipping demo initialization.');
    console.log('💡 To reset, clear localStorage and refresh.');
    return;
  }

  localStorage.setItem('pipeline_items', JSON.stringify(DEMO_SUBMISSIONS));
  console.log('✅ Demo submissions initialized successfully!');
  console.log(`📊 ${DEMO_SUBMISSIONS.length} demo submissions created`);
}

/**
 * Clear all submissions data
 * WARNING: This will delete all pipeline and submission data!
 */
export function clearAllSubmissions(): void {
  if (window.confirm('⚠️ This will delete ALL pipeline and submission data. Are you sure?')) {
    localStorage.removeItem('pipeline_items');
    console.log('🗑️ All submissions data cleared');
    window.location.reload();
  }
}

/**
 * Add a single demo submission
 */
export function addDemoSubmission(tenderId: string, status: SubmissionStatusEnum): void {
  const existingData = localStorage.getItem('pipeline_items');
  const items = existingData ? JSON.parse(existingData) : [];

  const newSubmission: DemoSubmissionData = {
    tenderId,
    stage: status === SubmissionStatusEnum.DRAFT ? 'preparing' : 'submitted',
    submissionStatus: status,
    addedAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    submittedAt: status === SubmissionStatusEnum.SUBMITTED ? new Date().toISOString() : undefined,
  };

  items.push(newSubmission);
  localStorage.setItem('pipeline_items', JSON.stringify(items));
  console.log(`✅ Demo submission added: ${tenderId} (${status})`);
}

/**
 * Get current submissions count
 */
export function getSubmissionsCount(): {
  total: number;
  byStatus: Record<SubmissionStatusEnum, number>;
} {
  const existingData = localStorage.getItem('pipeline_items');
  const items = existingData ? JSON.parse(existingData) : [];

  const byStatus: Record<SubmissionStatusEnum, number> = {
    [SubmissionStatusEnum.DRAFT]: 0,
    [SubmissionStatusEnum.SUBMITTED]: 0,
    [SubmissionStatusEnum.UNDER_REVIEW]: 0,
    [SubmissionStatusEnum.SHORTLISTED]: 0,
    [SubmissionStatusEnum.AWARDED]: 0,
    [SubmissionStatusEnum.REJECTED]: 0,
    [SubmissionStatusEnum.WITHDRAWN]: 0,
  };

  items.forEach((item: DemoSubmissionData) => {
    if (item.submissionStatus) {
      byStatus[item.submissionStatus]++;
    }
  });

  return {
    total: items.filter((item: DemoSubmissionData) => item.submissionStatus).length,
    byStatus,
  };
}

// Make functions available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).submissionsDemo = {
    initialize: initializeSubmissionsDemo,
    clear: clearAllSubmissions,
    add: addDemoSubmission,
    count: getSubmissionsCount,
  };
}
