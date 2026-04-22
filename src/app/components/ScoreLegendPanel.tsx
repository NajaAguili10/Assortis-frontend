import { Badge } from '@app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import { useLanguage } from '@app/contexts/LanguageContext';
import { Info } from 'lucide-react';

interface ScoreLegendPanelProps {
  className?: string;
}

export function ScoreLegendPanel({ className }: ScoreLegendPanelProps) {
  const { t } = useLanguage();

  const legendItems = [
    { key: 'excellent', range: '10', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { key: 'veryGood', range: '8-9', className: 'bg-green-50 text-green-700 border-green-200' },
    { key: 'good', range: '6-7', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    { key: 'satisfactory', range: '4-5', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    { key: 'unsatisfactory', range: '2-3', className: 'bg-orange-50 text-orange-700 border-orange-200' },
    { key: 'unfairBehavior', range: '1', className: 'bg-red-50 text-red-700 border-red-200' },
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-primary flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-500" />
          {t('projects.scoring.legend.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {legendItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-2 text-sm">
            <Badge variant="outline" className={item.className}>
              {item.range}
            </Badge>
            <span className="text-muted-foreground text-right">
              {t(`projects.scoring.legend.${item.key}`)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
