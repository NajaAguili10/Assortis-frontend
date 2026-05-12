import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useAuth } from '@app/contexts/AuthContext';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OrganizationsSubMenu } from '@app/components/OrganizationsSubMenu';
import { SearchSectionTabs, type SearchSectionTab } from '@app/components/SearchSectionTabs';
import { OrganizationVerificationBadge } from '@app/components/OrganizationVerificationBadge';
import { ContactOrganizationDialog } from '@app/components/ContactOrganizationDialog';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@app/components/ui/tabs';
import { Separator } from '@app/components/ui/separator';

import { useOrganizations } from '@app/modules/organization/hooks/useOrganizations';
import {
  Award,
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle,
  CreditCard,
  DollarSign,
  FolderKanban,
  Globe,
  Handshake,
  History,
  ListChecks,
  Mail,
  MapPin,
  Phone,
  Target,
  Users,
} from 'lucide-react';

type LegacyTab = 'contracts' | 'shortlists' | 'statistics' | 'partners' | 'pricing';

type LegacyProjectRow = {
  project: string;
  location: string;
  donor: string;
  role: string;
  budget: string;
  published: string;
};

type LegacyPartnerRow = {
  name: string;
  location: string;
  sectors: string;
  contracts: number;
  shortlists: number;
};

type LegacyOrganizationProfileData = {
  contracts: LegacyProjectRow[];
  shortlists: LegacyProjectRow[];
  partners: LegacyPartnerRow[];
  pricing: {
    averageContract: string;
    medianBudget: string;
    usualRange: string;
    positioning: string;
    notes: string[];
  };
  lastUpdated: string;
};

const DEFAULT_LEGACY_DATA: LegacyOrganizationProfileData = {
  lastUpdated: 'Jul 2024',
  contracts: [
    {
      project: 'Organisational development services',
      location: 'Estonia',
      donor: 'EC',
      role: 'Leader',
      budget: '7 500 000 EUR',
      published: '8 Jul 2024',
    },
    {
      project: 'Provision of interim agent support services',
      location: 'Belgium, Greece',
      donor: 'EC',
      role: 'Leader',
      budget: '1 100 000 EUR',
      published: '22 Mar 2024',
    },
    {
      project: 'Belgium-Brussels: Framework Contract for the Organisation of EU Defence Innovation Scheme Hackathon and Mentoring',
      location: 'Belgium',
      donor: 'EC',
      role: 'Leader',
      budget: '4 000 000 EUR',
      published: '21 Dec 2023',
    },
    {
      project: 'Austria-Vienna: Provision of Interim Personnel for the Delegation of the European Union',
      location: 'Austria',
      donor: 'EC',
      role: 'Leader',
      budget: '870 000 EUR',
      published: '20 Dec 2023',
    },
    {
      project: 'Technical assistance for public administration reform and digital readiness',
      location: 'Moldova',
      donor: 'WB',
      role: 'Consortium',
      budget: '620 000 EUR',
      published: '15 Sep 2023',
    },
  ],
  shortlists: [
    {
      project: 'Support to public finance management reform programme',
      location: 'Georgia',
      donor: 'ADB',
      role: 'Leader',
      budget: '-',
      published: '12 Jul 2024',
    },
    {
      project: 'EU policy dialogue facility and knowledge management support',
      location: 'Serbia',
      donor: 'EC',
      role: 'Partner',
      budget: '-',
      published: '6 Jun 2024',
    },
    {
      project: 'Capacity building for local governance and civil society monitoring',
      location: 'Armenia',
      donor: 'UNDP',
      role: 'Leader',
      budget: '-',
      published: '18 Apr 2024',
    },
    {
      project: 'Digital transformation advisory services for regional agencies',
      location: 'Ukraine',
      donor: 'GIZ',
      role: 'Partner',
      budget: '-',
      published: '14 Feb 2024',
    },
  ],
  partners: [
    {
      name: 'Nordic Policy Centre',
      location: 'Finland',
      sectors: 'Governance, Digital',
      contracts: 9,
      shortlists: 4,
    },
    {
      name: 'Baltic Development Advisors',
      location: 'Latvia',
      sectors: 'Public administration',
      contracts: 6,
      shortlists: 5,
    },
    {
      name: 'European Innovation Network',
      location: 'Belgium',
      sectors: 'Innovation, Research',
      contracts: 4,
      shortlists: 7,
    },
  ],
  pricing: {
    averageContract: '2 550 000 EUR',
    medianBudget: '1 100 000 EUR',
    usualRange: '620 000 - 7 500 000 EUR',
    positioning: 'Competitive on medium and large technical assistance contracts',
    notes: [
      'Often appears as leader on EU-funded framework contracts.',
      'Pricing profile is strongest in governance, policy, and institutional reform assignments.',
      'Consortium roles are used for regional specialist coverage.',
    ],
  },
};

