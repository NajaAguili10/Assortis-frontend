import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAssistanceHistory } from '@app/contexts/AssistanceHistoryContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OffersSubMenu } from '@app/components/OffersSubMenu';
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
import { toast } from 'sonner';
import { 
  Phone, 
  Mail,
  Building2,
  User,
  Briefcase,
  MessageSquare,
  CheckCircle2,
  Loader2
} from 'lucide-react';

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501+'];

const INDUSTRIES = [
  'EDUCATION',
  'HEALTH',
  'AGRICULTURE',
  'INFRASTRUCTURE',
  'GOVERNANCE',
  'ENVIRONMENT',
  'WATER_SANITATION',
  'ENERGY',
  'NGO',
  'CONSULTING',
  'TECHNOLOGY',
  'OTHER',
];

export default function ContactSales() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { addHistoryEntry } = useAssistanceHistory();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    company: '',
    fullName: '',
    email: '',
    phone: '',
    companySize: '',
    industry: '',
    planType: '',
    message: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.company || !formData.fullName || !formData.email || !formData.message) {
      toast.error(t('offers.error.required'));
      return;
    }

    setSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      // ✅ Enregistrer dans l'historique
      addHistoryEntry({
        type: 'commercial',
        organizationName: 'Assortis Sales Team',
        title: `${t('offers.contact.title')} - ${formData.planType ? t(`offers.plans.${formData.planType}.name`) : 'Demande'}`,
        message: `${t('offers.contact.form.company')}: ${formData.company}\n${t('offers.contact.form.fullName')}: ${formData.fullName}\n${t('offers.contact.form.email')}: ${formData.email}${formData.phone ? `\n${t('offers.contact.form.phone')}: ${formData.phone}` : ''}${formData.companySize ? `\n${t('offers.contact.form.companySize')}: ${formData.companySize}` : ''}${formData.industry ? `\n${t('offers.contact.form.industry')}: ${t(`sectors.${formData.industry}`)}` : ''}${formData.planType ? `\n${t('offers.contact.form.planType')}: ${t(`offers.plans.${formData.planType}.name`)}` : ''}\n\n${formData.message}`,
        status: 'sent',
      });
      
      setSubmitting(false);
      setSubmitted(true);
      toast.success(t('offers.contact.success'));
      
      // Reset form after 3 seconds and navigate back
      setTimeout(() => {
        navigate('/offers');
      }, 3000);
    }, 1500);
  };

  if (submitted) {
    return (
      <PageContainer>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-600" strokeWidth={2} />
          </div>
          
          <h1 className="text-3xl font-bold text-primary mb-4">
            {t('offers.contact.success')}
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            {t('offers.confirmation.message', { email: formData.email })}
          </p>

          <Button
            onClick={() => navigate('/offers')}
            className="bg-accent hover:bg-accent/90 text-white px-8 py-6"
          >
            {t('offers.confirmation.goToDashboard')}
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <>
      <PageBanner
        icon={Phone}
        title={t('offers.contact.title')}
        subtitle={t('offers.contact.subtitle')}
      />
      
      {/* Sub Menu */}
      <OffersSubMenu />
      
      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="bg-white rounded-lg border overflow-hidden">
                  {/* Form Header */}
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-5 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary text-lg">{t('offers.contact.form.message')}</h3>
                        <p className="text-sm text-muted-foreground">Les champs marqués par * sont obligatoires</p>
                      </div>
                    </div>
                  </div>

                  {/* Form Body */}
                  <div className="p-6 space-y-6">
                    {/* Company Name */}
                    <div className="space-y-2">
                      <Label htmlFor="company">
                        {t('offers.contact.form.company')} *
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" strokeWidth={2} />
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          placeholder={t('offers.contact.form.companyPlaceholder')}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName">
                        {t('offers.contact.form.fullName')} *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" strokeWidth={2} />
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          placeholder={t('offers.contact.form.fullNamePlaceholder')}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          {t('offers.contact.form.email')} *
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" strokeWidth={2} />
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder={t('offers.contact.form.emailPlaceholder')}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          {t('offers.contact.form.phone')}
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" strokeWidth={2} />
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder={t('offers.contact.form.phonePlaceholder')}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Company Size & Industry */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="companySize">
                          {t('offers.contact.form.companySize')}
                        </Label>
                        <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('offers.contact.form.companySizePlaceholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            {COMPANY_SIZES.map((size) => (
                              <SelectItem key={size} value={size}>
                                {t(`offers.contact.companySizes.${size}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="industry">
                          {t('offers.contact.form.industry')}
                        </Label>
                        <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('offers.contact.form.industryPlaceholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            {INDUSTRIES.map((industry) => (
                              <SelectItem key={industry} value={industry}>
                                {t(`sectors.${industry}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Plan Type */}
                    <div className="space-y-2">
                      <Label htmlFor="planType">
                        {t('offers.contact.form.planType')}
                      </Label>
                      <Select value={formData.planType} onValueChange={(value) => handleInputChange('planType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('offers.contact.form.planTypePlaceholder')} />
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
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message">
                        {t('offers.contact.form.message')} *
                      </Label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" strokeWidth={2} />
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          placeholder={t('offers.contact.form.messagePlaceholder')}
                          className="pl-10 min-h-[150px]"
                          required
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-6 bg-accent hover:bg-accent/90 text-white font-semibold text-lg"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          {t('offers.contact.form.sending')}
                        </>
                      ) : (
                        <>
                          <Mail className="h-5 w-5 mr-2" strokeWidth={2} />
                          {t('offers.contact.form.submit')}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Info Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Enterprise Features */}
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-primary mb-4">
                    {t('offers.plans.enterprise.name')} {t('offers.features.title')}
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-gray-700">{t('offers.features.tendersUnlimited')}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-gray-700">{t('offers.features.supportDedicated')}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-gray-700">{t('offers.features.customBranding')}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-gray-700">{t('offers.features.apiAccess')}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-gray-700">{t('offers.features.sso')}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="text-gray-700">{t('offers.features.compliance')}</span>
                    </li>
                  </ul>
                </div>

                {/* Contact Info */}
                <div className="bg-gradient-to-br from-accent/10 to-red-50 rounded-xl border-2 border-accent/20 p-6">
                  <h3 className="text-lg font-bold text-primary mb-4">
                    {t('assistance.contact.title')}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-white rounded-lg p-2">
                        <Mail className="h-5 w-5 text-accent" strokeWidth={2} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">{t('offers.contact.form.email')}</div>
                        <div className="text-sm font-semibold text-primary">sales@assortis.com</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-white rounded-lg p-2">
                        <Phone className="h-5 w-5 text-accent" strokeWidth={2} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">{t('offers.contact.form.phone')}</div>
                        <div className="text-sm font-semibold text-primary">+1 (555) 123-4567</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-white rounded-lg p-2">
                        <Briefcase className="h-5 w-5 text-accent" strokeWidth={2} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Response Time</div>
                        <div className="text-sm font-semibold text-primary">Within 24 hours</div>
                      </div>
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