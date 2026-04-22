import React from 'react';
import { TenderStatusEnum } from '../types/tender.dto';
import { Badge } from './ui/badge';
import { useTranslation } from '../contexts/LanguageContext';

interface StatusBadgeProps {
  status: TenderStatusEnum;
  className?: string;
}

const statusConfig = {
  [TenderStatusEnum.DRAFT]: {
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: '📝'
  },
  [TenderStatusEnum.PUBLISHED]: {
    variant: 'default' as const,
    className: 'bg-green-100 text-green-700 border-green-200',
    icon: '✅'
  },
  [TenderStatusEnum.CLOSED]: {
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: '🔒'
  },
  [TenderStatusEnum.AWARDED]: {
    variant: 'default' as const,
    className: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: '🏆'
  },
  [TenderStatusEnum.CANCELLED]: {
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-700 border-red-200',
    icon: '❌'
  },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const { t } = useTranslation();
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${className} font-semibold border`}
    >
      <span className="mr-1">{config.icon}</span>
      {t(`tenders.status.${status.toLowerCase()}`)}
    </Badge>
  );
}