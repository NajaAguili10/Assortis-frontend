export type TranslateFn = (key: string) => string;

const LEGACY_SUBSECTOR_CODE_MAP: Record<string, string> = {
  SUBSECTOR_168: 'PRIMARY_EDUCATION',
  SUBSECTOR_169: 'SECONDARY_EDUCATION',
  SUBSECTOR_170: 'HIGHER_EDUCATION',
  SUBSECTOR_172: 'ADULT_EDUCATION',
  SUBSECTOR_176: 'TEACHER_TRAINING',
  SUBSECTOR_251: 'PRIMARY_HEALTHCARE',
  SUBSECTOR_253: 'CHILD_HEALTH',
  SUBSECTOR_254: 'MENTAL_HEALTH',
  SUBSECTOR_255: 'NUTRITION',
  SUBSECTOR_259: 'INFECTIOUS_DISEASES',
  SUBSECTOR_573: 'CROP_PRODUCTION',
  SUBSECTOR_114: 'FISHERIES',
  SUBSECTOR_131: 'ROADS',
  SUBSECTOR_132: 'BUILDINGS',
  SUBSECTOR_163: 'PUBLIC_ADMINISTRATION',
  SUBSECTOR_175: 'TEACHER_TRAINING',
  SUBSECTOR_187: 'RENEWABLE_ENERGY',
  SUBSECTOR_192: 'SOLAR_POWER',
  SUBSECTOR_528: 'DRINKING_WATER',
};

export function getSubsectorDisplayLabel(
  t: TranslateFn,
  subSector?: string | null,
  fallbackLabel?: string | null,
): string {
  const normalizedCode = subSector?.trim() || '';
  const mappedCode = LEGACY_SUBSECTOR_CODE_MAP[normalizedCode] || normalizedCode;

  if (mappedCode) {
    const translationKey = `subsectors.${mappedCode}`;
    const translated = t(translationKey);
    if (translated !== translationKey) {
      return translated;
    }
  }

  if (fallbackLabel && fallbackLabel.trim()) {
    return fallbackLabel;
  }

  if (normalizedCode) {
    return normalizedCode
      .replace(/^SUBSECTOR_/, 'Subsector ')
      .replaceAll('_', ' ');
  }

  return '';
}
