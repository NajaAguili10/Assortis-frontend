import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@app/components/ui/button';
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
      <div className="flex min-h-screen items-center justify-center bg-[#f2f2f2]">
        <div className="text-center">
          <Building2 className="mx-auto mb-4 h-14 w-14 text-[#52617f]" />
          <h2 className="mb-2 text-2xl font-bold text-[#52617f]">{t('organizations.details.notFound')}</h2>
          <p className="mb-6 text-sm text-[#52617f]/75">{t('organizations.details.notFound.message')}</p>
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
    <div className="space-y-4">
      <div className="hidden grid-cols-[2.7fr_1fr_0.8fr_0.8fr_1fr_0.85fr] gap-4 px-5 text-xs font-semibold text-[#bd4057] md:grid">
        <span>Project</span>
        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />Location</span>
        <span>Donor</span>
        <span>Role</span>
        <span className="underline">Budget</span>
        <span className="underline">Published</span>
      </div>
      {rows.map((row, index) => (
        <article
          key={`${row.project}-${index}`}
          className="grid gap-3 bg-white px-5 py-6 text-sm text-[#52617f] shadow-[0_2px_7px_rgba(15,23,42,0.16)] md:grid-cols-[2.7fr_1fr_0.8fr_0.8fr_1fr_0.85fr] md:items-center"
        >
          <p className="font-medium leading-snug">
            <span className="mr-1 text-[#8a94aa]">{index + 1}.</span>
            {row.project}
          </p>
          <p>{row.location}</p>
          <p>{row.donor}</p>
          <p>{row.role}</p>
          <p>{row.budget}</p>
          <p>{row.published}</p>
        </article>
      ))}
    </div>
  );

  const renderStatistics = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[
        { label: 'Contracts', value: legacyData.contracts.length.toString() },
        { label: 'Shortlists', value: legacyData.shortlists.length.toString() },
        { label: 'Countries', value: countries.size.toString() },
        { label: 'Donors', value: donors.size.toString() },
      ].map(stat => (
        <div key={stat.label} className="bg-white p-6 shadow-[0_2px_7px_rgba(15,23,42,0.16)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#bd4057]">{stat.label}</p>
          <p className="mt-3 text-3xl font-bold text-[#52617f]">{stat.value}</p>
        </div>
      ))}
      <div className="bg-white p-6 shadow-[0_2px_7px_rgba(15,23,42,0.16)] md:col-span-2 lg:col-span-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#bd4057]">Total known contract value</p>
        <p className="mt-3 text-3xl font-bold text-[#52617f]">
          {new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(totalContractValue)} EUR
        </p>
      </div>
    </div>
  );

  const renderPartners = () => (
    <div className="space-y-4">
      <div className="hidden grid-cols-[1.6fr_1fr_1.4fr_0.75fr_0.75fr] gap-4 px-5 text-xs font-semibold text-[#bd4057] md:grid">
        <span>Partner</span>
        <span>Location</span>
        <span>Sectors</span>
        <span>Contracts</span>
        <span>Shortlists</span>
      </div>
      {legacyData.partners.map(partner => (
        <article
          key={partner.name}
          className="grid gap-3 bg-white px-5 py-6 text-sm text-[#52617f] shadow-[0_2px_7px_rgba(15,23,42,0.16)] md:grid-cols-[1.6fr_1fr_1.4fr_0.75fr_0.75fr] md:items-center"
        >
          <p className="font-semibold">{partner.name}</p>
          <p>{partner.location}</p>
          <p>{partner.sectors}</p>
          <p>{partner.contracts}</p>
          <p>{partner.shortlists}</p>
        </article>
      ))}
    </div>
  );

  const renderPricing = () => (
    <div className="grid gap-4 lg:grid-cols-3">
      {[
        { label: 'Average contract', value: legacyData.pricing.averageContract },
        { label: 'Median budget', value: legacyData.pricing.medianBudget },
        { label: 'Usual range', value: legacyData.pricing.usualRange },
      ].map(item => (
        <div key={item.label} className="bg-white p-6 shadow-[0_2px_7px_rgba(15,23,42,0.16)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#bd4057]">{item.label}</p>
          <p className="mt-3 text-xl font-bold text-[#52617f]">{item.value}</p>
        </div>
      ))}
      <div className="bg-white p-6 text-sm text-[#52617f] shadow-[0_2px_7px_rgba(15,23,42,0.16)] lg:col-span-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#bd4057]">Positioning</p>
        <p className="mt-3 font-semibold">{legacyData.pricing.positioning}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          {legacyData.pricing.notes.map(note => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
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
    <div className="min-h-screen bg-[#f1f1f1]">
      <header className="bg-[#4f5f7f] text-white">
        <div className="mx-auto max-w-7xl px-5 pb-0 pt-7 sm:px-8">
          <div className="text-xs font-medium text-white/75">Assortis &gt; Organisations</div>
          <div className="mt-4 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold leading-tight tracking-normal text-white md:text-5xl">
                {organizationName}
              </h1>
              <div className="mt-10 grid gap-8 border-t border-white/10 pt-5 text-sm text-white/90 md:grid-cols-[230px_320px]">
                <div className="flex gap-2">
                  <MapPin className="mt-1 h-4 w-4 shrink-0" />
                  <p className="whitespace-pre-line leading-relaxed">{address}</p>
                </div>
                <div className="space-y-1">
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>Phone: {phone}</span>
                  </p>
                  {email && (
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${email}`} className="underline decoration-white/40 underline-offset-2">
                        {email}
                      </a>
                    </p>
                  )}
                  {website && (
                    <p className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <a href={website} target="_blank" rel="noopener noreferrer" className="underline decoration-white/40 underline-offset-2">
                        {formatWebsite(website)}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-12 text-xs text-white/90">
              <ListChecks className="h-4 w-4" />
              <span>Last updated contracts/shortlists: {legacyData.lastUpdated}</span>
            </div>
          </div>

          <nav className="mt-12 flex flex-wrap items-end gap-1">
            {TAB_CONFIG.map(tab => {
              const Icon = tab.icon;
              const count = tab.id === 'contracts'
                ? legacyData.contracts.length
                : tab.id === 'shortlists'
                ? legacyData.shortlists.length
                : undefined;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex h-12 items-center gap-2 border border-[#d8dde7] px-5 text-sm font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-[#52617f]'
                      : 'bg-[#f8f9fb] text-[#52617f] hover:bg-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{count ? `${count} ${tab.label}` : tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {renderActiveTab()}
      </main>
    </div>
  );
}
