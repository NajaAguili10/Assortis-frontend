import React from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../../../contexts/LanguageContext';
import { PageContainer } from '../../../components/PageContainer';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { 
  PlusCircle, 
  Briefcase, 
  Inbox, 
  FileUser, 
  UserCheck, 
  Shield,
  Lock,
  ArrowRight
} from 'lucide-react';

/**
 * Composant d'introduction pour Mon Espace
 * Affiché aux utilisateurs public/non authentifiés
 */
export function MonEspaceIntroduction() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const features = [
    {
      icon: PlusCircle,
      titleKey: 'monEspace.intro.features.publish.title',
      descriptionKey: 'monEspace.intro.features.publish.description',
      iconBgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      icon: Briefcase,
      titleKey: 'monEspace.intro.features.vacancies.title',
      descriptionKey: 'monEspace.intro.features.vacancies.description',
      iconBgColor: 'bg-green-50',
      iconColor: 'text-green-500',
    },
    {
      icon: Inbox,
      titleKey: 'monEspace.intro.features.invitations.title',
      descriptionKey: 'monEspace.intro.features.invitations.description',
      iconBgColor: 'bg-purple-50',
      iconColor: 'text-purple-500',
    },
    {
      icon: FileUser,
      titleKey: 'monEspace.intro.features.cv.title',
      descriptionKey: 'monEspace.intro.features.cv.description',
      iconBgColor: 'bg-orange-50',
      iconColor: 'text-orange-500',
    },
    {
      icon: UserCheck,
      titleKey: 'monEspace.intro.features.account.title',
      descriptionKey: 'monEspace.intro.features.account.description',
      iconBgColor: 'bg-teal-50',
      iconColor: 'text-teal-500',
    },
    {
      icon: Shield,
      titleKey: 'monEspace.intro.features.member.title',
      descriptionKey: 'monEspace.intro.features.member.description',
      iconBgColor: 'bg-pink-50',
      iconColor: 'text-pink-500',
    },
  ];

  const subMenuItems = [
    { icon: PlusCircle, labelKey: 'monEspace.nav.publish' },
    { icon: Briefcase, labelKey: 'monEspace.nav.vacancies' },
    { icon: Inbox, labelKey: 'monEspace.nav.invitations' },
    { icon: FileUser, labelKey: 'monEspace.nav.myCV' },
    { icon: UserCheck, labelKey: 'monEspace.nav.myAccount' },
    { icon: Shield, labelKey: 'monEspace.nav.memberArea' },
  ];

  return (
    <PageContainer className="my-6">
      <div className="px-4 sm:px-5 lg:px-6 py-8">
        {/* Introduction Section */}
        <div className="mb-8 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-primary mb-4">
            {t('monEspace.intro.title')}
          </h2>
          <p className="text-lg text-gray-700 mb-2">
            {t('monEspace.intro.subtitle')}
          </p>
          <p className="text-base text-gray-600">
            {t('monEspace.intro.description')}
          </p>
        </div>

        {/* Sub-Menu Items Overview */}
        <Card className="mb-8 p-6 bg-gray-50 border-2 border-primary/20">
          <div className="flex items-start gap-3 mb-4">
            <Lock className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-primary mb-2">
                {t('monEspace.intro.features.title')}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t('monEspace.intro.features.description')}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {subMenuItems.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center">
                  {t(item.labelKey)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Features Grid */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-primary mb-6 text-center">
            {t('monEspace.intro.features.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className={`h-12 w-12 rounded-lg ${feature.iconBgColor} flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <h4 className="text-lg font-bold text-primary mb-2">
                  {t(feature.titleKey)}
                </h4>
                <p className="text-sm text-gray-600">
                  {t(feature.descriptionKey)}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Access Required Section */}
        <Card className="p-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <div className="text-center max-w-2xl mx-auto">
            <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-primary mb-3">
              {t('monEspace.intro.access.title')}
            </h3>
            <p className="text-base text-gray-700 mb-6">
              {t('monEspace.intro.access.message')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/login')}
                className="gap-2"
              >
                {t('monEspace.intro.access.login')}
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/signup')}
                className="gap-2"
              >
                {t('monEspace.intro.access.signup')}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
