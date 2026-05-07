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

export const ORGANIZATION_COUNTRY_REGIONS: OrganizationCountryRegion[] = [
  {
    id: 'central-eastern-europe',
    label: 'Central & Eastern Europe',
    countries: [
      { id: 'armenia', label: 'Armenia' },
      { id: 'azerbaijan', label: 'Azerbaijan' },
      { id: 'belarus', label: 'Belarus' },
      { id: 'czech-republic', label: 'Czech Republic' },
      { id: 'estonia', label: 'Estonia' },
      { id: 'georgia', label: 'Georgia' },
      { id: 'hungary', label: 'Hungary' },
      { id: 'latvia', label: 'Latvia' },
      { id: 'lithuania', label: 'Lithuania' },
      { id: 'moldova', label: 'Moldova' },
      { id: 'poland', label: 'Poland' },
      { id: 'russian-federation', label: 'Russian Federation' },
      { id: 'slovakia', label: 'Slovakia' },
      { id: 'slovenia', label: 'Slovenia' },
      { id: 'ukraine', label: 'Ukraine' },
    ],
  },
  { id: 'south-east-europe', label: 'South-East Europe', countries: [] },
  { id: 'western-europe', label: 'Western Europe', countries: [] },
  { id: 'central-africa', label: 'Central Africa', countries: [] },
  { id: 'eastern-africa', label: 'Eastern Africa', countries: [] },
  { id: 'northern-africa', label: 'Northern Africa', countries: [] },
  { id: 'southern-africa', label: 'Southern Africa', countries: [] },
  { id: 'western-africa', label: 'Western Africa', countries: [] },
  { id: 'central-asia', label: 'Central Asia', countries: [] },
  { id: 'middle-east', label: 'Middle East', countries: [] },
  { id: 'north-east-asia', label: 'North-East Asia', countries: [] },
  { id: 'south-east-asia', label: 'South-East Asia', countries: [] },
  { id: 'southern-asia', label: 'Southern Asia', countries: [] },
  { id: 'oceania', label: 'Oceania', countries: [] },
  { id: 'central-america', label: 'Central America', countries: [] },
  { id: 'north-america', label: 'North America', countries: [] },
  { id: 'south-america', label: 'South America', countries: [] },
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
