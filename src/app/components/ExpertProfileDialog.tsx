import { useTranslation } from '../contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Star,
  Globe,
  Award,
  Calendar,
  DollarSign,
  X,
} from 'lucide-react';
import type { ExpertDTO } from '../types/assistance.dto';

interface ExpertProfileDialogProps {
  open: boolean;
  onClose: () => void;
  expert: ExpertDTO | null;
}

export function ExpertProfileDialog({ open, onClose, expert }: ExpertProfileDialogProps) {
  const { t } = useTranslation();

  if (!expert) return null;

  const getAvailabilityConfig = (availability: string) => {
    switch (availability) {
      case 'AVAILABLE':
        return {
          label: t('assistance.availability.AVAILABLE'),
          className: 'bg-green-50 text-green-700 border-green-200',
        };
      case 'BUSY':
        return {
          label: t('assistance.availability.BUSY'),
          className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        };
      case 'UNAVAILABLE':
        return {
          label: t('assistance.availability.UNAVAILABLE'),
          className: 'bg-red-50 text-red-700 border-red-200',
        };
      default:
        return {
          label: availability,
          className: 'bg-gray-50 text-gray-700 border-gray-200',
        };
    }
  };

  const availabilityConfig = getAvailabilityConfig(expert.availability);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                {expert.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-primary mb-2">
                  {expert.name}
                </DialogTitle>
                <DialogDescription className="text-base text-gray-700 mb-2">
                  {expert.title}
                </DialogDescription>
                <p className="text-sm text-muted-foreground mb-3">{expert.organization}</p>
                <Badge variant="outline" className={availabilityConfig.className}>
                  {availabilityConfig.label}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-6 py-4">
          {/* Bio */}
          <div>
            <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              {t('assistance.expert.bio')}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">{expert.bio}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-bold text-primary">{expert.rating}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t('assistance.expert.rating')}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-2xl font-bold text-primary">{expert.completedAssignments}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t('assistance.expert.completedAssignments')}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-2xl font-bold text-primary">{expert.yearsOfExperience}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t('assistance.expert.yearsExperience')}</p>
            </div>
            {expert.hourlyRate && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-bold text-primary">${expert.hourlyRate}</span>
                </div>
                <p className="text-xs text-muted-foreground">{t('assistance.expert.hourlyRate')}</p>
              </div>
            )}
          </div>

          {/* Expertise */}
          <div>
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              {t('assistance.expert.expertise')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {expert.expertise.map((exp) => (
                <Badge key={exp} variant="secondary" className="text-xs">
                  {t(`assistance.type.${exp}`)}
                </Badge>
              ))}
            </div>
          </div>

          {/* Sectors */}
          <div>
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              {t('assistance.expert.sectors')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {expert.sectors.map((sector) => (
                <Badge key={sector} variant="outline" className="text-xs">
                  {t(`projects.sector.${sector}`)}
                </Badge>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {t('assistance.expert.languages')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {expert.languages.map((lang) => (
                <Badge key={lang} variant="outline" className="text-xs">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {t('assistance.expert.contactInfo')}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{expert.email}</span>
              </div>
              {expert.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{expert.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{expert.location.city}, {expert.location.country}</span>
              </div>
            </div>
          </div>

          {/* Certifications */}
          {expert.certifications && expert.certifications.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" />
                {t('assistance.expert.certifications')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {expert.certifications.map((cert, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-blue-50">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
          >
            <X className="w-4 h-4 mr-2" />
            {t('common.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}