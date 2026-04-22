import React from 'react';
import { TenderListDTO } from '../types/tender.dto';
import { useTranslation } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { StatusBadge } from './StatusBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import {
  Calendar,
  MapPin,
  DollarSign,
  Users,
  FileText,
  Building2,
  Globe,
  TrendingUp,
  AlertCircle,
  Eye,
  ListPlus,
  Bookmark,
  BookmarkCheck,
  X,
} from 'lucide-react';

interface TenderDetailsDialogProps {
  tender: TenderListDTO | null;
  open: boolean;
  onClose: () => void;
  onAddToPipeline?: (tenderId: string) => void;
  onSave?: (tenderId: string) => void;
  isSaved?: boolean;
  isInPipeline?: boolean;
}

const countryFlags: Record<string, string> = {
  FR: '🇫🇷',
  DE: '🇩🇪',
  GB: '🇬🇧',
  US: '🇺🇸',
  CA: '🇨🇦',
  KE: '🇰🇪',
  TZ: '🇹🇿',
  SN: '🇸🇳',
  CI: '🇨🇮',
  MA: '🇲🇦',
};

export function TenderDetailsDialog({
  tender,
  open,
  onClose,
  onAddToPipeline,
  onSave,
  isSaved = false,
  isInPipeline = false,
}: TenderDetailsDialogProps) {
  const { t } = useTranslation();

  if (!tender) return null;

  const isUrgent = tender.daysRemaining <= 7;
  const isToday = tender.daysRemaining === 0;

  const getDeadlineDisplay = () => {
    if (isToday) {
      return t('tenders.detail.deadline.today');
    }
    return t('tenders.detail.deadline.days', { days: tender.daysRemaining.toString() });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-start justify-between pr-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <StatusBadge status={tender.status} />
                {tender.matchScore && tender.matchScore >= 70 && (
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
                {isSaved && (
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                    <BookmarkCheck className="w-3 h-3 mr-1" />
                    {t('tenders.status.saved')}
                  </Badge>
                )}
                {isInPipeline && (
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                    <ListPlus className="w-3 h-3 mr-1" />
                    {t('tenders.status.inPipeline')}
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-2xl mb-2">{tender.title}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {tender.referenceNumber}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-6 py-4">
          {/* Organization Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('tenders.detail.organization')}</p>
                <p className="font-semibold text-primary">{tender.organizationName}</p>
              </div>
            </div>
          </div>

          {/* Key Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t('tenders.detail.location')}
                </p>
                <p className="font-semibold text-primary">
                  {countryFlags[tender.country] || '🌍'} {tender.country}
                </p>
              </div>
            </div>

            {/* Budget */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t('tenders.detail.budget')}
                </p>
                <p className="font-semibold text-primary">{tender.budget.formatted}</p>
                <p className="text-xs text-muted-foreground">{tender.budget.currency}</p>
              </div>
            </div>

            {/* Deadline */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className={`w-5 h-5 mt-0.5 ${isUrgent ? 'text-orange-600' : 'text-purple-600'}`} />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t('tenders.detail.deadline')}
                </p>
                <p className={`font-semibold ${isUrgent ? 'text-orange-600' : 'text-primary'}`}>
                  {getDeadlineDisplay()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(tender.deadline).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Published Date */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t('tenders.detail.published')}
                </p>
                <p className="font-semibold text-primary">
                  {new Date(tender.publishedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Sectors */}
          {tender.sectors && tender.sectors.length > 0 && (
            <div>
              <h4 className="font-semibold text-primary mb-3">{t('tenders.detail.sectors')}</h4>
              <div className="flex flex-wrap gap-2">
                {tender.sectors.map((sector) => (
                  <Badge key={sector} variant="outline" className="text-sm">
                    {t(`sectors.${sector}`)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {tender.description && (
            <div>
              <h4 className="font-semibold text-primary mb-3">{t('tenders.detail.description')}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{tender.description}</p>
            </div>
          )}

          {/* Eligibility */}
          {tender.eligibility && tender.eligibility.length > 0 && (
            <div>
              <h4 className="font-semibold text-primary mb-3">{t('tenders.detail.eligibility')}</h4>
              <div className="flex flex-wrap gap-2">
                {tender.eligibility.map((item, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {tender.documents && tender.documents.length > 0 && (
            <div>
              <h4 className="font-semibold text-primary mb-3">{t('tenders.detail.documents')}</h4>
              <div className="space-y-2">
                {tender.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:border-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-primary">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.type}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      {t('tenders.actions.download')}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Info */}
          {tender.contactEmail && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-2">{t('tenders.detail.contact')}</h4>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">{t('common.email')}:</span> {tender.contactEmail}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="gap-2 sm:gap-2">
          {onSave && (
            <Button
              variant="outline"
              onClick={() => onSave(tender.id)}
              className="gap-2"
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  {t('tenders.actions.saved')}
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  {t('tenders.actions.save')}
                </>
              )}
            </Button>
          )}
          {onAddToPipeline && (
            <Button
              onClick={() => {
                onAddToPipeline(tender.id);
                onClose();
              }}
              className="gap-2"
              disabled={isInPipeline}
            >
              <ListPlus className="w-4 h-4" />
              {isInPipeline ? t('tenders.actions.inPipeline') : t('tenders.actions.addToPipeline')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}