// DTO Types for Tenders Module
// Based on 19_DTO_ARCHITECTURE.md

export enum TenderStatusEnum {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  AWARDED = 'AWARDED',
  CANCELLED = 'CANCELLED'
}

// Procurement Type - Type d'approvisionnement
export enum ProcurementTypeEnum {
  SERVICES = 'SERVICES',
  EQUIPMENT = 'EQUIPMENT',
  WORKS = 'WORKS',
  GRANTS = 'GRANTS',
  INDIVIDUAL_CONSULTANTS = 'INDIVIDUAL_CONSULTANTS'
}

// Notice Type - Type d'avis
export enum NoticeTypeEnum {
  EARLY_INTELLIGENCE = 'EARLY_INTELLIGENCE',
  FORECAST_PRIOR_NOTICE = 'FORECAST_PRIOR_NOTICE',
  PROJECT_NOTICE = 'PROJECT_NOTICE'
}

export enum MatchingAlertCategoryEnum {
  PROJECTS = 'PROJECTS',
  AWARDS = 'AWARDS',
  SHORTLISTS = 'SHORTLISTS',
  BIN = 'BIN'
}

// Regions - Régions géographiques
export enum RegionEnum {
  CENTRAL_EASTERN_EUROPE = 'CENTRAL_EASTERN_EUROPE', // 14 pays
  SOUTHEASTERN_EUROPE = 'SOUTHEASTERN_EUROPE', // 10 pays
  WESTERN_EUROPE = 'WESTERN_EUROPE', // 28 pays
  CENTRAL_AFRICA = 'CENTRAL_AFRICA', // 10 pays
  EAST_AFRICA = 'EAST_AFRICA', // 15 pays
  NORTH_AFRICA = 'NORTH_AFRICA', // 7 pays
  SOUTHERN_AFRICA = 'SOUTHERN_AFRICA', // 12 pays
  WEST_AFRICA = 'WEST_AFRICA', // 16 pays
  CENTRAL_ASIA = 'CENTRAL_ASIA', // 5 pays
  MIDDLE_EAST = 'MIDDLE_EAST', // 15 pays
  NORTHEAST_ASIA = 'NORTHEAST_ASIA', // 7 pays
  SOUTHEAST_ASIA = 'SOUTHEAST_ASIA', // 12 pays
  SOUTH_ASIA = 'SOUTH_ASIA', // 9 pays
  OCEANIA = 'OCEANIA', // 25 pays
  CENTRAL_AMERICA = 'CENTRAL_AMERICA', // 33 pays
  NORTH_AMERICA = 'NORTH_AMERICA', // 3 pays
  SOUTH_AMERICA = 'SOUTH_AMERICA' // 16 pays
}

// Region country counts
export const REGION_COUNTRY_COUNTS: Record<RegionEnum, number> = {
  [RegionEnum.CENTRAL_EASTERN_EUROPE]: 14,
  [RegionEnum.SOUTHEASTERN_EUROPE]: 10,
  [RegionEnum.WESTERN_EUROPE]: 28,
  [RegionEnum.CENTRAL_AFRICA]: 10,
  [RegionEnum.EAST_AFRICA]: 15,
  [RegionEnum.NORTH_AFRICA]: 7,
  [RegionEnum.SOUTHERN_AFRICA]: 12,
  [RegionEnum.WEST_AFRICA]: 16,
  [RegionEnum.CENTRAL_ASIA]: 5,
  [RegionEnum.MIDDLE_EAST]: 15,
  [RegionEnum.NORTHEAST_ASIA]: 7,
  [RegionEnum.SOUTHEAST_ASIA]: 12,
  [RegionEnum.SOUTH_ASIA]: 9,
  [RegionEnum.OCEANIA]: 25,
  [RegionEnum.CENTRAL_AMERICA]: 33,
  [RegionEnum.NORTH_AMERICA]: 3,
  [RegionEnum.SOUTH_AMERICA]: 16
};

