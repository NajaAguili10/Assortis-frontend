import { useCallback, useEffect, useMemo, useState } from 'react';
import { organizationProjectReferencesSeed } from '@app/modules/organization/data/organizationProjectReferencesData';
import {
  OrganizationProjectReferenceDTO,
  OrganizationProjectReferenceDocumentDTO,
  OrganizationProjectReferenceFormValues,
} from '@app/modules/organization/types/organizationProjectReference.dto';

const STORAGE_KEY = 'organization_project_references';
const STORAGE_EVENT = 'organization-project-references-updated';

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

const readStoredReferences = (): OrganizationProjectReferenceDTO[] => {
  if (typeof window === 'undefined') {
    return sortReferences(organizationProjectReferencesSeed);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return sortReferences(organizationProjectReferencesSeed);
  }

  try {
    const parsed = JSON.parse(raw) as OrganizationProjectReferenceDTO[];
    return sortReferences(parsed.map(normalizeReferenceStatus));
  } catch {
    return sortReferences(organizationProjectReferencesSeed);
  }
};

const persistReferences = (references: OrganizationProjectReferenceDTO[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  const sorted = sortReferences(references);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
};

const buildReferenceNumber = (references: OrganizationProjectReferenceDTO[]) => {
  const year = new Date().getFullYear();
  const sequence = String(references.length + 1).padStart(3, '0');
  return `ORG-REF-${year}-${sequence}`;
};

export function useOrganizationProjectReferences() {
  const [references, setReferences] = useState<OrganizationProjectReferenceDTO[]>(() => readStoredReferences());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const syncReferences = () => {
      setReferences(readStoredReferences());
    };

    window.addEventListener(STORAGE_EVENT, syncReferences as EventListener);
    window.addEventListener('storage', syncReferences);

    return () => {
      window.removeEventListener(STORAGE_EVENT, syncReferences as EventListener);
      window.removeEventListener('storage', syncReferences);
    };
  }, []);

  const saveReferences = useCallback((nextReferences: OrganizationProjectReferenceDTO[]) => {
    const sorted = sortReferences(nextReferences);
    setReferences(sorted);
    persistReferences(sorted);
  }, []);

  const createReference = useCallback((values: OrganizationProjectReferenceFormValues) => {
    const timestamp = new Date().toISOString();
    const nextReference: OrganizationProjectReferenceDTO = {
      ...values,
      id: crypto.randomUUID(),
      referenceNumber: values.referenceNumber.trim() || buildReferenceNumber(references),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    saveReferences([nextReference, ...references]);
    return nextReference;
  }, [references, saveReferences]);

  const updateReference = useCallback((referenceId: string, values: OrganizationProjectReferenceFormValues) => {
    let updatedReference: OrganizationProjectReferenceDTO | null = null;

    const nextReferences = references.map(reference => {
      if (reference.id !== referenceId) {
        return reference;
      }

      updatedReference = {
        ...reference,
        ...values,
        referenceNumber: values.referenceNumber.trim() || reference.referenceNumber,
        updatedAt: new Date().toISOString(),
      };

      return updatedReference;
    });

    saveReferences(nextReferences);
    return updatedReference;
  }, [references, saveReferences]);

  const deleteReference = useCallback((referenceId: string) => {
    saveReferences(references.filter(reference => reference.id !== referenceId));
  }, [references, saveReferences]);

  const addDocuments = useCallback((referenceId: string, documents: OrganizationProjectReferenceDocumentDTO[]) => {
    const nextReferences = references.map(reference => {
      if (reference.id !== referenceId) {
        return reference;
      }

      return {
        ...reference,
        documents: [...reference.documents, ...documents],
        updatedAt: new Date().toISOString(),
      };
    });

    saveReferences(nextReferences);
  }, [references, saveReferences]);

  const replaceDocument = useCallback((referenceId: string, documentId: string, document: OrganizationProjectReferenceDocumentDTO) => {
    const nextReferences = references.map(reference => {
      if (reference.id !== referenceId) {
        return reference;
      }

      return {
        ...reference,
        documents: reference.documents.map(existingDocument => (
          existingDocument.id === documentId ? { ...document, id: documentId } : existingDocument
        )),
        updatedAt: new Date().toISOString(),
      };
    });

    saveReferences(nextReferences);
  }, [references, saveReferences]);

  const removeDocument = useCallback((referenceId: string, documentId: string) => {
    const nextReferences = references.map(reference => {
      if (reference.id !== referenceId) {
        return reference;
      }

      return {
        ...reference,
        documents: reference.documents.filter(document => document.id !== documentId),
        updatedAt: new Date().toISOString(),
      };
    });

    saveReferences(nextReferences);
  }, [references, saveReferences]);

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
    createReference,
    updateReference,
    deleteReference,
    addDocuments,
    replaceDocument,
    removeDocument,
  };
}
