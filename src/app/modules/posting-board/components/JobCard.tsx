import React from 'react';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { JobOfferListDTO, JobOfferTypeEnum, JobOfferStatusEnum } from '../types/JobOffer.dto';
import { useLanguage } from '../../../contexts/LanguageContext';
import { 
  Calendar, 
  MapPin, 
  Clock,
  Briefcase,
  Building2,
  Eye,
  Users,
  AlertCircle,
  Mail,
} from 'lucide-react';

interface JobCardProps {
  job: JobOfferListDTO;
  onViewDetails?: (jobId: string) => void;
  onContact?: (jobId: string) => void;
  showActions?: boolean;
}

export function JobCard({ 
  job, 
  onViewDetails,
  onContact,
  showActions = false,
}: JobCardProps) {
  const { t, language } = useLanguage();

  // Deadline urgency check
  const isUrgent = job.daysRemaining <= 7 && job.daysRemaining >= 0;
  const isExpired = job.daysRemaining < 0;
  
  // Get deadline display text
  const getDeadlineDisplay = () => {
    if (job.daysRemaining === 0) {
      return t('monEspace.deadline.today');
    }
    if (job.daysRemaining < 0) {
      return t('monEspace.deadline.expired');
    }
    if (job.daysRemaining === 1) {
      return t('monEspace.deadline.tomorrow');
    }
    return `${job.daysRemaining} ${t('monEspace.deadline.daysLeft')}`;
  };

  // Format date display with proper locale
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const localeMap: Record<string, string> = { 
      en: 'en-GB', 
      fr: 'fr-FR', 
      es: 'es-ES' 
    };
    return date.toLocaleDateString(localeMap[language] || 'en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Get status color
  const getStatusColor = () => {
    switch (job.status) {
      case JobOfferStatusEnum.PUBLISHED:
        return 'bg-green-50 text-green-700 border-green-200';
      case JobOfferStatusEnum.DRAFT:
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case JobOfferStatusEnum.CLOSED:
        return 'bg-red-50 text-red-700 border-red-200';
      case JobOfferStatusEnum.CANCELLED:
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border hover:shadow-md transition-shadow flex flex-col">
      {/* Header Section - Fixed Height */}
      <div className="p-5 pb-0">
        <div className="flex items-center gap-2 mb-3 flex-wrap min-h-[28px]">
          <Badge variant="outline" className={`text-xs ${getStatusColor()}`}>
            {t(`monEspace.status.${job.status.toLowerCase()}`)}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {job.type === JobOfferTypeEnum.PROJECT 
              ? t('monEspace.type.project') 
              : t('monEspace.type.internal')}
          </Badge>
          {isUrgent && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
              <AlertCircle className="w-3 h-3 mr-1" />
              {getDeadlineDisplay()}
            </Badge>
          )}
          {isExpired && (
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
              {t('monEspace.deadline.expired')}
            </Badge>
          )}
        </div>
      </div>

      {/* Title & Description - Fixed Height */}
      <div className="px-5 pb-3">
        <h3 className="font-semibold text-primary mb-2 line-clamp-2 min-h-[48px]">{job.jobTitle}</h3>
        {job.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">{job.description}</p>
        )}
      </div>

      {/* Organization/Project Info */}
      {(job.organizationName || job.projectTitle) && (
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {job.type === JobOfferTypeEnum.PROJECT ? (
              <Briefcase className="w-4 h-4 flex-shrink-0" />
            ) : (
              <Building2 className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="truncate">
              {job.type === JobOfferTypeEnum.PROJECT && job.projectTitle
                ? job.projectTitle
                : job.organizationName}
            </span>
          </div>
        </div>
      )}

      {/* Job Info Grid - Uniform Layout */}
      <div className="px-5 pb-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{job.duration}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{formatDate(job.publishedAt)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="truncate font-medium">{formatDate(job.deadline)}</span>
          </div>
        </div>
      </div>

      {/* Department Info for Internal Jobs - Fixed Height Zone */}
      <div className="px-5 pb-3">
        {job.type === JobOfferTypeEnum.INTERNAL && job.department ? (
          <div className="bg-blue-50 rounded-md p-3 border border-blue-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-700" />
              <span className="text-sm font-medium text-blue-900">
                {job.department}
              </span>
            </div>
          </div>
        ) : (
          <div className="h-[48px]"></div>
        )}
      </div>

      {/* Spacer to push bottom content down */}
      <div className="flex-1"></div>

      {/* Bottom Section - Action Buttons */}
      <div className="px-5 pb-4">
        <div className="pt-3 border-t">
          {showActions ? (
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails && onViewDetails(job.id);
                }}
                className="flex items-center justify-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                {t('monEspace.action.view')}
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onContact && onContact(job.id);
                }}
                className="flex items-center justify-center bg-[#B82547] hover:bg-[#a01f3c] text-white"
              >
                <Mail className="w-4 h-4 mr-2" />
                {t('monEspace.action.contact')}
              </Button>
            </div>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              className="w-full bg-[#B82547] hover:bg-[#a01f3c] text-white"
              onClick={() => onViewDetails && onViewDetails(job.id)}
            >
              {t('monEspace.action.view')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}