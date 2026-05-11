import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronRight, Filter, Save, Search, UserCog, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@app/contexts/AuthContext';
import { AccountSubMenu } from '@app/components/AccountSubMenu';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { Alert, AlertDescription, AlertTitle } from '@app/components/ui/alert';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Card, CardContent } from '@app/components/ui/card';
import { Checkbox } from '@app/components/ui/checkbox';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@app/components/ui/radio-group';
import {
  ORGANIZATION_COUNTRY_REGIONS,
  ORGANIZATION_FUNDING_AGENCIES,
  ORGANIZATION_NOTICE_TYPES,
  ORGANIZATION_PROCUREMENT_TYPES,
  ORGANIZATION_SECTOR_SPECIALITIES,
  ORGANIZATION_SECTORS,
  OrganizationCountryRegion,
  OrganizationPreferenceOption,
} from '../data/organizationUserPreferences.data';
import {
  DEFAULT_ORGANIZATION_USER_PREFERENCES,
  OrganizationAlertFormat,
  OrganizationAlertSchedule,
  OrganizationUserPreferences,
  organizationUserPreferencesService,
} from '../services/organizationUserPreferences.service';

type PreferenceArrayField =
  | 'sectors'
  | 'sector_specialities'
  | 'regions'
  | 'countries'
  | 'funding_agencies'
  | 'procurement_types'
  | 'notice_types';

const DEMO_ADMIN_EMAILS = ['cassano@assortis.com', 'Rapalino@assortis.com'];

const includesQuery = (value: string, query: string) => value.toLowerCase().includes(query.trim().toLowerCase());

