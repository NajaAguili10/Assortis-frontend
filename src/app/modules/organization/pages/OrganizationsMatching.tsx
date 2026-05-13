import { useMemo, useState } from 'react';
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
  Filter,
  Play,
  Loader2,
  Eye,
  Building2,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, es } from 'date-fns/locale';
import { Organization } from '@app/types/organization.dto';
import { organizationMatchingDossierService } from '@app/services/organizationMatchingDossierService';

interface OrganizationMatch extends Organization {
  matchScore: number;
}

const toDisplayText = (value: any, fallback = '-'): string => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    const text = value.map((item) => toDisplayText(item, '')).filter(Boolean).join(', ');
    return text || fallback;
  }
  if (typeof value === 'object') return value.name || value.label || value.code || value.formatted || fallback;
  return fallback;
};

const getSectorCode = (sector: any): string => {
  if (!sector) return '';
  return typeof sector === 'string' ? sector : sector.code || sector.name || '';
};

const getBudgetAmount = (budget: any): number => {
  if (typeof budget === 'number') return budget;
  if (budget && typeof budget.amount === 'number') return budget.amount;
  return 0;
};

const getBudgetLabel = (budget: any): string => {
  if (!budget) return '-';
  if (typeof budget === 'number') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(budget);
  }
  return budget.formatted || toDisplayText(budget);
};

