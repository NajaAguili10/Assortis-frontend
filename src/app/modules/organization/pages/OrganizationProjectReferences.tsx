import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { format } from 'date-fns';
import { enUS, es, fr } from 'date-fns/locale';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OrganizationsSubMenu } from '@app/components/OrganizationsSubMenu';
import { OrganizationProjectReferenceFormDialog } from '@app/components/OrganizationProjectReferenceFormDialog';
import { RegionCountryFilter } from '@app/components/RegionCountryFilter';
import { SectorSubsectorFilter } from '@app/components/SectorSubsectorFilter';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { Separator } from '@app/components/ui/separator';
import { useOrganizationProjectReferences } from '@app/modules/organization/hooks/useOrganizationProjectReferences';
import {
  OrganizationProjectReferenceDTO,
  OrganizationProjectReferenceFormValues,
} from '@app/modules/organization/types/organizationProjectReference.dto';
import { CountryDTO, SectorDTO, SubsectorDTO } from '@app/types/organization.dto';
import { hasOrganizationsSubMenuAccess } from '@app/services/permissions.service';
import {
  CountryEnum,
  FundingAgencyEnum,
  RegionEnum,
  SectorEnum,
  SECTOR_SUBSECTOR_MAP,
  SubSectorEnum,
} from '@app/types/tender.dto';
import {
  ORGANIZATION_REGION_COUNTRY_MAP,
  ORGANIZATION_REGION_LABELS,
} from '@app/config/organization-region-country.config';
import { getLocalizedCountryName } from '@app/utils/country-translator';
import { Download, Eye, FileText, Loader2, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type StatusFilter = 'all' | 'notVerified' | 'verified';
type SortField = 'title' | 'country' | 'sector' | 'client' | 'donor' | 'startDate' | 'endDate';
type SortDirection = 'asc' | 'desc';

export default function OrganizationProjectReferences() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { references, metrics, isLoading, createReference, updateReference, deleteReference } = useOrganizationProjectReferences();
  const canManage = hasOrganizationsSubMenuAccess('projectReferences', user?.accountType);
  const dateLocale = language === 'fr' ? fr : language === 'es' ? es : enUS;

  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedSectors, setSelectedSectors] = useState<SectorDTO[]>([]);
  const [selectedSubSectors, setSelectedSubSectors] = useState<SubsectorDTO[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<RegionEnum[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<CountryDTO[]>([]);
  const [selectedFundingAgencies, setSelectedFundingAgencies] = useState<FundingAgencyEnum[]>([]);
  const [fundingAgencySearch, setFundingAgencySearch] = useState('');
  const [hoveredSector, setHoveredSector] = useState<SectorDTO | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('startDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingReference, setEditingReference] = useState<OrganizationProjectReferenceDTO | null>(null);
  const [cloningReference, setCloningReference] = useState<OrganizationProjectReferenceDTO | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('create') === '1' && canManage) {
      setIsCreateFormOpen(true);
    }
  }, [canManage, location.search]);

  const filteredFundingAgencies = useMemo(() => {
    if (!fundingAgencySearch.trim()) {
      return Object.values(FundingAgencyEnum);
    }

    return Object.values(FundingAgencyEnum).filter(agency => (
      t(`fundingAgencies.${agency}`).toLowerCase().includes(fundingAgencySearch.toLowerCase())
    ));
  }, [fundingAgencySearch, t]);

  const getSectorLabel = (reference: OrganizationProjectReferenceDTO) => {
    const translated = reference.sector ? t(`sectors.${reference.sector}`) : '';
    if (translated && translated !== `sectors.${reference.sector}`) {
      return translated;
    }
    return reference.sectorName || reference.sector?.replace(/_/g, ' ') || '-';
  };

  const getDonorLabel = (reference: OrganizationProjectReferenceDTO) => {
    const translated = reference.donor ? t(`fundingAgencies.${reference.donor}`) : '';
    if (translated && translated !== `fundingAgencies.${reference.donor}`) {
      return translated;
    }
    return reference.donorName || reference.donor || '-';
  };

  const getCountryLabel = (reference: OrganizationProjectReferenceDTO) => {
    return reference.countryName || getLocalizedCountryName(reference.country, language);
  };

  const sectorOptions = useMemo<SectorDTO[]>(() => {
    return Object.values(SectorEnum).map((code, index) => {
      const translation = t(`sectors.${code}`);
      return {
        id: index + 1,
        code,
        name: translation === `sectors.${code}` ? code.replace(/_/g, ' ') : translation,
      };
    });
  }, [t]);

  const subsectorOptionsBySector = useMemo<Record<string, SubsectorDTO[]>>(() => {
    return sectorOptions.reduce<Record<string, SubsectorDTO[]>>((accumulator, sector) => {
      const subsectorCodes = SECTOR_SUBSECTOR_MAP[sector.code as SectorEnum] || [];
      accumulator[String(sector.id)] = subsectorCodes.map((code, index) => {
        const translation = t(`subsectors.${code}`);
        return {
          id: Number(`${sector.id}${index + 1}`),
          code,
          name: translation === `subsectors.${code}` ? code.replace(/_/g, ' ') : translation,
          sectorId: sector.id,
        };
      });
      return accumulator;
    }, {});
  }, [sectorOptions, t]);

  const countryOptions = useMemo<CountryDTO[]>(() => {
    const seen = new Set<string>();
    return Object.values(RegionEnum).flatMap((region) => {
      return (ORGANIZATION_REGION_COUNTRY_MAP[region] || [])
        .filter((countryCode) => {
          if (seen.has(countryCode)) return false;
          seen.add(countryCode);
          return true;
        })
        .map((countryCode, index) => ({
          id: index + 1 + region.length * 100,
          code: countryCode,
          name: getLocalizedCountryName(countryCode, language),
          regionWorld: region,
        }));
    });
  }, [language]);

  const filteredReferences = useMemo(() => {
    return references.filter(reference => {
      const query = searchInput.trim().toLowerCase();
      const haystack = [reference.title, reference.summary, reference.referenceNumber, reference.client].join(' ').toLowerCase();

      if (query && !haystack.includes(query)) return false;
      if (statusFilter !== 'all' && reference.status !== statusFilter) return false;
      if (selectedSectors.length > 0 && !selectedSectors.some(sector => sector.code === reference.sector)) return false;
      if (selectedSubSectors.length > 0 && (!reference.subSector || !selectedSubSectors.some(subSector => subSector.code === reference.subSector))) return false;
      if (selectedRegions.length > 0 && !selectedRegions.includes(reference.region)) return false;
      if (selectedCountries.length > 0 && !selectedCountries.some(country => country.code === reference.country)) return false;
      if (selectedFundingAgencies.length > 0 && !selectedFundingAgencies.includes(reference.donor)) return false;

      return true;
    });
  }, [references, searchInput, selectedCountries, selectedFundingAgencies, selectedRegions, selectedSectors, selectedSubSectors, statusFilter]);

  const sortedReferences = useMemo(() => {
    const nextReferences = [...filteredReferences];
    const directionFactor = sortDirection === 'asc' ? 1 : -1;

    nextReferences.sort((left, right) => {
      if (sortField === 'title') return left.title.localeCompare(right.title) * directionFactor;
      if (sortField === 'country') return left.country.localeCompare(right.country) * directionFactor;
      if (sortField === 'sector') return left.sector.localeCompare(right.sector) * directionFactor;
      if (sortField === 'client') return left.client.localeCompare(right.client) * directionFactor;
      if (sortField === 'donor') return left.donor.localeCompare(right.donor) * directionFactor;
      if (sortField === 'startDate') return ((left.startDate ? new Date(left.startDate).getTime() : 0) - (right.startDate ? new Date(right.startDate).getTime() : 0)) * directionFactor;
      if (sortField === 'endDate') return ((left.endDate ? new Date(left.endDate).getTime() : 0) - (right.endDate ? new Date(right.endDate).getTime() : 0)) * directionFactor;
      return 0;
    });

    return nextReferences;
  }, [filteredReferences, sortDirection, sortField]);

  const activeFilterCount = [
    statusFilter !== 'all' ? 1 : 0,
    selectedSectors.length,
    selectedSubSectors.length,
    selectedRegions.length,
    selectedCountries.length,
    selectedFundingAgencies.length,
  ].reduce((sum, value) => sum + value, 0);

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

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortField(field);
    setSortDirection('asc');
  };

  const exportCsv = () => {
    const rows = sortedReferences.map(reference => [
      reference.title,
      reference.referenceNumber,
      getCountryLabel(reference),
      getSectorLabel(reference),
      reference.client,
      getDonorLabel(reference),
      reference.startDate,
      reference.endDate,
      t(`organizations.projectReferences.status.${reference.status}`),
    ]);

    const csv = [
      ['Title', 'Reference', 'Country', 'Sector', 'Client', 'Donor', 'Start Date', 'End Date', 'Status'].join(','),
      ...rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'organization-project-references.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreateReference = async (values: OrganizationProjectReferenceFormValues) => {
    const reference = await createReference(values);
    toast.success(t('organizations.projectReferences.createSuccess'));
    navigate(`/organizations/project-references/${reference.id}`);
  };

  const handleUpdateReference = async (values: OrganizationProjectReferenceFormValues) => {
    if (!editingReference) return;
    await updateReference(editingReference.id, values);
    toast.success(t('organizations.projectReferences.updateSuccess'));
    setEditingReference(null);
  };

  const handleCloneReference = async (values: OrganizationProjectReferenceFormValues) => {
    const reference = await createReference({ ...values, title: `${values.title} (Copy)` });
    toast.success(t('projects.references.actions.clone'));
    navigate(`/organizations/project-references/${reference.id}`);
    setCloningReference(null);
  };

  const handleDeleteReference = async (reference: OrganizationProjectReferenceDTO) => {
    await deleteReference(reference.id);
    toast.success(t('common.delete'));
  };

  const tableMinWidthClass = 'min-w-[1540px]';

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        title={t('organizations.projectReferences.title')}
        description={t('organizations.projectReferences.subtitle')}
        icon={FileText}
        stats={[
          { value: String(metrics.total), label: t('organizations.projectReferences.kpi.total') },
          { value: String(metrics.notVerified), label: t('organizations.projectReferences.kpi.notVerified') },
          { value: String(metrics.documents), label: t('organizations.projectReferences.kpi.documents') },
        ]}
      />

      <OrganizationsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="bg-gradient-to-b from-white to-gray-50/40 rounded-lg border border-primary/15 p-5 mb-6 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 pb-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-base font-semibold text-primary">{t('organizations.projectReferences.searchTitle')}</h2>
                <p className="text-sm text-gray-600 mt-1">{t('organizations.projectReferences.searchSubtitle')}</p>
              </div>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                    {activeFilterCount}
                  </Badge>
                )}
                {canManage ? (
                  <Button className="min-h-11" onClick={() => setIsCreateFormOpen(true)}>
                    {t('organizations.projectReferences.addReference')}
                  </Button>
                ) : (
                  <Button className="min-h-11" disabled>
                    {t('organizations.projectReferences.addReference')}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-4 lg:grid-cols-[1fr_220px_auto_auto]">
              <Input
                value={searchInput}
                onChange={event => setSearchInput(event.target.value)}
                placeholder={t('organizations.projectReferences.filters.searchPlaceholder')}
                className="min-h-11"
              />
              <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                <SelectTrigger className="min-h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('organizations.projectReferences.filters.statusAll')}</SelectItem>
                  <SelectItem value="notVerified">{t('organizations.projectReferences.status.notVerified')}</SelectItem>
                  <SelectItem value="verified">{t('organizations.projectReferences.status.verified')}</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" className="min-h-11" onClick={() => setShowFilters(prev => !prev)}>
                {showFilters
                  ? t('organizations.projectReferences.filters.hide')
                  : t('organizations.projectReferences.filters.show')}
              </Button>
              <Button type="button" variant="outline" className="min-h-11" onClick={exportCsv}>
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
            </div>

            {showFilters && (
              <div className="space-y-4 mt-4">
                <SectorSubsectorFilter
                  selectedSectors={selectedSectors}
                  selectedSubSectors={selectedSubSectors}
                  hoveredSector={hoveredSector}
                  onHoverSector={setHoveredSector}
                  allowedSectors={sectorOptions}
                  dynamicSubsectorsMap={subsectorOptionsBySector}
                  onSelectSector={(sector) => {
                    const nextSectors = selectedSectors.some(item => item.code === sector.code)
                      ? selectedSectors.filter(item => item.code !== sector.code)
                      : [...selectedSectors, sector];
                    setSelectedSectors(nextSectors);
                    setSelectedSubSectors(prev => prev.filter(subSector => nextSectors.some(selectedSector => (
                      selectedSector.id === subSector.sectorId
                    ))));
                  }}
                  onSelectSubSector={(subSector) => {
                    setSelectedSubSectors(prev => (
                      prev.some(item => item.code === subSector.code)
                        ? prev.filter(item => item.code !== subSector.code)
                        : [...prev, subSector]
                    ));
                  }}
                  onSelectAllSectors={() => {
                    if (selectedSectors.length === sectorOptions.length) {
                      setSelectedSectors([]);
                      setSelectedSubSectors([]);
                    } else {
                      setSelectedSectors(sectorOptions);
                    }
                  }}
                  onSelectAllSubSectors={(sector) => {
                    const subSectors = subsectorOptionsBySector[String(sector.id)] || [];
                    const allSelected = subSectors.every(subSector =>
                      selectedSubSectors.some(item => item.code === subSector.code)
                    );
                    setSelectedSubSectors(prev => (
                      allSelected
                        ? prev.filter(item => !subSectors.some(subSector => subSector.code === item.code))
                        : [...prev, ...subSectors.filter(subSector => !prev.some(item => item.code === subSector.code))]
                    ));
                  }}
                  t={t}
                />

                <RegionCountryFilter
                  selectedRegions={selectedRegions}
                  selectedCountries={selectedCountries}
                  allowedCountries={countryOptions}
                  regionCountryMap={ORGANIZATION_REGION_COUNTRY_MAP}
                  getRegionLabel={(region) => ORGANIZATION_REGION_LABELS[region as RegionEnum] || region}
                  onSelectRegion={(region) => {
                    const nextRegions = selectedRegions.includes(region)
                      ? selectedRegions.filter(item => item !== region)
                      : [...selectedRegions, region];
                    setSelectedRegions(nextRegions);
                    if (nextRegions.length === 0) {
                      setSelectedCountries([]);
                      return;
                    }
                    const validCountries = selectedCountries.filter(country =>
                      nextRegions.some(selectedRegion =>
                        ORGANIZATION_REGION_COUNTRY_MAP[selectedRegion]?.includes(country.code as CountryEnum)
                      )
                    );
                    setSelectedCountries(validCountries);
                  }}
                  onSelectCountry={(country) => {
                    setSelectedCountries(prev => (
                      prev.some(item => item.code === country.code)
                        ? prev.filter(item => item.code !== country.code)
                        : [...prev, country]
                    ));
                  }}
                  onSelectAllRegions={() => {
                    const allRegions = Object.values(RegionEnum);
                    if (selectedRegions.length === allRegions.length) {
                      setSelectedRegions([]);
                      setSelectedCountries([]);
                    } else {
                      setSelectedRegions(allRegions);
                    }
                  }}
                  t={t}
                />

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-between min-h-11 w-full lg:w-80">
                      {t('organizations.projectReferences.filters.donor')} ({selectedFundingAgencies.length})
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96" align="start">
                    <Input
                      className="mb-3"
                      value={fundingAgencySearch}
                      onChange={event => setFundingAgencySearch(event.target.value)}
                      placeholder={t('common.search')}
                    />
                    <div className="max-h-64 overflow-auto space-y-2">
                      {filteredFundingAgencies.map(agency => (
                        <label key={agency} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={selectedFundingAgencies.includes(agency)}
                            onChange={() => setSelectedFundingAgencies(prev => (
                              prev.includes(agency) ? prev.filter(item => item !== agency) : [...prev, agency]
                            ))}
                          />
                          <span>{t(`fundingAgencies.${agency}`)}</span>
                        </label>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="flex justify-end">
                  <Button variant="ghost" onClick={clearFilters}>{t('organizations.filters.clear')}</Button>
                </div>
              </div>
            )}
          </div>

          {isCreateFormOpen && canManage && (
            <div className="mb-6">
              <OrganizationProjectReferenceFormDialog
                inline
                open
                mode="create"
                onOpenChange={(open) => {
                  setIsCreateFormOpen(open);
                  if (!open && location.search.includes('create=1')) {
                    navigate('/organizations/project-references', { replace: true });
                  }
                }}
                onSubmit={handleCreateReference}
                quickMode
              />
            </div>
          )}

          <div className="bg-white rounded-xl border border-primary/15 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-10 text-center text-gray-500">
                  <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-primary" />
                  <p className="text-sm">{t('common.loading')}</p>
                </div>
              ) : sortedReferences.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-3">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-700 mb-1">{t('organizations.projectReferences.emptyTitle')}</p>
                  <p className="text-sm">{t('organizations.projectReferences.emptySubtitle')}</p>
                  <Button variant="outline" className="mt-4 min-h-11" onClick={clearFilters}>{t('organizations.filters.clear')}</Button>
                </div>
              ) : (
                <table className={`${tableMinWidthClass} table-fixed border-separate border-spacing-0`}>
                  <colgroup>
                    <col className="w-[22%]" />
                    <col className="w-[11%]" />
                    <col className="w-[10%]" />
                    <col className="w-[14%]" />
                    <col className="w-[14%]" />
                    <col className="w-[10%]" />
                    <col className="w-[10%]" />
                    <col className="w-[9%]" />
                    <col className="w-[280px]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-primary/15 bg-primary/5 text-xs font-semibold uppercase tracking-wide text-primary">
                      <th className="px-5 py-3.5 text-left">
                        <button className="text-left hover:text-primary/80" onClick={() => toggleSort('title')}>
                          {t('organizations.projectReferences.table.projectTitle')}
                        </button>
                      </th>
                      <th className="px-4 py-3.5 text-left">
                        <button className="text-left hover:text-primary/80" onClick={() => toggleSort('country')}>
                          {t('organizations.projectReferences.table.country')}
                        </button>
                      </th>
                      <th className="px-4 py-3.5 text-left">
                        <button className="text-left hover:text-primary/80" onClick={() => toggleSort('sector')}>
                          {t('organizations.projectReferences.table.sector')}
                        </button>
                      </th>
                      <th className="px-4 py-3.5 text-left">
                        <button className="text-left hover:text-primary/80" onClick={() => toggleSort('client')}>
                          {t('organizations.projectReferences.table.client')}
                        </button>
                      </th>
                      <th className="px-4 py-3.5 text-left">
                        <button className="text-left hover:text-primary/80" onClick={() => toggleSort('donor')}>
                          {t('organizations.projectReferences.table.donor')}
                        </button>
                      </th>
                      <th className="px-4 py-3.5 text-left">
                        <button className="text-left hover:text-primary/80" onClick={() => toggleSort('startDate')}>
                          {t('organizations.projectReferences.table.startDate')}
                        </button>
                      </th>
                      <th className="px-4 py-3.5 text-left">
                        <button className="text-left hover:text-primary/80" onClick={() => toggleSort('endDate')}>
                          {t('organizations.projectReferences.table.endDate')}
                        </button>
                      </th>
                      <th className="px-4 py-3.5 text-left">{t('organizations.projectReferences.table.status')}</th>
                      <th className="px-4 py-3.5 text-left">{t('organizations.projectReferences.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedReferences.map((reference, index) => (
                      <tr
                        key={reference.id}
                        className={`transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-primary/5'} hover:bg-primary/10`}
                      >
                        <td className="px-5 py-4 align-top">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 leading-6 break-words line-clamp-2">{reference.title}</p>
                            <p className="text-xs text-gray-500 mt-1 leading-5 break-words line-clamp-2">
                              {reference.summary || 'Additional details can be completed later.'}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-middle">
                          <div className="text-gray-700 leading-6 break-words">{getCountryLabel(reference)}</div>
                        </td>
                        <td className="px-4 py-4 align-middle">
                          <div className="text-gray-700 leading-6 break-words">{getSectorLabel(reference)}</div>
                        </td>
                        <td className="px-4 py-4 align-middle">
                          <div className="text-gray-700 leading-6 break-words line-clamp-2">{reference.client || '-'}</div>
                        </td>
                        <td className="px-4 py-4 align-middle">
                          <div className="text-gray-700 leading-6 break-words line-clamp-2">{getDonorLabel(reference)}</div>
                        </td>
                        <td className="px-4 py-4 align-middle text-gray-700 whitespace-nowrap">
                          {reference.startDate ? format(new Date(reference.startDate), 'dd MMM yyyy', { locale: dateLocale }) : 'Not set'}
                        </td>
                        <td className="px-4 py-4 align-middle text-gray-700 whitespace-nowrap">
                          {reference.endDate ? format(new Date(reference.endDate), 'dd MMM yyyy', { locale: dateLocale }) : 'Not set'}
                        </td>
                        <td className="px-4 py-4 align-middle">
                          <Badge
                            variant={reference.status === 'notVerified' ? 'secondary' : 'default'}
                            className={reference.status === 'notVerified' ? 'rounded-full bg-amber-100 text-amber-800 border-amber-200' : 'rounded-full bg-emerald-100 text-emerald-800 border-emerald-200'}
                          >
                            {t(`organizations.projectReferences.status.${reference.status}`)}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 align-middle">
                          <div className="flex min-h-[44px] items-center gap-2 whitespace-nowrap">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="shrink-0"
                              onClick={() => navigate(`/organizations/project-references/${reference.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              {t('organizations.projectReferences.table.open')}
                            </Button>
                            {canManage && (
                              <>
                                <Button type="button" variant="ghost" size="sm" className="shrink-0 px-2.5" onClick={() => setEditingReference(reference)}>
                                  {t('common.edit')}
                                </Button>
                                <Button type="button" variant="ghost" size="sm" className="shrink-0 px-2.5" onClick={() => setCloningReference(reference)}>
                                  {t('projects.references.actions.clone')}
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="shrink-0 px-2.5 text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteReference(reference)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  {t('common.delete')}
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <Separator className="my-6" />
        </div>
      </PageContainer>

      <OrganizationProjectReferenceFormDialog
        open={Boolean(editingReference)}
        mode="edit"
        initialReference={editingReference}
        onOpenChange={(open) => {
          if (!open) setEditingReference(null);
        }}
        onSubmit={handleUpdateReference}
      />
      <OrganizationProjectReferenceFormDialog
        open={Boolean(cloningReference)}
        mode="create"
        initialReference={cloningReference}
        onOpenChange={(open) => {
          if (!open) setCloningReference(null);
        }}
        onSubmit={handleCloneReference}
      />
    </div>
  );
}
