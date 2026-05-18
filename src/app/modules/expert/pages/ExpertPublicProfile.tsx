import { useLanguage } from '@app/contexts/LanguageContext';
import { useAssistanceHistory } from '@app/contexts/AssistanceHistoryContext';
import { useCVCredits } from '@app/contexts/CVCreditsContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ExpertsSubMenu } from '@app/components/ExpertsSubMenu';
import { SearchSectionTabs, type SearchSectionTab } from '@app/components/SearchSectionTabs';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Progress } from '@app/components/ui/progress';
import { useExperts } from '@app/modules/expert/hooks/useExperts';
import { useAssistance } from '@app/hooks/useAssistance';
import { useNotifications } from '@app/modules/administrator/hooks/useNotifications';
import { NotificationTypeEnum, NotificationPriorityEnum } from '@app/types/notification.dto';
import { downloadExpertCvFile, EXPERT_DONOR_REFERENCE_FORMATS } from '@app/modules/expert/services/expertReferenceGeneration.service';
import { getAllJobOffers } from '@app/modules/posting-board/services/jobOfferService';
import { toast } from 'sonner';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import {
  UserCircle,
  Users,
  LayoutDashboard,
  Database,
  FileUser,
  Zap,
  Briefcase,
  Award,
  Star,
  MapPin,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  CheckCircle,
  Sparkles,
  GraduationCap,
  Languages as LanguagesIcon,
  Globe,
  Send,
  Loader2,
  UserCheck,
  FileText,
  ArrowLeft,
  Download,
  Link2,
  FileDown,
  LinkIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@app/components/ui/dialog';
import { Input } from '@app/components/ui/input';
import { Textarea } from '@app/components/ui/textarea';
import { getCountriesSorted } from '@app/config/countries.config';

export default function ExpertPublicProfile() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { experts, allExperts } = useExperts();
    const { allExperts: assistanceExperts } = useAssistance();
  const { addNotification } = useNotifications();
  const { addHistoryEntry } = useAssistanceHistory();
  const { expertLibrary, recordExpertDownload, linkExpertToVacancy } = useCVCredits();


  // Detect search context from navigation state first, then fallback to pathname.
  const searchSection: SearchSectionTab | null = useMemo(() => {
    const stateSection = (location.state as { searchSection?: SearchSectionTab } | null)?.searchSection;
    if (stateSection === 'experts' || stateSection === 'bid-writers') {
      return stateSection;
    }

    if (location.pathname.startsWith('/search/bid-writers/')) {
      return 'bid-writers';
    } else if (location.pathname.startsWith('/search/experts/')) {
      return 'experts';
    }
    return null;
  }, [location.pathname, location.state]);

  const isSearchContext = searchSection !== null;

  const countries = useMemo(() => getCountriesSorted(language as 'en' | 'fr' | 'es'), [language]);

  // Get location name from country code
  const getLocationName = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    return country ? country.name[language as 'en' | 'fr' | 'es'] : countryCode;
  };

  // Find the expert by ID in Experts module first, then in Assistance module
  let expert = allExperts.find(exp => String(exp.id) === String(id));
  let isAssistanceExpert = false;
  
  // If not found in Experts module, search in Assistance module
  if (!expert) {
    const assistanceExpert = assistanceExperts.find(exp => exp.id === id);
    if (assistanceExpert) {
      // Transform AssistanceExpertDTO to ExpertListDTO format
      expert = {
        id: assistanceExpert.id,
        organizationId: 'assistance-' + assistanceExpert.id,
        firstName: assistanceExpert.name.split(' ')[0] || '',
        lastName: assistanceExpert.name.split(' ').slice(1).join(' ') || '',
        email: `${assistanceExpert.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: '+1 234 567 890',
        title: assistanceExpert.title,
        status: 'ACTIVE' as any,
        level: 'SENIOR' as any,
        availability: assistanceExpert.availability === 'AVAILABLE' ? 'IMMEDIATE' as any : 'WITHIN_1_MONTH' as any,
        country: assistanceExpert.location.country,
        city: assistanceExpert.location.city,
        region: 'GLOBAL' as any,
        bio: assistanceExpert.bio,
        yearsOfExperience: 10,
        dailyRate: assistanceExpert.hourlyRate ? assistanceExpert.hourlyRate * 8 : 800,
        currency: 'USD',
        sectors: assistanceExpert.sectors as any[],
        skills: assistanceExpert.skills,
        languages: assistanceExpert.languages.map(lang => ({ language: lang, level: 'FLUENT' })),
        completedMissions: assistanceExpert.completedAssignments,
        clientRating: assistanceExpert.rating,
        profileCompleteness: 85,
        verified: true,
        lastActive: new Date().toISOString(),
        certifications: [],
      };
      isAssistanceExpert = true;
    }
  }

  // Multilingual demo data
  const getDemoData = () => {
    const demoData = {
      en: {
        bio: 'Experienced project manager specializing in infrastructure development and governance projects across Africa and Asia.',
        experiences: [
          {
            id: '1',
            title: 'Senior Project Manager test',
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

  // Dialog states
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [invitationDialogOpen, setInvitationDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Download CV dialog state
  const [downloadCvDialogOpen, setDownloadCvDialogOpen] = useState(false);
  const [selectedCvFormat, setSelectedCvFormat] = useState<string>('Full CV');

  // Link to vacancy dialog state
  const [linkVacancyDialogOpen, setLinkVacancyDialogOpen] = useState(false);
  const [availableVacancies, setAvailableVacancies] = useState<Array<{ id: string; jobTitle: string; projectTitle?: string }>>([]);
  const [selectedVacancyId, setSelectedVacancyId] = useState<string>('');

  // Load available vacancies when dialog opens
  useEffect(() => {
    if (linkVacancyDialogOpen) {
      getAllJobOffers().then((offers) => {
        setAvailableVacancies(
          offers.map((o) => ({ id: o.id, jobTitle: o.jobTitle, projectTitle: o.projectTitle }))
        );
      }).catch(() => setAvailableVacancies([]));
    }
  }, [linkVacancyDialogOpen]);

  // Form states
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [invitationOpportunity, setInvitationOpportunity] = useState('');
  const [invitationMessage, setInvitationMessage] = useState('');

  // If expert not found
  if (!expert) {
    expert = experts.data[0];
  }

  if (!expert) {
    return (
      <div className="min-h-screen">
        <PageBanner
          title={t('experts.publicProfile.notFound')}
          description={t('experts.publicProfile.notFoundDescription')}
          icon={UserCircle}
        />
        <PageContainer className="my-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">{t('experts.publicProfile.expertNotFound')}</p>
            <Button onClick={() => navigate('/experts/profiles')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('experts.publicProfile.backToProfiles')}
            </Button>
          </div>
        </PageContainer>
      </div>
    );
  }

  const demo = getDemoData();
  const writingExperience = expert.writingExperience;

  const openContactDialog = () => {
    setContactSubject('');
    setContactMessage('');
    setContactDialogOpen(true);
  };

  const openInvitationDialog = () => {
    setInvitationOpportunity('');
    setInvitationMessage('');
    setInvitationDialogOpen(true);
  };

  const sendContactMessage = () => {
    if (!contactSubject.trim() || !contactMessage.trim()) {
      toast.error(t('experts.contact.error'));
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setContactDialogOpen(false);
      const expertName = `${expert.firstName} ${expert.lastName}`;
      
      // ✅ Enregistrer dans l'historique
      addHistoryEntry({
        type: 'contact',
        expertName: expertName,
        expertRole: expert.title,
        title: contactSubject,
        message: contactMessage,
        status: 'sent',
      });
      
      toast.success(t('experts.contact.success', { expertName }));
      addNotification({
        type: NotificationTypeEnum.INFORMATION,
        priority: NotificationPriorityEnum.MEDIUM,
        message: t('experts.contact.success', { expertName }),
      });
      setContactSubject('');
      setContactMessage('');
    }, 1000);
  };

  const sendInvitation = () => {
    if (!invitationOpportunity.trim()) {
      toast.error(t('experts.invitation.error'));
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setInvitationDialogOpen(false);
      const expertName = `${expert.firstName} ${expert.lastName}`;
      
      // ✅ Enregistrer dans l'historique
      addHistoryEntry({
        type: 'invitation',
        expertName: expertName,
        expertRole: expert.title,
        title: invitationOpportunity,
        message: invitationMessage || undefined,
        status: 'sent',
      });
      
      toast.success(t('experts.invitation.success', { expertName }));
      addNotification({
        type: NotificationTypeEnum.INFORMATION,
        priority: NotificationPriorityEnum.HIGH,
        message: t('experts.invitation.success', { expertName }),
      });
      setInvitationOpportunity('');
      setInvitationMessage('');
    }, 1000);
  };

  return (
    <div className="min-h-screen">
      <PageBanner
        title={expert.title}
        description={`${typeof expert.city === 'object' && expert.city !== null ? (expert.city as any).name : (expert.city || '')}, ${typeof expert.country === 'object' && expert.country !== null ? (expert.country as any).name : (expert.country || '')}`}
        icon={UserCircle}
        stats={[
          { value: (expert.yearsExperience || 0).toString(), label: t('experts.stats.yearsExp') },
          { value: "0", label: t('experts.stats.completedMissions') },
          { value: `${(expert.ratingAvg || 0).toFixed(1)}`, label: t('experts.stats.rating') }
        ]}
      />

      {/* Sub Menu */}
      {isSearchContext && searchSection ? (
        <SearchSectionTabs activeTab={searchSection} />
      ) : (
        <ExpertsSubMenu />
      )}

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Expert Header Card */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-3xl font-bold">
                  {expert.firstName[0]}{expert.lastName[0]}
                </span>
              </div>
              <div className="flex-1">
                <div className="mb-2">
                  <h1 className="text-2xl font-bold text-primary mb-1">
                    {/* Nom masqué pour confidentialité */}
                  </h1>
                  <p className="text-lg text-muted-foreground mb-3">{expert.title}</p>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4 flex-wrap">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {typeof expert.city === 'object' && expert.city !== null ? (expert.city as any).name : (expert.city || '')}, {typeof expert.country === 'object' && expert.country !== null ? (expert.country as any).name : (expert.country || '')}
                  </span>
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {expert.phone}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button onClick={openContactDialog}>
                    <Mail className="w-4 h-4 mr-2" />
                    {t('experts.publicProfile.contactExpert')}
                  </Button>
                  <Button variant="outline" onClick={() => setDownloadCvDialogOpen(true)}>
                    <FileDown className="w-4 h-4 mr-2" />
                    Download CV
                  </Button>
                  <Button variant="outline" onClick={() => { setSelectedVacancyId(''); setLinkVacancyDialogOpen(true); }}>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Link to Vacancy
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-2xl font-bold text-primary">{(expert.ratingAvg || 0).toFixed(1)}</span>
                </div>
                <p className="text-xs text-muted-foreground">{t('experts.stats.rating')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary mb-1">0</p>
                <p className="text-xs text-muted-foreground">{t('experts.stats.completedMissions')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary mb-1">{expert.yearsExperience || 0}</p>
                <p className="text-xs text-muted-foreground">{t('experts.stats.yearsExp')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary mb-1">94%</p>
                <p className="text-xs text-muted-foreground">{t('experts.stats.successRate')}</p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                  <UserCircle className="w-5 h-5" />
                  {t('experts.publicProfile.about')}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {expert.bio}
                </p>
              </div>

              {/* Experience */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  {t('experts.publicProfile.experience')}
                </h2>
                <div className="space-y-4">
                  {expert.experiences && expert.experiences.length > 0 ? (
                    expert.experiences.map((exp: any) => (
                      <div key={exp.id} className="border-l-2 border-purple-200 pl-4 pb-4 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-primary">{exp.title}</h3>
                            <p className="text-sm text-muted-foreground">{exp.organization}</p>
                          </div>
                          {exp.isCurrent && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {t('experts.publicProfile.current')}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : ''} - {exp.isCurrent ? t('experts.publicProfile.present') : (exp.endDate ? new Date(exp.endDate).toLocaleDateString() : '')}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {exp.city}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{exp.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg bg-slate-50/50">
                      <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground italic">No professional experience listed</p>
                    </div>
                  )}
                </div>
              </div>

              {writingExperience && (
                <div className="bg-white rounded-lg border p-6">
                  <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Writing Experience
                  </h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Methodologies</p>
                        <div className="flex flex-wrap gap-2">
                          {writingExperience.writingMethodologies.map((item) => (
                            <Badge key={item} variant="secondary">{item}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Contribution</p>
                        <div className="flex flex-wrap gap-2">
                          {writingExperience.writingContributions.map((item) => (
                            <Badge key={item} variant="outline">{item}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Writing languages</p>
                        <div className="flex flex-wrap gap-2">
                          {writingExperience.writingLanguages.map((item) => (
                            <Badge key={item} variant="outline">{item}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div className="rounded-md border bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-muted-foreground">Expert is comfortable to write on</p>
                        <p className="mt-1 text-sm text-primary">{writingExperience.comfortableToWriteOn}</p>
                      </div>
                      <div className="rounded-md border bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-muted-foreground">Experience with donors procurement procedures</p>
                        <p className="mt-1 text-sm text-primary">{writingExperience.donorProcurementExperience}</p>
                      </div>
                      <div className="rounded-md border bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-muted-foreground">Writing experience: comments by experts</p>
                        <p className="mt-1 text-sm text-primary">{writingExperience.writingComments}</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-md border">
                      <table className="w-full min-w-[900px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-muted-foreground">
                          <tr>
                            <th className="px-3 py-2">Title of Tender / Project</th>
                            <th className="px-3 py-2">Donor</th>
                            <th className="px-3 py-2">Country</th>
                            <th className="px-3 py-2">Year</th>
                            <th className="px-3 py-2">Pages</th>
                            <th className="px-3 py-2">Result</th>
                            <th className="px-3 py-2">Reference Person / PM</th>
                            <th className="px-3 py-2">Additional information</th>
                          </tr>
                        </thead>
                        <tbody>
                          {writingExperience.writingExperienceRows.map((row) => (
                            <tr key={row.id} className="border-t">
                              <td className="px-3 py-2 font-medium text-primary">{row.titleOfTenderProject}</td>
                              <td className="px-3 py-2 text-muted-foreground">{row.donor}</td>
                              <td className="px-3 py-2 text-muted-foreground">{row.country}</td>
                              <td className="px-3 py-2 text-muted-foreground">{row.year}</td>
                              <td className="px-3 py-2 text-muted-foreground">{row.indicativePagesWritten}</td>
                              <td className="px-3 py-2">
                                <Badge variant={row.result === 'won' ? 'secondary' : 'outline'}>{row.result}</Badge>
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">{row.referencePersonProjectManager}</td>
                              <td className="px-3 py-2 text-muted-foreground">{row.additionalInformation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Education */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  {t('experts.publicProfile.education')}
                </h2>
                <div className="space-y-4">
                  {expert.educations.map((edu: any) => (
                    <div key={edu.id} className="border-l-2 border-purple-200 pl-4 pb-4 last:pb-0">
                      <h3 className="font-semibold text-primary">{edu.degree}</h3>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span>{edu.fieldOfStudy}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {edu.graduationYear}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  {t('experts.publicProfile.certifications')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {expert.certifications && expert.certifications.length > 0 ? (
                    expert.certifications.map((cert: any, index: number) => (
                      <div key={cert.id || index} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Award className="w-5 h-5 text-purple-500" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-primary text-sm mb-1">
                              {cert.name}
                            </h4>
                            <p className="text-xs text-muted-foreground mb-1">{cert.issuingOrganization || cert.issuerName}</p>
                            <p className="text-xs text-muted-foreground">
                              {cert.issueDate && new Date(cert.issueDate).getFullYear()}
                              {cert.expiryDate && ` - ${new Date(cert.expiryDate).getFullYear()}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-4 text-center border rounded-lg bg-gray-50/50">
                      <p className="text-sm text-muted-foreground">No certifications listed</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Sectors */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-base font-semibold text-primary mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {t('experts.publicProfile.sectors')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {expert.sectors?.map((sector: any, index: number) => (
                    <Badge key={index} variant="secondary">
                      {typeof sector === 'object' ? sector.sectorName || sector.sectorCode : sector}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-base font-semibold text-primary mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {t('experts.publicProfile.skills')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {expert.skills?.map((skill: any, index: number) => (
                    <Badge key={index} variant="outline">
                      {typeof skill === 'object' ? skill.skillName : skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-base font-semibold text-primary mb-3 flex items-center gap-2">
                  <LanguagesIcon className="w-4 h-4" />
                  {t('experts.publicProfile.languages')}
                </h3>
                <div className="space-y-2">
                  {expert.languages?.map((lang: any, index: number) => (
                    <div key={`${lang.languageName || lang.languageCode}-${index}`} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{lang.languageName || lang.languageCode}</span>
                      <Badge variant="outline" className="text-xs">
                        {lang.proficiency}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Stats */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200 p-6">
                <h3 className="text-base font-semibold text-primary mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {t('experts.publicProfile.performance')}
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{t('experts.stats.profileCompleteness')}</span>
                      <span className="text-xs font-semibold text-primary">95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{t('experts.stats.responseRate')}</span>
                      <span className="text-xs font-semibold text-primary">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{t('experts.stats.matchingRate')}</span>
                      <span className="text-xs font-semibold text-primary">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                </div>
              </div>

              {/* Linked Vacancies */}
              {(() => {
                const expertRecord = expertLibrary.find((r) => r.expertId === id);
                const linkedVacancies = expertRecord?.linkedVacancies || [];
                if (linkedVacancies.length === 0) return null;
                return (
                  <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-base font-semibold text-primary mb-3 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      Linked Vacancies
                    </h3>
                    <div className="space-y-2">
                      {linkedVacancies.map((link) => (
                        <div key={link.vacancyId} className="rounded-lg border bg-gray-50 p-3 text-sm">
                          <p className="font-medium text-primary">{link.vacancyTitle}</p>
                          {link.projectTitle && (
                            <p className="text-xs text-muted-foreground">{link.projectTitle}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Linked {new Date(link.linkedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Download CV Dialog */}
      <Dialog open={downloadCvDialogOpen} onOpenChange={setDownloadCvDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileDown className="w-5 h-5 text-accent" />
              Download CV
            </DialogTitle>
            <DialogDescription>
              Select a format to download the expert's CV.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm font-medium text-primary">Standard Format</p>
            <div
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                selectedCvFormat === 'Full CV' ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedCvFormat('Full CV')}
            >
              <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedCvFormat === 'Full CV' ? 'border-accent' : 'border-gray-300'}`}>
                {selectedCvFormat === 'Full CV' && <div className="h-2 w-2 rounded-full bg-accent" />}
              </div>
              <div>
                <p className="text-sm font-medium">Full CV</p>
                <p className="text-xs text-muted-foreground">Complete profile document</p>
              </div>
            </div>

            <p className="text-sm font-medium text-primary pt-1">Donor Formats</p>
            <div className="grid grid-cols-1 gap-2">
              {EXPERT_DONOR_REFERENCE_FORMATS.map((fmt) => (
                <div
                  key={fmt}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    selectedCvFormat === fmt ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCvFormat(fmt)}
                >
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedCvFormat === fmt ? 'border-accent' : 'border-gray-300'}`}>
                    {selectedCvFormat === fmt && <div className="h-2 w-2 rounded-full bg-accent" />}
                  </div>
                  <p className="text-sm font-medium">{fmt}</p>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDownloadCvDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const fileName = downloadExpertCvFile(expert, selectedCvFormat);
                recordExpertDownload(String(expert.id), selectedCvFormat, fileName);
                toast.success(`CV downloaded: ${selectedCvFormat}`);
                setDownloadCvDialogOpen(false);
              }}
            >
              <FileDown className="w-4 h-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link to Vacancy Dialog */}
      <Dialog open={linkVacancyDialogOpen} onOpenChange={setLinkVacancyDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-accent" />
              Link Expert to Vacancy
            </DialogTitle>
            <DialogDescription>
              Select a vacancy to link this expert's CV to.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-72 overflow-y-auto space-y-2">
            {availableVacancies.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No vacancies available.</p>
            ) : (
              availableVacancies.map((vacancy) => (
                <div
                  key={vacancy.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                    selectedVacancyId === vacancy.id ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedVacancyId(vacancy.id)}
                >
                  <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedVacancyId === vacancy.id ? 'border-accent' : 'border-gray-300'}`}>
                    {selectedVacancyId === vacancy.id && <div className="h-2 w-2 rounded-full bg-accent" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">{vacancy.jobTitle}</p>
                    {vacancy.projectTitle && (
                      <p className="text-xs text-muted-foreground">{vacancy.projectTitle}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkVacancyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!selectedVacancyId}
              onClick={() => {
                const vacancy = availableVacancies.find((v) => v.id === selectedVacancyId);
                if (!vacancy) return;
                linkExpertToVacancy(String(expert.id), {
                  vacancyId: vacancy.id,
                  vacancyTitle: vacancy.jobTitle,
                  projectTitle: vacancy.projectTitle,
                });
                toast.success(`Expert linked to "${vacancy.jobTitle}"`);
                setLinkVacancyDialogOpen(false);
              }}
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Link Expert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#B82547]" />
              {t('experts.contact.title')}
            </DialogTitle>
            <DialogDescription>
              {t('experts.contact.description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center gap-4 py-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">
                {expert.firstName[0]}{expert.lastName[0]}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-primary">
                {/* Nom masqué pour confidentialité */}
              </h4>
              <p className="text-sm text-muted-foreground">{expert.title}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('experts.contact.subject')}
              </label>
              <Input
                type="text"
                placeholder={t('experts.contact.subjectPlaceholder')}
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('experts.contact.message')}
              </label>
              <Textarea
                placeholder={t('experts.contact.messagePlaceholder')}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setContactDialogOpen(false)}
              disabled={isSending}
            >
              {t('experts.contact.cancel')}
            </Button>
            <Button
              type="button"
              onClick={sendContactMessage}
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('experts.contact.sending')}
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  {t('experts.contact.send')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invitation Dialog */}
      <Dialog open={invitationDialogOpen} onOpenChange={setInvitationDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-[#B82547]" />
              {t('experts.invitation.title')}
            </DialogTitle>
            <DialogDescription>
              {t('experts.invitation.description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center gap-4 py-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">
                {expert.firstName[0]}{expert.lastName[0]}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-primary">
                {/* Nom masqué pour confidentialité */}
              </h4>
              <p className="text-sm text-muted-foreground">{expert.title}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('experts.invitation.opportunity')}
              </label>
              <Input
                type="text"
                placeholder={t('experts.invitation.opportunityPlaceholder')}
                value={invitationOpportunity}
                onChange={(e) => setInvitationOpportunity(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('experts.invitation.message')}
              </label>
              <Textarea
                placeholder={t('experts.invitation.messagePlaceholder')}
                value={invitationMessage}
                onChange={(e) => setInvitationMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setInvitationDialogOpen(false)}
              disabled={isSending}
            >
              {t('experts.invitation.cancel')}
            </Button>
            <Button
              type="button"
              onClick={sendInvitation}
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('experts.invitation.sending')}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t('experts.invitation.send')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
