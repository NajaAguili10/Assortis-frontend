import { ArrowRight, Building2, CheckCircle2, Compass, FileCheck2, Globe2, Handshake, Layers, Sparkles, Target, Users } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { PublicOrganizationServiceTabs } from '@app/components/PublicOrganizationServiceTabs';
import { Button } from '@app/components/ui/button';

export default function PublicOrganizationMatchingProjectsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const features = [
    {
      icon: Target,
      title: 'Curated Opportunity Feed',
      description: 'Receive project opportunities prioritized for your organization profile and sector focus.',
    },
    {
      icon: Layers,
      title: 'Sector-Based Relevance',
      description: 'Filter opportunities by technical sectors aligned with your strategic positioning.',
    },
    {
      icon: Globe2,
      title: 'Country and Donor Context',
      description: 'Identify opportunities by geography and funding ecosystem to improve targeting.',
    },
    {
      icon: Handshake,
      title: 'Consortium Fit Signals',
      description: 'Spot opportunities with stronger potential for collaboration and partnership structuring.',
    },
    {
      icon: FileCheck2,
      title: 'Proposal Readiness Support',
      description: 'Focus on opportunities where your team can mobilize quickly and competitively.',
    },
    {
      icon: Users,
      title: 'Strategic Team Alignment',
      description: 'Coordinate experts and internal teams around the best-fit opportunities first.',
    },
  ];

  const steps = [
    'Define your organization profile, sectors, and strategic targeting criteria.',
    'Receive matching opportunities curated from relevant market flows.',
    'Review fit indicators and identify priority bids and partnership options.',
    'Activate support to move from opportunity discovery to proposal execution.',
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
                Organization Matching
              </div>
              <div className="max-w-3xl space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-primary">Find Projects That Fit Your Organization Strategy</h2>
                <p className="text-gray-700 md:text-lg leading-relaxed">
                  Stop spending time on low-relevance tenders. Use structured matching to focus your business development effort on opportunities with stronger strategic fit.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <Compass className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Strategic Targeting</p>
                  <p className="text-xs text-gray-600 mt-1">Prioritize bids aligned with your organization goals.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <Handshake className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Partnership Readiness</p>
                  <p className="text-xs text-gray-600 mt-1">Identify projects suitable for consortium collaboration.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <FileCheck2 className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Proposal Focus</p>
                  <p className="text-xs text-gray-600 mt-1">Concentrate resources where win potential is higher.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <div className="rounded-lg border bg-white p-6 md:p-8 space-y-4">
              <h3 className="text-2xl font-bold text-primary">What Is It?</h3>
              <p className="text-gray-700 leading-relaxed">
                Matching Projects for Organizations is a strategic opportunity intelligence service built to improve bid targeting. It helps organizations focus on projects where their profile, sector expertise, and partnership model are most competitive.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By combining relevance signals and practical market criteria, the module supports faster qualification, stronger opportunity prioritization, and better allocation of proposal effort.
              </p>
            </div>
            <div className="rounded-lg border border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 p-6 md:p-8">
              <h4 className="text-xl font-semibold text-primary mb-4">Built for Competitive Positioning</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Improve your pipeline quality through relevance-based selection.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Increase proposal efficiency with better opportunity prioritization.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Strengthen partner planning earlier in the bid cycle.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-primary">Key Features</h3>
              <p className="text-gray-600">A complete matching workflow designed to help organizations bid smarter and mobilize faster.</p>
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
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Focus your team on opportunities with stronger qualification scores.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Reduce proposal waste on low-fit opportunities.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Improve partnership planning and mobilization timelines.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Increase pipeline confidence with strategic opportunity visibility.</p>
            </div>
          </section>

          <section className="rounded-lg border border-accent/20 bg-gradient-to-br from-accent/10 to-primary/10 p-6 md:p-8 text-center">
            <h3 className="text-2xl font-bold text-primary mb-3">Want to Improve Your Bid Targeting Quality?</h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Request a tailored configuration and turn your project matching workflow into a strategic growth engine.
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
