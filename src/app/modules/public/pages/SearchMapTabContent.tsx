import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CircleMarker, MapContainer, TileLayer, Tooltip as LeafletTooltip } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useCVCredits } from '@app/contexts/CVCreditsContext';
import { useAuth } from '@app/contexts/AuthContext';
import { useProjects } from '@app/hooks/useProjects';
import { useExperts } from '@app/modules/expert/hooks/useExperts';
import { COUNTRIES } from '@app/config/countries.config';
import { CountryEnum, REGION_COUNTRY_MAP, SectorEnum, SECTOR_SUBSECTOR_MAP, SubSectorEnum } from '@app/types/tender.dto';
import { getLocalizedCountryName } from '@app/utils/country-translator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card';
import { Badge } from '@app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@app/components/ui/dialog';
import { Button } from '@app/components/ui/button';
import { SaveSearchDialog } from '@app/components/SaveSearchDialog';
import { Label } from '@app/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@app/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import { Coins, Globe, MapPin, UserRound, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { savedSearchService } from '@app/services/savedSearchService';

type MarkerType = 'all' | 'projects' | 'experts' | 'locked-experts';
type MarkerTypeExtended = MarkerType | 'unlocked-experts';

type SearchLanguage = 'en' | 'fr' | 'es';

interface MapMarker {
  id: string;
  type: 'projects' | 'experts';
  name: string;
  country: string;
  countryCode: string | null;
  region: string;
  position: LatLngTuple;
  isLocked: boolean;
  tooltipLabel: string;
  route: string;
  sectorKeys: string[];
  subSectorKeys: string[];
}

interface PendingUnlockExpert {
  id: string;
  name: string;
  route: string;
}

interface PendingInvitationExpert {
  id: string;
  name: string;
  country: string;
  sectors: string[];
}

interface MapSavedPayload {
  selectedType: MarkerTypeExtended;
  selectedCountries: CountryEnum[];
  selectedSectors: SectorEnum[];
  selectedSubSectors: SubSectorEnum[];
}

const COUNTRY_COORDINATES: Record<string, LatLngTuple> = {
  GB: [54.0, -2.0],
  EG: [26.8, 30.8],
  ES: [40.3, -3.7],
  FR: [46.2, 2.2],
  SN: [14.5, -14.4],
  KE: [-0.02, 37.9],
  US: [39.8, -98.6],
  CO: [4.6, -74.1],
  CA: [56.1, -106.3],
  MA: [31.7, -7.1],
  TN: [34.0, 9.0],
  NG: [9.0, 8.7],
  GH: [7.9, -1.0],
  ZA: [-30.6, 22.9],
  IN: [20.6, 78.9],
  BR: [-14.2, -51.9],
  DE: [51.2, 10.5],
  IT: [41.9, 12.6],
  NL: [52.1, 5.3],
  BE: [50.8, 4.5],
};

const REGION_COORDINATES: Record<string, LatLngTuple> = {
  AFRICA_WEST: [14.0, -4.5],
  AFRICA_EAST: [1.5, 37.8],
  AFRICA_CENTRAL: [0.5, 20.0],
  AFRICA_NORTH: [28.0, 12.0],
  AFRICA_SOUTHERN: [-23.0, 24.0],
  ASIA_PACIFIC: [20.0, 105.0],
  EUROPE: [51.0, 11.0],
  MIDDLE_EAST: [29.0, 45.0],
  NORTH_AMERICA: [45.0, -100.0],
  SOUTH_AMERICA: [-15.0, -60.0],
  CARIBBEAN: [18.0, -75.0],
  OCEANIA: [-24.0, 134.0],
};

const COUNTRY_NAME_TO_CODE = COUNTRIES.reduce<Record<string, string>>((acc, country) => {
  const names = [country.name.en, country.name.fr, country.name.es, country.code];
  names.forEach((name) => {
    acc[normalizeCountryName(name)] = country.code;
  });
  return acc;
}, {});

const COUNTRY_ALIASES: Record<string, string> = {
  uk: 'GB',
  'united kingdom': 'GB',
  'great britain': 'GB',
  usa: 'US',
  'united states of america': 'US',
  'ivory coast': 'CI',
  "cote d'ivoire": 'CI',
};

