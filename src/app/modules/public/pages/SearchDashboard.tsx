import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, X, BarChart3, Award, ListChecks, Building2, Users, UserCheck, PenSquare, ChevronRight } from 'lucide-react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { SearchSectionTabs } from '@app/components/SearchSectionTabs';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { useProjects } from '@app/hooks/useProjects';
import { useTenders } from '@app/hooks/useTenders';
import { useOrganizations } from '@app/modules/organization/hooks/useOrganizations';
import { useExperts } from '@app/modules/expert/hooks/useExperts';
import { MatchingAlertCategoryEnum } from '@app/types/tender.dto';

type DashboardCategory =
  | 'all'
  | 'projects'
  | 'awards'
  | 'shortlists'
  | 'organisations'
  | 'experts'
  | 'my-experts'
  | 'bid-writers';

const isBidWriter = (expert: {
  title?: string;
  bio?: string;
  skills?: string[];
}) => {
  const haystack = `${expert.title || ''} ${expert.bio || ''} ${(expert.skills || []).join(' ')}`.toLowerCase();
  return /bid|proposal|tender|writer/.test(haystack);
};

export default function SearchDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  const isExpert = user?.accountType === 'expert';

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<DashboardCategory>('all');

  const { allProjects } = useProjects();
  const { allTenders } = useTenders();
  const { allOrganizations } = useOrganizations();
  const { allExperts } = useExperts();

  const normalizedQuery = query.trim().toLowerCase();
  const buildSectionPath = (path: string) => {
    const q = query.trim();
    return q ? `${path}?q=${encodeURIComponent(q)}` : path;
  };

  const projects = useMemo(() => {
    if (!normalizedQuery) return [];
    return allProjects.filter((project) =>
      project.title.toLowerCase().includes(normalizedQuery) ||
      project.description.toLowerCase().includes(normalizedQuery) ||
      project.leadOrganization.toLowerCase().includes(normalizedQuery)
    );
  }, [allProjects, normalizedQuery]);

  const awards = useMemo(() => {
    if (!normalizedQuery) return [];
    return allTenders.filter((tender) =>
      tender.alertCategory === MatchingAlertCategoryEnum.AWARDS &&
      (tender.title.toLowerCase().includes(normalizedQuery) ||
        tender.referenceNumber.toLowerCase().includes(normalizedQuery) ||
        tender.organizationName.toLowerCase().includes(normalizedQuery))
    );
  }, [allTenders, normalizedQuery]);

  const shortlists = useMemo(() => {
    if (!normalizedQuery) return [];
    return allTenders.filter((tender) =>
      tender.alertCategory === MatchingAlertCategoryEnum.SHORTLISTS &&
      (tender.title.toLowerCase().includes(normalizedQuery) ||
        tender.referenceNumber.toLowerCase().includes(normalizedQuery) ||
        tender.organizationName.toLowerCase().includes(normalizedQuery))
    );
  }, [allTenders, normalizedQuery]);

  const organisations = useMemo(() => {
    if (!normalizedQuery) return [];
    return allOrganizations.filter((organization) =>
      organization.name.toLowerCase().includes(normalizedQuery) ||
      organization.description.toLowerCase().includes(normalizedQuery) ||
      organization.country.toLowerCase().includes(normalizedQuery)
    );
  }, [allOrganizations, normalizedQuery]);

  const experts = useMemo(() => {
    if (!normalizedQuery) return [];
    return allExperts.filter((expert) =>
      `${expert.firstName} ${expert.lastName}`.toLowerCase().includes(normalizedQuery) ||
      expert.title.toLowerCase().includes(normalizedQuery) ||
      expert.skills.some((skill) => skill.toLowerCase().includes(normalizedQuery))
    );
  }, [allExperts, normalizedQuery]);

  const myExperts = useMemo(() => {
    return experts.filter((expert) => expert.organizationId === 'org-1');
  }, [experts]);

  const bidWriters = useMemo(() => {
    return experts.filter((expert) => isBidWriter(expert));
  }, [experts]);

  const counts = {
    projects: projects.length,
    awards: awards.length,
    shortlists: shortlists.length,
    organisations: organisations.length,
    experts: experts.length,
    'my-experts': myExperts.length,
    'bid-writers': bidWriters.length,
    all: projects.length + awards.length + shortlists.length + organisations.length +
      (!isExpert ? experts.length + myExperts.length + bidWriters.length : 0),
  };

  const categories = [
    { id: 'all' as DashboardCategory, label: t('search.dashboard.categories.allResults'), icon: Search, count: counts.all },
    { id: 'projects' as DashboardCategory, label: t('search.dashboard.categories.projects'), icon: BarChart3, count: counts.projects },
    { id: 'awards' as DashboardCategory, label: t('search.dashboard.categories.awards'), icon: Award, count: counts.awards },
    { id: 'shortlists' as DashboardCategory, label: t('search.dashboard.categories.shortlists'), icon: ListChecks, count: counts.shortlists },
    { id: 'organisations' as DashboardCategory, label: t('search.dashboard.categories.organisations'), icon: Building2, count: counts.organisations },
    ...(!isExpert ? [
      { id: 'experts' as DashboardCategory, label: t('search.dashboard.categories.experts'), icon: Users, count: counts.experts },
      { id: 'my-experts' as DashboardCategory, label: t('search.dashboard.categories.myExperts'), icon: UserCheck, count: counts['my-experts'] },
      { id: 'bid-writers' as DashboardCategory, label: t('search.dashboard.categories.bidWriters'), icon: PenSquare, count: counts['bid-writers'] },
    ] : []),
  ];

  const shouldShow = (category: DashboardCategory) => {
    if (activeCategory === 'all') return true;
    return activeCategory === category;
  };

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('search.dashboard.title')}
        description={t('search.dashboard.description')}
        icon={Search}
        stats={[{ value: String(counts.all), label: t('search.dashboard.categories.allResults') }]}
      />

      <SearchSectionTabs />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6 space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder={t('search.dashboard.placeholder')}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-10 pr-10 h-11"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    setActiveCategory('all');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={t('search.clear')}
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

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
                      <Badge variant={isActive ? 'secondary' : 'outline'} className="ml-1">
                        {category.count}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {!query ? (
            <div className="bg-white rounded-lg border p-12 text-center">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('search.emptyState.title')}</h3>
              <p className="text-gray-500">{t('search.emptyState.description')}</p>
            </div>
          ) : counts.all === 0 ? (
            <div className="bg-white rounded-lg border p-12 text-center">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('search.noResults.title')}</h3>
              <p className="text-gray-500">{t('search.noResults.description', { query })}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {shouldShow('projects') && projects.length > 0 && (
                <div className="bg-white rounded-lg border">
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-primary">{t('search.dashboard.categories.projects')}</h3>
                      <Badge variant="outline">{projects.length}</Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate(buildSectionPath('/search/projects'))}>
                      {t('search.viewAll')}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="divide-y">
                    {projects.slice(0, 3).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigate(`/search/projects/${item.id}`)}
                        className="w-full text-left p-4 hover:bg-gray-50"
                      >
                        <p className="font-medium text-gray-900 line-clamp-1">{item.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{item.leadOrganization}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {shouldShow('awards') && awards.length > 0 && (
                <div className="bg-white rounded-lg border">
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-primary">{t('search.dashboard.categories.awards')}</h3>
                      <Badge variant="outline">{awards.length}</Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate(buildSectionPath('/search/awards'))}>
                      {t('search.viewAll')}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="divide-y">
                    {awards.slice(0, 3).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigate(`/search/calls/${item.id}`)}
                        className="w-full text-left p-4 hover:bg-gray-50"
                      >
                        <p className="font-medium text-gray-900 line-clamp-1">{item.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{item.organizationName}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {shouldShow('shortlists') && shortlists.length > 0 && (
                <div className="bg-white rounded-lg border">
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-primary">{t('search.dashboard.categories.shortlists')}</h3>
                      <Badge variant="outline">{shortlists.length}</Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate(buildSectionPath('/search/shortlists'))}>
                      {t('search.viewAll')}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="divide-y">
                    {shortlists.slice(0, 3).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigate(`/search/calls/${item.id}`)}
                        className="w-full text-left p-4 hover:bg-gray-50"
                      >
                        <p className="font-medium text-gray-900 line-clamp-1">{item.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{item.organizationName}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {shouldShow('organisations') && organisations.length > 0 && (
                <div className="bg-white rounded-lg border">
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-primary">{t('search.dashboard.categories.organisations')}</h3>
                      <Badge variant="outline">{organisations.length}</Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate(buildSectionPath('/search/organisations'))}>
                      {t('search.viewAll')}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="divide-y">
                    {organisations.slice(0, 3).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigate(`/search/organizations/${item.id}`)}
                        className="w-full text-left p-4 hover:bg-gray-50"
                      >
                        <p className="font-medium text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{item.country}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!isExpert && shouldShow('experts') && experts.length > 0 && (
                <div className="bg-white rounded-lg border">
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-primary">{t('search.dashboard.categories.experts')}</h3>
                      <Badge variant="outline">{experts.length}</Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate(buildSectionPath('/search/experts'))}>
                      {t('search.viewAll')}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="divide-y">
                    {experts.slice(0, 3).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigate(`/search/experts/${item.id}`)}
                        className="w-full text-left p-4 hover:bg-gray-50"
                      >
                        <p className="font-medium text-gray-900 line-clamp-1">{item.firstName} {item.lastName}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{item.title}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!isExpert && shouldShow('my-experts') && myExperts.length > 0 && (
                <div className="bg-white rounded-lg border">
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-primary">{t('search.dashboard.categories.myExperts')}</h3>
                      <Badge variant="outline">{myExperts.length}</Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate(buildSectionPath('/search/my-experts'))}>
                      {t('search.viewAll')}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="divide-y">
                    {myExperts.slice(0, 3).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigate(`/search/experts/${item.id}`)}
                        className="w-full text-left p-4 hover:bg-gray-50"
                      >
                        <p className="font-medium text-gray-900 line-clamp-1">{item.firstName} {item.lastName}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{item.title}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!isExpert && shouldShow('bid-writers') && bidWriters.length > 0 && (
                <div className="bg-white rounded-lg border">
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-primary">{t('search.dashboard.categories.bidWriters')}</h3>
                      <Badge variant="outline">{bidWriters.length}</Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate(buildSectionPath('/search/bid-writers'))}>
                      {t('search.viewAll')}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="divide-y">
                    {bidWriters.slice(0, 3).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigate(`/search/experts/${item.id}`)}
                        className="w-full text-left p-4 hover:bg-gray-50"
                      >
                        <p className="font-medium text-gray-900 line-clamp-1">{item.firstName} {item.lastName}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{item.title}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
