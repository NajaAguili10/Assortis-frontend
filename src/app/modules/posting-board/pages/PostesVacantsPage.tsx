import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { PageBanner } from '../../../components/PageBanner';
import { PageContainer } from '../../../components/PageContainer';
import { PostingBoardSubMenu } from '../../../components/PostingBoardSubMenu';
import { JobCard } from '../components/JobCard';
import { JobContactDialog } from '../components/JobContactDialog';
import { ContactHistory, ContactHistoryDetailDialog } from '../components/ContactHistory';
import { useLanguage } from '../../../contexts/LanguageContext';
import { JobOfferListDTO, JobOfferTypeEnum, JobOfferStatusEnum } from '../types/JobOffer.dto';
import { ContactHistoryListDTO, ContactHistoryDTO } from '../types/ContactHistory.dto';
import { getJobOffersByType, getJobOfferById } from '../services/jobOfferService';
import { getContactHistoryByType, getContactHistoryById } from '../services/contactHistoryService';
import { Briefcase, Building2, AlertCircle, Search, Filter, X, MapPin, Calendar, Clock, FileText, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

type TabType = 'projects' | 'internal';

export default function PostesVacantsPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get active tab from URL or default to 'projects'
  const [activeTab, setActiveTab] = useState<TabType>((searchParams.get('tab') as TabType) || 'projects');
  
  const [projectJobs, setProjectJobs] = useState<JobOfferListDTO[]>([]);
  const [internalJobs, setInternalJobs] = useState<JobOfferListDTO[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingInternal, setIsLoadingInternal] = useState(true);
  
  const [selectedJob, setSelectedJob] = useState<JobOfferListDTO | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactJob, setContactJob] = useState<JobOfferListDTO | null>(null);
  
  // Contact History States
  const [projectContactHistory, setProjectContactHistory] = useState<ContactHistoryListDTO[]>([]);
  const [internalContactHistory, setInternalContactHistory] = useState<ContactHistoryListDTO[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyDetailDialogOpen, setHistoryDetailDialogOpen] = useState(false);
  const [selectedContactDetail, setSelectedContactDetail] = useState<ContactHistoryDTO | null>(null);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [deadlineFilter, setDeadlineFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProjectJobs();
    loadInternalJobs();
    loadContactHistories();
  }, []);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    const newTab = value as TabType;
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const loadProjectJobs = async () => {
    setIsLoadingProjects(true);
    try {
      const data = await getJobOffersByType(JobOfferTypeEnum.PROJECT);
      setProjectJobs(data);
    } catch (error) {
      console.error('Error loading project offers:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const loadInternalJobs = async () => {
    setIsLoadingInternal(true);
    try {
      const data = await getJobOffersByType(JobOfferTypeEnum.INTERNAL);
      setInternalJobs(data);
    } catch (error) {
      console.error('Error loading internal offers:', error);
    } finally {
      setIsLoadingInternal(false);
    }
  };

  const loadContactHistories = async () => {
    setIsLoadingHistory(true);
    try {
      const [projectHistory, internalHistory] = await Promise.all([
        getContactHistoryByType(JobOfferTypeEnum.PROJECT),
        getContactHistoryByType(JobOfferTypeEnum.INTERNAL)
      ]);
      setProjectContactHistory(projectHistory);
      setInternalContactHistory(internalHistory);
    } catch (error) {
      console.error('Error loading contact history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleViewContactDetails = async (contactId: string) => {
    try {
      const data = await getContactHistoryById(contactId);
      setSelectedContactDetail(data);
      setHistoryDetailDialogOpen(true);
    } catch (error) {
      console.error('Error loading contact details:', error);
    }
  };

  const handleContactSent = () => {
    // Refresh contact history after sending a new contact
    loadContactHistories();
  };

  // Get current jobs and contact history based on active tab
  const currentJobs = activeTab === 'projects' ? projectJobs : internalJobs;
  const currentContactHistory = activeTab === 'projects' ? projectContactHistory : internalContactHistory;
  const isLoading = activeTab === 'projects' ? isLoadingProjects : isLoadingInternal;

  // Extract unique locations from all jobs
  const uniqueLocations = useMemo(() => {
    const allJobs = [...projectJobs, ...internalJobs];
    return Array.from(new Set(allJobs.map(job => job.location).filter(Boolean))).sort();
  }, [projectJobs, internalJobs]);

  // Extract unique departments from internal jobs
  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(internalJobs.map(job => job.department).filter(Boolean))).sort();
  }, [internalJobs]);

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let filtered = [...currentJobs];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job => 
        job.jobTitle.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.organizationName?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        (activeTab === 'projects' && job.projectTitle?.toLowerCase().includes(query)) ||
        (activeTab === 'internal' && job.department?.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(job => job.location === locationFilter);
    }

    // Department filter (for internal jobs)
    if (activeTab === 'internal' && departmentFilter !== 'all') {
      filtered = filtered.filter(job => job.department === departmentFilter);
    }

    // Deadline filter
    if (deadlineFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(job => {
        const deadline = new Date(job.deadline);
        const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (deadlineFilter) {
          case 'urgent': return daysRemaining <= 7 && daysRemaining >= 0;
          case 'thisMonth': return daysRemaining <= 30 && daysRemaining >= 0;
          case 'expired': return daysRemaining < 0;
          default: return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'oldest':
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        case 'deadline':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'title':
          return a.jobTitle.localeCompare(b.jobTitle);
        default:
          return 0;
      }
    });

    return filtered;
  }, [currentJobs, searchQuery, statusFilter, locationFilter, departmentFilter, deadlineFilter, sortBy, activeTab]);

  // Get active filters count
  const activeFiltersCount = [
    statusFilter !== 'all',
    locationFilter !== 'all',
    departmentFilter !== 'all',
    deadlineFilter !== 'all',
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setStatusFilter('all');
    setLocationFilter('all');
    setDepartmentFilter('all');
    setDeadlineFilter('all');
    setSearchQuery('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    
    const localeMap = {
      en: 'en-US',
      fr: 'fr-FR',
      es: 'es-ES'
    };
    
    return date.toLocaleDateString(localeMap[language as keyof typeof localeMap] || 'en-US', options);
  };

  const getDeadlineDisplay = (job: JobOfferListDTO) => {
    const daysRemaining = job.daysRemaining;
    if (daysRemaining < 0) {
      return t('monEspace.deadline.expired');
    } else if (daysRemaining === 0) {
      return t('monEspace.deadline.today');
    } else if (daysRemaining === 1) {
      return t('monEspace.deadline.tomorrow');
    } else if (daysRemaining <= 7) {
      return `${daysRemaining} ${t('monEspace.deadline.daysLeft')}`;
    } else {
      return '';
    }
  };

  const renderJobList = () => {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <p className="mt-4 text-gray-600">{t('monEspace.message.loading')}</p>
        </div>
      );
    }

    if (filteredJobs.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {searchQuery || activeFiltersCount > 0
              ? t('monEspace.message.noResults')
              : t('monEspace.message.noOffers.description')
            }
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onViewDetails={(id) => navigate(`/posting-board/detail/${id}`)}
            onContact={() => {
              setContactJob(job);
              setContactDialogOpen(true);
            }}
            showActions={true}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <PageBanner
        icon={Briefcase}
        title={t('monEspace.nav.vacancies')}
        subtitle={t('monEspace.banner.vacancies.description')}
      />

      {/* Sub Menu */}
      <PostingBoardSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          
          {/* Tabs for Projects and Internal */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
            <TabsList>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                {t('monEspace.nav.projectOffers')}
              </TabsTrigger>
              <TabsTrigger value="internal" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {t('monEspace.nav.internalOffers')}
              </TabsTrigger>
            </TabsList>

            {/* Projects Tab Content */}
            <TabsContent value="projects" className="mt-6">
              {/* Search and Filters */}
              <div className="mb-6 space-y-4">
                {/* Search Bar */}
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder={t('monEspace.search.placeholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    {t('monEspace.filter.title')}
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-1 bg-accent text-white">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                  <Card className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t('monEspace.filters.status')}</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t('monEspace.filters.allStatuses')}</SelectItem>
                            <SelectItem value={JobOfferStatusEnum.PUBLISHED}>{t('monEspace.status.published')}</SelectItem>
                            <SelectItem value={JobOfferStatusEnum.DRAFT}>{t('monEspace.status.draft')}</SelectItem>
                            <SelectItem value={JobOfferStatusEnum.CLOSED}>{t('monEspace.status.closed')}</SelectItem>
                            <SelectItem value={JobOfferStatusEnum.CANCELLED}>{t('monEspace.status.cancelled')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">{t('monEspace.filters.location')}</label>
                        <Select value={locationFilter} onValueChange={setLocationFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t('monEspace.filters.allLocations')}</SelectItem>
                            {uniqueLocations.map(location => (
                              <SelectItem key={location} value={location}>{location}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">{t('monEspace.filters.deadline')}</label>
                        <Select value={deadlineFilter} onValueChange={setDeadlineFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t('monEspace.filters.allDeadlines')}</SelectItem>
                            <SelectItem value="urgent">{t('monEspace.filters.urgent')}</SelectItem>
                            <SelectItem value="thisMonth">{t('monEspace.filters.thisMonth')}</SelectItem>
                            <SelectItem value="expired">{t('monEspace.filters.expired')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">{t('monEspace.filters.sortBy')}</label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">{t('monEspace.sort.newest')}</SelectItem>
                            <SelectItem value="oldest">{t('monEspace.sort.oldest')}</SelectItem>
                            <SelectItem value="deadline">{t('monEspace.sort.deadline')}</SelectItem>
                            <SelectItem value="title">{t('monEspace.sort.title')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {activeFiltersCount > 0 && (
                      <div className="mt-4 flex justify-end">
                        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="flex items-center gap-2">
                          <X className="w-4 h-4" />
                          {t('monEspace.filters.clearAll')}
                        </Button>
                      </div>
                    )}
                  </Card>
                )}
              </div>

              {/* Job List */}
              {renderJobList()}

              {/* Contact History */}
              {projectContactHistory.length > 0 && (
                <div className="mt-8">
                  <ContactHistory
                    contacts={projectContactHistory}
                    onViewDetails={handleViewContactDetails}
                    isLoading={isLoadingHistory}
                  />
                </div>
              )}
            </TabsContent>

            {/* Internal Tab Content */}
            <TabsContent value="internal" className="mt-6">
              {/* Search and Filters */}
              <div className="mb-6 space-y-4">
                {/* Search Bar */}
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder={t('monEspace.search.placeholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    {t('monEspace.filter.title')}
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-1 bg-accent text-white">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                  <Card className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t('monEspace.filters.status')}</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t('monEspace.filters.allStatuses')}</SelectItem>
                            <SelectItem value={JobOfferStatusEnum.PUBLISHED}>{t('monEspace.status.published')}</SelectItem>
                            <SelectItem value={JobOfferStatusEnum.DRAFT}>{t('monEspace.status.draft')}</SelectItem>
                            <SelectItem value={JobOfferStatusEnum.CLOSED}>{t('monEspace.status.closed')}</SelectItem>
                            <SelectItem value={JobOfferStatusEnum.CANCELLED}>{t('monEspace.status.cancelled')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">{t('monEspace.filters.department')}</label>
                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t('monEspace.filters.allDepartments')}</SelectItem>
                            {uniqueDepartments.map(dept => (
                              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">{t('monEspace.filters.deadline')}</label>
                        <Select value={deadlineFilter} onValueChange={setDeadlineFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t('monEspace.filters.allDeadlines')}</SelectItem>
                            <SelectItem value="urgent">{t('monEspace.filters.urgent')}</SelectItem>
                            <SelectItem value="thisMonth">{t('monEspace.filters.thisMonth')}</SelectItem>
                            <SelectItem value="expired">{t('monEspace.filters.expired')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">{t('monEspace.filters.sortBy')}</label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">{t('monEspace.sort.newest')}</SelectItem>
                            <SelectItem value="oldest">{t('monEspace.sort.oldest')}</SelectItem>
                            <SelectItem value="deadline">{t('monEspace.sort.deadline')}</SelectItem>
                            <SelectItem value="title">{t('monEspace.sort.title')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {activeFiltersCount > 0 && (
                      <div className="mt-4 flex justify-end">
                        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="flex items-center gap-2">
                          <X className="w-4 h-4" />
                          {t('monEspace.filters.clearAll')}
                        </Button>
                      </div>
                    )}
                  </Card>
                )}
              </div>

              {/* Job List */}
              {renderJobList()}

              {/* Contact History */}
              {internalContactHistory.length > 0 && (
                <div className="mt-8">
                  <ContactHistory
                    contacts={internalContactHistory}
                    onViewDetails={handleViewContactDetails}
                    isLoading={isLoadingHistory}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>

      {/* Contact Dialog */}
      <JobContactDialog
        open={contactDialogOpen}
        onClose={() => setContactDialogOpen(false)}
        jobOffer={contactJob}
        onContactSent={handleContactSent}
      />

      {/* Contact History Detail Dialog */}
      <ContactHistoryDetailDialog
        open={historyDetailDialogOpen}
        onClose={() => setHistoryDetailDialogOpen(false)}
        contact={selectedContactDetail}
      />
    </>
  );
}