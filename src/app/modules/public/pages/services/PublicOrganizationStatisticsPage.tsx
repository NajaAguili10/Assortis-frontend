import { ArrowRight, BarChart3, Building2, CheckCircle2, Globe2, LineChart, PieChart, SearchCheck, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { PublicOrganizationServiceTabs } from '@app/components/PublicOrganizationServiceTabs';
import { Button } from '@app/components/ui/button';

export default function PublicOrganizationStatisticsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const features = [
    {
      icon: BarChart3,
      title: 'Market Intelligence Dashboard',
      description: 'Track strategic market signals across projects, sectors, and procurement flows.',
    },
    {
      icon: TrendingUp,
      title: 'Pricing and Trend Insights',
      description: 'Monitor market movement to align your commercial and technical positioning.',
    },
    {
      icon: SearchCheck,
      title: 'Competitor Benchmarking',
      description: 'Assess relative market activity and identify strategic gaps and opportunities.',
    },
    {
      icon: PieChart,
      title: 'Sector Opportunity Mapping',
      description: 'Understand sector dynamics and focus resources on higher-potential segments.',
    },
    {
      icon: Globe2,
      title: 'Geographic Coverage Insights',
      description: 'Evaluate country and regional opportunity concentration for better expansion decisions.',
    },
    {
      icon: LineChart,
      title: 'Decision Support Metrics',
      description: 'Use practical KPIs to improve business development planning and bid prioritization.',
    },
  ];

  const steps = [
    'Select the analytics scope aligned with your strategic priorities.',
    'Review key signals on markets, sectors, and competitive dynamics.',
    'Identify trends and adjust pipeline and positioning decisions.',
    'Operationalize insights into focused opportunity and bid actions.',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner icon={Building2} title={t('services.organization.hero.title')} description={t('services.organization.hero.description')} />
      <PublicOrganizationServiceTabs />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6 space-y-8">
          <section className="relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-white via-gray-50/40 to-accent/10 p-6 md:p-10">
            <div className="absolute -top-16 -right-16 h-52 w-52 rounded-full bg-accent/15 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-2 text-sm font-semibold text-accent">
                <Sparkles className="h-4 w-4" />
                Organization Analytics
              </div>
              <div className="max-w-3xl space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-primary">Turn Market Data into Strategic Advantage</h2>
                <p className="text-gray-700 md:text-lg leading-relaxed">
                  Access analytics that help your organization prioritize opportunities, benchmark competition, and strengthen decision-making across business development.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <BarChart3 className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Market Clarity</p>
                  <p className="text-xs text-gray-600 mt-1">See trends and activity with better strategic context.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <TrendingUp className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Decision Confidence</p>
                  <p className="text-xs text-gray-600 mt-1">Use measurable signals to prioritize high-value actions.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <Globe2 className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Global Perspective</p>
                  <p className="text-xs text-gray-600 mt-1">Evaluate opportunity distribution across markets.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <div className="rounded-lg border bg-white p-6 md:p-8 space-y-4">
              <h3 className="text-2xl font-bold text-primary">What Is It?</h3>
              <p className="text-gray-700 leading-relaxed">
                Organization Statistics is a market intelligence module designed to help teams make better strategic decisions. It translates complex market dynamics into practical insights that support pipeline planning and bid prioritization.
              </p>
              <p className="text-gray-700 leading-relaxed">
                From geographic coverage to sector concentration and trend movement, the module provides a clear evidence base to align business development activity with realistic opportunity potential.
              </p>
            </div>
            <div className="rounded-lg border border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 p-6 md:p-8">
              <h4 className="text-xl font-semibold text-primary mb-4">Insight to Action</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Identify where opportunity volume and quality are strongest.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Adjust targeting based on measurable trends, not assumptions.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Support leadership decisions with concise performance indicators.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-primary">Key Features</h3>
              <p className="text-gray-600">A premium analytics foundation for organizations competing in international opportunity markets.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title} className="rounded-lg border bg-white p-5 hover:shadow-md transition-shadow">
                    <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <h4 className="font-semibold text-primary mb-2">{feature.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border bg-white p-6 md:p-8 space-y-6">
            <h3 className="text-2xl font-bold text-primary">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((step, index) => (
                <div key={step} className="rounded-lg border border-gray-200 p-4 bg-gray-50/60">
                  <div className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center mb-3">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border p-5">
              <p className="text-sm text-muted-foreground">{t('services.organization.statistics.coverage')}</p>
              <p className="text-2xl font-bold text-primary">120+</p>
            </div>
            <div className="bg-white rounded-lg border p-5">
              <p className="text-sm text-muted-foreground">{t('services.organization.statistics.activeSectors')}</p>
              <p className="text-2xl font-bold text-primary">13</p>
            </div>
            <div className="bg-white rounded-lg border p-5">
              <p className="text-sm text-muted-foreground">{t('services.organization.statistics.updatedDaily')}</p>
              <p className="text-2xl font-bold text-primary">24h</p>
            </div>
          </section>

          <section className="rounded-lg bg-gradient-to-br from-primary to-primary/90 p-6 md:p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm md:text-base">
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Increase targeting accuracy with stronger market evidence.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Improve proposal planning with trend-based prioritization.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Enhance leadership visibility on strategic opportunity direction.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Align business development execution with measurable insights.</p>
            </div>
          </section>

          <section className="rounded-lg border border-accent/20 bg-gradient-to-br from-accent/10 to-primary/10 p-6 md:p-8 text-center">
            <h3 className="text-2xl font-bold text-primary mb-3">Need Analytics Tailored to Your Growth Strategy?</h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Request a customized analytics approach and convert market data into practical, high-impact actions.
            </p>
            <Button className="min-h-11" onClick={() => navigate('/ask-for-quote')}>
              {t('services.cta.askQuote')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
