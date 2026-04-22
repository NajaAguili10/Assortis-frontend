import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card';
import { Alert, AlertDescription } from '@app/components/ui/alert';
import { KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Check if token is valid
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
        <div className="w-full max-w-3xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              {t('auth.reset.invalidToken')}
            </h1>
          </div>

          {/* Card */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
            <Link to="/forgot-password">
              <Button 
                className="w-full"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {t('auth.forgot.title')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError(t('auth.reset.passwordMismatch'));
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError(t('auth.reset.passwordHint'));
      return;
    }

    setLoading(true);

    try {
      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t('auth.forgot.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
        <div className="w-full max-w-3xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#22c55e' }}
              >
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              {t('auth.reset.successTitle')}
            </h1>
            <p className="text-gray-600">
              {t('auth.reset.successMessage')}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
            <Button 
              className="w-full"
              onClick={() => navigate('/login')}
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {t('auth.reset.goToLogin')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-3xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <KeyRound className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            {t('auth.reset.title')}
          </h1>
          <p className="text-gray-600">
            {t('auth.reset.subtitle')}
          </p>
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
              <Label htmlFor="newPassword">{t('auth.reset.newPassword')} *</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                placeholder={t('auth.reset.newPassword')}
              />
              <p className="text-xs text-gray-500">{t('auth.reset.passwordHint')}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('auth.reset.confirmPassword')} *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                placeholder={t('auth.reset.confirmPassword')}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {loading ? t('common.loading') : t('auth.reset.submit')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;