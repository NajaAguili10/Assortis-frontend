import { ArrowRight, Building2, Compass, FileSearch, Globe2, Handshake, SearchCheck, Sparkles, Users2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { PublicOrganizationServiceTabs } from '@app/components/PublicOrganizationServiceTabs';
import { Button } from '@app/components/ui/button';

export default function PublicOrganizationSearchPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const features = [
    {
      icon: SearchCheck,
      title: 'Advanced Expert Discovery',
      description: 'Search professionals by sector expertise, country exposure, and delivery profile.',
    },
    {
      icon: Users2,
      title: 'CVIP Pool Structuring',
      description: 'Build and organize your private expert pool to accelerate proposal mobilization.',
    },
    {
      icon: Handshake,
      title: 'Bid Writer Network Access',
      description: 'Connect with bid professionals to strengthen technical and financial submissions.',
    },
    {
      icon: Globe2,
      title: 'Geographic and Market Filters',
      description: 'Scope your search by target countries and regional opportunity context.',
    },
    {
      icon: FileSearch,
      title: 'Structured Candidate Screening',
      description: 'Evaluate profiles faster with consistent criteria and stronger comparability.',
    },
    {
      icon: Compass,
      title: 'Strategic Search Planning',
      description: 'Align search effort with pipeline priorities and partnership requirements.',
    },
  ];

  const steps = [
    'Define your target profile criteria by role, sector, and geography.',
    'Search and shortlist experts, bid writers, and collaboration candidates.',
    'Compare profiles using structured fit and relevance indicators.',
    'Engage selected candidates and initiate support for opportunity delivery.',
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
                Organization Search
              </div>
              <div className="max-w-3xl space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-primary">Build Better Teams with Targeted Search</h2>
                <p className="text-gray-700 md:text-lg leading-relaxed">
                  Discover experts, bid writers, and collaboration profiles with precision so your organization can move faster from search to proposal execution.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <SearchCheck className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Targeted Discovery</p>
                  <p className="text-xs text-gray-600 mt-1">Find profiles that match real opportunity needs.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <Users2 className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Team Mobilization</p>
                  <p className="text-xs text-gray-600 mt-1">Build competitive teams with stronger role coverage.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <Handshake className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Collaboration Readiness</p>
                  <p className="text-xs text-gray-600 mt-1">Connect quickly with bid and proposal specialists.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <div className="rounded-lg border bg-white p-6 md:p-8 space-y-4">
              <h3 className="text-2xl font-bold text-primary">What Is It?</h3>
              <p className="text-gray-700 leading-relaxed">
                Organization Search is a strategic talent and collaboration discovery module. It helps organizations identify and engage the right expertise faster by combining structured search logic with proposal-focused collaboration channels.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Whether you need subject-matter experts, a bid writer, or support for consortium building, this module supports better decisions with clearer profile relevance and stronger search discipline.
              </p>
            </div>
            <div className="rounded-lg border border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 p-6 md:p-8">
              <h4 className="text-xl font-semibold text-primary mb-4">Designed for Proposal Efficiency</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-accent mt-0.5" />Reduce time spent on manual and fragmented profile review.</li>
                <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-accent mt-0.5" />Improve shortlist quality with stronger relevance criteria.</li>
                <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-accent mt-0.5" />Accelerate expert and bid writer engagement timelines.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-primary">Key Features</h3>
              <p className="text-gray-600">A complete search framework for organizations that need speed, quality, and strategic relevance.</p>
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
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Improve search quality and reduce candidate evaluation time.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Build stronger proposal teams with better profile fit.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Enhance collaboration readiness for strategic bids.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Increase responsiveness in competitive opportunity windows.</p>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-lg border-2 border-accent/40 bg-accent/5 p-6 space-y-3">
              <h3 className="text-xl font-semibold text-primary">{t('services.organization.cvip.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('services.organization.cvip.description')}</p>
              <Button className="min-h-11" onClick={() => navigate('/ask-for-quote')}>
                {t('services.cta.askQuote')}
              </Button>
            </div>

            <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-6 space-y-3">
              <h3 className="text-xl font-semibold text-primary">{t('services.organization.bidWriters.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('services.organization.bidWriters.description')}</p>
              <Button className="min-h-11" onClick={() => navigate('/ask-for-quote')}>
                {t('services.cta.askQuote')}
              </Button>
            </div>
          </section>

          <section className="rounded-lg border border-accent/20 bg-gradient-to-br from-accent/10 to-primary/10 p-6 md:p-8 text-center">
            <h3 className="text-2xl font-bold text-primary mb-3">Need Help Structuring Your Search Workflow?</h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Request a tailored setup to optimize candidate discovery, expert screening, and bid collaboration outcomes.
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
