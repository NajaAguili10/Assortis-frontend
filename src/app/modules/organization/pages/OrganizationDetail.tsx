import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useAuth } from '@app/contexts/AuthContext';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OrganizationsSubMenu } from '@app/components/OrganizationsSubMenu';
import { SearchSectionTabs, type SearchSectionTab } from '@app/components/SearchSectionTabs';
import { OrganizationVerificationBadge } from '@app/components/OrganizationVerificationBadge';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Progress } from '@app/components/ui/progress';
import { Separator } from '@app/components/ui/separator';
import { useOrganizations } from '@app/modules/organization/hooks/useOrganizations';
import { useOrganizationBookmarks } from '@app/modules/shared/hooks/useOrganizationBookmarks';
import {
  Building2,
  Info,
  MapPin,
  Globe,
  Mail,
  Calendar,
  Users,
  Briefcase,
  Target,
  CheckCircle,
  DollarSign,
  Award,
  ExternalLink,
  FolderKanban,
} from 'lucide-react';

export default function OrganizationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { allOrganizations } = useOrganizations();
  const { isBookmarked, toggleBookmark } = useOrganizationBookmarks();
  const [activeSection, setActiveSection] = useState('information');

  const searchSection: SearchSectionTab | null = useMemo(() => {
    if (
      location.pathname.startsWith('/search/organizations/') ||
      location.pathname.startsWith('/search/organisations/')
    ) {
      return 'organisations';
    }

    return null;
  }, [location.pathname]);

  const isSearchContext = searchSection !== null;

  // Find the organization by ID
  const organization = allOrganizations.find(org => org.id === id) ?? allOrganizations[0];

  const sections = [
    {
      id: 'information',
      icon: Info,
      labelKey: 'organizations.myOrganization.sections.information',
      color: 'text-blue-500',
    },
    {
      id: 'contact',
      icon: MapPin,
      labelKey: 'organizations.myOrganization.sections.contact',
      color: 'text-green-500',
    },
    {
      id: 'operations',
      icon: Briefcase,
      labelKey: 'organizations.myOrganization.sections.operations',
      color: 'text-purple-500',
    },
    {
      id: 'resources',
      icon: Users,
      labelKey: 'organizations.myOrganization.sections.resources',
      color: 'text-orange-500',
    },
    {
      id: 'projects',
      icon: FolderKanban,
      labelKey: 'organizations.myOrganization.sections.projects',
      color: 'text-pink-500',
    },
  ] as const;

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-2">
            {t('organizations.details.notFound')}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t('organizations.details.notFound.message')}
          </p>
          <Button onClick={() => navigate(isSearchContext ? '/search/organisations' : '/organizations/database')}>
            {t('organizations.actions.backToList')}
          </Button>
        </div>
      </div>
    );
  }

  const completionRate = Math.min(
    100,
    Math.max(
      35,
      Math.round(
        [
          organization.description,
          organization.email,
          organization.website,
          organization.yearEstablished,
          organization.employeeCount,
          organization.budget,
          organization.teamMembers,
          organization.certifications?.length,
          organization.subSectors?.length,
        ].filter(Boolean).length * 11,
      ),
    ),
  );

  const currentSection = sections.find((section) => section.id === activeSection);
  const currentSectionStatus = organization.status === 'VERIFIED' ? 'verified' : 'selfDeclared';
  const shouldShowBookmarkButton = user?.accountType !== 'expert';

  const renderSearchSectionContent = () => {
    switch (activeSection) {
      case 'information':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-1 text-sm text-muted-foreground">
                  {t('organizations.myOrganization.information.name')}
                </p>
                <p className="font-semibold text-primary">{organization.name}</p>
              </div>
              {organization.acronym && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-1 text-sm text-muted-foreground">
                    {t('organizations.myOrganization.information.acronym')}
                  </p>
                  <p className="font-semibold text-primary">{organization.acronym}</p>
                </div>
              )}
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-1 text-sm text-muted-foreground">
                  {t('organizations.myOrganization.information.type')}
                </p>
                <p className="font-semibold text-primary">
                  {t(`organizations.type.${organization.type}`)}
                </p>
              </div>
              {organization.yearEstablished && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-1 text-sm text-muted-foreground">
                    {t('organizations.myOrganization.information.established')}
                  </p>
                  <p className="font-semibold text-primary">{organization.yearEstablished}</p>
                </div>
              )}
              {organization.website && (
                <div className="rounded-lg bg-gray-50 p-4 md:col-span-2">
                  <p className="mb-1 text-sm text-muted-foreground">
                    {t('organizations.myOrganization.information.website')}
                  </p>
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    {organization.website}
                  </a>
                </div>
              )}
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-1 text-sm text-muted-foreground">
                {t('organizations.myOrganization.information.description')}
              </p>
              <p className="text-primary">{organization.description}</p>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {organization.email && (
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {t('organizations.myOrganization.contact.email')}
                  </p>
                </div>
                <p className="font-semibold text-primary">{organization.email}</p>
              </div>
            )}
            {organization.website && (
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-1 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {t('organizations.myOrganization.contact.region')}
                  </p>
                </div>
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  {organization.website}
                </a>
              </div>
            )}
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="mb-1 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t('organizations.myOrganization.contact.city')}
                </p>
              </div>
              <p className="font-semibold text-primary">{organization.city}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-1 text-sm text-muted-foreground">
                {t('organizations.myOrganization.contact.country')}
              </p>
              <p className="font-semibold text-primary">{organization.country}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 md:col-span-2">
              <div className="mb-1 flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t('organizations.myOrganization.contact.region')}
                </p>
              </div>
              <p className="font-semibold text-primary">
                {t(`organizations.region.${organization.region}`)}
              </p>
            </div>
          </div>
        );

      case 'operations':
        return (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t('organizations.myOrganization.operations.sectors')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {organization.sectors.map((sector) => (
                  <Badge key={sector} variant="secondary">
                    {t(`sectors.${sector}`)}
                  </Badge>
                ))}
              </div>
            </div>
            {organization.subSectors && organization.subSectors.length > 0 && (
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-2 text-sm text-muted-foreground">
                  {t('organizations.myOrganization.operations.subsectors')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {organization.subSectors.map((subsector) => (
                    <Badge
                      key={subsector}
                      variant="outline"
                      className="border-blue-200 bg-blue-50 text-blue-700"
                    >
                      {t(`subsectors.${subsector}`)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {organization.certifications && organization.certifications.length > 0 && (
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {t('organizations.myOrganization.operations.certifications')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {organization.certifications.map((certification) => (
                    <Badge
                      key={certification}
                      className="border-yellow-200 bg-yellow-50 text-yellow-700"
                    >
                      {certification}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {organization.budget && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {t('organizations.myOrganization.operations.budget')}
                    </p>
                  </div>
                  <p className="font-semibold text-primary">{organization.budget.formatted}</p>
                </div>
              )}
              {organization.employeeCount && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {t('organizations.myOrganization.operations.employees')}
                    </p>
                  </div>
                  <p className="font-semibold text-primary">{organization.employeeCount.toLocaleString()}</p>
                </div>
              )}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-1 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {t('organizations.myOrganization.contact.region')}
                  </p>
                </div>
                <p className="font-semibold text-primary">
                  {t(`organizations.region.${organization.region}`)}
                </p>
              </div>
            </div>
          </div>
        );

      case 'resources':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {(organization.teamMembers || organization.employeeCount) && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-1 text-sm text-muted-foreground">
                    {t('organizations.myOrganization.resources.teamSize')}
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {(organization.teamMembers || organization.employeeCount || 0).toLocaleString()}
                  </p>
                </div>
              )}
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-1 text-sm text-muted-foreground">
                  {t('organizations.myOrganization.resources.technicalCapacity')}
                </p>
                <Badge className="border-green-200 bg-green-50 text-green-700">
                  {organization.status === 'VERIFIED'
                    ? t('organizations.validation.verified')
                    : t('organizations.validation.selfDeclared')}
                </Badge>
              </div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-sm text-muted-foreground">
                {t('organizations.myOrganization.resources.equipment')}
              </p>
              <p className="text-primary">
                {organization.website
                  ? organization.website
                  : t('organizations.details.notFound.message')}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-sm text-muted-foreground">
                {t('organizations.myOrganization.resources.partnerships')}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {organization.partnerships} {t('organizations.kpis.partnerships')}
                </Badge>
                {organization.certifications?.map((certification) => (
                  <Badge key={certification} variant="outline">
                    {certification}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-blue-700">
                  {t('organizations.myOrganization.projects.active')}
                </p>
                <FolderKanban className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-900">{organization.activeProjects}</p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-green-700">
                  {t('organizations.myOrganization.projects.completed')}
                </p>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-900">{organization.completedProjects}</p>
            </div>
            {organization.budget && (
              <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-6">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-purple-700">
                    {t('organizations.myOrganization.projects.totalBudget')}
                  </p>
                  <DollarSign className="h-5 w-5 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-purple-900">{organization.budget.formatted}</p>
              </div>
            )}
            <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-orange-700">
                  {t('organizations.myOrganization.projects.successRate')}
                </p>
                <CheckCircle className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-orange-900">
                {organization.activeProjects + organization.completedProjects > 0
                  ? `${Math.round((organization.completedProjects / (organization.activeProjects + organization.completedProjects)) * 100)}%`
                  : '0%'}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <PageBanner
        title={organization.name}
        description={organization.acronym || ''}
        icon={Building2}
        stats={[
          { value: organization.activeProjects.toString(), label: t('organizations.details.projects') },
          { value: organization.teamMembers?.toString() || '0', label: t('organizations.kpis.teamMembers') },
          { value: organization.partnerships.toString(), label: t('organizations.kpis.partnerships') }
        ]}
      />

      {/* Sub Menu */}
      {isSearchContext && searchSection ? (
        <SearchSectionTabs activeTab={searchSection} />
      ) : (
        <OrganizationsSubMenu />
      )}

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Organization Header */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-primary mb-1">
                    {organization.name}
                    {organization.acronym && (
                      <span className="text-lg text-muted-foreground ml-2">
                        ({organization.acronym})
                      </span>
                    )}
                  </h1>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">
                      {t(`organizations.type.${organization.type}`)}
                    </Badge>
                    {organization.status === 'VERIFIED' && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {t('organizations.status.VERIFIED')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {shouldShowBookmarkButton && (
                  <Button
                    variant={isBookmarked(organization.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleBookmark(organization.id)}
                    aria-label={isBookmarked(organization.id) ? t('organizations.actions.removeBookmark') : t('organizations.actions.bookmark')}
                  >
                    <Award className="w-4 h-4 mr-2" />
                    {isBookmarked(organization.id) ? t('organizations.actions.removeBookmark') : t('organizations.actions.bookmark')}
                  </Button>
                )}
                {organization.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(organization.website, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {t('organizations.details.website')}
                  </Button>
                )}
              </div>
            </div>

            <p className="text-muted-foreground mb-4">{organization.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{organization.city}, {organization.country}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{t(`organizations.region.${organization.region}`)}</span>
              </div>
              {organization.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{organization.email}</span>
                </div>
              )}
              {organization.yearEstablished && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{t('organizations.details.established')}: {organization.yearEstablished}</span>
                </div>
              )}
              {organization.employeeCount && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{organization.employeeCount.toLocaleString()} {t('organizations.details.employees')}</span>
                </div>
              )}
              {organization.budget && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{t('organizations.details.budget')}: {organization.budget.formatted}</span>
                </div>
              )}
            </div>
          </div>

          {isSearchContext ? (
            <>
              <div className="bg-white rounded-lg border p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-primary">
                    {t('organizations.myOrganization.completionRate')}
                  </h3>
                  <span className="text-2xl font-bold text-primary">{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-3 lg:grid-cols-5">
                {sections.map((section) => {
                  const Icon = section.icon;

                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`rounded-lg border p-4 transition-all ${
                        activeSection === section.id
                          ? 'border-primary bg-primary text-white shadow-md'
                          : 'bg-white hover:border-primary/50 hover:shadow-sm'
                      }`}
                    >
                      <Icon
                        className={`mx-auto mb-2 h-6 w-6 ${
                          activeSection === section.id ? 'text-white' : section.color
                        }`}
                      />
                      <p
                        className={`text-center text-xs font-medium ${
                          activeSection === section.id ? 'text-white' : 'text-primary'
                        }`}
                      >
                        {t(section.labelKey)}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="bg-white rounded-lg border p-6">
                <div className="flex flex-col gap-3 mb-6 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-primary">
                      {t(currentSection?.labelKey || '')}
                    </h2>
                  </div>
                  <OrganizationVerificationBadge status={currentSectionStatus} />
                </div>
                <Separator className="mb-6" />
                {renderSearchSectionContent()}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sectors */}
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    {t('organizations.details.sectors')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {organization.sectors.map((sector) => (
                      <Badge key={sector} variant="secondary">
                        {t(`sectors.${sector}`)}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                {organization.certifications && organization.certifications.length > 0 && (
                  <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      {t('organizations.details.certifications')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {organization.certifications.map((cert) => (
                        <Badge key={cert} variant="outline">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{organization.activeProjects}</p>
                      <p className="text-xs text-muted-foreground">{t('organizations.details.activeProjects')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{organization.completedProjects}</p>
                      <p className="text-xs text-muted-foreground">{t('organizations.details.completedProjects')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{organization.partnerships}</p>
                      <p className="text-xs text-muted-foreground">{t('organizations.kpis.partnerships')}</p>
                    </div>
                  </div>
                </div>

                {organization.teamMembers && (
                  <div className="bg-white rounded-lg border p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">{organization.teamMembers.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{t('organizations.kpis.teamMembers')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </PageContainer>
    </div>
  );
}