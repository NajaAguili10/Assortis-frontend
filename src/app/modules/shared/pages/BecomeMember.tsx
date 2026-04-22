import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useOffersHubContent } from '@app/hooks/useOffersContent';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OffersSubMenu } from '@app/components/OffersSubMenu';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';
import { 
  Sparkles, 
  ArrowRight,
  ArrowLeft,
  Check,
  CreditCard,
  Building2,
  User,
} from 'lucide-react';
import { getCountriesSorted } from '@app/config/countries.config';
import { COMMON_LANGUAGES } from '@app/config/professional.config';

type MemberType = 'organization' | 'expert' | null;
type PlanId = 'basic' | 'professional' | 'enterprise' | 'expert-beginner' | 'expert-professional' | 'org-beginner' | 'org-professional' | 'org-enterprise';
type BillingCycle = 'monthly' | 'yearly';

interface FormData {
  memberType: MemberType;
  planId: PlanId;
  billingCycle: BillingCycle;
  
  // Organization fields
  orgName: string;
  orgLegalName: string;
  orgType: string;
  orgRegistrationNumber: string;
  orgEmail: string;
  orgPhone: string;
  orgWebsite: string;
  orgCountry: string;
  orgCity: string;
  contactPersonName: string;
  contactPersonPosition: string;
  
  // Expert fields
  firstName: string;
  lastName: string;
  expertEmail: string;
  expertPhone: string;
  nationality: string;
  country: string;
  city: string;
  expertise: string;
  experience: string;
  languages: string[];
}

const ORGANIZATION_TYPES = [
  'PRIVATE_SECTOR',
  'NGO',
  'GOVERNMENT',
  'FOUNDATION',
  'ACADEMIC',
  'CONSORTIUM',
];

const EXPERTISE_AREAS = [
  'EDUCATION',
  'HEALTH',
  'AGRICULTURE',
  'INFRASTRUCTURE',
  'GOVERNANCE',
  'ENVIRONMENT',
  'WATER_SANITATION',
  'ENERGY',
];

