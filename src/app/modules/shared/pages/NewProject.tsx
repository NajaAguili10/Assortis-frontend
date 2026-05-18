import { useTranslation } from '@app/contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ProjectsSubMenu } from '@app/components/ProjectsSubMenu';
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
import { useState, useEffect } from 'react';
import { ArrowLeft, Briefcase, Info, Loader2, Rocket, Save } from 'lucide-react';
import { projectService } from '@app/services/projectService';
import type { CreateProjectPayload } from '@app/services/projectService';
import { ProjectSectorEnum } from '@app/types/project.dto';

// ── Country options ──────────────────────────────────────────────────────────
const COUNTRY_OPTIONS: { value: string; label: string }[] = [
  { value: 'KE', label: 'Kenya' },
  { value: 'ET', label: 'Ethiopia' },
  { value: 'SN', label: 'Senegal' },
  { value: 'TZ', label: 'Tanzania' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'MA', label: 'Morocco' },
  { value: 'ML', label: 'Mali' },
  { value: 'UG', label: 'Uganda' },
  { value: 'IN', label: 'India' },
  { value: 'NE', label: 'Niger' },
  { value: 'PE', label: 'Peru' },
  { value: 'GH', label: 'Ghana' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'CM', label: 'Cameroon' },
  { value: 'CD', label: 'DR Congo' },
  { value: 'CI', label: "Cote d'Ivoire" },
  { value: 'MZ', label: 'Mozambique' },
  { value: 'ZM', label: 'Zambia' },
  { value: 'RW', label: 'Rwanda' },
  { value: 'SD', label: 'Sudan' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'AF', label: 'Afghanistan' },
  { value: 'IQ', label: 'Iraq' },
  { value: 'HT', label: 'Haiti' },
  { value: 'CO', label: 'Colombia' },
  { value: 'BO', label: 'Bolivia' },
];

const PROJECT_TYPES = [
  'DEVELOPMENT',
  'INFRASTRUCTURE',
  'CAPACITY_BUILDING',
  'RESEARCH',
  'TECHNICAL_ASSISTANCE',
  'HUMANITARIAN',
  'PILOT',
  'PROGRAM',
] as const;

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'CHF', 'MAD', 'XOF'] as const;

const DRAFT_KEY = 'assortis.newProjectDraft';

interface FormState {
  title: string;
  description: string;
  sector: string;
  country: string;
  type: string;
  priority: string;
  startDate: string;
  endDate: string;
  budget: string;
  currency: string;
  region: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  sector: '',
  country: '',
  type: 'DEVELOPMENT',
  priority: 'MEDIUM',
  startDate: '',
  endDate: '',
  budget: '',
  currency: 'USD',
  region: '',
};

