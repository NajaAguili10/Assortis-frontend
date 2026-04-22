import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, ChevronDown, Plus, Search } from 'lucide-react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { RegionCountryFilter } from '@app/components/RegionCountryFilter';
import { SectorSubsectorFilter } from '@app/components/SectorSubsectorFilter';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import { useTenders } from '@app/hooks/useTenders';
import {
  CountryEnum,
  NoticeTypeEnum,
  ProcurementTypeEnum,
  RegionEnum,
  REGION_COUNTRY_MAP,
  SectorEnum,
  SECTOR_SUBSECTOR_MAP,
  SubSectorEnum,
} from '@app/types/tender.dto';
import { getLocalizedCountryName } from '@app/utils/country-translator';

export default function PublicProjectsServicePage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { allTenders } = useTenders();

  const [query, setQuery] = useState('');
  const [selectedProcurementTypes, setSelectedProcurementTypes] = useState<ProcurementTypeEnum[]>([]);
  const [showSectorFilters, setShowSectorFilters] = useState(false);
  const [showRegionFilters, setShowRegionFilters] = useState(false);
  const [selectedSectors, setSelectedSectors] = useState<SectorEnum[]>([]);
  const [selectedSubSectors, setSelectedSubSectors] = useState<SubSectorEnum[]>([]);
  const [hoveredSector, setHoveredSector] = useState<SectorEnum | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<RegionEnum[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<CountryEnum[]>([]);

  const toggleProcurementType = (value: ProcurementTypeEnum) => {
    setSelectedProcurementTypes((prev) => (
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    ));
  };

  const toggleSector = (sector: SectorEnum) => {
    const next = selectedSectors.includes(sector)
      ? selectedSectors.filter((item) => item !== sector)
      : [...selectedSectors, sector];

    setSelectedSectors(next);

    if (next.length === 0) {
      setSelectedSubSectors([]);
      return;
    }

    const validSubSectors = selectedSubSectors.filter((sub) => (
      next.some((selected) => (SECTOR_SUBSECTOR_MAP[selected] || []).includes(sub))
    ));

    setSelectedSubSectors(validSubSectors);
  };

  const toggleSubSector = (subSector: SubSectorEnum) => {
    setSelectedSubSectors((prev) => (
      prev.includes(subSector) ? prev.filter((item) => item !== subSector) : [...prev, subSector]
    ));
  };

  const toggleRegion = (region: RegionEnum) => {
    const next = selectedRegions.includes(region)
      ? selectedRegions.filter((item) => item !== region)
      : [...selectedRegions, region];

    setSelectedRegions(next);

    if (next.length === 0) {
      setSelectedCountries([]);
      return;
    }

    const validCountries = selectedCountries.filter((country) => (
      next.some((selected) => (REGION_COUNTRY_MAP[selected] || []).includes(country))
    ));

    setSelectedCountries(validCountries);
  };

  const toggleCountry = (country: CountryEnum) => {
    setSelectedCountries((prev) => (
      prev.includes(country) ? prev.filter((item) => item !== country) : [...prev, country]
    ));
  };

  const filteredProjects = useMemo(() => {
    return allTenders
      .filter((item) => {
        const search = query.trim().toLowerCase();
        const matchesSearch = !search
          || item.title.toLowerCase().includes(search)
          || item.organizationName.toLowerCase().includes(search)
          || item.country.toLowerCase().includes(search)
          || item.referenceNumber.toLowerCase().includes(search);

        const matchesProcurement = selectedProcurementTypes.length === 0
          || (item.procurementType ? selectedProcurementTypes.includes(item.procurementType) : false);

        const matchesSectors = selectedSectors.length === 0
          || item.sectors.some((sector) => selectedSectors.includes(sector));

        const matchesSubSectors = selectedSubSectors.length === 0
          || (item.subsectors ? item.subsectors.some((subsector) => selectedSubSectors.includes(subsector)) : false);

        const matchesRegions = selectedRegions.length === 0
          || (item.region ? selectedRegions.includes(item.region) : false);

        const matchesCountries = selectedCountries.length === 0
          || selectedCountries.includes(item.country);

        return matchesSearch && matchesProcurement && matchesSectors && matchesSubSectors && matchesRegions && matchesCountries;
      })
      .sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime())
      .slice(0, 24);
  }, [
    allTenders,
    query,
    selectedCountries,
    selectedProcurementTypes,
    selectedRegions,
    selectedSectors,
    selectedSubSectors,
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        icon={Search}
        title={t('services.projects.hero.title')}
        description={t('services.projects.hero.description')}
      />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6 space-y-8">
          <section className="relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-white via-gray-50/40 to-accent/10 p-6 md:p-10">
            <div className="absolute -top-16 -right-16 h-52 w-52 rounded-full bg-accent/15 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative space-y-3 max-w-3xl">
              <h2 className="text-3xl md:text-4xl font-bold text-primary">Explore International Projects with Strategic Precision</h2>
              <p className="text-gray-700 md:text-lg leading-relaxed">
                Access a structured project listing service designed to help teams discover, qualify, and prioritize opportunities faster.
              </p>
            </div>
          </section>

          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-semibold text-primary">Project Search Filters</h3>
                <p className="text-sm text-gray-600 mt-1">Refine results with procurement type, sectors, and regions.</p>
              </div>
              <Badge variant="secondary">{t('services.projects.results', { count: filteredProjects.length })}</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px_auto_auto] gap-3 mb-4">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('services.projects.searchPlaceholder')}
                className="min-h-11"
              />

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-between min-h-11">
                    {t('services.projects.filter.procurement')} ({selectedProcurementTypes.length})
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72" align="start">
                  <div className="space-y-2">
                    {Object.values(ProcurementTypeEnum).map((value) => (
                      <label key={value} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={selectedProcurementTypes.includes(value)}
                          onChange={() => toggleProcurementType(value)}
                        />
                        <span>{t(`procurementType.${value}`)}</span>
                      </label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                className={`min-h-11 inline-flex items-center gap-2 border transition-all ${showSectorFilters ? 'bg-white text-accent border-accent shadow-sm hover:bg-slate-50 hover:text-accent' : 'bg-accent text-white border-accent hover:bg-accent/90 hover:text-white'}`}
                onClick={() => setShowSectorFilters((prev) => !prev)}
              >
                <Plus className={`h-3.5 w-3.5 transition-transform ${showSectorFilters ? 'rotate-45' : ''}`} />
                Sectors ({selectedSubSectors.length})
              </Button>

              <Button
                variant="outline"
                className={`min-h-11 inline-flex items-center gap-2 border transition-all ${showRegionFilters ? 'bg-white text-accent border-accent shadow-sm hover:bg-slate-50 hover:text-accent' : 'bg-accent text-white border-accent hover:bg-accent/90 hover:text-white'}`}
                onClick={() => setShowRegionFilters((prev) => !prev)}
              >
                <Plus className={`h-3.5 w-3.5 transition-transform ${showRegionFilters ? 'rotate-45' : ''}`} />
                Regions ({selectedCountries.length})
              </Button>
            </div>

            <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${showSectorFilters ? 'max-h-[2000px] opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
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
                  const allSelected = subs.every((item) => selectedSubSectors.includes(item));
                  if (allSelected) {
                    setSelectedSubSectors((prev) => prev.filter((item) => !subs.includes(item)));
                  } else {
                    setSelectedSubSectors((prev) => [...new Set([...prev, ...subs])]);
                  }
                }}
                t={t}
              />
            </div>

            <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${showRegionFilters ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
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
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <div className="min-w-[920px]">
                <div className="grid grid-cols-[2.2fr_1.1fr_1.3fr_1fr_1fr_1.2fr] items-center gap-2 px-5 py-3.5 border-b border-gray-200 bg-gray-50/80 text-xs font-semibold tracking-wide text-gray-600">
                  <span className="text-accent">{t('services.projects.table.title')}</span>
                  <span className="text-accent">{t('services.projects.table.country')}</span>
                  <span className="text-accent">{t('services.projects.table.funding')}</span>
                  <span className="text-accent">{t('services.projects.table.procurement')}</span>
                  <span className="text-accent">{t('services.projects.table.deadline')}</span>
                  <span className="text-accent">Actions</span>
                </div>
              </div>

              {filteredProjects.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-3">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-700 mb-1">No matching projects found</p>
                  <p className="text-sm">Try adjusting your search terms or filters.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredProjects.map((item, rowIndex) => (
                    <div key={item.id} className={`px-5 py-4 transition-colors ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-gray-50/80`}>
                      <div className="grid grid-cols-[2.2fr_1.1fr_1.3fr_1fr_1fr_1.2fr] gap-2 items-center text-sm">
                        <div className="pr-1">
                          <p className="font-semibold text-gray-900 leading-snug">{item.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{item.referenceNumber}</p>
                        </div>
                        <div className="text-gray-700 leading-snug">{getLocalizedCountryName(item.country, language)}</div>
                        <div className="text-gray-700 leading-snug">{item.fundingAgency ? t(`fundingAgencies.${item.fundingAgency}`) : '-'}</div>
                        <div className="text-gray-700">{item.procurementType ? t(`procurementType.${item.procurementType}`) : '-'}</div>
                        <div className="text-gray-700">{new Date(item.deadline).toLocaleDateString(language)}</div>
                        <div className="flex justify-start">
                          <Button size="sm" className="min-h-10" onClick={() => navigate('/ask-for-quote')}>
                            Details
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="rounded-full border border-blue-100 bg-blue-50 text-blue-700 px-2.5 py-1 font-medium">
                          {item.noticeType ? item.noticeType.replaceAll('_', ' ') : NoticeTypeEnum.PROJECT_NOTICE.replaceAll('_', ' ')}
                        </Badge>
                        <Badge variant="secondary" className="rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700 px-2.5 py-1 font-medium">
                          {item.sectors[0] ? t(`sectors.${item.sectors[0]}`) : '-'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <section className="rounded-lg border border-accent/20 bg-gradient-to-br from-accent/10 to-primary/10 p-6 md:p-8 text-center">
            <h3 className="text-2xl font-bold text-primary mb-3">Need a Tailored Opportunity Intelligence Setup?</h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Contact our team to configure a project discovery workflow aligned with your pipeline priorities.
            </p>
            <Button className="min-h-11" onClick={() => navigate('/ask-for-quote')}>
              {t('services.cta.askQuote')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