// Funding Agencies - Bailleurs de fonds
export enum FundingAgencyEnum {
  ADB = 'ADB',
  AFDB = 'AFDB',
  DFID_FCDO = 'DFID_FCDO',
  EU_INSTITUTIONS = 'EU_INSTITUTIONS',
  EBRD = 'EBRD',
  EC = 'EC',
  EIB = 'EIB',
  CEB = 'CEB',
  CEI = 'CEI',
  CJEU = 'CJEU',
  COE = 'COE',
  EBA = 'EBA',
  ECC = 'ECC',
  EDB = 'EDB',
  EFI = 'EFI',
  EITI = 'EITI',
  EP = 'EP',
  EPO = 'EPO',
  ETF = 'ETF',
  EUCON = 'EUCON',
  EUDA = 'EUDA',
  EWA = 'EWA',
  INTPA = 'INTPA',
  POEU = 'POEU',
  IADB = 'IADB',
  USAID = 'USAID',
  WB = 'WB',
  ACTED = 'ACTED',
  ADC = 'ADC',
  ADE = 'ADE',
  AECID = 'AECID',
  AFD = 'AFD',
  AICS = 'AICS',
  AIIB = 'AIIB',
  AITF = 'AITF',
  AMC = 'AMC',
  ANR = 'ANR',
  APEC = 'APEC',
  APH = 'APH',
  AUSAID = 'AUSAID',
  BADEA = 'BADEA',
  BCEAO = 'BCEAO',
  BIDC_EBID = 'BIDC_EBID',
  BMGF = 'BMGF',
  BOAD = 'BOAD',
  CABEI = 'CABEI',
  CAF = 'CAF',
  CDB = 'CDB',
  CEFTA = 'CEFTA',
  CEPF = 'CEPF',
  CIDA = 'CIDA',
  CILSS = 'CILSS',
  CMMP = 'CMMP',
  CS = 'CS',
  CTBTO = 'CTBTO',
  CZDA = 'CZDA',
  DANIDA = 'DANIDA',
  DBSA = 'DBSA',
  DFC = 'DFC',
  EAC = 'EAC',
  ECREEE = 'ECREEE',
  EF = 'EF',
  EMHRF = 'EMHRF',
  ENABEL_BTC = 'ENABEL_BTC',
  ENERGYCOM = 'ENERGYCOM',
  ERA = 'ERA',
  ESA = 'ESA',
  FAO = 'FAO',
  FINNIDA = 'FINNIDA',
  FIRST = 'FIRST',
  FMO = 'FMO',
  FORMIN = 'FORMIN',
  GCA = 'GCA',
  GCF = 'GCF',
  GEF = 'GEF',
  GF = 'GF',
  GGGI = 'GGGI',
  GIZ = 'GIZ',
  GN = 'GN',
  GTAI = 'GTAI',
  IAEA = 'IAEA',
  IAP = 'IAP',
  ICAO = 'ICAO',
  ICC = 'ICC',
  IDBZ = 'IDBZ',
  IDRC = 'IDRC',
  IFAD = 'IFAD',
  IFC = 'IFC',
  IFES = 'IFES',
  IHI = 'IHI',
  ILO = 'ILO',
  IMO = 'IMO',
  INTERPOL = 'INTERPOL',
  IOM = 'IOM',
  IRENA = 'IRENA',
  IRISHAID = 'IRISHAID',
  IRW = 'IRW',
  ISA = 'ISA',
  ISDB = 'ISDB',
  ITC = 'ITC',
  ITU = 'ITU',
  IUCN = 'IUCN',
  JICA = 'JICA',
  JICS = 'JICS',
  JSIF = 'JSIF',
  KENHA = 'KENHA',
  KFAED = 'KFAED',
  KFW = 'KFW',
  KOICA = 'KOICA',
  LAUDES = 'LAUDES',
  LUXDEV = 'LUXDEV',
  MCC = 'MCC',
  MRC = 'MRC',
  NADB = 'NADB',
  NATO = 'NATO',
  NDB = 'NDB',
  NDF = 'NDF',
  NEFCO = 'NEFCO',
  NORAD = 'NORAD',
  NUFFIC = 'NUFFIC',
  NZAID = 'NZAID',
  OAS = 'OAS',
  OECD = 'OECD',
  OECS = 'OECS',
  OFID = 'OFID',
  OIF = 'OIF',
  OMVS = 'OMVS',
  ONA = 'ONA',
  OPCW = 'OPCW',
  OSCE = 'OSCE',
  PAHO = 'PAHO',
  PIFS = 'PIFS',
  R2HC = 'R2HC',
  RVO = 'RVO',
  SADC = 'SADC',
  SDC = 'SDC',
  SDF = 'SDF',
  SEAI = 'SEAI',
  SECO = 'SECO',
  SFD = 'SFD',
  SIDA = 'SIDA',
  SPC = 'SPC',
  TUNEPS = 'TUNEPS',
  UK_DBIS = 'UK_DBIS',
  UK_DECC = 'UK_DECC',
  UN = 'UN',
  UNAIDS = 'UNAIDS',
  UNCDF = 'UNCDF',
  UNDP = 'UNDP',
  UNEP = 'UNEP',
  UNESCO = 'UNESCO',
  UNFCCC = 'UNFCCC',
  UNFPA = 'UNFPA',
  UN_HABITAT = 'UN_HABITAT',
  UNHCR = 'UNHCR',
  UNICEF = 'UNICEF',
  UNICRI = 'UNICRI',
  UNIDO = 'UNIDO',
  UNODC = 'UNODC',
  UNOPS = 'UNOPS',
  UNRA = 'UNRA',
  UNRWA = 'UNRWA',
  UNU = 'UNU',
  UNV = 'UNV',
  UNW = 'UNW',
  UNWFP = 'UNWFP',
  UPU = 'UPU',
  USSTATE = 'USSTATE',
  USTDA = 'USTDA',
  WHO = 'WHO',
  WIPO = 'WIPO',
  WMO = 'WMO',
  WPHF = 'WPHF',
  WTO = 'WTO',
  ZRDA = 'ZRDA'
}

