import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CreditCard, Coins, ShieldAlert, Info, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation, useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { useCVCredits } from '@app/contexts/CVCreditsContext';
import { canManageOrganizationAdminActions, hasCreditsAccess } from '@app/services/permissions.service';
import { AccountSubMenu } from '@app/components/AccountSubMenu';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { Alert, AlertDescription } from '@app/components/ui/alert';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card';
import { Separator } from '@app/components/ui/separator';

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

const CREDIT_PACKS = [
  { id: 'pack-10', credits: 10, priceEur: 49 },
  { id: 'pack-25', credits: 25, priceEur: 109 },
  { id: 'pack-50', credits: 50, priceEur: 199 },
];

export default function AccountSubscriptionPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { availableCredits, creditsUsed, buyCredits } = useCVCredits();

  const isAdmin = canManageOrganizationAdminActions(user?.accountType, user?.role);
  const canViewCredits = hasCreditsAccess(user?.accountType);

  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionData | null>(null);

  useEffect(() => {
    const resolvedMemberType: 'expert' | 'organization' =
      user?.accountType === 'expert' ? 'expert' : 'organization';
    const saved = localStorage.getItem('assortis_current_subscription');
    if (!saved) {
      setCurrentSubscription(getDefaultSubscription(resolvedMemberType));
      return;
    }
    try {
      const parsed = JSON.parse(saved) as Partial<SubscriptionData>;
      setCurrentSubscription({ ...getDefaultSubscription(resolvedMemberType), ...parsed, memberType: resolvedMemberType });
    } catch {
      setCurrentSubscription(getDefaultSubscription(resolvedMemberType));
    }
  }, [user?.accountType]);

  const handleBuyCredits = (creditAmount: number) => {
    if (!isAdmin) return;
    buyCredits(creditAmount);
    toast.success(t('account.credits.purchase.success').replace('{count}', String(creditAmount)));
  };

  const isLowCredit = availableCredits <= 3;
  const planName = currentSubscription
    ? (currentSubscription.planName[language as 'fr' | 'en' | 'es'] ?? currentSubscription.planName.en)
    : '—';

  const statusKey = currentSubscription
    ? `account.subscription.plan.status.${currentSubscription.status}`
    : 'account.subscription.plan.status.inactive';

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    inactive: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        icon={CreditCard}
        title={t('account.subscription.banner.title')}
        description={t('account.subscription.banner.description')}
      />

      <AccountSubMenu activeTab="subscription" onTabChange={() => undefined} mode="profile-settings" />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6 space-y-6">

          {/* ── Current Plan ── */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="h-5 w-5 text-primary" />
                    {t('account.subscription.plan.title')}
                  </CardTitle>
                  <CardDescription className="mt-1">{planName}</CardDescription>
                </div>
                {currentSubscription && (
                  <Badge
                    variant="outline"
                    className={statusColors[currentSubscription.status]}
                  >
                    {t(statusKey)}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentSubscription && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">{t('account.subscription.plan.billing')}</p>
                    <p className="text-sm font-semibold mt-0.5">
                      {currentSubscription.billingCycle === 'monthly'
                        ? t('account.subscription.plan.monthly')
                        : t('account.subscription.plan.yearly')}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">{t('account.subscription.plan.renewal')}</p>
                    <p className="text-sm font-semibold mt-0.5">{currentSubscription.renewalDate}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">{t('account.subscription.plan.status')}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <p className="text-sm font-semibold">{t(statusKey)}</p>
                    </div>
                  </div>
                </div>
              )}

              {isAdmin ? (
                <div className="flex gap-2 flex-wrap pt-1">
                  <Button size="sm" onClick={() => navigate('/offers/change-plan')}>
                    <ArrowUpRight className="h-4 w-4 mr-1.5" />{t('account.subscription.plan.upgrade')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate('/offers/change-plan')}>
                    {t('account.subscription.plan.downgrade')}
                  </Button>
                </div>
              ) : (
                <Alert className="border-blue-100 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    {t('account.subscription.plan.adminOnly')}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* ── CV Credits ── */}
          {canViewCredits && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Coins className="h-5 w-5 text-accent" />
                      {t('account.subscription.credits.title')}
                    </CardTitle>
                    <CardDescription className="mt-1">{t('account.credits.banner.description')}</CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={isLowCredit ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-green-100 text-green-800 border-green-200'}
                  >
                    {availableCredits} {t('account.credits.unit')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLowCredit && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <ShieldAlert className="h-4 w-4 text-amber-700" />
                    <AlertDescription className="text-amber-900 text-sm">
                      {t('account.subscription.credits.lowBalance')}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">{t('account.subscription.credits.available')}</p>
                    <p className="text-2xl font-bold tabular-nums mt-0.5">{availableCredits}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">{t('account.subscription.credits.used')}</p>
                    <p className="text-2xl font-bold tabular-nums mt-0.5">{creditsUsed}</p>
                  </div>
                </div>

                {/* Buy packs — admin only */}
                {isAdmin ? (
                  <div>
                    <p className="text-sm font-medium mb-3">{t('account.credits.buySection.title')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {CREDIT_PACKS.map(pack => (
                        <div key={pack.id} className="rounded-xl border bg-white p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
                          <div>
                            <p className="text-xl font-bold">{pack.credits}</p>
                            <p className="text-xs text-muted-foreground">{t('account.credits.unit')}</p>
                          </div>
                          <p className="text-sm font-semibold text-primary">€{pack.priceEur}</p>
                          <p className="text-xs text-muted-foreground">
                            {t('account.credits.packUnlockInfo').replace('{count}', String(pack.credits))}
                          </p>
                          <Button size="sm" variant="outline" onClick={() => handleBuyCredits(pack.credits)}>
                            {t('account.subscription.credits.buyPack')}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Alert className="border-blue-100 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      {t('account.subscription.credits.adminOnly')}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

        </div>
      </PageContainer>
    </div>
  );
}
