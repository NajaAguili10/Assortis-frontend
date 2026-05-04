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
import { Textarea } from '@app/components/ui/textarea';
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
import { ExpertDTO, useExperts } from '@app/modules/expert/hooks/useExperts';
import { generateCV } from '@app/modules/expert/services/cvGenerator.service';
import type { ExpertProfile } from '@app/modules/expert/services/expertsData.service';
import { ExpertStatusEnum, type WritingContribution, type WritingLanguage, type WritingMethodology } from '@app/modules/expert/types/expert.dto';
import { SECTOR_SUBSECTOR_MAP } from '@app/config/subsectors.config';
import { SectorEnum, SubSectorEnum, RegionEnum, CountryEnum, REGION_COUNTRY_MAP } from '@app/types/tender.dto';
import { Search, MapPin, Star, Briefcase, CheckCircle, UserCheck, Clock, TrendingUp, X, Filter, ChevronDown, UserCircle, Plus, Download, Trash2, Sparkles } from 'lucide-react';
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
  selectedWritingMethodologies?: WritingMethodology[];
  selectedWritingContributions?: WritingContribution[];
  selectedWritingLanguages?: WritingLanguage[];
  comfortableToWriteOnQuery?: string;
  donorProcurementQuery?: string;
  writingCommentsQuery?: string;
}

interface SavedSearchEntry<TPayload> {
  id: string;
  label: string;
  createdAt: string;
  payload: TPayload;
}

interface AiExpertMatch {
  id: string;
  name: string;
  title: string;
  compatibility: number;
}

const WRITING_METHODOLOGY_OPTIONS: WritingMethodology[] = ['TA', 'FWC', 'Grants'];
const WRITING_CONTRIBUTION_OPTIONS: WritingContribution[] = [
  "Reviewing others' contributions",
  'Contributing with technical inputs',
  'Writing methodologies in full',
  'Proofreading and editing',
];
const WRITING_LANGUAGE_OPTIONS: WritingLanguage[] = ['English', 'French', 'Spanish', 'Portuguese', 'German'];

const isBidWriter = (expert: any) => {
  const title = expert.title || expert.currentPosition || '';
  const bio = expert.bio || expert.profileSummary || '';
  const skills = (expert.skills || []).map((s: any) => typeof s === 'object' ? s.skillName : s).join(' ');
  const haystack = `${title} ${bio} ${skills}`.toLowerCase();
  return /bid|proposal|tender|writer/.test(haystack);
};

