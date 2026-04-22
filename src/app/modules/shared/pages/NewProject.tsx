import { useTranslation } from '@app/contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ProjectsSubMenu } from '@app/components/ProjectsSubMenu';
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
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Plus, ArrowLeft, CheckCircle2, X } from 'lucide-react';
import { useProjectsContext } from '@app/contexts/ProjectsContext';
import { ProjectSectorSubsectorFilter } from '@app/components/ProjectSectorSubsectorFilter';
import { RegionCountryFilter } from '@app/components/RegionCountryFilter';
import { ProjectStatusEnum, ProjectPriorityEnum, ProjectTypeEnum, ProjectSectorEnum, RegionEnum, PROJECT_SUBSECTORS } from '@app/types/project.dto';
import { RegionEnum as TenderRegionEnum, CountryEnum, REGION_COUNTRY_MAP } from '@app/types/tender.dto';

interface TeamMember {
  id: string;
  expertId: string;
  expertName: string;
  role: string;
  allocation: string;
}

interface Partner {
  id: string;
  organizationId: string;
  organizationName: string;
  type: string;
}

export default function NewProject() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addProject } = useProjectsContext();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  // Step 1: General Information
  const [generalInfo, setGeneralInfo] = useState({
    relatedTender: '',
    projectSource: '',
  });

  // Step 2: Basic Information
  const [basicInfo, setBasicInfo] = useState({
    title: '',
    code: '',
    description: '',
    objectives: '',
  });

  // Step 3: Project Details
  const [projectDetails, setProjectDetails] = useState({
    type: '',
    priority: '',
    scope: '',
  });
  const [selectedProjectSectors, setSelectedProjectSectors] = useState<ProjectSectorEnum[]>([]);
  const [selectedProjectSubSectors, setSelectedProjectSubSectors] = useState<string[]>([]);
  const [hoveredSector, setHoveredSector] = useState<ProjectSectorEnum | null>(null);

  // Step 4: Dates, Budget & Location
  const [budgetLocation, setBudgetLocation] = useState({
    startDate: '',
    endDate: '',
    budget: '',
    currency: 'USD',
  });
  const [selectedRegions, setSelectedRegions] = useState<TenderRegionEnum[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<CountryEnum[]>([]);

  // Step 5: Team & Organization
  const [organization, setOrganization] = useState({
    leadOrganization: '',
    donor: '',
    implementingPartner: '',
  });

  const [partners, setPartners] = useState<Partner[]>([]);

  // Step 6: Team Members
  const [teamInfo, setTeamInfo] = useState({
    projectManager: '',
    technicalLead: '',
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Load template data if available
  useEffect(() => {
    const templateData = sessionStorage.getItem('projectTemplate');
    if (templateData) {
      try {
        const template = JSON.parse(templateData);
        
        // Pre-fill form with template data
        if (template.templateName) {
          setBasicInfo(prev => ({
            ...prev,
            title: template.templateName,
            description: template.description || ''
          }));
        }
        
        if (template.type) {
          setProjectDetails(prev => ({
            ...prev,
            type: template.type
          }));
          setSelectedProjectSectors((prev) => (
            prev.includes(template.sector) ? prev : [...prev, template.sector]
          ));
        }
        
        if (template.estimatedBudget) {
          setBudgetLocation(prev => ({
            ...prev,
            budget: template.estimatedBudget.toString()
          }));
        }
        
        // Clear the template from sessionStorage after loading
        sessionStorage.removeItem('projectTemplate');
        
        // Show info toast
        toast.info(t('projects.create.templateLoaded'));
      } catch (error) {
        console.error('Error loading template:', error);
      }
    }
  }, [t]);

  const steps = [
    { number: 1, title: t('projects.create.step1') },
    { number: 2, title: t('projects.create.step2') },
    { number: 3, title: t('projects.create.step3') },
    { number: 4, title: t('projects.create.step4') },
    { number: 5, title: t('projects.create.step5') },
    { number: 6, title: t('projects.create.step6') },
    { number: 7, title: t('projects.create.step7') },
  ];

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!generalInfo.projectSource) {
          toast.error(t('common.fillRequired'));
          return false;
        }
        return true;
      case 2:
        if (!basicInfo.title.trim()) {
          toast.error(t('projects.create.validation.title'));
          return false;
        }
        if (!basicInfo.code.trim()) {
          toast.error(t('projects.create.validation.code'));
          return false;
        }
        if (!basicInfo.description.trim()) {
          toast.error(t('common.fillRequired'));
          return false;
        }
        return true;
      case 3:
        if (!projectDetails.type) {
          toast.error(t('projects.create.validation.type'));
          return false;
        }
        if (!projectDetails.priority) {
          toast.error(t('common.fillRequired'));
          return false;
        }
        if (selectedProjectSectors.length === 0) {
          toast.error(t('common.fillRequired'));
          return false;
        }
        if (!projectDetails.scope) {
          toast.error(t('common.fillRequired'));
          return false;
        }
        return true;
      case 4:
        if (!budgetLocation.startDate) {
          toast.error(t('common.fillRequired'));
          return false;
        }
        if (!budgetLocation.endDate) {
          toast.error(t('common.fillRequired'));
          return false;
        }
        if (budgetLocation.endDate <= budgetLocation.startDate) {
          toast.error(t('projects.create.validation.dates'));
          return false;
        }
        if (!budgetLocation.budget || parseFloat(budgetLocation.budget) <= 0) {
          toast.error(t('projects.create.validation.budget'));
          return false;
        }
        if (selectedCountries.length === 0) {
          toast.error(t('common.fillRequired'));
          return false;
        }
        return true;
      case 5:
        if (!organization.leadOrganization) {
          toast.error(t('common.fillRequired'));
          return false;
        }
        return true;
      case 6:
        if (!teamInfo.projectManager) {
          toast.error(t('projects.create.validation.manager'));
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(currentStep + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const handleSubmit = () => {
    // Calculer la durée en mois
    const start = new Date(budgetLocation.startDate);
    const end = new Date(budgetLocation.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));

    // Créer le nouveau projet avec toutes les données requises par le DTO
    const newProject = {
      id: `proj-${Date.now()}`,
      organizationId: 'org-1', // Organisation actuelle (demo)
      code: basicInfo.code,
      title: basicInfo.title,
      name: basicInfo.title, // Pour ProjectListDTOInternal
      description: basicInfo.description,
      status: ProjectStatusEnum.PLANNING as ProjectStatusEnum,
      priority: projectDetails.priority as ProjectPriorityEnum,
      type: projectDetails.type as ProjectTypeEnum,
      country: selectedCountries[0],
      region: RegionEnum.AFRICA_EAST as RegionEnum, // Devrait être mappé depuis le pays
      sector: selectedProjectSectors[0] as ProjectSectorEnum,
      subsectors: selectedProjectSubSectors,
      budget: {
        total: parseFloat(budgetLocation.budget),
        spent: 0,
        remaining: parseFloat(budgetLocation.budget),
        currency: budgetLocation.currency,
      },
      timeline: {
        startDate: budgetLocation.startDate,
        endDate: budgetLocation.endDate,
        duration,
        completionPercentage: 0,
      },
      leadOrganization: organization.leadOrganization,
      partners: partners.map(p => p.organizationName || p.organizationId),
      teamSize: teamMembers.length + 2, // +2 pour PM et TL
      managerName: teamInfo.projectManager,
      tasksCompleted: 0,
      totalTasks: 0,
      createdDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
      countries: selectedCountries,
      sectors: selectedProjectSectors,
    };

    // Ajouter le projet au contexte
    addProject(newProject);
    
    // Message de succès et redirection
    toast.success(t('projects.create.success'));
    navigate('/projects');
  };

  const addPartner = () => {
    const newPartner: Partner = {
      id: Date.now().toString(),
      organizationId: '',
      organizationName: '',
      type: 'PARTNER',
    };
    setPartners([...partners, newPartner]);
  };

  const removePartner = (id: string) => {
    setPartners(partners.filter(p => p.id !== id));
  };

  const updatePartner = (id: string, field: string, value: string) => {
    setPartners(partners.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addTeamMember = () => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      expertId: '',
      expertName: '',
      role: '',
      allocation: '100',
    };
    setTeamMembers([...teamMembers, newMember]);
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  const updateTeamMember = (id: string, field: string, value: string) => {
    setTeamMembers(teamMembers.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const toggleProjectSector = (sector: ProjectSectorEnum) => {
    const next = selectedProjectSectors.includes(sector)
      ? selectedProjectSectors.filter(item => item !== sector)
      : [...selectedProjectSectors, sector];
    setSelectedProjectSectors(next);

    if (next.length === 0) {
      setSelectedProjectSubSectors([]);
      return;
    }

    const validSubSectors = selectedProjectSubSectors.filter(sub =>
      next.some(selected => (PROJECT_SUBSECTORS[selected] || []).includes(sub))
    );
    setSelectedProjectSubSectors(validSubSectors);
  };

  const toggleProjectSubSector = (subSector: string) => {
    setSelectedProjectSubSectors(prev => (
      prev.includes(subSector) ? prev.filter(item => item !== subSector) : [...prev, subSector]
    ));
  };

  const toggleRegion = (region: TenderRegionEnum) => {
    const next = selectedRegions.includes(region)
      ? selectedRegions.filter(item => item !== region)
      : [...selectedRegions, region];
    setSelectedRegions(next);

    if (next.length === 0) {
      setSelectedCountries([]);
      return;
    }

    const validCountries = selectedCountries.filter(country =>
      next.some(selected => (REGION_COUNTRY_MAP[selected] || []).includes(country))
    );
    setSelectedCountries(validCountries);
  };

  const toggleCountry = (country: CountryEnum) => {
    setSelectedCountries(prev => (
      prev.includes(country) ? prev.filter(item => item !== country) : [...prev, country]
    ));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="relatedTender">{t('projects.create.relatedTender')}</Label>
              <Select value={generalInfo.relatedTender} onValueChange={(value) => setGeneralInfo({ ...generalInfo, relatedTender: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t('projects.create.relatedTenderPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('common.select')}</SelectItem>
                  <SelectItem value="tender1">Rural Infrastructure Development - East Africa Region</SelectItem>
                  <SelectItem value="tender2">Education System Modernization Program - West Africa</SelectItem>
                  <SelectItem value="tender3">Healthcare Capacity Building Initiative</SelectItem>
                  <SelectItem value="tender4">Climate Resilience and Adaptation Project</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectSource">{t('projects.create.projectSource')} *</Label>
              <Select value={generalInfo.projectSource} onValueChange={(value) => setGeneralInfo({ ...generalInfo, projectSource: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TENDER">{t('projects.create.source.TENDER')}</SelectItem>
                  <SelectItem value="INTERNAL">{t('projects.create.source.INTERNAL')}</SelectItem>
                  <SelectItem value="PARTNERSHIP">{t('projects.create.source.PARTNERSHIP')}</SelectItem>
                  <SelectItem value="GRANT">{t('projects.create.source.GRANT')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">{t('projects.create.projectTitle')} *</Label>
                <Input
                  id="title"
                  value={basicInfo.title}
                  onChange={(e) => setBasicInfo({ ...basicInfo, title: e.target.value })}
                  placeholder={t('projects.create.projectTitle')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">{t('projects.create.projectCode')} *</Label>
                <Input
                  id="code"
                  value={basicInfo.code}
                  onChange={(e) => setBasicInfo({ ...basicInfo, code: e.target.value })}
                  placeholder="PRJ-2024-001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('projects.create.projectDescription')} *</Label>
              <Textarea
                id="description"
                value={basicInfo.description}
                onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                placeholder={t('projects.create.projectDescription')}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objectives">{t('projects.create.projectObjectives')}</Label>
              <Textarea
                id="objectives"
                value={basicInfo.objectives}
                onChange={(e) => setBasicInfo({ ...basicInfo, objectives: e.target.value })}
                placeholder={t('projects.create.projectObjectives')}
                rows={4}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="type">{t('projects.create.projectType')} *</Label>
                <Select value={projectDetails.type} onValueChange={(value) => setProjectDetails({ ...projectDetails, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEVELOPMENT">{t('projects.type.DEVELOPMENT')}</SelectItem>
                    <SelectItem value="INFRASTRUCTURE">{t('projects.type.INFRASTRUCTURE')}</SelectItem>
                    <SelectItem value="CAPACITY_BUILDING">{t('projects.type.CAPACITY_BUILDING')}</SelectItem>
                    <SelectItem value="RESEARCH">{t('projects.type.RESEARCH')}</SelectItem>
                    <SelectItem value="TECHNICAL_ASSISTANCE">{t('projects.type.TECHNICAL_ASSISTANCE')}</SelectItem>
                    <SelectItem value="HUMANITARIAN">{t('projects.type.HUMANITARIAN')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">{t('projects.create.projectPriority')} *</Label>
                <Select value={projectDetails.priority} onValueChange={(value) => setProjectDetails({ ...projectDetails, priority: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">{t('projects.priority.LOW')}</SelectItem>
                    <SelectItem value="MEDIUM">{t('projects.priority.MEDIUM')}</SelectItem>
                    <SelectItem value="HIGH">{t('projects.priority.HIGH')}</SelectItem>
                    <SelectItem value="URGENT">{t('projects.priority.URGENT')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="scope">{t('projects.create.projectScope')} *</Label>
                <Select value={projectDetails.scope} onValueChange={(value) => setProjectDetails({ ...projectDetails, scope: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOCAL">{t('projects.create.scope.LOCAL')}</SelectItem>
                    <SelectItem value="NATIONAL">{t('projects.create.scope.NATIONAL')}</SelectItem>
                    <SelectItem value="REGIONAL">{t('projects.create.scope.REGIONAL')}</SelectItem>
                    <SelectItem value="INTERNATIONAL">{t('projects.create.scope.INTERNATIONAL')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('projects.create.projectSector')} *</Label>
              <ProjectSectorSubsectorFilter
                selectedSectors={selectedProjectSectors}
                selectedSubSectors={selectedProjectSubSectors}
                hoveredSector={hoveredSector}
                onHoverSector={setHoveredSector}
                onSelectSector={toggleProjectSector}
                onSelectSubSector={toggleProjectSubSector}
                onSelectAllSectors={() => {
                  if (selectedProjectSectors.length === Object.values(ProjectSectorEnum).length) {
                    setSelectedProjectSectors([]);
                    setSelectedProjectSubSectors([]);
                  } else {
                    setSelectedProjectSectors(Object.values(ProjectSectorEnum));
                  }
                }}
                onSelectAllSubSectors={(sector) => {
                  const subs = PROJECT_SUBSECTORS[sector] || [];
                  const allSelected = subs.every(item => selectedProjectSubSectors.includes(item));
                  if (allSelected) {
                    setSelectedProjectSubSectors(prev => prev.filter(item => !subs.includes(item)));
                  } else {
                    setSelectedProjectSubSectors(prev => [...new Set([...prev, ...subs])]);
                  }
                }}
                t={t}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">{t('projects.create.estimatedStartDate')} *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={budgetLocation.startDate}
                  onChange={(e) => setBudgetLocation({ ...budgetLocation, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">{t('projects.create.estimatedEndDate')} *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={budgetLocation.endDate}
                  onChange={(e) => setBudgetLocation({ ...budgetLocation, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="budget">{t('projects.create.totalBudget')} *</Label>
                <Input
                  id="budget"
                  type="number"
                  value={budgetLocation.budget}
                  onChange={(e) => setBudgetLocation({ ...budgetLocation, budget: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">{t('projects.create.currency')} *</Label>
                <Select value={budgetLocation.currency} onValueChange={(value) => setBudgetLocation({ ...budgetLocation, currency: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('projects.create.country')} *</Label>
              <RegionCountryFilter
                selectedRegions={selectedRegions}
                selectedCountries={selectedCountries}
                onSelectRegion={toggleRegion}
                onSelectCountry={toggleCountry}
                onSelectAllRegions={() => {
                  if (selectedRegions.length === Object.values(TenderRegionEnum).length) {
                    setSelectedRegions([]);
                    setSelectedCountries([]);
                  } else {
                    setSelectedRegions(Object.values(TenderRegionEnum));
                  }
                }}
                t={t}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="leadOrg">{t('projects.create.leadOrganization')} *</Label>
              <Select value={organization.leadOrganization} onValueChange={(value) => setOrganization({ ...organization, leadOrganization: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="org1">United Nations Development Programme (UNDP)</SelectItem>
                  <SelectItem value="org2">World Bank Group</SelectItem>
                  <SelectItem value="org3">African Development Bank</SelectItem>
                  <SelectItem value="org4">European Union</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="donor">{t('projects.create.donor')}</Label>
              <Select value={organization.donor} onValueChange={(value) => setOrganization({ ...organization, donor: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="donor1">USAID</SelectItem>
                  <SelectItem value="donor2">DFID - UK Aid</SelectItem>
                  <SelectItem value="donor3">GIZ - Germany</SelectItem>
                  <SelectItem value="donor4">AFD - France</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t('projects.create.partnerOrganizations')}</Label>
                <Button type="button" variant="outline" size="sm" onClick={addPartner}>
                  {t('projects.create.addPartner')}
                </Button>
              </div>

              {partners.map((partner) => (
                <div key={partner.id} className="flex gap-3 items-start p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Select value={partner.organizationId} onValueChange={(value) => updatePartner(partner.id, 'organizationId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('common.select')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="p1">Save the Children International</SelectItem>
                        <SelectItem value="p2">Oxfam International</SelectItem>
                        <SelectItem value="p3">CARE International</SelectItem>
                        <SelectItem value="p4">Médecins Sans Frontières</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={partner.type} onValueChange={(value) => updatePartner(partner.id, 'type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('projects.create.partnerType')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PARTNER">{t('projects.create.partnerType.PARTNER')}</SelectItem>
                        <SelectItem value="IMPLEMENTING">{t('projects.create.partnerType.IMPLEMENTING')}</SelectItem>
                        <SelectItem value="TECHNICAL">{t('projects.create.partnerType.TECHNICAL')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removePartner(partner.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="projectManager">{t('projects.create.projectManager')} *</Label>
                <Select value={teamInfo.projectManager} onValueChange={(value) => setTeamInfo({ ...teamInfo, projectManager: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('projects.create.selectExpert')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exp1">Sarah Johnson - Project Management Expert</SelectItem>
                    <SelectItem value="exp2">Michael Chen - Senior Program Manager</SelectItem>
                    <SelectItem value="exp3">Aisha Ndlovu - Infrastructure Specialist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="technicalLead">{t('projects.create.technicalLead')}</Label>
                <Select value={teamInfo.technicalLead} onValueChange={(value) => setTeamInfo({ ...teamInfo, technicalLead: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('projects.create.selectExpert')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exp4">Carlos Rodriguez - Technical Advisor</SelectItem>
                    <SelectItem value="exp5">Dr. Fatima Hassan - Health Systems Expert</SelectItem>
                    <SelectItem value="exp6">Jean-Pierre Dubois - Engineering Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t('projects.create.teamMembers')}</Label>
                <Button type="button" variant="outline" size="sm" onClick={addTeamMember}>
                  {t('projects.create.addTeamMember')}
                </Button>
              </div>

              {teamMembers.map((member) => (
                <div key={member.id} className="flex gap-3 items-start p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Select value={member.expertId} onValueChange={(value) => updateTeamMember(member.id, 'expertId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('projects.create.selectExpert')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="e1">Marie Dupont - Finance Officer</SelectItem>
                        <SelectItem value="e2">Ahmed Mohamed - M&E Specialist</SelectItem>
                        <SelectItem value="e3">Laura Garcia - Communications</SelectItem>
                        <SelectItem value="e4">David Ochieng - Logistics Coordinator</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={member.role} onValueChange={(value) => updateTeamMember(member.id, 'role', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('projects.create.selectRole')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="projectCoordinator">
                          {t('projects.create.roles.projectCoordinator')}
                        </SelectItem>
                        <SelectItem value="technicalSpecialist">
                          {t('projects.create.roles.technicalSpecialist')}
                        </SelectItem>
                        <SelectItem value="fieldOfficer">
                          {t('projects.create.roles.fieldOfficer')}
                        </SelectItem>
                        <SelectItem value="monitoringEvaluation">
                          {t('projects.create.roles.monitoringEvaluation')}
                        </SelectItem>
                        <SelectItem value="financialOfficer">
                          {t('projects.create.roles.financialOfficer')}
                        </SelectItem>
                        <SelectItem value="communicationsOfficer">
                          {t('projects.create.roles.communicationsOfficer')}
                        </SelectItem>
                        <SelectItem value="logisticsOfficer">
                          {t('projects.create.roles.logisticsOfficer')}
                        </SelectItem>
                        <SelectItem value="hrOfficer">
                          {t('projects.create.roles.hrOfficer')}
                        </SelectItem>
                        <SelectItem value="consultant">
                          {t('projects.create.roles.consultant')}
                        </SelectItem>
                        <SelectItem value="advisor">
                          {t('projects.create.roles.advisor')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={member.allocation}
                      onChange={(e) => updateTeamMember(member.id, 'allocation', e.target.value)}
                      placeholder={t('projects.create.memberAllocation')}
                      min="0"
                      max="100"
                    />
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeTeamMember(member.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-primary">{t('projects.create.reviewTitle')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('projects.create.reviewSubtitle')}</p>
            </div>

            {/* General Information */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-3">{t('projects.create.generalInfo')}</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">{t('projects.create.relatedTender')}:</span>
                  <p className="font-medium">{generalInfo.relatedTender || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.create.projectSource')}:</span>
                  <p className="font-medium">{generalInfo.projectSource ? t(`projects.create.source.${generalInfo.projectSource}`) : '-'}</p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-3">{t('projects.create.basicInfo')}</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">{t('projects.create.projectTitle')}:</span>
                  <p className="font-medium">{basicInfo.title}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.create.projectCode')}:</span>
                  <p className="font-medium">{basicInfo.code}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.create.projectDescription')}:</span>
                  <p className="font-medium">{basicInfo.description}</p>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-3">{t('projects.create.details')}</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">{t('projects.create.projectType')}:</span>
                  <p className="font-medium">{projectDetails.type ? t(`projects.type.${projectDetails.type}`) : '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.create.projectPriority')}:</span>
                  <p className="font-medium">{projectDetails.priority ? t(`projects.priority.${projectDetails.priority}`) : '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.create.projectSector')}:</span>
                  <p className="font-medium">
                    {selectedProjectSectors.length > 0
                      ? selectedProjectSectors.map((sector) => t(`projects.sector.${sector}`)).join(', ')
                      : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.filters.subsector')}:</span>
                  <p className="font-medium">
                    {selectedProjectSubSectors.length > 0
                      ? selectedProjectSubSectors.map((subsector) => t(`subsectors.${subsector}`)).join(', ')
                      : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.create.projectScope')}:</span>
                  <p className="font-medium">{projectDetails.scope ? t(`projects.create.scope.${projectDetails.scope}`) : '-'}</p>
                </div>
              </div>
            </div>

            {/* Budget & Location */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-3">{t('projects.create.budgetLocation')}</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">{t('projects.create.totalBudget')}:</span>
                  <p className="font-medium">{budgetLocation.budget} {budgetLocation.currency}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.create.country')}:</span>
                  <p className="font-medium">{selectedCountries.length > 0 ? selectedCountries.map((country) => t(`countries.${country}`)).join(', ') : '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.create.estimatedStartDate')}:</span>
                  <p className="font-medium">{budgetLocation.startDate}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.create.estimatedEndDate')}:</span>
                  <p className="font-medium">{budgetLocation.endDate}</p>
                </div>
              </div>
            </div>

            {/* Organization */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-3">{t('projects.create.organization')}</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">{t('projects.create.leadOrganization')}:</span>
                  <p className="font-medium">{organization.leadOrganization || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.create.partnerOrganizations')}:</span>
                  <p className="font-medium">{partners.length} {t('projects.create.partnerOrganizations')}</p>
                </div>
              </div>
            </div>

            {/* Team */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-3">{t('projects.create.team')}</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">{t('projects.create.projectManager')}:</span>
                  <p className="font-medium">{teamInfo.projectManager || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.create.technicalLead')}:</span>
                  <p className="font-medium">{teamInfo.technicalLead || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('projects.create.teamMembers')}:</span>
                  <p className="font-medium">{teamMembers.length} {t('projects.create.teamMembers')}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('projects.actions.newProject')}
        description={t('projects.actions.newProjectDescription')}
        icon={Plus}
      />

      {/* Sub Menu */}
      <ProjectsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold shadow-sm transition-all ${
                        currentStep === step.number
                          ? 'bg-[#B82547] text-white ring-4 ring-[#B82547]/20'
                          : currentStep > step.number
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-500 border-2 border-gray-300'
                      }`}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span className={`text-xs mt-2 text-center hidden md:block transition-colors ${
                      currentStep === step.number ? 'text-[#B82547] font-semibold' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded transition-colors ${
                      currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <div className="mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-[#3d4654]">
                {steps[currentStep - 1].title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {t('projects.create.step')} {currentStep} {t('common.of')} {totalSteps}
              </p>
            </div>
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-gray-500">
              {currentStep < totalSteps && (
                <span>
                  {t('projects.create.step')} {currentStep} {t('common.of')} {totalSteps}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevious} className="border-gray-300">
                  {t('projects.create.previous')}
                </Button>
              )}
              {currentStep < totalSteps ? (
                <Button onClick={handleNext} className="bg-[#B82547] hover:bg-[#a01f3c]">
                  {t('projects.create.next')}
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                  {t('projects.create.submit')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}