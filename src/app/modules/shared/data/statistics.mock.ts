export const statisticsKpis = {
  totalProjects: 1248,
  totalContracts: 732,
  shortlistsCount: 286,
  winRate: 31,
};

export const projectsOverTime = [
  { month: 'Jan', projects: 72, contracts: 41 },
  { month: 'Feb', projects: 88, contracts: 49 },
  { month: 'Mar', projects: 92, contracts: 54 },
  { month: 'Apr', projects: 105, contracts: 61 },
  { month: 'May', projects: 113, contracts: 64 },
  { month: 'Jun', projects: 126, contracts: 73 },
];

export const sectorDistribution = [
  { name: 'Infrastructure', value: 28 },
  { name: 'Education', value: 19 },
  { name: 'Health', value: 17 },
  { name: 'Energy', value: 21 },
  { name: 'Agriculture', value: 15 },
];

export const countryDistribution = [
  { name: 'Kenya', value: 112 },
  { name: 'Morocco', value: 96 },
  { name: 'Colombia', value: 84 },
  { name: 'India', value: 131 },
  { name: 'Senegal', value: 76 },
];

export const donorTrends = [
  { month: 'Jan', worldBank: 20, afd: 14, undp: 10 },
  { month: 'Feb', worldBank: 22, afd: 15, undp: 12 },
  { month: 'Mar', worldBank: 24, afd: 16, undp: 14 },
  { month: 'Apr', worldBank: 27, afd: 19, undp: 13 },
  { month: 'May', worldBank: 29, afd: 21, undp: 15 },
  { month: 'Jun', worldBank: 31, afd: 22, undp: 17 },
];

export const expertPricingBySeniority = [
  { seniority: 'Junior', min: 150, median: 220, max: 320 },
  { seniority: 'Mid', min: 260, median: 390, max: 520 },
  { seniority: 'Senior', min: 420, median: 640, max: 890 },
  { seniority: 'Lead', min: 550, median: 780, max: 1100 },
];

export const competitorsRanking = [
  { name: 'Global Advisory Group', losses: 34, delta: 8 },
  { name: 'Frontier Consulting', losses: 27, delta: -2 },
  { name: 'BlueBridge Partners', losses: 23, delta: 5 },
  { name: 'Helix Strategy', losses: 19, delta: 1 },
  { name: 'Impact Consortium', losses: 14, delta: -3 },
];

export const usageBreakdown = [
  { name: 'Used', value: 68 },
  { name: 'Unused', value: 32 },
];

export const mapInsights = [
  { country: 'Kenya', projects: 96, experts: 38, intensity: 0.82, x: 56, y: 56 },
  { country: 'Morocco', projects: 61, experts: 24, intensity: 0.63, x: 47, y: 40 },
  { country: 'Senegal', projects: 54, experts: 20, intensity: 0.58, x: 43, y: 50 },
  { country: 'India', projects: 118, experts: 46, intensity: 0.9, x: 69, y: 53 },
  { country: 'Colombia', projects: 73, experts: 27, intensity: 0.68, x: 27, y: 58 },
  { country: 'Peru', projects: 49, experts: 19, intensity: 0.51, x: 24, y: 63 },
  { country: 'Jordan', projects: 33, experts: 15, intensity: 0.4, x: 56, y: 49 },
];

// ======================== EXPERT-SPECIFIC DATA ========================

export const expertMarketDemand = [
  { month: 'Jan', opportunities: 12, bidsReceived: 8 },
  { month: 'Feb', opportunities: 14, bidsReceived: 10 },
  { month: 'Mar', opportunities: 16, bidsReceived: 11 },
  { month: 'Apr', opportunities: 18, bidsReceived: 14 },
  { month: 'May', opportunities: 21, bidsReceived: 16 },
  { month: 'Jun', opportunities: 24, bidsReceived: 19 },
];

export const expertPricingBenchmark = {
  yourRate: 450,
  marketAvg: 420,
  junior: { min: 150, max: 320 },
  mid: { min: 260, max: 520 },
  senior: { min: 420, max: 890 },
  lead: { min: 550, max: 1100 },
  position: 'within', // 'below' | 'within' | 'above'
};

export const expertProfileViews = [
  { date: '2024-06-05', organizationName: 'World Bank', views: 1 },
  { date: '2024-06-04', organizationName: 'AFD', views: 1 },
  { date: '2024-06-03', organizationName: 'UNDP', views: 2 },
  { date: '2024-06-01', organizationName: 'Global Advisory Group', views: 1 },
  { date: '2024-05-28', organizationName: 'Frontier Consulting', views: 1 },
];

export const expertRecruitmentTrends = [
  { donor: 'World Bank', region: 'Africa', growth: 12 },
  { donor: 'AFD', region: 'West Africa', growth: 8 },
  { donor: 'UNDP', region: 'Asia', growth: 15 },
  { donor: 'EU', region: 'Europe', growth: 5 },
  { donor: 'Asian Dev Bank', region: 'Asia-Pacific', growth: 18 },
];

export const expertSectorDemand = [
  { sector: 'Energy', demand: 28, growth: '+8%' },
  { sector: 'Infrastructure', demand: 25, growth: '+5%' },
  { sector: 'Health', demand: 18, growth: '+12%' },
  { sector: 'Education', demand: 16, growth: '+3%' },
  { sector: 'Agriculture', demand: 13, growth: '+7%' },
];
