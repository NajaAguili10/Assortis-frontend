import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, Info, ListChecks, UserRound } from 'lucide-react';
import { useTranslation } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ProjectsSubMenu } from '@app/components/ProjectsSubMenu';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Textarea } from '@app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@app/components/ui/accordion';
import { useProjects } from '@app/hooks/useProjects';
import { useExperts } from '@app/modules/expert/hooks/useExperts';
import { useProjectsContext } from '@app/contexts/ProjectsContext';
import { ProjectListDTO, ProjectPriorityEnum } from '@app/types/project.dto';

export default function NewTask() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addTask } = useProjectsContext();
  const { allProjects } = useProjects();
  const { allExperts } = useExperts();

  const CURRENT_ORG_ID = 'org-1';
  const organizationProjects = useMemo(() => allProjects.filter(project => project.organizationId === CURRENT_ORG_ID), [allProjects]);
  const organizationExperts = useMemo(() => allExperts.filter(expert => expert.organizationId === CURRENT_ORG_ID), [allExperts]);

  const [selectedProject, setSelectedProject] = useState<ProjectListDTO | null>(null);
  const [formValues, setFormValues] = useState({
    title: '',
    projectId: '',
    dueDate: '',
    assignedTo: '',
    taskType: '',
    code: '',
    description: '',
    objectives: '',
    priority: ProjectPriorityEnum.MEDIUM,
    category: '',
    complexity: '',
    estimatedStartDate: '',
    estimatedDuration: '',
    estimatedBudget: '',
    requiredResources: '',
  });

  const setField = (field: keyof typeof formValues, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleProjectChange = (projectId: string) => {
    const project = organizationProjects.find(item => item.id === projectId) || null;
    setSelectedProject(project);
    setField('projectId', projectId);
  };

  const handleSubmit = () => {
    if (!formValues.title.trim()) {
      toast.error(t('projects.task.validation.title'));
      return;
    }

    if (organizationProjects.length > 0 && !formValues.projectId) {
      toast.error(t('projects.task.validation.project'));
      return;
    }

    const assignedExpert = organizationExperts.find(expert => expert.id === formValues.assignedTo);
    const projectTitle = selectedProject?.title || selectedProject?.name || '';

    addTask({
      id: `task-${Date.now()}`,
      projectId: formValues.projectId || 'unassigned-project',
      projectTitle: projectTitle || 'Project to assign later',
      title: formValues.title.trim(),
      description: formValues.description.trim() || undefined,
      status: 'TODO',
      priority: formValues.priority,
      assignedTo: assignedExpert
        ? [{ id: assignedExpert.id, name: assignedExpert.name, role: assignedExpert.role }]
        : [{ id: 'unassigned', name: 'Unassigned' }],
      startDate: formValues.estimatedStartDate || undefined,
      dueDate: formValues.dueDate || undefined,
      tags: [formValues.category, formValues.taskType, formValues.complexity].filter(Boolean),
    });

    toast.success(t('projects.task.success'));
    navigate('/projects/tasks');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        title={t('projects.actions.newTask')}
        description={t('projects.actions.newTaskDescription')}
        icon={ListChecks}
      />

      <ProjectsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" onClick={() => navigate('/projects/tasks')} className="w-fit">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('projects.task.previous')}
            </Button>
          </div>

          <div className="rounded-lg border border-primary/15 bg-white p-5 shadow-sm">
            <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>You can complete additional details later</span>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="task-title">{t('projects.task.taskTitle')} *</Label>
                  <Input
                    id="task-title"
                    value={formValues.title}
                    onChange={event => setField('title', event.target.value)}
                    placeholder={t('projects.task.taskTitle')}
                    className="min-h-11"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t('projects.task.selectProject')}{organizationProjects.length > 0 ? ' *' : ''}</Label>
                    <Select value={formValues.projectId} onValueChange={handleProjectChange}>
                      <SelectTrigger className="min-h-11">
                        <SelectValue placeholder={t('common.select')} />
                      </SelectTrigger>
                      <SelectContent>
                        {organizationProjects.map(project => (
                          <SelectItem key={project.id} value={project.id}>{project.name || project.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="due-date">{t('projects.tasks.dueDate')}</Label>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="due-date"
                        type="date"
                        value={formValues.dueDate}
                        onChange={event => setField('dueDate', event.target.value)}
                        className="min-h-11 pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('projects.task.assignedTo')}</Label>
                  <Select value={formValues.assignedTo} onValueChange={value => setField('assignedTo', value)}>
                    <SelectTrigger className="min-h-11">
                      <SelectValue placeholder={t('projects.create.selectExpert')} />
                    </SelectTrigger>
                    <SelectContent>
                      {organizationExperts.map(expert => (
                        <SelectItem key={expert.id} value={expert.id}>{expert.name} - {expert.role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <UserRound className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-base font-semibold text-primary">Quick Create</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Create the task now with the essential information. Planning, budget, resources, and categorization can be completed from the task workflow later.
                </p>
              </div>
            </div>

            <Accordion type="multiple" className="mt-6 space-y-3">
              <AccordionItem value="details" className="rounded-lg border border-gray-200 bg-white px-4">
                <AccordionTrigger className="hover:no-underline">More details</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{t('projects.task.taskType')}</Label>
                      <Select value={formValues.taskType} onValueChange={value => setField('taskType', value)}>
                        <SelectTrigger><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                        <SelectContent>
                          {['MILESTONE', 'DELIVERABLE', 'MEETING', 'RESEARCH', 'ANALYSIS', 'DEVELOPMENT', 'REVIEW', 'APPROVAL'].map(type => (
                            <SelectItem key={type} value={type}>{t(`projects.task.type.${type}`)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('projects.task.taskCode')}</Label>
                      <Input value={formValues.code} onChange={event => setField('code', event.target.value)} placeholder="TSK-2024-001" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>{t('projects.task.taskDescription')}</Label>
                      <Textarea rows={4} value={formValues.description} onChange={event => setField('description', event.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>{t('projects.task.taskObjectives')}</Label>
                      <Textarea rows={3} value={formValues.objectives} onChange={event => setField('objectives', event.target.value)} />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="planning" className="rounded-lg border border-gray-200 bg-white px-4">
                <AccordionTrigger className="hover:no-underline">Planning and resources</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-5 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>{t('projects.filters.priority')}</Label>
                      <Select value={formValues.priority} onValueChange={value => setField('priority', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.values(ProjectPriorityEnum).map(priority => (
                            <SelectItem key={priority} value={priority}>{t(`projects.priority.${priority}`)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('projects.task.category')}</Label>
                      <Select value={formValues.category} onValueChange={value => setField('category', value)}>
                        <SelectTrigger><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                        <SelectContent>
                          {['PLANNING', 'EXECUTION', 'MONITORING', 'REPORTING', 'COORDINATION'].map(category => (
                            <SelectItem key={category} value={category}>{t(`projects.task.category.${category}`)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('projects.task.complexity')}</Label>
                      <Select value={formValues.complexity} onValueChange={value => setField('complexity', value)}>
                        <SelectTrigger><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                        <SelectContent>
                          {['SIMPLE', 'MODERATE', 'COMPLEX', 'VERY_COMPLEX'].map(complexity => (
                            <SelectItem key={complexity} value={complexity}>{t(`projects.task.complexity.${complexity}`)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('projects.task.estimatedStartDate')}</Label>
                      <Input type="date" value={formValues.estimatedStartDate} onChange={event => setField('estimatedStartDate', event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('projects.task.estimatedDuration')}</Label>
                      <Input value={formValues.estimatedDuration} onChange={event => setField('estimatedDuration', event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('projects.task.estimatedBudget')}</Label>
                      <Input type="number" value={formValues.estimatedBudget} onChange={event => setField('estimatedBudget', event.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-3">
                      <Label>{t('projects.task.requiredResources')}</Label>
                      <Textarea rows={3} value={formValues.requiredResources} onChange={event => setField('requiredResources', event.target.value)} />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
              <Button variant="outline" onClick={() => navigate('/projects/tasks')}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSubmit} className="bg-[#B82547] hover:bg-[#a01f3c]">
                {t('projects.task.submit')}
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