const LEGACY_DATA_BY_ORGANIZATION_ID: Record<string, Partial<LegacyOrganizationProfileData>> = {
  '1': DEFAULT_LEGACY_DATA,
};

const TAB_CONFIG: Array<{ id: LegacyTab; label: string; icon: typeof Briefcase }> = [
  { id: 'contracts', label: 'Contracts', icon: Briefcase },
  { id: 'shortlists', label: 'Shortlists', icon: ListChecks },
  { id: 'statistics', label: 'Statistics', icon: BarChart3 },
  { id: 'partners', label: 'Partners', icon: Building2 },
  { id: 'pricing', label: 'Pricing policy', icon: CreditCard },
];

const sections = [
  { id: 'information', labelKey: 'organizations.myOrganization.sections.information', icon: Building2, color: 'text-blue-500' },
  { id: 'contact', labelKey: 'organizations.myOrganization.sections.contact', icon: MapPin, color: 'text-green-500' },
  { id: 'operations', labelKey: 'organizations.myOrganization.sections.operations', icon: Briefcase, color: 'text-purple-500' },
  { id: 'resources', labelKey: 'organizations.myOrganization.sections.resources', icon: Users, color: 'text-orange-500' },
  { id: 'projects', labelKey: 'organizations.myOrganization.sections.projects', icon: FolderKanban, color: 'text-pink-500' },
];

const getTextValue = (value: unknown, fallback = '') => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'name' in value && typeof value.name === 'string') {
    return value.name;
  }
  return fallback;
};

