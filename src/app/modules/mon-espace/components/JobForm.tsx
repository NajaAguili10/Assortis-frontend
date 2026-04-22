import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { JobOfferCreateDTO, JobOfferTypeEnum } from '../types/JobOffer.dto';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Loader2 } from 'lucide-react';

interface JobFormProps {
  onSubmit: (data: JobOfferCreateDTO) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<JobOfferCreateDTO>;
  submitLabel?: string;
}

export function JobForm({ 
  onSubmit, 
  onCancel, 
  initialData,
  submitLabel,
}: JobFormProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<JobOfferCreateDTO>({
    jobTitle: initialData?.jobTitle || '',
    location: initialData?.location || '',
    projectTitle: initialData?.projectTitle || '',
    department: initialData?.department || '',
    type: initialData?.type || JobOfferTypeEnum.PROJECT,
    duration: initialData?.duration || '',
    description: initialData?.description || '',
    deadline: initialData?.deadline || '',
    contactEmail: initialData?.contactEmail || '',
    contactPerson: initialData?.contactPerson || '',
  });

  const handleChange = (field: keyof JobOfferCreateDTO, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = t('monEspace.validation.jobTitle');
    }
    if (!formData.location.trim()) {
      newErrors.location = t('monEspace.validation.location');
    }
    if (!formData.type) {
      newErrors.type = t('monEspace.validation.type');
    }
    if (!formData.duration.trim()) {
      newErrors.duration = t('monEspace.validation.duration');
    }
    if (!formData.description.trim()) {
      newErrors.description = t('monEspace.validation.description');
    }
    if (!formData.deadline) {
      newErrors.deadline = t('monEspace.validation.deadline');
    } else {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        newErrors.deadline = t('monEspace.validation.deadline.future');
      }
    }

    // Validate project title for PROJECT type
    if (formData.type === JobOfferTypeEnum.PROJECT && !formData.projectTitle?.trim()) {
      newErrors.projectTitle = t('monEspace.validation.required');
    }

    // Validate department for INTERNAL type
    if (formData.type === JobOfferTypeEnum.INTERNAL && !formData.department?.trim()) {
      newErrors.department = t('monEspace.validation.required');
    }

    // Validate email if provided
    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = t('monEspace.validation.email');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section 1: Basic Information */}
      <div className="space-y-6">
        <div className="pb-2">
          <h3 className="text-lg font-semibold text-primary">
            {t('monEspace.form.section.basicInfo')}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {t('monEspace.form.section.basicInfo.description')}
          </p>
        </div>

        {/* Job Title */}
        <div className="space-y-2">
          <Label htmlFor="jobTitle" className="required">
            {t('monEspace.form.jobTitle')}
          </Label>
          <Input
            id="jobTitle"
            value={formData.jobTitle}
            onChange={(e) => handleChange('jobTitle', e.target.value)}
            placeholder={t('monEspace.form.jobTitle.placeholder')}
            className={errors.jobTitle ? 'border-destructive' : ''}
          />
          {errors.jobTitle && (
            <p className="text-sm text-destructive mt-1">{errors.jobTitle}</p>
          )}
        </div>

        {/* Offer Type */}
        <div className="space-y-2">
          <Label htmlFor="type" className="required">
            {t('monEspace.form.type')}
          </Label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => handleChange('type', value as JobOfferTypeEnum)}
          >
            <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={JobOfferTypeEnum.PROJECT}>
                {t('monEspace.form.type.project')}
              </SelectItem>
              <SelectItem value={JobOfferTypeEnum.INTERNAL}>
                {t('monEspace.form.type.internal')}
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-destructive mt-1">{errors.type}</p>
          )}
        </div>

        {/* Conditional: Project Title (for PROJECT type) */}
        {formData.type === JobOfferTypeEnum.PROJECT && (
          <div className="space-y-2">
            <Label htmlFor="projectTitle" className="required">
              {t('monEspace.form.projectTitle')}
            </Label>
            <Input
              id="projectTitle"
              value={formData.projectTitle || ''}
              onChange={(e) => handleChange('projectTitle', e.target.value)}
              placeholder={t('monEspace.form.projectTitle.placeholder')}
              className={errors.projectTitle ? 'border-destructive' : ''}
            />
            {errors.projectTitle && (
              <p className="text-sm text-destructive mt-1">{errors.projectTitle}</p>
            )}
          </div>
        )}

        {/* Conditional: Department (for INTERNAL type) */}
        {formData.type === JobOfferTypeEnum.INTERNAL && (
          <div className="space-y-2">
            <Label htmlFor="department" className="required">
              {t('monEspace.form.department')}
            </Label>
            <Input
              id="department"
              value={formData.department || ''}
              onChange={(e) => handleChange('department', e.target.value)}
              placeholder={t('monEspace.form.department.placeholder')}
              className={errors.department ? 'border-destructive' : ''}
            />
            {errors.department && (
              <p className="text-sm text-destructive mt-1">{errors.department}</p>
            )}
          </div>
        )}

        {/* Location and Duration in Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location" className="required">
              {t('monEspace.form.location')}
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder={t('monEspace.form.location.placeholder')}
              className={errors.location ? 'border-destructive' : ''}
            />
            {errors.location && (
              <p className="text-sm text-destructive mt-1">{errors.location}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="required">
              {t('monEspace.form.duration')}
            </Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
              placeholder={t('monEspace.form.duration.placeholder')}
              className={errors.duration ? 'border-destructive' : ''}
            />
            {errors.duration && (
              <p className="text-sm text-destructive mt-1">{errors.duration}</p>
            )}
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-gray-200"></div>

      {/* Section 2: Description & Details */}
      <div className="space-y-6">
        <div className="pb-2">
          <h3 className="text-lg font-semibold text-primary">
            {t('monEspace.form.section.details')}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {t('monEspace.form.section.details.description')}
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="required">
            {t('monEspace.form.description')}
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder={t('monEspace.form.description.placeholder')}
            rows={8}
            className={errors.description ? 'border-destructive' : ''}
          />
          {errors.description && (
            <p className="text-sm text-destructive mt-1">{errors.description}</p>
          )}
          <p className="text-xs text-gray-500">
            {t('monEspace.form.description.helper')}
          </p>
        </div>

        {/* Deadline */}
        <div className="space-y-2">
          <Label htmlFor="deadline" className="required">
            {t('monEspace.form.deadline')}
          </Label>
          <Input
            id="deadline"
            type="date"
            value={formData.deadline}
            onChange={(e) => handleChange('deadline', e.target.value)}
            className={errors.deadline ? 'border-destructive' : ''}
          />
          {errors.deadline && (
            <p className="text-sm text-destructive mt-1">{errors.deadline}</p>
          )}
          <p className="text-xs text-gray-500">
            {t('monEspace.form.deadline.helper')}
          </p>
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-gray-200"></div>

      {/* Section 3: Contact Information */}
      <div className="space-y-6">
        <div className="pb-2">
          <h3 className="text-lg font-semibold text-primary">
            {t('monEspace.form.section.contact')}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {t('monEspace.form.section.contact.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactPerson">
              {t('monEspace.form.contactPerson')}
            </Label>
            <Input
              id="contactPerson"
              value={formData.contactPerson || ''}
              onChange={(e) => handleChange('contactPerson', e.target.value)}
              placeholder={t('monEspace.form.contactPerson.placeholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">
              {t('monEspace.form.contactEmail')}
            </Label>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contactEmail || ''}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              placeholder={t('monEspace.form.contactEmail.placeholder')}
              className={errors.contactEmail ? 'border-destructive' : ''}
            />
            {errors.contactEmail && (
              <p className="text-sm text-destructive mt-1">{errors.contactEmail}</p>
            )}
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-gray-200"></div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {t('monEspace.action.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto min-w-[150px]"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {submitLabel || t('monEspace.action.publish')}
        </Button>
      </div>
    </form>
  );
}