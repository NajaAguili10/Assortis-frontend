import { format } from 'date-fns';
import { enUS, es, fr } from 'date-fns/locale';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OrganizationsSubMenu } from '@app/components/OrganizationsSubMenu';
import { OrganizationProjectReferenceDocumentsSection } from '@app/components/OrganizationProjectReferenceDocumentsSection';
import { OrganizationProjectReferenceFormDialog } from '@app/components/OrganizationProjectReferenceFormDialog';
import { RestrictedTooltip } from '@app/components/RestrictedTooltip';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import { Separator } from '@app/components/ui/separator';
import { useOrganizationProjectReferences } from '@app/modules/organization/hooks/useOrganizationProjectReferences';
import { OrganizationProjectReferenceFormValues } from '@app/modules/organization/types/organizationProjectReference.dto';
import { canManageOrganizationAdminActions } from '@app/services/permissions.service';
import { getLocalizedCountryName } from '@app/utils/country-translator';
import { ArrowLeft, CalendarRange, FileText, Globe2, Landmark, Layers3, UserRound } from 'lucide-react';
import { toast } from 'sonner';

export default function OrganizationProjectReferenceDetail() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { references, metrics, updateReference, addDocuments, removeDocument, replaceDocument } = useOrganizationProjectReferences();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const canManage = canManageOrganizationAdminActions(user?.accountType, user?.role);
  const restrictedActionMessage = t('permissions.organization.adminOnlyAction');
  const dateLocale = language === 'fr' ? fr : language === 'es' ? es : enUS;

  const reference = useMemo(() => references.find(item => item.id === id), [id, references]);

  if (!reference) {
    return (
      <div className="min-h-screen bg-gray-100">
        <PageBanner
          title={t('organizations.projectReferences.notFoundTitle')}
          description={t('organizations.projectReferences.notFoundSubtitle')}
          icon={FileText}
        />
        <OrganizationsSubMenu />
        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-10 text-center">
            <Button onClick={() => navigate('/organizations/project-references')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('organizations.actions.backToList')}
            </Button>
          </div>
        </PageContainer>
      </div>
    );
  }

  const handleUpdateReference = (values: OrganizationProjectReferenceFormValues) => {
    updateReference(reference.id, values);
    toast.success(t('organizations.projectReferences.updateSuccess'));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        title={reference.title}
        description={t('organizations.projectReferences.detailSubtitle')}
        icon={FileText}
        stats={[
          { value: reference.referenceNumber, label: t('organizations.projectReferences.fields.referenceNumber') },
          { value: t(`organizations.projectReferences.status.${reference.status}`), label: t('organizations.projectReferences.fields.status') },
          { value: String(metrics.documents), label: t('organizations.projectReferences.kpi.documents') },
        ]}
      />

      <OrganizationsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" onClick={() => navigate('/organizations/project-references')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('organizations.actions.backToList')}
            </Button>
            {canManage ? (
              <Button onClick={() => setIsEditDialogOpen(true)}>{t('common.edit')}</Button>
            ) : (
              <RestrictedTooltip content={restrictedActionMessage}>
                <div>
                  <Button disabled>{t('common.edit')}</Button>
                </div>
              </RestrictedTooltip>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-primary/15 shadow-sm bg-gradient-to-b from-white to-gray-50/40">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base text-primary">{t('organizations.projectReferences.detailOverview')}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{reference.summary}</p>
                  </div>
                  <Badge
                    variant={reference.status === 'ongoing' ? 'default' : 'secondary'}
                    className={reference.status === 'ongoing' ? 'rounded-full' : 'rounded-full bg-blue-100 text-blue-800 border-blue-200'}
                  >
                    {t(`organizations.projectReferences.status.${reference.status}`)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('organizations.projectReferences.fields.description')}</h3>
                  <p className="text-sm leading-7 text-gray-700">{reference.description}</p>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                      <Globe2 className="w-4 h-4 text-blue-600" />
                      {t('organizations.projectReferences.fields.country')}
                    </div>
                    <p className="text-sm text-gray-700">{getLocalizedCountryName(reference.country, language)}</p>
                  </div>
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                      <Layers3 className="w-4 h-4 text-primary" />
                      {t('organizations.projectReferences.fields.sector')}
                    </div>
                    <p className="text-sm text-gray-700">{t(`sectors.${reference.sector}`)}</p>
                    {reference.subSector && <p className="text-xs text-gray-500 mt-1">{t(`subsectors.${reference.subSector}`)}</p>}
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                      <UserRound className="w-4 h-4 text-emerald-600" />
                      {t('organizations.projectReferences.fields.client')}
                    </div>
                    <p className="text-sm text-gray-700">{reference.client}</p>
                  </div>
                  <div className="rounded-lg border border-violet-200 bg-violet-50/60 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                      <Landmark className="w-4 h-4 text-violet-600" />
                      {t('organizations.projectReferences.fields.donor')}
                    </div>
                    <p className="text-sm text-gray-700">{t(`fundingAgencies.${reference.donor}`)}</p>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4 sm:col-span-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                      <CalendarRange className="w-4 h-4 text-amber-700" />
                      {t('organizations.projectReferences.detailTimeline')}
                    </div>
                    <p className="text-sm text-gray-700">
                      {format(new Date(reference.startDate), 'dd MMM yyyy', { locale: dateLocale })}
                      {' - '}
                      {format(new Date(reference.endDate), 'dd MMM yyyy', { locale: dateLocale })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('organizations.projectReferences.fields.lastUpdated')}: {format(new Date(reference.updatedAt), 'dd MMM yyyy', { locale: dateLocale })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <OrganizationProjectReferenceDocumentsSection
              documents={reference.documents}
              editable={canManage}
              onAddDocuments={(documents) => addDocuments(reference.id, documents)}
              onReplaceDocument={(documentId, document) => replaceDocument(reference.id, documentId, document)}
              onRemoveDocument={(documentId) => removeDocument(reference.id, documentId)}
            />
          </div>
        </div>
      </PageContainer>

      <OrganizationProjectReferenceFormDialog
        open={isEditDialogOpen}
        mode="edit"
        initialReference={reference}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateReference}
      />
    </div>
  );
}
