import { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import {
  User,
  Building2,
  Users,
  GraduationCap,
  CheckCircle,
  X,
  Minus,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import type { TrainingCourseDTO } from '../types/training.dto';

interface EnrollmentDialogProps {
  open: boolean;
  onClose: () => void;
  course: TrainingCourseDTO | null;
}

type EnrollmentType = 'INDIVIDUAL' | 'ORGANIZATION' | 'EXPERTS';

export function EnrollmentDialog({ open, onClose, course }: EnrollmentDialogProps) {
  const { t } = useTranslation();
  
  const [enrollmentType, setEnrollmentType] = useState<EnrollmentType>('INDIVIDUAL');
  const [participantCount, setParticipantCount] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetState = () => {
    setEnrollmentType('INDIVIDUAL');
    setParticipantCount(1);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleIncrement = () => {
    setParticipantCount(prev => Math.min(prev + 1, 100));
  };

  const handleDecrement = () => {
    setParticipantCount(prev => Math.max(prev - 1, 1));
  };

  const handleParticipantCountChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 1 && num <= 100) {
      setParticipantCount(num);
    }
  };

  const calculateTotalPrice = () => {
    if (!course) return 0;
    
    let price = course.price;
    
    // Apply discounts for organization and bulk enrollments
    if (enrollmentType === 'ORGANIZATION') {
      if (participantCount >= 10) {
        price = price * 0.8; // 20% discount for 10+ participants
      } else if (participantCount >= 5) {
        price = price * 0.9; // 10% discount for 5+ participants
      }
    } else if (enrollmentType === 'EXPERTS') {
      if (participantCount >= 5) {
        price = price * 0.85; // 15% discount for 5+ experts
      }
    }
    
    return price * participantCount;
  };

  const getDiscountPercentage = () => {
    if (enrollmentType === 'ORGANIZATION') {
      if (participantCount >= 10) return 20;
      if (participantCount >= 5) return 10;
    } else if (enrollmentType === 'EXPERTS') {
      if (participantCount >= 5) return 15;
    }
    return 0;
  };

  const handleEnroll = async () => {
    if (!course) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Show success toast notification
    toast.success(t('training.enrollment.success.title'), {
      description: t('training.enrollment.success.message')
        .replace('{course}', course.title)
        .replace('{count}', participantCount.toString())
        .replace('{type}', t(`training.enrollment.type.${enrollmentType}`)),
    });
    
    // Close dialog and reset state
    setIsSubmitting(false);
    handleClose();
  };

  if (!course) return null;

  const totalPrice = calculateTotalPrice();
  const discount = getDiscountPercentage();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-primary">
                {t('training.enrollment.title')}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                {course.title}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-6 py-4">
          {/* Course Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t('training.catalog.instructor')}:</span>
                <p className="font-medium text-primary">{course.instructor.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t('training.catalog.duration')}:</span>
                <p className="font-medium text-primary">{course.duration} {t('training.stats.hours')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t('training.catalog.level')}:</span>
                <p className="font-medium text-primary">{t(`training.level.${course.level}`)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t('training.catalog.format')}:</span>
                <p className="font-medium text-primary">{t(`training.format.${course.format}`)}</p>
              </div>
            </div>
          </div>

          {/* Enrollment Type Selection */}
          <div>
            <Label className="text-sm font-semibold text-primary mb-3 block">
              {t('training.enrollment.selectType')}
            </Label>
            <RadioGroup
              value={enrollmentType}
              onValueChange={(value) => {
                setEnrollmentType(value as EnrollmentType);
                setParticipantCount(1);
              }}
            >
              {/* Individual */}
              <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <RadioGroupItem value="INDIVIDUAL" id="individual" />
                <label htmlFor="individual" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-primary">{t('training.enrollment.type.INDIVIDUAL')}</p>
                      <p className="text-xs text-muted-foreground">{t('training.enrollment.type.INDIVIDUAL.description')}</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Organization */}
              <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <RadioGroupItem value="ORGANIZATION" id="organization" />
                <label htmlFor="organization" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-primary">{t('training.enrollment.type.ORGANIZATION')}</p>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                          {t('training.enrollment.discount.available')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{t('training.enrollment.type.ORGANIZATION.description')}</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Experts */}
              <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <RadioGroupItem value="EXPERTS" id="experts" />
                <label htmlFor="experts" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-primary">{t('training.enrollment.type.EXPERTS')}</p>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                          {t('training.enrollment.discount.bulk')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{t('training.enrollment.type.EXPERTS.description')}</p>
                    </div>
                  </div>
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Participant Count (for Organization and Experts) */}
          {(enrollmentType === 'ORGANIZATION' || enrollmentType === 'EXPERTS') && (
            <div>
              <Label className="text-sm font-semibold text-primary mb-3 block">
                {t('training.enrollment.participantCount')}
              </Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleDecrement}
                  disabled={participantCount <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={participantCount}
                  onChange={(e) => handleParticipantCountChange(e.target.value)}
                  className="w-24 text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleIncrement}
                  disabled={participantCount >= 100}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {t('training.enrollment.participants')}
                </span>
              </div>

              {/* Discount Information */}
              {discount > 0 && (
                <div className="mt-3 flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">
                      {t('training.enrollment.discount.applied')}
                    </p>
                    <p className="text-xs text-green-700">
                      {t('training.enrollment.discount.message').replace('{percent}', discount.toString())}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Price Summary */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('training.enrollment.pricePerParticipant')}:</span>
                <span className="font-medium text-primary">${course.price}</span>
              </div>
              {enrollmentType !== 'INDIVIDUAL' && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('training.enrollment.numberOfParticipants')}:</span>
                  <span className="font-medium text-primary">×{participantCount}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-700">{t('training.enrollment.discount.label')}:</span>
                  <span className="font-medium text-green-700">-{discount}%</span>
                </div>
              )}
              <div className="pt-2 border-t border-blue-300">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-primary">{t('training.enrollment.totalPrice')}:</span>
                  <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">
                {t('training.enrollment.important')}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                {t('training.enrollment.important.message')}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleEnroll}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isSubmitting ? t('training.enrollment.processing') : t('training.enrollment.confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}