import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { Button } from '@app/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@app/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@app/components/ui/dialog';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Textarea } from '@app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { OrganizationProjectReferenceDocumentsSection } from '@app/components/OrganizationProjectReferenceDocumentsSection';
import {
  CountryEnum,
  FundingAgencyEnum,
  REGION_COUNTRY_MAP,
  RegionEnum,
  SectorEnum,
  SECTOR_SUBSECTOR_MAP,
  SubSectorEnum,
} from '@app/types/tender.dto';
import {
  OrganizationProjectReferenceDTO,
  OrganizationProjectReferenceDocumentDTO,
  OrganizationProjectReferenceFormValues,
  OrganizationProjectReferenceStatus,
} from '@app/modules/organization/types/organizationProjectReference.dto';
import { ReferenceTypeEnum } from '@app/types/project.dto';
import { getLocalizedCountryName } from '@app/utils/country-translator';
import { toast } from 'sonner';

interface OrganizationProjectReferenceFormDialogProps {
  open?: boolean;
  mode: 'create' | 'edit';
  initialReference?: OrganizationProjectReferenceDTO | null;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (values: OrganizationProjectReferenceFormValues) => void;
  inline?: boolean;
  quickMode?: boolean;
}

const getInitialValues = (): OrganizationProjectReferenceFormValues => ({
  referenceNumber: '',
  title: '',
  summary: '',
  description: '',
  region: RegionEnum.AFRICA,
  country: CountryEnum.SENEGAL,
  sector: SectorEnum.EDUCATION,
  subSector: undefined,
  client: '',
  donor: FundingAgencyEnum.WORLD_BANK,
  startDate: '',
  endDate: '',
  status: 'notVerified',
  documents: [],
});

