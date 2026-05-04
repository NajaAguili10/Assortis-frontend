import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { useAuth } from '@app/contexts/AuthContext';
import { useTranslation } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
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
import { Alert, AlertDescription } from '@app/components/ui/alert';
import { Badge } from '@app/components/ui/badge';
import { 
  UserPlus, 
  Building2, 
  User,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Users,
  Globe,
  TrendingUp,
  Mail,
  GraduationCap,
  Briefcase,
  Eye,
  EyeOff,
  AlertCircle,
  Save,
  Info,
  Shield,
  Tag,
  Euro,
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripePaymentForm } from '@app/components/StripePaymentForm';
import { EmailVerification } from '@app/components/EmailVerification';
import { PromoCodeSection } from '@app/components/PromoCodeSection';
import { PromoCodeData } from '@app/types/promo';
import { sendConfirmationEmail } from '@app/services/emailService';
import { COUNTRIES as FULL_COUNTRIES, getCountriesSorted } from '@app/config/countries.config';
import { PRICING_SECTORS } from '@app/config/pricing-sectors.config';
import { 
  validateEmail, 
  validatePassword, 
  validateName, 
  validatePhone,
  validateUrl,
  validateRequired 
} from '@app/utils/validation';
import { toast } from 'sonner';

// Initialize Stripe with publishable key (use test key)
const stripePromise = loadStripe('pk_test_51234567890abcdefghijklmnopqrstuvwxyz');

type AccountType = 'organization' | 'expert' | null;
type PlanType = 'org-beginner' | 'org-professional' | 'expert-beginner' | 'expert-professional' | null;

interface FormData {
  accountType: AccountType;
  planType: PlanType;
  
  // Common fields
  email: string;
  password: string;
  confirmPassword: string;
  
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
  orgSectors: string;  // Changed from array to string for Select component
  orgSubsectors: string;  // Changed from array to string for Select component
  
  // Expert fields
  firstName: string;
  lastName: string;
  expertEmail: string;
  expertPhone: string;
  nationality: string;
  country: string;
  city: string;
  expertise: string;  // Changed from array to string for Select component
  expertSubsectors: string;  // Changed from array to string for Select component
  experience: string;
  
  // Newsletter preferences
  newsletterTenders: boolean;
  newsletterTraining: boolean;
  newsletterJobs: boolean;

  // Subscription configuration (dynamic yearly pricing)
  subscriptionSectors: string[];
  subscriptionCountries: string[];
  subscriptionPrice: number;
}

// Field validation errors interface
interface FieldErrors {
  [key: string]: string;
}

const LOCALSTORAGE_KEY = 'assortis_signup_draft';

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

const SUBSECTORS_BY_SECTOR: Record<string, string[]> = {
  EDUCATION: ['PRIMARY_EDUCATION', 'SECONDARY_EDUCATION', 'HIGHER_EDUCATION', 'VOCATIONAL_TRAINING', 'TEACHER_TRAINING', 'ADULT_EDUCATION'],
  HEALTH: ['PRIMARY_HEALTHCARE', 'MATERNAL_HEALTH', 'CHILD_HEALTH', 'INFECTIOUS_DISEASES', 'NUTRITION', 'MENTAL_HEALTH'],
  AGRICULTURE: ['CROP_PRODUCTION', 'LIVESTOCK', 'FISHERIES', 'IRRIGATION', 'AGRIBUSINESS', 'FOOD_SECURITY'],
  INFRASTRUCTURE: ['ROADS', 'BRIDGES', 'BUILDINGS', 'TELECOMMUNICATIONS', 'PORTS', 'AIRPORTS'],
  GOVERNANCE: ['PUBLIC_ADMINISTRATION', 'DECENTRALIZATION', 'ANTI_CORRUPTION', 'CIVIL_SOCIETY', 'ELECTIONS', 'JUSTICE_REFORM'],
  ENVIRONMENT: ['CLIMATE_CHANGE', 'BIODIVERSITY', 'POLLUTION_CONTROL', 'WASTE_MANAGEMENT', 'FORESTRY', 'CONSERVATION'],
  WATER_SANITATION: ['DRINKING_WATER', 'WASTEWATER', 'SANITATION_FACILITIES', 'HYGIENE_PROMOTION', 'WATER_RESOURCES'],
  ENERGY: ['RENEWABLE_ENERGY', 'ELECTRICITY_GRID', 'OFF_GRID_SOLUTIONS', 'ENERGY_EFFICIENCY', 'SOLAR_POWER'],
  GENDER: ['GENDER_EQUALITY', 'WOMENS_EMPOWERMENT', 'GBV_PREVENTION', 'ECONOMIC_INCLUSION'],
  HUMAN_RIGHTS: ['CIVIL_RIGHTS', 'REFUGEE_PROTECTION', 'DISABILITY_RIGHTS', 'MINORITY_RIGHTS'],
  YOUTH: ['YOUTH_EMPLOYMENT', 'YOUTH_ENGAGEMENT', 'YOUTH_EDUCATION', 'YOUTH_HEALTH'],
  EMERGENCY_RESPONSE: ['DISASTER_RELIEF', 'HUMANITARIAN_AID', 'CONFLICT_RESPONSE', 'DISPLACEMENT'],
  OTHER: []
};

const COUNTRIES = [
  'United States', 'France', 'Spain', 'Germany', 'United Kingdom', 
  'Canada', 'Belgium', 'Switzerland', 'Netherlands', 'Kenya',
  'Senegal', 'Morocco', 'Côte d\'Ivoire', 'Mali', 'Burkina Faso'
];

// ─── Yearly Pricing Matrix ────────────────────────────────────────────────────
type SectorRange = '1-4' | '5-20' | '21-40' | '41-80' | '81-160' | '161-250' | '251-362';
type CountryRange = '1' | '2-9' | '10-99' | '100+';

const PRICING_MATRIX: Record<SectorRange, Record<CountryRange, number>> = {
  '1-4':     { '1': 300,  '2-9': 450,  '10-99': 700,  '100+': 900  },
  '5-20':    { '1': 400,  '2-9': 550,  '10-99': 800,  '100+': 1000 },
  '21-40':   { '1': 500,  '2-9': 650,  '10-99': 900,  '100+': 1200 },
  '41-80':   { '1': 600,  '2-9': 750,  '10-99': 1200, '100+': 1700 },
  '81-160':  { '1': 700,  '2-9': 1100, '10-99': 1600, '100+': 2200 },
  '161-250': { '1': 800,  '2-9': 1400, '10-99': 2000, '100+': 2600 },
  '251-362': { '1': 900,  '2-9': 1800, '10-99': 2500, '100+': 3100 },
};

function getSectorRange(count: number): SectorRange {
  if (count <= 4) return '1-4';
  if (count <= 20) return '5-20';
  if (count <= 40) return '21-40';
  if (count <= 80) return '41-80';
  if (count <= 160) return '81-160';
  if (count <= 250) return '161-250';
  return '251-362';
}

function getCountryRange(count: number): CountryRange {
  if (count <= 1) return '1';
  if (count <= 9) return '2-9';
  if (count <= 99) return '10-99';
  return '100+';
}

