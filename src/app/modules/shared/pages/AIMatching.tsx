import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useOrganizationProfile } from '@app/contexts/OrganizationProfileContext';
import { useAuth } from '@app/contexts/AuthContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TendersSubMenu } from '@app/components/TendersSubMenu';
import { TenderCard } from '@app/components/TenderCard';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import { Progress } from '@app/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@app/components/ui/dialog';
import { useTenders } from '@app/hooks/useTenders';
import { usePipeline } from '@app/modules/expert/hooks/usePipeline';
import { TenderListDTO, SectorEnum } from '@app/types/tender.dto';
import { getSubsectorsForSector, getSubsectorTranslationKey, SubsectorKey } from '@app/config/subsectors.config';
import { toast } from 'sonner';
import {
  Sparkles,
  TrendingUp,
  Target,
  Search,
  Zap,
  DollarSign,
  MapPin,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Filter,
  SlidersHorizontal,
  Building2,
  Edit3,
  ArrowRight,
  Info,
  X,
  FileText,
  Loader2,
} from 'lucide-react';

// Constants for AI Matching Limits
const UNLIMITED_MATCHES = -1; // For organization accounts

// Local Storage Key for Daily Reset
const STORAGE_KEY_PREFIX = 'aiMatching_';

export default function AIMatching() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tenders, saveTender, unsaveTender, isTenderSaved } = useTenders();
  const { addToPipeline, isInPipeline } = usePipeline();
  const { profile } = useOrganizationProfile();
  const { user } = useAuth();

  // Organization Profile data from context
  const organizationProfileExists = profile.exists;
  const profileCompletionRate = profile.completionRate;
  const isProfileIncomplete = !organizationProfileExists || profileCompletionRate < 80;

  // Determine account type and matching limit
  const accountType = user?.accountType || 'public';
  const isOrganization = accountType === 'organization';
  const maxMatches = isOrganization ? UNLIMITED_MATCHES : 0;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<SectorEnum | 'all'>('all');
  const [selectedSubsector, setSelectedSubsector] = useState<SubsectorKey | 'all'>('all');
  const [minScore, setMinScore] = useState(60);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState<TenderListDTO | null>(null);

  // AI Matching Limit State
  const [matchingsPerformed, setMatchingsPerformed] = useState(0);
  const [matchingInProgress, setMatchingInProgress] = useState(false);

  // Applied filters state - only updated when "Run AI Matching" is clicked
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [appliedSector, setAppliedSector] = useState<SectorEnum | 'all'>('all');
  const [appliedSubsector, setAppliedSubsector] = useState<SubsectorKey | 'all'>('all');
  const [appliedMinScore, setAppliedMinScore] = useState(60);
  const [hasRunMatching, setHasRunMatching] = useState(false);

  // Profile Dialog State
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  // Available subsectors based on selected sector
  const availableSubsectors = selectedSector !== 'all' ? getSubsectorsForSector(selectedSector) : [];

  // Reset subsector when sector changes
  useEffect(() => {
    setSelectedSubsector('all');
  }, [selectedSector]);

  // Handle AI Matching Execution
  const handleRunMatching = async () => {
    // For organization accounts, skip limit check (unlimited)
    const isLimitReached = maxMatches !== UNLIMITED_MATCHES && matchingsPerformed >= maxMatches;
    
    if (isLimitReached || matchingInProgress) {
      return;
    }

    setMatchingInProgress(true);
    
    // Simulate AI matching process with multiple stages
    try {
      // Stage 1: Analyzing tenders
      toast.loading(t('aiMatching.success.analyzing'), { id: 'matching' });
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Stage 2: Calculating scores
      toast.loading(t('aiMatching.success.calculating'), { id: 'matching' });
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Stage 3: Filtering opportunities
      toast.loading(t('aiMatching.success.filtering'), { id: 'matching' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Apply filters to calculate result count
      const tempFilteredResults = tenders.data
        .filter((tender) => tender.matchScore && tender.matchScore >= minScore)
        .filter((tender) => {
          const matchesSearch =
            !searchQuery ||
            tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tender.organizationName.toLowerCase().includes(searchQuery.toLowerCase());

          const matchesSector = selectedSector === 'all' || tender.sectors.includes(selectedSector);

          const matchesSubsector = selectedSubsector === 'all' || tender.subsectors?.includes(selectedSubsector);

          return matchesSearch && matchesSector && matchesSubsector;
        });
      
      // Increment counter
      setMatchingsPerformed(prev => prev + 1);
      
      // Update applied filters
      setAppliedSearchQuery(searchQuery);
      setAppliedSector(selectedSector);
      setAppliedSubsector(selectedSubsector);
      setAppliedMinScore(minScore);
      setHasRunMatching(true);
      
      // Success message with correct count
      toast.success(
        t('aiMatching.success.description').replace('{count}', tempFilteredResults.length.toString()),
        { id: 'matching', duration: 4000 }
      );
    } catch (error) {
      toast.error('Une erreur est survenue lors du matching IA', { id: 'matching' });
    } finally {
      setMatchingInProgress(false);
    }
  };

  // Filter tenders by match score - use CURRENT filters for real-time filtering
  const matchedTenders = hasRunMatching 
    ? tenders.data
        .filter((tender) => tender.matchScore && tender.matchScore >= minScore) // Use current minScore
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .filter((tender) => {
          const matchesSearch =
            !searchQuery ||
            tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tender.organizationName.toLowerCase().includes(searchQuery.toLowerCase());

          const matchesSector = selectedSector === 'all' || tender.sectors.includes(selectedSector);

          // Subsector filtering now enabled with subsectors field in TenderListDTO
          const matchesSubsector = selectedSubsector === 'all' || tender.subsectors?.includes(selectedSubsector);

          return matchesSearch && matchesSector && matchesSubsector;
        })
    : []; // No results until user runs matching

  const excellentMatches = matchedTenders.filter((t) => (t.matchScore || 0) >= 90).length;
  const avgScore =
    matchedTenders.length > 0
      ? Math.round(
          matchedTenders.reduce((acc, t) => acc + (t.matchScore || 0), 0) / matchedTenders.length
        )
      : 0;

  const getMatchReasons = (tender: TenderListDTO): { label: string; icon: React.ElementType; color: string }[] => {
    const reasons: { label: string; icon: React.ElementType; color: string }[] = [];

    if (tender.sectors.length > 0) {
      reasons.push({
        label: t('aiMatching.reasons.sector'),
        icon: Target,
        color: 'text-blue-600',
      });
    }

    if (tender.budget.amount > 100000) {
      reasons.push({
        label: t('aiMatching.reasons.budget'),
        icon: DollarSign,
        color: 'text-green-600',
      });
    }

    if (tender.matchScore && tender.matchScore >= 80) {
      reasons.push({
        label: t('aiMatching.reasons.highSuccess'),
        icon: TrendingUp,
        color: 'text-purple-600',
      });
    }

    reasons.push({
        label: t('aiMatching.reasons.location'),
        icon: MapPin,
        color: 'text-orange-600',
      });

    return reasons;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Page Banner - Appels d'offres */}
      <PageBanner
        title={t('tenders.module.title')}
        subtitle={t('tenders.module.subtitle')}
        icon={FileText}
      />

      {/* Sub Menu */}
      <TendersSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Organization Profile Alert - Shows if profile is incomplete */}
          {isProfileIncomplete && (
            <div className="mb-6 bg-gray-50 border-2 border-[#3d4654] rounded-lg p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#3d4654] rounded-full flex items-center justify-center">
                    <Info className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-[#3d4654]">
                      {t('aiMatching.profileAlert.title')}
                    </h3>
                    {organizationProfileExists && (
                      <Badge variant="secondary" className="bg-white border border-[#3d4654]">
                        <Target className="w-3 h-3 mr-1 text-[#3d4654]" />
                        <span className="text-[#3d4654]">{profileCompletionRate}% {t('aiMatching.profileAlert.complete')}</span>
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-[#3d4654] mb-4 leading-relaxed">
                    {organizationProfileExists 
                      ? t('aiMatching.profileAlert.incompleteMessage')
                      : t('aiMatching.profileAlert.noProfileMessage')}
                  </p>

                  {/* Profile Completion Progress Bar */}
                  {organizationProfileExists && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-[#3d4654]">
                          {t('aiMatching.profileAlert.profileProgress')}
                        </span>
                        <span className="text-xs font-bold text-[#3d4654]">{profileCompletionRate}%</span>
                      </div>
                      <Progress value={profileCompletionRate} className="h-2 bg-gray-300" />
                    </div>
                  )}

                  {/* Benefits List */}
                  <div className="bg-white rounded-lg p-4 mb-4 border border-gray-300">
                    <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      {t('aiMatching.profileAlert.benefitsTitle')}:
                    </p>
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{t('aiMatching.profileAlert.benefit1')}</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{t('aiMatching.profileAlert.benefit2')}</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{t('aiMatching.profileAlert.benefit3')}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => setProfileDialogOpen(true)}
                      className="bg-[#B82547] hover:bg-[#a01f3c] text-white gap-2"
                    >
                      <Building2 className="w-4 h-4" />
                      {organizationProfileExists 
                        ? t('aiMatching.profileAlert.completeProfile')
                        : t('aiMatching.profileAlert.createProfile')}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            {/* Card 1: Primary Color (#3d4654) */}
            <div className="bg-gradient-to-br from-[#f1f5f9] to-[#e2e8f0] p-6 rounded-lg border border-gray-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#3d4654] rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-[#3d4654]">
                  {t('aiMatching.stats.matches')}
                </span>
              </div>
              <p className="text-4xl font-bold text-[#3d4654] mb-1">{matchedTenders.length}</p>
              <p className="text-sm text-gray-600">{t('aiMatching.stats.matchesSubtitle')}</p>
            </div>

            {/* Card 2: Accent Color (#B82547) */}
            <div className="bg-gradient-to-br from-[#fce7f3] to-[#fbcfe8] p-6 rounded-lg border border-[#f9a8d4]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#B82547] rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-[#B82547]">
                  {t('aiMatching.stats.avgScore')}
                </span>
              </div>
              <p className="text-4xl font-bold text-[#B82547] mb-1">{avgScore}%</p>
              <p className="text-sm text-[#9f1239]">{t('aiMatching.stats.avgScoreSubtitle')}</p>
            </div>

            {/* Card 3: Success Color (#065f46) - Shows Available Matchings */}
            <div className="bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] p-6 rounded-lg border border-[#6ee7b7]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#065f46] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-[#065f46]">
                  {t('aiMatching.limit.available')}
                </span>
              </div>
              <p className="text-4xl font-bold text-[#065f46] mb-1">{maxMatches === UNLIMITED_MATCHES ? '8' : (maxMatches - matchingsPerformed)}/{maxMatches === UNLIMITED_MATCHES ? '8' : maxMatches}</p>
              <p className="text-sm text-[#047857]">{t('aiMatching.stats.excellentSubtitle')}</p>
            </div>
          </div>

          {/* AI Matching Limit Alerts */}
          {maxMatches !== UNLIMITED_MATCHES && matchingsPerformed >= maxMatches && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-red-900 mb-1">
                    {t('aiMatching.limit.reached.title')}
                  </h4>
                  <p className="text-sm text-red-700">
                    {t('aiMatching.limit.reached.description').replace('{max}', maxMatches.toString())}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {maxMatches !== UNLIMITED_MATCHES && matchingsPerformed < maxMatches && matchingsPerformed === maxMatches - 1 && (
            <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Info className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-orange-900 mb-1">
                    {t('aiMatching.limit.warning.title')}
                  </h4>
                  <p className="text-sm text-orange-700">
                    {t('aiMatching.limit.warning.description').replace('{remaining}', (maxMatches - matchingsPerformed).toString())}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Separator className="my-6" />

          {/* AI Matching Action Button Section */}
          <div className="mb-6 bg-gradient-to-br from-[#3d4654] to-[#2c3440] rounded-lg p-6 shadow-lg border border-gray-300">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {t('aiMatching.info.howItWorks')}
                    </h3>
                    <p className="text-sm text-white/80">
                      {t('aiMatching.info.description')}
                    </p>
                  </div>
                </div>
                
                {/* Matching Counter Info */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="bg-white/10 px-3 py-1.5 rounded-full">
                    <span className="text-white font-semibold text-sm">
                      {maxMatches === UNLIMITED_MATCHES ? '8' : (maxMatches - matchingsPerformed)} {t('aiMatching.limit.available').toLowerCase()}
                    </span>
                  </div>
                  {matchingsPerformed > 0 && (
                    <div className="text-white/70 text-xs">
                      ({matchingsPerformed}/{maxMatches === UNLIMITED_MATCHES ? '8' : maxMatches} {t('aiMatching.limit.completed').toLowerCase()})
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-col items-center gap-2">
                <Button
                  onClick={handleRunMatching}
                  disabled={(maxMatches !== UNLIMITED_MATCHES && matchingsPerformed >= maxMatches) || matchingInProgress}
                  className="bg-[#B82547] hover:bg-[#a01f3c] text-white px-8 py-6 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed gap-3 shadow-xl"
                  size="lg"
                >
                  {matchingInProgress ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('aiMatching.limit.running')}
                    </>
                  ) : (maxMatches !== UNLIMITED_MATCHES && matchingsPerformed >= maxMatches) ? (
                    <>
                      <AlertCircle className="w-5 h-5" />
                      {t('aiMatching.limit.reached.title')}
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      {t('aiMatching.limit.button')}
                    </>
                  )}
                </Button>
                
                {/* Profile Access Button - Always Visible */}
                <Button
                  onClick={() => setProfileDialogOpen(true)}
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 px-6 py-2 text-sm gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  {t('aiMatching.profileDialog.goToProfile')}
                </Button>
                
                {(maxMatches === UNLIMITED_MATCHES || matchingsPerformed < maxMatches) && (
                  <span className="text-white/60 text-xs">
                    {t('aiMatching.limit.available')}: {maxMatches === UNLIMITED_MATCHES ? '8' : (maxMatches - matchingsPerformed)}/{maxMatches === UNLIMITED_MATCHES ? '8' : maxMatches}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Filters Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-primary">{t('filters.title')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('filters.search')}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={t('aiMatching.search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Sector Filter */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('filters.sector')}
                </label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value as SectorEnum | 'all')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="all">{t('aiMatching.filters.allSectors')}</option>
                  {Object.values(SectorEnum).slice(0, 12).map((sector) => (
                    <option key={sector} value={sector}>
                      {t(`sectors.${sector}`)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subsector Filter */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('tenders.filters.subsector')}
                </label>
                <select
                  value={selectedSubsector}
                  onChange={(e) => setSelectedSubsector(e.target.value as SubsectorKey | 'all')}
                  disabled={selectedSector === 'all' || availableSubsectors.length === 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="all">
                    {selectedSector === 'all' 
                      ? t('aiMatching.filters.selectSectorFirst') 
                      : t('aiMatching.filters.allSubsectors')}
                  </option>
                  {selectedSector !== 'all' && availableSubsectors.map((subsector) => (
                    <option key={subsector} value={subsector}>
                      {t(getSubsectorTranslationKey(selectedSector, subsector))}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Score Filter */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('aiMatching.filters.minScore')}: {minScore}%
                </label>
                <input
                  type="range"
                  min="60"
                  max="100"
                  step="5"
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>60%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(searchQuery || selectedSector !== 'all' || selectedSubsector !== 'all' || minScore > 60) && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{t('filters.active')}:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    {searchQuery}
                    <button onClick={() => setSearchQuery('')}>�</button>
                  </Badge>
                )}
                {selectedSector !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {t(`sectors.${selectedSector}`)}
                    <button onClick={() => setSelectedSector('all')}>�</button>
                  </Badge>
                )}
                {selectedSubsector !== 'all' && selectedSector !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {t(getSubsectorTranslationKey(selectedSector, selectedSubsector))}
                    <button onClick={() => setSelectedSubsector('all')}>�</button>
                  </Badge>
                )}
                {minScore > 60 && (
                  <Badge variant="secondary" className="gap-1">
                    Score = {minScore}%
                    <button onClick={() => setMinScore(60)}>�</button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSector('all');
                    setSelectedSubsector('all');
                    setMinScore(60);
                  }}
                  className="text-xs ml-auto"
                >
                  {t('filters.clear')}
                </Button>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Results Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary">
                {t('aiMatching.results.title')} ({matchedTenders.length})
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>{t('aiMatching.results.sorted')}</span>
              </div>
            </div>

            {/* Matched Tenders Grid */}
            {matchedTenders.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {hasRunMatching ? (
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                  ) : (
                    <Sparkles className="w-8 h-8 text-[#B82547]\" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {hasRunMatching ? t('aiMatching.empty.title') : t('aiMatching.noMatching.title')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {hasRunMatching ? t('aiMatching.empty.message') : t('aiMatching.noMatching.message')}
                </p>
                {hasRunMatching && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSector('all');
                      setSelectedSubsector('all');
                      setMinScore(60);
                    }}
                  >
                    {t('filters.clear')}
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {matchedTenders.map((tender) => {
                  const matchReasons = getMatchReasons(tender);
                  const isSaved = isTenderSaved(tender.id);
                  const isInPipe = isInPipeline(tender.id);

                  return (
                    <div key={tender.id} className="relative">
                      {/* Match Score Badge */}
                      <div className="absolute top-4 right-4 z-10 pointer-events-none">
                        <div
                          className={`px-3 py-1.5 rounded-full font-bold text-sm shadow-lg pointer-events-auto ${
                            (tender.matchScore || 0) >= 90
                              ? 'bg-green-500 text-white'
                              : (tender.matchScore || 0) >= 80
                              ? 'bg-blue-500 text-white'
                              : (tender.matchScore || 0) >= 70
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-500 text-white'
                          }`}
                        >
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          {tender.matchScore}% Match
                        </div>
                      </div>

                      {/* Tender Card */}
                      <TenderCard
                        tender={tender}
                        onSave={isSaved ? () => unsaveTender(tender.id) : () => saveTender(tender.id)}
                        isSaved={isSaved}
                        onAddToPipeline={() => {
                          addToPipeline(tender.id);
                          toast.success(t('tenders.messages.addedToPipeline'));
                        }}
                        isInPipeline={isInPipe}
                        onViewDetails={(tenderId) => {
                          console.log('?? Navigation triggered for tender:', tenderId);
                          navigate(`/calls/${tenderId}`);
                        }}
                        onViewToR={(torId) => navigate(`/calls/tors/${torId}`)}
                      />

                      {/* Match Reasons */}
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-b-lg border border-t-0 border-gray-200 p-4">
                        <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                          {t('aiMatching.matchReasons')}:
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                          {matchReasons.map((reason, idx) => {
                            const Icon = reason.icon;
                            return (
                              <div key={idx} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-200">
                                <Icon className={`w-4 h-4 ${reason.color}`} />
                                <span className="text-xs font-medium text-gray-700">{reason.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </PageContainer>

      {/* Organization Profile Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Building2 className="w-6 h-6 text-accent" />
              {t('aiMatching.profileDialog.title')}
            </DialogTitle>
            <DialogDescription>
              {t('aiMatching.profileDialog.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Profile Completion Progress */}
            <div className="bg-gradient-to-r from-[#dbeafe] to-[#bfdbfe] p-4 rounded-lg border border-[#3b82f6]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#1e40af]">
                  {t('aiMatching.profileDialog.completionRate')}
                </span>
                <span className="text-2xl font-bold text-[#1e40af]">{profileCompletionRate}%</span>
              </div>
              <Progress value={profileCompletionRate} className="h-3 bg-white" />
            </div>

            {/* Quick Access Message */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-900">
                <Info className="w-4 h-4 inline mr-2" />
                {t('aiMatching.profileDialog.quickAccess')}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => {
                  setProfileDialogOpen(false);
                  navigate('/organizations/my-organization');
                }}
                className="bg-primary hover:bg-primary/90 text-white gap-2 flex-1"
              >
                <Edit3 className="w-4 h-4" />
                {t('aiMatching.profileDialog.goToProfile')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setProfileDialogOpen(false)}
                className="gap-2 flex-1"
              >
                <X className="w-4 h-4" />
                {t('common.close')}
              </Button>
            </div>

            {/* Information about profile sections */}
            <div className="space-y-3">
              <h4 className="font-semibold text-primary text-sm uppercase tracking-wide">
                {t('aiMatching.profileDialog.sectionsTitle')}:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-[#065f46]" />
                    <span className="text-sm font-medium">{t('aiMatching.profileDialog.section1')}</span>
                  </div>
                  <p className="text-xs text-gray-600 ml-6">{t('aiMatching.profileDialog.section1Desc')}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-[#B82547]" />
                    <span className="text-sm font-medium">{t('aiMatching.profileDialog.section2')}</span>
                  </div>
                  <p className="text-xs text-gray-600 ml-6">{t('aiMatching.profileDialog.section2Desc')}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-[#3d4654]" />
                    <span className="text-sm font-medium">{t('aiMatching.profileDialog.section3')}</span>
                  </div>
                  <p className="text-xs text-gray-600 ml-6">{t('aiMatching.profileDialog.section3Desc')}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium">{t('aiMatching.profileDialog.section4')}</span>
                  </div>
                  <p className="text-xs text-gray-600 ml-6">{t('aiMatching.profileDialog.section4Desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}