import { useNavigate, useLocation } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useOffersHubContent } from '@app/hooks/useOffersContent';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OffersSubMenu } from '@app/components/OffersSubMenu';
import { Button } from '@app/components/ui/button';
import { 
  CheckCircle2, 
  Mail,
  ArrowRight,
  Sparkles,
  FileText,
  User
} from 'lucide-react';

export default function ConfirmationMembership() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { email, planId, memberType } = location.state || {};
  const { data: offersContent } = useOffersHubContent();

  // Récupérer le plan sélectionné
  const selectedPlan = offersContent?.plans?.find(p => p.id === planId);
  
  // Fonction pour obtenir le nom du plan avec fallback
  const getPlanName = () => {
    if (selectedPlan?.name) {
      return selectedPlan.name[language] || selectedPlan.name.en || selectedPlan.name.fr || selectedPlan.name.es;
    }
    
    // Fallback si le plan n'est pas trouvé
    if (planId) {
      const translationKey = `offers.plans.${planId}.name`;
      const translated = t(translationKey);
      // Si la traduction n'existe pas, elle retournera la clé elle-même
      if (translated !== translationKey) {
        return translated;
      }
    }
    
    // Fallback final basé sur le type de membre
    return memberType === 'organization' 
      ? t('offers.become.typeOrganization') 
      : t('offers.become.typeExpert');
  };
  
  // Fonction pour obtenir le label du type de membre
  const getMemberTypeLabel = () => {
    return memberType === 'organization' 
      ? t('offers.become.typeOrganization') 
      : t('offers.become.typeExpert');
  };

  const nextSteps = [
    {
      icon: Mail,
      title: t('offers.confirmation.step1'),
      description: t('offers.confirmation.step1Desc'),
    },
    {
      icon: User,
      title: t('offers.confirmation.step2'),
      description: t('offers.confirmation.step2Desc'),
    },
    {
      icon: Sparkles,
      title: t('offers.confirmation.step3'),
      description: t('offers.confirmation.step3Desc'),
    },
  ];

  return (
    <>
      <PageBanner
        icon={CheckCircle2}
        title={t('offers.confirmation.title')}
        subtitle={t('offers.confirmation.subtitle')}
      />
      
      {/* Sub Menu */}
      <OffersSubMenu />
      
      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="max-w-3xl mx-auto">
            {/* Success Animation */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6">
                <CheckCircle2 className="h-16 w-16 text-green-600" strokeWidth={2} />
              </div>
              
              <h1 className="text-4xl font-bold text-primary mb-4">
                {t('offers.confirmation.title')}
              </h1>
              
              <p className="text-xl text-gray-600">
                {t('offers.confirmation.subtitle')}
              </p>
            </div>

            {/* Confirmation Message */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8 mb-8">
              <p className="text-center text-gray-700 mb-6">
                {t('offers.confirmation.message', { email: email || 'your email' })}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
                  <span>{t('offers.confirmation.emailSent')}</span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
                  <span>{t('offers.confirmation.accountActive')}</span>
                </div>
              </div>
            </div>

            {/* Plan Summary */}
            <div className="bg-gradient-to-br from-accent/10 to-red-50 rounded-xl border-2 border-accent/20 p-6 mb-8">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="h-5 w-5 text-accent" strokeWidth={2} />
                <h3 className="text-lg font-bold text-primary">
                  {t('offers.member.currentPlan')}
                </h3>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent mb-1">
                  {getPlanName()}
                </p>
                <p className="text-sm text-gray-600">
                  {getMemberTypeLabel()}
                </p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-primary mb-6">
                {t('offers.confirmation.nextSteps')}
              </h3>

              <div className="space-y-4">
                {nextSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="flex items-start gap-4 bg-white rounded-xl border-2 border-gray-200 p-6">
                      <div className="flex-shrink-0 bg-accent/10 rounded-lg p-3">
                        <Icon className="h-6 w-6 text-accent" strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-primary mb-1">{step.title}</h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                      <div className="flex-shrink-0 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center font-bold text-gray-600">
                        {index + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate('/')}
                className="flex-1 py-6 bg-accent hover:bg-accent/90 text-white font-semibold"
              >
                {t('offers.confirmation.goToDashboard')}
                <ArrowRight className="h-5 w-5 ml-2" strokeWidth={2} />
              </Button>
              
              <Button
                onClick={() => navigate('/calls')}
                variant="outline"
                className="flex-1 py-6"
              >
                <FileText className="h-5 w-5 mr-2" strokeWidth={2} />
                {t('offers.confirmation.exploreTenders')}
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}