import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { enUS, es, fr } from 'date-fns/locale';
import { ArrowDown, ArrowUp, ArrowUpDown, Search, Download, FileText, Eye, Pencil } from 'lucide-react';
import { useTranslation } from '@app/contexts/LanguageContext';
import { ProjectReferenceFicheModal } from '@app/components/ProjectReferenceFicheModal';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ProjectsSubMenu } from '@app/components/ProjectsSubMenu';
import { SectorSubsectorFilter } from '@app/components/SectorSubsectorFilter';
import { RegionCountryFilter } from '@app/components/RegionCountryFilter';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { Separator } from '@app/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@app/components/ui/tooltip';
import {
  CountryEnum,
  FundingAgencyEnum,
  RegionEnum,
  REGION_COUNTRY_MAP,
  SectorEnum,
  SECTOR_SUBSECTOR_MAP,
  SubSectorEnum,
  TenderListDTO,
} from '@app/types/tender.dto';
import { ProjectReferenceFicheDTO, ProjectReferenceFicheModalMode, ProjectReferenceValidationState } from '@app/types/project-reference-fiche.dto';
import { getLocalizedCountryName } from '@app/utils/country-translator';
import { downloadProjectReferenceFichePdf } from '@app/utils/projectReferencePdf';

type StatusFilter = 'ongoing' | 'past' | 'all';
type SortField = 'organization' | 'location' | 'title' | 'period' | 'budget';
type SortDirection = 'asc' | 'desc';

type ProjectReferenceRow = TenderListDTO & {
  status: 'ongoing' | 'past';
  projectEndDate?: Date;
  description?: string;
  referenceState: ProjectReferenceValidationState;
};

const toIsoDate = (date?: Date): string => (date ? format(date, 'yyyy-MM-dd') : '');

