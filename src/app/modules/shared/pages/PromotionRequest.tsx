import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useAssistanceHistory } from '@app/contexts/AssistanceHistoryContext';
import { submitPromotionRequest } from '@app/services/promoService';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OffersSubMenu } from '@app/components/OffersSubMenu';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Textarea } from '@app/components/ui/textarea';
import { Alert, AlertDescription } from '@app/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';
import { Gift, CheckCircle2, Mail, Users, TrendingUp, Award } from 'lucide-react';

interface FormData {
  orgName: string;
  email: string;
  contactPerson: string;
  position: string;
  phone: string;
  country: string;
  employeeRange: string;
  annualRevenue: string;
  industry: string;
  planType: string;
  additionalInfo: string;
}

const countries = [
  'United States', 'Canada', 'United Kingdom', 'France', 'Germany', 'Spain',
  'Italy', 'Belgium', 'Netherlands', 'Switzerland', 'Luxembourg', 'Austria',
  'Portugal', 'Denmark', 'Sweden', 'Norway', 'Finland', 'Ireland', 'Poland',
  'Czech Republic', 'Greece', 'Turkey', 'Morocco', 'Tunisia', 'Algeria',
  'Egypt', 'South Africa', 'Kenya', 'Nigeria', 'Ghana', 'Senegal',
  'Côte d\'Ivoire', 'Cameroon', 'Madagascar', 'Ethiopia', 'Tanzania',
  'Uganda', 'Rwanda', 'Mozambique', 'Zambia', 'Zimbabwe', 'Botswana',
  'Namibia', 'Mauritius', 'Brazil', 'Mexico', 'Argentina', 'Chile',
  'Colombia', 'Peru', 'Ecuador', 'Uruguay', 'Venezuela', 'Australia',
  'New Zealand', 'Japan', 'South Korea', 'China', 'India', 'Singapore',
  'Malaysia', 'Thailand', 'Vietnam', 'Philippines', 'Indonesia',
];

const industries = [
  'Agriculture', 'Energy & Utilities', 'Construction & Infrastructure',
  'Healthcare & Medical', 'Education & Training', 'Finance & Banking',
  'Technology & IT', 'Manufacturing', 'Transportation & Logistics',
  'Retail & E-commerce', 'Hospitality & Tourism', 'Media & Communications',
  'Professional Services', 'Non-Profit & NGO', 'Government & Public Sector',
  'Real Estate', 'Legal Services', 'Environmental Services', 'Other',
];

