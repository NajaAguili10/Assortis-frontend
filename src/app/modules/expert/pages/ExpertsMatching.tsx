import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ExpertsSubMenu } from '@app/components/ExpertsSubMenu';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import {
  Zap,
  Sparkles,
  FileText,
  Building2,
  ArrowRight,
  Target,
  TrendingUp,
  CheckCircle,
  Info,
} from 'lucide-react';

// Constants for AI Matching Limits
const UNLIMITED_MATCHES = -1; // For organization, admin, expert accounts

export default function ExpertsMatching() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Determine account type and matching limit
  const accountType = user?.accountType || 'public';
  const isOrganization = accountType === 'organization';
  const isAdmin = accountType === 'admin';
  const isExpert = accountType === 'expert';
  
  // Set matching limit: unlimited for organization/admin/expert
  const maxMatches = (isOrganization || isAdmin || isExpert) 
    ? UNLIMITED_MATCHES 
    : 0;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Page Banner */}
      <PageBanner
        title={t('experts.card.matching.title')}
        subtitle={t('experts.card.matching.description')}
        icon={Zap}
      />

      {/* Sub Menu */}
      <ExpertsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Matching Limit Info Banner */}
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
              </div>

              {/* Matching Counter Display */}
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white/10 px-6 py-3 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs text-white/70 uppercase tracking-wide mb-1">
                      {t('aiMatching.limit.available')}
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {maxMatches === UNLIMITED_MATCHES ? '8' : maxMatches}
                    </p>
                  </div>
                </div>
                {maxMatches === UNLIMITED_MATCHES && (
                  <Badge className="bg-green-500/20 text-green-100 border-green-400/50">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {t('common.unlimited')}
                  </Badge>
                )}
                {maxMatches !== UNLIMITED_MATCHES && (
                  <span className="text-white/60 text-xs">
                    {t('aiMatching.limit.perDay')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info Message */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-semibold text-blue-900 mb-1">
                  {t('expertsMatching.hub.info.title')}
                </h4>
                <p className="text-sm text-blue-700">
                  {t('expertsMatching.hub.info.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Matching Types Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Card 1: Matching Experts with ToRs */}
            <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
              <div className="bg-gradient-to-br from-[#1e40af] to-[#3b82f6] p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{t('expertsMatching.tors.title')}</h3>
                    <p className="text-sm text-white/80">{t('expertsMatching.hub.tors.badge')}</p>
                  </div>
                </div>
                <p className="text-sm text-white/90 leading-relaxed">
                  {t('expertsMatching.tors.description')}
                </p>
              </div>

              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {/* Features */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-[#1e40af]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {t('expertsMatching.hub.tors.feature1.title')}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {t('expertsMatching.hub.tors.feature1.description')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-[#3b82f6]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {t('expertsMatching.hub.tors.feature2.title')}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {t('expertsMatching.hub.tors.feature2.description')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {t('expertsMatching.hub.tors.feature3.title')}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {t('expertsMatching.hub.tors.feature3.description')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => navigate('/experts/matching/match-experts-tors')}
                  className="w-full bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:from-[#1e3a8a] hover:to-[#2563eb] text-white font-semibold py-3 gap-2"
                >
                  <Zap className="w-5 h-5" />
                  {t('expertsMatching.hub.tors.cta')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Card 2: Matching Experts with Organizations */}
            <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
              <div className="bg-gradient-to-br from-[#B82547] to-[#8b1c36] p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{t('expertsMatching.orgs.title')}</h3>
                    <p className="text-sm text-white/80">{t('expertsMatching.hub.orgs.badge')}</p>
                  </div>
                </div>
                <p className="text-sm text-white/90 leading-relaxed">
                  {t('expertsMatching.orgs.description')}
                </p>
              </div>

              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {/* Features */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-[#B82547]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {t('expertsMatching.hub.orgs.feature1.title')}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {t('expertsMatching.hub.orgs.feature1.description')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {t('expertsMatching.hub.orgs.feature2.title')}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {t('expertsMatching.hub.orgs.feature2.description')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {t('expertsMatching.hub.orgs.feature3.title')}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {t('expertsMatching.hub.orgs.feature3.description')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => navigate('/experts/matching/match-experts-organizations')}
                  className="w-full bg-gradient-to-r from-[#B82547] to-[#8b1c36] hover:from-[#a01f3c] hover:to-[#7a1a30] text-white font-semibold py-3 gap-2"
                >
                  <Zap className="w-5 h-5" />
                  {t('expertsMatching.hub.orgs.cta')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Stat 1 */}
            <div className="bg-gradient-to-br from-[#f1f5f9] to-[#e2e8f0] p-6 rounded-lg border border-gray-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#3d4654] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-[#3d4654]">
                  {t('expertsMatching.hub.stats.matchingTypes')}
                </span>
              </div>
              <p className="text-4xl font-bold text-[#3d4654] mb-1">2</p>
              <p className="text-sm text-gray-600">{t('expertsMatching.hub.stats.matchingTypesDesc')}</p>
            </div>

            {/* Stat 2 */}
            <div className="bg-gradient-to-br from-[#fce7f3] to-[#fbcfe8] p-6 rounded-lg border border-[#f9a8d4]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#B82547] rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-[#B82547]">
                  {t('expertsMatching.hub.stats.aiPowered')}
                </span>
              </div>
              <p className="text-4xl font-bold text-[#B82547] mb-1">100%</p>
              <p className="text-sm text-[#9f1239]">{t('expertsMatching.hub.stats.aiPoweredDesc')}</p>
            </div>

            {/* Stat 3 */}
            <div className="bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] p-6 rounded-lg border border-[#6ee7b7]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#065f46] rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-[#065f46]">
                  {t('aiMatching.limit.available')}
                </span>
              </div>
              <p className="text-4xl font-bold text-[#065f46] mb-1">
                {maxMatches === UNLIMITED_MATCHES ? '8' : maxMatches}
              </p>
              <p className="text-sm text-[#047857]">
                {maxMatches === UNLIMITED_MATCHES 
                  ? t('expertsMatching.hub.stats.unlimitedDesc') 
                  : t('expertsMatching.hub.stats.perDayDesc')}
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}