import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { useOrganizationProfile } from '@app/contexts/OrganizationProfileContext';
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
import { organizationService } from '@app/services/organizationService';
import {
  organizationMatchingDossierService,
  OrganizationMatchingStatsDTO,
} from '@app/services/organizationMatchingDossierService';

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
  Search,
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
  const { calculateCompletionRate } = useOrganizationProfile();

  // V�rifier les permissions d'acc�s
  const hasAccess = hasOrganizationsAccess(user?.accountType);

  // Pour Expert : Database, Matching, Dossier Matching
  // Pour Organization/Organization/Admin : toutes les fonctionnalit�s
  const isExpert = user?.accountType === 'expert';
  const isOrgOrAdmin =
    user?.accountType === 'organization' || user?.accountType === 'admin';

  // Matching et Dossier Matching visibles pour Expert, Organization, Organization, Admin
  const canAccessMatching = isExpert || isOrgOrAdmin;

  const [teamKpis, setTeamKpis] = useState({
    activeMembers: 0,
    teamMembers: 0,
    departments: 0,
  });
  const [teamKpisError, setTeamKpisError] = useState<string | null>(null);
  const [loadingTeamsKpis, setLoadingTeamsKpis] = useState(true);
  const [myOrganizationKpis, setMyOrganizationKpis] = useState({
    completionRate: 0,
    activeProjects: 0,
  });
  const [loadingMyOrganizationKpis, setLoadingMyOrganizationKpis] = useState(true);
  const [matchingKpis, setMatchingKpis] = useState<OrganizationMatchingStatsDTO>({
    available: 0,
    highMatches: 0,
    avgScore: 0,
    totalSaved: 0,
    thisMonth: 0,
    dossierHighMatches: 0,
  });
  const [loadingMatchingKpis, setLoadingMatchingKpis] = useState(true);

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

  useEffect(() => {
    const fetchMyOrganizationKpis = async () => {
      setLoadingMyOrganizationKpis(true);

      try {
        const profileData = await organizationService.getCurrentOrganizationProfile();
        const completionRate = calculateCompletionRate({
          id: profileData.id,
          name: profileData.name,
          description: profileData.description,
          sectors: profileData.sectors as any,
          subsectors: profileData.subsectors as any,
          countries: profileData.country ? [profileData.country] : [],
          languages: profileData.languages,
          selectedServices: profileData.selectedServices,
          annualBudget: profileData.annualBudget,
          projectsCompleted: profileData.projectsCompleted,
          budgetRange: {
            min: profileData.annualBudget ? Math.round(profileData.annualBudget * 0.1) : 0,
            max: profileData.annualBudget || 0,
          },
          teamSize: profileData.teamSize,
          yearsOfExperience: profileData.yearFounded ? Math.max(0, 2026 - profileData.yearFounded) : 0,
          completionRate: 0,
          exists: true,
          validationState: {
            pendingValidation: false,
            pendingValidationMessage: null,
            lastSubmittedAt: null,
            sectionStatuses: {
              information: 'verified',
              contact: 'verified',
              operations: 'verified',
              resources: 'verified',
              projects: 'verified',
            },
          },
        });

        setMyOrganizationKpis({
          completionRate,
          activeProjects: profileData.activeProjects || 0,
        });
      } catch (error) {
        console.error('Error fetching My Organization KPIs:', error);
        setMyOrganizationKpis({
          completionRate: 0,
          activeProjects: 0,
        });
      } finally {
        setLoadingMyOrganizationKpis(false);
      }
    };

    if (isOrgOrAdmin) {
      fetchMyOrganizationKpis();
      return;
    }

    setLoadingMyOrganizationKpis(false);
    setMyOrganizationKpis({
      completionRate: 0,
      activeProjects: 0,
    });
  }, [calculateCompletionRate, isOrgOrAdmin]);

  useEffect(() => {
    const fetchMatchingKpis = async () => {
      setLoadingMatchingKpis(true);

      try {
        const stats = await organizationMatchingDossierService.getStats();
        setMatchingKpis(stats);
      } catch (error) {
        console.error('Error fetching matching KPIs:', error);
        setMatchingKpis({
          available: 0,
          highMatches: 0,
          avgScore: 0,
          totalSaved: 0,
          thisMonth: 0,
          dossierHighMatches: 0,
        });
      } finally {
        setLoadingMatchingKpis(false);
      }
    };

    if (canAccessMatching) {
      fetchMatchingKpis();

      const handleFocus = () => {
        fetchMatchingKpis();
      };

      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }

    setLoadingMatchingKpis(false);
    setMatchingKpis({
      available: 0,
      highMatches: 0,
      avgScore: 0,
      totalSaved: 0,
      thisMonth: 0,
      dossierHighMatches: 0,
    });
  }, [canAccessMatching]);

  // D�finir les sous-menus et leurs descriptions pour la page d'acc�s refus�
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
      {/* Banner */}
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

      {/* Sub Menu */}
      <OrganizationsSubMenu />

      {/* Contenu selon les permissions */}
      {!hasAccess ? (
        <AccessDenied
          module="organizations"
          accountType={user?.accountType}
          subMenuItems={subMenuItems}
        />
      ) : (
        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-6">
            {/* KPIs Grid */}
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
                subtitle={t('organizations.kpis.verifiedOrganizations')}
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
                subtitle={t('organizations.kpis.globalPresence')}
                icon={Globe}
                iconBgColor="bg-purple-50"
                iconColor="text-purple-500"
              />
            </div>

            <Separator className="my-6" />

            {/* Quick Actions - Seulement pour Organization/Organization/Admin */}
            {isOrgOrAdmin && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-primary mb-4">{t('actions.quick')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ActionCard
                      title={t('organizations.actions.updateProfile')}
                      icon={Sparkles}
                      onClick={() => navigate('/organizations/my-organization')}
                  />
                  <ActionCard
                      title={t('organizations.actions.createTender')}
                      icon={FilePlus2} onClick={() => navigate('/organizations/create-tender')}
                  />
                  <ActionCard
                      title={t('organizations.invite.title')}
                      icon={UserPlus} onClick={() => navigate('/organizations/invite')}
                  />
                </div>
              </div>
            )}

            {isOrgOrAdmin && <Separator className="my-6" />}

            {/* Feature Cards Section */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Database Card */}
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

              {/* Teams Card - Seulement pour Organization/Organization/Admin */}
              {isOrgOrAdmin && (
                <TenderMetricsCard
                  titleKey="organizations.card.teams.title"
                  descriptionKey="organizations.card.teams.description"
                  icon={UsersRound}
                  iconBgColor="bg-green-50"
                  iconColor="bg-green-500"
                  badge={loadingTeamsKpis ? '...' : teamKpis.activeMembers}
                  badgeVariant="default"
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

              {/* Partnerships Card - Seulement pour Organization/Organization/Admin */}
              {isOrgOrAdmin && (
                <TenderMetricsCard
                  titleKey="organizations.card.partnerships.title"
                  descriptionKey="organizations.card.partnerships.description"
                  icon={Handshake}
                  iconBgColor="bg-purple-50"
                  iconColor="text-purple-500"
                  metrics={[
                    {
                      labelKey: 'organizations.partnerships.active',
                      value: kpis.partnerships,
                      highlight: true
                    },
                    {
                      labelKey: 'organizations.kpis.newPartnerships',
                      value: kpis.newPartnerships
                    },
                    {
                      labelKey: 'organizations.kpis.countriesCovered',
                      value: kpis.countriesCovered,
                      trend: 5
                    },
                  ]}
                  link="/organizations/partnerships"
                />
              )}

              {/* My Organization Card - Seulement pour Organization/Organization/Admin */}
              {isOrgOrAdmin && (
                  <TenderFeatureCard
                      titleKey="organizations.card.myOrganization.title"
                      descriptionKey="organizations.card.myOrganization.description"
                      icon={Building2}
                      iconBgColor="bg-cyan-50"
                      iconColor="text-cyan-500"
                      stats={[
                        {
                          labelKey: 'organizations.myOrganization.completionRate',
                          value: loadingMyOrganizationKpis ? '...' : myOrganizationKpis.completionRate
                        },
                        {
                          labelKey: 'organizations.myOrganization.projects.active',
                          value: loadingMyOrganizationKpis ? '...' : myOrganizationKpis.activeProjects
                        },
                      ]}
                      link="/organizations/my-organization"
                  />
              )}

              {/* Matching Card - Seulement pour Organization/Organization/Admin */}
              {canAccessMatching && (
                <TenderMetricsCard
                  titleKey="organizations.card.matching.title"
                  descriptionKey="organizations.card.matching.description"
                  icon={Sparkles}
                  iconBgColor="bg-amber-50"
                  iconColor="text-amber-500"
                  isLoading={loadingMatchingKpis}
                  metrics={[
                    { labelKey: 'organizations.matching.stats.available',
                      value: matchingKpis.available,
                      highlight: true
                    },
                    {
                      labelKey: 'organizations.matching.stats.highMatches',
                      value: matchingKpis.highMatches
                    },
                    {
                      labelKey: 'organizations.matching.stats.avgScore',
                      value: matchingKpis.avgScore
                    },
                  ]}
                  link="/organizations/matching"
                />
              )}

                {/* Dossier Matching Card - Seulement pour Organization/Organization/Admin */}
                {canAccessMatching && (
                <TenderMetricsCard
                  titleKey="organizations.card.matchingDossier.title"
                  descriptionKey="organizations.card.matchingDossier.description"
                  icon={Archive}
                  iconBgColor="bg-rose-50"
                  iconColor="text-rose-500"
                  isLoading={loadingMatchingKpis}
                  metrics={[
                    { labelKey: 'organizations.matchingDossier.stats.totalSaved',
                      value: matchingKpis.totalSaved,
                      highlight: true
                    },
                    {
                      labelKey: 'organizations.matchingDossier.stats.thisMonth',
                      value: matchingKpis.thisMonth },
                    {
                      labelKey: 'organizations.matchingDossier.stats.highMatches',
                      value: matchingKpis.dossierHighMatches
                    },
                  ]}
                  link="/organizations/matching-dossier"
                />
              )}
              </div>
            </div>
          </div>
        </PageContainer>
      )}
    </div>
  );
}
