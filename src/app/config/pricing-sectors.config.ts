// Sectors available for subscription pricing configuration.
// Extensible: add new sector entries here as the platform grows.
// Each entry references a translation key from src/app/i18n/sectors.ts.

export interface PricingSector {
  id: string;
  labelKey: string;
}

export const PRICING_SECTORS: PricingSector[] = [
  { id: 'EDUCATION',         labelKey: 'sectors.EDUCATION'         },
  { id: 'HEALTH',            labelKey: 'sectors.HEALTH'            },
  { id: 'AGRICULTURE',       labelKey: 'sectors.AGRICULTURE'       },
  { id: 'INFRASTRUCTURE',    labelKey: 'sectors.INFRASTRUCTURE'    },
  { id: 'GOVERNANCE',        labelKey: 'sectors.GOVERNANCE'        },
  { id: 'ENVIRONMENT',       labelKey: 'sectors.ENVIRONMENT'       },
  { id: 'WATER_SANITATION',  labelKey: 'sectors.WATER_SANITATION'  },
  { id: 'ENERGY',            labelKey: 'sectors.ENERGY'            },
  { id: 'GENDER',            labelKey: 'sectors.GENDER'            },
  { id: 'HUMAN_RIGHTS',      labelKey: 'sectors.HUMAN_RIGHTS'      },
  { id: 'YOUTH',             labelKey: 'sectors.YOUTH'             },
  { id: 'EMERGENCY_RESPONSE',labelKey: 'sectors.EMERGENCY_RESPONSE'},
  { id: 'HUMANITARIAN',      labelKey: 'sectors.HUMANITARIAN'      },
  { id: 'FINANCE',           labelKey: 'sectors.FINANCE'           },
  { id: 'TECHNOLOGY',        labelKey: 'sectors.TECHNOLOGY'        },
  { id: 'CULTURE',           labelKey: 'sectors.CULTURE'           },
  { id: 'TRADE',             labelKey: 'sectors.TRADE'             },
  { id: 'OTHER',             labelKey: 'sectors.OTHER'             },
];
