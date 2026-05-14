import { useCallback, useEffect, useMemo, useState } from 'react';
import { organizationProjectReferenceService } from '@app/services/organizationProjectReferenceService';
import {
  OrganizationProjectReferenceDTO,
  OrganizationProjectReferenceDocumentDTO,
  OrganizationProjectReferenceFormValues,
} from '@app/modules/organization/types/organizationProjectReference.dto';

const sortReferences = (references: OrganizationProjectReferenceDTO[]) => {
  return [...references].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
};

const normalizeReferenceStatus = (reference: OrganizationProjectReferenceDTO): OrganizationProjectReferenceDTO => {
  const legacyStatus = String(reference.status).toLowerCase();
  if (legacyStatus === 'verified' || legacyStatus === 'completed') {
    return { ...reference, status: 'verified' };
  }

  return { ...reference, status: 'notVerified' };
};

export function useOrganizationProjectReferences() {
  const [references, setReferences] = useState<OrganizationProjectReferenceDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshReferences = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextReferences = await organizationProjectReferenceService.getReferences();
      setReferences(sortReferences(nextReferences.map(normalizeReferenceStatus)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshReferences();
  }, [refreshReferences]);

  const createReference = useCallback(async (values: OrganizationProjectReferenceFormValues) => {
    const nextReference = normalizeReferenceStatus(await organizationProjectReferenceService.createReference(values));
    setReferences((current) => sortReferences([nextReference, ...current]));
    return nextReference;
  }, []);

  const updateReference = useCallback(async (referenceId: string, values: OrganizationProjectReferenceFormValues) => {
    const updatedReference = normalizeReferenceStatus(
      await organizationProjectReferenceService.updateReference(referenceId, values),
    );
    setReferences((current) => sortReferences(current.map(reference => (
      reference.id === referenceId ? updatedReference : reference
    ))));
    return updatedReference;
  }, []);

  const deleteReference = useCallback(async (referenceId: string) => {
    await organizationProjectReferenceService.deleteReference(referenceId);
    setReferences((current) => current.filter(reference => reference.id !== referenceId));
  }, []);

  const addDocuments = useCallback(async (referenceId: string, documents: OrganizationProjectReferenceDocumentDTO[]) => {
    const existingReference = references.find(reference => reference.id === referenceId);
    if (!existingReference) return null;
    return updateReference(referenceId, {
      ...existingReference,
      documents: [...existingReference.documents, ...documents],
    });
  }, [references, updateReference]);

  const replaceDocument = useCallback(async (referenceId: string, documentId: string, document: OrganizationProjectReferenceDocumentDTO) => {
    const existingReference = references.find(reference => reference.id === referenceId);
    if (!existingReference) return null;
    return updateReference(referenceId, {
      ...existingReference,
      documents: existingReference.documents.map(existingDocument => (
        existingDocument.id === documentId ? { ...document, id: documentId } : existingDocument
      )),
    });
  }, [references, updateReference]);

  const removeDocument = useCallback(async (referenceId: string, documentId: string) => {
    const existingReference = references.find(reference => reference.id === referenceId);
    if (!existingReference) return null;
    return updateReference(referenceId, {
      ...existingReference,
      documents: existingReference.documents.filter(document => document.id !== documentId),
    });
  }, [references, updateReference]);

  const metrics = useMemo(() => {
    const notVerified = references.filter(reference => reference.status === 'notVerified').length;
    const verified = references.filter(reference => reference.status === 'verified').length;
    const documents = references.reduce((count, reference) => count + reference.documents.length, 0);

    return {
      total: references.length,
      ongoing: notVerified,
      completed: verified,
      notVerified,
      verified,
      documents,
    };
  }, [references]);

  return {
    references,
    metrics,
    isLoading,
    refreshReferences,
    createReference,
    updateReference,
    deleteReference,
    addDocuments,
    replaceDocument,
    removeDocument,
  };
}
