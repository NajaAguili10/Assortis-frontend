import { useMemo, useState } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { useNavigate } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ProjectsSubMenu } from '@app/components/ProjectsSubMenu';
import { StatCard } from '@app/components/StatCard';
import { ActionCard } from '@app/components/ActionCard';
import { FeatureCard } from '@app/components/FeatureCard';
import { AccessDenied } from '@app/components/AccessDenied';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { useProjects } from '@app/hooks/useProjects';
import { canManageOrganizationAdminActions, hasProjectsAccess } from '@app/services/permissions.service';
import { ProjectStatusEnum } from '@app/types/project.dto';
import {
  Briefcase,
  CheckSquare,
  Clock,
  DollarSign,
  Search,
  Plus,
  ListChecks,
  UserPlus,
  Building2,
  Star,
  Eye,
  Pencil,
  RotateCcw,
  Trash2,
} from 'lucide-react';

type CreatedProjectsTab = 'open' | 'past' | 'deleted';

export default function Projects() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { kpis, allProjects } = useProjects();
  
  // V�rifier les permissions d'acc�s
  const hasAccess = hasProjectsAccess(user?.accountType);
  const canManageProjectActions = canManageOrganizationAdminActions(user?.accountType, user?.role);
  const restrictedActionMessage = t('permissions.organization.adminOnlyAction');
  
  // V�rifier si l'utilisateur est un expert (pas organization)
  const isExpertOnly = user?.accountType === 'expert';
  const [activeCreatedProjectsTab, setActiveCreatedProjectsTab] = useState<CreatedProjectsTab>('open');
  const [deletedCreatedProjectIds, setDeletedCreatedProjectIds] = useState<Set<string>>(new Set());
  const userCreatedProjects = allProjects.filter((project) => project.id.startsWith('proj-'));
  const now = Date.now();

  const formatProjectDate = (value: string) => new Date(value).toLocaleDateString(
    language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-GB',
    { day: '2-digit', month: 'short', year: 'numeric' }
  );

  const formatProjectBudget = (amount: number, currency: string) => new Intl.NumberFormat(
    language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-GB',
    { style: 'currency', currency, maximumFractionDigits: 0 }
  ).format(amount);

  const formatEnumLabel = (value: string) => value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  const getProjectCountries = (project: (typeof userCreatedProjects)[number]) => {
    const extendedProject = project as typeof project & { countries?: string[] };
    return extendedProject.countries && extendedProject.countries.length > 0
      ? extendedProject.countries
      : [project.country];
  };

  const getProjectScope = (project: (typeof userCreatedProjects)[number]) => {
    const extendedProject = project as typeof project & { scope?: 'LOCAL' | 'NATIONAL' | 'REGIONAL' | 'INTERNATIONAL' };
    return extendedProject.scope || 'REGIONAL';
  };

  const isPastCreatedProject = (project: (typeof userCreatedProjects)[number]) => {
    if ([ProjectStatusEnum.COMPLETED, ProjectStatusEnum.CANCELLED, ProjectStatusEnum.ARCHIVED].includes(project.status)) {
      return true;
    }

    const endDate = new Date(project.timeline.endDate).getTime();
    return Number.isFinite(endDate) && endDate < now;
  };

  const createdProjectsByTab = useMemo(() => {
    const open = userCreatedProjects.filter((project) => !isPastCreatedProject(project) && !deletedCreatedProjectIds.has(project.id));
    const past = userCreatedProjects.filter((project) => isPastCreatedProject(project) && !deletedCreatedProjectIds.has(project.id));
    const deleted = userCreatedProjects.filter((project) => deletedCreatedProjectIds.has(project.id));

    return { open, past, deleted };
  }, [deletedCreatedProjectIds, userCreatedProjects]);

  const activeCreatedProjects = useMemo(() => {
    if (activeCreatedProjectsTab === 'open') return createdProjectsByTab.open;
    if (activeCreatedProjectsTab === 'past') return createdProjectsByTab.past;
    return createdProjectsByTab.deleted;
  }, [activeCreatedProjectsTab, createdProjectsByTab]);

  const handleDeleteCreatedProject = (id: string) => {
    setDeletedCreatedProjectIds((prev) => new Set(prev).add(id));
  };

  const handleRestoreCreatedProject = (id: string) => {
    setDeletedCreatedProjectIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };
  
  // D�finir les sous-menus et leurs descriptions pour la page d'acc�s refus�
  const subMenuItems = [
    {
      label: t('projects.submenu.active'),
      description: t('permissions.projects.features.active.description')
    },
    {
      label: t('projects.submenu.myTasks'),
      description: t('permissions.projects.features.myTasks.description')
    },
    {
      label: t('projects.submenu.collaborations'),
      description: t('permissions.projects.features.collaborations.description')
    }
  ];

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('projects.hub.title')}
        description={t('projects.hub.subtitle')}
        icon={Briefcase}
        stats={hasAccess ? [
          { value: kpis.activeProjects.toString(), label: t('projects.stats.activeProjects') }
        ] : []}
      />

      {/* Sub Menu */}
      <ProjectsSubMenu />

      {/* Contenu selon les permissions */}
      {!hasAccess ? (
        <AccessDenied 
          module="projects" 
          accountType={user?.accountType}
          subMenuItems={subMenuItems}
        />
      ) : (
        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              <StatCard
                title={t('projects.stats.activeProjects')}
                value={kpis.activeProjects.toString()}
                trend="+8%"
                icon={Briefcase}
                iconBgColor="bg-blue-50"
                iconColor="text-blue-500"
              />
              <StatCard
                title={t('projects.stats.completedProjects')}
                value={kpis.completedProjects.toString()}
                subtitle={t('projects.stats.thisYear')}
                icon={CheckSquare}
                iconBgColor="bg-green-50"
                iconColor="text-green-500"
              />
              <StatCard
                title={t('projects.stats.inProgress')}
                value={kpis.totalProjects.toString()}
                badge={`${kpis.urgentProjects} ${t('projects.stats.urgentProjects')}`}
                icon={Clock}
                iconBgColor="bg-orange-50"
                iconColor="text-orange-500"
              />
              <StatCard
                title={t('projects.stats.totalBudget')}
                value={`$${(kpis.totalBudget / 1000000).toFixed(1)}M`}
                subtitle={`${kpis.totalProjects} ${t('projects.stats.activeProjects')}`}
                icon={DollarSign}
                iconBgColor="bg-cyan-50"
                iconColor="text-cyan-500"
              />
            </div>

            {/* Quick Actions - NON visible pour Expert uniquement */}
            {!isExpertOnly && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-primary mb-4">{t('actions.quick')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ActionCard
                    title={t('projects.actions.newProject')}
                    icon={Plus}
                    onClick={() => navigate('/projects/new')}
                    disabled={!canManageProjectActions}
                    disabledMessage={restrictedActionMessage}
                  />
                  <ActionCard
                    title={t('projects.actions.newTask')}
                    icon={ListChecks}
                    onClick={() => navigate('/projects/tasks/new')}
                    disabled={!canManageProjectActions}
                    disabledMessage={restrictedActionMessage}
                  />
                  <ActionCard
                    title={t('projects.actions.assignTasks')}
                    icon={UserPlus}
                    onClick={() => navigate('/projects/tasks/assign')}
                    disabled={!canManageProjectActions}
                    disabledMessage={restrictedActionMessage}
                  />
                </div>
              </div>
            )}

            {/* Created Projects */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-primary mb-4">{t('projects.created.title')}</h2>

              {/* Tabs */}
              <div className="mb-4 flex items-center gap-1 rounded-xl bg-slate-100 p-1 w-fit">
                {(['open', 'past', 'deleted'] as CreatedProjectsTab[]).map((tabId) => {
                  const tabLabels: Record<CreatedProjectsTab, string> = {
                    open: t('projects.active.tabs.open'),
                    past: t('projects.active.tabs.past'),
                    deleted: t('projects.active.tabs.deleted'),
                  };
                  return (
                    <Button
                      key={tabId}
                      variant="ghost"
                      className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold transition-all ${
                        activeCreatedProjectsTab === tabId
                          ? 'bg-white text-accent shadow-sm hover:bg-white hover:text-accent'
                          : 'bg-transparent text-slate-700 hover:bg-accent hover:text-white'
                      }`}
                      onClick={() => setActiveCreatedProjectsTab(tabId)}
                    >
                      {tabLabels[tabId]}
                      <Badge
                        variant="secondary"
                        className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${
                          activeCreatedProjectsTab === tabId
                            ? 'bg-accent/10 text-accent'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {createdProjectsByTab[tabId].length}
                      </Badge>
                    </Button>
                  );
                })}
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <div className="min-w-[920px]">
                    <div className="grid grid-cols-[2.2fr_1.2fr_1.3fr_1fr_0.95fr_0.95fr_1.1fr] items-center gap-2 border-b border-gray-200 bg-gray-50/80 px-5 py-3.5 text-xs font-semibold tracking-wide text-gray-600">
                      <div>{t('activeTenders.table.projectTitle')}</div>
                      <div>{t('activeTenders.table.location')}</div>
                      <div>{t('projects.create.leadOrganization')}</div>
                      <div>{t('activeTenders.table.budget')}</div>
                      <div>{t('activeTenders.table.published')}</div>
                      <div>{t('activeTenders.table.deadline')}</div>
                      <div>{t('activeTenders.table.actions')}</div>
                    </div>

                    {activeCreatedProjects.length === 0 ? (
                      <div className="p-10 text-center text-gray-500">
                        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                          <Search className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="mb-1 font-medium text-gray-700">{t('projects.created.emptyTitle')}</p>
                        <p className="text-sm">{t('projects.created.emptyDescription')}</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {activeCreatedProjects.map((project, rowIndex) => {
                          const countries = getProjectCountries(project);
                          const location = countries.join(', ');

                          return (
                            <div
                              key={project.id}
                              className={`px-5 py-4 transition-colors ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-gray-50/80`}
                            >
                              <div className="grid grid-cols-[2.2fr_1.2fr_1.3fr_1fr_0.95fr_0.95fr_1.1fr] items-center gap-2 text-sm">
                                <div className="pr-1 font-semibold leading-snug text-gray-900">{project.title}</div>
                                <div className="leading-snug text-gray-700">{location}</div>
                                <div className="leading-snug text-gray-700">{project.leadOrganization}</div>
                                <div className="font-medium text-gray-700">{formatProjectBudget(project.budget.total, project.budget.currency)}</div>
                                <div className="text-gray-700">{formatProjectDate(project.createdDate)}</div>
                                <div className="text-gray-700">{formatProjectDate(project.timeline.endDate)}</div>
                                <div className="flex flex-wrap gap-2">
                                  {activeCreatedProjectsTab !== 'deleted' && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="min-h-10 w-10 border-gray-300 p-0"
                                        aria-label={t('projects.actions.viewDetails')}
                                        onClick={() => navigate(`/projects/${project.id}`, { state: { fromMyProjects: true, accessSource: 'my-projects' } })}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="min-h-10 w-10 border-gray-300 p-0"
                                        aria-label={t('projects.actions.editProject')}
                                        onClick={() => navigate(`/projects/${project.id}/edit`)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="min-h-10 w-10 border-gray-300 p-0"
                                        aria-label={t('activeTenders.button.discard')}
                                        onClick={() => handleDeleteCreatedProject(project.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                  {activeCreatedProjectsTab === 'deleted' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="min-h-10 w-10 border-gray-300 p-0"
                                      aria-label={t('activeTenders.button.restore')}
                                      onClick={() => handleRestoreCreatedProject(project.id)}
                                    >
                                      <RotateCcw className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>

                              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge variant="secondary" className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
                                    {formatEnumLabel(project.type)}
                                  </Badge>
                                  <Badge variant="secondary" className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                                    {t(`projects.priority.${project.priority}`)}
                                  </Badge>
                                  <Badge variant="secondary" className="rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 font-medium text-violet-700">
                                    {t(`projects.create.scope.${getProjectScope(project)}`)}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1">
                                    <span className="text-[11px] font-medium text-amber-700">{t('projects.stats.inProgress')}</span>
                                    <span className="text-xs font-semibold text-amber-900">{project.tasksCompleted}/{project.totalTasks}</span>
                                  </div>
                                  <div className="inline-flex items-center gap-2 rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1">
                                    <span className="text-[11px] font-medium text-sky-700">{t('projects.stats.averageCompletion')}</span>
                                    <span className="text-xs font-semibold text-sky-900">{project.timeline.completionPercentage}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Cards - 3 per row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Contractors - visible pour expert uniquement */}
              {isExpertOnly && (
                <FeatureCard
                  title={t('projects.submenu.contractors')}
                  description={t('projects.contractors.subtitle')}
                  icon={Building2}
                  iconBgColor="bg-indigo-50"
                  iconColor="text-indigo-500"
                  link="/projects/contractors"
                />
              )}

              {/* Organizations Scoring - visible pour expert uniquement */}
              {isExpertOnly && (
                <FeatureCard
                  title={t('projects.submenu.organizationsScoring')}
                  description={t('projects.scoring.subtitle')}
                  icon={Star}
                  iconBgColor="bg-yellow-50"
                  iconColor="text-yellow-600"
                  link="/projects/organizations-scoring"
                />
              )}

            </div>
          </div>
        </PageContainer>
      )}
    </div>
  );
}