export enum SectorEnum {
  EDUCATION = 'EDUCATION',
  HEALTH = 'HEALTH',
  AGRICULTURE = 'AGRICULTURE',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  GOVERNANCE = 'GOVERNANCE',
  ENVIRONMENT = 'ENVIRONMENT',
  WATER_SANITATION = 'WATER_SANITATION',
  ENERGY = 'ENERGY',
  GENDER = 'GENDER',
  HUMAN_RIGHTS = 'HUMAN_RIGHTS',
  YOUTH = 'YOUTH',
  EMERGENCY_RESPONSE = 'EMERGENCY_RESPONSE',
  OTHER = 'OTHER'
}

export enum SubSectorEnum {
  // Education
  PRIMARY_EDUCATION = 'PRIMARY_EDUCATION',
  SECONDARY_EDUCATION = 'SECONDARY_EDUCATION',
  HIGHER_EDUCATION = 'HIGHER_EDUCATION',
  VOCATIONAL_TRAINING = 'VOCATIONAL_TRAINING',
  TEACHER_TRAINING = 'TEACHER_TRAINING',
  ADULT_EDUCATION = 'ADULT_EDUCATION',
  
  // Health
  PRIMARY_HEALTHCARE = 'PRIMARY_HEALTHCARE',
  MATERNAL_HEALTH = 'MATERNAL_HEALTH',
  CHILD_HEALTH = 'CHILD_HEALTH',
  INFECTIOUS_DISEASES = 'INFECTIOUS_DISEASES',
  NUTRITION = 'NUTRITION',
  MENTAL_HEALTH = 'MENTAL_HEALTH',
  
  // Agriculture
  CROP_PRODUCTION = 'CROP_PRODUCTION',
  LIVESTOCK = 'LIVESTOCK',
  FISHERIES = 'FISHERIES',
  IRRIGATION = 'IRRIGATION',
  AGRIBUSINESS = 'AGRIBUSINESS',
  FOOD_SECURITY = 'FOOD_SECURITY',
  
  // Infrastructure
  ROADS = 'ROADS',
  BRIDGES = 'BRIDGES',
  BUILDINGS = 'BUILDINGS',
  TELECOMMUNICATIONS = 'TELECOMMUNICATIONS',
  PORTS = 'PORTS',
  AIRPORTS = 'AIRPORTS',
  
