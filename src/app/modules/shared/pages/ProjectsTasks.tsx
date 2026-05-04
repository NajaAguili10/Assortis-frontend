import { useState } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ProjectsSubMenu } from '@app/components/ProjectsSubMenu';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Input } from '@app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { useProjects } from '@app/hooks/useProjects';
import { ProjectPriorityEnum } from '@app/types/project.dto';
import {
  Briefcase,
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Handshake,
  FileType,
  Clock,
  Calendar,
  Search,
  Users,
  AlertCircle,
  CheckCircle2,
  FileText,
  Plus,
} from 'lucide-react';

export default function ProjectsTasks() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { tasks, kpis } = useProjects();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'REVIEW':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'COMPLETED':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return '';
    }
  };

  const getPriorityColor = (priority: ProjectPriorityEnum) => {
    switch (priority) {
      case ProjectPriorityEnum.LOW:
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case ProjectPriorityEnum.MEDIUM:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case ProjectPriorityEnum.HIGH:
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case ProjectPriorityEnum.URGENT:
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return '';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const statusCounts = {
    all: tasks.length,
    TODO: tasks.filter(t => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    REVIEW: tasks.filter(t => t.status === 'REVIEW').length,
    COMPLETED: tasks.filter(t => t.status === 'COMPLETED').length,
  };

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('projects.hub.title')}
        description={t('projects.hub.subtitle')}
        icon={Briefcase}
        stats={[
          { value: kpis.activeProjects.toString(), label: t('projects.stats.activeProjects') }
        ]}
      />

      {/* Sub Menu */}
      <ProjectsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-primary mb-2">{t('projects.tasks.title')}</h2>
              <p className="text-muted-foreground">{t('projects.tasks.subtitle')}</p>
            </div>
            <Button onClick={() => navigate('/projects/tasks/new')} className="h-11 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t('projects.actions.newTask')}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{t('projects.tasks.status.TODO')}</span>
                <CheckSquare className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-2xl font-bold text-primary">{statusCounts.TODO}</p>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{t('projects.tasks.status.IN_PROGRESS')}</span>
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-primary">{statusCounts.IN_PROGRESS}</p>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{t('projects.tasks.status.REVIEW')}</span>
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-primary">{statusCounts.REVIEW}</p>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{t('projects.tasks.status.COMPLETED')}</span>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-primary">{statusCounts.COMPLETED}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex gap-2 flex-1 w-full sm:max-w-md">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('projects.filters.search')}
                  className="flex-1"
                />
                <Button size="icon">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('projects.filters.status')}: {t('projects.filters.all')} ({statusCounts.all})</SelectItem>
                  <SelectItem value="TODO">{t('projects.tasks.status.TODO')} ({statusCounts.TODO})</SelectItem>
                  <SelectItem value="IN_PROGRESS">{t('projects.tasks.status.IN_PROGRESS')} ({statusCounts.IN_PROGRESS})</SelectItem>
                  <SelectItem value="REVIEW">{t('projects.tasks.status.REVIEW')} ({statusCounts.REVIEW})</SelectItem>
                  <SelectItem value="COMPLETED">{t('projects.tasks.status.COMPLETED')} ({statusCounts.COMPLETED})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <div key={task.id} className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckSquare className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-primary mb-1">{task.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                          <p className="text-xs text-muted-foreground">{task.projectTitle}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 ml-4">
                          <Badge variant="outline" className={getStatusColor(task.status)}>
                            {t(`projects.tasks.status.${task.status}`)}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {t(`projects.priority.${task.priority}`)}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {t('projects.tasks.assignedTo')}: {task.assignedTo.map((a) => a.name).join(', ')}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {t('projects.tasks.startDate')}: {new Date(task.startDate).toLocaleDateString()}
                        </span>
                        <span className={`flex items-center gap-1 ${isOverdue(task.dueDate) && task.status !== 'COMPLETED' ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>
                          <Calendar className="w-4 h-4" />
                          {t('projects.tasks.dueDate')}: {new Date(task.dueDate).toLocaleDateString()}
                          {isOverdue(task.dueDate) && task.status !== 'COMPLETED' && (
                            <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">
                              {t('projects.tasks.overdue')}
                            </Badge>
                          )}
                        </span>
                      </div>

                      {task.tags.length > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                          {task.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border">
                <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-primary mb-1">{t('projects.list.noResults')}</h3>
                <p className="text-sm text-muted-foreground">{t('projects.list.noResults.message')}</p>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}