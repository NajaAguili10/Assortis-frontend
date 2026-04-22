import { useState } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAssistanceHistory } from '@app/contexts/AssistanceHistoryContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
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
  MapPin,
  MessageSquare,
  CheckCircle2,
  Loader2,
  Clock
} from 'lucide-react';
import { useContactPageContent } from '@app/hooks/useOffersContent';
import { submitContactForm } from '@app/services/contactService';
import { ContactFormData } from '@app/types/contact.types';
import { getIconByName } from '@app/utils/iconMapper';

export default function Contact() {
  const { t, language } = useLanguage();
  const { addHistoryEntry } = useAssistanceHistory();
  const { data: content, loading, error } = useContactPageContent();
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content) return;

    // Validation
    if (!formData.fullName || !formData.email || !formData.subject || !formData.message) {
      toast.error(content.form.errorMessage[language]);
      return;
    }

    setSubmitting(true);

    try {
      await submitContactForm(formData);
      
      // ✅ Enregistrer dans l'historique
      addHistoryEntry({
        type: 'general_inquiry',
        organizationName: 'Assortis Support',
        title: formData.subject,
        message: `${language === 'fr' ? 'De' : language === 'es' ? 'De' : 'From'}: ${formData.fullName}\n${language === 'fr' ? 'Email' : language === 'es' ? 'Correo electrónico' : 'Email'}: ${formData.email}${formData.phone ? `\n${language === 'fr' ? 'Téléphone' : language === 'es' ? 'Teléfono' : 'Phone'}: ${formData.phone}` : ''}\n\n${formData.message}`,
        status: 'sent',
      });
      
      setSubmitting(false);
      setSubmitted(true);
      toast.success(content.form.successMessage[language]);
      
      // Reset form after showing success message
      setTimeout(() => {
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      setSubmitting(false);
      toast.error(content.form.errorMessage[language]);
    }
  };

  // État de chargement
  if (loading) {
    return (
      <>
        <PageBanner
          icon={MessageSquare}
          title={t('footer.contact')}
          subtitle=""
        />
        <PageContainer>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
              <p className="mt-4 text-gray-600">{t('common.loading')}</p>
            </div>
          </div>
        </PageContainer>
      </>
    );
  }

  // État d'erreur
  if (error || !content) {
    return (
      <>
        <PageBanner
          icon={MessageSquare}
          title={t('footer.contact')}
          subtitle=""
        />
        <PageContainer>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600">{t('common.error')}</p>
            </div>
          </div>
        </PageContainer>
      </>
    );
  }

  // Filtrer les catégories actives et trier
  const activeCategories = content.categories
    .filter(cat => cat.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <>
      <PageBanner
        icon={MessageSquare}
        title={content.banner.title[language]}
        subtitle={content.banner.subtitle[language]}
      />
      
      <PageContainer>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Information - Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Methods */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-primary mb-4">
                {language === 'fr' ? 'Coordonnées' : language === 'es' ? 'Información de contacto' : 'Contact Information'}
              </h2>
              
              {content.contactMethods
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((method) => {
                  const MethodIcon = getIconByName(method.iconName);
                  const content = method.href ? (
                    <a 
                      href={method.href}
                      className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <MethodIcon className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {method.label[language]}
                        </p>
                        <p className="text-sm text-gray-600 break-words">
                          {method.value}
                        </p>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-start gap-4 p-4 rounded-lg">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <MethodIcon className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {method.label[language]}
                        </p>
                        <p className="text-sm text-gray-600 break-words">
                          {method.value}
                        </p>
                      </div>
                    </div>
                  );
                  
                  return <div key={method.id}>{content}</div>;
                })}
            </div>

            {/* Working Hours */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-primary mb-2">
                    {content.workingHours.title[language]}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {content.workingHours.schedule[language]}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Categories */}
            {activeCategories.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-primary mb-4">
                  {language === 'fr' ? 'Départements' : language === 'es' ? 'Departamentos' : 'Departments'}
                </h2>
                <div className="space-y-4">
                  {activeCategories.map((category) => {
                    const CategoryIcon = getIconByName(category.iconName);
                    return (
                      <div key={category.id} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${category.iconBgColor} flex items-center justify-center`}>
                          <CategoryIcon className={`h-5 w-5 ${category.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900">
                            {category.title[language]}
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">
                            {category.description[language]}
                          </p>
                          {category.email && (
                            <a 
                              href={`mailto:${category.email}`}
                              className="text-xs text-accent hover:underline mt-1 inline-block"
                            >
                              {category.email}
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Contact Form - Right Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              {submitted ? (
                <div className="py-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                    <CheckCircle2 className="h-10 w-10 text-green-600" strokeWidth={2} />
                  </div>
                  
                  <h2 className="text-2xl font-semibold text-primary mb-3">
                    {language === 'fr' ? 'Message envoyé !' : language === 'es' ? '¡Mensaje enviado!' : 'Message Sent!'}
                  </h2>
                  
                  <p className="text-gray-600 max-w-md mx-auto">
                    {content.form.successMessage[language]}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-primary mb-2">
                      {content.form.title[language]}
                    </h2>
                    <p className="text-gray-600">
                      {content.form.subtitle[language]}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {content.form.fields.map((field) => (
                      <div key={field.name}>
                        <Label htmlFor={field.name} className="text-sm font-medium text-gray-700 mb-2 block">
                          {field.label[language]}
                          {field.required && <span className="text-accent ml-1">*</span>}
                        </Label>
                        
                        {field.type === 'text' && (
                          <Input
                            id={field.name}
                            type="text"
                            placeholder={field.placeholder[language]}
                            value={formData[field.name as keyof ContactFormData]}
                            onChange={(e) => handleInputChange(field.name as keyof ContactFormData, e.target.value)}
                            required={field.required}
                            className="w-full"
                          />
                        )}
                        
                        {field.type === 'email' && (
                          <Input
                            id={field.name}
                            type="email"
                            placeholder={field.placeholder[language]}
                            value={formData[field.name as keyof ContactFormData]}
                            onChange={(e) => handleInputChange(field.name as keyof ContactFormData, e.target.value)}
                            required={field.required}
                            className="w-full"
                          />
                        )}
                        
                        {field.type === 'tel' && (
                          <Input
                            id={field.name}
                            type="tel"
                            placeholder={field.placeholder[language]}
                            value={formData[field.name as keyof ContactFormData]}
                            onChange={(e) => handleInputChange(field.name as keyof ContactFormData, e.target.value)}
                            required={field.required}
                            className="w-full"
                          />
                        )}
                        
                        {field.type === 'select' && field.options && (
                          <Select
                            value={formData[field.name as keyof ContactFormData]}
                            onValueChange={(value) => handleInputChange(field.name as keyof ContactFormData, value)}
                            required={field.required}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={field.placeholder[language]} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label[language]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        
                        {field.type === 'textarea' && (
                          <Textarea
                            id={field.name}
                            placeholder={field.placeholder[language]}
                            value={formData[field.name as keyof ContactFormData]}
                            onChange={(e) => handleInputChange(field.name as keyof ContactFormData, e.target.value)}
                            required={field.required}
                            rows={6}
                            className="w-full resize-none"
                          />
                        )}
                      </div>
                    ))}

                    <div className="pt-4">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto min-w-[200px]"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {content.form.submittingButton[language]}
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            {content.form.submitButton[language]}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}