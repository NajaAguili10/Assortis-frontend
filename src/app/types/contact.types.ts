/**
 * Types pour le module Contact
 * Système de DTO multilingue pour le formulaire de contact
 */

export interface MultilingualText {
  en: string;
  fr: string;
  es: string;
}

export interface ContactMethod {
  id: string;
  type: 'email' | 'phone' | 'address';
  iconName: string;
  label: MultilingualText;
  value: string;
  href?: string;
  displayOrder: number;
}

export interface ContactCategory {
  id: string;
  title: MultilingualText;
  description: MultilingualText;
  iconName: string;
  iconColor: string;
  iconBgColor: string;
  email?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ContactSubject {
  value: string;
  label: MultilingualText;
}

export interface ContactFormField {
  name: string;
  label: MultilingualText;
  placeholder: MultilingualText;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea';
  required: boolean;
  options?: ContactSubject[];
}

export interface ContactPageContent {
  banner: {
    title: MultilingualText;
    subtitle: MultilingualText;
  };
  contactMethods: ContactMethod[];
  categories: ContactCategory[];
  form: {
    title: MultilingualText;
    subtitle: MultilingualText;
    fields: ContactFormField[];
    submitButton: MultilingualText;
    submittingButton: MultilingualText;
    successMessage: MultilingualText;
    errorMessage: MultilingualText;
  };
  workingHours: {
    title: MultilingualText;
    schedule: MultilingualText;
  };
}

export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}
