import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useTranslation } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Mail, RefreshCw, Check, CheckCircle2, AlertCircle } from 'lucide-react';

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
}

export function EmailVerification({ email, onVerified }: EmailVerificationProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [canResend, setCanResend] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Simulated verification code (in production, this would be sent via email)
  const VERIFICATION_CODE = '123456';

  useEffect(() => {
    // Send email on component mount
    sendVerificationEmail();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, canResend]);

  const sendVerificationEmail = async () => {
    setIsResending(true);
    
    try {
      // Real API call to send verification email
      await authService.sendVerification(email);
      
      setEmailSent(true);
      setTimeLeft(120);
      setCanResend(false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || t('verification.error.sendFailed') || 'Failed to send verification email');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    setError('');
    
    if (!code) {
      setError(t('verification.error.enterCode') || 'Please enter the verification code');
      return;
    }

    if (code.length !== 6) {
      setError(t('verification.error.invalidLength') || 'Verification code must be 6 digits');
      return;
    }

    setIsVerifying(true);

    try {
      // Real verification API call
      await authService.verifyEmail(email, code);
      
      setShowSuccess(true);
      // Short delay to show success message before calling onVerified
      setTimeout(() => {
        onVerified();
      }, 800);
    } catch (err: any) {
      setError(err.response?.data?.message || t('verification.error.invalid') || 'Invalid verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Success Animation Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 animate-in zoom-in duration-300">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-500">
                <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-2">
                {t('auth.signup.emailVerified')}
              </h3>
              <p className="text-gray-600">
                {t('auth.signup.proceedToPayment')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300">
          <Mail className="h-8 w-8 text-accent" />
        </div>
        <h3 className="text-xl font-bold text-primary mb-2">
          {t('verification.title')}
        </h3>
        <p className="text-gray-600">
          {t('verification.subtitle')}
        </p>
      </div>

      {/* Email Display */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">
              {t('verification.sentTo')}
            </p>
            <p className="font-medium text-primary">
              {email}
            </p>
          </div>
          {emailSent && (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-4 w-4" />
              <span className="text-xs font-semibold">
                {t('verification.sent')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Info Box (Test Mode) - Commented out for real verification
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs text-blue-800 mb-2 font-semibold">
          {t('verification.testMode')}
        </p>
        <p className="text-xs text-blue-700">
          {t('verification.testCode')}: <span className="font-mono font-bold">123456</span>
        </p>
      </div>
      */}

      {/* Code Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          {t('verification.codeLabel')}
        </label>
        <Input
          type="text"
          placeholder="000000"
          value={code}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
            setCode(val);
            setError('');
          }}
          maxLength={6}
          className="text-center text-2xl tracking-widest font-mono"
          disabled={isVerifying}
        />
        <p className="text-xs text-gray-500 text-center">
          {t('verification.codeHint')}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Verify Button */}
      <Button
        type="button"
        onClick={handleVerify}
        disabled={isVerifying || code.length !== 6}
        className="w-full h-12 text-base font-semibold"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {isVerifying ? (
          <span className="flex items-center gap-2">
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {t('verification.verifying')}
          </span>
        ) : (
          <>
            <Check className="w-4 h-4 mr-2" />
            {t('verification.verify')}
          </>
        )}
      </Button>

      {/* Resend Code */}
      <div className="text-center pt-4 border-t border-gray-200">
        {!canResend ? (
          <p className="text-sm text-gray-600">
            {t('verification.resendIn')}{' '}
            <span className="font-mono font-semibold text-primary">
              {formatTime(timeLeft)}
            </span>
          </p>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={sendVerificationEmail}
            disabled={isResending}
            className="min-w-[160px]"
          >
            {isResending ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                {t('verification.sending')}
              </span>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('verification.resend')}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-xs text-gray-600">
          {t('verification.helpText')}
        </p>
      </div>
    </div>
  );
}