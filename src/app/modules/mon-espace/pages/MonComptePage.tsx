import { useNavigate } from 'react-router';
import { useLanguage } from '../../../contexts/LanguageContext';
import { PageBanner } from '../../../components/PageBanner';
import { PageContainer } from '../../../components/PageContainer';
import { AccountSubMenu } from '../../../components/AccountSubMenu';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Checkbox } from '../../../components/ui/checkbox';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  UserCheck,
  Save,
  Lock,
  Mail,
  Shield,
  Bell,
  CreditCard,
  Target,
} from 'lucide-react';
import { sendConfirmationEmail } from '../../../services/emailService';

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

const ALL_SECTORS = [
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
  'OTHER',
];

const COUNTRIES = [
  'United States', 'France', 'Spain', 'Germany', 'United Kingdom', 
  'Canada', 'Belgium', 'Switzerland', 'Netherlands', 'Kenya',
  'Senegal', 'Morocco', 'Côte d\'Ivoire', 'Mali', 'Burkina Faso'
];

export default function MonComptePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Simulate account type detection (from AuthContext in production)
  const [accountType] = useState<'expert' | 'organization'>('expert');
  
  // Form state for Account Information
  const [formData, setFormData] = useState({
    // Expert fields
    firstName: 'Sarah',
    lastName: 'Johnson',
    expertEmail: 'sarah.johnson@example.com',
    expertPhone: '+44 20 1234 5678',
    nationality: 'United Kingdom',
    country: 'United Kingdom',
    city: 'London',
    expertise: 'INFRASTRUCTURE',
    experience: '15',
    
    // Organization fields
    orgName: 'Global Development Partners',
    orgLegalName: 'GDP International Ltd.',
    orgType: 'NGO',
    orgRegistrationNumber: 'UK-NGO-12345',
    orgEmail: 'contact@gdp.org',
    orgPhone: '+44 20 7946 0958',
    orgWebsite: 'https://www.gdp.org',
    orgCountry: 'United Kingdom',
    orgCity: 'London',
    contactPersonName: 'John Smith',
    contactPersonPosition: 'Director',
    
    // Newsletter preferences
    newsletterTenders: true,
    newsletterTraining: true,
    newsletterJobs: true,
    
    // Matching Preferences
    preferredSectors: ['INFRASTRUCTURE', 'GOVERNANCE', 'EDUCATION'],
    preferredCountries: ['United Kingdom', 'France', 'Kenya'],
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  // Subscription state (mock data)
  const [subscriptionData] = useState({
    plan: 'professional',
    status: 'active',
    memberSince: '2023-01-15',
    nextBilling: '2026-04-15',
    billingCycle: 'monthly',
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleSectorToggle = (sector: string) => {
    setFormData(prev => {
      const currentSectors = prev.preferredSectors || [];
      if (currentSectors.includes(sector)) {
        return { ...prev, preferredSectors: currentSectors.filter(s => s !== sector) };
      } else {
        return { ...prev, preferredSectors: [...currentSectors, sector] };
      }
    });
  };

  const handleCountryToggle = (country: string) => {
    setFormData(prev => {
      const currentCountries = prev.preferredCountries || [];
      if (currentCountries.includes(country)) {
        return { ...prev, preferredCountries: currentCountries.filter(c => c !== country) };
      } else {
        return { ...prev, preferredCountries: [...currentCountries, country] };
      }
    });
  };

  const handleSelectAllSectors = () => {
    setFormData(prev => ({ ...prev, preferredSectors: [...ALL_SECTORS] }));
  };

  const handleClearSectors = () => {
    setFormData(prev => ({ ...prev, preferredSectors: [] }));
  };

  const handleSelectAllCountries = () => {
    setFormData(prev => ({ ...prev, preferredCountries: [...COUNTRIES] }));
  };

  const handleClearCountries = () => {
    setFormData(prev => ({ ...prev, preferredCountries: [] }));
  };

  const handleSaveChanges = async () => {
    setIsUpdating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(t('monEspace.myAccount.accountUpdated'));
    } catch (error) {
      toast.error(t('monEspace.myAccount.accountUpdateFailed'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async () => {
    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
      toast.error(t('monEspace.myAccount.passwordUpdateFailed'));
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error(t('monEspace.myAccount.passwordMismatch'));
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error(t('monEspace.myAccount.passwordTooShort'));
      return;
    }

    setIsUpdatingPassword(true);
    try {
      // Simulate API call to verify current password and update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Send confirmation email
      const email = accountType === 'expert' ? formData.expertEmail : formData.orgEmail;
      const firstName = accountType === 'expert' ? formData.firstName : formData.contactPersonName;
      const lastName = accountType === 'expert' ? formData.lastName : '';
      
      await sendConfirmationEmail({
        to: email,
        subject: 'Password Changed Successfully',
        firstName,
        lastName,
        accountType,
        planType: 'professional',
      });

      toast.success(t('monEspace.myAccount.passwordUpdated'));
      toast.info(t('monEspace.myAccount.passwordEmailSent'));
      
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (error) {
      toast.error(t('monEspace.myAccount.passwordUpdateFailed'));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const isExpert = accountType === 'expert';

  const bannerStats = isExpert ? [
    { value: '3', label: t('monEspace.myAccount.stats.activeMissions') },
    { value: '87%', label: t('monEspace.myAccount.stats.matchingRate') },
    { value: '2', label: t('monEspace.myAccount.stats.certifications') }
  ] : [
    { value: '12', label: t('monEspace.myAccount.stats.activeProjects') },
    { value: '45', label: t('monEspace.myAccount.stats.teamMembers') },
    { value: '94%', label: t('monEspace.myAccount.stats.successRate') }
  ];

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('monEspace.myAccount.title')}
        description={isExpert ? t('monEspace.myAccount.description') : t('monEspace.myAccount.descriptionOrg')}
        icon={UserCheck}
        stats={bannerStats}
      />

      <AccountSubMenu activeTab="my-account" onTabChange={() => undefined} mode="profile-settings" />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Account Information Section */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-lg font-semibold text-primary">{t('monEspace.myAccount.sections.accountInformation')}</h2>
            </div>

            {isExpert ? (
              // Expert Account Form
              <div className="space-y-6">
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

                <Button 
                  onClick={handleSaveChanges} 
                  disabled={isUpdating}
                  className="bg-[#B82547] hover:bg-[#a01f3c] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isUpdating ? '...' : t('monEspace.myAccount.saveChanges')}
                </Button>
              </div>
            ) : (
              // Organization Account Form
              <div className="space-y-6">
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

                <Button 
                  onClick={handleSaveChanges} 
                  disabled={isUpdating}
                  className="bg-[#B82547] hover:bg-[#a01f3c] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isUpdating ? '...' : t('monEspace.myAccount.saveChanges')}
                </Button>
              </div>
            )}
          </div>

          {/* Newsletter Preferences Section */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-purple-500" />
              </div>
              <h2 className="text-lg font-semibold text-primary">{t('monEspace.myAccount.newsletterPreferences')}</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="newsletterTenders"
                  checked={formData.newsletterTenders}
                  onCheckedChange={(checked) => handleInputChange('newsletterTenders', checked as boolean)}
                />
                <label
                  htmlFor="newsletterTenders"
                  className="text-sm font-medium text-primary cursor-pointer"
                >
                  {t('monEspace.myAccount.newsletterTenders')}
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="newsletterTraining"
                  checked={formData.newsletterTraining}
                  onCheckedChange={(checked) => handleInputChange('newsletterTraining', checked as boolean)}
                />
                <label
                  htmlFor="newsletterTraining"
                  className="text-sm font-medium text-primary cursor-pointer"
                >
                  {t('monEspace.myAccount.newsletterTraining')}
                </label>
              </div>

              {isExpert && (
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="newsletterJobs"
                    checked={formData.newsletterJobs}
                    onCheckedChange={(checked) => handleInputChange('newsletterJobs', checked as boolean)}
                  />
                  <label
                    htmlFor="newsletterJobs"
                    className="text-sm font-medium text-primary cursor-pointer"
                  >
                    {t('monEspace.myAccount.newsletterJobs')}
                  </label>
                </div>
              )}
            </div>

            <Button 
              onClick={handleSaveChanges} 
              disabled={isUpdating}
              className="bg-[#B82547] hover:bg-[#a01f3c] text-white mt-6"
            >
              <Save className="w-4 h-4 mr-2" />
              {isUpdating ? '...' : t('monEspace.myAccount.saveChanges')}
            </Button>
          </div>

          {/* Matching Preferences Section */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-primary">{t('monEspace.myAccount.matchingPreferences')}</h2>
                <p className="text-sm text-gray-600 mt-1">{t('monEspace.myAccount.matchingPreferences.description')}</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Preferred Sectors */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-primary">{t('monEspace.myAccount.preferredSectors')}</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAllSectors}
                      className="text-xs h-7"
                    >
                      {t('monEspace.myAccount.selectAll')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSectors}
                      className="text-xs h-7"
                    >
                      {t('monEspace.myAccount.clearSelection')}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-600">{t('monEspace.myAccount.preferredSectors.description')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
                  {ALL_SECTORS.map((sector) => (
                    <div key={sector} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sector-${sector}`}
                        checked={formData.preferredSectors?.includes(sector) || false}
                        onCheckedChange={() => handleSectorToggle(sector)}
                      />
                      <label
                        htmlFor={`sector-${sector}`}
                        className="text-sm text-primary cursor-pointer leading-none"
                      >
                        {t(`sectors.${sector}`)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preferred Countries */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-primary">{t('monEspace.myAccount.preferredCountries')}</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAllCountries}
                      className="text-xs h-7"
                    >
                      {t('monEspace.myAccount.selectAll')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearCountries}
                      className="text-xs h-7"
                    >
                      {t('monEspace.myAccount.clearSelection')}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-600">{t('monEspace.myAccount.preferredCountries.description')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
                  {COUNTRIES.map((country) => (
                    <div key={country} className="flex items-center space-x-2">
                      <Checkbox
                        id={`country-${country}`}
                        checked={formData.preferredCountries?.includes(country) || false}
                        onCheckedChange={() => handleCountryToggle(country)}
                      />
                      <label
                        htmlFor={`country-${country}`}
                        className="text-sm text-primary cursor-pointer leading-none"
                      >
                        {country}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSaveChanges} 
              disabled={isUpdating}
              className="bg-[#B82547] hover:bg-[#a01f3c] text-white mt-6"
            >
              <Save className="w-4 h-4 mr-2" />
              {isUpdating ? '...' : t('monEspace.myAccount.saveChanges')}
            </Button>
          </div>

          {/* Subscription Section */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-500" />
              </div>
              <h2 className="text-lg font-semibold text-primary">{t('monEspace.myAccount.sections.subscription')}</h2>
            </div>

            <div className="space-y-6">
              {/* Current Plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">{t('monEspace.myAccount.subscription.currentPlan')}</Label>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-primary">
                      {t(`monEspace.myAccount.subscription.plan.${subscriptionData.plan}`)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">{t('monEspace.myAccount.subscription.status')}</Label>
                  <div className="flex items-center gap-2">
                    {subscriptionData.status === 'active' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {t('monEspace.myAccount.subscription.status.active')}
                      </span>
                    )}
                    {subscriptionData.status === 'inactive' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {t('monEspace.myAccount.subscription.status.inactive')}
                      </span>
                    )}
                    {subscriptionData.status === 'expired' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {t('monEspace.myAccount.subscription.status.expired')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Billing Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">{t('monEspace.myAccount.subscription.billingCycle')}</Label>
                  <p className="text-base text-primary">
                    {t(`monEspace.myAccount.subscription.billingCycle.${subscriptionData.billingCycle}`)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">{t('monEspace.myAccount.subscription.nextBilling')}</Label>
                  <p className="text-base text-primary">
                    {new Date(subscriptionData.nextBilling).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Member Since */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">{t('monEspace.myAccount.subscription.since')}</Label>
                <p className="text-base text-primary">
                  {new Date(subscriptionData.memberSince).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-lg font-semibold text-primary">{t('monEspace.myAccount.sections.security')}</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t('monEspace.myAccount.currentPassword')} *</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">{t('monEspace.myAccount.newPassword')} *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  {t('auth.signup.passwordHint') || 'Minimum 6 characters'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">{t('monEspace.myAccount.confirmNewPassword')} *</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={passwordData.confirmNewPassword}
                  onChange={(e) => handlePasswordChange('confirmNewPassword', e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <Button 
                onClick={handleUpdatePassword} 
                disabled={isUpdatingPassword}
                className="bg-[#B82547] hover:bg-[#a01f3c] text-white"
              >
                <Lock className="w-4 h-4 mr-2" />
                {isUpdatingPassword ? '...' : t('monEspace.myAccount.updatePassword')}
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}