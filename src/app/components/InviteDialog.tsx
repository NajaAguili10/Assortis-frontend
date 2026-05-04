import { useEffect, useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotifications } from '@app/modules/administrator/hooks/useNotifications';
import { NotificationTypeEnum, NotificationPriorityEnum } from '../types/notification.dto';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { organizationService } from '../services/organizationService';
import { Organization } from '../types/organization.dto';

interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
}

type RecipientType = 'organization' | 'expert' | null;
type InvitationType = 'partnership' | 'consortium' | 'collaboration' | 'team' | 'consultant' | 'advisor' | null;

interface InviteStep {
  id: number;
  name: string;
}

// Mock data for selection
/*const mockOrganizations = [
  { id: '1', name: 'UNICEF', type: 'International Organization', verified: true },
  { id: '2', name: 'World Bank', type: 'International Organization', verified: true },
  { id: '3', name: 'Red Cross', type: 'NGO', verified: true },
  { id: '4', name: 'Doctors Without Borders', type: 'NGO', verified: true },
  { id: '5', name: 'UNESCO', type: 'International Organization', verified: true },
];*/



const mockExperts = [
  { id: '1', name: 'Dr. Sarah Johnson', expertise: 'Health & Development', verified: true },
  { id: '2', name: 'John Smith', expertise: 'Project Management', verified: true },
  { id: '3', name: 'Marie Dupont', expertise: 'Education', verified: true },
  { id: '4', name: 'Ahmed Hassan', expertise: 'Infrastructure', verified: true },
  { id: '5', name: 'Elena Rodriguez', expertise: 'Environment', verified: true },
];

