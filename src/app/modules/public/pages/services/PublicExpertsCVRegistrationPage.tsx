import { FormEvent, useState } from 'react';
import { ArrowRight, CheckCircle2, FileCheck2, FileUser, Globe2, Languages, Layers, Sparkles, Target, TimerReset, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { PublicExpertsServiceTabs } from '@app/components/PublicExpertsServiceTabs';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { CountryEnum, SectorEnum } from '@app/types/tender.dto';
import { getLocalizedCountryName } from '@app/utils/country-translator';

export default function PublicExpertsCVRegistrationPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [cvLanguage, setCvLanguage] = useState('en');
  const features = [
    {
      icon: FileCheck2,
      title: 'Structured International CV Format',
      description: 'Build a profile aligned with donor-driven and international tender expectations.',
    },
    {
      icon: Layers,
      title: 'Sector and Expertise Tagging',
      description: 'Highlight your technical depth through clear sector and specialization mapping.',
    },
    {
      icon: TimerReset,
      title: 'Availability Status Management',
      description: 'Communicate short-term and medium-term mission readiness with precision.',
    },
    {
      icon: Languages,
      title: 'Multi-Language Orientation',
      description: 'Position your CV for multilingual proposal environments and global teams.',
    },
    {
      icon: Wallet,
      title: 'Rate and Positioning Inputs',
      description: 'Provide practical commercial indicators to support realistic opportunity targeting.',
    },
    {
      icon: Globe2,
      title: 'Global Opportunity Readiness',
      description: 'Prepare a profile that can be surfaced for assignments across regions and sectors.',
    },
  ];

  const steps = [
    'Complete your core personal and professional profile details.',
    'Select sectors, location, language, and availability preferences.',
    'Save your structured CV draft in a tender-ready format.',
    'Use your profile as a foundation for matching and collaboration opportunities.',
  ];

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.success(t('services.form.cv.saved'));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner icon={FileUser} title={t('services.experts.hero.title')} description={t('services.experts.hero.description')} />
      <PublicExpertsServiceTabs />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6 space-y-8">
          <section className="relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-white via-gray-50/40 to-accent/10 p-6 md:p-10">
            <div className="absolute -top-16 -right-16 h-52 w-52 rounded-full bg-accent/15 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-2 text-sm font-semibold text-accent">
                <Sparkles className="h-4 w-4" />
                CV Registration
              </div>
              <div className="max-w-3xl space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-primary">Build a Tender-Ready Expert CV</h2>
                <p className="text-gray-700 md:text-lg leading-relaxed">
                  Create a structured expert profile that highlights your strengths, improves matching quality, and accelerates your visibility in international opportunities.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <Target className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Precision Positioning</p>
                  <p className="text-xs text-gray-600 mt-1">Present your expertise with clarity and structure.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <Globe2 className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">International Readiness</p>
                  <p className="text-xs text-gray-600 mt-1">Align your profile with global proposal workflows.</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white/90 p-4">
                  <FileCheck2 className="h-5 w-5 text-accent mb-2" />
                  <p className="text-sm font-semibold text-primary">Reusable Profile Base</p>
                  <p className="text-xs text-gray-600 mt-1">Keep a reliable profile for future opportunities.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <div className="rounded-lg border bg-white p-6 md:p-8 space-y-4">
              <h3 className="text-2xl font-bold text-primary">What Is It?</h3>
              <p className="text-gray-700 leading-relaxed">
                CV Registration is a profile-building module created for experts working in international development and cooperation markets. It helps you present your experience using a consistent, professional format that proposal teams can evaluate quickly.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By standardizing key profile signals such as sector focus, country exposure, language preference, and availability, this module strengthens your chances of being selected for high-fit assignments.
              </p>
            </div>
            <div className="rounded-lg border border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 p-6 md:p-8">
              <h4 className="text-xl font-semibold text-primary mb-4">Profile Quality That Supports Conversion</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Clarify your value proposition for organizations.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Reduce friction during expert shortlisting.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" />Improve visibility in matching workflows.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-primary">Key Features</h3>
              <p className="text-gray-600">Everything you need to create a strong expert profile foundation for international opportunities.</p>
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
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Create a profile organizations can evaluate quickly and confidently.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Increase matching relevance by clarifying your expertise signals.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Maintain one reliable CV foundation across opportunities.</p>
              <p className="flex items-start gap-2"><ArrowRight className="h-5 w-5 text-accent mt-0.5" />Strengthen your readiness for international project selection.</p>
            </div>
          </section>

          <section className="rounded-lg border border-accent/20 bg-gradient-to-br from-accent/10 to-primary/10 p-6 md:p-8 text-center">
            <h3 className="text-2xl font-bold text-primary mb-3">Need Support Crafting Your Expert Profile?</h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Speak with our team for guidance on building a profile that performs better in strategic matching workflows.
            </p>
            <Button className="min-h-11" onClick={() => navigate('/ask-for-quote')}>
              {t('services.cta.askQuote')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </section>

          <section className="bg-white rounded-lg border p-6 space-y-2">
            <h3 className="text-2xl font-semibold text-primary">Register Your CV</h3>
            <p className="text-sm text-muted-foreground">Complete the form below to save your expert profile draft.</p>
          </section>

          <form onSubmit={onSubmit} className="bg-white rounded-lg border p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">{t('services.form.cv.fullName')}</Label>
                <Input id="full-name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('services.form.cv.email')}</Label>
                <Input id="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('services.form.cv.phone')}</Label>
                <Input id="phone" required />
              </div>
              <div className="space-y-2">
                <Label>{t('services.form.cv.country')}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CountryEnum).map((value) => (
                      <SelectItem key={value} value={value}>{getLocalizedCountryName(value, language)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('services.form.cv.primarySector')}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(SectorEnum).map((value) => (
                      <SelectItem key={value} value={value}>{t(`sectors.${value}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('services.form.cv.availability')}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">{t('services.form.cv.availability.immediate')}</SelectItem>
                    <SelectItem value="one-month">{t('services.form.cv.availability.oneMonth')}</SelectItem>
                    <SelectItem value="three-months">{t('services.form.cv.availability.threeMonths')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('services.form.cv.language')}</Label>
                <Select value={cvLanguage} onValueChange={setCvLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t('lang.english')}</SelectItem>
                    <SelectItem value="fr">{t('lang.french')}</SelectItem>
                    <SelectItem value="es">{t('lang.spanish')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">{t('services.form.cv.rate')}</Label>
                <Input id="rate" />
              </div>
            </div>

            <Button type="submit" className="min-h-11">
              {t('services.form.cv.save')}
            </Button>
          </form>
        </div>
      </PageContainer>
    </div>
  );
}
