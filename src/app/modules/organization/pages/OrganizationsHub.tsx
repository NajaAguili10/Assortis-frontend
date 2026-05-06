import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OrganizationsSubMenu } from '@app/components/OrganizationsSubMenu';
import { StatCard } from '@app/components/StatCard';
import { TenderFeatureCard } from '@app/components/TenderFeatureCard';
import { TenderMetricsCard } from '@app/components/TenderMetricsCard';
import { ActionCard } from '@app/components/ActionCard';
import { AccessDenied } from '@app/components/AccessDenied';
import { Separator } from '@app/components/ui/separator';
import { useOrganizations } from '@app/modules/organization/hooks/useOrganizations';
import { hasOrganizationsAccess } from '@app/services/permissions.service';
import { apiClient } from '@app/api/apiClient';

import {
  Building2,
  Target,
  Users,
  Globe,
  Sparkles,
  UserPlus,
  Database,
  UsersRound,
  Handshake,
  Archive,
  FilePlus2,
} from 'lucide-react';

interface BackendTeamMember {
  department?: string | null;
  status?: string | null;
}

interface TeamMembersResponse {
  organization?: {
    id?: number | string | null;
    name?: string | null;
    type?: string | null;
  } | null;
  members?: BackendTeamMember[];
}

export default function OrganizationsHub() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { kpis } = useOrganizations();
  const { user } = useAuth();

  const hasAccess = hasOrganizationsAccess(user?.accountType);

  const isExpert = user?.accountType === 'expert';
  const isOrgOrAdmin =
    user?.accountType === 'organization' || user?.accountType === 'admin';

  const canAccessMatching = isExpert || isOrgOrAdmin;

  const [teamKpis, setTeamKpis] = useState({
    activeMembers: 0,
    teamMembers: 0,
    departments: 0,
  });
  const [teamKpisError, setTeamKpisError] = useState<string | null>(null);
  const [loadingTeamsKpis, setLoadingTeamsKpis] = useState(true);

  useEffect(() => {
    const fetchTeamKpis = async () => {
      setLoadingTeamsKpis(true);
      setTeamKpisError(null);

      try {
        const response = await apiClient.get<TeamMembersResponse>('/team-members');
        const members = response.members || [];
        const activeMembers = members.filter((member) => {
          const status = (member.status || '').toLowerCase();
          return status === '' || status === 'active';
        }).length;
        const departments = new Set(
          members
            .map((member) => (member.department || '').trim())
            .filter(Boolean)
        ).size;

        setTeamKpis({
          activeMembers,
          teamMembers: members.length,
          departments,
        });
      } catch (error) {
        console.error('Error fetching team KPIs:', error);
        setTeamKpisError(error instanceof Error ? error.message : 'Unable to load team KPIs');
        setTeamKpis({
          activeMembers: 0,
          teamMembers: 0,
          departments: 0,
        });
      } finally {
        setLoadingTeamsKpis(false);
      }
    };

    if (isOrgOrAdmin) {
      fetchTeamKpis();
      return;
    }

    setLoadingTeamsKpis(false);
    setTeamKpisError(null);
    setTeamKpis({
      activeMembers: 0,
      teamMembers: 0,
      departments: 0,
    });
  }, [isOrgOrAdmin]);

  const subMenuItems = [
    {
      label: t('organizations.submenu.database'),
      description: t('permissions.organizations.features.database.description'),
    },
    {
      label: t('organizations.submenu.myOrganization'),
      description: t('permissions.organizations.features.myOrganization.description'),
    },
    {
      label: t('organizations.submenu.teams'),
      description: t('permissions.organizations.features.teams.description'),
    },
    {
      label: t('organizations.submenu.partnerships'),
      description: t('permissions.organizations.features.partnerships.description'),
    },
  ];

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('organizations.hub.title')}
        description={t('organizations.hub.subtitle')}
        icon={Building2}
        stats={
          hasAccess
            ? [
                {
                  value: kpis.totalOrganizations.toString(),
                  label: t('organizations.kpis.totalOrganizations'),
                },
                {
                  value: kpis.activeOrganizations.toString(),
                  label: t('organizations.kpis.activeOrganizations'),
                },
                {
                  value: kpis.partnerships.toString(),
                  label: t('organizations.kpis.partnerships'),
                },
              ]
            : []
        }
      />

      <OrganizationsSubMenu />

      {!hasAccess ? (
        <AccessDenied
          module="organizations"
          accountType={user?.accountType}
          subMenuItems={subMenuItems}
        />
      ) : (
        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              <StatCard
                title={t('organizations.kpis.activeOrganizations')}
                value={kpis.activeOrganizations.toString()}
                trend="+10%"
                icon={Building2}
                iconBgColor="bg-blue-50"
                iconColor="text-blue-500"
              />
              <StatCard
                title={t('organizations.kpis.verifiedOrganizations')}
                value={kpis.verifiedOrganizations.toString()}
                icon={Target}
                iconBgColor="bg-yellow-50"
                iconColor="text-yellow-500"
              />
              <StatCard
                title={t('organizations.kpis.partnerships')}
                value={kpis.partnerships.toString()}
                badge={`${kpis.newPartnerships} ${t('organizations.kpis.newPartnerships')}`}
                icon={Users}
                iconBgColor="bg-green-50"
                iconColor="text-green-500"
              />
              <StatCard
                title={t('organizations.kpis.countriesCovered')}
                value={kpis.countriesCovered.toString()}
                icon={Globe}
                iconBgColor="bg-purple-50"
                iconColor="text-purple-500"
              />
            </div>

            <Separator className="my-6" />

            {isOrgOrAdmin && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-primary mb-4">{t('actions.quick')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ActionCard title={t('organizations.actions.updateProfile')} icon={Sparkles} onClick={() => navigate('/organizations/my-organization')} />
                  <ActionCard title={t('organizations.actions.createTender')} icon={FilePlus2} onClick={() => navigate('/organizations/create-tender')} />
                  <ActionCard title={t('organizations.invite.title')} icon={UserPlus} onClick={() => navigate('/organizations/invite')} />
                </div>
              </div>
            )}

            {isOrgOrAdmin && <Separator className="my-6" />}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TenderFeatureCard
                titleKey="organizations.card.database.title"
                descriptionKey="organizations.card.database.description"
                icon={Database}
                iconBgColor="bg-blue-50"
                iconColor="text-blue-500"
                stats={[
                  { labelKey: 'organizations.kpis.totalOrganizations', value: kpis.totalOrganizations },
                  { labelKey: 'organizations.kpis.verifiedOrganizations', value: kpis.verifiedOrganizations },
                ]}
                link="/organizations/database"
              />

              {isOrgOrAdmin && (
                <TenderMetricsCard
                  titleKey="organizations.card.teams.title"
                  descriptionKey="organizations.card.teams.description"
                  icon={UsersRound}
                  iconBgColor="bg-green-50"
                  iconColor="bg-green-500"
                  badge={loadingTeamsKpis ? '...' : teamKpis.activeMembers}
                  metrics={[
                    {
                      labelKey: 'organizations.teams.active',
                      value: loadingTeamsKpis ? '...' : teamKpis.activeMembers,
                      highlight: true,
                    },
                    {
                      labelKey: 'organizations.kpis.teamMembers',
                      value: loadingTeamsKpis ? '...' : teamKpis.teamMembers,
                    },
                    {
                      labelKey: 'organizations.teams.departments',
                      value: loadingTeamsKpis ? '...' : teamKpis.departments,
                    },
                  ]}
                  link="/organizations/teams"
                />
              )}

              {isOrgOrAdmin && (
                <TenderMetricsCard
                  titleKey="organizations.card.partnerships.title"
                  descriptionKey="organizations.card.partnerships.description"
                  icon={Handshake}
                  iconBgColor="bg-purple-50"
                  iconColor="text-purple-500"
                  metrics={[
                    { labelKey: 'organizations.partnerships.active', value: kpis.partnerships, highlight: true },
                    { labelKey: 'organizations.kpis.newPartnerships', value: kpis.newPartnerships },
                    { labelKey: 'organizations.kpis.countriesCovered', value: kpis.countriesCovered },
                  ]}
                  link="/organizations/partnerships"
                />
              )}

              {canAccessMatching && (
                <TenderMetricsCard
                  titleKey="organizations.card.matching.title"
                  descriptionKey="organizations.card.matching.description"
                  icon={Sparkles}
                  iconBgColor="bg-amber-50"
                  iconColor="text-amber-500"
                  metrics={[
                    { labelKey: 'organizations.matching.stats.available', value: 4, highlight: true },
                    { labelKey: 'organizations.matching.stats.highMatches', value: 2 },
                    { labelKey: 'organizations.matching.stats.avgScore', value: 86 },
                  ]}
                  link="/organizations/matching"
                />
              )}

              {canAccessMatching && (
                <TenderMetricsCard
                  titleKey="organizations.card.matchingDossier.title"
                  descriptionKey="organizations.card.matchingDossier.description"
                  icon={Archive}
                  iconBgColor="bg-rose-50"
                  iconColor="text-rose-500"
                  metrics={[
                    { labelKey: 'organizations.matchingDossier.stats.totalSaved', value: 0, highlight: true },
                    { labelKey: 'organizations.matchingDossier.stats.thisMonth', value: 0 },
                    { labelKey: 'organizations.matchingDossier.stats.highMatches', value: 0 },
                  ]}
                  link="/organizations/matching-dossier"
                />
              )}
            </div>
          </div>
        </PageContainer>
      )}
    </div>
  );
}
