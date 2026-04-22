import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OrganizationsSubMenu } from '@app/components/OrganizationsSubMenu';
import { useOrganizations } from '@app/modules/organization/hooks/useOrganizations';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Textarea } from '@app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';
import { 
  Building2, 
  ChevronLeft, 
  ChevronRight,
  Save,
  Send,
  Check,
  FileText,
  Users,
  GraduationCap,
  Headphones,
  Mail,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  Award,
  DollarSign,
} from 'lucide-react';

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

export default function OrganizationsCreateProfile() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { kpis } = useOrganizations();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    orgName: '',
    orgType: '',
    legalName: '',
    registrationNumber: '',
    foundedYear: '',
    description: '',
    
    // Step 2: Contact & Location
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    
    // Step 3: Operations & Expertise
    operatingRegions: [] as string[],
    selectedSector: '',
    subsectors: [] as string[],
    languages: [] as string[],
    
    // Step 4: Team & Resources
    teamSize: '',
    experts: '',
    
    // Step 5: Financial & Projects
    annualBudget: '',
    projectsCompleted: '',
    
    // Step 6: Subscription & Services
    selectedServices: [] as string[],
  });

  const availableSubsectors = useMemo(() => {
    if (!formData.selectedSector) return [];
    return SUBSECTORS_BY_SECTOR[formData.selectedSector] || [];
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
      const currentValues = prev[field as keyof typeof prev] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
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
    console.log('Saving draft:', formData);
    // TODO: Save to backend
  };

  const handleSubmit = () => {
    console.log('Submitting profile:', formData);
    // TODO: Submit to backend
    navigate('/organizations');
  };

  const steps = [
    { number: 1, titleKey: 'organizations.createProfile.step1' },
    { number: 2, titleKey: 'organizations.createProfile.step2' },
    { number: 3, titleKey: 'organizations.createProfile.step3' },
    { number: 4, titleKey: 'organizations.createProfile.step4' },
    { number: 5, titleKey: 'organizations.createProfile.step5' },
    { number: 6, titleKey: 'organizations.createProfile.step6' },
  ];

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <PageBanner
        title={t('organizations.hub.title')}
        description={t('organizations.hub.subtitle')}
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
          {/* Page Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary">{t('organizations.createProfile.title')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('organizations.createProfile.subtitle')}</p>
          </div>

          {/* Horizontal Steps Navigation */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                
                return (
                  <div key={step.number} className="flex items-center flex-1 last:flex-none">
                    <button
                      onClick={() => setCurrentStep(step.number)}
                      className={`flex flex-col items-center gap-2 transition-all ${
                        isActive ? 'opacity-100' : isCompleted ? 'opacity-100' : 'opacity-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                        isCompleted 
                          ? 'bg-primary text-white' 
                          : isActive 
                          ? 'bg-primary text-white ring-4 ring-primary/20' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isCompleted ? <Check className="w-5 h-5" /> : step.number}
                      </div>
                      <span className={`text-xs font-medium hidden sm:block ${
                        isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {t(step.titleKey)}
                      </span>
                    </button>
                    
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 transition-all ${
                        currentStep > step.number ? 'bg-primary' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-lg border p-6">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm font-medium text-primary">
                  {Math.round((currentStep / totalSteps) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
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
                      Provide essential information about your organization
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
                    Legal & Registration Details
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
                    Brief description of your organization's mission and activities
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
                      Contact details and physical location information
                    </p>
                  </div>
                </div>

                {/* Contact Information Card */}
                <div className="bg-gradient-to-br from-green-500/[0.02] to-transparent rounded-xl p-6 border border-green-500/10">
                  <h4 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-green-600" />
                    Contact Information
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
                    Physical Address
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
                    <Label htmlFor="sector">{t('organizations.details.sectors')} *</Label>
                    <Select value={formData.selectedSector} onValueChange={(value) => handleInputChange('selectedSector', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={t('organizations.form.sectors.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTORS.map((sector) => (
                          <SelectItem key={sector} value={sector}>
                            {t(`sectors.${sector}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subsectors - Dependent on Sector */}
                  <div>
                    <Label>{t('organizations.form.subsectors')}</Label>
                    {!formData.selectedSector ? (
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

            {/* Step 6: Subscription & Services */}
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
                    onClick={() => handleMultiSelect('selectedServices', 'tenders')}
                    className={`text-left p-6 rounded-lg border-2 transition-all ${
                      formData.selectedServices.includes('tenders')
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 bg-white hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          formData.selectedServices.includes('tenders')
                            ? 'bg-primary text-white'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-primary">
                            {t('organizations.services.tenders.title')}
                          </h4>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        formData.selectedServices.includes('tenders')
                          ? 'border-primary bg-primary'
                          : 'border-gray-300'
                      }`}>
                        {formData.selectedServices.includes('tenders') && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t('organizations.services.tenders.description')}
                    </p>
                    <ul className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>{t(`organizations.services.tenders.features.${i}`)}</span>
                        </li>
                      ))}
                    </ul>
                  </button>

                  {/* Experts Service */}
                  <button
                    type="button"
                    onClick={() => handleMultiSelect('selectedServices', 'experts')}
                    className={`text-left p-6 rounded-lg border-2 transition-all ${
                      formData.selectedServices.includes('experts')
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 bg-white hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          formData.selectedServices.includes('experts')
                            ? 'bg-primary text-white'
                            : 'bg-green-100 text-green-600'
                        }`}>
                          <Users className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-primary">
                            {t('organizations.services.experts.title')}
                          </h4>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        formData.selectedServices.includes('experts')
                          ? 'border-primary bg-primary'
                          : 'border-gray-300'
                      }`}>
                        {formData.selectedServices.includes('experts') && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t('organizations.services.experts.description')}
                    </p>
                    <ul className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>{t(`organizations.services.experts.features.${i}`)}</span>
                        </li>
                      ))}
                    </ul>
                  </button>

                  {/* Training Service */}
                  <button
                    type="button"
                    onClick={() => handleMultiSelect('selectedServices', 'training')}
                    className={`text-left p-6 rounded-lg border-2 transition-all ${
                      formData.selectedServices.includes('training')
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 bg-white hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          formData.selectedServices.includes('training')
                            ? 'bg-primary text-white'
                            : 'bg-purple-100 text-purple-600'
                        }`}>
                          <GraduationCap className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-primary">
                            {t('organizations.services.training.title')}
                          </h4>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        formData.selectedServices.includes('training')
                          ? 'border-primary bg-primary'
                          : 'border-gray-300'
                      }`}>
                        {formData.selectedServices.includes('training') && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t('organizations.services.training.description')}
                    </p>
                    <ul className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>{t(`organizations.services.training.features.${i}`)}</span>
                        </li>
                      ))}
                    </ul>
                  </button>

                  {/* Assistance Service */}
                  <button
                    type="button"
                    onClick={() => handleMultiSelect('selectedServices', 'assistance')}
                    className={`text-left p-6 rounded-lg border-2 transition-all ${
                      formData.selectedServices.includes('assistance')
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 bg-white hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          formData.selectedServices.includes('assistance')
                            ? 'bg-primary text-white'
                            : 'bg-orange-100 text-orange-600'
                        }`}>
                          <Headphones className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-primary">
                            {t('organizations.services.assistance.title')}
                          </h4>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        formData.selectedServices.includes('assistance')
                          ? 'border-primary bg-primary'
                          : 'border-gray-300'
                      }`}>
                        {formData.selectedServices.includes('assistance') && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t('organizations.services.assistance.description')}
                    </p>
                    <ul className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>{t(`organizations.services.assistance.features.${i}`)}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                </div>

                {/* Summary Card */}
                <div className="mt-8 bg-white rounded-lg border p-6">
                  <h5 className="font-semibold text-primary mb-4">
                    {t('organizations.services.summary')}
                  </h5>
                  
                  {formData.selectedServices.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t('organizations.services.summary.none')}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          {t('organizations.services.summary.selected')}:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {formData.selectedServices.includes('tenders') && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-md border border-blue-200">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-700">
                                {t('organizations.services.tenders.title')}
                              </span>
                            </div>
                          )}
                          {formData.selectedServices.includes('experts') && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-md border border-green-200">
                              <Users className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-700">
                                {t('organizations.services.experts.title')}
                              </span>
                            </div>
                          )}
                          {formData.selectedServices.includes('training') && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-md border border-purple-200">
                              <GraduationCap className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-medium text-purple-700">
                                {t('organizations.services.training.title')}
                              </span>
                            </div>
                          )}
                          {formData.selectedServices.includes('assistance') && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-md border border-orange-200">
                              <Headphones className="w-4 h-4 text-orange-600" />
                              <span className="text-sm font-medium text-orange-700">
                                {t('organizations.services.assistance.title')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Profile Summary */}
                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium text-muted-foreground mb-3">
                          Profile Summary:
                        </p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Organization:</span>
                            <span className="font-medium">{formData.orgName || 'Not provided'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-medium">
                              {formData.orgType ? t(ORGANIZATION_TYPES.find(t => t.value === formData.orgType)?.labelKey || '') : 'Not provided'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sector:</span>
                            <span className="font-medium">
                              {formData.selectedSector ? t(`sectors.${formData.selectedSector}`) : 'Not provided'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Services:</span>
                            <span className="font-medium">{formData.selectedServices.length} selected</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="h-11 px-6"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                {t('organizations.form.previous')}
              </Button>

              {currentStep < totalSteps ? (
                <Button onClick={handleNext} className="h-11 px-8 bg-primary hover:bg-primary/90">
                  {t('organizations.form.next')}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="h-11 px-8 bg-primary hover:bg-primary/90">
                  <Send className="w-4 h-4 mr-2" />
                  {t('organizations.form.submit')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}