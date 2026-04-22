import { useLanguage } from '@app/contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { SubMenu } from '@app/components/SubMenu';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Progress } from '@app/components/ui/progress';
import { useAssistance } from '@app/hooks/useAssistance';
import { AssistanceStatusEnum } from '@app/types/assistance.dto';
import {
  Headphones,
  LayoutDashboard,
  Search,
  FileText,
  Handshake,
  BookOpen,
  Building2,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Package,
} from 'lucide-react';

export default function AssistanceCollaborations() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { collaborations, kpis } = useAssistance();

  const getStatusColor = (status: AssistanceStatusEnum) => {
    switch (status) {
      case AssistanceStatusEnum.PENDING:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case AssistanceStatusEnum.IN_PROGRESS:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case AssistanceStatusEnum.COMPLETED:
        return 'bg-green-50 text-green-700 border-green-200';
      case AssistanceStatusEnum.CANCELLED:
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return '';
    }
  };

  const getDeliverableColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DELIVERED':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return '';
    }
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
      <SubMenu
        items={[
          { label: t('assistance.submenu.findExpert'), icon: Search, onClick: () => navigate('/assistance/find-expert') },
          { label: t('assistance.submenu.request'), icon: FileText, onClick: () => navigate('/assistance/request') },
          { label: t('assistance.submenu.collaborations'), active: true, icon: Handshake },
          { label: t('assistance.submenu.history'), icon: Clock, onClick: () => navigate('/assistance/history') },
        ]}
      />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">{t('assistance.collaborations.title')}</h2>
            <p className="text-muted-foreground">{t('assistance.collaborations.subtitle')}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{t('assistance.status.IN_PROGRESS')}</span>
                <Handshake className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-primary">
                {collaborations.filter(c => c.status === AssistanceStatusEnum.IN_PROGRESS).length}
              </p>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{t('assistance.status.COMPLETED')}</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-primary">
                {collaborations.filter(c => c.status === AssistanceStatusEnum.COMPLETED).length}
              </p>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{t('common.total')}</span>
                <Handshake className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-primary">{collaborations.length}</p>
            </div>
          </div>

          {/* Collaborations List */}
          {collaborations.length > 0 ? (
            <div className="space-y-6">
              {collaborations.map((collab) => (
                <div key={collab.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Handshake className="w-6 h-6 text-pink-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-primary mb-1">{collab.requestTitle}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              <Building2 className="w-4 h-4 inline mr-1" />
                              {t('assistance.collaborations.expert')}: {collab.expertName} - {collab.expertOrganization}
                            </p>
                          </div>
                          <Badge variant="outline" className={getStatusColor(collab.status)}>
                            {t(`assistance.status.${collab.status}`)}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Badge variant="secondary">{t(`assistance.type.${collab.type}`)}</Badge>
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(collab.startDate).toLocaleDateString()}
                            {collab.endDate && ` - ${new Date(collab.endDate).toLocaleDateString()}`}
                          </span>
                        </div>

                        {/* Progress */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              {t('assistance.collaborations.progress')}
                            </span>
                            <span className="text-sm font-semibold text-primary">{collab.progress}%</span>
                          </div>
                          <Progress value={collab.progress} className="h-2" />
                        </div>

                        {/* Budget */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {t('assistance.collaborations.budget')}
                            </span>
                            <span className="text-sm font-semibold text-primary">
                              ${collab.budget.spent.toLocaleString()} / ${collab.budget.total.toLocaleString()}
                            </span>
                          </div>
                          <Progress value={(collab.budget.spent / collab.budget.total) * 100} className="h-2" />
                        </div>

                        {/* Deliverables */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {t('assistance.collaborations.deliverables')}
                          </h4>
                          <div className="space-y-2">
                            {collab.deliverables.map((deliverable, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3 flex-1">
                                  <span className="text-sm font-medium">{deliverable.title}</span>
                                  <Badge variant="outline" className={getDeliverableColor(deliverable.status)} size="sm">
                                    {deliverable.status}
                                  </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(deliverable.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm">
                      {t('actions.viewDetails')}
                    </Button>
                    <Button variant="default" size="sm">
                      {t('assistance.actions.contactExpert')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Handshake className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-primary mb-1">{t('assistance.collaborations.noResults')}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t('assistance.collaborations.noResults.message')}</p>
              <Button onClick={() => navigate('/assistance/find-expert')}>
                {t('assistance.actions.findExpert')}
              </Button>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}