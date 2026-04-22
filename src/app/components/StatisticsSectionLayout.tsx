import React, { ReactNode } from 'react';
import { LucideIcon, Lock } from 'lucide-react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { hasStatisticsAccess, isExpertAccountType } from '@app/services/permissions.service';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { StatisticsSubMenu } from '@app/components/StatisticsSubMenu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card';

interface StatisticsSectionLayoutProps {
  icon: LucideIcon;
  stats?: Array<{ value: string | number; label: string }>;
  children: ReactNode;
}

export function StatisticsSectionLayout({ icon, stats = [], children }: StatisticsSectionLayoutProps) {
  const { t } = useLanguage();
  const { user } = useAuth();

  const hasAccess = hasStatisticsAccess(user?.accountType);
  const isExpert = isExpertAccountType(user?.accountType);

  const heroSubtitle = isExpert ? t('statistics.hero.subtitle.expert') : t('statistics.hero.subtitle');

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('statistics.hero.title')}
        description={heroSubtitle}
        icon={icon}
        stats={hasAccess ? stats : []}
      />

      <StatisticsSubMenu />

      {!hasAccess ? (
        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Lock className="w-5 h-5" />
                  {t('statistics.accessDenied.title')}
                </CardTitle>
                <CardDescription>{t('statistics.accessDenied.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{t('statistics.accessDenied.hint')}</p>
              </CardContent>
            </Card>
          </div>
        </PageContainer>
      ) : (
        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-6">{children}</div>
        </PageContainer>
      )}
    </div>
  );
}
