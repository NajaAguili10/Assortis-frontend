import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Bell,
  BellOff,
  Copy,
  Edit3,
  Layers,
  PauseCircle,
  Play,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { AccountSubMenu } from '@app/components/AccountSubMenu';
import { SavedSearchProfileBadge } from '@app/components/SavedSearchProfileBadge';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@app/components/ui/dialog';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import {
  CountryEnum,
  FundingAgencyEnum,
  NoticeTypeEnum,
  ProcurementTypeEnum,
  RegionEnum,
  SectorEnum,
} from '@app/types/tender.dto';
import {
  OrganizationTypeEnum,
  RegionEnum as OrganizationRegionEnum,
} from '@app/types/organization.dto';
import {
  getSavedSearchTypeRoute,
  buildOrganizationProfileSearchFields,
  savedSearchService,
  type SavedSearch,
  type SavedSearchAlertFrequency,
  type SavedSearchEmailFormat,
  type SavedSearchStatus,
  type SavedSearchType,
} from '@app/services/savedSearchService';

type ManagedSearchType = 'projects' | 'awards' | 'shortlists' | 'organisations';
type KeywordMode = 'allWords' | 'anyWords';
type BudgetMode = 'any' | 'above' | 'below';
type TenderScope = 'open' | 'past' | 'all';

interface ManagedFilters {
  tenderScope: TenderScope;
  searchInput: string;
  searchQuery: string;
  searchMode: KeywordMode;
  selectedProcurementTypes: string[];
  selectedNoticeTypes: string[];
  publishedFrom: string | null;
  publishedTo: string | null;
  budgetMode: BudgetMode;
  budgetValue: string;
  selectedSectors: string[];
  selectedRegions: string[];
  selectedCountries: string[];
  selectedFundingAgencies: string[];
  projectBudget: string;
  selection: string[];
  organisationName: string;
  officeLocation: string;
  city: string;
  organizationTypes: string[];
}

interface SearchEditorState {
  id?: string;
  name: string;
  type: ManagedSearchType;
  filters: ManagedFilters;
  alertFrequency: SavedSearchAlertFrequency;
  alertDays: string[];
  alertHour: string;
  emailFormat: SavedSearchEmailFormat;
  status: SavedSearchStatus;
  lastExecutionAt?: string;
  lastMatchCount?: number;
}

const MANAGED_TYPES: { type: ManagedSearchType; label: string; description: string }[] = [
  { type: 'projects', label: 'Projects', description: 'Open, past, and all tender opportunities.' },
  { type: 'awards', label: 'Awards', description: 'Award notices and contract results.' },
  { type: 'shortlists', label: 'Shortlists', description: 'Shortlisted organisations and pre-award signals.' },
  { type: 'organisations', label: 'Organisations', description: 'Organisation profiles and market actors.' },
];

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAILY_DAYS = ['Every day', ...WEEKDAYS];
const PROJECT_BUDGET_OPTIONS = ['Any project budget', 'Under 100k', '100k - 500k', '500k - 1M', '1M - 5M', 'Over 5M'];
const SELECTION_OPTIONS = ['My selected sectors', 'My selected countries', 'My active subscription scope', 'Only new notices'];

const emptyFilters: ManagedFilters = {
  tenderScope: 'open',
  searchInput: '',
  searchQuery: '',
  searchMode: 'allWords',
  selectedProcurementTypes: [],
  selectedNoticeTypes: [],
  publishedFrom: null,
  publishedTo: null,
  budgetMode: 'any',
  budgetValue: '',
  selectedSectors: [],
  selectedRegions: [],
  selectedCountries: [],
  selectedFundingAgencies: [],
  projectBudget: '',
  selection: [],
  organisationName: '',
  officeLocation: '',
  city: '',
  organizationTypes: [],
};

const defaultEditor = (type: ManagedSearchType = 'projects'): SearchEditorState => ({
  name: '',
  type,
  filters: { ...emptyFilters },
  alertFrequency: 'daily',
  alertDays: ['Every day'],
  alertHour: '08:00',
  emailFormat: 'summary',
  status: 'active',
});

