import { useState, useCallback } from 'react';
import { SubmissionStatusEnum } from '@app/types/tender.dto';

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: 'interested', name: 'Interested', color: 'blue' },
  { id: 'analyzing', name: 'Analyzing', color: 'purple' },
  { id: 'preparing', name: 'Preparing Proposal', color: 'orange' },
  { id: 'ready', name: 'Ready to Submit', color: 'green' },
  { id: 'submitted', name: 'Submitted', color: 'teal' },
];

export const RESULT_STAGES = {
  WON: 'won',
  LOST: 'lost',
  WITHDRAWN: 'withdrawn',
  DISCARDED: 'discarded',
} as const;

interface PipelineItem {
  tenderId: string;
  stage: string;
  addedAt: string;
  notes?: string;
  probability?: number; // Win probability (0-100)
  submissionStatus?: SubmissionStatusEnum;
  submittedAt?: string;
  lastModified?: string;
  resultStage?: typeof RESULT_STAGES[keyof typeof RESULT_STAGES]; // Final result (won/lost/withdrawn)
  resultDate?: string; // Date when final result was set
  awardValue?: number; // Actual contract value if won
}

export function usePipeline() {
  const [pipelineItems, setPipelineItems] = useState<PipelineItem[]>(() => {
    const stored = localStorage.getItem('pipeline_items');
    return stored ? JSON.parse(stored) : [];
  });

  const addToPipeline = useCallback((tenderId: string, stage: string = 'interested', notes?: string, probability: number = 50) => {
    setPipelineItems((prev) => {
      const exists = prev.find((item) => item.tenderId === tenderId);
      if (exists) {
        // Update existing item
        const updated = prev.map((item) =>
          item.tenderId === tenderId
            ? { ...item, stage, notes: notes || item.notes, probability: probability || item.probability }
            : item
        );
        localStorage.setItem('pipeline_items', JSON.stringify(updated));
        return updated;
      } else {
        // Add new item
        const newItem: PipelineItem = {
          tenderId,
          stage,
          addedAt: new Date().toISOString(),
          notes,
          probability: probability || 50,
        };
        const updated = [...prev, newItem];
        localStorage.setItem('pipeline_items', JSON.stringify(updated));
        return updated;
      }
    });
  }, []);

  const removeFromPipeline = useCallback((tenderId: string) => {
    setPipelineItems((prev) => {
      const updated = prev.filter((item) => item.tenderId !== tenderId);
      localStorage.setItem('pipeline_items', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updatePipelineStage = useCallback((tenderId: string, stage: string) => {
    setPipelineItems((prev) => {
      const updated = prev.map((item) =>
        item.tenderId === tenderId ? { ...item, stage } : item
      );
      localStorage.setItem('pipeline_items', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updatePipelineNotes = useCallback((tenderId: string, notes: string) => {
    setPipelineItems((prev) => {
      const updated = prev.map((item) =>
        item.tenderId === tenderId ? { ...item, notes } : item
      );
      localStorage.setItem('pipeline_items', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isInPipeline = useCallback(
    (tenderId: string) => {
      return pipelineItems.some((item) => item.tenderId === tenderId);
    },
    [pipelineItems]
  );

  const getPipelineItem = useCallback(
    (tenderId: string) => {
      return pipelineItems.find((item) => item.tenderId === tenderId);
    },
    [pipelineItems]
  );

  const getPipelineItemsByStage = useCallback(
    (stage: string) => {
      return pipelineItems.filter((item) => item.stage === stage);
    },
    [pipelineItems]
  );

  const getPipelineCount = useCallback(() => {
    return pipelineItems.length;
  }, [pipelineItems]);

  const clearPipeline = useCallback(() => {
    setPipelineItems([]);
    localStorage.removeItem('pipeline_items');
  }, []);

  // New: Update submission status
  const updateSubmissionStatus = useCallback((tenderId: string, status: SubmissionStatusEnum) => {
    setPipelineItems((prev) => {
      const updated = prev.map((item) =>
        item.tenderId === tenderId 
          ? { 
              ...item, 
              submissionStatus: status,
              lastModified: new Date().toISOString(),
              // Auto-set submittedAt when status changes to SUBMITTED for the first time
              submittedAt: (status === SubmissionStatusEnum.SUBMITTED && !item.submittedAt) 
                ? new Date().toISOString() 
                : item.submittedAt
            } 
          : item
      );
      localStorage.setItem('pipeline_items', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // New: Get all submissions (pipeline items with submission status)
  const getSubmissions = useCallback(() => {
    return pipelineItems.filter((item) => item.submissionStatus);
  }, [pipelineItems]);

  // New: Get submissions by status
  const getSubmissionsByStatus = useCallback((status: SubmissionStatusEnum) => {
    return pipelineItems.filter((item) => item.submissionStatus === status);
  }, [pipelineItems]);

  // New: Initialize submission status (convert pipeline item to submission)
  const convertToSubmission = useCallback((tenderId: string, status: SubmissionStatusEnum = SubmissionStatusEnum.DRAFT) => {
    setPipelineItems((prev) => {
      const updated = prev.map((item) =>
        item.tenderId === tenderId 
          ? { 
              ...item, 
              submissionStatus: status,
              lastModified: new Date().toISOString(),
              submittedAt: status === SubmissionStatusEnum.SUBMITTED ? new Date().toISOString() : undefined
            } 
          : item
      );
      localStorage.setItem('pipeline_items', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // New: Update win probability
  const updateProbability = useCallback((tenderId: string, probability: number) => {
    setPipelineItems((prev) => {
      const updated = prev.map((item) =>
        item.tenderId === tenderId 
          ? { ...item, probability, lastModified: new Date().toISOString() }
          : item
      );
      localStorage.setItem('pipeline_items', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // New: Mark as won
  const markAsWon = useCallback((tenderId: string, awardValue?: number) => {
    setPipelineItems((prev) => {
      const updated = prev.map((item) =>
        item.tenderId === tenderId 
          ? { 
              ...item, 
              resultStage: RESULT_STAGES.WON,
              resultDate: new Date().toISOString(),
              awardValue: awardValue || item.awardValue,
              probability: 100,
              lastModified: new Date().toISOString()
            }
          : item
      );
      localStorage.setItem('pipeline_items', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // New: Mark as lost
  const markAsLost = useCallback((tenderId: string) => {
    setPipelineItems((prev) => {
      const updated = prev.map((item) =>
        item.tenderId === tenderId 
          ? { 
              ...item, 
              resultStage: RESULT_STAGES.LOST,
              resultDate: new Date().toISOString(),
              probability: 0,
              lastModified: new Date().toISOString()
            }
          : item
      );
      localStorage.setItem('pipeline_items', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // New: Mark as withdrawn
  const markAsWithdrawn = useCallback((tenderId: string) => {
    setPipelineItems((prev) => {
      const updated = prev.map((item) =>
        item.tenderId === tenderId 
          ? { 
              ...item, 
              resultStage: RESULT_STAGES.WITHDRAWN,
              resultDate: new Date().toISOString(),
              lastModified: new Date().toISOString()
            }
          : item
      );
      localStorage.setItem('pipeline_items', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // New: Get active opportunities (no result stage set)
  const getActiveOpportunities = useCallback(() => {
    return pipelineItems.filter((item) => !item.resultStage);
  }, [pipelineItems]);

  // New: Get opportunities by result stage
  const getOpportunitiesByResult = useCallback((resultStage: typeof RESULT_STAGES[keyof typeof RESULT_STAGES]) => {
    return pipelineItems.filter((item) => item.resultStage === resultStage);
  }, [pipelineItems]);

  // New: Get won opportunities
  const getWonOpportunities = useCallback(() => {
    return pipelineItems.filter((item) => item.resultStage === RESULT_STAGES.WON);
  }, [pipelineItems]);

  // New: Get lost opportunities
  const getLostOpportunities = useCallback(() => {
    return pipelineItems.filter((item) => item.resultStage === RESULT_STAGES.LOST);
  }, [pipelineItems]);

  // New: Mark as discarded
  const markAsDiscarded = useCallback((tenderId: string) => {
    setPipelineItems((prev) => {
      const updated = prev.map((item) =>
        item.tenderId === tenderId 
          ? { 
              ...item, 
              resultStage: RESULT_STAGES.DISCARDED,
              resultDate: new Date().toISOString(),
              probability: 0,
              lastModified: new Date().toISOString()
            }
          : item
      );
      localStorage.setItem('pipeline_items', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // New: Get discarded opportunities
  const getDiscardedOpportunities = useCallback(() => {
    return pipelineItems.filter((item) => item.resultStage === RESULT_STAGES.DISCARDED);
  }, [pipelineItems]);

  // New: Restore from discarded
  const restoreFromDiscarded = useCallback((tenderId: string) => {
    setPipelineItems((prev) => {
      const updated = prev.map((item) =>
        item.tenderId === tenderId 
          ? { 
              ...item, 
              resultStage: undefined,
              resultDate: undefined,
              probability: item.probability || 50,
              lastModified: new Date().toISOString()
            }
          : item
      );
      localStorage.setItem('pipeline_items', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    pipelineItems,
    addToPipeline,
    removeFromPipeline,
    updatePipelineStage,
    updatePipelineNotes,
    isInPipeline,
    getPipelineItem,
    getPipelineItemsByStage,
    getPipelineCount,
    clearPipeline,
    // Submission methods
    updateSubmissionStatus,
    getSubmissions,
    getSubmissionsByStatus,
    convertToSubmission,
    // New probability and result methods
    updateProbability,
    markAsWon,
    markAsLost,
    markAsWithdrawn,
    markAsDiscarded,
    restoreFromDiscarded,
    getActiveOpportunities,
    getOpportunitiesByResult,
    getWonOpportunities,
    getLostOpportunities,
    getDiscardedOpportunities,
  };
}