import {
  Activity,
  Download,
  Eye,
  Gauge,
  FileCheck2,
  Bell,
  Radio,
} from 'lucide-react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ExpertMyCVSubMenu } from '@app/components/ExpertMyCVSubMenu';
import { AccessDenied } from '@app/components/AccessDenied';
import { StatCard } from '@app/components/StatCard';
import { Badge } from '@app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import { Label } from '@app/components/ui/label';
import { Switch } from '@app/components/ui/switch';
import { hasExpertMyCVAccess } from '@app/services/permissions.service';
import { useMyCV } from '@app/modules/expert/hooks/useMyCV';

const activityTypeKey = {
  view: 'mycv.activity.view',
  download: 'mycv.activity.download',
} as const;

export default function ExpertMyCVDashboard() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const hasAccess = hasExpertMyCVAccess(user?.accountType);
  const {
    isReady,
    dashboard,
    toggleVisibility,
    toggleMatching,
    toggleBroadcasting,
    toggleDownloadNotification,
  } = useMyCV();

  const statusVariant =
    dashboard.status.validationStatus === 'validated'
      ? 'bg-emerald-100 text-emerald-700'
      : dashboard.status.validationStatus === 'rejected'
      ? 'bg-red-100 text-red-700'
      : 'bg-amber-100 text-amber-700';

  const statusLabelKey =
    dashboard.status.validationStatus === 'validated'
      ? 'mycv.status.validated'
      : dashboard.status.validationStatus === 'rejected'
      ? 'mycv.status.rejected'
      : 'mycv.status.pending';

  if (!hasAccess) {
    return (
      <div className="min-h-screen">
        <PageBanner
          title={t('mycv.banner.title')}
          description={t('mycv.banner.description')}
          icon={FileCheck2}
        />
        <ExpertMyCVSubMenu />
        <AccessDenied module="experts" accountType={user?.accountType} />
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="min-h-screen">
        <PageBanner
          title={t('mycv.banner.title')}
          description={t('mycv.banner.description')}
          icon={FileCheck2}
        />
        <ExpertMyCVSubMenu />
        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`my-cv-kpi-skeleton-${index}`}
                  className="h-36 rounded-lg border border-gray-200 bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('mycv.banner.title')}
        description={t('mycv.banner.description')}
        icon={FileCheck2}
        stats={[
          { value: dashboard.kpis.views, label: t('mycv.kpi.views') },
          { value: dashboard.kpis.downloads, label: t('mycv.kpi.downloads') },
          {
            value: `${dashboard.kpis.relevanceScore}%`,
            label: t('mycv.kpi.relevanceScore'),
          },
        ]}
      />

      <ExpertMyCVSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <StatCard
              title={t('mycv.kpi.views')}
              value={dashboard.kpis.views}
              icon={Eye}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-600"
            />
            <StatCard
              title={t('mycv.kpi.downloads')}
              value={dashboard.kpis.downloads}
              icon={Download}
              iconBgColor="bg-violet-50"
              iconColor="text-violet-600"
            />
            <StatCard
              title={t('mycv.kpi.relevanceScore')}
              value={`${dashboard.kpis.relevanceScore}%`}
              icon={Gauge}
              iconBgColor="bg-emerald-50"
              iconColor="text-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Activity className="h-5 w-5" />
                  {t('mycv.dashboard.recentActivity')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboard.recentActivity.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-3 flex items-start justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.organizationName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t(activityTypeKey[item.type])}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(item.happenedAt).toLocaleDateString(language)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-primary">{t('mycv.dashboard.status')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-gray-600">{t('mycv.dashboard.lastUpdated')}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(dashboard.status.lastUpdatedAt).toLocaleDateString(language)}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-gray-600">{t('mycv.dashboard.validationStatus')}</p>
                  <Badge className={statusVariant}>{t(statusLabelKey)}</Badge>
                </div>

                <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                  {t('mycv.dashboard.broadcastHint')}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">{t('mycv.dashboard.visibilityControls')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label htmlFor="cv-visibility" className="text-sm font-medium text-gray-900">
                      {t('mycv.controls.visibility')}
                    </Label>
                    <p className="text-xs text-gray-500">{t('mycv.controls.visibilityHelp')}</p>
                  </div>
                  <Switch
                    id="cv-visibility"
                    checked={dashboard.preferences.isVisible}
                    onCheckedChange={toggleVisibility}
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label htmlFor="matching-enabled" className="text-sm font-medium text-gray-900">
                      {t('mycv.controls.matching')}
                    </Label>
                    <p className="text-xs text-gray-500">{t('mycv.controls.matchingHelp')}</p>
                  </div>
                  <Switch
                    id="matching-enabled"
                    checked={dashboard.preferences.matchingEnabled}
                    onCheckedChange={toggleMatching}
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label htmlFor="broadcast-enabled" className="text-sm font-medium text-gray-900">
                      {t('mycv.controls.broadcasting')}
                    </Label>
                    <p className="text-xs text-gray-500">{t('mycv.controls.broadcastingHelp')}</p>
                  </div>
                  <Switch
                    id="broadcast-enabled"
                    checked={dashboard.preferences.broadcastEnabled}
                    onCheckedChange={toggleBroadcasting}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Bell className="h-5 w-5" />
                  {t('mycv.dashboard.notifications')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label htmlFor="notify-download" className="text-sm font-medium text-gray-900">
                      {t('mycv.controls.notifyOnDownload')}
                    </Label>
                    <p className="text-xs text-gray-500">{t('mycv.controls.notifyOnDownloadHelp')}</p>
                  </div>
                  <Switch
                    id="notify-download"
                    checked={dashboard.preferences.notifyOnDownload}
                    onCheckedChange={toggleDownloadNotification}
                  />
                </div>

                <div className="rounded-lg border border-dashed border-gray-300 p-3">
                  <p className="text-sm font-medium text-primary mb-2">
                    {t('mycv.dashboard.organizationsViewed')}
                  </p>
                  <div className="space-y-2">
                    {dashboard.organizationsWhoViewed.slice(0, 4).map((org) => (
                      <div key={org} className="text-sm text-gray-600 flex items-center gap-2">
                        <Radio className="h-4 w-4 text-accent" />
                        <span>{org}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
