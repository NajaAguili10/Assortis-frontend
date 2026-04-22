import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { 
  Globe, 
  Users, 
  Target, 
  Award, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  ArrowRight,
  Briefcase,
  Network,
  TrendingUp,
  FileCheck,
  MessageSquare,
  Map
} from 'lucide-react';
import { Link } from 'react-router';

export default function AboutPage() {
  const { t } = useLanguage();

  const services = [
    {
      icon: Target,
      titleKey: 'about.services.service1.title',
      descriptionKey: 'about.services.service1.description',
    },
    {
      icon: Network,
      titleKey: 'about.services.service2.title',
      descriptionKey: 'about.services.service2.description',
    },
    {
      icon: Briefcase,
      titleKey: 'about.services.service3.title',
      descriptionKey: 'about.services.service3.description',
    },
    {
      icon: TrendingUp,
      titleKey: 'about.services.service4.title',
      descriptionKey: 'about.services.service4.description',
    },
    {
      icon: MessageSquare,
      titleKey: 'about.services.service5.title',
      descriptionKey: 'about.services.service5.description',
    },
    {
      icon: Map,
      titleKey: 'about.services.service6.title',
      descriptionKey: 'about.services.service6.description',
    },
  ];

  const stats = [
    {
      value: '230+',
      labelKey: 'about.global.stats.countries',
      icon: Globe,
    },
    {
      value: '10+',
      labelKey: 'about.global.stats.offices',
      icon: Building2,
    },
    {
      value: '50+',
      labelKey: 'about.global.stats.team',
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('about.pageTitle')}
        description={t('about.pageDescription')}
        icon={Building2}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-5 lg:px-6 py-12">
        {/* Hero Section */}
        <section className="mb-16">
          <div className="relative bg-gradient-to-br from-white via-gray-50/50 to-accent/5 rounded-lg border border-gray-200 overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl opacity-30" />
            
            {/* Content */}
            <div className="relative p-8 md:p-12 lg:p-16">
              <div className="max-w-4xl">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-6">
                  <Award className="h-4 w-4" />
                  <span className="text-sm font-semibold">{t('about.experience.badge')}</span>
                </div>
                
                {/* Title */}
                <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight">
                  {t('about.hero.title')}
                </h2>
                
                {/* Description */}
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8">
                  {t('about.hero.subtitle')}
                </p>
                
                {/* Key Points */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="flex items-start gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/50 hover:shadow-md transition-shadow">
                    <div className="p-2 bg-accent/10 rounded-lg flex-shrink-0">
                      <Users className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-primary mb-1">
                        {t('about.hero.point1.title')}
                      </div>
                      <div className="text-xs text-gray-600">
                        {t('about.hero.point1.description')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/50 hover:shadow-md transition-shadow">
                    <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-primary mb-1">
                        {t('about.hero.point2.title')}
                      </div>
                      <div className="text-xs text-gray-600">
                        {t('about.hero.point2.description')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/50 hover:shadow-md transition-shadow">
                    <div className="p-2 bg-accent/10 rounded-lg flex-shrink-0">
                      <Globe className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-primary mb-1">
                        {t('about.hero.point3.title')}
                      </div>
                      <div className="text-xs text-gray-600">
                        {t('about.hero.point3.description')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Award className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-primary">
                  {t('about.overview.title')}
                </h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {t('about.overview.description')}
              </p>
            </div>

            <div className="bg-gradient-to-br from-accent/5 to-primary/5 rounded-lg p-8 border border-accent/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-accent rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-4xl font-bold text-accent">
                    {t('about.experience.badge')}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {t('about.experience.title')}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {t('about.experience.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Global Presence Section */}
        <section className="mb-16">
          <div className="bg-white rounded-lg border border-gray-200 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-primary">
                {t('about.global.title')}
              </h3>
            </div>
            
            <p className="text-gray-700 leading-relaxed mb-8">
              {t('about.global.description')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200 text-center"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mb-4">
                      <IconComponent className="h-6 w-6 text-accent" />
                    </div>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {t(stat.labelKey)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-primary to-primary/90 rounded-lg p-8 md:p-12 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 rounded-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold">
                {t('about.mission.title')}
              </h3>
            </div>
            <p className="text-lg text-white/95 leading-relaxed max-w-4xl">
              {t('about.mission.description')}
            </p>
          </div>
        </section>

        {/* Services Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-primary mb-4">
              {t('about.services.title')}
            </h3>
            <p className="text-gray-600 max-w-3xl mx-auto">
              {t('about.services.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-accent/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-accent/10 rounded-lg flex-shrink-0">
                      <IconComponent className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-primary mb-2">
                        {t(service.titleKey)}
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {t(service.descriptionKey)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section>
          <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg p-8 md:p-12 text-center border border-accent/20">
            <h3 className="text-2xl font-bold text-primary mb-4">
              {t('about.cta.title')}
            </h3>
            <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
              {t('about.cta.description')}
            </p>
            <Link
              to="/tenders"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              {t('about.cta.button')}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}