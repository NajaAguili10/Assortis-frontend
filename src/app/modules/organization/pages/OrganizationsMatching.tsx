import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { useOrganizations } from '@app/modules/organization/hooks/useOrganizations';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OrganizationsSubMenu } from '@app/components/OrganizationsSubMenu';
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
import { organizationsMatchingTranslations } from '@app/i18n/organizations-matching';
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
  Building2,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, es } from 'date-fns/locale';
import { Organization } from '@app/types/organization.dto';

// Organization with match score
interface OrganizationMatch extends Organization {
  matchScore: number;
}

export default function OrganizationsMatching() {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const { allOrganizations } = useOrganizations();

  // D�terminer le type de matching selon le compte
  const isExpertAccount = user?.accountType === 'expert';
  const isOrgAccount = user?.accountType === 'organization' || 
                       user?.accountType === 'admin';

  const [matchingResults, setMatchingResults] = useState<OrganizationMatch[]>([]);
  const [isRunningMatching, setIsRunningMatching] = useState(false);
  const [minScore, setMinScore] = useState<number>(0);
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'budget' | 'newest'>('score');

  // Get date locale
  const dateLocale = language === 'fr' ? fr : language === 'es' ? es : enUS;

  // Run matching algorithm
  const handleRunMatching = () => {
    setIsRunningMatching(true);
    toast.info(t('organizations.matching.messages.running'));

    // Simulate API call - Generate random scores for organizations
    setTimeout(() => {
      const scoredOrganizations: OrganizationMatch[] = allOrganizations.map(org => ({
        ...org,
        matchScore: Math.floor(Math.random() * 30) + 70 // Random score between 70-99
      }));
      
      setMatchingResults(scoredOrganizations);
      setIsRunningMatching(false);
      toast.success(t('organizations.matching.messages.completed'));
    }, 2000);
  };

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let filtered = matchingResults.filter((organization) => {
      // Min score filter
      if (organization.matchScore < minScore) return false;

      // Sector filter
      if (selectedSector !== 'ALL' && !organization.sectors.includes(selectedSector as any)) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          organization.name.toLowerCase().includes(query) ||
          organization.description.toLowerCase().includes(query) ||
          organization.type.toLowerCase().includes(query)
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
        filtered.sort((a, b) => (b.budget?.amount || 0) - (a.budget?.amount || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
    }

    return filtered;
  }, [matchingResults, minScore, selectedSector, searchQuery, sortBy]);

  // Calculate KPIs
  const totalOrganizations = allOrganizations.length;
  const highMatches = matchingResults.filter((o) => o.matchScore >= 80).length;
  const mediumMatches = matchingResults.filter(
    (o) => o.matchScore >= 60 && o.matchScore < 80
  ).length;
  const avgScore =
    matchingResults.length > 0
      ? Math.round(
          matchingResults.reduce((sum, o) => sum + o.matchScore, 0) / matchingResults.length
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
      toast.error(t('organizations.matching.save.noResultsError'));
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
      totalOrganizations: filteredResults.length,
      filters: {
        minScore,
        selectedSector,
        searchQuery,
        sortBy,
      },
    };

    // Save to localStorage for archive page
    try {
      const existingMatchings = JSON.parse(localStorage.getItem('organizationsMatchingArchive') || '[]');
      existingMatchings.unshift(savedMatching);
      localStorage.setItem('organizationsMatchingArchive', JSON.stringify(existingMatchings));
      
      toast.success(t('organizations.matching.save.success'));
      
      // Optional: Navigate to archive after a delay
      setTimeout(() => {
        navigate('/organizations/matching-dossier');
      }, 1500);
    } catch (error) {
      toast.error(t('organizations.matching.save.error'));
    }
  };

  const handleViewOrganization = (organizationId: string) => {
    navigate(`/organizations/${organizationId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Page Banner */}
      <PageBanner
        title={isExpertAccount ? t('organizations.matching.expert.title') : t('organizations.matching.org.title')}
        subtitle={isExpertAccount ? t('organizations.matching.expert.subtitle') : t('organizations.matching.org.subtitle')}
        icon={Sparkles}
      />

      {/* Sub Menu */}
      <OrganizationsSubMenu />

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
                      {isExpertAccount ? t('organizations.matching.expert.title') : t('organizations.matching.org.title')}
                    </h3>
                    <p className="text-sm text-white/80">
                      {isExpertAccount ? t('organizations.matching.expert.subtitle') : t('organizations.matching.org.subtitle')}
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
                    {t('organizations.matching.actions.running')}
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    {t('organizations.matching.actions.runMatching')}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title={t('organizations.matching.stats.totalOrganizations')}
              value={totalOrganizations.toString()}
              subtitle={t('organizations.matching.stats.available')}
              icon={Building2}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-600"
            />

            <StatCard
              title={t('organizations.matching.stats.highMatches')}
              value={highMatches.toString()}
              subtitle="=80%"
              icon={TrendingUp}
              iconBgColor="bg-green-50"
              iconColor="text-green-600"
            />

            <StatCard
              title={t('organizations.matching.stats.mediumMatches')}
              value={mediumMatches.toString()}
              subtitle="60-79%"
              icon={Star}
              iconBgColor="bg-orange-50"
              iconColor="text-orange-600"
            />

            <StatCard
              title={t('organizations.matching.stats.avgScore')}
              value={avgScore > 0 ? `${avgScore}%` : '-'}
              subtitle={t('organizations.matching.stats.quality')}
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
                    {t('organizations.matching.filters.title')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder={t('organizations.matching.filters.search')}
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
                      <SelectItem value="0">{t('organizations.matching.filters.allScores')}</SelectItem>
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
                      <SelectItem value="ALL">{t('organizations.matching.filters.allSectors')}</SelectItem>
                      <SelectItem value="WATER_SANITATION">Water & Sanitation</SelectItem>
                      <SelectItem value="GOVERNANCE">Governance</SelectItem>
                      <SelectItem value="INFRASTRUCTURE">Infrastructure</SelectItem>
                      <SelectItem value="AGRICULTURE">Agriculture</SelectItem>
                      <SelectItem value="HEALTH">Health</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort By */}
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="score">{t('organizations.matching.results.highestScore')}</SelectItem>
                      <SelectItem value="budget">{t('organizations.matching.results.budget')}</SelectItem>
                      <SelectItem value="newest">{t('organizations.matching.results.newest')}</SelectItem>
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
                  {t('organizations.matching.results.title')}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {filteredResults.length} {t('organizations.matching.results.organizations')}
                  </span>
                  <Button
                    onClick={handleSaveMatching}
                    size="sm"
                    variant="outline"
                    className="border-gray-300"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    {t('organizations.matching.actions.saveMatching')}
                  </Button>
                </div>
              </div>

              {filteredResults.length === 0 && (
                <Card className="border-gray-200">
                  <CardContent className="p-12 text-center">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t('organizations.matching.results.noResults')}
                    </h3>
                    <p className="text-gray-500">
                      {t('organizations.matching.results.noResults.message')}
                    </p>
                  </CardContent>
                </Card>
              )}

              {filteredResults.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {filteredResults.map((organization) => (
                    <Card key={organization.id} className="border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 text-lg mb-1">
                                  {organization.name}
                                </h4>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  {organization.acronym && (
                                    <>
                                      <span className="font-mono">{organization.acronym}</span>
                                      <span>�</span>
                                    </>
                                  )}
                                  <span>{organization.type}</span>
                                </div>
                              </div>

                              <div
                                className={`px-3 py-1 rounded-md border font-bold text-lg ${getScoreColor(
                                  organization.matchScore
                                )}`}
                              >
                                {organization.matchScore}%
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-600 mb-3">{organization.description}</p>

                            {/* Details */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">{organization.city}, {organization.country}</span>
                              </div>

                              {organization.budget && (
                                <div className="flex items-center gap-2 text-sm">
                                  <DollarSign className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-700">
                                    {organization.budget.formatted}
                                  </span>
                                </div>
                              )}

                              {organization.yearEstablished && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-700">
                                    {t('organizations.details.established')}: {organization.yearEstablished}
                                  </span>
                                </div>
                              )}

                              {organization.employeeCount && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Briefcase className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-700">{organization.employeeCount.toLocaleString()} {t('organizations.details.employees')}</span>
                                </div>
                              )}
                            </div>

                            {/* Badges */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {organization.sectors.map((sector, index) => (
                                <Badge key={index} variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
                                  {sector}
                                </Badge>
                              ))}
                              {organization.status === 'VERIFIED' && (
                                <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">
                                  {t('organizations.status.VERIFIED')}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => handleViewOrganization(organization.id)}
                              size="sm"
                              className="bg-[#B82547] hover:bg-[#9a1f3a] text-white"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              {t('organizations.matching.card.viewDetails')}
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
                  {t('organizations.matching.results.notStarted')}
                </h3>
                <p className="text-gray-500 mb-4">
                  {t('organizations.matching.results.clickToStart')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </PageContainer>
    </div>
  );
}