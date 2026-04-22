import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ExpertsSubMenu } from '@app/components/ExpertsSubMenu';
import { StatCard } from '@app/components/StatCard';
import { ActionCard } from '@app/components/ActionCard';
import { FeatureCard } from '@app/components/FeatureCard';
import { AccessDenied } from '@app/components/AccessDenied';
import { hasExpertsAccess } from '@app/services/permissions.service';
import {
  Users,
  UserPlus,
  Sparkles,
  Database,
  Zap,
  Award,
  Briefcase,
  Star,
  FileText,
  Building2,
  Archive,
} from 'lucide-react';

export default function Experts() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // V�rifier les permissions d'acc�s
  const hasAccess = hasExpertsAccess(user?.accountType);
  
  // Pour Expert : seulement Matching Organisation (Expert ? Organisations)
  // Pour Organization/Organization/Admin : Matching standard (Experts ? Appels d'offres)
  const isExpert = user?.accountType === 'expert';
  const isOrgOrAdmin = user?.accountType === 'organization' || 
                       user?.accountType === 'admin';
  
  // Matching Organisation visible SEULEMENT pour Organization, Organization, Admin
  // PAS pour Expert
  const canAccessOrgMatching = isOrgOrAdmin;
  
  // D�finir les sous-menus et leurs descriptions pour la page d'acc�s refus�
  const subMenuItems = [
    {
      label: t('experts.submenu.database'),
      description: t('permissions.experts.features.database.description')
    },
    {
      label: t('experts.submenu.matching'),
      description: t('permissions.experts.features.matching.description')
    },
    {
      label: t('experts.submenu.cvTemplates'),
      description: t('permissions.experts.features.cvTemplates.description')
    }
  ];

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('experts.hub.title')}
        description={t('experts.hub.subtitle')}
        icon={Users}
        stats={hasAccess ? [
          { value: '3,847', label: t('experts.stats.available') },
          { value: '2,891', label: t('experts.stats.activeProfiles') },
          { value: '34', label: t('experts.stats.pendingInvitations') }
        ] : []}
      />

      {/* Sub Menu */}
      <ExpertsSubMenu />

      {/* Contenu selon les permissions */}
      {!hasAccess ? (
        <AccessDenied 
          module="experts" 
          accountType={user?.accountType}
          subMenuItems={subMenuItems}
        />
      ) : (
        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              <StatCard
                title={t('experts.stats.available')}
                value="2,847"
                trend="+15%"
                icon={Users}
                iconBgColor="bg-indigo-50"
                iconColor="text-indigo-500"
              />
              <StatCard
                title={t('experts.stats.certified')}
                value="1,523"
                subtitle={t('experts.stats.verified')}
                icon={Award}
                iconBgColor="bg-yellow-50"
                iconColor="text-yellow-500"
              />
              <StatCard
                title={t('experts.stats.activeMissions')}
                value="342"
                badge={`28 ${t('experts.stats.newMissions')}`}
                icon={Briefcase}
                iconBgColor="bg-blue-50"
                iconColor="text-blue-500"
              />
              <StatCard
                title={t('experts.stats.matchingRate')}
                value="87%"
                subtitle={t('experts.stats.clientSatisfaction')}
                icon={Star}
                iconBgColor="bg-green-50"
                iconColor="text-green-500"
              />
            </div>

            {/* Feature Cards - 3 per row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                title={t('experts.card.database.title')}
                description={t('experts.card.database.description')}
                icon={Database}
                iconBgColor="bg-indigo-50"
                iconColor="text-indigo-500"
                stats={[
                  { label: t('experts.card.database.stats.available'), value: '3847' },
                  { label: t('experts.card.database.stats.verified'), value: '2891' },
                ]}
                link="/experts/database"
              />
              {/* Matching Organisation : seulement pour Organization/Organization/Admin */}
              {canAccessOrgMatching && (
                <FeatureCard
                  title={t('experts.card.matchingOrganisation.title')}
                  description={t('experts.card.matchingOrganisation.description')}
                  icon={Building2}
                  iconBgColor="bg-purple-50"
                  iconColor="text-purple-500"
                  badge="NEW"
                  stats={[
                    { label: t('experts.card.matchingOrganisation.stats.activeProjects'), value: '47' },
                    { label: t('experts.card.matchingOrganisation.stats.highMatches'), value: '12' },
                  ]}
                  link="/experts/matching-organisation"
                />
              )}
              {canAccessOrgMatching && (
                <FeatureCard
                  title={t('experts.card.matchingOrganisationArchive.title')}
                  description={t('experts.card.matchingOrganisationArchive.description')}
                  icon={Archive}
                  iconBgColor="bg-slate-50"
                  iconColor="text-slate-500"
                  stats={[
                    { label: t('experts.card.matchingOrganisationArchive.stats.saved'), value: '8' },
                    { label: t('experts.card.matchingOrganisationArchive.stats.avgScore'), value: '84%' },
                  ]}
                  link="/experts/matching-organisation-archive"
                />
              )}
              {/* CV Templates : seulement pour Organization/Organization/Admin (pas pour Expert) */}
              {isOrgOrAdmin && (
                <FeatureCard
                  title={t('experts.card.cvTemplates.title')}
                  description={t('experts.card.cvTemplates.description')}
                  icon={FileText}
                  iconBgColor="bg-orange-50"
                  iconColor="text-orange-500"
                  badge="NEW"
                  stats={[
                    { label: t('experts.card.cvTemplates.stats.templates'), value: '12' },
                    { label: t('experts.card.cvTemplates.stats.generated'), value: '847' },
                  ]}
                  link="/experts/cv-templates"
                />
              )}
            </div>
          </div>
        </PageContainer>
      )}
    </div>
  );
}