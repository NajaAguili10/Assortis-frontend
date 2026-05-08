import React, { useMemo, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { JobLanguageRequirement, JobOfferApplicationMethod, JobOfferCreateDTO, JobOfferTypeEnum } from '../types/JobOffer.dto';
import { COUNTRY_GROUPS, LANGUAGE_OPTIONS, SECTOR_GROUPS, SENIORITY_OPTIONS } from '../../expert/data/expertSearchFilters';
import { ProjectSectorEnum, ProjectTypeEnum } from '../../../types/project.dto';
import { Briefcase, Building2, CalendarCheck, FileImage, FileText, Globe, Loader2, Plus, Search, Target, Trash2, Upload, X } from 'lucide-react';
import { GroupedSelection } from './GroupedSelection';
import { RichTextEditor } from './RichTextEditor';
import { useProjectsContext } from '@app/contexts/ProjectsContext';

interface JobFormProps {
  onSubmit: (data: JobOfferCreateDTO) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<JobOfferCreateDTO>;
  submitLabel?: string;
  organisationName?: string;
}

type ActiveVacancyType = JobOfferTypeEnum.PROJECT_LINKED | JobOfferTypeEnum.INTERNAL | JobOfferTypeEnum.PROJECT_NEW;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LANGUAGE_LEVELS = ['Basic', 'Good', 'Very Good', 'Excellent', 'Native'];

const FUNCTION_GROUPS = [
  { label: 'Programme', options: ['Project Manager', 'Programme Manager', 'Monitoring & Evaluation Specialist', 'Technical Expert'] },
  { label: 'Operations', options: ['Finance Manager', 'Procurement Specialist', 'HR Officer', 'Administrative Officer'] },
  { label: 'Technical', options: ['Engineer', 'Researcher', 'IT Specialist', 'Communication Specialist'] },
  { label: 'Leadership', options: ['Team Leader', 'Country Director', 'Department Head'] },
];

const CITY_OPTIONS: Record<string, string[]> = {
  Armenia: ['Yerevan', 'Shirak Province', 'Artashat', 'Armavir', 'Gavar', 'Gyumri', 'Lori Province', 'Ashtarak', 'Hrazdan', 'Vanadzor'],
  Azerbaijan: ['Baku', 'Ganja', 'Sumqayit', 'Mingachevir', 'Khirdalan', 'Shirvan', 'Shaki', 'Yevlakh'],
  Belarus: ['Minsk', 'Gomel', 'Mogilev', 'Vitebsk', 'Grodno', 'Brest', 'Bobruisk', 'Baranovichi', 'Pinsk', 'Orsha'],
};

const normalizeType = (type?: JobOfferTypeEnum): ActiveVacancyType => {
  if (type === JobOfferTypeEnum.INTERNAL) return JobOfferTypeEnum.INTERNAL;
  if (type === JobOfferTypeEnum.PROJECT_NEW) return JobOfferTypeEnum.PROJECT_NEW;
  return JobOfferTypeEnum.PROJECT_LINKED;
};

const stripHtml = (html: string) => {
  const element = document.createElement('div');
  element.innerHTML = html;
  return element.innerText || element.textContent || '';
};

const toggleValue = (values: string[], value: string) =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

const buildLocation = (countries: string[], cities: string[], customCities: string[], homeBased: boolean) => {
  const parts = [...countries, ...cities, ...customCities];
  if (homeBased) parts.unshift('Home-Based');
  return Array.from(new Set(parts)).join(', ');
};

export function JobForm({
  onSubmit,
  onCancel,
  initialData,
  submitLabel,
  organisationName = 'Assortis',
}: JobFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { projects: allProjects } = useProjectsContext();
  const [linkedProjectSearch, setLinkedProjectSearch] = useState('');
  const [linkedProjectId, setLinkedProjectId] = useState(initialData?.linkedProjectId || '');

  const filteredLinkedProjects = useMemo(() => {
    const q = linkedProjectSearch.trim().toLowerCase();
    return q
      ? allProjects.filter((p) =>
          p.title.toLowerCase().includes(q) ||
          (p.code || '').toLowerCase().includes(q)
        )
      : allProjects;
  }, [allProjects, linkedProjectSearch]);

  const [vacancyType, setVacancyType] = useState<ActiveVacancyType>(normalizeType(initialData?.type));
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || '');
  const [jobTitle, setJobTitle] = useState(initialData?.jobTitle || '');
  const [functionQuery, setFunctionQuery] = useState('');
  const [jobFunction, setJobFunction] = useState(initialData?.jobFunction || '');
  const [otherFunction, setOtherFunction] = useState(initialData?.otherFunction || '');

  const [projectTitle, setProjectTitle] = useState(initialData?.projectTitle || '');
  const [projectSummary, setProjectSummary] = useState(initialData?.projectSummary || '');
  const [projectSummaryPlainText, setProjectSummaryPlainText] = useState(stripHtml(initialData?.projectSummary || ''));
  const [projectDescription, setProjectDescription] = useState(initialData?.projectDescription || '');
  const [projectDescriptionPlainText, setProjectDescriptionPlainText] = useState(initialData?.projectDescriptionPlainText || '');
  const [projectSectors, setProjectSectors] = useState<string[]>(initialData?.projectSectors || []);
  const [projectCountries, setProjectCountries] = useState<string[]>(initialData?.projectCountries || []);
  const [projectCategories, setProjectCategories] = useState<string[]>(initialData?.projectCategories || []);

  const [sectors, setSectors] = useState<string[]>(initialData?.sectors || []);
  const [subSectors, setSubSectors] = useState<string[]>(initialData?.subSectors || []);
  const [regions, setRegions] = useState<string[]>(initialData?.regions || []);
  const [countries, setCountries] = useState<string[]>(initialData?.countries || []);
  const [cities, setCities] = useState<string[]>(initialData?.cities || []);
  const [customCityInput, setCustomCityInput] = useState((initialData?.customCities || []).join(', '));
  const [homeBased, setHomeBased] = useState(Boolean(initialData?.homeBased));

  const [languages, setLanguages] = useState<JobLanguageRequirement[]>(
    initialData?.languages?.length ? initialData.languages : [{ name: '', spokenLevel: '', writtenLevel: '' }],
  );

  const [description, setDescription] = useState(initialData?.description || '');
  const [descriptionPlainText, setDescriptionPlainText] = useState(initialData?.descriptionPlainText || stripHtml(initialData?.description || ''));
  const [deadline, setDeadline] = useState(initialData?.deadline || '');
  const [deadlineTime, setDeadlineTime] = useState(initialData?.deadlineTime || '');
  const [restrictions, setRestrictions] = useState(initialData?.restrictions || '');
  const [seniority, setSeniority] = useState(initialData?.seniority || '');
  const [contractDurationDays, setContractDurationDays] = useState(initialData?.contractDurationDays?.toString() || '');
  const [estimatedStartDate, setEstimatedStartDate] = useState(initialData?.estimatedStartDate || '');
  const [applicationMethod, setApplicationMethod] = useState<JobOfferApplicationMethod>(initialData?.applicationMethod || 'CONTACT_PERSON');
  const [contactPerson, setContactPerson] = useState(initialData?.contactPerson || '');
  const [contactPersonFunction, setContactPersonFunction] = useState(initialData?.contactPersonFunction || '');
  const [contactEmail, setContactEmail] = useState(initialData?.contactEmail || '');
  const [applicationLink, setApplicationLink] = useState(initialData?.applicationLink || initialData?.applicationUrl || '');
  const [legalAccepted, setLegalAccepted] = useState(Boolean(initialData?.privacyPolicyAccepted));

  const customCities = useMemo(() => customCityInput.split(',').map((city) => city.trim()).filter(Boolean), [customCityInput]);
  const selectedLocation = useMemo(() => buildLocation(countries, cities, customCities, homeBased), [countries, cities, customCities, homeBased]);
  const filteredFunctionGroups = useMemo(() => {
    const query = functionQuery.trim().toLowerCase();
    return FUNCTION_GROUPS.map((group) => ({
      ...group,
      options: query ? group.options.filter((option) => option.toLowerCase().includes(query)) : group.options,
    })).filter((group) => group.options.length > 0);
  }, [functionQuery]);
  const availableCities = useMemo(() => countries.flatMap((country) => CITY_OPTIONS[country] || []), [countries]);
  const actionLabel = submitLabel || (vacancyType === JobOfferTypeEnum.PROJECT_NEW ? 'CREATE PROJECT & VACANCY' : 'CREATE VACANCY');

  const handleLogoFile = (file?: File) => {
    if (!file || !['image/jpeg', 'image/png'].includes(file.type)) return;
    const reader = new FileReader();
    reader.onload = (event) => setLogoUrl(String(event.target?.result || ''));
    reader.readAsDataURL(file);
  };

  const updateLanguage = (index: number, field: keyof JobLanguageRequirement, value: string) => {
    setLanguages((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  };

  const resetForm = () => {
    setVacancyType(JobOfferTypeEnum.PROJECT_LINKED);
    setLinkedProjectId('');
    setLinkedProjectSearch('');
    setLogoUrl('');
    setJobTitle('');
    setFunctionQuery('');
    setJobFunction('');
    setOtherFunction('');
    setProjectTitle('');
    setProjectSummary('');
    setProjectSummaryPlainText('');
    setProjectDescription('');
    setProjectDescriptionPlainText('');
    setProjectSectors([]);
    setProjectCountries([]);
    setProjectCategories([]);
    setSectors([]);
    setSubSectors([]);
    setRegions([]);
    setCountries([]);
    setCities([]);
    setCustomCityInput('');
    setHomeBased(false);
    setLanguages([{ name: '', spokenLevel: '', writtenLevel: '' }]);
    setDescription('');
    setDescriptionPlainText('');
    setDeadline('');
    setDeadlineTime('');
    setRestrictions('');
    setSeniority('');
    setContractDurationDays('');
    setEstimatedStartDate('');
    setApplicationMethod('CONTACT_PERSON');
    setContactPerson('');
    setContactPersonFunction('');
    setContactEmail('');
    setApplicationLink('');
    setLegalAccepted(false);
    setErrors({});
    onCancel();
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!jobTitle.trim()) nextErrors.jobTitle = 'Title is required.';
    if (!jobFunction && !otherFunction.trim()) nextErrors.jobFunction = 'Function is required.';
    if (!descriptionPlainText.trim()) nextErrors.description = 'Vacancy text is required.';
    if (!deadline) nextErrors.deadline = 'Application deadline is required.';
    if (vacancyType !== JobOfferTypeEnum.INTERNAL && !projectSummaryPlainText.trim() && !projectSummary.trim()) nextErrors.projectSummary = 'Project summary is required.';
    if (vacancyType === JobOfferTypeEnum.PROJECT_NEW && !projectTitle.trim()) nextErrors.projectTitle = 'Project title is required.';
    if (applicationMethod === 'CONTACT_PERSON') {
      if (!contactPerson.trim()) nextErrors.contactPerson = 'Contact person name is required.';
      if (!contactEmail.trim() || !emailRegex.test(contactEmail)) nextErrors.contactEmail = 'A valid contact email is required.';
    }
    if (applicationMethod === 'EXTERNAL_LINK') {
      try {
        new URL(applicationLink);
      } catch {
        nextErrors.applicationLink = 'A valid application link is required.';
      }
    }
    if (!legalAccepted) nextErrors.legal = 'Privacy Policy and Terms of Use acceptance is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const days = Number(contractDurationDays);
      const data: JobOfferCreateDTO = {
        publishOnBoard: true,
        linkedProjectId: vacancyType === JobOfferTypeEnum.PROJECT_LINKED ? linkedProjectId || initialData?.linkedProjectId : undefined,
        organisationName,
        logoUrl: logoUrl || undefined,
        jobTitle: jobTitle.trim(),
        jobFunction: jobFunction || otherFunction.trim(),
        otherFunction: otherFunction.trim() || undefined,
        location: selectedLocation || 'Global',
        regions,
        countries,
        cities,
        customCities,
        sectors,
        subSectors,
        homeBased,
        projectTitle: vacancyType === JobOfferTypeEnum.INTERNAL ? undefined : projectTitle.trim(),
        projectSummary: vacancyType === JobOfferTypeEnum.INTERNAL ? undefined : projectSummary || projectSummaryPlainText,
        projectDescription,
        projectDescriptionPlainText,
        projectSectors,
        projectCountries,
        projectCategories,
        type: vacancyType,
        duration: days > 0 ? `${days} days` : '',
        contractDurationDays: Number.isFinite(days) && days > 0 ? days : undefined,
        seniority: seniority || undefined,
        restrictions: restrictions.trim() || undefined,
        languages: languages.filter((language) => language.name || language.spokenLevel || language.writtenLevel),
        description,
        descriptionPlainText,
        deadline,
        deadlineTime: deadlineTime || undefined,
        estimatedStartDate: estimatedStartDate || undefined,
        applicationMethod,
        contactPerson: applicationMethod === 'CONTACT_PERSON' ? contactPerson.trim() : undefined,
        contactPersonFunction: applicationMethod === 'CONTACT_PERSON' ? contactPersonFunction.trim() || undefined : undefined,
        contactEmail: applicationMethod === 'CONTACT_PERSON' ? contactEmail.trim() : undefined,
        applicationLink: applicationMethod === 'EXTERNAL_LINK' ? applicationLink.trim() : undefined,
        privacyPolicyAccepted: legalAccepted,
      };
      await onSubmit(data);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">Assortis Job Posting</p>
            <h2 className="mt-1 text-xl font-semibold text-primary">{organisationName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Create professional vacancies for project and in-house recruitment.</p>
          </div>
          <div
            className="flex min-h-28 w-full max-w-sm items-center gap-4 rounded-lg border border-dashed bg-slate-50 p-4"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              handleLogoFile(event.dataTransfer.files?.[0]);
            }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Organisation logo preview" className="h-16 w-16 rounded-md border bg-white object-contain p-1" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-md border bg-white text-muted-foreground">
                <FileImage className="h-6 w-6" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-primary">Organisation logo</p>
              <p className="text-xs text-muted-foreground">Drop JPG/PNG here or upload.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <label className="inline-flex h-8 cursor-pointer items-center rounded-md border px-3 text-xs font-medium hover:bg-white">
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  {logoUrl ? 'Replace' : 'Upload'}
                  <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(event) => handleLogoFile(event.target.files?.[0])} />
                </label>
                {logoUrl && (
                  <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => setLogoUrl('')}>
                    <X className="mr-1 h-3.5 w-3.5" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-primary">Vacancy type</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { type: JobOfferTypeEnum.PROJECT_LINKED, title: 'Existing Project', description: 'Link to a project already in Assortis.', icon: Briefcase },
            { type: JobOfferTypeEnum.INTERNAL, title: 'In-House Vacancy', description: 'Recruit internally for the organisation.', icon: Building2 },
            { type: JobOfferTypeEnum.PROJECT_NEW, title: 'New Project + Vacancy', description: 'Create a project during this workflow.', icon: Plus },
          ].map((item) => {
            const Icon = item.icon;
            const active = vacancyType === item.type;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => setVacancyType(item.type as ActiveVacancyType)}
                className={`rounded-lg border p-4 text-left transition ${active ? 'border-accent bg-accent/5 ring-2 ring-accent/15' : 'bg-white hover:border-accent/40'}`}
              >
                <Icon className={`mb-3 h-5 w-5 ${active ? 'text-accent' : 'text-muted-foreground'}`} />
                <p className="font-semibold text-primary">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <FileText className="h-5 w-5 text-accent" />
          <h3 className="text-base font-semibold text-primary">Vacancy Details</h3>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="jobTitle">Title <span className="text-destructive">*</span></Label>
            <Input id="jobTitle" value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} className={errors.jobTitle ? 'border-destructive' : ''} />
            {errors.jobTitle && <p className="text-xs text-destructive">{errors.jobTitle}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Function <span className="text-destructive">*</span></Label>
            <Input value={functionQuery} onChange={(event) => setFunctionQuery(event.target.value)} placeholder="Search functions" className="mb-2" />
            <div className={`max-h-44 overflow-y-auto rounded-md border bg-slate-50 p-2 ${errors.jobFunction ? 'border-destructive' : ''}`}>
              {filteredFunctionGroups.map((group) => (
                <div key={group.label} className="mb-2 last:mb-0">
                  <p className="px-2 pb-1 text-xs font-semibold uppercase text-muted-foreground">{group.label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.options.map((option) => (
                      <Button key={option} type="button" size="sm" variant={jobFunction === option ? 'default' : 'outline'} className="h-8 text-xs" onClick={() => setJobFunction(option)}>
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {errors.jobFunction && <p className="text-xs text-destructive">{errors.jobFunction}</p>}
          </div>
          <div className="space-y-1.5 lg:col-span-2">
            <Label>Other function</Label>
            <Input value={otherFunction} onChange={(event) => setOtherFunction(event.target.value)} placeholder="Fill this if no matching function exists" />
          </div>
        </div>
      </section>

      {vacancyType !== JobOfferTypeEnum.INTERNAL && (
        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-accent" />
            <h3 className="text-base font-semibold text-primary">{vacancyType === JobOfferTypeEnum.PROJECT_NEW ? 'Project Creation' : 'Project'}</h3>
          </div>
          {vacancyType === JobOfferTypeEnum.PROJECT_LINKED && (
            <div className="mb-5 space-y-2">
              <Label>Select existing project <span className="text-destructive">*</span></Label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={linkedProjectSearch}
                  onChange={(e) => setLinkedProjectSearch(e.target.value)}
                  placeholder="Search by name or reference…"
                  className="pl-9"
                />
              </div>
              <div className="max-h-48 overflow-y-auto rounded-md border bg-slate-50">
                {filteredLinkedProjects.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">No projects found.</p>
                ) : (
                  filteredLinkedProjects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => {
                        setLinkedProjectId(project.id);
                        setProjectTitle(project.title);
                        setLinkedProjectSearch('');
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition hover:bg-accent/10 ${
                        linkedProjectId === project.id ? 'bg-accent/10 font-semibold text-accent' : 'text-primary'
                      }`}
                    >
                      <span className="block font-medium">{project.title}</span>
                      {project.code && (
                        <span className="text-xs text-muted-foreground">{project.code}</span>
                      )}
                    </button>
                  ))
                )}
              </div>
              {linkedProjectId && (
                <p className="text-xs text-emerald-600">
                  Selected: {allProjects.find((p) => p.id === linkedProjectId)?.title}
                </p>
              )}
            </div>
          )}
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Project title {vacancyType === JobOfferTypeEnum.PROJECT_NEW && <span className="text-destructive">*</span>}</Label>
              <Input value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} className={errors.projectTitle ? 'border-destructive' : ''} />
              {errors.projectTitle && <p className="text-xs text-destructive">{errors.projectTitle}</p>}
            </div>
            {vacancyType === JobOfferTypeEnum.PROJECT_NEW && (
              <div className="space-y-1.5">
                <Label>Project categories</Label>
                <Select value={projectCategories[0] || ''} onValueChange={(value) => setProjectCategories([value])}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {Object.values(ProjectTypeEnum).map((option) => <SelectItem key={option} value={option}>{option.replace(/_/g, ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5 lg:col-span-2">
              <Label>Project summary <span className="text-destructive">*</span></Label>
              <RichTextEditor
                value={projectSummary}
                error={Boolean(errors.projectSummary)}
                placeholder="Summarize project objectives, context, and expected results."
                minHeightClassName="min-h-[120px]"
                onChange={(html, plainText) => {
                  setProjectSummary(html);
                  setProjectSummaryPlainText(plainText);
                }}
              />
              {errors.projectSummary && <p className="text-xs text-destructive">{errors.projectSummary}</p>}
            </div>
            {vacancyType === JobOfferTypeEnum.PROJECT_NEW && (
              <>
                <div className="space-y-1.5 lg:col-span-2">
                  <Label>Project description</Label>
                  <RichTextEditor
                    value={projectDescription}
                    placeholder="Describe scope, activities, and implementation context."
                    onChange={(html, plainText) => {
                      setProjectDescription(html);
                      setProjectDescriptionPlainText(plainText);
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Project sectors</Label>
                  <Select value={projectSectors[0] || ''} onValueChange={(value) => setProjectSectors([value])}>
                    <SelectTrigger><SelectValue placeholder="Select project sector" /></SelectTrigger>
                    <SelectContent>
                      {Object.values(ProjectSectorEnum).map((option) => <SelectItem key={option} value={option}>{option.replace(/_/g, ' ')}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Project countries</Label>
                  <Input value={projectCountries.join(', ')} onChange={(event) => setProjectCountries(event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} placeholder="Countries separated by commas" />
                </div>
              </>
            )}
          </div>
        </section>
      )}

      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Globe className="h-5 w-5 text-accent" />
          <h3 className="text-base font-semibold text-primary">Location</h3>
        </div>
        <GroupedSelection
          title="Regions and Countries"
          groupLabel="Region"
          optionLabel="Country"
          groups={COUNTRY_GROUPS}
          selectedGroups={regions}
          selectedOptions={countries}
          onSelectedGroupsChange={setRegions}
          onSelectedOptionsChange={setCountries}
          includeHomeBased
          homeBased={homeBased}
          onHomeBasedChange={setHomeBased}
        />
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-primary">Cities</p>
              {availableCities.length > 0 && (
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setCities(availableCities.every((city) => cities.includes(city)) ? [] : Array.from(new Set([...cities, ...availableCities])))}>
                  Select all
                </Button>
              )}
            </div>
            <div className="max-h-44 space-y-1 overflow-y-auto">
              {availableCities.length === 0 ? (
                <p className="text-sm text-muted-foreground">Select Armenia, Azerbaijan, or Belarus to load example cities.</p>
              ) : availableCities.map((city) => (
                <label key={city} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-white">
                  <Checkbox checked={cities.includes(city)} onCheckedChange={() => setCities(toggleValue(cities, city))} />
                  <span>{city}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>and/or fill another city</Label>
            <Textarea value={customCityInput} onChange={(event) => setCustomCityInput(event.target.value)} rows={5} placeholder="Multiple custom cities separated with commas" />
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Target className="h-5 w-5 text-accent" />
          <h3 className="text-base font-semibold text-primary">Required Expertise</h3>
        </div>
        <GroupedSelection
          title="Sectors"
          groupLabel="Sector"
          optionLabel="Sub-sector"
          groups={SECTOR_GROUPS}
          selectedGroups={sectors}
          selectedOptions={subSectors}
          onSelectedGroupsChange={setSectors}
          onSelectedOptionsChange={setSubSectors}
        />
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <h3 className="mb-5 text-base font-semibold text-primary">Languages</h3>
        <div className="space-y-3">
          {languages.map((language, index) => (
            <div key={index} className="grid gap-2 rounded-lg border bg-slate-50 p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
              <Select value={language.name} onValueChange={(value) => updateLanguage(index, 'name', value)}>
                <SelectTrigger><SelectValue placeholder="Language" /></SelectTrigger>
                <SelectContent>{LANGUAGE_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={language.spokenLevel} onValueChange={(value) => updateLanguage(index, 'spokenLevel', value)}>
                <SelectTrigger><SelectValue placeholder="Spoken" /></SelectTrigger>
                <SelectContent>{LANGUAGE_LEVELS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={language.writtenLevel} onValueChange={(value) => updateLanguage(index, 'writtenLevel', value)}>
                <SelectTrigger><SelectValue placeholder="Written" /></SelectTrigger>
                <SelectContent>{LANGUAGE_LEVELS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
              </Select>
              <Button type="button" variant="ghost" size="sm" onClick={() => setLanguages((current) => current.filter((_, itemIndex) => itemIndex !== index))} disabled={languages.length === 1}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setLanguages((current) => [...current, { name: '', spokenLevel: '', writtenLevel: '' }])}>
            <Plus className="mr-2 h-4 w-4" />
            Add language
          </Button>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <h3 className="mb-5 text-base font-semibold text-primary">Vacancy text</h3>
        <RichTextEditor
          value={description}
          error={Boolean(errors.description)}
          placeholder="Describe responsibilities, expected outputs, qualifications, and application instructions."
          onChange={(html, plainText) => {
            setDescription(html);
            setDescriptionPlainText(plainText);
          }}
        />
        {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description}</p>}
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-accent" />
          <h3 className="text-base font-semibold text-primary">Application Details</h3>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Application deadline <span className="text-destructive">*</span></Label>
            <Input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} className={errors.deadline ? 'border-destructive' : ''} />
            {errors.deadline && <p className="text-xs text-destructive">{errors.deadline}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Deadline hour</Label>
            <Input type="time" value={deadlineTime} onChange={(event) => setDeadlineTime(event.target.value)} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Restrictions</Label>
            <Input value={restrictions} onChange={(event) => setRestrictions(event.target.value)} placeholder="EU nationalities consultants, US consultants, Consultants from ADB countries" />
          </div>
          <div className="space-y-1.5">
            <Label>Seniority</Label>
            <Select value={seniority} onValueChange={setSeniority}>
              <SelectTrigger><SelectValue placeholder="Select seniority" /></SelectTrigger>
              <SelectContent>{SENIORITY_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Contract duration</Label>
            <Input type="number" min="1" value={contractDurationDays} onChange={(event) => setContractDurationDays(event.target.value)} placeholder="Number of days" />
          </div>
          <div className="space-y-1.5">
            <Label>Estimated contract start</Label>
            <Input type="date" value={estimatedStartDate} onChange={(event) => setEstimatedStartDate(event.target.value)} />
          </div>
          <div className="space-y-3 md:col-span-2">
            <Label>Send applications to</Label>
            <RadioGroup value={applicationMethod} onValueChange={(value) => setApplicationMethod(value as JobOfferApplicationMethod)} className="grid gap-3 md:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3">
                <RadioGroupItem value="CONTACT_PERSON" />
                <span className="text-sm font-medium">Contact Person</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3">
                <RadioGroupItem value="EXTERNAL_LINK" />
                <span className="text-sm font-medium">External Application Link</span>
              </label>
            </RadioGroup>
          </div>
          {applicationMethod === 'CONTACT_PERSON' ? (
            <>
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={contactPerson} onChange={(event) => setContactPerson(event.target.value)} className={errors.contactPerson ? 'border-destructive' : ''} />
                {errors.contactPerson && <p className="text-xs text-destructive">{errors.contactPerson}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Function</Label>
                <Input value={contactPersonFunction} onChange={(event) => setContactPersonFunction(event.target.value)} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Email</Label>
                <Input type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} className={errors.contactEmail ? 'border-destructive' : ''} />
                {errors.contactEmail && <p className="text-xs text-destructive">{errors.contactEmail}</p>}
              </div>
            </>
          ) : (
            <div className="space-y-1.5 md:col-span-2">
              <Label>Application link</Label>
              <Input type="url" value={applicationLink} onChange={(event) => setApplicationLink(event.target.value)} className={errors.applicationLink ? 'border-destructive' : ''} />
              {errors.applicationLink && <p className="text-xs text-destructive">{errors.applicationLink}</p>}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <Checkbox checked={legalAccepted} onCheckedChange={(checked) => setLegalAccepted(Boolean(checked))} className="mt-0.5" />
          <span>I accept the Privacy Policy and Terms of Use of Assortis.</span>
        </label>
        {errors.legal && <p className="mt-2 text-xs text-destructive">{errors.legal}</p>}
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting}>
          Clear selection
        </Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-52">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {actionLabel}
        </Button>
      </div>
    </form>
  );
}
