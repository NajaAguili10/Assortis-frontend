// Mapping of Organization Sectors to their SubSectors
// This extends SECTOR_SUBSECTOR_MAP to include additional organization-specific sectors

import { SubSectorEnum } from '../types/tender.dto';
import { OrganizationSectorEnum } from '../types/organization.dto';

export const ORGANIZATION_SECTOR_SUBSECTOR_MAP: Record<OrganizationSectorEnum, SubSectorEnum[]> = {
  [OrganizationSectorEnum.EDUCATION]: [
    SubSectorEnum.PRIMARY_EDUCATION,
    SubSectorEnum.SECONDARY_EDUCATION,
    SubSectorEnum.HIGHER_EDUCATION,
    SubSectorEnum.VOCATIONAL_TRAINING,
    SubSectorEnum.TEACHER_TRAINING,
    SubSectorEnum.ADULT_EDUCATION,
  ],
  [OrganizationSectorEnum.HEALTH]: [
    SubSectorEnum.PRIMARY_HEALTHCARE,
    SubSectorEnum.MATERNAL_HEALTH,
    SubSectorEnum.CHILD_HEALTH,
    SubSectorEnum.INFECTIOUS_DISEASES,
    SubSectorEnum.NUTRITION,
    SubSectorEnum.MENTAL_HEALTH,
  ],
  [OrganizationSectorEnum.AGRICULTURE]: [
    SubSectorEnum.CROP_PRODUCTION,
    SubSectorEnum.LIVESTOCK,
    SubSectorEnum.FISHERIES,
    SubSectorEnum.IRRIGATION,
    SubSectorEnum.AGRIBUSINESS,
    SubSectorEnum.FOOD_SECURITY,
  ],
  [OrganizationSectorEnum.INFRASTRUCTURE]: [
    SubSectorEnum.ROADS,
    SubSectorEnum.BRIDGES,
    SubSectorEnum.BUILDINGS,
    SubSectorEnum.TELECOMMUNICATIONS,
    SubSectorEnum.PORTS,
    SubSectorEnum.AIRPORTS,
  ],
  [OrganizationSectorEnum.GOVERNANCE]: [
    SubSectorEnum.PUBLIC_ADMINISTRATION,
    SubSectorEnum.DECENTRALIZATION,
    SubSectorEnum.ANTI_CORRUPTION,
    SubSectorEnum.CIVIL_SOCIETY,
    SubSectorEnum.ELECTIONS,
    SubSectorEnum.JUSTICE_REFORM,
  ],
  [OrganizationSectorEnum.ENVIRONMENT]: [
    SubSectorEnum.CLIMATE_CHANGE,
    SubSectorEnum.BIODIVERSITY,
    SubSectorEnum.POLLUTION_CONTROL,
    SubSectorEnum.WASTE_MANAGEMENT,
    SubSectorEnum.FORESTRY,
    SubSectorEnum.CONSERVATION,
  ],
  [OrganizationSectorEnum.WATER_SANITATION]: [
    SubSectorEnum.DRINKING_WATER,
    SubSectorEnum.WASTEWATER,
    SubSectorEnum.SANITATION_FACILITIES,
    SubSectorEnum.HYGIENE_PROMOTION,
    SubSectorEnum.WATER_RESOURCES,
  ],
  [OrganizationSectorEnum.ENERGY]: [
    SubSectorEnum.RENEWABLE_ENERGY,
    SubSectorEnum.ELECTRICITY_GRID,
    SubSectorEnum.OFF_GRID_SOLUTIONS,
    SubSectorEnum.ENERGY_EFFICIENCY,
    SubSectorEnum.SOLAR_POWER,
  ],
  [OrganizationSectorEnum.GENDER]: [
    SubSectorEnum.GENDER_EQUALITY,
    SubSectorEnum.WOMENS_EMPOWERMENT,
    SubSectorEnum.GBV_PREVENTION,
    SubSectorEnum.ECONOMIC_INCLUSION,
  ],
  [OrganizationSectorEnum.YOUTH]: [
    SubSectorEnum.YOUTH_EMPLOYMENT,
    SubSectorEnum.YOUTH_ENGAGEMENT,
    SubSectorEnum.YOUTH_EDUCATION,
    SubSectorEnum.YOUTH_HEALTH,
  ],
  // Organization-specific sectors
  [OrganizationSectorEnum.HUMANITARIAN]: [
    SubSectorEnum.DISASTER_RELIEF,
    SubSectorEnum.HUMANITARIAN_AID,
    SubSectorEnum.CONFLICT_RESPONSE,
    SubSectorEnum.DISPLACEMENT,
  ],
  [OrganizationSectorEnum.FINANCE]: [],
  [OrganizationSectorEnum.TECHNOLOGY]: [],
  [OrganizationSectorEnum.CULTURE]: [],
  [OrganizationSectorEnum.TRADE]: [],
};
