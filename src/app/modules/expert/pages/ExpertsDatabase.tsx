import { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router';
import { ChevronDown, ChevronRight, Database, Download, Eye, Link2, Loader2, Lock, Search, ShieldCheck, X } from 'lucide-react';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ExpertsSubMenu } from '@app/components/ExpertsSubMenu';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@app/components/ui/dialog';
import { SaveSearchDialog } from '@app/components/SaveSearchDialog';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import {
  BONUS_FUNDING_AGENCIES,
  COUNTRY_GROUPS,
  CV_LANGUAGE_OPTIONS,
  DATABASES,
  EDUCATION_OPTIONS,
  EXPERT_SEARCH_TOTAL,
  FilterGroup,
  LANGUAGE_LEVELS,
  LANGUAGE_OPTIONS,
  MAJOR_FUNDING_AGENCIES,
  NATIONALITY_OPTIONS,
  SECTOR_GROUPS,
  SENIORITY_OPTIONS,
  TIMEFRAME_OPTIONS,
} from '@app/modules/expert/data/expertSearchFilters';
import {
  ExpertSearchFilters,
  ExpertPreviewDTO,
  ExpertSearchResult,
  getExpertPreview,
  searchExperts,
} from '@app/modules/expert/services/expertSearch.service';
import { useAuth } from '@app/contexts/AuthContext';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useCVCredits } from '@app/contexts/CVCreditsContext';
import { buildOrganizationProfileSearchFields, savedSearchService } from '@app/services/savedSearchService';
import { JobOfferListDTO, JobOfferStatusEnum } from '@app/modules/posting-board/types/JobOffer.dto';
import { getAllJobOffers } from '@app/modules/posting-board/services/jobOfferService';
import { downloadExpertCvFile } from '@app/modules/expert/services/expertReferenceGeneration.service';
import { toast } from 'sonner';

const EMPTY_FILTERS: ExpertSearchFilters = {
  sectors: [],
  subSectors: [],
  countries: [],
  regions: [],
  fundingAgencies: [],
  databases: [],
  nationality: [],
  education: [],
  languages: [],
  allWords: true,
  searchOnlineCvs: false,
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter(item => item !== value) : [...values, value];
}

function normalizeList(values: string[]) {
  return values.filter(value => value && value !== 'all');
}

function MultiOptionList({
  title,
  options,
  selected,
  onChange,
  searchable = true,
  maxHeight = 'max-h-64',
}: {
  title?: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  searchable?: boolean;
  maxHeight?: string;
}) {
  const [query, setQuery] = useState('');
  const filteredOptions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter(option => option.toLowerCase().includes(needle));
  }, [options, query]);

  // Get available countries based on selected regions
  const availableCountries = useMemo(() => {
    if (selectedRegions.length === 0) return [];
    const countries: string[] = [];
    selectedRegions.forEach(region => {
      const regionCountries = REGION_COUNTRY_MAP[region as RegionEnum] || [];
      countries.push(...regionCountries);
    });
    return [...new Set(countries)];
  }, [selectedRegions]);

  // Experience ranges
  const experienceRanges = [
    { value: '0-5', label: '0-5 years' },
    { value: '5-10', label: '5-10 years' },
    { value: '10-15', label: '10-15 years' },
    { value: '15+', label: '15+ years' },
  ];

  // Real-time search and filter
  const filteredExperts = useMemo(() => {
    let filtered = [...experts.data];

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((expert) => {
        const fullName = `${expert.firstName} ${expert.lastName}`.toLowerCase();
        const cityStr = typeof expert.city === 'object' ? (expert.city as any)?.name : (expert.city || '');
        const countryStr = typeof expert.country === 'object' ? (expert.country as any)?.name : (expert.country || '');
        const location = `${cityStr} ${countryStr}`.toLowerCase();

        return (
          fullName.includes(query) ||
          expert.title?.toLowerCase().includes(query) ||
          location.includes(query) ||
          expert.bio?.toLowerCase().includes(query) ||
          expert.skills?.some(skill => (typeof skill === 'object' ? (skill as any).skillName : String(skill)).toLowerCase().includes(query)) ||
          expert.sectors?.some(sector => sector.toLowerCase().includes(query))
        );
      });
    }

    // Filter by sectors
    if (selectedSectors.length > 0) {
      filtered = filtered.filter((expert) =>
        expert.sectors?.some(sector => selectedSectors.includes(sector))
      );
    }

    // Filter by subsectors
    if (selectedSubSectors.length > 0) {
      filtered = filtered.filter((expert) =>
        expert.subSectors?.some(sub => selectedSubSectors.includes(sub))
      );
    }

    // Filter by regions
    if (selectedRegions.length > 0) {
      filtered = filtered.filter((expert) =>
        selectedRegions.includes(expert.region)
      );
    }

    // Filter by countries
    if (selectedCountries.length > 0) {
      filtered = filtered.filter((expert) =>
        selectedCountries.includes(expert.country)
      );
    }

    // Filter by years of experience
    if (selectedExperience.length > 0) {
      filtered = filtered.filter((expert) => {
        const years = expert.yearsOfExperience;
        return selectedExperience.some(range => {
          switch (range) {
            case '0-5':
              return years <= 5;
            case '5-10':
              return years > 5 && years <= 10;
            case '10-15':
              return years > 10 && years <= 15;
            case '15+':
              return years > 15;
            default:
              return true;
          }
        });
      });
    }

    return filtered;
  }, [experts.data, searchQuery, selectedSectors, selectedSubSectors, selectedRegions, selectedCountries, selectedExperience]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSectorFilter = (sector: string) => {
    const newSectors = selectedSectors.includes(sector)
      ? selectedSectors.filter(s => s !== sector)
      : [...selectedSectors, sector];

    setSelectedSectors(newSectors);

    // Clear subsectors if no sectors selected
    if (newSectors.length === 0) {
      setSelectedSubSectors([]);
    } else {
      // Remove invalid subsectors
      const validSubSectors = selectedSubSectors.filter(sub => {
        return newSectors.some(sec => SUBSECTOR_MAP[sec as SectorEnum]?.includes(sub));
      });
      setSelectedSubSectors(validSubSectors);
    }
  };

  const handleSubSectorFilter = (subSector: string) => {
    const newSubSectors = selectedSubSectors.includes(subSector)
      ? selectedSubSectors.filter(s => s !== subSector)
      : [...selectedSubSectors, subSector];
    setSelectedSubSectors(newSubSectors);
  };

  const handleRegionFilter = (region: string) => {
    const newRegions = selectedRegions.includes(region)
      ? selectedRegions.filter(r => r !== region)
      : [...selectedRegions, region];

    setSelectedRegions(newRegions);

    // Clear countries if no regions selected
    if (newRegions.length === 0) {
      setSelectedCountries([]);
    } else {
      // Remove invalid countries
      const validCountries = selectedCountries.filter(country => {
        return newRegions.some(reg => REGION_COUNTRY_MAP[reg as RegionEnum]?.includes(country));
      });
      setSelectedCountries(validCountries);
    }
  };

  const handleCountryFilter = (country: string) => {
    const newCountries = selectedCountries.includes(country)
      ? selectedCountries.filter(c => c !== country)
      : [...selectedCountries, country];
    setSelectedCountries(newCountries);
  };

  const handleExperienceFilter = (experience: string) => {
    const newExperience = selectedExperience.includes(experience)
      ? selectedExperience.filter(e => e !== experience)
      : [...selectedExperience, experience];
    setSelectedExperience(newExperience);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedSectors([]);
    setSelectedSubSectors([]);
    setSelectedRegions([]);
    setSelectedCountries([]);
    setSelectedExperience([]);
  };

  const activeFiltersCount = selectedSectors.length + selectedSubSectors.length + selectedRegions.length + selectedCountries.length + selectedExperience.length;

  return (
    <div className="space-y-3">
      {title && <h4 className="text-sm font-semibold text-gray-900">{title}</h4>}
      {searchable && (
        <Input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search options..."
          className="min-h-10"
        />
      )}
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            if (allFilteredSelected) {
              onChange(selected.filter(value => !filteredOptions.includes(value)));
            } else {
              onChange([...new Set([...selected, ...filteredOptions])]);
            }
          }}
        >
          {allFilteredSelected ? 'Clear visible' : 'Select all'}
        </Button>
        {selected.length > 0 && (
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange([])}>
            Clear
          </Button>
        )}
      </div>
      <div className={`${maxHeight} space-y-2 overflow-auto rounded-md border border-gray-200 p-3`}>
        {filteredOptions.map(option => (
          <label key={option} className="flex items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4"
              checked={selected.includes(option)}
              onChange={() => onChange(toggleValue(selected, option))}
            />
            <span>{option}</span>
          </label>
        ))}
        {filteredOptions.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-500">No options found.</p>
        )}
      </div>
    </div>
  );
}

