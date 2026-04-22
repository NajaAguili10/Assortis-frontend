import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { PromoCodeData } from '../types/promo';
import { validatePromoCode } from '../services/promoService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Gift, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';

interface PromoCodeSectionProps {
  onPromoCodeValidated: (promoData: PromoCodeData | null) => void;
  appliedPromo: PromoCodeData | null;
  onPromoOptionToggled?: (hasChosen: boolean) => void;
}

export function PromoCodeSection({ onPromoCodeValidated, appliedPromo, onPromoOptionToggled }: PromoCodeSectionProps) {
  const { t } = useLanguage();
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string>('');

  const handleValidateCode = async () => {
    if (!promoCode.trim()) {
      setError(t('offers.error.required'));
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const result = await validatePromoCode(promoCode);

      if (!result) {
        setError(t('offers.become.codeInvalid'));
        setIsValidating(false);
        return;
      }

      if (result.isUsed) {
        setError(t('offers.become.codeAlreadyUsed'));
        setIsValidating(false);
        return;
      }

      if (!result.isValid) {
        setError(t('offers.become.codeInvalid'));
        setIsValidating(false);
        return;
      }

      // Success - code is valid
      onPromoCodeValidated(result);
      setShowPromoInput(false);
      setPromoCode('');
      setError('');
    } catch (err) {
      setError(t('offers.become.codeInvalid'));
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemovePromo = () => {
    onPromoCodeValidated(null);
    setPromoCode('');
    setError('');
    setShowPromoInput(false);
    if (onPromoOptionToggled) {
      onPromoOptionToggled(false);
    }
  };

  if (appliedPromo && appliedPromo.isValid) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="bg-green-600 rounded-full p-2">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-green-900 mb-2">
                {t('offers.become.codeValid')}
              </h4>
              <p className="text-sm text-green-800 mb-4">
                {t('auth.signup.promoDirectPayment')}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemovePromo}
            className="text-green-700 hover:text-green-900 transition-colors"
            title={t('offers.become.removePromo')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Organization Information */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h5 className="font-semibold text-primary mb-3 text-sm">
            {t('auth.signup.promoOrgInfo')}
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600 mb-1">{t('offers.form.org.name')}</p>
              <p className="font-semibold text-primary">{appliedPromo.organizationData?.orgName}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">{t('offers.form.org.email')}</p>
              <p className="font-semibold text-primary">{appliedPromo.organizationData?.orgEmail}</p>
            </div>
            {appliedPromo.organizationData?.orgPhone && (
              <div>
                <p className="text-gray-600 mb-1">{t('offers.form.org.phone')}</p>
                <p className="font-semibold text-primary">{appliedPromo.organizationData.orgPhone}</p>
              </div>
            )}
            {appliedPromo.organizationData?.orgCountry && (
              <div>
                <p className="text-gray-600 mb-1">{t('offers.form.org.country')}</p>
                <p className="font-semibold text-primary">{appliedPromo.organizationData.orgCountry}</p>
              </div>
            )}
            {appliedPromo.organizationData?.contactPersonName && (
              <div>
                <p className="text-gray-600 mb-1">{t('offers.form.org.contactPerson')}</p>
                <p className="font-semibold text-primary">{appliedPromo.organizationData.contactPersonName}</p>
              </div>
            )}
            {appliedPromo.organizationData?.contactPersonPosition && (
              <div>
                <p className="text-gray-600 mb-1">{t('offers.form.org.position')}</p>
                <p className="font-semibold text-primary">{appliedPromo.organizationData.contactPersonPosition}</p>
              </div>
            )}
          </div>
        </div>

        {/* Discount Information */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100 mb-1">{t('offers.become.promoDiscount')}</p>
              <p className="text-3xl font-bold">{appliedPromo.discountPercent}%</p>
            </div>
            {appliedPromo.validUntil && (
              <div className="text-right">
                <p className="text-xs text-green-100">{t('offers.become.promoValid', { date: appliedPromo.validUntil })}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!showPromoInput) {
    return (
      <button
        onClick={() => {
          setShowPromoInput(true);
          if (onPromoOptionToggled) {
            onPromoOptionToggled(true);
          }
        }}
        className="w-full mb-6 p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-accent hover:bg-accent/5 transition-all duration-300 group"
      >
        <div className="flex items-center justify-center gap-2 text-gray-600 group-hover:text-accent">
          <Gift className="h-5 w-5" />
          <span className="font-semibold">{t('offers.become.havePromoCode')}</span>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="h-5 w-5 text-accent" />
        <h4 className="font-bold text-primary">{t('offers.become.enterPromoCode')}</h4>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="promoCode" className="text-sm font-medium text-gray-700">
            {t('offers.payment.promoCode')}
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="promoCode"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder={t('offers.become.promoCodePlaceholder')}
              className="flex-1"
              disabled={isValidating}
            />
            <Button
              onClick={handleValidateCode}
              disabled={isValidating || !promoCode.trim()}
              style={{ backgroundColor: 'var(--color-primary)' }}
              className="px-6"
            >
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('offers.become.validating')}
                </>
              ) : (
                t('offers.become.validateCode')
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <button
          onClick={() => {
            setShowPromoInput(false);
            setPromoCode('');
            setError('');
            if (onPromoOptionToggled) {
              onPromoOptionToggled(false);
            }
          }}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          {t('common.cancel')}
        </button>
      </div>
    </div>
  );
}