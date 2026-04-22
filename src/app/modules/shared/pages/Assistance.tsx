import { useTranslation } from '@app/contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { useAuth } from '@app/contexts/AuthContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { AssistanceSubMenu } from '@app/components/AssistanceSubMenu';
import { AssistancePublicContent } from '@app/components/AssistancePublicContent';
import { StatCard } from '@app/components/StatCard';
import { ActionCard } from '@app/components/ActionCard';
import { FeatureCard } from '@app/components/FeatureCard';
import { MethodologyWorkflowCard } from '@app/components/MethodologyWorkflowCard';
import { ContactDialog } from '@app/components/ContactDialog';
import { AssistanceHistoryCard, HistoryEntry } from '@app/components/AssistanceHistoryCard';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Textarea } from '@app/components/ui/textarea';
import { Label } from '@app/components/ui/label';
import { useAssistance } from '@app/hooks/useAssistance';
import { useNotifications } from '@app/modules/administrator/hooks/useNotifications';
import { NotificationTypeEnum, NotificationPriorityEnum } from '@app/types/notification.dto';
import { hasAssistanceAccess, hasAssistanceSubMenuAccess } from '@app/services/permissions.service';
import { toast } from 'sonner';
import {
  Headphones,
  LayoutDashboard,
  Search,
  FileText,
  Handshake,
  BookOpen,
  Users,
  Clock,
  CheckCircle,
  MessageCircle,
  Rocket,
  Check,
  X,
  Star,
  MapPin,
  Briefcase,
  ChevronUp,
  Building2,
  Calendar,
  DollarSign,
  Send,
  Info,
  ShieldAlert,
} from 'lucide-react';

interface Expert {
  id: string;
  name: string;
  expertise: string;
  location: string;
  rating: number;
  assignments: number;
  hourlyRate: string;
  available: boolean;
}

interface PlanFeature {
  included: boolean;
  label: string;
}

interface SubscriptionPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  highlighted?: boolean;
}

interface Project {
  id: string;
  title: string;
  organization: string;
  sector: string;
  budget: string;
  deadline: string;
  description: string;
}

interface ProposalForm {
  [key: string]: {
    amount: string;
    timeline: string;
    description: string;
  };
}