  // Governance
  PUBLIC_ADMINISTRATION = 'PUBLIC_ADMINISTRATION',
  DECENTRALIZATION = 'DECENTRALIZATION',
  ANTI_CORRUPTION = 'ANTI_CORRUPTION',
  CIVIL_SOCIETY = 'CIVIL_SOCIETY',
  ELECTIONS = 'ELECTIONS',
  JUSTICE_REFORM = 'JUSTICE_REFORM',
  
  // Environment
  CLIMATE_CHANGE = 'CLIMATE_CHANGE',
  BIODIVERSITY = 'BIODIVERSITY',
  POLLUTION_CONTROL = 'POLLUTION_CONTROL',
  WASTE_MANAGEMENT = 'WASTE_MANAGEMENT',
  FORESTRY = 'FORESTRY',
  CONSERVATION = 'CONSERVATION',
  
  // Water & Sanitation
  DRINKING_WATER = 'DRINKING_WATER',
  WASTEWATER = 'WASTEWATER',
  SANITATION_FACILITIES = 'SANITATION_FACILITIES',
  HYGIENE_PROMOTION = 'HYGIENE_PROMOTION',
  WATER_RESOURCES = 'WATER_RESOURCES',
  
  // Energy
  RENEWABLE_ENERGY = 'RENEWABLE_ENERGY',
  ELECTRICITY_GRID = 'ELECTRICITY_GRID',
  OFF_GRID_SOLUTIONS = 'OFF_GRID_SOLUTIONS',
  ENERGY_EFFICIENCY = 'ENERGY_EFFICIENCY',
  SOLAR_POWER = 'SOLAR_POWER',
  
  // Gender
  GENDER_EQUALITY = 'GENDER_EQUALITY',
  WOMENS_EMPOWERMENT = 'WOMENS_EMPOWERMENT',
  GBV_PREVENTION = 'GBV_PREVENTION',
  ECONOMIC_INCLUSION = 'ECONOMIC_INCLUSION',
  
  // Human Rights
  CIVIL_RIGHTS = 'CIVIL_RIGHTS',
  REFUGEE_PROTECTION = 'REFUGEE_PROTECTION',
  DISABILITY_RIGHTS = 'DISABILITY_RIGHTS',
  MINORITY_RIGHTS = 'MINORITY_RIGHTS',
  
  // Youth
  YOUTH_EMPLOYMENT = 'YOUTH_EMPLOYMENT',
  YOUTH_ENGAGEMENT = 'YOUTH_ENGAGEMENT',
  YOUTH_EDUCATION = 'YOUTH_EDUCATION',
  YOUTH_HEALTH = 'YOUTH_HEALTH',
  
  // Emergency Response
  DISASTER_RELIEF = 'DISASTER_RELIEF',
  HUMANITARIAN_AID = 'HUMANITARIAN_AID',
  CONFLICT_RESPONSE = 'CONFLICT_RESPONSE',
  DISPLACEMENT = 'DISPLACEMENT',
}

