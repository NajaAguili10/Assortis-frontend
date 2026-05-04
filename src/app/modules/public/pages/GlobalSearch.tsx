import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Search, Filter, X, FileText, BarChart3, Users, Building2, GraduationCap, BookOpen, Award, User, ChevronRight, Headphones, FileQuestion, Library, Gift, HelpCircle, Shield } from 'lucide-react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { SubMenu } from '@app/components/SubMenu';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { useTenders } from '@app/hooks/useTenders';
import { useProjects } from '@app/hooks/useProjects';
import { useExperts } from '@app/modules/expert/hooks/useExperts';
import { useOrganizations } from '@app/modules/organization/hooks/useOrganizations';
import { useTraining } from '@app/hooks/useTraining';
import { useAssistance } from '@app/hooks/useAssistance';
import { useFAQContent, useOffersHubContent } from '@app/hooks/useOffersContent';
import { TenderStatusEnum, TenderSectorEnum } from '@app/types/tender.dto';
import { ProjectStatusEnum } from '@app/types/project.dto';
import { ExpertStatusEnum } from '@app/modules/expert/types/expert.dto';
import { OrganizationTypeEnum } from '@app/types/organization.dto';

type SearchCategory = 'all' | 'tenders' | 'projects' | 'experts' | 'organizations' | 'training' | 'assistance' | 'offers' | 'faq' | 'memberArea';

