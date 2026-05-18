import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TenderFeatureCard } from '@app/components/TenderFeatureCard';
import { StatCard } from '@app/components/StatCard';
import { Separator } from '@app/components/ui/separator';
import {
  LayoutDashboard,
  Sparkles,
  FolderOpen,
  Search,
  BarChart2,
  GraduationCap,
  FileUser,
} from 'lucide-react';

export default function ExpertDashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();

  const initials = `${(user?.firstName ?? 'E')[0]}${(user?.lastName ?? '')[0] ?? ''}`.toUpperCase();

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('expert.dashboard.banner.title')}
        description={t('expert.dashboard.banner.subtitle')}
        icon={LayoutDashboard}
        stats={[
          { value: initials, label: user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : '' },
        ]}
      />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">

          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title={t('projects.stats.activeProjects')}
              value="5"
              icon={FolderOpen}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
            />
            <StatCard
              title={t('experts.stats.activeMissions')}
              value="3"
              icon={Sparkles}
              iconBgColor="bg-violet-50"
              iconColor="text-violet-500"
            />
            <StatCard
              title={t('experts.stats.profileCompleteness')}
              value="87%"
              icon={FileUser}
              iconBgColor="bg-amber-50"
              iconColor="text-amber-500"
            />
            <StatCard
              title={t('experts.stats.matchingRate')}
              value="92%"
              icon={BarChart2}
              iconBgColor="bg-emerald-50"
              iconColor="text-emerald-500"
            />
          </div>

          <Separator className="my-6" />

          {/* Feature cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TenderFeatureCard
              titleKey={t('expert.dashboard.card.matching.title')}
              descriptionKey={t('expert.dashboard.card.matching.description')}
              icon={Sparkles}
              iconBgColor="bg-violet-50"
              iconColor="text-violet-500"
              link="/matching-opportunities/home"
              useDirect
            />

            <TenderFeatureCard
              titleKey={t('expert.dashboard.card.projects.title')}
              descriptionKey={t('expert.dashboard.card.projects.description')}
              icon={FolderOpen}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
              link="/projects"
              useDirect
            />

            <TenderFeatureCard
              titleKey={t('expert.dashboard.card.search.title')}
              descriptionKey={t('expert.dashboard.card.search.description')}
              icon={Search}
              iconBgColor="bg-cyan-50"
              iconColor="text-cyan-500"
              link="/experts/database"
              useDirect
            />

            <TenderFeatureCard
              titleKey={t('expert.dashboard.card.stats.title')}
              descriptionKey={t('expert.dashboard.card.stats.description')}
              icon={BarChart2}
              iconBgColor="bg-emerald-50"
              iconColor="text-emerald-500"
              link="/statistics/overview"
              useDirect
            />

            <TenderFeatureCard
              titleKey={t('expert.dashboard.card.training.title')}
              descriptionKey={t('expert.dashboard.card.training.description')}
              icon={GraduationCap}
              iconBgColor="bg-amber-50"
              iconColor="text-amber-500"
              link="/training/catalog"
              useDirect
            />

            <TenderFeatureCard
              titleKey={t('expert.dashboard.card.myCV.title')}
              descriptionKey={t('expert.dashboard.card.myCV.description')}
              icon={FileUser}
              iconBgColor="bg-rose-50"
              iconColor="text-rose-500"
              link="/experts/my-cv/dashboard"
              useDirect
            />
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
