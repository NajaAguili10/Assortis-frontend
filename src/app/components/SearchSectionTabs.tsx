import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MapPin, BarChart3, Award, ListChecks, Building2, Users, UserCheck, PenSquare, Send, UserPlus } from 'lucide-react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { SubMenu } from '@app/components/SubMenu';
import { Button } from '@app/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@app/components/ui/dialog';
import { Input } from '@app/components/ui/input';
import { Textarea } from '@app/components/ui/textarea';
import { toast } from 'sonner';

export type SearchSectionTab =
  | 'map'
  | 'projects'
  | 'awards'
  | 'shortlists'
  | 'organisations'
  | 'experts'
  | 'my-experts'
  | 'bid-writers';

interface SearchSectionTabsProps {
  activeTab?: SearchSectionTab;
}

interface JoinOrganisationForm {
  organizationName: string;
  contactPersonName: string;
  email: string;
  phone: string;
  location: string;
  description: string;
}

const getInitialJoinOrganisationForm = (): JoinOrganisationForm => ({
  organizationName: '',
  contactPersonName: '',
  email: '',
  phone: '',
  location: '',
  description: '',
});

export function SearchSectionTabs({ activeTab }: SearchSectionTabsProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [isJoinUsDialogOpen, setIsJoinUsDialogOpen] = useState(false);
  const [joinForm, setJoinForm] = useState<JoinOrganisationForm>(getInitialJoinOrganisationForm);

  const isExpert = user?.accountType === 'expert';
  const showJoinUs = !isAuthenticated || user?.accountType === 'public';

  const updateJoinFormField = <K extends keyof JoinOrganisationForm>(field: K, value: JoinOrganisationForm[K]) => {
    setJoinForm((current) => ({ ...current, [field]: value }));
  };

  const resetJoinForm = () => {
    setJoinForm(getInitialJoinOrganisationForm());
  };

  const handleSubmitJoinUs = () => {
    const requiredFields = [
      joinForm.organizationName,
      joinForm.contactPersonName,
      joinForm.email,
      joinForm.location,
      joinForm.description,
    ];

    if (requiredFields.some((value) => !value.trim())) {
      toast.error(t('projects.joinUs.validation.required'));
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem('organizationJoinInterestSubmissions') || '[]');
      const submissions = Array.isArray(existing) ? existing : [];
      submissions.push({
        ...joinForm,
        source: 'search-organisations-navbar',
        submittedAt: new Date().toISOString(),
      });
      localStorage.setItem('organizationJoinInterestSubmissions', JSON.stringify(submissions));
    } catch (error) {
      // Keep this lightweight public flow usable even if local storage is unavailable.
    }

    toast.success(t('projects.joinUs.success'));
    resetJoinForm();
    setIsJoinUsDialogOpen(false);
  };

  const items = [
    {
      label: t('search.tabs.map'),
      icon: MapPin,
      active: activeTab === 'map',
      onClick: () => navigate('/search/map'),
    },
    {
      label: t('search.tabs.projects'),
      icon: BarChart3,
      active: activeTab === 'projects',
      onClick: () => navigate('/search/projects'),
    },
    {
      label: t('search.tabs.awards'),
      icon: Award,
      active: activeTab === 'awards',
      onClick: () => navigate('/search/awards'),
    },
    {
      label: t('search.tabs.shortlists'),
      icon: ListChecks,
      active: activeTab === 'shortlists',
      onClick: () => navigate('/search/shortlists'),
    },
    {
      label: t('search.tabs.organisations'),
      icon: Building2,
      active: activeTab === 'organisations',
      onClick: () => navigate('/search/organisations'),
    },
    ...(showJoinUs ? [
      {
        label: t('projects.joinUs.button'),
        icon: UserPlus,
        active: false,
        onClick: () => setIsJoinUsDialogOpen(true),
      },
    ] : []),
    ...(!isExpert ? [
      {
        label: t('search.tabs.experts'),
        icon: Users,
        active: activeTab === 'experts',
        onClick: () => navigate('/search/experts'),
      },
      {
        label: t('search.tabs.myExperts'),
        icon: UserCheck,
        active: activeTab === 'my-experts',
        onClick: () => navigate('/search/my-experts'),
      },
      {
        label: t('search.tabs.bidWriters'),
        icon: PenSquare,
        active: activeTab === 'bid-writers',
        onClick: () => navigate('/search/bid-writers'),
      },
    ] : []),
  ];

  return (
    <>
      <SubMenu items={items} />

      <Dialog
        open={isJoinUsDialogOpen}
        onOpenChange={(open) => {
          setIsJoinUsDialogOpen(open);
          if (!open) resetJoinForm();
        }}
      >
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#E63462]" />
              {t('projects.joinUs.title')}
            </DialogTitle>
            <DialogDescription>{t('projects.joinUs.description')}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="join-org-name" className="text-sm font-medium text-[#4A5568]">{t('projects.joinUs.organizationName')}</label>
              <Input id="join-org-name" value={joinForm.organizationName} onChange={(event) => updateJoinFormField('organizationName', event.target.value)} />
            </div>
            <div className="space-y-2">
              <label htmlFor="join-org-contact" className="text-sm font-medium text-[#4A5568]">{t('projects.joinUs.contactPerson')}</label>
              <Input id="join-org-contact" value={joinForm.contactPersonName} onChange={(event) => updateJoinFormField('contactPersonName', event.target.value)} />
            </div>
            <div className="space-y-2">
              <label htmlFor="join-org-email" className="text-sm font-medium text-[#4A5568]">{t('projects.joinUs.email')}</label>
              <Input id="join-org-email" type="email" value={joinForm.email} onChange={(event) => updateJoinFormField('email', event.target.value)} />
            </div>
            <div className="space-y-2">
              <label htmlFor="join-org-phone" className="text-sm font-medium text-[#4A5568]">{t('projects.joinUs.phone')}</label>
              <Input id="join-org-phone" value={joinForm.phone} onChange={(event) => updateJoinFormField('phone', event.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="join-org-location" className="text-sm font-medium text-[#4A5568]">{t('projects.joinUs.location')}</label>
              <Input id="join-org-location" value={joinForm.location} onChange={(event) => updateJoinFormField('location', event.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="join-org-description" className="text-sm font-medium text-[#4A5568]">{t('projects.joinUs.shortDescription')}</label>
              <Textarea id="join-org-description" rows={4} value={joinForm.description} onChange={(event) => updateJoinFormField('description', event.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsJoinUsDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button className="bg-[#E63462] text-white hover:bg-[#D42F5A]" onClick={handleSubmitJoinUs}>
              <Send className="mr-2 h-4 w-4" />
              {t('projects.joinUs.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