function GroupedFilter({
  groups,
  selectedGroups,
  selectedOptions,
  groupLabel,
  optionLabel,
  onGroupsChange,
  onOptionsChange,
}: {
  groups: FilterGroup[];
  selectedGroups: string[];
  selectedOptions: string[];
  groupLabel: string;
  optionLabel: string;
  onGroupsChange: (next: string[]) => void;
  onOptionsChange: (next: string[]) => void;
}) {
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const allGroupsSelected = groups.every(group => selectedGroups.includes(group.label));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            onGroupsChange(allGroupsSelected ? [] : groups.map(group => group.label));
          }}
        >
          {allGroupsSelected ? `Clear all ${groupLabel}` : `Select all ${groupLabel}`}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => onOptionsChange([])}>
          Clear {optionLabel}
        </Button>
      </div>
      <div className="space-y-2">
        {groups.map(group => {
          const isOpen = openGroups.includes(group.label);
          const allOptionsSelected = group.options.every(option => selectedOptions.includes(option));
          return (
            <div key={group.label} className="rounded-md border border-gray-200">
              <div className="flex items-center gap-2 px-3 py-2">
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded hover:bg-gray-100"
                  onClick={() => setOpenGroups(prev => toggleValue(prev, group.label))}
                  aria-label={group.label}
                >
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <label className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium text-gray-900">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={selectedGroups.includes(group.label)}
                    onChange={() => onGroupsChange(toggleValue(selectedGroups, group.label))}
                  />
                  <span className="truncate">{group.label}</span>
                </label>
                <Badge variant="secondary">{group.options.length}</Badge>
              </div>
              {isOpen && (
                <div className="border-t border-gray-100 p-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mb-3"
                    onClick={() => {
                      if (allOptionsSelected) {
                        onOptionsChange(selectedOptions.filter(option => !group.options.includes(option)));
                      } else {
                        onOptionsChange([...new Set([...selectedOptions, ...group.options])]);
                      }
                    }}
                  >
                    {allOptionsSelected ? 'Clear sub-sectors' : 'Select all sub-sectors'}
                  </Button>
                  <MultiOptionList
                    options={group.options}
                    selected={selectedOptions}
                    onChange={onOptionsChange}
                    searchable
                    maxHeight="max-h-72"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  count,
  children,
  defaultOpen = false,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        onClick={() => setOpen(prev => !prev)}
      >
        <span className="font-semibold text-primary">{title}</span>
        <span className="flex items-center gap-2">
          {Boolean(count) && <Badge variant="secondary">{count}</Badge>}
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>
      </button>
      {open && <div className="border-t border-gray-100 p-4">{children}</div>}
    </section>
  );
}

function ReferenceSection({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-md border border-primary/30 bg-white shadow-sm">
      <div className="flex min-h-8 items-center justify-between gap-3 bg-primary px-4 py-2 text-white">
        <h2 className="text-sm font-semibold">{title}</h2>
        {Boolean(count) && <Badge className="bg-white/15 text-white hover:bg-white/20">{count} selected</Badge>}
      </div>
      <div className="bg-slate-50/80">{children}</div>
    </section>
  );
}

function ReferenceGroupedFilter({
  groups,
  selectedGroup,
  selectedGroups,
  selectedOptions,
  onSelectedGroupChange,
  onGroupsChange,
  onOptionsChange,
  selectAllLabel,
  simultaneousLabel,
}: {
  groups: FilterGroup[];
  selectedGroup: string;
  selectedGroups: string[];
  selectedOptions: string[];
  onSelectedGroupChange: (group: string) => void;
  onGroupsChange: (next: string[]) => void;
  onOptionsChange: (next: string[]) => void;
  selectAllLabel: string;
  simultaneousLabel?: string;
}) {
  const activeGroup = groups.find(group => group.label === selectedGroup) || groups[0];
  const allOptionsSelected = activeGroup.options.every(option => selectedOptions.includes(option));
  const [query, setQuery] = useState('');
  const filteredOptions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return activeGroup.options;
    return activeGroup.options.filter(option => option.toLowerCase().includes(needle));
  }, [activeGroup.options, query]);

  return (
    <div className="grid min-h-[360px] md:grid-cols-[320px_1fr]">
      <div className="border-b border-primary/20 bg-white p-3 md:border-b-0 md:border-r">
        <div className="grid grid-cols-2 gap-1 md:block md:space-y-1">
          {groups.map(group => {
            const active = group.label === activeGroup.label;
            return (
              <button
                key={group.label}
                type="button"
                className={`w-full rounded px-2 py-1.5 text-left text-xs font-medium underline-offset-2 transition md:text-right ${active
                  ? 'bg-accent text-white no-underline shadow-sm'
                  : 'text-primary underline hover:bg-slate-100'
                  }`}
                onClick={() => onSelectedGroupChange(group.label)}
              >
                {group.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-100 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-primary">{activeGroup.label}</h3>
            <label className="mt-2 flex items-center gap-2 text-sm font-semibold text-primary">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={selectedGroups.includes(activeGroup.label)}
                onChange={() => onGroupsChange(toggleValue(selectedGroups, activeGroup.label))}
              />
              {selectAllLabel}
            </label>
          </div>
          <Input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search options..."
            className="h-9 bg-white md:w-72"
          />
        </div>
        <div className="max-h-[420px] overflow-auto">
          <label className="flex items-center gap-2 border-b border-gray-100 bg-white px-5 py-2 text-sm font-medium text-primary">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={allOptionsSelected}
              onChange={() => {
                if (allOptionsSelected) {
                  onOptionsChange(selectedOptions.filter(option => !activeGroup.options.includes(option)));
                } else {
                  onOptionsChange([...new Set([...selectedOptions, ...activeGroup.options])]);
                }
              }}
            />
            {allOptionsSelected ? 'Clear all options' : 'Select all options'}
          </label>
          {filteredOptions.map(option => (
            <label key={option} className="flex items-start gap-2 border-b border-gray-100 px-5 py-2 text-sm text-gray-800">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4"
                checked={selectedOptions.includes(option)}
                onChange={() => onOptionsChange(toggleValue(selectedOptions, option))}
              />
              <span>{option}</span>
            </label>
          ))}
          {filteredOptions.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-gray-500">No options found.</p>
          )}
        </div>
        {simultaneousLabel && (
          <label className="flex items-center gap-2 border-t border-gray-200 bg-white px-5 py-3 text-sm text-gray-800">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={groups.every(group => selectedGroups.includes(group.label))}
              onChange={() => {
                const allSelected = groups.every(group => selectedGroups.includes(group.label));
                onGroupsChange(allSelected ? [] : groups.map(group => group.label));
              }}
            />
            {simultaneousLabel}
          </label>
        )}
      </div>
    </div>
  );
}

function ExpertCard({
  expert,
  isUnlocked,
  onPreview,
  onOpenUnlocked,
}: {
  expert: ExpertSearchResult;
  isUnlocked: boolean;
  onPreview: (expert: ExpertSearchResult) => void;
  onOpenUnlocked: (expert: ExpertSearchResult) => void;
}) {
  const displayName = expert.fullName || [expert.firstName, expert.lastName].filter(Boolean).join(' ') || `Expert #${expert.id}`;
  const sectors = expert.sectors?.map(item => item.sectorName || item.sectorCode).filter(Boolean) || [];
  const skills = expert.skills?.map(item => item.skillName).filter(Boolean) || [];
  const openCard = () => {
    if (isUnlocked) {
      onOpenUnlocked(expert);
      return;
    }

    onPreview(expert);
  };

  return (
    <article
      className={`rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md ${isUnlocked
        ? 'border-emerald-300 ring-2 ring-emerald-100 hover:border-emerald-400'
        : 'border-gray-200 hover:border-primary/30'
        }`}
      role="button"
      tabIndex={0}
      onClick={openCard}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openCard();
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{isUnlocked ? displayName : `Expert #${expert.id}`}</h3>
          <p className="mt-1 text-sm text-gray-600">{expert.currentPosition || expert.title || 'Expert profile'}</p>
          <p className="mt-1 text-xs text-gray-500">
            {[expert.city?.name, expert.country?.name].filter(Boolean).join(', ') || 'Location N/A'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {isUnlocked ? (
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">Unlocked profile</Badge>
          ) : (
            <Badge className="bg-blue-50 text-blue-700 border border-blue-200">Free preview available</Badge>
          )}
          {expert.verified && <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">Verified</Badge>}
        </div>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-700">{expert.profileSummary || 'No profile summary available.'}</p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-md bg-gray-50 p-2">
          <p className="font-semibold text-gray-900">{expert.yearsExperience ?? 'N/A'}</p>
          <p className="text-gray-500">Years</p>
        </div>
        <div className="rounded-md bg-gray-50 p-2">
          <p className="font-semibold text-gray-900">{expert.completedProjects ?? expert.completedMissions ?? 'N/A'}</p>
          <p className="text-gray-500">Projects</p>
        </div>
        <div className="rounded-md bg-gray-50 p-2">
          <p className="font-semibold text-gray-900">{expert.level || 'N/A'}</p>
          <p className="text-gray-500">Seniority</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {[...sectors.slice(0, 3), ...skills.slice(0, 3)].map(item => (
          <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
        ))}
      </div>
      <Button
        type="button"
        variant={isUnlocked ? 'default' : 'outline'}
        size="sm"
        className="mt-4"
        onClick={(event) => {
          event.stopPropagation();
          openCard();
        }}
      >
        <Eye className="mr-2 h-4 w-4" />
        {isUnlocked ? 'Open full profile' : 'Preview profile'}
      </Button>
    </article>
  );
}

function PreviewList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h4>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map(item => <Badge key={item} variant="outline" className="text-xs">{item}</Badge>)}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Not specified in preview.</p>
      )}
    </div>
  );
}

function ExpertPreviewDialog({
  open,
  preview,
  isLoading,
  isUnlocked,
  availableCredits,
  onOpenChange,
  onUnlock,
  onViewFullProfile,
  projectVacancies,
  selectedVacancyId,
  onVacancyChange,
  onLinkToVacancy,
  onDownload,
}: {
  open: boolean;
  preview: ExpertPreviewDTO | null;
  isLoading: boolean;
  isUnlocked: boolean;
  availableCredits: number;
  onOpenChange: (open: boolean) => void;
  onUnlock: () => void;
  onViewFullProfile: () => void;
  projectVacancies: JobOfferListDTO[];
  selectedVacancyId: string;
  onVacancyChange: (vacancyId: string) => void;
  onLinkToVacancy: () => void;
  onDownload: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
            {preview?.maskedName || 'Expert preview'}
          </DialogTitle>
          <DialogDescription>
            Free preview. Unlock full profile to view identity, contact details, and direct contact actions.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading preview...
          </div>
        ) : preview ? (
          <div className="space-y-5">
            <div className="rounded-lg border border-primary/15 bg-primary/5 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-primary">{preview.title || preview.currentPosition || 'Expert profile'}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {[preview.city, preview.country].filter(Boolean).join(', ') || 'Location available in preview when provided'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-md bg-white p-3">
                    <p className="font-semibold text-gray-900">{preview.yearsExperience ?? 'N/A'}</p>
                    <p className="text-gray-500">Years</p>
                  </div>
                  <div className="rounded-md bg-white p-3">
                    <p className="font-semibold text-gray-900">{preview.completedProjects ?? 'N/A'}</p>
                    <p className="text-gray-500">Projects</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-700">{preview.profileSummary || 'No CV summary available in preview.'}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-4">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Personal Information</h4>
                <div className="grid gap-2 text-sm text-gray-700">
                  <p><span className="font-medium text-gray-900">Year of birth:</span> Available in unlocked CV</p>
                  <p><span className="font-medium text-gray-900">Nationality:</span> {preview.country || 'Not specified'}</p>
                  <p><span className="font-medium text-gray-900">Gender:</span> Not specified in preview</p>
                  <p><span className="font-medium text-gray-900">Marital status:</span> Not specified in preview</p>
                </div>
              </div>
              <PreviewList title="Sectors" items={preview.sectors} />
              <PreviewList title="Countries" items={preview.countries} />
              <PreviewList title="Skills" items={preview.skills} />
              <PreviewList title="Languages" items={preview.languages} />
              <PreviewList title="Education" items={preview.education} />
              <PreviewList title="Training" items={preview.skills.slice(0, 4)} />
              <PreviewList title="Professional Experience" items={preview.keyProjects} />
              <PreviewList title="Employment Record & Completed Projects" items={preview.keyProjects} />
            </div>

            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-4 w-4 text-gray-500" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Locked until full access</h4>
                  <p className="mt-1 text-sm text-gray-600">
                    Full name, email, phone, CV download, and direct contact actions are hidden in the free preview.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-primary/15 bg-white p-4">
              <h4 className="text-sm font-semibold text-primary">Link expert to my project vacancy</h4>
              <p className="mt-1 text-sm text-gray-600">Attach this expert as a recommended profile for an open vacancy.</p>
              <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
                <Select value={selectedVacancyId} onValueChange={onVacancyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project vacancy" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectVacancies.map((vacancy) => (
                      <SelectItem key={vacancy.id} value={vacancy.id}>
                        {vacancy.jobTitle}{vacancy.projectTitle ? ` - ${vacancy.projectTitle}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" onClick={onLinkToVacancy} disabled={!selectedVacancyId || !preview}>
                  <Link2 className="mr-2 h-4 w-4" />
                  Link
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-gray-500">Preview is unavailable.</p>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {isUnlocked ? (
            <>
              <Button type="button" variant="outline" onClick={onDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download CV
              </Button>
              <Button type="button" onClick={onViewFullProfile}>View full profile</Button>
            </>
          ) : (
            <Button type="button" onClick={onUnlock} disabled={!preview}>
              Use credit to view full details ({availableCredits} available)
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ExpertsSearchFiltersWorkspace() {
  const { user, activeOrganizationProfile } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { availableCredits, libraryExpertIds, unlockExpertCV, recordExpertDownload, linkExpertToVacancy } = useCVCredits();
  const [filters, setFilters] = useState<ExpertSearchFilters>(EMPTY_FILTERS);
  const [results, setResults] = useState<ExpertSearchResult[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState('updatedAt,desc');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSectorPanel, setSelectedSectorPanel] = useState(SECTOR_GROUPS[0]?.label || '');
  const [selectedCountryPanel, setSelectedCountryPanel] = useState(COUNTRY_GROUPS[0]?.label || '');
  const [isSaveSearchDialogOpen, setIsSaveSearchDialogOpen] = useState(false);
  const [previewExpert, setPreviewExpert] = useState<ExpertSearchResult | null>(null);
  const [preview, setPreview] = useState<ExpertPreviewDTO | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [searchOnlyDownloaded, setSearchOnlyDownloaded] = useState(false);
  const [showSectorFilter, setShowSectorFilter] = useState(false);
  const [showCountryFilter, setShowCountryFilter] = useState(false);
  const [pendingUnlockPreview, setPendingUnlockPreview] = useState(false);
  const [projectVacancies, setProjectVacancies] = useState<JobOfferListDTO[]>([]);
  const [selectedVacancyId, setSelectedVacancyId] = useState('');

  const activeChips = useMemo(() => {
    const chips: { key: keyof ExpertSearchFilters; label: string; value: string }[] = [];
    const scalarKeys: (keyof ExpertSearchFilters)[] = ['firstName', 'familyName', 'expertId', 'keywords', 'timeframeExperience', 'minProjects', 'currentlyWorkingIn', 'languageLevel', 'seniority', 'cvLanguage'];
    scalarKeys.forEach(key => {
      const value = filters[key];
      if (typeof value === 'string' && value) chips.push({ key, label: String(key), value });
    });
    (['sectors', 'subSectors', 'countries', 'regions', 'fundingAgencies', 'databases', 'nationality', 'education', 'languages'] as (keyof ExpertSearchFilters)[]).forEach(key => {
      const values = filters[key];
      if (Array.isArray(values)) values.forEach(value => chips.push({ key, label: String(key), value }));
    });
    return chips;
  }, [filters]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError('');
    searchExperts(filters, page, pageSize, sort)
      .then(response => {
        const nextResults = searchOnlyDownloaded
          ? (response.data || []).filter((expert) => libraryExpertIds.includes(String(expert.id)))
          : response.data || [];
        setResults(nextResults);
        setTotalItems(response.meta?.totalItems || 0);
      })
      .catch(error => {
        if (controller.signal.aborted) return;
        setError(error instanceof Error ? error.message : 'Unable to search experts');
        setResults([]);
        setTotalItems(0);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [filters, page, pageSize, sort, searchOnlyDownloaded, libraryExpertIds]);

  useEffect(() => {
    getAllJobOffers()
      .then((offers) => {
        setProjectVacancies(offers.filter((offer) => offer.status === JobOfferStatusEnum.PUBLISHED && Boolean(offer.projectTitle || offer.linkedProjectId)));
      })
      .catch(() => setProjectVacancies([]));
  }, []);

  const updateFilters = (patch: Partial<ExpertSearchFilters>) => {
    setPage(0);
    setFilters(prev => ({ ...prev, ...patch }));
  };

  const clearAll = () => {
    setPage(0);
    setFilters(EMPTY_FILTERS);
  };

  useEffect(() => {
    const savedSearchId = searchParams.get('savedSearchId');
    if (!savedSearchId) return;
    const saved = savedSearchService.get(savedSearchId);
    if (saved?.context.type === 'experts') {
      setPage(0);
      setFilters({ ...EMPTY_FILTERS, ...(saved.filters as ExpertSearchFilters) });
      toast.success('Search loaded');
    }
  }, [searchParams]);

  const buildSummary = () => [
    filters.keywords ? `Keywords: ${filters.keywords}` : '',
    filters.firstName ? `First name: ${filters.firstName}` : '',
    filters.familyName ? `Family name: ${filters.familyName}` : '',
    filters.sectors.length ? `Sectors: ${filters.sectors.length}` : '',
    filters.subSectors.length ? `Subsectors: ${filters.subSectors.length}` : '',
    filters.countries.length ? `Countries: ${filters.countries.length}` : '',
    filters.regions.length ? `Regions: ${filters.regions.length}` : '',
    filters.fundingAgencies.length ? `Funding agencies: ${filters.fundingAgencies.length}` : '',
    filters.languages.length ? `Languages: ${filters.languages.length}` : '',
    filters.seniority ? `Seniority: ${filters.seniority}` : '',
  ].filter(Boolean);

  const saveSearch = (name: string) => {
    savedSearchService.save({
      userId: user?.id,
      name,
      ...buildOrganizationProfileSearchFields(activeOrganizationProfile),
      filters,
      context: {
        type: 'experts',
        route: '/search/experts',
        label: 'Experts',
        summary: buildSummary(),
        language,
        accountType: user?.accountType,
      },
    });
    setIsSaveSearchDialogOpen(false);
    toast.success('Search saved');
  };

  const removeChip = (chip: { key: keyof ExpertSearchFilters; value: string }) => {
    const current = filters[chip.key];
    if (Array.isArray(current)) {
      updateFilters({ [chip.key]: current.filter(value => value !== chip.value) } as Partial<ExpertSearchFilters>);
    } else {
      updateFilters({ [chip.key]: undefined } as Partial<ExpertSearchFilters>);
    }
  };

  const openPreview = (expert: ExpertSearchResult) => {
    navigate(`/search/experts/${expert.id}/preview`, {
      state: {
        expert,
        returnTo: `${location.pathname}${location.search}`,
      },
    });
  };

  const openUnlockedProfile = (expert: ExpertSearchResult) => {
    navigate(`/search/experts/${expert.id}`, { state: { searchSection: 'experts' } });
  };

  const closePreview = () => {
    setPreviewExpert(null);
    setPreview(null);
    setIsPreviewLoading(false);
  };

  const handleUnlockPreview = () => {
    if (!previewExpert) return;
    setPendingUnlockPreview(true);
  };

  const confirmUnlockPreview = () => {
    if (!previewExpert) return;
    setPendingUnlockPreview(false);
    const displayName = previewExpert.fullName || [previewExpert.firstName, previewExpert.lastName].filter(Boolean).join(' ') || `Expert #${previewExpert.id}`;
    const unlockResult = unlockExpertCV(String(previewExpert.id), displayName, 1);
    if (!unlockResult.success && unlockResult.error === 'INSUFFICIENT_CREDITS') {
      toast.error('Not enough credits to unlock this profile');
      return;
    }
    toast.success('Expert profile unlocked');
  };

  const handleDownloadPreview = () => {
    if (!previewExpert) return;
    const fileName = downloadExpertCvFile(previewExpert, 'Full CV');
    recordExpertDownload(String(previewExpert.id), 'Full CV', fileName);
    toast.success('CV downloaded');
  };

  const handleLinkPreviewToVacancy = () => {
    if (!previewExpert || !selectedVacancyId) return;
    const vacancy = projectVacancies.find((item) => item.id === selectedVacancyId);
    if (!vacancy) return;
    linkExpertToVacancy(String(previewExpert.id), {
      vacancyId: vacancy.id,
      vacancyTitle: vacancy.jobTitle,
      projectTitle: vacancy.projectTitle,
    });
    toast.success('Expert linked to vacancy');
  };

  const handleViewFullProfile = () => {
    if (!previewExpert) return;
    navigate(`/search/experts/${previewExpert.id}`, { state: { searchSection: 'experts' } });
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-red-200 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wide text-red-500">Keywords and Options</h2>
          <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700">
            {libraryExpertIds.length.toLocaleString()} Downloaded CVs
          </Badge>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input type="checkbox" checked={searchOnlyDownloaded} onChange={(event) => setSearchOnlyDownloaded(event.target.checked)} />
            Search only in Downloaded CVs
          </label>
          <p className="text-xs text-gray-500">Open an expert preview to link that expert to a project vacancy.</p>
        </div>

        <div className="mt-5 grid gap-x-4 gap-y-4 lg:grid-cols-3">
          <div>
            <Label className="mb-1 block text-sm font-semibold text-primary">Expert name</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input className="h-9 bg-white text-xs" placeholder="Expert first name" value={filters.firstName || ''} onChange={event => updateFilters({ firstName: event.target.value })} />
              <Input className="h-9 bg-white text-xs" placeholder="Expert family name or ID" value={filters.familyName || filters.expertId || ''} onChange={event => updateFilters({ familyName: event.target.value, expertId: event.target.value })} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <Label className="mb-1 block text-sm font-semibold text-primary">Keywords</Label>
            <div className="grid gap-2 md:grid-cols-[1fr_190px]">
              <Input
                className="h-9 bg-white text-xs"
                value={filters.keywords || ''}
                onChange={(event) => updateFilters({ keywords: event.target.value })}
                placeholder="Please enter your keyword to search by keyword"
              />
              <Select value={filters.allWords ? 'all' : 'any'} onValueChange={value => updateFilters({ allWords: value === 'all' })}>
                <SelectTrigger className="h-9 bg-white text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">all of the words</SelectItem>
                  <SelectItem value="any">any of the words</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="mb-1 block text-sm font-semibold text-primary">Timeframe of past relevant experience</Label>
            <Select value={filters.timeframeExperience || 'all'} onValueChange={value => updateFilters({ timeframeExperience: value === 'all' ? undefined : value })}>
              <SelectTrigger className="h-9 bg-white text-xs"><SelectValue placeholder="Select timeframe" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Select timeframe</SelectItem>
                {TIMEFRAME_OPTIONS.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block text-sm font-semibold text-primary">Consider experience on at least (n° of projects)</Label>
            <Select value={filters.minProjects || 'all'} onValueChange={value => updateFilters({ minProjects: value === 'all' ? undefined : value })}>
              <SelectTrigger className="h-9 bg-white text-xs"><SelectValue placeholder="Please select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Please select</SelectItem>
                {[1, 2, 3, 5, 10, 15, 20].map(option => <SelectItem key={option} value={String(option)}>{option}+ projects</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block text-sm font-semibold text-primary">Currently working in <span className="font-normal">(now or in the past 6 months)</span></Label>
            <Select value={filters.currentlyWorkingIn || 'all'} onValueChange={value => updateFilters({ currentlyWorkingIn: value === 'all' ? undefined : value })}>
              <SelectTrigger className="h-9 bg-white text-xs"><SelectValue placeholder="Please select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Please select</SelectItem>
                <SelectItem value="now">now</SelectItem>
                <SelectItem value="past-6-months">in the past 6 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1 block text-sm font-semibold text-primary">Nationality</Label>
            <Select value={filters.nationality[0] || 'all'} onValueChange={value => updateFilters({ nationality: value === 'all' ? [] : [value] })}>
              <SelectTrigger className="h-9 bg-white text-xs"><SelectValue placeholder="Please select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Please select</SelectItem>
                {NATIONALITY_OPTIONS.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block text-sm font-semibold text-primary">Education</Label>
            <Select value={filters.education[0] || 'all'} onValueChange={value => updateFilters({ education: value === 'all' ? [] : [value] })}>
              <SelectTrigger className="h-9 bg-white text-xs"><SelectValue placeholder="Please select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Please select</SelectItem>
                {EDUCATION_OPTIONS.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label className="mb-1 block text-sm font-semibold text-primary">Languages</Label>
              <Select value={filters.languages[0] || 'all'} onValueChange={value => updateFilters({ languages: value === 'all' ? [] : [value] })}>
                <SelectTrigger className="h-9 bg-white text-xs"><SelectValue placeholder="Please select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Please select</SelectItem>
                  {LANGUAGE_OPTIONS.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block text-sm font-semibold text-primary">Level of knowledge</Label>
              <Select value={filters.languageLevel || 'all'} onValueChange={value => updateFilters({ languageLevel: value === 'all' ? undefined : value })}>
                <SelectTrigger className="h-9 bg-white text-xs"><SelectValue placeholder="Please select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Please select</SelectItem>
                  {LANGUAGE_LEVELS.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="mb-1 block text-sm font-semibold text-primary">Experience</Label>
            <Select value={filters.seniority || 'all'} onValueChange={value => updateFilters({ seniority: value === 'all' ? undefined : value })}>
              <SelectTrigger className="h-9 bg-white text-xs"><SelectValue placeholder="Please select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Please select</SelectItem>
                {SENIORITY_OPTIONS.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-7 border-b border-red-200 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wide text-red-500">Experience</h2>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            type="button"
            className="h-9 min-w-32 justify-between gap-3 rounded-none bg-red-500 px-4 text-xs font-bold uppercase hover:bg-red-600"
            onClick={() => setShowSectorFilter((current) => !current)}
          >
            Sectors <Badge className="bg-white/20 text-white">{filters.sectors.length + filters.subSectors.length}</Badge>
          </Button>
          <Button
            type="button"
            className="h-9 min-w-32 justify-between gap-3 rounded-none bg-red-500 px-4 text-xs font-bold uppercase hover:bg-red-600"
            onClick={() => setShowCountryFilter((current) => !current)}
          >
            Countries <Badge className="bg-white/20 text-white">{filters.regions.length + filters.countries.length}</Badge>
          </Button>
          <Button type="button" size="sm" variant="outline" className="h-9 px-5 text-xs uppercase" onClick={() => setIsSaveSearchDialogOpen(true)}>
            Save Search
          </Button>
          <Button type="button" size="sm" variant="outline" className="h-9 px-5 text-xs uppercase" onClick={clearAll}>
            Clear all
          </Button>
        </div>
      </div>

      {showSectorFilter && (
        <ReferenceSection title="Sectors" count={filters.sectors.length + filters.subSectors.length}>
          <ReferenceGroupedFilter
            groups={SECTOR_GROUPS}
            selectedGroup={selectedSectorPanel}
            selectedGroups={filters.sectors}
            selectedOptions={filters.subSectors}
            onSelectedGroupChange={setSelectedSectorPanel}
            onGroupsChange={sectors => updateFilters({ sectors })}
            onOptionsChange={subSectors => updateFilters({ subSectors })}
            selectAllLabel="[ select all sub-sectors ]"
            simultaneousLabel="All selected sectors simultaneously"
          />
        </ReferenceSection>
      )}

      {showCountryFilter && (
        <ReferenceSection title="Countries" count={filters.regions.length + filters.countries.length}>
          <ReferenceGroupedFilter
            groups={COUNTRY_GROUPS}
            selectedGroup={selectedCountryPanel}
            selectedGroups={filters.regions}
            selectedOptions={filters.countries}
            onSelectedGroupChange={setSelectedCountryPanel}
            onGroupsChange={regions => updateFilters({ regions })}
            onOptionsChange={countries => updateFilters({ countries })}
            selectAllLabel="[ select all countries in this region ]"
          />
        </ReferenceSection>
      )}

      <section className="space-y-4">
        <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-primary">Expert results</h2>
              <p className="text-sm text-gray-600">{isLoading ? 'Searching...' : `${totalItems.toLocaleString()} experts found`}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="updatedAt,desc">Newest</SelectItem>
                  <SelectItem value="name,asc">Name A-Z</SelectItem>
                  <SelectItem value="experience,desc">Most experienced</SelectItem>
                  <SelectItem value="rating,desc">Highest rated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={String(pageSize)} onValueChange={value => { setPageSize(Number(value)); setPage(0); }}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map(option => <SelectItem key={option} value={String(option)}>{option} / page</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
              {activeChips.map(chip => (
                <Badge key={`${chip.label}-${chip.value}`} variant="secondary" className="gap-1">
                  <span className="max-w-[240px] truncate">{chip.value}</span>
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeChip(chip)} />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center rounded-lg border border-gray-200 bg-white">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading experts...
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <Search className="mx-auto mb-3 h-10 w-10 text-gray-400" />
            <h3 className="text-base font-semibold text-gray-900">No experts found</h3>
            <p className="mt-1 text-sm text-gray-600">Try clearing filters or broadening your search.</p>
            <Button className="mt-4" variant="outline" onClick={clearAll}>Clear all</Button>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {results.map(expert => (
              <ExpertCard
                key={expert.id}
                expert={expert}
                isUnlocked={libraryExpertIds.includes(String(expert.id))}
                onPreview={openPreview}
                onOpenUnlocked={openUnlockedProfile}
              />
            ))}
          </div>
        )}

        <div className="flex flex-col items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row">
          <p className="text-sm text-gray-600">Page {page + 1} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page === 0 || isLoading} onClick={() => setPage(prev => Math.max(0, prev - 1))}>Previous</Button>
            <Button variant="outline" disabled={page + 1 >= totalPages || isLoading} onClick={() => setPage(prev => prev + 1)}>Next</Button>
          </div>
        </div>
      </section>
      <SaveSearchDialog
        open={isSaveSearchDialogOpen}
        defaultName={filters.keywords || filters.firstName || filters.familyName || 'Saved experts search'}
        onOpenChange={setIsSaveSearchDialogOpen}
        onSave={saveSearch}
      />
      <ExpertPreviewDialog
        open={Boolean(previewExpert)}
        preview={preview}
        isLoading={isPreviewLoading}
        isUnlocked={previewExpert ? libraryExpertIds.includes(String(previewExpert.id)) : false}
        availableCredits={availableCredits}
        onOpenChange={(open) => {
          if (!open) closePreview();
        }}
        onUnlock={handleUnlockPreview}
        onViewFullProfile={handleViewFullProfile}
        projectVacancies={projectVacancies}
        selectedVacancyId={selectedVacancyId}
        onVacancyChange={setSelectedVacancyId}
        onLinkToVacancy={handleLinkPreviewToVacancy}
        onDownload={handleDownloadPreview}
      />

      {/* Unlock CV Confirmation */}
      <Dialog open={pendingUnlockPreview} onOpenChange={(open) => !open && setPendingUnlockPreview(false)}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Unlock CV</DialogTitle>
            <DialogDescription>
              Unlock this expert's full CV to view their complete profile and contact details.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border bg-muted/40 px-4 py-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Credits required</span>
              <span className="font-semibold text-foreground">1 credit</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your available credits</span>
              <span className={`font-semibold ${availableCredits < 1 ? 'text-red-600' : 'text-green-600'}`}>
                {availableCredits} credit{availableCredits !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {availableCredits < 1 && (
            <p className="text-sm text-red-600 font-medium">
              You do not have enough credits to unlock this CV.
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingUnlockPreview(false)}>
              Cancel
            </Button>
            <Button onClick={confirmUnlockPreview} disabled={availableCredits < 1}>
              Unlock CV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ExpertsDatabase() {
  const { user } = useAuth();
  if (user?.accountType === 'organization' || user?.accountType === 'admin') {
    return <Navigate to="/experts/search" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        title="SEARCH FOR EXPERTS"
        description={`Search among ${EXPERT_SEARCH_TOTAL.toLocaleString()} experts in ICA Members Databases. You can also access the CVs registered in the Assortis Database of Experts.`}
        icon={Database}
      />
      <ExpertsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <Separator className="my-6" />

          {/* Horizontal Filters Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-primary">
                  {t('tenders.list.filters')}
                </h3>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">{activeFiltersCount}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    <X className="w-4 h-4 mr-1" />
                    {t('filters.clear')}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="ml-2"
                >
                  {showFilters ? (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      {t('filters.toggle.hide')}
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-4 h-4 mr-1" />
                      {t('filters.toggle.show')}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {showFilters && (
              <>
                {/* Search Row */}
                <div className="mb-5">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('common.search')}
                  </label>
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder={t('experts.filters.search')}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon">
                      <Search className="w-4 h-4" />
                    </Button>
                  </form>
                </div>

                {/* Filters Row 1: Secteur & Sous-secteur - ASSORTIS RED & BLACK DESIGN */}
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <SectorSubsectorFilter
                    selectedSectors={selectedSectors}
                    selectedSubSectors={selectedSubSectors}
                    hoveredSector={hoveredSector}
                    onHoverSector={setHoveredSector}
                    onSelectSector={(sector) => {
                      const newSectors = selectedSectors.includes(sector)
                        ? selectedSectors.filter(s => s !== sector)
                        : [...selectedSectors, sector];
                      setSelectedSectors(newSectors);
                      if (newSectors.length === 0) {
                        setSelectedSubSectors([]);
                      } else {
                        const validSubSectors = selectedSubSectors.filter(sub => {
                          return newSectors.some(sec => SECTOR_SUBSECTOR_MAP[sec]?.includes(sub));
                        });
                        setSelectedSubSectors(validSubSectors);
                      }
                    }}
                    onSelectSubSector={(subSector) => {
                      const newSubSectors = selectedSubSectors.includes(subSector)
                        ? selectedSubSectors.filter(s => s !== subSector)
                        : [...selectedSubSectors, subSector];
                      setSelectedSubSectors(newSubSectors);
                    }}
                    onSelectAllSectors={() => {
                      const allSectors = Object.values(SectorEnum);
                      if (selectedSectors.length === allSectors.length) {
                        setSelectedSectors([]);
                        setSelectedSubSectors([]);
                      } else {
                        setSelectedSectors(allSectors);
                      }
                    }}
                    onSelectAllSubSectors={(sector) => {
                      const sectorSubs = SECTOR_SUBSECTOR_MAP[sector] || [];
                      const allSelected = sectorSubs.every(sub => selectedSubSectors.includes(sub));
                      if (allSelected) {
                        const newSubs = selectedSubSectors.filter(sub => !sectorSubs.includes(sub));
                        setSelectedSubSectors(newSubs);
                      } else {
                        const newSubs = [...new Set([...selectedSubSectors, ...sectorSubs])];
                        setSelectedSubSectors(newSubs);
                      }
                    }}
                    t={t}
                  />
                </div>

                {/* Filters Row 2: Région & Pays - SAME DESIGN AS SECTOR/SUBSECTOR */}
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <RegionCountryFilter
                    selectedRegions={selectedRegions}
                    selectedCountries={selectedCountries}
                    onSelectRegion={(region) => {
                      const newRegions = selectedRegions.includes(region)
                        ? selectedRegions.filter(r => r !== region)
                        : [...selectedRegions, region];
                      setSelectedRegions(newRegions);
                      if (newRegions.length === 0) {
                        setSelectedCountries([]);
                      } else {
                        const validCountries = selectedCountries.filter(country => {
                          return newRegions.some(reg => REGION_COUNTRY_MAP[reg]?.includes(country));
                        });
                        setSelectedCountries(validCountries);
                      }
                    }}
                    onSelectCountry={(country) => {
                      const newCountries = selectedCountries.includes(country)
                        ? selectedCountries.filter(c => c !== country)
                        : [...selectedCountries, country];
                      setSelectedCountries(newCountries);
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
                </div>

                {/* Filters Row 3: Experience */}
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t('experts.filters.experience')}
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between h-10 px-3">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">
                              {selectedExperience.length > 0
                                ? selectedExperience.length === 1
                                  ? t(`experts.experience.${selectedExperience[0]}`)
                                  : `${selectedExperience.length} sélectionnés`
                                : t('filters.selectExperience') || 'Sélectionner'}
                            </span>
                          </div>
                          {selectedExperience.length > 0 && (
                            <Badge className="ml-2 flex-shrink-0" variant="secondary">
                              {selectedExperience.length}
                            </Badge>
                          )}
                          <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72" align="start">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm mb-3">{t('experts.filters.experience')}</h4>
                          <div className="grid grid-cols-1 gap-2">
                            {['0-5', '5-10', '10-15', '15+'].map((exp) => (
                              <Button
                                key={exp}
                                variant={selectedExperience.includes(exp) ? "default" : "outline"}
                                size="sm"
                                className="w-full justify-start text-xs"
                                onClick={() => {
                                  const newExperience = selectedExperience.includes(exp)
                                    ? selectedExperience.filter(e => e !== exp)
                                    : [...selectedExperience, exp];
                                  setSelectedExperience(newExperience);
                                }}
                              >
                                {selectedExperience.includes(exp) && <CheckCircle className="w-3 h-3 mr-2" />}
                                {t(`experts.experience.${exp}`)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Active Filters Display */}
                {activeFiltersCount > 0 && (
                  <div className="mt-5 pt-5 border-t border-gray-200">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-700">
                        {t('filters.active')}:
                      </span>
                      {selectedSectors.map((sector) => (
                        <Badge key={sector} variant="secondary" className="gap-1">
                          {t(`sectors.${sector}`)}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={() => {
                              const newSectors = selectedSectors.filter(s => s !== sector);
                              setSelectedSectors(newSectors);
                              if (newSectors.length === 0) {
                                setSelectedSubSectors([]);
                              }
                            }}
                          />
                        </Badge>
                      ))}
                      {selectedSubSectors.map((subSector) => (
                        <Badge key={subSector} variant="secondary" className="gap-1">
                          {t(`subsectors.${subSector}`)}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={() => {
                              setSelectedSubSectors(selectedSubSectors.filter(s => s !== subSector));
                            }}
                          />
                        </Badge>
                      ))}
                      {selectedRegions.map((region) => (
                        <Badge key={region} variant="secondary" className="gap-1">
                          {t(`regions.${region}`)}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={() => {
                              const newRegions = selectedRegions.filter(r => r !== region);
                              setSelectedRegions(newRegions);
                              if (newRegions.length === 0) {
                                setSelectedCountries([]);
                              }
                            }}
                          />
                        </Badge>
                      ))}
                      {selectedCountries.map((country) => (
                        <Badge key={country} variant="secondary" className="gap-1">
                          {getLocalizedCountryName(country, t('language'))}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={() => {
                              setSelectedCountries(selectedCountries.filter(c => c !== country));
                            }}
                          />
                        </Badge>
                      ))}
                      {selectedExperience.map((exp) => (
                        <Badge key={exp} variant="secondary" className="gap-1">
                          {t(`experts.experience.${exp}`)}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={() => {
                              setSelectedExperience(selectedExperience.filter(e => e !== exp));
                            }}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <Separator className="my-6" />

          {/* Results Summary */}
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-primary">
              {filteredExperts.length} {t('experts.list.expertsFound')}
            </h3>
          </div>

          {/* Expert Profiles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperts.map((expert) => (
              <div
                key={expert.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/experts/${expert.id}`)}
              >
                {/* Expert Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <UserCircle className="w-10 h-10 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {/* Nom masqué pour confidentialité */}
                    </h4>
                    <p className="text-sm text-gray-600 truncate">{expert.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 truncate">
                        {typeof expert.city === 'object' ? (expert.city as any)?.name : (expert.city || 'N/A')}, {typeof expert.country === 'object' ? (expert.country as any)?.name : (expert.country || 'N/A')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expert Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="w-4 h-4 text-primary" />
                      <span className="text-xs text-gray-600">{t('experts.yearsExp')}</span>
                    </div>
                    <p className="text-lg font-semibold text-primary">
                      {expert.yearsOfExperience || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs text-gray-600">{t('experts.rating')}</span>
                    </div>
                    <p className="text-lg font-semibold text-primary">
                      {expert.clientRating?.toFixed(1) || '0.0'}
                    </p>
                  </div>
                </div>

                {/* Certifications & Verification */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {expert.verified && (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {t('experts.verified')}
                    </Badge>
                  )}
                  {expert.certifications && expert.certifications.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      <UserCheck className="w-3 h-3 mr-1" />
                      {expert.certifications.length} {t('experts.certifications')}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {t(`experts.availability.${expert.availability}`)}
                  </Badge>
                </div>

                {/* Sectors */}
                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2">{t('experts.sectors')}:</p>
                  <div className="flex flex-wrap gap-1">
                    {expert.sectors && expert.sectors.slice(0, 2).map((sector, index) => (
                      <Badge key={`${expert.id}-sector-${index}-${sector}`} variant="outline" className="text-xs">
                        {t(`sectors.${sector}`)}
                      </Badge>
                    ))}
                    {expert.sectors && expert.sectors.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{expert.sectors.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2">{t('experts.skills')}:</p>
                  <div className="flex flex-wrap gap-1">
                    {expert.skills && expert.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={`${expert.id}-skill-${index}-${skill}`} variant="outline" className="text-xs">
                        {typeof skill === 'object' ? (skill as any).skillName : skill}
                      </Badge>
                    ))}
                    {expert.skills && expert.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{expert.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Stats Footer */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{t('experts.missions')}</span>
                    </div>
                    <p className="text-sm font-semibold text-primary">
                      {expert.completedMissions || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CheckCircle className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{t('experts.profile')}</span>
                    </div>
                    <p className="text-sm font-semibold text-primary">
                      {expert.profileCompleteness || 0}%
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  variant="default"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/experts/${expert.id}`);
                  }}
                >
                  {t('actions.viewDetails')}
                </Button>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredExperts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-primary mb-1">
                {t('experts.list.noResults')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('experts.list.noResults.message')}
              </p>
              <Button variant="outline" onClick={clearAllFilters} className="mt-4">
                {t('filters.clear')}
              </Button>
            </div>
          )}
        </div>
        <div className="px-4 py-6">
          <ExpertsSearchFiltersWorkspace />
        </div>
      </PageContainer>
    </div>
  );
}
