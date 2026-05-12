import { apiClient } from '@app/api/apiClient';

export type OrganizationAlertSchedule = 'daily' | 'weekly' | 'unsubscribe';
export type OrganizationAlertFormat = 'summary' | 'detailed';

export interface OrganizationUserPreferences {
  id?: string | number;
  user_id?: string | number;
  userId?: string | number;
  organization_id?: string | number;
  organizationId?: string | number;
  sectors: string[];
  sector_specialities: string[];
  sectorSpecialities?: string[];
  regions: string[];
  countries: string[];
  funding_agencies: string[];
  fundingAgencies?: string[];
  alert_schedule: OrganizationAlertSchedule;
  alertSchedule?: OrganizationAlertSchedule;
  alert_format: OrganizationAlertFormat;
  alertFormat?: OrganizationAlertFormat;
  procurement_types: string[];
  procurementTypes?: string[];
  notice_types: string[];
  noticeTypes?: string[];
  user_administrator_emails?: string[];
  userAdministratorEmails?: string[];
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_ORGANIZATION_USER_PREFERENCES: OrganizationUserPreferences = {
  sectors: [],
  sector_specialities: [],
  regions: [],
  countries: [],
  funding_agencies: [],
  alert_schedule: 'daily',
  alert_format: 'summary',
  procurement_types: [],
  notice_types: [],
};

const arrayValue = (value: unknown): string[] => (Array.isArray(value) ? value.map(String) : []);

export const normalizeOrganizationUserPreferences = (
  value?: Partial<OrganizationUserPreferences> | null,
): OrganizationUserPreferences => {
  if (!value) {
    return { ...DEFAULT_ORGANIZATION_USER_PREFERENCES };
  }

  return {
    ...DEFAULT_ORGANIZATION_USER_PREFERENCES,
    ...value,
    sectors: arrayValue(value.sectors),
    sector_specialities: arrayValue(value.sector_specialities ?? value.sectorSpecialities),
    regions: arrayValue(value.regions),
    countries: arrayValue(value.countries),
    funding_agencies: arrayValue(value.funding_agencies ?? value.fundingAgencies),
    alert_schedule: value.alert_schedule ?? value.alertSchedule ?? 'daily',
    alert_format: value.alert_format ?? value.alertFormat ?? 'summary',
    procurement_types: arrayValue(value.procurement_types ?? value.procurementTypes),
    notice_types: arrayValue(value.notice_types ?? value.noticeTypes),
    user_administrator_emails: arrayValue(value.user_administrator_emails ?? value.userAdministratorEmails),
  };
};

export const organizationUserPreferencesService = {
  getMyPreferences: async () => {
    const response = await apiClient.get<OrganizationUserPreferences | { data?: OrganizationUserPreferences }>(
      '/organization-user-preferences/me',
    );
    return normalizeOrganizationUserPreferences('data' in Object(response) ? (response as any).data : response);
  },

  saveMyPreferences: async (preferences: OrganizationUserPreferences) => {
    const response = await apiClient.put<OrganizationUserPreferences | { data?: OrganizationUserPreferences }>(
      '/organization-user-preferences/me',
      preferences,
    );
    return normalizeOrganizationUserPreferences('data' in Object(response) ? (response as any).data : response);
  },
};
