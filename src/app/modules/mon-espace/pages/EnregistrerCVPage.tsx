import { toast } from 'sonner';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { PageBanner } from '../../../components/PageBanner';
import { PageContainer } from '../../../components/PageContainer';
import { MonEspaceSubMenu } from '../../../components/MonEspaceSubMenu';
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
import { Checkbox } from '../../../components/ui/checkbox';
import { Badge } from '../../../components/ui/badge';
import {
  FileUser,
  ArrowLeft,
  User,
  Upload,
  Briefcase,
  Award,
  GraduationCap,
  Languages as LanguagesIcon,
  Calendar,
  Save,
  Plus,
  X,
} from 'lucide-react';
import { getCountriesSorted } from '../../../config/countries.config';
import { SUBSECTOR_MAP } from '../../../config/subsectors.config';
import { SectorEnum } from '../../../types/tender.dto';
import {
  PROFESSIONAL_TITLES,
  COMMON_SKILLS,
  COMMON_LANGUAGES,
  COMMON_CERTIFICATIONS,
  COMMON_ORGANIZATIONS,
  YEARS_OF_EXPERIENCE,
  getYearOptions,
  getFutureYearOptions,
  MONTHS_I18N,
} from '../../../config/professional.config';

export default function EnregistrerCVPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    title: '',
    level: 'JUNIOR',
    yearsExperience: '0-2',
    sectors: [] as string[],
    subsectors: [] as string[],
    skills: [],
    availability: 'NOT_AVAILABLE',
    availableFrom: '',
    dailyRate: '',
    currency: 'USD',
  });

  const [experiences, setExperiences] = useState<any[]>([]);

  const [education, setEducation] = useState<any[]>([]);

  const [languages, setLanguages] = useState<any[]>([]);

  const [certifications, setCertifications] = useState<any[]>([]);

  const [newSkill, setNewSkill] = useState('');

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load user data and existing CV data on mount
  useEffect(() => {
    if (user) {
      // Try to load existing CV data from localStorage
      const storedCVData = localStorage.getItem(`assortis_cv_${user.id}`);
      
      if (storedCVData) {
        try {
          const parsedCVData = JSON.parse(storedCVData);
          setIsEditMode(true);
          
          // Load all CV fields
          if (parsedCVData.formData) {
            setFormData(parsedCVData.formData);
          }
          
          if (parsedCVData.experiences) {
            setExperiences(parsedCVData.experiences);
          }
          
          if (parsedCVData.education) {
            setEducation(parsedCVData.education);
          }
          
          if (parsedCVData.languages) {
            setLanguages(parsedCVData.languages);
          }
          
          if (parsedCVData.certifications) {
            setCertifications(parsedCVData.certifications);
          }
          
          if (parsedCVData.profilePhoto) {
            setProfilePhoto(parsedCVData.profilePhoto);
          }
          
          if (parsedCVData.cvFileName) {
            setCvFileName(parsedCVData.cvFileName);
          }
          
          toast.success(t('monEspace.cv.profileLoaded'));
        } catch (error) {
          console.error('Error loading CV data:', error);
        }
      } else {
        // New CV - set basic info from user
        setFormData((prevData) => ({
          ...prevData,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
        }));
      }
    }
  }, [user, t]);

  const countries = useMemo(() => getCountriesSorted(language as 'en' | 'fr' | 'es'), [language]);
  const yearOptions = useMemo(() => getYearOptions(), []);
  const futureYearOptions = useMemo(() => getFutureYearOptions(), []);

  const availableSubsectors = useMemo(() => {
    const subsectors: string[] = [];
    formData.sectors.forEach((sector) => {
      const sectorSubsectors = SUBSECTOR_MAP[sector as SectorEnum] || []
      subsectors.push(...sectorSubsectors);
    });
    return [...new Set(subsectors)];
  }, [formData.sectors]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
        toast.success(t('monEspace.cv.photoUpdated'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCVChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(t('monEspace.cv.upload.invalidType'));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('monEspace.cv.upload.tooLarge'));
        return;
      }
      setCvFile(file);
      setCvFileName(file.name);
      toast.success(t('monEspace.cv.upload.success'));
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
  };

  const handleSectorToggle = (sector: string) => {
    let newSectors: string[];
    if (formData.sectors.includes(sector)) {
      newSectors = formData.sectors.filter((s) => s !== sector);
    } else {
      newSectors = [...formData.sectors, sector];
    }
    
    const validSubsectors: string[] = [];
    newSectors.forEach((s) => {
      const sectorSubs = SUBSECTOR_MAP[s as SectorEnum] || [];
      sectorSubs.forEach((sub) => {
        if (formData.subsectors.includes(sub)) {
          validSubsectors.push(sub);
        }
      });
    });
    
    setFormData({ ...formData, sectors: newSectors, subsectors: validSubsectors });
  };

  const handleSubsectorToggle = (subsector: string) => {
    if (formData.subsectors.includes(subsector)) {
      setFormData({ ...formData, subsectors: formData.subsectors.filter((s) => s !== subsector) });
    } else {
      setFormData({ ...formData, subsectors: [...formData.subsectors, subsector] });
    }
  };

  const handleAddExperience = () => {
    const newExp = {
      id: Date.now().toString(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    };
    setExperiences([...experiences, newExp]);
  };

  const handleRemoveExperience = (id: string) => {
    setExperiences(experiences.filter((exp) => exp.id !== id));
  };

  const handleExperienceChange = (id: string, field: string, value: any) => {
    setExperiences(
      experiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const handleAddEducation = () => {
    const newEdu = {
      id: Date.now().toString(),
      degree: '',
      institution: '',
      field: '',
      year: '',
    };
    setEducation([...education, newEdu]);
  };

  const handleRemoveEducation = (id: string) => {
    setEducation(education.filter((edu) => edu.id !== id));
  };

  const handleEducationChange = (id: string, field: string, value: any) => {
    setEducation(education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)));
  };

  const handleAddLanguage = () => {
    const newLang = {
      id: Date.now().toString(),
      name: '',
      level: '',
    };
    setLanguages([...languages, newLang]);
  };

  const handleRemoveLanguage = (id: string) => {
    setLanguages(languages.filter((lang) => lang.id !== id));
  };

  const handleLanguageChange = (id: string, field: string, value: any) => {
    setLanguages(languages.map((lang) => (lang.id === id ? { ...lang, [field]: value } : lang)));
  };

  const handleAddCertification = () => {
    const newCert = {
      id: Date.now().toString(),
      name: '',
      issuer: '',
      date: '',
      expiryDate: '',
    };
    setCertifications([...certifications, newCert]);
  };

  const handleRemoveCertification = (id: string) => {
    setCertifications(certifications.filter((cert) => cert.id !== id));
  };

  const handleCertificationChange = (id: string, field: string, value: any) => {
    setCertifications(
      certifications.map((cert) => (cert.id === id ? { ...cert, [field]: value } : cert))
    );
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // ========== CHAMPS OBLIGATOIRES POUR UN CV ==========
    
    // 1. Informations personnelles obligatoires
    if (!formData.firstName.trim()) {
      errors.firstName = t('monEspace.cv.validation.firstNameRequired');
    }
    if (!formData.lastName.trim()) {
      errors.lastName = t('monEspace.cv.validation.lastNameRequired');
    }
    if (!formData.email.trim()) {
      errors.email = t('monEspace.cv.validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('monEspace.cv.validation.emailInvalid');
    }
    if (!formData.phone.trim()) {
      errors.phone = t('monEspace.cv.validation.phoneRequired');
    }
    if (!formData.location.trim()) {
      errors.location = t('monEspace.cv.validation.locationRequired');
    }

    // 2. Bio professionnelle obligatoire
    if (!formData.bio.trim()) {
      errors.bio = t('monEspace.cv.validation.bioRequired');
    } else if (formData.bio.trim().length < 50) {
      errors.bio = t('monEspace.cv.validation.bioTooShort');
    }

    // 3. Titre professionnel obligatoire
    if (!formData.title.trim()) {
      errors.title = t('monEspace.cv.validation.titleRequired');
    }

    // 4. Au moins un secteur obligatoire
    if (formData.sectors.length === 0) {
      errors.sectors = t('monEspace.cv.validation.sectorsRequired');
    }

    // 5. Au moins 2 compétences obligatoires
    if (formData.skills.length < 2) {
      errors.skills = t('monEspace.cv.validation.skillsRequired');
    }

    // 6. Au moins une expérience professionnelle obligatoire
    if (experiences.length === 0) {
      errors.experiences = t('monEspace.cv.validation.experiencesRequired');
    } else {
      // Validate each experience
      experiences.forEach((exp) => {
        if (!exp.title.trim()) {
          errors[`experience_${exp.id}_title`] = t('monEspace.cv.validation.experienceTitleRequired');
        }
        if (!exp.company.trim()) {
          errors[`experience_${exp.id}_company`] = t('monEspace.cv.validation.experienceCompanyRequired');
        }
        if (!exp.location.trim()) {
          errors[`experience_${exp.id}_location`] = t('monEspace.cv.validation.experienceLocationRequired');
        }
        if (!exp.startDate) {
          errors[`experience_${exp.id}_startDate`] = t('monEspace.cv.validation.experienceStartDateRequired');
        }
        if (!exp.current && !exp.endDate) {
          errors[`experience_${exp.id}_endDate`] = t('monEspace.cv.validation.experienceEndDateRequired');
        }
      });
    }

    // 7. Au moins une formation obligatoire
    if (education.length === 0) {
      errors.education = t('monEspace.cv.validation.educationRequired');
    } else {
      // Validate each education
      education.forEach((edu) => {
        if (!edu.degree.trim()) {
          errors[`education_${edu.id}_degree`] = t('monEspace.cv.validation.educationDegreeRequired');
        }
        if (!edu.institution.trim()) {
          errors[`education_${edu.id}_institution`] = t('monEspace.cv.validation.educationInstitutionRequired');
        }
        if (!edu.year) {
          errors[`education_${edu.id}_year`] = t('monEspace.cv.validation.educationYearRequired');
        }
      });
    }

    // 8. Au moins une langue obligatoire
    if (languages.length === 0) {
      errors.languages = t('monEspace.cv.validation.languagesRequired');
    } else {
      // Validate each language
      languages.forEach((lang) => {
        if (!lang.name.trim()) {
          errors[`language_${lang.id}_name`] = t('monEspace.cv.validation.languageNameRequired');
        }
        if (!lang.level) {
          errors[`language_${lang.id}_level`] = t('monEspace.cv.validation.languageLevelRequired');
        }
      });
    }

    // 9. CV file obligatoire
    if (!cvFile && !cvFileName) {
      errors.cvFile = t('monEspace.cv.validation.cvRequired');
    }

    // Validate certifications if any are filled
    certifications.forEach((cert) => {
      if (cert.name.trim() || cert.issuer.trim() || cert.date) {
        // If any field is filled, validate required fields
        if (!cert.name.trim()) {
          errors[`certification_${cert.id}_name`] = t('monEspace.cv.validation.certificationNameRequired');
        }
        if (!cert.issuer.trim()) {
          errors[`certification_${cert.id}_issuer`] = t('monEspace.cv.validation.certificationIssuerRequired');
        }
        if (!cert.date) {
          errors[`certification_${cert.id}_date`] = t('monEspace.cv.validation.certificationDateRequired');
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error(t('monEspace.cv.validation.checkErrors'));
      // Scroll to first error
      const firstErrorElement = document.querySelector('.border-red-500');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Save CV data to localStorage
    if (user) {
      const cvData = {
        formData,
        experiences,
        education,
        languages,
        certifications,
        profilePhoto,
        cvFileName,
      };
      localStorage.setItem(`assortis_cv_${user.id}`, JSON.stringify(cvData));
      toast.success(t('monEspace.cv.success'));
      setTimeout(() => {
        navigate('/mon-espace');
      }, 1500);
    }
  };

  const sectors = [
    'AGRICULTURE',
    'EDUCATION',
    'HEALTH',
    'INFRASTRUCTURE',
    'GOVERNANCE',
    'ENVIRONMENT',
    'ENERGY',
    'WATER_SANITATION',
    'FINANCE',
    'TECHNOLOGY',
    'HUMANITARIAN',
    'CLIMATE_CHANGE',
  ];

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('monEspace.banner.registerCV.title')}
        description={t('monEspace.banner.registerCV.description')}
        icon={FileUser}
      />

      <MonEspaceSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-primary">
                  {t('monEspace.cv.sections.personal')}
                </h2>
              </div>

              <div className="mb-6">
                <Label>{t('monEspace.cv.profilePhoto')}</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center overflow-hidden">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt={t('monEspace.cv.profilePhoto')} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {t('monEspace.cv.changePhoto')}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('monEspace.cv.firstName')}</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    className={validationErrors.firstName ? 'border-red-500' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('monEspace.cv.lastName')}</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    className={validationErrors.lastName ? 'border-red-500' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('monEspace.cv.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className={validationErrors.email ? 'border-red-500' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('monEspace.cv.phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={validationErrors.phone ? 'border-red-500' : ''}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location">{t('monEspace.cv.location')}</Label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name[language as 'en' | 'fr' | 'es']}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Professional Bio */}
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-xl font-semibold text-primary">
                  {t('monEspace.cv.sections.bio')}
                </h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">{t('monEspace.cv.bio')}</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder={t('monEspace.cv.bioPlaceholder')}
                  rows={6}
                  className={validationErrors.bio ? 'border-destructive' : ''}
                />
              </div>
            </div>

            {/* Professional Details */}
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-primary">
                  {t('monEspace.cv.sections.professional')}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title">{t('monEspace.cv.title')}</Label>
                  <Select value={formData.title} onValueChange={(value) => handleInputChange('title', value)}>
                    <SelectTrigger className={validationErrors.title ? 'border-red-500' : ''}>
                      <SelectValue placeholder={t('monEspace.cv.selectTitle')} />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFESSIONAL_TITLES.map((title) => (
                        <SelectItem key={title} value={title}>
                          {title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">{t('monEspace.cv.level')}</Label>
                  <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JUNIOR">{t('experts.level.JUNIOR')}</SelectItem>
                      <SelectItem value="INTERMEDIATE">{t('experts.level.INTERMEDIATE')}</SelectItem>
                      <SelectItem value="SENIOR">{t('experts.level.SENIOR')}</SelectItem>
                      <SelectItem value="EXPERT">{t('experts.level.EXPERT')}</SelectItem>
                      <SelectItem value="LEAD">{t('experts.level.LEAD')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">{t('monEspace.cv.yearsExperience')}</Label>
                  <Select value={formData.yearsExperience} onValueChange={(value) => handleInputChange('yearsExperience', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS_OF_EXPERIENCE.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {t(`experts.yearsExperience.${range.value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sectors */}
              <div className="space-y-2 mb-6">
                <Label>{t('monEspace.cv.sectors')}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {sectors.map((sector) => (
                    <div key={sector} className="flex items-center space-x-2">
                      <Checkbox
                        id={sector}
                        checked={formData.sectors.includes(sector)}
                        onCheckedChange={() => handleSectorToggle(sector)}
                      />
                      <label
                        htmlFor={sector}
                        className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {t(`experts.sector.${sector}`)}
                      </label>
                    </div>
                  ))}
                </div>
                {validationErrors.sectors && (
                  <p className="text-sm text-red-500 mt-2">
                    {validationErrors.sectors}
                  </p>
                )}
              </div>

              {/* Subsectors */}
              <div className="space-y-2">
                <Label>{t('monEspace.cv.subsectors')}</Label>
                {formData.sectors.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    {t('monEspace.cv.selectSectorFirst')}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableSubsectors.map((subsector) => (
                      <div key={subsector} className="flex items-center space-x-2">
                        <Checkbox
                          id={`subsector-${subsector}`}
                          checked={formData.subsectors.includes(subsector)}
                          onCheckedChange={() => handleSubsectorToggle(subsector)}
                        />
                        <label
                          htmlFor={`subsector-${subsector}`}
                          className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {t(`subsectors.${subsector}`)}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Skills & Expertise */}
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-xl font-semibold text-primary">
                  {t('monEspace.cv.sections.skills')}
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder={t('monEspace.cv.addSkill')}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddSkill} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="pl-3 pr-2 py-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {validationErrors.skills && (
                  <p className="text-sm text-destructive mt-2">
                    {validationErrors.skills}
                  </p>
                )}

                <div className="border-t pt-4 mt-4">
                  <Label className="mb-2 block">{t('monEspace.cv.suggestedSkills')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_SKILLS.filter(s => !formData.skills.includes(s)).slice(0, 12).map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary/10"
                        onClick={() => {
                          if (!formData.skills.includes(skill)) {
                            setFormData({ ...formData, skills: [...formData.skills, skill] });
                          }
                        }}
                      >
                        + {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-primary">
                    {t('monEspace.cv.sections.experience')}
                  </h2>
                </div>
                <Button type="button" onClick={handleAddExperience} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('monEspace.cv.experience.add')}
                </Button>
              </div>

              {validationErrors.experiences && experiences.length === 0 && (
                <p className="text-sm text-destructive mb-4">
                  {validationErrors.experiences}
                </p>
              )}

              <div className="space-y-6">
                {experiences.map((exp, index) => (
                  <div key={exp.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-primary">
                        {t('monEspace.cv.sections.experience')} {index + 1}
                      </h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveExperience(exp.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label>{t('monEspace.cv.experience.title')}</Label>
                        <Input
                          value={exp.title}
                          onChange={(e) => handleExperienceChange(exp.id, 'title', e.target.value)}
                          className={validationErrors[`experience_${exp.id}_title`] ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('monEspace.cv.experience.company')}</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
                          className={validationErrors[`experience_${exp.id}_company`] ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('monEspace.cv.experience.location')}</Label>
                        <Select
                          value={exp.location}
                          onValueChange={(value) => handleExperienceChange(exp.id, 'location', value)}
                        >
                          <SelectTrigger className={validationErrors[`experience_${exp.id}_location`] ? 'border-red-500' : ''}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                {country.name[language as 'en' | 'fr' | 'es']}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('monEspace.cv.experience.startDate')}</Label>
                        <Input
                          type="month"
                          value={exp.startDate}
                          onChange={(e) => handleExperienceChange(exp.id, 'startDate', e.target.value)}
                          className={validationErrors[`experience_${exp.id}_startDate`] ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('monEspace.cv.experience.endDate')}</Label>
                        <Input
                          type="month"
                          value={exp.endDate}
                          onChange={(e) => handleExperienceChange(exp.id, 'endDate', e.target.value)}
                          disabled={exp.current}
                          className={validationErrors[`experience_${exp.id}_endDate`] ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="flex items-center space-x-2 md:col-span-2">
                        <Checkbox
                          id={`current-${exp.id}`}
                          checked={exp.current}
                          onCheckedChange={(checked) => handleExperienceChange(exp.id, 'current', checked)}
                        />
                        <label
                          htmlFor={`current-${exp.id}`}
                          className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {t('monEspace.cv.experience.current')}
                        </label>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>{t('monEspace.cv.experience.description')}</Label>
                        <Textarea
                          value={exp.description}
                          onChange={(e) => handleExperienceChange(exp.id, 'description', e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-cyan-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-primary">
                    {t('monEspace.cv.sections.education')}
                  </h2>
                </div>
                <Button type="button" onClick={handleAddEducation} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('monEspace.cv.education.add')}
                </Button>
              </div>

              {validationErrors.education && education.length === 0 && (
                <p className="text-sm text-red-500 mb-4">
                  {validationErrors.education}
                </p>
              )}

              <div className="space-y-6">
                {education.map((edu, index) => (
                  <div key={edu.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-primary">
                        {t('monEspace.cv.sections.education')} {index + 1}
                      </h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEducation(edu.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('monEspace.cv.education.degree')}</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)}
                          className={validationErrors[`education_${edu.id}_degree`] ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('monEspace.cv.education.institution')}</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => handleEducationChange(edu.id, 'institution', e.target.value)}
                          className={validationErrors[`education_${edu.id}_institution`] ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('monEspace.cv.education.field')}</Label>
                        <Input
                          value={edu.field}
                          onChange={(e) => handleEducationChange(edu.id, 'field', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('monEspace.cv.education.year')}</Label>
                        <Select
                          value={edu.year}
                          onValueChange={(value) => handleEducationChange(edu.id, 'year', value)}
                        >
                          <SelectTrigger className={validationErrors[`education_${edu.id}_year`] ? 'border-red-500' : ''}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {yearOptions.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center">
                    <LanguagesIcon className="w-5 h-5 text-pink-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-primary">
                    {t('monEspace.cv.sections.languages')}
                  </h2>
                </div>
                <Button type="button" onClick={handleAddLanguage} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('monEspace.cv.language.add')}
                </Button>
              </div>

              {validationErrors.languages && languages.length === 0 && (
                <p className="text-sm text-red-500 mb-4">
                  {validationErrors.languages}
                </p>
              )}

              <div className="space-y-4">
                {languages.map((lang, index) => (
                  <div key={lang.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-primary">
                        {t('monEspace.cv.sections.languages')} {index + 1}
                      </h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLanguage(lang.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('monEspace.cv.language.name')}</Label>
                        <Select
                          value={lang.name}
                          onValueChange={(value) => handleLanguageChange(lang.id, 'name', value)}
                        >
                          <SelectTrigger className={validationErrors[`language_${lang.id}_name`] ? 'border-red-500' : ''}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COMMON_LANGUAGES.map((language) => (
                              <SelectItem key={language} value={language}>
                                {language}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('monEspace.cv.language.level')}</Label>
                        <Select
                          value={lang.level}
                          onValueChange={(value) => handleLanguageChange(lang.id, 'level', value)}
                        >
                          <SelectTrigger className={validationErrors[`language_${lang.id}_level`] ? 'border-red-500' : ''}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A1">{t('experts.languageLevel.A1')}</SelectItem>
                            <SelectItem value="A2">{t('experts.languageLevel.A2')}</SelectItem>
                            <SelectItem value="B1">{t('experts.languageLevel.B1')}</SelectItem>
                            <SelectItem value="B2">{t('experts.languageLevel.B2')}</SelectItem>
                            <SelectItem value="C1">{t('experts.languageLevel.C1')}</SelectItem>
                            <SelectItem value="C2">{t('experts.languageLevel.C2')}</SelectItem>
                            <SelectItem value="NATIVE">{t('experts.languageLevel.NATIVE')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-orange-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-primary">
                    {t('monEspace.cv.sections.certifications')}
                  </h2>
                </div>
                <Button type="button" onClick={handleAddCertification} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('monEspace.cv.certification.add')}
                </Button>
              </div>

              <div className="space-y-4">
                {certifications.map((cert, index) => (
                  <div key={cert.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-primary">
                        {t('monEspace.cv.sections.certifications')} {index + 1}
                      </h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCertification(cert.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('monEspace.cv.certification.name')}</Label>
                        <Select
                          value={cert.name}
                          onValueChange={(value) => handleCertificationChange(cert.id, 'name', value)}
                        >
                          <SelectTrigger className={validationErrors[`certification_${cert.id}_name`] ? 'border-red-500' : ''}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COMMON_CERTIFICATIONS.map((certification) => (
                              <SelectItem key={certification} value={certification}>
                                {certification}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('monEspace.cv.certification.issuer')}</Label>
                        <Input
                          value={cert.issuer}
                          onChange={(e) => handleCertificationChange(cert.id, 'issuer', e.target.value)}
                          className={validationErrors[`certification_${cert.id}_issuer`] ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('monEspace.cv.certification.date')}</Label>
                        <Input
                          type="month"
                          value={cert.date}
                          onChange={(e) => handleCertificationChange(cert.id, 'date', e.target.value)}
                          className={validationErrors[`certification_${cert.id}_date`] ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('monEspace.cv.certification.expiry')}</Label>
                        <Input
                          type="month"
                          value={cert.expiryDate}
                          onChange={(e) => handleCertificationChange(cert.id, 'expiryDate', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CV Upload */}
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <FileUser className="w-5 h-5 text-red-500" />
                </div>
                <h2 className="text-xl font-semibold text-primary">
                  {t('monEspace.cv.uploadCV')}
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="cv">{t('monEspace.cv.cvFile')}</Label>
                  <div className="mt-2">
                    <input
                      ref={cvInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleCVChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => cvInputRef.current?.click()}
                      className={validationErrors.cvFile ? 'border-red-500' : ''}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {cvFile ? cvFile.name : (cvFileName || t('monEspace.cv.selectCV'))}
                    </Button>
                    {validationErrors.cvFile && (
                      <p className="text-sm text-red-500 mt-2">
                        {validationErrors.cvFile}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('monEspace.cv.cvRequirements')}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/mon-espace')}
              >
                {t('monEspace.action.cancel')}
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                <Save className="w-4 h-4 mr-2" />
                {t('monEspace.cv.saveChanges')}
              </Button>
            </div>
          </form>
        </div>
      </PageContainer>
    </div>
  );
}