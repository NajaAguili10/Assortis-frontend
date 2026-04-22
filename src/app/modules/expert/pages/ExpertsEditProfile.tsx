import { toast } from 'sonner';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { SubMenu } from '@app/components/SubMenu';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Textarea } from '@app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';
import { Checkbox } from '@app/components/ui/checkbox';
import { Badge } from '@app/components/ui/badge';
import {
  UserCheck,
  LayoutDashboard,
  Database,
  FileUser,
  UserCircle,
  Zap,
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
  FileText,
} from 'lucide-react';
import { getCountriesSorted } from '@app/config/countries.config';
import { SUBSECTOR_MAP } from '@app/config/subsectors.config';
import { SectorEnum } from '@app/types/tender.dto';
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
} from '@app/config/professional.config';

export default function ExpertsEditProfile() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  
  // Multilingual demo data
  const getDemoData = () => {
    const demoData = {
      en: {
        bio: 'Experienced project manager specializing in infrastructure development and governance projects across Africa and Asia.',
        title: 'Senior Project Manager',
        experiences: [
          {
            id: '1',
            title: 'Senior Project Manager',
            company: 'World Bank',
            location: 'Various locations (Africa, Asia)',
            startDate: '2018-01',
            endDate: '',
            current: true,
            description: 'Leading large-scale infrastructure projects across multiple countries.',
          },
          {
            id: '2',
            title: 'Project Manager',
            company: 'UNDP',
            location: 'East Africa',
            startDate: '2012-06',
            endDate: '2017-12',
            current: false,
            description: 'Managed governance and capacity building projects.',
          },
        ],
        education: [
          {
            id: '1',
            degree: 'Master of Public Administration',
            institution: 'London School of Economics',
            field: 'International Development',
            year: '2010',
          },
          {
            id: '2',
            degree: 'Bachelor of Engineering',
            institution: 'University of Cambridge',
            field: 'Civil Engineering',
            year: '2006',
          },
        ],
      },
      fr: {
        bio: 'Chef de projet expérimenté spécialisé dans les projets de développement d\'infrastructures et de gouvernance en Afrique et en Asie.',
        title: 'Chef de Projet Senior',
        experiences: [
          {
            id: '1',
            title: 'Chef de Projet Senior',
            company: 'Banque Mondiale',
            location: 'Divers emplacements (Afrique, Asie)',
            startDate: '2018-01',
            endDate: '',
            current: true,
            description: 'Direction de projets d\'infrastructure à grande échelle dans plusieurs pays.',
          },
          {
            id: '2',
            title: 'Chef de Projet',
            company: 'PNUD',
            location: 'Afrique de l\'Est',
            startDate: '2012-06',
            endDate: '2017-12',
            current: false,
            description: 'Gestion de projets de gouvernance et de renforcement des capacités.',
          },
        ],
        education: [
          {
            id: '1',
            degree: 'Master en Administration Publique',
            institution: 'London School of Economics',
            field: 'Développement International',
            year: '2010',
          },
          {
            id: '2',
            degree: 'Licence en Ingénierie',
            institution: 'Université de Cambridge',
            field: 'Génie Civil',
            year: '2006',
          },
        ],
      },
      es: {
        bio: 'Gerente de proyectos experimentado especializado en proyectos de desarrollo de infraestructura y gobernanza en África y Asia.',
        title: 'Gerente de Proyecto Senior',
        experiences: [
          {
            id: '1',
            title: 'Gerente de Proyecto Senior',
            company: 'Banco Mundial',
            location: 'Varias ubicaciones (África, Asia)',
            startDate: '2018-01',
            endDate: '',
            current: true,
            description: 'Liderando proyectos de infraestructura a gran escala en múltiples países.',
          },
          {
            id: '2',
            title: 'Gerente de Proyecto',
            company: 'PNUD',
            location: 'África Oriental',
            startDate: '2012-06',
            endDate: '2017-12',
            current: false,
            description: 'Gestión de proyectos de gobernanza y fortalecimiento de capacidades.',
          },
        ],
        education: [
          {
            id: '1',
            degree: 'Maestría en Administración Pública',
            institution: 'London School of Economics',
            field: 'Desarrollo Internacional',
            year: '2010',
          },
          {
            id: '2',
            degree: 'Licenciatura en Ingeniería',
            institution: 'Universidad de Cambridge',
            field: 'Ingeniería Civil',
            year: '2006',
          },
        ],
      },
    };
    
    const currentLang = (language === 'en' || language === 'fr' || language === 'es') ? language : 'en';
    return demoData[currentLang];
  };

  const demo = getDemoData();
  
  const [formData, setFormData] = useState({
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+44 20 1234 5678',
    location: 'GB',
    bio: demo.bio,
    title: demo.title,
    level: 'SENIOR',
    yearsExperience: '15-20',
    sectors: ['INFRASTRUCTURE', 'GOVERNANCE'] as string[],
    subsectors: ['ROADS_TRANSPORT', 'PUBLIC_ADMINISTRATION'] as string[],
    skills: ['Project Management', 'Stakeholder Engagement', 'Risk Management', 'Budget Planning', 'Team Leadership'],
    availability: 'IMMEDIATE',
    availableFrom: '2024-03-01',
    dailyRate: '750',
    currency: 'USD',
  });

  const [experiences, setExperiences] = useState(demo.experiences);

  const [education, setEducation] = useState(demo.education);

  const [languages, setLanguages] = useState([
    { id: '1', name: 'English', level: 'Native' },
    { id: '2', name: 'French', level: 'Fluent' },
    { id: '3', name: 'Spanish', level: 'Intermediate' },
  ]);

  const [certifications, setCertifications] = useState([
    {
      id: '1',
      name: 'PMP - Project Management Professional',
      issuer: 'Project Management Institute',
      date: '2015-03',
      expiryDate: '2027-03',
    },
    {
      id: '2',
      name: 'PRINCE2 Practitioner',
      issuer: 'AXELOS',
      date: '2013-06',
      expiryDate: '',
    },
  ]);

  const [newSkill, setNewSkill] = useState('');

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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

  // Update demo data when language changes
  useEffect(() => {
    const newDemo = getDemoData();
    setFormData(prev => ({
      ...prev,
      bio: newDemo.bio,
      title: newDemo.title,
    }));
    setExperiences(newDemo.experiences);
    setEducation(newDemo.education);
  }, [language]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
        toast.success(t('experts.editProfile.photoUpdated'));
      };
      reader.readAsDataURL(file);
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

    // Validate basic personal information
    if (!formData.firstName.trim()) {
      errors.firstName = t('experts.editProfile.validation.firstName');
    }
    if (!formData.lastName.trim()) {
      errors.lastName = t('experts.editProfile.validation.lastName');
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('experts.editProfile.validation.email');
    }
    if (!formData.title.trim()) {
      errors.title = t('experts.editProfile.validation.title');
    }

    // Validate experiences
    experiences.forEach((exp, index) => {
      if (exp.title.trim() || exp.company.trim() || exp.startDate) {
        // If any field is filled, validate required fields
        if (!exp.title.trim()) {
          errors[`experience_${exp.id}_title`] = t('experts.editProfile.validation.experienceTitle');
        }
        if (!exp.company.trim()) {
          errors[`experience_${exp.id}_company`] = t('experts.editProfile.validation.experienceCompany');
        }
        if (!exp.startDate) {
          errors[`experience_${exp.id}_startDate`] = t('experts.editProfile.validation.experienceStartDate');
        }
      }
    });

    // Validate education
    education.forEach((edu, index) => {
      if (edu.degree.trim() || edu.institution.trim() || edu.year) {
        // If any field is filled, validate required fields
        if (!edu.degree.trim()) {
          errors[`education_${edu.id}_degree`] = t('experts.editProfile.validation.educationDegree');
        }
        if (!edu.institution.trim()) {
          errors[`education_${edu.id}_institution`] = t('experts.editProfile.validation.educationInstitution');
        }
        if (!edu.year) {
          errors[`education_${edu.id}_year`] = t('experts.editProfile.validation.educationYear');
        }
      }
    });

    // Validate languages
    languages.forEach((lang, index) => {
      if (lang.name.trim() || lang.level) {
        // If any field is filled, validate required fields
        if (!lang.name.trim()) {
          errors[`language_${lang.id}_name`] = t('experts.editProfile.validation.languageName');
        }
        if (!lang.level) {
          errors[`language_${lang.id}_level`] = t('experts.editProfile.validation.languageLevel');
        }
      }
    });

    // Validate certifications
    certifications.forEach((cert, index) => {
      if (cert.name.trim() || cert.issuer.trim() || cert.date) {
        // If any field is filled, validate required fields
        if (!cert.name.trim()) {
          errors[`certification_${cert.id}_name`] = t('experts.editProfile.validation.certificationName');
        }
        if (!cert.issuer.trim()) {
          errors[`certification_${cert.id}_issuer`] = t('experts.editProfile.validation.certificationIssuer');
        }
        if (!cert.date) {
          errors[`certification_${cert.id}_date`] = t('experts.editProfile.validation.certificationDate');
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error(t('experts.editProfile.validation.checkErrors'));
      // Scroll to first error
      const firstErrorElement = document.querySelector('.border-red-500');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    toast.success(t('experts.editProfile.saveSuccess'));
    navigate('/compte-utilisateur/mon-compte');
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
        title={t('experts.editProfile.pageTitle')}
        description={t('experts.editProfile.pageDescription')}
        icon={UserCheck}
      />

      <SubMenu
        items={[
          {
            label: t('experts.submenu.database'),
            icon: Database,
            onClick: () => navigate('/experts/database'),
          },
          {
            label: t('experts.submenu.profiles'),
            icon: UserCircle,
            onClick: () => navigate('/experts/profiles'),
          },
          {
            label: t('experts.submenu.matching'),
            icon: Zap,
            onClick: () => navigate('/experts/matching'),
          },
          {
            label: t('experts.submenu.cvTemplates'),
            icon: FileText,
            onClick: () => navigate('/experts/cv-templates'),
          },
        ]}
      />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-xl font-semibold text-primary">
                  {t('experts.editProfile.sections.personal')}
                </h2>
              </div>

              <div className="mb-6">
                <Label>{t('experts.editProfile.profilePhoto')}</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center overflow-hidden">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-2xl font-bold">
                        {formData.firstName[0]}
                        {formData.lastName[0]}
                      </span>
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
                    {t('experts.editProfile.changePhoto')}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('experts.editProfile.firstName')}</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    className={validationErrors.firstName ? 'border-red-500' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('experts.editProfile.lastName')}</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    className={validationErrors.lastName ? 'border-red-500' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('experts.editProfile.email')}</Label>
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
                  <Label htmlFor="phone">{t('experts.editProfile.phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location">{t('experts.editProfile.location')}</Label>
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
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-purple-500" />
                </div>
                <h2 className="text-xl font-semibold text-primary">
                  {t('experts.editProfile.sections.bio')}
                </h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">{t('experts.editProfile.bio')}</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder={t('experts.editProfile.bioPlaceholder')}
                  rows={6}
                />
              </div>
            </div>

            {/* Professional Details */}
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-green-500" />
                </div>
                <h2 className="text-xl font-semibold text-primary">
                  {t('experts.editProfile.sections.professional')}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title">{t('experts.editProfile.title.field')}</Label>
                  <Select value={formData.title} onValueChange={(value) => handleInputChange('title', value)}>
                    <SelectTrigger className={validationErrors.title ? 'border-red-500' : ''}>
                      <SelectValue placeholder={t('experts.editProfile.selectTitle')} />
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
                  <Label htmlFor="level">{t('experts.editProfile.level')}</Label>
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
                  <Label htmlFor="yearsExperience">{t('experts.editProfile.yearsExperience')}</Label>
                  <Select value={formData.yearsExperience} onValueChange={(value) => handleInputChange('yearsExperience', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS_OF_EXPERIENCE.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {t(`experts.editProfile.yearsExperience.${range.value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sectors */}
              <div className="space-y-2 mb-6">
                <Label>{t('experts.editProfile.sectors')}</Label>
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
              </div>

              {/* Subsectors */}
              <div className="space-y-2">
                <Label>{t('experts.editProfile.subsectors')}</Label>
                {formData.sectors.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    {t('experts.editProfile.selectSectorFirst')}
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
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-yellow-500" />
                </div>
                <h2 className="text-xl font-semibold text-primary">
                  {t('experts.editProfile.sections.skills')}
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder={t('experts.editProfile.addSkill')}
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
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-indigo-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-primary">
                    {t('experts.editProfile.sections.experience')}
                  </h2>
                </div>
                <Button type="button" onClick={handleAddExperience} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('experts.editProfile.experience.add')}
                </Button>
              </div>

              <div className="space-y-6">
                {experiences.map((exp, index) => (
                  <div key={exp.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-primary">
                        {t('experts.editProfile.sections.experience')} {index + 1}
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
                        <Label>{t('experts.editProfile.experience.title')}</Label>
                        <Input
                          value={exp.title}
                          onChange={(e) => handleExperienceChange(exp.id, 'title', e.target.value)}
                          className={validationErrors[`experience_${exp.id}_title`] ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('experts.editProfile.experience.company')}</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
                          className={validationErrors[`experience_${exp.id}_company`] ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('experts.editProfile.experience.location')}</Label>
                        <Select
                          value={exp.location}
                          onValueChange={(value) => handleExperienceChange(exp.id, 'location', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('experts.editProfile.selectCountry')} />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.name[language as 'en' | 'fr' | 'es']}>
                                {country.name[language as 'en' | 'fr' | 'es']}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('experts.editProfile.experience.startDate')}</Label>
                        <Input
                          type="month"
                          value={exp.startDate}
                          onChange={(e) => handleExperienceChange(exp.id, 'startDate', e.target.value)}
                          className={validationErrors[`experience_${exp.id}_startDate`] ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('experts.editProfile.experience.endDate')}</Label>
                        <Input
                          type="month"
                          value={exp.endDate}
                          onChange={(e) => handleExperienceChange(exp.id, 'endDate', e.target.value)}
                          disabled={exp.current}
                        />
                      </div>
                      <div className="flex items-center space-x-2 md:col-span-2">
                        <Checkbox
                          id={`current-${exp.id}`}
                          checked={exp.current}
                          onCheckedChange={(checked) =>
                            handleExperienceChange(exp.id, 'current', checked)
                          }
                        />
                        <label
                          htmlFor={`current-${exp.id}`}
                          className="text-sm cursor-pointer leading-none"
                        >
                          {t('experts.editProfile.experience.current')}
                        </label>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>{t('experts.editProfile.experience.description')}</Label>
                        <Textarea
                          value={exp.description}
                          onChange={(e) =>
                            handleExperienceChange(exp.id, 'description', e.target.value)
                          }
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
                  <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-pink-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-primary">
                    {t('experts.editProfile.sections.education')}
                  </h2>
                </div>
                <Button type="button" onClick={handleAddEducation} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('experts.editProfile.education.add')}
                </Button>
              </div>

              <div className="space-y-6">
                {education.map((edu, index) => (
                  <div key={edu.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-primary">
                        {t('experts.editProfile.sections.education')} {index + 1}
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
                      <div className="space-y-2 md:col-span-2">
                        <Label>{t('experts.editProfile.education.degree')}</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)}
                          className={validationErrors[`education_${edu.id}_degree`] ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>{t('experts.editProfile.education.institution')}</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) =>
                            handleEducationChange(edu.id, 'institution', e.target.value)
                          }
                          className={validationErrors[`education_${edu.id}_institution`] ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('experts.editProfile.education.field')}</Label>
                        <Input
                          value={edu.field}
                          onChange={(e) => handleEducationChange(edu.id, 'field', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('experts.editProfile.education.year')}</Label>
                        <Select
                          value={edu.year}
                          onValueChange={(value) => handleEducationChange(edu.id, 'year', value)}
                        >
                          <SelectTrigger className={validationErrors[`education_${edu.id}_year`] ? 'border-red-500' : ''}>
                            <SelectValue placeholder={t('experts.editProfile.selectYear')} />
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
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                    <LanguagesIcon className="w-5 h-5 text-teal-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-primary">
                    {t('experts.editProfile.sections.languages')}
                  </h2>
                </div>
                <Button type="button" onClick={handleAddLanguage} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('experts.editProfile.languages.add')}
                </Button>
              </div>

              <div className="space-y-4">
                {languages.map((lang, index) => (
                  <div key={lang.id} className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>{t('experts.editProfile.languages.name')}</Label>
                      <Select
                        value={lang.name}
                        onValueChange={(value) => handleLanguageChange(lang.id, 'name', value)}
                      >
                        <SelectTrigger className={validationErrors[`language_${lang.id}_name`] ? 'border-red-500' : ''}>
                          <SelectValue placeholder={t('experts.editProfile.selectLanguage')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                          {COMMON_LANGUAGES.map((languageOption) => (
                            <SelectItem key={languageOption} value={languageOption}>
                              {languageOption}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>{t('experts.editProfile.languages.level')}</Label>
                      <Select
                        value={lang.level}
                        onValueChange={(value) => handleLanguageChange(lang.id, 'level', value)}
                      >
                        <SelectTrigger className={validationErrors[`language_${lang.id}_level`] ? 'border-red-500' : ''}>
                          <SelectValue placeholder={t('experts.editProfile.selectLanguageLevel')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Native">{t('experts.editProfile.languages.levels.native')}</SelectItem>
                          <SelectItem value="Fluent">{t('experts.editProfile.languages.levels.fluent')}</SelectItem>
                          <SelectItem value="Advanced">{t('experts.editProfile.languages.levels.advanced')}</SelectItem>
                          <SelectItem value="Intermediate">{t('experts.editProfile.languages.levels.intermediate')}</SelectItem>
                          <SelectItem value="Basic">{t('experts.editProfile.languages.levels.basic')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveLanguage(lang.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
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
                    {t('experts.editProfile.sections.certifications')}
                  </h2>
                </div>
                <Button type="button" onClick={handleAddCertification} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('experts.editProfile.certification.add')}
                </Button>
              </div>

              <div className="space-y-6">
                {certifications.map((cert, index) => (
                  <div key={cert.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-primary">
                        {t('experts.editProfile.certificationNumber')} {index + 1}
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
                      <div className="space-y-2 md:col-span-2">
                        <Label>{t('experts.editProfile.certification.name')}</Label>
                        <Input
                          value={cert.name}
                          onChange={(e) =>
                            handleCertificationChange(cert.id, 'name', e.target.value)
                          }
                          className={validationErrors[`certification_${cert.id}_name`] ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>{t('experts.editProfile.certification.issuer')}</Label>
                        <Input
                          value={cert.issuer}
                          onChange={(e) =>
                            handleCertificationChange(cert.id, 'issuer', e.target.value)
                          }
                          className={validationErrors[`certification_${cert.id}_issuer`] ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('experts.editProfile.certification.date')}</Label>
                        <Input
                          type="month"
                          value={cert.date}
                          onChange={(e) =>
                            handleCertificationChange(cert.id, 'date', e.target.value)
                          }
                          className={validationErrors[`certification_${cert.id}_date`] ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('experts.editProfile.certification.expiryDate')}</Label>
                        <Input
                          type="month"
                          value={cert.expiryDate}
                          onChange={(e) =>
                            handleCertificationChange(cert.id, 'expiryDate', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability & Rates */}
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-cyan-500" />
                </div>
                <h2 className="text-xl font-semibold text-primary">
                  {t('experts.editProfile.sections.availability')}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="availability">
                    {t('experts.editProfile.availability.status')}
                  </Label>
                  <Select
                    value={formData.availability}
                    onValueChange={(value) => handleInputChange('availability', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IMMEDIATE">
                        {t('experts.availability.IMMEDIATE')}
                      </SelectItem>
                      <SelectItem value="WITHIN_1_MONTH">
                        {t('experts.availability.WITHIN_1_MONTH')}
                      </SelectItem>
                      <SelectItem value="WITHIN_3_MONTHS">
                        {t('experts.availability.WITHIN_3_MONTHS')}
                      </SelectItem>
                      <SelectItem value="NOT_AVAILABLE">
                        {t('experts.availability.NOT_AVAILABLE')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availableFrom">
                    {t('experts.editProfile.availability.date')}
                  </Label>
                  <Input
                    id="availableFrom"
                    type="date"
                    value={formData.availableFrom}
                    onChange={(e) => handleInputChange('availableFrom', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dailyRate">{t('experts.editProfile.dailyRate')}</Label>
                  <Input
                    id="dailyRate"
                    type="number"
                    value={formData.dailyRate}
                    onChange={(e) => handleInputChange('dailyRate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">{t('experts.editProfile.currency')}</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleInputChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/compte-utilisateur/mon-compte')}
              >
                {t('experts.editProfile.cancel')}
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {t('experts.editProfile.save')}
              </Button>
            </div>
          </form>
        </div>
      </PageContainer>
    </div>
  );
}