// Mapping of sectors to their subsectors
export const SECTOR_SUBSECTOR_MAP: Record<SectorEnum, SubSectorEnum[]> = {
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

export enum CurrencyEnum {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  CHF = 'CHF',
  CAD = 'CAD'
}

export enum CountryEnum {
  FR = 'FR',
  DE = 'DE',
  GB = 'GB',
  US = 'US',
  CA = 'CA',
  KE = 'KE',
  TZ = 'TZ',
  SN = 'SN',
  CI = 'CI',
  MA = 'MA',
  POLAND = 'PL',
  CZECK_REPUBLIC = 'CZ',
  HUNGARY = 'HU',
  SLOVAKIA = 'SK',
  SLOVENIA = 'SI',
  ALBANIA = 'AL',
  BOSNIA_HERZEGOVINA = 'BA',
  BULGARIA = 'BG',
  CROATIA = 'HR',
  MONTENEGRO = 'ME',
  SERBIA = 'RS',
  FRANCE = 'FR',
  GERMANY = 'DE',
  UNITED_KINGDOM = 'GB',
  SPAIN = 'ES',
  ITALY = 'IT',
  BELGIUM = 'BE',
  NETHERLANDS = 'NL',
  SWITZERLAND = 'CH',
  AUSTRIA = 'AT',
  PORTUGAL = 'PT',
  CAMEROON = 'CM',
  CHAD = 'TD',
  CENTRAL_AFRICAN_REPUBLIC = 'CF',
  CONGO = 'CG',
  DEMOCRATIC_REPUBLIC_OF_CONGO = 'CD',
  GABON = 'GA',
  KENYA = 'KE',
  TANZANIA = 'TZ',
  UGANDA = 'UG',
  ETHIOPIA = 'ET',
  RWANDA = 'RW',
  BURUNDI = 'BI',
  SOMALIA = 'SO',
  EGYPT = 'EG',
  MOROCCO = 'MA',
  TUNISIA = 'TN',
  ALGERIA = 'DZ',
  LIBYA = 'LY',
  SOUTH_AFRICA = 'ZA',
  ZIMBABWE = 'ZW',
  ZAMBIA = 'ZM',
  MOZAMBIQUE = 'MZ',
  BOTSWANA = 'BW',
  NAMIBIA = 'NA',
  NIGERIA = 'NG',
  GHANA = 'GH',
  SENEGAL = 'SN',
  IVORY_COAST = 'CI',
  MALI = 'ML',
  NIGER = 'NE',
  BURKINA_FASO = 'BF',
  BENIN = 'BJ',
  TOGO = 'TG',
  KAZAKHSTAN = 'KZ',
  UZBEKISTAN = 'UZ',
  TURKMENISTAN = 'TM',
  KYRGYZSTAN = 'KG',
  TAJIKISTAN = 'TJ',
  SAUDI_ARABIA = 'SA',
  UAE = 'AE',
  QATAR = 'QA',
  KUWAIT = 'KW',
  BAHRAIN = 'BH',
  OMAN = 'OM',
  JORDAN = 'JO',
  LEBANON = 'LB',
  IRAQ = 'IQ',
  YEMEN = 'YE',
  CHINA = 'CN',
  JAPAN = 'JP',
  SOUTH_KOREA = 'KR',
  NORTH_KOREA = 'KP',
  MONGOLIA = 'MN',
  THAILAND = 'TH',
  VIETNAM = 'VN',
  PHILIPPINES = 'PH',
  INDONESIA = 'ID',
  MALAYSIA = 'MY',
  SINGAPORE = 'SG',
  MYANMAR = 'MM',
  CAMBODIA = 'KH',
  INDIA = 'IN',
  PAKISTAN = 'PK',
  BANGLADESH = 'BD',
  SRI_LANKA = 'LK',
  NEPAL = 'NP',
  AFGHANISTAN = 'AF',
  AUSTRALIA = 'AU',
  NEW_ZEALAND = 'NZ',
  FIJI = 'FJ',
  PAPUA_NEW_GUINEA = 'PG',
  MEXICO = 'MX',
  GUATEMALA = 'GT',
  HONDURAS = 'HN',
  EL_SALVADOR = 'SV',
  NICARAGUA = 'NI',
  COSTA_RICA = 'CR',
  PANAMA = 'PA',
  UNITED_STATES = 'US',
  CANADA = 'CA',
  BRAZIL = 'BR',
  ARGENTINA = 'AR',
  COLOMBIA = 'CO',
  PERU = 'PE',
  CHILE = 'CL',
  VENEZUELA = 'VE',
  ECUADOR = 'EC',
  BOLIVIA = 'BO'
}

// Region to Countries mapping (similar to SECTOR_SUBSECTOR_MAP)
export const REGION_COUNTRY_MAP: Record<RegionEnum, CountryEnum[]> = {
  [RegionEnum.CENTRAL_EASTERN_EUROPE]: [
    CountryEnum.POLAND,
    CountryEnum.CZECK_REPUBLIC,
    CountryEnum.HUNGARY,
    CountryEnum.SLOVAKIA,
    CountryEnum.SLOVENIA,
  ],
  [RegionEnum.SOUTHEASTERN_EUROPE]: [
    CountryEnum.ALBANIA,
    CountryEnum.BOSNIA_HERZEGOVINA,
    CountryEnum.BULGARIA,
    CountryEnum.CROATIA,
    CountryEnum.MONTENEGRO,
    CountryEnum.SERBIA,
  ],
  [RegionEnum.WESTERN_EUROPE]: [
    CountryEnum.FRANCE,
    CountryEnum.GERMANY,
    CountryEnum.UNITED_KINGDOM,
    CountryEnum.SPAIN,
    CountryEnum.ITALY,
    CountryEnum.BELGIUM,
    CountryEnum.NETHERLANDS,
    CountryEnum.SWITZERLAND,
    CountryEnum.AUSTRIA,
    CountryEnum.PORTUGAL,
  ],
  [RegionEnum.CENTRAL_AFRICA]: [
    CountryEnum.CAMEROON,
    CountryEnum.CHAD,
    CountryEnum.CENTRAL_AFRICAN_REPUBLIC,
    CountryEnum.CONGO,
    CountryEnum.DEMOCRATIC_REPUBLIC_OF_CONGO,
    CountryEnum.GABON,
  ],
  [RegionEnum.EAST_AFRICA]: [
    CountryEnum.KENYA,
    CountryEnum.TANZANIA,
    CountryEnum.UGANDA,
    CountryEnum.ETHIOPIA,
    CountryEnum.RWANDA,
    CountryEnum.BURUNDI,
    CountryEnum.SOMALIA,
  ],
  [RegionEnum.NORTH_AFRICA]: [
    CountryEnum.EGYPT,
    CountryEnum.MOROCCO,
    CountryEnum.TUNISIA,
    CountryEnum.ALGERIA,
    CountryEnum.LIBYA,
  ],
  [RegionEnum.SOUTHERN_AFRICA]: [
    CountryEnum.SOUTH_AFRICA,
    CountryEnum.ZIMBABWE,
    CountryEnum.ZAMBIA,
    CountryEnum.MOZAMBIQUE,
    CountryEnum.BOTSWANA,
    CountryEnum.NAMIBIA,
  ],
  [RegionEnum.WEST_AFRICA]: [
    CountryEnum.NIGERIA,
    CountryEnum.GHANA,
    CountryEnum.SENEGAL,
    CountryEnum.IVORY_COAST,
    CountryEnum.MALI,
    CountryEnum.NIGER,
    CountryEnum.BURKINA_FASO,
    CountryEnum.BENIN,
    CountryEnum.TOGO,
  ],
  [RegionEnum.CENTRAL_ASIA]: [
    CountryEnum.KAZAKHSTAN,
    CountryEnum.UZBEKISTAN,
    CountryEnum.TURKMENISTAN,
    CountryEnum.KYRGYZSTAN,
    CountryEnum.TAJIKISTAN,
  ],
  [RegionEnum.MIDDLE_EAST]: [
    CountryEnum.SAUDI_ARABIA,
    CountryEnum.UAE,
    CountryEnum.QATAR,
    CountryEnum.KUWAIT,
    CountryEnum.BAHRAIN,
    CountryEnum.OMAN,
    CountryEnum.JORDAN,
    CountryEnum.LEBANON,
    CountryEnum.IRAQ,
    CountryEnum.YEMEN,
  ],
  [RegionEnum.NORTHEAST_ASIA]: [
    CountryEnum.CHINA,
    CountryEnum.JAPAN,
    CountryEnum.SOUTH_KOREA,
    CountryEnum.NORTH_KOREA,
    CountryEnum.MONGOLIA,
  ],
  [RegionEnum.SOUTHEAST_ASIA]: [
    CountryEnum.THAILAND,
    CountryEnum.VIETNAM,
    CountryEnum.PHILIPPINES,
    CountryEnum.INDONESIA,
    CountryEnum.MALAYSIA,
    CountryEnum.SINGAPORE,
    CountryEnum.MYANMAR,
    CountryEnum.CAMBODIA,
  ],
  [RegionEnum.SOUTH_ASIA]: [
    CountryEnum.INDIA,
    CountryEnum.PAKISTAN,
    CountryEnum.BANGLADESH,
    CountryEnum.SRI_LANKA,
    CountryEnum.NEPAL,
    CountryEnum.AFGHANISTAN,
  ],
  [RegionEnum.OCEANIA]: [
    CountryEnum.AUSTRALIA,
    CountryEnum.NEW_ZEALAND,
    CountryEnum.FIJI,
    CountryEnum.PAPUA_NEW_GUINEA,
  ],
  [RegionEnum.CENTRAL_AMERICA]: [
    CountryEnum.MEXICO,
    CountryEnum.GUATEMALA,
    CountryEnum.HONDURAS,
    CountryEnum.EL_SALVADOR,
    CountryEnum.NICARAGUA,
    CountryEnum.COSTA_RICA,
    CountryEnum.PANAMA,
  ],
  [RegionEnum.NORTH_AMERICA]: [
    CountryEnum.UNITED_STATES,
    CountryEnum.CANADA,
  ],
  [RegionEnum.SOUTH_AMERICA]: [
    CountryEnum.BRAZIL,
    CountryEnum.ARGENTINA,
    CountryEnum.COLOMBIA,
    CountryEnum.PERU,
    CountryEnum.CHILE,
    CountryEnum.VENEZUELA,
    CountryEnum.ECUADOR,
    CountryEnum.BOLIVIA,
  ],
};

export interface MoneyDTO {
  amount: number;
  currency: CurrencyEnum;
  formatted: string;
}

export interface OrganizationSummaryDTO {
  id: string;
  name: string;
  logo?: string;
  type: string;
  country: CountryEnum;
  isVerified: boolean;
}

export interface TenderListDTO {
  id: string;
  referenceNumber: string;
  title: string;
  organizationName: string;
  country: CountryEnum;
  deadline: Date;
  daysRemaining: number;
  budget: MoneyDTO;
  status: TenderStatusEnum;
  matchScore?: number;
  sectors: SectorEnum[];
  subsectors?: SubSectorEnum[]; // Added subsectors field
  createdAt: Date;
  proposalsCount?: number;
  interestedOrgsCount?: number;
  fundingAgency?: FundingAgencyEnum; // Added funding agency field
  procurementType?: ProcurementTypeEnum; // Added procurement type field
  noticeType?: NoticeTypeEnum; // Added notice type field
  region?: RegionEnum; // Added region field
  countries?: CountryEnum[];
  isMultiCountry?: boolean;
  alertCategory?: MatchingAlertCategoryEnum;
  mostRelevantPartnersCount?: number;
  otherPossiblePartnersCount?: number;
  awardCompanies?: Array<{
    name: string;
    budget: MoneyDTO;
    date: Date;
  }>;
  shortlistCompanies?: Array<{
    name: string;
    date: Date;
  }>;
  torId?: string; // Link to associated Terms of Reference
  // Optional fields for detail view
  description?: string;
  publishedDate?: Date;
  eligibility?: string[];
  documents?: Array<{
    name: string;
    type: string;
    url?: string;
  }>;
  contactEmail?: string;
}

export interface TenderDetailDTO extends TenderListDTO {
  description: string;
  objectives: string[];
  organization: OrganizationSummaryDTO;
  countries: CountryEnum[];
  budgetRange?: {
    min: MoneyDTO;
    max: MoneyDTO;
  };
  documents: Array<{
    name: string;
    type: string;
    url?: string;
    id?: string;
    fileName?: string;
    fileSize?: number;
  }>;
  eligibilityCriteria: Array<{
    criterion: string;
    isMandatory: boolean;
  }>;
  proposalsCount: number;
  interestedOrgsCount: number;
  updatedAt: Date;
}

// Submission DTO
export enum SubmissionStatusEnum {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SHORTLISTED = 'SHORTLISTED',
  AWARDED = 'AWARDED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export interface SubmissionDTO {
  id: string;
  tenderId: string;
  tenderTitle: string;
  tenderReference: string;
  organizationName: string;
  status: SubmissionStatusEnum;
  submittedAt?: Date;
  lastModified: Date;
  deadline: Date;
  budget: MoneyDTO;
  score?: number;
  feedback?: string;
  documents: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    url: string;
  }>;
}

