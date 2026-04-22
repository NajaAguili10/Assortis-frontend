import React, { useMemo, useState } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { Button } from '@app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@app/components/ui/card';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { Textarea } from '@app/components/ui/textarea';
import { CountryEnum, SectorEnum, SECTOR_SUBSECTOR_MAP, SubSectorEnum } from '@app/types/tender.dto';
import { type TenderQuickCreatePayload } from '@app/modules/shared/hooks/useTenderQuickCreate';

interface TenderQuickCreateFormProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: TenderQuickCreatePayload) => Promise<void>;
  initialValues?: Partial<TenderQuickCreatePayload>;
  submitLabel?: string;
  submittingLabel?: string;
}

type FormValues = {
  title: string;
  description: string;
  sector: string;
  subSector: string;
  country: string;
  donorClient: string;
  budget: string;
  deadline: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialFormValues: FormValues = {
  title: '',
  description: '',
  sector: '',
  subSector: '',
  country: '',
  donorClient: '',
  budget: '',
  deadline: '',
};

export function TenderQuickCreateForm({
  isSubmitting,
  onCancel,
  onSubmit,
  initialValues,
  submitLabel,
  submittingLabel,
}: TenderQuickCreateFormProps) {
  const { t } = useLanguage();
  const [values, setValues] = useState<FormValues>({
    ...initialFormValues,
    title: initialValues?.title ?? '',
    description: initialValues?.description ?? '',
    sector: initialValues?.sector ?? '',
    subSector: initialValues?.subSector ?? '',
    country: initialValues?.country ?? '',
    donorClient: initialValues?.donorClient ?? '',
    budget: typeof initialValues?.budget === 'number' ? String(initialValues.budget) : '',
    deadline: initialValues?.deadline ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const availableSubSectors = useMemo(() => {
    if (!values.sector) return [];
    return SECTOR_SUBSECTOR_MAP[values.sector as SectorEnum] || [];
  }, [values.sector]);

  const translateSector = (sector: SectorEnum) => {
    const translated = t(`sectors.${sector}`);
    return translated === `sectors.${sector}` ? sector : translated;
  };

  const translateSubSector = (subSector: SubSectorEnum) => {
    const translated = t(`subsectors.${subSector}`);
    return translated === `subsectors.${subSector}` ? subSector : translated;
  };

  const translateCountry = (country: CountryEnum) => {
    const translated = t(`countries.${country}`);
    return translated === `countries.${country}` ? country : translated;
  };

  const validateField = (name: keyof FormValues, currentValues: FormValues): string => {
    const value = currentValues[name].trim();

    if (['title', 'description', 'sector', 'subSector', 'country', 'donorClient', 'deadline'].includes(name) && !value) {
      return t('organizations.createTender.validation.required');
    }

    if (name === 'budget' && value) {
      const parsed = Number(value);
      if (Number.isNaN(parsed) || parsed < 0) {
        return t('organizations.createTender.validation.budgetInvalid');
      }
    }

    if (name === 'deadline' && value) {
      const selected = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selected < today) {
        return t('organizations.createTender.validation.deadlineFuture');
      }
    }

    return '';
  };

  const validateAll = (currentValues: FormValues): FormErrors => {
    const nextErrors: FormErrors = {};

    (Object.keys(currentValues) as Array<keyof FormValues>).forEach((key) => {
      const message = validateField(key, currentValues);
      if (message) {
        nextErrors[key] = message;
      }
    });

    return nextErrors;
  };

  const updateValue = (name: keyof FormValues, value: string) => {
    const nextValues = { ...values, [name]: value };

    if (name === 'sector') {
      nextValues.subSector = '';
    }

    setValues(nextValues);

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, nextValues),
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors = validateAll(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    await onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      sector: values.sector,
      subSector: values.subSector,
      country: values.country,
      donorClient: values.donorClient.trim(),
      budget: values.budget ? Number(values.budget) : undefined,
      deadline: values.deadline,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('organizations.createTender.form.title')}</CardTitle>
        <CardDescription>{t('organizations.createTender.form.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tender-title">{t('organizations.createTender.fields.title')}</Label>
              <Input
                id="tender-title"
                value={values.title}
                onChange={(event) => updateValue('title', event.target.value)}
                placeholder={t('organizations.createTender.placeholders.title')}
                aria-invalid={Boolean(errors.title)}
              />
              {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tender-description">{t('organizations.createTender.fields.description')}</Label>
              <Textarea
                id="tender-description"
                value={values.description}
                onChange={(event) => updateValue('description', event.target.value)}
                placeholder={t('organizations.createTender.placeholders.description')}
                className="min-h-28"
                aria-invalid={Boolean(errors.description)}
              />
              {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label>{t('organizations.createTender.fields.sector')}</Label>
              <Select value={values.sector} onValueChange={(value) => updateValue('sector', value)}>
                <SelectTrigger aria-invalid={Boolean(errors.sector)}>
                  <SelectValue placeholder={t('organizations.createTender.placeholders.sector')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(SectorEnum).map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {translateSector(sector)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sector && <p className="text-sm text-red-600">{errors.sector}</p>}
            </div>

            <div className="space-y-2">
              <Label>{t('organizations.createTender.fields.subSector')}</Label>
              <Select
                value={values.subSector}
                onValueChange={(value) => updateValue('subSector', value)}
                disabled={!values.sector}
              >
                <SelectTrigger aria-invalid={Boolean(errors.subSector)}>
                  <SelectValue placeholder={t('organizations.createTender.placeholders.subSector')} />
                </SelectTrigger>
                <SelectContent>
                  {availableSubSectors.map((subSector) => (
                    <SelectItem key={subSector} value={subSector}>
                      {translateSubSector(subSector)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subSector && <p className="text-sm text-red-600">{errors.subSector}</p>}
            </div>

            <div className="space-y-2">
              <Label>{t('organizations.createTender.fields.country')}</Label>
              <Select value={values.country} onValueChange={(value) => updateValue('country', value)}>
                <SelectTrigger aria-invalid={Boolean(errors.country)}>
                  <SelectValue placeholder={t('organizations.createTender.placeholders.country')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CountryEnum).map((country) => (
                    <SelectItem key={country} value={country}>
                      {translateCountry(country)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && <p className="text-sm text-red-600">{errors.country}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tender-donor">{t('organizations.createTender.fields.donorClient')}</Label>
              <Input
                id="tender-donor"
                value={values.donorClient}
                onChange={(event) => updateValue('donorClient', event.target.value)}
                placeholder={t('organizations.createTender.placeholders.donorClient')}
                aria-invalid={Boolean(errors.donorClient)}
              />
              {errors.donorClient && <p className="text-sm text-red-600">{errors.donorClient}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tender-budget">{t('organizations.createTender.fields.budget')}</Label>
              <Input
                id="tender-budget"
                type="number"
                min="0"
                step="0.01"
                value={values.budget}
                onChange={(event) => updateValue('budget', event.target.value)}
                placeholder={t('organizations.createTender.placeholders.budget')}
                aria-invalid={Boolean(errors.budget)}
              />
              {errors.budget && <p className="text-sm text-red-600">{errors.budget}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tender-deadline">{t('organizations.createTender.fields.deadline')}</Label>
              <Input
                id="tender-deadline"
                type="date"
                value={values.deadline}
                onChange={(event) => updateValue('deadline', event.target.value)}
                aria-invalid={Boolean(errors.deadline)}
              />
              {errors.deadline && <p className="text-sm text-red-600">{errors.deadline}</p>}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('organizations.createTender.actions.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? (submittingLabel || t('organizations.createTender.actions.submitting'))
                : (submitLabel || t('organizations.createTender.actions.submit'))}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