const formatWebsite = (website?: string) => {
  if (!website) return '';
  return website.replace(/^https?:\/\//, '').replace(/\/$/, '');
};

const mergeLegacyData = (organizationId?: string | number): LegacyOrganizationProfileData => {
  const override = organizationId ? LEGACY_DATA_BY_ORGANIZATION_ID[String(organizationId)] : undefined;
  return {
    ...DEFAULT_LEGACY_DATA,
    ...override,
    contracts: override?.contracts ?? DEFAULT_LEGACY_DATA.contracts,
    shortlists: override?.shortlists ?? DEFAULT_LEGACY_DATA.shortlists,
    partners: override?.partners ?? DEFAULT_LEGACY_DATA.partners,
    pricing: {
      ...DEFAULT_LEGACY_DATA.pricing,
      ...override?.pricing,
    },
  };
};

export default function OrganizationDetail() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { allOrganizations } = useOrganizations();
  const { isBookmarked, toggleBookmark } = useOrganizationBookmarks();
  const [activeSection, setActiveSection] = useState('information');
  const [activeTab, setActiveTab] = useState<LegacyTab>('contracts');

  const organization = allOrganizations.find(org => String(org.id) === String(id)) ?? allOrganizations[0];

  const legacyData = useMemo(() => mergeLegacyData(organization?.id), [organization?.id]);
  const isSearchContext = location.pathname.includes('/search/') || location.state?.fromSearch;

  if (!organization) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Building2 className="mx-auto mb-4 h-14 w-14 text-muted-foreground" />
          <h2 className="mb-2 text-2xl font-bold text-primary">{t('organizations.details.notFound')}</h2>
          <p className="mb-6 text-sm text-muted-foreground">{t('organizations.details.notFound.message')}</p>
          <Button onClick={() => navigate('/organizations/database')}>{t('organizations.actions.backToList')}</Button>
        </div>
      </div>
    );
  }

  const completionRate = Math.min(
    100,
    Math.max(
      35,
      Math.round(
        [
          organization.description,
          organization.contactEmail,
          organization.website,
          organization.yearFounded,
          organization.employeesCount,
         /* organization.budget,
          organization.teamMembers,
          organization.certifications?.length,*/
          organization.subSectors?.length,
        ].filter(Boolean).length * 11,
      ),
    ),
  );

  const currentSection = sections.find((section) => section.id === activeSection);
  const currentSectionStatus = organization.verificationStatus === 'VERIFIED' ? 'verified' : 'selfDeclared';
  const shouldShowBookmarkButton = user?.accountType !== 'expert';

  const renderSearchSectionContent = () => {
    switch (activeSection) {
      case 'information':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-1 text-sm text-muted-foreground">
                  {t('organizations.myOrganization.information.name')}
                </p>
                <p className="font-semibold text-primary">{organization.name}</p>
              </div>
              {organization.acronym && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-1 text-sm text-muted-foreground">
                    {t('organizations.myOrganization.information.acronym')}
                  </p>
                  <p className="font-semibold text-primary">{organization.acronym}</p>
                </div>
              )}
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-1 text-sm text-muted-foreground">
                  {t('organizations.myOrganization.information.type')}
                </p>
                <p className="font-semibold text-primary">
                  {t(`organizations.type.${organization.type}`)}
                </p>
              </div>
              {organization.yearFounded && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-1 text-sm text-muted-foreground">
                    {t('organizations.myOrganization.information.established')}
                  </p>
                  <p className="font-semibold text-primary">{organization.yearFounded}</p>
                </div>
              )}
              {organization.website && (
                <div className="rounded-lg bg-gray-50 p-4 md:col-span-2">
                  <p className="mb-1 text-sm text-muted-foreground">
                    {t('organizations.myOrganization.information.website')}
                  </p>
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    {organization.website}
                  </a>
                </div>
              )}
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-1 text-sm text-muted-foreground">
                {t('organizations.myOrganization.information.description')}
              </p>
              <p className="text-primary">{organization.description}</p>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {organization.contactEmail && (
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {t('organizations.myOrganization.contact.email')}
                  </p>
                </div>
                <p className="font-semibold text-primary">{organization.contactEmail}</p>
              </div>
            )}
            {organization.website && (
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-1 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {t('organizations.myOrganization.contact.region')}
                  </p>
                </div>
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  {organization.website}
                </a>
              </div>
            )}
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="mb-1 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t('organizations.myOrganization.contact.city')}
                </p>
              </div>
              <p className="font-semibold text-primary">{organization.city.name}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-1 text-sm text-muted-foreground">
                {t('organizations.myOrganization.contact.country')}
              </p>
              <p className="font-semibold text-primary">{organization.country.name}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 md:col-span-2">
              <div className="mb-1 flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t('organizations.myOrganization.contact.region')}
                </p>
              </div>
              <p className="font-semibold text-primary">
                {t(`organizations.region.${organization.region}`)}
              </p>
            </div>
          </div>
        );

      case 'operations':
        return (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t('organizations.myOrganization.operations.sectors')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {organization.sectors.map((sector) => (
                  <Badge key={sector} variant="secondary">
                    {t(`sectors.${sector}`)}
                  </Badge>
                ))}
              </div>
            </div>
            {organization.subSectors && organization.subSectors.length > 0 && (
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-2 text-sm text-muted-foreground">
                  {t('organizations.myOrganization.operations.subsectors')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {organization.subSectors.map((subsector) => (
                    <Badge
                      key={subsector}
                      variant="outline"
                      className="border-blue-200 bg-blue-50 text-blue-700"
                    >
                      {t(`subsectors.${subsector}`)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t('organizations.myOrganization.operations.certifications')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {organization.certifications && organization.certifications.length > 0 ? (
                  organization.certifications.map((certification) => (
                    <Badge
                      key={certification.id || certification.certificationName}
                      className="border-yellow-200 bg-yellow-50 text-yellow-700"
                    >
                      {certification.certificationName}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    {t('organizations.details.notFound.message')}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {organization.budget && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {t('organizations.myOrganization.operations.budget')}
                    </p>
                  </div>
                  <p className="font-semibold text-primary">{organization.budget}</p>
                </div>
              )} 
              
              {organization.employeesCount && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {t('organizations.myOrganization.operations.employees')}
                    </p>
                  </div>
                  <p className="font-semibold text-primary">{organization.employeesCount.toLocaleString()}</p>
                </div>
              )}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-1 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {t('organizations.myOrganization.contact.region')}
                  </p>
                </div>
                <p className="font-semibold text-primary">
                  {t(`organizations.region.${organization.region}`)}
                </p>
              </div>
            </div> 
          </div>  
        );

      case 'resources':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
           {(organization.teamMembers || organization.employeesCount) && ( 
          
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-1 text-sm text-muted-foreground">
                    {t('organizations.myOrganization.resources.teamSize')}
                  </p>
               <p className="text-2xl font-bold text-primary">
                   {(organization.teamMembers || organization.employeesCount || 0).toLocaleString()}
                  </p> 
              
                  
                </div>

              )}
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-1 text-sm text-muted-foreground">
                  {t('organizations.myOrganization.resources.technicalCapacity')}
                </p>
                <Badge className="border-green-200 bg-green-50 text-green-700">
                  {organization.verificationStatus === 'VERIFIED'
                    ? t('organizations.validation.verified')
                    : t('organizations.validation.selfDeclared')}
                </Badge>
              </div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-sm text-muted-foreground">
                {t('organizations.myOrganization.resources.equipment')}
              </p>
              <p className="text-primary">
                {organization.equipmentInfrastructure
                  ? organization.equipmentInfrastructure
                  : t('organizations.details.notFound.message')}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-sm text-muted-foreground">
                {t('organizations.myOrganization.resources.partnerships')}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {organization.partnerships} {t('organizations.kpis.partnerships')}
                </Badge>
                {organization.certifications?.map((certification) => (
                  <Badge key={certification} variant="outline">
                    {certification.certificationName}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-blue-700">
                  {t('organizations.myOrganization.projects.active')}
                </p>
                <FolderKanban className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-900">{organization.activeProjects}</p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-green-700">
                  {t('organizations.myOrganization.projects.completed')}
                </p>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-900">{organization.completedProjects}</p>
            </div>
            {organization.budget && (
              <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-6">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-purple-700">
                    {t('organizations.myOrganization.projects.totalBudget')}
                  </p>
                  <DollarSign className="h-5 w-5 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-purple-900">{organization.budget}</p>
              </div>
            )}
            <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-orange-700">
                  {t('organizations.myOrganization.projects.successRate')}
                </p>
                <CheckCircle className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-orange-900">
                {organization.activeProjects + organization.completedProjects > 0
                  ? `${Math.round((organization.completedProjects / (organization.activeProjects + organization.completedProjects)) * 100)}%`
                  : '0%'}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const city = getTextValue(organization.city);
  const country = getTextValue(organization.country, 'Estonia');
  const address = [city, country].filter(Boolean).join(', ') || 'RÃ¤vala pst 24a\nTallinn 10143\nEstonia';
  const email = organization.contactEmail || organization.email || 'info@civitta.ee';
  const website = organization.website || 'http://www.civitta.ee';
  const phone = organization.phone || '+372 646 4488';
  const organizationName = organization.name || 'Civitta International OU';

  const totalContractValue = legacyData.contracts.reduce((sum, item) => {
    const amount = Number(item.budget.replace(/[^\d]/g, ''));
    return Number.isNaN(amount) ? sum : sum + amount;
  }, 0);
  const countries = new Set([...legacyData.contracts, ...legacyData.shortlists].map(item => item.location));
  const donors = new Set([...legacyData.contracts, ...legacyData.shortlists].map(item => item.donor));

  const renderProjectRows = (rows: LegacyProjectRow[]) => (
    <div className="space-y-3">
      {/* Header row */}
      <div className="hidden grid-cols-[2.7fr_1fr_0.8fr_0.8fr_1fr_0.85fr] gap-4 px-4 text-xs font-semibold uppercase tracking-wide text-accent md:grid">
        <span>Project</span>
        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />Location</span>
        <span>Donor</span>
        <span>Role</span>
        <span>Budget</span>
        <span>Published</span>
      </div>
      {rows.map((row, index) => (
        <Card key={`${row.project}-${index}`}>
          <CardContent className="grid gap-3 px-4 py-4 text-sm text-foreground md:grid-cols-[2.7fr_1fr_0.8fr_0.8fr_1fr_0.85fr] md:items-center">
            <p className="font-medium leading-snug">
              <span className="mr-1 text-muted-foreground">{index + 1}.</span>
              {row.project}
            </p>
            <p className="text-muted-foreground">{row.location}</p>
            <p>
              <Badge variant="outline" className="text-xs">{row.donor}</Badge>
            </p>
            <p>
              <Badge variant="secondary" className="text-xs">{row.role}</Badge>
            </p>
            <p className="font-semibold text-primary">{row.budget}</p>
            <p className="text-muted-foreground text-xs">{row.published}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderStatistics = () => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Contracts', value: legacyData.contracts.length.toString(), icon: Briefcase },
          { label: 'Shortlists', value: legacyData.shortlists.length.toString(), icon: ListChecks },
          { label: 'Countries', value: countries.size.toString(), icon: Globe },
          { label: 'Donors', value: donors.size.toString(), icon: Building2 },
        ].map(stat => {
          const StatIcon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <StatIcon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card>
        <CardContent className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total known contract value</p>
          <p className="mt-2 text-3xl font-bold text-primary">
            {new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(totalContractValue)} EUR
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderPartners = () => (
    <div className="space-y-3">
      <div className="hidden grid-cols-[1.6fr_1fr_1.4fr_0.75fr_0.75fr] gap-4 px-4 text-xs font-semibold uppercase tracking-wide text-accent md:grid">
        <span>Partner</span>
        <span>Location</span>
        <span>Sectors</span>
        <span>Contracts</span>
        <span>Shortlists</span>
      </div>
      {legacyData.partners.map(partner => (
        <Card key={partner.name}>
          <CardContent className="grid gap-3 px-4 py-4 text-sm md:grid-cols-[1.6fr_1fr_1.4fr_0.75fr_0.75fr] md:items-center">
            <p className="font-semibold text-primary">{partner.name}</p>
            <p className="text-muted-foreground">{partner.location}</p>
            <p className="text-muted-foreground">{partner.sectors}</p>
            <Badge variant="secondary" className="w-fit">{partner.contracts}</Badge>
            <Badge variant="outline" className="w-fit">{partner.shortlists}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderPricing = () => (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { label: 'Average contract', value: legacyData.pricing.averageContract },
          { label: 'Median budget', value: legacyData.pricing.medianBudget },
          { label: 'Usual range', value: legacyData.pricing.usualRange },
        ].map(item => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-xl font-bold text-primary">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Positioning</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="font-semibold text-primary">{legacyData.pricing.positioning}</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            {legacyData.pricing.notes.map(note => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );

  const renderActiveTab = () => {
    if (activeTab === 'contracts') return renderProjectRows(legacyData.contracts);
    if (activeTab === 'shortlists') return renderProjectRows(legacyData.shortlists);
    if (activeTab === 'statistics') return renderStatistics();
    if (activeTab === 'partners') return renderPartners();
    return renderPricing();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        icon={Building2}
        title={organizationName}
        description={address}
        stats={[
          { value: legacyData.contracts.length, label: 'Contracts' },
          { value: legacyData.shortlists.length, label: 'Shortlists' },
        ]}
      />

      {/* Sub Menu */}
      <OrganizationsSubMenu />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-5 lg:px-6">
        {/* Contact info card */}
        <Card className="mb-6">
          <CardContent className="flex flex-wrap gap-6 p-5 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-accent" />
              <span>{address}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0 text-accent" />
              <span>{phone}</span>
            </div>
            {email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-accent" />
                <a href={`mailto:${email}`} className="text-accent underline underline-offset-2 hover:no-underline">
                  {email}
                </a>
              </div>
            )}
            {website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 shrink-0 text-accent" />
                <a href={website} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2 hover:no-underline">
                  {formatWebsite(website)}
                </a>
              </div>
            )}
            <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
              <ListChecks className="h-3.5 w-3.5" />
              <span>Last updated: {legacyData.lastUpdated}</span>
            </div>
          </CardContent>
        </Card>

        {isSearchContext ? (
          <div className="space-y-6">
            <p className="text-muted-foreground mb-4">{organization.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{organization.city?.name}, {organization.country?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{t(`organizations.region.${organization.region}`)}</span>
              </div>
              {organization.contactEmail && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{organization.contactEmail}</span>
                </div>
              )}
              {organization.yearFounded && (
                <div className="flex items-center gap-2 text-sm">
                  <History className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{t('organizations.details.established')}: {organization.yearFounded}</span>
                </div>
              )}
              {organization.employeesCount && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{organization.employeesCount.toLocaleString()} {t('organizations.details.employees')}</span>
                </div>
              )}
              {organization.budget && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{t('organizations.details.budget')}: {organization.budget}</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg border p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-primary">
                  {t('organizations.myOrganization.completionRate')}
                </h3>
                <span className="text-2xl font-bold text-primary">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-3 lg:grid-cols-5">
              {sections.map((section) => {
                const Icon = section.icon;

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`rounded-lg border p-4 transition-all ${
                      activeSection === section.id
                        ? 'border-primary bg-primary text-white shadow-md'
                        : 'bg-white hover:border-primary/50 hover:shadow-sm'
                    }`}
                  >
                    <Icon
                      className={`mx-auto mb-2 h-6 w-6 ${
                        activeSection === section.id ? 'text-white' : section.color
                      }`}
                    />
                    <p
                      className={`text-center text-xs font-medium ${
                        activeSection === section.id ? 'text-white' : 'text-primary'
                      }`}
                    >
                      {t(section.labelKey)}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex flex-col gap-3 mb-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-primary">
                    {t(currentSection?.labelKey || '')}
                  </h2>
                </div>
                <OrganizationVerificationBadge status={currentSectionStatus} />
              </div>
              <Separator className="mb-6" />
              {renderSearchSectionContent()}
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LegacyTab)}>
            <TabsList className="mb-6 flex h-auto flex-wrap gap-1 bg-transparent p-0">
              {TAB_CONFIG.map(tab => {
                const Icon = tab.icon;
                const count = tab.id === 'contracts'
                  ? legacyData.contracts.length
                  : tab.id === 'shortlists'
                  ? legacyData.shortlists.length
                  : undefined;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="h-auto rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm transition-all data-[state=active]:border-accent data-[state=active]:bg-accent data-[state=active]:text-white"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {count !== undefined ? `${count} ${tab.label}` : tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            {TAB_CONFIG.map(tab => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                {renderActiveTab()}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}