const parseIsoDate = (value?: string): Date | undefined => {
  if (!value) return undefined;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

// Mock project references data for ongoing and past projects
const mockProjectReferences: ProjectReferenceRow[] = [
  {
    id: 'ref-1',
    title: 'Health Infrastructure Development',
    referenceNumber: 'PROJ-2024-001',
    organizationName: 'WHO',
    country: CountryEnum.KENYA,
    isMultiCountry: false,
    region: RegionEnum.AFRICA,
    sectors: [SectorEnum.HEALTH],
    subsectors: [],
    budget: { amount: 500000, currency: 'USD', formatted: '$500,000' },
    publishedDate: new Date('2023-01-15'),
    deadline: new Date('2024-12-31'),
    status: 'ongoing' as const,
    alertCategory: 'PROJECTS' as any,
    procurementType: 'SERVICES' as any,
    noticeType: 'PROJECT_NOTICE' as any,
    fundingAgency: FundingAgencyEnum.WORLD_BANK,
    mostRelevantPartnersCount: 3,
    otherPossiblePartnersCount: 7,
    projectEndDate: new Date('2024-12-31'),
    referenceState: 'draft',
  },
  {
    id: 'ref-2',
    title: 'Education Quality Improvement',
    referenceNumber: 'PROJ-2023-005',
    organizationName: 'UNESCO',
    country: CountryEnum.MALI,
    isMultiCountry: false,
    region: RegionEnum.AFRICA,
    sectors: [SectorEnum.EDUCATION],
    subsectors: [],
    budget: { amount: 250000, currency: 'EUR', formatted: '€250,000' },
    publishedDate: new Date('2022-06-01'),
    deadline: new Date('2023-12-31'),
    status: 'past' as const,
    alertCategory: 'PROJECTS' as any,
    procurementType: 'SERVICES' as any,
    noticeType: 'PROJECT_NOTICE' as any,
    fundingAgency: FundingAgencyEnum.EUROPEAN_UNION,
    mostRelevantPartnersCount: 2,
    otherPossiblePartnersCount: 5,
    projectEndDate: new Date('2023-12-31'),
    referenceState: 'valid',
  },
  {
    id: 'ref-3',
    title: 'Water & Sanitation Program',
    referenceNumber: 'PROJ-2024-003',
    organizationName: 'UNICEF',
    country: CountryEnum.UGANDA,
    isMultiCountry: false,
    region: RegionEnum.AFRICA,
    sectors: [SectorEnum.WATER_AND_SANITATION],
    subsectors: [],
    budget: { amount: 750000, currency: 'USD', formatted: '$750,000' },
    publishedDate: new Date('2023-09-01'),
    deadline: new Date('2025-08-31'),
    status: 'ongoing' as const,
    alertCategory: 'PROJECTS' as any,
    procurementType: 'WORKS' as any,
    noticeType: 'PROJECT_NOTICE' as any,
    fundingAgency: FundingAgencyEnum.AFRICAN_DEVELOPMENT_BANK,
    mostRelevantPartnersCount: 4,
    otherPossiblePartnersCount: 8,
    projectEndDate: new Date('2025-08-31'),
    referenceState: 'draft',
  },
  {
    id: 'ref-4',
    title: 'Climate Resilience Initiative',
    referenceNumber: 'PROJ-2022-002',
    organizationName: 'UNEP',
    country: CountryEnum.SENEGAL,
    isMultiCountry: false,
    region: RegionEnum.AFRICA,
    sectors: [SectorEnum.ENVIRONMENT],
    subsectors: [],
    budget: { amount: 600000, currency: 'USD', formatted: '$600,000' },
    publishedDate: new Date('2021-03-15'),
    deadline: new Date('2023-02-28'),
    status: 'past' as const,
    alertCategory: 'PROJECTS' as any,
    procurementType: 'SERVICES' as any,
    noticeType: 'PROJECT_NOTICE' as any,
    fundingAgency: FundingAgencyEnum.GLOBAL_ENVIRONMENT_FACILITY,
    mostRelevantPartnersCount: 3,
    otherPossiblePartnersCount: 6,
    projectEndDate: new Date('2023-02-28'),
    referenceState: 'valid',
  },
  {
    id: 'ref-5',
    title: 'Agriculture Productivity Enhancement',
    referenceNumber: 'PROJ-2024-002',
    organizationName: 'FAO',
    country: CountryEnum.GHANA,
    isMultiCountry: false,
    region: RegionEnum.AFRICA,
    sectors: [SectorEnum.AGRICULTURE],
    subsectors: [],
    budget: { amount: 450000, currency: 'USD', formatted: '$450,000' },
    publishedDate: new Date('2023-11-01'),
    deadline: new Date('2025-10-31'),
    status: 'ongoing' as const,
    alertCategory: 'PROJECTS' as any,
    procurementType: 'SERVICES' as any,
    noticeType: 'PROJECT_NOTICE' as any,
    fundingAgency: FundingAgencyEnum.WORLD_BANK,
    mostRelevantPartnersCount: 2,
    otherPossiblePartnersCount: 5,
    projectEndDate: new Date('2025-10-31'),
    referenceState: 'draft',
  },
];

export default function ProjectsReferences() {
  const { t, language } = useTranslation();

  const [projectReferences, setProjectReferences] = useState<ProjectReferenceRow[]>(mockProjectReferences);
  const [isFicheModalOpen, setIsFicheModalOpen] = useState(false);
  const [ficheMode, setFicheMode] = useState<ProjectReferenceFicheModalMode>('view');
  const [selectedReferenceId, setSelectedReferenceId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedSectors, setSelectedSectors] = useState<SectorEnum[]>([]);
  const [selectedSubSectors, setSelectedSubSectors] = useState<SubSectorEnum[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<RegionEnum[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<CountryEnum[]>([]);
  const [selectedFundingAgencies, setSelectedFundingAgencies] = useState<FundingAgencyEnum[]>([]);
  const [fundingAgencySearch, setFundingAgencySearch] = useState('');
  const [hoveredSector, setHoveredSector] = useState<SectorEnum | null>(null);
  const [sortField, setSortField] = useState<SortField>('period');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const dateLocale = language === 'fr' ? fr : language === 'es' ? es : enUS;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const toggleSector = (sector: SectorEnum) => {
    const next = selectedSectors.includes(sector)
      ? selectedSectors.filter(item => item !== sector)
      : [...selectedSectors, sector];
    setSelectedSectors(next);

    if (next.length === 0) {
      setSelectedSubSectors([]);
      return;
    }

    const validSubSectors = selectedSubSectors.filter(sub =>
      next.some(selected => (SECTOR_SUBSECTOR_MAP[selected] || []).includes(sub))
    );
    setSelectedSubSectors(validSubSectors);
  };

  const toggleSubSector = (subSector: SubSectorEnum) => {
    setSelectedSubSectors(prev => (
      prev.includes(subSector) ? prev.filter(item => item !== subSector) : [...prev, subSector]
    ));
  };

  const toggleRegion = (region: RegionEnum) => {
    const next = selectedRegions.includes(region)
      ? selectedRegions.filter(item => item !== region)
      : [...selectedRegions, region];
    setSelectedRegions(next);

    if (next.length === 0) {
      setSelectedCountries([]);
      return;
    }

    const validCountries = selectedCountries.filter(country =>
      next.some(selected => (REGION_COUNTRY_MAP[selected] || []).includes(country))
    );
    setSelectedCountries(validCountries);
  };

  const toggleCountry = (country: CountryEnum) => {
    setSelectedCountries(prev => (
      prev.includes(country) ? prev.filter(item => item !== country) : [...prev, country]
    ));
  };

  const toggleFundingAgency = (value: FundingAgencyEnum) => {
    setSelectedFundingAgencies(prev => (
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    ));
  };

  const clearFilters = () => {
    setSearchInput('');
    setStatusFilter('all');
    setSelectedSectors([]);
    setSelectedSubSectors([]);
    setSelectedRegions([]);
    setSelectedCountries([]);
    setSelectedFundingAgencies([]);
    setFundingAgencySearch('');
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  const filteredFundingAgencies = useMemo(() => {
    if (!fundingAgencySearch) return Object.values(FundingAgencyEnum);
    return Object.values(FundingAgencyEnum).filter(agency =>
      t(`fundingAgencies.${agency}`).toLowerCase().includes(fundingAgencySearch.toLowerCase())
    );
  }, [fundingAgencySearch, t]);

  const passesSearch = (row: any) => {
    if (!searchQuery) return true;
    const haystack = `${row.title} ${row.referenceNumber} ${row.organizationName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return haystack.includes(query);
  };

  const filteredRows = useMemo(() => {
    return projectReferences.filter(row => {
      if (!passesSearch(row)) return false;
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;
      if (selectedSectors.length > 0 && !row.sectors.some(sector => selectedSectors.includes(sector))) return false;
      if (selectedSubSectors.length > 0 && !row.subsectors?.some(sub => selectedSubSectors.includes(sub))) return false;
      if (selectedRegions.length > 0 && (!row.region || !selectedRegions.includes(row.region))) return false;
      if (selectedCountries.length > 0 && !selectedCountries.includes(row.country)) return false;
      if (selectedFundingAgencies.length > 0 && (!row.fundingAgency || !selectedFundingAgencies.includes(row.fundingAgency))) return false;

      return true;
    });
  }, [projectReferences, statusFilter, selectedSectors, selectedSubSectors, selectedRegions, selectedCountries, selectedFundingAgencies, searchQuery]);

  const sortedRows = useMemo(() => {
    const rows = [...filteredRows];

    rows.sort((a, b) => {
      const directionFactor = sortDirection === 'asc' ? 1 : -1;

      if (sortField === 'organization') return a.organizationName.localeCompare(b.organizationName) * directionFactor;
      if (sortField === 'location') return a.country.localeCompare(b.country) * directionFactor;
      if (sortField === 'title') return a.title.localeCompare(b.title) * directionFactor;
      if (sortField === 'period') return ((a.publishedDate?.getTime() || 0) - (b.publishedDate?.getTime() || 0)) * directionFactor;
      if (sortField === 'budget') return (a.budget.amount - b.budget.amount) * directionFactor;
      return 0;
    });

    return rows;
  }, [filteredRows, sortDirection, sortField]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortField(field);
    setSortDirection('asc');
  };

  const getHeaderClassName = (field: SortField) => `text-left inline-flex items-center gap-1 transition-colors ${
    sortField === field ? 'text-accent' : 'text-accent hover:text-accent/90'
  }`;

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5" />;
    }

    return sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />;
  };

  const getReferenceStateBadgeClassName = (state: ProjectReferenceValidationState) => {
    if (state === 'valid') {
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    }

    return 'border-amber-200 bg-amber-50 text-amber-700';
  };

  const selectedReference = useMemo(() => {
    if (!selectedReferenceId) return null;
    return projectReferences.find(item => item.id === selectedReferenceId) || null;
  }, [projectReferences, selectedReferenceId]);

  const buildFicheFromRow = (row: ProjectReferenceRow): ProjectReferenceFicheDTO => ({
    id: row.id,
    referenceNumber: row.referenceNumber,
    title: row.title,
    description: row.description || `${row.title} - ${row.referenceNumber}`,
    organizationName: row.organizationName,
    sector: row.sectors[0],
    subSector: row.subsectors?.[0],
    country: row.country,
    donor: row.fundingAgency,
    budgetFormatted: row.budget.formatted,
    startDate: toIsoDate(row.publishedDate),
    endDate: toIsoDate(row.projectEndDate),
    deadline: toIsoDate(row.deadline),
    projectStatus: row.status,
    referenceState: row.referenceState,
  });

  const activeFiche = useMemo(() => {
    if (!selectedReference) return null;
    return buildFicheFromRow(selectedReference);
  }, [selectedReference]);

  const handleOpenFiche = (row: ProjectReferenceRow, mode: ProjectReferenceFicheModalMode) => {
    setSelectedReferenceId(row.id);
    setFicheMode(mode);
    setIsFicheModalOpen(true);
  };

  const handleSaveFiche = (updated: ProjectReferenceFicheDTO) => {
    setProjectReferences(prev => prev.map(row => {
      if (row.id !== updated.id) return row;

      return {
        ...row,
        title: updated.title,
        description: updated.description,
        referenceNumber: updated.referenceNumber,
        organizationName: updated.organizationName,
        sectors: [updated.sector],
        subsectors: updated.subSector ? [updated.subSector] : [],
        country: updated.country,
        fundingAgency: updated.donor,
        budget: {
          ...row.budget,
          formatted: updated.budgetFormatted || row.budget.formatted,
        },
        publishedDate: parseIsoDate(updated.startDate) || row.publishedDate,
        projectEndDate: parseIsoDate(updated.endDate) || row.projectEndDate,
        deadline: parseIsoDate(updated.deadline) || row.deadline,
        status: updated.projectStatus,
        referenceState: updated.referenceState,
      };
    }));
  };

  const handleDownloadReference = (row: ProjectReferenceRow) => {
    const fiche = buildFicheFromRow(row);
    const localizedPdfFiche: ProjectReferenceFicheDTO = {
      ...fiche,
      sector: t(`sectors.${fiche.sector}`) as SectorEnum,
      subSector: fiche.subSector ? (t(`subsectors.${fiche.subSector}`) as SubSectorEnum) : undefined,
      country: getLocalizedCountryName(fiche.country, language) as CountryEnum,
      donor: fiche.donor ? (t(`fundingAgencies.${fiche.donor}`) as FundingAgencyEnum) : undefined,
      projectStatus: t(`projects.references.status.${fiche.projectStatus}`) as ProjectReferenceFicheDTO['projectStatus'],
      referenceState: t(`projects.references.state.${fiche.referenceState}`) as ProjectReferenceFicheDTO['referenceState'],
    };

    downloadProjectReferenceFichePdf(localizedPdfFiche, {
      title: fiche.title,
      sectionDetails: t('projects.references.fiche.sections.details'),
      sectionMetadata: t('projects.references.fiche.sections.metadata'),
      sectionDates: t('projects.references.fiche.sections.dates'),
      fieldReferenceNumber: t('projects.references.fiche.fields.referenceNumber'),
      fieldProjectTitle: t('projects.references.fiche.fields.projectTitle'),
      fieldDescription: t('projects.references.fiche.fields.description'),
      fieldOrganization: t('projects.references.fiche.fields.organization'),
      fieldSector: t('projects.references.fiche.fields.sector'),
      fieldSubSector: t('projects.references.fiche.fields.subSector'),
      fieldCountry: t('projects.references.fiche.fields.country'),
      fieldDonor: t('projects.references.fiche.fields.donor'),
      fieldBudget: t('projects.references.fiche.fields.budget'),
      fieldProjectStatus: t('projects.references.fiche.fields.projectStatus'),
      fieldState: t('projects.references.fiche.fields.state'),
      fieldStartDate: t('projects.references.fiche.fields.startDate'),
      fieldEndDate: t('projects.references.fiche.fields.endDate'),
      fieldDeadline: t('projects.references.fiche.fields.deadline'),
      notProvided: t('projects.references.fiche.notProvided'),
    });
  };

  const activeFilterCount = [
    statusFilter !== 'all' ? 1 : 0,
    selectedSectors.length,
    selectedSubSectors.length,
    selectedRegions.length,
    selectedCountries.length,
    selectedFundingAgencies.length,
  ].reduce((sum, value) => sum + value, 0);

  const exportCsv = () => {
    const header = ['Organization', 'Location', 'Project title', 'Period', 'Contract amount'];

    const csvRows = sortedRows.map(row => {
      const location = row.isMultiCountry ? 'Multi-country' : getLocalizedCountryName(row.country, language);
      const startDate = row.publishedDate ? format(row.publishedDate, 'yyyy-MM-dd') : '';
      const endDate = row.projectEndDate ? format(row.projectEndDate, 'yyyy-MM-dd') : '';
      const period = startDate && endDate ? `${startDate} - ${endDate}` : startDate || endDate || '-';
      return [row.organizationName, location, row.title, period, row.budget.formatted]
        .map(value => `"${String(value).replace(/"/g, '""')}"`)
        .join(',');
    });

    const csv = [header.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'project-references.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        title={t('projects.references.title')}
        description={t('projects.references.subtitle')}
        icon={FileText}
        stats={[{ value: sortedRows.length.toString(), label: 'Projects' }]}
      />

      <ProjectsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-primary">Search and filter projects</h2>
                <p className="text-sm text-gray-600 mt-1">View and manage past and ongoing project references.</p>
              </div>
              {activeFilterCount > 0 && <Badge variant="secondary">{activeFilterCount} active filters</Badge>}
            </div>
            <form onSubmit={handleSearch} className="grid grid-cols-1 lg:grid-cols-[1fr_220px_auto_auto_auto] gap-3 mb-4">
              <Input value={searchInput} onChange={event => setSearchInput(event.target.value)} placeholder="Search project title, reference..." className="min-h-11" />
              <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                <SelectTrigger className="min-h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" className="min-h-11" onClick={exportCsv}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button type="button" variant="outline" className="min-h-11" onClick={() => setShowFilters(prev => !prev)}>
                {showFilters ? 'Hide filters' : 'Show filters'}
              </Button>
              <Button type="submit" className="min-h-11">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>

            {showFilters && (
              <div className="space-y-4">
                <SectorSubsectorFilter
                  selectedSectors={selectedSectors}
                  selectedSubSectors={selectedSubSectors}
                  hoveredSector={hoveredSector}
                  onHoverSector={setHoveredSector}
                  onSelectSector={toggleSector}
                  onSelectSubSector={toggleSubSector}
                  onSelectAllSectors={() => {
                    if (selectedSectors.length === Object.values(SectorEnum).length) {
                      setSelectedSectors([]);
                      setSelectedSubSectors([]);
                    } else {
                      setSelectedSectors(Object.values(SectorEnum));
                    }
                  }}
                  onSelectAllSubSectors={(sector) => {
                    const subs = SECTOR_SUBSECTOR_MAP[sector] || [];
                    const allSelected = subs.every(item => selectedSubSectors.includes(item));
                    if (allSelected) {
                      setSelectedSubSectors(prev => prev.filter(item => !subs.includes(item)));
                    } else {
                      setSelectedSubSectors(prev => [...new Set([...prev, ...subs])]);
                    }
                  }}
                  t={t}
                />

                <RegionCountryFilter
                  selectedRegions={selectedRegions}
                  selectedCountries={selectedCountries}
                  onSelectRegion={toggleRegion}
                  onSelectCountry={toggleCountry}
                  onSelectAllRegions={() => {
                    if (selectedRegions.length === Object.values(RegionEnum).length) {
                      setSelectedRegions([]);
                      setSelectedCountries([]);
                    } else {
                      setSelectedRegions(Object.values(RegionEnum));
                    }
                  }}
                  t={t}
                />

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-between min-h-11 w-full">Donor ({selectedFundingAgencies.length})</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96" align="start">
                    <Input className="mb-3" value={fundingAgencySearch} onChange={event => setFundingAgencySearch(event.target.value)} placeholder={t('common.search')} />
                    <div className="max-h-64 overflow-auto space-y-2">
                      {filteredFundingAgencies.map(agency => (
                        <label key={agency} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="h-4 w-4" checked={selectedFundingAgencies.includes(agency)} onChange={() => toggleFundingAgency(agency)} />
                          <span>{t(`fundingAgencies.${agency}`)}</span>
                        </label>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="flex justify-end">
                  <Button variant="ghost" onClick={clearFilters}>Reset all filters</Button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <div className="w-full">
                <div className="grid grid-cols-[1.05fr_0.85fr_1.7fr_1.05fr_0.8fr_0.55fr_0.7fr] items-center gap-2 px-5 py-3 border-b border-gray-200 bg-gray-50 text-xs font-semibold tracking-wide text-gray-600">
                  <button className={getHeaderClassName('organization')} onClick={() => toggleSort('organization')}>
                    Organization
                    {renderSortIcon('organization')}
                  </button>
                  <button className={getHeaderClassName('location')} onClick={() => toggleSort('location')}>
                    Location
                    {renderSortIcon('location')}
                  </button>
                  <button className={getHeaderClassName('title')} onClick={() => toggleSort('title')}>
                    Project Title
                    {renderSortIcon('title')}
                  </button>
                  <button className={getHeaderClassName('period')} onClick={() => toggleSort('period')}>
                    Period
                    {renderSortIcon('period')}
                  </button>
                  <button className={`${getHeaderClassName('budget')} justify-self-end`} onClick={() => toggleSort('budget')}>
                    Budget
                    {renderSortIcon('budget')}
                  </button>
                  <span className="text-left inline-flex items-center gap-1 text-accent">{t('projects.references.table.state')}</span>
                  <span className="text-left inline-flex items-center gap-1 text-accent">{t('projects.references.table.actions')}</span>
                </div>

                {sortedRows.length === 0 ? (
                  <div className="p-10 text-center text-gray-500">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-3">
                      <Search className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="font-medium text-gray-700 mb-1">No projects found.</p>
                    <p className="text-sm">Try adjusting your filters or search criteria.</p>
                    <Button variant="outline" className="mt-4 min-h-11" onClick={clearFilters}>Reset all filters</Button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {sortedRows.map((row, rowIndex) => {
                      const location = row.isMultiCountry ? 'Multi-country' : getLocalizedCountryName(row.country, language);
                      const start = row.publishedDate ? format(row.publishedDate, 'dd MMM yyyy', { locale: dateLocale }) : '-';
                      const end = row.projectEndDate ? format(row.projectEndDate, 'dd MMM yyyy', { locale: dateLocale }) : '-';

                      return (
                        <div key={row.id} className={`px-5 py-3.5 transition-colors ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-gray-50/80`}>
                          <div className="grid grid-cols-[1.05fr_0.85fr_1.7fr_1.05fr_0.8fr_0.55fr_0.7fr] gap-2 items-center text-sm">
                            <div className="min-w-0 truncate text-gray-700 leading-snug" title={row.organizationName}>{row.organizationName}</div>
                            <div className="min-w-0 truncate text-gray-700 leading-snug" title={location}>{location}</div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-gray-900 leading-snug" title={row.title}>{row.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{row.referenceNumber}</p>
                            </div>
                            <div className="whitespace-nowrap text-gray-700">{`${start} - ${end}`}</div>
                            <div className="whitespace-nowrap text-right text-gray-700 font-medium">{row.budget.formatted}</div>
                            <div className="flex items-center">
                              <Badge variant="outline" className={getReferenceStateBadgeClassName(row.referenceState)}>
                                {row.referenceState === 'valid'
                                  ? t('projects.references.state.valid')
                                  : t('projects.references.state.draft')}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 min-h-10">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="min-h-10 w-10 border-gray-300 p-0"
                                    aria-label={t('projects.references.actions.view')}
                                    onClick={() => handleOpenFiche(row, 'view')}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={4}>{t('projects.references.actions.view')}</TooltipContent>
                              </Tooltip>

                              {row.referenceState === 'draft' ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="min-h-10 w-10 border-gray-300 p-0"
                                      aria-label={t('projects.references.actions.modify')}
                                      onClick={() => handleOpenFiche(row, 'edit')}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={4}>{t('projects.references.actions.modify')}</TooltipContent>
                                </Tooltip>
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      className="min-h-10 w-10 border-gray-300 p-0"
                                      aria-label={t('projects.references.actions.download')}
                                      onClick={() => handleDownloadReference(row)}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={4}>{t('projects.references.actions.download')}</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <ProjectReferenceFicheModal
            open={isFicheModalOpen}
            mode={ficheMode}
            fiche={activeFiche}
            onOpenChange={setIsFicheModalOpen}
            onSave={handleSaveFiche}
          />

          <Separator className="my-6" />
        </div>
      </PageContainer>
    </div>
  );
}