export function InviteDialog({ open, onClose }: InviteDialogProps) {
  const { t } = useTranslation();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [recipientType, setRecipientType] = useState<RecipientType>(null);
  const [invitationType, setInvitationType] = useState<InvitationType>(null);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
const [organizations, setOrganizations] =useState<Organization[]>([]);


useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await organizationService.getAllOrganizations();
      setOrganizations(response);
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  fetchData();
}, []);


  const steps: InviteStep[] = [
    { id: 1, name: t('organizations.invite.step.recipient') },
    { id: 2, name: t('organizations.invite.step.type') },
    { id: 3, name: t('organizations.invite.step.select') },
    { id: 4, name: t('organizations.invite.step.message') },
  ];

  const resetState = () => {
    setCurrentStep(1);
    setRecipientType(null);
    setInvitationType(null);
    setSelectedEntity(null);
    setSearchQuery('');
    setSubject('');
    setMessage('');
    setIsSending(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSendInvitation = async () => {
    setIsSending(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Show success toast notification
    toast.success(t('organizations.invite.success.title'), {
      description: t('organizations.invite.success.message'),
    });
    
    // Close dialog and reset state
    setIsSending(false);
    handleClose();
  };

  const canProceedStep1 = recipientType !== null;
  const canProceedStep2 = invitationType !== null;
  const canProceedStep3 = selectedEntity !== null;
  const canSend = currentStep === 4 && selectedEntity !== null;

  const filteredEntities = recipientType === 'organization'
    ? organizations.filter(org => 
        org.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockExperts.filter(expert => 
        expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expert.expertise.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-primary">
            {t('organizations.invite.title')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1">
            {currentStep === 1 && t('organizations.invite.description')}
            {currentStep === 2 && t(recipientType === 'organization' ? 'organizations.invite.orgType.title' : 'organizations.invite.expertType.title')}
            {currentStep === 3 && t(recipientType === 'organization' ? 'organizations.invite.select.organization.title' : 'organizations.invite.select.expert.title')}
            {currentStep === 4 && t('organizations.invite.message.title')}
          </DialogDescription>
        </DialogHeader>

        {/* Steps Indicator */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      currentStep >= step.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 font-medium ${
                      currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-colors ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[400px]">
          {/* Step 1: Choose Recipient Type */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary mb-4">
                {t('organizations.invite.subtitle')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Organization Option */}
                <button
                  onClick={() => setRecipientType('organization')}
                  className={`p-6 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                    recipientType === 'organization'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      recipientType === 'organization' ? 'bg-blue-600' : 'bg-gray-100'
                    }`}>
                      <Building2 className={`w-6 h-6 ${
                        recipientType === 'organization' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-primary mb-1">
                        {t('organizations.invite.recipientType.organization')}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {t('organizations.invite.recipientType.organization.description')}
                      </p>
                    </div>
                  </div>
                </button>

                {/* Expert Option */}
                <button
                  onClick={() => setRecipientType('expert')}
                  className={`p-6 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                    recipientType === 'expert'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      recipientType === 'expert' ? 'bg-blue-600' : 'bg-gray-100'
                    }`}>
                      <Users className={`w-6 h-6 ${
                        recipientType === 'expert' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-primary mb-1">
                        {t('organizations.invite.recipientType.expert')}
                      </h4>
                      <p className="text-sm text-muted-foreground">
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
            <div className="space-y-4">
              {recipientType === 'organization' ? (
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setInvitationType('partnership')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      invitationType === 'partnership'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Handshake className={`w-5 h-5 ${invitationType === 'partnership' ? 'text-blue-600' : 'text-gray-600'}`} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-primary">
                          {t('organizations.invite.orgType.partnership')}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {t('organizations.invite.orgType.partnership.description')}
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setInvitationType('consortium')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      invitationType === 'consortium'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Target className={`w-5 h-5 ${invitationType === 'consortium' ? 'text-blue-600' : 'text-gray-600'}`} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-primary">
                          {t('organizations.invite.orgType.consortium')}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {t('organizations.invite.orgType.consortium.description')}
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setInvitationType('collaboration')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      invitationType === 'collaboration'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <UserPlus className={`w-5 h-5 ${invitationType === 'collaboration' ? 'text-blue-600' : 'text-gray-600'}`} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-primary">
                          {t('organizations.invite.orgType.collaboration')}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {t('organizations.invite.orgType.collaboration.description')}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setInvitationType('team')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      invitationType === 'team'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <UserPlus className={`w-5 h-5 ${invitationType === 'team' ? 'text-blue-600' : 'text-gray-600'}`} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-primary">
                          {t('organizations.invite.expertType.team')}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {t('organizations.invite.expertType.team.description')}
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setInvitationType('consultant')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      invitationType === 'consultant'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Briefcase className={`w-5 h-5 ${invitationType === 'consultant' ? 'text-blue-600' : 'text-gray-600'}`} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-primary">
                          {t('organizations.invite.expertType.consultant')}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {t('organizations.invite.expertType.consultant.description')}
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setInvitationType('advisor')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      invitationType === 'advisor'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Target className={`w-5 h-5 ${invitationType === 'advisor' ? 'text-blue-600' : 'text-gray-600'}`} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-primary">
                          {t('organizations.invite.expertType.advisor')}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {t('organizations.invite.expertType.advisor.description')}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Select Entity */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t(recipientType === 'organization' 
                    ? 'organizations.invite.select.organization.placeholder'
                    : 'organizations.invite.select.expert.placeholder'
                  )}
                  className="pl-10"
                />
              </div>

              {/* Results */}
              <div className="border rounded-lg divide-y max-h-80 overflow-y-auto">
                {filteredEntities.length > 0 ? (
                  filteredEntities.map((entity) => (
                    <button
                      key={entity.id}
                      onClick={() => setSelectedEntity(entity)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedEntity?.id === entity.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            selectedEntity?.id === entity.id ? 'bg-blue-600' : 'bg-gray-100'
                          }`}>
                            {recipientType === 'organization' ? (
                              <Building2 className={`w-5 h-5 ${
                                selectedEntity?.id === entity.id ? 'text-white' : 'text-gray-600'
                              }`} />
                            ) : (
                              <Users className={`w-5 h-5 ${
                                selectedEntity?.id === entity.id ? 'text-white' : 'text-gray-600'
                              }`} />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-primary">{entity.name}</h4>
                            <p className="text-sm text-muted-foreground">
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
                  <div className="p-8 text-center text-muted-foreground">
                    {t('organizations.invite.select.noResults')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Message */}
          {currentStep === 4 && (
            <div className="space-y-4">
              {/* Selected Entity Summary */}
              {selectedEntity && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      {recipientType === 'organization' ? (
                        <Building2 className="w-5 h-5 text-white" />
                      ) : (
                        <Users className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary">{selectedEntity.name}</h4>
                      <p className="text-sm text-muted-foreground">
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
                <label className="text-sm font-medium text-primary">
                  {t('organizations.invite.message.subject')}
                  <span className="text-muted-foreground ml-2">({t('organizations.invite.message.optional')})</span>
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t('organizations.invite.message.subject.placeholder')}
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary">
                  {t('organizations.invite.message.title')}
                  <span className="text-muted-foreground ml-2">({t('organizations.invite.message.optional')})</span>
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('organizations.invite.message.placeholder')}
                  rows={6}
                  className="resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={currentStep === 1 ? handleClose : handleBack}
          >
            {currentStep === 1 ? (
              <>{t('organizations.invite.action.cancel')}</>
            ) : (
              <>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('organizations.invite.action.back')}
              </>
            )}
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !canProceedStep1) ||
                (currentStep === 2 && !canProceedStep2) ||
                (currentStep === 3 && !canProceedStep3)
              }
            >
              {t('organizations.invite.action.next')}
            </Button>
          ) : (
            <Button
              onClick={handleSendInvitation}
              disabled={!canSend || isSending}
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
      </DialogContent>
    </Dialog>
  );
}