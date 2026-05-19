import { useState } from 'react';
import {
  organizationTenderService,
  TenderQuickCreatePayload,
  OrganizationTenderItem,
} from '@app/services/organizationTenderService';

export type TenderQuickCreateResult = Pick<OrganizationTenderItem, 'id' | 'createdAt' | 'status'>;
export type { TenderQuickCreatePayload };

export function useTenderQuickCreate() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTender = async (payload: TenderQuickCreatePayload): Promise<TenderQuickCreateResult> => {
    setIsSubmitting(true);

    try {
      const createdTender = await organizationTenderService.createCurrentOrganizationTender(payload);
      return {
        id: createdTender.id,
        createdAt: createdTender.createdAt,
        status: createdTender.status,
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createTender,
    isSubmitting,
  };
}
