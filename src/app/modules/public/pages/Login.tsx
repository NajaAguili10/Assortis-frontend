import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@app/components/ui/alert';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { PageBanner } from '@app/components/PageBanner';
import { useAuth } from '@app/contexts/AuthContext';
import { useTranslation } from '@app/contexts/LanguageContext';
import { canManageOrganizationAdminActions } from '@app/services/permissions.service';
import { type IncompleteSignupData } from '@app/services/userStatusService';
import { ArrowRight, CheckCircle2, Clock, LogIn, ShieldCheck, UserRound, UsersRound } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, quickLogin } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [incompleteSignupData, setIncompleteSignupData] = useState<IncompleteSignupData | null>(null);

  useEffect(() => {
    const state = location.state as { registeredSuccessfully?: boolean } | null;

    if (state?.registeredSuccessfully) {
      toast.success('Account Created Successfully!');
      navigate('/login', { replace: true, state: {} });
    }
  }, [location, navigate]);

  const navigateAfterLogin = (fallbackAccountType?: string) => {
    const storedUser = localStorage.getItem('assortis_user');

    if (!storedUser) {
      navigate(fallbackAccountType === 'organization' || fallbackAccountType === 'organization-user'
        ? '/calls/overview'
        : '/calls/active');
      return;
    }

    const user = JSON.parse(storedUser);
    const role = (user.role || user.accountType || '').toUpperCase();
    const accountType = (user.accountType || fallbackAccountType || '').toLowerCase();
    const isOrganizationAdmin = canManageOrganizationAdminActions(user.accountType, user.role);

    if (role === 'ORGANIZATION' || accountType === 'organization' || isOrganizationAdmin) {
      navigate('/calls/overview');
      return;
    }

    navigate('/calls/active');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIncompleteSignupData(null);
    setLoading(true);

    try {
      await login(email, password);
      navigateAfterLogin();
    } catch (err: any) {
      setError(err.message || 'Username or password incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (accountType: Parameters<typeof quickLogin>[0]) => {
    setError('');
    setLoading(true);

    try {
      await quickLogin(accountType);
      navigateAfterLogin(accountType);
    } catch (err: any) {
      setError(err.message || 'Demo access failed');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueSignup = () => {
    if (incompleteSignupData) {
      localStorage.setItem('assortis_resume_signup', JSON.stringify(incompleteSignupData));
      navigate('/signup?resume=true');
    }
  };

  const handleStartOver = () => {
    setIncompleteSignupData(null);
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        icon={LogIn}
        title={t('auth.login.banner.title')}
        description={t('auth.login.banner.description')}
      />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-xl border-2 border-gray-200 bg-white p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.login.email') || 'Email'} *</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('auth.login.password') || 'Password'} *</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm hover:underline"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {t('auth.login.forgotPassword') || 'Forgot password?'}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={loading}
                minLength={6}
                placeholder={t('auth.login.password') || 'Password'}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {loading ? (t('common.loading') || 'Loading...') : (t('auth.login.submit') || 'Login')}
            </Button>

            <div className="border-t border-gray-200 pt-4 text-center text-sm text-gray-600">
              {t('auth.login.noAccount') || "Don't have an account?"}{' '}
              <Link
                to="/signup"
                className="font-medium hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                {t('auth.login.signupLink') || 'Sign up'}
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-6 rounded-xl border-2 border-gray-200 bg-white p-6">
          <div className="mb-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-primary">
              <ShieldCheck className="h-5 w-5" />
              Demo access
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Use seeded server accounts with real backend authentication.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Button type="button" variant="outline" disabled={loading} onClick={() => handleQuickLogin('organization')}>
              <UsersRound className="h-4 w-4" />
              Organization
            </Button>
            <Button type="button" variant="outline" disabled={loading} onClick={() => handleQuickLogin('organization-user')}>
              <UserRound className="h-4 w-4" />
              Org User
            </Button>
            <Button type="button" variant="outline" disabled={loading} onClick={() => handleQuickLogin('expert')}>
              <UserRound className="h-4 w-4" />
              Expert
            </Button>
            <Button type="button" variant="outline" disabled={loading} onClick={() => handleQuickLogin('admin')}>
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Button>
            <Button type="button" variant="outline" disabled={loading} onClick={() => handleQuickLogin('public')}>
              <LogIn className="h-4 w-4" />
              Public
            </Button>
          </div>
        </div>

        {incompleteSignupData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border-2 border-gray-200 bg-white p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h2 className="mb-2 text-2xl font-bold text-primary">
                    {t('auth.login.incompleteSignup')}
                  </h2>
                  <p className="text-gray-600">
                    {t('auth.login.incompleteSignupMessage')}
                  </p>
                </div>
              </div>

              <div className="mb-6 rounded-lg bg-gray-50 p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  {t('auth.login.registrationProgress')}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('auth.signup.selectType')}</span>
                    <span className="font-semibold text-primary">
                      {incompleteSignupData.accountType === 'organization'
                        ? t('auth.signup.typeOrganization')
                        : t('auth.signup.typeExpert')}
                    </span>
                  </div>
                  {incompleteSignupData.firstName && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{t('auth.signup.yourInformation')}</span>
                      <span className="font-semibold text-primary">
                        {incompleteSignupData.firstName} {incompleteSignupData.lastName}
                      </span>
                    </div>
                  )}
                  {incompleteSignupData.orgName && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{t('offers.form.org.name')}</span>
                      <span className="font-semibold text-primary">{incompleteSignupData.orgName}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('auth.login.accountStatus')}</span>
                    <span className="font-semibold text-orange-600">
                      {t('auth.login.statusIncomplete', { step: incompleteSignupData.currentStep })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Button
                  onClick={handleContinueSignup}
                  className="w-full"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  {t('auth.login.continueSignup')}
                </Button>
                <Button onClick={handleStartOver} variant="outline" className="w-full">
                  {t('auth.login.startOver')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
