import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Checkbox } from '../../../components/ui/checkbox';
import { Badge } from '../../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { JobOfferCreateDTO, JobLanguageRequirement, JobOfferTypeEnum } from '../types/JobOffer.dto';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Loader2, Plus, X, Globe, Building2, FileText, Languages, CalendarCheck } from 'lucide-react';

const JOB_FUNCTIONS = [
  'Project Management',
  'Monitoring & Evaluation',
  'Finance & Accounting',
  'Procurement & Logistics',
  'Communication & Outreach',
  'Research & Analysis',
  'Legal & Compliance',
  'Technical Assistance',
  'Human Resources',
  'Administration',
  'IT & Digital',
  'Agriculture & Food Security',
  'Health',
  'Education',
  'Environment & Climate',
  'Governance & Rule of Law',
  'Water & Sanitation',
  'Gender & Social Inclusion',
  'Other',
];

const REGIONS = [
  'Sub-Saharan Africa',
  'North Africa',
  'Middle East',
  'Europe',
  'Central Asia',
  'South Asia',
  'Southeast Asia',
  'East Asia & Pacific',
  'Latin America & Caribbean',
  'North America',
  'Global',
];

const LANGUAGE_LEVELS = ['Excellent', 'Good', 'Fair', 'Basic', 'None'];

const COMMON_LANGUAGES = [
  'English', 'French', 'Spanish', 'Arabic', 'Portuguese', 'German',
  'Russian', 'Chinese', 'Italian', 'Dutch', 'Swedish', 'Turkish',
];

interface JobFormProps {
  onSubmit: (data: JobOfferCreateDTO) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<JobOfferCreateDTO>;
  submitLabel?: string;
  organisationName?: string;
}