function Section({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="space-y-5 pt-6">
        {(title || subtitle) && (
          <div>
            {title && (
              <div className="mb-2 border-b border-accent/40 pb-2">
                <h2 className="text-lg font-semibold uppercase tracking-normal text-primary">{title}</h2>
              </div>
            )}
            {subtitle && <p className="text-sm font-medium text-primary">{subtitle}</p>}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder = 'Search',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="pl-9" />
    </div>
  );
}

function CheckboxTile({
  option,
  checked,
  onToggle,
}: {
  option: OrganizationPreferenceOption;
  checked: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <label
      htmlFor={option.id}
      className={`flex min-h-10 cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
        checked ? 'border-accent bg-accent/5 text-primary' : 'border-gray-200 bg-white text-gray-700 hover:border-accent/40'
      }`}
    >
      <Checkbox id={option.id} checked={checked} onCheckedChange={() => onToggle(option.id)} className="mt-0.5" />
      <span className="leading-5">{option.label}</span>
    </label>
  );
}

function SearchableCheckboxList({
  options,
  selected,
  search,
  onSearch,
  onToggle,
  onSelectAll,
  onClear,
  columns = 'lg:grid-cols-3',
}: {
  options: OrganizationPreferenceOption[];
  selected: string[];
  search: string;
  onSearch: (value: string) => void;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
  columns?: string;
}) {
  const visibleOptions = options.filter((option) => includesQuery(option.label, search));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <SearchBox value={search} onChange={onSearch} />
        <Button type="button" variant="outline" onClick={onSelectAll}>
          Select all
        </Button>
        <Button type="button" variant="ghost" onClick={onClear} className="text-accent hover:text-accent">
          Clear selection
        </Button>
      </div>
      <div className={`grid gap-2 sm:grid-cols-2 ${columns}`}>
        {visibleOptions.map((option) => (
          <CheckboxTile key={option.id} option={option} checked={selected.includes(option.id)} onToggle={onToggle} />
        ))}
      </div>
      {visibleOptions.length === 0 && <p className="text-sm text-muted-foreground">No options match your search.</p>}
    </div>
  );
}

export default function OrganizationUserProfileSettingsPage() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<OrganizationUserPreferences>({
    ...DEFAULT_ORGANIZATION_USER_PREFERENCES,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sectorSearch, setSectorSearch] = useState('');
  const [specialitySearch, setSpecialitySearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [fundingSearch, setFundingSearch] = useState('');
  const [openCountryRegions, setOpenCountryRegions] = useState<string[]>([]);

  const adminEmails = preferences.user_administrator_emails?.length
    ? preferences.user_administrator_emails
    : DEMO_ADMIN_EMAILS;

  const allCountryOptions = useMemo(
    () => ORGANIZATION_COUNTRY_REGIONS.flatMap((region) => region.countries),
    [],
  );

  const selectedCountryOptions = useMemo(
    () => allCountryOptions.filter((country) => preferences.countries.includes(country.id)),
    [allCountryOptions, preferences.countries],
  );

  const loadPreferences = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const loaded = await organizationUserPreferencesService.getMyPreferences();
      setPreferences(loaded);
    } catch (error) {
      console.error('Failed to load organization preferences:', error);
      setPreferences({ ...DEFAULT_ORGANIZATION_USER_PREFERENCES });
      setLoadError('Preferences could not be loaded from the server. You can still review the default form and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  const setArrayField = (field: PreferenceArrayField, value: string[]) => {
    setPreferences((current) => ({ ...current, [field]: value }));
  };

  const toggleArrayValue = (field: PreferenceArrayField, value: string) => {
    setPreferences((current) => {
      const currentValues = current[field] ?? [];
      return {
        ...current,
        [field]: currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });
  };

  const clearAllSelections = () => {
    setPreferences((current) => ({
      ...current,
      sectors: [],
      sector_specialities: [],
      regions: [],
      countries: [],
      funding_agencies: [],
      procurement_types: [],
      notice_types: [],
    }));
  };

  const selectAllRegionsAndCountries = () => {
    setPreferences((current) => ({
      ...current,
      regions: ORGANIZATION_COUNTRY_REGIONS.map((region) => region.id),
      countries: allCountryOptions.map((country) => country.id),
    }));
  };

  const selectRegionCountries = (region: OrganizationCountryRegion) => {
    const countryIds = region.countries.map((country) => country.id);
    setPreferences((current) => ({
      ...current,
      regions: current.regions.includes(region.id) ? current.regions : [...current.regions, region.id],
      countries: Array.from(new Set([...current.countries, ...countryIds])),
    }));
  };

  const toggleCountryRegionOpen = (regionId: string) => {
    setOpenCountryRegions((current) =>
      current.includes(regionId) ? current.filter((id) => id !== regionId) : [...current, regionId],
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: OrganizationUserPreferences = {
        ...preferences,
        user_id: user?.id,
        organization_id: (user as any)?.organizationId ?? (user as any)?.organization_id,
      };
      const saved = await organizationUserPreferencesService.saveMyPreferences(payload);
      setPreferences(saved);
      toast.success('Organization profile preferences saved successfully.');
    } catch (error) {
      console.error('Failed to save organization preferences:', error);
      toast.error('Organization profile preferences could not be saved.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredRegions = ORGANIZATION_COUNTRY_REGIONS.filter((region) => {
    if (!countrySearch.trim()) return true;
    return (
      includesQuery(region.label, countrySearch) ||
      region.countries.some((country) => includesQuery(country.label, countrySearch))
    );
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        icon={UserCog}
        title="Profile Settings"
        description="Manage your organization user tender alerts, countries, funding agencies, and preferences."
      />
      <AccountSubMenu activeTab="profile" onTabChange={() => undefined} mode="profile-settings" />

      <PageContainer className="my-6">
        <div className="space-y-5 px-4 py-6 sm:px-5 lg:px-6">
          {loadError && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-700" />
              <AlertTitle className="text-amber-900">Server preferences unavailable</AlertTitle>
              <AlertDescription className="flex flex-col gap-3 text-amber-900 sm:flex-row sm:items-center sm:justify-between">
                <span>{loadError}</span>
                <Button type="button" variant="outline" size="sm" onClick={loadPreferences} disabled={isLoading}>
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Section title="SELECTION" subtitle="Please select your sectors of interest:">
            <SearchableCheckboxList
              options={ORGANIZATION_SECTORS}
              selected={preferences.sectors}
              search={sectorSearch}
              onSearch={setSectorSearch}
              onToggle={(id) => toggleArrayValue('sectors', id)}
              onSelectAll={() => setArrayField('sectors', ORGANIZATION_SECTORS.map((option) => option.id))}
              onClear={() => setArrayField('sectors', [])}
            />

            <div className="border-t border-gray-100 pt-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
                <Filter className="h-4 w-4 text-accent" />
                Sector sub-specialities
              </div>
              <SearchableCheckboxList
                options={ORGANIZATION_SECTOR_SPECIALITIES}
                selected={preferences.sector_specialities}
                search={specialitySearch}
                onSearch={setSpecialitySearch}
                onToggle={(id) => toggleArrayValue('sector_specialities', id)}
                onSelectAll={() =>
                  setArrayField('sector_specialities', ORGANIZATION_SECTOR_SPECIALITIES.map((option) => option.id))
                }
                onClear={() => setArrayField('sector_specialities', [])}
                columns="lg:grid-cols-2"
              />
            </div>
          </Section>

          <Section subtitle="Please select your countries of interests:">
            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <SearchBox value={countrySearch} onChange={setCountrySearch} />
              <Button type="button" variant="outline" onClick={selectAllRegionsAndCountries}>
                Select all
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setArrayField('regions', []);
                  setArrayField('countries', []);
                }}
                className="text-accent hover:text-accent"
              >
                Clear selection
              </Button>
            </div>

            {selectedCountryOptions.length > 0 && (
              <div className="rounded-md border border-accent/20 bg-accent/5 p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-primary">
                    Selected countries ({selectedCountryOptions.length})
                  </p>
                  <Button type="button" variant="ghost" size="sm" className="h-8 text-accent hover:text-accent" onClick={() => setArrayField('countries', [])}>
                    Clear countries
                  </Button>
                </div>
                <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto pr-1">
                  {selectedCountryOptions.map((country) => (
                    <Badge key={country.id} variant="secondary" className="gap-1 bg-white text-primary">
                      <span className="max-w-[180px] truncate">{country.label}</span>
                      <button
                        type="button"
                        className="rounded-full text-muted-foreground hover:text-accent"
                        onClick={() => toggleArrayValue('countries', country.id)}
                        aria-label={`Remove ${country.label}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {filteredRegions.map((region) => {
                const visibleCountries = region.countries.filter((country) => includesQuery(country.label, countrySearch));
                const hasCountries = region.countries.length > 0;
                const selectedCountryCount = region.countries.filter((country) => preferences.countries.includes(country.id)).length;
                const searchIsActive = Boolean(countrySearch.trim());
                const isOpen = openCountryRegions.includes(region.id) || searchIsActive;

                return (
                  <div key={region.id} className="overflow-hidden rounded-md border border-gray-200 bg-white">
                    <div className="flex flex-col gap-3 border-b border-gray-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        {hasCountries ? (
                          <button
                            type="button"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-white text-muted-foreground hover:border-accent hover:text-accent"
                            onClick={() => toggleCountryRegionOpen(region.id)}
                            aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${region.label}`}
                          >
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        ) : (
                          <span className="h-8 w-8 shrink-0" />
                        )}
                        <label htmlFor={region.id} className="flex min-w-0 cursor-pointer items-center gap-3">
                          <Checkbox
                            id={region.id}
                            checked={preferences.regions.includes(region.id)}
                            onCheckedChange={() => toggleArrayValue('regions', region.id)}
                          />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-primary">{region.label}</span>
                            {hasCountries && (
                              <span className="block text-xs text-muted-foreground">
                                {selectedCountryCount} of {region.countries.length} countries selected
                              </span>
                            )}
                          </span>
                        </label>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {hasCountries && (
                          <Button type="button" variant="outline" size="sm" onClick={() => selectRegionCountries(region)}>
                            Select all countries in region
                          </Button>
                        )}
                      </div>
                    </div>
                    {hasCountries && isOpen && visibleCountries.length > 0 && (
                      <div className="grid max-h-72 gap-2 overflow-y-auto p-4 sm:grid-cols-2 lg:grid-cols-3">
                        {visibleCountries.map((country) => (
                          <CheckboxTile
                            key={country.id}
                            option={country}
                            checked={preferences.countries.includes(country.id)}
                            onToggle={(id) => toggleArrayValue('countries', id)}
                          />
                        ))}
                      </div>
                    )}
                    {hasCountries && isOpen && visibleCountries.length === 0 && (
                      <p className="p-4 text-sm text-muted-foreground">No countries match your search in this region.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>

          <Section subtitle="Please select the funding agencies of interests:">
            <SearchableCheckboxList
              options={ORGANIZATION_FUNDING_AGENCIES}
              selected={preferences.funding_agencies}
              search={fundingSearch}
              onSearch={setFundingSearch}
              onToggle={(id) => toggleArrayValue('funding_agencies', id)}
              onSelectAll={() => setArrayField('funding_agencies', ORGANIZATION_FUNDING_AGENCIES.map((option) => option.id))}
              onClear={() => setArrayField('funding_agencies', [])}
              columns="lg:grid-cols-2"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setArrayField('funding_agencies', ORGANIZATION_FUNDING_AGENCIES.map((option) => option.id))}
            >
              Select all funding Agencies
            </Button>
          </Section>

          <Section title="EDIT DAILY ALERTS SCHEDULE">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <Label>Schedule options</Label>
                <RadioGroup
                  value={preferences.alert_schedule}
                  onValueChange={(value) =>
                    setPreferences((current) => ({ ...current, alert_schedule: value as OrganizationAlertSchedule }))
                  }
                  className="grid gap-3"
                >
                  {[
                    ['daily', 'Daily'],
                    ['weekly', 'Weekly'],
                    ['unsubscribe', 'Unsubscribe'],
                  ].map(([value, label]) => (
                    <label key={value} className="flex cursor-pointer items-center gap-2 rounded-md border bg-white px-3 py-2">
                      <RadioGroupItem value={value} />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Alert format</Label>
                <RadioGroup
                  value={preferences.alert_format}
                  onValueChange={(value) =>
                    setPreferences((current) => ({ ...current, alert_format: value as OrganizationAlertFormat }))
                  }
                  className="grid gap-3"
                >
                  {[
                    ['summary', 'Summary'],
                    ['detailed', 'Detailed'],
                  ].map(([value, label]) => (
                    <label key={value} className="flex cursor-pointer items-center gap-2 rounded-md border bg-white px-3 py-2">
                      <RadioGroupItem value={value} />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </Section>

          <Section title="OTHER PREFERENCES">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label>Procurement type</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {ORGANIZATION_PROCUREMENT_TYPES.map((option) => (
                    <CheckboxTile
                      key={option.id}
                      option={option}
                      checked={preferences.procurement_types.includes(option.id)}
                      onToggle={(id) => toggleArrayValue('procurement_types', id)}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label>Notice type</Label>
                <div className="grid gap-2">
                  {ORGANIZATION_NOTICE_TYPES.map((option) => (
                    <CheckboxTile
                      key={option.id}
                      option={option}
                      checked={preferences.notice_types.includes(option.id)}
                      onToggle={(id) => toggleArrayValue('notice_types', id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section title="CONTACT / ADMIN NOTES">
            <div className="space-y-3 text-sm text-gray-700">
              <p>To modify any other settings of your profile please contact your User Administrator</p>
              <ul className="list-disc space-y-1 pl-5">
                {adminEmails.map((email) => (
                  <li key={email}>
                    <a href={`mailto:${email}`} className="text-accent hover:underline">
                      {email}
                    </a>
                  </li>
                ))}
              </ul>
              <p>
                To modify the User Administrator please contact{' '}
                <a href="mailto:info@assortis.com" className="text-accent hover:underline">
                  info@assortis.com
                </a>
              </p>
              <p>You can create a maximum of 2 User Administrator</p>
            </div>
          </Section>

          <div className="sticky bottom-0 z-10 rounded-lg border bg-white/95 p-4 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="ghost" onClick={clearAllSelections} className="justify-start text-accent hover:text-accent">
                Clear selection
              </Button>
              <Button type="button" onClick={handleSave} disabled={isSaving || isLoading} className="bg-accent hover:bg-accent/90">
                {isSaving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    SAVE
                  </>
                )}
              </Button>
            </div>
            {!isLoading && !loadError && (
              <div className="mt-2 flex items-center gap-2 text-xs text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Existing preferences loaded.
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
