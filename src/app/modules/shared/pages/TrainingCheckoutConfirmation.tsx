import { useLocation, useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { Button } from '@app/components/ui/button';
import { CheckCircle2, FolderKanban, ShieldCheck } from 'lucide-react';

interface CheckoutConfirmationState {
  purchasedCount?: number;
  purchasedTitles?: string[];
}

export default function TrainingCheckoutConfirmation() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as CheckoutConfirmationState;

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('training.checkout.successTitle')}
        description={t('training.checkout.successSubtitle')}
        icon={ShieldCheck}
      />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="max-w-3xl mx-auto bg-white rounded-lg border p-8">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-primary">{t('training.checkout.success')}</h2>
            </div>

            <p className="text-muted-foreground mb-5">{t('training.checkout.successMessage')}</p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="font-medium text-green-900">
                {t('training.checkout.purchasedCount')} {state.purchasedCount ?? 0}
              </p>
              <ul className="mt-2 text-sm text-green-800 space-y-1">
                {(state.purchasedTitles ?? []).map((title) => (
                  <li key={title}>- {title}</li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button className="bg-[#B82547] hover:bg-[#a01f3c] text-white" onClick={() => navigate('/training/activated-pills')}>
                {t('training.checkout.goActivated')}
              </Button>
              <Button variant="outline" onClick={() => navigate('/training/portfolio')}>
                <FolderKanban className="w-4 h-4 mr-2" />
                {t('training.checkout.goPortfolio')}
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
