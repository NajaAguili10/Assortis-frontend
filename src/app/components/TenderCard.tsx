import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { StatusBadge } from './StatusBadge';
import { TenderListDTO } from '../types/tender';
import { useTranslation } from '../contexts/LanguageContext';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Eye,
  TrendingUp,
  AlertCircle,
  Building2,
  Clock,
  Plus,
  Check,
  FileText,
} from 'lucide-react';

interface TenderCardProps {
  tender: TenderListDTO;
  onViewDetails?: (tenderId: string) => void;
  onAddToPipeline?: (tenderId: string) => void;
  onViewToR?: (torId: string) => void;
  isInPipeline?: boolean;
  showMatchScore?: boolean;
  onTenderClick?: (tenderId: string) => void;
}

export function TenderCard({ 
  tender, 
  onViewDetails,
  onAddToPipeline,
  onViewToR,
  isInPipeline = false,
  showMatchScore = false,
  onTenderClick,
}: TenderCardProps) {
  const { t } = useTranslation();

  // Deadline urgency check
  const isUrgent = tender.daysRemaining <= 7;
  const isToday = tender.daysRemaining === 0;
  
  // Get deadline display text
  const getDeadlineDisplay = () => {
    if (isToday) {
      return t('tenders.detail.deadline.today');
    }
    return t('tenders.detail.deadline.days', { days: tender.daysRemaining.toString() });
  };

  // Format published date
  const formatDate = (date?: Date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card 
      className="p-5 hover:shadow-md transition-all border-l-4 border-l-transparent hover:border-l-accent"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <StatusBadge status={tender.status} />
            {showMatchScore && tender.matchScore && tender.matchScore >= 70 && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                {tender.matchScore}% {t('tenders.detail.matchScore')}
              </Badge>
            )}
            {isUrgent && (
              <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
                <AlertCircle className="w-3 h-3 mr-1" />
                {t('tenders.detail.deadline.urgent')}
              </Badge>
            )}
          </div>
          <h3 className="text-lg font-semibold text-primary line-clamp-2 mb-1">
            {tender.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {tender.referenceNumber}
          </p>
        </div>
      </div>

      {/* Description */}
      {tender.description && (
        <div className="mb-3">
          <p className="text-sm text-gray-600 line-clamp-2">
            {tender.description}
          </p>
        </div>
      )}

      {/* Sectors */}
      {tender.sectors && tender.sectors.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {tender.sectors.slice(0, 3).map((sector) => (
            <Badge 
              key={sector} 
              variant="outline"
              className="text-xs"
            >
              {t(`sectors.${sector}`)}
            </Badge>
          ))}
          {tender.sectors.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{tender.sectors.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Metadata Grid - 2 Rows x 3 Columns */}
      <div className="space-y-2 mb-4">
        {/* First Row: Location, Donor, Budget */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          {/* Location */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-gray-500">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="text-xs font-medium">{t('tenders.card.location')}</span>
            </div>
            <span className="text-xs text-gray-900 font-semibold truncate">
              {t(`countries.${tender.country}`)}
            </span>
          </div>

          {/* Donor */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-gray-500">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="text-xs font-medium">{t('tenders.card.donor')}</span>
            </div>
            <span className="text-xs text-gray-900 font-semibold truncate">
              {tender.fundingAgency ? t(`fundingAgencies.${tender.fundingAgency}`) : tender.organizationName}
            </span>
          </div>

          {/* Budget */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-gray-500">
              <DollarSign className="w-3.5 h-3.5 shrink-0" />
              <span className="text-xs font-medium">{t('tenders.card.budget')}</span>
            </div>
            <span className="text-xs text-gray-900 font-bold truncate">
              {tender.budget.formatted}
            </span>
          </div>
        </div>

        {/* Second Row: Published, Deadline */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          {/* Published */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span className="text-xs font-medium">{t('tenders.card.published')}</span>
            </div>
            <span className="text-xs text-gray-900 font-semibold">
              {formatDate(tender.publishedDate)}
            </span>
          </div>

          {/* Deadline */}
          <div className="flex flex-col gap-1 col-span-2">
            <div className="flex items-center gap-1 text-gray-500">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span className="text-xs font-medium">{t('tenders.card.deadline')}</span>
            </div>
            <span 
              className={`text-xs font-bold ${
                isUrgent ? 'text-orange-600' : 'text-gray-900'
              }`}
            >
              {getDeadlineDisplay()}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t">
        <Button
          type="button"
          variant="default"
          size="sm"
          className="flex-1 relative z-50"
          onClick={() => {
            if (onViewDetails) {
              onViewDetails(tender.id);
            }
          }}
        >
          <Eye className="w-4 h-4 mr-2" />
          {t('actions.viewDetails')}
        </Button>
        {tender.torId && onViewToR && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 relative z-50 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all"
            onClick={() => {
              if (onViewToR && tender.torId) {
                onViewToR(tender.torId);
              }
            }}
          >
            <FileText className="w-4 h-4 mr-2" />
            {t('tenders.actions.viewTOR')}
          </Button>
        )}
        {onAddToPipeline && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 relative z-50 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all"
            onClick={() => {
              if (onAddToPipeline) {
                onAddToPipeline(tender.id);
              }
            }}
          >
            {isInPipeline ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            {t('tenders.actions.addToPipeline')}
          </Button>
        )}
      </div>
    </Card>
  );
}