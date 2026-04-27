import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '@app/contexts/AuthContext';
import { useTranslation } from '@app/contexts/LanguageContext';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card';
import { Alert, AlertDescription } from '@app/components/ui/alert';
import { PageBanner } from '@app/components/PageBanner';
import { LogIn, Building2, User, Sparkles, AlertCircle, CheckCircle2, Clock, ArrowRight, Shield } from 'lucide-react';
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

  // Initialize test accounts on component mount
  useEffect(() => {
    initializeTestAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIncompleteSignupData(null);
    setLoading(true);

    try {
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
        navigate('/calls/active');
      } else if (authResult.userType === 'incomplete' && authResult.userData) {
        // Scenario 2: Incomplete signup - Show modal to continue registration
        setIncompleteSignupData(authResult.userData as IncompleteSignupData);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || t('auth.login.invalidCredentials'));
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

  const handleQuickLogin = async (accountType: 'expert' | 'organization' | 'organization-user' | 'admin' | 'public') => {
    setError('');
    setLoading(true);

    try {
      await quickLogin(accountType);
      navigate('/calls/active');
    } catch (err: any) {
      setError(err.message || t('auth.login.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banni�re Connexion */}
      <PageBanner
        icon={LogIn}
        title={t('auth.login.banner.title')}
        description={t('auth.login.banner.description')}
      />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Test Accounts Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <h3 className="font-semibold text-primary">
              {t('auth.login.testAccounts') || 'Quick Login (Test)'}
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {t('auth.login.testDescription') || 'Use these test accounts to explore the platform:'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3 px-4 border-2 hover:border-blue-400 hover:bg-white"
              onClick={() => handleQuickLogin('expert')}
              disabled={loading}
            >
              <div className="flex items-start gap-3 w-full">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-primary text-sm">
                    {t('auth.login.expert')}
                  </p>
                  <p className="text-xs text-gray-500 truncate">expert@example.com</p>
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3 px-4 border-2 hover:border-green-400 hover:bg-white"
              onClick={() => handleQuickLogin('organization')}
              disabled={loading}
            >
              <div className="flex items-start gap-3 w-full">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-primary text-sm">
                    {t('auth.login.organizationAdmin')}
                  </p>
                  <p className="text-xs text-gray-500 truncate">organization@example.com</p>
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3 px-4 border-2 hover:border-emerald-400 hover:bg-white"
              onClick={() => handleQuickLogin('organization-user')}
              disabled={loading}
            >
              <div className="flex items-start gap-3 w-full">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-primary text-sm">
                    {t('auth.login.organizationUser')}
                  </p>
                  <p className="text-xs text-gray-500 truncate">organization-user@example.com</p>
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3 px-4 border-2 hover:border-red-400 hover:bg-white"
              onClick={() => handleQuickLogin('admin')}
              disabled={loading}
            >
              <div className="flex items-start gap-3 w-full">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-primary text-sm">
                    {t('auth.login.admin')}
                  </p>
                  <p className="text-xs text-gray-500 truncate">admin@example.com</p>
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3 px-4 border-2 hover:border-gray-400 hover:bg-white"
              onClick={() => handleQuickLogin('public')}
              disabled={loading}
            >
              <div className="flex items-start gap-3 w-full">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-primary text-sm">
                    {t('auth.login.public')}
                  </p>
                  <p className="text-xs text-gray-500 truncate">public@example.com</p>
                </div>
              </div>
            </Button>
          </div>
        </div>

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

        {/* Test Accounts Details Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowTestAccounts(!showTestAccounts)}
            className="text-sm text-gray-600 hover:text-primary transition-colors"
          >
            {showTestAccounts ? '-' : '+'} {t('auth.login.testAccountsHelp')}
          </button>
        </div>

        {/* Test Accounts List */}
        {showTestAccounts && (
          <div className="mt-6 bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">
              {t('auth.login.testMode')}
            </h3>
            
            {/* Complete Accounts */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {t('auth.login.completeAccountsTitle')}
              </h4>
              <div className="space-y-2">
                {(() => {
                  const testAccounts = getTestAccounts();
                  return testAccounts.complete.map((account) => (
                    <div key={account.email} className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-primary">{account.email}</p>
                          <p className="text-xs text-gray-600 mt-1">Password: {account.password}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {account.accountType === 'organization' 
                              ? t('auth.signup.typeOrganization') 
                              : account.accountType === 'expert'
                              ? t('auth.signup.typeExpert')
                              : account.accountType === 'admin'
                              ? t('auth.login.loginAsAdmin')
                              : t('auth.login.loginAsPublic')} � {account.planType}
                          </p>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {t('auth.login.statusComplete')}
                        </span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Incomplete Accounts */}
            <div>
              <h4 className="text-sm font-semibold text-orange-600 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t('auth.login.incompleteAccountsTitle')}
              </h4>
              <div className="space-y-2">
                {(() => {
                  const testAccounts = getTestAccounts();
                  return testAccounts.incomplete.map((account) => (
                    <div key={account.email} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-primary">{account.email}</p>
                          <p className="text-xs text-gray-600 mt-1">Password: {account.password}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {account.accountType === 'organization' 
                              ? t('auth.signup.typeOrganization') 
                              : account.accountType === 'expert'
                              ? t('auth.signup.typeExpert')
                              : account.accountType === 'admin'
                              ? t('auth.login.loginAsAdmin')
                              : t('auth.login.loginAsPublic')} � 
                            {account.planType ? account.planType : t('common.notSet', 'Not set')}
                          </p>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          {t('auth.login.statusIncomplete', { step: account.currentStep })}
                        </span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
