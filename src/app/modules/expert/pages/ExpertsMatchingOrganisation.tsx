import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { useExperts } from '@app/modules/expert/hooks/useExperts';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ExpertsSubMenu } from '@app/components/ExpertsSubMenu';
import { StatCard } from '@app/components/StatCard';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { Badge } from '@app/components/ui/badge';
import { Card, CardContent } from '@app/components/ui/card';
import { toast } from 'sonner';
import {
  Sparkles,
  Search,
  TrendingUp,
  Star,
  MapPin,
  DollarSign,
  Briefcase,
  Save,
  Download,
  Filter,
  Play,
  Loader2,
  Eye,
  Users,
  Award,
  Building2,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, es } from 'date-fns/locale';
import { ExpertListDTO } from '@app/modules/expert/types/expert.dto';

// Expert with match score
interface ExpertMatch extends ExpertListDTO {
  matchScore: number;
}

export default function ExpertsMatchingOrganisation() {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const { allExperts } = useExperts();

  const [matchingResults, setMatchingResults] = useState<ExpertMatch[]>([]);
  const [isRunningMatching, setIsRunningMatching] = useState(false);
  const [minScore, setMinScore] = useState<number>(0);
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'experience' | 'rate'>('score');

  // Get date locale
  const dateLocale = language === 'fr' ? fr : language === 'es' ? es : enUS;

  // Run matching algorithm - Match connected organization with all experts
  const handleRunMatching = () => {
    setIsRunningMatching(true);
    toast.info(t('expertsMatchingOrganisation.messages.running'));

    // Simulate AI matching between organization profile and all experts
    setTimeout(() => {
      const scoredExperts: ExpertMatch[] = allExperts.map(expert => ({
        ...expert,
        matchScore: Math.floor(Math.random() * 30) + 70 // Random score between 70-99
      }));
      
      setMatchingResults(scoredExperts);
      setIsRunningMatching(false);
      toast.success(t('expertsMatchingOrganisation.messages.completed'));
    }, 2000);
  };

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let filtered = matchingResults.filter((expert) => {
      // Min score filter
      if (expert.matchScore < minScore) return false;

      // Sector filter
      if (selectedSector !== 'ALL') {
        const hasSector = expert.sectors?.some(sector => sector === selectedSector);
        if (!hasSector) return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          expert.firstName.toLowerCase().includes(query) ||
          expert.lastName.toLowerCase().includes(query) ||
          expert.title.toLowerCase().includes(query) ||
          expert.bio?.toLowerCase().includes(query)
        );
      }

      return true;
    });

    // Sort
    switch (sortBy) {
      case 'score':
        filtered.sort((a, b) => b.matchScore - a.matchScore);
        break;
      case 'experience':
        filtered.sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0));
        break;
      case 'rate':
        filtered.sort((a, b) => (a.dailyRate || 0) - (b.dailyRate || 0));
        break;
    }

    return filtered;
  }, [matchingResults, minScore, selectedSector, searchQuery, sortBy]);

  // Calculate KPIs
  const totalExperts = allExperts.length;
  const highMatches = matchingResults.filter((e) => e.matchScore >= 80).length;
  const mediumMatches = matchingResults.filter(
    (e) => e.matchScore >= 60 && e.matchScore < 80
  ).length;
  const avgScore =
    matchingResults.length > 0
      ? Math.round(
          matchingResults.reduce((sum, e) => sum + e.matchScore, 0) / matchingResults.length
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
      toast.error(t('expertsMatchingOrganisation.save.noResultsError'));
      return;
    }

    // Generate automatic name with date
    const now = new Date();
    const matchingName = `Matching ${format(now, 'dd/MM/yyyy HH:mm', { locale: dateLocale })}`;

    // Mock save to archive
    const savedMatching = {
      id: `matching-${Date.now()}`,
      name: matchingName,
      date: now,
      results: filteredResults,
      avgScore: avgScore,
      totalExperts: filteredResults.length,
      filters: {
        minScore,
        selectedSector,
        searchQuery,
        sortBy,
      },
    };

    // Save to localStorage for archive page
    try {
      const existingMatchings = JSON.parse(localStorage.getItem('expertsMatchingOrganisationArchive') || '[]');
      existingMatchings.unshift(savedMatching);
      localStorage.setItem('expertsMatchingOrganisationArchive', JSON.stringify(existingMatchings));
      
      toast.success(t('expertsMatchingOrganisation.save.success'));
      
      // Navigate to archive after a delay
      setTimeout(() => {
        navigate('/experts/matching-organisation-archive');
      }, 1500);
    } catch (error) {
      toast.error(t('expertsMatchingOrganisation.save.error'));
    }
  };

  const handleViewExpert = (expertId: string) => {
    navigate(`/experts/${expertId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Page Banner */}
      <PageBanner
        title={t('expertsMatchingOrganisation.title')}
        subtitle={t('expertsMatchingOrganisation.subtitle')}
        icon={Sparkles}
      />

      {/* Sub Menu */}
      <ExpertsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Info Banner with Run Matching Button */}
          <div className="mb-6 bg-gradient-to-br from-[#3d4654] to-[#2c3440] rounded-lg p-6 shadow-lg border border-gray-300">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {t('expertsMatchingOrganisation.title')}
                    </h3>
                    <p className="text-sm text-white/80">
                      {t('expertsMatchingOrganisation.subtitle')}
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
                    {t('expertsMatchingOrganisation.actions.running')}
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    {t('expertsMatchingOrganisation.actions.runMatching')}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title={t('expertsMatchingOrganisation.stats.totalExperts')}
              value={totalExperts.toString()}
              subtitle={t('expertsMatchingOrganisation.stats.available')}
              icon={Users}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-600"
            />

            <StatCard
              title={t('expertsMatchingOrganisation.stats.highMatches')}
              value={highMatches.toString()}
              subtitle="≥80%"
              icon={TrendingUp}
              iconBgColor="bg-green-50"
              iconColor="text-green-600"
            />

            <StatCard
              title={t('expertsMatchingOrganisation.stats.mediumMatches')}
              value={mediumMatches.toString()}
              subtitle="60-79%"
              icon={Star}
              iconBgColor="bg-orange-50"
              iconColor="text-orange-600"
            />

            <StatCard
              title={t('expertsMatchingOrganisation.stats.avgScore')}
              value={avgScore > 0 ? `${avgScore}%` : '-'}
              subtitle={t('expertsMatchingOrganisation.stats.quality')}
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
                    {t('expertsMatchingOrganisation.filters.title')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Search */}
                  <div className="relative lg:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder={t('expertsMatchingOrganisation.filters.search')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Min Score */}
                  <Select value={minScore.toString()} onValueChange={(v) => setMinScore(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">{t('expertsMatchingOrganisation.filters.allScores')}</SelectItem>
                      <SelectItem value="60">≥ 60%</SelectItem>
                      <SelectItem value="70">≥ 70%</SelectItem>
                      <SelectItem value="80">≥ 80%</SelectItem>
                      <SelectItem value="90">≥ 90%</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sector */}
                  <Select value={selectedSector} onValueChange={setSelectedSector}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">{t('expertsMatchingOrganisation.filters.allSectors')}</SelectItem>
                      <SelectItem value="HEALTH">{t('experts.sectors.HEALTH')}</SelectItem>
                      <SelectItem value="EDUCATION">{t('experts.sectors.EDUCATION')}</SelectItem>
                      <SelectItem value="AGRICULTURE">{t('experts.sectors.AGRICULTURE')}</SelectItem>
                      <SelectItem value="INFRASTRUCTURE">{t('experts.sectors.INFRASTRUCTURE')}</SelectItem>
                      <SelectItem value="ENVIRONMENT">{t('experts.sectors.ENVIRONMENT')}</SelectItem>
                      <SelectItem value="GOVERNANCE">{t('experts.sectors.GOVERNANCE')}</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort By */}
                  <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="score">{t('expertsMatchingOrganisation.filters.sortByScore')}</SelectItem>
                      <SelectItem value="experience">{t('expertsMatchingOrganisation.filters.sortByExperience')}</SelectItem>
                      <SelectItem value="rate">{t('expertsMatchingOrganisation.filters.sortByRate')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons - REMOVED FROM HERE */}
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {matchingResults.length > 0 && (
            <>
              {/* Results Header */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('expertsMatchingOrganisation.results.title')}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {filteredResults.length} {t('expertsMatchingOrganisation.results.experts')}
                  </span>
                  <Button
                    onClick={handleSaveMatching}
                    size="sm"
                    variant="outline"
                    className="border-gray-300"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    {t('expertsMatchingOrganisation.actions.saveMatching')}
                  </Button>
                </div>
              </div>

              {/* Results Grid */}
              <div className="space-y-4">
                {filteredResults.map((expert) => (
                  <Card
                    key={expert.id}
                    className="hover:shadow-lg transition-all duration-200 border-l-4 border-gray-200"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-16 h-16 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Users className="w-8 h-8 text-indigo-500" />
                        </div>

                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-lg mb-1">
                                {expert.firstName} {expert.lastName}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="font-medium">{expert.title}</span>
                              </div>
                            </div>

                            <div className={`px-4 py-2 rounded-lg border font-bold text-lg ${getScoreColor(expert.matchScore)}`}>
                              {expert.matchScore}%
                            </div>
                          </div>

                          {/* Bio */}
                          {expert.bio && (
                            <p className="text-sm text-gray-600 mb-3">{expert.bio}</p>
                          )}

                          {/* Details */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">
                                {expert.city}, {expert.country}
                              </span>
                            </div>

                            {expert.yearsOfExperience && (
                              <div className="flex items-center gap-2 text-sm">
                                <Briefcase className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">
                                  {expert.yearsOfExperience} {t('experts.details.yearsExp')}
                                </span>
                              </div>
                            )}

                            {expert.dailyRate && (
                              <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">
                                  {expert.dailyRate} {expert.currency}/{t('experts.details.day')}
                                </span>
                              </div>
                            )}

                            {expert.completedMissions && (
                              <div className="flex items-center gap-2 text-sm">
                                <Award className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">
                                  {expert.completedMissions} {t('experts.details.missions')}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Badges */}
                          <div className="flex items-center gap-2 flex-wrap mb-3">
                            {expert.sectors?.slice(0, 3).map((sector, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="border-blue-300 text-blue-700 bg-blue-50"
                              >
                                {t(`experts.sectors.${sector}`)}
                              </Badge>
                            ))}
                            {expert.verified && (
                              <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">
                                {t('experts.status.VERIFIED')}
                              </Badge>
                            )}
                          </div>

                          {/* Action */}
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewExpert(expert.id)}
                              className="hover:bg-gray-50"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              {t('expertsMatchingOrganisation.actions.viewDetails')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State - No Results After Filtering */}
              {filteredResults.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('expertsMatchingOrganisation.results.noResults')}
                  </h3>
                  <p className="text-gray-500">{t('expertsMatchingOrganisation.results.tryAdjusting')}</p>
                </div>
              )}
            </>
          )}

          {/* Empty State - Before Matching */}
          {matchingResults.length === 0 && !isRunningMatching && (
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('expertsMatchingOrganisation.empty.title')}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {t('expertsMatchingOrganisation.empty.description')}
              </p>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}