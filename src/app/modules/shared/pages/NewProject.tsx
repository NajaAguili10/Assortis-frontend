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
import { ArrowLeft, Briefcase, Info, Rocket, Save } from 'lucide-react';
import { useProjectsContext } from '@app/contexts/ProjectsContext';
import { ProjectStatusEnum, ProjectPriorityEnum, ProjectTypeEnum, ProjectSectorEnum, RegionEnum } from '@app/types/project.dto';
import { CountryEnum } from '@app/types/tender.dto';
import { calculateProjectCompletion } from '@app/utils/project-completion';

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

const QUICK_PROJECT_DRAFT_KEY = 'assortis.quickProjectDraft';

export default function NewProject() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addProject } = useProjectsContext();

  const [form, setForm] = useState({
    title: '',
    sector: '' as ProjectSectorEnum | '',
    country: '',
    description: '',
    deadline: '',
    budget: '',
    currency: 'USD',
    tags: '',
  });

  useEffect(() => {
    const savedDraft = localStorage.getItem(QUICK_PROJECT_DRAFT_KEY);
    if (savedDraft) {
      try {
        setForm((prev) => ({ ...prev, ...JSON.parse(savedDraft) }));
      } catch {
        localStorage.removeItem(QUICK_PROJECT_DRAFT_KEY);
      }
    }

    const templateData = sessionStorage.getItem('projectTemplate');
    if (templateData) {
      try {
        const template = JSON.parse(templateData);
        setForm((prev) => ({
          ...prev,
          title: template.templateName || prev.title,
          sector: (template.sector as ProjectSectorEnum) || prev.sector,
          description: template.description || prev.description,
          budget: template.estimatedBudget ? String(template.estimatedBudget) : prev.budget,
        }));
        sessionStorage.removeItem('projectTemplate');
        toast.info(t('projects.create.templateLoaded'));
      } catch {
        // ignore malformed data
      }
    }
  }, [t]);

  useEffect(() => {
    localStorage.setItem(QUICK_PROJECT_DRAFT_KEY, JSON.stringify(form));
  }, [form]);

  const validate = () => {
    if (!form.title.trim()) { toast.error(t('projects.create.validation.title')); return false; }
    if (!form.sector)        { toast.error(t('common.fillRequired')); return false; }
    if (!form.country)       { toast.error(t('common.fillRequired')); return false; }
    if (!form.description.trim()) { toast.error(t('common.fillRequired')); return false; }
    if (!form.deadline)      { toast.error(t('common.fillRequired')); return false; }
    return true;
  };

  const buildProject = (status: ProjectStatusEnum) => {
    const tagList = form.tags.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    const budgetVal = form.budget ? parseFloat(form.budget) : 0;
    const deadlineMs = new Date(form.deadline).getTime();
    const durationMonths = deadlineMs > Date.now()
      ? Math.ceil((deadlineMs - Date.now()) / (1000 * 60 * 60 * 24 * 30))
      : 1;

    const project = {
      id: `proj-${Date.now()}`,
      organizationId: 'org-1',
      code: `PRJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      title: form.title.trim(),
      name: form.title.trim(),
      description: form.description.trim(),
      status,
      priority: ProjectPriorityEnum.MEDIUM,
      type: ProjectTypeEnum.DEVELOPMENT,
      country: form.country,
      region: RegionEnum.AFRICA_EAST,
      sector: form.sector as ProjectSectorEnum,
      subsectors: [] as string[],
      budget: { total: budgetVal, spent: 0, remaining: budgetVal, currency: form.currency },
      timeline: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: form.deadline,
        duration: durationMonths,
        completionPercentage: 0,
      },
      leadOrganization: '',
      partners: [] as string[],
      teamSize: 0,
      tasksCompleted: 0,
      totalTasks: 0,
      createdDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
      createdBy: 'user-1',
      ownedBy: 'user-1',
      tags: tagList,
      countries: [form.country as CountryEnum],
    };

    return {
      ...project,
      timeline: {
        ...project.timeline,
        completionPercentage: calculateProjectCompletion(project),
      },
    };
  };

  const handleCreate = () => {
    if (!validate()) return;
    addProject(buildProject(ProjectStatusEnum.ACTIVE));
    localStorage.removeItem(QUICK_PROJECT_DRAFT_KEY);
    toast.success(t('projects.create.success'));
    navigate('/projects');
  };

  const handleSaveDraft = () => {
    if (!form.title.trim()) { toast.error(t('projects.create.validation.title')); return; }
    addProject(buildProject(ProjectStatusEnum.DRAFT));
    localStorage.removeItem(QUICK_PROJECT_DRAFT_KEY);
    toast.success(t('projects.create.draftSaved'));
    navigate('/projects');
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
          <Button
            variant="ghost"
            size="sm"
            className="mb-5 text-muted-foreground hover:text-primary"
            onClick={() => navigate('/projects')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-primary">{t('projects.create.quickForm.title')}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{t('projects.create.quickForm.subtitle')}</p>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6 space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title">
                {t('projects.create.projectTitle')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={t('projects.create.projectTitle')}
              />
            </div>

            {/* Sector + Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sector">
                  {t('projects.create.projectSector')} <span className="text-destructive">*</span>
                </Label>
                <Select value={form.sector} onValueChange={(v) => setForm({ ...form, sector: v as ProjectSectorEnum })}>
                  <SelectTrigger id="sector">
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
                <Label htmlFor="country">
                  {t('common.country')} <span className="text-destructive">*</span>
                </Label>
                <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
                  <SelectTrigger id="country">
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">
                {t('common.description')} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t('projects.create.quickForm.descriptionPlaceholder')}
                rows={3}
              />
            </div>

            {/* Deadline + Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="deadline">
                  {t('projects.create.quickForm.deadline')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="budget">
                  {t('projects.create.totalBudget')}{' '}
                  <span className="text-muted-foreground text-xs">({t('projects.create.quickForm.optional')})</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="budget"
                    type="number"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    placeholder="0"
                    className="flex-1"
                  />
                  <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CHF">CHF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label htmlFor="tags">
                {t('projects.create.quickForm.tags')}{' '}
                <span className="text-muted-foreground text-xs">({t('projects.create.quickForm.optional')})</span>
              </Label>
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder={t('projects.create.quickForm.tagsPlaceholder')}
              />
            </div>

            {/* Hint */}
            <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{t('projects.create.completeHint')}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
            <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
              <Save className="h-4 w-4" />
              {t('projects.create.saveDraft')}
            </Button>
            <Button onClick={handleCreate} className="gap-2">
              <Rocket className="h-4 w-4" />
              {t('projects.create.createNow')}
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
