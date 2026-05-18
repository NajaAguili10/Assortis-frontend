import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { SectorSubsectorFilter } from '@app/components/SectorSubsectorFilter';
import { RegionCountryFilter } from '@app/components/RegionCountryFilter';
import {
  SavedSearchEditorDialog,
  type SavedSearchEditorSavePayload,
  type SavedSearchReviewItem,
} from '@app/components/SavedSearchEditorDialog';
import { SavedSearchProfileBadge } from '@app/components/SavedSearchProfileBadge';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { Badge } from '@app/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@app/components/ui/dialog';
import { useOrganizations } from '@app/modules/organization/hooks/useOrganizations';
import { useOrganizationBookmarks } from '@app/modules/shared/hooks/useOrganizationBookmarks';
import { organizationService } from '@app/services/organizationService';
import { sectorService } from '@app/services/sectorService';
import { OrganizationTypeEnum, SectorDTO, CountryDTO, SubsectorDTO, OrganizationSectorEnum, RegionEnum, CountryEnum } from '@app/types/organization.dto';
import { SubSectorEnum, SectorEnum, REGION_COUNTRY_MAP } from '@app/types/tender.dto';
import { ORGANIZATION_SECTOR_SUBSECTOR_MAP } from '@app/config/organization-sectors.config';
import { Search, X, ChevronLeft, ChevronRight, Building2, MapPin, Briefcase, Globe, Target, CheckCircle, ChevronDown, Plus, Star, FolderOpen, Calendar, Users, FileText, TrendingUp, SlidersHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Organization } from '@app/types/organization.dto';
import { buildOrganizationProfileSearchFields, savedSearchService, type SavedSearchAlertSettings } from '@app/services/savedSearchService';

interface OrganizationSavedPayload {
  searchQuery: string;
  procurementType: string;
  publishedFrom: string;
  publishedTo: string;
  projectBudget: string;
  keywords: string;
  officeLocation: string;
  city: string;
  selectedSectors: OrganizationSectorEnum[];
  selectedSubSectors: SubSectorEnum[];
  selectedRegions: RegionEnum[];
  selectedCountries: CountryEnum[];
  type: OrganizationTypeEnum[];
}

interface SavedSearchEntry<TPayload> {
  id: string;
  label: string;
  createdAt: string;
  payload: TPayload;
  organizationProfileId?: string;
  organizationProfileName?: string;
  organizationProfileEmail?: string;
}

interface OrganizationPartnerState {
  engagements?: string[];
}

const getOrganizationField = (value: Organization['city'] | Organization['country']) => {
  if (!value) return '';
  return typeof value === 'string' ? value : value.name;
};

const getOrgLocation = (org: Organization) => {
  return [getOrganizationField(org.city), getOrganizationField(org.country)].filter(Boolean).join(', ') || 'Location not available';
};

const getScoreTone = (score: number) => {
  if (score >= 85) return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (score >= 70) return 'border-blue-200 bg-blue-50 text-blue-700';
  if (score >= 55) return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-gray-200 bg-gray-50 text-gray-700';
};

const getCollaborationSummary = (org: Organization, score: number, engagementCount: number) => {
  const sectors = org.sectors?.length ? org.sectors.slice(0, 3).join(', ') : 'general cooperation';
  const projects = (org.activeProjects || 0) + (org.completedProjects || 0);
  const projectText = projects > 0 ? `${projects} tracked project${projects > 1 ? 's' : ''}` : 'no project count published yet';
  return `${org.name} has ${engagementCount} logged collaboration touchpoint${engagementCount > 1 ? 's' : ''}, a ${score}% compatibility score, and focus areas around ${sectors}. Current public profile data shows ${projectText}.`;
};

const buildSharedProjects = (org: Organization, engagements: string[]) => {
  const sectors = org.sectors?.length ? org.sectors : ['Partnership'];
  const count = Math.max(1, Math.min(3, Math.max(org.activeProjects || 0, engagements.length)));

  return Array.from({ length: count }, (_, index) => ({
    id: `${org.id}-shared-${index}`,
    title: `${sectors[index % sectors.length].replace(/_/g, ' ')} collaboration ${index + 1}`,
    status: index === 0 ? 'Active / recent' : index === 1 ? 'Follow-up' : 'Pipeline',
    role: index % 2 === 0 ? 'Consortium / implementation partner' : 'Technical support partner',
    lastTouchpoint: engagements[engagements.length - 1 - index] || engagements[engagements.length - 1],
  }));
};

const buildDetailRows = (org: Organization) => [
  ['Legal name', org.legalName || 'N/A'],
  ['Acronym', org.acronym || 'N/A'],
  ['Type', org.type || 'N/A'],
  ['Status', org.status || org.verificationStatus || 'N/A'],
  ['Location', getOrgLocation(org)],
  ['Region', org.region || 'N/A'],
  ['Website', org.website || 'N/A'],
  ['Contact email', org.contactEmail || org.email || 'N/A'],
  ['Founded', org.yearEstablished ? String(org.yearEstablished) : 'N/A'],
  ['Employees', org.employeeCount ? String(org.employeeCount) : 'N/A'],
  ['Active projects', String(org.activeProjects ?? 0)],
  ['Completed projects', String(org.completedProjects ?? 0)],
  ['Partnerships', String(org.partnerships ?? 0)],
  ['Budget / turnover', org.budget?.formatted || 'N/A'],
  ['Created', org.createdAt ? format(new Date(org.createdAt), 'yyyy-MM-dd') : 'N/A'],
  ['Updated', org.updatedAt ? format(new Date(org.updatedAt), 'yyyy-MM-dd') : 'N/A'],
];

