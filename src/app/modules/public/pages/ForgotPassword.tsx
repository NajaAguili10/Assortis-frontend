import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card';
import { Alert, AlertDescription } from '@app/components/ui/alert';
import { KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await forgotPassword(email);
      
      // Mock: Always show success for UX (security best practice - don't reveal if email exists)
      setSuccess(true);
    } catch (err: any) {
      setError(t('auth.forgot.errorMessage'));
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
              {t('auth.forgot.successTitle')}
            </h1>
            <p className="text-gray-600">
              {t('auth.forgot.successMessage')}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
            <Link to="/login">
              <Button 
                className="w-full"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('auth.forgot.backToLogin')}
              </Button>
            </Link>
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
            {t('auth.forgot.title')}
          </h1>
          <p className="text-gray-600">
            {t('auth.forgot.subtitle')}
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
              <Label htmlFor="email">{t('auth.forgot.email')} *</Label>
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

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {loading ? t('common.loading') : t('auth.forgot.submit')}
            </Button>

            <div className="text-center pt-4 border-t border-gray-200">
              <Link 
                to="/login" 
                className="text-sm inline-flex items-center gap-2 hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                <ArrowLeft className="w-4 h-4" />
                {t('auth.forgot.backToLogin')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;