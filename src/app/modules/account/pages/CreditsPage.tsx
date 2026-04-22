import { Navigate } from 'react-router';
import { Coins, CreditCard, History, Info, ShieldAlert } from 'lucide-react';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { useCVCredits } from '@app/contexts/CVCreditsContext';
import { hasCreditsAccess } from '@app/services/permissions.service';
import { AccountSubMenu } from '@app/components/AccountSubMenu';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { Alert, AlertDescription } from '@app/components/ui/alert';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card';
import { toast } from 'sonner';

const CREDIT_PACKS = [
  { id: 'pack-10', credits: 10, priceEur: 49 },
  { id: 'pack-25', credits: 25, priceEur: 109 },
  { id: 'pack-50', credits: 50, priceEur: 199 },
];

export default function CreditsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { availableCredits, creditsUsed, usageHistory, buyCredits } = useCVCredits();

  const canAccessCreditsPage = hasCreditsAccess(user?.accountType);

  if (!canAccessCreditsPage) {
    return <Navigate to="/compte-utilisateur" replace />;
  }

  const unlockPotential = Math.floor(availableCredits / 1);
  const isLowCredit = availableCredits <= 3;
  const balanceBadgeClass = isLowCredit
    ? 'bg-amber-100 text-amber-800 border-amber-200'
    : 'bg-green-100 text-green-800 border-green-200';

  const handleBuyCredits = (creditAmount: number) => {
    buyCredits(creditAmount);
    toast.success(t('account.credits.purchase.success', { count: creditAmount }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        icon={Coins}
        title={t('account.credits.banner.title')}
        description={t('account.credits.banner.description')}
      />

      <AccountSubMenu activeTab="credits" onTabChange={() => undefined} mode="profile-settings" />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6 space-y-6">
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-accent" />
                    {t('account.credits.banner.title')}
                  </CardTitle>
                  <CardDescription>{t('account.credits.banner.description')}</CardDescription>
                </div>
                <Badge variant="outline" className={balanceBadgeClass}>
                  {availableCredits} {t('account.credits.unit')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLowCredit && (
                <Alert className="border-amber-200 bg-amber-50">
                  <ShieldAlert className="h-4 w-4 text-amber-700" />
                  <AlertDescription className="text-amber-900">
                    {t('account.credits.lowBalanceWarning')}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 p-4 bg-white">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {t('account.credits.metrics.available')}
                  </p>
                  <p className="text-2xl font-semibold text-foreground">{availableCredits}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 bg-white">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {t('account.credits.metrics.used')}
                  </p>
                  <p className="text-2xl font-semibold text-foreground">{creditsUsed}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 bg-white">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {t('account.credits.metrics.unlockPotential')}
                  </p>
                  <p className="text-base font-semibold text-foreground leading-snug">
                    {t('account.credits.metrics.unlockPotentialValue', { count: unlockPotential })}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-accent/25 bg-accent/5 p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-accent mt-0.5" />
                <p className="text-sm text-foreground leading-relaxed">
                  {t('account.credits.howItWorks.step1.description')}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-accent" />
                  {t('account.credits.buySection.title')}
                </CardTitle>
                <CardDescription>{t('account.credits.buySection.description')}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CREDIT_PACKS.map((pack) => (
                  <div
                    key={pack.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 space-y-4 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Badge variant="outline">
                        {pack.credits} {t('account.credits.unit')}
                      </Badge>
                      <span className="text-lg font-semibold text-accent">EUR {pack.priceEur}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t('account.credits.packUnlockInfo', { count: pack.credits })}
                    </p>
                    <Button className="w-full min-h-11" onClick={() => handleBuyCredits(pack.credits)}>
                      {t('account.credits.buyNow')}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-accent" />
                  {t('account.credits.history.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usageHistory.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/80 p-4">
                    <p className="text-sm text-muted-foreground">{t('account.credits.history.empty')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {usageHistory.slice(0, 8).map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-primary truncate">{entry.expertName}</p>
                          <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                        </div>
                        <Badge variant="secondary">-{entry.creditsSpent}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-accent" />
                {t('account.credits.howItWorks.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border border-gray-200 p-4 bg-white">
                <p className="text-sm font-semibold text-primary mb-1">{t('account.credits.howItWorks.step1.title')}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('account.credits.howItWorks.step1.description')}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4 bg-white">
                <p className="text-sm font-semibold text-primary mb-1">{t('account.credits.howItWorks.step2.title')}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('account.credits.howItWorks.step2.description')}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4 bg-white">
                <p className="text-sm font-semibold text-primary mb-1">{t('account.credits.howItWorks.step3.title')}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('account.credits.howItWorks.step3.description')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </div>
  );
}
