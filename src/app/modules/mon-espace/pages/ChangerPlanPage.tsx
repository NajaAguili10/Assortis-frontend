import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useOffersHubContent } from '../../../hooks/useOffersContent';
import { PageBanner } from '../../../components/PageBanner';
import { PageContainer } from '../../../components/PageContainer';
import { MonEspaceSubMenu } from '../../../components/MonEspaceSubMenu';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { Label } from '../../../components/ui/label';
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

/**
 * Page Changer de Plan - Module Mon Espace
 * Affiche le sous-menu Mon Espace (pas Nos Offres)
 */

type BillingCycle = 'monthly' | 'yearly';

interface CurrentSubscription {
  planId: string;
  memberType: 'organization' | 'expert';
  billingCycle: BillingCycle;
  renewalDate: string;
  monthlyPrice: number;
}

export default function ChangerPlanPage() {
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
          planId: parsed.planId || 'org-professional',
          memberType: parsed.memberType || 'organization',
          billingCycle: parsed.billingCycle || 'monthly',
          renewalDate: parsed.renewalDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          monthlyPrice: parsed.price || 99
        };
      } catch (e) {
        console.error('Error parsing subscription:', e);
      }
    }
    // Default mock data
    return {
      planId: 'org-professional',
      memberType: 'organization',
      billingCycle: 'monthly',
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      monthlyPrice: 99
    };
  });

  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<BillingCycle>(currentSubscription.billingCycle);

  // Get current plan details
  const currentPlan = offersContent?.plans?.find(p => p.id === currentSubscription.planId);
  
  // Get selected plan details
  const selectedPlan = offersContent?.plans?.find(p => p.id === selectedPlanId);

  // Filter plans by member type
  const availablePlans = offersContent?.plans?.filter(
    plan => plan.userType === currentSubscription.memberType
  ) || [];

  useEffect(() => {
    // Do NOT pre-select current plan - let user choose explicitly
    // This prevents the button from being disabled by default
  }, []);

  const getCurrentPlanPrice = () => {
    if (!currentPlan) return 0;
    return currentSubscription.billingCycle === 'monthly' 
      ? currentPlan.priceMonthly 
      : currentPlan.priceYearly;
  };

  const getSelectedPlanPrice = () => {
    if (!selectedPlan) return 0;
    return selectedBillingCycle === 'monthly' 
      ? selectedPlan.priceMonthly 
      : selectedPlan.priceYearly;
  };

  const calculatePriceChange = () => {
    const currentPrice = getCurrentPlanPrice();
    const newPrice = getSelectedPlanPrice();
    return newPrice - currentPrice;
  };

  const isUpgrade = () => {
    return calculatePriceChange() > 0;
  };

  // Check if there's any change from current subscription
  const hasChanges = () => {
    return selectedPlanId !== currentSubscription.planId || 
           selectedBillingCycle !== currentSubscription.billingCycle;
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - navigate to checkout
      const checkoutData = {
        planId: selectedPlanId,
        billingCycle: selectedBillingCycle,
        isChangePlan: true,
        previousPlanId: currentSubscription.planId,
        previousBillingCycle: currentSubscription.billingCycle
      };
      localStorage.setItem('assortis_checkout_data', JSON.stringify(checkoutData));
      navigate('/mon-espace/checkout');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/compte-utilisateur/espace-membre');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const localeMap = {
      en: 'en-US',
      fr: 'fr-FR',
      es: 'es-ES'
    };
    return date.toLocaleDateString(localeMap[language as keyof typeof localeMap] || 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (offersLoading) {
    return (
      <>
        <PageBanner
          icon={TrendingUp}
          title={t('offers.changePlan.title')}
          description={t('offers.changePlan.subtitle')}
        />
        <MonEspaceSubMenu />
        <PageContainer className="my-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            <p className="mt-4 text-gray-600">{t('offers.loading')}</p>
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <PageBanner
        icon={TrendingUp}
        title={t('offers.changePlan.title')}
        description={language === 'fr' 
          ? "Gérez votre abonnement depuis Mon Espace" 
          : language === 'es'
          ? "Administre su suscripción desde Mi Espacio"
          : "Manage your subscription from My Space"
        }
      />
      
      <MonEspaceSubMenu />
      
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
                        <span className="text-sm font-semibold">{step}</span>
                      )}
                    </div>
                    {step < totalSteps && (
                      <div className={`h-0.5 w-20 mx-2 ${
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
                      <Calendar className="inline h-3 w-3 mr-1" />
                      {t('offers.changePlan.renewalDate')}: {formatDate(currentSubscription.renewalDate)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Select Plan */}
            {currentStep === 1 && (
              <div>
                {/* Billing Cycle Toggle */}
                <div className="mb-6 flex justify-center">
                  <div className="inline-flex rounded-lg border border-gray-200 p-1">
                    <button
                      onClick={() => setSelectedBillingCycle('monthly')}
                      className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedBillingCycle === 'monthly'
                          ? 'bg-accent text-white'
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      {t('offers.monthly')}
                    </button>
                    <button
                      onClick={() => setSelectedBillingCycle('yearly')}
                      className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedBillingCycle === 'yearly'
                          ? 'bg-accent text-white'
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      {t('offers.yearly')}
                      <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                        {t('offers.save')} 20%
                      </Badge>
                    </button>
                  </div>
                </div>

                {/* Plans Selection */}
                <RadioGroup value={selectedPlanId} onValueChange={setSelectedPlanId}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availablePlans.length === 0 ? (
                      <div className="col-span-full text-center py-12">
                        <p className="text-gray-500">
                          {language === 'fr' 
                            ? 'Aucun plan disponible pour votre type de compte' 
                            : language === 'es'
                            ? 'No hay planes disponibles para su tipo de cuenta'
                            : 'No plans available for your account type'
                          }
                        </p>
                      </div>
                    ) : (
                      availablePlans.map((plan) => {
                        const price = selectedBillingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
                        const isCurrentPlan = plan.id === currentSubscription.planId;
                        
                        return (
                          <div key={plan.id} className="relative">
                            <Label
                              htmlFor={plan.id}
                              className={`flex flex-col h-full cursor-pointer rounded-lg border-2 p-6 transition-all ${
                                selectedPlanId === plan.id
                                  ? 'border-accent bg-accent/5'
                                  : 'border-gray-200 hover:border-accent/50'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-lg font-semibold">{plan.name[language] || plan.name.en}</h3>
                                  {isCurrentPlan && (
                                    <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-700">
                                      {t('offers.changePlan.currentPlan')}
                                    </Badge>
                                  )}
                                </div>
                                <RadioGroupItem value={plan.id} id={plan.id} />
                              </div>
                              <div className="mb-4">
                                <div className="flex items-baseline">
                                  <span className="text-3xl font-bold">{price}€</span>
                                  <span className="text-gray-600 ml-2">
                                    /{selectedBillingCycle === 'monthly' ? t('offers.month') : t('offers.year')}
                                  </span>
                                </div>
                                {selectedBillingCycle === 'yearly' && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {Math.round(price / 12)}€/{t('offers.month')}
                                  </p>
                                )}
                              </div>
                              <ul className="space-y-2 flex-1">
                                {plan.features.map((feature, index) => (
                                  <li key={feature.id || index} className="flex items-start gap-2 text-sm">
                                    <Check className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                                    <span>{t(feature.textKey, feature.values || {})}</span>
                                  </li>
                                ))}
                              </ul>
                            </Label>
                          </div>
                        );
                      })
                    )}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Step 2: Confirm & Billing */}
            {currentStep === 2 && selectedPlan && (
              <div>
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">{t('offers.changePlan.summary')}</h3>
                  
                  <div className="space-y-4">
                    {/* Current Plan */}
                    <div className="flex items-center justify-between pb-4 border-b">
                      <div>
                        <p className="text-sm text-gray-600">{t('offers.changePlan.currentPlan')}</p>
                        <p className="font-medium">{currentPlan?.name[language] || currentPlan?.name.en}</p>
                      </div>
                      <p className="font-semibold">{getCurrentPlanPrice()}€/{currentSubscription.billingCycle === 'monthly' ? t('offers.month') : t('offers.year')}</p>
                    </div>

                    {/* New Plan */}
                    <div className="flex items-center justify-between pb-4 border-b">
                      <div>
                        <p className="text-sm text-gray-600">{t('offers.changePlan.newPlan')}</p>
                        <p className="font-medium">{selectedPlan.name[language] || selectedPlan.name.en}</p>
                      </div>
                      <p className="font-semibold">{getSelectedPlanPrice()}€/{selectedBillingCycle === 'monthly' ? t('offers.month') : t('offers.year')}</p>
                    </div>

                    {/* Price Difference */}
                    <div className={`flex items-center justify-between p-4 rounded-lg ${
                      isUpgrade() ? 'bg-orange-50' : 'bg-green-50'
                    }`}>
                      <div className="flex items-center gap-2">
                        {isUpgrade() ? (
                          <ArrowUp className="h-5 w-5 text-orange-600" />
                        ) : (
                          <ArrowDown className="h-5 w-5 text-green-600" />
                        )}
                        <div>
                          <p className={`font-medium ${isUpgrade() ? 'text-orange-900' : 'text-green-900'}`}>
                            {isUpgrade() ? t('offers.changePlan.upgrade') : t('offers.changePlan.downgrade')}
                          </p>
                          <p className={`text-sm ${isUpgrade() ? 'text-orange-700' : 'text-green-700'}`}>
                            {t('offers.changePlan.priceChange')}
                          </p>
                        </div>
                      </div>
                      <p className={`text-xl font-bold ${isUpgrade() ? 'text-orange-600' : 'text-green-600'}`}>
                        {isUpgrade() ? '+' : ''}{calculatePriceChange()}€
                      </p>
                    </div>

                    {/* Billing Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <CreditCard className="h-5 w-5 text-gray-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">{t('offers.changePlan.billingInfo')}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {isUpgrade() 
                              ? t('offers.changePlan.billingInfoUpgrade')
                              : t('offers.changePlan.billingInfoDowngrade')
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {currentStep === 1 ? t('offers.changePlan.cancel') : t('offers.changePlan.previous')}
              </Button>
              <div className="flex flex-col items-end gap-2">
                <Button
                  onClick={handleNextStep}
                  disabled={!selectedPlanId || !hasChanges()}
                  className="flex items-center gap-2"
                >
                  {currentStep === totalSteps ? t('offers.changePlan.confirm') : t('offers.changePlan.next')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                {selectedPlanId && !hasChanges() && currentStep === 1 && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {t('offers.changePlan.selectPlanHint')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}