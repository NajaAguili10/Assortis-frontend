import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Briefcase, Building2, CheckCircle2, ClipboardList, Globe2, Handshake, Sparkles, Users } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { Button } from '@app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@app/components/ui/tabs';
import { JobCard } from '@app/modules/posting-board/components/JobCard';
import { getJobOffersByType } from '@app/modules/posting-board/services/jobOfferService';
import { JobOfferListDTO, JobOfferTypeEnum } from '@app/modules/posting-board/types/JobOffer.dto';

export default function PublicPostingBoardServicePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'projects' | 'internal'>('projects');
  const [projectJobs, setProjectJobs] = useState<JobOfferListDTO[]>([]);
  const [internalJobs, setInternalJobs] = useState<JobOfferListDTO[]>([]);

  useEffect(() => {
    const load = async () => {
      const [projects, internal] = await Promise.all([
        getJobOffersByType(JobOfferTypeEnum.PROJECT),
        getJobOffersByType(JobOfferTypeEnum.INTERNAL),
      ]);
      setProjectJobs(projects);
      setInternalJobs(internal);
    };

    void load();
  }, []);

  const currentJobs = useMemo(
    () => (activeTab === 'projects' ? projectJobs : internalJobs).slice(0, 6),
    [activeTab, projectJobs, internalJobs]
  );

  const features = [
    {
      icon: Briefcase,
      title: 'Project Vacancy Publishing',
      description: 'Post short-term and long-term assignment opportunities for project-based roles.',
    },
    {
      icon: Building2,
      title: 'Internal Recruitment',
      description: 'Open in-house vacancies to strengthen your core operational and technical teams.',
    },
    {
      icon: Users,
      title: 'Targeted Candidate Reach',
      description: 'Expose vacancies to relevant expert audiences already active in the ecosystem.',
    },
    {
      icon: ClipboardList,
      title: 'Structured Vacancy Management',
      description: 'Organize openings by type and maintain a clear workflow for follow-up actions.',
    },
    {
      icon: Handshake,
      title: 'Faster Talent Engagement',
      description: 'Reduce recruitment friction with a direct path from publication to candidate review.',
    },
    {
      icon: Globe2,
      title: 'International Talent Visibility',
      description: 'Increase exposure to professionals with experience in global project environments.',
    },
  ];

  const steps = [
    'Choose whether you are publishing a project role or an internal position.',
    'Publish your vacancy with relevant requirements and role context.',
    'Review candidate engagement through structured vacancy lists.',
    'Move selected profiles to your recruitment and onboarding workflow.',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        icon={Briefcase}
        title={t('services.postingBoard.hero.title')}
        description={t('services.postingBoard.hero.description')}
      />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6 space-y-8">
          <section className="relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-white via-gray-50/40 to-accent/10 p-6 md:p-10">
            <div className="absolute -top-16 -right-16 h-52 w-52 rounded-full bg-accent/15 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-2 text-sm font-semibold text-accent">
                <Sparkles className="h-4 w-4" />
                Posting Board Service
              </div>
              <div className="max-w-3xl space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-primary">Publish Vacancies and Reach the Right Talent Faster</h2>
                <p className="text-gray-700 md:text-lg leading-relaxed">
                  A dual-track posting board for project vacancies and internal roles, designed to improve recruitment visibility and execution speed.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <Briefcase className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Project Roles</p>
                  <p className="text-xs text-gray-600 mt-1">Publish consulting and assignment-based positions.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <Building2 className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Internal Hiring</p>
                  <p className="text-xs text-gray-600 mt-1">Recruit permanent and operational team members.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <Users className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Talent Access</p>
                  <p className="text-xs text-gray-600 mt-1">Connect with relevant candidate communities quickly.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <div className="rounded-lg border bg-white p-6 md:p-8 space-y-4">
              <h3 className="text-2xl font-bold text-primary">What Is It?</h3>
              <p className="text-gray-700 leading-relaxed">
                Posting Board is a recruitment publication service that helps organizations advertise both project-based and internal vacancies in one unified workspace. It supports faster talent sourcing and clearer vacancy management.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By separating roles into project and internal streams, teams can keep hiring flows organized while ensuring opportunities reach the most relevant candidate audiences.
              </p>
            </div>
            <div className="rounded-lg border border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 p-6 md:p-8">
              <h4 className="text-xl font-semibold text-primary mb-4">Purpose-Built for Vacancy Execution</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Organize recruitment by vacancy type.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Improve posting visibility among qualified profiles.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Move from publication to review with less friction.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-primary">Key Features</h3>
              <p className="text-gray-600">Everything needed to publish, organize, and scale recruitment opportunities across project and internal hiring tracks.</p>
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
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Increase recruitment visibility for both project and internal roles.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Keep vacancy management organized with clearer role segmentation.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Accelerate candidate engagement and shortlist preparation.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Support growth with a scalable publishing workflow.</p>
            </div>
          </section>

          <section className="rounded-lg border border-accent/20 bg-gradient-to-br from-accent/10 to-primary/10 p-6 md:p-8 text-center">
            <h3 className="text-2xl font-bold text-primary mb-3">Ready to Publish Your First Vacancy?</h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Create your account and start posting project or internal roles in a structured, high-visibility environment.
            </p>
            <Button className="min-h-11" onClick={() => navigate('/signup')}>
              {t('services.cta.registerFree')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </section>

          <div className="flex justify-end">
            <Button className="min-h-11" onClick={() => navigate('/signup')}>
              {t('services.cta.registerFree')}
            </Button>
          </div>

          <section className="bg-white rounded-lg border p-6">
            <h2 className="text-2xl font-semibold text-primary mb-4">{t('services.postingBoard.section.title')}</h2>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'projects' | 'internal')}>
              <TabsList>
                <TabsTrigger value="projects" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {t('monEspace.nav.projectOffers')}
                </TabsTrigger>
                <TabsTrigger value="internal" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {t('monEspace.nav.internalOffers')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="projects" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {currentJobs.map((job) => (
                    <JobCard key={job.id} job={job} onViewDetails={() => navigate('/signup')} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="internal" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {currentJobs.map((job) => (
                    <JobCard key={job.id} job={job} onViewDetails={() => navigate('/signup')} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
