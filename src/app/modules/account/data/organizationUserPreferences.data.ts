import { COUNTRY_GROUPS } from '@app/modules/expert/data/expertSearchFilters';

export type OrganizationPreferenceOption = {
  id: string;
  label: string;
};

export type OrganizationCountryRegion = OrganizationPreferenceOption & {
  countries: OrganizationPreferenceOption[];
};

export const ORGANIZATION_SECTORS: OrganizationPreferenceOption[] = [
  { id: 'agr-rural-dev', label: 'Agr. & Rural Dev.' },
  { id: 'comm-pr-info', label: 'Comm. & PR & Info' },
  { id: 'constr-engineering', label: 'Constr. & Engineering' },
  { id: 'consumer-protection', label: 'Consumer Protection' },
  { id: 'economic-dev', label: 'Economic Dev.' },
  { id: 'education', label: 'Education' },
  { id: 'energy', label: 'Energy' },
  { id: 'environment', label: 'Environment' },
  { id: 'finance-banking', label: 'Finance & Banking' },
  { id: 'health', label: 'Health' },
  { id: 'humanitarian-aid', label: 'Humanitarian Aid' },
  { id: 'it', label: 'IT' },
  { id: 'law', label: 'Law' },
  { id: 'prog-management', label: 'Prog. Management' },
  { id: 'public-administration', label: 'Public Administration' },
  { id: 'science-research', label: 'Science & Research' },
  { id: 'social', label: 'Social' },
  { id: 'telecommunications', label: 'Telecommunications' },
  { id: 'trade-industry', label: 'Trade & Industry' },
  { id: 'transport', label: 'Transport' },
  { id: 'dev-transport', label: 'DEV Transport' },
  { id: 'urban-development', label: 'Urban Development' },
  { id: 'online-networking-event', label: 'Online Networking Event' },
  { id: 'testing-quality-control', label: 'Testing/Quality Control' },
];

export const ORGANIZATION_SECTOR_SPECIALITIES: OrganizationPreferenceOption[] = [
  { id: 'credit-insurance-clearing-economics-finance', label: 'Credit/Insurance/Clearing / Economics/Finance' },
  { id: 'cultivation-harvesting-crop', label: 'Cultivation/Harvesting / Crop' },
  { id: 'drying-processing-scarifying-pelletizing', label: 'Drying/Processing/Scarifying/Pelletizing' },
  { id: 'early-warning-systems-surveillance-crops', label: 'Early Warning Systems/Surveillance (Crops)' },
  { id: 'farm-cooperatives-community-participation', label: 'Farm/Co-operatives/Associations/Community Centres / Community Participation' },
  { id: 'fisheries-aquaculture', label: 'Fisheries/Aquaculture' },
  { id: 'forestry', label: 'Forestry' },
  { id: 'fruits-vegetables', label: 'Fruits & Vegetables' },
  { id: 'horticulture', label: 'Horticulture' },
  { id: 'land-erosion-soil-conservation', label: 'Land/Erosion/Soil/Conservation' },
  { id: 'mapping-cadastre', label: 'Mapping/Cadastre' },
  { id: 'meat-dairy', label: 'Meat & Dairy' },
  { id: 'mechanisation-production', label: 'Mechanisation/Production' },
  { id: 'packaging-storage-distribution-marketing', label: 'Packaging/Storage/Distribution/Marketing' },
  { id: 'pest-disease-weed', label: 'Pest/Disease/Weed' },
  { id: 'policy-planning-systems-institutions', label: 'Policy/Planning/Systems/Institutions' },
  { id: 'procurement-machinery-equipment-infrastructure', label: 'Procurement / Machinery/Equipment/Infrastructure' },
  { id: 'seeds-fertilisers-agro-chemicals-pesticides', label: 'Seeds / Fertilisers / Agro-Chemicals / Pesticides/Insecticides' },
  { id: 'semi-arid-arid-agriculture', label: 'Semi-arid & arid agriculture' },
  { id: 'sub-tropical-tropical-agriculture', label: 'Sub-tropical & tropical agriculture' },
  { id: 'veterinary', label: 'Veterinary' },
  { id: 'water-drainage-irrigation-flood-well-hydrology', label: 'Water/Drainage/Irrigation/Flood/Well/Hydrology/Water' },
];

const slugifyPreferenceId = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const ORGANIZATION_COUNTRY_REGIONS: OrganizationCountryRegion[] = [
  ...COUNTRY_GROUPS.map((region) => ({
    id: slugifyPreferenceId(region.label),
    label: region.label,
    countries: region.options.map((country) => ({
      id: slugifyPreferenceId(country),
      label: country,
    })),
  })),
  { id: 'home-based', label: 'Home-Based', countries: [] },
  { id: 'multi-country', label: 'Multi-country', countries: [] },
];

export const ORGANIZATION_FUNDING_AGENCIES: OrganizationPreferenceOption[] = [
  { id: 'adb', label: 'ADB - Asian Development Bank' },
  { id: 'afdb', label: 'AfDB - African Development Bank' },
  { id: 'fcdo', label: 'FCDO - The Foreign, Commonwealth and Development Office' },
  { id: 'eu-institutions-agencies', label: 'EU institutions and agencies' },
  { id: 'ebrd', label: 'EBRD - European Bank for Reconstruction and Development' },
];

export const ORGANIZATION_PROCUREMENT_TYPES: OrganizationPreferenceOption[] = [
  { id: 'services', label: 'Services' },
  { id: 'supplies', label: 'Supplies' },
  { id: 'works', label: 'Works' },
  { id: 'grants', label: 'Grants' },
];

export const ORGANIZATION_NOTICE_TYPES: OrganizationPreferenceOption[] = [
  { id: 'individual-consultants', label: 'Receive notices for Individual consultants' },
  { id: 'twinning-opportunities', label: 'Receive notices with Twinning opportunities' },
];
