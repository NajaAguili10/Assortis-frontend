import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { PageTabs } from '@app/components/PageTabs';
import { Card } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Check, X, Sparkles, Zap, Crown, CreditCard, BarChart3 } from 'lucide-react';

const plans = [
  {
    id: 'free',
    icon: <Sparkles className="h-6 w-6" />,
    color: 'from-gray-500 to-gray-600',
    price: '0',
    features: [
      { name: 'Access to 10 calls per month', included: true },
      { name: 'Basic search', included: true },
      { name: 'Email notifications', included: true },
      { name: 'AI Matching', included: false },
      { name: 'Export data', included: false },
      { name: 'Analytics dashboard', included: false },
      { name: 'Priority support', included: false },
      { name: 'Custom templates', included: false },
    ],
  },
  {
    id: 'pro',
    icon: <Zap className="h-6 w-6" />,
    color: 'from-pink-600 to-purple-600',
    price: '49',
    popular: true,
    features: [
      { name: 'Unlimited access to all calls', included: true },
      { name: 'Advanced search & filters', included: true },
      { name: 'Real-time notifications', included: true },
      { name: 'AI Matching (100 matches/month)', included: true },
      { name: 'Export data (CSV, Excel)', included: true },
      { name: 'Analytics dashboard', included: true },
      { name: 'Email support', included: true },
      { name: '10 custom templates', included: true },
    ],
  },
  {
    id: 'enterprise',
    icon: <Crown className="h-6 w-6" />,
    color: 'from-blue-600 to-cyan-600',
    price: 'Custom',
    features: [
      { name: 'Everything in Professional', included: true },
      { name: 'Unlimited AI Matching', included: true },
      { name: 'API access', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'Dedicated account manager', included: true },
      { name: 'Priority support (24/7)', included: true },
      { name: 'Unlimited custom templates', included: true },
      { name: 'White-label solution', included: true },
      { name: 'Training & onboarding', included: true },
    ],
  },
];

export default function Subscriptions() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <PageBanner
        icon={CreditCard}
        title={t('subscription.title')}
        subtitle={t('subscription.description')}
        stat={{ value: '3', label: 'Plans Available' }}
      />

      {/* Tabs */}
      <PageTabs
        tabs={[
          { label: 'All Plans', icon: BarChart3, active: true },
          { label: 'Free Plan', icon: Sparkles },
          { label: 'Professional', icon: Zap },
          { label: 'Enterprise', icon: Crown },
        ]}
      />

      {/* Pricing Cards */}
      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative p-8 hover:shadow-2xl transition-all ${
                  plan.popular ? 'border-2 border-pink-600 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-600 to-purple-600 text-white">
                    Most Popular
                  </Badge>
                )}

                <div className="text-center mb-6">
                  <div
                    className={`inline-flex p-4 rounded-full bg-gradient-to-r ${plan.color} text-white mb-4`}
                  >
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-2 capitalize">
                    {t(`subscription.${plan.id}`)}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    {plan.price !== 'Custom' && <span className="text-2xl">€</span>}
                    <span className="text-5xl font-bold">{plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-gray-600">/month</span>}
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mt-0.5 flex-shrink-0" />
                      )}
                      <span
                        className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {plan.price === 'Custom' ? 'Contact Sales' : t('subscription.selectPlan')}
                </Button>
              </Card>
            ))}
          </div>

          {/* Features Comparison */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">What's Included</h2>
            <Card className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <Check className="h-5 w-5 text-pink-600" />
                    </div>
                    Access to Calls
                  </h3>
                  <p className="text-sm text-gray-600">
                    Browse and access international tenders from major organizations worldwide
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                    </div>
                    AI-Powered Matching
                  </h3>
                  <p className="text-sm text-gray-600">
                    Smart matching between experts, organizations, and opportunities
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Zap className="h-5 w-5 text-blue-600" />
                    </div>
                    Advanced Analytics
                  </h3>
                  <p className="text-sm text-gray-600">
                    Track your submissions, success rates, and pipeline value
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    Expert Network
                  </h3>
                  <p className="text-sm text-gray-600">
                    Connect with certified experts and consultants in your field
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Check className="h-5 w-5 text-orange-600" />
                    </div>
                    Training & Certifications
                  </h3>
                  <p className="text-sm text-gray-600">
                    Access to professional development courses and certifications
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <div className="p-2 bg-cyan-100 rounded-lg">
                      <Crown className="h-5 w-5 text-cyan-600" />
                    </div>
                    Premium Support
                  </h3>
                  <p className="text-sm text-gray-600">
                    Dedicated support team to help you succeed
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}