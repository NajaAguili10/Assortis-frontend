import { LucideIcon } from 'lucide-react';

/**
 * Types pour le module "Nos offres"
 * Ces types définissent la structure des données qui seront gérées via le backoffice
 */

export interface MultilingualText {
  en: string;
  fr: string;
  es: string;
}

export interface PlanFeature {
  id: string;
  textKey: string;
  values?: Record<string, number | string>;
}

export type UserType = 'organization' | 'expert';

export interface SubscriptionPlan {
  id: string;
  name: MultilingualText;
  description: MultilingualText;
  priceMonthly: number | null; // null = custom pricing
  priceYearly: number | null;
  features: PlanFeature[];
  highlighted: boolean;
  iconName: string; // Nom de l'icône Lucide
  colorGradient: string; // Classes Tailwind pour le gradient
  displayOrder: number;
  isActive: boolean;
  userType: UserType; // Type d'utilisateur ciblé
}

export interface ValueProposition {
  id: string;
  title: MultilingualText;
  description: MultilingualText;
  iconName: string;
  iconBgColor: string;
  iconTextColor: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CTACard {
  id: string;
  title: MultilingualText;
  description: MultilingualText;
  iconName: string;
  iconBgColor: string;
  iconColor: string;
  link: string;
  displayOrder: number;
  isActive: boolean;
}

export interface OffersHubContent {
  banner: {
    title: MultilingualText;
    subtitle: MultilingualText;
  };
  ctaCards: CTACard[];
  plans: SubscriptionPlan[];
  valuePropositions: ValueProposition[];
  sectionTitles: {
    comparePlans: MultilingualText;
    features: MultilingualText;
  };
}

export interface BecomeMemberContent {
  banner: {
    title: MultilingualText;
    subtitle: MultilingualText;
  };
  benefits: Array<{
    id: string;
    title: MultilingualText;
    description: MultilingualText;
    iconName: string;
    displayOrder: number;
  }>;
  process: {
    title: MultilingualText;
    steps: Array<{
      id: string;
      number: number;
      title: MultilingualText;
      description: MultilingualText;
      iconName: string;
    }>;
  };
}

export interface MemberAreaContent {
  banner: {
    title: MultilingualText;
    subtitle: MultilingualText;
  };
  benefits: Array<{
    id: string;
    title: MultilingualText;
    description: MultilingualText;
    iconName: string;
    iconColor: string;
    displayOrder: number;
  }>;
}

export interface ContactSalesContent {
  banner: {
    title: MultilingualText;
    subtitle: MultilingualText;
  };
  form: {
    title: MultilingualText;
    fields: {
      name: { label: MultilingualText; placeholder: MultilingualText };
      email: { label: MultilingualText; placeholder: MultilingualText };
      company: { label: MultilingualText; placeholder: MultilingualText };
      companySize: { label: MultilingualText; placeholder: MultilingualText };
      industry: { label: MultilingualText; placeholder: MultilingualText };
      message: { label: MultilingualText; placeholder: MultilingualText };
    };
    submitButton: MultilingualText;
    submittingButton: MultilingualText;
    successMessage: MultilingualText;
  };
  companySizes: Array<{
    value: string;
    label: MultilingualText;
  }>;
  industries: Array<{
    value: string;
    label: MultilingualText;
  }>;
}