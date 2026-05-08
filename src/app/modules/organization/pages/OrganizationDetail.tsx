import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@app/components/ui/tabs';
import { Separator } from '@app/components/ui/separator';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useOrganizations } from '@app/modules/organization/hooks/useOrganizations';
import {
  BarChart3,
  Briefcase,
  Building2,
  CreditCard,
  Globe,
  Handshake,
  ListChecks,
  Mail,
  MapPin,
  Phone,
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { allOrganizations } = useOrganizations();
  const [activeTab, setActiveTab] = useState<LegacyTab>('contracts');

  const organization = allOrganizations.find(org => String(org.id) === String(id)) ?? allOrganizations[0];

  const legacyData = useMemo(() => mergeLegacyData(organization?.id), [organization?.id]);

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

  const city = getTextValue(organization.city);
  const country = getTextValue(organization.country, 'Estonia');
  const address = [city, country].filter(Boolean).join(', ') || 'Rävala pst 24a\nTallinn 10143\nEstonia';
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

        {/* Tabs */}
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
      </div>
    </div>
  );
}