function normalizeCountryName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function resolveCountryCode(country: string): string | null {
  if (!country) return null;

  const normalized = normalizeCountryName(country);
  if (COUNTRY_ALIASES[normalized]) {
    return COUNTRY_ALIASES[normalized];
  }

  if (country.length === 2 && /^[A-Z]{2}$/.test(country)) {
    return country;
  }

  return COUNTRY_NAME_TO_CODE[normalized] || null;
}

function hashValue(input: string): number {
  return Array.from(input).reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
}

function withJitter(base: LatLngTuple, seed: string): LatLngTuple {
  const hash = Math.abs(hashValue(seed));
  const latOffset = ((hash % 100) / 100 - 0.5) * 1.6;
  const lngOffset = (((hash >> 7) % 100) / 100 - 0.5) * 1.6;
  return [base[0] + latOffset, base[1] + lngOffset];
}

function getMarkerPosition(countryCode: string | null, region: string, seed: string): LatLngTuple {
  if (countryCode && COUNTRY_COORDINATES[countryCode]) {
    return withJitter(COUNTRY_COORDINATES[countryCode], seed);
  }

  if (REGION_COORDINATES[region]) {
    return withJitter(REGION_COORDINATES[region], seed);
  }

  return withJitter([12.0, 9.0], seed);
}

