import { ArrowRight, Building2, CheckCircle2, Compass, FileCheck2, Globe2, Handshake, Layers, Sparkles, Target, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '@app/contexts/AuthContext';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { PublicOrganizationServiceTabs } from '@app/components/PublicOrganizationServiceTabs';
import { Button } from '@app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@app/components/ui/dialog';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';

const SERVICES_OPTIONS = [
  { key: 'matching', labelKey: 'services.organization.joinUs.service.matching' },
  { key: 'myProjects', labelKey: 'services.organization.joinUs.service.myProjects' },
  { key: 'search', labelKey: 'services.organization.joinUs.service.search' },
  { key: 'statistics', labelKey: 'services.organization.joinUs.service.statistics' },
  { key: 'cvip', labelKey: 'services.organization.joinUs.service.cvip' },
  { key: 'bidWriters', labelKey: 'services.organization.joinUs.service.bidWriters' },
] as const;

interface JoinUsFormState {
  orgName: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  website: string;
  address: string;
  selectedServices: string[];
}

const EMPTY_FORM: JoinUsFormState = {
  orgName: '',
  contactPerson: '',
  email: '',
  phone: '',
  country: '',
  website: '',
  address: '',
  selectedServices: [],
};

export default function PublicOrganizationMatchingProjectsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [joinUsOpen, setJoinUsOpen] = useState(false);
  const [form, setForm] = useState<JoinUsFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof JoinUsFormState | 'services', string>>>({});
  const [submitting, setSubmitting] = useState(false);

  function updateField(field: keyof JoinUsFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function toggleService(key: string) {
    setForm((prev) => {
      const has = prev.selectedServices.includes(key);
      const updated = has ? prev.selectedServices.filter((s) => s !== key) : [...prev.selectedServices, key];
      return { ...prev, selectedServices: updated };
    });
    if (errors.services) setErrors((prev) => ({ ...prev, services: undefined }));
  }

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!form.orgName.trim()) newErrors.orgName = t('services.organization.joinUs.required');
    if (!form.contactPerson.trim()) newErrors.contactPerson = t('services.organization.joinUs.required');
    if (!form.email.trim()) {
      newErrors.email = t('services.organization.joinUs.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = t('services.organization.joinUs.invalidEmail');
    }
    if (!form.country.trim()) newErrors.country = t('services.organization.joinUs.required');
    if (form.selectedServices.length === 0) newErrors.services = t('services.organization.joinUs.selectAtLeastOne');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    // Frontend-only capture – structure kept ready for future API wiring
    const payload = {
      organizationName: form.orgName.trim(),
      contactPerson: form.contactPerson.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      country: form.country.trim(),
      website: form.website.trim(),
      address: form.address.trim(),
      servicesOfInterest: form.selectedServices,
      submittedAt: new Date().toISOString(),
    };
    console.info('[OrgInterest] Interest form submitted:', payload);
    setTimeout(() => {
      setSubmitting(false);
      setJoinUsOpen(false);
      setForm(EMPTY_FORM);
      setErrors({});
      toast.success(t('services.organization.joinUs.successTitle'), {
        description: t('services.organization.joinUs.successMessage'),
      });
    }, 600);
  }
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

          {/* Join-Us CTA — visible to unauthenticated visitors only */}
          {!isAuthenticated && (
            <section className="rounded-lg border-2 border-dashed border-accent/40 bg-gradient-to-br from-accent/5 via-white to-primary/5 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-2xl font-bold text-primary">{t('services.organization.joinUs.ctaTitle')}</h3>
                <p className="text-gray-600 max-w-xl">{t('services.organization.joinUs.ctaDescription')}</p>
              </div>
              <Button
                size="lg"
                className="shrink-0 min-h-11 bg-accent hover:bg-accent/90 text-white"
                onClick={() => setJoinUsOpen(true)}
              >
                {t('services.organization.joinUs.ctaButton')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </section>
          )}

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

      {/* Join-Us Interest Modal */}
      <Dialog open={joinUsOpen} onOpenChange={(open) => { if (!open) { setForm(EMPTY_FORM); setErrors({}); } setJoinUsOpen(open); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('services.organization.joinUs.formTitle')}</DialogTitle>
            <p className="text-sm text-gray-600 mt-1">{t('services.organization.joinUs.formDescription')}</p>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="joi-orgName">{t('services.organization.joinUs.orgName')} *</Label>
                <Input
                  id="joi-orgName"
                  value={form.orgName}
                  onChange={(e) => updateField('orgName', e.target.value)}
                  placeholder={t('services.organization.joinUs.orgName')}
                />
                {errors.orgName && <p className="text-xs text-red-500">{errors.orgName}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="joi-contactPerson">{t('services.organization.joinUs.contactPerson')} *</Label>
                <Input
                  id="joi-contactPerson"
                  value={form.contactPerson}
                  onChange={(e) => updateField('contactPerson', e.target.value)}
                  placeholder={t('services.organization.joinUs.contactPerson')}
                />
                {errors.contactPerson && <p className="text-xs text-red-500">{errors.contactPerson}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="joi-email">{t('services.organization.joinUs.email')} *</Label>
                <Input
                  id="joi-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="you@organization.com"
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="joi-phone">{t('services.organization.joinUs.phone')}</Label>
                <Input
                  id="joi-phone"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+1 555 000 0000"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="joi-country">{t('services.organization.joinUs.country')} *</Label>
                <Input
                  id="joi-country"
                  value={form.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  placeholder={t('services.organization.joinUs.country')}
                />
                {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="joi-website">{t('services.organization.joinUs.website')}</Label>
                <Input
                  id="joi-website"
                  value={form.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://yourorganization.com"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="joi-address">{t('services.organization.joinUs.address')}</Label>
              <Input
                id="joi-address"
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder={t('services.organization.joinUs.address')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('services.organization.joinUs.services')} *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SERVICES_OPTIONS.map(({ key, labelKey }) => {
                  const checked = form.selectedServices.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleService(key)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium text-left transition-colors ${
                        checked
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-accent/40'
                      }`}
                    >
                      {t(labelKey)}
                    </button>
                  );
                })}
              </div>
              {errors.services && <p className="text-xs text-red-500">{errors.services}</p>}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => { setJoinUsOpen(false); setForm(EMPTY_FORM); setErrors({}); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-accent hover:bg-accent/90 text-white">
                {submitting ? t('services.organization.joinUs.submitting') : t('services.organization.joinUs.submit')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
