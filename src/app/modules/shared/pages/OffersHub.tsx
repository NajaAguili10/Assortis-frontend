import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OffersSubMenu } from '@app/components/OffersSubMenu';
import { StatCard } from '@app/components/StatCard';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import { Check, Gift, Users, Building2, UserCheck, User } from 'lucide-react';
import { useOffersHubContent } from '@app/hooks/useOffersContent';
import { getIconByName } from '@app/utils/iconMapper';
import { useState } from 'react';
import { UserType } from '@app/types/offers.types';

export default function OffersHub() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { data: content, loading, error } = useOffersHubContent();
  const [selectedUserType, setSelectedUserType] = useState<UserType>('organization');

  const handleBecomeMember = (planId: string) => {
    navigate(`/offers/become-member?plan=${planId}&userType=${selectedUserType}`);
  };

  const handleContactSales = () => {
    navigate('/offers/contact-sales');
  };

  // État de chargement
  if (loading) {
    return (
      <>
        <PageBanner
          icon={Gift}
          title={t('offers.hub.title')}
          subtitle={t('offers.hub.subtitle')}
        />
        <PageContainer>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
              <p className="mt-4 text-gray-600">{t('common.loading')}</p>
            </div>
          </div>
        </PageContainer>
      </>
    );
  }

  // État d'erreur
  if (error || !content) {
    return (
      <>
        <PageBanner
          icon={Gift}
          title={t('offers.hub.title')}
          subtitle={t('offers.hub.subtitle')}
        />
        <PageContainer>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600">{t('common.error')}</p>
            </div>
          </div>
        </PageContainer>
      </>
    );
  }

  // Filtrer les éléments actifs et trier par displayOrder
  const activePlans = content.plans
    .filter(plan => plan.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // Séparer les plans par type d'utilisateur
  const expertPlans = activePlans.filter(plan => plan.userType === 'expert');
  const organizationPlans = activePlans.filter(plan => plan.userType === 'organization');

  const activeValueProps = content.valuePropositions
    .filter(vp => vp.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <>
      <PageBanner
        icon={Gift}
        title={content.banner.title[language]}
        subtitle={content.banner.subtitle[language]}
      />
      
      {/* Sub Menu */}
      <OffersSubMenu />
      
      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Stats Grid - KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            <StatCard
              title={t('offers.stats.activeMembers')}
              value="2,847"
              trend="+12%"
              icon={Users}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
            />
            <StatCard
              title={t('offers.stats.organizations')}
              value="1,523"
              subtitle={t('offers.stats.experts')}
              icon={Building2}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-500"
            />
            <StatCard
              title={t('offers.stats.experts')}
              value="1,324"
              badge="342 nouveaux"
              icon={UserCheck}
              iconBgColor="bg-green-50"
              iconColor="text-green-500"
            />
          </div>

        </div>

        {/* Pricing Plans */}
        {activePlans.length > 0 && (
          <div className="px-4 sm:px-5 lg:px-6 mb-12">
            <h2 className="text-xl font-bold text-primary mb-6">
              {content.sectionTitles.comparePlans[language]}
            </h2>
            
            {/* User Type Tabs */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-gray-100 rounded-lg p-1 gap-1">
                <button
                  onClick={() => setSelectedUserType('expert')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-md font-semibold transition-all duration-200 ${
                    selectedUserType === 'expert'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>
                    {language === 'fr' ? 'Experts' : language === 'es' ? 'Expertos' : 'Experts'}
                  </span>
                </button>
                <button
                  onClick={() => setSelectedUserType('organization')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-md font-semibold transition-all duration-200 ${
                    selectedUserType === 'organization'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span>
                    {language === 'fr' ? 'Organisations' : language === 'es' ? 'Organizaciones' : 'Organizations'}
                  </span>
                </button>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(selectedUserType === 'expert' ? expertPlans : organizationPlans).map((plan) => {
                const PlanIcon = getIconByName(plan.iconName);
                
                return (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-lg border p-6 transition-all duration-300 h-full flex flex-col ${
                      plan.highlighted 
                        ? 'border-accent shadow-lg hover:shadow-xl scale-105' 
                        : 'border-gray-200 hover:shadow-lg hover:border-accent/30'
                    }`}
                  >
                    {/* Highlighted Badge */}
                    {plan.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-accent text-white px-4 py-1 text-xs font-semibold shadow-md">
                          {t('subscription.recommended')}
                        </Badge>
                      </div>
                    )}

                    {/* Plan Header */}
                    <div className="mb-6">
                      <div className={`p-3 rounded-lg inline-flex mb-4 bg-gradient-to-br ${plan.colorGradient}`}>
                        <PlanIcon className="h-6 w-6 text-white" strokeWidth={2} />
                      </div>
                      <h3 className="text-lg font-semibold text-primary mb-2">
                        {plan.name[language]}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {plan.description[language]}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-6 pb-6 border-b border-gray-100">
                      {plan.priceMonthly === null ? (
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {t('offers.plans.custom')}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {language === 'fr' ? 'Contactez-nous pour un devis' : language === 'es' ? 'Contáctenos para cotización' : 'Contact us for a quote'}
                          </p>
                        </div>
                      ) : plan.priceMonthly === 0 ? (
                        <div>
                          <div className="text-3xl font-bold text-primary">
                            {t('offers.plans.free')}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-primary tabular-nums">
                              ${plan.priceMonthly}
                            </span>
                            <span className="text-gray-600">/ {t('offers.plans.monthly')}</span>
                          </div>
                          {plan.priceYearly && (
                            <div className="text-xs text-gray-500 mt-1">
                              ${plan.priceYearly} {t('offers.plans.billedYearly')} · {t('offers.plans.savePercent', { 
                                percent: Math.round((1 - plan.priceYearly / (plan.priceMonthly * 12)) * 100) 
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature.id} className="flex items-start gap-2.5">
                          <div className="flex-shrink-0 mt-0.5">
                            <Check className="h-4 w-4 text-green-600" strokeWidth={2.5} />
                          </div>
                          <span className="text-sm text-gray-700">
                            {t(feature.textKey, feature.values || {})}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                      onClick={() => plan.priceMonthly === null ? handleContactSales() : handleBecomeMember(plan.id)}
                      variant={plan.highlighted ? 'default' : 'outline'}
                      className={`w-full py-5 font-semibold transition-all duration-300 ${
                        plan.highlighted 
                          ? 'bg-accent hover:bg-accent/90 text-white' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {plan.priceMonthly === null ? t('offers.plans.contactSales') : t('offers.hub.becomeMember')}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Value Propositions */}
        {activeValueProps.length > 0 && (
          <div className="px-4 sm:px-5 lg:px-6 pb-12">
            <Separator className="my-8" />
            
            <h2 className="text-xl font-bold text-primary mb-4">
              {content.sectionTitles.features[language]}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeValueProps.map((vp) => {
                const VPIcon = getIconByName(vp.iconName);
                return (
                  <div 
                    key={vp.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-accent/30 transition-all"
                  >
                    <div className={`${vp.iconBgColor} ${vp.iconTextColor} p-3 rounded-lg inline-flex mb-4`}>
                      <VPIcon className="h-6 w-6" strokeWidth={2} />
                    </div>
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      {vp.title[language]}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {vp.description[language]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PageContainer>
    </>
  );
}