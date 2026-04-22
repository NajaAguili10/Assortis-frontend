import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { useOrganizationProfile } from '@app/contexts/OrganizationProfileContext';
import { myOrganizationData } from '@app/modules/organization/data/myOrganizationData';
import { useOrganizations } from '@app/modules/organization/hooks/useOrganizations';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OrganizationsSubMenu } from '@app/components/OrganizationsSubMenu';
import { RestrictedTooltip } from '@app/components/RestrictedTooltip';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import { Progress } from '@app/components/ui/progress';
import { Card } from '@app/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@app/components/ui/alert';
import { OrganizationVerificationBadge } from '@app/components/OrganizationVerificationBadge';
import {
  canManageOrganizationAdminActions,
  isOrganizationUserRole,
} from '@app/services/permissions.service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';
import {
  Building2,
  Info,
  MapPin,
  Briefcase,
  Users,
  FolderKanban,
  CreditCard,
  Edit3,
  CheckCircle,
  Sparkles,
  Globe,
  Mail,
  Phone,
  Calendar,
  Target,
  Award,
  Languages,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  X,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export default function MyOrganization() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile: organizationProfile } = useOrganizationProfile();
  const [activeSection, setActiveSection] = useState<string>('information');
  const isRestrictedOrganizationUser = isOrganizationUserRole(user?.accountType, user?.role);
  const canManageAdminActions = canManageOrganizationAdminActions(user?.accountType, user?.role);
  const restrictedActionMessage = t('permissions.organization.adminOnlyAction');

  // Detect account type - default to 'organization' if not set
  const accountType = user?.accountType || 'organization';
  
  // For experts: search and filter states
  const {
    allOrganizations,
  } = useOrganizations();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [filteredOrganizations, setFilteredOrganizations] = useState(allOrganizations);

  // Filter organizations based on search and filters
  const handleFilterOrganizations = () => {
    let filtered = [...allOrganizations];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (org) =>
          org.name?.toLowerCase().includes(query) ||
          org.acronym?.toLowerCase().includes(query) ||
          org.description?.toLowerCase().includes(query) ||
          (org.sectors && org.sectors.some((sector) => sector && typeof sector === 'string' && sector.toLowerCase().includes(query)))
      );
    }

    // Sector filter
    if (selectedSector) {
      filtered = filtered.filter((org) => org.sectors?.includes(selectedSector as any));
    }

    // Type filter
    if (selectedType) {
      filtered = filtered.filter((org) => org.type === selectedType);
    }

    // Region filter
    if (selectedRegion) {
      filtered = filtered.filter((org) => org.region === selectedRegion);
    }

    setFilteredOrganizations(filtered);
  };

  // Effect to filter on changes
  useEffect(() => {
    handleFilterOrganizations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedSector, selectedType, selectedRegion, allOrganizations]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSector('');
    setSelectedType('');
    setSelectedRegion('');
    setFilteredOrganizations(allOrganizations);
  };

  // Render Expert View - Search Organizations
  const renderExpertView = () => {
    return (
      <>
        {/* Banner for Expert */}
        <PageBanner
          title={t('organizations.myOrganization.expert.title')}
          description={t('organizations.myOrganization.expert.subtitle')}
          icon={Building2}
          stats={[
            { value: allOrganizations.length.toString(), label: t('organizations.kpis.totalOrganizations') },
            { value: filteredOrganizations.length.toString(), label: t('organizations.myOrganization.expert.totalFound') },
            { value: '127', label: t('organizations.kpis.countriesCovered') },
          ]}
        />

        {/* Sub Menu */}
        <OrganizationsSubMenu />

        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg border p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold text-primary">
                  {t('organizations.myOrganization.expert.search.placeholder')}
                </h3>
              </div>
              
              {/* Search Bar */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder={t('organizations.myOrganization.expert.search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFilterOrganizations()}
                    className="w-full"
                  />
                </div>
                <Button onClick={handleFilterOrganizations}>
                  <Search className="w-4 h-4 mr-2" />
                  {t('organizations.myOrganization.expert.search.button')}
                </Button>
                {(searchQuery || selectedSector || selectedType || selectedRegion) && (
                  <Button variant="outline" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    {t('organizations.myOrganization.expert.search.clear')}
                  </Button>
                )}
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    {t('organizations.myOrganization.expert.filterBySector')}
                  </label>
                  <Select value={selectedSector} onValueChange={setSelectedSector}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('organizations.filters.sector')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HEALTH">
                        {t('sectors.HEALTH')}
                      </SelectItem>
                      <SelectItem value="EDUCATION">
                        {t('sectors.EDUCATION')}
                      </SelectItem>
                      <SelectItem value="INFRASTRUCTURE">
                        {t('sectors.INFRASTRUCTURE')}
                      </SelectItem>
                      <SelectItem value="ENVIRONMENT">
                        {t('sectors.ENVIRONMENT')}
                      </SelectItem>
                      <SelectItem value="GOVERNANCE">
                        {t('sectors.GOVERNANCE')}
                      </SelectItem>
                      <SelectItem value="HUMANITARIAN">
                        {t('sectors.HUMANITARIAN')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    {t('organizations.myOrganization.expert.filterByType')}
                  </label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('organizations.filters.type')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGO">
                        {t('organizations.type.NGO')}
                      </SelectItem>
                      <SelectItem value="INTERNATIONAL_ORG">
                        {t('organizations.type.INTERNATIONAL_ORG')}
                      </SelectItem>
                      <SelectItem value="GOVERNMENT">
                        {t('organizations.type.GOVERNMENT')}
                      </SelectItem>
                      <SelectItem value="PRIVATE_SECTOR">
                        {t('organizations.type.PRIVATE_SECTOR')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    {t('organizations.myOrganization.expert.filterByRegion')}
                  </label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('organizations.filters.region')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AFRICA">
                        {t('organizations.region.AFRICA')}
                      </SelectItem>
                      <SelectItem value="ASIA">
                        {t('organizations.region.ASIA')}
                      </SelectItem>
                      <SelectItem value="EUROPE">
                        {t('organizations.region.EUROPE')}
                      </SelectItem>
                      <SelectItem value="NORTH_AMERICA">
                        {t('organizations.region.NORTH_AMERICA')}
                      </SelectItem>
                      <SelectItem value="SOUTH_AMERICA">
                        {t('organizations.region.SOUTH_AMERICA')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Organizations Grid */}
            {filteredOrganizations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredOrganizations.map((org) => (
                  <Card
                    key={org.id}
                    className="p-5 hover:shadow-lg transition-shadow cursor-pointer border"
                    onClick={() => navigate(`/organizations/${org.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-primary mb-1 line-clamp-2">
                          {org.name}
                        </h3>
                        {org.acronym && (
                          <Badge variant="secondary" className="text-xs">
                            {org.acronym}
                          </Badge>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {t(`organizations.status.${org.status}`)}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {org.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {org.city}, {org.country}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="w-4 h-4" />
                        <span>{t(`organizations.region.${org.region}`)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{org.employeeCount} {t('organizations.details.employees')}</span>
                      </div>
                    </div>

                    {/* Sectors */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {org.sectors.slice(0, 3).map((sector) => (
                        <Badge key={sector} variant="outline" className="text-xs">
                          {t(`sectors.${sector}`)}
                        </Badge>
                      ))}
                      {org.sectors.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{org.sectors.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/organizations/${org.id}`);
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {t('organizations.myOrganization.expert.viewDetails')}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-12 text-center">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-primary mb-2">
                  {t('organizations.myOrganization.expert.noResults')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('organizations.myOrganization.expert.noResults.description')}
                </p>
              </div>
            )}
          </div>
        </PageContainer>
      </>
    );
  };

  // Render Organization View - Profile Display
  const renderOrganizationView = () => {
    // Merge context data with mock data, giving priority to context
    const organizationData = {
      // Use context data when available, fallback to mock data
      name: organizationProfile.name || myOrganizationData.name,
      acronym: myOrganizationData.acronym,
      type: myOrganizationData.type,
      legalName: myOrganizationData.legalName,
      registrationNumber: myOrganizationData.registrationNumber,
      yearEstablished: myOrganizationData.yearEstablished,
      established: organizationProfile.yearsOfExperience 
        ? String(2026 - organizationProfile.yearsOfExperience)
        : myOrganizationData.established,
      description: organizationProfile.description || myOrganizationData.description,
      
      // Contact & Location
      email: myOrganizationData.email,
      phone: myOrganizationData.phone,
      website: myOrganizationData.website,
      address: myOrganizationData.address,
      city: myOrganizationData.city,
      country: organizationProfile.countries.length > 0 
        ? organizationProfile.countries[0] 
        : myOrganizationData.country,
      postalCode: myOrganizationData.postalCode,
      region: myOrganizationData.region,
      timezone: myOrganizationData.timezone,
      
      // Operations & Expertise
      operatingRegions: myOrganizationData.operatingRegions,
      sectors: organizationProfile.sectors.length > 0 
        ? organizationProfile.sectors 
        : myOrganizationData.sectors,
      selectedSector: organizationProfile.sectors.length > 0 
        ? organizationProfile.sectors[0] 
        : myOrganizationData.selectedSector,
      subsectors: organizationProfile.subsectors.length > 0 
        ? organizationProfile.subsectors 
        : myOrganizationData.subsectors,
      services: myOrganizationData.services,
      languages: organizationProfile.languages.length > 0 
        ? organizationProfile.languages 
        : myOrganizationData.languages,
      
      // Team & Resources
      teamSize: organizationProfile.teamSize || myOrganizationData.teamSize,
      employees: myOrganizationData.employees,
      experts: myOrganizationData.experts,
      technicalCapacity: myOrganizationData.technicalCapacity,
      equipment: myOrganizationData.equipment,
      
      // Financial & Projects
      annualBudget: organizationProfile.budgetRange.max || myOrganizationData.annualBudget,
      budget: myOrganizationData.budget,
      totalBudget: myOrganizationData.totalBudget,
      projectsCompleted: myOrganizationData.projectsCompleted,
      activeProjects: myOrganizationData.activeProjects,
      successRate: myOrganizationData.successRate,
      
      // Certifications & Partnerships
      certifications: myOrganizationData.certifications,
      partnerships: myOrganizationData.partnerships,
      
      // Subscription
      subscriptionPlan: myOrganizationData.subscriptionPlan,
      subscriptionStatus: myOrganizationData.subscriptionStatus,
      renewalDate: myOrganizationData.renewalDate,
      features: myOrganizationData.features,
      selectedServices: myOrganizationData.selectedServices,
      
      // Status
      status: myOrganizationData.status,
    };

    const sections = [
      {
        id: 'information',
        icon: Info,
        labelKey: 'organizations.myOrganization.sections.information',
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
      },
      {
        id: 'contact',
        icon: MapPin,
        labelKey: 'organizations.myOrganization.sections.contact',
        color: 'text-green-500',
        bgColor: 'bg-green-50',
      },
      {
        id: 'operations',
        icon: Briefcase,
        labelKey: 'organizations.myOrganization.sections.operations',
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
      },
      {
        id: 'resources',
        icon: Users,
        labelKey: 'organizations.myOrganization.sections.resources',
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
      },
      {
        id: 'projects',
        icon: FolderKanban,
        labelKey: 'organizations.myOrganization.sections.projects',
        color: 'text-pink-500',
        bgColor: 'bg-pink-50',
      },
      {
        id: 'subscription',
        icon: CreditCard,
        labelKey: 'organizations.myOrganization.sections.subscription',
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-50',
      },
    ];

    // Use completion rate from the organization profile context
    const completionRate = organizationProfile.completionRate;
    const currentSection = sections.find((section) => section.id === activeSection);
    const currentSectionStatus = organizationProfile.validationState.sectionStatuses[
      activeSection as keyof typeof organizationProfile.validationState.sectionStatuses
    ];

    const renderSectionContent = () => {
      switch (activeSection) {
        case 'information':
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('organizations.myOrganization.information.name')}
                  </p>
                  <p className="font-semibold text-primary">{organizationData.name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('organizations.myOrganization.information.acronym')}
                  </p>
                  <p className="font-semibold text-primary">{organizationData.acronym}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('organizations.myOrganization.information.type')}
                  </p>
                  <p className="font-semibold text-primary">
                    {t(`organizations.type.${organizationData.type}`)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('organizations.myOrganization.information.established')}
                  </p>
                  <p className="font-semibold text-primary">{organizationData.established}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('organizations.myOrganization.information.website')}
                  </p>
                  <a
                    href={organizationData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    {organizationData.website}
                  </a>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('organizations.myOrganization.information.status')}
                  </p>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {t(`organizations.status.${organizationData.status}`)}
                  </Badge>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">
                  {t('organizations.myOrganization.information.description')}
                </p>
                <p className="text-primary">{organizationData.description}</p>
              </div>
            </div>
          );

        case 'contact':
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {t('organizations.myOrganization.contact.email')}
                  </p>
                </div>
                <p className="font-semibold text-primary">{organizationData.email}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {t('organizations.myOrganization.contact.phone')}
                  </p>
                </div>
                <p className="font-semibold text-primary">{organizationData.phone}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {t('organizations.myOrganization.contact.address')}
                  </p>
                </div>
                <p className="font-semibold text-primary">{organizationData.address}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">
                  {t('organizations.myOrganization.contact.city')}
                </p>
                <p className="font-semibold text-primary">{organizationData.city}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">
                  {t('organizations.myOrganization.contact.country')}
                </p>
                <p className="font-semibold text-primary">{organizationData.country}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {t('organizations.myOrganization.contact.region')}
                  </p>
                </div>
                <p className="font-semibold text-primary">
                  {t(`organizations.region.${organizationData.region}`)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">
                  {t('organizations.myOrganization.contact.timezone')}
                </p>
                <p className="font-semibold text-primary">{organizationData.timezone}</p>
              </div>
            </div>
          );

        case 'operations':
          return (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {t('organizations.myOrganization.operations.sectors')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {organizationData.sectors.map((sector) => (
                    <Badge key={sector} variant="secondary">
                      {t(`sectors.${sector}`)}
                    </Badge>
                  ))}
                </div>
              </div>
              {organizationData.subsectors && organizationData.subsectors.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    {t('organizations.myOrganization.operations.subsectors')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {organizationData.subsectors.map((subsector) => (
                      <Badge key={subsector} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {t(`subsectors.${subsector}`)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  {t('organizations.myOrganization.operations.services')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {organizationData.services.map((service, idx) => (
                    <Badge key={idx} variant="outline">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {t('organizations.myOrganization.operations.certifications')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {organizationData.certifications.map((cert, idx) => (
                    <Badge key={idx} className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Languages className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {t('organizations.myOrganization.operations.languages')}
                    </p>
                  </div>
                  <p className="font-semibold text-primary">
                    {organizationData.languages.join(', ')}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {t('organizations.myOrganization.operations.budget')}
                    </p>
                  </div>
                  <p className="font-semibold text-primary">{organizationData.budget}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {t('organizations.myOrganization.operations.employees')}
                    </p>
                  </div>
                  <p className="font-semibold text-primary">{organizationData.employees}</p>
                </div>
              </div>
            </div>
          );

        case 'resources':
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('organizations.myOrganization.resources.teamSize')}
                  </p>
                  <p className="text-2xl font-bold text-primary">{organizationData.teamSize}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('organizations.myOrganization.resources.technicalCapacity')}
                  </p>
                  <Badge className="bg-green-50 text-green-700 border-green-200">
                    {organizationData.technicalCapacity}
                  </Badge>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  {t('organizations.myOrganization.resources.equipment')}
                </p>
                <p className="text-primary">{organizationData.equipment}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  {t('organizations.myOrganization.resources.partnerships')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {organizationData.partnerships.map((partner, idx) => (
                    <Badge key={idx} variant="secondary">
                      {partner}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          );

        case 'projects':
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-blue-700">
                    {t('organizations.myOrganization.projects.active')}
                  </p>
                  <FolderKanban className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-blue-900">{organizationData.activeProjects}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-green-700">
                    {t('organizations.myOrganization.projects.completed')}
                  </p>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-900">
                  {organizationData.completedProjects}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-purple-700">
                    {t('organizations.myOrganization.projects.totalBudget')}
                  </p>
                  <DollarSign className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-purple-900">{organizationData.totalBudget}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-orange-700">
                    {t('organizations.myOrganization.projects.successRate')}
                  </p>
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-orange-900">{organizationData.successRate}</p>
              </div>
            </div>
          );

        case 'subscription':
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('organizations.myOrganization.subscription.plan')}
                  </p>
                  <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">
                    {organizationData.subscriptionPlan}
                  </Badge>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('organizations.myOrganization.subscription.status')}
                  </p>
                  <Badge className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {organizationData.subscriptionStatus}
                  </Badge>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {t('organizations.myOrganization.subscription.renewalDate')}
                    </p>
                  </div>
                  <p className="font-semibold text-primary">{organizationData.renewalDate}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-3">
                  {t('organizations.myOrganization.subscription.features')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {organizationData.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-primary">{feature}</span>
                    </div>
                  ))}
                </div>
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
          title={t('organizations.myOrganization.title')}
          description={t('organizations.myOrganization.subtitle')}
          icon={Building2}
          stats={[
            {
              value: completionRate.toString() + '%',
              label: t('organizations.myOrganization.completionRate'),
            },
            { value: organizationData.activeProjects.toString(), label: t('organizations.myOrganization.projects.active') },
            { value: organizationData.subscriptionPlan, label: t('organizations.myOrganization.subscription.plan') },
          ]}
        />

        {/* Sub Menu */}
        <OrganizationsSubMenu />

        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-6">
            {/* AI Matching Banner */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-5 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-primary mb-1">
                    {t('organizations.myOrganization.aiMatching')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('organizations.myOrganization.aiMatching.description')}
                  </p>
                </div>
                <RestrictedTooltip disabled={isRestrictedOrganizationUser} content={restrictedActionMessage}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={canManageAdminActions ? () => navigate('/organizations/edit-profile') : undefined}
                    disabled={!canManageAdminActions}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {t('organizations.myOrganization.edit')}
                  </Button>
                </RestrictedTooltip>
              </div>
            </div>

            {/* Profile Completion Progress */}
            <div className="bg-white rounded-lg border p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-primary">
                  {t('organizations.myOrganization.completionRate')}
                </h3>
                <span className="text-2xl font-bold text-primary">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {completionRate === 100
                  ? 'Profile is complete! Ready for AI matching.'
                  : 'Complete your profile to improve AI matching accuracy'}
              </p>
            </div>

            {organizationProfile.validationState.pendingValidation && (
              <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-900">
                <ShieldAlert className="h-4 w-4 text-amber-700" />
                <AlertTitle>{t('organizations.myOrganization.pendingValidation')}</AlertTitle>
                <AlertDescription>
                  <p>
                    {organizationProfile.validationState.pendingValidationMessage ||
                      t('organizations.myOrganization.pendingValidation')}
                  </p>
                  <p>{t('organizations.myOrganization.validationHint')}</p>
                </AlertDescription>
              </Alert>
            )}

            {/* Section Navigation */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`p-4 rounded-lg border transition-all ${
                      activeSection === section.id
                        ? 'bg-primary text-white border-primary shadow-md'
                        : 'bg-white hover:border-primary/50 hover:shadow-sm'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 mx-auto mb-2 ${
                        activeSection === section.id ? 'text-white' : section.color
                      }`}
                    />
                    <p
                      className={`text-xs font-medium text-center ${
                        activeSection === section.id ? 'text-white' : 'text-primary'
                      }`}
                    >
                      {t(section.labelKey)}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Section Content */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex flex-col gap-3 mb-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-primary">
                    {t(currentSection?.labelKey || '')}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('organizations.myOrganization.validationHint')}
                  </p>
                </div>
                <OrganizationVerificationBadge status={currentSectionStatus} />
              </div>
              <Separator className="mb-6" />
              {renderSectionContent()}
            </div>
          </div>
        </PageContainer>
      </div>
    );
  };

  return accountType === 'expert' ? renderExpertView() : renderOrganizationView();
}