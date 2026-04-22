import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { FilePlus2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OrganizationsSubMenu } from '@app/components/OrganizationsSubMenu';
import { TenderQuickCreateForm } from '@app/components/TenderQuickCreateForm';
import { Button } from '@app/components/ui/button';
import { Card, CardContent } from '@app/components/ui/card';
import { useTenderQuickCreate } from '@app/modules/shared/hooks/useTenderQuickCreate';
import { useOrganizationTenders } from '@app/modules/organization/hooks/useOrganizationTenders';

export default function OrganizationsCreateTender() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { createTender, isSubmitting } = useTenderQuickCreate();
  const { getTenderById, updateTender } = useOrganizationTenders();
  const isEditMode = Boolean(id);
  const currentTender = isEditMode ? getTenderById(id) : null;

  const handleCancel = () => {
    if (isEditMode && id) {
      navigate(`/organizations/my-tenders/${id}`);
      return;
    }

    navigate('/organizations');
  };

  const handleSubmit = async (payload: Parameters<typeof createTender>[0]) => {
    if (isEditMode && id) {
      const updated = await updateTender(id, payload);
      if (!updated) {
        toast.error(t('organizations.myTenders.detailNotFound.title'));
        navigate('/organizations/my-tenders');
        return;
      }

      toast.success(t('organizations.myTenders.update.success.title'), {
        description: t('organizations.myTenders.update.success.description', {
          title: payload.title,
        }),
      });

      navigate(`/organizations/my-tenders/${id}`);
      return;
    }

    await createTender(payload);

    toast.success(t('organizations.createTender.success.title'), {
      description: t('organizations.createTender.success.description', {
        title: payload.title,
      }),
    });

    navigate('/organizations');
  };

  if (isEditMode && !currentTender) {
    return (
      <div className="min-h-screen">
        <PageBanner
          title={t('organizations.myTenders.detailNotFound.title')}
          description={t('organizations.myTenders.detailNotFound.subtitle')}
          icon={Pencil}
        />

        <OrganizationsSubMenu />

        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-6">
            <Card className="border-primary/15 shadow-sm">
              <CardContent className="p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-700">{t('organizations.myTenders.detailNotFound.message')}</p>
                <Button className="min-h-11" onClick={() => navigate('/organizations/my-tenders')}>
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
    <div className="min-h-screen">
      <PageBanner
        title={isEditMode ? t('organizations.createTender.editPageTitle') : t('organizations.createTender.pageTitle')}
        description={t('organizations.createTender.pageSubtitle')}
        icon={isEditMode ? Pencil : FilePlus2}
      />

      <OrganizationsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <TenderQuickCreateForm
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            initialValues={currentTender ?? undefined}
            submitLabel={isEditMode ? t('organizations.createTender.actions.update') : undefined}
            submittingLabel={isEditMode ? t('organizations.createTender.actions.updating') : undefined}
          />
        </div>
      </PageContainer>
    </div>
  );
}
