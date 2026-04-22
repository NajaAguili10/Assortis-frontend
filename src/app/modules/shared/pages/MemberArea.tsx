import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useOffersHubContent } from '@app/hooks/useOffersContent';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OffersSubMenu } from '@app/components/OffersSubMenu';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Textarea } from '@app/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@app/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@app/components/ui/dialog';
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
import { toast } from 'sonner';
import { 
  Shield, 
  CreditCard,
  Download,
  Calendar,
  CheckCircle2,
  Edit,
  X,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Info
} from 'lucide-react';

// Interface for subscription data
interface SubscriptionData {
  planId: string;
  planName: { fr: string; en: string; es: string };
  price: number;
  billingCycle: 'monthly' | 'yearly';
  renewalDate: string;
  memberType: string;
  status: string;
}

export default function MemberArea() {
  const { t, language } = useLanguage();
  const { data: offersContent } = useOffersHubContent();
  const navigate = useNavigate();
  
  // Dialog states
  const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false);
  const [confirmPlanDialogOpen, setConfirmPlanDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [updatePaymentDialogOpen, setUpdatePaymentDialogOpen] = useState(false);
  const [selectedNewPlan, setSelectedNewPlan] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // Payment form errors
  const [cardNumberError, setCardNumberError] = useState('');
  const [cardExpiryError, setCardExpiryError] = useState('');
  const [cardCvcError, setCardCvcError] = useState('');
  const [cardNameError, setCardNameError] = useState('');

  // State for current subscription - Load from localStorage
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionData | null>(null);

  // Load subscription data from localStorage on mount
  useEffect(() => {
    const loadSubscriptionData = () => {
      const savedSubscription = localStorage.getItem('assortis_current_subscription');
      if (savedSubscription) {
        try {
          const parsedData = JSON.parse(savedSubscription);
          setCurrentSubscription(parsedData);
        } catch (e) {
          console.error('Error parsing subscription data:', e);
          // Fallback to default data
          setDefaultSubscription();
        }
      } else {
        // No subscription found, set default
        setDefaultSubscription();
      }
    };

    loadSubscriptionData();
  }, []);

  // Set default subscription data (fallback)
  const setDefaultSubscription = () => {
    setCurrentSubscription({
      planId: 'org-professional',
      planName: { fr: 'Professionnel', en: 'Professional', es: 'Profesional' },
      price: 49,
      billingCycle: 'monthly',
      renewalDate: '2026-03-27',
      memberType: 'organization',
      status: 'active'
    });
  };

  // Get translated plan name
  const getPlanDisplayName = () => {
    if (!currentSubscription) return 'Premium';
    return currentSubscription.planName[language as keyof typeof currentSubscription.planName] || 
           currentSubscription.planName.en || 
           'Premium';
  };

  // Get formatted price with billing cycle
  const getFormattedPrice = () => {
    if (!currentSubscription) return '€49/mois';
    const price = `€${currentSubscription.price}`;
    const cycle = currentSubscription.billingCycle === 'monthly' 
      ? `/${t('offers.month')}` 
      : `/${t('offers.year')}`;
    return `${price}${cycle}`;
  };

  // Mock data - will be replaced by currentSubscription data
  const currentPlan = {
    name: getPlanDisplayName(),
    price: getFormattedPrice(),
    status: currentSubscription?.status || 'active',
    renewalDate: currentSubscription?.renewalDate || '2026-03-27',
    features: [
      'Accès illimité aux appels d\'offres',
      'Notifications en temps réel',
      'Support prioritaire',
      'Analyse de compatibilité IA',
      'Exports de données avancés'
    ]
  };

  const plans = [
    { id: 'basic', name: 'Basic', price: '€29/mois' },
    { id: 'premium', name: 'Premium', price: '€49/mois' },
    { id: 'enterprise', name: 'Enterprise', price: '€99/mois' }
  ];

  const invoices = [
    { id: '2026-02', date: '2026-02-27', amount: '€49.00', status: 'paid' },
    { id: '2026-01', date: '2026-01-27', amount: '€49.00', status: 'paid' },
    { id: '2025-12', date: '2025-12-27', amount: '€49.00', status: 'paid' }
  ];

  // Handlers
  const handleChangePlan = () => {
    if (!selectedNewPlan) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      setChangePlanDialogOpen(false);
      toast.success(t('offers.member.planChangeSuccess'));
      setSelectedNewPlan(null);
    }, 1500);
  };

  const handleCancelSubscription = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      setCancelDialogOpen(false);
      toast.success(t('offers.member.cancelSuccess'));
      setCancellationReason('');
    }, 1500);
  };

  const validatePaymentForm = (): boolean => {
    let isValid = true;

    // Reset all errors
    setCardNumberError('');
    setCardExpiryError('');
    setCardCvcError('');
    setCardNameError('');

    // Validate card number (16 digits, spaces optional)
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (!cleanCardNumber) {
      setCardNumberError(t('offers.error.required'));
      isValid = false;
    } else if (!/^\d{16}$/.test(cleanCardNumber)) {
      setCardNumberError(t('offers.error.cardNumber'));
      isValid = false;
    }

    // Validate expiry date (MM/YY format and future date)
    if (!cardExpiry) {
      setCardExpiryError(t('offers.error.required'));
      isValid = false;
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
      setCardExpiryError(t('offers.error.cardExpiry'));
      isValid = false;
    } else {
      // Check if the date is in the future
      const [month, year] = cardExpiry.split('/');
      const expiryDate = new Date(2000 + parseInt(year, 10), parseInt(month, 10) - 1);
      const currentDate = new Date();
      currentDate.setDate(1); // Set to first day of current month for fair comparison
      
      if (expiryDate < currentDate) {
        setCardExpiryError(t('offers.error.cardExpiryPast'));
        isValid = false;
      }
    }

    // Validate CVC (3-4 digits)
    if (!cardCvc) {
      setCardCvcError(t('offers.error.required'));
      isValid = false;
    } else if (!/^\d{3,4}$/.test(cardCvc)) {
      setCardCvcError(t('offers.error.cardCvc'));
      isValid = false;
    }

    // Validate cardholder name
    if (!cardName.trim()) {
      setCardNameError(t('offers.error.cardName'));
      isValid = false;
    }

    return isValid;
  };

  const handleUpdatePayment = () => {
    // Validate form before processing
    if (!validatePaymentForm()) {
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      setUpdatePaymentDialogOpen(false);
      toast.success(t('offers.member.paymentUpdateSuccess'));
      // Reset form
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
      setCardName('');
      // Reset errors
      setCardNumberError('');
      setCardExpiryError('');
      setCardCvcError('');
      setCardNameError('');
    }, 1500);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.success(t('offers.member.invoiceDownloadSuccess'));
    // Mock download - in real app, would trigger actual download
    console.log('Downloading invoice:', invoiceId);
  };

  // Reset payment form when dialog closes
  const handlePaymentDialogChange = (open: boolean) => {
    setUpdatePaymentDialogOpen(open);
    if (!open) {
      // Reset form and errors when dialog closes
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
      setCardName('');
      setCardNumberError('');
      setCardExpiryError('');
      setCardCvcError('');
      setCardNameError('');
    }
  };
  
  // Utility functions for plan change calculations
  const getCurrentPlanData = () => {
    // Use real subscription data from localStorage
    if (currentSubscription) {
      return {
        id: currentSubscription.planId,
        monthlyPrice: currentSubscription.price,
        renewalDate: currentSubscription.renewalDate
      };
    }
    // Fallback to mock data
    return {
      id: 'professional',
      monthlyPrice: 49,
      renewalDate: currentPlan.renewalDate
    };
  };
  
  const calculateDaysRemaining = () => {
    const renewal = new Date(getCurrentPlanData().renewalDate);
    const today = new Date();
    const diffTime = Math.abs(renewal.getTime() - today.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  const calculateProrata = (newPlanPrice: number) => {
    const daysRemaining = calculateDaysRemaining();
    const currentMonthlyPrice = getCurrentPlanData().monthlyPrice;
    
    // Calculate daily rates
    const daysInMonth = 30;
    const currentDailyRate = currentMonthlyPrice / daysInMonth;
    const newDailyRate = newPlanPrice / daysInMonth;
    
    // Calculate credits from current plan
    const creditFromCurrentPlan = currentDailyRate * daysRemaining;
    
    // Calculate cost for new plan
    const costForNewPlan = newDailyRate * daysRemaining;
    
    // Calculate difference
    const difference = costForNewPlan - creditFromCurrentPlan;
    
    return {
      daysRemaining,
      creditFromCurrentPlan: Math.round(creditFromCurrentPlan * 100) / 100,
      costForNewPlan: Math.round(costForNewPlan * 100) / 100,
      difference: Math.round(difference * 100) / 100,
      isUpgrade: difference > 0,
      isDowngrade: difference < 0
    };
  };
  
  const getSelectedPlanData = () => {
    if (!selectedNewPlan || !offersContent?.plans) return null;
    return offersContent.plans.find(p => p.id === selectedNewPlan);
  };
  
  const handleProceedToConfirmation = () => {
    if (!selectedNewPlan) return;
    setChangePlanDialogOpen(false);
    setConfirmPlanDialogOpen(true);
  };
  
  const handleConfirmPlanChange = () => {
    if (!selectedNewPlan) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      setConfirmPlanDialogOpen(false);
      setSelectedNewPlan(null);
      toast.success(t('offers.member.planChangeSuccess'));
    }, 1500);
  };

  return (
    <main>
      <PageBanner 
        icon={Shield}
        title={t('offers.member.title')} 
        description={t('offers.member.subtitle')}
      />
      
      {/* Sub Menu */}
      <OffersSubMenu />
      
      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="max-w-5xl mx-auto">
            {/* Current Plan Card */}
            <div className="bg-white rounded-lg border overflow-hidden">
              {/* Plan Header */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-8 py-6 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-primary">{currentPlan.name}</h2>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {t('offers.member.active')}
                      </Badge>
                    </div>
                    <p className="text-xl font-semibold text-gray-700">{currentPlan.price}</p>
                  </div>
                </div>
              </div>

              {/* Plan Details */}
              <div className="p-8">
                {/* Renewal Info */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">{t('offers.member.nextRenewal')}:</span>
                    <span>{new Date(currentPlan.renewalDate).toLocaleDateString(language, { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Features Section */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-accent rounded-full"></div>
                    {t('offers.member.features')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-6 border-t">
                  <Button
                    onClick={() => navigate('/offers/change-plan')}
                    className="bg-primary hover:bg-primary/90 h-11 px-8"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t('offers.member.changePlan')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Change Plan Dialog */}
      <Dialog open={changePlanDialogOpen} onOpenChange={setChangePlanDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('offers.member.changePlan')}</DialogTitle>
            <DialogDescription>
              {t('offers.member.changePlanDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {offersContent?.plans && offersContent.plans.length > 0 ? (
              <RadioGroup
                value={selectedNewPlan || ''}
                onValueChange={setSelectedNewPlan}
                className="space-y-3"
              >
                {offersContent.plans
                  .filter(plan => plan.id !== getCurrentPlanData().id) // Don't show current plan
                  .map((plan) => {
                    const planName = plan.name[language] || plan.name.en || plan.name.fr;
                    const planPrice = plan.monthlyPrice || plan.price || 0;
                    const isUpgrade = planPrice > getCurrentPlanData().monthlyPrice;
                    
                    return (
                      <div 
                        key={plan.id} 
                        className={`flex items-center space-x-3 p-4 rounded-lg border-2 hover:bg-gray-50 transition-all cursor-pointer ${
                          selectedNewPlan === plan.id ? 'border-accent bg-accent/5' : 'border-gray-200'
                        }`}
                      >
                        <RadioGroupItem value={plan.id} id={`plan-${plan.id}`} />
                        <Label htmlFor={`plan-${plan.id}`} className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-900">{planName}</div>
                              <div className="text-lg font-bold text-accent mt-1">{planPrice}€/mois</div>
                            </div>
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
                          </div>
                        </Label>
                      </div>
                    );
                  })}
              </RadioGroup>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>{t('offers.plans.loading')}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setChangePlanDialogOpen(false);
                setSelectedNewPlan(null);
              }}
            >
              {t('offers.member.cancel')}
            </Button>
            <Button
              type="button"
              disabled={!selectedNewPlan}
              onClick={handleProceedToConfirmation}
              className="bg-accent hover:bg-accent/90"
            >
              {t('offers.member.changePlan')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Plan Change Dialog */}
      <Dialog open={confirmPlanDialogOpen} onOpenChange={setConfirmPlanDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              {t('offers.member.confirmPlanChange')}
            </DialogTitle>
            <DialogDescription>
              {t('offers.member.confirmPlanChangeDescription')}
            </DialogDescription>
          </DialogHeader>
          
          {(() => {
            const selectedPlan = getSelectedPlanData();
            if (!selectedPlan) return null;
            
            const prorata = calculateProrata(selectedPlan.monthlyPrice || selectedPlan.price || 0);
            const isUpgrade = prorata.isUpgrade;
            
            return (
              <div className="space-y-4">
                {/* Plan Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-gray-500">{t('offers.member.currentPlan')}</Label>
                    <div className="bg-gray-50 rounded-lg p-3 border">
                      <div className="font-semibold text-gray-900">{currentPlan.name}</div>
                      <div className="text-sm text-gray-600">{getCurrentPlanData().monthlyPrice}€/mois</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-gray-500">{t('offers.member.newPlan')}</Label>
                    <div className="bg-accent/5 rounded-lg p-3 border-2 border-accent">
                      <div className="font-semibold text-accent">{selectedPlan.name[language] || selectedPlan.name.en}</div>
                      <div className="text-sm text-gray-700">{selectedPlan.monthlyPrice || selectedPlan.price}€/mois</div>
                    </div>
                  </div>
                </div>

                {/* Billing Cycle Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="h-4 w-4 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">{t('offers.member.billingCycleSummary')}</h4>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">{t('offers.member.daysRemaining')}</span>
                      <span className="font-semibold text-gray-900">{prorata.daysRemaining} jours</span>
                    </div>
                    
                    <div className="border-t border-blue-200 my-2"></div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-700">{t('offers.member.creditFromCurrentPlan')}</span>
                      <span className="font-semibold text-green-700">-{prorata.creditFromCurrentPlan.toFixed(2)}€</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-700">{t('offers.member.costForNewPlan')}</span>
                      <span className="font-semibold text-gray-900">+{prorata.costForNewPlan.toFixed(2)}€</span>
                    </div>
                    
                    <div className="border-t border-blue-300 my-2"></div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">{t('offers.member.difference')}</span>
                      <div className="flex items-center gap-2">
                        {isUpgrade ? (
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
                        <span className={`font-bold text-lg ${isUpgrade ? 'text-orange-700' : 'text-green-700'}`}>
                          {prorata.difference >= 0 ? '+' : ''}{prorata.difference.toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="bg-gray-50 border rounded-lg p-3">
                  <p className="text-xs text-gray-600">
                    {isUpgrade ? t('offers.member.upgradeExplanation') : t('offers.member.downgradeExplanation')}
                  </p>
                </div>
              </div>
            );
          })()}
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setConfirmPlanDialogOpen(false);
                setChangePlanDialogOpen(true);
              }}
            >
              {t('offers.member.cancel')}
            </Button>
            <Button
              type="button"
              disabled={isProcessing}
              onClick={handleConfirmPlanChange}
              className="bg-accent hover:bg-accent/90"
            >
              {isProcessing ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                t('offers.member.confirmChange')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription AlertDialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('offers.member.cancelSubscription')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('offers.member.cancelDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="cancelReason">{t('offers.member.cancelReason')}</Label>
            <Textarea
              id="cancelReason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder={t('offers.member.cancelReasonPlaceholder')}
              className="min-h-[100px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCancellationReason('')}>
              {t('offers.member.keepSubscription')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                t('offers.member.confirmCancel')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Payment Dialog */}
      <Dialog open={updatePaymentDialogOpen} onOpenChange={handlePaymentDialogChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('offers.member.updatePayment')}</DialogTitle>
            <DialogDescription>
              {t('offers.member.updatePaymentDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">{t('offers.member.cardNumber')}</Label>
              <Input
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
                className="w-full"
              />
              {cardNumberError && <p className="text-red-500 text-sm">{cardNumberError}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardExpiry">{t('offers.member.cardExpiry')}</Label>
                <Input
                  id="cardExpiry"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="w-full"
                />
                {cardExpiryError && <p className="text-red-500 text-sm">{cardExpiryError}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardCvc">{t('offers.member.cardCvc')}</Label>
                <Input
                  id="cardCvc"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  placeholder="123"
                  className="w-full"
                />
                {cardCvcError && <p className="text-red-500 text-sm">{cardCvcError}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardName">{t('offers.member.cardName')}</Label>
              <Input
                id="cardName"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="John Doe"
                className="w-full"
              />
              {cardNameError && <p className="text-red-500 text-sm">{cardNameError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setUpdatePaymentDialogOpen(false)}
            >
              {t('offers.member.cancel')}
            </Button>
            <Button
              type="button"
              disabled={isProcessing}
              onClick={handleUpdatePayment}
              className="bg-accent hover:bg-accent/90"
            >
              {isProcessing ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                t('offers.member.updatePayment')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}