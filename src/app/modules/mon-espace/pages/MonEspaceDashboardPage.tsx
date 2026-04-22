import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { PageBanner } from '../../../components/PageBanner';
import { PageContainer } from '../../../components/PageContainer';
import { MonEspaceSubMenu } from '../../../components/MonEspaceSubMenu';
import { StatCard } from '../../../components/StatCard';
import { ActionCard } from '../../../components/ActionCard';
import { FeatureCard } from '../../../components/FeatureCard';
import { TenderMetricsCard } from '../../../components/TenderMetricsCard';
import { MonEspaceIntroduction } from '../components/MonEspaceIntroduction';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useOrganizations } from '@app/modules/organization/hooks/useOrganizations';
import { hasMonEspaceAccess } from '../../../services/permissions.service';
import { getRecruiterStats } from '../services/jobOfferService';
import { 
  Briefcase, 
  PlusCircle, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Building2,
  FolderKanban,
  Inbox
} from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';

export default function MonEspaceDashboardPage() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { kpis } = useOrganizations();
  const [stats, setStats] = useState({
    totalOffers: 0,
    activeOffers: 0,
    totalApplications: 0,
    closingSoon: 0,
  });

  // Vérifier les permissions d'accès
  const hasAccess = hasMonEspaceAccess(user?.accountType);
  
  // Vérifier si l'utilisateur est un expert (pas organization)
  const isExpertOnly = user?.accountType === 'expert';

  // Définir les sous-menus et leurs descriptions pour la page d'accès refusé
  const subMenuItems = [
    {
      label: t('monEspace.nav.publish'),
      description: t('permissions.monEspace.features.publish.description')
    },
    {
      label: t('monEspace.nav.vacancies'),
      description: t('permissions.monEspace.features.vacancies.description')
    },
    {
      label: t('monEspace.nav.invitations'),
      description: t('permissions.monEspace.features.invitations.description')
    },
    {
      label: t('monEspace.nav.myCV'),
      description: t('permissions.monEspace.features.cv.description')
    },
    {
      label: t('monEspace.nav.myAccount'),
      description: t('permissions.monEspace.features.account.description')
    },
    {
      label: t('monEspace.nav.memberArea'),
      description: t('permissions.monEspace.features.memberArea.description')
    }
  ];

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const statsData = await getRecruiterStats(user.id);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        icon={Briefcase}
        title={t('monEspace.banner.dashboard.title')}
        description={t('monEspace.banner.dashboard.description')}
        stats={hasAccess ? [
          { value: stats.totalOffers.toString(), label: t('monEspace.kpi.totalOffers') },
          { value: stats.activeOffers.toString(), label: t('monEspace.kpi.activeOffers') },
          { value: stats.totalApplications.toString(), label: t('monEspace.kpi.totalApplications') }
        ] : []}
      />
      
      <MonEspaceSubMenu />

      {/* Contenu selon les permissions */}
      {!hasAccess ? (
        <MonEspaceIntroduction />
      ) : (
        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-6">
            {/* Stats Grid - KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              <StatCard
                title={t('monEspace.kpi.totalOffers')}
                value={stats.totalOffers}
                icon={Briefcase}
                iconColor="text-primary"
                iconBgColor="bg-primary/10"
              />
              <StatCard
                title={t('monEspace.kpi.activeOffers')}
                value={stats.activeOffers}
                icon={TrendingUp}
                iconColor="text-badge-success-text"
                iconBgColor="bg-badge-success-bg"
              />
              <StatCard
                title={t('monEspace.kpi.totalApplications')}
                value={stats.totalApplications}
                icon={TrendingUp}
                iconColor="text-accent"
                iconBgColor="bg-accent/10"
              />
              <StatCard
                title={t('monEspace.kpi.closingSoon')}
                value={stats.closingSoon}
                icon={Clock}
                iconColor="text-badge-warning-text"
                iconBgColor="bg-badge-warning-bg"
              />
            </div>

            {/* Quick Actions - NON visible pour Expert uniquement */}
            {!isExpertOnly && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-primary mb-4">{t('actions.quick')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <ActionCard
                    title={t('monEspace.nav.publish')}
                    icon={PlusCircle}
                    badge={t('common.badge.new')}
                    onClick={() => navigate('/mon-espace/publier')}
                  />
                </div>
              </div>
            )}

            {/* Feature Cards - 3 per row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Offres Projets - visible pour tous */}
              <FeatureCard
                title={t('monEspace.card.projectOffers.title')}
                description={t('monEspace.card.projectOffers.description')}
                icon={FolderKanban}
                iconBgColor="bg-blue-50"
                iconColor="text-blue-500"
                stats={[
                  { label: t('monEspace.card.projectOffers.stats.active'), value: '47' },
                  { label: t('monEspace.card.projectOffers.stats.closing'), value: '12' },
                ]}
                link="/mon-espace/offres-projets"
              />
              
              {/* Offres Internes - visible pour tous */}
              <FeatureCard
                title={t('monEspace.card.internalOffers.title')}
                description={t('monEspace.card.internalOffers.description')}
                icon={Building2}
                iconBgColor="bg-purple-50"
                iconColor="text-purple-500"
                stats={[
                  { label: t('monEspace.card.internalOffers.stats.active'), value: '23' },
                  { label: t('monEspace.card.internalOffers.stats.departments'), value: '8' },
                ]}
                link="/mon-espace/offres-internes"
              />
              
              {/* Mes Offres Publiées - NON visible pour Expert uniquement */}
              {!isExpertOnly && (
                <FeatureCard
                  title={t('monEspace.card.myOffers.title')}
                  description={t('monEspace.card.myOffers.description')}
                  icon={Briefcase}
                  iconBgColor="bg-green-50"
                  iconColor="text-green-500"
                  stats={[
                    { label: t('monEspace.card.myOffers.stats.published'), value: stats.totalOffers.toString() },
                    { label: t('monEspace.card.myOffers.stats.applications'), value: stats.totalApplications.toString() },
                  ]}
                  link="/mon-espace/publier#published-offers-history"
                />
              )}
              
              {/* Invitations Card - visible pour tous */}
              <TenderMetricsCard
                titleKey="monEspace.card.invitations.title"
                descriptionKey="monEspace.card.invitations.description"
                icon={Inbox}
                iconBgColor="bg-pink-50"
                iconColor="text-pink-500"
                badge={kpis.pendingInvitations}
                badgeVariant="default"
                metrics={[
                  { 
                    labelKey: 'monEspace.invitations.received', 
                    value: kpis.invitations,
                    highlight: true 
                  },
                  { 
                    labelKey: 'monEspace.kpis.pendingInvitations', 
                    value: kpis.pendingInvitations 
                  },
                  {
                    labelKey: 'monEspace.invitations.sent',
                    value: 28
                  }
                ]}
                link="/compte-utilisateur/invitations"
              />
            </div>
          </div>
        </PageContainer>
      )}
    </div>
  );
}