export default function GlobalSearch() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial query from URL params
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = (searchParams.get('category') || 'all') as SearchCategory;
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<SearchCategory>(initialCategory);
  const [isSearching, setIsSearching] = useState(false);

  // Hooks for data
  const { allTenders } = useTenders();
  const { allProjects } = useProjects();
  const { allExperts } = useExperts();
  const { allOrganizations } = useOrganizations();
  const { allCourses, trainers, certifications } = useTraining();
  const { allAssistance } = useAssistance();
  const { data: faqData } = useFAQContent();
  const { data: offersData } = useOffersHubContent();

  // Update URL when search changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (activeCategory !== 'all') params.set('category', activeCategory);
    setSearchParams(params, { replace: true });
  }, [searchQuery, activeCategory, setSearchParams]);

  // Search with debounce
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter functions
  const filteredTenders = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return allTenders.filter(tender =>
      tender.title?.toLowerCase().includes(query) ||
      tender.description?.toLowerCase().includes(query) ||
      tender.organization?.toLowerCase().includes(query) ||
      tender.reference?.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [allTenders, searchQuery]);

  const filteredProjects = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return allProjects.filter(project =>
      project.title?.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query) ||
      project.leadOrganization?.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [allProjects, searchQuery]);

  const filteredExperts = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return allExperts.filter(expert =>
      expert.firstName?.toLowerCase().includes(query) ||
      expert.lastName?.toLowerCase().includes(query) ||
      expert.title?.toLowerCase().includes(query) ||
      expert.bio?.toLowerCase().includes(query) ||
      expert.skills?.some(skill => skill?.toLowerCase().includes(query))
    ).slice(0, 10);
  }, [allExperts, searchQuery]);

  const filteredOrganizations = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return allOrganizations.filter(org =>
      (org.name?.toLowerCase().includes(query) ?? false) ||
      (org.description?.toLowerCase().includes(query) ?? false) ||
      (org.country?.name?.toLowerCase().includes(query) ?? false)
    ).slice(0, 10);
  }, [allOrganizations, searchQuery]);

  const filteredCourses = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return allCourses.filter(course =>
      course.title?.toLowerCase().includes(query) ||
      course.description?.toLowerCase().includes(query) ||
      course.instructor?.name?.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [allCourses, searchQuery]);

  const filteredTrainers = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return trainers.filter(trainer =>
      trainer.name?.toLowerCase().includes(query) ||
      trainer.title?.toLowerCase().includes(query) ||
      trainer.organization?.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [trainers, searchQuery]);

  const filteredCertifications = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return certifications.filter(cert =>
      cert.title?.toLowerCase().includes(query) ||
      cert.description?.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [certifications, searchQuery]);

  const filteredAssistance = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return allAssistance.filter(assistance =>
      assistance.title?.toLowerCase().includes(query) ||
      assistance.description?.toLowerCase().includes(query) ||
      assistance.category?.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [allAssistance, searchQuery]);

  const filteredFAQs = useMemo(() => {
    if (!searchQuery || !faqData) return [];
    const query = searchQuery.toLowerCase();
    return (faqData.items || []).filter(faq =>
      faq.question?.[language]?.toLowerCase().includes(query) ||
      faq.answer?.[language]?.toLowerCase().includes(query) ||
      faq.question?.en?.toLowerCase().includes(query) ||
      faq.answer?.en?.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [faqData, searchQuery, language]);

  const filteredOffers = useMemo(() => {
    if (!searchQuery || !offersData) return [];
    const query = searchQuery.toLowerCase();
    return (offersData.plans || []).filter(plan =>
      plan.name?.[language]?.toLowerCase().includes(query) ||
      plan.description?.[language]?.toLowerCase().includes(query) ||
      plan.name?.en?.toLowerCase().includes(query) ||
      plan.description?.en?.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [offersData, searchQuery, language]);

  // Calculate totals
  const totalResults = {
    all: filteredTenders.length + filteredProjects.length + filteredExperts.length + filteredOrganizations.length + filteredCourses.length + filteredTrainers.length + filteredCertifications.length + filteredAssistance.length + filteredFAQs.length + filteredOffers.length,
    tenders: filteredTenders.length,
    projects: filteredProjects.length,
    experts: filteredExperts.length,
    organizations: filteredOrganizations.length,
    training: filteredCourses.length + filteredTrainers.length + filteredCertifications.length,
    assistance: filteredAssistance.length,
    faq: filteredFAQs.length,
    offers: filteredOffers.length,
  };

  const categories = [
    { id: 'all' as SearchCategory, label: t('search.categories.all'), icon: Search, count: totalResults.all },
    { id: 'tenders' as SearchCategory, label: t('nav.calls'), icon: FileText, count: totalResults.tenders },
    { id: 'projects' as SearchCategory, label: t('nav.projects'), icon: BarChart3, count: totalResults.projects },
    { id: 'experts' as SearchCategory, label: t('nav.experts'), icon: Users, count: totalResults.experts },
    { id: 'organizations' as SearchCategory, label: t('nav.organizations'), icon: Building2, count: totalResults.organizations },
    { id: 'training' as SearchCategory, label: t('nav.training'), icon: GraduationCap, count: totalResults.training },
    { id: 'assistance' as SearchCategory, label: t('nav.assistance'), icon: Headphones, count: totalResults.assistance },
    { id: 'faq' as SearchCategory, label: t('nav.faq'), icon: HelpCircle, count: totalResults.faq },
    { id: 'offers' as SearchCategory, label: t('nav.offers'), icon: Gift, count: totalResults.offers },
    { id: 'memberArea' as SearchCategory, label: t('nav.memberArea'), icon: Shield, count: 0 },
  ];

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveCategory('all');
  };

  const shouldShowCategory = (category: SearchCategory) => {
    if (activeCategory !== 'all') return activeCategory === category;
    return true;
  };

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <PageBanner
        title={t('search.banner.title')}
        description={t('search.banner.description')}
        icon={Search}
        stats={[
          { value: String(totalResults.all), label: t('search.categories.all') }
        ]}
      />

      {/* Sub Menu - Empty for layout consistency */}
      <SubMenu items={[]} />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="space-y-6">
            {/* Search Header */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={t('search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 h-12 text-base"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filters */}
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isActive = activeCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        isActive
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{category.label}</span>
                      {category.count > 0 && (
                        <Badge variant={isActive ? "secondary" : "outline"} className="ml-1">
                          {category.count}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results */}
            {!searchQuery ? (
              <div className="bg-white rounded-lg border p-12 text-center">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('search.emptyState.title')}</h3>
                <p className="text-gray-500">{t('search.emptyState.description')}</p>
              </div>
            ) : totalResults.all === 0 ? (
              <div className="bg-white rounded-lg border p-12 text-center">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('search.noResults.title')}</h3>
                <p className="text-gray-500">{t('search.noResults.description', { query: searchQuery })}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Tenders Results */}
                {shouldShowCategory('tenders') && filteredTenders.length > 0 && (
                  <div className="bg-white rounded-lg border">
                    <div className="p-5 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <h2 className="text-lg font-bold text-primary">{t('nav.calls')}</h2>
                          <Badge variant="outline">{filteredTenders.length}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/calls')}
                          className="text-sm"
                        >
                          {t('common.viewAll')}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                    <div className="divide-y">
                      {filteredTenders.map((tender) => (
                        <button
                          key={tender.id}
                          onClick={() => navigate(`/search/calls/${tender.id}`)}
                          className="w-full p-5 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{tender.title}</h3>
                              <p className="text-sm text-gray-500 mb-2 line-clamp-2">{tender.description}</p>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-xs text-gray-500">{tender.organizationName}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">{tender.referenceNumber}</span>
                                <Badge variant="outline" className="text-xs">
                                  {t(`sectors.${tender.sectors}`)}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <Badge 
                                variant={tender.status === TenderStatusEnum.OPEN ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {t(`tenders.status.${tender.status}`)}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(tender.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects Results */}
                {shouldShowCategory('projects') && filteredProjects.length > 0 && (
                  <div className="bg-white rounded-lg border">
                    <div className="p-5 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BarChart3 className="h-5 w-5 text-primary" />
                          <h2 className="text-lg font-bold text-primary">{t('nav.projects')}</h2>
                          <Badge variant="outline">{filteredProjects.length}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/projects')}
                          className="text-sm"
                        >
                          {t('common.viewAll')}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                    <div className="divide-y">
                      {filteredProjects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => navigate(`/search/projects/${project.id}`)}
                          className="w-full p-5 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{project.title}</h3>
                              <p className="text-sm text-gray-500 mb-2 line-clamp-2">{project.description}</p>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-xs text-gray-500">{project.leadOrganization}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">{project.country}</span>
                                <Badge variant="outline" className="text-xs">
                                  {t(`sectors.${project.sector}`)}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <Badge 
                                variant={project.status === ProjectStatusEnum.ACTIVE ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {t(`projects.status.${project.status}`)}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Intl.NumberFormat('en-US', { 
                                  style: 'currency', 
                                  currency: project.budget.currency,
                                  maximumFractionDigits: 0 
                                }).format(project.budget.total)}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experts Results */}
                {shouldShowCategory('experts') && filteredExperts.length > 0 && (
                  <div className="bg-white rounded-lg border">
                    <div className="p-5 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-primary" />
                          <h2 className="text-lg font-bold text-primary">{t('nav.experts')}</h2>
                          <Badge variant="outline">{filteredExperts.length}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/experts')}
                          className="text-sm"
                        >
                          {t('common.viewAll')}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                    <div className="divide-y">
                      {filteredExperts.map((expert) => (
                        <button
                          key={expert.id}
                          onClick={() => navigate(`/search/experts/${expert.id}`)}
                          className="w-full p-5 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <User className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1">{expert.fullName}</h3>
                              <p className="text-sm text-gray-500 mb-2">{expert.title}</p>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-xs text-gray-500">{expert.city}, {expert.country}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">{expert.yearsExperience} {t('common.years')}</span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {expert.skills.slice(0, 3).map((skill, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {skill.skillName}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Badge 
                              variant={expert.verificationStatus === ExpertStatusEnum.ACTIVE ? 'default' : 'secondary'}
                              className="text-xs flex-shrink-0"
                            >
                              {t(`experts.status.${expert.verificationStatus}`)}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Organizations Results */}
                {shouldShowCategory('organizations') && filteredOrganizations.length > 0 && (
                  <div className="bg-white rounded-lg border">
                    <div className="p-5 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-primary" />
                          <h2 className="text-lg font-bold text-primary">{t('nav.organizations')}</h2>
                          <Badge variant="outline">{filteredOrganizations.length}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/organizations')}
                          className="text-sm"
                        >
                          {t('common.viewAll')}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                    <div className="divide-y">
                      {filteredOrganizations.map((org) => (
                        <button
                          key={org.id}
                          onClick={() => navigate(`/search/organizations/${org.id}`)}
                          className="w-full p-5 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1">{org.name}</h3>
                              <p className="text-sm text-gray-500 mb-2 line-clamp-2">{org.description}</p>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-xs text-gray-500">{org.country?.name ?? '—'}</span>
                                <Badge variant="outline" className="text-xs">
                                  {t(`organizations.type.${org.type}`)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Training Results */}
                {shouldShowCategory('training') && (filteredCourses.length > 0 || filteredTrainers.length > 0 || filteredCertifications.length > 0) && (
                  <div className="bg-white rounded-lg border">
                    <div className="p-5 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <GraduationCap className="h-5 w-5 text-primary" />
                          <h2 className="text-lg font-bold text-primary">{t('nav.training')}</h2>
                          <Badge variant="outline">{totalResults.training}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/subscriptions')}
                          className="text-sm"
                        >
                          {t('common.viewAll')}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                    <div className="divide-y">
                      {/* Courses */}
                      {filteredCourses.map((course) => (
                        <button
                          key={course.id}
                          onClick={() => navigate(`/training/catalog`)}
                          className="w-full p-5 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">{t('search.type.course')}</Badge>
                                <h3 className="font-semibold text-gray-900 line-clamp-1">{course.title}</h3>
                              </div>
                              <p className="text-sm text-gray-500 mb-2 line-clamp-2">{course.description}</p>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-xs text-gray-500">{course.instructor.name}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">{course.duration}</span>
                                <Badge variant="outline" className="text-xs">
                                  {t(`training.level.${course.level}`)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}

                      {/* Trainers */}
                      {filteredTrainers.map((trainer) => (
                        <button
                          key={trainer.id}
                          onClick={() => navigate(`/training/trainers`)}
                          className="w-full p-5 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <User className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">{t('search.type.trainer')}</Badge>
                                <h3 className="font-semibold text-gray-900">{trainer.name}</h3>
                              </div>
                              <p className="text-sm text-gray-500 mb-2">{trainer.title}</p>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-xs text-gray-500">{trainer.organization}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">{trainer.coursesCount} {t('training.courses')}</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}

                      {/* Certifications */}
                      {filteredCertifications.map((cert) => (
                        <button
                          key={cert.id}
                          onClick={() => navigate(`/training/portfolio`)}
                          className="w-full p-5 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                              <Award className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">{t('search.type.certification')}</Badge>
                                <h3 className="font-semibold text-gray-900 line-clamp-1">{cert.title}</h3>
                              </div>
                              <p className="text-sm text-gray-500 mb-2 line-clamp-2">{cert.description}</p>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-xs text-gray-500">{cert.earnedDate}</span>
                                <Badge variant="outline" className="text-xs">
                                  {t(`training.level.${cert.level}`)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assistance Results */}
                {shouldShowCategory('assistance') && filteredAssistance.length > 0 && (
                  <div className="bg-white rounded-lg border">
                    <div className="p-5 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Headphones className="h-5 w-5 text-primary" />
                          <h2 className="text-lg font-bold text-primary">{t('nav.assistance')}</h2>
                          <Badge variant="outline">{filteredAssistance.length}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/assistance')}
                          className="text-sm"
                        >
                          {t('common.viewAll')}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                    <div className="divide-y">
                      {filteredAssistance.map((assistance) => {
                        // Determine badge label with translation
                        const getCategoryLabel = (category: string) => {
                          // Try assistance type translation
                          const typeKey = `assistance.type.${category}`;
                          if (t(typeKey) !== typeKey) return t(typeKey);
                          
                          // Try resource type translation
                          const resourceKey = `assistance.resourceType.${category}`;
                          if (t(resourceKey) !== resourceKey) return t(resourceKey);
                          
                          // Fallback to category as-is
                          return category;
                        };

                        return (
                          <button
                            key={assistance.id}
                            onClick={() => navigate('/assistance')}
                            className="w-full p-5 text-left hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                                <FileQuestion className="h-6 w-6 text-purple-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{assistance.title}</h3>
                                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{assistance.description}</p>
                                <div className="flex items-center gap-3 flex-wrap">
                                  <Badge variant="outline" className="text-xs">
                                    {getCategoryLabel(assistance.category)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* FAQ Results */}
                {shouldShowCategory('faq') && filteredFAQs.length > 0 && (
                  <div className="bg-white rounded-lg border">
                    <div className="p-5 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <HelpCircle className="h-5 w-5 text-primary" />
                          <h2 className="text-lg font-bold text-primary">{t('nav.faq')}</h2>
                          <Badge variant="outline">{filteredFAQs.length}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/faq')}
                          className="text-sm"
                        >
                          {t('common.viewAll')}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                    <div className="divide-y">
                      {filteredFAQs.map((faq) => (
                        <button
                          key={faq.id}
                          onClick={() => navigate('/faq')}
                          className="w-full p-5 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                              <HelpCircle className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{faq.question[language]}</h3>
                              <p className="text-sm text-gray-500 mb-2 line-clamp-2">{faq.answer[language]}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Offers Results */}
                {shouldShowCategory('offers') && filteredOffers.length > 0 && (
                  <div className="bg-white rounded-lg border">
                    <div className="p-5 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Gift className="h-5 w-5 text-primary" />
                          <h2 className="text-lg font-bold text-primary">{t('nav.offers')}</h2>
                          <Badge variant="outline">{filteredOffers.length}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/offers')}
                          className="text-sm"
                        >
                          {t('common.viewAll')}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                    <div className="divide-y">
                      {filteredOffers.map((offer) => (
                        <button
                          key={offer.id}
                          onClick={() => navigate('/offers')}
                          className="w-full p-5 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                              <Gift className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{offer.name[language]}</h3>
                              <p className="text-sm text-gray-500 mb-2 line-clamp-2">{offer.description[language]}</p>
                              <div className="flex items-center gap-3 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                  {offer.name[language]}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
