import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ExpertsSubMenu } from '@app/components/ExpertsSubMenu';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import { useExperts } from '@app/modules/expert/hooks/useExperts';
import { useMatchingArchive } from '@app/modules/expert/hooks/useMatchingArchive';
import type { MatchedExpert } from '@app/modules/expert/hooks/useMatchingArchive';
import { ExpertSectorEnum, AvailabilityEnum } from '@app/modules/expert/types/expert.dto';
import { toast } from 'sonner';
import {
  Sparkles,
  TrendingUp,
  Target,
  Search,
  Zap,
  AlertCircle,
  CheckCircle,
  Filter,
  SlidersHorizontal,
  Info,
  Building2,
  Loader2,
  Award,
  Briefcase,
  Users,
  Save,
} from 'lucide-react';

// Constants for AI Matching Limits
const UNLIMITED_MATCHES = -1; // For organization, admin, expert accounts

export default function MatchExpertsOrganizations() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { experts } = useExperts();
  const { user } = useAuth();
  const { saveMatching } = useMatchingArchive();

  // Determine account type and matching limit
  const accountType = user?.accountType || 'public';
  const isOrganization = accountType === 'organization';
  const isAdmin = accountType === 'admin';
  const isExpert = accountType === 'expert';
  
  // Set matching limit: unlimited for organization/admin/expert
  const maxMatches = (isOrganization || isAdmin || isExpert) 
    ? UNLIMITED_MATCHES 
    : 0;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<ExpertSectorEnum | 'all'>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<AvailabilityEnum | 'all'>('all');
  const [minScore, setMinScore] = useState(60);

  // AI Matching Limit State
  const [matchingsPerformed, setMatchingsPerformed] = useState(0);
  const [matchingInProgress, setMatchingInProgress] = useState(false);

  // Applied filters state - only updated when "Run AI Matching" is clicked
  const [hasRunMatching, setHasRunMatching] = useState(false);

  // Handle AI Matching Execution
  const handleRunMatching = async () => {
    // For unlimited accounts, skip limit check
    const isLimitReached = maxMatches !== UNLIMITED_MATCHES && matchingsPerformed >= maxMatches;
    
    if (isLimitReached || matchingInProgress) {
      return;
    }

    setMatchingInProgress(true);
    
    // Simulate AI matching process with multiple stages
    try {
      // Stage 1: Analyzing experts
      toast.loading(t('expertsMatching.success.analyzing'), { id: 'matching' });
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Stage 2: Calculating scores
      toast.loading(t('expertsMatching.success.calculating'), { id: 'matching' });
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Stage 3: Filtering candidates
      toast.loading(t('expertsMatching.success.filtering'), { id: 'matching' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Increment counter
      setMatchingsPerformed(prev => prev + 1);
      
      // Mark as run
      setHasRunMatching(true);
      
      // Success message
      toast.success(
        t('expertsMatching.success.description').replace('{count}', matchedExperts.length.toString()),
        { id: 'matching', duration: 4000 }
      );
    } catch (error) {
      toast.error('Une erreur est survenue lors du matching IA', { id: 'matching' });
    } finally {
      setMatchingInProgress(false);
    }
  };

  // Filter experts by match score with simulated scores
  const matchedExperts = hasRunMatching 
    ? experts.data
        .map(expert => ({
          ...expert,
          matchScore: Math.floor(Math.random() * 40) + 60 // Simulated score 60-100
        }))
        .filter((expert) => expert.matchScore >= minScore)
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .filter((expert) => {
          const matchesSearch =
            !searchQuery ||
            `${expert.firstName} ${expert.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            expert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            expert.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

          const matchesSector = selectedSector === 'all' || expert.sectors.includes(selectedSector);
          const matchesAvailability = selectedAvailability === 'all' || expert.availability === selectedAvailability;

          return matchesSearch && matchesSector && matchesAvailability;
        })
    : [];

  const excellentMatches = matchedExperts.filter((e) => (e.matchScore || 0) >= 90).length;
  const avgScore =
    matchedExperts.length > 0
      ? Math.round(
          matchedExperts.reduce((acc, e) => acc + (e.matchScore || 0), 0) / matchedExperts.length
        )
      : 0;

  const getMatchReasons = (expert: any): { label: string; icon: React.ElementType; color: string }[] => {
    const reasons: { label: string; icon: React.ElementType; color: string }[] = [];

    if (expert.sectors.length > 0) {
      reasons.push({
        label: t('expertsMatching.reasons.sector'),
        icon: Target,
        color: 'text-blue-600',
      });
    }

    if (expert.skills && expert.skills.length >= 5) {
      reasons.push({
        label: t('expertsMatching.reasons.skills'),
        icon: Briefcase,
        color: 'text-green-600',
      });
    }

    if (expert.yearsOfExperience >= 10) {
      reasons.push({
        label: t('expertsMatching.reasons.experience'),
        icon: TrendingUp,
        color: 'text-purple-600',
      });
    }

    if (expert.clientRating >= 4.5) {
      reasons.push({
        label: t('expertsMatching.reasons.highSuccess'),
        icon: Award,
        color: 'text-orange-600',
      });
    }

    return reasons;
  };

  // Handle Save Matching
  const handleSaveMatching = () => {
    if (matchedExperts.length === 0) {
      toast.error(t('matchingArchive.messages.noExperts') || 'No experts to save');
      return;
    }

    // Mock organization data (in real app, this would come from an organization selection)
    const mockOrgData = {
      orgId: 'org-' + Date.now(),
      orgTitle: 'Sample Organization - Health Sector',
      orgReference: 'ORG-2024-001',
      positionTitle: 'Senior Health Project Manager',
    };

    // Transform matched experts to MatchedExpert format
    const expertsToSave: MatchedExpert[] = matchedExperts.map(expert => ({
      expertId: expert.id,
      expertName: `${expert.firstName} ${expert.lastName}`,
      matchScore: expert.matchScore || 0,
      skills: expert.skills || [],
      experience: expert.yearsOfExperience,
      availability: expert.availability,
    }));

    // Save the matching
    try {
      saveMatching(
        mockOrgData.orgId,
        mockOrgData.orgTitle,
        mockOrgData.positionTitle,
        expertsToSave,
        mockOrgData.orgReference
      );
      toast.success(t('matchingArchive.messages.saved'));
    } catch (error) {
      toast.error(t('matchingArchive.messages.error') || 'Failed to save matching');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Page Banner */}
      <PageBanner
        title={t('expertsMatching.orgs.title')}
        subtitle={t('expertsMatching.orgs.subtitle')}
        icon={Building2}
      />

      {/* Sub Menu */}
      <ExpertsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            {/* Card 1: Experts Matched */}
            <div className="bg-gradient-to-br from-[#f1f5f9] to-[#e2e8f0] p-6 rounded-lg border border-gray-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#3d4654] rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-[#3d4654]">
                  {t('expertsMatching.stats.matches')}
                </span>
              </div>
              <p className="text-4xl font-bold text-[#3d4654] mb-1">{matchedExperts.length}</p>
              <p className="text-sm text-gray-600">{t('expertsMatching.stats.matchesSubtitle')}</p>
            </div>

            {/* Card 2: Avg Score */}
            <div className="bg-gradient-to-br from-[#fce7f3] to-[#fbcfe8] p-6 rounded-lg border border-[#f9a8d4]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#B82547] rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-[#B82547]">
                  {t('expertsMatching.stats.avgScore')}
                </span>
              </div>
              <p className="text-4xl font-bold text-[#B82547] mb-1">{avgScore}%</p>
              <p className="text-sm text-[#9f1239]">{t('expertsMatching.stats.avgScoreSubtitle')}</p>
            </div>

            {/* Card 3: Available Matchings */}
            <div className="bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] p-6 rounded-lg border border-[#6ee7b7]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#065f46] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-[#065f46]">
                  {t('aiMatching.limit.available')}
                </span>
              </div>
              <p className="text-4xl font-bold text-[#065f46] mb-1">
                {maxMatches === UNLIMITED_MATCHES ? '8' : (maxMatches - matchingsPerformed)}/{maxMatches === UNLIMITED_MATCHES ? '8' : maxMatches}
              </p>
              <p className="text-sm text-[#047857]">{t('expertsMatching.stats.excellentSubtitle')}</p>
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
                      {t('expertsMatching.orgs.howItWorks')}
                    </h3>
                    <p className="text-sm text-white/80">
                      {t('expertsMatching.orgs.description')}
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
              <h2 className="text-lg font-semibold text-primary">{t('expertsMatching.filters.title')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('expertsMatching.filters.search')}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={t('expertsMatching.filters.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Sector Filter */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('expertsMatching.filters.sector')}
                </label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value as ExpertSectorEnum | 'all')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="all">{t('expertsMatching.filters.allSectors')}</option>
                  {Object.values(ExpertSectorEnum).map((sector) => (
                    <option key={sector} value={sector}>
                      {t(`sectors.${sector}`)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability Filter */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('expertsMatching.filters.availability')}
                </label>
                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value as AvailabilityEnum | 'all')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="all">{t('expertsMatching.filters.allAvailability')}</option>
                  <option value={AvailabilityEnum.IMMEDIATE}>{t('expertsMatching.filters.available')}</option>
                  <option value={AvailabilityEnum.BUSY}>{t('expertsMatching.filters.busy')}</option>
                </select>
              </div>

              {/* Min Score Filter */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('expertsMatching.filters.minScore')}: {minScore}%
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
            {(searchQuery || selectedSector !== 'all' || selectedAvailability !== 'all' || minScore > 60) && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{t('expertsMatching.filters.active')}:</span>
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
                {selectedAvailability !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {selectedAvailability === AvailabilityEnum.IMMEDIATE ? t('expertsMatching.filters.available') : t('expertsMatching.filters.busy')}
                    <button onClick={() => setSelectedAvailability('all')}>�</button>
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
                    setSelectedAvailability('all');
                    setMinScore(60);
                  }}
                  className="text-xs ml-auto"
                >
                  {t('expertsMatching.filters.clear')}
                </Button>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Results Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary">
                {t('expertsMatching.orgs.results.title')} ({matchedExperts.length})
              </h2>
              <div className="flex items-center gap-3">
                {/* Save Matching Button - Only visible when has results */}
                {hasRunMatching && matchedExperts.length > 0 && (
                  <Button
                    onClick={handleSaveMatching}
                    className="bg-[#B82547] hover:bg-[#a01f3c] text-white px-6 py-2 text-sm font-semibold gap-2 shadow-md"
                    size="default"
                  >
                    <Save className="w-4 h-4" />
                    {t('matchingArchive.buttons.save')}
                  </Button>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>{t('expertsMatching.orgs.results.sorted')}</span>
                </div>
              </div>
            </div>

            {/* Matched Experts Grid */}
            {matchedExperts.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {hasRunMatching ? (
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                  ) : (
                    <Sparkles className="w-8 h-8 text-[#B82547]" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {hasRunMatching ? t('expertsMatching.orgs.empty.title') : t('expertsMatching.orgs.noMatching.title')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {hasRunMatching ? t('expertsMatching.orgs.empty.message') : t('expertsMatching.orgs.noMatching.message')}
                </p>
                {hasRunMatching && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSector('all');
                      setSelectedAvailability('all');
                      setMinScore(60);
                    }}
                  >
                    {t('expertsMatching.filters.clear')}
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {matchedExperts.map((expert) => {
                  const matchReasons = getMatchReasons(expert);

                  return (
                    <div key={expert.id} className="relative">
                      {/* Match Score Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <div
                          className={`px-3 py-1.5 rounded-full font-bold text-sm shadow-lg ${
                            (expert.matchScore || 0) >= 90
                              ? 'bg-green-500 text-white'
                              : (expert.matchScore || 0) >= 80
                              ? 'bg-blue-500 text-white'
                              : (expert.matchScore || 0) >= 70
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-500 text-white'
                          }`}
                        >
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          {expert.matchScore}% Match
                        </div>
                      </div>

                      {/* Expert Card */}
                      <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Award className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {expert.firstName} {expert.lastName}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">{expert.title}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                {expert.yearsOfExperience} {t('experts.stats.yearsExp')}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {expert.dailyRate} {expert.currency}/day
                              </Badge>
                              {expert.verified && (
                                <Badge className="bg-green-100 text-green-700 text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{expert.bio}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {expert.completedMissions} {t('experts.stats.completedMissions')}
                            </span>
                          </div>
                          <Button
                            onClick={() => navigate(`/experts/${expert.id}`)}
                            variant="outline"
                            size="sm"
                          >
                            {t('common.viewDetails')}
                          </Button>
                        </div>
                      </div>

                      {/* Match Reasons */}
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-b-lg border border-t-0 border-gray-200 p-4">
                        <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                          {t('expertsMatching.matchReasons')}:
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
    </div>
  );
}