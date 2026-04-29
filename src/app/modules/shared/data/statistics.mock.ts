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
  { country: 'Kenya', projects: 96, experts: 38, intensity: 0.82, x: 56, y: 56, lat: -1.286, lng: 36.82 },
  { country: 'Morocco', projects: 61, experts: 24, intensity: 0.63, x: 47, y: 40, lat: 31.79, lng: -7.09 },
  { country: 'Senegal', projects: 54, experts: 20, intensity: 0.58, x: 43, y: 50, lat: 14.69, lng: -14.45 },
  { country: 'India', projects: 118, experts: 46, intensity: 0.9, x: 69, y: 53, lat: 20.59, lng: 78.96 },
  { country: 'Colombia', projects: 73, experts: 27, intensity: 0.68, x: 27, y: 58, lat: 4.57, lng: -74.3 },
  { country: 'Peru', projects: 49, experts: 19, intensity: 0.51, x: 24, y: 63, lat: -9.19, lng: -75.01 },
  { country: 'Jordan', projects: 33, experts: 15, intensity: 0.4, x: 56, y: 49, lat: 30.59, lng: 36.24 },
];

// ======================== PRICING POLICY DATA ========================

export const competitorPricing = [
  { name: 'Assortis', avgRate: 420, discountMin: 5, discountMax: 18, marketShare: 22 },
  { name: 'Global Advisory', avgRate: 480, discountMin: 8, discountMax: 25, marketShare: 18 },
  { name: 'BlueBridge', avgRate: 390, discountMin: 3, discountMax: 15, marketShare: 14 },
  { name: 'Helix Strategy', avgRate: 450, discountMin: 6, discountMax: 20, marketShare: 12 },
  { name: 'Impact Consortium', avgRate: 360, discountMin: 2, discountMax: 12, marketShare: 10 },
];

export const discountRangeDistribution = [
  { range: '0-5%', contracts: 42 },
  { range: '5-10%', contracts: 87 },
  { range: '10-15%', contracts: 63 },
  { range: '15-20%', contracts: 38 },
  { range: '20-25%', contracts: 21 },
  { range: '25%+', contracts: 9 },
];

export const aiDiscountSamples = [
  { projectName: 'Water Infrastructure, Kenya', initialBudget: 850000, finalContract: 742500, realDiscount: 12.6 },
  { projectName: 'Education Reform, Morocco', initialBudget: 520000, finalContract: 468000, realDiscount: 10.0 },
  { projectName: 'Solar Energy, Senegal', initialBudget: 1200000, finalContract: 996000, realDiscount: 17.0 },
  { projectName: 'Health System, Jordan', initialBudget: 680000, finalContract: 632400, realDiscount: 7.0 },
  { projectName: 'Agri-Tech, Colombia', initialBudget: 430000, finalContract: 381700, realDiscount: 11.2 },
  { projectName: 'Urban Planning, India', initialBudget: 960000, finalContract: 816000, realDiscount: 15.0 },
];

export const pricingPositioning = {
  avgMarketDiscount: 11.8,
  yourAvgDiscount: 9.4,
  position: 'competitive', // 'aggressive' | 'competitive' | 'premium'
  recommendation: 'Maintain current discount range (8-12%) to stay competitive without sacrificing margin.',
};

// ======================== EXPERTS FEES DATA ========================

export const expertsFeesByDomain = [
  { domain: 'Infrastructure', junior: 180, mid: 320, senior: 580, lead: 820 },
  { domain: 'Energy', junior: 200, mid: 350, senior: 630, lead: 900 },
  { domain: 'Health', junior: 160, mid: 290, senior: 520, lead: 740 },
  { domain: 'Education', junior: 150, mid: 270, senior: 480, lead: 700 },
  { domain: 'Agriculture', junior: 140, mid: 250, senior: 450, lead: 650 },
  { domain: 'Finance', junior: 220, mid: 400, senior: 720, lead: 1050 },
];

export const expertsFeesByCountry = [
  { country: 'France', avgFee: 680, experts: 84 },
  { country: 'Germany', avgFee: 720, experts: 61 },
  { country: 'Morocco', avgFee: 290, experts: 48 },
  { country: 'Kenya', avgFee: 240, experts: 56 },
  { country: 'India', avgFee: 210, experts: 93 },
  { country: 'Colombia', avgFee: 260, experts: 37 },
  { country: 'Senegal', avgFee: 220, experts: 29 },
];

export const expertsFeesTrend = [
  { month: 'Jan', avgFee: 390 },
  { month: 'Feb', avgFee: 402 },
  { month: 'Mar', avgFee: 415 },
  { month: 'Apr', avgFee: 421 },
  { month: 'May', avgFee: 438 },
  { month: 'Jun', avgFee: 447 },
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
