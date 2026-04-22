import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { toast } from 'sonner';
import { CheckCircle2, Globe, Info, Layers, Shield } from 'lucide-react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { AccountSubMenu } from '@app/components/AccountSubMenu';
import { OrganizationsSubMenu } from '@app/components/OrganizationsSubMenu';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { RegionCountryFilter } from '@app/components/RegionCountryFilter';
import { SectorSubsectorFilter } from '@app/components/SectorSubsectorFilter';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card';
import {
  CountryEnum,
  RegionEnum,
  SECTOR_SUBSECTOR_MAP,
  SectorEnum,
  SubSectorEnum,
} from '@app/types/tender.dto';

interface SubscriptionData {
  planId: string;
  planName: { fr: string; en: string; es: string };
  price: number;
  billingCycle: 'monthly' | 'yearly';
  renewalDate: string;
  memberType: 'expert' | 'organization';
  status: 'active' | 'pending' | 'inactive';
}

function getDefaultSubscription(memberType: 'expert' | 'organization'): SubscriptionData {
  return {
    planId: memberType === 'expert' ? 'expert-professional' : 'org-professional',
    planName: { fr: 'Professionnel', en: 'Professional', es: 'Profesional' },
    price: 49,
    billingCycle: 'monthly',
    renewalDate: '2026-03-27',
    memberType,
    status: 'active',
  };
}

export default function EspaceMembrePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();

  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionData | null>(null);
  const [selectedSectors, setSelectedSectors] = useState<SectorEnum[]>([]);
  const [selectedSubSectors, setSelectedSubSectors] = useState<SubSectorEnum[]>([]);
  const [hoveredSector, setHoveredSector] = useState<SectorEnum | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<RegionEnum[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<CountryEnum[]>([]);
  const [updateSubmitted, setUpdateSubmitted] = useState(false);

  useEffect(() => {
    const resolvedMemberType: 'expert' | 'organization' = user?.accountType === 'expert' ? 'expert' : 'organization';
    const savedSubscription = localStorage.getItem('assortis_current_subscription');

    if (!savedSubscription) {
      setCurrentSubscription(getDefaultSubscription(resolvedMemberType));
      return;
    }

    try {
      const parsedSubscription = JSON.parse(savedSubscription) as Partial<SubscriptionData>;
      setCurrentSubscription({
        ...getDefaultSubscription(resolvedMemberType),
        ...parsedSubscription,
        memberType: resolvedMemberType,
      });
    } catch (error) {
      console.error('Error parsing subscription data:', error);
      setCurrentSubscription(getDefaultSubscription(resolvedMemberType));
    }
  }, [user?.accountType]);

  const toggleSector = (sector: SectorEnum) => {
    setSelectedSectors((previous) =>
      previous.includes(sector) ? previous.filter((item) => item !== sector) : [...previous, sector]
    );
  };

  const toggleSubSector = (subSector: SubSectorEnum) => {
    setSelectedSubSectors((previous) =>
      previous.includes(subSector)
        ? previous.filter((item) => item !== subSector)
        : [...previous, subSector]
    );
  };

  const toggleRegion = (region: RegionEnum) => {
    setSelectedRegions((previous) =>
      previous.includes(region) ? previous.filter((item) => item !== region) : [...previous, region]
    );
  };

  const toggleCountry = (country: CountryEnum) => {
    setSelectedCountries((previous) =>
      previous.includes(country) ? previous.filter((item) => item !== country) : [...previous, country]
    );
  };

  const statusKey = currentSubscription?.status || 'active';
  const statusVariantClass =
    statusKey === 'active'
      ? 'bg-green-100 text-green-800 border-green-200'
      : statusKey === 'pending'
        ? 'bg-amber-100 text-amber-800 border-amber-200'
        : 'bg-slate-100 text-slate-700 border-slate-200';

  const handleUpdateSubscription = () => {
    setUpdateSubmitted(true);
    toast.success(t('monEspace.subscription.update.successDescription'));
  };

  const isOrganizationsContext = location.pathname.startsWith('/organizations/');

  return (
    <>
      <PageBanner
        icon={Shield}
        title={t('monEspace.subscription.title')}
        subtitle={t('monEspace.subscription.subtitle')}
      />

      {isOrganizationsContext ? (
        <OrganizationsSubMenu />
      ) : (
        <AccountSubMenu activeTab="member-area" onTabChange={() => undefined} mode="profile-settings" />
      )}

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6 space-y-6">
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-accent" />
                    {t('monEspace.subscription.status.title')}
                  </CardTitle>
                  <CardDescription>{t('monEspace.subscription.status.description')}</CardDescription>
                </div>
                <Badge variant="outline" className={statusVariantClass}>
                  {t(`monEspace.subscription.status.${statusKey}`)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-lg border border-gray-200 p-4 bg-white">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {t('monEspace.subscription.userType')}
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {t(
                      currentSubscription?.memberType === 'expert'
                        ? 'monEspace.subscription.userType.expert'
                        : 'monEspace.subscription.userType.organization'
                    )}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4 bg-white">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {t('monEspace.subscription.summary.sectors')}
                  </p>
                  <p className="text-base font-semibold text-foreground">{selectedSectors.length}</p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4 bg-white">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {t('monEspace.subscription.summary.countries')}
                  </p>
                  <p className="text-base font-semibold text-foreground">{selectedCountries.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('monEspace.subscription.configuration.title')}</CardTitle>
              <CardDescription>{t('monEspace.subscription.configuration.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  const sectorSubSectors = SECTOR_SUBSECTOR_MAP[sector] || [];
                  const allSelected = sectorSubSectors.every((subSector) =>
                    selectedSubSectors.includes(subSector)
                  );

                  if (allSelected) {
                    setSelectedSubSectors((previous) =>
                      previous.filter((item) => !sectorSubSectors.includes(item))
                    );
                  } else {
                    setSelectedSubSectors((previous) => [
                      ...new Set([...previous, ...sectorSubSectors]),
                    ]);
                  }
                }}
                t={t}
              />

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

              <div className="rounded-lg border border-accent/25 bg-accent/5 p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-accent mt-0.5" />
                <p className="text-sm text-foreground leading-relaxed">
                  {t('monEspace.subscription.pricingNote')}
                </p>
              </div>

              <div className="flex justify-end">
                <Button size="lg" className="min-w-[220px]" onClick={handleUpdateSubscription}>
                  {t('monEspace.subscription.update.button')}
                </Button>
              </div>

              {updateSubmitted && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-700 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">{t('monEspace.subscription.update.success')}</p>
                    <p className="text-sm text-green-800 mt-1">
                      {t('monEspace.subscription.update.successDescription')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Layers className="w-5 h-5 text-accent" />
                <p className="text-sm text-muted-foreground">{t('monEspace.subscription.configuration.sectorHint')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Globe className="w-5 h-5 text-accent" />
                <p className="text-sm text-muted-foreground">{t('monEspace.subscription.configuration.countryHint')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    </>
  );
}