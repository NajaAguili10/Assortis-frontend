import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@app/contexts/AuthContext';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ProjectsSubMenu } from '@app/components/ProjectsSubMenu';
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
import { useProjects } from '@app/hooks/useProjects';
import { useOrganizations } from '@app/modules/organization/hooks/useOrganizations';
import { useOrganizationBookmarks } from '@app/modules/shared/hooks/useOrganizationBookmarks';
import { 
  Briefcase, 
  Handshake, 
  TrendingUp,
  Search,
  Filter,
  FileText,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  ChevronDown,
  X,
  Target,
  Bookmark,
  Eye,
  EyeOff,
} from 'lucide-react';

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
  tenderReference?: string;
  tenderTitle?: string;
  projectCode?: string;
  projectTitle?: string;
  description?: string;
}

// Mock partnerships data - reused from Organization Partnerships
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
];

export default function ProjectsCollaborations() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { kpis } = useProjects();
  const { allOrganizations } = useOrganizations();
  const { bookmarkedOrganizationIds, isBookmarked, toggleBookmark } = useOrganizationBookmarks();
  const shouldShowBookmarkButton = user?.accountType !== 'expert';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const HIDDEN_PARTNERS_KEY = 'projects.collaborations.hiddenPartners';
  const [hiddenPartnerIds, setHiddenPartnerIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(HIDDEN_PARTNERS_KEY) || '[]'); } catch { return []; }
  });
  const [showHidden, setShowHidden] = useState(false);

  const toggleHidePartner = (id: string) => {
    setHiddenPartnerIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(HIDDEN_PARTNERS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const partnerships = useMemo<Partnership[]>(() => {
    return allOrganizations
      .filter((organization) => bookmarkedOrganizationIds.includes(organization.id))
      .map((organization) => ({
        id: organization.id,
        organizationName: organization.name,
        organizationType: t(`organizations.type.${organization.type}`),
        partnershipType: 'collaboration',
        status: organization.status === 'VERIFIED' ? 'active' : 'pending',
        startDate: organization.createdAt.toISOString().split('T')[0],
        sector: organization.sectors[0] ? t(`sectors.${organization.sectors[0]}`) : '-',
        region: t(`organizations.region.${organization.region}`),
        projectsCount: organization.activeProjects,
        description: organization.description,
      }));
  }, [allOrganizations, bookmarkedOrganizationIds, t]);

  const partnershipTypes = [
    { value: 'strategic', label: 'Strategic' },
    { value: 'operational', label: 'Operational' },
    { value: 'consortium', label: 'Consortium' },
    { value: 'collaboration', label: 'Collaboration' },
  ];

  const partnershipStatuses = [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'terminated', label: 'Terminated' },
  ];

  const filteredPartnerships = partnerships.filter(partnership => {
    const matchesSearch = 
      partnership.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partnership.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partnership.region.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(partnership.partnershipType);
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(partnership.status);
    const isVisible = showHidden || !hiddenPartnerIds.includes(partnership.id);
    
    return matchesSearch && matchesType && matchesStatus && isVisible;
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
    navigate(`/search/organizations/${partnership.id}`);
  };

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <PageBanner
        title={t('projects.hub.title')}
        description={t('projects.hub.subtitle')}
        icon={Briefcase}
        stats={[
          { value: kpis.activeProjects.toString(), label: t('projects.stats.activeProjects') }
        ]}
      />

      {/* Sub Menu */}
      <ProjectsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Page Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary">{t('projects.submenu.collaborations')}</h2>
            <p className="text-sm text-muted-foreground mt-1">View and manage bookmarked organizations</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <StatCard
              title="Bookmarked Organizations"
              value={partnerships.length.toString()}
              trend="+12%"
              icon={Bookmark}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-500"
            />
            <StatCard
              title="Pending"
              value={partnerships.filter(p => p.status === 'pending').length.toString()}
              subtitle="Awaiting approval"
              icon={TrendingUp}
              iconBgColor="bg-green-50"
              iconColor="text-green-500"
            />
            <StatCard
              title="Completed"
              value={partnerships.filter(p => p.status === 'completed').length.toString()}
              subtitle="Total partnerships"
              icon={CheckCircle}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
            />
            <StatCard
              title="Total Projects"
              value={partnerships.reduce((sum, p) => sum + p.projectsCount, 0).toString()}
              subtitle="Across all partnerships"
              icon={Briefcase}
              iconBgColor="bg-orange-50"
              iconColor="text-orange-500"
            />
          </div>

          <Separator className="my-6" />

          {/* Filters Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-primary">Filters</h3>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">{activeFiltersCount}</Badge>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear filters
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
                  placeholder="Search partnerships..."
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Partnership Type Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Partnership Type
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {partnershipTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Status
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {partnershipStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Partnerships Grid */}
          {hiddenPartnerIds.filter(id => partnerships.some(p => p.id === id)).length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                {hiddenPartnerIds.filter(id => partnerships.some(p => p.id === id)).length} organisation{hiddenPartnerIds.filter(id => partnerships.some(p => p.id === id)).length > 1 ? 's' : ''} hidden
              </span>
              <Button variant="outline" size="sm" onClick={() => setShowHidden((v) => !v)}>
                {showHidden ? <><EyeOff className="w-4 h-4 mr-1.5" />Hide hidden</> : <><Eye className="w-4 h-4 mr-1.5" />Show hidden</>}
              </Button>
            </div>
          )}
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
                        <span className="ml-1 capitalize">{partnership.status}</span>
                      </Badge>
                    </div>

                    <Separator className="my-4" />

                    {/* Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <Badge variant="outline" className={getPartnershipTypeBadge(partnership.partnershipType)}>
                          {partnershipTypes.find(t => t.value === partnership.partnershipType)?.label}
                        </Badge>
                      </div>

                      {/* Description */}
                      {partnership.description && (
                        <div className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                          {partnership.description}
                        </div>
                      )}

                      {/* Sector & Region */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span><strong>Sector:</strong> {partnership.sector}</span>
                        <span><strong>Region:</strong> {partnership.region}</span>
                      </div>

                      {/* Projects Count */}
                      <div className="text-sm text-gray-600">
                        <strong>Active Projects:</strong> {partnership.projectsCount}
                      </div>
                    </div>

                    {/* View Details Button */}
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={() => handleViewDetails(partnership)} 
                        variant="outline" 
                        className="flex-1"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        title={hiddenPartnerIds.includes(partnership.id) ? 'Show organisation' : 'Hide organisation'}
                        onClick={() => toggleHidePartner(partnership.id)}
                      >
                        {hiddenPartnerIds.includes(partnership.id) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                    </div>
                    {shouldShowBookmarkButton && (
                      <Button
                        variant="ghost"
                        className="w-full mt-2"
                        onClick={() => toggleBookmark(partnership.id)}
                      >
                        {isBookmarked(partnership.id) ? t('organizations.actions.removeBookmark') : t('organizations.actions.bookmark')}
                      </Button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center">
                <Handshake className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-primary">No bookmarked organizations yet</h3>
                <p className="text-sm text-muted-foreground">Bookmark organizations from Project Detail or Search pages.</p>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}