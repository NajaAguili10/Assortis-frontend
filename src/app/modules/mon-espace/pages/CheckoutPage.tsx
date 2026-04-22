import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useOffersHubContent } from '../../../hooks/useOffersContent';
import { PageBanner } from '../../../components/PageBanner';
import { PageContainer } from '../../../components/PageContainer';
import { MonEspaceSubMenu } from '../../../components/MonEspaceSubMenu';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import { toast } from 'sonner';
import { 
  CreditCard, 
  Lock,
  Loader2
} from 'lucide-react';

/**
 * Page Checkout - Module Mon Espace
 * Affiche le sous-menu Mon Espace (pas Nos Offres)
 */

export default function CheckoutPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: offersContent, loading: offersLoading } = useOffersHubContent();
  
  // Récupérer les données depuis location.state ou localStorage
  let checkoutData = location.state;
  
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
  
  // Gérer le changement de plan depuis Mon Espace
  const isChangePlan = checkoutData?.isChangePlan || false;
  const planId = checkoutData?.planId;
  const billingCycle = checkoutData?.billingCycle;
  const previousPlanId = checkoutData?.previousPlanId;
  const previousBillingCycle = checkoutData?.previousBillingCycle;
  
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
      toast.error(
        language === 'fr' 
          ? 'Données de paiement manquantes' 
          : language === 'es'
          ? 'Datos de pago faltantes'
          : 'Missing payment data'
      );
      navigate('/mon-espace/changer-plan');
    }
  }, [planId, billingCycle, navigate, language, hasRedirected]);

  // Nettoyer localStorage après récupération réussie (seulement au démontage)
  useEffect(() => {
    return () => {
      if (planId && billingCycle) {
        localStorage.removeItem('assortis_checkout_data');
      }
    };
  }, [planId, billingCycle]);

  // Calculer le prix depuis offersContent
  const selectedPlan = offersContent?.plans.find(p => p.id === planId);
  const previousPlan = offersContent?.plans.find(p => p.id === previousPlanId);
  
  const basePrice = selectedPlan 
    ? (billingCycle === 'monthly' ? selectedPlan.priceMonthly : selectedPlan.priceYearly) || 0
    : 0;
  
  const previousPrice = previousPlan 
    ? (previousBillingCycle === 'monthly' ? previousPlan.priceMonthly : previousPlan.priceYearly) || 0
    : 0;
  
  // Calculer le prorata (simulation simple)
  const totalPrice = isChangePlan ? Math.max(0, basePrice - previousPrice) : basePrice;

  const handlePayment = async () => {
    if (!termsAccepted) {
      toast.error(
        language === 'fr' 
          ? 'Veuillez accepter les conditions générales' 
          : language === 'es'
          ? 'Por favor acepte los términos y condiciones'
          : 'Please accept terms and conditions'
      );
      return;
    }

    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      
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
          planName: selectedPlan.name,
          price: basePrice,
          billingCycle: billingCycle,
          renewalDate: renewalDate.toISOString(),
          memberType: selectedPlan.userType,
          status: 'active'
        };
        
        localStorage.setItem('assortis_current_subscription', JSON.stringify(subscriptionData));
      }
      
      toast.success(
        language === 'fr' 
          ? 'Votre plan a été changé avec succès !' 
          : language === 'es'
          ? '¡Su plan ha sido cambiado con éxito!'
          : 'Your plan has been changed successfully!'
      );
      
      // Navigate to Espace Membre
      navigate('/compte-utilisateur/espace-membre');
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
        title={language === 'fr' 
          ? 'Paiement sécurisé' 
          : language === 'es'
          ? 'Pago seguro'
          : 'Secure Payment'
        }
        description={language === 'fr' 
          ? 'Finalisez votre changement de plan en toute sécurité' 
          : language === 'es'
          ? 'Finalice su cambio de plan de forma segura'
          : 'Complete your plan change securely'
        }
      />
      
      {/* Sub Menu */}
      <MonEspaceSubMenu />
      
      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="max-w-4xl mx-auto">
            {offersLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                <p className="mt-4 text-gray-600">
                  {language === 'fr' ? 'Chargement...' : language === 'es' ? 'Cargando...' : 'Loading...'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Payment Form */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-accent" />
                      {language === 'fr' 
                        ? 'Informations de paiement' 
                        : language === 'es'
                        ? 'Información de pago'
                        : 'Payment Information'
                      }
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardName">
                          {language === 'fr' 
                            ? 'Nom sur la carte' 
                            : language === 'es'
                            ? 'Nombre en la tarjeta'
                            : 'Name on Card'
                          }
                        </Label>
                        <Input
                          id="cardName"
                          type="text"
                          placeholder={language === 'fr' ? 'Jean Dupont' : language === 'es' ? 'Juan Pérez' : 'John Doe'}
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor="cardNumber">
                          {language === 'fr' 
                            ? 'Numéro de carte' 
                            : language === 'es'
                            ? 'Número de tarjeta'
                            : 'Card Number'
                          }
                        </Label>
                        <Input
                          id="cardNumber"
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => {
                            const formatted = formatCardNumber(e.target.value);
                            if (formatted.replace(/\s/g, '').length <= 16) {
                              setCardNumber(formatted);
                            }
                          }}
                          className="mt-1.5"
                          maxLength={19}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cardExpiry">
                            {language === 'fr' 
                              ? 'Date d\'expiration' 
                              : language === 'es'
                              ? 'Fecha de expiración'
                              : 'Expiry Date'
                            }
                          </Label>
                          <Input
                            id="cardExpiry"
                            type="text"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => {
                              const formatted = formatExpiry(e.target.value);
                              if (formatted.replace(/\D/g, '').length <= 4) {
                                setCardExpiry(formatted);
                              }
                            }}
                            className="mt-1.5"
                            maxLength={5}
                          />
                        </div>

                        <div>
                          <Label htmlFor="cardCvc">CVC</Label>
                          <Input
                            id="cardCvc"
                            type="text"
                            placeholder="123"
                            value={cardCvc}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 4) {
                                setCardCvc(value);
                              }
                            }}
                            className="mt-1.5"
                            maxLength={4}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-4">
                        <Checkbox
                          id="terms"
                          checked={termsAccepted}
                          onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                        />
                        <Label
                          htmlFor="terms"
                          className="text-sm font-normal cursor-pointer"
                        >
                          {language === 'fr' 
                            ? 'J\'accepte les conditions générales et la politique de confidentialité' 
                            : language === 'es'
                            ? 'Acepto los términos y condiciones y la política de privacidad'
                            : 'I accept the terms and conditions and privacy policy'
                          }
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Lock className="h-4 w-4" />
                    <span>
                      {language === 'fr' 
                        ? 'Paiement sécurisé et crypté' 
                        : language === 'es'
                        ? 'Pago seguro y encriptado'
                        : 'Secure and encrypted payment'
                      }
                    </span>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 sticky top-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {language === 'fr' 
                        ? 'Récapitulatif' 
                        : language === 'es'
                        ? 'Resumen'
                        : 'Summary'
                      }
                    </h3>

                    {selectedPlan && (
                      <div className="space-y-4">
                        <div className="pb-4 border-b border-gray-200">
                          <p className="text-sm text-gray-600 mb-1">
                            {isChangePlan 
                              ? (language === 'fr' ? 'Nouveau plan' : language === 'es' ? 'Nuevo plan' : 'New Plan')
                              : (language === 'fr' ? 'Plan' : language === 'es' ? 'Plan' : 'Plan')
                            }
                          </p>
                          <p className="font-semibold">{selectedPlan.name[language] || selectedPlan.name.en}</p>
                        </div>

                        <div className="pb-4 border-b border-gray-200">
                          <p className="text-sm text-gray-600 mb-1">
                            {language === 'fr' 
                              ? 'Cycle de facturation' 
                              : language === 'es'
                              ? 'Ciclo de facturación'
                              : 'Billing Cycle'
                            }
                          </p>
                          <p className="font-semibold">
                            {billingCycle === 'monthly' 
                              ? (language === 'fr' ? 'Mensuel' : language === 'es' ? 'Mensual' : 'Monthly')
                              : (language === 'fr' ? 'Annuel' : language === 'es' ? 'Anual' : 'Yearly')
                            }
                          </p>
                        </div>

                        {isChangePlan && previousPlan && (
                          <div className="pb-4 border-b border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">
                              {language === 'fr' 
                                ? 'Plan actuel' 
                                : language === 'es'
                                ? 'Plan actual'
                                : 'Current Plan'
                              }
                            </p>
                            <p className="text-sm line-through text-gray-500">
                              {previousPlan.name[language] || previousPlan.name.en} - {previousPrice}€
                            </p>
                          </div>
                        )}

                        <div className="pt-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">
                              {language === 'fr' 
                                ? 'Prix du plan' 
                                : language === 'es'
                                ? 'Precio del plan'
                                : 'Plan Price'
                              }
                            </span>
                            <span className="font-semibold">{basePrice}€</span>
                          </div>
                          
                          {isChangePlan && totalPrice < basePrice && (
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-green-600">
                                {language === 'fr' 
                                  ? 'Crédit plan actuel' 
                                  : language === 'es'
                                  ? 'Crédito plan actual'
                                  : 'Current plan credit'
                                }
                              </span>
                              <span className="font-semibold text-green-600">-{previousPrice}€</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t-2 border-gray-300">
                            <span className="text-lg font-bold">
                              {language === 'fr' 
                                ? 'Total à payer' 
                                : language === 'es'
                                ? 'Total a pagar'
                                : 'Total to Pay'
                              }
                            </span>
                            <span className="text-2xl font-bold text-accent">{totalPrice}€</span>
                          </div>

                          {billingCycle === 'yearly' && (
                            <p className="text-xs text-gray-500 mt-2">
                              {language === 'fr' 
                                ? `Soit ${Math.round(basePrice / 12)}€/mois` 
                                : language === 'es'
                                ? `O ${Math.round(basePrice / 12)}€/mes`
                                : `Or ${Math.round(basePrice / 12)}€/month`
                              }
                            </p>
                          )}
                        </div>

                        <Button
                          onClick={handlePayment}
                          disabled={processing || !cardName || !cardNumber || !cardExpiry || !cardCvc || !termsAccepted}
                          className="w-full mt-4"
                        >
                          {processing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {language === 'fr' 
                                ? 'Traitement...' 
                                : language === 'es'
                                ? 'Procesando...'
                                : 'Processing...'
                              }
                            </>
                          ) : (
                            <>
                              {language === 'fr' 
                                ? 'Confirmer le paiement' 
                                : language === 'es'
                                ? 'Confirmar pago'
                                : 'Confirm Payment'
                              }
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </>
  );
}
