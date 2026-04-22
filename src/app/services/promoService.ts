import { PromoCodeData } from '../types/promo';

/**
 * Service de gestion des codes promotionnels
 * Centralise la logique de validation et de gestion des codes promo
 */

// Base de données simulée des codes promotionnels
// En production, ceci sera remplacé par des appels API backend
const MOCK_PROMO_CODES: Record<string, PromoCodeData> = {
  'PROMO2026-ABC123': {
    code: 'PROMO2026-ABC123',
    isValid: true,
    discountPercent: 15,
    isUsed: false,
    validUntil: '2026-12-31',
    organizationData: {
      orgName: 'Global Development Solutions Inc.',
      orgEmail: 'contact@globaldev.com',
      orgPhone: '+1 (555) 123-4567',
      contactPersonName: 'John Smith',
      contactPersonPosition: 'Chief Operating Officer',
      orgCountry: 'United States',
      employeeRange: '51-200',
      annualRevenue: '1m-5m',
      industry: 'Professional Services',
    },
  },
  'ASSORTIS2026-XYZ789': {
    code: 'ASSORTIS2026-XYZ789',
    isValid: true,
    discountPercent: 20,
    isUsed: false,
    validUntil: '2026-06-30',
    organizationData: {
      orgName: 'International Aid Consortium',
      orgEmail: 'info@aidconsortium.org',
      orgPhone: '+33 1 23 45 67 89',
      contactPersonName: 'Marie Dupont',
      contactPersonPosition: 'Director',
      orgCountry: 'France',
      employeeRange: '201-500',
      annualRevenue: '5m-10m',
      industry: 'Non-Profit & NGO',
    },
  },
  'PREMIUM2026-VIP001': {
    code: 'PREMIUM2026-VIP001',
    isValid: true,
    discountPercent: 25,
    isUsed: false,
    validUntil: '2026-09-30',
    organizationData: {
      orgName: 'Tech Innovation Hub',
      orgEmail: 'contact@techinnovation.io',
      orgPhone: '+44 20 1234 5678',
      contactPersonName: 'Sarah Johnson',
      contactPersonPosition: 'CEO',
      orgCountry: 'United Kingdom',
      employeeRange: '11-50',
      annualRevenue: '500k-1m',
      industry: 'Technology & IT',
    },
  },
  'USED-CODE-123': {
    code: 'USED-CODE-123',
    isValid: false,
    discountPercent: 0,
    isUsed: true,
  },
  'EXPIRED-CODE-456': {
    code: 'EXPIRED-CODE-456',
    isValid: false,
    discountPercent: 10,
    isUsed: false,
    validUntil: '2025-12-31',
  },
};

/**
 * Valide un code promotionnel
 * @param code - Le code promotionnel à valider
 * @returns Les données du code promo ou null si invalide
 */
export async function validatePromoCode(code: string): Promise<PromoCodeData | null> {
  // Simulation de latence réseau (1.5s)
  await new Promise(resolve => setTimeout(resolve, 1500));

  // TODO: Remplacer par un vrai appel API
  // const response = await fetch(`/api/promo-codes/validate`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ code: code.toUpperCase() }),
  // });
  // return response.json();

  const upperCode = code.toUpperCase().trim();
  const promoData = MOCK_PROMO_CODES[upperCode];

  if (!promoData) {
    return null;
  }

  // Vérifier si le code est expiré
  if (promoData.validUntil) {
    const expiryDate = new Date(promoData.validUntil);
    const today = new Date();
    if (today > expiryDate) {
      return {
        ...promoData,
        isValid: false,
      };
    }
  }

  return promoData;
}

/**
 * Soumet une demande de code promotionnel
 * @param formData - Les données du formulaire de demande
 * @returns L'ID de la demande créée
 */
export async function submitPromotionRequest(formData: {
  orgName: string;
  email: string;
  contactPerson: string;
  position: string;
  phone: string;
  country: string;
  employeeRange: string;
  annualRevenue: string;
  industry: string;
  additionalInfo?: string;
}): Promise<{ requestId: string; status: 'pending' }> {
  // Simulation de latence réseau (2s)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // TODO: Remplacer par un vrai appel API
  // const response = await fetch('/api/promotion-requests', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(formData),
  // });
  // return response.json();

  // Simulation de réponse
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  
  console.log('Promotion request submitted:', {
    requestId,
    ...formData,
  });

  return {
    requestId,
    status: 'pending',
  };
}

/**
 * Calcule le prix après réduction
 * @param originalPrice - Le prix original
 * @param discountPercent - Le pourcentage de réduction
 * @returns Le prix final après réduction
 */
export function calculateDiscountedPrice(
  originalPrice: number,
  discountPercent: number
): number {
  const discount = (originalPrice * discountPercent) / 100;
  return Math.max(0, originalPrice - discount);
}

/**
 * Formate le montant de la réduction
 * @param originalPrice - Le prix original
 * @param discountPercent - Le pourcentage de réduction
 * @returns Le montant de la réduction formaté
 */
export function calculateDiscountAmount(
  originalPrice: number,
  discountPercent: number
): number {
  return (originalPrice * discountPercent) / 100;
}

/**
 * Vérifie si un code promo est encore valide (non expiré)
 * @param validUntil - Date d'expiration au format ISO
 * @returns true si le code est encore valide
 */
export function isPromoCodeStillValid(validUntil?: string): boolean {
  if (!validUntil) {
    return true; // Pas de date d'expiration = valide indéfiniment
  }

  const expiryDate = new Date(validUntil);
  const today = new Date();
  
  return today <= expiryDate;
}

/**
 * Marque un code promo comme utilisé
 * @param code - Le code à marquer comme utilisé
 */
export async function markPromoCodeAsUsed(code: string): Promise<void> {
  // Simulation de latence réseau
  await new Promise(resolve => setTimeout(resolve, 500));

  // TODO: Remplacer par un vrai appel API
  // await fetch(`/api/promo-codes/${code}/use`, {
  //   method: 'POST',
  // });

  const upperCode = code.toUpperCase();
  if (MOCK_PROMO_CODES[upperCode]) {
    MOCK_PROMO_CODES[upperCode].isUsed = true;
    MOCK_PROMO_CODES[upperCode].isValid = false;
  }

  console.log(`Promo code ${code} marked as used`);
}

/**
 * Récupère les codes promo de test disponibles
 * Uniquement pour le développement et les démos
 */
export function getTestPromoCodes(): string[] {
  return Object.keys(MOCK_PROMO_CODES).filter(
    code => MOCK_PROMO_CODES[code].isValid && !MOCK_PROMO_CODES[code].isUsed
  );
}

/**
 * Formate la date d'expiration pour l'affichage
 * @param dateString - Date au format ISO
 * @param locale - Locale pour le formatage (en, fr, es)
 */
export function formatExpiryDate(dateString: string, locale: string = 'en'): string {
  const date = new Date(dateString);
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return date.toLocaleDateString(locale, options);
}
