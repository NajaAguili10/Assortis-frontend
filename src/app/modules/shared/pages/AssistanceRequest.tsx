import { useState } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAssistanceHistory } from '@app/contexts/AssistanceHistoryContext';
import { useNavigate } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { AssistanceSubMenu } from '@app/components/AssistanceSubMenu';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Textarea } from '@app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { useAssistance } from '@app/hooks/useAssistance';
import { AssistanceTypeEnum, AssistancePriorityEnum } from '@app/types/assistance.dto';
import { ProjectSectorEnum } from '@app/types/project.dto';
import { toast } from 'sonner';
// Import Lucide React icons
import {
  Headphones,
  Search,
  FileText,
  Clock,
  Send,
} from 'lucide-react';

export default function AssistanceRequest() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { addHistoryEntry } = useAssistanceHistory();
  const { kpis } = useAssistance();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    sector: '',
    priority: '',
    budget: '',
    duration: '',
    startDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      // ✅ Enregistrer dans l'historique
      addHistoryEntry({
        type: 'assistance',
        organizationName: 'Assortis Support Team',
        title: formData.title,
        message: formData.description,
        requestType: formData.type.toLowerCase() as 'technical' | 'methodological' | 'graphic' | 'other',
        priority: formData.priority.toLowerCase() as 'low' | 'medium' | 'high' | 'urgent',
        status: 'pending',
      });
      
      setIsSubmitting(false);
      toast.success(t('assistance.request.success'), {
        description: t('assistance.request.successDescription'),
      });
      navigate('/assistance/history');
    }, 1500);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('assistance.hub.title')}
        description={t('assistance.hub.subtitle')}
        icon={Headphones}
        stats={[
          { value: kpis.activeRequests.toString(), label: t('assistance.stats.activeRequests') }
        ]}
      />

      {/* Sub Menu */}
      <AssistanceSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Helper Text Description */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900 leading-relaxed">
              {t('assistance.request.description')}
            </p>
          </div>

          {/* Form Card */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg border overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-5 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary text-lg">{t('assistance.request.form.header')}</h3>
                    <p className="text-sm text-muted-foreground">{t('common.requiredFields')}</p>
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <div className="p-6 space-y-6">
                {/* Request Information Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-accent rounded-full"></div>
                    {t('assistance.request.form.requestInfo')}
                  </h4>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                      {t('assistance.request.form.title')} <span className="text-accent">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder={t('assistance.request.form.titlePlaceholder')}
                      required
                      className="h-11"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                      {t('assistance.request.form.description')} <span className="text-accent">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder={t('assistance.request.form.descriptionPlaceholder')}
                      required
                      rows={5}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">{t('assistance.request.form.descriptionHint')}</p>
                  </div>
                </div>

                {/* Request Details Section */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-sm font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-accent rounded-full"></div>
                    {t('assistance.request.form.requestDetails')}
                  </h4>

                  {/* Type & Sector */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                        {t('assistance.request.form.type')} <span className="text-accent">*</span>
                      </Label>
                      <Select value={formData.type} onValueChange={(value) => handleChange('type', value)} required>
                        <SelectTrigger id="type" className="h-11">
                          <SelectValue placeholder={t('assistance.request.form.selectType')} />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(AssistanceTypeEnum).map((type) => (
                            <SelectItem key={type} value={type}>
                              {t(`assistance.type.${type}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sector" className="text-sm font-medium text-gray-700">
                        {t('assistance.request.form.sector')} <span className="text-accent">*</span>
                      </Label>
                      <Select value={formData.sector} onValueChange={(value) => handleChange('sector', value)} required>
                        <SelectTrigger id="sector" className="h-11">
                          <SelectValue placeholder={t('assistance.request.form.selectSector')} />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(ProjectSectorEnum).map((sector) => (
                            <SelectItem key={sector} value={sector}>
                              {t(`projects.sector.${sector}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
                      {t('assistance.request.form.priority')} <span className="text-accent">*</span>
                    </Label>
                    <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)} required>
                      <SelectTrigger id="priority" className="h-11">
                        <SelectValue placeholder={t('assistance.request.form.selectPriority')} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(AssistancePriorityEnum).map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            <div className="flex items-center gap-2">
                              <span>{t(`assistance.priority.${priority}`)}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Budget & Timeline Section */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-sm font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-accent rounded-full"></div>
                    {t('assistance.request.form.budgetTimeline')}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Budget */}
                    <div className="space-y-2">
                      <Label htmlFor="budget" className="text-sm font-medium text-gray-700">
                        {t('assistance.request.form.budget')}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          id="budget"
                          type="number"
                          value={formData.budget}
                          onChange={(e) => handleChange('budget', e.target.value)}
                          placeholder="50000"
                          className="h-11 pl-8"
                          min="0"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{t('assistance.request.form.budgetHint')}</p>
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                        {t('assistance.request.form.duration')} <span className="text-accent">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="duration"
                          type="number"
                          value={formData.duration}
                          onChange={(e) => handleChange('duration', e.target.value)}
                          placeholder="12"
                          required
                          className="h-11"
                          min="1"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          {t('assistance.request.form.weeks')}
                        </span>
                      </div>
                    </div>

                    {/* Start Date */}
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                        {t('assistance.request.form.startDate')} <span className="text-accent">*</span>
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleChange('startDate', e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <span className="text-accent">*</span>
                  {t('common.requiredFields')}
                </p>
                <div className="flex items-center gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/assistance')}
                    className="h-11 px-6"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="h-11 px-8 bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        {t('common.loading')}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {t('assistance.actions.submitRequest')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}