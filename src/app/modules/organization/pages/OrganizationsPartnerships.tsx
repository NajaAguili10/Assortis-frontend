import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OrganizationsSubMenu } from '@app/components/OrganizationsSubMenu';
import { RestrictedTooltip } from '@app/components/RestrictedTooltip';
import { StatCard } from '@app/components/StatCard';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';
import { useOrganizations } from '@app/modules/organization/hooks/useOrganizations';
import { canManageOrganizationAdminActions, isOrganizationUserRole } from '@app/services/permissions.service';
import { 
  Building2, 
  Handshake, 
  TrendingUp,
  Search,
  Filter,
  Calendar,
  MapPin,
  Briefcase,
  FileText,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  ChevronDown,
  X,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';

interface Partnership {
  id: string;
  organizationName: string;
  organizationType: string;
  partnershipType: 'strategic' | 'operational' | 'consortium' | 'collaboration';
  status: 'active' | 'pending' | 'completed' | 'terminated';
  startDate: string;
  endDate?: string;
  sector: string;
  region: string;
  projectsCount: number;
  // References
  tenderReference?: string;
  tenderTitle?: string;
  projectCode?: string;
  projectTitle?: string;
  description?: string;
}

// Mock partnerships data
const mockPartnerships: Partnership[] = [
  {
    id: '1',
    organizationName: 'World Health Organization',
    organizationType: 'International Organization',
    partnershipType: 'consortium',
    status: 'active',
    startDate: '2024-01-15',
    sector: 'Health',
    region: 'Africa',
    projectsCount: 3,
    tenderReference: 'REF-2024-002',
    tenderTitle: 'Healthcare System Modernization',
    description: 'Strategic consortium for healthcare infrastructure development in Sub-Saharan Africa',
  },
  {
    id: '2',
    organizationName: 'Red Cross International',
    organizationType: 'NGO',
    partnershipType: 'collaboration',
    status: 'active',
    startDate: '2024-02-20',
    sector: 'Humanitarian Aid',
    region: 'Global',
    projectsCount: 5,
    projectCode: 'PROJ-2024-002',
    projectTitle: 'Community Health Centers Network',
    description: 'Operational collaboration for emergency response and community health programs',
  },
  {
    id: '3',
    organizationName: 'Global Education Alliance',
    organizationType: 'International Organization',
    partnershipType: 'consortium',
    status: 'pending',
    startDate: '2024-03-01',
    sector: 'Education',
    region: 'Asia',
    projectsCount: 0,
    tenderReference: 'REF-2024-003',
    tenderTitle: 'Education Quality Improvement Program',
    description: 'Consortium partnership for education infrastructure and quality enhancement',
  },
  {
    id: '4',
    organizationName: 'UNESCO',
    organizationType: 'UN Agency',
    partnershipType: 'collaboration',
    status: 'active',
    startDate: '2024-02-10',
    endDate: '2025-12-31',
    sector: 'Culture & Education',
    region: 'Middle East',
    projectsCount: 2,
    projectCode: 'PROJ-2024-001',
    projectTitle: 'Rural Education Infrastructure Development',
    description: 'Project-based collaboration for cultural preservation and education development',
  },
  {
    id: '5',
    organizationName: 'Doctors Without Borders',
    organizationType: 'NGO',
    partnershipType: 'collaboration',
    status: 'completed',
    startDate: '2023-05-15',
    endDate: '2024-01-31',
    sector: 'Health',
    region: 'Latin America',
    projectsCount: 4,
    projectCode: 'PROJ-2023-005',
    projectTitle: 'Emergency Medical Response Initiative',
    description: 'Emergency medical intervention and capacity building collaboration',
  },
  {
    id: '6',
    organizationName: 'World Bank',
    organizationType: 'Financial Institution',
    partnershipType: 'strategic',
    status: 'active',
    startDate: '2023-09-01',
    sector: 'Development',
    region: 'Global',
    projectsCount: 8,
    description: 'Strategic financial partnership for development projects worldwide',
  },
  {
    id: '7',
    organizationName: 'African Development Bank',
    organizationType: 'Financial Institution',
    partnershipType: 'consortium',
    status: 'active',
    startDate: '2024-01-20',
    sector: 'Infrastructure',
    region: 'Africa',
    projectsCount: 4,
    tenderReference: 'REF-2024-001',
    tenderTitle: 'Rural Water Infrastructure Development',
    description: 'Consortium for rural infrastructure and water access programs',
  },
  {
    id: '8',
    organizationName: 'Save the Children',
    organizationType: 'NGO',
    partnershipType: 'collaboration',
    status: 'active',
    startDate: '2024-02-05',
    sector: 'Child Protection',
    region: 'Asia',
    projectsCount: 6,
    projectCode: 'PROJ-2024-005',
    projectTitle: 'Youth Skills Development Initiative',
    description: 'Child protection and youth development collaboration',
  },
];

export default function OrganizationsPartnerships() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { kpis } = useOrganizations();
  const isRestrictedOrganizationUser = isOrganizationUserRole(user?.accountType, user?.role);
  const canManageAdminActions = canManageOrganizationAdminActions(user?.accountType, user?.role);
  const restrictedActionMessage = t('permissions.organization.adminOnlyAction');
  
  const [partnerships] = useState<Partnership[]>(mockPartnerships);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  // Partnership types
  const partnershipTypes = [
    { value: 'strategic', label: 'strategic' },
    { value: 'operational', label: 'operational' },
    { value: 'consortium', label: 'consortium' },
    { value: 'collaboration', label: 'collaboration' },
  ];

  // Partnership statuses
  const partnershipStatuses = [
    { value: 'active', label: 'active' },
    { value: 'pending', label: 'pending' },
    { value: 'completed', label: 'completed' },
    { value: 'terminated', label: 'terminated' },
  ];

  // Filter partnerships
  const filteredPartnerships = partnerships.filter(partnership => {
    const matchesSearch = 
      partnership.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partnership.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partnership.region.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(partnership.partnershipType);
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(partnership.status);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getPartnershipTypeBadge = (type: string) => {
    switch (type) {
      case 'strategic':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'operational':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'consortium':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'collaboration':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-50 text-green-700 border-green-200', icon: <CheckCircle className="w-3 h-3" /> };
      case 'pending':
        return { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: <Clock className="w-3 h-3" /> };
      case 'completed':
        return { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <CheckCircle className="w-3 h-3" /> };
      case 'terminated':
        return { color: 'bg-red-50 text-red-700 border-red-200', icon: <XCircle className="w-3 h-3" /> };
      default:
        return { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: <Clock className="w-3 h-3" /> };
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleTypeFilter = (type: string) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(newTypes);
  };

  const handleStatusFilter = (status: string) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status];
    setSelectedStatuses(newStatuses);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedTypes([]);
    setSelectedStatuses([]);
  };

  const activeFiltersCount = selectedTypes.length + selectedStatuses.length;

  const handleViewDetails = (partnership: Partnership) => {
    navigate(`/organizations/partnership-detail/${partnership.id}`);
  };

  const handleCreatePartnership = () => {
    navigate('/organizations/invite');
  };

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <PageBanner
        title={t('organizations.hub.title')}
        description={t('organizations.hub.subtitle')}
        icon={Building2}
        stats={[
          { value: kpis.totalOrganizations.toString(), label: t('organizations.kpis.totalOrganizations') },
          { value: kpis.activeOrganizations.toString(), label: t('organizations.kpis.activeOrganizations') },
          { value: kpis.partnerships.toString(), label: t('organizations.kpis.partnerships') }
        ]}
      />

      {/* Sub Menu */}
      <OrganizationsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Page Title & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-primary">{t('organizations.partnerships.title')}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t('organizations.partnerships.subtitle')}</p>
            </div>
            <RestrictedTooltip disabled={isRestrictedOrganizationUser} content={restrictedActionMessage}>
              <Button
                onClick={canManageAdminActions ? handleCreatePartnership : undefined}
                className="bg-primary hover:bg-primary/90"
                disabled={!canManageAdminActions}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('organizations.partnerships.create')}
              </Button>
            </RestrictedTooltip>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <StatCard
              title={t('organizations.partnerships.active')}
              value={partnerships.filter(p => p.status === 'active').length.toString()}
              trend="+12%"
              icon={Handshake}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-500"
            />
            <StatCard
              title={t('organizations.kpis.newPartnerships')}
              value={partnerships.filter(p => p.status === 'pending').length.toString()}
              subtitle={t('organizations.partnerships.pending')}
              icon={TrendingUp}
              iconBgColor="bg-green-50"
              iconColor="text-green-500"
            />
            <StatCard
              title={t('organizations.partnerships.completed')}
              value={partnerships.filter(p => p.status === 'completed').length.toString()}
              subtitle={t('dashboard.total')}
              icon={CheckCircle}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
            />
            <StatCard
              title={t('organizations.partnerships.projects')}
              value={partnerships.reduce((sum, p) => sum + p.projectsCount, 0).toString()}
              subtitle={t('dashboard.total')}
              icon={Briefcase}
              iconBgColor="bg-orange-50"
              iconColor="text-orange-500"
            />
          </div>

          <Separator className="my-6" />

          {/* Horizontal Filters Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-primary">
                  {t('tenders.list.filters')}
                </h3>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">{activeFiltersCount}</Badge>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="w-4 h-4 mr-1" />
                  {t('filters.clear')}
                </Button>
              )}
            </div>

            {/* Search Row */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t('common.search')}
              </label>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={t('organizations.partnerships.search.placeholder')}
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            </div>

            {/* Filters Row - Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Partnership Type Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {t('organizations.partnerships.filter.type')}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Handshake className="w-4 h-4 mr-2" />
                      {selectedTypes.length > 0 
                        ? t(`organizations.partnerships.type.${selectedTypes[0]}`)
                        : t('organizations.partnerships.filter.type')}
                      {selectedTypes.length > 0 && (
                        <Badge className="ml-auto" variant="secondary">
                          {selectedTypes.length}
                        </Badge>
                      )}
                      <ChevronDown className="w-4 h-4 ml-auto" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72" align="start">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm mb-3">{t('organizations.partnerships.filter.type')}</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {partnershipTypes.map((type) => (
                          <Button
                            key={type.value}
                            variant={selectedTypes.includes(type.value) ? "default" : "outline"}
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => handleTypeFilter(type.value)}
                          >
                            {selectedTypes.includes(type.value) && <CheckCircle className="w-3 h-3 mr-2" />}
                            {t(`organizations.partnerships.type.${type.label}`)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Partnership Status Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {t('filters.status')}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Target className="w-4 h-4 mr-2" />
                      {selectedStatuses.length > 0 
                        ? t(`organizations.partnerships.status.${selectedStatuses[0]}`)
                        : t('filters.selectStatus')}
                      {selectedStatuses.length > 0 && (
                        <Badge className="ml-auto" variant="secondary">
                          {selectedStatuses.length}
                        </Badge>
                      )}
                      <ChevronDown className="w-4 h-4 ml-auto" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72" align="start">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm mb-3">{t('filters.status')}</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {partnershipStatuses.map((status) => (
                          <Button
                            key={status.value}
                            variant={selectedStatuses.includes(status.value) ? "default" : "outline"}
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => handleStatusFilter(status.value)}
                          >
                            {selectedStatuses.includes(status.value) && <CheckCircle className="w-3 h-3 mr-2" />}
                            {t(`organizations.partnerships.status.${status.label}`)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="mt-5 pt-5 border-t border-gray-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-700">
                    {t('filters.active')}:
                  </span>
                  {selectedTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="gap-1">
                      {t(`organizations.partnerships.type.${type}`)}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-destructive"
                        onClick={() => handleTypeFilter(type)}
                      />
                    </Badge>
                  ))}
                  {selectedStatuses.map((status) => (
                    <Badge key={status} variant="secondary" className="gap-1">
                      {t(`organizations.partnerships.status.${status}`)}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-destructive"
                        onClick={() => handleStatusFilter(status)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Partnerships Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredPartnerships.length > 0 ? (
              filteredPartnerships.map((partnership) => {
                const statusBadge = getStatusBadge(partnership.status);
                return (
                  <div
                    key={partnership.id}
                    className="bg-white rounded-xl border p-6 hover:shadow-lg transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Handshake className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-primary text-lg mb-1 truncate">
                            {partnership.organizationName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {partnership.organizationType}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={statusBadge.color}>
                        {statusBadge.icon}
                        <span className="ml-1">{t(`organizations.partnerships.status.${partnership.status}`)}</span>
                      </Badge>
                    </div>

                    <Separator className="my-4" />

                    {/* Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <Badge variant="outline" className={getPartnershipTypeBadge(partnership.partnershipType)}>
                          {t(`organizations.partnerships.type.${partnership.partnershipType}`)}
                        </Badge>
                      </div>

                      {/* Description */}
                      {partnership.description && (
                        <div className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                          {partnership.description}
                        </div>
                      )}

                      {/* Tender Reference for Consortium */}
                      {partnership.partnershipType === 'consortium' && partnership.tenderReference && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-orange-900 mb-1">
                                {t('organizations.partnerships.tenderReference')}
                              </p>
                              <p className="text-xs font-semibold text-orange-700">
                                {partnership.tenderReference}
                              </p>
                              <p className="text-xs text-orange-600 truncate mt-1">
                                {partnership.tenderTitle}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Project Reference for Collaboration */}
                      {partnership.partnershipType === 'collaboration' && partnership.projectCode && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <Briefcase className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-green-900 mb-1">
                                {t('organizations.partnerships.projectReference')}
                              </p>
                              <p className="text-xs font-semibold text-green-700">
                                {partnership.projectCode}
                              </p>
                              <p className="text-xs text-green-600 truncate mt-1">
                                {partnership.projectTitle}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{partnership.sector} • {partnership.region}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {new Date(partnership.startDate).toLocaleDateString()}
                          {partnership.endDate && ` - ${new Date(partnership.endDate).toLocaleDateString()}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span>{partnership.projectsCount} {t('organizations.partnerships.projects')}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewDetails(partnership)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {t('organizations.partnerships.viewDetails')}
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 bg-white rounded-lg border p-12 text-center">
                <Handshake className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-primary mb-2">
                  {t('organizations.partnerships.noResults')}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {t('organizations.partnerships.noResults.description')}
                </p>
                <Button onClick={handleCreatePartnership} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('organizations.partnerships.create')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}