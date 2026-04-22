import React from 'react';
import { LucideIcon, ChevronRight, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from '../contexts/LanguageContext';
import { Badge } from './ui/badge';
import { TenderStatusEnum, SectorEnum } from '../types/tender.dto';

interface MetricItem {
  labelKey: string;
  value: string | number;
  trend?: number; // Percentage change
  highlight?: boolean;
  status?: TenderStatusEnum;
}

interface TenderMetricsCardProps {
  titleKey: string;
  descriptionKey: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  metrics: MetricItem[];
  link?: string;
  badge?: string | number;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessageKey?: string;
  alertMessageKey?: string;
  showAlert?: boolean;
}

export function TenderMetricsCard({
  titleKey,
  descriptionKey,
  icon: Icon,
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-blue-500',
  metrics,
  link,
  badge,
  badgeVariant = 'default',
  isLoading = false,
  isEmpty = false,
  emptyMessageKey = 'common.noData',
  alertMessageKey,
  showAlert = false,
}: TenderMetricsCardProps) {
  const { t } = useTranslation();

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className={`${iconBgColor} p-3 rounded-lg w-12 h-12`} />
          <div className="h-6 w-12 bg-gray-200 rounded" />
        </div>
        <div className="h-6 bg-gray-200 rounded mb-2 w-3/4" />
        <div className="h-4 bg-gray-200 rounded mb-4 w-full" />
        <div className="space-y-3 pt-4 border-t">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-6 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (isEmpty || metrics.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`${iconBgColor} ${iconColor} p-3 rounded-lg opacity-50`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <h3 className="font-semibold text-lg text-primary mb-2">{t(titleKey)}</h3>
        <p className="text-sm text-gray-500">{t(emptyMessageKey)}</p>
      </div>
    );
  }

  const Content = (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`${iconBgColor} ${iconColor} p-3 rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>
        {badge !== undefined && badge !== null && (
          <Badge variant={badgeVariant} className="font-semibold">
            {badge}
          </Badge>
        )}
      </div>
      
      {/* Title & Description */}
      <h3 className="font-semibold text-lg text-primary mb-2 line-clamp-2">
        {t(titleKey)}
      </h3>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {t(descriptionKey)}
      </p>
      
      {/* Alert Message */}
      {showAlert && alertMessageKey && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-orange-50 border border-orange-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-orange-600 shrink-0" />
          <p className="text-xs text-orange-700 font-medium">{t(alertMessageKey)}</p>
        </div>
      )}
      
      {/* Metrics */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`flex items-center justify-between ${
              metric.highlight ? 'bg-blue-50/50 -mx-2 px-2 py-1 rounded' : ''
            }`}
          >
            <span className="text-sm text-gray-600">{t(metric.labelKey)}</span>
            <div className="flex items-center gap-2">
              <span className={`font-semibold tabular-nums ${
                metric.highlight ? 'text-blue-600 text-base' : 'text-primary'
              }`}>
                {metric.value}
              </span>
              {metric.trend !== undefined && metric.trend !== 0 && (
                <span className={`flex items-center text-xs font-medium ${
                  metric.trend > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.trend > 0 ? (
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                  )}
                  {Math.abs(metric.trend)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Link */}
      {link && (
        <div className="flex items-center text-sm text-accent font-medium mt-4 pt-4 border-t border-gray-100 group-hover:gap-2 transition-all">
          {t('actions.viewDetails')}
          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      )}
    </>
  );

  if (link) {
    return (
      <Link
        to={link}
        className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-accent/30 transition-all group h-full"
      >
        {Content}
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow h-full">
      {Content}
    </div>
  );
}