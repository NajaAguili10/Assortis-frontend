import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { PageBanner } from '../../../components/PageBanner';
import { PageContainer } from '../../../components/PageContainer';
import { MonEspaceSubMenu } from '../../../components/MonEspaceSubMenu';
import { JobCard } from '../components/JobCard';
import { JobContactDialog } from '../components/JobContactDialog';
import { ContactHistory, ContactHistoryDetailDialog } from '../components/ContactHistory';
import { useLanguage } from '../../../contexts/LanguageContext';
import { JobOfferListDTO, JobOfferTypeEnum, JobOfferStatusEnum } from '../types/JobOffer.dto';
import { ContactHistoryListDTO, ContactHistoryDTO } from '../types/ContactHistory.dto';
import { getJobOffersByType, getJobOfferById } from '../services/jobOfferService';
import { getContactHistoryByType, getContactHistoryById } from '../services/contactHistoryService';
import { Briefcase, AlertCircle, Search, Filter, X, MapPin, Calendar, Clock, Building2, FileText, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

export default function OffresProjetsPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobOfferListDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobOfferListDTO | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactJob, setContactJob] = useState<JobOfferListDTO | null>(null);
  
  // Contact History States
  const [contactHistory, setContactHistory] = useState<ContactHistoryListDTO[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyDetailDialogOpen, setHistoryDetailDialogOpen] = useState(false);
  const [selectedContactDetail, setSelectedContactDetail] = useState<ContactHistoryDTO | null>(null);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [deadlineFilter, setDeadlineFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadJobs();
    loadContactHistory();
  }, []);

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const data = await getJobOffersByType(JobOfferTypeEnum.PROJECT);
      setJobs(data);
    } catch (error) {
      console.error('Error loading project offers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadContactHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await getContactHistoryByType(JobOfferTypeEnum.PROJECT);
      setContactHistory(data);
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
    loadContactHistory();
  };

  // Extract unique locations from jobs
  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(jobs.map(job => job.location).filter(Boolean))).sort();
  }, [jobs]);

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(job =>
        job.jobTitle.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        (job.projectTitle && job.projectTitle.toLowerCase().includes(query)) ||
        (job.organizationName && job.organizationName.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(job => job.status === statusFilter);
    }

    // Location filter
    if (locationFilter !== 'all') {
      result = result.filter(job => job.location === locationFilter);
    }

    // Deadline filter
    if (deadlineFilter !== 'all') {
      const today = new Date();
      result = result.filter(job => {
        const daysRemaining = job.daysRemaining;
        if (deadlineFilter === 'today') return daysRemaining === 0;
        if (deadlineFilter === 'week') return daysRemaining >= 0 && daysRemaining <= 7;
        if (deadlineFilter === 'month') return daysRemaining >= 0 && daysRemaining <= 30;
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'oldest':
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        case 'deadline':
          return a.daysRemaining - b.daysRemaining;
        case 'title':
          return a.jobTitle.localeCompare(b.jobTitle);
        default:
          return 0;
      }
    });

    return result;
  }, [jobs, searchQuery, statusFilter, locationFilter, deadlineFilter, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setLocationFilter('all');
    setDeadlineFilter('all');
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || locationFilter !== 'all' || deadlineFilter !== 'all' || sortBy !== 'newest';

  const handleViewJob = async (jobId: string) => {
    setIsLoadingDetail(true);
    try {
      const data = await getJobOfferById(jobId);
      setSelectedJob(data);
    } catch (error) {
      console.error('Error loading job details:', error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleBackToList = () => {
    setSelectedJob(null);
  };

  const handleContactJob = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      setContactJob(job);
      setContactDialogOpen(true);
    }
  };

  // Format date display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language, { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Get deadline display text
  const getDeadlineDisplay = (job: JobOfferListDTO) => {
    if (job.daysRemaining === 0) {
      return t('monEspace.deadline.today');
    }
    if (job.daysRemaining < 0) {
      return t('monEspace.deadline.expired');
    }
    return t('monEspace.deadline.days').replace('{days}', job.daysRemaining.toString());
  };

  // If a job is selected, show detail view
  if (selectedJob) {
    const isUrgent = selectedJob.daysRemaining <= 7 && selectedJob.daysRemaining >= 0;

    return (
      <div className="min-h-screen bg-gray-50">
        <PageBanner
          icon={Briefcase}
          title={selectedJob.jobTitle}
          description={
            selectedJob.type === JobOfferTypeEnum.PROJECT && selectedJob.projectTitle
              ? selectedJob.projectTitle
              : selectedJob.organizationName || ''
          }
        />
        
        <MonEspaceSubMenu />

        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">{/* Job Header Card */}
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-primary mb-2">{selectedJob.jobTitle}</h1>
                      {selectedJob.organizationName && (
                        <div className="flex items-center text-gray-600 mb-2">
                          <Building2 className="w-4 h-4 mr-2" />
                          <span className="font-medium">{selectedJob.organizationName}</span>
                        </div>
                      )}
                    </div>
                    {isUrgent && (
                      <Badge variant="secondary" className="bg-badge-warning-bg text-badge-warning-text">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {getDeadlineDisplay(selectedJob)}
                      </Badge>
                    )}
                    {selectedJob.daysRemaining < 0 && (
                      <Badge variant="secondary" className="bg-badge-neutral-bg text-badge-neutral-text">
                        {t('monEspace.deadline.expired')}
                      </Badge>
                    )}
                  </div>

                  {/* Job Meta */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">
                        <span className="font-medium">{t('monEspace.job.location')}:</span> {selectedJob.location}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">
                        <span className="font-medium">{t('monEspace.job.duration')}:</span> {selectedJob.duration}
                      </span>
                    </div>

                    {selectedJob.type === JobOfferTypeEnum.PROJECT && selectedJob.projectTitle && (
                      <div className="flex items-center text-gray-600">
                        <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm">
                          <span className="font-medium">{t('monEspace.job.project')}:</span> {selectedJob.projectTitle}
                        </span>
                      </div>
                    )}

                    {selectedJob.type === JobOfferTypeEnum.INTERNAL && selectedJob.department && (
                      <div className="flex items-center text-gray-600">
                        <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm">
                          <span className="font-medium">{t('monEspace.job.department')}:</span> {selectedJob.department}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">
                        <span className="font-medium">{t('monEspace.job.published')}:</span> {formatDate(selectedJob.publishedAt)}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">
                        <span className="font-medium">{t('monEspace.job.deadline')}:</span> {formatDate(selectedJob.deadline)}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Job Description */}
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    {t('monEspace.form.description')}
                  </h2>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <p>{selectedJob.description || t('monEspace.message.noOffers.description')}</p>
                  </div>
                </Card>

                {/* Additional Sections - would be populated from full job data */}
                {selectedJob.requirements && (
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {t('monEspace.form.requirements')}
                    </h2>
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <p>{selectedJob.requirements}</p>
                    </div>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Status Card */}
                <Card className="p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">
                    {t('monEspace.filter.status')}
                  </h3>
                  <Badge 
                    variant={selectedJob.status === 'published' ? 'default' : 'secondary'}
                    className="w-full justify-center py-2"
                  >
                    {t(`monEspace.job.status.${selectedJob.status}`)}
                  </Badge>
                </Card>

                {/* Application Info */}
                <Card className="p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">
                    {t('monEspace.kpi.totalApplications')}
                  </h3>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {selectedJob.applicationsCount || 0}
                    </div>
                    <div className="text-sm text-gray-500">
                      {t('monEspace.job.applications')}
                    </div>
                  </div>
                </Card>

                {/* Deadline Card */}
                <Card className="p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">
                    {t('monEspace.job.deadline')}
                  </h3>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900 mb-2">
                      {formatDate(selectedJob.deadline)}
                    </div>
                    <div className={`text-sm font-medium ${selectedJob.daysRemaining < 0 ? 'text-gray-500' : isUrgent ? 'text-badge-warning-text' : 'text-gray-600'}`}>
                      {getDeadlineDisplay(selectedJob)}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        icon={Briefcase}
        title={t('monEspace.banner.projectOffers.title')}
        description={t('monEspace.banner.projectOffers.description')}
        stats={[
          {
            value: filteredJobs.length,
            label: t('monEspace.kpi.totalOffers'),
          },
        ]}
      />
      
      <MonEspaceSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Search Bar & Filter Toggle */}
          <div className="bg-white rounded-lg border p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder={t('monEspace.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Toggle Button */}
              <Button
                variant={showFilters ? 'default' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {t('monEspace.filter.title')}
                {hasActiveFilters && (
                  <span className="ml-1 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    •
                  </span>
                )}
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('monEspace.filter.status')}
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('monEspace.filter.status.all')}</SelectItem>
                      <SelectItem value={JobOfferStatusEnum.PUBLISHED}>
                        {t('monEspace.job.status.published')}
                      </SelectItem>
                      <SelectItem value={JobOfferStatusEnum.CLOSED}>
                        {t('monEspace.job.status.closed')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('monEspace.filter.location')}
                  </label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('monEspace.filter.location.all')}</SelectItem>
                      {uniqueLocations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Deadline Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('monEspace.filter.deadline')}
                  </label>
                  <Select value={deadlineFilter} onValueChange={setDeadlineFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('monEspace.filter.deadline.all')}</SelectItem>
                      <SelectItem value="today">{t('monEspace.filter.deadline.today')}</SelectItem>
                      <SelectItem value="week">{t('monEspace.filter.deadline.week')}</SelectItem>
                      <SelectItem value="month">{t('monEspace.filter.deadline.month')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('monEspace.filter.sortBy')}
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">{t('monEspace.filter.sortBy.newest')}</SelectItem>
                      <SelectItem value="oldest">{t('monEspace.filter.sortBy.oldest')}</SelectItem>
                      <SelectItem value="deadline">{t('monEspace.filter.sortBy.deadline')}</SelectItem>
                      <SelectItem value="title">{t('monEspace.filter.sortBy.title')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reset Filters Button */}
                {hasActiveFilters && (
                  <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                    <Button
                      variant="ghost"
                      onClick={handleResetFilters}
                      className="text-sm"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t('monEspace.filter.reset')}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results Count */}
          {!isLoading && (
            <div className="mb-4 text-sm text-gray-600">
              {t('monEspace.filter.results').replace('{count}', filteredJobs.length.toString())}
            </div>
          )}

          {/* Job Listings */}
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              Loading...
            </div>
          ) : filteredJobs.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {jobs.length === 0
                  ? t('monEspace.message.noOffers')
                  : t('monEspace.message.noResults')}
              </AlertDescription>
              {jobs.length > 0 && hasActiveFilters && (
                <p className="text-sm text-muted-foreground mt-2">
                  {t('monEspace.message.noResults.description')}
                </p>
              )}
            </Alert>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onViewDetails={handleViewJob}
                  showActions={true}
                  onContact={handleContactJob}
                />
              ))}
            </div>
          )}

          {/* Contact History Section */}
          <div className="mt-12">
            {isLoadingHistory ? (
              <div className="text-center py-8 text-gray-500">
                {t('loading')}
              </div>
            ) : (
              <ContactHistory
                contacts={contactHistory}
                onViewDetails={handleViewContactDetails}
              />
            )}
          </div>
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
    </div>
  );
}