function calculateYearlyPrice(sectorCount: number, countryCount: number): number {
  if (sectorCount === 0 || countryCount === 0) return 0;
  return PRICING_MATRIX[getSectorRange(sectorCount)][getCountryRange(countryCount)];
}

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();
  const { t, language } = useTranslation() as any;
  
  // Check if resuming Phase 2
  const resumePhase2State = location.state as any;
  const shouldResumePhase2 = resumePhase2State?.resumePhase2 === true;
  
  const [currentStep, setCurrentStep] = useState(shouldResumePhase2 ? 6 : 1);
  const totalSteps = 7; // Keep original 7 steps for better UX flow
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCodeData | null>(null);
  const [hasChosenPromoOption, setHasChosenPromoOption] = useState(false);
  const [showCompletionChoice, setShowCompletionChoice] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [completedSteps, setCompletedSteps] = useState<number[]>(shouldResumePhase2 ? [1, 2, 3, 4, 5] : []);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Ref for first input of each step (auto-focus)
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Initialize formData with localStorage restoration or resumePhase2 data
  const [formData, setFormData] = useState<FormData>(() => {
    // If resuming Phase 2, use the data from location.state
    if (shouldResumePhase2 && resumePhase2State) {
      const defaultFormData = {
        accountType: resumePhase2State.accountType || null,
        planType: resumePhase2State.planType || null,
        
        email: resumePhase2State.email || '',
        password: resumePhase2State.password || '',
        confirmPassword: resumePhase2State.password || '',
        
        orgName: resumePhase2State.orgName || '',
        orgLegalName: '',
        orgType: '',
        orgRegistrationNumber: '',
        orgEmail: resumePhase2State.email || '',
        orgPhone: '',
        orgWebsite: '',
        orgCountry: '',
        orgCity: '',
        contactPersonName: resumePhase2State.firstName && resumePhase2State.lastName 
          ? `${resumePhase2State.firstName} ${resumePhase2State.lastName}` 
          : '',
        contactPersonPosition: '',
        orgSectors: '',
        orgSubsectors: '',
        
        firstName: resumePhase2State.firstName || '',
        lastName: resumePhase2State.lastName || '',
        expertEmail: resumePhase2State.email || '',
        expertPhone: '',
        nationality: '',
        country: '',
        city: '',
        expertise: '',
        expertSubsectors: '',
        experience: '',
        
        newsletterTenders: true,
        newsletterTraining: true,
        newsletterJobs: true,

        subscriptionSectors: [],
        subscriptionCountries: [],
        subscriptionPrice: 0,
      };
      
      setTimeout(() => {
        toast.success(t('auth.signup.resumingPhase2') || 'Resuming Phase 2 of registration');
      }, 500);
      
      return defaultFormData;
    }
    
    // Try to restore from localStorage
    try {
      const saved = localStorage.getItem(LOCALSTORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Show success toast
        setTimeout(() => {
          toast.success(t('auth.signup.draftRestored') || 'Your draft has been restored');
        }, 500);
        return {
          ...parsed,
          subscriptionSectors: parsed.subscriptionSectors ?? [],
          subscriptionCountries: parsed.subscriptionCountries ?? [],
          subscriptionPrice: parsed.subscriptionPrice ?? 0,
        };
      }
    } catch (error) {
      console.error('Failed to restore draft:', error);
    }
    
    // Default initial state
    return {
    accountType: null,
    planType: null,
    
    email: '',
    password: '',
    confirmPassword: '',
    
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
    orgSectors: '',
    orgSubsectors: '',
    
    firstName: '',
    lastName: '',
    expertEmail: '',
    expertPhone: '',
    nationality: '',
    country: '',
    city: '',
    expertise: '',
    expertSubsectors: '',
    experience: '',
    
    newsletterTenders: true,
    newsletterTraining: true,
    newsletterJobs: true,

    subscriptionSectors: [],
    subscriptionCountries: [],
    subscriptionPrice: 0,
    };
  });

  // Auto-save to localStorage with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(formData));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Failed to save draft:', error);
      }
    }, 1000); // Debounce 1 second
    
    return () => clearTimeout(timer);
  }, [formData]);

  // Handle resuming incomplete signup from login page
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const shouldResume = searchParams.get('resume') === 'true';
    
    if (shouldResume) {
      try {
        const resumeDataJson = localStorage.getItem('assortis_resume_signup');
        if (resumeDataJson) {
          const resumeData = JSON.parse(resumeDataJson);
          
          // Restore form data
          setFormData({
            accountType: resumeData.accountType || null,
            planType: resumeData.planType || null,
            
            email: resumeData.email || '',
            password: resumeData.password || '',
            confirmPassword: resumeData.password || '',
            
            orgName: resumeData.orgName || '',
            orgLegalName: '',
            orgType: '',
            orgRegistrationNumber: '',
            orgEmail: resumeData.email || '',
            orgPhone: '',
            orgWebsite: '',
            orgCountry: '',
            orgCity: '',
            contactPersonName: resumeData.firstName && resumeData.lastName 
              ? `${resumeData.firstName} ${resumeData.lastName}` 
              : '',
            contactPersonPosition: '',
            orgSectors: '',
            orgSubsectors: '',
            
            firstName: resumeData.firstName || '',
            lastName: resumeData.lastName || '',
            expertEmail: resumeData.email || '',
            expertPhone: '',
            nationality: '',
            country: '',
            city: '',
            expertise: '',
            expertSubsectors: '',
            experience: '',
            
            newsletterTenders: true,
            newsletterTraining: true,
            newsletterJobs: true,

            subscriptionSectors: [],
            subscriptionCountries: [],
            subscriptionPrice: 0,
          });
          
          // Restore progress
          setCurrentStep(resumeData.currentStep || 1);
          setCompletedSteps(resumeData.completedSteps || []);
          setIsEmailVerified(resumeData.isEmailVerified || false);
          
          // Clear the resume data from localStorage
          localStorage.removeItem('assortis_resume_signup');
          
          // Show success message
          toast.success(t('auth.signup.draftRestored') || 'Your draft has been restored');
        }
      } catch (error) {
        console.error('Failed to restore incomplete signup:', error);
      }
    }
  }, [location.search, t]);

  // Auto-focus first input when step changes
  useEffect(() => {
    const timer = setTimeout(() => {
      firstInputRef.current?.focus();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Sync yearly price whenever sector/country selection changes
  useEffect(() => {
    const price = calculateYearlyPrice(
      formData.subscriptionSectors.length,
      formData.subscriptionCountries.length
    );
    if (price !== formData.subscriptionPrice) {
      setFormData(prev => ({ ...prev, subscriptionPrice: price }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.subscriptionSectors, formData.subscriptionCountries]);

  // Clear draft from localStorage
  const clearDraft = () => {
    try {
      localStorage.removeItem(LOCALSTORAGE_KEY);
      setLastSaved(null);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  // Real-time field validation
  const validateField = (field: keyof FormData, value: any): string => {
    switch (field) {
      case 'email':
      case 'orgEmail':
      case 'expertEmail':
        if (!value) return '';
        return !validateEmail(value as string) 
          ? t('auth.validation.invalidEmail') || 'Please enter a valid email address'
          : '';
      
      case 'password':
        if (!value) return '';
        return !validatePassword(value as string)
          ? t('auth.validation.weakPassword') || 'Password must be at least 6 characters'
          : '';
      
      case 'confirmPassword':
        if (!value) return '';
        return value !== formData.password
          ? t('auth.signup.passwordMismatch') || 'Passwords do not match'
          : '';
      
      case 'orgPhone':
      case 'expertPhone':
        if (!value) return '';
        return !validatePhone(value as string)
          ? t('auth.validation.invalidPhone') || 'Please enter a valid phone number'
          : '';
      
      case 'orgWebsite':
        if (!value) return '';
        return !validateUrl(value as string)
          ? t('auth.validation.invalidUrl') || 'Please enter a valid URL'
          : '';
      
      case 'firstName':
      case 'lastName':
      case 'contactPersonName':
        if (!value) return '';
        return !validateName(value as string)
          ? t('auth.validation.invalidName') || 'Please enter a valid name'
          : '';
      
      default:
        return '';
    }
  };

  // Handle field blur for validation
  const handleFieldBlur = (field: keyof FormData) => {
    const value = formData[field];
    const errorMessage = validateField(field, value);
    if (errorMessage) {
      setFieldErrors(prev => ({ ...prev, [field]: errorMessage }));
    }
  };

  // Password strength calculator
  const getPasswordStrength = (password: string): { 
    strength: number; 
    label: string; 
    color: string 
  } => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    
    if (strength <= 25) return { 
      strength, 
      label: t('auth.password.weak') || 'Weak', 
      color: 'bg-red-500' 
    };
    if (strength <= 50) return { 
      strength, 
      label: t('auth.password.fair') || 'Fair', 
      color: 'bg-orange-500' 
    };
    if (strength <= 75) return { 
      strength, 
      label: t('auth.password.good') || 'Good', 
      color: 'bg-yellow-500' 
    };
    return { 
      strength, 
      label: t('auth.password.strong') || 'Strong', 
      color: 'bg-green-500' 
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      
      // If at step 1 and has a valid promo code, jump directly to step 7 (payment)
      if (currentStep === 1 && appliedPromoCode && appliedPromoCode.isValid) {
        setCurrentStep(7);
        return;
      }
      
      // If at step 5 (plan selection), show completion choice instead of going to step 6
      if (currentStep === 5) {
        setShowCompletionChoice(true);
        return;
      }
      
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    // If showing completion choice, hide it and go back to step 5
    if (showCompletionChoice) {
      setShowCompletionChoice(false);
      setError('');
      return;
    }
    
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.accountType !== null;
    }
    if (currentStep === 2) {
      if (formData.accountType === 'organization') {
        const hasRequiredFields = formData.orgName && formData.orgEmail && formData.contactPersonName;
        const hasNoErrors = !fieldErrors.orgEmail && !fieldErrors.contactPersonName;
        return hasRequiredFields && hasNoErrors;
      } else {
        const hasRequiredFields = formData.firstName && formData.lastName && formData.expertEmail;
        const hasNoErrors = !fieldErrors.firstName && !fieldErrors.lastName && !fieldErrors.expertEmail;
        return hasRequiredFields && hasNoErrors;
      }
    }
    if (currentStep === 3) {
      const hasRequiredFields = formData.email && formData.password && formData.confirmPassword;
      const hasNoErrors = !fieldErrors.email && !fieldErrors.password && !fieldErrors.confirmPassword;
      return hasRequiredFields && hasNoErrors;
    }
    if (currentStep === 4) {
      // Newsletter step - always can proceed (all checkboxes are optional)
      return true;
    }
    if (currentStep === 5) {
      return formData.subscriptionSectors.length > 0 && formData.subscriptionCountries.length > 0;
    }
    if (currentStep === 6) {
      return isEmailVerified;
    }
    if (currentStep === 7) {
      // Payment form has its own validation
      return true;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.signup.passwordMismatch') || 'Passwords do not match');
      return;
    }

    // Validate subscription configuration
    if (formData.subscriptionSectors.length === 0 || formData.subscriptionCountries.length === 0) {
      setError('Please complete the configuration step (sectors and countries).');
      return;
    }

    setLoading(true);

    try {
      // Determine first and last name based on account type
      let firstName = '';
      let lastName = '';
      let email = formData.email;

      if (formData.accountType === 'organization') {
        firstName = formData.contactPersonName.split(' ')[0] || formData.contactPersonName;
        lastName = formData.contactPersonName.split(' ').slice(1).join(' ') || formData.orgName;
      } else {
        firstName = formData.firstName;
        lastName = formData.lastName;
      }

      await signup({
        firstName,
        lastName,
        email,
        password: formData.password,
      });
      
      // Calculate payment amount (considering promo discount)
      const baseAmount = formData.subscriptionPrice;
      const finalAmount = appliedPromoCode?.discountPercent 
        ? baseAmount - (baseAmount * appliedPromoCode.discountPercent / 100)
        : baseAmount;
      
      // Send confirmation email
      const emailSent = await sendConfirmationEmail({
        to: email,
        subject: 'Welcome to Assortis - Registration Confirmed',
        firstName,
        lastName,
        accountType: formData.accountType!,
        planType: formData.planType,
        orgName: formData.accountType === 'organization' ? formData.orgName : undefined,
        amount: finalAmount,
        discountPercent: appliedPromoCode?.discountPercent,
      });

      if (!emailSent) {
        console.warn('Failed to send confirmation email, but continuing registration');
      }
      
      // Clear draft on successful registration
      clearDraft();
      
      // Redirect to confirmation page with user data
      navigate('/signup-confirmation', {
        state: {
          email: email,
          accountType: formData.accountType,
          planType: formData.planType,
          firstName: firstName,
          lastName: lastName,
          orgName: formData.orgName,
        }
      });
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handler for "Continue Now" choice
  const handleContinueNow = () => {
    setShowCompletionChoice(false);
    setCurrentStep(6); // Go to email verification (Phase 2)
  };

  // Handler for "Complete Later" choice
  const handleCompleteLater = async () => {
    setLoading(true);
    try {
      // Determine first and last name based on account type
      let firstName = '';
      let lastName = '';
      let email = formData.email;

      if (formData.accountType === 'organization') {
        firstName = formData.contactPersonName.split(' ')[0] || formData.contactPersonName;
        lastName = formData.contactPersonName.split(' ').slice(1).join(' ') || formData.orgName;
      } else {
        firstName = formData.firstName;
        lastName = formData.lastName;
      }

      // Save user data (pre-registration)
      await signup({
        firstName,
        lastName,
        email,
        password: formData.password,
      });

      // Send completion email with link to continue registration
      await sendConfirmationEmail({
        to: email,
        subject: 'Complete Your Assortis Registration',
        firstName,
        lastName,
        accountType: formData.accountType!,
        planType: formData.planType,
        orgName: formData.accountType === 'organization' ? formData.orgName : undefined,
        amount: 0, // Amount will be calculated when they complete
        discountPercent: appliedPromoCode?.discountPercent,
      });

      // Clear draft on pre-registration
      clearDraft();

      // Redirect to confirmation page with "complete later" message
      navigate('/signup-confirmation', {
        state: {
          email: email,
          accountType: formData.accountType,
          planType: formData.planType,
          firstName: firstName,
          lastName: lastName,
          orgName: formData.orgName,
          completeLater: true, // Flag to show different message
        }
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = [
    t('auth.signup.selectType'),
    t('auth.signup.yourInformation'),
    t('auth.signup.accountCredentials'),
    t('auth.signup.newsletterPreferences'),
    t('auth.signup.configurationPricing'),
    t('auth.signup.verifyEmail'),
    t('payment.title'),
  ];

  return (
    <>
      <PageBanner
        icon={UserPlus}
        title={t('auth.signup.title')}
        subtitle={t('auth.signup.subtitle')}
      />
      
      <PageContainer>
        {/* Auto-save Indicator */}
        {lastSaved && (
          <div className="mb-4 flex items-center justify-end gap-2 text-sm text-gray-500 animate-in fade-in">
            <Save className="h-4 w-4" />
            <span>
              {t('auth.signup.autoSaved') || 'Auto-saved'} {new Date(lastSaved).toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-12">
          {/* Phase Indicator */}
          <div className="flex justify-center gap-4 mb-6">
            <div className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
              currentStep <= 5 
                ? 'bg-accent text-white shadow-md' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              {t('auth.signup.phase1Complete').split(':')[0]} {/* Phase 1 */}
            </div>
            <div className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
              currentStep >= 6 
                ? 'bg-accent text-white shadow-md' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              {t('auth.signup.phase2Payment').split(':')[0]} {/* Phase 2 */}
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4, 5, 6, 7].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div 
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
                    step < currentStep || completedSteps.includes(step)
                      ? 'bg-green-500 text-white shadow-lg scale-110'
                      : step === currentStep
                      ? 'bg-accent text-white shadow-lg scale-125 ring-4 ring-accent/20'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                  aria-label={`Step ${step}: ${stepTitles[step - 1]}`}
                  role="status"
                  aria-current={step === currentStep ? 'step' : undefined}
                >
                  {step < currentStep || completedSteps.includes(step) ? (
                    <Check className="h-5 w-5" strokeWidth={3} />
                  ) : (
                    step
                  )}
                </div>
                {step < 7 && (
                  <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                    step < currentStep || completedSteps.includes(step) ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">
              {t('common.step') || 'Step'} {currentStep} {t('common.of') || 'of'} {totalSteps}: <span className="text-primary font-semibold">{stepTitles[currentStep - 1]}</span>
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-3xl mx-auto">
          {/* Step 1: Account Type Selection */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => {
                    handleInputChange('accountType', 'organization');
                    // Reset planType when changing account type
                    handleInputChange('planType', null);
                    // Disable jobs newsletter for organizations
                    handleInputChange('newsletterJobs', false);
                  }}
                  className={`group relative overflow-hidden rounded-2xl p-8 text-left transition-all duration-300 hover:scale-105 border-2 ${
                    formData.accountType === 'organization'
                      ? 'border-accent bg-accent/5 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`rounded-xl p-3 transition-colors duration-300 ${
                      formData.accountType === 'organization' ? 'bg-accent' : 'bg-gray-100 group-hover:bg-accent/20'
                    }`}>
                      <Building2 className={`h-8 w-8 ${
                        formData.accountType === 'organization' ? 'text-white' : 'text-gray-600 group-hover:text-accent'
                      }`} strokeWidth={2} />
                    </div>
                    <h3 className="text-xl font-bold text-primary">
                      {t('auth.signup.typeOrganization')}
                    </h3>
                  </div>
                  <p className="text-gray-600">
                    {t('auth.signup.typeOrganizationDesc')}
                  </p>
                  {formData.accountType === 'organization' && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-accent rounded-full p-1">
                        <Check className="h-5 w-5 text-white" strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => {
                    handleInputChange('accountType', 'expert');
                    // Reset planType when changing account type
                    handleInputChange('planType', null);
                    // Re-enable jobs newsletter for experts
                    handleInputChange('newsletterJobs', true);
                  }}
                  className={`group relative overflow-hidden rounded-2xl p-8 text-left transition-all duration-300 hover:scale-105 border-2 ${
                    formData.accountType === 'expert'
                      ? 'border-accent bg-accent/5 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`rounded-xl p-3 transition-colors duration-300 ${
                      formData.accountType === 'expert' ? 'bg-accent' : 'bg-gray-100 group-hover:bg-accent/20'
                    }`}>
                      <User className={`h-8 w-8 ${
                        formData.accountType === 'expert' ? 'text-white' : 'text-gray-600 group-hover:text-accent'
                      }`} strokeWidth={2} />
                    </div>
                    <h3 className="text-xl font-bold text-primary">
                      {t('auth.signup.typeExpert')}
                    </h3>
                  </div>
                  <p className="text-gray-600">
                    {t('auth.signup.typeExpertDesc')}
                  </p>
                  {formData.accountType === 'expert' && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-accent rounded-full p-1">
                        <Check className="h-5 w-5 text-white" strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </button>
              </div>

              {/* Promo Code Section */}
              <div className="mt-8">
                <PromoCodeSection
                  onPromoCodeValidated={(promoData) => {
                    setAppliedPromoCode(promoData);
                    
                    // If promo code is valid and has organization data, pre-fill the form
                    if (promoData && promoData.isValid && promoData.organizationData) {
                      setFormData(prev => ({
                        ...prev,
                        accountType: 'organization',
                        planType: 'org-professional', // Set default plan type for promo code users
                        orgName: promoData.organizationData?.orgName || '',
                        orgEmail: promoData.organizationData?.orgEmail || '',
                        orgPhone: promoData.organizationData?.orgPhone || '',
                        orgCountry: promoData.organizationData?.orgCountry || '',
                        contactPersonName: promoData.organizationData?.contactPersonName || '',
                        contactPersonPosition: promoData.organizationData?.contactPersonPosition || '',
                        // Also set email to organization email
                        email: promoData.organizationData?.orgEmail || '',
                      }));
                    }
                  }}
                  appliedPromo={appliedPromoCode}
                  onPromoOptionToggled={(hasChosen) => {
                    setHasChosenPromoOption(hasChosen);
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 2: Information Form */}
          {currentStep === 2 && (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8 animate-in fade-in slide-in-from-right-4 duration-500">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {formData.accountType === 'organization' ? (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-primary mb-4">
                    {t('auth.signup.typeOrganization')}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="orgName">{t('offers.form.org.name')} *</Label>
                      <Input
                        ref={firstInputRef}
                        id="orgName"
                        value={formData.orgName}
                        onChange={(e) => handleInputChange('orgName', e.target.value)}
                        placeholder={t('offers.form.org.namePlaceholder')}
                        aria-required="true"
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
                        onBlur={() => handleFieldBlur('orgEmail')}
                        placeholder={t('offers.form.org.emailPlaceholder')}
                        className={fieldErrors.orgEmail ? 'border-red-500' : ''}
                        aria-required="true"
                        aria-invalid={!!fieldErrors.orgEmail}
                      />
                      {fieldErrors.orgEmail && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                          <AlertCircle className="h-4 w-4" />
                          {fieldErrors.orgEmail}
                        </p>
                      )}
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
                            <SelectItem key={country} value={country}>{country}</SelectItem>
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
                        onBlur={() => handleFieldBlur('contactPersonName')}
                        placeholder={t('offers.form.org.contactPersonPlaceholder')}
                        className={fieldErrors.contactPersonName ? 'border-red-500' : ''}
                        aria-required="true"
                        aria-invalid={!!fieldErrors.contactPersonName}
                      />
                      {fieldErrors.contactPersonName && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                          <AlertCircle className="h-4 w-4" />
                          {fieldErrors.contactPersonName}
                        </p>
                      )}
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
                    {t('auth.signup.typeExpert')}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('offers.form.expert.firstName')} *</Label>
                      <Input
                        ref={firstInputRef}
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        onBlur={() => handleFieldBlur('firstName')}
                        placeholder={t('offers.form.expert.firstNamePlaceholder')}
                        className={fieldErrors.firstName ? 'border-red-500' : ''}
                        aria-required="true"
                        aria-invalid={!!fieldErrors.firstName}
                      />
                      {fieldErrors.firstName && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                          <AlertCircle className="h-4 w-4" />
                          {fieldErrors.firstName}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t('offers.form.expert.lastName')} *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        onBlur={() => handleFieldBlur('lastName')}
                        placeholder={t('offers.form.expert.lastNamePlaceholder')}
                        className={fieldErrors.lastName ? 'border-red-500' : ''}
                        aria-required="true"
                        aria-invalid={!!fieldErrors.lastName}
                      />
                      {fieldErrors.lastName && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                          <AlertCircle className="h-4 w-4" />
                          {fieldErrors.lastName}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="expertEmail">{t('offers.form.expert.email')} *</Label>
                      <Input
                        id="expertEmail"
                        type="email"
                        value={formData.expertEmail}
                        onChange={(e) => handleInputChange('expertEmail', e.target.value)}
                        onBlur={() => handleFieldBlur('expertEmail')}
                        placeholder={t('offers.form.expert.emailPlaceholder')}
                        className={fieldErrors.expertEmail ? 'border-red-500' : ''}
                        aria-required="true"
                        aria-invalid={!!fieldErrors.expertEmail}
                      />
                      {fieldErrors.expertEmail && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                          <AlertCircle className="h-4 w-4" />
                          {fieldErrors.expertEmail}
                        </p>
                      )}
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
                            <SelectItem key={country} value={country}>{country}</SelectItem>
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
                            <SelectItem key={country} value={country}>{country}</SelectItem>
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

          {/* Step 3: Account Credentials */}
          {currentStep === 3 && (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8 animate-in fade-in slide-in-from-right-4 duration-500">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-primary mb-4">
                  {t('auth.signup.accountCredentials')}
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.signup.email')} *</Label>
                  <Input
                    ref={firstInputRef}
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => handleFieldBlur('email')}
                    placeholder="name@example.com"
                    className={fieldErrors.email ? 'border-red-500' : ''}
                    aria-required="true"
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? 'email-error' : 'email-hint'}
                  />
                  <p id="email-hint" className="text-xs text-gray-500">
                    {t('auth.signup.emailHint') || 'We\'ll use this email for your account'}
                  </p>
                  {fieldErrors.email && (
                    <p id="email-error" className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                      <AlertCircle className="h-4 w-4" />
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.signup.password')} *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      onBlur={() => handleFieldBlur('password')}
                      minLength={6}
                      placeholder={t('auth.signup.password')}
                      className={`pr-10 ${fieldErrors.password ? 'border-red-500' : ''}`}
                      aria-required="true"
                      aria-invalid={!!fieldErrors.password}
                      aria-describedby={fieldErrors.password ? 'password-error' : 'password-hint'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label={showPassword ? t('auth.password.hide') : t('auth.password.show')}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                            style={{ width: `${passwordStrength.strength}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 min-w-[60px]">
                          {passwordStrength.label}
                        </span>
                      </div>
                      <p id="password-hint" className="text-xs text-gray-500 flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {t('auth.password.requirementsHint') || 'Use at least 6 characters, including uppercase and numbers'}
                      </p>
                    </div>
                  )}
                  
                  {fieldErrors.password && (
                    <p id="password-error" className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                      <AlertCircle className="h-4 w-4" />
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('auth.signup.confirmPassword')} *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      onBlur={() => handleFieldBlur('confirmPassword')}
                      minLength={6}
                      placeholder={t('auth.signup.confirmPassword')}
                      className={`pr-10 ${fieldErrors.confirmPassword ? 'border-red-500' : ''}`}
                      aria-required="true"
                      aria-invalid={!!fieldErrors.confirmPassword}
                      aria-describedby={fieldErrors.confirmPassword ? 'confirm-password-error' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label={showConfirmPassword ? t('auth.password.hide') : t('auth.password.show')}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {fieldErrors.confirmPassword && (
                    <p id="confirm-password-error" className="text-sm text-red-600 mt-1 flex items-center gap-1" role="alert">
                      <AlertCircle className="h-4 w-4" />
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Newsletter Preferences */}
          {currentStep === 4 && (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-primary mb-2">
                    {t('auth.signup.newsletterTitle')}
                  </h3>
                  <p className="text-gray-600">
                    {t('auth.signup.newsletterSubtitle')}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Tenders Newsletter */}
                  <div
                    onClick={() => handleInputChange('newsletterTenders', !formData.newsletterTenders)}
                    className={`cursor-pointer group relative overflow-hidden rounded-xl p-6 transition-all duration-300 border-2 hover:scale-[1.02] ${
                      formData.newsletterTenders
                        ? 'border-accent bg-accent/5 shadow-md'
                        : 'border-gray-200 bg-white hover:border-accent/30 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`rounded-lg p-3 transition-colors duration-300 ${
                        formData.newsletterTenders ? 'bg-accent' : 'bg-gray-100 group-hover:bg-accent/20'
                      }`}>
                        <Mail className={`h-6 w-6 ${
                          formData.newsletterTenders ? 'text-white' : 'text-gray-600 group-hover:text-accent'
                        }`} strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-primary mb-1">
                          {t('auth.signup.newsletter.tenders')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {t('auth.signup.newsletter.tendersDesc')}
                        </p>
                      </div>
                      {formData.newsletterTenders && (
                        <div className="flex-shrink-0">
                          <div className="bg-accent rounded-full p-1">
                            <Check className="h-5 w-5 text-white" strokeWidth={3} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Training Newsletter */}
                  <div
                    onClick={() => handleInputChange('newsletterTraining', !formData.newsletterTraining)}
                    className={`cursor-pointer group relative overflow-hidden rounded-xl p-6 transition-all duration-300 border-2 hover:scale-[1.02] ${
                      formData.newsletterTraining
                        ? 'border-accent bg-accent/5 shadow-md'
                        : 'border-gray-200 bg-white hover:border-accent/30 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`rounded-lg p-3 transition-colors duration-300 ${
                        formData.newsletterTraining ? 'bg-accent' : 'bg-gray-100 group-hover:bg-accent/20'
                      }`}>
                        <GraduationCap className={`h-6 w-6 ${
                          formData.newsletterTraining ? 'text-white' : 'text-gray-600 group-hover:text-accent'
                        }`} strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-primary mb-1">
                          {t('auth.signup.newsletter.training')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {t('auth.signup.newsletter.trainingDesc')}
                        </p>
                      </div>
                      {formData.newsletterTraining && (
                        <div className="flex-shrink-0">
                          <div className="bg-accent rounded-full p-1">
                            <Check className="h-5 w-5 text-white" strokeWidth={3} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Jobs Newsletter - Only for Experts */}
                  <div
                    onClick={() => {
                      if (formData.accountType === 'expert') {
                        handleInputChange('newsletterJobs', !formData.newsletterJobs);
                      }
                    }}
                    className={`group relative overflow-hidden rounded-xl p-6 transition-all duration-300 border-2 ${
                      formData.accountType !== 'expert'
                        ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50'
                        : formData.newsletterJobs
                        ? 'cursor-pointer border-accent bg-accent/5 shadow-md hover:scale-[1.02]'
                        : 'cursor-pointer border-gray-200 bg-white hover:border-accent/30 hover:shadow-lg hover:scale-[1.02]'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`rounded-lg p-3 transition-colors duration-300 ${
                        formData.accountType !== 'expert'
                          ? 'bg-gray-100'
                          : formData.newsletterJobs
                          ? 'bg-accent'
                          : 'bg-gray-100 group-hover:bg-accent/20'
                      }`}>
                        <Briefcase className={`h-6 w-6 ${
                          formData.accountType !== 'expert'
                            ? 'text-gray-400'
                            : formData.newsletterJobs
                            ? 'text-white'
                            : 'text-gray-600 group-hover:text-accent'
                        }`} strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`text-lg font-bold ${
                            formData.accountType !== 'expert' ? 'text-gray-500' : 'text-primary'
                          }`}>
                            {t('auth.signup.newsletter.jobs')}
                          </h4>
                          {formData.accountType !== 'expert' && (
                            <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600 border-gray-300">
                              {t('auth.signup.newsletter.jobsExpertOnly')}
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm ${
                          formData.accountType !== 'expert' ? 'text-gray-500' : 'text-gray-600'
                        }`}>
                          {t('auth.signup.newsletter.jobsDesc')}
                        </p>
                      </div>
                      {formData.newsletterJobs && formData.accountType === 'expert' && (
                        <div className="flex-shrink-0">
                          <div className="bg-accent rounded-full p-1">
                            <Check className="h-5 w-5 text-white" strokeWidth={3} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Configuration & Pricing */}
          {currentStep === 5 && !showCompletionChoice && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Step header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-primary mb-2">
                  {t('auth.signup.configurationPricing')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('auth.signup.pricingStep.subtitle')}
                </p>
              </div>

              {/* ── Sector Selection ─────────────────────────────────────── */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-accent/10 rounded-lg p-2">
                      <Tag className="h-5 w-5 text-accent" strokeWidth={2} />
                    </div>
                    <h4 className="text-base font-bold text-primary">
                      {t('auth.signup.pricingStep.sectorsTitle')}
                    </h4>
                  </div>
                  {formData.subscriptionSectors.length > 0 && (
                    <Badge className="bg-accent/10 text-accent border-accent/20 font-medium">
                      {t('auth.signup.pricingStep.selectedSectors', { count: formData.subscriptionSectors.length })}
                    </Badge>
                  )}
                </div>

                {/* Select all / Deselect all */}
                <div className="flex items-center gap-3 mb-4">
                  {formData.subscriptionSectors.length === PRICING_SECTORS.length ? (
                    <button
                      type="button"
                      onClick={() => handleInputChange('subscriptionSectors', [])}
                      className="text-sm font-medium text-accent hover:text-accent/80 underline underline-offset-2 transition-colors"
                    >
                      {t('auth.signup.pricingStep.deselectAllSectors')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleInputChange('subscriptionSectors', PRICING_SECTORS.map(s => s.id))}
                      className="text-sm font-medium text-accent hover:text-accent/80 underline underline-offset-2 transition-colors"
                    >
                      {t('auth.signup.pricingStep.selectAllSectors')}
                    </button>
                  )}
                  <span className="text-xs text-gray-400">
                    {formData.subscriptionSectors.length} / {PRICING_SECTORS.length}
                  </span>
                </div>

                {/* Sector grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRICING_SECTORS.map((sector) => {
                    const isChecked = formData.subscriptionSectors.includes(sector.id);
                    return (
                      <div
                        key={sector.id}
                        role="checkbox"
                        aria-checked={isChecked}
                        tabIndex={0}
                        onClick={() => {
                          const current = formData.subscriptionSectors;
                          handleInputChange(
                            'subscriptionSectors',
                            isChecked
                              ? current.filter(id => id !== sector.id)
                              : [...current, sector.id]
                          );
                        }}
                        onKeyDown={(e) => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault();
                            const current = formData.subscriptionSectors;
                            handleInputChange(
                              'subscriptionSectors',
                              isChecked
                                ? current.filter(id => id !== sector.id)
                                : [...current, sector.id]
                            );
                          }
                        }}
                        className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-all duration-150 select-none ${
                          isChecked
                            ? 'border-accent bg-accent/5 shadow-sm'
                            : 'border-gray-200 hover:border-accent/40 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-accent border-accent' : 'border-gray-300'
                        }`}>
                          {isChecked && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />}
                        </div>
                        <span className={`text-xs font-medium leading-tight ${
                          isChecked ? 'text-accent' : 'text-gray-700'
                        }`}>
                          {t(sector.labelKey)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Country Selection ─────────────────────────────────────── */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-accent/10 rounded-lg p-2">
                      <Globe className="h-5 w-5 text-accent" strokeWidth={2} />
                    </div>
                    <h4 className="text-base font-bold text-primary">
                      {t('auth.signup.pricingStep.countriesTitle')}
                    </h4>
                  </div>
                  {formData.subscriptionCountries.length > 0 && (
                    <Badge className="bg-accent/10 text-accent border-accent/20 font-medium">
                      {t('auth.signup.pricingStep.selectedCountries', { count: formData.subscriptionCountries.length })}
                    </Badge>
                  )}
                </div>

                {/* Select all / Deselect all + search */}
                <div className="flex items-center gap-3 mb-3">
                  {formData.subscriptionCountries.length === FULL_COUNTRIES.length ? (
                    <button
                      type="button"
                      onClick={() => handleInputChange('subscriptionCountries', [])}
                      className="text-sm font-medium text-accent hover:text-accent/80 underline underline-offset-2 transition-colors"
                    >
                      {t('auth.signup.pricingStep.deselectAllCountries')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleInputChange('subscriptionCountries', FULL_COUNTRIES.map(c => c.code))}
                      className="text-sm font-medium text-accent hover:text-accent/80 underline underline-offset-2 transition-colors"
                    >
                      {t('auth.signup.pricingStep.selectAllCountries')}
                    </button>
                  )}
                  <span className="text-xs text-gray-400">
                    {formData.subscriptionCountries.length} / {FULL_COUNTRIES.length}
                  </span>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                    placeholder={t('auth.signup.pricingStep.searchCountries')}
                    value={countrySearch}
                    onChange={e => setCountrySearch(e.target.value)}
                  />
                </div>

                {/* Scrollable country list */}
                <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-100 divide-y divide-gray-50">
                  {(() => {
                    const lang = (language || 'en') as 'en' | 'fr' | 'es';
                    const sorted = getCountriesSorted(lang);
                    const filtered = countrySearch.trim()
                      ? sorted.filter(c =>
                          c.name[lang].toLowerCase().includes(countrySearch.toLowerCase())
                        )
                      : sorted;
                    return filtered.map((country) => {
                      const isChecked = formData.subscriptionCountries.includes(country.code);
                      return (
                        <div
                          key={country.code}
                          role="checkbox"
                          aria-checked={isChecked}
                          tabIndex={0}
                          onClick={() => {
                            const current = formData.subscriptionCountries;
                            handleInputChange(
                              'subscriptionCountries',
                              isChecked
                                ? current.filter(code => code !== country.code)
                                : [...current, country.code]
                            );
                          }}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              const current = formData.subscriptionCountries;
                              handleInputChange(
                                'subscriptionCountries',
                                isChecked
                                  ? current.filter(code => code !== country.code)
                                  : [...current, country.code]
                              );
                            }
                          }}
                          className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors select-none ${
                            isChecked ? 'bg-accent/5' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-accent border-accent' : 'border-gray-300'
                          }`}>
                            {isChecked && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />}
                          </div>
                          <span className={`text-sm ${isChecked ? 'text-accent font-medium' : 'text-gray-700'}`}>
                            {country.name[lang]}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* ── Live Pricing Card ─────────────────────────────────────── */}
              {formData.subscriptionSectors.length > 0 && formData.subscriptionCountries.length > 0 ? (
                <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl border-2 border-accent/20 p-6 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Summary */}
                      <p className="text-sm text-gray-600 mb-3">
                        <span className="font-semibold text-primary">{formData.subscriptionSectors.length}</span>{' '}
                        {t('auth.signup.pricingStep.sectorsTitle').toLowerCase()}{' × '}
                        <span className="font-semibold text-primary">{formData.subscriptionCountries.length}</span>{' '}
                        {t('auth.signup.pricingStep.countriesTitle').toLowerCase()}
                      </p>

                      {/* Pricing tier */}
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-4 w-4 text-accent flex-shrink-0" strokeWidth={2} />
                        <span className="text-xs text-gray-500">
                          {t('auth.signup.pricingStep.pricingTier', {
                            sectorRange: getSectorRange(formData.subscriptionSectors.length),
                            countryRange: getCountryRange(formData.subscriptionCountries.length),
                          })}
                        </span>
                      </div>

                      {/* Price */}
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          {t('auth.signup.pricingStep.yourYearlyPrice')}
                        </p>
                        <div className="flex items-baseline gap-1">
                          <Euro className="h-6 w-6 text-primary mb-1" strokeWidth={2.5} />
                          <span className="text-4xl font-extrabold text-primary tabular-nums">
                            {formData.subscriptionPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-accent font-semibold">
                            {t('auth.signup.pricingStep.billedYearly')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {t('auth.signup.pricingStep.totalPerYear')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Check badge */}
                    <div className="bg-accent rounded-full p-3 flex-shrink-0">
                      <Check className="h-6 w-6 text-white" strokeWidth={3} />
                    </div>
                  </div>

                  {/* Subtle note */}
                  <p className="text-xs text-gray-500 mt-4 pt-3 border-t border-accent/10 flex items-center gap-1">
                    <Info className="h-3.5 w-3.5 flex-shrink-0" />
                    {t('auth.signup.pricingStep.priceNote')}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-400">
                  <Euro className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{t('auth.signup.pricingStep.noSelection')}</p>
                </div>
              )}
            </div>
          )}

          {/* Completion Choice Screen (shown after Step 5) */}
          {currentStep === 5 && showCompletionChoice && (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl p-6 shadow-lg animate-in fade-in zoom-in duration-500">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <CheckCircle2 className="h-8 w-8 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">
                      {t('auth.signup.preregistrationTitle')}
                    </h3>
                    <p className="text-sm text-white/90">
                      {t('auth.signup.preregistrationSuccess')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Choice Cards */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
                <p className="text-gray-600 text-center mb-8 text-lg">
                  {t('auth.signup.preregistrationSubtitle')}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Continue Now */}
                  <button
                    onClick={handleContinueNow}
                    disabled={loading}
                    className="group relative bg-white rounded-xl border-2 border-accent p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:bg-accent/5"
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="bg-gradient-to-br from-accent to-primary rounded-full p-4">
                        <ArrowRight className="h-8 w-8 text-white" strokeWidth={2} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-primary mb-2">
                          {t('auth.signup.continueNow')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {t('auth.signup.continueNowDesc')}
                        </p>
                      </div>
                      <div className="mt-4 bg-accent text-white px-6 py-2 rounded-lg font-semibold group-hover:shadow-lg transition-all">
                        {t('auth.signup.continueNow')}
                      </div>
                    </div>
                  </button>

                  {/* Complete Later */}
                  <button
                    onClick={handleCompleteLater}
                    disabled={loading}
                    className="group relative bg-white rounded-xl border-2 border-gray-300 p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-gray-400 hover:bg-gray-50"
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-full p-4">
                        <Mail className="h-8 w-8 text-white" strokeWidth={2} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-primary mb-2">
                          {t('auth.signup.completeLater')}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {t('auth.signup.completeLaterDesc')}
                        </p>
                      </div>
                      <div className="mt-4 bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold group-hover:shadow-lg transition-all">
                        {t('auth.signup.completeLater')}
                      </div>
                    </div>
                  </button>
                </div>

                {error && (
                  <Alert variant="destructive" className="mt-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Back button */}
                <div className="flex justify-center mt-6 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={loading}
                    className="min-w-[140px] h-11 transition-all duration-300 hover:scale-105"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('pagination.previous')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Email Verification */}
          {currentStep === 6 && !showCompletionChoice && (
            <div className="space-y-6">
              {/* Phase Transition Banner */}
              <div className="bg-gradient-to-r from-accent to-primary text-white rounded-xl p-6 shadow-lg animate-in fade-in zoom-in duration-500">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <CheckCircle2 className="h-8 w-8 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">
                      {t('auth.signup.phase1Complete')}
                    </h3>
                    <p className="text-sm text-white/90">
                      {t('auth.signup.phase2Payment')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
                <EmailVerification
                  email={formData.email}
                  onVerified={() => {
                    setIsEmailVerified(true);
                    handleNext();
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 7: Payment */}
          {currentStep === 7 && (
            <div className="space-y-6">
              {/* Registration Summary for Regular Users */}
              {!appliedPromoCode?.isValid && (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-600 rounded-full p-2">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-primary">
                      {t('auth.confirmation.accountDetails')}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-600 text-xs mb-1">{t('auth.confirmation.accountType')}</p>
                      <p className="text-primary font-semibold">
                        {formData.accountType === 'organization' 
                          ? t('auth.signup.typeOrganization') 
                          : t('auth.signup.typeExpert')}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-600 text-xs mb-1">{t('auth.signup.email')}</p>
                      <p className="text-primary font-semibold">{formData.email}</p>
                    </div>
                    {formData.accountType === 'organization' && formData.orgName && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-600 text-xs mb-1">{t('offers.form.org.name')}</p>
                        <p className="text-primary font-semibold">{formData.orgName}</p>
                      </div>
                    )}
                    {formData.accountType === 'expert' && formData.firstName && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-600 text-xs mb-1">{t('auth.signup.firstName')}</p>
                        <p className="text-primary font-semibold">{formData.firstName} {formData.lastName}</p>
                      </div>
                    )}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-600 text-xs mb-1">{t('auth.signup.pricingStep.subscriptionSectors')}</p>
                      <p className="text-primary font-semibold">{formData.subscriptionSectors.length} {t('auth.signup.pricingStep.sectorsTitle').toLowerCase()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-600 text-xs mb-1">{t('auth.signup.pricingStep.subscriptionCountries')}</p>
                      <p className="text-primary font-semibold">{formData.subscriptionCountries.length} {t('auth.signup.pricingStep.countriesTitle').toLowerCase()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-600 text-xs mb-1">{t('auth.signup.pricingStep.yearlySubscription')}</p>
                      <p className="text-primary font-semibold text-lg tabular-nums">
                        {formData.subscriptionPrice.toLocaleString()} €
                        <span className="text-sm text-gray-600 font-normal">
                          {' — '}{t('auth.signup.pricingStep.billedYearly')}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Display pre-filled organization information when coming from promo code */}
              {appliedPromoCode && appliedPromoCode.isValid && appliedPromoCode.organizationData && (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-8 mb-6">
                  <div className="flex items-start gap-3 mb-6">
                    <div className="bg-green-600 rounded-full p-2">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-primary mb-2">
                        {t('auth.signup.promoInfoPreFilled')}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {t('auth.signup.promoDirectPayment')}
                      </p>
                    </div>
                  </div>

                  {/* Organization Information Display */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-base font-semibold text-primary mb-4">
                      {t('auth.signup.promoOrgInfo')}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 font-medium mb-1">{t('offers.form.org.name')}</p>
                        <p className="text-primary font-semibold">{appliedPromoCode.organizationData.orgName}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600 font-medium mb-1">{t('offers.form.org.email')}</p>
                        <p className="text-primary font-semibold">{appliedPromoCode.organizationData.orgEmail}</p>
                      </div>
                      
                      {appliedPromoCode.organizationData.orgPhone && (
                        <div>
                          <p className="text-gray-600 font-medium mb-1">{t('offers.form.org.phone')}</p>
                          <p className="text-primary font-semibold">{appliedPromoCode.organizationData.orgPhone}</p>
                        </div>
                      )}
                      
                      {appliedPromoCode.organizationData.orgCountry && (
                        <div>
                          <p className="text-gray-600 font-medium mb-1">{t('offers.form.org.country')}</p>
                          <p className="text-primary font-semibold">{appliedPromoCode.organizationData.orgCountry}</p>
                        </div>
                      )}
                      
                      {appliedPromoCode.organizationData.contactPersonName && (
                        <div>
                          <p className="text-gray-600 font-medium mb-1">{t('offers.form.org.contactPerson')}</p>
                          <p className="text-primary font-semibold">{appliedPromoCode.organizationData.contactPersonName}</p>
                        </div>
                      )}
                      
                      {appliedPromoCode.organizationData.contactPersonPosition && (
                        <div>
                          <p className="text-gray-600 font-medium mb-1">{t('offers.form.org.position')}</p>
                          <p className="text-primary font-semibold">{appliedPromoCode.organizationData.contactPersonPosition}</p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-gray-600 font-medium mb-1">{t('auth.signup.pricingStep.yearlySubscription')}</p>
                        <p className="text-primary font-semibold">{formData.subscriptionPrice.toLocaleString()} € / {t('auth.signup.pricingStep.totalPerYear')}</p>
                      </div>
                    </div>

                    {/* Discount Information */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-medium">{t('offers.become.promoDiscount')}</span>
                          <span className="text-2xl font-bold text-green-600">{appliedPromoCode.discountPercent}%</span>
                        </div>
                        
                        {/* Price Details */}
                        <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{t('payment.subtotal')}</span>
                            <span className="text-gray-600 line-through tabular-nums">
                              {formData.subscriptionPrice.toLocaleString()} €/{t('auth.signup.pricingStep.totalPerYear')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-green-600 font-medium">{t('payment.discount')}</span>
                            <span className="text-green-600 font-semibold tabular-nums">
                              -{(formData.subscriptionPrice * appliedPromoCode.discountPercent / 100).toFixed(2)} €
                            </span>
                          </div>
                          <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                            <span className="font-semibold text-primary">{t('payment.total')}</span>
                            <span className="font-bold text-xl text-primary tabular-nums">
                              {(formData.subscriptionPrice * (1 - appliedPromoCode.discountPercent / 100)).toFixed(2)} €
                              <span className="text-sm text-gray-600 font-normal">
                                {' — '}{t('auth.signup.pricingStep.billedYearly')}
                              </span>
                            </span>
                          </div>
                        </div>
                        
                        {appliedPromoCode.validUntil && (
                          <p className="text-xs text-gray-600 mt-2">
                            {t('offers.become.promoValid', { date: appliedPromoCode.validUntil })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Password Setup for Promo Code Users */}
                  {(!formData.password || !formData.confirmPassword) && (
                    <div className="mt-6 bg-white rounded-lg p-6 border-2 border-gray-200">
                      <h4 className="text-base font-semibold text-primary mb-4">
                        {t('auth.signup.createPassword')}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="passwordStep6">{t('auth.signup.password')} *</Label>
                          <Input
                            id="passwordStep6"
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            minLength={6}
                            placeholder={t('auth.signup.password')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPasswordStep6">{t('auth.signup.confirmPassword')} *</Label>
                          <Input
                            id="confirmPasswordStep6"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            minLength={6}
                            placeholder={t('auth.signup.confirmPassword')}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {t('auth.signup.passwordHint') || 'Minimum 6 characters'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Form */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
                {formData.subscriptionPrice > 0 && (
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm
                      amount={
                        appliedPromoCode?.discountPercent
                          ? formData.subscriptionPrice *
                            (1 - appliedPromoCode.discountPercent / 100)
                          : formData.subscriptionPrice
                      }
                      planName={`${formData.subscriptionSectors.length} ${t('auth.signup.pricingStep.sectorsTitle').toLowerCase()} × ${formData.subscriptionCountries.length} ${t('auth.signup.pricingStep.countriesTitle').toLowerCase()}`}
                      onSuccess={handleSubmit}
                      onError={(error) => setError(error)}
                      appliedPromoCode={
                        appliedPromoCode?.isValid
                          ? {
                              code: appliedPromoCode.code || '',
                              discountPercent: appliedPromoCode.discountPercent || 0
                            }
                          : null
                      }
                      showPromoCodeOption={hasChosenPromoOption && !appliedPromoCode?.isValid}
                    />
                  </Elements>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons - Hidden when showing completion choice */}
          {!showCompletionChoice && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="min-w-[140px] h-11 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('pagination.previous')}
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  className="min-w-[140px] h-11 transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {t('pagination.next')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                // At step 7 (payment), the payment form has its own submit button
                // So we don't show the complete registration button here
                <div className="min-w-[140px]" />
              )}
            </div>
          )}

          {/* Login Link */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {t('auth.signup.hasAccount')}{' '}
              <Link 
                to="/login" 
                className="font-medium hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                {t('auth.signup.loginLink')}
              </Link>
            </p>
          </div>
        </div>
      </PageContainer>
    </>
  );
};

export default Signup;