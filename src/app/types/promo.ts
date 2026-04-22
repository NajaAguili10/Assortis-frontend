export interface PromoCodeData {
  code: string;
  isValid: boolean;
  discountPercent: number;
  organizationData?: {
    orgName: string;
    orgEmail: string;
    orgPhone: string;
    contactPersonName: string;
    contactPersonPosition: string;
    orgCountry: string;
    employeeRange: string;
    annualRevenue: string;
    industry: string;
  };
  validUntil?: string;
  isUsed?: boolean;
}