export default function BecomeMember() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: offersContent, loading: offersLoading } = useOffersHubContent();
  
  // Récupérer le userType depuis l'URL
  const userTypeFromUrl = searchParams.get('userType') as MemberType;
  
  // Commencer directement à l'étape 1 (sélection du plan) car le type est déjà choisi
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Obtenir les listes triées selon la langue actuelle
  const COUNTRIES = getCountriesSorted(language as 'en' | 'fr' | 'es');
  const LANGUAGES_LIST = COMMON_LANGUAGES;

  const [formData, setFormData] = useState<FormData>({
    memberType: userTypeFromUrl || null,
    planId: 'org-professional', // Valeur par défaut temporaire, sera mise à jour
    billingCycle: 'yearly',
    
    orgName: '',
    orgLegalName: '',
    orgType: '',
    orgRegistrationNumber: '',
    orgEmail: '',
    orgPhone: '',
    orgWebsite: '',
    orgCountry: '',
    orgCity: '',
    contactPersonName: '',
    contactPersonPosition: '',
    
    firstName: '',
    lastName: '',
    expertEmail: '',
    expertPhone: '',
    nationality: '',
    country: '',
    city: '',
    expertise: '',
    experience: '',
    languages: [],
  });

  // Utiliser useRef pour éviter les boucles infinies
  const planInitializedRef = useRef<string | null>(null);

  // Rediriger vers la page des offres si aucun memberType n'est fourni
  useEffect(() => {
    if (!userTypeFromUrl && !formData.memberType) {
      navigate('/offers');
    }
  }, [userTypeFromUrl, formData.memberType, navigate]);

  // Initialiser le planId par défaut en fonction du memberType
  useEffect(() => {
    // Éviter de réinitialiser si on a déjà initialisé pour ce memberType
    if (offersContent && formData.memberType && planInitializedRef.current !== formData.memberType) {
      // Trouver le premier plan actif avec prix non-null pour le type d'utilisateur
      const availablePlan = offersContent.plans.find(plan => 
        plan.isActive && 
        plan.userType === formData.memberType &&
        plan.priceMonthly !== null && 
        plan.priceYearly !== null &&
        plan.highlighted // Sélectionner le plan recommandé par défaut
      );
      
      // Si aucun plan recommandé, prendre le premier disponible
      const fallbackPlan = offersContent.plans.find(plan => 
        plan.isActive && 
        plan.userType === formData.memberType &&
        plan.priceMonthly !== null && 
        plan.priceYearly !== null
      );
      
      const defaultPlan = availablePlan || fallbackPlan;
      
      if (defaultPlan) {
        setFormData(prev => ({ ...prev, planId: defaultPlan.id as PlanId }));
        planInitializedRef.current = formData.memberType;
      }
    }
  }, [formData.memberType, offersContent]);

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - redirect to payment
      const checkoutData = {
        formData,
        planId: formData.planId,
        billingCycle: formData.billingCycle,
      };
      
      // Sauvegarder dans localStorage comme fallback
      localStorage.setItem('assortis_checkout_data', JSON.stringify(checkoutData));
      
      navigate('/offers/checkout', { 
        state: checkoutData
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.planId !== null;
    }
    if (currentStep === 2) {
      if (formData.memberType === 'organization') {
        return formData.orgName && formData.orgEmail && formData.contactPersonName;
      } else {
        return formData.firstName && formData.lastName && formData.expertEmail;
      }
    }
    return true;
  };

  const stepTitles = [
    t('offers.become.selectPlan'),
    t('offers.become.yourInformation'),
    t('offers.become.payment'),
  ];

  return (
    <>
      <PageBanner
        icon={Sparkles}
        title={t('offers.become.title')}
        subtitle={t('offers.become.subtitle')}
      />
      
      {/* Sub Menu */}
      <OffersSubMenu />
      
      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {offersLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
                <p className="text-gray-600">{t('common.loading')}</p>
              </div>
            </div>
          ) : !offersContent || !offersContent.plans ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-red-600 font-semibold mb-2">{t('common.error')}</p>
                <p className="text-gray-600">{t('offers.error.loadPlans')}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center flex-1">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
                        step < currentStep ? 'bg-green-600 text-white' :
                        step === currentStep ? 'bg-accent text-white' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {step < currentStep ? <Check className="h-5 w-5" strokeWidth={3} /> : step}
                      </div>
                      {step < 3 && (
                        <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                          step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-600 font-medium">
                  {t('offers.form.step')} {currentStep} {t('offers.form.of')} {totalSteps}: {stepTitles[currentStep - 1]}
                </p>
              </div>

              {/* Step Content */}
              <div className="max-w-3xl mx-auto">
                {/* Step 1: Plan Selection */}
                {currentStep === 1 && offersContent && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                      <h3 className="text-lg font-bold text-primary mb-4">{t('offers.payment.billingCycle')}</h3>
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleInputChange('billingCycle', 'monthly')}
                          className={`flex-1 py-3 px-4 rounded-lg border-2 font-semibold transition-all duration-300 ${
                            formData.billingCycle === 'monthly'
                              ? 'border-accent bg-accent text-white'
                              : 'border-gray-200 hover:border-accent/50'
                          }`}
                        >
                          {t('offers.plans.billedMonthly')}
                        </button>
                        <button
                          onClick={() => handleInputChange('billingCycle', 'yearly')}
                          className={`flex-1 py-3 px-4 rounded-lg border-2 font-semibold transition-all duration-300 relative ${
                            formData.billingCycle === 'yearly'
                              ? 'border-accent bg-accent text-white'
                              : 'border-gray-200 hover:border-accent/50'
                          }`}
                        >
                          {t('offers.plans.billedYearly')}
                          <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                            {t('offers.plans.savePercent', { percent: 17 })}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {offersContent.plans
                        .filter(plan => 
                          plan.isActive && 
                          plan.userType === formData.memberType &&
                          // Exclure les plans avec tarification personnalisée (prix null)
                          plan.priceMonthly !== null && 
                          plan.priceYearly !== null
                        )
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((plan) => {
                          const price = formData.billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
                          
                          return (
                            <button
                              key={plan.id}
                              onClick={() => handleInputChange('planId', plan.id as PlanId)}
                              className={`p-6 rounded-xl border-2 text-left transition-all duration-300 hover:scale-102 ${
                                formData.planId === plan.id
                                  ? 'border-accent bg-accent/5 shadow-lg'
                                  : 'border-gray-200 bg-white hover:border-accent/50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-primary">
                                      {plan.name[language]}
                                    </h3>
                                    {plan.highlighted && (
                                      <span className="bg-accent text-white text-xs px-2 py-1 rounded-full font-semibold">
                                        {t('subscription.recommended')}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-3">
                                    {plan.description[language]}
                                  </p>
                                  <div className="text-2xl font-bold text-primary">
                                    ${price}
                                    <span className="text-base font-normal text-gray-600">
                                      {' / '}
                                      {formData.billingCycle === 'monthly' ? t('offers.plans.monthly') : t('offers.plans.yearly')}
                                    </span>
                                  </div>
                                </div>
                                {formData.planId === plan.id && (
                                  <div className="bg-accent rounded-full p-1 ml-4">
                                    <Check className="h-5 w-5 text-white" strokeWidth={3} />
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Step 2: Information Form */}
                {currentStep === 2 && (
                  <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
                    {formData.memberType === 'organization' ? (
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold text-primary mb-4">
                          {t('offers.become.typeOrganization')}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="orgName">{t('offers.form.org.name')} *</Label>
                            <Input
                              id="orgName"
                              value={formData.orgName}
                              onChange={(e) => handleInputChange('orgName', e.target.value)}
                              placeholder={t('offers.form.org.namePlaceholder')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="orgLegalName">{t('offers.form.org.legalName')}</Label>
                            <Input
                              id="orgLegalName"
                              value={formData.orgLegalName}
                              onChange={(e) => handleInputChange('orgLegalName', e.target.value)}
                              placeholder={t('offers.form.org.legalNamePlaceholder')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="orgType">{t('offers.form.org.type')}</Label>
                            <Select value={formData.orgType} onValueChange={(value) => handleInputChange('orgType', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder={t('offers.form.org.typePlaceholder')} />
                              </SelectTrigger>
                              <SelectContent>
                                {ORGANIZATION_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {t(`organizations.type.${type}`)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="orgRegistrationNumber">{t('offers.form.org.registrationNumber')}</Label>
                            <Input
                              id="orgRegistrationNumber"
                              value={formData.orgRegistrationNumber}
                              onChange={(e) => handleInputChange('orgRegistrationNumber', e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="orgEmail">{t('offers.form.org.email')} *</Label>
                            <Input
                              id="orgEmail"
                              type="email"
                              value={formData.orgEmail}
                              onChange={(e) => handleInputChange('orgEmail', e.target.value)}
                              placeholder={t('offers.form.org.emailPlaceholder')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="orgPhone">{t('offers.form.org.phone')}</Label>
                            <Input
                              id="orgPhone"
                              value={formData.orgPhone}
                              onChange={(e) => handleInputChange('orgPhone', e.target.value)}
                              placeholder={t('offers.form.org.phonePlaceholder')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="orgWebsite">{t('offers.form.org.website')}</Label>
                            <Input
                              id="orgWebsite"
                              value={formData.orgWebsite}
                              onChange={(e) => handleInputChange('orgWebsite', e.target.value)}
                              placeholder={t('offers.form.org.websitePlaceholder')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="orgCountry">{t('offers.form.org.country')}</Label>
                            <Select value={formData.orgCountry} onValueChange={(value) => handleInputChange('orgCountry', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder={t('offers.form.org.countryPlaceholder')} />
                              </SelectTrigger>
                              <SelectContent>
                                {COUNTRIES.map((country) => (
                                  <SelectItem key={country.code} value={country.code}>
                                    {country.name[language as 'en' | 'fr' | 'es']}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="orgCity">{t('offers.form.org.city')}</Label>
                            <Input
                              id="orgCity"
                              value={formData.orgCity}
                              onChange={(e) => handleInputChange('orgCity', e.target.value)}
                              placeholder={t('offers.form.org.cityPlaceholder')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="contactPersonName">{t('offers.form.org.contactPerson')} *</Label>
                            <Input
                              id="contactPersonName"
                              value={formData.contactPersonName}
                              onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
                              placeholder={t('offers.form.org.contactPersonPlaceholder')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="contactPersonPosition">{t('offers.form.org.position')}</Label>
                            <Input
                              id="contactPersonPosition"
                              value={formData.contactPersonPosition}
                              onChange={(e) => handleInputChange('contactPersonPosition', e.target.value)}
                              placeholder={t('offers.form.org.positionPlaceholder')}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold text-primary mb-4">
                          {t('offers.become.typeExpert')}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">{t('offers.form.expert.firstName')} *</Label>
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={(e) => handleInputChange('firstName', e.target.value)}
                              placeholder={t('offers.form.expert.firstNamePlaceholder')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="lastName">{t('offers.form.expert.lastName')} *</Label>
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={(e) => handleInputChange('lastName', e.target.value)}
                              placeholder={t('offers.form.expert.lastNamePlaceholder')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="expertEmail">{t('offers.form.expert.email')} *</Label>
                            <Input
                              id="expertEmail"
                              type="email"
                              value={formData.expertEmail}
                              onChange={(e) => handleInputChange('expertEmail', e.target.value)}
                              placeholder={t('offers.form.expert.emailPlaceholder')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="expertPhone">{t('offers.form.expert.phone')}</Label>
                            <Input
                              id="expertPhone"
                              value={formData.expertPhone}
                              onChange={(e) => handleInputChange('expertPhone', e.target.value)}
                              placeholder={t('offers.form.expert.phonePlaceholder')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="nationality">{t('offers.form.expert.nationality')}</Label>
                            <Select value={formData.nationality} onValueChange={(value) => handleInputChange('nationality', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder={t('offers.form.expert.nationalityPlaceholder')} />
                              </SelectTrigger>
                              <SelectContent>
                                {COUNTRIES.map((country) => (
                                  <SelectItem key={country.code} value={country.code}>
                                    {country.name[language as 'en' | 'fr' | 'es']}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="country">{t('offers.form.expert.country')}</Label>
                            <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder={t('offers.form.expert.countryPlaceholder')} />
                              </SelectTrigger>
                              <SelectContent>
                                {COUNTRIES.map((country) => (
                                  <SelectItem key={country.code} value={country.code}>
                                    {country.name[language as 'en' | 'fr' | 'es']}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="city">{t('offers.form.expert.city')}</Label>
                            <Input
                              id="city"
                              value={formData.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              placeholder={t('offers.form.expert.cityPlaceholder')}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="expertise">{t('offers.form.expert.expertise')}</Label>
                            <Select value={formData.expertise} onValueChange={(value) => handleInputChange('expertise', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder={t('offers.form.expert.expertisePlaceholder')} />
                              </SelectTrigger>
                              <SelectContent>
                                {EXPERTISE_AREAS.map((area) => (
                                  <SelectItem key={area} value={area}>
                                    {t(`sectors.${area}`)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="experience">{t('offers.form.expert.experience')}</Label>
                            <Input
                              id="experience"
                              value={formData.experience}
                              onChange={(e) => handleInputChange('experience', e.target.value)}
                              placeholder={t('offers.form.expert.experiencePlaceholder')}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Summary before payment */}
                {currentStep === 3 && offersContent && offersContent.plans && (() => {
                  const selectedPlan = offersContent.plans.find(p => p.id === formData.planId);
                  
                  // Protection complète pour le nom du plan
                  let planName = formData.planId || '';
                  if (selectedPlan?.name) {
                    planName = selectedPlan.name[language] || selectedPlan.name.en || selectedPlan.name.fr || planName;
                  }
                  
                  // Protection complète pour le prix
                  const price = selectedPlan 
                    ? (formData.billingCycle === 'monthly' ? selectedPlan.priceMonthly : selectedPlan.priceYearly)
                    : null;
                  
                  return (
                    <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <CreditCard className="h-6 w-6 text-accent" strokeWidth={2} />
                        <h3 className="text-xl font-bold text-primary">
                          {t('offers.payment.title')}
                        </h3>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">{t('offers.become.selectType')}:</span>
                          <span className="font-semibold text-primary">
                            {formData.memberType === 'organization' ? t('offers.become.typeOrganization') : t('offers.become.typeExpert')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">{t('offers.payment.selectedPlan')}:</span>
                          <span className="font-semibold text-primary">
                            {planName}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">{t('offers.payment.billingCycle')}:</span>
                          <span className="font-semibold text-primary">
                            {formData.billingCycle === 'monthly' ? t('offers.plans.billedMonthly') : t('offers.plans.billedYearly')}
                          </span>
                        </div>
                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center text-lg">
                            <span className="font-bold text-gray-900">{t('offers.payment.total')}:</span>
                            <span className="font-bold text-accent text-2xl">
                              {price !== null && price !== undefined ? `$${price}` : t('offers.plans.custom')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                        {t('offers.payment.securePayment')}
                      </div>
                    </div>
                  );
                })()}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="px-6 py-6"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" strokeWidth={2} />
                    {t('offers.form.previous')}
                  </Button>
                  
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="px-8 py-6 bg-accent hover:bg-accent/90 text-white font-semibold"
                  >
                    {currentStep === totalSteps ? (
                      <>
                        {t('offers.form.submit')}
                        {offersContent && (() => {
                          const selectedPlan = offersContent.plans.find(p => p.id === formData.planId);
                          if (selectedPlan) {
                            const price = formData.billingCycle === 'monthly' 
                              ? selectedPlan.priceMonthly 
                              : selectedPlan.priceYearly;
                            
                            if (price !== null) {
                              return <span className="ml-2">· ${price}</span>;
                            }
                          }
                          return null;
                        })()}
                        <ArrowRight className="h-4 w-4 ml-2" strokeWidth={2} />
                      </>
                    ) : (
                      <>
                        {t('offers.form.next')}
                        <ArrowRight className="h-4 w-4 ml-2" strokeWidth={2} />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </PageContainer>
    </>
  );
}