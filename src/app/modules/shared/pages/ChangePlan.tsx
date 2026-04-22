import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useOffersHubContent } from '@app/hooks/useOffersContent';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OffersSubMenu } from '@app/components/OffersSubMenu';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@app/components/ui/radio-group';
import { Label } from '@app/components/ui/label';
import { 
  TrendingUp, 
  ArrowRight,
  ArrowLeft,
  Check,
  ArrowUp,
  ArrowDown,
  Info,
  CreditCard,
  Calendar
} from 'lucide-react';

type BillingCycle = 'monthly' | 'yearly';

interface CurrentSubscription {
  planId: string;
  memberType: 'organization' | 'expert';
  billingCycle: BillingCycle;
  renewalDate: string;
  monthlyPrice: number;
}

export default function ChangePlan() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { data: offersContent, loading: offersLoading } = useOffersHubContent();
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2; // 1: Select Plan, 2: Confirm & Billing
  
  // Load current subscription from localStorage or use mock data
  const [currentSubscription] = useState<CurrentSubscription>(() => {
    const savedSubscription = localStorage.getItem('assortis_current_subscription');
    if (savedSubscription) {
      try {
        const parsed = JSON.parse(savedSubscription);
        return {
          planId: parsed.planId,
          memberType: parsed.memberType || 'organization',
          billingCycle: parsed.billingCycle || 'yearly',
          renewalDate: parsed.renewalDate || '2026-04-27',
          monthlyPrice: parsed.price || 49,
        };
      } catch (e) {
        console.error('Error parsing subscription data:', e);
      }
    }
    // Fallback to mock data
    return {
      planId: 'org-professional',
      memberType: 'organization',
      billingCycle: 'yearly',
      renewalDate: '2026-04-27',
      monthlyPrice: 49,
    };
  });
  
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<BillingCycle>(
    currentSubscription.billingCycle
  );

  // Filtrer les plans en fonction du type de membre actuel (INCLURE le plan actuel)
  const availablePlans = offersContent?.plans.filter(plan => 
    plan.isActive && 
    plan.userType === currentSubscription.memberType &&
    plan.priceMonthly !== null && 
    plan.priceYearly !== null
  ) || [];

  const currentPlan = offersContent?.plans.find(p => p.id === currentSubscription.planId);
  
  // Déterminer le plan effectif (sélectionné ou actuel si seul le cycle change)
  const getEffectivePlan = () => {
    if (selectedPlanId) {
      return availablePlans.find(p => p.id === selectedPlanId);
    }
    // Si aucun plan n'est sélectionné, utiliser le plan actuel
    return currentPlan;
  };
  
  const effectivePlan = getEffectivePlan();
  
  // Vérifier si un changement a été effectué
  const hasChanges = () => {
    const planChanged = selectedPlanId !== null && selectedPlanId !== currentSubscription.planId;
    const cycleChanged = selectedBillingCycle !== currentSubscription.billingCycle;
    return planChanged || cycleChanged;
  };
  
  // Déterminer si c'est une mise à niveau ou rétrogradation
  const isUpgradeOrDowngrade = () => {
    if (!effectivePlan || !currentPlan) return null;
    
    const currentPrice = currentSubscription.billingCycle === 'monthly'
      ? (currentPlan.priceMonthly || 0)
      : (currentPlan.priceYearly || 0);
    
    const newPrice = selectedBillingCycle === 'monthly'
      ? (effectivePlan.priceMonthly || 0)
      : (effectivePlan.priceYearly || 0);
    
    if (newPrice > currentPrice) return 'upgrade';
    if (newPrice < currentPrice) return 'downgrade';
    return 'same';
  };

  // Calculs de facturation prorata
  const calculateDaysRemaining = () => {
    const renewal = new Date(currentSubscription.renewalDate);
    const today = new Date();
    const diffTime = Math.abs(renewal.getTime() - today.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateProrata = () => {
    if (!effectivePlan) return null;
    
    const daysRemaining = calculateDaysRemaining();
    const currentMonthlyPrice = currentSubscription.monthlyPrice;
    const newMonthlyPrice = selectedBillingCycle === 'monthly' 
      ? (effectivePlan.priceMonthly || 0) 
      : ((effectivePlan.priceYearly || 0) / 12);
    
    const daysInMonth = 30;
    const currentDailyRate = currentMonthlyPrice / daysInMonth;
    const newDailyRate = newMonthlyPrice / daysInMonth;
    
    const creditFromCurrentPlan = currentDailyRate * daysRemaining;
    const costForNewPlan = newDailyRate * daysRemaining;
    const difference = costForNewPlan - creditFromCurrentPlan;
    
    return {
      daysRemaining,
      currentMonthlyPrice,
      newMonthlyPrice: Math.round(newMonthlyPrice * 100) / 100,
      creditFromCurrentPlan: Math.round(creditFromCurrentPlan * 100) / 100,
      costForNewPlan: Math.round(costForNewPlan * 100) / 100,
      difference: Math.round(difference * 100) / 100,
      isUpgrade: difference > 0,
      isDowngrade: difference < 0,
    };
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Rediriger vers checkout avec les données de changement de plan
      const changeData = {
        type: 'plan_change',
        currentPlanId: currentSubscription.planId,
        newPlanId: selectedPlanId || currentSubscription.planId, // Utiliser le plan actuel si seul le cycle change
        billingCycle: selectedBillingCycle,
        memberType: currentSubscription.memberType,
        prorataCalculation: calculateProrata(),
        changeType: isUpgradeOrDowngrade(),
      };
      
      localStorage.setItem('assortis_plan_change_data', JSON.stringify(changeData));
      
      navigate('/offers/checkout', { 
        state: changeData
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/offers/member-area');
    }
  };

  const getPrice = (plan: any) => {
    return selectedBillingCycle === 'monthly' 
      ? plan.priceMonthly 
      : plan.priceYearly;
  };

  const getCurrentPlanPrice = () => {
    if (!currentPlan) return 0;
    return currentSubscription.billingCycle === 'monthly'
      ? currentPlan.priceMonthly || 0
      : currentPlan.priceYearly || 0;
  };

  return (
    <main>
      <PageBanner 
        icon={TrendingUp}
        title={t('offers.changePlan.title')} 
        description={t('offers.changePlan.subtitle')}
      />
      
      <OffersSubMenu />
      
      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="max-w-5xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2">
                {[1, 2].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      currentStep >= step 
                        ? 'bg-accent border-accent text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {currentStep > step ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span className="font-semibold">{step}</span>
                      )}
                    </div>
                    {step < 2 && (
                      <div className={`w-16 h-1 mx-2 ${
                        currentStep > step ? 'bg-accent' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-20 mt-3">
                <span className={`text-sm font-medium ${
                  currentStep >= 1 ? 'text-accent' : 'text-gray-500'
                }`}>
                  {t('offers.changePlan.step1')}
                </span>
                <span className={`text-sm font-medium ${
                  currentStep >= 2 ? 'text-accent' : 'text-gray-500'
                }`}>
                  {t('offers.changePlan.step2')}
                </span>
              </div>
            </div>

            {/* Current Plan Info */}
            {currentPlan && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">{t('offers.changePlan.currentPlanInfo')}</h3>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">{currentPlan.name[language] || currentPlan.name.en}</span>
                      {' - '}
                      <span>{getCurrentPlanPrice()}€/{currentSubscription.billingCycle === 'monthly' ? t('offers.month') : t('offers.year')}</span>
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {t('offers.changePlan.renewsOn')} {new Date(currentSubscription.renewalDate).toLocaleDateString(language)}
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    {currentSubscription.memberType === 'organization' 
                      ? t('offers.types.organization')
                      : t('offers.types.expert')
                    }
                  </Badge>
                </div>
              </div>
            )}

            {/* Step 1: Select New Plan */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Billing Cycle Toggle */}
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('offers.changePlan.selectBillingCycle')}
                  </h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setSelectedBillingCycle('monthly')}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                        selectedBillingCycle === 'monthly'
                          ? 'border-accent bg-accent/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{t('offers.billingCycle.monthly')}</div>
                      <div className="text-sm text-gray-600">{t('offers.billingCycle.monthlyDesc')}</div>
                    </button>
                    <button
                      onClick={() => setSelectedBillingCycle('yearly')}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all relative ${
                        selectedBillingCycle === 'yearly'
                          ? 'border-accent bg-accent/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Badge className="absolute -top-3 right-4 bg-green-600 text-white hover:bg-green-600">
                        {t('offers.save20')}
                      </Badge>
                      <div className="font-semibold text-gray-900">{t('offers.billingCycle.yearly')}</div>
                      <div className="text-sm text-gray-600">{t('offers.billingCycle.yearlyDesc')}</div>
                    </button>
                  </div>
                </div>

                {/* Plans Selection */}
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('offers.changePlan.selectNewPlan')}
                  </h3>
                  
                  {offersLoading ? (
                    <div className="text-center py-8 text-gray-500">
                      {t('offers.loading')}
                    </div>
                  ) : availablePlans.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {t('offers.changePlan.noOtherPlans')}
                    </div>
                  ) : (
                    <>
                      {/* Message informatif si seul le cycle change */}
                      {selectedBillingCycle !== currentSubscription.billingCycle && !selectedPlanId && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-blue-800">
                            <Info className="h-4 w-4 inline mr-2" />
                            {selectedBillingCycle === 'monthly' 
                              ? t('offers.changePlan.switchToMonthly', 'Vous passez à une facturation mensuelle. Vous pouvez également changer de plan ci-dessous.')
                              : t('offers.changePlan.switchToYearly', 'Vous passez à une facturation annuelle pour économiser 20%. Vous pouvez également changer de plan ci-dessous.')
                            }
                          </p>
                        </div>
                      )}
                      
                      <RadioGroup
                        value={selectedPlanId || ''}
                        onValueChange={setSelectedPlanId}
                        className="space-y-3"
                      >
                        {availablePlans.map((plan) => {
                          const planName = plan.name[language] || plan.name.en;
                          const planPrice = getPrice(plan);
                          const currentPrice = getCurrentPlanPrice();
                          const isCurrentPlan = plan.id === currentSubscription.planId;
                          
                          // Calculer si c'est une mise à niveau ou rétrogradation
                          // en tenant compte du nouveau cycle de facturation
                          const newPlanPrice = selectedBillingCycle === 'monthly'
                            ? (plan.priceMonthly || 0)
                            : (plan.priceYearly || 0);
                          const currentFullPrice = currentSubscription.billingCycle === 'monthly'
                            ? (currentPlan?.priceMonthly || 0)
                            : (currentPlan?.priceYearly || 0);
                          const isUpgrade = newPlanPrice > currentFullPrice;
                          
                          return (
                            <div 
                              key={plan.id}
                              className={`relative flex items-start space-x-4 p-5 rounded-lg border-2 hover:bg-gray-50 transition-all cursor-pointer ${
                                selectedPlanId === plan.id 
                                  ? 'border-accent bg-accent/5' 
                                  : isCurrentPlan
                                  ? 'border-blue-300 bg-blue-50/50'
                                  : 'border-gray-200'
                              }`}
                            >
                              {/* Badge pour le plan actuel */}
                              {isCurrentPlan && (
                                <Badge className="absolute -top-3 left-4 bg-blue-600 text-white hover:bg-blue-600">
                                  {t('offers.hub.currentPlan')}
                                </Badge>
                              )}
                              
                              {/* Badge recommandé */}
                              {plan.highlighted && !isCurrentPlan && (
                                <Badge className="absolute -top-3 left-4 bg-accent text-white hover:bg-accent">
                                  {t('offers.recommended')}
                                </Badge>
                              )}
                              
                              <RadioGroupItem value={plan.id} id={`plan-${plan.id}`} className="mt-1" />
                              <Label htmlFor={`plan-${plan.id}`} className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <div className="font-semibold text-lg text-gray-900">{planName}</div>
                                    <div className="text-2xl font-bold text-accent mt-1">
                                      {planPrice}€
                                      <span className="text-sm text-gray-600 font-normal">
                                        /{selectedBillingCycle === 'monthly' ? t('offers.month') : t('offers.year')}
                                      </span>
                                    </div>
                                  </div>
                                  {!isCurrentPlan && (
                                    <>
                                      {isUpgrade ? (
                                        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                                          <ArrowUp className="h-3 w-3 mr-1" />
                                          {t('offers.member.upgrade')}
                                        </Badge>
                                      ) : (
                                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                          <ArrowDown className="h-3 w-3 mr-1" />
                                          {t('offers.member.downgrade')}
                                        </Badge>
                                      )}
                                    </>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                  {plan.description[language] || plan.description.en}
                                </p>
                                <div className="space-y-2">
                                  {plan.features && plan.features.length > 0 && plan.features.slice(0, 4).map((feature: any, idx: number) => (
                                    <div key={feature.id || idx} className="flex items-start gap-2 text-sm text-gray-700">
                                      <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                      <span>
                                        {feature.textKey 
                                          ? t(feature.textKey, feature.values || {})
                                          : (feature.name 
                                            ? (feature.name[language] || feature.name.en || feature.name.fr || feature)
                                            : feature
                                          )
                                        }
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </Label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Confirm & Billing Details */}
            {currentStep === 2 && effectivePlan && (
              <div className="space-y-6">
                {/* Plan Comparison */}
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('offers.changePlan.planComparison')}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs uppercase text-gray-500 mb-2 block">
                        {t('offers.member.currentPlan')}
                      </Label>
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <div className="font-semibold text-gray-900">
                          {currentPlan?.name[language] || currentPlan?.name.en}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {getCurrentPlanPrice()}€/{currentSubscription.billingCycle === 'monthly' ? t('offers.month') : t('offers.year')}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs uppercase text-gray-500 mb-2 block">
                        {t('offers.member.newPlan')}
                      </Label>
                      <div className="bg-accent/5 rounded-lg p-4 border-2 border-accent">
                        <div className="font-semibold text-accent">
                          {effectivePlan.name[language] || effectivePlan.name.en}
                        </div>
                        <div className="text-sm text-gray-700 mt-1">
                          {getPrice(effectivePlan)}€/{selectedBillingCycle === 'monthly' ? t('offers.month') : t('offers.year')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing Cycle Summary */}
                {(() => {
                  const prorata = calculateProrata();
                  if (!prorata) return null;
                  
                  return (
                    <div className="bg-white rounded-lg border p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="h-5 w-5 text-accent" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {t('offers.member.billingCycleSummary')}
                        </h3>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="space-y-3 text-sm">
                          {/* Days Remaining */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <span className="text-gray-700">{t('offers.member.daysRemaining')}</span>
                            </div>
                            <span className="font-semibold text-gray-900">{prorata.daysRemaining} jours</span>
                          </div>
                          
                          <div className="border-t border-blue-200 my-2"></div>
                          
                          {/* Credit from current plan */}
                          <div className="flex justify-between">
                            <span className="text-gray-700">{t('offers.member.creditFromCurrentPlan')}</span>
                            <span className="font-semibold text-green-700">
                              -{prorata.creditFromCurrentPlan.toFixed(2)}€
                            </span>
                          </div>
                          
                          {/* Cost for new plan */}
                          <div className="flex justify-between">
                            <span className="text-gray-700">{t('offers.member.costForNewPlan')}</span>
                            <span className="font-semibold text-gray-900">
                              +{prorata.costForNewPlan.toFixed(2)}€
                            </span>
                          </div>
                          
                          <div className="border-t border-blue-300 my-2"></div>
                          
                          {/* Total Difference */}
                          <div className="flex justify-between items-center bg-blue-100 -mx-4 -mb-4 p-4 rounded-b-lg">
                            <span className="font-semibold text-gray-900">{t('offers.member.difference')}</span>
                            <div className="flex items-center gap-2">
                              {prorata.isUpgrade ? (
                                <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                                  <ArrowUp className="h-3 w-3 mr-1" />
                                  {t('offers.member.upgrade')}
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                  <ArrowDown className="h-3 w-3 mr-1" />
                                  {t('offers.member.downgrade')}
                                </Badge>
                              )}
                              <span className={`font-bold text-xl ${
                                prorata.isUpgrade ? 'text-orange-700' : 'text-green-700'
                              }`}>
                                {prorata.difference >= 0 ? '+' : ''}{prorata.difference.toFixed(2)}€
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Explanation */}
                      <div className="bg-gray-50 border rounded-lg p-3 mt-4">
                        <p className="text-xs text-gray-600">
                          {prorata.isUpgrade 
                            ? t('offers.member.upgradeExplanation') 
                            : t('offers.member.downgradeExplanation')
                          }
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Next Billing Date */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">
                        {t('offers.changePlan.effectiveImmediately')}
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        {t('offers.changePlan.nextBillingDate')}: {new Date(currentSubscription.renewalDate).toLocaleDateString(language)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="h-11 px-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {currentStep === 1 ? t('offers.cancel') : t('offers.back')}
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={currentStep === 1 && !hasChanges()}
                className="bg-accent hover:bg-accent/90 h-11 px-8"
              >
                {currentStep === totalSteps ? (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    {t('offers.proceedToPayment')}
                  </>
                ) : (
                  <>
                    {t('offers.continue')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </main>
  );
}