export default function PromotionRequest() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addHistoryEntry } = useAssistanceHistory();
  const [formData, setFormData] = useState<FormData>({
    orgName: '',
    email: '',
    contactPerson: '',
    position: '',
    phone: '',
    country: '',
    employeeRange: '',
    annualRevenue: '',
    industry: '',
    planType: '',
    additionalInfo: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const employeeRanges = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501+',
  ];

  const revenueRanges = [
    'less-100k',
    '100k-500k',
    '500k-1m',
    '1m-5m',
    '5m-10m',
    '10m+',
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.orgName.trim()) {
      newErrors.orgName = t('offers.error.required');
    }
    if (!formData.email.trim()) {
      newErrors.email = t('offers.error.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('offers.error.email');
    }
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = t('offers.error.required');
    }
    if (!formData.position.trim()) {
      newErrors.position = t('offers.error.required');
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t('offers.error.required');
    }
    if (!formData.country) {
      newErrors.country = t('offers.error.required');
    }
    if (!formData.employeeRange) {
      newErrors.employeeRange = t('offers.error.required');
    }
    if (!formData.annualRevenue) {
      newErrors.annualRevenue = t('offers.error.required');
    }
    if (!formData.industry) {
      newErrors.industry = t('offers.error.required');
    }
    if (!formData.planType) {
      newErrors.planType = t('offers.error.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await submitPromotionRequest(formData);

      console.log('Promotion request submitted:', formData);

      // ✅ Enregistrer dans l'historique
      addHistoryEntry({
        type: 'promotion_request',
        organizationName: 'Assortis Promotions Team',
        title: `${t('offers.promo.title')} - ${formData.planType ? t(`offers.plans.${formData.planType}.name`) : 'Demande'}`,
        message: `${t('offers.promo.form.orgName')}: ${formData.orgName}\n${t('offers.promo.form.contactPerson')}: ${formData.contactPerson}\n${t('offers.promo.form.position')}: ${formData.position}\n${t('offers.promo.form.email')}: ${formData.email}\n${t('offers.promo.form.phone')}: ${formData.phone}\n${t('offers.promo.form.country')}: ${formData.country}\n${t('offers.promo.form.industry')}: ${formData.industry}\n${t('offers.promo.form.employeeRange')}: ${formData.employeeRange}\n${t('offers.promo.form.annualRevenue')}: ${formData.annualRevenue}\n${t('offers.promo.form.planType')}: ${formData.planType ? t(`offers.plans.${formData.planType}.name`) : ''}${formData.additionalInfo ? `\n\n${t('offers.promo.form.additionalInfo')}:\n${formData.additionalInfo}` : ''}`,
        status: 'submitted',
      });

      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (isSuccess) {
    return (
      <>
        <PageBanner
          icon={Gift}
          title={t('offers.promo.title')}
          subtitle={t('offers.promo.subtitle')}
        />
        <OffersSubMenu />
        <PageContainer>
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-primary mb-4">
                {t('offers.promo.success.title')}
              </h2>

              <p className="text-gray-600 mb-8">
                {t('offers.promo.success.message', { email: formData.email })}
              </p>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-accent" />
                  {t('offers.promo.success.nextSteps')}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <p className="text-gray-700">{t('offers.promo.success.step1')}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <p className="text-gray-700">{t('offers.promo.success.step2')}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <p className="text-gray-700">{t('offers.promo.success.step3')}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/offers')}
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  className="min-w-[200px]"
                >
                  {t('offers.promo.success.goToOffers')}
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="min-w-[200px]"
                >
                  {t('offers.promo.success.goHome')}
                </Button>
              </div>
            </div>
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <PageBanner
        icon={Gift}
        title={t('offers.promo.title')}
        subtitle={t('offers.promo.subtitle')}
      />
      <OffersSubMenu />
      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="max-w-3xl mx-auto">
            {/* Introduction */}
            <div className="bg-white rounded-lg border p-6 mb-6">
              <p className="text-gray-700 leading-relaxed">
                {t('offers.promo.description')}
              </p>
            </div>

            {/* Benefits Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg border p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-primary mb-2">
                  {t('offers.promo.benefits.title').split('?')[0]}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('offers.promo.benefits.discount')}
                </p>
              </div>

              <div className="bg-white rounded-lg border p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-primary mb-2">
                  {t('offers.promo.benefits.priority').split(':')[0]}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('offers.promo.benefits.priority')}
                </p>
              </div>

              <div className="bg-white rounded-lg border p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-primary mb-2">
                  {t('offers.promo.benefits.flexible').split(' ')[0]}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('offers.promo.benefits.flexible')}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg border overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-5 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary text-lg">{t('offers.promo.form.title')}</h3>
                    <p className="text-sm text-muted-foreground">Les champs marqués par * sont obligatoires</p>
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <div className="p-6 space-y-6">
                {/* Organization Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-accent rounded-full"></div>
                    {t('offers.promo.form.title')}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Label htmlFor="orgName" className="text-sm font-medium text-gray-700">
                        {t('offers.promo.form.orgName')} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="orgName"
                        value={formData.orgName}
                        onChange={(e) => handleInputChange('orgName', e.target.value)}
                        placeholder={t('offers.promo.form.orgNamePlaceholder')}
                        className="mt-2"
                      />
                      {errors.orgName && (
                        <p className="text-sm text-red-600 mt-1">{errors.orgName}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        {t('offers.promo.form.email')} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder={t('offers.promo.form.emailPlaceholder')}
                        className="mt-2"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        {t('offers.promo.form.phone')} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder={t('offers.promo.form.phonePlaceholder')}
                        className="mt-2"
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="contactPerson" className="text-sm font-medium text-gray-700">
                        {t('offers.promo.form.contactPerson')} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="contactPerson"
                        value={formData.contactPerson}
                        onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                        placeholder={t('offers.promo.form.contactPersonPlaceholder')}
                        className="mt-2"
                      />
                      {errors.contactPerson && (
                        <p className="text-sm text-red-600 mt-1">{errors.contactPerson}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="position" className="text-sm font-medium text-gray-700">
                        {t('offers.promo.form.position')} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => handleInputChange('position', e.target.value)}
                        placeholder={t('offers.promo.form.positionPlaceholder')}
                        className="mt-2"
                      />
                      {errors.position && (
                        <p className="text-sm text-red-600 mt-1">{errors.position}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                        {t('offers.promo.form.country')} <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        key={`country-${formData.country}`}
                        value={formData.country} 
                        onValueChange={(value) => handleInputChange('country', value)}
                      >
                        <SelectTrigger className="mt-2" id="country">
                          <SelectValue placeholder={t('offers.promo.form.countryPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent position="popper" className="max-h-[300px] overflow-y-auto">
                          {countries.map(country => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.country && (
                        <p className="text-sm text-red-600 mt-1">{errors.country}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="industry" className="text-sm font-medium text-gray-700">
                        {t('offers.promo.form.industry')} <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        key={`industry-${formData.industry}`}
                        value={formData.industry} 
                        onValueChange={(value) => handleInputChange('industry', value)}
                      >
                        <SelectTrigger className="mt-2" id="industry">
                          <SelectValue placeholder={t('offers.promo.form.industryPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent position="popper" className="max-h-[300px] overflow-y-auto">
                          {industries.map(industry => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.industry && (
                        <p className="text-sm text-red-600 mt-1">{errors.industry}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-accent rounded-full"></div>
                    {t('offers.promo.form.businessInfo')}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="employeeRange" className="text-sm font-medium text-gray-700">
                        {t('offers.promo.form.employeeRange')} <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.employeeRange} onValueChange={(value) => handleInputChange('employeeRange', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder={t('offers.promo.form.employeeRangePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {employeeRanges.map(range => (
                            <SelectItem key={range} value={range}>
                              {t(`offers.promo.employeeRanges.${range}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.employeeRange && (
                        <p className="text-sm text-red-600 mt-1">{errors.employeeRange}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="annualRevenue" className="text-sm font-medium text-gray-700">
                        {t('offers.promo.form.annualRevenue')} <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.annualRevenue} onValueChange={(value) => handleInputChange('annualRevenue', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder={t('offers.promo.form.annualRevenuePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {revenueRanges.map(range => (
                            <SelectItem key={range} value={range}>
                              {t(`offers.promo.revenueRanges.${range}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.annualRevenue && (
                        <p className="text-sm text-red-600 mt-1">{errors.annualRevenue}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="planType" className="text-sm font-medium text-gray-700">
                        {t('offers.promo.form.planType')} <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.planType} onValueChange={(value) => handleInputChange('planType', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder={t('offers.promo.form.planTypePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">
                            {t('offers.plans.professional.name')}
                          </SelectItem>
                          <SelectItem value="enterprise">
                            {t('offers.plans.enterprise.name')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.planType && (
                        <p className="text-sm text-red-600 mt-1">{errors.planType}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="additionalInfo" className="text-sm font-medium text-gray-700">
                        {t('offers.promo.form.additionalInfo')}
                      </Label>
                      <Textarea
                        id="additionalInfo"
                        value={formData.additionalInfo}
                        onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                        placeholder={t('offers.promo.form.additionalInfoPlaceholder')}
                        className="mt-2 min-h-[120px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Info Alert */}
                <Alert className="mb-6 border-blue-200 bg-blue-50">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    {t('offers.promo.success.message', { email: formData.email || 'your email' })}
                  </AlertDescription>
                </Alert>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ backgroundColor: 'var(--color-primary)' }}
                    className="min-w-[200px] h-12 text-base font-semibold"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t('offers.promo.submitting')}
                      </span>
                    ) : (
                      t('offers.promo.submit')
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </PageContainer>
    </>
  );
}