const humanize = (value: string) => value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
const formatDateTime = (value?: string) => value ? new Date(value).toLocaleString() : 'Never';

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function coerceManagedType(type: SavedSearchType): ManagedSearchType {
  return ['projects', 'awards', 'shortlists', 'organisations'].includes(type) ? type as ManagedSearchType : 'projects';
}

function getFilters(search?: SavedSearch): ManagedFilters {
  const filters = (search?.filters || {}) as Partial<ManagedFilters>;
  return {
    ...emptyFilters,
    ...filters,
    searchInput: filters.searchInput || filters.searchQuery || '',
    searchQuery: filters.searchQuery || filters.searchInput || '',
    selectedProcurementTypes: uniqueValues((filters.selectedProcurementTypes || []) as string[]),
    selectedNoticeTypes: uniqueValues((filters.selectedNoticeTypes || []) as string[]),
    selectedSectors: uniqueValues((filters.selectedSectors || []) as string[]),
    selectedRegions: uniqueValues((filters.selectedRegions || []) as string[]),
    selectedCountries: uniqueValues((filters.selectedCountries || []) as string[]),
    selectedFundingAgencies: uniqueValues((filters.selectedFundingAgencies || []) as string[]),
    selection: uniqueValues((filters.selection || []) as string[]),
    organizationTypes: uniqueValues(((filters as any).organizationTypes || (filters as any).type || []) as string[]),
  };
}

function buildSummary(filters: ManagedFilters, type: ManagedSearchType) {
  return [
    filters.searchQuery ? `Keywords: ${filters.searchQuery}` : '',
    type === 'projects' ? `Search for: ${humanize(filters.tenderScope)}` : '',
    filters.selectedProcurementTypes.length ? `Procurement: ${filters.selectedProcurementTypes.length}` : '',
    filters.selectedNoticeTypes.length ? `Notice types: ${filters.selectedNoticeTypes.length}` : '',
    filters.selectedSectors.length ? `Sectors: ${filters.selectedSectors.length}` : '',
    filters.selectedCountries.length ? `Countries: ${filters.selectedCountries.length}` : '',
    filters.selectedFundingAgencies.length ? `Funding agencies: ${filters.selectedFundingAgencies.length}` : '',
    filters.projectBudget ? `Project budget: ${filters.projectBudget}` : '',
    filters.budgetValue ? `Budget ${filters.budgetMode}: ${filters.budgetValue}` : '',
    filters.publishedFrom ? `From: ${filters.publishedFrom}` : '',
    filters.publishedTo ? `To: ${filters.publishedTo}` : '',
  ].filter(Boolean);
}

function toRoutePayload(state: SearchEditorState) {
  const filters = state.filters;
  if (state.type === 'organisations') {
    return {
      searchQuery: filters.organisationName || filters.searchQuery,
      selectedSectors: filters.selectedSectors,
      selectedSubSectors: [],
      selectedRegions: filters.selectedRegions,
      selectedCountries: filters.selectedCountries,
      type: filters.organizationTypes,
      publishedFrom: filters.publishedFrom,
      publishedTo: filters.publishedTo,
      keywords: filters.searchQuery,
      searchMode: filters.searchMode,
      officeLocation: filters.officeLocation,
      city: filters.city,
      selectedProcurementTypes: filters.selectedProcurementTypes,
      projectBudget: filters.projectBudget,
      budgetMode: filters.budgetMode,
      budgetValue: filters.budgetValue,
    };
  }

  return {
    showFilters: true,
    showSectorFilters: state.type === 'projects',
    showRegionFilters: state.type === 'projects',
    searchInput: filters.searchQuery,
    searchQuery: filters.searchQuery,
    searchMode: filters.searchMode,
    selectedProcurementTypes: filters.selectedProcurementTypes,
    selectedNoticeTypes: filters.selectedNoticeTypes,
    publishedFrom: filters.publishedFrom,
    publishedTo: filters.publishedTo,
    budgetMode: filters.budgetMode,
    budgetValue: filters.budgetValue,
    hideMultiCountry: false,
    selectedSectors: filters.selectedSectors,
    selectedSubSectors: [],
    selectedRegions: filters.selectedRegions,
    selectedCountries: filters.selectedCountries,
    selectedFundingAgencies: filters.selectedFundingAgencies,
    fundingAgencySearch: '',
    sortField: null,
    sortDirection: 'none',
    locationFilters: filters.selection,
    donorFilters: [],
    tenderScope: filters.tenderScope,
    projectBudget: filters.projectBudget,
  };
}

function SearchableMultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? options.filter((option) => humanize(option).toLowerCase().includes(needle)) : options;
  }, [options, query]);

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="h-10 w-full justify-between">
          <span className="truncate">{label}</span>
          <Badge variant="secondary">{selected.length}</Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-3">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${label.toLowerCase()}...`} className="mb-3 h-9" />
        <div className="mb-2 flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => onChange(uniqueValues([...selected, ...filtered]))}>Select all</Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange([])}>Clear</Button>
        </div>
        <div className="max-h-64 space-y-1 overflow-auto">
          {filtered.map((option, index) => (
            <label key={`${option}-${index}`} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-50">
              <input type="checkbox" checked={selected.includes(option)} onChange={() => toggle(option)} />
              <span>{humanize(option)}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function AlertSettings({
  state,
  onChange,
}: {
  state: SearchEditorState;
  onChange: (patch: Partial<SearchEditorState>) => void;
}) {
  const dayOptions = state.alertFrequency === 'weekly' ? WEEKDAYS : DAILY_DAYS;
  const disabled = state.alertFrequency === 'unsubscribe';

  return (
    <section className="rounded-lg border bg-gray-50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-primary">Alert settings</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Alert frequency</Label>
          <Select
            value={state.alertFrequency}
            onValueChange={(value: SavedSearchAlertFrequency) => onChange({
              alertFrequency: value,
              status: value === 'unsubscribe' ? 'paused' : 'active',
              alertDays: value === 'weekly' ? ['Monday'] : value === 'daily' ? ['Every day'] : [],
            })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="unsubscribe">Unsubscribe</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Sending hour</Label>
          <Input type="time" value={state.alertHour} disabled={disabled} onChange={(event) => onChange({ alertHour: event.target.value })} />
        </div>
        <div>
          <Label>Email format</Label>
          <Select value={state.emailFormat} onValueChange={(value: SavedSearchEmailFormat) => onChange({ emailFormat: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">Summary alerts</SelectItem>
              <SelectItem value="detailed">Detailed alerts</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {!disabled && (
        <div className="mt-4">
          <Label>{state.alertFrequency === 'weekly' ? 'Weekday selection' : 'Choose specific day(s)'}</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {dayOptions.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => onChange({ alertDays: state.alertDays.includes(day) ? state.alertDays.filter((item) => item !== day) : [...state.alertDays, day] })}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${state.alertDays.includes(day) ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-white text-gray-600'}`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function SearchCriteriaForm({
  state,
  onChange,
}: {
  state: SearchEditorState;
  onChange: (patch: Partial<SearchEditorState>) => void;
}) {
  const filters = state.filters;
  const updateFilters = (patch: Partial<ManagedFilters>) => onChange({ filters: { ...filters, ...patch } });
  const isProject = state.type === 'projects';
  const isOrganisation = state.type === 'organisations';
  const isShortlist = state.type === 'shortlists';

  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <Label>Search name</Label>
          <Input value={state.name} onChange={(event) => onChange({ name: event.target.value })} placeholder="e.g. Health projects in West Africa" />
        </div>
        <div>
          <Label>Search type</Label>
          <Select value={state.type} onValueChange={(value: ManagedSearchType) => onChange({ type: value, filters: { ...emptyFilters } })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {MANAGED_TYPES.map((item) => <SelectItem key={item.type} value={item.type}>{item.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {isProject && (
          <div>
            <Label>Search for</Label>
            <Select value={filters.tenderScope} onValueChange={(value: TenderScope) => updateFilters({ tenderScope: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open tenders</SelectItem>
                <SelectItem value="past">Past tenders</SelectItem>
                <SelectItem value="all">All tenders</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {isOrganisation && (
          <div>
            <Label>Name of organisation</Label>
            <Input value={filters.organisationName} onChange={(event) => updateFilters({ organisationName: event.target.value })} placeholder="Enter organisation name" />
          </div>
        )}
        <div>
          <Label>Keywords</Label>
          <Input value={filters.searchQuery} onChange={(event) => updateFilters({ searchQuery: event.target.value, searchInput: event.target.value })} placeholder="Enter keywords to search" />
        </div>
        <div>
          <Label>Keyword logic</Label>
          <Select value={filters.searchMode} onValueChange={(value: KeywordMode) => updateFilters({ searchMode: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="allWords">search all of the words</SelectItem>
              <SelectItem value="anyWords">search any of the words</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Procurement type</Label>
          <SearchableMultiSelect label="Procurement type" options={Object.values(ProcurementTypeEnum)} selected={filters.selectedProcurementTypes} onChange={(selectedProcurementTypes) => updateFilters({ selectedProcurementTypes })} />
        </div>
        <div>
          <Label>Published from</Label>
          <Input type="date" value={filters.publishedFrom || ''} onChange={(event) => updateFilters({ publishedFrom: event.target.value || null })} />
        </div>
        <div>
          <Label>To</Label>
          <Input type="date" value={filters.publishedTo || ''} onChange={(event) => updateFilters({ publishedTo: event.target.value || null })} />
        </div>
        <div>
          <Label>Project budget</Label>
          <Select value={filters.projectBudget || 'any'} onValueChange={(value) => updateFilters({ projectBudget: value === 'any' ? '' : value })}>
            <SelectTrigger><SelectValue placeholder="Select project budget" /></SelectTrigger>
            <SelectContent>
              {PROJECT_BUDGET_OPTIONS.map((option) => <SelectItem key={option} value={option === 'Any project budget' ? 'any' : option}>{option}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Budget</Label>
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <Select value={filters.budgetMode} onValueChange={(value: BudgetMode) => updateFilters({ budgetMode: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="above">Above</SelectItem>
                <SelectItem value="below">Below</SelectItem>
              </SelectContent>
            </Select>
            <Input value={filters.budgetValue} onChange={(event) => updateFilters({ budgetValue: event.target.value })} placeholder="Amount" />
          </div>
        </div>
        {isOrganisation && (
          <>
            <div>
              <Label>Office Location</Label>
              <SearchableMultiSelect label="Office Location" options={Object.values(OrganizationRegionEnum)} selected={filters.selectedRegions} onChange={(selectedRegions) => updateFilters({ selectedRegions, officeLocation: selectedRegions[0] || '' })} />
            </div>
            <div>
              <Label>City</Label>
              <Input value={filters.city} onChange={(event) => updateFilters({ city: event.target.value })} placeholder="City" />
            </div>
            <div>
              <Label>Organisation type</Label>
              <SearchableMultiSelect label="Organisation type" options={Object.values(OrganizationTypeEnum)} selected={filters.organizationTypes} onChange={(organizationTypes) => updateFilters({ organizationTypes })} />
            </div>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isProject && <SearchableMultiSelect label="Selection" options={SELECTION_OPTIONS} selected={filters.selection} onChange={(selection) => updateFilters({ selection })} />}
        {isProject && <SearchableMultiSelect label="Sectors" options={Object.values(SectorEnum)} selected={filters.selectedSectors} onChange={(selectedSectors) => updateFilters({ selectedSectors })} />}
        {isProject && <SearchableMultiSelect label="Countries" options={Object.values(CountryEnum)} selected={filters.selectedCountries} onChange={(selectedCountries) => updateFilters({ selectedCountries })} />}
        {isProject && <SearchableMultiSelect label="Funding Agencies" options={Object.values(FundingAgencyEnum).slice(0, 80)} selected={filters.selectedFundingAgencies} onChange={(selectedFundingAgencies) => updateFilters({ selectedFundingAgencies })} />}
        {isProject && <SearchableMultiSelect label="Notice Type" options={Object.values(NoticeTypeEnum)} selected={filters.selectedNoticeTypes} onChange={(selectedNoticeTypes) => updateFilters({ selectedNoticeTypes })} />}
        {isOrganisation && <SearchableMultiSelect label="Countries" options={Object.values(CountryEnum)} selected={filters.selectedCountries} onChange={(selectedCountries) => updateFilters({ selectedCountries })} />}
        {(isShortlist || state.type === 'awards') && <SearchableMultiSelect label="Countries" options={Object.values(CountryEnum)} selected={filters.selectedCountries} onChange={(selectedCountries) => updateFilters({ selectedCountries })} />}
        {(isShortlist || state.type === 'awards') && <SearchableMultiSelect label="Funding Agencies" options={Object.values(FundingAgencyEnum).slice(0, 80)} selected={filters.selectedFundingAgencies} onChange={(selectedFundingAgencies) => updateFilters({ selectedFundingAgencies })} />}
        {(isShortlist || state.type === 'awards') && <SearchableMultiSelect label="Sectors" options={Object.values(SectorEnum)} selected={filters.selectedSectors} onChange={(selectedSectors) => updateFilters({ selectedSectors })} />}
        {isProject && <SearchableMultiSelect label="Regions" options={Object.values(RegionEnum)} selected={filters.selectedRegions} onChange={(selectedRegions) => updateFilters({ selectedRegions })} />}
      </div>
    </section>
  );
}

function SearchEditorDialog({
  open,
  mode,
  state,
  onOpenChange,
  onStateChange,
  onSave,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  state: SearchEditorState;
  onOpenChange: (open: boolean) => void;
  onStateChange: (next: SearchEditorState) => void;
  onSave: () => void;
}) {
  const updateState = (patch: Partial<SearchEditorState>) => onStateChange({ ...state, ...patch });
  const lastExecution = state.lastExecutionAt;
  const lastCount = state.lastMatchCount;
  const hasChosenType = mode === 'edit' || Boolean(state.name.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Saved Search' : 'Edit Search'}</DialogTitle>
          <DialogDescription>
            Manage criteria, alert settings, notification preferences, and execution details.
          </DialogDescription>
        </DialogHeader>

        {mode === 'create' && (
          <div className="grid gap-3 md:grid-cols-4">
            {MANAGED_TYPES.map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => onStateChange({ ...defaultEditor(item.type), name: `${item.label} saved search` })}
                className={`rounded-lg border p-4 text-left transition hover:border-primary hover:bg-primary/5 ${hasChosenType && state.type === item.type ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'}`}
              >
                <p className="font-semibold text-primary">{item.label}</p>
                <p className="mt-1 text-xs text-gray-500">{item.description}</p>
              </button>
            ))}
          </div>
        )}

        {hasChosenType ? (
          <>
            <SearchCriteriaForm state={state} onChange={updateState} />
            <AlertSettings state={state} onChange={updateState} />
          </>
        ) : (
          <div className="rounded-lg border border-dashed bg-gray-50 p-8 text-center">
            <p className="text-sm font-medium text-primary">Choose a saved search type to continue.</p>
            <p className="mt-1 text-sm text-gray-500">The dedicated form and alert settings will appear after your selection.</p>
          </div>
        )}

        {mode === 'edit' && (
          <div className="grid gap-3 rounded-lg border bg-white p-4 text-sm md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">Search type</p>
              <p className="mt-1 capitalize text-primary">{state.type}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">Last execution</p>
              <p className="mt-1 text-primary">{formatDateTime(lastExecution)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">Matching results</p>
              <p className="mt-1 text-primary">{lastCount ?? 0}</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          {hasChosenType && (
            <Button type="button" onClick={onSave} disabled={!state.name.trim()}>
              {mode === 'create' ? 'Create saved search' : 'Save changes'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function MySelectionAlertsPage() {
  const { t } = useTranslation();
  const { user, activeOrganizationProfile } = useAuth();
  const navigate = useNavigate();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isLoadingSearches, setIsLoadingSearches] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editor, setEditor] = useState<SearchEditorState>(() => defaultEditor());

  const refresh = async () => {
    setIsLoadingSearches(true);
    try {
      const rows = (await savedSearchService.listRemote())
        .filter((search) => MANAGED_TYPES.some((item) => item.type === search.context.type));
      setSavedSearches(rows);
    } catch (error) {
      toast.error('Saved searches could not be loaded from the server.');
      const fallbackRows = savedSearchService
        .list(user?.id)
        .filter((search) => MANAGED_TYPES.some((item) => item.type === search.context.type));
      setSavedSearches(fallbackRows);
    } finally {
      setIsLoadingSearches(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [user?.id, activeOrganizationProfile?.id]);

  const stats = useMemo(() => {
    const active = savedSearches.filter((search) => search.status === 'active' && search.alertFrequency !== 'unsubscribe').length;
    const paused = savedSearches.filter((search) => search.status === 'paused' || search.alertFrequency === 'unsubscribe').length;
    const latest = savedSearches
      .map((search) => search.lastExecutionAt)
      .filter(Boolean)
      .sort()
      .at(-1);
    return { active, paused, latest };
  }, [savedSearches]);

  const openCreate = () => {
    setDialogMode('create');
    setEditor(defaultEditor());
    setDialogOpen(true);
  };

  const openEdit = (search: SavedSearch) => {
    setDialogMode('edit');
    setEditor({
      id: search.id,
      name: search.name,
      type: coerceManagedType(search.context.type),
      filters: getFilters(search),
      alertFrequency: search.alertFrequency || 'daily',
      alertDays: search.alertDays || [],
      alertHour: search.alertHour || '08:00',
      emailFormat: search.emailFormat || 'summary',
      status: search.status || 'active',
      lastExecutionAt: search.lastExecutionAt,
      lastMatchCount: search.lastMatchCount,
    });
    setDialogOpen(true);
  };

  const saveEditor = async () => {
    const payload = toRoutePayload(editor);
    const context = {
      type: editor.type as SavedSearchType,
      route: getSavedSearchTypeRoute(editor.type),
      label: MANAGED_TYPES.find((item) => item.type === editor.type)?.label || humanize(editor.type),
      summary: buildSummary(editor.filters, editor.type),
      accountType: user?.accountType,
    };
    const patch = {
      name: editor.name,
      filters: payload,
      context,
      ...buildOrganizationProfileSearchFields(activeOrganizationProfile),
      alertsEnabled: editor.alertFrequency !== 'unsubscribe' && editor.status === 'active',
      alertFrequency: editor.alertFrequency,
      alertDays: editor.alertDays,
      alertHour: editor.alertHour,
      emailFormat: editor.emailFormat,
      status: editor.status,
    };

    try {
      if (dialogMode === 'edit' && editor.id) {
        await savedSearchService.updateRemote(editor.id, patch);
        toast.success('Saved search updated');
      } else {
        await savedSearchService.saveRemote({ userId: user?.id, ...patch });
        toast.success('Saved search created');
      }
      setDialogOpen(false);
      await refresh();
    } catch {
      toast.error('Saved search could not be saved.');
    }
  };

  const duplicateSearch = async (id: string) => {
    try {
      await savedSearchService.duplicateRemote(id);
      await refresh();
      toast.success('Saved search duplicated');
    } catch {
      toast.error('Saved search could not be duplicated.');
    }
  };

  const pauseSearch = async (search: SavedSearch) => {
    try {
      await savedSearchService.setPausedRemote(search, search.status === 'active');
      await refresh();
    } catch {
      toast.error('Alert status could not be changed.');
    }
  };

  const deleteSearch = async (id: string) => {
    try {
      await savedSearchService.removeRemote(id);
      await refresh();
      toast.success('Saved search deleted');
    } catch {
      toast.error('Saved search could not be deleted.');
    }
  };

  const runSearch = async (search: SavedSearch) => {
    try {
      await savedSearchService.recordRunRemote(search.id);
      await refresh();
      navigate(`${search.context.route}?savedSearchId=${encodeURIComponent(search.id)}`);
    } catch {
      toast.error('Saved search could not be run.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        icon={Layers}
        title={t('account.mySelection.banner.title')}
        description="Create, edit, and monitor saved searches with professional alert settings."
      />
      <AccountSubMenu activeTab="my-selection" onTabChange={() => undefined} mode="profile-settings" />

      <PageContainer className="my-6">
        <div className="space-y-6 px-4 py-6 sm:px-5 lg:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-primary">Saved Searches & Alerts</h2>
              <p className="text-sm text-gray-600">Review saved searches from every profile, manage notification frequency, and track saved criteria in one place.</p>
              {activeOrganizationProfile && (
                <div className="mt-2">
                  <SavedSearchProfileBadge profileName={activeOrganizationProfile.fullName} profileEmail={activeOrganizationProfile.email} />
                </div>
              )}
              <p className="mt-2 text-sm text-gray-600">
                Alert recipient: <span className="font-medium text-primary">{activeOrganizationProfile?.email || user?.email || 'No email selected'}</span>
              </p>
            </div>
            <Button onClick={openCreate} className="w-fit">
              <Plus className="mr-2 h-4 w-4" />
              Create New Saved Search
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Total searches</p><p className="mt-1 text-2xl font-semibold text-primary">{savedSearches.length}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Active alerts</p><p className="mt-1 text-2xl font-semibold text-primary">{stats.active}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Paused alerts</p><p className="mt-1 text-2xl font-semibold text-primary">{stats.paused}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Latest execution</p><p className="mt-1 text-sm font-semibold text-primary">{formatDateTime(stats.latest)}</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="h-5 w-5 text-primary" />
                My Selection & Alerts
              </CardTitle>
              <CardDescription>All saved searches from every organization profile across projects, awards, shortlists, and organisations.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSearches ? (
                <p className="text-sm text-muted-foreground">Loading saved searches...</p>
              ) : savedSearches.length === 0 ? (
                <div className="rounded-lg border border-dashed p-10 text-center">
                  <Search className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                  <p className="font-semibold text-primary">No saved searches yet</p>
                  <p className="mt-1 text-sm text-gray-500">Create your first saved search to start managing alerts.</p>
                  <Button className="mt-4" onClick={openCreate}>Create New Saved Search</Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {savedSearches.map((search) => {
                    const active = search.status === 'active' && search.alertFrequency !== 'unsubscribe';
                    return (
                      <article key={search.id} className="rounded-lg border bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-primary">{search.name}</h3>
                              <Badge variant="outline">{search.context.label}</Badge>
                              <Badge className={active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-100 text-gray-600'}>
                                {active ? <Bell className="mr-1 h-3 w-3" /> : <BellOff className="mr-1 h-3 w-3" />}
                                {active ? 'Active' : 'Paused'}
                              </Badge>
                              <SavedSearchProfileBadge profileName={search.organizationProfileName} profileEmail={search.organizationProfileEmail} />
                            </div>
                            <div className="mt-3 grid gap-2 text-sm text-gray-600 md:grid-cols-5">
                              <span><strong>Frequency:</strong> {humanize(search.alertFrequency || 'daily')}</span>
                              <span><strong>Mode:</strong> {humanize(search.emailFormat || 'summary')}</span>
                              <span><strong>Last run:</strong> {formatDateTime(search.lastExecutionAt)}</span>
                              <span><strong>Matches:</strong> {search.lastMatchCount ?? 0}</span>
                              <span><strong>Hour:</strong> {search.alertHour || '08:00'}</span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-1">
                              {(search.context.summary?.length ? search.context.summary : ['No filters selected']).slice(0, 8).map((item) => (
                                <Badge key={item} variant="secondary">{item}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(search)}><Edit3 className="mr-1.5 h-4 w-4" />Edit</Button>
                            <Button size="sm" variant="outline" onClick={() => duplicateSearch(search.id)}><Copy className="mr-1.5 h-4 w-4" />Duplicate</Button>
                            <Button size="sm" variant="outline" onClick={() => pauseSearch(search)}><PauseCircle className="mr-1.5 h-4 w-4" />{active ? 'Pause alerts' : 'Resume alerts'}</Button>
                            <Button size="sm" variant="outline" onClick={() => runSearch(search)}><Play className="mr-1.5 h-4 w-4" />Run search now</Button>
                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteSearch(search.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </PageContainer>

      <SearchEditorDialog
        open={dialogOpen}
        mode={dialogMode}
        state={editor}
        onOpenChange={setDialogOpen}
        onStateChange={setEditor}
        onSave={saveEditor}
      />
    </div>
  );
}
