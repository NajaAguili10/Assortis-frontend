import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { format } from 'date-fns';
import { enUS, es, fr } from 'date-fns/locale';
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Globe,
  Landmark,
  Pencil,
  Wallet,
} from 'lucide-react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OrganizationsSubMenu } from '@app/components/OrganizationsSubMenu';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import { Separator } from '@app/components/ui/separator';
import { getLocalizedCountryName } from '@app/utils/country-translator';
import { useOrganizationTenders } from '@app/modules/organization/hooks/useOrganizationTenders';
import type { CountryEnum } from '@app/types/tender.dto';

export default function OrganizationsTenderDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { getTenderById } = useOrganizationTenders();

  const tender = getTenderById(id);
  const dateLocale = language === 'fr' ? fr : language === 'es' ? es : enUS;

  const getTranslation = (key: string, fallback: string) => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  const statusBadgeClassName = useMemo(() => {
    if (!tender) return 'rounded-full bg-blue-100 text-blue-800 border-blue-200';

    if (tender.status === 'PUBLISHED') return 'rounded-full bg-green-100 text-green-800 border-green-200';
    if (tender.status === 'CLOSED' || tender.status === 'CANCELLED') {
      return 'rounded-full bg-red-100 text-red-800 border-red-200';
    }

    return 'rounded-full bg-blue-100 text-blue-800 border-blue-200';
  }, [tender]);

  if (!tender) {
    return (
      <div className="min-h-screen bg-gray-100">
        <PageBanner
          title={t('organizations.myTenders.detailNotFound.title')}
          description={t('organizations.myTenders.detailNotFound.subtitle')}
          icon={BriefcaseBusiness}
        />
        <OrganizationsSubMenu />
        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-6">
            <Card className="border-primary/15 shadow-sm">
              <CardContent className="p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-700">{t('organizations.myTenders.detailNotFound.message')}</p>
                <Button className="min-h-11" onClick={() => navigate('/organizations/my-tenders')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('organizations.myTenders.actions.backToList')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        title={tender.title}
        description={t('organizations.myTenders.detailPageSubtitle')}
        icon={BriefcaseBusiness}
      />

      <OrganizationsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="mb-6 rounded-lg border border-primary/15 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-primary">{tender.title}</h1>
                  <Badge variant="secondary" className={statusBadgeClassName}>
                    {getTranslation(`tender.status.${tender.status}`, tender.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2 lg:grid-cols-3">
                  <p>
                    <span className="font-semibold text-gray-900">{t('organizations.myTenders.fields.sector')}: </span>
                    {getTranslation(`sectors.${tender.sector}`, tender.sector)}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">{t('organizations.myTenders.fields.subSector')}: </span>
                    {getTranslation(`subsectors.${tender.subSector}`, tender.subSector)}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">{t('organizations.myTenders.fields.country')}: </span>
                    {getLocalizedCountryName(tender.country as CountryEnum, language)}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">{t('organizations.myTenders.fields.deadline')}: </span>
                    {format(new Date(tender.deadline), 'dd MMM yyyy', { locale: dateLocale })}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" className="min-h-11" onClick={() => navigate('/organizations/my-tenders')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('organizations.myTenders.actions.backToList')}
                </Button>
                <Button className="min-h-11" onClick={() => navigate(`/organizations/my-tenders/${tender.id}/edit`)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  {t('organizations.myTenders.actions.editTender')}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
            <div className="space-y-6">
              <Card className="border-primary/15 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base text-primary">{t('organizations.myTenders.sections.description')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-gray-700 whitespace-pre-line">{tender.description}</p>
                </CardContent>
              </Card>

              <Card className="border-primary/15 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base text-primary">{t('organizations.myTenders.sections.details')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('organizations.myTenders.fields.sector')}</p>
                      <p className="mt-1 text-sm text-gray-900">{getTranslation(`sectors.${tender.sector}`, tender.sector)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('organizations.myTenders.fields.subSector')}</p>
                      <p className="mt-1 text-sm text-gray-900">{getTranslation(`subsectors.${tender.subSector}`, tender.subSector)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('organizations.myTenders.fields.country')}</p>
                      <p className="mt-1 text-sm text-gray-900">{getLocalizedCountryName(tender.country as CountryEnum, language)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('organizations.myTenders.fields.deadline')}</p>
                      <p className="mt-1 text-sm text-gray-900">{format(new Date(tender.deadline), 'dd MMM yyyy', { locale: dateLocale })}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('organizations.myTenders.fields.createdAt')}</p>
                      <p className="mt-1 text-sm text-gray-900">{format(new Date(tender.createdAt), 'dd MMM yyyy', { locale: dateLocale })}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('organizations.myTenders.fields.budget')}</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {typeof tender.budget === 'number'
                          ? new Intl.NumberFormat(language, {
                              style: 'currency',
                              currency: 'USD',
                              maximumFractionDigits: 0,
                            }).format(tender.budget)
                          : t('organizations.myTenders.budgetNotProvided')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/15 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base text-primary">{t('organizations.myTenders.sections.additionalInformation')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('organizations.myTenders.fields.donorClient')}</p>
                      <p className="mt-1 text-sm text-gray-900">{tender.donorClient}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('organizations.myTenders.fields.status')}</p>
                      <div className="mt-1">
                        <Badge variant="secondary" className={statusBadgeClassName}>
                          {getTranslation(`tender.status.${tender.status}`, tender.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-primary/15 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base text-primary">{t('organizations.myTenders.sidebar.summary')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className={statusBadgeClassName}>
                      {getTranslation(`tender.status.${tender.status}`, tender.status)}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2 text-gray-700">
                      <CalendarDays className="h-4 w-4 mt-0.5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{t('organizations.myTenders.fields.deadline')}</p>
                        <p>{format(new Date(tender.deadline), 'dd MMM yyyy', { locale: dateLocale })}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-gray-700">
                      <Wallet className="h-4 w-4 mt-0.5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{t('organizations.myTenders.fields.budget')}</p>
                        <p>
                          {typeof tender.budget === 'number'
                            ? new Intl.NumberFormat(language, {
                                style: 'currency',
                                currency: 'USD',
                                maximumFractionDigits: 0,
                              }).format(tender.budget)
                            : t('organizations.myTenders.budgetNotProvided')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-gray-700">
                      <Globe className="h-4 w-4 mt-0.5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{t('organizations.myTenders.fields.country')}</p>
                        <p>{getLocalizedCountryName(tender.country as CountryEnum, language)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-gray-700">
                      <Landmark className="h-4 w-4 mt-0.5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{t('organizations.myTenders.fields.donorClient')}</p>
                        <p>{tender.donorClient}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/15 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base text-primary">{t('organizations.myTenders.sidebar.actions')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="min-h-11 w-full" onClick={() => navigate(`/organizations/my-tenders/${tender.id}/edit`)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    {t('organizations.myTenders.actions.editTender')}
                  </Button>
                  <Button variant="outline" className="min-h-11 w-full" onClick={() => navigate('/organizations/my-tenders')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('organizations.myTenders.actions.backToList')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
