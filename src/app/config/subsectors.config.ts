// Subsector Configuration
// Maps each sector to its available subsectors

import { SectorEnum, SubSectorEnum } from '../types/tender.dto';

export type SubsectorKey = SubSectorEnum;

export const SUBSECTOR_MAP: Record<SectorEnum, SubSectorEnum[]> = {
  [SectorEnum.EDUCATION]: [
    SubSectorEnum.PRIMARY_EDUCATION,
    SubSectorEnum.SECONDARY_EDUCATION,
    SubSectorEnum.HIGHER_EDUCATION,
    SubSectorEnum.VOCATIONAL_TRAINING,
    SubSectorEnum.TEACHER_TRAINING,
    SubSectorEnum.ADULT_EDUCATION,
  ],
  [SectorEnum.HEALTH]: [
    SubSectorEnum.PRIMARY_HEALTHCARE,
    SubSectorEnum.MATERNAL_HEALTH,
    SubSectorEnum.CHILD_HEALTH,
    SubSectorEnum.INFECTIOUS_DISEASES,
    SubSectorEnum.NUTRITION,
    SubSectorEnum.MENTAL_HEALTH,
  ],
  [SectorEnum.AGRICULTURE]: [
    SubSectorEnum.CROP_PRODUCTION,
    SubSectorEnum.LIVESTOCK,
    SubSectorEnum.FISHERIES,
    SubSectorEnum.IRRIGATION,
    SubSectorEnum.AGRIBUSINESS,
    SubSectorEnum.FOOD_SECURITY,
  ],
  [SectorEnum.INFRASTRUCTURE]: [
    SubSectorEnum.ROADS,
    SubSectorEnum.BRIDGES,
    SubSectorEnum.BUILDINGS,
    SubSectorEnum.TELECOMMUNICATIONS,
    SubSectorEnum.PORTS,
    SubSectorEnum.AIRPORTS,
  ],
  [SectorEnum.GOVERNANCE]: [
    SubSectorEnum.PUBLIC_ADMINISTRATION,
    SubSectorEnum.DECENTRALIZATION,
    SubSectorEnum.ANTI_CORRUPTION,
    SubSectorEnum.CIVIL_SOCIETY,
    SubSectorEnum.ELECTIONS,
    SubSectorEnum.JUSTICE_REFORM,
  ],
  [SectorEnum.ENVIRONMENT]: [
    SubSectorEnum.CLIMATE_CHANGE,
    SubSectorEnum.BIODIVERSITY,
    SubSectorEnum.POLLUTION_CONTROL,
    SubSectorEnum.WASTE_MANAGEMENT,
    SubSectorEnum.FORESTRY,
    SubSectorEnum.CONSERVATION,
  ],
  [SectorEnum.WATER_SANITATION]: [
    SubSectorEnum.DRINKING_WATER,
    SubSectorEnum.WASTEWATER,
    SubSectorEnum.SANITATION_FACILITIES,
    SubSectorEnum.HYGIENE_PROMOTION,
    SubSectorEnum.WATER_RESOURCES,
  ],
  [SectorEnum.ENERGY]: [
    SubSectorEnum.RENEWABLE_ENERGY,
    SubSectorEnum.ELECTRICITY_GRID,
    SubSectorEnum.OFF_GRID_SOLUTIONS,
    SubSectorEnum.ENERGY_EFFICIENCY,
    SubSectorEnum.SOLAR_POWER,
  ],
  [SectorEnum.GENDER]: [
    SubSectorEnum.GENDER_EQUALITY,
    SubSectorEnum.WOMENS_EMPOWERMENT,
    SubSectorEnum.GBV_PREVENTION,
    SubSectorEnum.ECONOMIC_INCLUSION,
  ],
  [SectorEnum.HUMAN_RIGHTS]: [
    SubSectorEnum.CIVIL_RIGHTS,
    SubSectorEnum.REFUGEE_PROTECTION,
    SubSectorEnum.DISABILITY_RIGHTS,
    SubSectorEnum.MINORITY_RIGHTS,
  ],
  [SectorEnum.YOUTH]: [
    SubSectorEnum.YOUTH_EMPLOYMENT,
    SubSectorEnum.YOUTH_ENGAGEMENT,
    SubSectorEnum.YOUTH_EDUCATION,
    SubSectorEnum.YOUTH_HEALTH,
  ],
  [SectorEnum.EMERGENCY_RESPONSE]: [
    SubSectorEnum.DISASTER_RELIEF,
    SubSectorEnum.HUMANITARIAN_AID,
    SubSectorEnum.CONFLICT_RESPONSE,
    SubSectorEnum.DISPLACEMENT,
  ],
  [SectorEnum.OTHER]: [],
};

// Alias for compatibility with different naming conventions
export const SECTOR_SUBSECTOR_MAP = SUBSECTOR_MAP;

/**
 * Get available subsectors for a given sector
 */
export function getSubsectorsForSector(sector: SectorEnum | 'all'): SubsectorKey[] {
  if (sector === 'all') {
    return [];
  }
  return SUBSECTOR_MAP[sector] || [];
}

/**
 * Get the translation key for a subsector
 */
export function getSubsectorTranslationKey(sector: SectorEnum, subsector: SubsectorKey): string {
  return `subsectors.${sector}.${subsector}`;
}