export default function SearchMapTabContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { allProjects } = useProjects();
  const { allExperts } = useExperts();
  const { availableCredits, libraryExpertIds, unlockExpertCV } = useCVCredits();
  const isExpertView = user?.accountType === 'expert';

  const [selectedType, setSelectedType] = useState<MarkerTypeExtended>('all');
  const [selectedCountries, setSelectedCountries] = useState<CountryEnum[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<SectorEnum[]>([]);
  const [selectedSubSectors, setSelectedSubSectors] = useState<SubSectorEnum[]>([]);
  const [pendingUnlockExpert, setPendingUnlockExpert] = useState<PendingUnlockExpert | null>(null);
  const [pendingInvitationExpert, setPendingInvitationExpert] = useState<PendingInvitationExpert | null>(null);
  const [sentInvitationIds, setSentInvitationIds] = useState<string[]>([]);
  const [isSaveSearchDialogOpen, setIsSaveSearchDialogOpen] = useState(false);

  const projectMarkers = useMemo<MapMarker[]>(() => {
    return allProjects.map((project) => {
      const countryCode = resolveCountryCode(project.country);
      return {
        id: project.id,
        type: 'projects',
        name: project.title,
        country: project.country,
        countryCode,
        region: String(project.region),
        position: getMarkerPosition(countryCode, String(project.region), `project-${project.id}`),
        isLocked: false,
        tooltipLabel: project.title,
        route: `/search/projects/${encodeURIComponent(project.id)}`,
        sectorKeys: [String(project.sector)],
        subSectorKeys: (project.subsectors || []).map(String),
      };
    });
  }, [allProjects]);

  const expertMarkers = useMemo<MapMarker[]>(() => {
    return allExperts.map((expert) => {
      const expertName = `${expert.firstName || ''} ${expert.lastName || ''}`.trim() || expert.title || `Expert ${expert.id}`;
      const maskedExpertLabel = t('search.map.expertMasked', { id: expert.id });
      const countryCode = resolveCountryCode(expert.country);
      const isLocked = isExpertView ? false : !libraryExpertIds.includes(expert.id);

      return {
        id: expert.id,
        type: 'experts',
        name: isExpertView ? maskedExpertLabel : expertName,
        country: expert.country,
        countryCode,
        region: String(expert.region),
        position: getMarkerPosition(countryCode, String(expert.region), `expert-${expert.id}`),
        isLocked,
        tooltipLabel: isExpertView ? maskedExpertLabel : (isLocked ? maskedExpertLabel : expertName),
        route: `/search/experts/${encodeURIComponent(expert.id)}`,
        sectorKeys: (expert.sectors || []).map(String),
        subSectorKeys: ((expert as { subSectors?: string[] }).subSectors || []).map(String),
      };
    });
  }, [allExperts, isExpertView, libraryExpertIds, t]);

  const markers = useMemo(() => {
    if (isExpertView) {
      return expertMarkers;
    }
    return [...projectMarkers, ...expertMarkers];
  }, [isExpertView, projectMarkers, expertMarkers]);

  const filteredMarkers = useMemo(() => {
    return markers.filter((marker) => {
      const matchesType = (() => {
        if (isExpertView) return marker.type === 'experts';
        if (selectedType === 'all') return true;
        if (selectedType === 'projects') return marker.type === 'projects';
        if (selectedType === 'experts') return marker.type === 'experts';
        if (selectedType === 'locked-experts') return marker.type === 'experts' && marker.isLocked;
        if (selectedType === 'unlocked-experts') return marker.type === 'experts' && !marker.isLocked;
        return true;
      })();

      const matchesCountry = selectedCountries.length === 0
        || (marker.countryCode ? selectedCountries.map(String).includes(marker.countryCode) : false);

      const matchesSector = selectedSectors.length === 0
        || marker.sectorKeys.some((sector) => selectedSectors.map(String).includes(sector));

      const matchesSubSector = selectedSubSectors.length === 0
        || marker.subSectorKeys.some((subSector) => selectedSubSectors.map(String).includes(subSector));

      return matchesType && matchesCountry && matchesSector && matchesSubSector;
    });
  }, [isExpertView, markers, selectedType, selectedCountries, selectedSectors, selectedSubSectors]);

  const markerCountryCodes = useMemo(() => {
    return new Set(markers.map((marker) => marker.countryCode).filter((code): code is string => !!code));
  }, [markers]);

  const countryOptions = useMemo(() => {
    const regionCountryCodes = Array.from(new Set(Object.values(REGION_COUNTRY_MAP).flat().map(String)));

    return regionCountryCodes
      .filter((code) => markerCountryCodes.has(code))
      .map((code) => ({
        code,
        label: getLocalizedCountryName(code as CountryEnum, language as SearchLanguage),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [language, markerCountryCodes]);

  const toggleCountry = (country: CountryEnum) => {
    setSelectedCountries((prev) => (
      prev.includes(country) ? prev.filter((item) => item !== country) : [...prev, country]
    ));
  };

  const toggleSector = (sector: SectorEnum) => {
    const sectorSubSectors = SECTOR_SUBSECTOR_MAP[sector] || [];
    const isSelected = selectedSectors.includes(sector);

    if (isSelected) {
      setSelectedSectors((prev) => prev.filter((item) => item !== sector));
      setSelectedSubSectors((prev) => prev.filter((item) => !sectorSubSectors.includes(item)));
      return;
    }

    setSelectedSectors((prev) => [...prev, sector]);
    setSelectedSubSectors((prev) => [...new Set([...prev, ...sectorSubSectors])]);
  };

  const toggleSubSector = (sector: SectorEnum, subSector: SubSectorEnum) => {
    const nextSubSectors = selectedSubSectors.includes(subSector)
      ? selectedSubSectors.filter((item) => item !== subSector)
      : [...selectedSubSectors, subSector];

    const sectorSubSectors = SECTOR_SUBSECTOR_MAP[sector] || [];
    const allSectorSubSectorsSelected = sectorSubSectors.every((item) => nextSubSectors.includes(item));

    setSelectedSubSectors(nextSubSectors);
    setSelectedSectors((prev) => {
      const hasSector = prev.includes(sector);
      if (allSectorSubSectorsSelected && !hasSector) {
        return [...prev, sector];
      }

      if (!allSectorSubSectorsSelected && hasSector) {
        return prev.filter((item) => item !== sector);
      }

      return prev;
    });
  };

  const clearAllFilters = () => {
    setSelectedType('all');
    setSelectedCountries([]);
    setSelectedSectors([]);
    setSelectedSubSectors([]);
  };

  const applySavedSearch = (payload: MapSavedPayload) => {
    setSelectedType(payload.selectedType || 'all');
    setSelectedCountries(payload.selectedCountries || []);
    setSelectedSectors(payload.selectedSectors || []);
    setSelectedSubSectors(payload.selectedSubSectors || []);
  };

  useEffect(() => {
    const savedSearchId = searchParams.get('savedSearchId');
    if (!savedSearchId) return;
    const saved = savedSearchService.get(savedSearchId);
    if (saved?.context.type === 'map') {
      applySavedSearch(saved.filters as MapSavedPayload);
    }
  }, [searchParams]);

  const buildSummary = () => [
    selectedType !== 'all' ? `Type: ${selectedType.replace(/-/g, ' ')}` : '',
    selectedCountries.length ? `Countries: ${selectedCountries.length}` : '',
    selectedSectors.length ? `Sectors: ${selectedSectors.length}` : '',
    selectedSubSectors.length ? `Subsectors: ${selectedSubSectors.length}` : '',
  ].filter(Boolean);

  const saveSearch = (name: string) => {
    savedSearchService.save({
      userId: user?.id,
      name,
      filters: {
        selectedType,
        selectedCountries,
        selectedSectors,
        selectedSubSectors,
      } satisfies MapSavedPayload,
      context: {
        type: 'map',
        route: '/search/map',
        label: 'Map',
        summary: buildSummary(),
        language,
        accountType: user?.accountType,
      },
    });
    setIsSaveSearchDialogOpen(false);
    toast.success('Search saved');
  };

  const countrySelectionLabel = selectedCountries.length === 0
    ? t('search.map.filters.all')
    : t('search.map.filters.selectedCount', { count: selectedCountries.length });

  const sectorSelectionLabel = selectedSubSectors.length === 0
    ? t('search.map.filters.all')
    : t('search.map.filters.selectedCount', { count: selectedSubSectors.length });

  const mapCenter = useMemo<LatLngTuple>(() => {
    if (filteredMarkers.length === 0) return [14.0, 8.0];

    const sample = filteredMarkers.slice(0, 30);
    const total = sample.reduce(
      (acc, marker) => {
        return {
          lat: acc.lat + marker.position[0],
          lng: acc.lng + marker.position[1],
        };
      },
      { lat: 0, lng: 0 }
    );

    return [total.lat / sample.length, total.lng / sample.length];
  }, [filteredMarkers]);

  const handleMarkerClick = (marker: MapMarker) => {
    if (marker.type === 'projects') {
      navigate(marker.route);
      return;
    }

    if (isExpertView) {
      setPendingInvitationExpert({
        id: marker.id,
        name: marker.name,
        country: marker.country,
        sectors: marker.sectorKeys,
      });
      return;
    }

    if (!marker.isLocked) {
      navigate(marker.route);
      return;
    }

    setPendingUnlockExpert({ id: marker.id, name: marker.name, route: marker.route });
  };

  const handleConfirmUnlock = () => {
    if (!pendingUnlockExpert) return;

    const unlockResult = unlockExpertCV(pendingUnlockExpert.id, pendingUnlockExpert.name, 1);

    if (!unlockResult.success && unlockResult.error === 'INSUFFICIENT_CREDITS') {
      toast.error(t('experts.credits.notEnough'), {
        action: {
          label: t('experts.credits.buyMore'),
          onClick: () => navigate('/compte-utilisateur/credits'),
        },
      });
      return;
    }

    toast.success(t('experts.credits.unlockSuccess', { name: pendingUnlockExpert.name }), {
      description: t('experts.credits.remainingAfterUnlock', { count: availableCredits - 1 }),
    });

    const targetRoute = pendingUnlockExpert.route;
    setPendingUnlockExpert(null);
    navigate(targetRoute);
  };

  const handleSendInvitation = () => {
    if (!pendingInvitationExpert) return;

    if (sentInvitationIds.includes(pendingInvitationExpert.id)) {
      return;
    }

    setSentInvitationIds((prev) => [...prev, pendingInvitationExpert.id]);
    toast.success(t('search.map.invite.success'));
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <Card className="xl:col-span-3 h-fit">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">{t('search.section.map.filters.heading')}</CardTitle>
          <CardDescription>{t('search.section.map.filters.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isExpertView && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t('search.map.type.label')}</Label>
              <RadioGroup
                value={selectedType}
                onValueChange={(value) => setSelectedType(value as MarkerTypeExtended)}
                className="space-y-3"
              >
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <RadioGroupItem id="map-type-all" value="all" />
                <Label htmlFor="map-type-all" className="flex items-center gap-2 cursor-pointer">
                  <Globe className="h-4 w-4 text-slate-700" />
                  {t('search.map.type.all')}
                </Label>
              </div>
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <RadioGroupItem id="map-type-projects" value="projects" />
                <Label htmlFor="map-type-projects" className="flex items-center gap-2 cursor-pointer">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  {t('search.map.type.projects')}
                </Label>
              </div>
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <RadioGroupItem id="map-type-experts" value="experts" />
                <Label htmlFor="map-type-experts" className="flex items-center gap-2 cursor-pointer">
                  <UserRound className="h-4 w-4 text-teal-600" />
                  {t('search.map.type.experts')}
                </Label>
              </div>
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <RadioGroupItem id="map-type-locked-experts" value="locked-experts" />
                <Label htmlFor="map-type-locked-experts" className="flex items-center gap-2 cursor-pointer">
                  <UserRound className="h-4 w-4 text-amber-600" />
                  {t('search.map.type.lockedExperts')}
                </Label>
              </div>
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <RadioGroupItem id="map-type-unlocked-experts" value="unlocked-experts" />
                <Label htmlFor="map-type-unlocked-experts" className="flex items-center gap-2 cursor-pointer">
                  <UserRound className="h-4 w-4 text-teal-700" />
                  {t('search.map.type.unlockedExperts')}
                </Label>
              </div>
              </RadioGroup>
            </div>
          )}

          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('search.map.country.label')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-between min-h-11 w-full">
                  <span>{countrySelectionLabel}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-2 max-h-64 overflow-auto">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedCountries.length === 0}
                      onChange={() => setSelectedCountries([])}
                    />
                    <span>{t('search.map.filters.all')}</span>
                  </label>
                  {countryOptions.map((option) => (
                    <label key={option.code} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={selectedCountries.includes(option.code as CountryEnum)}
                        onChange={() => toggleCountry(option.code as CountryEnum)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('search.map.sector.label')} / {t('search.map.subSector.label')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-between min-h-11 w-full">
                  <span>{sectorSelectionLabel}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-2 max-h-64 overflow-auto">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedSectors.length === 0 && selectedSubSectors.length === 0}
                      onChange={() => {
                        setSelectedSectors([]);
                        setSelectedSubSectors([]);
                      }}
                    />
                    <span>{t('search.map.filters.all')}</span>
                  </label>
                  {Object.values(SectorEnum).map((sector) => {
                    const sectorSubSectors = SECTOR_SUBSECTOR_MAP[sector] || [];

                    return (
                      <div key={sector} className="space-y-1">
                        <label className="flex items-center gap-2 text-sm font-semibold">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={selectedSectors.includes(sector)}
                            onChange={() => toggleSector(sector)}
                          />
                          <span>{t(`sectors.${sector}`)}</span>
                        </label>

                        <div className="pl-6 space-y-1">
                          {sectorSubSectors.map((subSector) => (
                            <label key={subSector} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <input
                                type="checkbox"
                                className="h-3.5 w-3.5"
                                checked={selectedSubSectors.includes(subSector)}
                                onChange={() => toggleSubSector(sector, subSector)}
                              />
                              <span>{t(`subsectors.${subSector}`)}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={clearAllFilters}>
              {t('activeTenders.filters.resetAll')}
            </Button>
            <Button variant="outline" onClick={() => setIsSaveSearchDialogOpen(true)}>
              Save Search
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('search.map.legend.title')}</Label>
            <div className="flex flex-wrap gap-2">
              {isExpertView ? (
                <Badge variant="outline" className="gap-1 border-teal-200 text-teal-700 bg-teal-50">
                  <span className="w-2 h-2 rounded-full bg-teal-600" />
                  {t('search.map.legend.experts')}
                </Badge>
              ) : (
                <>
                  <Badge variant="outline" className="gap-1 border-blue-200 text-blue-700 bg-blue-50">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    {t('search.map.legend.projects')}
                  </Badge>
                  <Badge variant="outline" className="gap-1 border-teal-200 text-teal-700 bg-teal-50">
                    <span className="w-2 h-2 rounded-full bg-teal-600" />
                    {t('search.map.legend.expertsUnlocked')}
                  </Badge>
                  <Badge variant="outline" className="gap-1 border-amber-200 text-amber-700 bg-amber-50">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    {t('search.map.legend.expertsLocked')}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-9 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">{t('search.tabs.map')}</CardTitle>
              <CardDescription>{t('search.section.map.description')}</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>{t('search.map.pointsCount', { count: filteredMarkers.length })}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 relative">
          <div className="h-[440px] md:h-[520px] w-full">
            <MapContainer
              key={`${selectedType}-${selectedCountries.join(',')}-${selectedSectors.join(',')}-${selectedSubSectors.join(',')}-${mapCenter[0].toFixed(2)}-${mapCenter[1].toFixed(2)}`}
              center={mapCenter}
              zoom={2}
              minZoom={2}
              className="h-full w-full z-0"
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {filteredMarkers.map((marker) => {
                const isProject = marker.type === 'projects';
                const color = isProject ? '#2563eb' : marker.isLocked ? '#d97706' : '#0f766e';
                const radius = isProject ? 7 : 8;

                return (
                  <CircleMarker
                    key={`${marker.type}-${marker.id}`}
                    center={marker.position}
                    radius={radius}
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: 0.75,
                      weight: 2,
                    }}
                    eventHandlers={{
                      click: () => handleMarkerClick(marker),
                    }}
                  >
                    <LeafletTooltip direction="top" opacity={0.95} offset={[0, -6]}>
                      <div className="text-xs font-medium">{marker.tooltipLabel}</div>
                    </LeafletTooltip>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>

          {filteredMarkers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-6">
              <div className="rounded-lg border bg-background/95 px-4 py-3 text-sm text-muted-foreground">
                {t('search.map.empty')}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!isExpertView && (
        <Dialog open={!!pendingUnlockExpert} onOpenChange={(isOpen) => !isOpen && setPendingUnlockExpert(null)}>
          <DialogContent className="sm:max-w-[460px] z-[2100]">
            <DialogHeader>
              <DialogTitle>{t('search.map.unlock.title')}</DialogTitle>
              <DialogDescription>
                {pendingUnlockExpert ? t('search.map.expertMasked', { id: pendingUnlockExpert.id }) : ''}
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg border bg-muted/40 px-4 py-3 space-y-2">
              <p className="text-sm text-foreground flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-600" />
                {t('search.map.unlock.cost')}
              </p>
              <p className="text-sm text-muted-foreground">{t('search.map.unlock.balance', { count: availableCredits })}</p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              {availableCredits < 1 && (
                <Button variant="outline" onClick={() => navigate('/compte-utilisateur/credits')}>
                  {t('search.map.unlock.buyMore')}
                </Button>
              )}
              <Button variant="outline" onClick={() => setPendingUnlockExpert(null)}>
                {t('experts.credits.confirm.cancel')}
              </Button>
              <Button onClick={handleConfirmUnlock}>{t('search.map.unlock.action')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {isExpertView && (
        <Dialog open={!!pendingInvitationExpert} onOpenChange={(isOpen) => !isOpen && setPendingInvitationExpert(null)}>
          <DialogContent className="sm:max-w-[460px] z-[2100]">
            <DialogHeader>
              <DialogTitle>{t('search.map.invite.modalTitle')}</DialogTitle>
              <DialogDescription>
                {pendingInvitationExpert?.name || t('search.map.expertMasked', { id: pendingInvitationExpert?.id || '' })}
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg border bg-muted/40 px-4 py-3 space-y-2">
              <p className="text-sm text-foreground">
                <span className="font-medium">{t('search.map.country.label')}:</span> {pendingInvitationExpert?.country || '-'}
              </p>
              <p className="text-sm text-foreground">
                <span className="font-medium">{t('search.map.sector.label')}:</span>{' '}
                {pendingInvitationExpert?.sectors.length
                  ? pendingInvitationExpert.sectors.map((sector) => t(`sectors.${sector}`)).join(', ')
                  : '-'}
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setPendingInvitationExpert(null)}>
                {t('experts.credits.confirm.cancel')}
              </Button>
              <Button
                onClick={handleSendInvitation}
                disabled={pendingInvitationExpert ? sentInvitationIds.includes(pendingInvitationExpert.id) : false}
              >
                {pendingInvitationExpert && sentInvitationIds.includes(pendingInvitationExpert.id)
                  ? t('search.map.invite.sent')
                  : t('search.map.invite.send')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <SaveSearchDialog
        open={isSaveSearchDialogOpen}
        defaultName="Saved map search"
        onOpenChange={setIsSaveSearchDialogOpen}
        onSave={saveSearch}
      />
    </div>
  );
}
