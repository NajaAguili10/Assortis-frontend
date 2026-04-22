import { ArrowRight, BarChart3, Building2, CheckCircle2, Clock3, FileStack, FolderKanban, Handshake, Sparkles, Users } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { PublicOrganizationServiceTabs } from '@app/components/PublicOrganizationServiceTabs';
import { Button } from '@app/components/ui/button';

export default function PublicOrganizationMyProjectsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const features = [
    {
      icon: FolderKanban,
      title: 'Central Project Workspace',
      description: 'Keep project streams, priorities, and responsibilities organized in one place.',
    },
    {
      icon: Clock3,
      title: 'Milestone and Deadline Tracking',
      description: 'Monitor delivery checkpoints and critical timelines with stronger visibility.',
    },
    {
      icon: Users,
      title: 'Team and Expert Coordination',
      description: 'Align internal teams and external experts around clear project objectives.',
    },
    {
      icon: Handshake,
      title: 'Partner Collaboration Layer',
      description: 'Support consortium and partner collaboration across active project phases.',
    },
    {
      icon: FileStack,
      title: 'Reference and Document History',
      description: 'Maintain project references and essential files with structured traceability.',
    },
    {
      icon: BarChart3,
      title: 'Delivery Performance Monitoring',
      description: 'Assess execution rhythm and project health to improve delivery confidence.',
    },
  ];

  const steps = [
    'Set up your project portfolio and define ownership roles.',
    'Coordinate teams, experts, and partners around milestones.',
    'Track execution, documentation, and delivery progression.',
    'Leverage project history to strengthen future positioning.',
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
                Organization Delivery Workspace
              </div>
              <div className="max-w-3xl space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-primary">Manage Project Execution with More Control</h2>
                <p className="text-gray-700 md:text-lg leading-relaxed">
                  Bring together teams, milestones, references, and collaboration data in one operational workspace designed for organization-level delivery performance.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <FolderKanban className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Portfolio Clarity</p>
                  <p className="text-xs text-gray-600 mt-1">See project status and priorities at a glance.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <Users className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Team Alignment</p>
                  <p className="text-xs text-gray-600 mt-1">Coordinate experts and teams around delivery goals.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <FileStack className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Execution Traceability</p>
                  <p className="text-xs text-gray-600 mt-1">Keep milestones, files, and references connected.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <div className="rounded-lg border bg-white p-6 md:p-8 space-y-4">
              <h3 className="text-2xl font-bold text-primary">What Is It?</h3>
              <p className="text-gray-700 leading-relaxed">
                My Projects for Organizations is a delivery management environment for overseeing ongoing project execution with better visibility and coordination. It supports structured follow-up across teams, partners, and experts.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The module centralizes milestones, collaboration touchpoints, and project evidence, helping leadership and operations teams maintain control while improving delivery consistency.
              </p>
            </div>
            <div className="rounded-lg border border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 p-6 md:p-8">
              <h4 className="text-xl font-semibold text-primary mb-4">Built for Reliable Delivery</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />One source of truth for project operations.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Improved decision-making through clearer status visibility.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Better alignment across internal and external contributors.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-primary">Key Features</h3>
              <p className="text-gray-600">A comprehensive toolkit to orchestrate project lifecycle execution with higher confidence.</p>
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
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Improve delivery reliability with clearer milestone governance.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Reduce coordination gaps between teams and experts.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Strengthen reporting quality for partners and stakeholders.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Turn project history into stronger future bid credibility.</p>
            </div>
          </section>

          <section className="rounded-lg border border-accent/20 bg-gradient-to-br from-accent/10 to-primary/10 p-6 md:p-8 text-center">
            <h3 className="text-2xl font-bold text-primary mb-3">Need to Upgrade Your Project Delivery Workflow?</h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Request a tailored setup and align your teams, experts, and milestones around predictable execution.
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
