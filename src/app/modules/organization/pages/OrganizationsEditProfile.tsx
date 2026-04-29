import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useOrganizationProfile } from '@app/contexts/OrganizationProfileContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OrganizationsSubMenu } from '@app/components/OrganizationsSubMenu';
import { OrganizationVerificationBadge } from '@app/components/OrganizationVerificationBadge';
import { useOrganizations } from '@app/modules/organization/hooks/useOrganizations';
import { myOrganizationData } from '@app/modules/organization/data/myOrganizationData';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Textarea } from '@app/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@app/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';
import { 
  Building2, 
  ArrowLeft,
  CheckCircle2,
  Save,
  FileText,
  MapPin,
  Mail,
  Phone,
  Globe,
  Briefcase,
  Award,
  DollarSign,
  Users,
  GraduationCap,
  ChevronRight,
  Check,
  Headphones,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';

const ORGANIZATION_TYPES = [
  { value: 'serviceProvider', labelKey: 'organizations.type.PRIVATE_SECTOR', descKey: 'organizations.typeDesc.serviceProvider' },
  { value: 'company', labelKey: 'organizations.type.PRIVATE_SECTOR', descKey: 'organizations.typeDesc.company' },
  { value: 'donor', labelKey: 'organizations.type.FOUNDATION', descKey: 'organizations.typeDesc.donor' },
  { value: 'ngo', labelKey: 'organizations.type.NGO', descKey: 'organizations.typeDesc.ngo' },
  { value: 'government', labelKey: 'organizations.type.GOVERNMENT', descKey: 'organizations.typeDesc.government' },
  { value: 'privateOrg', labelKey: 'organizations.type.PRIVATE_SECTOR', descKey: 'organizations.typeDesc.privateOrg' },
  { value: 'academic', labelKey: 'organizations.type.ACADEMIC', descKey: 'organizations.typeDesc.academic' },
  { value: 'consortium', labelKey: 'organizations.type.CONSORTIUM', descKey: 'organizations.typeDesc.consortium' },
];

const SECTORS = [
  'EDUCATION',
  'HEALTH',
  'AGRICULTURE',
  'INFRASTRUCTURE',
  'GOVERNANCE',
  'ENVIRONMENT',
  'WATER_SANITATION',
  'ENERGY',
  'GENDER',
  'HUMAN_RIGHTS',
  'YOUTH',
  'EMERGENCY_RESPONSE',
  'OTHER'
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

const REGIONS = ['AFRICA', 'ASIA', 'EUROPE', 'NORTH_AMERICA', 'SOUTH_AMERICA', 'OCEANIA', 'MIDDLE_EAST'];

const LANGUAGES = ['English', 'French', 'Spanish', 'Arabic', 'Chinese', 'Portuguese', 'Russian'];

const PROFILE_VALIDATION_SECTIONS = [
  'information',
  'contact',
  'operations',
  'resources',
  'projects',
] as const;

export default function OrganizationsEditProfile() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { kpis } = useOrganizations();
  const { profile: organizationProfile, updateProfile, markSectionsForValidation } = useOrganizationProfile();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Load data from centralized organization data source
  const [formData, setFormData] = useState({
    // Step 1: Basic Information (Pre-filled with existing data from myOrganizationData)
    orgName: organizationProfile?.name || myOrganizationData.name,
    orgType: myOrganizationData.type,
    legalName: myOrganizationData.legalName,
    registrationNumber: myOrganizationData.registrationNumber,
    foundedYear: myOrganizationData.yearEstablished.toString(),
    description: organizationProfile?.description || myOrganizationData.description,
    
    // Step 2: Contact & Location (Pre-filled from myOrganizationData)
    email: myOrganizationData.email,
    phone: myOrganizationData.phone,
    website: myOrganizationData.website,
    address: myOrganizationData.address,
    city: myOrganizationData.city,
    country: myOrganizationData.country,
    postalCode: myOrganizationData.postalCode,
    
    // Step 3: Operations & Expertise (Pre-filled from myOrganizationData) - Multiple sectors selection
    operatingRegions: myOrganizationData.operatingRegions as string[],
    selectedSector: typeof myOrganizationData.selectedSector === 'string' 
      ? [myOrganizationData.selectedSector]
      : (myOrganizationData.selectedSector as string[] || []),
    subsectors: organizationProfile?.subsectors || myOrganizationData.subsectors as string[],
    languages: organizationProfile?.languages || myOrganizationData.languages as string[],
    
    // Step 4: Team & Resources (Pre-filled from myOrganizationData)
    teamSize: organizationProfile?.teamSize?.toString() || myOrganizationData.teamSize.toString(),
    experts: myOrganizationData.experts.toString(),
    
    // Step 5: Financial & Projects (Pre-filled from myOrganizationData)
    annualBudget: organizationProfile?.annualBudget?.toString() || myOrganizationData.annualBudget.toString(),
    projectsCompleted: organizationProfile?.projectsCompleted?.toString() || myOrganizationData.projectsCompleted.toString(),
    
    // Step 6: Services (Pre-filled from myOrganizationData)
    selectedServices: organizationProfile?.selectedServices || myOrganizationData.selectedServices as string[],
  });

  const availableSubsectors = useMemo(() => {
    if (!formData.selectedSector || !Array.isArray(formData.selectedSector) || formData.selectedSector.length === 0) return [];
    
    // Combine all subsectors from all selected sectors
    const allSubsectors: string[] = [];
    formData.selectedSector.forEach((sector: string) => {
      const sectorSubsectors = SUBSECTORS_BY_SECTOR[sector] || [];
      allSubsectors.push(...sectorSubsectors);
    });
    
    // Remove duplicates
    return [...new Set(allSubsectors)];
  }, [formData.selectedSector]);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Reset subsectors when sector changes
      if (field === 'selectedSector') {
        newData.subsectors = [];
      }
      
      return newData;
    });
  };

  const handleMultiSelect = (field: string, value: string) => {
    setFormData(prev => {
      const currentValues = Array.isArray(prev[field as keyof typeof prev]) 
        ? (prev[field as keyof typeof prev] as string[])
        : [];
        
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
        
      const newData = { ...prev, [field]: newValues };
      
      // Reset subsectors when sectors change
      if (field === 'selectedSector') {
        // Filter subsectors to only include those from selected sectors
        const validSubsectors: string[] = [];
        (newValues as string[]).forEach((sector: string) => {
          const sectorSubs = SUBSECTORS_BY_SECTOR[sector] || [];
          validSubsectors.push(...sectorSubs);
        });
        newData.subsectors = (prev.subsectors as string[]).filter(sub => validSubsectors.includes(sub));
      }
      
      return newData;
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSave = () => {
    markSectionsForValidation([...PROFILE_VALIDATION_SECTIONS], t('organizations.myOrganization.pendingValidation'));
    toast.success(t('organizations.editProfile.saved'));
    console.log('Saving draft:', formData);
    // TODO: Save to backend
  };

  const handleSubmit = () => {
    // Update the organization profile context with the new data
    updateProfile({
      name: formData.orgName,
      description: formData.description,
      sectors: formData.selectedSector ? formData.selectedSector as any[] : [],
      subsectors: formData.subsectors as any[],
      countries: [formData.country],
      languages: formData.languages,
      budgetRange: {
        min: parseInt(formData.annualBudget) * 0.1 || 0,
        max: parseInt(formData.annualBudget) || 0,
      },
      teamSize: parseInt(formData.teamSize) || 0,
      yearsOfExperience: 2026 - parseInt(formData.foundedYear) || 0,
      exists: true,
    });

    markSectionsForValidation([...PROFILE_VALIDATION_SECTIONS], t('organizations.myOrganization.pendingValidation'));

    toast.success(t('organizations.editProfile.success'));
    console.log('Profile updated successfully');
    navigate('/organizations/my-organization');
  };

  const steps = [
    { number: 1, title: t('organizations.createProfile.step1') },
    { number: 2, title: t('organizations.createProfile.step2') },
    { number: 3, title: t('organizations.createProfile.step3') },
    { number: 4, title: t('organizations.createProfile.step4') },
    { number: 5, title: t('organizations.createProfile.step5') },
    { number: 6, title: t('organizations.createProfile.step6') },
  ];

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <PageBanner
        title={t('organizations.editProfile.title')}
        description={t('organizations.editProfile.subtitle')}
        icon={Building2}
        stats={[
          { value: kpis.totalOrganizations.toString(), label: t('organizations.kpis.totalOrganizations') },
          { value: kpis.activeOrganizations.toString(), label: t('organizations.kpis.activeOrganizations') },
          { value: kpis.partnerships.toString(), label: t('organizations.kpis.partnerships') }
        ]}
      />

      {/* Sub Menu */}
      <OrganizationsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="mb-6 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">
                {t('organizations.myOrganization.pendingValidation')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('organizations.myOrganization.validationHint')}
              </p>
            </div>
            <OrganizationVerificationBadge status="selfDeclared" />
          </div>

          {organizationProfile.validationState.pendingValidation && (
            <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-900">
              <ShieldAlert className="h-4 w-4 text-amber-700" />
              <AlertTitle>{t('organizations.myOrganization.pendingValidation')}</AlertTitle>
              <AlertDescription>
                {organizationProfile.validationState.pendingValidationMessage ||
                  t('organizations.myOrganization.pendingValidation')}
              </AlertDescription>
            </Alert>
          )}

          {/* Stepper - Same design as NewProject */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold shadow-sm transition-all ${
                        currentStep === step.number
                          ? 'bg-[#B82547] text-white ring-4 ring-[#B82547]/20'
                          : currentStep > step.number
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-500 border-2 border-gray-300'
                      }`}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span className={`text-xs mt-2 text-center hidden md:block transition-colors ${
                      currentStep === step.number ? 'text-[#B82547] font-semibold' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded transition-colors ${
                      currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content - Same design as NewProject */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <div className="mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-[#3d4654]">
                {steps[currentStep - 1].title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {t('projects.create.step')} {currentStep} {t('common.of')} {totalSteps}
              </p>
            </div>

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-8">
                {/* Section Header with Icon */}
                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-primary mb-1">
                      {t('organizations.createProfile.step1')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('organizations.createProfile.step1.description')}
                    </p>
                  </div>
                </div>

                {/* Primary Information Card */}
                <div className="bg-gradient-to-br from-primary/[0.02] to-transparent rounded-xl p-6 border border-primary/10">
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="orgName" className="text-sm font-semibold text-foreground flex items-center gap-2">
                        {t('organizations.form.orgName')}
                        <span className="text-primary">*</span>
                      </Label>
                      <Input
                        id="orgName"
                        value={formData.orgName}
                        onChange={(e) => handleInputChange('orgName', e.target.value)}
                        placeholder={t('organizations.form.orgName.placeholder')}
                        className="mt-2 h-11"
                      />
                    </div>

                    <div>
                      <Label htmlFor="orgType" className="text-sm font-semibold text-foreground flex items-center gap-2">
                        {t('organizations.form.orgType')}
                        <span className="text-primary">*</span>
                      </Label>
                      <Select value={formData.orgType} onValueChange={(value) => handleInputChange('orgType', value)}>
                        <SelectTrigger className="mt-2 h-11">
                          <SelectValue placeholder={t('organizations.form.orgType.placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {ORGANIZATION_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="py-1.5">
                                <div className="font-medium text-foreground">{t(type.labelKey)}</div>
                                <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t(type.descKey)}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.orgType && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-xs text-blue-700 leading-relaxed">
                            {t(ORGANIZATION_TYPES.find(t => t.value === formData.orgType)?.descKey || '')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Legal & Registration Details Card */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    {t('organizations.form.legalDetails')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="legalName" className="text-sm font-medium text-foreground">
                        {t('organizations.form.legalName')}
                      </Label>
                      <Input
                        id="legalName"
                        value={formData.legalName}
                        onChange={(e) => handleInputChange('legalName', e.target.value)}
                        placeholder={t('organizations.form.legalName.placeholder')}
                        className="mt-2 h-11"
                      />
                    </div>

                    <div>
                      <Label htmlFor="registrationNumber" className="text-sm font-medium text-foreground">
                        {t('organizations.form.registrationNumber')}
                      </Label>
                      <Input
                        id="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                        placeholder={t('organizations.form.registrationNumber.placeholder')}
                        className="mt-2 h-11"
                      />
                    </div>

                    <div>
                      <Label htmlFor="foundedYear" className="text-sm font-medium text-foreground">
                        {t('organizations.form.foundedYear')}
                      </Label>
                      <Input
                        id="foundedYear"
                        type="number"
                        value={formData.foundedYear}
                        onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                        placeholder={t('organizations.form.foundedYear.placeholder')}
                        className="mt-2 h-11"
                        min="1800"
                        max="2026"
                      />
                    </div>
                  </div>
                </div>

                {/* Description Card */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                    {t('organizations.form.description')}
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder={t('organizations.form.description.placeholder')}
                    rows={5}
                    className="mt-2 resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('organizations.form.description.hint')}
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Contact & Location */}
            {currentStep === 2 && (
              <div className="space-y-8">
                {/* Section Header with Icon */}
                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-primary mb-1">
                      {t('organizations.createProfile.step2')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('organizations.createProfile.step2.description')}
                    </p>
                  </div>
                </div>

                {/* Contact Information Card */}
                <div className="bg-gradient-to-br from-green-500/[0.02] to-transparent rounded-xl p-6 border border-green-500/10">
                  <h4 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-green-600" />
                    {t('organizations.form.contactInfo')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center gap-2">
                        {t('organizations.form.email')}
                        <span className="text-primary">*</span>
                      </Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder={t('organizations.form.email.placeholder')}
                          className="h-11 pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                        {t('organizations.form.phone')}
                      </Label>
                      <div className="relative mt-2">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder={t('organizations.form.phone.placeholder')}
                          className="h-11 pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="website" className="text-sm font-medium text-foreground">
                        {t('organizations.form.website')}
                      </Label>
                      <div className="relative mt-2">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="website"
                          type="url"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder={t('organizations.form.website.placeholder')}
                          className="h-11 pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Details Card */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {t('organizations.form.physicalAddress')}
                  </h4>
                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <Label htmlFor="address" className="text-sm font-medium text-foreground">
                        {t('organizations.form.address')}
                      </Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder={t('organizations.form.address.placeholder')}
                        className="mt-2 h-11"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-sm font-medium text-foreground">
                          {t('organizations.form.city')}
                        </Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder={t('organizations.form.city.placeholder')}
                          className="mt-2 h-11"
                        />
                      </div>

                      <div>
                        <Label htmlFor="country" className="text-sm font-medium text-foreground">
                          {t('organizations.filters.country')}
                        </Label>
                        <Input
                          id="country"
                          value={formData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          placeholder={t('organizations.form.country.placeholder')}
                          className="mt-2 h-11"
                        />
                      </div>

                      <div>
                        <Label htmlFor="postalCode" className="text-sm font-medium text-foreground">
                          {t('organizations.form.postalCode')}
                        </Label>
                        <Input
                          id="postalCode"
                          value={formData.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          placeholder={t('organizations.form.postalCode.placeholder')}
                          className="mt-2 h-11"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Operations & Expertise */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-4">
                    {t('organizations.createProfile.step3')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Operating Regions */}
                  <div>
                    <Label>{t('organizations.form.operatingRegions')}</Label>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                      {REGIONS.map((region) => (
                        <button
                          key={region}
                          type="button"
                          onClick={() => handleMultiSelect('operatingRegions', region)}
                          className={`px-3 py-2 text-sm rounded-md border transition-all ${
                            formData.operatingRegions.includes(region)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-foreground border-gray-200 hover:border-primary/50'
                          }`}
                        >
                          {t(`organizations.region.${region}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sector Selection */}
                  <div>
                    <Label>{t('organizations.details.sectors')} *</Label>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                      {SECTORS.map((sector) => (
                        <button
                          key={sector}
                          type="button"
                          onClick={() => handleMultiSelect('selectedSector', sector)}
                          className={`px-3 py-2 text-sm rounded-md border transition-all ${
                            (formData.selectedSector as unknown as string[])?.includes?.(sector) || formData.selectedSector === sector
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-foreground border-gray-200 hover:border-primary/50'
                          }`}
                        >
                          {t(`sectors.${sector}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subsectors - Dependent on Sector */}
                  <div>
                    <Label>{t('organizations.form.subsectors')}</Label>
                    {!(formData.selectedSector as unknown as string[])?.length && formData.selectedSector === '' ? (
                      <p className="text-sm text-muted-foreground mt-2">{t('organizations.form.subsectors.hint')}</p>
                    ) : (
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                        {availableSubsectors.map((subsector) => (
                          <button
                            key={subsector}
                            type="button"
                            onClick={() => handleMultiSelect('subsectors', subsector)}
                            className={`px-3 py-2 text-sm rounded-md border transition-all ${
                              formData.subsectors.includes(subsector)
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-foreground border-gray-200 hover:border-primary/50'
                            }`}
                          >
                            {t(`subsectors.${subsector}`)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Languages */}
                  <div>
                    <Label>{t('organizations.form.languages')}</Label>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                      {LANGUAGES.map((language) => (
                        <button
                          key={language}
                          type="button"
                          onClick={() => handleMultiSelect('languages', language)}
                          className={`px-3 py-2 text-sm rounded-md border transition-all ${
                            formData.languages.includes(language)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-foreground border-gray-200 hover:border-primary/50'
                          }`}
                        >
                          {language}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Team & Resources */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-4">
                    {t('organizations.createProfile.step4')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teamSize">{t('organizations.form.teamSize')}</Label>
                    <Input
                      id="teamSize"
                      type="number"
                      value={formData.teamSize}
                      onChange={(e) => handleInputChange('teamSize', e.target.value)}
                      placeholder={t('organizations.form.teamSize.placeholder')}
                      className="mt-1"
                      min="1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="experts">{t('organizations.form.experts')}</Label>
                    <Input
                      id="experts"
                      type="number"
                      value={formData.experts}
                      onChange={(e) => handleInputChange('experts', e.target.value)}
                      placeholder={t('organizations.form.experts.placeholder')}
                      className="mt-1"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Financial & Projects */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-4">
                    {t('organizations.createProfile.step5')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="annualBudget">{t('organizations.form.annualBudget')}</Label>
                    <Input
                      id="annualBudget"
                      type="number"
                      value={formData.annualBudget}
                      onChange={(e) => handleInputChange('annualBudget', e.target.value)}
                      placeholder={t('organizations.form.annualBudget.placeholder')}
                      className="mt-1"
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="projectsCompleted">{t('organizations.form.projectsCompleted')}</Label>
                    <Input
                      id="projectsCompleted"
                      type="number"
                      value={formData.projectsCompleted}
                      onChange={(e) => handleInputChange('projectsCompleted', e.target.value)}
                      placeholder={t('organizations.form.projectsCompleted.placeholder')}
                      className="mt-1"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Services */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    {t('organizations.services.title')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('organizations.services.subtitle')}
                  </p>
                </div>

                {/* Service Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tenders Service */}
                  <button
                    type="button"
                    onClick={() => handleMultiSelect('selectedServices', 'Technical Assistance')}
                    className={`text-left p-6 rounded-lg border-2 transition-all ${
                      formData.selectedServices.includes('Technical Assistance')
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 bg-white hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          formData.selectedServices.includes('Technical Assistance')
                            ? 'bg-primary text-white'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          <Headphones className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-primary">
                            Technical Assistance
                          </h4>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        formData.selectedServices.includes('Technical Assistance')
                          ? 'border-primary bg-primary'
                          : 'border-gray-300'
                      }`}>
                        {formData.selectedServices.includes('Technical Assistance') && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Professional support services
                    </p>
                  </button>

                  {/* Project Management Service */}
                  <button
                    type="button"
                    onClick={() => handleMultiSelect('selectedServices', 'Project Management')}
                    className={`text-left p-6 rounded-lg border-2 transition-all ${
                      formData.selectedServices.includes('Project Management')
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 bg-white hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          formData.selectedServices.includes('Project Management')
                            ? 'bg-primary text-white'
                            : 'bg-green-100 text-green-600'
                        }`}>
                          <Briefcase className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-primary">
                            Project Management
                          </h4>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        formData.selectedServices.includes('Project Management')
                          ? 'border-primary bg-primary'
                          : 'border-gray-300'
                      }`}>
                        {formData.selectedServices.includes('Project Management') && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      End-to-end project delivery
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('organizations.form.previous')}
              </Button>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSave}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {t('organizations.myOrganization.save')}
                </Button>
                {currentStep === totalSteps ? (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    className="gap-2 bg-primary hover:bg-primary/90"
                  >
                    <Save className="w-4 h-4" />
                    {t('organizations.editProfile.submit')}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="gap-2"
                  >
                    {t('organizations.form.next')}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