export default function OrganizationsMatching() {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const { allOrganizations } = useOrganizations();

  const isExpertAccount = user?.accountType === 'expert';

  const [matchingResults, setMatchingResults] = useState<OrganizationMatch[]>([]);
  const [isRunningMatching, setIsRunningMatching] = useState(false);
  const [minScore, setMinScore] = useState<number>(0);
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'budget' | 'newest'>('score');

  const dateLocale = language === 'fr' ? fr : language === 'es' ? es : enUS;

  const handleRunMatching = () => {
    setIsRunningMatching(true);
    toast.info(t('organizations.matching.messages.running'));

    window.setTimeout(() => {
      const scoredOrganizations = allOrganizations.map((organization) => ({
        ...organization,
        matchScore: Math.floor(Math.random() * 30) + 70,
      }));
      setMatchingResults(scoredOrganizations);
      setIsRunningMatching(false);
      toast.success(t('organizations.matching.messages.completed'));
    }, 800);
  };

  const filteredResults = useMemo(() => {
    let filtered = matchingResults.filter((organization) => {
      if (organization.matchScore < minScore) return false;
      if (
        selectedSector !== 'ALL' &&
        !(organization.sectors || []).some((sector: any) => getSectorCode(sector).toUpperCase() === selectedSector.toUpperCase())
      ) {
        return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return [
          organization.name,
          toDisplayText(organization.description, ''),
          toDisplayText(organization.type, ''),
          toDisplayText(organization.city, ''),
          toDisplayText(organization.country, ''),
          toDisplayText(organization.sectors, ''),
        ].some((value) => value.toLowerCase().includes(query));
      }

      return true;
    });

    switch (sortBy) {
      case 'budget':
        filtered = [...filtered].sort((a, b) => getBudgetAmount(b.budget) - getBudgetAmount(a.budget));
        break;
      case 'newest':
        filtered = [...filtered].sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
        );
        break;
      default:
        filtered = [...filtered].sort((a, b) => b.matchScore - a.matchScore);
        break;
    }

    return filtered;
  }, [matchingResults, minScore, selectedSector, searchQuery, sortBy]);

  const highMatches = matchingResults.filter((organization) => organization.matchScore >= 80).length;
  const mediumMatches = matchingResults.filter(
    (organization) => organization.matchScore >= 60 && organization.matchScore < 80,
  ).length;
  const avgScore = matchingResults.length
    ? Math.round(matchingResults.reduce((sum, organization) => sum + organization.matchScore, 0) / matchingResults.length)
    : 0;

  const handleSaveMatching = async () => {
    if (filteredResults.length === 0) {
      toast.error(t('organizations.matching.save.noResultsError'));
      return;
    }

    const name = `Matching ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: dateLocale })}`;
    await organizationMatchingDossierService.createDossier({
      name,
      results: filteredResults,
      avgScore,
      totalOrganizations: filteredResults.length,
      filters: {
        minScore,
        selectedSector,
        searchQuery,
        sortBy,
      },
    });

    toast.success(t('organizations.matching.save.success'));
    navigate('/organizations/matching-dossier');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        title={isExpertAccount ? t('organizations.matching.expert.title') : t('organizations.matching.org.title')}
        description={isExpertAccount ? t('organizations.matching.expert.subtitle') : t('organizations.matching.org.subtitle')}
        icon={Sparkles}
      />
      <OrganizationsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="mb-6 bg-gradient-to-br from-[#3d4654] to-[#2c3440] rounded-lg p-6 shadow-lg border border-gray-300">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {isExpertAccount ? t('organizations.matching.expert.title') : t('organizations.matching.org.title')}
                </h3>
                <p className="text-sm text-white/80">
                  {isExpertAccount ? t('organizations.matching.expert.subtitle') : t('organizations.matching.org.subtitle')}
                </p>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title={t('organizations.matching.stats.totalOrganizations')}
              value={String(allOrganizations.length)}
              subtitle={t('organizations.matching.stats.available')}
              icon={Building2}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-600"
            />
            <StatCard
              title={t('organizations.matching.stats.highMatches')}
              value={String(highMatches)}
              subtitle=">=80%"
              icon={TrendingUp}
              iconBgColor="bg-green-50"
              iconColor="text-green-600"
            />
            <StatCard
              title={t('organizations.matching.stats.mediumMatches')}
              value={String(mediumMatches)}
              subtitle="60-79%"
              icon={Star}
              iconBgColor="bg-orange-50"
              iconColor="text-orange-600"
            />
            <StatCard
              title={t('organizations.matching.stats.avgScore')}
              value={avgScore ? `${avgScore}%` : '-'}
              subtitle={t('organizations.matching.stats.quality')}
              icon={Star}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-600"
            />
          </div>

          {matchingResults.length > 0 && (
            <Card className="mb-6 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <h3 className="font-semibold text-gray-900">{t('organizations.matching.filters.title')}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder={t('organizations.matching.filters.search')}
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={String(minScore)} onValueChange={(value) => setMinScore(Number(value))}>
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

                  <Select value={sortBy} onValueChange={(value: 'score' | 'budget' | 'newest') => setSortBy(value)}>
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

          {matchingResults.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{t('organizations.matching.results.title')}</h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {filteredResults.length} {t('organizations.matching.results.organizations')}
                  </span>
                  <Button onClick={handleSaveMatching} size="sm" variant="outline" className="border-gray-300">
                    <Save className="w-4 h-4 mr-1" />
                    {t('organizations.matching.actions.saveMatching')}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredResults.map((organization) => (
                  <Card key={organization.id} className="border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-lg mb-1">{organization.name}</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                {organization.acronym && <span className="font-mono">{organization.acronym}</span>}
                                <span>{toDisplayText(organization.type)}</span>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-md border font-bold text-lg ${getScoreColor(organization.matchScore)}`}>
                              {organization.matchScore}%
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-3">{toDisplayText(organization.description, '')}</p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">
                                {[toDisplayText(organization.city, ''), toDisplayText(organization.country, '')].filter(Boolean).join(', ') || '-'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{getBudgetLabel(organization.budget)}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{organization.yearEstablished || '-'}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Briefcase className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{(organization as any).employeeCount || organization.teamMembers || '-'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {(organization.sectors || []).map((sector: any, index: number) => (
                              <Badge key={`${organization.id}-${index}`} variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
                                {toDisplayText(sector)}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button
                          onClick={() => navigate(`/organizations/${organization.id}`)}
                          size="sm"
                          className="bg-[#B82547] hover:bg-[#9a1f3a] text-white"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {t('organizations.matching.card.viewDetails')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card className="border-gray-200">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('organizations.matching.results.notStarted')}</h3>
                <p className="text-gray-500 mb-4">{t('organizations.matching.results.clickToStart')}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