export function OrganizationProjectReferenceFormDialog({
  open,
  mode,
  initialReference,
  onOpenChange,
  onSubmit,
  inline = false,
  quickMode = false,
}: OrganizationProjectReferenceFormDialogProps) {
  const { t, language } = useLanguage();
  const [formValues, setFormValues] = useState<OrganizationProjectReferenceFormValues>(getInitialValues());
  const [referenceType, setReferenceType] = useState<ReferenceTypeEnum>(ReferenceTypeEnum.DOCUMENT);
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (!open && !inline) {
      return;
    }

    if (initialReference) {
      if (initialReference.referenceType) setReferenceType(initialReference.referenceType);
      if (initialReference.url) setUrl(initialReference.url);
      setFormValues({
        referenceNumber: initialReference.referenceNumber,
        title: initialReference.title,
        summary: initialReference.summary,
        description: initialReference.description,
        region: initialReference.region,
        country: initialReference.country,
        sector: initialReference.sector,
        subSector: initialReference.subSector,
        client: initialReference.client,
        donor: initialReference.donor,
        startDate: initialReference.startDate,
        endDate: initialReference.endDate,
        status: initialReference.status,
        documents: initialReference.documents,
      });
      return;
    }

    setFormValues(getInitialValues());
    setReferenceType(ReferenceTypeEnum.DOCUMENT);
    setUrl('');
  }, [initialReference, open, inline]);

  const availableCountries = useMemo(() => {
    return REGION_COUNTRY_MAP[formValues.region] || [];
  }, [formValues.region]);

  const availableSubSectors = useMemo(() => {
    return SECTOR_SUBSECTOR_MAP[formValues.sector] || [];
  }, [formValues.sector]);

  const setField = <K extends keyof OrganizationProjectReferenceFormValues>(field: K, value: OrganizationProjectReferenceFormValues[K]) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleRegionChange = (value: RegionEnum) => {
    const nextCountries = REGION_COUNTRY_MAP[value] || [];
    setFormValues(prev => ({
      ...prev,
      region: value,
      country: nextCountries.includes(prev.country) ? prev.country : nextCountries[0] || prev.country,
    }));
  };

  const handleSectorChange = (value: SectorEnum) => {
    const nextSubSectors = SECTOR_SUBSECTOR_MAP[value] || [];
    setFormValues(prev => ({
      ...prev,
      sector: value,
      subSector: nextSubSectors.includes(prev.subSector as SubSectorEnum) ? prev.subSector : undefined,
    }));
  };

  const handleSubmit = () => {
    if (quickMode) {
      if (!formValues.title.trim() || !formValues.client.trim()) {
        toast.error(t('organizations.projectReferences.form.validation.required'));
        return;
      }

      onSubmit({
        ...formValues,
        status: 'notVerified',
        referenceType,
        url: referenceType === ReferenceTypeEnum.LINK ? url : undefined,
      });
      if (!inline) {
        onOpenChange?.(false);
      }
      return;
    }

    const requiredFields = [
      formValues.title.trim(),
      formValues.summary.trim(),
      formValues.description.trim(),
      formValues.client.trim(),
      formValues.startDate,
      formValues.endDate,
    ];

    if (requiredFields.some(value => !value)) {
      toast.error(t('organizations.projectReferences.form.validation.required'));
      return;
    }

    if (new Date(formValues.endDate) < new Date(formValues.startDate)) {
      toast.error(t('organizations.projectReferences.form.validation.dateRange'));
      return;
    }

    onSubmit({ ...formValues, referenceType, url: referenceType === ReferenceTypeEnum.LINK ? url : undefined });
    if (!inline) {
      onOpenChange?.(false);
    }
  };

  const formContent = (
    <>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create'
              ? t('organizations.projectReferences.form.createTitle')
              : t('organizations.projectReferences.form.editTitle')}
          </DialogTitle>
          <DialogDescription>
            {quickMode ? 'You can complete additional details later' : t('organizations.projectReferences.form.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {quickMode && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              You can complete additional details later
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">{t('organizations.projectReferences.form.projectTitle')} *</Label>
            <Input id="title" value={formValues.title} onChange={event => setField('title', event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">{t('organizations.projectReferences.form.client')} *</Label>
            <Input id="client" value={formValues.client} onChange={event => setField('client', event.target.value)} />
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="more-details" className="rounded-lg border border-gray-200 bg-white px-4">
              <AccordionTrigger className="hover:no-underline">
                {quickMode ? 'More details' : t('organizations.projectReferences.form.description')}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6">
                  {/* Reference Type Toggle */}
                  <div className="space-y-2">
                    <Label>{t('projects.references.type.DOCUMENT')}</Label>
                    <div className="flex flex-wrap gap-2">
                      {[ReferenceTypeEnum.DOCUMENT, ReferenceTypeEnum.LINK, ReferenceTypeEnum.FILE, ReferenceTypeEnum.NOTE].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setReferenceType(type)}
                          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                            referenceType === type
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {t(`projects.references.type.${type}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {referenceType === ReferenceTypeEnum.LINK && (
            <div className="space-y-2">
              <Label htmlFor="refUrl">{t('projects.references.url')}</Label>
              <Input
                id="refUrl"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t('projects.references.urlPlaceholder')}
              />
            </div>
                  )}

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="referenceNumber">{t('organizations.projectReferences.form.referenceNumber')}</Label>
              <Input
                id="referenceNumber"
                value={formValues.referenceNumber}
                onChange={event => setField('referenceNumber', event.target.value)}
                placeholder={t('organizations.projectReferences.form.referenceNumberPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">{t('organizations.projectReferences.form.status')}</Label>
              <Select value={formValues.status} onValueChange={(value: OrganizationProjectReferenceStatus) => setField('status', value)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notVerified">{t('organizations.projectReferences.status.notVerified')}</SelectItem>
                  <SelectItem value="verified">{t('organizations.projectReferences.status.verified')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">{t('organizations.projectReferences.form.summary')}</Label>
            <Textarea id="summary" rows={3} value={formValues.summary} onChange={event => setField('summary', event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('organizations.projectReferences.form.fullDescription')}</Label>
            <Textarea id="description" rows={6} value={formValues.description} onChange={event => setField('description', event.target.value)} />
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>{t('organizations.projectReferences.form.region')}</Label>
              <Select value={formValues.region} onValueChange={(value: RegionEnum) => handleRegionChange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(RegionEnum).map(region => (
                    <SelectItem key={region} value={region}>{t(`regions.${region}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('organizations.projectReferences.form.country')}</Label>
              <Select value={formValues.country} onValueChange={(value: CountryEnum) => setField('country', value)}>
                <SelectTrigger>
                  <SelectValue>{getLocalizedCountryName(formValues.country, language)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableCountries.map(country => (
                    <SelectItem key={country} value={country}>{getLocalizedCountryName(country, language)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('organizations.projectReferences.form.sector')}</Label>
              <Select value={formValues.sector} onValueChange={(value: SectorEnum) => handleSectorChange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(SectorEnum).map(sector => (
                    <SelectItem key={sector} value={sector}>{t(`sectors.${sector}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('organizations.projectReferences.form.subSector')}</Label>
              <Select
                value={formValues.subSector || 'none'}
                onValueChange={(value: string) => setField('subSector', value === 'none' ? undefined : value as SubSectorEnum)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('organizations.projectReferences.form.noSubSector')}</SelectItem>
                  {availableSubSectors.map(subSector => (
                    <SelectItem key={subSector} value={subSector}>{t(`subsectors.${subSector}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('organizations.projectReferences.form.donor')}</Label>
              <Select value={formValues.donor} onValueChange={(value: FundingAgencyEnum) => setField('donor', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(FundingAgencyEnum).map(donor => (
                    <SelectItem key={donor} value={donor}>{t(`fundingAgencies.${donor}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t('organizations.projectReferences.form.startDate')}</Label>
              <Input id="startDate" type="date" value={formValues.startDate} onChange={event => setField('startDate', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">{t('organizations.projectReferences.form.endDate')}</Label>
              <Input id="endDate" type="date" value={formValues.endDate} onChange={event => setField('endDate', event.target.value)} />
            </div>
          </div>

          <OrganizationProjectReferenceDocumentsSection
            documents={formValues.documents}
            editable
            onAddDocuments={(documents: OrganizationProjectReferenceDocumentDTO[]) => {
              setField('documents', [...formValues.documents, ...documents]);
            }}
            onReplaceDocument={(documentId, document) => {
              setField('documents', formValues.documents.map(existingDocument => (
                existingDocument.id === documentId ? { ...document, id: documentId } : existingDocument
              )));
            }}
            onRemoveDocument={(documentId) => {
              setField('documents', formValues.documents.filter(document => document.id !== documentId));
            }}
          />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <DialogFooter className="mt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
            {t('organizations.projectReferences.form.cancel')}
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {mode === 'create'
              ? t('organizations.projectReferences.form.createAction')
              : t('organizations.projectReferences.form.saveAction')}
          </Button>
        </DialogFooter>
    </>
  );

  if (inline) {
    return (
      <div className="rounded-xl border border-primary/15 bg-white p-5 shadow-sm">
        {formContent}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
