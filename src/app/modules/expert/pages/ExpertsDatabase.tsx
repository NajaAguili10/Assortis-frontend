import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ChevronDown, ChevronRight, Database, Eye, Loader2, Lock, Search, ShieldCheck, X } from 'lucide-react';
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
import { savedSearchService } from '@app/services/savedSearchService';
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

  const allFilteredSelected = filteredOptions.length > 0 && filteredOptions.every(option => selected.includes(option));

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
                className={`w-full rounded px-2 py-1.5 text-left text-xs font-medium underline-offset-2 transition md:text-right ${
                  active
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
      className={`rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md ${
        isUnlocked
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
}: {
  open: boolean;
  preview: ExpertPreviewDTO | null;
  isLoading: boolean;
  isUnlocked: boolean;
  availableCredits: number;
  onOpenChange: (open: boolean) => void;
  onUnlock: () => void;
  onViewFullProfile: () => void;
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
              <PreviewList title="Sectors" items={preview.sectors} />
              <PreviewList title="Countries" items={preview.countries} />
              <PreviewList title="Skills" items={preview.skills} />
              <PreviewList title="Languages" items={preview.languages} />
              <PreviewList title="Education" items={preview.education} />
              <PreviewList title="Key projects" items={preview.keyProjects} />
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
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-gray-500">Preview is unavailable.</p>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {isUnlocked ? (
            <Button type="button" onClick={onViewFullProfile}>View full profile</Button>
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
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { availableCredits, libraryExpertIds, unlockExpertCV } = useCVCredits();
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
        setResults(response.data || []);
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
  }, [filters, page, pageSize, sort]);

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
    setPreviewExpert(expert);
    setPreview(null);
    setIsPreviewLoading(true);
    getExpertPreview(expert.id, expert)
      .then(setPreview)
      .catch(error => {
        toast.error(error instanceof Error ? error.message : 'Unable to load expert preview');
      })
      .finally(() => setIsPreviewLoading(false));
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
    const displayName = previewExpert.fullName || [previewExpert.firstName, previewExpert.lastName].filter(Boolean).join(' ') || `Expert #${previewExpert.id}`;
    const unlockResult = unlockExpertCV(String(previewExpert.id), displayName, 1);
    if (!unlockResult.success && unlockResult.error === 'INSUFFICIENT_CREDITS') {
      toast.error('Not enough credits to unlock this profile');
      return;
    }

    toast.success('Expert profile unlocked');
  };

  const handleViewFullProfile = () => {
    if (!previewExpert) return;
    navigate(`/search/experts/${previewExpert.id}`, { state: { searchSection: 'experts' } });
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <div className="space-y-6">
      <div className="border-t border-gray-200 pt-5">
        <h1 className="text-2xl font-semibold uppercase tracking-wide text-gray-400">SEARCH FOR EXPERTS</h1>
        <p className="mt-2 text-sm italic text-gray-700">
          Search among {EXPERT_SEARCH_TOTAL} experts in ICA Members Databases
        </p>
        <p className="mt-3 text-sm italic text-gray-700">
          You can also access the CVs registered in the Assortis Database of Experts.
        </p>
      </div>

      <ReferenceSection title="Keywords search">
        <div className="grid border-primary/20 md:grid-cols-[320px_1fr]">
          <div className="border-b border-primary/20 bg-white px-4 py-4 text-sm font-medium text-primary md:border-b-0 md:border-r md:text-right">
            Expert name
          </div>
          <div className="grid gap-3 bg-sky-50/60 px-3 py-3 md:grid-cols-[180px_240px_1fr] md:items-start">
            <div>
              <Input className="h-8 bg-white" value={filters.firstName || ''} onChange={event => updateFilters({ firstName: event.target.value })} />
              <span className="mt-1 block text-[11px] font-medium text-primary">First name</span>
            </div>
            <div>
              <Input className="h-8 bg-white" value={filters.familyName || ''} onChange={event => updateFilters({ familyName: event.target.value })} />
              <span className="mt-1 block text-[11px] font-medium text-primary">Family name</span>
            </div>
            <div>
              <Input className="h-8 bg-white" value={filters.expertId || ''} onChange={event => updateFilters({ expertId: event.target.value })} />
              <span className="mt-1 block text-[11px] font-medium text-primary">ID</span>
            </div>
          </div>

          <div className="border-b border-primary/20 bg-white px-4 py-4 text-sm font-medium text-primary md:border-b-0 md:border-r md:text-right">
            Keyword search
          </div>
          <div className="grid gap-3 bg-sky-50/60 px-3 py-3 md:grid-cols-[170px_1fr] md:items-start">
            <Select value={filters.allWords ? 'all' : 'any'} onValueChange={value => updateFilters({ allWords: value === 'all' })}>
              <SelectTrigger className="h-8 bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">all of the words</SelectItem>
                <SelectItem value="any">any of the words</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <Input className="h-8 bg-white" value={filters.keywords || ''} onChange={event => updateFilters({ keywords: event.target.value })} />
              <label className="mt-2 flex items-center gap-2 text-xs font-medium text-primary">
                <input type="checkbox" checked={Boolean(filters.searchOnlineCvs)} onChange={event => updateFilters({ searchOnlineCvs: event.target.checked })} />
                This searches the entire content of all the online CVs.
              </label>
            </div>
          </div>
        </div>
        <div className="flex gap-3 bg-white px-3 py-3 md:pl-[320px]">
          <Button type="button" size="sm" className="h-8 bg-accent px-5 text-xs uppercase hover:bg-accent/90">
            Search
          </Button>
          <Button type="button" size="sm" variant="outline" className="h-8 px-5 text-xs uppercase" onClick={() => setIsSaveSearchDialogOpen(true)}>
            Save Search
          </Button>
          <Button type="button" size="sm" className="h-8 bg-accent px-5 text-xs uppercase hover:bg-accent/90" onClick={clearAll}>
            Clear all
          </Button>
        </div>
      </ReferenceSection>

      <ReferenceSection title="Sectors of experts' experience" count={filters.sectors.length + filters.subSectors.length}>
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

      <ReferenceSection title="Countries of experts' experience" count={filters.regions.length + filters.countries.length}>
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

      <ReferenceSection title="Funding agencies of experts' experience" count={filters.fundingAgencies.length}>
        <div className="grid gap-5 bg-white p-4 lg:grid-cols-2">
          <MultiOptionList title="Major funding agencies" options={MAJOR_FUNDING_AGENCIES} selected={filters.fundingAgencies} onChange={fundingAgencies => updateFilters({ fundingAgencies })} searchable={false} />
          <MultiOptionList title="Bonus funding agencies" options={BONUS_FUNDING_AGENCIES} selected={filters.fundingAgencies} onChange={fundingAgencies => updateFilters({ fundingAgencies })} />
        </div>
      </ReferenceSection>

      <ReferenceSection title="Search options" count={filters.databases.length + filters.nationality.length + filters.education.length + filters.languages.length}>
        <div className="grid gap-5 bg-white p-4 lg:grid-cols-2">
          <MultiOptionList title="Database(s)" options={DATABASES} selected={filters.databases} onChange={databases => updateFilters({ databases: normalizeList(databases) })} />
          <MultiOptionList title="Nationality" options={NATIONALITY_OPTIONS} selected={filters.nationality} onChange={nationality => updateFilters({ nationality })} />
          <MultiOptionList title="Education" options={EDUCATION_OPTIONS} selected={filters.education} onChange={education => updateFilters({ education })} />
          <MultiOptionList title="Languages" options={LANGUAGE_OPTIONS} selected={filters.languages} onChange={languages => updateFilters({ languages })} />
          <div className="grid gap-3 md:grid-cols-2 lg:col-span-2 xl:grid-cols-5">
            <div>
              <Label>Timeframe of past relevant experience</Label>
              <Select value={filters.timeframeExperience || 'all'} onValueChange={value => updateFilters({ timeframeExperience: value === 'all' ? undefined : value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any time</SelectItem>
                  {TIMEFRAME_OPTIONS.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>At least number of projects</Label>
              <Input type="number" min="0" value={filters.minProjects || ''} onChange={event => updateFilters({ minProjects: event.target.value })} />
            </div>
            <div>
              <Label>Currently working in</Label>
              <Input value={filters.currentlyWorkingIn || ''} onChange={event => updateFilters({ currentlyWorkingIn: event.target.value })} />
            </div>
            <div>
              <Label>Level of knowledge</Label>
              <Select value={filters.languageLevel || 'all'} onValueChange={value => updateFilters({ languageLevel: value === 'all' ? undefined : value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any level</SelectItem>
                  {LANGUAGE_LEVELS.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Seniority</Label>
              <Select value={filters.seniority || 'all'} onValueChange={value => updateFilters({ seniority: value === 'all' ? undefined : value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any seniority</SelectItem>
                  {SENIORITY_OPTIONS.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>CV language</Label>
              <Select value={filters.cvLanguage || 'all'} onValueChange={value => updateFilters({ cvLanguage: value === 'all' ? undefined : value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any CV language</SelectItem>
                  {CV_LANGUAGE_OPTIONS.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </ReferenceSection>

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
      />
    </div>
  );
}

export default function ExpertsDatabase() {
  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        title="SEARCH FOR EXPERTS"
        description={`Search among ${EXPERT_SEARCH_TOTAL.toLocaleString()} experts in ICA Members Databases. You can also access the CVs registered in the Assortis Database of Experts.`}
        icon={Database}
      />
      <ExpertsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 py-6">
          <ExpertsSearchFiltersWorkspace />
        </div>
      </PageContainer>
    </div>
  );
}