export default function SearchExpertsTabContent({ mode }: SearchExpertsTabContentProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { allExperts } = useExperts();
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
  const [showFilters, setShowFilters] = useState(mode === 'experts');
  const [showSectorFilters, setShowSectorFilters] = useState(false);
  const [showRegionFilters, setShowRegionFilters] = useState(false);
  const [showWritingFilters, setShowWritingFilters] = useState(mode === 'bid-writers');
  const [selectedWritingMethodologies, setSelectedWritingMethodologies] = useState<WritingMethodology[]>([]);
  const [selectedWritingContributions, setSelectedWritingContributions] = useState<WritingContribution[]>([]);
  const [selectedWritingLanguages, setSelectedWritingLanguages] = useState<WritingLanguage[]>([]);
  const [comfortableToWriteOnQuery, setComfortableToWriteOnQuery] = useState('');
  const [donorProcurementQuery, setDonorProcurementQuery] = useState('');
  const [writingCommentsQuery, setWritingCommentsQuery] = useState('');
  const [pendingUnlockExpert, setPendingUnlockExpert] = useState<PendingUnlockExpert | null>(null);
  const [savedSearches, setSavedSearches] = useState<SavedSearchEntry<ExpertsSavedPayload>[]>([]);
  const [hasSearched, setHasSearched] = useState(true);
  const [showSavedSearchesPanel, setShowSavedSearchesPanel] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [editingSearchId, setEditingSearchId] = useState<string | null>(null);
  const [editingSearchName, setEditingSearchName] = useState('');
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiDescription, setAiDescription] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiMatches, setAiMatches] = useState<AiExpertMatch[]>([]);

  const storageKey = `search.tab.saved.${mode}`;
  const aiResultsStorageKey = 'search.experts.aiMatching.lastResult';

  const filteredExperts = useMemo(() => {
    let filtered = [...allExperts];

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
        const cityStr = typeof expert.city === 'object' ? expert.city?.name : expert.city;
        const countryStr = typeof expert.country === 'object' ? expert.country?.name : expert.country;
        const location = `${cityStr} ${countryStr}`.toLowerCase();
        return (
          fullName.includes(query) ||
          expert.title?.toLowerCase().includes(query) ||
          location.includes(query) ||
          expert.bio?.toLowerCase().includes(query) ||
          expert.skills?.some((skill) => {
            const skillName = typeof skill === 'object' ? (skill as any).skillName : skill;
            return skillName?.toLowerCase().includes(query);
          }) ||
          expert.sectors?.some((sector) => {
            const sectorName = typeof sector === 'object' ? (sector as any).sectorName || (sector as any).sectorCode : sector;
            return sectorName?.toLowerCase().includes(query);
          })
        );
      });
    }

    if (selectedSectors.length > 0) {
      filtered = filtered.filter((expert) =>
        expert.sectors?.some((sector) => {
          const sectorCode = typeof sector === 'object' ? (sector as any).sectorCode : sector;
          return selectedSectors.map(String).includes(String(sectorCode));
        })
      );
    }

    if (selectedSubSectors.length > 0) {
      filtered = filtered.filter((expert) =>
        expert.sectors?.some((sector) => {
          const sectorCode = typeof sector === 'object' ? (sector as any).sectorCode : sector;
          return selectedSubSectors.map(String).includes(String(sectorCode));
        })
      );
    }

    if (selectedRegions.length > 0) {
      filtered = filtered.filter((expert) => {
        const countryCode = typeof expert.country === 'object' ? expert.country?.code : expert.country;
        // Map country to region if needed, for now just checking if country code exists in any selected region's country map
        return selectedRegions.some(region => REGION_COUNTRY_MAP[region]?.includes(countryCode as CountryEnum));
      });
    }

    if (selectedCountries.length > 0) {
      filtered = filtered.filter((expert) => {
        const countryCode = typeof expert.country === 'object' ? expert.country?.code : expert.country;
        return selectedCountries.map(String).includes(String(countryCode));
      });
    }

    if (selectedExperience.length > 0) {
      filtered = filtered.filter((expert) => {
        const years = expert.yearsExperience;
        return selectedExperience.some((range) => {
          if (range === '0-5') return years <= 5;
          if (range === '5-10') return years > 5 && years <= 10;
          if (range === '10-15') return years > 10 && years <= 15;
          if (range === '15+') return years > 15;
          return true;
        });
      });
    }

    if (mode === 'bid-writers') {
      const normalize = (value: string | undefined) => (value || '').toLowerCase();
      const matchesText = (haystack: string, needle: string) => normalize(haystack).includes(normalize(needle.trim()));

      filtered = filtered.filter((expert) => {
        const writing = expert.writingExperience;
        if (!writing) return false;

        if (
          selectedWritingMethodologies.length > 0 &&
          !writing.writingMethodologies.some((item) => selectedWritingMethodologies.includes(item))
        ) {
          return false;
        }

        if (
          selectedWritingContributions.length > 0 &&
          !writing.writingContributions.some((item) => selectedWritingContributions.includes(item))
        ) {
          return false;
        }

        if (
          selectedWritingLanguages.length > 0 &&
          !writing.writingLanguages.some((item) => selectedWritingLanguages.includes(item))
        ) {
          return false;
        }

        const rowText = writing.writingExperienceRows
          .map((row) =>
            [
              row.titleOfTenderProject,
              row.donor,
              row.country,
              row.year,
              row.indicativePagesWritten,
              row.result,
              row.referencePersonProjectManager,
              row.additionalInformation,
            ].join(' ')
          )
          .join(' ');

        if (comfortableToWriteOnQuery.trim() && !matchesText(`${writing.comfortableToWriteOn} ${rowText}`, comfortableToWriteOnQuery)) {
          return false;
        }

        if (donorProcurementQuery.trim() && !matchesText(`${writing.donorProcurementExperience} ${rowText}`, donorProcurementQuery)) {
          return false;
        }

        if (writingCommentsQuery.trim() && !matchesText(`${writing.writingComments} ${rowText}`, writingCommentsQuery)) {
          return false;
        }

        return true;
      });
    }

    return filtered;
  }, [
    comfortableToWriteOnQuery,
    donorProcurementQuery,
   allExperts,
    libraryExpertIds,
    mode,
    searchQuery,
    selectedCountries,
    selectedExperience,
    selectedRegions,
    selectedSectors,
    selectedSubSectors,
    selectedWritingContributions,
    selectedWritingLanguages,
    selectedWritingMethodologies,
    sourceFilter,
    writingCommentsQuery,
  ]);

  useEffect(() => {
    const q = (searchParams.get('q') || '').trim();
    if (!q) return;
    setSearchQuery(q);
    setHasSearched(true);
  }, [searchParams]);

  useEffect(() => {
    setSavedSearches(readSavedSearches());

    try {
      const storedAiMatches = JSON.parse(localStorage.getItem(aiResultsStorageKey) || '[]');
      setAiMatches(Array.isArray(storedAiMatches) ? storedAiMatches : []);
    } catch {
      setAiMatches([]);
    }
  }, [aiResultsStorageKey]);

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

  const writingTextFilterCount = [comfortableToWriteOnQuery, donorProcurementQuery, writingCommentsQuery].filter((value) => value.trim()).length;
  const bidWriterFiltersCount =
    mode === 'bid-writers'
      ? selectedWritingMethodologies.length + selectedWritingContributions.length + selectedWritingLanguages.length + writingTextFilterCount
      : 0;
  const activeFiltersCount = selectedSectors.length + selectedSubSectors.length + selectedRegions.length + selectedCountries.length + selectedExperience.length + (sourceFilter === 'all' ? 0 : 1) + bidWriterFiltersCount;

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedSectors([]);
    setSelectedSubSectors([]);
    setSelectedRegions([]);
    setSelectedCountries([]);
    setSelectedExperience([]);
    setSourceFilter('all');
    setSelectedWritingMethodologies([]);
    setSelectedWritingContributions([]);
    setSelectedWritingLanguages([]);
    setComfortableToWriteOnQuery('');
    setDonorProcurementQuery('');
    setWritingCommentsQuery('');
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
    setSelectedWritingMethodologies(payload.selectedWritingMethodologies || []);
    setSelectedWritingContributions(payload.selectedWritingContributions || []);
    setSelectedWritingLanguages(payload.selectedWritingLanguages || []);
    setComfortableToWriteOnQuery(payload.comfortableToWriteOnQuery || '');
    setDonorProcurementQuery(payload.donorProcurementQuery || '');
    setWritingCommentsQuery(payload.writingCommentsQuery || '');
    setHasSearched(true);
  };

  const saveSearch = () => {
    const label = saveSearchName.trim();
    if (!label) {
      toast.error('Enter a search name');
      return;
    }

    const existing = readSavedSearches();
    const now = new Date();
    const entry: SavedSearchEntry<ExpertsSavedPayload> = {
      id: `saved-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
      label,
      createdAt: now.toISOString(),
      payload: {
        searchQuery,
        selectedSectors,
        selectedSubSectors,
        selectedRegions,
        selectedCountries,
        selectedExperience,
        sourceFilter,
        selectedWritingMethodologies,
        selectedWritingContributions,
        selectedWritingLanguages,
        comfortableToWriteOnQuery,
        donorProcurementQuery,
        writingCommentsQuery,
      },
    };

    const next = [entry, ...existing];
    localStorage.setItem(storageKey, JSON.stringify(next));
    setSavedSearches(next);
    setSaveSearchName('');
    toast.success('Search saved');
  };

  const handleRunSearch = () => {
    setHasSearched(true);
    setShowSavedSearchesPanel(true);
  };

  const updateSavedSearch = (entry: SavedSearchEntry<ExpertsSavedPayload>) => {
    const nextLabel = editingSearchName.trim();
    if (!nextLabel) {
      toast.error('Enter a search name');
      return;
    }
    const next = readSavedSearches().map((item) =>
      item.id === entry.id
        ? {
          ...item,
          label: nextLabel,
        }
        : item
    );
    localStorage.setItem(storageKey, JSON.stringify(next));
    setSavedSearches(next);
    setEditingSearchId(null);
    setEditingSearchName('');
    toast.success('Saved search updated');
  };

  const deleteSavedSearch = (id: string) => {
    const next = readSavedSearches().filter((entry) => entry.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(next));
    setSavedSearches(next);
  };

  const isExpertInLibrary = (expert: (typeof allExperts)[number]) =>
    expert.organizationId === 'org-1' || libraryExpertIds.includes(expert.id);

  const isExpertBlocked = (expert: (typeof allExperts)[number]) =>
    expert.verificationStatus === ExpertStatusEnum.SUSPENDED;

  const canDownloadExpertCv = (expert: (typeof allExperts)[number]) =>
    isExpertInLibrary(expert) && !isExpertBlocked(expert);

  const mapExpertToCvProfile = (expert: (typeof allExperts)[number]): ExpertProfile => {
    // Standardize the expert object to the backend DTO structure
    const e = expert as ExpertDTO;

    return {
      id: String(e.id),
      profilePhoto: null,
      cvFile: null,
      firstName: e.firstName || e.fullName?.split(' ')[0] || 'Expert',
      lastName: e.lastName || e.fullName?.split(' ').slice(1).join(' ') || String(e.id),
      email: e.email || `expert-${e.id}@assortis.local`,
      phone: e.phone || '',
      location: [e.city?.name, e.country?.name].filter(Boolean).join(', '),
      bio: e.profileSummary || 'Profile summary generated from the expert search profile.',
      title: e.title || e.currentPosition || 'Expert',
      level: String(e.level || 'EXPERT'),
      yearsExperience: `${e.yearsExperience || 0} years`,
      sectors: (e.sectors || []).map(s => s.sectorName || s.sectorCode),
      subsectors: [],
      skills: (e.skills || []).map(s => s.skillName),
      availability: String(e.availabilityStatus || ''),
      availableFrom: '',
      dailyRate: e.dailyRate ? `${e.dailyRate}` : '',
      currency: e.currency || 'EUR',
      experiences: (e.experiences || []).map((item, index) => ({
        id: String(item.id || `exp-${e.id}-${index}`),
        title: item.title || 'Expert Assignment',
        company: item.organization || 'Assortis Project',
        location: [item.city, item.country].filter(Boolean).join(', ') || [e.city?.name, e.country?.name].filter(Boolean).join(', '),
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        current: Boolean(item.isCurrent),
        description: item.description || '',
      })),
      education: (e.educations || []).map((item, index) => ({
        id: String(item.id || `edu-${e.id}-${index}`),
        degree: item.degree || 'Professional Training',
        institution: item.institution || 'Not specified',
        field: item.fieldOfStudy || '',
        year: String(item.graduationYear || ''),
      })),
      languages: (e.languages || []).map((item, index) => ({
        id: `lang-${e.id}-${index}`,
        name: item.languageName || item.languageCode,
        level: item.proficiency,
      })),
      certifications: (e.certifications || []).map((item, index) => ({
        id: String(item.id || `cert-${e.id}-${index}`),
        name: item.name || 'Certification',
        issuer: item.issuingOrganization || item.issuerName || 'Not specified',
        date: item.issueDate || '',
        expiryDate: item.expiryDate || '',
      })),
      rating: e.ratingAvg,
      completedProjects: e.completedProjects,
      createdAt: e.lastActiveAt || new Date().toISOString(),
    };
  };

  const downloadExpertCV = (expert: (typeof allExperts)[number], formatType: 'pdf' | 'word') => {
    if (isExpertBlocked(expert)) {
      toast.error('This expert profile is currently unavailable');
      return;
    }

    if (!isExpertInLibrary(expert)) {
      toast.error('Unlock this CV before downloading it');
      return;
    }

    generateCV(mapExpertToCvProfile(expert), 'standard', formatType);
  };

  const handleAiMatching = async () => {
    if (!aiFile) {
      toast.error('Upload a file before running AI matching');
      return;
    }

    setIsAiProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const shuffled = [...allExperts]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .map((expert) => ({
        id: expert.id,
        name: `${expert.firstName} ${expert.lastName}`,
        title: expert.title || 'Expert',
        compatibility: 60 + Math.floor(Math.random() * 39),
      }));
    localStorage.setItem(aiResultsStorageKey, JSON.stringify(shuffled));
    setAiMatches(shuffled);
    setIsAiProcessing(false);
    setIsAiDialogOpen(false);
    toast.success('Expert matching simulated');
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
          <Button variant="default" size="sm" onClick={handleRunSearch}>Search</Button>
          <Button variant="outline" size="sm" onClick={() => setShowSavedSearchesPanel((prev) => !prev)}>
            Saved Experts Searches
          </Button>
          {mode === 'experts' && (
            <Button variant="outline" size="sm" onClick={() => setIsAiDialogOpen(true)}>
              <Sparkles className="mr-1.5 h-4 w-4" />
              Expert Matching (AI)
            </Button>
          )}
        </div>

        {showFilters && (
          <>
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 mb-2 block">{t('common.search')}</label>
              <div className="flex gap-2">
                <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={t('experts.filters.search')} className="flex-1" />
                <Button type="button" size="icon" onClick={handleRunSearch}>
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

            {mode === 'bid-writers' && (
              <div className="mt-5 rounded-lg border border-gray-200 bg-slate-50/40">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  onClick={() => setShowWritingFilters((prev) => !prev)}
                >
                  <span>
                    <span className="block text-sm font-semibold text-primary">Writing Experience</span>
                    <span className="block text-xs text-muted-foreground">Filter bid writers by proposal-writing methodology, contribution, language and donor experience.</span>
                  </span>
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${showWritingFilters ? 'rotate-180' : ''}`} />
                </button>

                {showWritingFilters && (
                  <div className="space-y-5 border-t border-gray-200 p-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Methodologies</Label>
                      <div className="flex flex-wrap gap-2">
                        {WRITING_METHODOLOGY_OPTIONS.map((option) => {
                          const selected = selectedWritingMethodologies.includes(option);
                          return (
                            <Button
                              key={option}
                              type="button"
                              size="sm"
                              variant={selected ? 'default' : 'outline'}
                              onClick={() =>
                                setSelectedWritingMethodologies((previous) =>
                                  selected ? previous.filter((item) => item !== option) : [...previous, option]
                                )
                              }
                            >
                              {selected && <CheckCircle className="mr-1.5 h-3.5 w-3.5" />}
                              {option}
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Contribution</Label>
                      <div className="flex flex-wrap gap-2">
                        {WRITING_CONTRIBUTION_OPTIONS.map((option) => {
                          const selected = selectedWritingContributions.includes(option);
                          return (
                            <Button
                              key={option}
                              type="button"
                              size="sm"
                              variant={selected ? 'default' : 'outline'}
                              onClick={() =>
                                setSelectedWritingContributions((previous) =>
                                  selected ? previous.filter((item) => item !== option) : [...previous, option]
                                )
                              }
                            >
                              {selected && <CheckCircle className="mr-1.5 h-3.5 w-3.5" />}
                              {option}
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Languages</Label>
                      <div className="flex flex-wrap gap-2">
                        {WRITING_LANGUAGE_OPTIONS.map((option) => {
                          const selected = selectedWritingLanguages.includes(option);
                          return (
                            <Button
                              key={option}
                              type="button"
                              size="sm"
                              variant={selected ? 'default' : 'outline'}
                              onClick={() =>
                                setSelectedWritingLanguages((previous) =>
                                  selected ? previous.filter((item) => item !== option) : [...previous, option]
                                )
                              }
                            >
                              {selected && <CheckCircle className="mr-1.5 h-3.5 w-3.5" />}
                              {option}
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="bid-writer-comfortable">Expert is comfortable to write on</Label>
                        <Input
                          id="bid-writer-comfortable"
                          value={comfortableToWriteOnQuery}
                          onChange={(event) => setComfortableToWriteOnQuery(event.target.value)}
                          placeholder="e.g. governance, health, infrastructure"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bid-writer-donors">Experience with donors procurement procedures</Label>
                        <Input
                          id="bid-writer-donors"
                          value={donorProcurementQuery}
                          onChange={(event) => setDonorProcurementQuery(event.target.value)}
                          placeholder="e.g. EU PRAG, World Bank, USAID"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bid-writer-comments">Writing experience: comments by experts</Label>
                        <Input
                          id="bid-writer-comments"
                          value={writingCommentsQuery}
                          onChange={(event) => setWritingCommentsQuery(event.target.value)}
                          placeholder="e.g. compliance, editing, win theme"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {mode === 'experts' && (
        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-white to-violet-50/60 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-semibold text-violet-700">
                <Sparkles className="h-3.5 w-3.5" />
                Tailored Expert Research
              </div>
              <h3 className="mt-3 text-lg font-semibold text-primary">Find experts tailored to your organisation</h3>
              <p className="mt-1 text-sm text-muted-foreground">Upload a brief or ToR and simulate expert matching without sending data to a backend.</p>
            </div>
            <Button variant="outline" className="min-h-11" onClick={() => setIsAiDialogOpen(true)}>
              <Sparkles className="mr-1.5 h-4 w-4" />
              Expert Matching (AI)
            </Button>
          </div>
        </div>
      )}

      {mode === 'experts' && (
        <div className={`${showSavedSearchesPanel ? 'block' : 'hidden'} rounded-lg border border-gray-200 bg-white p-4`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-primary">Saved Experts Searches</h3>
              <p className="text-xs text-muted-foreground">Save, load, rename, or delete expert searches stored in this browser.</p>
            </div>
          </div>

          {hasSearched && (
            <div className="mt-4 rounded-md border border-blue-100 bg-blue-50/50 p-3">
              <label className="text-xs font-semibold text-blue-800" htmlFor="expert-search-name">Save this Search</label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <Input
                  id="expert-search-name"
                  value={saveSearchName}
                  onChange={(event) => setSaveSearchName(event.target.value)}
                  placeholder="Search name"
                />
                <Button onClick={saveSearch}>Confirm Save</Button>
              </div>
            </div>
          )}

          <div className="mt-3 space-y-2">
            {savedSearches.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved expert searches yet.</p>
            ) : (
              savedSearches.map((entry) => (
                <div key={entry.id} className="rounded-md border border-gray-100 p-3">
                  {editingSearchId === entry.id ? (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input value={editingSearchName} onChange={(event) => setEditingSearchName(event.target.value)} />
                      <Button size="sm" onClick={() => updateSavedSearch(entry)}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingSearchId(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-primary">{entry.label}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(entry.createdAt), 'yyyy-MM-dd HH:mm')}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => applySavedSearch(entry.payload)}>Load</Button>
                        <Button size="sm" variant="outline" onClick={() => { setEditingSearchId(entry.id); setEditingSearchName(entry.label); }}>Edit</Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteSavedSearch(entry.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {aiMatches.length > 0 && (
            <div className="mt-4 rounded-lg border border-violet-100 bg-violet-50/50 p-4">
              <h3 className="text-sm font-semibold text-primary">Last simulated AI match</h3>
              <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {aiMatches.map((match) => (
                  <div key={match.id} className="rounded-md bg-white p-3">
                    <p className="text-sm font-medium text-primary">{match.name}</p>
                    <p className="text-xs text-muted-foreground">{match.title}</p>
                    <Badge className="mt-2">{match.compatibility}% compatibility</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'experts' && !hasSearched ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <Search className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-primary">Run a search to view expert results</h3>
          <p className="mt-1 text-sm text-muted-foreground">Filters are expanded by default. Results stay hidden until you search.</p>
        </div>
      ) : (
        <>
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-primary">{filteredExperts.length} {t('experts.list.expertsFound')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperts.map((expert) => (
              <div
                key={expert.id}
                className={`rounded-lg border p-6 hover:shadow-md transition-shadow cursor-pointer ${(expert.organizationId === 'org-1' || libraryExpertIds.includes(expert.id))
                  ? 'bg-emerald-50/30 border-emerald-200'
                  : 'bg-white border-accent/35'
                  }`}
                onClick={() => navigate(`/search/experts/${expert.id}`)}
              >
                {(() => {
                  const isInLibrary = isExpertInLibrary(expert);
                  const isBlocked = isExpertBlocked(expert);
                  const isNewExpert = !isInLibrary;
                  const canDownload = canDownloadExpertCv(expert);

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
                          <h4 className="font-semibold text-gray-900 truncate">{`${expert.firstName} ${expert.lastName}`}</h4>
                          <p className="text-sm text-gray-600 truncate">{expert.title}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-gray-500 truncate">
                              {typeof expert.city === 'object' && expert.city !== null ? (expert.city as any).name : (expert.city || '')}, {typeof expert.country === 'object' && expert.country !== null ? (expert.country as any).name : (expert.country || '')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1"><Briefcase className="w-4 h-4 text-primary" /><span className="text-xs text-gray-600">{t('experts.yearsExp')}</span></div>
                          <p className="text-lg font-semibold text-primary">{expert.yearsExperience || 0}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1"><Star className="w-4 h-4 text-yellow-500" /><span className="text-xs text-gray-600">{t('experts.rating')}</span></div>
                          <p className="text-lg font-semibold text-primary">{expert.ratingAvg?.toFixed(1) || '0.0'}</p>
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
                        <Badge variant="outline" className="text-xs"><Clock className="w-3 h-3 mr-1" />{t(`experts.availability.${expert.availabilityStatus}`)}</Badge>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs text-gray-600 mb-2">{t('experts.skills')}:</p>
                        <div className="flex flex-wrap gap-1">
                          {expert.skills && expert.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={`${expert.id}-skill-${index}-${skill}`} variant="outline" className="text-xs">{skill.skillName}</Badge>
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
                          <p className="text-sm font-semibold text-primary">{expert.skills.length || 0}%</p>
                        </div>
                      </div>

                      <Button
                        variant={isNewExpert ? 'default' : 'outline'}
                        size="sm"
                        className="w-full min-h-11"
                        disabled={isBlocked}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (isBlocked) {
                            return;
                          }
                          if (isNewExpert) {
                            handleOpenUnlockConfirmation(expert.id, `${expert.firstName} ${expert.lastName}`);
                            return;
                          }
                          navigate(`/search/experts/${expert.id}`);
                        }}
                      >
                        {isBlocked
                          ? 'Profile unavailable'
                          : isNewExpert
                            ? t('experts.credits.cta.accessCv')
                            : t('experts.credits.cta.viewProfile')}
                      </Button>
                      {canDownload && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              downloadExpertCV(expert, 'pdf');
                            }}
                          >
                            <Download className="mr-1.5 h-4 w-4" />
                            PDF
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              downloadExpertCV(expert, 'word');
                            }}
                          >
                            <Download className="mr-1.5 h-4 w-4" />
                            Word
                          </Button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            ))}
          </div>
        </>
      )}

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

      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Expert Matching (AI)</DialogTitle>
            <DialogDescription>Simulates an OpenAI matching request locally. No file leaves the browser.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ai-match-file">File upload</Label>
              <Input id="ai-match-file" type="file" onChange={(event) => setAiFile(event.target.files?.[0] || null)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-match-description">Optional description</Label>
              <Textarea
                id="ai-match-description"
                value={aiDescription}
                onChange={(event) => setAiDescription(event.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAiDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAiMatching} disabled={isAiProcessing || !aiFile}>
              {isAiProcessing ? 'Processing...' : 'Run matching'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {(mode !== 'experts' || hasSearched) && filteredExperts.length === 0 && (
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