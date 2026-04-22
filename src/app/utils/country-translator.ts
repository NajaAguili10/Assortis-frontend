// Utility to translate CountryEnum values to localized country names
import { CountryEnum } from '../types/tender.dto';
import { getCountryName } from '../config/countries.config';

/**
 * Maps CountryEnum values (which contain ISO codes) to their localized names
 * @param countryEnum - The CountryEnum value (e.g., CountryEnum.FRANCE)
 * @param language - The target language ('en' | 'fr' | 'es')
 * @returns The localized country name
 */
export function getLocalizedCountryName(
  countryEnum: CountryEnum,
  language: 'en' | 'fr' | 'es'
): string {
  // CountryEnum values ARE the ISO codes (e.g., 'FR', 'BA', 'US')
  // So we can use them directly with getCountryName
  const isoCode = countryEnum as string;
  return getCountryName(isoCode, language);
}

/**
 * Get translation key for a country (for backwards compatibility)
 * Returns the country name in the specified language
 */
export function getCountryTranslationKey(countryEnum: CountryEnum): string {
  // This is kept for compatibility but the actual translation
  // should use getLocalizedCountryName directly
  return countryEnum as string;
}
