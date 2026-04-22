import { ArrowRight, Bell, CheckCircle2, Compass, Globe2, Layers, Sparkles, Target, UserRound, Users, Zap } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { PublicExpertsServiceTabs } from '@app/components/PublicExpertsServiceTabs';
import { Button } from '@app/components/ui/button';

export default function PublicExpertsMatchingOpportunitiesPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const features = [
    {
      icon: Target,
      title: 'Personalized Opportunity Shortlists',
      description: 'Get opportunities ranked according to your expertise, language profile, and mission history.',
    },
    {
      icon: Layers,
      title: 'Sector and Role Alignment',
      description: 'Match with assignments that fit your sector depth, seniority level, and technical focus.',
    },
    {
      icon: Globe2,
      title: 'Geographic Relevance',
      description: 'Prioritize projects based on your preferred countries, regions, and remote availability.',
    },
    {
      icon: Bell,
      title: 'Smart Opportunity Alerts',
      description: 'Receive timely updates when relevant calls and projects are published on the platform.',
    },
    {
      icon: Zap,
      title: 'Fast Engagement Flow',
      description: 'Move quickly from match discovery to expression of interest with guided next actions.',
    },
    {
      icon: Users,
      title: 'Stronger Organization Visibility',
      description: 'Increase your profile exposure to organizations looking for specialists in your domain.',
    },
  ];

  const steps = [
    'Complete your expert profile with sectors, languages, countries, and availability.',
    'The matching engine analyzes your profile signals and project relevance indicators.',
    'You receive a curated shortlist of opportunities with clear fit rationale.',
    'Engage on high-fit opportunities and request tailored support when needed.',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner icon={UserRound} title={t('services.experts.hero.title')} description={t('services.experts.hero.description')} />
      <PublicExpertsServiceTabs />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6 space-y-8">
          <section className="relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-white via-gray-50/50 to-accent/10 p-6 md:p-10">
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-accent/15 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-2 text-sm font-semibold text-accent">
                <Sparkles className="h-4 w-4" />
                For Experts
              </div>
              <div className="max-w-3xl space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-primary">Discover Opportunities Matched to Your Expertise</h2>
                <p className="text-gray-700 md:text-lg leading-relaxed">
                  Move beyond generic listings. This service surfaces the most relevant assignments for your profile so you can focus on opportunities where you can create real impact.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <Compass className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Targeted Discovery</p>
                  <p className="text-xs text-gray-600 mt-1">Find opportunities aligned with your exact profile signals.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <Zap className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Faster Positioning</p>
                  <p className="text-xs text-gray-600 mt-1">Act quickly with clear, structured opportunity insights.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <Globe2 className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Global Reach</p>
                  <p className="text-xs text-gray-600 mt-1">Stay visible across international markets and organizations.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <div className="rounded-lg border bg-white p-6 md:p-8 space-y-4">
              <h3 className="text-2xl font-bold text-primary">What Is It?</h3>
              <p className="text-gray-700 leading-relaxed">
                Experts Matching Opportunities is a guided discovery service that helps you identify assignments where your profile is highly relevant. Instead of manually screening large volumes of calls, you receive focused opportunities with stronger fit.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The service combines your domain expertise, role history, language strengths, and location preferences to prioritize high-potential opportunities. This gives you a more strategic way to plan your pipeline and increase conversion.
              </p>
            </div>
            <div className="rounded-lg border border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-accent p-2.5">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-primary">Designed for Professional Growth</h4>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                Build a stronger market presence by focusing your effort on assignments that match your real value proposition.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Match quality over quantity</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Clearer opportunity prioritization</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Higher readiness for targeted proposals</li>
              </ul>
            </div>
          </section>

          <section className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-primary">Key Features</h3>
              <p className="text-gray-600">A complete matching framework built to help experts compete effectively in international cooperation markets.</p>
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
            <h3 className="text-2xl font-bold mb-4">Benefits for Experts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm md:text-base">
              <p className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-accent mt-0.5" />Increase profile visibility with relevant organizations.</p>
              <p className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-accent mt-0.5" />Reduce time spent on low-fit opportunities.</p>
              <p className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-accent mt-0.5" />Plan your pipeline with stronger confidence.</p>
              <p className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-accent mt-0.5" />Position your expertise for strategic assignments.</p>
            </div>
          </section>

          <section className="rounded-lg border border-accent/20 bg-gradient-to-br from-accent/10 to-primary/10 p-6 md:p-8 text-center">
            <h3 className="text-2xl font-bold text-primary mb-3">Ready to Accelerate Your Opportunity Pipeline?</h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Speak with our team to configure a matching strategy tailored to your profile and target markets.
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