export default function NewProject() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Restore draft from localStorage ────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) setForm((prev) => ({ ...prev, ...JSON.parse(saved) }));
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }

    // Load template data from sessionStorage if coming from a template
    const templateRaw = sessionStorage.getItem('projectTemplate');
    if (templateRaw) {
      try {
        const tmpl = JSON.parse(templateRaw);
        setForm((prev) => ({
          ...prev,
          title: tmpl.templateName || prev.title,
          sector: tmpl.sector || prev.sector,
          description: tmpl.description || prev.description,
          budget: tmpl.estimatedBudget ? String(tmpl.estimatedBudget) : prev.budget,
        }));
        sessionStorage.removeItem('projectTemplate');
        toast.info(t('projects.create.templateLoaded'));
      } catch { /* ignore */ }
    }
  }, [t]);

  // ── Auto-save draft ──────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form]);

  // ── Field helper ─────────────────────────────────────────────────────────
  const set = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = (): boolean => {
    if (!form.title.trim()) {
      toast.error(t('projects.create.validation.title'));
      return false;
    }
    if (!form.description.trim()) {
      toast.error(t('common.fillRequired'));
      return false;
    }
    if (!form.country) {
      toast.error(t('common.fillRequired'));
      return false;
    }
    return true;
  };

  // ── Build API payload ────────────────────────────────────────────────────
  const buildPayload = (status: 'ACTIVE' | 'DRAFT'): CreateProjectPayload => ({
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    sector: form.sector || undefined,
    country: form.country || undefined,
    type: form.type || undefined,
    priority: form.priority || undefined,
    status,
    startDate: form.startDate || undefined,
    endDate: form.endDate || undefined,
    budget: form.budget ? parseFloat(form.budget) : undefined,
    currency: form.currency || undefined,
    region: form.region || undefined,
  });

  // ── Submit handlers ──────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await projectService.createProject(buildPayload('ACTIVE'));
      localStorage.removeItem(DRAFT_KEY);
      toast.success(t('projects.create.success'));
      navigate('/projects');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || t('common.error');
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!form.title.trim()) {
      toast.error(t('projects.create.validation.title'));
      return;
    }
    setIsSubmitting(true);
    try {
      await projectService.createProject(buildPayload('DRAFT'));
      localStorage.removeItem(DRAFT_KEY);
      toast.success(t('projects.create.draftSaved'));
      navigate('/projects');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || t('common.error');
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectorOptions = Object.values(ProjectSectorEnum);

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('projects.hub.title')}
        description={t('projects.hub.subtitle')}
        icon={Briefcase}
      />
      <ProjectsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6 max-w-2xl mx-auto">
          {/* Back */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-5 text-muted-foreground hover:text-primary"
            onClick={() => navigate('/projects')}
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-primary">
              {t('projects.create.quickForm.title')}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {t('projects.create.quickForm.subtitle')}
            </p>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6 space-y-5">

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="proj-title">
                {t('projects.create.projectTitle')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="proj-title"
                value={form.title}
                onChange={(e) => set('title')(e.target.value)}
                placeholder={t('projects.create.projectTitle')}
                disabled={isSubmitting}
              />
            </div>

            {/* Sector + Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="proj-sector">{t('projects.create.projectSector')}</Label>
                <Select value={form.sector} onValueChange={set('sector')} disabled={isSubmitting}>
                  <SelectTrigger id="proj-sector">
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {sectorOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="proj-country">
                  {t('common.country')} <span className="text-destructive">*</span>
                </Label>
                <Select value={form.country} onValueChange={set('country')} disabled={isSubmitting}>
                  <SelectTrigger id="proj-country">
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Type + Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="proj-type">{t('projects.filter.type')}</Label>
                <Select value={form.type} onValueChange={set('type')} disabled={isSubmitting}>
                  <SelectTrigger id="proj-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_TYPES.map((pt) => (
                      <SelectItem key={pt} value={pt}>
                        {pt.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="proj-priority">{t('projects.filter.priority')}</Label>
                <Select value={form.priority} onValueChange={set('priority')} disabled={isSubmitting}>
                  <SelectTrigger id="proj-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {t(`projects.priority.${p}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="proj-description">
                {t('common.description')} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="proj-description"
                value={form.description}
                onChange={(e) => set('description')(e.target.value)}
                placeholder={t('projects.create.quickForm.descriptionPlaceholder')}
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            {/* Start + End Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="proj-start">{t('projects.filter.startDate')}</Label>
                <Input
                  id="proj-start"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => set('startDate')(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="proj-end">
                  {t('projects.create.quickForm.deadline')}
                </Label>
                <Input
                  id="proj-end"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => set('endDate')(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Budget + Currency */}
            <div className="space-y-1.5">
              <Label htmlFor="proj-budget">
                {t('projects.create.totalBudget')}{' '}
                <span className="text-muted-foreground text-xs">
                  ({t('projects.create.quickForm.optional')})
                </span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="proj-budget"
                  type="number"
                  min={0}
                  value={form.budget}
                  onChange={(e) => set('budget')(e.target.value)}
                  placeholder="0"
                  className="flex-1"
                  disabled={isSubmitting}
                />
                <Select value={form.currency} onValueChange={set('currency')} disabled={isSubmitting}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Region */}
            <div className="space-y-1.5">
              <Label htmlFor="proj-region">
                {t('projects.filter.region')}{' '}
                <span className="text-muted-foreground text-xs">
                  ({t('projects.create.quickForm.optional')})
                </span>
              </Label>
              <Input
                id="proj-region"
                value={form.region}
                onChange={(e) => set('region')(e.target.value)}
                placeholder="e.g. Sub-Saharan Africa"
                disabled={isSubmitting}
              />
            </div>

            {/* Hint */}
            <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{t('projects.create.completeHint')}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {t('projects.create.saveDraft')}
            </Button>

            <Button
              onClick={handleCreate}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Rocket className="h-4 w-4" />
              )}
              {t('projects.create.createNow')}
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
