import { ArrowRight, BarChart3, CheckCircle2, Eye, FileDown, Gauge, LineChart, PieChart, Sparkles, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { PublicExpertsServiceTabs } from '@app/components/PublicExpertsServiceTabs';
import { Button } from '@app/components/ui/button';

export default function PublicExpertsStatisticsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const features = [
    {
      icon: Eye,
      title: 'Visibility Analytics',
      description: 'Track how often your profile appears in relevant expert and opportunity searches.',
    },
    {
      icon: FileDown,
      title: 'CV Download Trends',
      description: 'Monitor document engagement to understand market interest in your profile.',
    },
    {
      icon: LineChart,
      title: 'Match Performance Signals',
      description: 'See how your matching trend evolves as your profile and activity improve.',
    },
    {
      icon: Gauge,
      title: 'Readiness Monitoring',
      description: 'Evaluate profile completeness and responsiveness indicators over time.',
    },
    {
      icon: PieChart,
      title: 'Focus Area Insights',
      description: 'Understand which sectors and geographies are generating stronger traction.',
    },
    {
      icon: BarChart3,
      title: 'Decision-Oriented Dashboard',
      description: 'Use concise metrics to adapt your positioning and improve opportunity fit.',
    },
  ];

  const steps = [
    'Connect your profile activity and matching interactions to the statistics workspace.',
    'Review core indicators on visibility, downloads, and matching momentum.',
    'Identify what profile signals are driving stronger engagement.',
    'Adjust your positioning strategy and monitor impact over time.',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner icon={UserRound} title={t('services.experts.hero.title')} description={t('services.experts.hero.description')} />
      <PublicExpertsServiceTabs />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6 space-y-8">
          <section className="relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-white via-gray-50/40 to-accent/10 p-6 md:p-10">
            <div className="absolute -top-16 -right-16 h-52 w-52 rounded-full bg-accent/15 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-2 text-sm font-semibold text-accent">
                <Sparkles className="h-4 w-4" />
                Expert Analytics
              </div>
              <div className="max-w-3xl space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-primary">Turn Profile Data into Strategic Decisions</h2>
                <p className="text-gray-700 md:text-lg leading-relaxed">
                  Get visibility into how the market interacts with your profile, then use clear insights to strengthen your positioning and matching results.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <Eye className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Visibility Signals</p>
                  <p className="text-xs text-gray-600 mt-1">Understand where and how your profile is being seen.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <LineChart className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Performance Trends</p>
                  <p className="text-xs text-gray-600 mt-1">Track momentum and detect growth opportunities early.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <Gauge className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Actionable Metrics</p>
                  <p className="text-xs text-gray-600 mt-1">Use practical indicators to refine your market strategy.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <div className="rounded-lg border bg-white p-6 md:p-8 space-y-4">
              <h3 className="text-2xl font-bold text-primary">What Is It?</h3>
              <p className="text-gray-700 leading-relaxed">
                Expert Statistics is a performance intelligence module that helps you understand how your profile behaves in the market. It combines visibility, engagement, and matching indicators into one decision-focused view.
              </p>
              <p className="text-gray-700 leading-relaxed">
                With regular insight snapshots, you can identify strengths, detect weak signals, and optimize your profile presentation for higher relevance in strategic opportunities.
              </p>
            </div>
            <div className="rounded-lg border border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 p-6 md:p-8">
              <h4 className="text-xl font-semibold text-primary mb-4">Why It Matters</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Understand which signals attract the right organizations.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Monitor progress from profile updates to market impact.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Make data-backed decisions to improve expert positioning.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-primary">Key Features</h3>
              <p className="text-gray-600">A concise analytics framework to transform profile activity into strategic growth actions.</p>
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
              <p className="text-sm text-muted-foreground">{t('services.experts.statistics.weeklyViews')}</p>
              <p className="text-2xl font-bold text-primary">230</p>
            </div>
            <div className="bg-white rounded-lg border p-5">
              <p className="text-sm text-muted-foreground">{t('services.experts.statistics.cvDownloads')}</p>
              <p className="text-2xl font-bold text-primary">57</p>
            </div>
            <div className="bg-white rounded-lg border p-5">
              <p className="text-sm text-muted-foreground">{t('services.experts.statistics.matchTrend')}</p>
              <p className="text-2xl font-bold text-primary">+12%</p>
            </div>
          </section>

          <section className="rounded-lg bg-gradient-to-br from-primary to-primary/90 p-6 md:p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm md:text-base">
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Track what drives profile relevance in your target market.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Refine your positioning with clear performance feedback.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Demonstrate growth using measurable visibility signals.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Improve matching outcomes with data-backed decisions.</p>
            </div>
          </section>

          <section className="rounded-lg border border-accent/20 bg-gradient-to-br from-accent/10 to-primary/10 p-6 md:p-8 text-center">
            <h3 className="text-2xl font-bold text-primary mb-3">Want a Deeper Expert Performance View?</h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Request a tailored analytics setup to monitor your profile impact and accelerate your opportunity conversion.
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
