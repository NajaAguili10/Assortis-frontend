import { apiClient } from '@app/api/apiClient';
import { ContractorScoreInputDTO } from '@app/modules/expert/types/expert-projects-scoring.dto';

export interface OrganizationScoreDTO extends ContractorScoreInputDTO {
  collaborationId: string;
  updatedAt?: string;
}

export const organizationScoringService = {
  getScores: async (): Promise<OrganizationScoreDTO[]> => {
    return apiClient.get<OrganizationScoreDTO[]>('/projects/organizations-scoring/scores');
  },

  upsertScore: async (
    collaborationId: string,
    score: ContractorScoreInputDTO,
  ): Promise<OrganizationScoreDTO> => {
    return apiClient.put<OrganizationScoreDTO>(
      `/projects/organizations-scoring/scores/${encodeURIComponent(collaborationId)}`,
      score,
    );
  },
};
