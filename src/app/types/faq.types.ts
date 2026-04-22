/**
 * Types pour le système FAQ dynamique
 * Ces types définissent la structure des données FAQ qui seront gérées via le backoffice
 */

import { MultilingualText } from './offers.types';

export interface FAQItem {
  id: string;
  question: MultilingualText;
  answer: MultilingualText;
  category: string;
  displayOrder: number;
  isActive: boolean;
  tags?: string[]; // Pour la recherche
  createdAt?: string;
  updatedAt?: string;
}

export interface FAQCategory {
  id: string;
  name: MultilingualText;
  description?: MultilingualText;
  iconName: string;
  displayOrder: number;
  isActive: boolean;
}

export interface FAQContent {
  categories: FAQCategory[];
  items: FAQItem[];
  settings: {
    enableSearch: boolean;
    enableCategories: boolean;
    itemsPerPage?: number;
  };
}

export interface FAQSearchResult {
  item: FAQItem;
  relevanceScore: number;
}
