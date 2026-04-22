import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ProjectsSubMenu } from '@app/components/ProjectsSubMenu';
import { StatCard } from '@app/components/StatCard';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { Badge } from '@app/components/ui/badge';
import { Card, CardContent } from '@app/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@app/components/ui/dialog';
import { Textarea } from '@app/components/ui/textarea';
import { toast } from 'sonner';
import {
  Sparkles,
  Search,
  TrendingUp,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Save,
  Archive,
  Download,
  Filter,
  Play,
  Info,
  Loader2,
  Eye,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, es } from 'date-fns/locale';
import { ProjectStatusEnum, ProjectTypeEnum } from '@app/types/project.dto';
import { SectorEnum } from '@app/types/tender.dto';

// Mock project data for matching
interface ProjectMatch {
  id: string;
  title: string;
  code: string;
  organization: string;
  sector: SectorEnum;
  type: ProjectTypeEnum;
  status: ProjectStatusEnum;
  budget: number;
  currency: string;
  location: string;
  startDate: Date;
  endDate: Date;
  matchScore: number;
  description: string;
}

export default function ProjectsMatching() {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const navigate = useNavigate();

  const [matchingResults, setMatchingResults] = useState<ProjectMatch[]>([]);
  const [isRunningMatching, setIsRunningMatching] = useState(false);
  const [minScore, setMinScore] = useState<number>(0);
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'budget' | 'newest'>('score');

  // Get date locale
  const dateLocale = language === 'fr' ? fr : language === 'es' ? es : enUS;

  // Mock projects data
  const mockProjects: ProjectMatch[] = [
    {
      id: 'proj-001',
      title: 'Sustainable Water Management Project',
      code: 'WB-WATER-2024-01',
      organization: 'World Bank',
      sector: SectorEnum.WATER_SANITATION,
      type: ProjectTypeEnum.DEVELOPMENT,
      status: ProjectStatusEnum.ACTIVE,
      budget: 5000000,
      currency: 'USD',
      location: 'Kenya',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2026-12-31'),
      matchScore: 92,
      description: 'Comprehensive water resource management and sanitation infrastructure development',
    },
    {
      id: 'proj-002',
      title: 'Digital Governance Transformation',
      code: 'UNDP-GOV-2024-03',
      organization: 'UNDP',
      sector: SectorEnum.GOVERNANCE,
      type: ProjectTypeEnum.CAPACITY_BUILDING,
      status: ProjectStatusEnum.ACTIVE,
      budget: 3500000,
      currency: 'USD',
      location: 'Tanzania',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2025-12-31'),
      matchScore: 88,
      description: 'Modernization of public sector digital infrastructure and e-governance systems',
    },
    {
      id: 'proj-003',
      title: 'Rural Infrastructure Development',
      code: 'AFDB-INFRA-2024-05',
      organization: 'African Development Bank',
      sector: SectorEnum.INFRASTRUCTURE,
      type: ProjectTypeEnum.INFRASTRUCTURE,
      status: ProjectStatusEnum.ACTIVE,
      budget: 8000000,
      currency: 'USD',
      location: 'Uganda',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2027-01-31'),
      matchScore: 85,
      description: 'Road and bridge infrastructure development in rural areas',
    },
    {
      id: 'proj-004',
      title: 'Climate Resilience Agriculture',
      code: 'FAO-AGRI-2024-02',
      organization: 'FAO',
      sector: SectorEnum.AGRICULTURE,
      type: ProjectTypeEnum.DEVELOPMENT,
      status: ProjectStatusEnum.ACTIVE,
      budget: 4200000,
      currency: 'USD',
      location: 'Ethiopia',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2026-03-31'),
      matchScore: 79,
      description: 'Climate-smart agriculture and farmer capacity building',
    },
  ];

  // Run matching algorithm
  const handleRunMatching = () => {
    setIsRunningMatching(true);
    toast.info(t('projects.matching.messages.running'));

    // Simulate API call
    setTimeout(() => {
      setMatchingResults(mockProjects);
      setIsRunningMatching(false);
      toast.success(t('projects.matching.messages.completed'));
    }, 2000);
  };

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let filtered = matchingResults.filter((project) => {
      // Min score filter
      if (project.matchScore < minScore) return false;

      // Sector filter
      if (selectedSector !== 'ALL' && project.sector !== selectedSector) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.organization.toLowerCase().includes(query)
        );
      }

      return true;
    });

    // Sort
    switch (sortBy) {
      case 'score':
        filtered.sort((a, b) => b.matchScore - a.matchScore);
        break;
      case 'budget':
        filtered.sort((a, b) => b.budget - a.budget);
        break;
      case 'newest':
        filtered.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
        break;
    }

    return filtered;
  }, [matchingResults, minScore, selectedSector, searchQuery, sortBy]);

  // Calculate KPIs
  const totalProjects = mockProjects.length;
  const highMatches = matchingResults.filter((p) => p.matchScore >= 80).length;
  const mediumMatches = matchingResults.filter(
    (p) => p.matchScore >= 60 && p.matchScore < 80
  ).length;
  const avgScore =
    matchingResults.length > 0
      ? Math.round(
          matchingResults.reduce((sum, p) => sum + p.matchScore, 0) / matchingResults.length
        )
      : 0;

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  // Handle save matching - Save directly without dialog
  const handleSaveMatching = () => {
    if (filteredResults.length === 0) {
      toast.error(t('projects.matching.save.noResultsError'));
      return;
    }

    // Generate automatic name with date
    const now = new Date();
    const matchingName = `Matching ${format(now, 'dd/MM/yyyy HH:mm', { locale: dateLocale })}`;

    // Mock save to archive - In real app, this would call an API
    // and save to localStorage or backend
    const savedMatching = {
      id: `matching-${Date.now()}`,
      name: matchingName,
      date: now,
      results: filteredResults,
      avgScore: avgScore,
      totalProjects: filteredResults.length,
      filters: {
        minScore,
        selectedSector,
        searchQuery,
        sortBy,
      },
    };

    // Save to localStorage for archive page
    try {
      const existingMatchings = JSON.parse(localStorage.getItem('projectsMatchingArchive') || '[]');
      existingMatchings.unshift(savedMatching);
      localStorage.setItem('projectsMatchingArchive', JSON.stringify(existingMatchings));
      
      toast.success(t('projects.matching.save.success'));
      
      // Optional: Navigate to archive after a delay
      setTimeout(() => {
        navigate('/projects/matching-archive');
      }, 1500);
    } catch (error) {
      toast.error(t('projects.matching.save.error'));
    }
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Page Banner */}
      <PageBanner
        title={t('projects.matching.title')}
        subtitle={
          user?.accountType === 'Organization'
            ? t('projects.matching.organizationSubtitle')
            : t('projects.matching.expertSubtitle')
        }
        icon={Sparkles}
      />

      {/* Sub Menu */}
      <ProjectsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Info Banner */}
          <div className="mb-6 bg-gradient-to-br from-[#3d4654] to-[#2c3440] rounded-lg p-6 shadow-lg border border-gray-300">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {t('projects.matching.title')}
                    </h3>
                    <p className="text-sm text-white/80">
                      {t('projects.matching.subtitle')}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleRunMatching}
                disabled={isRunningMatching}
                size="lg"
                className="bg-white text-[#3d4654] hover:bg-gray-100 font-semibold"
              >
                {isRunningMatching ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t('projects.matching.actions.running')}
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    {t('projects.matching.actions.runMatching')}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title={t('projects.matching.stats.totalProjects')}
              value={totalProjects.toString()}
              subtitle={t('projects.matching.stats.available')}
              icon={Briefcase}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-600"
            />

            <StatCard
              title={t('projects.matching.stats.highMatches')}
              value={highMatches.toString()}
              subtitle="=80%"
              icon={TrendingUp}
              iconBgColor="bg-green-50"
              iconColor="text-green-600"
            />

            <StatCard
              title={t('projects.matching.stats.mediumMatches')}
              value={mediumMatches.toString()}
              subtitle="60-79%"
              icon={Star}
              iconBgColor="bg-orange-50"
              iconColor="text-orange-600"
            />

            <StatCard
              title={t('projects.matching.stats.avgScore')}
              value={avgScore > 0 ? `${avgScore}%` : '-'}
              subtitle={t('projects.matching.stats.quality')}
              icon={Star}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-600"
            />
          </div>

          {/* Filters */}
          {matchingResults.length > 0 && (
            <Card className="mb-6 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <h3 className="font-semibold text-gray-900">
                    {t('projects.matching.filters.title')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder={t('projects.matching.filters.search')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Min Score */}
                  <Select
                    value={minScore.toString()}
                    onValueChange={(value) => setMinScore(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">{t('projects.matching.filters.allScores')}</SelectItem>
                      <SelectItem value="60">=60%</SelectItem>
                      <SelectItem value="70">=70%</SelectItem>
                      <SelectItem value="80">=80%</SelectItem>
                      <SelectItem value="90">=90%</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sector */}
                  <Select value={selectedSector} onValueChange={setSelectedSector}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">{t('projects.matching.filters.allSectors')}</SelectItem>
                      <SelectItem value={SectorEnum.WATER_SANITATION}>Water & Sanitation</SelectItem>
                      <SelectItem value={SectorEnum.GOVERNANCE}>Governance</SelectItem>
                      <SelectItem value={SectorEnum.INFRASTRUCTURE}>Infrastructure</SelectItem>
                      <SelectItem value={SectorEnum.AGRICULTURE}>Agriculture</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort By */}
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="score">{t('projects.matching.results.highestScore')}</SelectItem>
                      <SelectItem value="budget">{t('projects.matching.results.budget')}</SelectItem>
                      <SelectItem value="newest">{t('projects.matching.results.newest')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {matchingResults.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('projects.matching.results.title')}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {filteredResults.length} {t('projects.matching.results.projects')}
                  </span>
                  <Button
                    onClick={handleSaveMatching}
                    size="sm"
                    variant="outline"
                    className="border-gray-300"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    {t('projects.matching.actions.saveMatching')}
                  </Button>
                </div>
              </div>

              {filteredResults.length === 0 && (
                <Card className="border-gray-200">
                  <CardContent className="p-12 text-center">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t('projects.matching.results.noResults')}
                    </h3>
                    <p className="text-gray-500">
                      {t('projects.matching.results.noResults.message')}
                    </p>
                  </CardContent>
                </Card>
              )}

              {filteredResults.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {filteredResults.map((project) => (
                    <Card key={project.id} className="border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 text-lg mb-1">
                                  {project.title}
                                </h4>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <span className="font-mono">{project.code}</span>
                                  <span>�</span>
                                  <span>{project.organization}</span>
                                </div>
                              </div>

                              <div
                                className={`px-3 py-1 rounded-md border font-bold text-lg ${getScoreColor(
                                  project.matchScore
                                )}`}
                              >
                                {project.matchScore}%
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-600 mb-3">{project.description}</p>

                            {/* Details */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">{project.location}</span>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">
                                  {project.budget.toLocaleString()} {project.currency}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">
                                  {format(project.endDate, 'MMM yyyy', { locale: dateLocale })}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <Briefcase className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">{project.type}</span>
                              </div>
                            </div>

                            {/* Badges */}
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
                                {project.sector}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="border-green-300 text-green-700 bg-green-50"
                              >
                                {project.status}
                              </Badge>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => handleViewProject(project.id)}
                              size="sm"
                              className="bg-[#B82547] hover:bg-[#9a1f3a] text-white"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              {t('projects.matching.card.viewDetails')}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {matchingResults.length === 0 && !isRunningMatching && (
            <Card className="border-gray-200">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('projects.matching.results.notStarted')}
                </h3>
                <p className="text-gray-500 mb-4">
                  {t('projects.matching.results.clickToStart')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </PageContainer>
    </div>
  );
}