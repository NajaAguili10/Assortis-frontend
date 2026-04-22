import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { MessageSquareQuote } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { RegionCountryFilter } from '@app/components/RegionCountryFilter';
import { SectorSubsectorFilter } from '@app/components/SectorSubsectorFilter';
import { Button } from '@app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { Textarea } from '@app/components/ui/textarea';
import {
  CountryEnum,
  RegionEnum,
  REGION_COUNTRY_MAP,
  SECTOR_SUBSECTOR_MAP,
  SectorEnum,
  SubSectorEnum,
} from '@app/types/tender.dto';
import { getLocalizedCountryName } from '@app/utils/country-translator';

interface QuoteFormData {
  organization: string;
  country: CountryEnum | '';
  contactPerson: string;
  functionTitle: string;
  phone: string;
  email: string;
  usersCount: string;
  comments: string;
  services: {
    matchingProjects: boolean;
    cvCredits: boolean;
    cvip: boolean;
    bidWriters: boolean;
    training: boolean;
  };
  acceptPolicies: boolean;
}

type QuoteFormErrors = Partial<Record<keyof QuoteFormData, string>>;

interface FieldWrapperProps {
  id: string;
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
  children: React.ReactNode;
}

function FieldWrapper({ id, label, required = false, description, error, children }: FieldWrapperProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold text-primary">
        {label}
        {required ? <span className="text-accent"> *</span> : null}
      </Label>
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

const serviceOptions = [
  { key: 'matchingProjects', label: 'Matching Projects' },
  { key: 'cvCredits', label: 'CV credits' },
  { key: 'cvip', label: 'CVIP' },
  { key: 'bidWriters', label: 'Bid writers' },
  { key: 'training', label: 'Training' },
] as const;

export default function AskForQuotePage() {
  const { t, language } = useLanguage();

  const [formData, setFormData] = useState<QuoteFormData>({
    organization: '',
    country: '',
    contactPerson: '',
    functionTitle: '',
    phone: '',
    email: '',
    usersCount: '',
    comments: '',
    services: {
      matchingProjects: false,
      cvCredits: false,
      cvip: false,
      bidWriters: false,
      training: false,
    },
    acceptPolicies: false,
  });

  const [submitted, setSubmitted] = useState(false);

  const [selectedSectors, setSelectedSectors] = useState<SectorEnum[]>([]);
  const [selectedSubSectors, setSelectedSubSectors] = useState<SubSectorEnum[]>([]);
  const [hoveredSector, setHoveredSector] = useState<SectorEnum | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<RegionEnum[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<CountryEnum[]>([]);

  const setFieldValue = <K extends keyof QuoteFormData>(key: K, value: QuoteFormData[K]) => {
    setFormData((previous) => ({ ...previous, [key]: value }));
  };

  const toggleService = (serviceKey: keyof QuoteFormData['services']) => {
    setFormData((previous) => ({
      ...previous,
      services: {
        ...previous.services,
        [serviceKey]: !previous.services[serviceKey],
      },
    }));
  };

  const toggleSector = (sector: SectorEnum) => {
    setSelectedSectors((previous) => (
      previous.includes(sector) ? previous.filter((item) => item !== sector) : [...previous, sector]
    ));
  };

  const toggleSubSector = (subSector: SubSectorEnum) => {
    setSelectedSubSectors((previous) => (
      previous.includes(subSector)
        ? previous.filter((item) => item !== subSector)
        : [...previous, subSector]
    ));
  };

  const toggleRegion = (region: RegionEnum) => {
    setSelectedRegions((previous) => (
      previous.includes(region) ? previous.filter((item) => item !== region) : [...previous, region]
    ));
  };

  const toggleCountry = (country: CountryEnum) => {
    setSelectedCountries((previous) => (
      previous.includes(country) ? previous.filter((item) => item !== country) : [...previous, country]
    ));
  };

  const errors = useMemo<QuoteFormErrors>(() => {
    const nextErrors: QuoteFormErrors = {};

    if (!formData.organization.trim()) nextErrors.organization = 'Organization is required.';
    if (!formData.country) nextErrors.country = 'Country is required.';
    if (!formData.contactPerson.trim()) nextErrors.contactPerson = 'Contact person is required.';
    if (!formData.phone.trim()) nextErrors.phone = 'Phone is required.';

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.usersCount.trim()) {
      nextErrors.usersCount = 'Number of users is required.';
    } else {
      const parsedUsers = Number(formData.usersCount);
      if (!Number.isInteger(parsedUsers) || parsedUsers <= 0) {
        nextErrors.usersCount = 'Number of users must be a positive integer.';
      }
    }

    if (!formData.acceptPolicies) {
      nextErrors.acceptPolicies = 'You must accept Privacy Policy and Terms of Use.';
    }

    return nextErrors;
  }, [formData]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    if (Object.keys(errors).length > 0) {
      toast.error('Please complete all required fields.');
      return;
    }

    toast.success('Quote request submitted successfully.');

    const payload = {
      ...formData,
      sectors: selectedSectors,
      subSectors: selectedSubSectors,
      regions: selectedRegions,
      countriesOfInterest: selectedCountries,
    };

    console.log('Quote request payload', payload);

    setFormData({
      organization: '',
      country: '',
      contactPerson: '',
      functionTitle: '',
      phone: '',
      email: '',
      usersCount: '',
      comments: '',
      services: {
        matchingProjects: false,
        cvCredits: false,
        cvip: false,
        bidWriters: false,
        training: false,
      },
      acceptPolicies: false,
    });
    setSelectedSectors([]);
    setSelectedSubSectors([]);
    setHoveredSector(null);
    setSelectedRegions([]);
    setSelectedCountries([]);
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        icon={MessageSquareQuote}
        title={t('services.quote.hero.title')}
        description={t('services.quote.hero.description')}
      />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <form className="space-y-6" onSubmit={onSubmit} noValidate>
            <Card>
              <CardHeader>
                <CardTitle>1. Contact Details</CardTitle>
                <CardDescription>Tell us who is requesting the quote and how we can contact your organization.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FieldWrapper
                  id="organization"
                  label="Organisation"
                  required
                  description="Name of the organization"
                  error={submitted ? errors.organization : undefined}
                >
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(event) => setFieldValue('organization', event.target.value)}
                    className={submitted && errors.organization ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  />
                </FieldWrapper>

                <FieldWrapper
                  id="country"
                  label="Country"
                  required
                  description="Organization HQ"
                  error={submitted ? errors.country : undefined}
                >
                  <Select value={formData.country || undefined} onValueChange={(value) => setFieldValue('country', value as CountryEnum)}>
                    <SelectTrigger id="country" className={submitted && errors.country ? 'border-red-500 focus-visible:ring-red-500' : ''}>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(CountryEnum).map((country) => (
                        <SelectItem key={country} value={country}>{getLocalizedCountryName(country, language)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldWrapper>

                <FieldWrapper
                  id="contact-person"
                  label="Contact person"
                  required
                  description="Name of person asking for the quote"
                  error={submitted ? errors.contactPerson : undefined}
                >
                  <Input
                    id="contact-person"
                    value={formData.contactPerson}
                    onChange={(event) => setFieldValue('contactPerson', event.target.value)}
                    className={submitted && errors.contactPerson ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  />
                </FieldWrapper>

                <FieldWrapper
                  id="function"
                  label="Function"
                  description="Role of the contact person"
                >
                  <Input
                    id="function"
                    value={formData.functionTitle}
                    onChange={(event) => setFieldValue('functionTitle', event.target.value)}
                  />
                </FieldWrapper>

                <FieldWrapper
                  id="phone"
                  label="Phone"
                  required
                  description="Phone of the contact person"
                  error={submitted ? errors.phone : undefined}
                >
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(event) => setFieldValue('phone', event.target.value)}
                    className={submitted && errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  />
                </FieldWrapper>

                <FieldWrapper
                  id="email"
                  label="E-mail"
                  required
                  description="Email of the contact person"
                  error={submitted ? errors.email : undefined}
                >
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(event) => setFieldValue('email', event.target.value)}
                    className={submitted && errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  />
                </FieldWrapper>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Services</CardTitle>
                <CardDescription>Select the services you are interested in and indicate how many users will need access.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {serviceOptions.map((option) => (
                    <label key={option.key} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={formData.services[option.key]}
                        onChange={() => toggleService(option.key)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>

                <div className="max-w-sm">
                  <FieldWrapper
                    id="users-count"
                    label="Number of users"
                    required
                    error={submitted ? errors.usersCount : undefined}
                  >
                    <Input
                      id="users-count"
                      type="number"
                      min={1}
                      value={formData.usersCount}
                      onChange={(event) => setFieldValue('usersCount', event.target.value)}
                      className={submitted && errors.usersCount ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                  </FieldWrapper>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Additional Input</CardTitle>
                <CardDescription>Share any additional wishes, context, or preferences for your quote request.</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldWrapper
                  id="comments"
                  label="Other wishes / comments"
                >
                  <Textarea
                    id="comments"
                    rows={5}
                    value={formData.comments}
                    onChange={(event) => setFieldValue('comments', event.target.value)}
                  />
                </FieldWrapper>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Sectors of Interest</CardTitle>
                <CardDescription>Select sectors and subsectors using the same configuration interface as the subscription page.</CardDescription>
              </CardHeader>
              <CardContent>
                <SectorSubsectorFilter
                  selectedSectors={selectedSectors}
                  selectedSubSectors={selectedSubSectors}
                  hoveredSector={hoveredSector}
                  onHoverSector={setHoveredSector}
                  onSelectSector={toggleSector}
                  onSelectSubSector={toggleSubSector}
                  onSelectAllSectors={() => {
                    if (selectedSectors.length === Object.values(SectorEnum).length) {
                      setSelectedSectors([]);
                      setSelectedSubSectors([]);
                    } else {
                      setSelectedSectors(Object.values(SectorEnum));
                    }
                  }}
                  onSelectAllSubSectors={(sector) => {
                    const sectorSubSectors = SECTOR_SUBSECTOR_MAP[sector] || [];
                    const allSelected = sectorSubSectors.every((subSector) =>
                      selectedSubSectors.includes(subSector)
                    );

                    if (allSelected) {
                      setSelectedSubSectors((previous) =>
                        previous.filter((item) => !sectorSubSectors.includes(item))
                      );
                    } else {
                      setSelectedSubSectors((previous) => [
                        ...new Set([...previous, ...sectorSubSectors]),
                      ]);
                    }
                  }}
                  t={t}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Countries of Interest</CardTitle>
                <CardDescription>Select regions and countries using the same configuration interface as the subscription page.</CardDescription>
              </CardHeader>
              <CardContent>
                <RegionCountryFilter
                  selectedRegions={selectedRegions}
                  selectedCountries={selectedCountries}
                  onSelectRegion={toggleRegion}
                  onSelectCountry={toggleCountry}
                  onSelectAllRegions={() => {
                    if (selectedRegions.length === Object.values(RegionEnum).length) {
                      setSelectedRegions([]);
                      setSelectedCountries([]);
                    } else {
                      setSelectedRegions(Object.values(RegionEnum));
                    }
                  }}
                  t={t}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Compliance & Submission</CardTitle>
                <CardDescription>Please confirm legal acceptance before continuing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 text-sm">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4"
                    checked={formData.acceptPolicies}
                    onChange={(event) => setFieldValue('acceptPolicies', event.target.checked)}
                  />
                  <span>
                    I accept the{' '}
                    <Link to="/privacy-policy" className="text-accent underline underline-offset-2">Privacy Policy</Link>
                    {' '}and{' '}
                    <Link to="/terms-of-service" className="text-accent underline underline-offset-2">Terms of Use</Link>
                  </span>
                </label>
                {submitted && errors.acceptPolicies ? (
                  <p className="text-xs text-red-600">{errors.acceptPolicies}</p>
                ) : null}

                <div>
                  <Button type="submit" className="min-h-11">Continue</Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    By clicking on Continue, you request a price proposal; this request is not binding to you.
                  </p>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </PageContainer>
    </div>
  );
}
