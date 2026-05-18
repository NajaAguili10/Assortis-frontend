import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '@app/contexts/AuthContext';
import { useTranslation } from '@app/contexts/LanguageContext';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Alert, AlertDescription } from '@app/components/ui/alert';
import { PageBanner } from '@app/components/PageBanner';
import { LogIn, CheckCircle2, Clock, ArrowRight, ShieldCheck, UserRound, UsersRound } from 'lucide-react';
import { initializeTestAccounts, authenticateUser, getTestAccounts, type IncompleteSignupData } from '@app/services/userStatusService';

const Login = () => {
  const navigate = useNavigate();
  const { login, quickLogin } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [incompleteSignupData, setIncompleteSignupData] = useState<IncompleteSignupData | null>(null);
  const [showTestAccounts, setShowTestAccounts] = useState(false);

  const location = useLocation();

  // Initialize test accounts on component mount
  useEffect(() => {
    // OLD STATIC AUTH (disabled for dynamic backend auth)
    // initializeTestAccounts();
  }, []);

  // Check for successful registration
  useEffect(() => {
    const state = location.state as any;
    if (state?.registeredSuccessfully) {
      toast.success('Account Created Successfully!');
      // Clear the state so the toast doesn't appear again on refresh
      navigate('/login', { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIncompleteSignupData(null);
    setLoading(true);

    try {
      /* OLD STATIC AUTH (disabled for dynamic backend auth)
      // Authenticate user using the new service
      const authResult = await authenticateUser(email, password);

      if (!authResult.success) {
        // Scenario 3: Invalid credentials
        setError(t(authResult.error || 'auth.login.invalidCredentials'));
        setLoading(false);
        return;
      }

      if (authResult.userType === 'complete' && authResult.userData) {
        // Scenario 1: Complete user with payment - Login normally
        await login(email, password);
        setLoading(false);
        const accountType = authResult.userData.accountType;
        navigate(accountType === 'expert' ? '/experts/dashboard' : '/calls/overview');
      } else if (authResult.userType === 'incomplete' && authResult.userData) {
        // Scenario 2: Incomplete signup - Show modal to continue registration
        setIncompleteSignupData(authResult.userData as IncompleteSignupData);
        setLoading(false);
      }
      */

      // NEW DYNAMIC BACKEND AUTH
      await login(email, password);

      // Get user from localStorage to determine role
      const storedUser = localStorage.getItem('assortis_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const role = (user.role || user.accountType || '').toUpperCase();

        // Dynamic Role-Based Redirection
        if (role === 'EXPERT') {
          navigate('/calls/active');
        } else if (role === 'ADMIN') {
          navigate('/calls/active');
        } else if (role === 'ORGANIZATION') {
          navigate('/calls/active');
        } else {
          navigate('/calls/active');
        }
      } else {
        navigate('/calls/active');
      }

      setLoading(false);
    } catch (err: any) {
      setError('Username or password incorrect');
      setLoading(false);
    }
  };

  const handleQuickLogin = async (accountType: Parameters<typeof quickLogin>[0]) => {
    setError('');
    setLoading(true);
    try {
      await quickLogin(accountType);
      navigate('/calls/active');
    } catch (err: any) {
      setError(err.message || 'Demo access failed');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueSignup = () => {
    if (incompleteSignupData) {
      // Store the incomplete signup data and navigate to signup page
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
      {/* Bannire Connexion */}
      <PageBanner
        icon={LogIn}
        title={t('auth.login.banner.title')}
        description={t('auth.login.banner.description')}
      />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Form Card */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
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
                onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
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

            <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-200">
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

        {/* Incomplete Signup Modal */}
        {incompleteSignupData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-primary mb-2">
                    {t('auth.login.incompleteSignup')}
                  </h2>
                  <p className="text-gray-600">
                    {t('auth.login.incompleteSignupMessage')}
                  </p>
                </div>
              </div>

              {/* Registration Progress */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  {t('auth.login.registrationProgress')}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{t('auth.signup.selectType')}</span>
                    <span className="font-semibold text-primary">
                      {incompleteSignupData.accountType === 'organization'
                        ? t('auth.signup.typeOrganization')
                        : t('auth.signup.typeExpert')}
                    </span>
                  </div>
                  {incompleteSignupData.firstName && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{t('auth.signup.yourInformation')}</span>
                      <span className="font-semibold text-primary">
                        {incompleteSignupData.firstName} {incompleteSignupData.lastName}
                      </span>
                    </div>
                  )}
                  {incompleteSignupData.orgName && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{t('offers.form.org.name')}</span>
                      <span className="font-semibold text-primary">
                        {incompleteSignupData.orgName}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{t('auth.login.accountStatus')}</span>
                    <span className="text-orange-600 font-semibold">
                      {t('auth.login.statusIncomplete', { step: incompleteSignupData.currentStep })}
                    </span>
                  </div>
                  {incompleteSignupData.lastModified && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{t('auth.login.lastUpdated')}</span>
                      <span className="text-gray-500">
                        {new Date(incompleteSignupData.lastModified).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleContinueSignup}
                  className="w-full"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  {t('auth.login.continueSignup')}
                </Button>
                <Button
                  onClick={handleStartOver}
                  variant="outline"
                  className="w-full"
                >
                  {t('auth.login.startOver')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* OLD STATIC AUTH (disabled for dynamic backend auth)
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowTestAccounts(!showTestAccounts)}
            className="text-sm text-gray-600 hover:text-primary transition-colors"
          >
            {showTestAccounts ? '-' : '+'} {t('auth.login.testAccountsHelp')}
          </button>
        </div>
        */}

        {/* OLD STATIC AUTH (disabled for dynamic backend auth)
        {showTestAccounts && (
          <div className="mt-6 bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">
              {t('auth.login.testMode')}
            </h3>
            Rest of test accounts list was here
          </div>
        )}
        */}
      </div>
    </div>
  );
};

export default Login;
