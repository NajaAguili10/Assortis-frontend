import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { Button } from '@app/components/ui/button';
import { toast } from 'sonner';
import { 
  CheckCircle2, 
  Mail, 
  ArrowRight, 
  User, 
  CreditCard,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface LocationState {
  email: string;
  accountType: 'organization' | 'expert';
  planType: 'org-beginner' | 'org-professional' | 'expert-beginner' | 'expert-professional' | 'professional' | 'enterprise';
  firstName?: string;
  lastName?: string;
  orgName?: string;
  completeLater?: boolean;
}

export default function SignupConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [isResending, setIsResending] = useState(false);
  const [emailResent, setEmailResent] = useState(false);

  // Get data from navigation state
  const state = location.state as LocationState | null;
  const email = state?.email || 'user@example.com';
  const accountType = state?.accountType || 'expert';
  const planType = state?.planType || 'professional';
  const completeLater = state?.completeLater || false;

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      // Simulate API call to resend confirmation email
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEmailResent(true);
      setTimeout(() => setEmailResent(false), 5000);
      toast.success(t('auth.confirmation.emailResent'));
    } catch (error) {
      console.error('Failed to resend email:', error);
      toast.error(t('auth.confirmation.emailResendFailed'));
    } finally {
      setIsResending(false);
    }
  };

  const getPlanName = () => {
    switch (planType) {
      case 'org-beginner':
        return t('offers.plans.orgBeginner');
      case 'org-professional':
        return t('offers.plans.orgProfessional');
      case 'expert-beginner':
        return t('offers.plans.expertBeginner');
      case 'expert-professional':
        return t('offers.plans.expertProfessional');
      case 'professional':
        return t('offers.plans.professional');
      case 'enterprise':
        return t('offers.plans.enterprise');
      default:
        return planType;
    }
  };

  const getAccountTypeName = () => {
    return accountType === 'organization' 
      ? t('auth.confirmation.organization')
      : t('auth.confirmation.expert');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-3">
            {t('auth.confirmation.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('auth.confirmation.subtitle')}
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Email Confirmation Section */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-primary mb-2">
                  {completeLater 
                    ? t('auth.signup.laterEmailSent')
                    : t('auth.confirmation.emailSent')
                  }
                </h2>
                <p className="text-gray-600 mb-2">
                  {completeLater
                    ? t('auth.confirmation.emailSentDesc')
                    : t('auth.confirmation.emailSentDesc')
                  }
                </p>
                <p className="text-base font-semibold text-primary mb-4">
                  {email}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  {completeLater
                    ? t('auth.signup.laterRedirectMessage')
                    : t('auth.confirmation.checkInbox')
                  }
                </p>
                
                {/* Resend Email */}
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-500">
                    {t('auth.confirmation.didntReceive')}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResendEmail}
                    disabled={isResending || emailResent}
                    className="text-accent hover:text-accent/80 border-accent/30 hover:border-accent"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isResending ? 'animate-spin' : ''}`} />
                    {emailResent 
                      ? t('auth.confirmation.emailResent')
                      : t('auth.confirmation.resendEmail')
                    }
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details Section */}
          <div className="p-8 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-primary mb-4">
              {t('auth.confirmation.accountDetails')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Account Type */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      {t('auth.confirmation.accountType')}
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      {getAccountTypeName()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subscription Plan */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent to-red-600 rounded-lg flex items-center justify-center">
                    {planType === 'enterprise' ? (
                      <Sparkles className="w-5 h-5 text-white" />
                    ) : (
                      <CreditCard className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      {t('auth.confirmation.subscriptionPlan')}
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      {getPlanName()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps Section */}
          <div className="p-8">
            <h3 className="text-lg font-semibold text-primary mb-4">
              {t('auth.confirmation.nextSteps')}
            </h3>
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-accent">1</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {t('auth.confirmation.step1')}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-accent">2</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {t('auth.confirmation.step2')}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-accent">3</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {t('auth.confirmation.step3')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/about')}
            className="px-8 py-3 text-base font-semibold"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {t('auth.confirmation.aboutAssortis')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/signup', {
              state: {
                resumePhase2: true,
                email,
                accountType,
                planType,
                firstName: state?.firstName,
                lastName: state?.lastName,
                orgName: state?.orgName,
                password: '', // Will need to be re-entered for security
              }
            })}
            className="px-8 py-3 text-base font-semibold border-2 border-accent text-accent hover:bg-accent hover:text-white"
          >
            {t('auth.confirmation.continuePhase2')}
          </Button>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {t('auth.confirmation.checkInbox')}
          </p>
        </div>
      </div>
    </div>
  );
}