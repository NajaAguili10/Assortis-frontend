import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useOffersHubContent } from '@app/hooks/useOffersContent';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OffersSubMenu } from '@app/components/OffersSubMenu';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Checkbox } from '@app/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  CreditCard, 
  Lock,
  Loader2
} from 'lucide-react';

export default function Checkout() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: offersContent, loading: offersLoading } = useOffersHubContent();
  
  // Récupérer les données depuis location.state ou localStorage
  let checkoutData = location.state;
  
  if (!checkoutData) {
    // Vérifier d'abord s'il y a des données de changement de plan
    const planChangeData = localStorage.getItem('assortis_plan_change_data');
    if (planChangeData) {
      try {
        checkoutData = JSON.parse(planChangeData);
      } catch (e) {
        console.error('Error parsing plan change data from localStorage', e);
      }
    }
    
    // Sinon, vérifier les données de checkout normales
    if (!checkoutData) {
      const savedData = localStorage.getItem('assortis_checkout_data');
      if (savedData) {
        try {
          checkoutData = JSON.parse(savedData);
        } catch (e) {
          console.error('Error parsing checkout data from localStorage', e);
        }
      }
    }
  }
  
  // Gérer les deux types de flux: inscription normale et changement de plan
  const isPlanChange = checkoutData?.type === 'plan_change';
  
  // Pour le changement de plan
  const planId = isPlanChange ? checkoutData?.newPlanId : checkoutData?.planId;
  const billingCycle = checkoutData?.billingCycle;
  const formData = checkoutData?.formData;
  const memberType = isPlanChange ? checkoutData?.memberType : formData?.memberType;
  const prorataCalculation = checkoutData?.prorataCalculation;
  
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  // Rediriger si les données nécessaires sont manquantes
  useEffect(() => {
    if ((!planId || !billingCycle) && !hasRedirected) {
      setHasRedirected(true);
      toast.error(t('offers.error.missingData'));
      
      // Rediriger vers la page appropriée selon le type de flux
      if (isPlanChange) {
        navigate('/offers/change-plan');
      } else {
        // Rediriger vers la page des offres avec le userType si disponible
        const userType = memberType || formData?.memberType;
        if (userType) {
          navigate(`/offers/become-member?userType=${userType}`);
        } else {
          navigate('/offers');
        }
      }
    }
  }, [planId, billingCycle, navigate, t, hasRedirected, isPlanChange, memberType, formData]);

  // Nettoyer localStorage après récupération réussie (seulement au démontage)
  useEffect(() => {
    return () => {
      if (planId && billingCycle) {
        if (isPlanChange) {
          localStorage.removeItem('assortis_plan_change_data');
        } else {
          localStorage.removeItem('assortis_checkout_data');
        }
      }
    };
  }, [planId, billingCycle, isPlanChange]);

  // Calculer le prix depuis offersContent
  const selectedPlan = offersContent?.plans.find(p => p.id === planId);
  const basePrice = selectedPlan 
    ? (billingCycle === 'monthly' ? selectedPlan.priceMonthly : selectedPlan.priceYearly) || 0
    : 0;
  
  // Pour le changement de plan, utiliser le montant prorata
  const totalPrice = isPlanChange && prorataCalculation 
    ? Math.max(0, prorataCalculation.difference)  // Si négatif (downgrade), afficher 0
    : basePrice;

  const handlePayment = async () => {
    if (!termsAccepted) {
      toast.error(t('offers.error.terms'));
      return;
    }

    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      
      // Simulate sending confirmation email
      const email = formData?.orgEmail || formData?.expertEmail || 'user@example.com';
      
      // Save current subscription to localStorage after successful payment
      if (selectedPlan && planId && billingCycle) {
        const renewalDate = new Date();
        if (billingCycle === 'monthly') {
          renewalDate.setMonth(renewalDate.getMonth() + 1);
        } else {
          renewalDate.setFullYear(renewalDate.getFullYear() + 1);
        }
        
        const subscriptionData = {
          planId: planId,
          planName: selectedPlan.name, // { fr, en, es }
          price: basePrice,
          billingCycle: billingCycle,
          renewalDate: renewalDate.toISOString().split('T')[0],
          memberType: memberType,
          status: 'active'
        };
        
        localStorage.setItem('assortis_current_subscription', JSON.stringify(subscriptionData));
      }
      
      if (isPlanChange) {
        toast.success(t('offers.member.planChanged'));
      } else {
        toast.success(t('offers.success.payment'));
      }
      
      // Navigate to appropriate page
      if (isPlanChange) {
        navigate('/offers/member-area');
      } else {
        navigate('/offers/confirmation', {
          state: {
            email,
            planId,
            memberType,
          }
        });
      }
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  return (
    <>
      <PageBanner
        icon={CreditCard}
        title={t('offers.payment.title')}
        subtitle={t('offers.payment.securePayment')}
      />
      
      {/* Sub Menu */}
      <OffersSubMenu />
      
      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">{/* Payment Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Card Information */}
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Lock className="h-5 w-5 text-green-600" strokeWidth={2} />
                    <h3 className="text-lg font-bold text-primary">
                      {t('offers.payment.securePayment')}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardName">{t('offers.payment.cardName')}</Label>
                      <Input
                        id="cardName"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder={t('offers.payment.cardNamePlaceholder')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">{t('offers.payment.cardNumber')}</Label>
                      <Input
                        id="cardNumber"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value.slice(0, 19)))}
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardExpiry">{t('offers.payment.cardExpiry')}</Label>
                        <Input
                          id="cardExpiry"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value.slice(0, 5)))}
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardCvc">{t('offers.payment.cardCvc')}</Label>
                        <Input
                          id="cardCvc"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          placeholder="123"
                          maxLength={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Test card info */}
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                    <strong>Test mode:</strong> Use card 4242 4242 4242 4242, any future expiry, any CVC
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                      {t('offers.payment.terms')}{' '}
                      <a href="#" className="text-accent hover:underline font-semibold">
                        {t('offers.payment.termsLink')}
                      </a>{' '}
                      {t('offers.payment.and')}{' '}
                      <a href="#" className="text-accent hover:underline font-semibold">
                        {t('offers.payment.privacyLink')}
                      </a>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handlePayment}
                  disabled={!termsAccepted || processing || !cardName || !cardNumber || !cardExpiry || !cardCvc}
                  className="w-full py-6 bg-accent hover:bg-accent/90 text-white font-semibold text-lg"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      {t('offers.form.processing')}
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5 mr-2" strokeWidth={2} />
                      {t('offers.form.submit')} · ${totalPrice.toFixed(2)}
                    </>
                  )}
                </Button>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6 sticky top-24">
                  <h3 className="text-lg font-bold text-primary mb-4">
                    {t('offers.member.overview')}
                  </h3>

                  <div className="space-y-3 pb-4 border-b border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('offers.payment.selectedPlan')}</span>
                      <span className="font-semibold text-primary">
                        {selectedPlan ? selectedPlan.name[language] : t(`offers.plans.${planId}.name`)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('offers.payment.billingCycle')}</span>
                      <span className="font-semibold text-primary">
                        {billingCycle === 'monthly' ? t('offers.plans.billedMonthly') : t('offers.plans.billedYearly')}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('offers.payment.subtotal')}</span>
                      <span className="font-semibold text-primary">
                        ${basePrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">{t('offers.payment.total')}</span>
                      <span className="text-2xl font-bold text-accent">
                        ${totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Lock className="h-4 w-4 text-green-600" strokeWidth={2} />
                      <span>Secured by Stripe</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}