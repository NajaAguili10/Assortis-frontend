/**
 * Hook personnalisé pour charger le contenu dynamique du module "Nos offres"
 * Gère le chargement, le cache et les erreurs
 */

import { useState, useEffect } from 'react';
import { 
  OffersHubContent,
  BecomeMemberContent,
  MemberAreaContent,
  ContactSalesContent
} from '../types/offers.types';
import { FAQContent } from '../types/faq.types';
import { ContactPageContent } from '../types/contact.types';
import {
  getOffersHubContent,
  getBecomeMemberContent,
  getMemberAreaContent,
  getContactSalesContent
} from '../services/offersService';
import { getFAQContent } from '../services/faqService';
import { getContactPageContent } from '../services/contactService';

interface UseContentResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook pour charger le contenu de la page "Nos offres Hub"
 */
export const useOffersHubContent = (): UseContentResult<OffersHubContent> => {
  const [data, setData] = useState<OffersHubContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const content = await getOffersHubContent();
      setData(content);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load content'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook pour charger le contenu de la page "Devenir membre"
 */
export const useBecomeMemberContent = (): UseContentResult<BecomeMemberContent> => {
  const [data, setData] = useState<BecomeMemberContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const content = await getBecomeMemberContent();
      setData(content);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load content'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook pour charger le contenu de la page "Espace membre"
 */
export const useMemberAreaContent = (): UseContentResult<MemberAreaContent> => {
  const [data, setData] = useState<MemberAreaContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const content = await getMemberAreaContent();
      setData(content);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load content'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook pour charger le contenu de la page "Contact commercial"
 */
export const useContactSalesContent = (): UseContentResult<ContactSalesContent> => {
  const [data, setData] = useState<ContactSalesContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const content = await getContactSalesContent();
      setData(content);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load content'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook pour charger le contenu de la page "FAQ"
 */
export const useFAQContent = (): UseContentResult<FAQContent> => {
  const [data, setData] = useState<FAQContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const content = await getFAQContent();
      setData(content);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load content'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook pour charger le contenu de la page "Contact"
 */
export const useContactPageContent = (): UseContentResult<ContactPageContent> => {
  const [data, setData] = useState<ContactPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const content = await getContactPageContent();
      setData(content);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load content'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};