// Invitation DTO
export enum InvitationStatusEnum {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED'
}

export interface InvitationDTO {
  id: string;
  tenderId: string;
  tenderTitle: string;
  tenderReference: string;
  organizationName: string;
  organizationLogo?: string;
  invitedAt: Date;
  expiresAt: Date;
  status: InvitationStatusEnum;
  message?: string;
  budget: MoneyDTO;
  deadline: Date;
  sectors: SectorEnum[];
  matchScore?: number;
}

// Template DTO
export enum TemplateTypeEnum {
  PROPOSAL = 'PROPOSAL',
  BUDGET = 'BUDGET',
  TECHNICAL = 'TECHNICAL',
  FINANCIAL = 'FINANCIAL',
  COVER_LETTER = 'COVER_LETTER',
  OTHER = 'OTHER'
}

export interface TemplateDTO {
  id: string;
  name: string;
  description: string;
  type: TemplateTypeEnum;
  sectors: SectorEnum[];
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  isPublic: boolean;
  fileSize: number;
  fileUrl: string;
  thumbnail?: string;
}

// Pipeline DTO
export interface PipelineStageDTO {
  id: string;
  name: string;
  color: string;
  order: number;
  tenderCount: number;
  totalValue: MoneyDTO;
}

export interface PipelineTenderDTO {
  id: string;
  tenderId: string;
  tenderTitle: string;
  tenderReference: string;
  organizationName: string;
  stage: string;
  probability: number;
  expectedValue: MoneyDTO;
  deadline: Date;
  lastActivity: Date;
  status: TenderStatusEnum;
  sectors: SectorEnum[];
}

