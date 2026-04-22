import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { format } from 'date-fns';
import { enUS, es, fr } from 'date-fns/locale';
import { BriefcaseBusiness, Eye, FilePlus2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OrganizationsSubMenu } from '@app/components/OrganizationsSubMenu';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@app/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@app/components/ui/tooltip';
import { getLocalizedCountryName } from '@app/utils/country-translator';
import { useOrganizationTenders } from '@app/modules/organization/hooks/useOrganizationTenders';
import type { CountryEnum } from '@app/types/tender.dto';

export default function OrganizationsMyTenders() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { tenders, stats, deleteTender } = useOrganizationTenders();
  const [tenderPendingDeleteId, setTenderPendingDeleteId] = useState<string | null>(null);

  const dateLocale = language === 'fr' ? fr : language === 'es' ? es : enUS;

  const sortedTenders = useMemo(
    () => [...tenders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [tenders],
  );

  const getStatusBadgeClassName = (status: string) => {
    if (status === 'PUBLISHED') {
      return 'rounded-full bg-green-100 text-green-800 border-green-200';
    }

    if (status === 'CLOSED' || status === 'CANCELLED') {
      return 'rounded-full bg-red-100 text-red-800 border-red-200';
    }

    return 'rounded-full bg-blue-100 text-blue-800 border-blue-200';
  };

  const getTranslation = (key: string, fallback: string) => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  const tenderPendingDelete = sortedTenders.find(item => item.id === tenderPendingDeleteId) ?? null;

  const handleDeleteTender = async () => {
    if (!tenderPendingDeleteId) return;

    const removed = await deleteTender(tenderPendingDeleteId);
    setTenderPendingDeleteId(null);

    if (!removed) {
      toast.error(t('organizations.myTenders.detailNotFound.title'));
      return;
    }

    toast.success(t('organizations.myTenders.delete.success.title'), {
      description: t('organizations.myTenders.delete.success.description', {
        title: tenderPendingDelete?.title || '',
      }),
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        title={t('organizations.myTenders.pageTitle')}
        description={t('organizations.myTenders.pageSubtitle')}
        icon={BriefcaseBusiness}
        stats={[
          { value: String(stats.total), label: t('organizations.myTenders.kpi.total') },
          { value: String(stats.draft), label: t('organizations.myTenders.kpi.draft') },
        ]}
      />

      <OrganizationsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="bg-gradient-to-b from-white to-gray-50/40 rounded-lg border border-primary/15 p-5 mb-6 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 pb-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-base font-semibold text-primary">{t('organizations.myTenders.listTitle')}</h2>
                <p className="text-sm text-gray-600 mt-1">{t('organizations.myTenders.listSubtitle')}</p>
              </div>
              <Button className="min-h-11" onClick={() => navigate('/organizations/create-tender')}>
                <FilePlus2 className="h-4 w-4 mr-2" />
                {t('organizations.myTenders.actions.createTender')}
              </Button>
            </div>

            {sortedTenders.length === 0 ? (
              <div className="py-10 text-center">
                <p className="font-medium text-gray-700">{t('organizations.myTenders.empty.title')}</p>
                <p className="text-sm text-gray-500 mt-1">{t('organizations.myTenders.empty.subtitle')}</p>
                <Button className="min-h-11 mt-4" onClick={() => navigate('/organizations/create-tender')}>
                  {t('organizations.myTenders.actions.createTender')}
                </Button>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-primary/15 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <div className="min-w-[900px]">
                    <div className="grid grid-cols-[2fr_1.2fr_1.2fr_1fr_1fr_auto] gap-3 px-5 py-3.5 border-b border-primary/15 bg-primary/5 text-xs font-semibold uppercase tracking-wide text-primary">
                      <span className="text-left">{t('organizations.myTenders.table.title')}</span>
                      <span className="text-left">{t('organizations.myTenders.table.sector')}</span>
                      <span className="text-left">{t('organizations.myTenders.table.country')}</span>
                      <span className="text-left">{t('organizations.myTenders.table.deadline')}</span>
                      <span className="text-left">{t('organizations.myTenders.table.status')}</span>
                      <span className="text-left">{t('organizations.myTenders.table.actions')}</span>
                    </div>

                    <div className="divide-y divide-primary/10">
                      {sortedTenders.map((tender, index) => (
                        <div
                          key={tender.id}
                          className={`px-5 py-4 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-primary/5'} hover:bg-primary/10`}
                        >
                          <div className="grid grid-cols-[2fr_1.2fr_1.2fr_1fr_1fr_auto] gap-3 items-center text-sm">
                            <div>
                              <p className="font-semibold text-gray-900 leading-snug">{tender.title}</p>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{tender.donorClient}</p>
                            </div>
                            <div className="text-gray-700 leading-snug">
                              {getTranslation(`sectors.${tender.sector}`, tender.sector)}
                            </div>
                            <div className="text-gray-700 leading-snug">
                              {getLocalizedCountryName(tender.country as CountryEnum, language)}
                            </div>
                            <div className="text-gray-700">
                              {format(new Date(tender.deadline), 'dd MMM yyyy', { locale: dateLocale })}
                            </div>
                            <div>
                              <Badge variant="secondary" className={getStatusBadgeClassName(tender.status)}>
                                {getTranslation(`tender.status.${tender.status}`, tender.status)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9"
                                    aria-label={t('organizations.myTenders.actions.view')}
                                    onClick={() => navigate(`/organizations/my-tenders/${tender.id}`)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{t('organizations.myTenders.actions.view')}</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9"
                                    aria-label={t('organizations.myTenders.actions.editTender')}
                                    onClick={() => navigate(`/organizations/my-tenders/${tender.id}/edit`)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{t('organizations.myTenders.actions.editTender')}</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-destructive hover:text-destructive"
                                    aria-label={t('organizations.myTenders.actions.deleteTender')}
                                    onClick={() => setTenderPendingDeleteId(tender.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{t('organizations.myTenders.actions.deleteTender')}</TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageContainer>

      <AlertDialog open={Boolean(tenderPendingDeleteId)} onOpenChange={(open) => !open && setTenderPendingDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('organizations.myTenders.delete.confirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('organizations.myTenders.delete.confirmDescription', {
                title: tenderPendingDelete?.title || '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDeleteTender}
            >
              {t('organizations.myTenders.actions.deleteTender')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
