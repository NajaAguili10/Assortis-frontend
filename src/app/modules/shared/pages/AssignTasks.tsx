import { useTranslation } from '@app/contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ProjectsSubMenu } from '@app/components/ProjectsSubMenu';
import { AccessDenied } from '@app/components/AccessDenied';
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
import { UserPlus, ArrowLeft, CheckCircle2, Search } from 'lucide-react';
import { useProjects } from '@app/hooks/useProjects';
import { useExperts } from '@app/modules/expert/hooks/useExperts';
import { useAuth } from '@app/contexts/AuthContext';
import { canManageOrganizationAdminActions } from '@app/services/permissions.service';
import { ProjectListDTO } from '@app/types/project.dto';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  startDate: string;
}

interface Expert {
  id: string;
  name: string;
  expertise: string;
  availability: string;
  rate: string;
}

interface Assignment {
  taskId: string;
  expertId: string;
  role: string;
  allocation: string;
  startDate: string;
  endDate: string;
  responsibility: string;
  notes: string;
}

export default function AssignTasks() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canAssign = canManageOrganizationAdminActions(user?.accountType, user?.role);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  if (!canAssign) {
    return (
      <div className="min-h-screen">
        <PageBanner title={t('projects.hub.title')} description={t('projects.hub.subtitle')} icon={UserPlus} />
        <ProjectsSubMenu />
        <PageContainer className="my-6">
          <AccessDenied module="projects" accountType={user?.accountType} />
        </PageContainer>
      </div>
    );
  }

  // Step 1: Select Project
  const [selectedProject, setSelectedProject] = useState('');

  // Step 2: Select Tasks
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [searchTasks, setSearchTasks] = useState('');

  // Step 3: Select Experts
  const [selectedExperts, setSelectedExperts] = useState<string[]>([]);
  const [searchExperts, setSearchExperts] = useState('');

  // Step 4: Assignment Details
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Hooks pour récupérer les données de l'organisation
  const { allProjects, tasks } = useProjects();
  const { allExperts } = useExperts();

  // Filtrer par organizationId de l'utilisateur actuel (org-1 pour la démo)
  const CURRENT_ORG_ID = 'org-1';
  
  // Étape 1: Projets de l'organisation
  const organizationProjects = useMemo(() => {
    return allProjects.filter(p => p.organizationId === CURRENT_ORG_ID);
  }, [allProjects]);

  // Projet sélectionné complet
  const selectedProjectData = useMemo(() => {
    return organizationProjects.find(p => p.id === selectedProject);
  }, [organizationProjects, selectedProject]);

  // Étape 2: Tâches du projet sélectionné
  const projectTasks = useMemo(() => {
    if (!selectedProject) return [];
    return tasks.filter(t => t.projectId === selectedProject);
  }, [tasks, selectedProject]);

  // Étape 3: Experts de l'organisation
  const organizationExperts = useMemo(() => {
    return allExperts.filter(e => e.organizationId === CURRENT_ORG_ID);
  }, [allExperts]);

  // Réinitialiser les tâches sélectionnées quand le projet change
  useMemo(() => {
    if (selectedProject) {
      setSelectedTasks([]);
    }
  }, [selectedProject]);

  const steps = [
    { number: 1, title: t('projects.assign.step1') },
    { number: 2, title: t('projects.assign.step2') },
    { number: 3, title: t('projects.assign.step3') },
    { number: 4, title: t('projects.assign.step4') },
    { number: 5, title: t('projects.assign.step5') },
  ];

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!selectedProject) {
          toast.error(t('projects.assign.validation.project'));
          return false;
        }
        return true;
      case 2:
        if (selectedTasks.length === 0) {
          toast.error(t('projects.assign.validation.tasks'));
          return false;
        }
        return true;
      case 3:
        if (selectedExperts.length === 0) {
          toast.error(t('projects.assign.validation.experts'));
          return false;
        }
        return true;
      case 4:
        // Initialize assignments if not already done
        if (assignments.length === 0) {
          initializeAssignments();
        }
        
        // Validate all assignments
        for (const assignment of assignments) {
          if (!assignment.role.trim()) {
            toast.error(t('common.fillRequired'));
            return false;
          }
          if (!assignment.allocation || parseFloat(assignment.allocation) < 1 || parseFloat(assignment.allocation) > 100) {
            toast.error(t('projects.assign.validation.allocation'));
            return false;
          }
          if (!assignment.startDate || !assignment.endDate) {
            toast.error(t('common.fillRequired'));
            return false;
          }
          if (assignment.endDate <= assignment.startDate) {
            toast.error(t('projects.assign.validation.dates'));
            return false;
          }
          
          // Validation: les dates d'assignation doivent être dans l'intervalle de la tâche
          const task = getTaskById(assignment.taskId);
          if (task && task.startDate && task.dueDate) {
            const taskStart = new Date(task.startDate);
            const taskEnd = new Date(task.dueDate);
            const assignmentStart = new Date(assignment.startDate);
            const assignmentEnd = new Date(assignment.endDate);
            
            if (assignmentStart < taskStart || assignmentEnd > taskEnd) {
              toast.error(t('projects.assign.validation.taskDateRange'));
              return false;
            }
          }
          
          if (!assignment.responsibility) {
            toast.error(t('common.fillRequired'));
            return false;
          }
        }
        return true;
      default:
        return true;
    }
  };

  const initializeAssignments = () => {
    const newAssignments: Assignment[] = [];
    selectedTasks.forEach(taskId => {
      selectedExperts.forEach(expertId => {
        newAssignments.push({
          taskId,
          expertId,
          role: '',
          allocation: '100',
          startDate: '',
          endDate: '',
          responsibility: 'PRIMARY',
          notes: '',
        });
      });
    });
    setAssignments(newAssignments);
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 3) {
        initializeAssignments();
      }
      setCurrentStep(Math.min(currentStep + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const handleSubmit = () => {
    const count = assignments.length;
    const expertsCount = selectedExperts.length;
    toast.success(t('projects.assign.success'));
    navigate('/projects');
  };

  const toggleTaskSelection = (taskId: string) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    } else {
      setSelectedTasks([...selectedTasks, taskId]);
    }
  };

  const toggleExpertSelection = (expertId: string) => {
    if (selectedExperts.includes(expertId)) {
      setSelectedExperts(selectedExperts.filter(id => id !== expertId));
    } else {
      setSelectedExperts([...selectedExperts, expertId]);
    }
  };

  const updateAssignment = (taskId: string, expertId: string, field: string, value: string) => {
    setAssignments(assignments.map(a =>
      a.taskId === taskId && a.expertId === expertId
        ? { ...a, [field]: value }
        : a
    ));
  };

  const getTaskById = (taskId: string) => projectTasks.find(t => t.id === taskId);
  const getExpertById = (expertId: string) => organizationExperts.find(e => e.id === expertId);

  const filteredTasks = projectTasks.filter(task =>
    task.title.toLowerCase().includes(searchTasks.toLowerCase())
  );

  const filteredExperts = organizationExperts.filter(expert =>
    expert.name.toLowerCase().includes(searchExperts.toLowerCase()) ||
    expert.expertise.toLowerCase().includes(searchExperts.toLowerCase())
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="project">{t('projects.assign.selectProject')} *</Label>
              <p className="text-sm text-gray-500 mb-3">{t('projects.assign.projectDescription')}</p>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.select')} />
                </SelectTrigger>
                <SelectContent>
                  {organizationProjects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{project.name}</span>
                        <span className="text-xs text-gray-500">{project.code} • {t(`projects.status.${project.status}`)} • {project.managerName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProject && selectedProjectData && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-3">{t('projects.assign.projectInfo')}</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">{t('projects.assign.projectStatus')}:</span>
                    <p className="font-medium">{t(`projects.status.${selectedProjectData.status}`)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('projects.assign.projectBudget')}:</span>
                    <p className="font-medium">${(selectedProjectData.budget.total / 1000000).toFixed(1)}M {selectedProjectData.budget.currency}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('projects.assign.projectManager')}:</span>
                    <p className="font-medium">{selectedProjectData.managerName || selectedProjectData.leadOrganization}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('projects.details.tasks')}:</span>
                    <p className="font-medium">{projectTasks.length} tasks</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="grid gap-6">
            <div>
              <Label>{t('projects.assign.selectTasks')} *</Label>
              <p className="text-sm text-gray-500 mb-3">{t('projects.assign.tasksDescription')}</p>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchTasks}
                  onChange={(e) => setSearchTasks(e.target.value)}
                  placeholder={t('common.search')}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTaskSelection(task.id)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTasks.includes(task.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.id)}
                      onChange={() => toggleTaskSelection(task.id)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-primary">{task.title}</h4>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>
                          {t('projects.assign.taskStatus')}: <strong>{t(`projects.tasks.status.${task.status}`)}</strong>
                        </span>
                        <span>
                          {t('projects.assign.taskPriority')}: <strong>{t(`projects.priority.${task.priority}`)}</strong>
                        </span>
                        <span>
                          {t('projects.assign.taskDueDate')}: <strong>{task.dueDate}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedTasks.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  <strong>{selectedTasks.length}</strong> {t('projects.assign.selectedTasks')}
                </p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="grid gap-6">
            <div>
              <Label>{t('projects.assign.selectExperts')} *</Label>
              <p className="text-sm text-gray-500 mb-3">{t('projects.assign.expertsDescription')}</p>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchExperts}
                  onChange={(e) => setSearchExperts(e.target.value)}
                  placeholder={t('projects.assign.searchExperts')}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
              {filteredExperts.map((expert) => (
                <div
                  key={expert.id}
                  onClick={() => toggleExpertSelection(expert.id)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedExperts.includes(expert.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedExperts.includes(expert.id)}
                      onChange={() => toggleExpertSelection(expert.id)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-primary">{expert.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{expert.expertise}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>
                          {t('projects.assign.expertAvailability')}: <strong>{expert.availability}</strong>
                        </span>
                        <span>
                          {t('projects.assign.expertRate')}: <strong>{expert.rate}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedExperts.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  <strong>{selectedExperts.length}</strong> {t('projects.assign.selectedExperts')}
                </p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="grid gap-6">
            <div>
              <Label>{t('projects.assign.assignmentDetails')}</Label>
              <p className="text-sm text-gray-500 mb-3">{t('projects.assign.detailsDescription')}</p>
            </div>

            <div className="space-y-6">
              {assignments.map((assignment, index) => {
                const task = getTaskById(assignment.taskId);
                const expert = getExpertById(assignment.expertId);
                if (!task || !expert) return null;

                return (
                  <div key={`${assignment.taskId}-${assignment.expertId}`} className="border border-gray-200 rounded-lg p-4">
                    <div className="bg-gray-50 rounded-md p-3 mb-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">{t('projects.assign.task')}:</span>
                          <p className="font-medium text-primary">{task.title}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('projects.assign.expert')}:</span>
                          <p className="font-medium text-primary">{expert.name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('projects.assign.role')} *</Label>
                        <Input
                          value={assignment.role}
                          onChange={(e) => updateAssignment(assignment.taskId, assignment.expertId, 'role', e.target.value)}
                          placeholder={t('projects.assign.role')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('projects.assign.allocation')} *</Label>
                        <Input
                          type="number"
                          value={assignment.allocation}
                          onChange={(e) => updateAssignment(assignment.taskId, assignment.expertId, 'allocation', e.target.value)}
                          placeholder="0-100"
                          min="1"
                          max="100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('projects.assign.startDate')} *</Label>
                        <Input
                          type="date"
                          value={assignment.startDate}
                          onChange={(e) => updateAssignment(assignment.taskId, assignment.expertId, 'startDate', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('projects.assign.endDate')} *</Label>
                        <Input
                          type="date"
                          value={assignment.endDate}
                          onChange={(e) => updateAssignment(assignment.taskId, assignment.expertId, 'endDate', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>{t('projects.assign.responsibility')} *</Label>
                        <Select
                          value={assignment.responsibility}
                          onValueChange={(value) => updateAssignment(assignment.taskId, assignment.expertId, 'responsibility', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('common.select')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PRIMARY">{t('projects.assign.responsibility.PRIMARY')}</SelectItem>
                            <SelectItem value="SECONDARY">{t('projects.assign.responsibility.SECONDARY')}</SelectItem>
                            <SelectItem value="REVIEWER">{t('projects.assign.responsibility.REVIEWER')}</SelectItem>
                            <SelectItem value="ADVISOR">{t('projects.assign.responsibility.ADVISOR')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>{t('projects.assign.notes')}</Label>
                        <Textarea
                          value={assignment.notes}
                          onChange={(e) => updateAssignment(assignment.taskId, assignment.expertId, 'notes', e.target.value)}
                          placeholder={t('projects.assign.notes')}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-primary">{t('projects.assign.reviewTitle')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('projects.assign.reviewSubtitle')}</p>
            </div>

            {/* Project Info */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-3">{t('projects.assign.projectInfo')}</h4>
              <div className="text-sm">
                <p className="font-medium">{selectedProjectData?.name}</p>
                <p className="text-gray-600 mt-1">{selectedProjectData?.code} • {t(`projects.status.${selectedProjectData?.status}`)}</p>
              </div>
            </div>

            {/* Tasks Summary */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-3">{t('projects.assign.tasksToAssign')}</h4>
              <div className="space-y-2 text-sm">
                {selectedTasks.map(taskId => {
                  const task = getTaskById(taskId);
                  if (!task) return null;
                  return (
                    <div key={taskId} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="font-medium">{task.title}</span>
                      <span className="text-gray-500">{t(`projects.priority.${task.priority}`)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Experts Summary */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-3">{t('projects.assign.expertsToAssign')}</h4>
              <div className="space-y-2 text-sm">
                {selectedExperts.map(expertId => {
                  const expert = getExpertById(expertId);
                  if (!expert) return null;
                  return (
                    <div key={expertId} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium">{expert.name}</p>
                        <p className="text-gray-500">{expert.expertise}</p>
                      </div>
                      <span className="text-gray-500">{expert.availability}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assignment Summary */}
            <div className="border border-gray-200 rounded-lg p-4 bg-primary/5">
              <h4 className="font-semibold text-primary mb-3">{t('projects.assign.assignmentSummary')}</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">{t('projects.assign.totalAssignments')}:</span>
                  <p className="text-lg font-bold text-primary">{assignments.length}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.assign.tasksToAssign')}:</span>
                  <p className="text-lg font-bold text-primary">{selectedTasks.length}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.assign.expertsToAssign')}:</span>
                  <p className="text-lg font-bold text-primary">{selectedExperts.length}</p>
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
        title={t('projects.actions.assignTasks')}
        description={t('projects.actions.assignTasksDescription')}
        icon={UserPlus}
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
                  {t('projects.assign.previous')}
                </Button>
              )}
              {currentStep < totalSteps ? (
                <Button onClick={handleNext} className="bg-[#B82547] hover:bg-[#a01f3c]">
                  {t('projects.assign.next')}
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                  {t('projects.assign.confirm')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}