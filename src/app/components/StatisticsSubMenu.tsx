import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { SubMenu } from '@app/components/SubMenu';
import { hasStatisticsSubMenuAccess, isExpertAccountType } from '@app/services/permissions.service';
import {
  FolderKanban,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  Activity,
  Globe,
  Users,
} from 'lucide-react';

export function StatisticsSubMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();

  const isExpert = isExpertAccountType(user?.accountType);

  const getCurrentActive = () => {
    const path = location.pathname;
    if (path.startsWith('/statistics/dashboard')) return 'dashboard';
    if (path.startsWith('/statistics/projects-contracts')) return 'projectsContracts';
    if (path.startsWith('/statistics/market-trends')) return 'marketTrends';
    if (path.startsWith('/statistics/pricing-experts')) return 'pricingExperts';
    if (path.startsWith('/statistics/experts-fees')) return 'expertsFees';
    if (path.startsWith('/statistics/competitors')) return 'competitors';
    if (path.startsWith('/statistics/usage-analytics')) return 'usageAnalytics';
    if (path.startsWith('/statistics/map-insights')) return 'mapInsights';
    return '';
  };

  const activeTab = getCurrentActive();

  const canAccessProjectsContracts = hasStatisticsSubMenuAccess('projectsContracts', user?.accountType);
  const canAccessMarketTrends = hasStatisticsSubMenuAccess('marketTrends', user?.accountType);
  const canAccessPricingExperts = hasStatisticsSubMenuAccess('pricingExperts', user?.accountType);
  const canAccessExpertsFees = hasStatisticsSubMenuAccess('pricingExperts', user?.accountType);
  const canAccessCompetitors = hasStatisticsSubMenuAccess('competitors', user?.accountType);
  const canAccessUsageAnalytics = hasStatisticsSubMenuAccess('usageAnalytics', user?.accountType);
  const canAccessMapInsights = hasStatisticsSubMenuAccess('mapInsights', user?.accountType);

  // For Expert: map routes to different tab labels
  // For Organization/Admin: use existing labels
  const items = [
    
    canAccessProjectsContracts && {
      label: isExpert ? t('statistics.tabs.marketDemand') : t('statistics.tabs.projectsContracts'),
      icon: FolderKanban,
      active: activeTab === 'projectsContracts',
      onClick: () => navigate('/statistics/projects-contracts'),
    },
    
    // Expert: Hidden | Organization: Market Trends
    !isExpert && canAccessMarketTrends && {
      label: t('statistics.tabs.marketTrends'),
      icon: TrendingUp,
      active: activeTab === 'marketTrends',
      onClick: () => navigate('/statistics/market-trends'),
    },
    
    // Expert: Pricing & Benchmark | Organization: Pricing Policy
    canAccessPricingExperts && {
      label: isExpert ? t('statistics.tabs.pricingBenchmark') : t('statistics.tabs.pricingPolicy'),
      icon: DollarSign,
      active: activeTab === 'pricingExperts',
      onClick: () => navigate('/statistics/pricing-experts'),
    },

    // Expert: Hidden | Organization: Experts Fees
    !isExpert && canAccessExpertsFees && {
      label: t('statistics.tabs.expertsFees'),
      icon: Users,
      active: activeTab === 'expertsFees',
      onClick: () => navigate('/statistics/experts-fees'),
    },
    
    // Expert: Hidden | Organization: Competitors
    !isExpert && canAccessCompetitors && {
      label: t('statistics.tabs.competitors'),
      icon: ShieldAlert,
      active: activeTab === 'competitors',
      onClick: () => navigate('/statistics/competitors'),
    },
    
    // Expert: My Insights | Organization: Usage Analytics
    canAccessUsageAnalytics && {
      label: isExpert ? t('statistics.tabs.myInsights') : t('statistics.tabs.usageAnalytics'),
      icon: Activity,
      active: activeTab === 'usageAnalytics',
      onClick: () => navigate('/statistics/usage-analytics'),
    },
    
    // Expert: Peer Insights | Organization: Map Insights
    canAccessMapInsights && {
      label: isExpert ? t('statistics.tabs.peerInsights') : t('statistics.tabs.mapInsights'),
      icon: isExpert ? Users : Globe,
      active: activeTab === 'mapInsights',
      onClick: () => navigate('/statistics/map-insights'),
    },
  ].filter(Boolean);

  return <SubMenu items={items} />;
}