export interface PaginationMetaDTO {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponseDTO<T> {
  data: T[];
  meta: PaginationMetaDTO;
}

export interface TenderKPIsDTO {
  totalTenders: number;
  activeTenders: number;
  closedTenders: number;
  awardedTenders: number;
  averageBudget: MoneyDTO;
  averageProposalsPerTender: number;
  successRate: number;
  mySubmissions: number;
  myPendingSubmissions: number;
  myInvitations: number;
  pipelineValue: MoneyDTO;
}

// Terms of Reference (ToR) DTOs
export enum ToRStatusEnum {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  FILLED = 'FILLED'
}

export enum ToRTypeEnum {
  CONSULTANT = 'CONSULTANT',
  TECHNICAL_EXPERT = 'TECHNICAL_EXPERT',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  TEAM_LEADER = 'TEAM_LEADER',
  SPECIALIST = 'SPECIALIST',
  ADVISOR = 'ADVISOR',
  COORDINATOR = 'COORDINATOR',
  OTHER = 'OTHER'
}

export interface ToRListDTO {
  id: string;
  referenceNumber: string;
  title: string;
  tenderId: string;
  tenderTitle: string;
  tenderReference: string;
  organizationName: string;
  country: CountryEnum;
  deadline: Date;
  daysRemaining: number;
  budget?: MoneyDTO;
  status: ToRStatusEnum;
  type: ToRTypeEnum;
  sectors: SectorEnum[];
  subsectors?: SubSectorEnum[];
  fundingAgency?: FundingAgencyEnum;
  region?: RegionEnum;
  experienceYears: number;
  duration: string; // e.g., "6 months", "12 months"
  inPipeline: boolean;
  createdAt: Date;
  matchScore?: number;
}

export interface ToRDetailDTO extends ToRListDTO {
  description: string;
  objectives: string[];
  responsibilities: string[];
  qualifications: string[];
  deliverables: string[];
  countries: CountryEnum[];
  languages: string[];
  educationLevel: string;
  specificSkills: string[];
  documents: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    url: string;
  }>;
  applicationCount: number;
  updatedAt: Date;
}

export interface ToRKPIsDTO {
  totalToRs: number;
  activeToRs: number;
  closedToRs: number;
  filledToRs: number;
  averageBudget: MoneyDTO;
  myApplications: number;
  inPipeline: number;
}