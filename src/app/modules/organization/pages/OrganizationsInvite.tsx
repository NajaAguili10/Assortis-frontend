import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAssistanceHistory } from '@app/contexts/AssistanceHistoryContext';
import { usePipeline } from '@app/modules/expert/hooks/usePipeline';
import { useTenders } from '@app/hooks/useTenders';
import { useToRs } from '@app/hooks/useToRs';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OrganizationsSubMenu } from '@app/components/OrganizationsSubMenu';
import { MonEspaceSubMenu } from '@app/components/MonEspaceSubMenu';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Textarea } from '@app/components/ui/textarea';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';
import {
  Building2,
  Users,
  Handshake,
  UserPlus,
  Briefcase,
  Target,
  ArrowLeft,
  Send,
  CheckCircle2,
  Search,
  Mail,
  Bell,
  Plus,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { PROFESSIONAL_TITLES } from '@app/config/professional.config';

type RecipientType = 'organization' | 'expert' | null;
type InvitationType = 'partnership' | 'consortium' | 'collaboration' | 'team' | 'consultant' | 'advisor' | null;

interface InviteStep {
  number: number;
  name: string;
}

// Mock data for selection
const mockOrganizations = [
  { id: '1', name: 'UNICEF', type: 'International Organization', verified: true, email: 'contact@unicef.org' },
  { id: '2', name: 'World Bank', type: 'International Organization', verified: true, email: 'info@worldbank.org' },
  { id: '3', name: 'Red Cross', type: 'NGO', verified: true, email: 'contact@redcross.org' },
  { id: '4', name: 'Doctors Without Borders', type: 'NGO', verified: true, email: 'info@msf.org' },
  { id: '5', name: 'UNESCO', type: 'International Organization', verified: true, email: 'contact@unesco.org' },
];

const mockExperts = [
  { id: '1', name: 'Dr. Sarah Johnson', expertise: 'Health & Development', verified: true, email: 'sarah.johnson@expert.com' },
  { id: '2', name: 'John Smith', expertise: 'Project Management', verified: true, email: 'john.smith@expert.com' },
  { id: '3', name: 'Marie Dupont', expertise: 'Education', verified: true, email: 'marie.dupont@expert.com' },
  { id: '4', name: 'Ahmed Hassan', expertise: 'Infrastructure', verified: true, email: 'ahmed.hassan@expert.com' },
  { id: '5', name: 'Elena Rodriguez', expertise: 'Environment', verified: true, email: 'elena.rodriguez@expert.com' },
];

// Mock data for projects
const mockProjects = [
  { id: '1', code: 'PROJ-2024-001', title: 'Rural Education Infrastructure Development', status: 'ACTIVE', sector: 'Education' },
  { id: '2', code: 'PROJ-2024-002', title: 'Community Health Centers Network', status: 'ACTIVE', sector: 'Health' },
  { id: '3', code: 'PROJ-2024-003', title: 'Sustainable Agriculture Transformation', status: 'PLANNING', sector: 'Agriculture' },
  { id: '4', code: 'PROJ-2024-004', title: 'Clean Water Access Program', status: 'ACTIVE', sector: 'Infrastructure' },
  { id: '5', code: 'PROJ-2024-005', title: 'Youth Skills Development Initiative', status: 'EXECUTION', sector: 'Education' },
];

// Maximum number of invitations allowed
const MAX_INVITATIONS = 2;

export default function OrganizationsInvite() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { addHistoryEntry } = useAssistanceHistory();
  const { pipelineItems } = usePipeline();
  const { allTenders } = useTenders();
  const { allToRs } = useToRs();
  
  // Detect which module we're in based on the URL path
  const isMonEspace = location.pathname.startsWith('/mon-espace');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [recipientType, setRecipientType] = useState<RecipientType>(null);
  const [invitationType, setInvitationType] = useState<InvitationType>(null);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Invitation limit tracking
  const [invitationsSent, setInvitationsSent] = useState(0);
  
  // States for Consortium and Collaboration references
  const [selectedTender, setSelectedTender] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  
  // Get ToRs from Pipeline (Pipeline contains only ToRs)
  const pipelineTenders = useMemo(() => {
    return pipelineItems
      .map(item => {
        // Try to find in tenders first
        let tender = allTenders.find(t => String(t.id) === String(item.tenderId));
        let isToR = false;
        
        // If not found in tenders, try to find in ToRs
        if (!tender) {
          tender = allToRs.find(t => String(t.id) === String(item.tenderId));
          isToR = true;
        }
        
        return tender ? {
          id: String(tender.id),
          reference: tender.reference || (tender as any).referenceNumber,
          title: tender.title,
          sector: tender.sector || (tender as any).sectors?.[0],
          deadline: tender.deadline,
          isToR
        } : null;
      })
      .filter(Boolean);
  }, [pipelineItems, allTenders, allToRs]);
  
  // New states for adding new expert/organization
  const [showAddExpertForm, setShowAddExpertForm] = useState(false);
  const [showAddOrganizationForm, setShowAddOrganizationForm] = useState(false);
  
  // New Expert Form Fields
  const [newExpertData, setNewExpertData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    expertise: '',
    yearsOfExperience: '',
    certifications: '',
    bio: '',
  });
  
  // New Organization Form Fields
  const [newOrgData, setNewOrgData] = useState({
    organizationName: '',
    sector: '',
    contactName: '',
    contactPosition: '',
    contactEmail: '',
  });
  
  // Validation errors
  const [expertErrors, setExpertErrors] = useState<Record<string, string>>({});
  const [orgErrors, setOrgErrors] = useState<Record<string, string>>({});

  const steps = [
    { number: 1, name: t('organizations.invite.step.recipient') },
    { number: 2, name: t('organizations.invite.step.type') },
    { number: 3, name: t('organizations.invite.step.select') },
    { number: 4, name: t('organizations.invite.step.message') },
  ];
  
  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Check if email already exists in database
  const checkEmailExists = (email: string, type: 'expert' | 'organization'): boolean => {
    const normalizedEmail = email.trim().toLowerCase();
    
    if (type === 'expert') {
      return mockExperts.some(expert => expert.email.toLowerCase() === normalizedEmail);
    } else {
      return mockOrganizations.some(org => org.email.toLowerCase() === normalizedEmail);
    }
  };
  
  // Validate Expert Form
  const validateExpertForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!newExpertData.firstName.trim()) {
      errors.firstName = t('organizations.invite.addNew.expertForm.validation.firstName');
    }
    
    if (!newExpertData.lastName.trim()) {
      errors.lastName = t('organizations.invite.addNew.expertForm.validation.lastName');
    }
    
    if (!newExpertData.email.trim()) {
      errors.email = t('organizations.invite.addNew.expertForm.validation.email');
    } else if (!isValidEmail(newExpertData.email)) {
      errors.email = t('organizations.invite.addNew.expertForm.validation.emailInvalid');
    } else if (checkEmailExists(newExpertData.email, 'expert')) {
      errors.email = t('organizations.invite.addNew.expertForm.validation.emailDuplicate');
    }
    
    if (!newExpertData.expertise.trim()) {
      errors.expertise = t('organizations.invite.addNew.expertForm.validation.expertise');
    }
    
    setExpertErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Validate Organization Form
  const validateOrganizationForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!newOrgData.organizationName.trim()) {
      errors.organizationName = t('organizations.invite.addNew.organizationForm.validation.name');
    }
    
    if (!newOrgData.sector) {
      errors.sector = t('organizations.invite.addNew.organizationForm.validation.sector');
    }
    
    if (!newOrgData.contactName.trim()) {
      errors.contactName = t('organizations.invite.addNew.organizationForm.validation.contactName');
    }
    
    if (!newOrgData.contactPosition.trim()) {
      errors.contactPosition = t('organizations.invite.addNew.organizationForm.validation.contactPosition');
    }
    
    if (!newOrgData.contactEmail.trim()) {
      errors.contactEmail = t('organizations.invite.addNew.organizationForm.validation.contactEmail');
    } else if (!isValidEmail(newOrgData.contactEmail)) {
      errors.contactEmail = t('organizations.invite.addNew.organizationForm.validation.contactEmailInvalid');
    } else if (checkEmailExists(newOrgData.contactEmail, 'organization')) {
      errors.contactEmail = t('organizations.invite.addNew.organizationForm.validation.contactEmailDuplicate');
    }
    
    setOrgErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(isMonEspace ? '/compte-utilisateur/invitations' : '/organizations/invitations');
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSendInvitation = async () => {
    // Check if invitation limit has been reached
    if (invitationsSent >= MAX_INVITATIONS) {
      toast.error(t('organizations.invite.limit.reached.title'), {
        description: t('organizations.invite.limit.reached.description')
          .replace('{max}', MAX_INVITATIONS.toString()),
        duration: 5000,
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      // Simulate API call for sending email
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate sending email notification
      console.log('Sending email to:', selectedEntity?.name);
      console.log('Email subject:', subject || 'Invitation from Assortis Platform');
      console.log('Email message:', message);
      
      // Simulate API call for system notification
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Increment invitation counter
      const newInvitationCount = invitationsSent + 1;
      setInvitationsSent(newInvitationCount);
      
      const remainingInvitations = MAX_INVITATIONS - newInvitationCount;
      
      // ✅ Enregistrer dans l'historique
      addHistoryEntry({
        type: recipientType === 'organization' ? 'partnership' : 'invitation',
        expertName: recipientType === 'expert' ? selectedEntity?.name : undefined,
        expertRole: recipientType === 'expert' ? selectedEntity?.expertise : undefined,
        organizationName: recipientType === 'organization' ? selectedEntity?.name : 'Mon Organisation',
        partnershipType: invitationType || undefined,
        projectName: selectedProject ? mockProjects.find(p => p.id === selectedProject)?.title : undefined,
        tenderTitle: selectedTender ? pipelineTenders.find(t => t.id === selectedTender)?.title : undefined,
        title: subject || `Invitation ${invitationType ? `- ${invitationType}` : ''}`,
        message: message,
        status: 'sent',
      });
      
      // Show success toast with email notification
      toast.success(t('organizations.invite.success.title'), {
        description: (
          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {t('organizations.invite.success.emailSent')}
            </p>
            <p className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              {t('organizations.invite.success.systemNotification')}
            </p>
            <p className="text-xs mt-2 opacity-75">
              {t('organizations.invite.success.notification').replace('{name}', selectedEntity?.name || '')}
            </p>
            {remainingInvitations > 0 && (
              <p className="text-xs mt-2 font-semibold text-green-700">
                {t('organizations.invite.limit.remaining')
                  .replace('{remaining}', remainingInvitations.toString())
                  .replace('{max}', MAX_INVITATIONS.toString())}
              </p>
            )}
            {remainingInvitations === 0 && (
              <p className="text-xs mt-2 font-semibold text-orange-700">
                {t('organizations.invite.limit.noMore')}
              </p>
            )}
          </div>
        ),
        duration: 5000,
      });
      
      // Reset form fields for next invitation (if remaining invitations)
      if (remainingInvitations > 0) {
        // Reset to step 1 to allow sending another invitation
        setCurrentStep(1);
        setRecipientType(null);
        setInvitationType(null);
        setSelectedEntity(null);
        setSearchQuery('');
        setSubject('');
        setMessage('');
        setSelectedTender('');
        setSelectedProject('');
      } else {
        // If limit reached, navigate back to invitations page after 3 seconds
        setTimeout(() => {
          navigate(isMonEspace ? '/compte-utilisateur/invitations' : '/organizations/invitations');
        }, 3000);
      }
      
    } catch (error) {
      toast.error('Error sending invitation', {
        description: 'Please try again later',
      });
    } finally {
      setIsSending(false);
    }
  };

  const canProceedStep1 = recipientType !== null;
  const canProceedStep2 = invitationType !== null;
  const canProceedStep3 = selectedEntity !== null;
  const canSend = currentStep === 4 && selectedEntity !== null && invitationsSent < MAX_INVITATIONS;
  const limitReached = invitationsSent >= MAX_INVITATIONS;
  const remainingInvitations = MAX_INVITATIONS - invitationsSent;

  const filteredEntities = recipientType === 'organization'
    ? mockOrganizations.filter(org => 
        org.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockExperts.filter(expert => 
        expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expert.expertise.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Determine page description based on current step
  const getPageDescription = () => {
    if (currentStep === 1) return t('organizations.invite.description');
    if (currentStep === 2) return t(recipientType === 'organization' ? 'organizations.invite.orgType.title' : 'organizations.invite.expertType.title');
    if (currentStep === 3) return t(recipientType === 'organization' ? 'organizations.invite.select.organization.title' : 'organizations.invite.select.expert.title');
    if (currentStep === 4) return t('organizations.invite.message.title');
    return '';
  };

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <PageBanner
        title={t('organizations.invite.title')}
        description={getPageDescription()}
        icon={UserPlus}
        stats={[
          { value: `${currentStep}`, label: t('organizations.invite.step.current') },
          { value: `${remainingInvitations}/${MAX_INVITATIONS}`, label: t('organizations.invite.limit.available') },
        ]}
      />

      {/* Sub Menu */}
      {isMonEspace ? <MonEspaceSubMenu /> : <OrganizationsSubMenu />}

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Stepper - Same design as NewProject */}
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
                      {step.name}
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

          {/* Invitation Limit Alert */}
          {limitReached && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-red-900 mb-1">
                    {t('organizations.invite.limit.reached.title')}
                  </h4>
                  <p className="text-sm text-red-700">
                    {t('organizations.invite.limit.reached.description')
                      .replace('{max}', MAX_INVITATIONS.toString())}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {!limitReached && remainingInvitations <= 1 && invitationsSent > 0 && (
            <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-orange-900 mb-1">
                    {t('organizations.invite.limit.warning.title')}
                  </h4>
                  <p className="text-sm text-orange-700">
                    {t('organizations.invite.limit.warning.description')
                      .replace('{remaining}', remainingInvitations.toString())}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Content - Same design as NewProject */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <div className="mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-[#3d4654]">
                {steps[currentStep - 1].name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {t('projects.create.step')} {currentStep} {t('common.of')} {steps.length}
              </p>
            </div>

            <div className="min-h-[400px]">
              {/* Step 1: Choose Recipient Type */}
              {currentStep === 1 && (
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Organization Option */}
                    <button
                      onClick={() => setRecipientType('organization')}
                      className={`p-8 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
                        recipientType === 'organization'
                          ? 'border-[#B82547] bg-[#B82547]/5 shadow-md'
                          : 'border-gray-200 hover:border-[#B82547]/30'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center gap-4">
                        <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                          recipientType === 'organization' ? 'bg-[#B82547]' : 'bg-gray-100'
                        }`}>
                          <Building2 className={`w-8 h-8 ${
                            recipientType === 'organization' ? 'text-white' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-[#3d4654] mb-2">
                            {t('organizations.invite.recipientType.organization')}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {t('organizations.invite.recipientType.organization.description')}
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Expert Option */}
                    <button
                      onClick={() => setRecipientType('expert')}
                      className={`p-8 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
                        recipientType === 'expert'
                          ? 'border-[#B82547] bg-[#B82547]/5 shadow-md'
                          : 'border-gray-200 hover:border-[#B82547]/30'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center gap-4">
                        <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                          recipientType === 'expert' ? 'bg-[#B82547]' : 'bg-gray-100'
                        }`}>
                          <Users className={`w-8 h-8 ${
                            recipientType === 'expert' ? 'text-white' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-[#3d4654] mb-2">
                            {t('organizations.invite.recipientType.expert')}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {t('organizations.invite.recipientType.expert.description')}
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Choose Invitation Type */}
              {currentStep === 2 && (
                <div className="grid gap-6">
                  {recipientType === 'organization' ? (
                    <div className="grid grid-cols-1 gap-4">
                      <button
                        onClick={() => setInvitationType('partnership')}
                        className={`p-6 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                          invitationType === 'partnership'
                            ? 'border-[#B82547] bg-[#B82547]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            invitationType === 'partnership' ? 'bg-[#B82547]' : 'bg-gray-100'
                          }`}>
                            <Handshake className={`w-6 h-6 ${invitationType === 'partnership' ? 'text-white' : 'text-gray-600'}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-[#3d4654] mb-1">
                              {t('organizations.invite.orgType.partnership')}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {t('organizations.invite.orgType.partnership.description')}
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setInvitationType('consortium')}
                        className={`p-6 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                          invitationType === 'consortium'
                            ? 'border-[#B82547] bg-[#B82547]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            invitationType === 'consortium' ? 'bg-[#B82547]' : 'bg-gray-100'
                          }`}>
                            <Target className={`w-6 h-6 ${invitationType === 'consortium' ? 'text-white' : 'text-gray-600'}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-[#3d4654] mb-1">
                              {t('organizations.invite.orgType.consortium')}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {t('organizations.invite.orgType.consortium.description')}
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setInvitationType('collaboration')}
                        className={`p-6 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                          invitationType === 'collaboration'
                            ? 'border-[#B82547] bg-[#B82547]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            invitationType === 'collaboration' ? 'bg-[#B82547]' : 'bg-gray-100'
                          }`}>
                            <UserPlus className={`w-6 h-6 ${invitationType === 'collaboration' ? 'text-white' : 'text-gray-600'}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-[#3d4654] mb-1">
                              {t('organizations.invite.orgType.collaboration')}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {t('organizations.invite.orgType.collaboration.description')}
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      <button
                        onClick={() => setInvitationType('team')}
                        className={`p-6 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                          invitationType === 'team'
                            ? 'border-[#B82547] bg-[#B82547]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            invitationType === 'team' ? 'bg-[#B82547]' : 'bg-gray-100'
                          }`}>
                            <UserPlus className={`w-6 h-6 ${invitationType === 'team' ? 'text-white' : 'text-gray-600'}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-[#3d4654] mb-1">
                              {t('organizations.invite.expertType.team')}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {t('organizations.invite.expertType.team.description')}
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setInvitationType('consultant')}
                        className={`p-6 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                          invitationType === 'consultant'
                            ? 'border-[#B82547] bg-[#B82547]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            invitationType === 'consultant' ? 'bg-[#B82547]' : 'bg-gray-100'
                          }`}>
                            <Briefcase className={`w-6 h-6 ${invitationType === 'consultant' ? 'text-white' : 'text-gray-600'}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-[#3d4654] mb-1">
                              {t('organizations.invite.expertType.consultant')}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {t('organizations.invite.expertType.consultant.description')}
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setInvitationType('advisor')}
                        className={`p-6 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                          invitationType === 'advisor'
                            ? 'border-[#B82547] bg-[#B82547]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            invitationType === 'advisor' ? 'bg-[#B82547]' : 'bg-gray-100'
                          }`}>
                            <Target className={`w-6 h-6 ${invitationType === 'advisor' ? 'text-white' : 'text-gray-600'}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-[#3d4654] mb-1">
                              {t('organizations.invite.expertType.advisor')}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {t('organizations.invite.expertType.advisor.description')}
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                  
                  {/* Conditional Fields for Consortium and Collaboration */}
                  {recipientType === 'organization' && invitationType === 'consortium' && (
                    <div className="mt-6 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <div className="flex items-start gap-3 mb-4">
                        <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-[#3d4654] mb-2">
                            {t('organizations.invite.reference.tender.title')}
                          </h4>
                          <p className="text-sm text-gray-600 mb-4">
                            {t('organizations.invite.reference.tender.description')}
                          </p>
                          {pipelineTenders.length > 0 ? (
                            <>
                              <Select value={selectedTender} onValueChange={setSelectedTender}>
                                <SelectTrigger className="w-full h-11 bg-white">
                                  <SelectValue placeholder={t('organizations.invite.reference.tender.placeholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                  {pipelineTenders.map((tender: any) => (
                                    <SelectItem key={tender.id} value={tender.id}>
                                      <div className="flex flex-col">
                                        <span className="font-medium">{tender.reference}</span>
                                        <span className="text-xs text-gray-500">{tender.title}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {selectedTender && (
                                <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                                  <div className="text-xs text-gray-500 mb-1">{t('organizations.invite.reference.selected')}</div>
                                  <div className="font-semibold text-sm text-[#3d4654]">
                                    {pipelineTenders.find((t: any) => t.id === selectedTender)?.reference}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {pipelineTenders.find((t: any) => t.id === selectedTender)?.title}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-center py-8">
                              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-sm text-gray-600 mb-2">
                                {t('organizations.invite.reference.tender.empty')}
                              </p>
                              <p className="text-xs text-gray-500">
                                {t('organizations.invite.reference.tender.emptyDescription')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {recipientType === 'organization' && invitationType === 'collaboration' && (
                    <div className="mt-6 p-6 bg-green-50 rounded-lg border-2 border-green-200">
                      <div className="flex items-start gap-3 mb-4">
                        <Briefcase className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-[#3d4654] mb-2">
                            {t('organizations.invite.reference.project.title')}
                          </h4>
                          <p className="text-sm text-gray-600 mb-4">
                            {t('organizations.invite.reference.project.description')}
                          </p>
                          <Select value={selectedProject} onValueChange={setSelectedProject}>
                            <SelectTrigger className="w-full h-11 bg-white">
                              <SelectValue placeholder={t('organizations.invite.reference.project.placeholder')} />
                            </SelectTrigger>
                            <SelectContent>
                              {mockProjects.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{project.code}</span>
                                    <span className="text-xs text-gray-500">{project.title}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedProject && (
                            <div className="mt-3 p-3 bg-white rounded border border-green-200">
                              <div className="text-xs text-gray-500 mb-1">{t('organizations.invite.reference.selected')}</div>
                              <div className="font-semibold text-sm text-[#3d4654]">
                                {mockProjects.find(p => p.id === selectedProject)?.code}
                              </div>
                              <div className="text-sm text-gray-600">
                                {mockProjects.find(p => p.id === selectedProject)?.title}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Select Entity */}
              {currentStep === 3 && (
                <div className="grid gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-[#3d4654]">
                        {t(recipientType === 'organization' ? 'organizations.invite.select.organization.title' : 'organizations.invite.select.expert.title')}
                      </h4>
                    </div>
                    {/* Add New Button */}
                    {recipientType === 'expert' && !showAddExpertForm && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddExpertForm(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('organizations.invite.addNew.expert')}
                      </Button>
                    )}
                    {recipientType === 'organization' && !showAddOrganizationForm && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddOrganizationForm(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('organizations.invite.addNew.organization')}
                      </Button>
                    )}
                  </div>

                  {/* Show Add Expert Form */}
                  {recipientType === 'expert' && showAddExpertForm ? (
                    <div className="space-y-6 border rounded-lg p-6 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-primary">
                          {t('organizations.invite.addNew.expertForm.title')}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAddExpertForm(false)}
                        >
                          {t('common.cancel')}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-primary">
                            {t('organizations.invite.addNew.expertForm.firstName')}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <Input
                            value={newExpertData.firstName}
                            onChange={(e) => setNewExpertData({ ...newExpertData, firstName: e.target.value })}
                            placeholder={t('organizations.invite.addNew.expertForm.firstName.placeholder')}
                          />
                          {expertErrors.firstName && <p className="text-red-500 text-sm">{expertErrors.firstName}</p>}
                        </div>

                        {/* Last Name */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-primary">
                            {t('organizations.invite.addNew.expertForm.lastName')}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <Input
                            value={newExpertData.lastName}
                            onChange={(e) => setNewExpertData({ ...newExpertData, lastName: e.target.value })}
                            placeholder={t('organizations.invite.addNew.expertForm.lastName.placeholder')}
                          />
                          {expertErrors.lastName && <p className="text-red-500 text-sm">{expertErrors.lastName}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-primary">
                            {t('organizations.invite.addNew.expertForm.email')}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <Input
                            type="email"
                            value={newExpertData.email}
                            onChange={(e) => setNewExpertData({ ...newExpertData, email: e.target.value })}
                            placeholder={t('organizations.invite.addNew.expertForm.email.placeholder')}
                          />
                          {expertErrors.email && <p className="text-red-500 text-sm">{expertErrors.email}</p>}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-primary">
                            {t('organizations.invite.addNew.expertForm.phone')}
                          </label>
                          <Input
                            type="tel"
                            value={newExpertData.phone}
                            onChange={(e) => setNewExpertData({ ...newExpertData, phone: e.target.value })}
                            placeholder={t('organizations.invite.addNew.expertForm.phone.placeholder')}
                          />
                        </div>

                        {/* Expertise */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-primary">
                            {t('organizations.invite.addNew.expertForm.expertise')}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <Select 
                            value={newExpertData.expertise} 
                            onValueChange={(value) => setNewExpertData({ ...newExpertData, expertise: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('organizations.invite.addNew.expertForm.expertise.select')} />
                            </SelectTrigger>
                            <SelectContent>
                              {PROFESSIONAL_TITLES.map((title) => (
                                <SelectItem key={title} value={title}>
                                  {title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {expertErrors.expertise && <p className="text-red-500 text-sm">{expertErrors.expertise}</p>}
                        </div>

                        {/* Years of Experience */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-primary">
                            {t('organizations.invite.addNew.expertForm.experience')}
                          </label>
                          <Input
                            type="number"
                            value={newExpertData.yearsOfExperience}
                            onChange={(e) => setNewExpertData({ ...newExpertData, yearsOfExperience: e.target.value })}
                            placeholder={t('organizations.invite.addNew.expertForm.experience.placeholder')}
                          />
                        </div>
                      </div>

                      {/* Certifications */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-primary">
                          {t('organizations.invite.addNew.expertForm.certifications')}
                        </label>
                        <Input
                          value={newExpertData.certifications}
                          onChange={(e) => setNewExpertData({ ...newExpertData, certifications: e.target.value })}
                          placeholder={t('organizations.invite.addNew.expertForm.certifications.placeholder')}
                        />
                      </div>

                      {/* Bio */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-primary">
                          {t('organizations.invite.addNew.expertForm.bio')}
                        </label>
                        <Textarea
                          value={newExpertData.bio}
                          onChange={(e) => setNewExpertData({ ...newExpertData, bio: e.target.value })}
                          placeholder={t('organizations.invite.addNew.expertForm.bio.placeholder')}
                          rows={4}
                        />
                      </div>

                      {/* Form Actions */}
                      <div className="flex items-center justify-end gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowAddExpertForm(false);
                            setExpertErrors({});
                            setNewExpertData({
                              firstName: '',
                              lastName: '',
                              email: '',
                              phone: '',
                              expertise: '',
                              yearsOfExperience: '',
                              certifications: '',
                              bio: '',
                            });
                          }}
                        >
                          {t('common.cancel')}
                        </Button>
                        <Button
                          onClick={() => {
                            // Validate required fields
                            if (!validateExpertForm()) return;
                            
                            // Create new expert entity
                            const newExpert = {
                              id: `new-${Date.now()}`,
                              name: `${newExpertData.firstName} ${newExpertData.lastName}`,
                              expertise: newExpertData.expertise,
                              verified: false,
                            };
                            
                            setSelectedEntity(newExpert);
                            setShowAddExpertForm(false);
                            
                            toast.success(t('organizations.invite.addNew.expertForm.success'), {
                              description: t('organizations.invite.addNew.expertForm.successDescription'),
                            });
                          }}
                          disabled={!newExpertData.firstName || !newExpertData.lastName || !newExpertData.email || !newExpertData.expertise}
                        >
                          {t('organizations.invite.addNew.expertForm.submit')}
                        </Button>
                      </div>
                    </div>
                  ) : recipientType === 'organization' && showAddOrganizationForm ? (
                    <div className="space-y-6 border rounded-lg p-6 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-primary">
                          {t('organizations.invite.addNew.organizationForm.title')}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAddOrganizationForm(false)}
                        >
                          {t('common.cancel')}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {/* Organization Name */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-primary">
                            {t('organizations.invite.addNew.organizationForm.name')}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <Input
                            value={newOrgData.organizationName}
                            onChange={(e) => setNewOrgData({ ...newOrgData, organizationName: e.target.value })}
                            placeholder={t('organizations.invite.addNew.organizationForm.name.placeholder')}
                          />
                          {orgErrors.organizationName && <p className="text-red-500 text-sm">{orgErrors.organizationName}</p>}
                        </div>

                        {/* Sector */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-primary">
                            {t('organizations.invite.addNew.organizationForm.sector')}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <select
                            value={newOrgData.sector}
                            onChange={(e) => setNewOrgData({ ...newOrgData, sector: e.target.value })}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">{t('organizations.invite.addNew.organizationForm.sector.placeholder')}</option>
                            <option value="HEALTH">{t('sectors.HEALTH')}</option>
                            <option value="EDUCATION">{t('sectors.EDUCATION')}</option>
                            <option value="INFRASTRUCTURE">{t('sectors.INFRASTRUCTURE')}</option>
                            <option value="ENVIRONMENT">{t('sectors.ENVIRONMENT')}</option>
                            <option value="AGRICULTURE">{t('sectors.AGRICULTURE')}</option>
                            <option value="GOVERNANCE">{t('sectors.GOVERNANCE')}</option>
                            <option value="HUMANITARIAN">{t('sectors.HUMANITARIAN')}</option>
                            <option value="ECONOMIC">{t('sectors.ECONOMIC')}</option>
                          </select>
                          {orgErrors.sector && <p className="text-red-500 text-sm">{orgErrors.sector}</p>}
                        </div>

                        <Separator />

                        {/* Contact Person Information */}
                        <h5 className="font-semibold text-primary">
                          {t('organizations.invite.addNew.organizationForm.contact')}
                        </h5>

                        {/* Contact Name */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-primary">
                            {t('organizations.invite.addNew.organizationForm.contactName')}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <Input
                            value={newOrgData.contactName}
                            onChange={(e) => setNewOrgData({ ...newOrgData, contactName: e.target.value })}
                            placeholder={t('organizations.invite.addNew.organizationForm.contactName.placeholder')}
                          />
                          {orgErrors.contactName && <p className="text-red-500 text-sm">{orgErrors.contactName}</p>}
                        </div>

                        {/* Contact Position */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-primary">
                            {t('organizations.invite.addNew.organizationForm.contactPosition')}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <Input
                            value={newOrgData.contactPosition}
                            onChange={(e) => setNewOrgData({ ...newOrgData, contactPosition: e.target.value })}
                            placeholder={t('organizations.invite.addNew.organizationForm.contactPosition.placeholder')}
                          />
                          {orgErrors.contactPosition && <p className="text-red-500 text-sm">{orgErrors.contactPosition}</p>}
                        </div>

                        {/* Contact Email */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-primary">
                            {t('organizations.invite.addNew.organizationForm.contactEmail')}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <Input
                            type="email"
                            value={newOrgData.contactEmail}
                            onChange={(e) => setNewOrgData({ ...newOrgData, contactEmail: e.target.value })}
                            placeholder={t('organizations.invite.addNew.organizationForm.contactEmail.placeholder')}
                          />
                          {orgErrors.contactEmail && <p className="text-red-500 text-sm">{orgErrors.contactEmail}</p>}
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex items-center justify-end gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowAddOrganizationForm(false);
                            setOrgErrors({});
                            setNewOrgData({
                              organizationName: '',
                              sector: '',
                              contactName: '',
                              contactPosition: '',
                              contactEmail: '',
                            });
                          }}
                        >
                          {t('common.cancel')}
                        </Button>
                        <Button
                          onClick={() => {
                            // Validate required fields
                            if (!validateOrganizationForm()) return;
                            
                            // Create new organization entity
                            const newOrg = {
                              id: `new-${Date.now()}`,
                              name: newOrgData.organizationName,
                              type: newOrgData.sector,
                              verified: false,
                            };
                            
                            setSelectedEntity(newOrg);
                            setShowAddOrganizationForm(false);
                            
                            toast.success(t('organizations.invite.addNew.organizationForm.success'), {
                              description: t('organizations.invite.addNew.organizationForm.successDescription'),
                            });
                          }}
                          disabled={!newOrgData.organizationName || !newOrgData.sector || !newOrgData.contactName || !newOrgData.contactPosition || !newOrgData.contactEmail}
                        >
                          {t('organizations.invite.addNew.organizationForm.submit')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={t(recipientType === 'organization' 
                            ? 'organizations.invite.select.organization.placeholder'
                            : 'organizations.invite.select.expert.placeholder'
                          )}
                          className="pl-11 h-12"
                        />
                      </div>

                      {/* Results */}
                      <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                        {filteredEntities.length > 0 ? (
                          filteredEntities.map((entity) => (
                            <button
                              key={entity.id}
                              onClick={() => setSelectedEntity(entity)}
                              className={`w-full p-5 text-left hover:bg-gray-50 transition-colors ${
                                selectedEntity?.id === entity.id ? 'bg-[#B82547]/5 border-l-4 border-l-[#B82547]' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                    selectedEntity?.id === entity.id ? 'bg-[#B82547]' : 'bg-gray-100'
                                  }`}>
                                    {recipientType === 'organization' ? (
                                      <Building2 className={`w-6 h-6 ${
                                        selectedEntity?.id === entity.id ? 'text-white' : 'text-gray-600'
                                      }`} />
                                    ) : (
                                      <Users className={`w-6 h-6 ${
                                        selectedEntity?.id === entity.id ? 'text-white' : 'text-gray-600'
                                      }`} />
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-[#3d4654] text-lg">{entity.name}</h4>
                                    <p className="text-sm text-gray-500">
                                      {recipientType === 'organization' ? entity.type : entity.expertise}
                                    </p>
                                  </div>
                                </div>
                                {entity.verified && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-12 text-center text-gray-500">
                            <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-lg">{t('organizations.invite.select.noResults')}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 4: Message */}
              {currentStep === 4 && (
                <div className="grid gap-6">
                  {/* Selected Entity Summary */}
                  {selectedEntity && (
                    <div className="p-5 bg-[#B82547]/5 rounded-lg border-2 border-[#B82547]/20">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#B82547] rounded-lg flex items-center justify-center">
                          {recipientType === 'organization' ? (
                            <Building2 className="w-7 h-7 text-white" />
                          ) : (
                            <Users className="w-7 h-7 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#3d4654] text-lg">{selectedEntity.name}</h4>
                          <p className="text-sm text-gray-500">
                            {t(recipientType === 'organization' 
                              ? `organizations.invite.orgType.${invitationType}`
                              : `organizations.invite.expertType.${invitationType}`
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Subject */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#3d4654]">
                      {t('organizations.invite.message.subject')}
                      <span className="text-gray-500 ml-2">({t('organizations.invite.message.optional')})</span>
                    </label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={t('organizations.invite.message.subject.placeholder')}
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#3d4654]">
                      {t('organizations.invite.message.title')}
                      <span className="text-gray-500 ml-2">({t('organizations.invite.message.optional')})</span>
                    </label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t('organizations.invite.message.placeholder')}
                      rows={8}
                      className="resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Navigation Buttons - Same design as NewProject */}
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-gray-500">
              {currentStep < 4 && (
                <span>
                  {t('projects.create.step')} {currentStep} {t('common.of')} {steps.length}
                </span>
              )}
            </div>
            <div className="flex gap-3 ml-auto">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('organizations.invite.action.back')}
                </Button>
              )}
              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !canProceedStep1) ||
                    (currentStep === 2 && !canProceedStep2) ||
                    (currentStep === 3 && !canProceedStep3)
                  }
                  className="bg-[#B82547] hover:bg-[#B82547]/90"
                >
                  {t('organizations.invite.action.next')}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSendInvitation}
                  disabled={!canSend || isSending}
                  className="bg-[#B82547] hover:bg-[#B82547]/90"
                >
                  {isSending ? (
                    <>{t('organizations.invite.action.sending')}</>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {t('organizations.invite.action.send')}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}