import { ArrowRight, BookOpenCheck, CheckCircle2, Globe2, GraduationCap, Mail, MonitorPlay, ShieldCheck, Sparkles, Users, Video } from 'lucide-react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { useTraining } from '@app/hooks/useTraining';

export default function PublicTrainingServicePage() {
  const { t } = useLanguage();
  const { courses } = useTraining();
  const features = [
    {
      icon: Users,
      title: 'Expert-Led Learning Paths',
      description: 'Learn from experienced professionals in international projects and proposal delivery.',
    },
    {
      icon: ShieldCheck,
      title: 'Certification-Oriented Tracks',
      description: 'Follow structured training paths designed to support practical certification goals.',
    },
    {
      icon: Video,
      title: 'Live and Recorded Sessions',
      description: 'Combine instructor-led sessions with flexible on-demand learning experiences.',
    },
    {
      icon: MonitorPlay,
      title: 'Practical Format Variety',
      description: 'Access training formats adapted to team schedules and professional constraints.',
    },
    {
      icon: Globe2,
      title: 'International Market Focus',
      description: 'Develop skills aligned with global cooperation and donor-driven project contexts.',
    },
    {
      icon: BookOpenCheck,
      title: 'Applied Skills Development',
      description: 'Strengthen real operational capabilities for bids, delivery, and technical management.',
    },
  ];

  const steps = [
    'Explore available training tracks based on your goals and role profile.',
    'Select a program and enroll in the format that suits your schedule.',
    'Progress through practical modules with guided learning support.',
    'Apply new skills in project and proposal workflows with confidence.',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        icon={GraduationCap}
        title={t('services.training.hero.title')}
        description={t('services.training.hero.description')}
      />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6 space-y-8">
          <section className="relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-white via-gray-50/40 to-accent/10 p-6 md:p-10">
            <div className="absolute -top-16 -right-16 h-52 w-52 rounded-full bg-accent/15 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-2 text-sm font-semibold text-accent">
                <Sparkles className="h-4 w-4" />
                Training Services
              </div>
              <div className="max-w-3xl space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-primary">Upskill Teams and Experts for International Delivery</h2>
                <p className="text-gray-700 md:text-lg leading-relaxed">
                  Access practical learning paths designed to improve proposal performance, project execution, and market competitiveness.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <Users className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Team-Oriented Learning</p>
                  <p className="text-xs text-gray-600 mt-1">Train cohorts with aligned skills and delivery standards.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <ShieldCheck className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Certification Readiness</p>
                  <p className="text-xs text-gray-600 mt-1">Build competencies with structured progression paths.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <Globe2 className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Global Market Fit</p>
                  <p className="text-xs text-gray-600 mt-1">Develop skills aligned with international project contexts.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <div className="rounded-lg border bg-white p-6 md:p-8 space-y-4">
              <h3 className="text-2xl font-bold text-primary">What Is It?</h3>
              <p className="text-gray-700 leading-relaxed">
                Training Services provides professional learning programs for organizations, project teams, and individual experts. The module focuses on practical skill development tied to real proposal and delivery environments.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Courses are designed to strengthen both technical and strategic capabilities, helping participants improve execution quality and readiness for international cooperation projects.
              </p>
            </div>
            <div className="rounded-lg border border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 p-6 md:p-8">
              <h4 className="text-xl font-semibold text-primary mb-4">Learning with Practical Impact</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Prioritize skills that improve proposal and delivery outcomes.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Adapt learning to expert and team workflows.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Support long-term professional growth and competitiveness.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-primary">Key Features</h3>
              <p className="text-gray-600">A premium training framework built to accelerate capability development for high-impact project environments.</p>
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
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Strengthen team readiness for complex project environments.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Improve proposal and execution quality through applied skills.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Enable continuous capability growth for experts and managers.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Increase competitiveness in international markets.</p>
            </div>
          </section>

          <section className="rounded-lg border border-accent/20 bg-gradient-to-br from-accent/10 to-primary/10 p-6 md:p-8 text-center">
            <h3 className="text-2xl font-bold text-primary mb-3">Need a Tailored Training Path for Your Team?</h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Contact us to design a program aligned with your project pipeline and competency objectives.
            </p>
            <a href="mailto:contact@assortis.com">
              <Button className="min-h-11">
                <Mail className="w-4 h-4 mr-2" />
                {t('services.cta.contactUs')}
              </Button>
            </a>
          </section>

          <section className="bg-white rounded-lg border p-6 space-y-3">
            <h3 className="text-2xl font-semibold text-primary">{t('services.training.catalogTitle')}</h3>
            <p className="text-muted-foreground">{t('services.training.intro')}</p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 6).map((course) => (
              <div key={course.id} className="bg-white rounded-lg border hover:shadow-md transition-shadow flex flex-col">
                <div className="p-5 pb-0">
                  <div className="flex items-center gap-2 mb-3 flex-wrap min-h-[28px]">
                    <Badge variant="outline" className="text-xs">{t(`training.level.${course.level}`)}</Badge>
                    <Badge variant="secondary" className="text-xs">{t(`training.format.${course.format}`)}</Badge>
                  </div>
                </div>

                <div className="px-5 pb-3">
                  <h3 className="font-semibold text-primary mb-2 line-clamp-2 min-h-[48px]">{course.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">{course.description}</p>
                </div>

                <div className="px-5 pb-3">
                  <div className="text-sm text-muted-foreground">
                    <p>{course.instructor.name}</p>
                    <p>{course.duration}h</p>
                  </div>
                </div>

                <div className="flex-1" />

                <div className="px-5 pb-4">
                  <div className="pt-3 border-t">
                    <a href="mailto:contact@assortis.com" className="w-full">
                      <Button className="w-full min-h-11" variant="default">
                        <Mail className="w-4 h-4 mr-2" />
                        {t('services.cta.contactUs')}
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
