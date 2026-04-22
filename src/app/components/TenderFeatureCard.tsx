import React from 'react';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from '../contexts/LanguageContext';
import { Badge } from './ui/badge';

interface TenderFeatureCardProps {
  titleKey: string;
  descriptionKey: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  stats?: Array<{ labelKey: string; value: string | number }>;
  link?: string;
  badge?: string | number;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessageKey?: string;
  // Support pour texte direct (sans traduction)
  useDirect?: boolean;
}

export function TenderFeatureCard({
  titleKey,
  descriptionKey,
  icon: Icon,
  iconBgColor = 'bg-accent/10',
  iconColor = 'text-accent',
  stats,
  link,
  badge,
  badgeVariant = 'default',
  isLoading = false,
  isEmpty = false,
  emptyMessageKey = 'common.noData',
  useDirect = false,
}: TenderFeatureCardProps) {
  const { t } = useTranslation();

  // Fonction pour obtenir le texte (direct ou traduit)
  const getText = (key: string) => useDirect ? key : t(key);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className={`${iconBgColor} p-3 rounded-lg inline-flex mb-4 w-12 h-12`} />
        <div className="h-6 bg-gray-200 rounded mb-2 w-3/4" />
        <div className="h-4 bg-gray-200 rounded mb-4 w-full" />
        {stats && stats.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {stats.map((_, index) => (
              <div key={index}>
                <div className="h-8 bg-gray-200 rounded mb-1 w-16" />
                <div className="h-3 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <div className={`${iconBgColor} ${iconColor} p-3 rounded-lg inline-flex mb-4 opacity-50`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-lg text-primary mb-2">{getText(titleKey)}</h3>
        <p className="text-sm text-gray-500">{getText(emptyMessageKey)}</p>
      </div>
    );
  }

  const Content = (
    <>
      <div className="relative">
        <div className={`${iconBgColor} ${iconColor} p-3 rounded-lg inline-flex mb-4`}>
          <Icon className="w-6 h-6" />
        </div>
        {badge !== undefined && badge !== null && (
          <div className="absolute top-0 right-0">
            <Badge variant={badgeVariant} className="font-semibold">
              {badge}
            </Badge>
          </div>
        )}
      </div>
      
      <h3 className="font-semibold text-lg text-primary mb-2 line-clamp-2">
        {getText(titleKey)}
      </h3>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {getText(descriptionKey)}
      </p>
      
      {stats && stats.length > 0 && (
        <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-100">
          {stats.map((stat, index) => (
            <div key={index} className="flex-1 text-center first:text-left last:text-right">
              <p className="text-2xl font-bold text-primary tabular-nums">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{getText(stat.labelKey)}</p>
            </div>
          ))}
        </div>
      )}
      
      {link && (
        <div className="flex items-center text-sm text-accent font-medium group-hover:gap-2 transition-all">
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