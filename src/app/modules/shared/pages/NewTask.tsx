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
import { useState, useMemo } from 'react';
import { ListChecks, ArrowLeft, CheckCircle2, X, Info } from 'lucide-react';
import { useProjects } from '@app/hooks/useProjects';
import { useExperts } from '@app/modules/expert/hooks/useExperts';
import { useAuth } from '@app/contexts/AuthContext';
import { canAssignProjectTasks } from '@app/services/permissions.service';
import { ProjectListDTO, ProjectPriorityEnum } from '@app/types/project.dto';
import { useProjectsContext } from '@app/contexts/ProjectsContext';

interface Collaborator {
  id: string;
  expertId: string;
  expertName: string;
  role: string;
}

interface Deliverable {
  id: string;
  title: string;
  type: string;
}

interface Dependency {
  id: string;
  taskId: string;
  taskTitle: string;
}

export default function NewTask() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canAssign = canAssignProjectTasks(user?.accountType);
  const { addTask } = useProjectsContext();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  // Hooks pour récupérer les données de l'organisation
  const { allProjects } = useProjects();
  const { allExperts } = useExperts();

  // Filtrer par organizationId de l'utilisateur actuel (org-1 pour la démo)
  const CURRENT_ORG_ID = 'org-1';
  
  const organizationProjects = useMemo(() => {
    return allProjects.filter(p => p.organizationId === CURRENT_ORG_ID);
  }, [allProjects]);

  const organizationExperts = useMemo(() => {
    return allExperts.filter(e => e.organizationId === CURRENT_ORG_ID);
  }, [allExperts]);

  // Projet sélectionné complet
  const [selectedProject, setSelectedProject] = useState<ProjectListDTO | null>(null);

  // Step 1: General Information
  const [generalInfo, setGeneralInfo] = useState({
    projectId: '',
    taskType: '',
    parentTask: '',
  });

  // Gérer la sélection du projet
  const handleProjectChange = (projectId: string) => {
    const project = organizationProjects.find(p => p.id === projectId);
    setSelectedProject(project || null);
    setGeneralInfo({ ...generalInfo, projectId });
  };

  // Step 2: Basic Information
  const [basicInfo, setBasicInfo] = useState({
    title: '',
    code: '',
    description: '',
    objectives: '',
  });

  // Step 3: Task Details
  const [taskDetails, setTaskDetails] = useState({
    priority: '',
    category: '',
    complexity: '',
    status: 'TODO',
  });

  const [dependencies, setDependencies] = useState<Dependency[]>([]);

  // Step 4: Dates & Duration
  const [datesInfo, setDatesInfo] = useState({
    estimatedStartDate: '',
    estimatedEndDate: '',
    estimatedDuration: '',
    isMilestone: false,
  });

  // Step 5: Assignment
  const [assignmentInfo, setAssignmentInfo] = useState({
    assignedTo: '',
    taskOwner: '',
    supervisor: '',
  });

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  // Step 6: Resources & Deliverables
  const [resourcesInfo, setResourcesInfo] = useState({
    estimatedBudget: '',
    requiredResources: '',
  });

  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);

  const steps = [
    { number: 1, title: t('projects.task.step1') },
    { number: 2, title: t('projects.task.step2') },
    { number: 3, title: t('projects.task.step3') },
    { number: 4, title: t('projects.task.step4') },
    { number: 5, title: t('projects.task.step5') },
    { number: 6, title: t('projects.task.step6') },
    { number: 7, title: t('projects.task.step7') },
  ];

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!generalInfo.projectId) {
          toast.error(t('projects.task.validation.project'));
          return false;
        }
        if (!generalInfo.taskType) {
          toast.error(t('projects.task.validation.type'));
          return false;
        }
        return true;
      case 2:
        if (!basicInfo.title.trim()) {
          toast.error(t('projects.task.validation.title'));
          return false;
        }
        if (!basicInfo.code.trim()) {
          toast.error(t('common.fillRequired'));
          return false;
        }
        if (!basicInfo.description.trim()) {
          toast.error(t('common.fillRequired'));
          return false;
        }
        return true;
      case 3:
        if (!taskDetails.priority) {
          toast.error(t('common.fillRequired'));
          return false;
        }
        if (!taskDetails.category) {
          toast.error(t('common.fillRequired'));
          return false;
        }
        if (!taskDetails.complexity) {
          toast.error(t('common.fillRequired'));
          return false;
        }
        return true;
      case 4:
        if (!datesInfo.estimatedStartDate) {
          toast.error(t('common.fillRequired'));
          return false;
        }
        if (!datesInfo.estimatedEndDate) {
          toast.error(t('common.fillRequired'));
          return false;
        }
        if (datesInfo.estimatedEndDate <= datesInfo.estimatedStartDate) {
          toast.error(t('projects.task.validation.dates'));
          return false;
        }
        // Validation: dates doivent être dans la plage du projet
        if (selectedProject) {
          const projectStart = new Date(selectedProject.timeline.startDate);
          const projectEnd = new Date(selectedProject.timeline.endDate);
          const taskStart = new Date(datesInfo.estimatedStartDate);
          const taskEnd = new Date(datesInfo.estimatedEndDate);
          
          if (taskStart < projectStart || taskEnd > projectEnd) {
            toast.error(t('projects.task.validation.dateRange'));
            return false;
          }
        }
        if (!datesInfo.estimatedDuration || parseFloat(datesInfo.estimatedDuration) <= 0) {
          toast.error(t('common.fillRequired'));
          return false;
        }
        return true;
      case 5:
        // Assignment step — only validate for admins
        if (canAssign) {
          if (!assignmentInfo.assignedTo) {
            toast.error(t('projects.task.validation.assignedTo'));
            return false;
          }
          if (!assignmentInfo.taskOwner) {
            toast.error(t('common.fillRequired'));
            return false;
          }
        }
        return true;
      case 6:
        // Validation: budget estimé ne doit pas dépasser le budget restant du projet
        if (resourcesInfo.estimatedBudget && selectedProject) {
          const estimatedBudget = parseFloat(resourcesInfo.estimatedBudget);
          const remainingBudget = selectedProject.budget.remaining;
          
          if (estimatedBudget > remainingBudget) {
            toast.error(t('projects.task.validation.budgetExceeded'));
            return false;
          }
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(currentStep + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const handleSubmit = () => {
    // Obtenir les experts assignés avec TaskAssigneeDTO structure
    const assignedToList = organizationExperts
      .filter(e => e.id === assignmentInfo.assignedTo || collaborators.some(c => c.expertId === e.id))
      .map(e => ({ id: e.id, name: e.name, role: e.role }));

    // Créer la nouvelle tâche avec toutes les données requises par le DTO
    const newTask = {
      id: `task-${Date.now()}`,
      projectId: generalInfo.projectId,
      projectTitle: selectedProject?.title || '',
      title: basicInfo.title,
      description: basicInfo.description,
      status: taskDetails.status,
      priority: taskDetails.priority as ProjectPriorityEnum,
      assignedTo: assignedToList.length > 0 ? assignedToList : [{ id: 'unassigned', name: 'Unassigned' }],
      startDate: datesInfo.estimatedStartDate,
      dueDate: datesInfo.estimatedEndDate,
      tags: [taskDetails.category, generalInfo.taskType].filter(Boolean),
    };

    // Ajouter la tâche au contexte
    addTask(newTask);

    // Message de succès et redirection vers Mes tâches
    toast.success(t('projects.task.success'));
    navigate('/projects/tasks');
  };

  const addDependency = () => {
    const newDependency: Dependency = {
      id: Date.now().toString(),
      taskId: '',
      taskTitle: '',
    };
    setDependencies([...dependencies, newDependency]);
  };

  const removeDependency = (id: string) => {
    setDependencies(dependencies.filter(d => d.id !== id));
  };

  const updateDependency = (id: string, field: string, value: string) => {
    setDependencies(dependencies.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const addCollaborator = () => {
    const newCollaborator: Collaborator = {
      id: Date.now().toString(),
      expertId: '',
      expertName: '',
      role: '',
    };
    setCollaborators([...collaborators, newCollaborator]);
  };

  const removeCollaborator = (id: string) => {
    setCollaborators(collaborators.filter(c => c.id !== id));
  };

  const updateCollaborator = (id: string, field: string, value: string) => {
    setCollaborators(collaborators.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const addDeliverable = () => {
    const newDeliverable: Deliverable = {
      id: Date.now().toString(),
      title: '',
      type: '',
    };
    setDeliverables([...deliverables, newDeliverable]);
  };

  const removeDeliverable = (id: string) => {
    setDeliverables(deliverables.filter(d => d.id !== id));
  };

  const updateDeliverable = (id: string, field: string, value: string) => {
    setDeliverables(deliverables.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="projectId">{t('projects.task.selectProject')} *</Label>
              <Select value={generalInfo.projectId} onValueChange={handleProjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.select')} />
                </SelectTrigger>
                <SelectContent>
                  {organizationProjects.map(project => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskType">{t('projects.task.taskType')} *</Label>
              <Select value={generalInfo.taskType} onValueChange={(value) => setGeneralInfo({ ...generalInfo, taskType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MILESTONE">{t('projects.task.type.MILESTONE')}</SelectItem>
                  <SelectItem value="DELIVERABLE">{t('projects.task.type.DELIVERABLE')}</SelectItem>
                  <SelectItem value="MEETING">{t('projects.task.type.MEETING')}</SelectItem>
                  <SelectItem value="RESEARCH">{t('projects.task.type.RESEARCH')}</SelectItem>
                  <SelectItem value="ANALYSIS">{t('projects.task.type.ANALYSIS')}</SelectItem>
                  <SelectItem value="DEVELOPMENT">{t('projects.task.type.DEVELOPMENT')}</SelectItem>
                  <SelectItem value="REVIEW">{t('projects.task.type.REVIEW')}</SelectItem>
                  <SelectItem value="APPROVAL">{t('projects.task.type.APPROVAL')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentTask">{t('projects.task.parentTask')}</Label>
              <Select value={generalInfo.parentTask} onValueChange={(value) => setGeneralInfo({ ...generalInfo, parentTask: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t('projects.task.parentTaskPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('common.select')}</SelectItem>
                  <SelectItem value="task1">Phase 1: Needs Assessment and Planning</SelectItem>
                  <SelectItem value="task2">Phase 2: Stakeholder Consultation</SelectItem>
                  <SelectItem value="task3">Phase 3: Implementation Design</SelectItem>
                  <SelectItem value="task4">Phase 4: Procurement Process</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">{t('projects.task.taskTitle')} *</Label>
                <Input
                  id="title"
                  value={basicInfo.title}
                  onChange={(e) => setBasicInfo({ ...basicInfo, title: e.target.value })}
                  placeholder={t('projects.task.taskTitle')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">{t('projects.task.taskCode')} *</Label>
                <Input
                  id="code"
                  value={basicInfo.code}
                  onChange={(e) => setBasicInfo({ ...basicInfo, code: e.target.value })}
                  placeholder="TSK-2024-001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('projects.task.taskDescription')} *</Label>
              <Textarea
                id="description"
                value={basicInfo.description}
                onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                placeholder={t('projects.task.taskDescription')}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objectives">{t('projects.task.taskObjectives')}</Label>
              <Textarea
                id="objectives"
                value={basicInfo.objectives}
                onChange={(e) => setBasicInfo({ ...basicInfo, objectives: e.target.value })}
                placeholder={t('projects.task.taskObjectives')}
                rows={4}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="priority">{t('projects.filters.priority')} *</Label>
                <Select value={taskDetails.priority} onValueChange={(value) => setTaskDetails({ ...taskDetails, priority: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">{t('projects.priority.LOW')}</SelectItem>
                    <SelectItem value="MEDIUM">{t('projects.priority.MEDIUM')}</SelectItem>
                    <SelectItem value="HIGH">{t('projects.priority.HIGH')}</SelectItem>
                    <SelectItem value="URGENT">{t('projects.priority.URGENT')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">{t('projects.task.category')} *</Label>
                <Select value={taskDetails.category} onValueChange={(value) => setTaskDetails({ ...taskDetails, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNING">{t('projects.task.category.PLANNING')}</SelectItem>
                    <SelectItem value="EXECUTION">{t('projects.task.category.EXECUTION')}</SelectItem>
                    <SelectItem value="MONITORING">{t('projects.task.category.MONITORING')}</SelectItem>
                    <SelectItem value="REPORTING">{t('projects.task.category.REPORTING')}</SelectItem>
                    <SelectItem value="COORDINATION">{t('projects.task.category.COORDINATION')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="complexity">{t('projects.task.complexity')} *</Label>
                <Select value={taskDetails.complexity} onValueChange={(value) => setTaskDetails({ ...taskDetails, complexity: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIMPLE">{t('projects.task.complexity.SIMPLE')}</SelectItem>
                    <SelectItem value="MODERATE">{t('projects.task.complexity.MODERATE')}</SelectItem>
                    <SelectItem value="COMPLEX">{t('projects.task.complexity.COMPLEX')}</SelectItem>
                    <SelectItem value="VERY_COMPLEX">{t('projects.task.complexity.VERY_COMPLEX')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">{t('projects.task.taskStatus')} *</Label>
              <Select value={taskDetails.status} onValueChange={(value) => setTaskDetails({ ...taskDetails, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">{t('projects.tasks.status.TODO')}</SelectItem>
                  <SelectItem value="IN_PROGRESS">{t('projects.tasks.status.IN_PROGRESS')}</SelectItem>
                  <SelectItem value="REVIEW">{t('projects.tasks.status.REVIEW')}</SelectItem>
                  <SelectItem value="COMPLETED">{t('projects.tasks.status.COMPLETED')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t('projects.task.dependencies')}</Label>
                <Button type="button" variant="outline" size="sm" onClick={addDependency}>
                  {t('projects.task.addDependency')}
                </Button>
              </div>

              {dependencies.map((dependency) => (
                <div key={dependency.id} className="flex gap-3 items-start p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <Select value={dependency.taskId} onValueChange={(value) => updateDependency(dependency.id, 'taskId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('common.select')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dep1">Complete feasibility study</SelectItem>
                        <SelectItem value="dep2">Stakeholder approval received</SelectItem>
                        <SelectItem value="dep3">Budget allocation confirmed</SelectItem>
                        <SelectItem value="dep4">Team members assigned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeDependency(dependency.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="estimatedStartDate">{t('projects.task.estimatedStartDate')} *</Label>
                <Input
                  id="estimatedStartDate"
                  type="date"
                  value={datesInfo.estimatedStartDate}
                  onChange={(e) => setDatesInfo({ ...datesInfo, estimatedStartDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedEndDate">{t('projects.task.estimatedEndDate')} *</Label>
                <Input
                  id="estimatedEndDate"
                  type="date"
                  value={datesInfo.estimatedEndDate}
                  onChange={(e) => setDatesInfo({ ...datesInfo, estimatedEndDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDuration">{t('projects.task.estimatedDuration')} *</Label>
              <Input
                id="estimatedDuration"
                type="number"
                value={datesInfo.estimatedDuration}
                onChange={(e) => setDatesInfo({ ...datesInfo, estimatedDuration: e.target.value })}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isMilestone"
                  checked={datesInfo.isMilestone}
                  onChange={(e) => setDatesInfo({ ...datesInfo, isMilestone: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="isMilestone" className="cursor-pointer">
                  {t('projects.task.milestone')}
                </Label>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="grid gap-6">
            {!canAssign && (
              <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{t('projects.tasks.assignHint')}</span>
              </div>
            )}
            {canAssign && (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="assignedTo">{t('projects.task.assignedTo')} *</Label>
                <Select value={assignmentInfo.assignedTo} onValueChange={(value) => setAssignmentInfo({ ...assignmentInfo, assignedTo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('projects.create.selectExpert')} />
                  </SelectTrigger>
                  <SelectContent>
                    {organizationExperts.map(expert => (
                      <SelectItem key={expert.id} value={expert.id}>{expert.name} - {expert.role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskOwner">{t('projects.task.taskOwner')} *</Label>
                <Select value={assignmentInfo.taskOwner} onValueChange={(value) => setAssignmentInfo({ ...assignmentInfo, taskOwner: value })}>
                  <SelectTrigger>
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

            <div className="space-y-2">
              <Label htmlFor="supervisor">{t('projects.task.supervisor')}</Label>
              <Select value={assignmentInfo.supervisor} onValueChange={(value) => setAssignmentInfo({ ...assignmentInfo, supervisor: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t('projects.create.selectExpert')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exp5">Dr. Fatima Hassan - Health Systems Expert</SelectItem>
                  <SelectItem value="exp6">Jean-Pierre Dubois - Engineering Lead</SelectItem>
                  <SelectItem value="exp7">Lisa Anderson - M&E Specialist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t('projects.task.collaborators')}</Label>
                <Button type="button" variant="outline" size="sm" onClick={addCollaborator}>
                  {t('projects.task.addCollaborator')}
                </Button>
              </div>

              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex gap-3 items-start p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Select value={collaborator.expertId} onValueChange={(value) => updateCollaborator(collaborator.id, 'expertId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('projects.create.selectExpert')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="e1">Marie Dupont - Finance Officer</SelectItem>
                        <SelectItem value="e2">Ahmed Mohamed - M&E Specialist</SelectItem>
                        <SelectItem value="e3">Laura Garcia - Communications</SelectItem>
                        <SelectItem value="e4">David Ochieng - Logistics Coordinator</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={collaborator.role} onValueChange={(value) => updateCollaborator(collaborator.id, 'role', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('projects.task.selectRole')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="taskLeader">
                          {t('projects.task.roles.taskLeader')}
                        </SelectItem>
                        <SelectItem value="contributor">
                          {t('projects.task.roles.contributor')}
                        </SelectItem>
                        <SelectItem value="reviewer">
                          {t('projects.task.roles.reviewer')}
                        </SelectItem>
                        <SelectItem value="qualityControl">
                          {t('projects.task.roles.qualityControl')}
                        </SelectItem>
                        <SelectItem value="dataAnalyst">
                          {t('projects.task.roles.dataAnalyst')}
                        </SelectItem>
                        <SelectItem value="researcher">
                          {t('projects.task.roles.researcher')}
                        </SelectItem>
                        <SelectItem value="writer">
                          {t('projects.task.roles.writer')}
                        </SelectItem>
                        <SelectItem value="designer">
                          {t('projects.task.roles.designer')}
                        </SelectItem>
                        <SelectItem value="technicalSupport">
                          {t('projects.task.roles.technicalSupport')}
                        </SelectItem>
                        <SelectItem value="consultant">
                          {t('projects.task.roles.consultant')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeCollaborator(collaborator.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            </>
            )}
          </div>
        );

      case 6:
        return (
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="estimatedBudget">{t('projects.task.estimatedBudget')}</Label>
              <Input
                id="estimatedBudget"
                type="number"
                value={resourcesInfo.estimatedBudget}
                onChange={(e) => setResourcesInfo({ ...resourcesInfo, estimatedBudget: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredResources">{t('projects.task.requiredResources')}</Label>
              <Textarea
                id="requiredResources"
                value={resourcesInfo.requiredResources}
                onChange={(e) => setResourcesInfo({ ...resourcesInfo, requiredResources: e.target.value })}
                placeholder={t('projects.task.requiredResources')}
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t('projects.task.deliverables')}</Label>
                <Button type="button" variant="outline" size="sm" onClick={addDeliverable}>
                  {t('projects.task.addDeliverable')}
                </Button>
              </div>

              {deliverables.map((deliverable) => (
                <div key={deliverable.id} className="flex gap-3 items-start p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      value={deliverable.title}
                      onChange={(e) => updateDeliverable(deliverable.id, 'title', e.target.value)}
                      placeholder={t('projects.task.deliverableTitle')}
                    />
                    <Select value={deliverable.type} onValueChange={(value) => updateDeliverable(deliverable.id, 'type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('projects.task.deliverableType')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REPORT">{t('projects.tasks.deliverableType.REPORT')}</SelectItem>
                        <SelectItem value="DOCUMENT">{t('projects.tasks.deliverableType.DOCUMENT')}</SelectItem>
                        <SelectItem value="PRESENTATION">{t('projects.tasks.deliverableType.PRESENTATION')}</SelectItem>
                        <SelectItem value="DATA">{t('projects.tasks.deliverableType.DATA')}</SelectItem>
                        <SelectItem value="SOFTWARE">{t('projects.tasks.deliverableType.SOFTWARE')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeDeliverable(deliverable.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-primary">{t('projects.task.reviewTitle')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('projects.task.reviewSubtitle')}</p>
            </div>

            {/* General Information */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-3">{t('projects.create.generalInfo')}</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">{t('projects.task.selectProject')}:</span>
                  <p className="font-medium">{generalInfo.projectId || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.task.taskType')}:</span>
                  <p className="font-medium">{generalInfo.taskType ? t(`projects.task.type.${generalInfo.taskType}`) : '-'}</p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-3">{t('projects.create.basicInfo')}</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">{t('projects.task.taskTitle')}:</span>
                  <p className="font-medium">{basicInfo.title}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.task.taskCode')}:</span>
                  <p className="font-medium">{basicInfo.code}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.task.taskDescription')}:</span>
                  <p className="font-medium">{basicInfo.description}</p>
                </div>
              </div>
            </div>

            {/* Task Details */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-3">{t('projects.create.details')}</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">{t('projects.filters.priority')}:</span>
                  <p className="font-medium">{taskDetails.priority ? t(`projects.priority.${taskDetails.priority}`) : '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.task.category')}:</span>
                  <p className="font-medium">{taskDetails.category ? t(`projects.task.category.${taskDetails.category}`) : '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.task.complexity')}:</span>
                  <p className="font-medium">{taskDetails.complexity ? t(`projects.task.complexity.${taskDetails.complexity}`) : '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.task.dependencies')}:</span>
                  <p className="font-medium">{dependencies.length} {t('projects.task.dependencies')}</p>
                </div>
              </div>
            </div>

            {/* Dates & Duration */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-3">{t('projects.task.step4')}</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">{t('projects.task.estimatedStartDate')}:</span>
                  <p className="font-medium">{datesInfo.estimatedStartDate}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.task.estimatedEndDate')}:</span>
                  <p className="font-medium">{datesInfo.estimatedEndDate}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.task.estimatedDuration')}:</span>
                  <p className="font-medium">{datesInfo.estimatedDuration} hours</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.task.milestone')}:</span>
                  <p className="font-medium">{datesInfo.isMilestone ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            {/* Assignment */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-3">{t('projects.task.step5')}</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">{t('projects.task.assignedTo')}:</span>
                  <p className="font-medium">{assignmentInfo.assignedTo || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.task.taskOwner')}:</span>
                  <p className="font-medium">{assignmentInfo.taskOwner || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.task.collaborators')}:</span>
                  <p className="font-medium">{collaborators.length} {t('projects.task.collaborators')}</p>
                </div>
              </div>
            </div>

            {/* Resources & Deliverables */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-3">{t('projects.task.step6')}</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">{t('projects.task.estimatedBudget')}:</span>
                  <p className="font-medium">{resourcesInfo.estimatedBudget || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.task.deliverables')}:</span>
                  <p className="font-medium">{deliverables.length} {t('projects.task.deliverables')}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('projects.actions.newTask')}
        description={t('projects.actions.newTaskDescription')}
        icon={ListChecks}
      />

      {/* Sub Menu */}
      <ProjectsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold shadow-sm transition-all ${
                        currentStep === step.number
                          ? 'bg-[#B82547] text-white ring-4 ring-[#B82547]/20'
                          : currentStep > step.number
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-500 border-2 border-gray-300'
                      }`}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span className={`text-xs mt-2 text-center hidden md:block transition-colors ${
                      currentStep === step.number ? 'text-[#B82547] font-semibold' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded transition-colors ${
                      currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <div className="mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-[#3d4654]">
                {steps[currentStep - 1].title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {t('projects.create.step')} {currentStep} {t('common.of')} {totalSteps}
              </p>
            </div>
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-gray-500">
              {currentStep < totalSteps && (
                <span>
                  {t('projects.create.step')} {currentStep} {t('common.of')} {totalSteps}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevious} className="border-gray-300">
                  {t('projects.task.previous')}
                </Button>
              )}
              {currentStep < totalSteps ? (
                <Button onClick={handleNext} className="bg-[#B82547] hover:bg-[#a01f3c]">
                  {t('projects.task.next')}
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                  {t('projects.task.submit')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