export default function Assistance() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { kpis } = useAssistance();
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  
  // Section visibility states
  const [showMembership, setShowMembership] = useState(false);
  const [showExpertSearch, setShowExpertSearch] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  
  // Expert search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Contact dialog states
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  
  // Collaboration proposal states
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [proposals, setProposals] = useState<ProposalForm>({});

  // Mock experts data
  const experts: Expert[] = [
    {
      id: '1',
      name: 'Marie Dubois',
      expertise: t('assistance.type.TECHNICAL'),
      location: 'Paris, France',
      rating: 4.8,
      assignments: 45,
      hourlyRate: '€85',
      available: true,
    },
    {
      id: '2',
      name: 'John Anderson',
      expertise: t('assistance.type.STRATEGIC'),
      location: 'London, UK',
      rating: 4.9,
      assignments: 62,
      hourlyRate: '€95',
      available: true,
    },
    {
      id: '3',
      name: 'Carlos Ramirez',
      expertise: t('assistance.type.FINANCIAL'),
      location: 'Madrid, Spain',
      rating: 4.7,
      assignments: 38,
      hourlyRate: '€80',
      available: false,
    },
    {
      id: '4',
      name: 'Sophie Martin',
      expertise: t('assistance.type.COMMUNICATION'),
      location: 'Brussels, Belgium',
      rating: 4.9,
      assignments: 51,
      hourlyRate: '€90',
      available: true,
    },
  ];

  // Mock projects seeking collaboration
  const projects: Project[] = [
    {
      id: 'p1',
      title: 'EU Healthcare Digital Transformation Program',
      organization: 'European Health Alliance',
      sector: 'Health',
      budget: '€150,000',
      deadline: '2026-04-15',
      description: 'Seeking expert collaboration for technical proposal development on digital health infrastructure modernization across EU member states.',
    },
    {
      id: 'p2',
      title: 'Renewable Energy Integration Project - West Africa',
      organization: 'AfDB - African Development Bank',
      sector: 'Energy',
      budget: '€220,000',
      deadline: '2026-05-01',
      description: 'Technical and financial proposal for solar and wind energy integration in rural communities. Requires expertise in energy economics and methodology.',
    },
    {
      id: 'p3',
      title: 'Education Technology Platform for Francophone Countries',
      organization: 'Organisation Internationale de la Francophonie',
      sector: 'Education',
      budget: '€95,000',
      deadline: '2026-03-30',
      description: 'Development of technical offer for e-learning platform deployment. Focus on pedagogical methodology and implementation strategy.',
    },
    {
      id: 'p4',
      title: 'Water Infrastructure Rehabilitation - Latin America',
      organization: 'Inter-American Development Bank',
      sector: 'Infrastructure',
      budget: '€180,000',
      deadline: '2026-04-20',
      description: 'Comprehensive technical proposal for sustainable water management systems. Expertise needed in engineering methodology and environmental impact.',
    },
  ];

  const filteredExperts = experts.filter(
    (expert) =>
      expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.expertise.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mock history data with realistic entries
  const historyEntries: HistoryEntry[] = [
    {
      id: 'h1',
      type: 'CONTACT',
      status: 'RESPONDED',
      targetName: 'Dr. Sarah Mitchell',
      targetRole: 'Senior Methodological Advisor',
      date: new Date(2026, 1, 24, 14, 30), // 2 days ago
      subject: 'Collaboration Proposal for EU Healthcare Project',
      message: 'Hello Dr. Mitchell, I am reaching out regarding a potential collaboration on the EU Healthcare Digital Transformation Program. Your expertise in sustainable development and project management would be invaluable for this initiative.',
      responseMessage: 'Thank you for your interest. I would be happy to discuss this opportunity further. I am available for a call next week to explore how I can contribute to your project.',
      responseDate: new Date(2026, 1, 25, 9, 15),
    },
    {
      id: 'h2',
      type: 'INVITATION',
      status: 'PENDING',
      targetName: 'Carlos Mendoza',
      targetRole: 'Climate Change & Sustainability Expert',
      date: new Date(2026, 1, 25, 16, 45), // Yesterday
      subject: 'Expert Invitation - Renewable Energy Project',
      message: 'We would like to invite you to join our team for the Renewable Energy Integration Project in West Africa. The project budget is €220,000 with an expected timeline of 6 months.',
    },
    {
      id: 'h3',
      type: 'COLLABORATION',
      status: 'SENT',
      targetName: 'Education Technology Platform',
      targetRole: 'Organisation Internationale de la Francophonie',
      date: new Date(2026, 1, 26, 10, 20), // Today
      subject: 'Technical Proposal Submission',
      message: 'Financial Proposal: €75,000\nTimeline: 3-4 months\n\nOur team brings extensive experience in e-learning platform development with a focus on pedagogical methodology and multilingual support for Francophone countries.',
    },
    {
      id: 'h4',
      type: 'CONTACT',
      status: 'SENT',
      targetName: 'Jean-Paul Dubois',
      targetRole: 'Water & Sanitation Engineer',
      date: new Date(2026, 1, 20, 11, 0), // 6 days ago
      subject: 'Water Infrastructure Project Inquiry',
      message: 'Good morning Mr. Dubois, I am contacting you to discuss your potential involvement in the Water Infrastructure Rehabilitation project in Latin America. Your 20 years of experience would be extremely valuable.',
    },
    {
      id: 'h5',
      type: 'INVITATION',
      status: 'ACCEPTED',
      targetName: 'María González',
      targetRole: 'Gender Equality & Inclusion Expert',
      date: new Date(2026, 1, 18, 15, 30), // 8 days ago
      subject: 'Project Collaboration - Gender Inclusion Initiative',
      message: 'Invitation to collaborate on gender equality integration for our upcoming social development project. Duration: 4 months, Budget: €45,000.',
      responseMessage: 'I am delighted to accept this collaboration opportunity. Gender equality is at the core of my expertise, and I look forward to contributing to this important initiative.',
      responseDate: new Date(2026, 1, 19, 8, 45),
    },
    {
      id: 'h6',
      type: 'COLLABORATION',
      status: 'REJECTED',
      targetName: 'Digital Health Innovation Program',
      targetRole: 'WHO - World Health Organization',
      date: new Date(2026, 1, 15, 13, 15), // 11 days ago
      subject: 'Proposal for Technical Assistance',
      message: 'Submitted technical and financial proposal for digital health infrastructure development across African countries.',
      responseMessage: 'Thank you for your detailed proposal. After careful review, we have decided to proceed with another partner whose expertise better aligns with our specific technical requirements for this phase.',
      responseDate: new Date(2026, 1, 17, 16, 30),
    },
  ];

  // Subscription plans
  const plans: SubscriptionPlan[] = [
    {
      name: t('subscription.free'),
      price: t('subscription.free.price'),
      period: t('subscription.period.month'),
      description: t('subscription.free.description'),
      features: [
        { included: true, label: t('subscription.features.basicAccess') },
        { included: true, label: t('subscription.features.limitedTenders') },
        { included: false, label: t('subscription.features.expertAccess') },
        { included: false, label: t('subscription.features.aiMatching') },
        { included: false, label: t('subscription.features.prioritySupport') },
      ],
    },
    {
      name: t('subscription.pro'),
      price: t('subscription.pro.price'),
      period: t('subscription.period.month'),
      description: t('subscription.pro.description'),
      highlighted: true,
      features: [
        { included: true, label: t('subscription.features.fullAccess') },
        { included: true, label: t('subscription.features.unlimitedTenders') },
        { included: true, label: t('subscription.features.expertAccess') },
        { included: true, label: t('subscription.features.aiMatching') },
        { included: false, label: t('subscription.features.prioritySupport') },
      ],
    },
    {
      name: t('subscription.enterprise'),
      price: t('subscription.enterprise.price'),
      period: t('subscription.period.month'),
      description: t('subscription.enterprise.description'),
      features: [
        { included: true, label: t('subscription.features.fullAccess') },
        { included: true, label: t('subscription.features.unlimitedTenders') },
        { included: true, label: t('subscription.features.expertAccess') },
        { included: true, label: t('subscription.features.aiMatching') },
        { included: true, label: t('subscription.features.prioritySupport') },
      ],
    },
  ];

  const handleSubmitProposal = (projectId: string) => {
    const proposal = proposals[projectId];
    const project = projects.find(p => p.id === projectId);
    
    if (!proposal || !proposal.amount || !proposal.timeline || !proposal.description) {
      toast.error(t('assistance.invite.error.requiredFields'));
      return;
    }

    // Success toast notification
    toast.success(t('assistance.methodology.collaboration.proposal.success.title'), {
      description: t('assistance.methodology.collaboration.proposal.success.message'),
    });

    // Add Assortis notification to organization
    if (project) {
      addNotification({
        type: NotificationTypeEnum.INFORMATION,
        priority: NotificationPriorityEnum.HIGH,
        message: `${t('assistance.methodology.collaboration.proposal.notification.message')} "${project.title}" - ${t('assistance.methodology.collaboration.organization')}: ${project.organization}`,
        titleKey: 'assistance.methodology.collaboration.proposal.notification.title',
      });
    }

    // Reset form
    setProposals({
      ...proposals,
      [projectId]: { amount: '', timeline: '', description: '' },
    });
    setSelectedProject(null);
  };

  const handleProposalChange = (projectId: string, field: string, value: string) => {
    setProposals({
      ...proposals,
      [projectId]: {
        ...proposals[projectId],
        [field]: value,
      },
    });
  };

  const toggleSection = (section: 'membership' | 'expert' | 'collaboration') => {
    if (section === 'membership') {
      setShowMembership(!showMembership);
      setShowExpertSearch(false);
      setShowCollaboration(false);
    } else if (section === 'expert') {
      setShowExpertSearch(!showExpertSearch);
      setShowMembership(false);
      setShowCollaboration(false);
    } else {
      setShowCollaboration(!showCollaboration);
      setShowMembership(false);
      setShowExpertSearch(false);
    }
  };

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('assistance.hub.title')}
        description={t('assistance.hub.subtitle')}
        icon={Headphones}
        stats={[
          { value: kpis.activeRequests.toString(), label: t('assistance.stats.activeRequests') }
        ]}
      />

      {/* Sub Menu */}
      <AssistanceSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Public User - Descriptive Content */}
          {user?.accountType === 'public' ? (
            <AssistancePublicContent />
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                <StatCard
                  title={t('assistance.stats.activeRequests')}
                  value={kpis.activeRequests.toString()}
                  trend="+12%"
                  icon={FileText}
                  iconBgColor="bg-blue-50"
                  iconColor="text-blue-500"
                />
                <StatCard
                  title={t('assistance.stats.completedRequests')}
                  value={kpis.completedRequests.toString()}
                  subtitle={t('projects.stats.thisYear')}
                  icon={CheckCircle}
                  iconBgColor="bg-green-50"
                  iconColor="text-green-500"
                />
                <StatCard
                  title={t('assistance.stats.availableExperts')}
                  value={kpis.availableExperts.toString()}
                  badge={`${kpis.satisfactionRate}% ${t('assistance.stats.satisfactionRate')}`}
                  icon={Users}
                  iconBgColor="bg-purple-50"
                  iconColor="text-purple-500"
                />
                <StatCard
                  title={t('assistance.stats.averageResponseTime')}
                  value={`${kpis.averageResponseTime}h`}
                  subtitle={t('assistance.stats.hours')}
                  icon={Clock}
                  iconBgColor="bg-orange-50"
                  iconColor="text-orange-500"
                />
              </div>

              {/* Quick Actions */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-primary mb-4">{t('actions.quick')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ActionCard
                    title={t('assistance.actions.requestSupport')}
                    icon={Users}
                    onClick={() => navigate('/assistance/request')}
                  />
                  <ActionCard
                    title={t('assistance.actions.findExpert')}
                    icon={Search}
                    onClick={() => navigate('/assistance/find-expert')}
                  />
                </div>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <FeatureCard
                  title={t('assistance.submenu.findExpert')}
                  description={t('assistance.findExpert.subtitle')}
                  icon={Search}
                  iconBgColor="bg-blue-50"
                  iconColor="text-blue-500"
                  stats={[
                    { label: t('assistance.stats.availableExperts'), value: kpis.availableExperts.toString() },
                  ]}
                  link="/assistance/find-expert"
                />
                <FeatureCard
                  title={t('assistance.submenu.history')}
                  description={t('assistance.history.subtitle')}
                  icon={Clock}
                  iconBgColor="bg-orange-50"
                  iconColor="text-orange-500"
                  stats={[
                    { label: t('assistance.history.entries'), value: historyEntries.length.toString() },
                  ]}
                  link="/assistance/history"
                />
              </div>

              {/* Methodology Center Workflow */}
              <MethodologyWorkflowCard
                title={t('assistance.methodology.title')}
                description={t('assistance.methodology.description')}
                steps={[
                  {
                    number: t('assistance.methodology.step2.number'),
                    title: t('assistance.methodology.step2.title'),
                    description: t('assistance.methodology.step2.description'),
                    icon: MessageCircle,
                    actionLabel: t('assistance.methodology.step2.action'),
                    onAction: () => navigate('/assistance/find-expert'),
                  },
                  {
                    number: t('assistance.methodology.step3.number'),
                    title: t('assistance.methodology.step3.title'),
                    description: t('assistance.methodology.step3.description'),
                    icon: Rocket,
                    actionLabel: t('assistance.methodology.step3.action'),
                    onAction: () => navigate('/projects'),
                  },
                ]}
              />
            </>
          )}

          {/* SECTION 1: Membership Plans - Integrated (Kept for completeness) */}
          {showMembership && (
            <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-primary">{t('subscription.title')}</h2>
                  <p className="text-muted-foreground mt-1">{t('subscription.description')}</p>
                </div>
                <button
                  onClick={() => setShowMembership(false)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan, index) => (
                  <div
                    key={index}
                    className={`rounded-lg border p-6 flex flex-col ${
                      plan.highlighted ? 'border-primary shadow-lg scale-105' : 'border-gray-200'
                    }`}
                  >
                    {plan.highlighted && (
                      <div className="mb-4">
                        <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                          {t('subscription.recommended')}
                        </span>
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-primary mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

                    <div className="mb-6">
                      <span className="text-3xl font-bold text-primary">{plan.price}</span>
                      <span className="text-muted-foreground ml-2">/ {plan.period}</span>
                    </div>

                    <ul className="space-y-3 mb-6 flex-grow">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          {feature.included ? (
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                            {feature.label}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${
                        plan.highlighted
                          ? 'bg-primary hover:bg-primary/90'
                          : 'bg-white border border-primary text-primary hover:bg-primary/10'
                      }`}
                    >
                      {t('subscription.selectPlan')}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: Expert Search - Integrated */}
          {showExpertSearch && (
            <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-primary">{t('assistance.methodology.step2.title')}</h2>
                  <p className="text-muted-foreground mt-1">{t('assistance.findExpert.subtitle')}</p>
                </div>
                <button
                  onClick={() => setShowExpertSearch(false)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('assistance.findExpert.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Experts List */}
              <div className="space-y-4">
                {filteredExperts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">{t('assistance.findExpert.noResults')}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('assistance.findExpert.noResults.message')}
                    </p>
                  </div>
                ) : (
                  filteredExperts.map((expert) => (
                    <div
                      key={expert.id}
                      className="border rounded-lg p-4 hover:border-primary transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-primary">{expert.name}</h3>
                            {expert.available && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                {t('assistance.availability.AVAILABLE')}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              <span>{expert.expertise}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{expert.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>{expert.rating} ({expert.assignments} {t('assistance.requestSupport.assignments')})</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-primary">{expert.hourlyRate} {t('assistance.requestSupport.perDay')}</span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                          disabled={!expert.available}
                          onClick={() => {
                            setSelectedExpert(expert);
                            setContactDialogOpen(true);
                          }}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {t('assistance.actions.contact')}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* View All Link */}
              <div className="mt-6 pt-4 border-t text-center">
                <Button
                  variant="outline"
                  onClick={() => navigate('/assistance/find-expert')}
                >
                  {t('assistance.findExpert.viewAll')}
                </Button>
              </div>
            </div>
          )}

          {/* SECTION 3: Start Collaboration - DEVELOPED WITH PROJECTS LIST */}
          {showCollaboration && (
            <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                    <Rocket className="w-6 h-6" />
                    {t('assistance.methodology.collaboration.title')}
                  </h2>
                  <p className="text-muted-foreground mt-1">{t('assistance.methodology.collaboration.subtitle')}</p>
                </div>
                <button
                  onClick={() => setShowCollaboration(false)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>

              {/* Projects List */}
              <div className="space-y-6">
                {projects.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg bg-gray-50">
                    <Rocket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-semibold text-gray-600">{t('assistance.methodology.collaboration.noProjects')}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('assistance.methodology.collaboration.noProjects.message')}
                    </p>
                  </div>
                ) : (
                  projects.map((project) => (
                    <div
                      key={project.id}
                      className="border rounded-lg overflow-hidden hover:border-primary transition-colors"
                    >
                      {/* Project Header */}
                      <div className="bg-gray-50 border-b px-5 py-4">
                        <h3 className="text-lg font-semibold text-primary mb-2">{project.title}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="w-4 h-4" />
                            <div>
                              <span className="block text-xs text-gray-500">{t('assistance.methodology.collaboration.organization')}</span>
                              <span className="font-medium text-gray-700">{project.organization}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Briefcase className="w-4 h-4" />
                            <div>
                              <span className="block text-xs text-gray-500">{t('assistance.methodology.collaboration.sector')}</span>
                              <span className="font-medium text-gray-700">{project.sector}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="w-4 h-4" />
                            <div>
                              <span className="block text-xs text-gray-500">{t('assistance.methodology.collaboration.budget')}</span>
                              <span className="font-medium text-primary">{project.budget}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <div>
                              <span className="block text-xs text-gray-500">{t('assistance.methodology.collaboration.deadline')}</span>
                              <span className="font-medium text-gray-700">{new Date(project.deadline).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Project Description */}
                      <div className="px-5 py-4 bg-white">
                        <p className="text-sm text-gray-600 mb-4">{project.description}</p>

                        {/* Proposal Form Toggle */}
                        {selectedProject === project.id ? (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 space-y-4">
                            <h4 className="font-semibold text-primary mb-3">{t('assistance.methodology.collaboration.submitProposal')}</h4>
                            
                            {/* Amount */}
                            <div className="space-y-2">
                              <Label htmlFor={`amount-${project.id}`}>
                                {t('assistance.methodology.collaboration.proposalAmount')} <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id={`amount-${project.id}`}
                                type="text"
                                placeholder="€50,000"
                                value={proposals[project.id]?.amount || ''}
                                onChange={(e) => handleProposalChange(project.id, 'amount', e.target.value)}
                              />
                            </div>

                            {/* Timeline */}
                            <div className="space-y-2">
                              <Label htmlFor={`timeline-${project.id}`}>
                                {t('assistance.methodology.collaboration.proposalTimeline')} <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id={`timeline-${project.id}`}
                                type="text"
                                placeholder="4-6 weeks"
                                value={proposals[project.id]?.timeline || ''}
                                onChange={(e) => handleProposalChange(project.id, 'timeline', e.target.value)}
                              />
                            </div>

                            {/* Technical Proposal */}
                            <div className="space-y-2">
                              <Label htmlFor={`description-${project.id}`}>
                                {t('assistance.methodology.collaboration.proposalDescription')} <span className="text-red-500">*</span>
                              </Label>
                              <Textarea
                                id={`description-${project.id}`}
                                placeholder={t('assistance.invite.form.descriptionPlaceholder')}
                                rows={5}
                                value={proposals[project.id]?.description || ''}
                                onChange={(e) => handleProposalChange(project.id, 'description', e.target.value)}
                              />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 justify-end pt-3">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSelectedProject(null)}
                              >
                                {t('common.cancel')}
                              </Button>
                              <Button
                                type="button"
                                className="bg-primary hover:bg-primary/90"
                                onClick={() => handleSubmitProposal(project.id)}
                              >
                                <Send className="w-4 h-4 mr-2" />
                                {t('assistance.methodology.collaboration.submitProposal')}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setSelectedProject(project.id)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            {t('assistance.methodology.collaboration.submitProposal')}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </PageContainer>

      {/* Contact Dialog */}
      <ContactDialog
        open={contactDialogOpen}
        onClose={() => setContactDialogOpen(false)}
        expert={selectedExpert}
      />
    </div>
  );
}