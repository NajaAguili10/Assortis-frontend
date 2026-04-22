import { ArrowRight, CalendarCheck2, CheckCircle2, ClipboardList, FileStack, Gauge, Layers, Sparkles, UserRound, Users } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { PublicExpertsServiceTabs } from '@app/components/PublicExpertsServiceTabs';
import { Button } from '@app/components/ui/button';

export default function PublicExpertsMyProjectsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const features = [
    {
      icon: CalendarCheck2,
      title: 'Unified Assignment Timeline',
      description: 'View current and upcoming assignments in one place with clear status and timing.',
    },
    {
      icon: Gauge,
      title: 'Milestone Tracking',
      description: 'Monitor progress checkpoints and stay aligned with delivery expectations.',
    },
    {
      icon: Users,
      title: 'Collaboration Visibility',
      description: 'Understand your role across teams, partners, and project stakeholders.',
    },
    {
      icon: FileStack,
      title: 'Document Traceability',
      description: 'Access references and deliverables to keep your contribution portfolio organized.',
    },
    {
      icon: Layers,
      title: 'Portfolio Continuity',
      description: 'Build a consistent professional history across missions and sectors.',
    },
    {
      icon: ClipboardList,
      title: 'Readiness Signals',
      description: 'Showcase availability and experience indicators for future opportunities.',
    },
  ];

  const steps = [
    'Set up your profile and confirm your current project assignments.',
    'Track milestones, tasks, and contribution points across engagements.',
    'Document deliverables and maintain a clean mission history.',
    'Leverage your project record to strengthen future positioning.',
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
                Expert Workspace
              </div>
              <div className="max-w-3xl space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-primary">Manage Every Assignment with Clarity</h2>
                <p className="text-gray-700 md:text-lg leading-relaxed">
                  Keep your projects, milestones, and delivery history organized in one structured timeline built for professional experts.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <CalendarCheck2 className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Assignment Visibility</p>
                  <p className="text-xs text-gray-600 mt-1">Track where you are and what comes next.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <Gauge className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Progress Confidence</p>
                  <p className="text-xs text-gray-600 mt-1">Understand milestones and delivery momentum.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <FileStack className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Career Documentation</p>
                  <p className="text-xs text-gray-600 mt-1">Build a track record you can reuse in future bids.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <div className="rounded-lg border bg-white p-6 md:p-8 space-y-4">
              <h3 className="text-2xl font-bold text-primary">What Is It?</h3>
              <p className="text-gray-700 leading-relaxed">
                My Projects for Experts is a structured project-follow up environment designed to help you manage the full lifecycle of your assignments. It centralizes delivery context so you can focus on performance rather than fragmented coordination.
              </p>
              <p className="text-gray-700 leading-relaxed">
                From onboarding to final outputs, this module gives you a clear view of your milestones, project references, and contribution history. It supports stronger continuity between past experience and future opportunities.
              </p>
            </div>
            <div className="rounded-lg border border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-accent p-2.5">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-primary">Professional Control and Continuity</h4>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                Stay in control of your commitments and keep your delivery record ready for organizations and consortium partners.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />One place for tasks, references, and milestones</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Clearer workload and availability planning</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Stronger evidence of delivery performance</li>
              </ul>
            </div>
          </section>

          <section className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-primary">Key Features</h3>
              <p className="text-gray-600">A practical set of tools to keep your assignment workflow clear, structured, and proposal-ready.</p>
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
              <p className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-accent mt-0.5" />Keep assignments, tasks, and milestones synchronized.</p>
              <p className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-accent mt-0.5" />Strengthen credibility with a clear delivery history.</p>
              <p className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-accent mt-0.5" />Improve planning for your next mission cycle.</p>
              <p className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-accent mt-0.5" />Turn project execution into long-term professional value.</p>
            </div>
          </section>

          <section className="rounded-lg border border-accent/20 bg-gradient-to-br from-accent/10 to-primary/10 p-6 md:p-8 text-center">
            <h3 className="text-2xl font-bold text-primary mb-3">Need a Better Way to Manage Expert Assignments?</h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Request a tailored setup and organize your project delivery lifecycle with more structure and visibility.
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
