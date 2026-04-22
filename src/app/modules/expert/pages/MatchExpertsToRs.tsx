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
  Users,
  Award,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, es } from 'date-fns/locale';
import { ExpertListDTO } from '@app/modules/expert/types/expert.dto';

// Expert with match score
interface ExpertMatch extends ExpertListDTO {
  matchScore: number;
}

export default function MatchExpertsToRs() {
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

  // Run matching algorithm
  const handleRunMatching = () => {
    setIsRunningMatching(true);
    toast.info(t('experts.matching.messages.running'));

    // Simulate API call - Generate random scores for experts
    setTimeout(() => {
      const scoredExperts: ExpertMatch[] = allExperts.map(expert => ({
        ...expert,
        matchScore: Math.floor(Math.random() * 30) + 70 // Random score between 70-99
      }));
      
      setMatchingResults(scoredExperts);
      setIsRunningMatching(false);
      toast.success(t('experts.matching.messages.completed'));
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
    if (score >= 80) return 'bg-green-50 text-green-700 border-green-300';
    if (score >= 60) return 'bg-yellow-50 text-yellow-700 border-yellow-300';
    return 'bg-red-50 text-red-700 border-red-300';
  };

  // Save to archive
  const [selectedExperts, setSelectedExperts] = useState<Set<string>>(new Set());
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [archiveNotes, setArchiveNotes] = useState('');

  const handleToggleExpert = (expertId: string) => {
    const newSelected = new Set(selectedExperts);
    if (newSelected.has(expertId)) {
      newSelected.delete(expertId);
    } else {
      newSelected.add(expertId);
    }
    setSelectedExperts(newSelected);
  };

  const handleSaveToArchive = () => {
    if (selectedExperts.size === 0) {
      toast.error(t('experts.matching.messages.selectExpertsFirst'));
      return;
    }
    setShowSaveDialog(true);
  };

  const confirmSaveToArchive = () => {
    toast.success(
      t('experts.matching.messages.savedToArchive').replace(
        '{count}',
        selectedExperts.size.toString()
      )
    );
    setShowSaveDialog(false);
    setSelectedExperts(new Set());
    setArchiveNotes('');
  };

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <PageBanner
        title={t('experts.matching.title')}
        description={t('experts.matching.description')}
        icon={Sparkles}
      />

      {/* Sub Menu */}
      <ExpertsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* KPIs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <StatCard
              title={t('experts.matching.kpis.totalExperts')}
              value={totalExperts.toString()}
              icon={Users}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
            />
            <StatCard
              title={t('experts.matching.kpis.highMatches')}
              value={highMatches.toString()}
              subtitle={t('experts.matching.kpis.score80Plus')}
              icon={Star}
              iconBgColor="bg-green-50"
              iconColor="text-green-500"
            />
            <StatCard
              title={t('experts.matching.kpis.mediumMatches')}
              value={mediumMatches.toString()}
              subtitle={t('experts.matching.kpis.score60to79')}
              icon={TrendingUp}
              iconBgColor="bg-yellow-50"
              iconColor="text-yellow-500"
            />
            <StatCard
              title={t('experts.matching.kpis.avgScore')}
              value={avgScore > 0 ? `${avgScore}%` : '-'}
              icon={Award}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-500"
            />
          </div>

          {/* Info Banner */}
          <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">
                  {t('experts.matching.info.title')}
                </h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  {t('experts.matching.info.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Run Matching Button */}
          <div className="mb-6">
            <Button
              onClick={handleRunMatching}
              disabled={isRunningMatching}
              className="w-full bg-gradient-to-r from-[#B82547] to-[#8b1c36] hover:from-[#a01f3d] hover:to-[#6d1529] text-white font-semibold py-6 text-lg shadow-lg"
            >
              {isRunningMatching ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  {t('experts.matching.actions.analyzing')}
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 mr-3" />
                  {t('experts.matching.actions.runMatching')}
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          {matchingResults.length > 0 && (
            <>
              {/* Filters and Actions */}
              <div className="mb-6 p-5 bg-white border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">
                      {t('experts.matching.filters.title')}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveToArchive}
                      disabled={selectedExperts.size === 0}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {t('experts.matching.actions.saveToArchive')} ({selectedExperts.size})
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      {t('experts.matching.actions.export')}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder={t('experts.matching.filters.search')}
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
                      <SelectItem value="0">{t('experts.matching.filters.allScores')}</SelectItem>
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
                      <SelectItem value="ALL">{t('experts.matching.filters.allSectors')}</SelectItem>
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
                      <SelectItem value="score">{t('experts.matching.filters.sortByScore')}</SelectItem>
                      <SelectItem value="experience">{t('experts.matching.filters.sortByExperience')}</SelectItem>
                      <SelectItem value="rate">{t('experts.matching.filters.sortByRate')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results Header */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('experts.matching.results.title')} ({filteredResults.length})
                </h3>
                <span className="text-sm text-gray-500">
                  {t('experts.matching.results.showing')} {filteredResults.length} / {matchingResults.length}
                </span>
              </div>

              {/* Results Grid */}
              <div className="space-y-4">
                {filteredResults.map((expert) => (
                  <Card
                    key={expert.id}
                    className="hover:shadow-lg transition-all duration-200 border-l-4"
                    style={{
                      borderLeftColor:
                        expert.matchScore >= 80
                          ? '#22c55e'
                          : expert.matchScore >= 60
                          ? '#eab308'
                          : '#ef4444',
                    }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <div className="pt-1">
                          <input
                            type="checkbox"
                            checked={selectedExperts.has(expert.id)}
                            onChange={() => handleToggleExpert(expert.id)}
                            className="w-5 h-5 text-[#B82547] border-gray-300 rounded focus:ring-[#B82547] cursor-pointer"
                          />
                        </div>

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

                            <div
                              className={`px-3 py-1 rounded-md border font-bold text-lg ${getScoreColor(
                                expert.matchScore
                              )}`}
                            >
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
                            {expert.sectors?.map((sector, index) => (
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
                              onClick={() => navigate(`/experts/${expert.id}`)}
                              className="hover:bg-gray-50"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              {t('experts.matching.actions.viewDetails')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {filteredResults.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('experts.matching.results.noResults')}
                  </h3>
                  <p className="text-gray-500">{t('experts.matching.results.tryAdjusting')}</p>
                </div>
              )}
            </>
          )}

          {/* Empty State - Before Matching */}
          {matchingResults.length === 0 && !isRunningMatching && (
            <div className="text-center py-16 bg-white rounded-lg border">
              <div className="w-20 h-20 bg-gradient-to-br from-[#B82547] to-[#8b1c36] rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('experts.matching.empty.title')}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {t('experts.matching.empty.description')}
              </p>
            </div>
          )}
        </div>
      </PageContainer>

      {/* Save to Archive Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('experts.matching.saveDialog.title')}</DialogTitle>
            <DialogDescription>{t('experts.matching.saveDialog.description')}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('experts.matching.saveDialog.notesLabel')}
            </label>
            <Textarea
              placeholder={t('experts.matching.saveDialog.notesPlaceholder')}
              value={archiveNotes}
              onChange={(e) => setArchiveNotes(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={confirmSaveToArchive}
              className="bg-[#B82547] hover:bg-[#a01f3d] text-white"
            >
              <Archive className="w-4 h-4 mr-2" />
              {t('experts.matching.saveDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}