import { ArrowRight, Compass, FileSearch, Globe2, Handshake, SearchCheck, Sparkles, UserRound, Users2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { PublicExpertsServiceTabs } from '@app/components/PublicExpertsServiceTabs';
import { Button } from '@app/components/ui/button';

export default function PublicExpertsSearchPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const features = [
    {
      icon: SearchCheck,
      title: 'Sector-Focused Discovery',
      description: 'Identify relevant searches by technical fields, delivery context, and profile fit.',
    },
    {
      icon: Globe2,
      title: 'Geographic Scope Control',
      description: 'Prioritize searches by country and region to align with your mission strategy.',
    },
    {
      icon: Users2,
      title: 'Bid Writer Collaboration',
      description: 'Connect with proposal professionals and contributors for high-value submissions.',
    },
    {
      icon: Handshake,
      title: 'Partnership Opportunities',
      description: 'Explore cooperation channels with organizations and consortium members.',
    },
    {
      icon: FileSearch,
      title: 'Structured Opportunity Screening',
      description: 'Review opportunities faster with clear criteria and organized search outcomes.',
    },
    {
      icon: Compass,
      title: 'Strategic Positioning',
      description: 'Build a targeted market approach instead of relying on broad, generic applications.',
    },
  ];

  const steps = [
    'Define what roles, sectors, and geographies you want to target.',
    'Run focused searches through expert and bid-writer collaboration channels.',
    'Evaluate options based on relevance, timing, and strategic fit.',
    'Engage the most valuable opportunities with a clear cooperation path.',
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
                Expert Search Service
              </div>
              <div className="max-w-3xl space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-primary">Search Smarter and Collaborate Strategically</h2>
                <p className="text-gray-700 md:text-lg leading-relaxed">
                  Move from broad search to targeted opportunity discovery with structured filters and collaboration channels that fit your expertise.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <SearchCheck className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Precision Search</p>
                  <p className="text-xs text-gray-600 mt-1">Focus only on opportunities that match your profile.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <Handshake className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Collaboration Paths</p>
                  <p className="text-xs text-gray-600 mt-1">Connect faster with bid writers and proposal teams.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <Compass className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Market Direction</p>
                  <p className="text-xs text-gray-600 mt-1">Build a clear search strategy by sector and geography.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <div className="rounded-lg border bg-white p-6 md:p-8 space-y-4">
              <h3 className="text-2xl font-bold text-primary">What Is It?</h3>
              <p className="text-gray-700 leading-relaxed">
                Expert Search is a curated discovery module designed to help professionals navigate opportunities with greater focus and confidence. It combines structured search logic with partnership-oriented collaboration channels.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Instead of relying on fragmented search practices, you can build a repeatable process to identify relevant opportunities, assess fit, and engage with the right teams quickly.
              </p>
            </div>
            <div className="rounded-lg border border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 p-6 md:p-8">
              <h4 className="text-xl font-semibold text-primary mb-4">Built for Opportunity Quality</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-accent mt-0.5" />Prioritize high-fit opportunities over high volume.</li>
                <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-accent mt-0.5" />Identify collaboration routes aligned to proposal goals.</li>
                <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-accent mt-0.5" />Improve your conversion potential with better targeting.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-primary">Key Features</h3>
              <p className="text-gray-600">A practical search stack for experts who want better positioning and stronger proposal collaboration outcomes.</p>
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

          <section className="rounded-lg bg-gradient-to-br from-primary to-primary/90 p-6 md:p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm md:text-base">
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Reduce noise and focus on high-value opportunities.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Expand collaboration options with proposal specialists.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Improve search consistency and decision speed.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Position your expertise more strategically in the market.</p>
            </div>
          </section>

          <section className="rounded-lg border-2 border-accent/40 bg-accent/5 p-6 space-y-3">
            <h3 className="text-xl font-semibold text-primary">{t('services.experts.search.bidWriters.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('services.experts.search.bidWriters.description')}</p>
            <Button className="min-h-11" onClick={() => navigate('/services/experts/cv-registration')}>
              {t('services.cta.cooperate')}
            </Button>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
