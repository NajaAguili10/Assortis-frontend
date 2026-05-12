import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@app/contexts/LanguageContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@app/components/ui/dialog';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Textarea } from '@app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { CountryEnum, FundingAgencyEnum, SectorEnum, SubSectorEnum, SECTOR_SUBSECTOR_MAP } from '@app/types/tender.dto';
import {
  ProjectReferenceFicheDTO,
  ProjectReferenceFicheModalMode,
  ProjectReferenceProjectStatus,
  ProjectReferenceValidationState,
} from '@app/types/project-reference-fiche.dto';
import { getLocalizedCountryName } from '@app/utils/country-translator';
import { toast } from 'sonner';

interface ProjectReferenceFicheModalProps {
  open: boolean;
  mode: ProjectReferenceFicheModalMode;
  fiche: ProjectReferenceFicheDTO | null;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: ProjectReferenceFicheDTO) => void;
}

export function ProjectReferenceFicheModal({
  open,
  mode,
  fiche,
  onOpenChange,
  onSave,
}: ProjectReferenceFicheModalProps) {
  const { t, language } = useTranslation();
  const [formValues, setFormValues] = useState<ProjectReferenceFicheDTO | null>(fiche);

  useEffect(() => {
    if (!open) return;
    setFormValues(fiche);
  }, [fiche, open]);

  const isReadOnly = mode === 'view';

  const availableSubSectors = useMemo(() => {
    if (!formValues) return [];
    return SECTOR_SUBSECTOR_MAP[formValues.sector] || [];
  }, [formValues]);

  const hasChanges = useMemo(() => {
    if (!fiche || !formValues) return false;
    return JSON.stringify(fiche) !== JSON.stringify(formValues);
  }, [fiche, formValues]);

  const setField = <K extends keyof ProjectReferenceFicheDTO>(field: K, value: ProjectReferenceFicheDTO[K]) => {
    setFormValues(prev => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = () => {
    if (!formValues) return;

    if (!formValues.title.trim() || !formValues.description.trim() || !formValues.organizationName.trim()) {
      toast.error(t('projects.references.fiche.validation.required'));
      return;
    }

    if (formValues.startDate && formValues.endDate && new Date(formValues.endDate) < new Date(formValues.startDate)) {
      toast.error(t('projects.references.fiche.validation.dateRange'));
      return;
    }

    onSave(formValues);
    toast.success(t('projects.references.fiche.feedback.saved'));
    onOpenChange(false);
  };

  const renderViewValue = (value?: string) => value?.trim() || t('projects.references.fiche.notProvided');

  if (!fiche || !formValues) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isReadOnly
              ? t('projects.references.fiche.title.view')
              : t('projects.references.fiche.title.edit')}
          </DialogTitle>
          <DialogDescription>
            {isReadOnly
              ? t('projects.references.fiche.description.view')
              : t('projects.references.fiche.description.edit')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-4 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900">{t('projects.references.fiche.sections.details')}</h3>
            {isReadOnly ? (
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500">{t('projects.references.fiche.fields.referenceNumber')}</p>
                  <p className="text-sm font-medium text-gray-900">{renderViewValue(fiche.referenceNumber)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('projects.references.fiche.fields.projectTitle')}</p>
                  <p className="text-sm font-medium text-gray-900">{renderViewValue(fiche.title)}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500">{t('projects.references.fiche.fields.description')}</p>
                  <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{renderViewValue(fiche.description)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('projects.references.fiche.fields.organization')}</p>
                  <p className="text-sm font-medium text-gray-900">{renderViewValue(fiche.organizationName)}</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('projects.references.fiche.fields.referenceNumber')}</Label>
                  <Input value={formValues.referenceNumber} onChange={event => setField('referenceNumber', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('projects.references.fiche.fields.projectTitle')}</Label>
                  <Input value={formValues.title} onChange={event => setField('title', event.target.value)} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>{t('projects.references.fiche.fields.description')}</Label>
                  <Textarea rows={4} value={formValues.description} onChange={event => setField('description', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('projects.references.fiche.fields.organization')}</Label>
                  <Input value={formValues.organizationName} onChange={event => setField('organizationName', event.target.value)} />
                </div>
              </div>
            )}
          </section>

          <section className="space-y-4 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900">{t('projects.references.fiche.sections.metadata')}</h3>
            {isReadOnly ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-500">{t('projects.references.fiche.fields.sector')}</p>
                  <p className="text-sm font-medium text-gray-900">{renderViewValue(t(`sectors.${fiche.sector}`))}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('projects.references.fiche.fields.subSector')}</p>
                  <p className="text-sm font-medium text-gray-900">{fiche.subSector ? t(`subsectors.${fiche.subSector}`) : t('projects.references.fiche.notProvided')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('projects.references.fiche.fields.country')}</p>
                  <p className="text-sm font-medium text-gray-900">{getLocalizedCountryName(fiche.country, language)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('projects.references.fiche.fields.donor')}</p>
                  <p className="text-sm font-medium text-gray-900">{fiche.donor ? t(`fundingAgencies.${fiche.donor}`) : t('projects.references.fiche.notProvided')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('projects.references.fiche.fields.budget')}</p>
                  <p className="text-sm font-medium text-gray-900">{renderViewValue(fiche.budgetFormatted)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('projects.references.fiche.fields.projectStatus')}</p>
                  <p className="text-sm font-medium text-gray-900">{t(`projects.references.status.${fiche.projectStatus}`)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('projects.references.fiche.fields.state')}</p>
                  <p className="text-sm font-medium text-gray-900">{t(`projects.references.state.${fiche.referenceState}`)}</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>{t('projects.references.fiche.fields.sector')}</Label>
                  <Select value={formValues.sector} onValueChange={(value: SectorEnum) => setField('sector', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.values(SectorEnum).map(sector => (
                        <SelectItem key={sector} value={sector}>{t(`sectors.${sector}`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('projects.references.fiche.fields.subSector')}</Label>
                  <Select
                    value={formValues.subSector || 'none'}
                    onValueChange={(value: string) => setField('subSector', value === 'none' ? undefined : value as SubSectorEnum)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('projects.references.fiche.notProvided')}</SelectItem>
                      {availableSubSectors.map(subSector => (
                        <SelectItem key={subSector} value={subSector}>{t(`subsectors.${subSector}`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('projects.references.fiche.fields.country')}</Label>
                  <Select value={formValues.country} onValueChange={(value: CountryEnum) => setField('country', value)}>
                    <SelectTrigger><SelectValue>{getLocalizedCountryName(formValues.country, language)}</SelectValue></SelectTrigger>
                    <SelectContent>
                      {Object.values(CountryEnum).map(country => (
                        <SelectItem key={country} value={country}>{getLocalizedCountryName(country, language)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('projects.references.fiche.fields.donor')}</Label>
                  <Select
                    value={formValues.donor || 'none'}
                    onValueChange={(value: string) => setField('donor', value === 'none' ? undefined : value as FundingAgencyEnum)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('projects.references.fiche.notProvided')}</SelectItem>
                      {Object.values(FundingAgencyEnum).map(donor => (
                        <SelectItem key={donor} value={donor}>{t(`fundingAgencies.${donor}`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('projects.references.fiche.fields.budget')}</Label>
                  <Input value={formValues.budgetFormatted || ''} onChange={event => setField('budgetFormatted', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('projects.references.fiche.fields.projectStatus')}</Label>
                  <Select value={formValues.projectStatus} onValueChange={(value: ProjectReferenceProjectStatus) => setField('projectStatus', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ongoing">{t('projects.references.status.ongoing')}</SelectItem>
                      <SelectItem value="past">{t('projects.references.status.past')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('projects.references.fiche.fields.state')}</Label>
                  <Select value={formValues.referenceState} onValueChange={(value: ProjectReferenceValidationState) => setField('referenceState', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notVerified">{t('projects.references.state.notVerified')}</SelectItem>
                      <SelectItem value="valid">{t('projects.references.state.valid')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </section>

          <section className="space-y-4 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900">{t('projects.references.fiche.sections.dates')}</h3>
            {isReadOnly ? (
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-500">{t('projects.references.fiche.fields.startDate')}</p>
                  <p className="text-sm font-medium text-gray-900">{renderViewValue(fiche.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('projects.references.fiche.fields.endDate')}</p>
                  <p className="text-sm font-medium text-gray-900">{renderViewValue(fiche.endDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('projects.references.fiche.fields.deadline')}</p>
                  <p className="text-sm font-medium text-gray-900">{renderViewValue(fiche.deadline)}</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{t('projects.references.fiche.fields.startDate')}</Label>
                  <Input type="date" value={formValues.startDate} onChange={event => setField('startDate', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('projects.references.fiche.fields.endDate')}</Label>
                  <Input type="date" value={formValues.endDate} onChange={event => setField('endDate', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('projects.references.fiche.fields.deadline')}</Label>
                  <Input type="date" value={formValues.deadline || ''} onChange={event => setField('deadline', event.target.value)} />
                </div>
              </div>
            )}
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isReadOnly ? t('projects.references.fiche.actions.close') : t('projects.references.fiche.actions.cancel')}
          </Button>
          {!isReadOnly && (
            <Button onClick={handleSave} disabled={!hasChanges}>
              {t('projects.references.fiche.actions.apply')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
