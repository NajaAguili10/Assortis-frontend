import { Coins } from 'lucide-react';
import { Button } from '@app/components/ui/button';

interface CVCreditsSummaryCardProps {
  label: string;
  value: string;
  buyLabel: string;
  onBuyPack: () => void;
  className?: string;
}

export default function CVCreditsSummaryCard({
  label,
  value,
  buyLabel,
  onBuyPack,
  className,
}: CVCreditsSummaryCardProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className || ''}`.trim()}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Coins className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-lg font-semibold text-primary">{value}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full sm:w-auto" onClick={onBuyPack}>
          {buyLabel}
        </Button>
      </div>
    </div>
  );
}