function CollaborationHistoryPanel({
  organizations,
  partnerStates,
  compatibilityByOrg,
  expandedHistory,
  setExpandedHistory,
  removeLastEngagement,
  clearEngagements,
}: {
  organizations: Organization[];
  partnerStates: Record<string, OrganizationPartnerState>;
  compatibilityByOrg: Record<string, number>;
  expandedHistory: Record<string, boolean>;
  setExpandedHistory: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  removeLastEngagement: (organizationId: string | number) => void;
  clearEngagements: (organizationId: string | number) => void;
}) {
  if (organizations.length === 0) {
    return (
      <div className="space-y-4 mb-6">
        <div className="text-center py-12 bg-white rounded-lg border">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-primary mb-1">No history yet</h3>
          <p className="text-sm text-muted-foreground">Mark organisations you have worked with to track them here.</p>
        </div>
      </div>
    );
  }

  const engagementTotal = organizations.reduce((sum, org) => sum + (partnerStates[org.id]?.engagements?.length ?? 0), 0);
  const averageScore = Math.round(organizations.reduce((sum, org) => sum + (compatibilityByOrg[org.id] || 72), 0) / organizations.length);
  const sharedProjectTotal = organizations.reduce((sum, org) => sum + buildSharedProjects(org, partnerStates[org.id]?.engagements || []).length, 0);

  return (
    <div className="space-y-4 mb-6">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium uppercase text-muted-foreground">Organisations</p>
          <p className="mt-1 text-2xl font-semibold text-primary">{organizations.length}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium uppercase text-muted-foreground">Engagements</p>
          <p className="mt-1 text-2xl font-semibold text-primary">{engagementTotal}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium uppercase text-muted-foreground">Avg score</p>
          <p className="mt-1 text-2xl font-semibold text-primary">{averageScore}%</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium uppercase text-muted-foreground">Shared projects</p>
          <p className="mt-1 text-2xl font-semibold text-primary">{sharedProjectTotal}</p>
        </div>
      </div>

      {organizations.map((org) => {
        const engagements = partnerStates[org.id]?.engagements || [];
        const score = compatibilityByOrg[org.id] || 72;
        const sharedProjects = buildSharedProjects(org, engagements);
        const expanded = Boolean(expandedHistory[org.id]);

        return (
          <div key={org.id} className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-primary">
                      {org.name}{org.acronym && <span className="text-sm text-muted-foreground ml-2">({org.acronym})</span>}
                    </h3>
                    <Badge variant="outline" className={getScoreTone(score)}>
                      <Star className="mr-1 h-3.5 w-3.5" />
                      {score}% score
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{getOrgLocation(org)}</p>
                  <p className="mt-2 max-w-4xl text-sm text-gray-700">{getCollaborationSummary(org, score, engagements.length)}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setExpandedHistory(prev => ({ ...prev, [org.id]: !expanded }))}>
                  {expanded ? 'Hide details' : 'Expand details'}
                  <ChevronDown className={`ml-1.5 h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </Button>
                <Button size="sm" variant="outline" onClick={() => removeLastEngagement(org.id)}>Undo last</Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => clearEngagements(org.id)}>Clear all</Button>
              </div>
            </div>

            <div className="grid gap-3 border-t bg-slate-50/60 p-4 md:grid-cols-4">
              <div className="rounded-md bg-white p-3">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground"><CheckCircle className="h-3.5 w-3.5" />Engagements</p>
                <p className="mt-1 text-lg font-semibold text-primary">{engagements.length}</p>
                <p className="text-xs text-muted-foreground">Last: {engagements.at(-1) ? format(new Date(engagements.at(-1)!), 'yyyy-MM-dd HH:mm') : 'N/A'}</p>
              </div>
              <div className="rounded-md bg-white p-3">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground"><FolderOpen className="h-3.5 w-3.5" />Shared projects</p>
                <p className="mt-1 text-lg font-semibold text-primary">{sharedProjects.length}</p>
                <p className="text-xs text-muted-foreground">{(org.activeProjects || 0) + (org.completedProjects || 0)} profile projects</p>
              </div>
              <div className="rounded-md bg-white p-3">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground"><Users className="h-3.5 w-3.5" />Capacity</p>
                <p className="mt-1 text-lg font-semibold text-primary">{org.employeeCount || org.teamMembers || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">Employees / team size</p>
              </div>
              <div className="rounded-md bg-white p-3">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground"><TrendingUp className="h-3.5 w-3.5" />Readiness</p>
                <p className="mt-1 text-lg font-semibold text-primary">{score >= 85 ? 'High' : score >= 70 ? 'Good' : 'Review'}</p>
                <p className="text-xs text-muted-foreground">Based on score and profile data</p>
              </div>
            </div>

            {expanded && (
              <div className="space-y-5 border-t p-5">
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                    <FileText className="h-4 w-4" />
                    Collaboration summary
                  </h4>
                  <div className="rounded-md border bg-white p-4 text-sm leading-6 text-gray-700">
                    <p>{getCollaborationSummary(org, score, engagements.length)}</p>
                    <p className="mt-2">
                      Profile sectors: {org.sectors?.length ? org.sectors.map(sector => sector.replace(/_/g, ' ')).join(', ') : 'N/A'}.
                      Description: {org.description || 'No public description available.'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                    <FolderOpen className="h-4 w-4" />
                    Shared projects and collaboration scope
                  </h4>
                  <div className="grid gap-3 lg:grid-cols-3">
                    {sharedProjects.map(project => (
                      <div key={project.id} className="rounded-md border bg-white p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-sm font-semibold text-primary">{project.title}</h5>
                          <Badge variant="secondary">{project.status}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-gray-700">{project.role}</p>
                        <p className="mt-3 text-xs text-muted-foreground">
                          Last touchpoint: {project.lastTouchpoint ? format(new Date(project.lastTouchpoint), 'yyyy-MM-dd HH:mm') : 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                      <Calendar className="h-4 w-4" />
                      Collaboration timeline
                    </h4>
                    <div className="rounded-md border bg-white">
                      {engagements.slice().reverse().map((date, index) => (
                        <div key={`${org.id}-${date}-${index}`} className="flex gap-3 border-b p-3 last:border-b-0">
                          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-accent" />
                          <div>
                            <p className="text-sm font-medium text-primary">Engagement logged</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(date), 'yyyy-MM-dd HH:mm')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                      <Building2 className="h-4 w-4" />
                      Organisation details
                    </h4>
                    <div className="grid rounded-md border bg-white sm:grid-cols-2">
                      {buildDetailRows(org).map(([label, value]) => (
                        <div key={label} className="border-b border-r p-3 last:border-b-0">
                          <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
                          <p className="mt-1 break-words text-sm text-gray-800">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SearchOrganizationsTabContent() {
  const { t, language } = useLanguage();
  const { user, activeOrganizationProfile } = useAuth();
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark } = useOrganizationBookmarks();
  const [searchParams] = useSearchParams();
  const {
    organizations,
    allOrganizations,
    filters,
    updateFilters,
    clearFilters,
    activeFiltersCount,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
  } = useOrganizations();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<SectorDTO[]>([]);
  const [selectedSubSectors, setSelectedSubSectors] = useState<SubsectorDTO[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<CountryDTO[]>([]);
  const [dynamicSubsectorsMap, setDynamicSubsectorsMap] = useState<Record<number, SubsectorDTO[]>>({});
  const [hoveredSector, setHoveredSector] = useState<SectorDTO | null>(null);
  const [procurementType, setProcurementType] = useState('');
  const [publishedFrom, setPublishedFrom] = useState('');
  const [publishedTo, setPublishedTo] = useState('');
  const [projectBudget, setProjectBudget] = useState('');
  const [keywords, setKeywords] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');
  const [city, setCity] = useState('');

  const [selectedRegions, setSelectedRegions] = useState<RegionEnum[]>([]);

  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSectorFilters, setShowSectorFilters] = useState(false);
  const [showRegionFilters, setShowRegionFilters] = useState(false);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearchEntry<OrganizationSavedPayload>[]>([]);
  const [isSaveSearchDialogOpen, setIsSaveSearchDialogOpen] = useState(false);
  const [editingSavedSearch, setEditingSavedSearch] = useState<SavedSearchEntry<OrganizationSavedPayload> | null>(null);
  const [compatibilityByOrg, setCompatibilityByOrg] = useState<Record<string, number>>({});
  const [partnerStates, setPartnerStates] = useState<Record<string, OrganizationPartnerState>>({});
  const [activeTab, setActiveTab] = useState<'results' | 'history'>('results');
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});
  const shouldShowBookmarkButton = user?.accountType !== 'expert';

  const storageKey = 'search.tab.saved.organisations';
  const compatibilityStorageKey = 'search.organisations.compatibility';
  const partnerStateStorageKey = 'search.organisations.partnerStates';



  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== (filters.searchQuery || '')) {
        updateFilters({ searchQuery: searchQuery || undefined });
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [filters.searchQuery, searchQuery, updateFilters]);

  // Fetch subscription data
  const [subscriptionSectors, setSubscriptionSectors] = useState<SectorDTO[]>([]);
  const [subscriptionCountries, setSubscriptionCountries] = useState<CountryDTO[]>([]);

  useEffect(() => {
    const fetchSectors = async () => {
      if (!user) return;
      try {
        const sectors = await organizationService.getMySubscriptionSectors();
        if (sectors && sectors.length > 0) {
          setSubscriptionSectors(sectors);
        } else {
          // Fallback to all sectors if no subscriptions found
          const allSectors = await sectorService.getAllSectors();
          setSubscriptionSectors(allSectors || []);
        }
      } catch (error) {
        console.error('Error fetching subscription sectors:', error);
        // Fallback on error
        try {
          const allSectors = await sectorService.getAllSectors();
          setSubscriptionSectors(allSectors || []);
        } catch (e) { }
      }
    };
    fetchSectors();
  }, [user]);

  useEffect(() => {
    const fetchCountries = async () => {
      if (!user) return;
      try {
        const countries = await organizationService.getMySubscriptionCountries();
        setSubscriptionCountries(countries || []);
      } catch (error) {
        console.error('Error fetching subscription countries:', error);
      }
    };
    fetchCountries();
  }, [user]);

  const readSavedSearches = useCallback((): SavedSearchEntry<OrganizationSavedPayload>[] =>
    savedSearchService.list(user?.id, 'organisations').map((item) => ({
      id: item.id,
      label: item.name,
      createdAt: item.created_at,
      payload: item.filters as OrganizationSavedPayload,
    })), [user?.id]);

  useEffect(() => {
    setSavedSearches(readSavedSearches());
  }, [user?.id, readSavedSearches]);

  // Fetch subsectors for selected sectors
  useEffect(() => {
    const fetchSelectedSubsectors = async () => {
      const newMap = { ...dynamicSubsectorsMap };
      let changed = false;

      for (const sector of selectedSectors) {
        if (!newMap[sector.id]) {
          try {
            const subs = await sectorService.getSubsectorsBySectorId(sector.id);
            newMap[sector.id] = subs;
            changed = true;
          } catch (error) {
            console.error(`Error fetching subsectors for ${sector.name}:`, error);
          }
        }
      }

      if (changed) {
        setDynamicSubsectorsMap(newMap);
      }
    };

    if (selectedSectors.length > 0) {
      fetchSelectedSubsectors();
    }
  }, [selectedSectors]);

  const organizationSubSectors = useMemo(() => {
    if (selectedSectors.length === 0) return [];
    const subs: SubsectorDTO[] = [];
    selectedSectors.forEach((sector) => {
      const sectorSubs = dynamicSubsectorsMap[sector.id] || [];
      subs.push(...sectorSubs);
    });
    // Deduplicate by ID
    const uniqueMap = new Map<number, SubsectorDTO>();
    subs.forEach(s => uniqueMap.set(s.id, s));
    return Array.from(uniqueMap.values());
  }, [selectedSectors, dynamicSubsectorsMap]);

  useEffect(() => {
    try {
      const storedCompatibility = JSON.parse(localStorage.getItem(compatibilityStorageKey) || '{}');
      const nextCompatibility = { ...(storedCompatibility || {}) };
      organizations.data.forEach((org) => {
        if (!nextCompatibility[org.id]) {
          nextCompatibility[org.id] = 55 + Math.floor(Math.random() * 44);
        }
      });
      localStorage.setItem(compatibilityStorageKey, JSON.stringify(nextCompatibility));
      setCompatibilityByOrg(nextCompatibility);
    } catch {
      setCompatibilityByOrg({});
    }

    try {
      const storedStates = JSON.parse(localStorage.getItem(partnerStateStorageKey) || '{}');
      setPartnerStates(storedStates || {});
    } catch {
      setPartnerStates({});
    }
  }, [compatibilityStorageKey, organizations.data.length, partnerStateStorageKey]);

  useEffect(() => {
    const q = (searchParams.get('q') || '').trim();
    if (!q) return;
    setSearchQuery(q);
    updateFilters({ searchQuery: q });
  }, [searchParams, updateFilters]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    updateFilters({
      searchQuery: searchQuery || undefined,
      procurementType: procurementType || undefined,
      publishedFrom: publishedFrom || undefined,
      publishedTo: publishedTo || undefined,
      projectBudget: projectBudget || undefined,
      keywords: keywords || undefined,
      officeLocation: officeLocation || undefined,
      city: city || undefined,
    });
  };

  const handleTypeFilter = (type: OrganizationTypeEnum) => {
    const currentTypes = filters.type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((item) => item !== type)
      : [...currentTypes, type];
    updateFilters({ type: newTypes.length > 0 ? newTypes : undefined });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setProcurementType('');
    setPublishedFrom('');
    setPublishedTo('');
    setProjectBudget('');
    setKeywords('');
    setOfficeLocation('');
    setCity('');
    setSelectedSectors([]);
    setSelectedSubSectors([]);
    setSelectedCountries([]);
    setSelectedRegions([]);
    clearFilters();
  };

  const updatePartnerState = (organizationId: string, patch: OrganizationPartnerState) => {
    const next = {
      ...partnerStates,
      [organizationId]: {
        ...(partnerStates[organizationId] || {}),
        ...patch,
      },
    };
    localStorage.setItem(partnerStateStorageKey, JSON.stringify(next));
    setPartnerStates(next);
  };

  const logEngagement = (organizationId: string) => {
    const current = partnerStates[organizationId]?.engagements || [];
    updatePartnerState(organizationId, { engagements: [...current, new Date().toISOString()] });
  };

  const removeLastEngagement = (organizationId: string) => {
    const current = partnerStates[organizationId]?.engagements || [];
    const next = current.slice(0, -1);
    updatePartnerState(organizationId, { engagements: next.length > 0 ? next : [] });
  };

  const clearEngagements = (organizationId: string) => {
    updatePartnerState(organizationId, { engagements: [] });
  };

  const buildPayload = (): OrganizationSavedPayload => ({
    searchQuery,
    procurementType,
    publishedFrom,
    publishedTo,
    projectBudget,
    keywords,
    officeLocation,
    city,
    selectedSectors: (selectedSectors || []).map(s => s.code as OrganizationSectorEnum),
    selectedSubSectors: (selectedSubSectors || []).map(s => s.code as SubSectorEnum),
    selectedRegions: selectedRegions || [],
    selectedCountries: (selectedCountries || []).map(c => c.code as CountryEnum),
    type: filters.type || [],
  });

  const formatList = (items?: any[]) => (items || []).map((item) => {
    if (typeof item === 'string') return item.replace(/_/g, ' ');
    if (item && typeof item === 'object') return item.name || item.code || String(item);
    return String(item);
  });

  const buildReviewItemsFromPayload = (payload: OrganizationSavedPayload): SavedSearchReviewItem[] => {
    return [
      { label: 'Type', value: 'Organisations' },
      { label: 'Keywords', value: payload.searchQuery || payload.keywords },
      { label: 'Sectors', value: formatList(payload.selectedSectors as string[]) },
      { label: 'Subsectors', value: formatList(payload.selectedSubSectors as string[]) },
      { label: 'Countries', value: formatList(payload.selectedCountries as string[]) },
      { label: 'Organisation Type', value: formatList(payload.type as string[]) },
      { label: 'Location', value: [payload.city, payload.officeLocation].filter(Boolean).join(', ') },
    ];
  };

  const getAlertSettingsForEntry = (entry?: SavedSearchEntry<OrganizationSavedPayload> | null): Partial<SavedSearchAlertSettings> => {
    if (!entry) return { alertFrequency: 'daily', alertDays: ['Every day'], alertHour: '08:00', emailFormat: 'summary', status: 'active' };
    return {
      alertFrequency: 'daily',
      alertDays: ['Every day'],
      alertHour: '08:00',
      emailFormat: 'summary',
      status: 'active',
    };
  };

  const openEditSavedSearch = (entry: SavedSearchEntry<OrganizationSavedPayload>) => {
    setEditingSavedSearch(entry);
    setIsSaveSearchDialogOpen(true);
  };

  const buildSummary = () => {
    const payload = buildPayload();
    return [
      payload.searchQuery ? `Keywords: ${payload.searchQuery}` : '',
      payload.selectedSectors.length ? `Sectors: ${payload.selectedSectors.length}` : '',
      payload.selectedCountries.length ? `Countries: ${payload.selectedCountries.length}` : '',
      payload.type.length ? `Types: ${payload.type.length}` : '',
    ].filter(Boolean);
  };

  const saveSearch = ({ name, alertSettings, useCurrentCriteria }: SavedSearchEditorSavePayload) => {
    if (editingSavedSearch) {
      const nextPayload = useCurrentCriteria ? buildPayload() : editingSavedSearch.payload;
      savedSearchService.update(editingSavedSearch.id, {
        name,
        filters: nextPayload,
        context: useCurrentCriteria
          ? {
            type: 'organisations',
            route: '/search/organisations',
            label: 'Organisations',
            summary: buildSummary(),
            language,
            accountType: user?.accountType,
          }
          : savedSearchService.get(editingSavedSearch.id)?.context,
        alertsEnabled: alertSettings.alertFrequency !== 'unsubscribe' && alertSettings.status === 'active',
        alertFrequency: alertSettings.alertFrequency,
        alertDays: alertSettings.alertDays,
        alertHour: alertSettings.alertHour,
        emailFormat: alertSettings.emailFormat,
        status: alertSettings.status,
      });
      setSavedSearches(readSavedSearches());
      setIsSaveSearchDialogOpen(false);
      setEditingSavedSearch(null);
      toast.success('Saved search updated');
      return;
    }

    savedSearchService.save({
      userId: user?.id,
      name,
      filters: buildPayload(),
      context: {
        type: 'organisations',
        route: '/search/organisations',
        label: 'Organisations',
        summary: buildSummary(),
        language,
        accountType: user?.accountType,
      },
      alertsEnabled: alertSettings.alertFrequency !== 'unsubscribe' && alertSettings.status === 'active',
      alertFrequency: alertSettings.alertFrequency,
      alertDays: alertSettings.alertDays,
      alertHour: alertSettings.alertHour,
      emailFormat: alertSettings.emailFormat,
      status: alertSettings.status,
    });
    setSavedSearches(readSavedSearches());
    setIsSaveSearchDialogOpen(false);
    setEditingSavedSearch(null);
    toast.success('Search saved');
  };

  const deleteSavedSearch = (id: string) => {
    savedSearchService.remove(id);
    setSavedSearches(readSavedSearches());
    toast.success('Search deleted');
  };

  const fetchSavedSearches = async () => {
    const rows = savedSearchService
      .list(user?.id, 'organisations')
      .filter((item) => !activeOrganizationProfile || item.organizationProfileId === activeOrganizationProfile.id)
      .map((item) => ({
        id: item.id,
        label: item.name,
        createdAt: item.created_at,
        payload: item.filters as OrganizationSavedPayload,
        organizationProfileId: item.organizationProfileId,
        organizationProfileName: item.organizationProfileName,
        organizationProfileEmail: item.organizationProfileEmail,
      }));
    setSavedSearches(rows);
  };

  const buildPayload = (): OrganizationSavedPayload => ({
    searchQuery,
    procurementType,
    publishedFrom,
    publishedTo,
    projectBudget,
    keywords,
    officeLocation,
    city,
    selectedSectors,
    selectedSubSectors,
    selectedRegions,
    selectedCountries,
    type: filters.type || [],
  });

  const buildSummary = () => [
    searchQuery ? `Keywords: ${searchQuery}` : '',
    procurementType ? `Procurement: ${procurementType}` : '',
    publishedFrom ? `From: ${publishedFrom}` : '',
    publishedTo ? `To: ${publishedTo}` : '',
    projectBudget ? `Budget: ${projectBudget}` : '',
    selectedSectors.length ? `Sectors: ${selectedSectors.length}` : '',
    selectedCountries.length ? `Countries: ${selectedCountries.length}` : '',
  ].filter(Boolean);

  const buildReviewItemsFromPayload = (payload: OrganizationSavedPayload): SavedSearchReviewItem[] => [
    { label: 'Type', value: 'Organisations' },
    { label: 'Keywords', value: payload.searchQuery || payload.keywords },
    { label: 'Procurement Type', value: payload.procurementType },
    { label: 'Published From', value: payload.publishedFrom },
    { label: 'Published To', value: payload.publishedTo },
    { label: 'Project Budget', value: payload.projectBudget },
    { label: 'Office Location', value: payload.officeLocation },
    { label: 'City', value: payload.city },
    { label: 'Sectors', value: (payload.selectedSectors || []).map((item: any) => item.name || item.code || String(item)) },
    { label: 'Countries', value: (payload.selectedCountries || []).map((item: any) => item.name || item.code || String(item)) },
  ];

  const getAlertSettingsForEntry = (entry?: SavedSearchEntry<OrganizationSavedPayload> | null): Partial<SavedSearchAlertSettings> => {
    if (!entry) return { alertFrequency: 'daily', alertDays: ['Every day'], alertHour: '08:00', emailFormat: 'summary', status: 'active' };
    const saved = savedSearchService.get(entry.id);
    return {
      alertFrequency: saved?.alertFrequency || 'daily',
      alertDays: saved?.alertDays || ['Every day'],
      alertHour: saved?.alertHour || '08:00',
      emailFormat: saved?.emailFormat || 'summary',
      status: saved?.status || 'active',
    };
  };

  const applySavedSearch = (payload: OrganizationSavedPayload) => {
    setSearchQuery(payload.searchQuery || '');
    setProcurementType(payload.procurementType || '');
    setPublishedFrom(payload.publishedFrom || '');
    setPublishedTo(payload.publishedTo || '');
    setProjectBudget(payload.projectBudget || '');
    setKeywords(payload.keywords || '');
    setOfficeLocation(payload.officeLocation || '');
    setCity(payload.city || '');
    setSelectedSectors(payload.selectedSectors || []);
    setSelectedSubSectors(payload.selectedSubSectors || []);
    setSelectedCountries(payload.selectedCountries || []);
    setSelectedRegions(payload.selectedRegions || []);
    updateFilters({
      searchQuery: payload.searchQuery || undefined,
      procurementType: payload.procurementType || undefined,
      publishedFrom: payload.publishedFrom || undefined,
      publishedTo: payload.publishedTo || undefined,
      projectBudget: payload.projectBudget || undefined,
      keywords: payload.keywords || undefined,
      officeLocation: payload.officeLocation || undefined,
      city: payload.city || undefined,
      sectors: (payload.selectedSectors || []).length > 0 ? payload.selectedSectors : undefined,
      subSectors: (payload.selectedSubSectors || []).length > 0 ? payload.selectedSubSectors : undefined,
      countries: (payload.selectedCountries || []).length > 0 ? payload.selectedCountries : undefined,
      type: (payload.type || []).length > 0 ? payload.type : undefined,
    });
  };

  const handleSaveSearch = async () => {
    if (!user) {
      toast.error('You must be logged in to save searches');
      return;
    }

    setEditingSavedSearch(null);
    setIsSaveSearchDialogOpen(true);
  };

  const openEditSavedSearch = (entry: SavedSearchEntry<OrganizationSavedPayload>) => {
    setEditingSavedSearch(entry);
    setIsSaveSearchDialogOpen(true);
  };

  const saveSearch = ({ name, alertSettings, useCurrentCriteria }: SavedSearchEditorSavePayload) => {
    const payload = useCurrentCriteria || !editingSavedSearch ? buildPayload() : editingSavedSearch.payload;
    const patch = {
      name,
      filters: payload,
      ...buildOrganizationProfileSearchFields(activeOrganizationProfile),
      context: {
        type: 'organisations' as const,
        route: '/search/organisations',
        label: 'Organisations',
        summary: buildSummary(),
        language,
        accountType: user?.accountType,
      },
      alertsEnabled: alertSettings.alertFrequency !== 'unsubscribe' && alertSettings.status === 'active',
      alertFrequency: alertSettings.alertFrequency,
      alertDays: alertSettings.alertDays,
      alertHour: alertSettings.alertHour,
      emailFormat: alertSettings.emailFormat,
      status: alertSettings.status,
    };

    if (editingSavedSearch) {
      savedSearchService.update(editingSavedSearch.id, patch);
      toast.success('Saved search updated');
    } else {
      savedSearchService.save({ userId: user?.id, ...patch });
      toast.success('Search saved');
    }

    setIsSaveSearchDialogOpen(false);
    setEditingSavedSearch(null);
    fetchSavedSearches();
  };

  const deleteSavedSearch = (id: string) => {
    savedSearchService.remove(id);
    toast.success('Search deleted');
    fetchSavedSearches();
  };

  const openLoadSearchDialog = () => {
    fetchSavedSearches();
    setIsLoadDialogOpen(true);
  };

  useEffect(() => {
    fetchSavedSearches();
  }, [user?.id, activeOrganizationProfile?.id]);

  const sectionHeadingKey = 'search.section.organisations.filters.heading';
  const sectionDescriptionKey = 'search.section.organisations.filters.description';
  const historyOrganizations = allOrganizations.filter((org) => (partnerStates[org.id]?.engagements?.length ?? 0) > 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6 shadow-sm">
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
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              <X className="w-4 h-4 mr-1" />
              {t('filters.clear') || t('organizations.filters.clear')}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowFilters((prev) => !prev)}>
            {showFilters ? 'Hide filters' : 'Refine filters'}
          </Button>
          <Button variant="default" size="sm" onClick={() => updateFilters({ searchQuery })}>Search</Button>
          <Button variant="outline" size="sm" onClick={handleSaveSearch}>Save Search</Button>
          <Button variant="outline" size="sm" onClick={openLoadSearchDialog}>Load Search</Button>
        </div>

        {showFilters && (
          <>
            <div className="mb-5 rounded-lg border border-gray-100 bg-slate-50/50 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <label className="text-sm font-semibold text-primary">Organisation criteria</label>
                {organizations.meta.totalItems > 0 && (
                  <span className="text-sm font-medium text-accent">{organizations.meta.totalItems} results</span>
                )}
              </div>
              <form onSubmit={handleSearch} className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(180px,0.7fr)_auto]">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Name of organisation</label>
                  <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search by organisation name, acronym, or description" className="min-h-10 bg-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Keywords</label>
                  <Input value={keywords} onChange={(event) => setKeywords(event.target.value)} placeholder="Sector, focus area, capability" className="min-h-10 bg-white" />
                </div>
                <Button type="submit" className="mt-auto min-h-10">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </form>

              <button
                type="button"
                className="mt-4 flex w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
                onClick={() => setShowAdvancedFilters((prev) => !prev)}
              >
                <span className="inline-flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Advanced filters
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </button>

              {showAdvancedFilters && (
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600">Procurement type</label>
                    <Input value={procurementType} onChange={(event) => setProcurementType(event.target.value)} placeholder="Services, works, grants..." className="min-h-10 bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600">Published from</label>
                    <Input type="date" value={publishedFrom} onChange={(event) => setPublishedFrom(event.target.value)} className="min-h-10 bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600">Published to</label>
                    <Input type="date" value={publishedTo} onChange={(event) => setPublishedTo(event.target.value)} className="min-h-10 bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600">Project budget</label>
                    <Input type="number" min={0} value={projectBudget} onChange={(event) => setProjectBudget(event.target.value)} placeholder="Minimum budget" className="min-h-10 bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600">Office location</label>
                    <Input value={officeLocation} onChange={(event) => setOfficeLocation(event.target.value)} placeholder="Country, region, office" className="min-h-10 bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600">City</label>
                    <Input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" className="min-h-10 bg-white" />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">{t('organizations.filters.type')}</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-10 px-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Target className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{filters.type && filters.type.length > 0 ? `${filters.type.length} selected` : 'Select type'}</span>
                      </div>
                      {filters.type && filters.type.length > 0 && <Badge className="ml-2 flex-shrink-0" variant="secondary">{filters.type.length}</Badge>}
                      <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72" align="start">
                    <div className="space-y-2">
                      {Object.values(OrganizationTypeEnum).map((type) => (
                        <Button key={type} variant={filters.type?.includes(type) ? 'default' : 'outline'} size="sm" className="w-full justify-start text-xs" onClick={() => handleTypeFilter(type)}>
                          {filters.type?.includes(type) && <CheckCircle className="w-3 h-3 mr-2" />}
                          {t(`organizations.type.${type}`)}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
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
                hoveredSector={hoveredSector as any}
                onHoverSector={setHoveredSector as any}
                allowedSectors={subscriptionSectors}
                dynamicSubsectorsMap={dynamicSubsectorsMap}
                onSelectSector={(sector) => {
                  const isSelected = selectedSectors.some(s => s.id === sector.id);
                  const next = isSelected
                    ? selectedSectors.filter((item) => item.id !== sector.id)
                    : [...selectedSectors, sector];
                  setSelectedSectors(next);

                  if (next.length === 0) {
                    setSelectedSubSectors([]);
                    updateFilters({ sectors: undefined, subSectors: undefined });
                    return;
                  }

                  // Filter out subsectors that no longer belong to selected sectors
                  const validSubSectors = selectedSubSectors.filter((sub) =>
                    next.some((sec) => {
                      const subs = dynamicSubsectorsMap[sec.id] || [];
                      return subs.some(s => s.id === sub.id);
                    })
                  );
                  setSelectedSubSectors(validSubSectors);
                  updateFilters({
                    sectors: next,
                    subSectors: validSubSectors.length > 0 ? validSubSectors : undefined
                  });
                }}
                onSelectSubSector={(subSector) => {
                  const isSelected = selectedSubSectors.some(s => s.id === subSector.id);
                  const next = isSelected
                    ? selectedSubSectors.filter((item) => item.id !== subSector.id)
                    : [...selectedSubSectors, subSector];
                  setSelectedSubSectors(next);
                  updateFilters({ subSectors: next.length > 0 ? next : undefined });
                }}
                onSelectAllSectors={() => {
                  if (selectedSectors.length === subscriptionSectors.length) {
                    setSelectedSectors([]);
                    setSelectedSubSectors([]);
                    updateFilters({ sectors: undefined, subSectors: undefined });
                  } else {
                    setSelectedSectors(subscriptionSectors);
                    updateFilters({ sectors: subscriptionSectors });
                  }
                }}
                onSelectAllSubSectors={() => undefined}
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
                {t('tenders.filters.country') || 'Countries'} ({selectedCountries.length})
              </Button>
            </div>

            <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${showRegionFilters ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <RegionCountryFilter
                selectedRegions={selectedRegions.map(r => ({ name: r } as any))}
                selectedCountries={selectedCountries}
                allowedCountries={subscriptionCountries}
                onSelectRegion={(region) => {
                  const regionName = region.name as unknown as RegionEnum;
                  const isSelected = selectedRegions.includes(regionName);
                  const next = isSelected
                    ? selectedRegions.filter(r => r !== regionName)
                    : [...selectedRegions, regionName];
                  setSelectedRegions(next);
                  updateFilters({ regions: next.length > 0 ? next : undefined } as any);
                }}
                onSelectCountry={(country) => {
                  const isSelected = selectedCountries.some(s => s.id === country.id);
                  const next = isSelected
                    ? selectedCountries.filter((item) => item.id !== country.id)
                    : [...selectedCountries, country];
                  setSelectedCountries(next);
                  updateFilters({ countries: next.length > 0 ? next : undefined });
                }}
                t={t}
              />
            </div>
          </>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4 border-b border-gray-200">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === 'results' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-primary'}`}
            onClick={() => setActiveTab('results')}
          >
            Search Results
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-primary'}`}
            onClick={() => setActiveTab('history')}
          >
            History
            {Object.values(partnerStates).filter((s) => (s.engagements?.length ?? 0) > 0).length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs">
                {Object.values(partnerStates).filter((s) => (s.engagements?.length ?? 0) > 0).length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'history' && (
          <CollaborationHistoryPanel
            organizations={historyOrganizations}
            partnerStates={partnerStates}
            compatibilityByOrg={compatibilityByOrg}
            expandedHistory={expandedHistory}
            setExpandedHistory={setExpandedHistory}
            removeLastEngagement={removeLastEngagement}
            clearEngagements={clearEngagements}
          />
        )}

        {false && (
          <div className="space-y-4 mb-6">
            {organizations.data.filter((org) => (partnerStates[org.id]?.engagements?.length ?? 0) > 0).length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-primary mb-1">No history yet</h3>
                <p className="text-sm text-muted-foreground">Mark organisations you have worked with to track them here.</p>
              </div>
            ) : (
              organizations.data
                .filter((org) => (partnerStates[org.id]?.engagements?.length ?? 0) > 0)
                .map((org) => (
                  <div key={org.id} className="bg-white rounded-lg border p-5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary">{org.name}{org.acronym && <span className="text-sm text-muted-foreground ml-2">({org.acronym})</span>}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{org.city}, {org.country}</p>
                        {(partnerStates[org.id]?.engagements?.length ?? 0) > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {partnerStates[org.id].engagements!.length} engagement{partnerStates[org.id].engagements!.length > 1 ? 's' : ''} — last: {format(new Date(partnerStates[org.id].engagements!.at(-1)!), 'yyyy-MM-dd')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        onClick={() => removeLastEngagement(org.id)}
                      >
                        Undo last
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0 text-destructive hover:text-destructive"
                        onClick={() => clearEngagements(org.id)}
                      >
                        Clear all
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {activeTab === 'results' && (<>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * organizations.meta.pageSize + 1)}-{Math.min(currentPage * organizations.meta.pageSize, organizations.meta.totalItems)} of {organizations.meta.totalItems}
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">{t('common.sort')}:</label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t('organizations.sort.newest')}</SelectItem>
                  <SelectItem value="oldest">{t('organizations.sort.oldest')}</SelectItem>
                  <SelectItem value="name">{t('organizations.sort.name')}</SelectItem>
                  <SelectItem value="partnerships">{t('organizations.sort.partnerships')}</SelectItem>
                  <SelectItem value="projects">{t('organizations.sort.projects')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {organizations.data.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 mb-6">
              {organizations.data.map((org) => (
                <div key={org.id} className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0"><Building2 className="w-6 h-6 text-blue-500" /></div>
                      <div>
                        <h3 className="font-semibold text-primary mb-1">{org.name}{org.acronym && <span className="text-sm text-muted-foreground ml-2">({org.acronym})</span>}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{org.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                        {compatibilityByOrg[org.id] || 72}% compatibility
                      </Badge>
                      {shouldShowBookmarkButton && (
                        <Button
                          variant={isBookmarked(org.id) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleBookmark(org.id)}
                          aria-label="Add to Partners"
                          className="min-h-9"
                        >
                          <Plus className="w-4 h-4 mr-1.5" />
                          {isBookmarked(org.id) ? 'Partner added' : 'Add to Partners'}
                        </Button>
                      )}
                      {org.verificationStatus === 'VERIFIED' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t('organizations.status.VERIFIED')}
                        </Badge>
                      )}
                      {org.verificationStatus === 'ACTIVE' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t('organizations.status.ACTIVE')}
                        </Badge>
                      )}
                      {org.verificationStatus === 'INACTIVE' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t('organizations.status.INACTIVE')}
                        </Badge>
                      )}
                      {org.verificationStatus === 'PENDING' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t('organizations.status.PENDING')}
                        </Badge>
                      )}
                      {org.verificationStatus === 'NOTVERIFIED' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t('organizations.status.NOTVERIFIED')}
                        </Badge>
                      )}
                    </div>

                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Target className="w-4 h-4" />{t(`organizations.type.${org.type}`)}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{org.city?.name || ''}{org.city?.name && org.country?.name ? ', ' : ''}{org.country?.name || ''}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{org.activeProjects || 0} {t('organizations.details.projects')}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {(org.sectors || []).slice(0, 3).map((sector, index) => (
                      <Badge key={`${org.id}-sector-${index}`} variant="secondary">{sector?.name || t(`sectors.${sector?.code}`)}</Badge>
                    ))}
                    {(org.sectors || []).length > 3 && <Badge variant="outline">+{(org.sectors || []).length - 3}</Badge>}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                      onClick={() => logEngagement(org.id)}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                      Worked with this organisation
                    </Button>
                    {(partnerStates[org.id]?.engagements?.length ?? 0) > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-600 text-white text-xs font-semibold">
                        {partnerStates[org.id].engagements!.length}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground"><Globe className="w-4 h-4" />{t(`organizations.region.${org.region}`)}</span>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="default" size="sm" onClick={() => navigate(`/search/organizations/${org.id}`)}>{t('actions.viewDetails')}</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-primary mb-1">{t('organizations.list.noResults')}</h3>
              <p className="text-sm text-muted-foreground">{t('organizations.list.noResults.message')}</p>
            </div>
          )}

          {organizations.meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={!organizations.meta.hasPreviousPage}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t('pagination.previous')}
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, organizations.meta.totalPages) }, (_, index) => {
                  const pageNum = index + 1;
                  return (
                    <Button key={pageNum} variant={currentPage === pageNum ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(pageNum)}>
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={!organizations.meta.hasNextPage}>
                {t('pagination.next')}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </>)}
      </div>

      <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Load Search</DialogTitle>
            <DialogDescription>Choose a saved search for organisations.</DialogDescription>
          </DialogHeader>
          {savedSearches.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved searches found for this page.</p>
          ) : (
            <div className="max-h-80 overflow-auto space-y-2">
              {savedSearches.map(entry => (
                <div key={entry.id} className="rounded-md border border-gray-200 p-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-primary">{entry.label}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(entry.createdAt), 'yyyy-MM-dd HH:mm')}</p>
                      <div className="mt-1">
                        <SavedSearchProfileBadge profileName={entry.organizationProfileName} profileEmail={entry.organizationProfileEmail} />
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          applySavedSearch(entry.payload);
                          setIsLoadDialogOpen(false);
                          toast.success('Search loaded');
                        }}
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsLoadDialogOpen(false);
                          openEditSavedSearch(entry);
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteSavedSearch(entry.id)}>Delete</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <SavedSearchEditorDialog
        open={isSaveSearchDialogOpen}
        mode={editingSavedSearch ? 'edit' : 'create'}
        searchType="organisations"
        initialName={editingSavedSearch?.label || searchQuery.trim() || 'Saved organisations search'}
        reviewItems={buildReviewItemsFromPayload(editingSavedSearch?.payload || buildPayload())}
        initialAlertSettings={getAlertSettingsForEntry(editingSavedSearch)}
        onOpenChange={(open) => {
          setIsSaveSearchDialogOpen(open);
          if (!open) setEditingSavedSearch(null);
        }}
        onSave={saveSearch}
      />

    </div >
  );
}
