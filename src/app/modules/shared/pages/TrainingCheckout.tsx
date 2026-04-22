import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useTrainingCommerce } from '@app/contexts/TrainingCommerceContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { Button } from '@app/components/ui/button';
import { Checkbox } from '@app/components/ui/checkbox';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { CreditCard, Lock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function TrainingCheckout() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { cartItems, cartTotal, completeCheckout } = useTrainingCommerce();
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleConfirm = () => {
    if (!termsAccepted || !cardName || !cardNumber || !expiry || !cvc) {
      toast.error(t('training.checkout.validation'));
      return;
    }

    const result = completeCheckout();
    navigate('/training/checkout/confirmation', {
      state: result,
    });
  };

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('training.checkout.title')}
        description={t('training.checkout.subtitle')}
        icon={CreditCard}
      />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-primary">{t('training.checkout.payment')}</h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardName">{t('offers.payment.cardName')}</Label>
                <Input id="cardName" value={cardName} onChange={(e) => setCardName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">{t('offers.payment.cardNumber')}</Label>
                <Input id="cardNumber" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4242 4242 4242 4242" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">{t('offers.payment.cardExpiry')}</Label>
                  <Input id="expiry" value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">{t('offers.payment.cardCvc')}</Label>
                  <Input id="cvc" value={cvc} onChange={(e) => setCvc(e.target.value)} placeholder="123" />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} />
                <Label htmlFor="terms" className="text-sm text-muted-foreground">{t('offers.payment.terms')}</Label>
              </div>

              <Button className="w-full bg-[#B82547] hover:bg-[#a01f3c] text-white" onClick={handleConfirm}>
                {t('training.checkout.confirm')}
              </Button>
            </div>

            <div className="bg-white rounded-lg border p-6 h-fit">
              <h3 className="text-lg font-semibold text-primary mb-4">{t('training.checkout.orderSummary')}</h3>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.courseId} className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <p className="font-medium text-primary">{item.title}</p>
                      <p className="text-muted-foreground">{item.duration}h</p>
                    </div>
                    <p className="font-semibold text-primary">${item.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4 flex items-center justify-between">
                <span className="font-medium text-primary">{t('offers.payment.total')}</span>
                <span className="text-2xl font-bold text-primary">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
