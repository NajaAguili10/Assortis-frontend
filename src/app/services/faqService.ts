import { apiClient } from '@app/api/apiClient';
import { FAQContent } from '../types/faq.types';

/**
 * Récupère le contenu FAQ complet depuis le backend.
 */
export const getFAQContent = async (): Promise<FAQContent> => {
  return apiClient.get<FAQContent>('/faqs/content');
};

/**
 * Recherche dans les FAQ déjà exposées par le backend.
 * @param query - Terme de recherche
 * @param language - Langue de recherche
 */
export const searchFAQ = async (query: string, language: 'en' | 'fr' | 'es') => {
  const content = await getFAQContent();
  const searchTerm = query.toLowerCase().trim();

  if (!searchTerm) {
    return content.items.filter(item => item.isActive);
  }

  return content.items
    .filter(item => item.isActive)
    .filter(item => {
      const question = item.question[language].toLowerCase();
      const answer = item.answer[language].toLowerCase();
      const tags = (item.tags || []).join(' ').toLowerCase();

      return question.includes(searchTerm) ||
        answer.includes(searchTerm) ||
        tags.includes(searchTerm);
    });
};
