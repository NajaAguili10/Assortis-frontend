import { useTranslation } from '@app/contexts/LanguageContext';
import { useNavigate, useParams } from 'react-router';
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
import { ArrowLeft, Briefcase, Loader2, Save } from 'lucide-react';
import { projectService } from '@app/services/projectService';
import { useProjectsContext } from '@app/contexts/ProjectsContext';
import { ProjectSectorEnum, RegionDTO } from '@app/types/project.dto';
import { CountryDTO, SectorDTO } from '@app/types/organization.dto';

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

const getStringValue = (value: unknown) => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (value && typeof value === 'object') {
    return String((value as any).code || (value as any).name || '');
  }
  return '';
};

const getCountryValue = (country: unknown, countries: CountryDTO[]) => {
  const raw = getStringValue(country);
  if (!raw) return '';
  const match = countries.find((item) => item.code === raw || item.name === raw);
  return match ? match.code : raw;
};

const getSectorValue = (sector: unknown, sectors: SectorDTO[]) => {
  const raw = getStringValue(sector);
  if (!raw) return '';
  const match = sectors.find((item) => item.code === raw || item.name === raw);
  return match ? match.code : raw;
};

const getRegionValue = (region: unknown, regions: RegionDTO[]) => {
  const raw = getStringValue(region);
  if (!raw) return '';
  const match = regions.find((item) => item.code === raw || item.name === raw);
  return match ? match.code : raw;
};

const getBudgetValue = (budget: unknown) => {
  if (budget === undefined || budget === null) return '';
  if (typeof budget === 'number') return String(budget);
  if (typeof budget === 'string') return budget;
  if (typeof budget === 'object' && budget !== null) {
    return String((budget as any).total ?? (budget as any).amount ?? '');
  }
  return '';
};

export default function EditProject() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { getProjectById, updateProject } = useProjectsContext();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [countries, setCountries] = useState<CountryDTO[]>([]);
  const [regions, setRegions] = useState<RegionDTO[]>([]);
  const [sectors, setSectors] = useState<SectorDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadedProjectId, setLoadedProjectId] = useState<string | null>(null);

  const buildFormFromProject = (
    project: any,
    existingCountries: CountryDTO[] = [],
    existingRegions: RegionDTO[] = [],
    existingSectors: SectorDTO[] = [],
  ): FormState => ({
    title: getStringValue(project.title),
    description: getStringValue(project.description),
    sector: getSectorValue(project.sector, existingSectors),
    country: getCountryValue(project.country, existingCountries),
    type: getStringValue(project.type) || 'DEVELOPMENT',
    priority: getStringValue(project.priority) || 'MEDIUM',
    startDate: getStringValue(project.timeline?.startDate) || '',
    endDate: getStringValue(project.timeline?.endDate) || '',
    budget: getBudgetValue(project.budget),
    currency: getStringValue(project.budget?.currency) || getStringValue(project.currency) || 'USD',
    region: getRegionValue(project.region, existingRegions),
  });

  useEffect(() => {
    if (!id) {
      toast.error(t('projects.edit.projectNotFound'));
      navigate('/projects');
      return;
    }

    const loadData = async () => {
      setIsLoading(true);

      try {
        const [countriesResponse, regionsResponse, sectorsResponse] = await Promise.all([
          projectService.getCountries(),
          projectService.getRegions(),
          projectService.getSectors(),
        ]);
        setCountries(countriesResponse);
        setRegions(regionsResponse);
        setSectors(sectorsResponse);

        const existingProject = getProjectById(id);
        const projectResponse = existingProject || (await projectService.getProjectById(id));

        if (projectResponse) {
          setForm(buildFormFromProject(projectResponse, countriesResponse, regionsResponse, sectorsResponse));
          setLoadedProjectId(String(existingProject ? existingProject.id : id));
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Failed to load project metadata or project details:', error);
      }

      toast.error(t('projects.edit.projectNotFound'));
      navigate('/projects');
      setIsLoading(false);
    };

    loadData();
  }, [id, getProjectById, navigate, t]);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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

  const buildUpdate = () => ({
    title: form.title.trim(),
    description: form.description.trim(),
    sector: form.sector || undefined,
    country: form.country || undefined,
    type: form.type || undefined,
    priority: form.priority || undefined,
    region: form.region || undefined,
    budget: form.budget ? Number(form.budget) : undefined,
    currency: form.currency || undefined,
    startDate: form.startDate || undefined,
    endDate: form.endDate || undefined,
  });

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!loadedProjectId) {
      toast.error(t('projects.edit.projectNotFound'));
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedProject = await projectService.updateProject(loadedProjectId, buildUpdate());
      updateProject(loadedProjectId, {
        title: updatedProject.title,
        description: updatedProject.description,
        sector: updatedProject.sector,
        country: updatedProject.country,
        type: updatedProject.type,
        priority: updatedProject.priority,
        region: updatedProject.region,
        budget: updatedProject.budget,
        currency: updatedProject.currency,
        startDate: updatedProject.startDate,
        endDate: updatedProject.endDate,
      } as any);
      toast.success(t('projects.edit.success'));
      navigate('/projects');
    } catch (error) {
      console.error('Failed to update project:', error);
      toast.error(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectorOptions = sectors.length
    ? sectors
    : Object.values(ProjectSectorEnum).map((value) => ({ id: 0, code: value, name: value.replace(/_/g, ' ') }));

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('projects.edit.title')}
        description={t('projects.edit.subtitle')}
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
            disabled={isSubmitting || isLoading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-primary">{t('projects.edit.title')}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{t('projects.edit.subtitle')}</p>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6 space-y-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="proj-sector">{t('projects.create.projectSector')}</Label>
                    <Select value={form.sector} onValueChange={set('sector')} disabled={isSubmitting}>
                      <SelectTrigger id="proj-sector">
                        <SelectValue placeholder={t('common.select')} />
                      </SelectTrigger>
                      <SelectContent>
                        {sectorOptions.map((sector) => (
                          <SelectItem key={sector.code} value={sector.code}>
                            {sector.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="proj-country">
                      {t('common.country')} <span className="text-destructive">*</span>
                    </Label>
                    <Select value={form.country} onValueChange={set('country')} disabled={isSubmitting || countries.length === 0}>
                      <SelectTrigger id="proj-country">
                        <SelectValue placeholder={t('common.select')} />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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
                        {PRIORITY_OPTIONS.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {t(`projects.priority.${priority}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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
                    <Label htmlFor="proj-end">{t('projects.create.quickForm.deadline')}</Label>
                    <Input
                      id="proj-end"
                      type="date"
                      value={form.endDate}
                      onChange={(e) => set('endDate')(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="proj-budget">
                    {t('projects.create.totalBudget')}{' '}
                    <span className="text-muted-foreground text-xs">({t('projects.create.quickForm.optional')})</span>
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
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="proj-region">
                    {t('projects.filter.region')}{' '}
                    <span className="text-muted-foreground text-xs">({t('projects.create.quickForm.optional')})</span>
                  </Label>
                  <Select value={form.region} onValueChange={set('region')} disabled={isSubmitting || regions.length === 0}>
                    <SelectTrigger id="proj-region">
                      <SelectValue placeholder={t('common.select')} />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.code} value={region.code}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
                  <span>{t('projects.create.completeHint')}</span>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => navigate('/projects')}
              disabled={isSubmitting || isLoading}
              className="gap-2"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading}
              className="gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {t('projects.edit.submit')}
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