export function JobForm({
  onSubmit,
  onCancel,
  initialData,
  submitLabel,
  organisationName = 'Assortis',
}: JobFormProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Organisation Details
  const [orgName] = useState(initialData?.organisationName || organisationName);
  const [website, setWebsite] = useState(initialData?.website || '');
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logoUrl || null);

  // Vacancy Details
  const [jobTitle, setJobTitle] = useState(initialData?.jobTitle || '');
  const [jobFunction, setJobFunction] = useState(initialData?.jobFunction || '');
  const [otherFunction, setOtherFunction] = useState(initialData?.otherFunction || '');
  const [selectedRegions, setSelectedRegions] = useState<string[]>(initialData?.regions || []);
  const [countryInput, setCountryInput] = useState('');
  const [countries, setCountries] = useState<string[]>(initialData?.countries || []);
  const [cityInput, setCityInput] = useState('');
  const [cities, setCities] = useState<string[]>(initialData?.cities || []);

  // Languages
  const [languages, setLanguages] = useState<JobLanguageRequirement[]>(
    initialData?.languages || [{ name: '', writtenLevel: '', spokenLevel: '' }]
  );

  // Vacancy Text
  const [description, setDescription] = useState(initialData?.description || '');

  // Application Details
  const [deadline, setDeadline] = useState(initialData?.deadline || '');
  const [deadlineTime, setDeadlineTime] = useState(initialData?.deadlineTime || '');
  const [applicationLink, setApplicationLink] = useState(initialData?.applicationLink || '');
  const [privacyAccepted, setPrivacyAccepted] = useState(initialData?.privacyPolicyAccepted || false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
  };

  const handleAddTag = (
    input: string,
    setInput: (v: string) => void,
    tags: string[],
    setTags: (v: string[]) => void
  ) => {
    const val = input.trim();
    if (val && !tags.includes(val)) setTags([...tags, val]);
    setInput('');
  };

  const handleTagKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    input: string,
    setInput: (v: string) => void,
    tags: string[],
    setTags: (v: string[]) => void
  ) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(input, setInput, tags, setTags);
    }
  };

  const addLanguage = () =>
    setLanguages((prev) => [...prev, { name: '', writtenLevel: '', spokenLevel: '' }]);

  const removeLanguage = (index: number) =>
    setLanguages((prev) => prev.filter((_, i) => i !== index));

  const updateLanguage = (index: number, field: keyof JobLanguageRequirement, value: string) =>
    setLanguages((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!jobTitle.trim()) newErrors.jobTitle = t('monEspace.validation.jobTitle');
    if (!jobFunction) newErrors.jobFunction = t('monEspace.validation.required');
    if (!description.trim()) newErrors.description = t('monEspace.validation.description');
    if (!deadline) {
      newErrors.deadline = t('monEspace.validation.deadline');
    } else {
      const deadlineDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) newErrors.deadline = t('monEspace.validation.deadline.future');
    }
    if (!privacyAccepted) newErrors.privacy = t('monEspace.form.privacy.required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const locationParts = [...countries, ...cities];
      const data: JobOfferCreateDTO = {
        organisationName: orgName,
        website: website || undefined,
        logoUrl: logoPreview || undefined,
        jobTitle,
        jobFunction,
        otherFunction: otherFunction || undefined,
        regions: selectedRegions,
        countries,
        cities,
        location: locationParts.join(', ') || selectedRegions.join(', ') || 'Global',
        type: initialData?.type || JobOfferTypeEnum.PROJECT,
        duration: initialData?.duration || '',
        projectTitle: initialData?.projectTitle,
        department: initialData?.department,
        languages: languages.filter((l) => l.name),
        description,
        deadline,
        deadlineTime: deadlineTime || undefined,
        applicationLink: applicationLink || undefined,
        privacyPolicyAccepted: privacyAccepted,
      };
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-0 divide-y divide-gray-100">

      {/* SECTION 1: Organisation Details */}
      <div className="py-8 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-primary">{t('monEspace.form.section.org')}</h3>
        </div>

        <div className="space-y-1.5">
          <Label>{t('monEspace.form.orgName')}</Label>
          <Input value={orgName} readOnly className="bg-gray-50 text-gray-700 cursor-default" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="website">{t('monEspace.form.website')}</Label>
          <Input
            id="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://www.example.org"
          />
        </div>

        <div className="space-y-1.5">
          <Label>{t('monEspace.form.logo')}</Label>
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo preview"
                className="h-14 w-14 rounded-md object-contain border border-gray-200 bg-white p-1"
              />
            ) : (
              <div className="h-14 w-14 rounded-md border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-xs">
                Logo
              </div>
            )}
            <div>
              <label htmlFor="logo-upload" className="inline-flex items-center gap-1.5 cursor-pointer text-sm font-medium text-primary hover:underline">
                {logoPreview ? t('monEspace.form.logo.change') : t('monEspace.form.logo.upload')}
              </label>
              <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              <p className="text-xs text-gray-400 mt-0.5">{t('monEspace.form.logo.hint')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Vacancy Details */}
      <div className="py-8 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-primary">{t('monEspace.form.section.vacancy')}</h3>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="jobTitle">{t('monEspace.form.jobTitle')} <span className="text-destructive">*</span></Label>
          <Input
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder={t('monEspace.form.jobTitle.placeholder')}
            className={errors.jobTitle ? 'border-destructive' : ''}
          />
          {errors.jobTitle && <p className="text-xs text-destructive">{errors.jobTitle}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>{t('monEspace.form.function')} <span className="text-destructive">*</span></Label>
          <Select value={jobFunction} onValueChange={setJobFunction}>
            <SelectTrigger className={errors.jobFunction ? 'border-destructive' : ''}>
              <SelectValue placeholder={t('monEspace.form.function.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {JOB_FUNCTIONS.map((fn) => (
                <SelectItem key={fn} value={fn}>{fn}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.jobFunction && <p className="text-xs text-destructive">{errors.jobFunction}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="otherFunction">{t('monEspace.form.otherFunction')}</Label>
          <Input
            id="otherFunction"
            value={otherFunction}
            onChange={(e) => setOtherFunction(e.target.value)}
            placeholder={t('monEspace.form.otherFunction.placeholder')}
          />
        </div>

        <div className="space-y-3">
          <Label><Globe className="inline h-3.5 w-3.5 mr-1 text-gray-500" />{t('monEspace.form.geographicalScope')}</Label>

          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600">{t('monEspace.form.regions')}</p>
            <div className="flex flex-wrap gap-1.5">
              {REGIONS.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => toggleRegion(region)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedRegions.includes(region)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-gray-600">{t('monEspace.form.countries')}</p>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {countries.map((c) => (
                <Badge key={c} variant="secondary" className="gap-1 pr-1">
                  {c}
                  <button type="button" onClick={() => setCountries(countries.filter((x) => x !== c))}><X className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={countryInput}
                onChange={(e) => setCountryInput(e.target.value)}
                onKeyDown={(e) => handleTagKeyDown(e, countryInput, setCountryInput, countries, setCountries)}
                placeholder={t('monEspace.form.countries.placeholder')}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={() => handleAddTag(countryInput, setCountryInput, countries, setCountries)}>
                {t('monEspace.form.add')}
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-gray-600">{t('monEspace.form.cities')} <span className="text-gray-400 font-normal">({t('monEspace.form.optional')})</span></p>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {cities.map((c) => (
                <Badge key={c} variant="secondary" className="gap-1 pr-1">
                  {c}
                  <button type="button" onClick={() => setCities(cities.filter((x) => x !== c))}><X className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={(e) => handleTagKeyDown(e, cityInput, setCityInput, cities, setCities)}
                placeholder={t('monEspace.form.cities.placeholder')}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={() => handleAddTag(cityInput, setCityInput, cities, setCities)}>
                {t('monEspace.form.add')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Required Languages */}
      <div className="py-8 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Languages className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-primary">{t('monEspace.form.section.languages')}</h3>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs font-medium text-gray-500 px-1">
            <span>{t('monEspace.form.language')}</span>
            <span>{t('monEspace.form.language.written')}</span>
            <span>{t('monEspace.form.language.spoken')}</span>
            <span />
          </div>

          {languages.map((lang, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
              <Select value={lang.name} onValueChange={(v) => updateLanguage(i, 'name', v)}>
                <SelectTrigger><SelectValue placeholder={t('monEspace.form.language.placeholder')} /></SelectTrigger>
                <SelectContent>
                  {COMMON_LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={lang.writtenLevel} onValueChange={(v) => updateLanguage(i, 'writtenLevel', v)}>
                <SelectTrigger><SelectValue placeholder={t('monEspace.form.language.level.placeholder')} /></SelectTrigger>
                <SelectContent>
                  {LANGUAGE_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={lang.spokenLevel} onValueChange={(v) => updateLanguage(i, 'spokenLevel', v)}>
                <SelectTrigger><SelectValue placeholder={t('monEspace.form.language.level.placeholder')} /></SelectTrigger>
                <SelectContent>
                  {LANGUAGE_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => removeLanguage(i)}
                disabled={languages.length === 1}
                className="p-1.5 text-gray-400 hover:text-destructive transition-colors rounded disabled:opacity-30"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addLanguage} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            {t('monEspace.form.language.add')}
          </Button>
        </div>
      </div>

      {/* SECTION 4: Vacancy Text */}
      <div className="py-8 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-primary">
            {t('monEspace.form.section.vacancyText')} <span className="text-destructive">*</span>
          </h3>
        </div>
        <div className="space-y-1.5">
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('monEspace.form.description.placeholder')}
            rows={14}
            className={errors.description ? 'border-destructive text-sm' : 'text-sm'}
          />
          {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          <p className="text-xs text-gray-400">{t('monEspace.form.description.helper')}</p>
        </div>
      </div>

      {/* SECTION 5: Application Details */}
      <div className="py-8 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <CalendarCheck className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-primary">{t('monEspace.form.section.application')}</h3>
        </div>

        <div className="space-y-1.5">
          <Label>{t('monEspace.form.deadline')} <span className="text-destructive">*</span></Label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={`flex-1 ${errors.deadline ? 'border-destructive' : ''}`}
            />
            <Input
              type="time"
              value={deadlineTime}
              onChange={(e) => setDeadlineTime(e.target.value)}
              className="w-32"
            />
          </div>
          {errors.deadline && <p className="text-xs text-destructive">{errors.deadline}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="applicationLink">{t('monEspace.form.applicationLink')}</Label>
          <Input
            id="applicationLink"
            type="url"
            value={applicationLink}
            onChange={(e) => setApplicationLink(e.target.value)}
            placeholder="https://careers.example.org/apply"
          />
          <p className="text-xs text-gray-400">{t('monEspace.form.applicationLink.hint')}</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="privacy"
              checked={privacyAccepted}
              onCheckedChange={(checked) => setPrivacyAccepted(!!checked)}
              className="mt-0.5"
            />
            <Label htmlFor="privacy" className="text-sm font-normal leading-snug cursor-pointer">
              {t('monEspace.form.privacy')}
            </Label>
          </div>
          {errors.privacy && <p className="text-xs text-destructive">{errors.privacy}</p>}
        </div>
      </div>

      {/* Form Actions */}
      <div className="pt-6 flex flex-col sm:flex-row items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="w-full sm:w-auto">
          {t('monEspace.action.cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto min-w-[150px]">
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {submitLabel || t('monEspace.action.publish')}
        </Button>
      </div>
    </form>
  );
}
