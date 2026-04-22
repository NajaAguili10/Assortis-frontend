import React, { useState } from 'react';
import { Link } from 'react-router';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { useTranslation } from '../contexts/LanguageContext';
import { CreditCard, Lock, Tag, Check } from 'lucide-react';
import { Input } from './ui/input';

interface StripePaymentFormProps {
  amount: number;
  planName: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  onPaymentComplete?: (completed: boolean) => void;
  appliedPromoCode?: {
    code: string;
    discountPercent: number;
  } | null;
  showPromoCodeOption?: boolean;
}

export function StripePaymentForm({ 
  amount, 
  planName, 
  onSuccess, 
  onError, 
  onPaymentComplete,
  appliedPromoCode,
  showPromoCodeOption = false
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');

  // Promo codes simulation (only used if no promo code was applied at signup)
  const PROMO_CODES: Record<string, { discount: number; type: 'percentage' | 'fixed' }> = {
    'ASSORTIS20': { discount: 20, type: 'percentage' },
    'WELCOME2024': { discount: 15, type: 'percentage' },
    'SAVE10': { discount: 10, type: 'fixed' },
    'FIRST50': { discount: 50, type: 'percentage' },
  };

  const handleApplyPromo = () => {
    setPromoError('');
    
    const upperPromo = promoCode.toUpperCase().trim();
    
    if (!upperPromo) {
      setPromoError(t('payment.promo.enterCode') || 'Please enter a promo code');
      return;
    }

    const promoData = PROMO_CODES[upperPromo];
    
    if (promoData) {
      if (promoData.type === 'percentage') {
        setDiscount((amount * promoData.discount) / 100);
      } else {
        setDiscount(Math.min(promoData.discount, amount));
      }
      setIsPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError(t('payment.promo.invalid') || 'Invalid promo code');
      setIsPromoApplied(false);
      setDiscount(0);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setIsPromoApplied(false);
    setDiscount(0);
    setPromoError('');
  };

  // If a promo code was applied during signup, the amount is already discounted
  // So we don't need to apply another discount here
  const finalAmount = appliedPromoCode ? amount : Math.max(0, amount - discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Simulate payment processing
      // In production, this would call your backend to create a PaymentIntent
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful payment
      onSuccess();
      if (onPaymentComplete) {
        onPaymentComplete(true);
      }
    } catch (err: any) {
      const message = err.message || t('payment.error.generic') || 'Payment failed';
      setErrorMessage(message);
      onError(message);
      if (onPaymentComplete) {
        onPaymentComplete(false);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-primary">
            {t('payment.summary')}
          </h3>
          <div className="flex items-center gap-2 text-gray-500">
            <Lock className="h-4 w-4" />
            <span className="text-xs">{t('payment.secure')}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('payment.plan')}</span>
            <span className="font-medium text-primary">{planName}</span>
          </div>
          
          {discount > 0 && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('payment.subtotal')}</span>
                <span className="text-gray-600 tabular-nums">${amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600">{t('payment.discount')}</span>
                <span className="text-green-600 font-semibold tabular-nums">-${discount}</span>
              </div>
            </>
          )}
          
          <div className="border-t border-gray-200 pt-3 flex justify-between">
            <span className="font-semibold text-primary">{t('payment.total')}</span>
            <span className="font-bold text-xl text-primary tabular-nums">
              ${finalAmount}
              <span className="text-sm text-gray-600 font-normal">
                {finalAmount > 0 ? `/${t('offers.plans.monthly')}` : ''}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Card Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-primary">
            {t('payment.cardInfo')}
          </h3>
        </div>

        {/* Stripe Payment Element Placeholder */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          {/* Card Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t('payment.cardNumber')}
            </label>
            <div className="border border-gray-300 rounded-md p-3 bg-white">
              <input
                type="text"
                placeholder="4242 4242 4242 4242"
                className="w-full outline-none text-sm"
                maxLength={19}
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Expiry Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t('payment.expiryDate')}
              </label>
              <div className="border border-gray-300 rounded-md p-3 bg-white">
                <input
                  type="text"
                  placeholder="MM / YY"
                  className="w-full outline-none text-sm"
                  maxLength={7}
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* CVC */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t('payment.cvc')}
              </label>
              <div className="border border-gray-300 rounded-md p-3 bg-white">
                <input
                  type="text"
                  placeholder="123"
                  className="w-full outline-none text-sm"
                  maxLength={4}
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>

          {/* Cardholder Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t('payment.cardholderName')}
            </label>
            <div className="border border-gray-300 rounded-md p-3 bg-white">
              <input
                type="text"
                placeholder={t('payment.cardholderPlaceholder') || 'John Doe'}
                className="w-full outline-none text-sm"
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>

        {/* Test Card Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-800 mb-2 font-semibold">
            {t('payment.testMode')}
          </p>
          <p className="text-xs text-blue-700">
            {t('payment.testCardInfo')}
          </p>
        </div>
      </div>

      {/* Promo Code */}
      {!appliedPromoCode && showPromoCodeOption && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-primary">
              {t('payment.promoCode')}
            </h3>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t('payment.enterPromo')}
              </label>
              <div className="flex items-center">
                <Input
                  type="text"
                  placeholder="Enter promo code"
                  className="w-full outline-none text-sm"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={isProcessing}
                />
                <Button
                  type="button"
                  onClick={handleApplyPromo}
                  className="ml-2 h-8 text-sm font-semibold"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {t('payment.apply')}
                </Button>
              </div>
            </div>

            {isPromoApplied && (
              <div className="flex items-center gap-2 text-green-500">
                <Check className="h-4 w-4" />
                <span className="text-xs">
                  {t('payment.promo.applied') || 'Promo code applied'}
                </span>
              </div>
            )}

            {promoError && (
              <Alert variant="destructive">
                <AlertDescription>{promoError}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}

      {/* Display Applied Promo Code from Signup */}
      {appliedPromoCode && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 rounded-full p-2">
              <Check className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-1">
                {t('payment.promo.applied') || 'Promo code applied'}
              </h4>
              <p className="text-sm text-green-800">
                {appliedPromoCode.discountPercent}% {t('offers.become.promoDiscount')} - {t('payment.promo.alreadyApplied') || 'The discount has been applied to your total'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Terms and Privacy */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-xs text-gray-600 leading-relaxed">
          {t('payment.terms1')}{' '}
          <Link to="/terms-of-service" className="text-accent hover:underline font-medium" target="_blank">
            {t('payment.termsLink')}
          </Link>{' '}
          {t('payment.terms2')}{' '}
          <Link to="/privacy-policy" className="text-accent hover:underline font-medium" target="_blank">
            {t('payment.privacyLink')}
          </Link>
          .
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full h-12 text-base font-semibold"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {t('payment.processing')}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            {amount > 0 
              ? `${t('payment.payNow')} $${finalAmount}`
              : t('payment.confirmFree')
            }
          </span>
        )}
      </Button>

      {/* Security Badges */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <div className="flex items-center gap-2 text-gray-500">
          <Lock className="h-4 w-4" />
          <span className="text-xs">{t('payment.ssl')}</span>
        </div>
        <div className="text-gray-300">|</div>
        <div className="text-xs text-gray-500">
          {t('payment.poweredByStripe')}
        </div>
      </div>
    </form>
  );
}