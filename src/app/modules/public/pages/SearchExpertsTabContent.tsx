import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useCVCredits } from '@app/contexts/CVCreditsContext';
import CVCreditsSummaryCard from '@app/components/CVCreditsSummaryCard';
import { SectorSubsectorFilter } from '@app/components/SectorSubsectorFilter';
import { RegionCountryFilter } from '@app/components/RegionCountryFilter';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@app/components/ui/radio-group';
import { useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@app/components/ui/dialog';
import { useExperts } from '@app/modules/expert/hooks/useExperts';
import { SECTOR_SUBSECTOR_MAP } from '@app/config/subsectors.config';
import { SectorEnum, SubSectorEnum, RegionEnum, CountryEnum, REGION_COUNTRY_MAP } from '@app/types/tender.dto';
import { Search, MapPin, Star, Briefcase, CheckCircle, UserCheck, Clock, TrendingUp, X, Filter, ChevronDown, UserCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

type ExpertsMode = 'experts' | 'my-experts' | 'bid-writers';

interface SearchExpertsTabContentProps {
  mode: ExpertsMode;
}

interface PendingUnlockExpert {
  id: string;
  name: string;
}

type ExpertSourceFilter = 'all' | 'assortis-database' | 'my-uploaded-cvs';

interface ExpertsSavedPayload {
  searchQuery: string;
  selectedSectors: SectorEnum[];
  selectedSubSectors: SubSectorEnum[];
  selectedRegions: RegionEnum[];
  selectedCountries: CountryEnum[];
  selectedExperience: string[];
  sourceFilter: ExpertSourceFilter;
}

interface SavedSearchEntry<TPayload> {
  id: string;
  label: string;
  createdAt: string;
  payload: TPayload;
}

const isBidWriter = (expert: { title?: string; bio?: string; skills?: string[] }) => {
  const haystack = `${expert.title || ''} ${expert.bio || ''} ${(expert.skills || []).join(' ')}`.toLowerCase();
  return /bid|proposal|tender|writer/.test(haystack);
};

export default function SearchExpertsTabContent({ mode }: SearchExpertsTabContentProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { experts } = useExperts();
  const {
    availableCredits,
    libraryExpertIds,
    unlockExpertCV,
  } = useCVCredits();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const [selectedSectors, setSelectedSectors] = useState<SectorEnum[]>([]);
  const [selectedSubSectors, setSelectedSubSectors] = useState<SubSectorEnum[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<RegionEnum[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<CountryEnum[]>([]);
  const [hoveredSector, setHoveredSector] = useState<SectorEnum | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [sourceFilter, setSourceFilter] = useState<ExpertSourceFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showSectorFilters, setShowSectorFilters] = useState(false);
  const [showRegionFilters, setShowRegionFilters] = useState(false);
  const [pendingUnlockExpert, setPendingUnlockExpert] = useState<PendingUnlockExpert | null>(null);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearchEntry<ExpertsSavedPayload>[]>([]);

  const storageKey = `search.tab.saved.${mode}`;

  const filteredExperts = useMemo(() => {
    let filtered = [...experts.data];

    const isInLibrary = (expert: { id: string; organizationId?: string }) =>
      expert.organizationId === 'org-1' || libraryExpertIds.includes(expert.id);

    if (mode === 'my-experts') {
      filtered = filtered.filter((expert) => expert.organizationId === 'org-1' || libraryExpertIds.includes(expert.id));
    }

    if (mode === 'bid-writers') {
      filtered = filtered.filter((expert) => isBidWriter(expert));
    }

    if (sourceFilter === 'assortis-database') {
      filtered = filtered.filter((expert) => !isInLibrary(expert));
    }

    if (sourceFilter === 'my-uploaded-cvs') {
      filtered = filtered.filter((expert) => isInLibrary(expert));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((expert) => {
        const fullName = `${expert.firstName} ${expert.lastName}`.toLowerCase();
        const location = `${expert.city} ${expert.country}`.toLowerCase();
        return (
          fullName.includes(query) ||
          expert.title?.toLowerCase().includes(query) ||
          location.includes(query) ||
          expert.bio?.toLowerCase().includes(query) ||
          expert.skills?.some((skill) => skill.toLowerCase().includes(query)) ||
          expert.sectors?.some((sector) => sector.toLowerCase().includes(query))
        );
      });
    }

    if (selectedSectors.length > 0) {
      filtered = filtered.filter((expert) =>
        expert.sectors?.some((sector) => selectedSectors.map(String).includes(String(sector)))
      );
    }

    if (selectedSubSectors.length > 0) {
      filtered = filtered.filter((expert) =>
        (expert as { subSectors?: string[] }).subSectors?.some((sub) => selectedSubSectors.map(String).includes(String(sub)))
      );
    }

    if (selectedRegions.length > 0) {
      filtered = filtered.filter((expert) => selectedRegions.map(String).includes(String(expert.region)));
    }

    if (selectedCountries.length > 0) {
      filtered = filtered.filter((expert) => selectedCountries.map(String).includes(String(expert.country)));
    }

    if (selectedExperience.length > 0) {
      filtered = filtered.filter((expert) => {
        const years = expert.yearsOfExperience;
        return selectedExperience.some((range) => {
          if (range === '0-5') return years <= 5;
          if (range === '5-10') return years > 5 && years <= 10;
          if (range === '10-15') return years > 10 && years <= 15;
          if (range === '15+') return years > 15;
          return true;
        });
      });
    }

    return filtered;
  }, [experts.data, libraryExpertIds, mode, searchQuery, selectedCountries, selectedExperience, selectedRegions, selectedSectors, selectedSubSectors, sourceFilter]);

  useEffect(() => {
    const q = (searchParams.get('q') || '').trim();
    if (!q) return;
    setSearchQuery(q);
  }, [searchParams]);

  const handleBuyPack = () => {
    navigate('/compte-utilisateur/credits');
  };

  const handleAccessCV = (expertId: string, expertName: string) => {
    const unlockResult = unlockExpertCV(expertId, expertName, 1);

    if (!unlockResult.success && unlockResult.error === 'INSUFFICIENT_CREDITS') {
      toast.error(t('experts.credits.notEnough'), {
        action: {
          label: t('experts.credits.buyMore'),
          onClick: handleBuyPack,
        },
      });
      return;
    }

    toast.success(t('experts.credits.unlockSuccess', { name: expertName }), {
      description: t('experts.credits.remainingAfterUnlock', { count: availableCredits - 1 }),
    });
  };

  const handleOpenUnlockConfirmation = (expertId: string, expertName: string) => {
    if (availableCredits < 1) {
      toast.error(t('experts.credits.notEnough'), {
        action: {
          label: t('experts.credits.buyMore'),
          onClick: handleBuyPack,
        },
      });
      return;
    }

    setPendingUnlockExpert({ id: expertId, name: expertName });
  };

  const handleConfirmUnlock = () => {
    if (!pendingUnlockExpert) return;
    handleAccessCV(pendingUnlockExpert.id, pendingUnlockExpert.name);
    setPendingUnlockExpert(null);
  };

  const activeFiltersCount = selectedSectors.length + selectedSubSectors.length + selectedRegions.length + selectedCountries.length + selectedExperience.length + (sourceFilter === 'all' ? 0 : 1);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedSectors([]);
    setSelectedSubSectors([]);
    setSelectedRegions([]);
    setSelectedCountries([]);
    setSelectedExperience([]);
    setSourceFilter('all');
  };

  const readSavedSearches = (): SavedSearchEntry<ExpertsSavedPayload>[] => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item && item.payload);
      }

      if (parsed && typeof parsed === 'object') {
        return [{
          id: `legacy-${mode}`,
          label: `Saved ${mode}`,
          createdAt: new Date().toISOString(),
          payload: parsed,
        }];
      }
    } catch {
      return [];
    }

    return [];
  };

  const applySavedSearch = (payload: ExpertsSavedPayload) => {
    setSearchQuery(payload.searchQuery || '');
    setSelectedSectors(payload.selectedSectors || []);
    setSelectedSubSectors(payload.selectedSubSectors || []);
    setSelectedRegions(payload.selectedRegions || []);
    setSelectedCountries(payload.selectedCountries || []);
    setSelectedExperience(payload.selectedExperience || []);
    setSourceFilter(payload.sourceFilter || 'all');
  };

  const saveSearch = () => {
    const existing = readSavedSearches();
    const now = new Date();
    const entry: SavedSearchEntry<ExpertsSavedPayload> = {
      id: `saved-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
      label: searchQuery.trim() || `Saved ${mode} ${format(now, 'yyyy-MM-dd HH:mm')}`,
      createdAt: now.toISOString(),
      payload: {
        searchQuery,
        selectedSectors,
        selectedSubSectors,
        selectedRegions,
        selectedCountries,
        selectedExperience,
        sourceFilter,
      },
    };

    localStorage.setItem(storageKey, JSON.stringify([entry, ...existing]));
    toast.success('Search saved');
  };

  const openLoadSearchDialog = () => {
    setSavedSearches(readSavedSearches());
    setIsLoadDialogOpen(true);
  };

  const sectionHeadingKey = `search.section.${mode}.filters.heading`;
  const sectionDescriptionKey = `search.section.${mode}.filters.description`;

  return (
    <div className="space-y-6">
      {mode !== 'my-experts' && (
        <CVCreditsSummaryCard
          label={t('experts.credits.availableLabel')}
          value={t('experts.credits.availableValue', { count: availableCredits })}
          buyLabel={t('experts.credits.buyPack')}
          onBuyPack={handleBuyPack}
        />
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-primary">{t(sectionHeadingKey)}</h2>
            <p className="text-sm text-gray-600 mt-1">{t(sectionDescriptionKey)}</p>
          </div>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{t('activeTenders.filters.active', { count: activeFiltersCount })}</Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <X className="w-4 h-4 mr-1" />
              {t('filters.clear')}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowFilters((prev) => !prev)}>
            {showFilters ? 'Hide filters' : 'Show filters'}
          </Button>
          <Button variant="default" size="sm">Search</Button>
          <Button variant="outline" size="sm" onClick={saveSearch}>Save Search</Button>
          <Button variant="outline" size="sm" onClick={openLoadSearchDialog}>Load Search</Button>
        </div>

        {showFilters && (
          <>
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 mb-2 block">{t('common.search')}</label>
              <div className="flex gap-2">
                <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={t('experts.filters.search')} className="flex-1" />
                <Button type="button" size="icon">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="mb-5 space-y-3 rounded-lg border border-gray-200 p-4">
              <Label className="text-sm font-medium text-gray-700">Source</Label>
              <RadioGroup
                value={sourceFilter}
                onValueChange={(value) => setSourceFilter(value as ExpertSourceFilter)}
                className="grid grid-cols-1 gap-2 md:grid-cols-3"
              >
                <div className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
                  <RadioGroupItem id="experts-source-all" value="all" />
                  <Label htmlFor="experts-source-all" className="cursor-pointer text-sm font-medium text-gray-700">
                    All
                  </Label>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
                  <RadioGroupItem id="experts-source-assortis" value="assortis-database" />
                  <Label htmlFor="experts-source-assortis" className="cursor-pointer text-sm font-medium text-gray-700">
                    Assortis Database (not acquired yet) <span className="text-xs font-normal text-amber-700">(uses credits)</span>
                  </Label>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
                  <RadioGroupItem id="experts-source-my-cvs" value="my-uploaded-cvs" />
                  <Label htmlFor="experts-source-my-cvs" className="cursor-pointer text-sm font-medium text-gray-700">
                    Bought CVs <span className="text-xs font-normal text-emerald-700">(free)</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center gap-3 py-1">
              <Button
                variant="outline"
                size="sm"
                className={`min-h-9 inline-flex items-center gap-2 border transition-all ${showSectorFilters ? 'bg-white text-accent border-accent shadow-sm hover:bg-slate-50 hover:text-accent' : 'bg-accent text-white border-accent hover:bg-accent/90'}`}
                onClick={() => setShowSectorFilters(prev => !prev)}
              >
                <Plus className={`h-3.5 w-3.5 transition-transform ${showSectorFilters ? 'rotate-45' : ''}`} />
                {t('activeTenders.filters.sectors')} ({selectedSubSectors.length})
              </Button>
            </div>

            <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${showSectorFilters ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <SectorSubsectorFilter
                selectedSectors={selectedSectors}
                selectedSubSectors={selectedSubSectors}
                hoveredSector={hoveredSector}
                onHoverSector={setHoveredSector}
                onSelectSector={(sector) => {
                  const next = selectedSectors.includes(sector)
                    ? selectedSectors.filter((item) => item !== sector)
                    : [...selectedSectors, sector];
                  setSelectedSectors(next);
                  if (next.length === 0) {
                    setSelectedSubSectors([]);
                    return;
                  }
                  const validSubSectors = selectedSubSectors.filter((sub) => next.some((sec) => SECTOR_SUBSECTOR_MAP[sec]?.includes(sub)));
                  setSelectedSubSectors(validSubSectors);
                }}
                onSelectSubSector={(subSector) => {
                  const next = selectedSubSectors.includes(subSector)
                    ? selectedSubSectors.filter((item) => item !== subSector)
                    : [...selectedSubSectors, subSector];
                  setSelectedSubSectors(next);
                }}
                onSelectAllSectors={() => {
                  const all = Object.values(SectorEnum);
                  if (selectedSectors.length === all.length) {
                    setSelectedSectors([]);
                    setSelectedSubSectors([]);
                  } else {
                    setSelectedSectors(all);
                  }
                }}
                onSelectAllSubSectors={(sector) => {
                  const sectorSubs = SECTOR_SUBSECTOR_MAP[sector] || [];
                  const allSelected = sectorSubs.every((sub) => selectedSubSectors.includes(sub));
                  if (allSelected) {
                    setSelectedSubSectors((prev) => prev.filter((sub) => !sectorSubs.includes(sub)));
                  } else {
                    setSelectedSubSectors((prev) => [...new Set([...prev, ...sectorSubs])]);
                  }
                }}
                t={t}
              />
            </div>

            <div className="flex items-center gap-3 py-1">
              <Button
                variant="outline"
                size="sm"
                className={`min-h-9 inline-flex items-center gap-2 border transition-all ${showRegionFilters ? 'bg-white text-accent border-accent shadow-sm hover:bg-slate-50 hover:text-accent' : 'bg-accent text-white border-accent hover:bg-accent/90'}`}
                onClick={() => setShowRegionFilters(prev => !prev)}
              >
                <Plus className={`h-3.5 w-3.5 transition-transform ${showRegionFilters ? 'rotate-45' : ''}`} />
                {t('activeTenders.filters.regions')} ({selectedCountries.length})
              </Button>
            </div>

            <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${showRegionFilters ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <RegionCountryFilter
                selectedRegions={selectedRegions}
                selectedCountries={selectedCountries}
                onSelectRegion={(region) => {
                  const next = selectedRegions.includes(region)
                    ? selectedRegions.filter((item) => item !== region)
                    : [...selectedRegions, region];
                  setSelectedRegions(next);
                  if (next.length === 0) {
                    setSelectedCountries([]);
                    return;
                  }
                  const validCountries = selectedCountries.filter((country) => next.some((reg) => REGION_COUNTRY_MAP[reg]?.includes(country)));
                  setSelectedCountries(validCountries);
                }}
                onSelectCountry={(country) => {
                  const next = selectedCountries.includes(country)
                    ? selectedCountries.filter((item) => item !== country)
                    : [...selectedCountries, country];
                  setSelectedCountries(next);
                }}
                onSelectAllRegions={() => {
                  const all = Object.values(RegionEnum);
                  if (selectedRegions.length === all.length) {
                    setSelectedRegions([]);
                    setSelectedCountries([]);
                  } else {
                    setSelectedRegions(all);
                  }
                }}
                t={t}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">{t('experts.filters.experience')}</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-10 px-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{selectedExperience.length > 0 ? `${selectedExperience.length} selected` : 'Select experience'}</span>
                      </div>
                      {selectedExperience.length > 0 && <Badge className="ml-2 flex-shrink-0" variant="secondary">{selectedExperience.length}</Badge>}
                      <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72" align="start">
                    <div className="space-y-2">
                      {['0-5', '5-10', '10-15', '15+'].map((exp) => (
                        <Button key={exp} variant={selectedExperience.includes(exp) ? 'default' : 'outline'} size="sm" className="w-full justify-start text-xs" onClick={() => {
                          const next = selectedExperience.includes(exp)
                            ? selectedExperience.filter((item) => item !== exp)
                            : [...selectedExperience, exp];
                          setSelectedExperience(next);
                        }}>
                          {selectedExperience.includes(exp) && <CheckCircle className="w-3 h-3 mr-2" />}
                          {t(`experts.experience.${exp}`)}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mb-5">
        <h3 className="text-lg font-semibold text-primary">{filteredExperts.length} {t('experts.list.expertsFound')}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExperts.map((expert) => (
          <div
            key={expert.id}
            className={`rounded-lg border p-6 hover:shadow-md transition-shadow cursor-pointer ${
              (expert.organizationId === 'org-1' || libraryExpertIds.includes(expert.id))
                ? 'bg-emerald-50/30 border-emerald-200'
                : 'bg-white border-accent/35'
            }`}
            onClick={() => navigate(`/search/experts/${expert.id}`)}
          >
            {(() => {
              const isInLibrary = expert.organizationId === 'org-1' || libraryExpertIds.includes(expert.id);
              const isNewExpert = !isInLibrary;

              return (
                <>
                  <div className="flex items-center justify-between mb-3 gap-2">
                    {!isNewExpert && (
                      <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700 bg-emerald-100/40">
                        {t('experts.credits.freeAccess')}
                      </Badge>
                    )}
                    {isNewExpert ? (
                      <div className="flex items-center gap-2">
                        <Badge className="text-xs bg-accent text-white hover:bg-accent">{t('experts.credits.badge.new')}</Badge>
                        <Badge variant="outline" className="text-xs">{t('experts.credits.costPerCv')}</Badge>
                      </div>
                    ) : (
                      <Badge className="text-xs bg-emerald-600 text-white hover:bg-emerald-600">{t('experts.credits.badge.inLibrary')}</Badge>
                    )}
                  </div>

            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <UserCircle className="w-10 h-10 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{isNewExpert ? `Expert ${expert.id}` : `${expert.firstName} ${expert.lastName}`}</h4>
                <p className="text-sm text-gray-600 truncate">{expert.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500 truncate">{expert.city}, {expert.country}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1"><Briefcase className="w-4 h-4 text-primary" /><span className="text-xs text-gray-600">{t('experts.yearsExp')}</span></div>
                <p className="text-lg font-semibold text-primary">{expert.yearsOfExperience || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1"><Star className="w-4 h-4 text-yellow-500" /><span className="text-xs text-gray-600">{t('experts.rating')}</span></div>
                <p className="text-lg font-semibold text-primary">{expert.clientRating?.toFixed(1) || '0.0'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {expert.verified && <Badge variant="secondary" className="text-xs"><CheckCircle className="w-3 h-3 mr-1" />{t('experts.verified')}</Badge>}
              {!!(expert as { certifications?: unknown[] }).certifications?.length && (
                <Badge variant="secondary" className="text-xs">
                  <UserCheck className="w-3 h-3 mr-1" />
                  {(expert as { certifications?: unknown[] }).certifications?.length} {t('experts.certifications')}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs"><Clock className="w-3 h-3 mr-1" />{t(`experts.availability.${expert.availability}`)}</Badge>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-2">{t('experts.skills')}:</p>
              <div className="flex flex-wrap gap-1">
                {expert.skills && expert.skills.slice(0, 3).map((skill, index) => (
                  <Badge key={`${expert.id}-skill-${index}-${skill}`} variant="outline" className="text-xs">{skill}</Badge>
                ))}
                {expert.skills && expert.skills.length > 3 && <Badge variant="outline" className="text-xs">+{expert.skills.length - 3}</Badge>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1"><TrendingUp className="w-3 h-3 text-gray-400" /><span className="text-xs text-gray-600">{t('experts.missions')}</span></div>
                <p className="text-sm font-semibold text-primary">{expert.completedMissions || 0}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1"><CheckCircle className="w-3 h-3 text-gray-400" /><span className="text-xs text-gray-600">{t('experts.profile')}</span></div>
                <p className="text-sm font-semibold text-primary">{expert.profileCompleteness || 0}%</p>
              </div>
            </div>

            <Button
              variant={isNewExpert ? 'default' : 'outline'}
              size="sm"
              className="w-full min-h-11"
              onClick={(event) => {
                event.stopPropagation();
                if (isNewExpert) {
                  handleOpenUnlockConfirmation(expert.id, `Expert ${expert.id}`);
                  return;
                }
                navigate(`/search/experts/${expert.id}`);
              }}
            >
              {isNewExpert ? t('experts.credits.cta.accessCv') : t('experts.credits.cta.viewProfile')}
            </Button>
                </>
              );
            })()}
          </div>
        ))}
      </div>

      <Dialog open={!!pendingUnlockExpert} onOpenChange={(isOpen) => !isOpen && setPendingUnlockExpert(null)}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>{t('experts.credits.confirm.title')}</DialogTitle>
            <DialogDescription>
              {t('experts.credits.confirm.description', {
                name: pendingUnlockExpert?.name || '',
                count: availableCredits,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setPendingUnlockExpert(null)}>
              {t('experts.credits.confirm.cancel')}
            </Button>
            <Button onClick={handleConfirmUnlock}>
              {t('experts.credits.confirm.action')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Load Search</DialogTitle>
            <DialogDescription>Choose a saved search for this page.</DialogDescription>
          </DialogHeader>
          {savedSearches.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved searches found for this page.</p>
          ) : (
            <div className="max-h-80 overflow-auto space-y-2">
              {savedSearches.map(entry => (
                <Button
                  key={entry.id}
                  type="button"
                  variant="outline"
                  className="w-full justify-between h-auto py-2"
                  onClick={() => {
                    applySavedSearch(entry.payload);
                    setIsLoadDialogOpen(false);
                    toast.success('Search loaded');
                  }}
                >
                  <span className="truncate text-left max-w-[70%]">{entry.label}</span>
                  <span className="text-xs text-muted-foreground">{format(new Date(entry.createdAt), 'yyyy-MM-dd HH:mm')}</span>
                </Button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {filteredExperts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-primary mb-1">{t('experts.list.noResults')}</h3>
          <p className="text-sm text-muted-foreground">{t('experts.list.noResults.message')}</p>
          <Button variant="outline" onClick={clearAllFilters} className="mt-4">{t('filters.clear')}</Button>
        </div>
      )}
    </div>
  );
}
