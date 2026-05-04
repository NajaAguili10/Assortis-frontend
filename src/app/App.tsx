import { RouterProvider, createBrowserRouter, Navigate } from 'react-router';
import Root from './components/Root';
import Dashboard from './modules/administrator/pages/Dashboard';
import Calls from './modules/shared/pages/Calls';
import CallsEnhanced from './modules/shared/pages/CallsEnhanced';
import TendersHub from './modules/shared/pages/TendersHub';
import ActiveTenders from './modules/shared/pages/ActiveTenders';
import ToRsList from './modules/shared/pages/ToRsList';
import ToRDetail from './modules/shared/pages/ToRDetail';
import AIMatching from './modules/shared/pages/AIMatching';
import MySubmissions from './modules/expert/pages/MySubmissions';
import Templates from './modules/expert/pages/Templates';
import TemplateEdit from './modules/expert/pages/TemplateEdit';
import TemplateCreate from './modules/expert/pages/TemplateCreate';
import Pipeline from './modules/expert/pages/Pipeline';
import ProjectsContractors from './modules/expert/pages/ProjectsContractors';
import ProjectContractorDetails from './modules/expert/pages/ProjectContractorDetails';
import ProjectsOrganizationsScoring from './modules/expert/pages/ProjectsOrganizationsScoring';
import Projects from './modules/shared/pages/Projects';
import ProjectsActive from './modules/shared/pages/ProjectsActive';
import ProjectsTasks from './modules/shared/pages/ProjectsTasks';
import ProjectsCollaborations from './modules/shared/pages/ProjectsCollaborations';
import ProjectsReferences from './modules/shared/pages/ProjectsReferences';
import ProjectsMatching from './modules/shared/pages/ProjectsMatching';
import ProjectsMatchingArchive from './modules/shared/pages/ProjectsMatchingArchive';
import NewProject from './modules/shared/pages/NewProject';
import NewTask from './modules/shared/pages/NewTask';
import AssignTasks from './modules/shared/pages/AssignTasks';
import ProjectDetail from './modules/shared/pages/ProjectDetail';
import EditProject from './modules/shared/pages/EditProject';
import CollaborationDetail from './modules/shared/pages/CollaborationDetail';
import Experts from './modules/expert/pages/Experts';
import ExpertsDatabase from './modules/expert/pages/ExpertsDatabase';
import ExpertsCVProfiles from './modules/expert/pages/ExpertsCVProfiles';
import ExpertsEditProfile from './modules/expert/pages/ExpertsEditProfile';
import ExpertsCreateAccount from './modules/expert/pages/ExpertsCreateAccount';
import ExpertPublicProfile from './modules/expert/pages/ExpertPublicProfile';
import ExpertsTemplates from './modules/expert/pages/ExpertsTemplates';
import ExpertsCVTemplates from './modules/expert/pages/ExpertsCVTemplates';
import MatchExpertsToRs from './modules/expert/pages/MatchExpertsToRs';
import MatchExpertsOrganizations from './modules/expert/pages/MatchExpertsOrganizations';
import ExpertsMatchingArchive from './modules/expert/pages/ExpertsMatchingArchive';
import ExpertsMatchingOrganisation from './modules/expert/pages/ExpertsMatchingOrganisation';
import ExpertsMatchingOrganisationArchive from './modules/expert/pages/ExpertsMatchingOrganisationArchive';
import MatchingOpportunitiesHome from './modules/expert/pages/MatchingOpportunitiesHome';
import MatchingOpportunitiesPage from './modules/expert/pages/MatchingOpportunitiesPage';
import MatchingProjectsPage from './modules/expert/pages/MatchingProjectsPage';
import MatchingOpportunitiesSaved from './modules/expert/pages/MatchingOpportunitiesSaved';
import SavedProfilesPage from './modules/expert/pages/SavedProfilesPage';
import AlertsFusionPage from './modules/expert/pages/AlertsFusionPage';
import MatchingProjectDetailPage from './modules/expert/pages/MatchingProjectDetailPage';
import MatchingAwardDetailPage from './modules/expert/pages/MatchingAwardDetailPage';
import MatchingShortlistDetailPage from './modules/expert/pages/MatchingShortlistDetailPage';
import MatchingVacancyDetailPage from './modules/expert/pages/MatchingVacancyDetailPage';
import ExpertMyCVDashboard from './modules/expert/pages/ExpertMyCVDashboard';
import ExpertMyCVInfo from './modules/expert/pages/ExpertMyCVInfo';
import OrganizationsHub from './modules/organization/pages/OrganizationsHub';
import OrganizationsDatabase from './modules/organization/pages/OrganizationsDatabase';
import OrganizationDetail from './modules/organization/pages/OrganizationDetail';
import OrganizationsTeams from './modules/organization/pages/OrganizationsTeams';
import OrganizationsPartnerships from './modules/organization/pages/OrganizationsPartnerships';
import OrganizationsPartnershipDetail from './modules/organization/pages/OrganizationsPartnershipDetail';
import OrganizationsInvitations from './modules/organization/pages/OrganizationsInvitations';
import OrganizationsCreateProfile from './modules/organization/pages/OrganizationsCreateProfile';
import OrganizationsEditProfile from './modules/organization/pages/OrganizationsEditProfile';
import OrganizationsInvite from './modules/organization/pages/OrganizationsInvite';
import OrganizationsMatching from './modules/organization/pages/OrganizationsMatching';
import OrganizationsMatchingArchive from './modules/organization/pages/OrganizationsMatchingArchive';
import Invitations from './modules/organization/pages/Invitations';
import InvitationMessaging from './modules/organization/pages/InvitationMessaging';
import MyOrganization from './modules/organization/pages/MyOrganization';
import OrganizationProjectReferences from './modules/organization/pages/OrganizationProjectReferences';
import OrganizationProjectReferenceDetail from './modules/organization/pages/OrganizationProjectReferenceDetail';
import SmartMatching from './modules/shared/pages/SmartMatching';
import Subscriptions from './modules/shared/pages/Subscriptions';
import Training from './modules/shared/pages/Training';
import TrainingCatalog from './modules/shared/pages/TrainingCatalog';
import TrainingPortfolio from './modules/shared/pages/TrainingPortfolio';
import TrainingActivatedPills from './modules/shared/pages/TrainingActivatedPills';
import TrainingEnrollment from './modules/shared/pages/TrainingEnrollment';
import TrainingProgramDetails from './modules/shared/pages/TrainingProgramDetails';
import TrainingLiveSessions from './modules/shared/pages/TrainingLiveSessions';
import TrainingLiveSessionDetails from './modules/shared/pages/TrainingLiveSessionDetails';
import TrainingSessionEnrollment from './modules/shared/pages/TrainingSessionEnrollment';
import TrainingRecordingPlayer from './modules/shared/pages/TrainingRecordingPlayer';
import TrainingTrainers from './modules/shared/pages/TrainingTrainers';
import TrainingTrainerDetails from './modules/shared/pages/TrainingTrainerDetails';
import TrainingCertifications from './modules/shared/pages/TrainingCertifications';
import TrainingCertificationDetails from './modules/shared/pages/TrainingCertificationDetails';
import TrainingCertificationEnroll from './modules/shared/pages/TrainingCertificationEnroll';
import TrainingCheckout from './modules/shared/pages/TrainingCheckout';
import TrainingCheckoutConfirmation from './modules/shared/pages/TrainingCheckoutConfirmation';
import Assistance from './modules/shared/pages/Assistance';
import AssistanceFindExpert from './modules/shared/pages/AssistanceFindExpert';
import AssistanceRequest from './modules/shared/pages/AssistanceRequest';
import AssistanceRequestSupport from './modules/shared/pages/AssistanceRequestSupport';
import AssistanceHistory from './modules/shared/pages/AssistanceHistory';
import StatisticsDashboard from './modules/shared/pages/StatisticsDashboard';
import StatisticsProjectsContracts from './modules/shared/pages/StatisticsProjectsContracts';
import StatisticsMarketTrends from './modules/shared/pages/StatisticsMarketTrends';
import StatisticsPricingExperts from './modules/shared/pages/StatisticsPricingExperts';
import StatisticsExpertsFees from './modules/shared/pages/StatisticsExpertsFees';
import StatisticsCompetitors from './modules/shared/pages/StatisticsCompetitors';
import StatisticsUsageAnalytics from './modules/shared/pages/StatisticsUsageAnalytics';
import StatisticsMapInsights from './modules/shared/pages/StatisticsMapInsights';
import Notifications from './modules/administrator/pages/Notifications';
import OffersHub from './modules/shared/pages/OffersHub';
import BecomeMember from './modules/shared/pages/BecomeMember';
import ChangePlan from './modules/shared/pages/ChangePlan';
import Checkout from './modules/shared/pages/Checkout';
import ConfirmationMembership from './modules/shared/pages/ConfirmationMembership';
import MemberArea from './modules/shared/pages/MemberArea';
import ContactSales from './modules/shared/pages/ContactSales';
import OffersFAQ from './modules/shared/pages/OffersFAQ';
import PromotionRequest from './modules/shared/pages/PromotionRequest';
import Contact from './modules/public/pages/Contact';
import SearchDashboard from './modules/public/pages/SearchDashboard';
import SearchMapPage from './modules/public/pages/SearchMapPage';
import SearchProjectsPage from './modules/public/pages/SearchProjectsPage';
import SearchAwardsPage from './modules/public/pages/SearchAwardsPage';
import SearchShortlistsPage from './modules/public/pages/SearchShortlistsPage';
import SearchOrganisationsPage from './modules/public/pages/SearchOrganisationsPage';
import SearchExpertsPage from './modules/public/pages/SearchExpertsPage';
import SearchMyExpertsPage from './modules/public/pages/SearchMyExpertsPage';
import SearchBidWritersPage from './modules/public/pages/SearchBidWritersPage';
import AskForQuotePage from './modules/public/pages/AskForQuotePage';
import PublicProjectsServicePage from './modules/public/pages/services/PublicProjectsServicePage';
import PublicOrganizationMatchingProjectsPage from './modules/public/pages/services/PublicOrganizationMatchingProjectsPage';
import PublicOrganizationMyProjectsPage from './modules/public/pages/services/PublicOrganizationMyProjectsPage';
import PublicOrganizationSearchPage from './modules/public/pages/services/PublicOrganizationSearchPage';
import PublicOrganizationStatisticsPage from './modules/public/pages/services/PublicOrganizationStatisticsPage';
import PublicExpertsMatchingOpportunitiesPage from './modules/public/pages/services/PublicExpertsMatchingOpportunitiesPage';
import PublicExpertsMyProjectsPage from './modules/public/pages/services/PublicExpertsMyProjectsPage';
import PublicExpertsCVRegistrationPage from './modules/public/pages/services/PublicExpertsCVRegistrationPage';
import PublicExpertsSearchPage from './modules/public/pages/services/PublicExpertsSearchPage';
import PublicExpertsStatisticsPage from './modules/public/pages/services/PublicExpertsStatisticsPage';
import PublicPostingBoardServicePage from './modules/public/pages/services/PublicPostingBoardServicePage';
import PublicTrainingServicePage from './modules/public/pages/services/PublicTrainingServicePage';
import {
  ProtectedCompteUtilisateur,
  ProtectedCompteUtilisateurCredits,
  ProtectedCompteUtilisateurResources,
  ProtectedCompteUtilisateurSecurity,
  ProtectedModifierProfilPage,
  ProtectedAccountHome,
  ProtectedAccountMessages,
  ProtectedMySelectionAlerts,
  ProtectedAccountSubscription,
  ProtectedAccountTeams,
} from './components/ProtectedRouteWrapper';
import AboutPage from './modules/public/pages/AboutPage';
import Login from './modules/public/pages/Login';
import Signup from './modules/public/pages/Signup';
import SignupConfirmation from './modules/public/pages/SignupConfirmation';
import ForgotPassword from './modules/public/pages/ForgotPassword';
import ResetPassword from './modules/public/pages/ResetPassword';
import TermsOfService from './modules/public/pages/TermsOfService';
import PrivacyPolicy from './modules/public/pages/PrivacyPolicy';
import NotFound from './modules/public/pages/NotFound';
import SystemStatesDemo from './modules/administrator/pages/SystemStatesDemo';
import MonEspaceDashboardPage from './modules/mon-espace/pages/MonEspaceDashboardPage';
import OffresProjetsPage from './modules/mon-espace/pages/OffresProjetsPage';
import OffresInternesPage from './modules/mon-espace/pages/OffresInternesPage';
import EnregistrerCVPage from './modules/mon-espace/pages/EnregistrerCVPage';
import MonComptePage from './modules/mon-espace/pages/MonComptePage';
import MonCVPage from './modules/mon-espace/pages/MonCVPage';
import ChangerPlanPage from './modules/mon-espace/pages/ChangerPlanPage';
import CheckoutPage from './modules/mon-espace/pages/CheckoutPage';
import PublierOffrePage from './modules/posting-board/pages/PublierOffrePage';
import PostesVacantsPage from './modules/posting-board/pages/PostesVacantsPage';
import JobOfferDetailPage from './modules/posting-board/pages/JobOfferDetailPage';
import JobOfferEditPage from './modules/posting-board/pages/JobOfferEditPage';
import JobApplicationsPage from './modules/posting-board/pages/JobApplicationsPage';
import ApplicationDetailPage from './modules/posting-board/pages/ApplicationDetailPage';
import { MonEspaceProtectedRoute } from './components/MonEspaceProtectedRoute';

// Helper to wrap Mon Espace pages with access control
const withMonEspaceProtection = (Component: React.ComponentType) => {
  return () => (
    <MonEspaceProtectedRoute>
      <Component />
    </MonEspaceProtectedRoute>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: AboutPage },
      { path: 'login', Component: Login },
      { path: 'signup', Component: Signup },
      { path: 'signup-confirmation', Component: SignupConfirmation },
      { path: 'forgot-password', Component: ForgotPassword },
      { path: 'reset-password', Component: ResetPassword },
      { path: 'terms-of-service', Component: TermsOfService },
      { path: 'privacy-policy', Component: PrivacyPolicy },
      { path: 'about', Component: AboutPage },
      { path: 'dashboard', Component: Dashboard },
      { path: 'calls', element: <Navigate to="/calls/active" replace /> },
      { path: 'calls/overview', Component: TendersHub },
      { path: 'calls/active', Component: ActiveTenders },
      { path: 'calls/tors', Component: ToRsList },
      { path: 'calls/tors/:id', Component: ToRDetail },
      { path: 'calls/:id', Component: ProjectDetail },
      { path: 'calls/ai-matching', Component: AIMatching },
      { path: 'calls/templates', Component: Templates },
      { path: 'calls/template-edit/:id', Component: TemplateEdit },
      { path: 'calls/template-create', Component: TemplateCreate },
      // Route Pipeline supprimée - déplacée vers /projects/pipeline
      { path: 'calls-enhanced', Component: CallsEnhanced },
      { path: 'calls-old', Component: Calls },
      { path: 'tenders', element: <Navigate to="/tenders/active" replace /> },
      { path: 'tenders/overview', Component: TendersHub },
      { path: 'tenders/active', Component: ActiveTenders },
      { path: 'tenders/:id', Component: ProjectDetail },
      { path: 'tenders/ai-matching', Component: AIMatching },
      { path: 'tenders/templates', Component: Templates },
      { path: 'tenders/template-edit/:id', Component: TemplateEdit },
      { path: 'tenders/template-create', Component: TemplateCreate },
      // Route Pipeline supprimée - déplacée vers /projects/pipeline
      { path: 'projects', Component: Projects },
      { path: 'projects/active', Component: ProjectsActive },
      { path: 'projects/pipeline', Component: Pipeline },
      { path: 'projects/matching', Component: ProjectsMatching },
      { path: 'projects/matching-archive', Component: ProjectsMatchingArchive },
      { path: 'projects/:id', Component: ProjectDetail },
      { path: 'projects/:id/edit', Component: EditProject },
      { path: 'projects/tasks', Component: ProjectsTasks },
      { path: 'projects/tasks/new', Component: NewTask },
      { path: 'projects/tasks/assign', Component: AssignTasks },
      { path: 'projects/references', Component: ProjectsReferences },
      { path: 'projects/collaborations', Component: ProjectsCollaborations },
      { path: 'projects/collaborations/:id', Component: CollaborationDetail },
      { path: 'projects/contractors', Component: ProjectsContractors },
      { path: 'projects/contractors/:contractorId', Component: ProjectContractorDetails },
      { path: 'projects/organizations-scoring', Component: ProjectsOrganizationsScoring },
      { path: 'projects/new', Component: NewProject },
      { path: 'expert', element: <Navigate to="/experts" replace /> },
      { path: 'experts', Component: Experts },
      { path: 'experts/database', Component: ExpertsDatabase },
      { path: 'experts/cv-profiles', Component: ExpertsCVProfiles },
      { path: 'experts/edit-profile', Component: ExpertsEditProfile },
      { path: 'experts/create-account', Component: ExpertsCreateAccount },
      { path: 'experts/templates', Component: ExpertsTemplates },
      { path: 'experts/cv-templates', Component: ExpertsCVTemplates },
      { path: 'experts/matching-organisation', Component: ExpertsMatchingOrganisation },
      { path: 'experts/matching-organisation-archive', Component: ExpertsMatchingOrganisationArchive },
      { path: 'experts/my-cv', element: <Navigate to="/experts/my-cv/dashboard" replace /> },
      { path: 'experts/my-cv/dashboard', Component: ExpertMyCVDashboard },
      { path: 'experts/my-cv/info', Component: ExpertMyCVInfo },
      { path: 'experts/:id', Component: ExpertPublicProfile },
      { path: 'matching-opportunities', element: <Navigate to="/matching-opportunities/home" replace /> },
      { path: 'matching-opportunities/home', Component: MatchingOpportunitiesHome },
      { path: 'matching-opportunities/projects', Component: MatchingProjectsPage },
      { path: 'matching-opportunities/opportunities', Component: MatchingOpportunitiesPage },
      { path: 'matching-opportunities/opportunities/project/:id', Component: MatchingProjectDetailPage },
      { path: 'matching-opportunities/opportunities/award/:id', Component: MatchingAwardDetailPage },
      { path: 'matching-opportunities/opportunities/shortlist/:id', Component: MatchingShortlistDetailPage },
      { path: 'matching-opportunities/opportunities/vacancy/:id', Component: MatchingVacancyDetailPage },
      { path: 'matching-opportunities/saved', Component: MatchingOpportunitiesSaved },
      { path: 'matching-opportunities/profiles', Component: SavedProfilesPage },
      { path: 'matching-opportunities/alerts', Component: AlertsFusionPage },
      { path: 'organizations', Component: OrganizationsHub },
      { path: 'organizations/overview', Component: OrganizationsHub },
      { path: 'organizations/database', Component: OrganizationsDatabase },
      { path: 'organizations/:id', Component: OrganizationDetail },
      { path: 'organizations/create-profile', Component: OrganizationsCreateProfile },
      { path: 'organizations/edit-profile', Component: OrganizationsEditProfile },
      { path: 'organizations/invite', Component: OrganizationsInvite },
      { path: 'organizations/my-organization', Component: MyOrganization },
      { path: 'organizations/project-references', Component: OrganizationProjectReferences },
      { path: 'organizations/project-references/:id', Component: OrganizationProjectReferenceDetail },
      { path: 'organizations/teams', Component: OrganizationsTeams },
      { path: 'organizations/partnerships', Component: OrganizationsPartnerships },
      { path: 'organizations/partnership-detail/:id', Component: OrganizationsPartnershipDetail },
      { path: 'organizations/invitations', Component: OrganizationsInvitations },
      { path: 'organizations/matching', Component: OrganizationsMatching },
      { path: 'organizations/matching-dossier', Component: OrganizationsMatchingArchive },
      { path: 'matching', Component: SmartMatching },
      { path: 'subscriptions', Component: Subscriptions },
      { path: 'training', Component: Training },
      { path: 'training/portfolio', Component: TrainingPortfolio },
      { path: 'training/activated-pills', Component: TrainingActivatedPills },
      { path: 'training/catalog', Component: TrainingCatalog },
      { path: 'training/checkout', Component: TrainingCheckout },
      { path: 'training/checkout/confirmation', Component: TrainingCheckoutConfirmation },
      { path: 'training/enroll/:courseId', Component: TrainingEnrollment },
      { path: 'training/program-details/:programId', Component: TrainingProgramDetails },
      { path: 'training/live-sessions', Component: TrainingLiveSessions },
      { path: 'training/live-session-details/:sessionId', Component: TrainingLiveSessionDetails },
      { path: 'training/session-enroll/:sessionId', Component: TrainingSessionEnrollment },
      { path: 'training/recording-player/:sessionId', Component: TrainingRecordingPlayer },
      { path: 'training/trainers', Component: TrainingTrainers },
      { path: 'training/trainer-details/:trainerId', Component: TrainingTrainerDetails },
      { path: 'training/certifications', Component: TrainingCertifications },
      { path: 'training/certifications-history', Component: TrainingCertifications },
      { path: 'training/certification-details/:certificationId', Component: TrainingCertificationDetails },
      { path: 'training/certification-enroll/:certificationId', Component: TrainingCertificationEnroll },
      { path: 'excellence', Component: Assistance },
      { path: 'assistance', Component: Assistance },
      { path: 'assistance/find-expert', Component: AssistanceFindExpert },
      { path: 'assistance/request', Component: AssistanceRequest },
      { path: 'assistance/request-support', Component: AssistanceRequestSupport },
      { path: 'assistance/history', Component: AssistanceHistory },
      { path: 'statistics', element: <Navigate to="/statistics/dashboard" replace /> },
      { path: 'statistics/dashboard', Component: StatisticsDashboard },
      { path: 'statistics/projects-contracts', Component: StatisticsProjectsContracts },
      { path: 'statistics/market-trends', Component: StatisticsMarketTrends },
      { path: 'statistics/pricing-experts', Component: StatisticsPricingExperts },
      { path: 'statistics/experts-fees', Component: StatisticsExpertsFees },
      { path: 'statistics/competitors', Component: StatisticsCompetitors },
      { path: 'statistics/usage-analytics', Component: StatisticsUsageAnalytics },
      { path: 'statistics/map-insights', Component: StatisticsMapInsights },
      { path: 'notifications', Component: Notifications },
      { path: 'offers', Component: OffersHub },
      { path: 'offers/become-member', Component: BecomeMember },
      { path: 'offers/change-plan', Component: ChangePlan },
      { path: 'offers/checkout', Component: Checkout },
      { path: 'offers/confirmation', Component: ConfirmationMembership },
      { path: 'offers/member-area', Component: MemberArea },
      { path: 'offers/contact-sales', Component: ContactSales },
      { path: 'offers/faq', element: <Navigate to="/faq" replace /> },
      { path: 'faq', Component: OffersFAQ },
      { path: 'offers/promotion-request', Component: PromotionRequest },
      { path: 'contact', Component: Contact },
      { path: 'ask-for-quote', Component: AskForQuotePage },
      { path: 'services', element: <Navigate to="/services/projects" replace /> },
      { path: 'services/projects', Component: PublicProjectsServicePage },
      { path: 'services/organization', element: <Navigate to="/services/organization/matching-projects" replace /> },
      { path: 'services/organization/matching-projects', Component: PublicOrganizationMatchingProjectsPage },
      { path: 'services/organization/my-projects', Component: PublicOrganizationMyProjectsPage },
      { path: 'services/organization/search', Component: PublicOrganizationSearchPage },
      { path: 'services/organization/statistics', Component: PublicOrganizationStatisticsPage },
      { path: 'services/experts', element: <Navigate to="/services/experts/matching-opportunities" replace /> },
      { path: 'services/experts/matching-opportunities', Component: PublicExpertsMatchingOpportunitiesPage },
      { path: 'services/experts/my-projects', Component: PublicExpertsMyProjectsPage },
      { path: 'services/experts/cv-registration', Component: PublicExpertsCVRegistrationPage },
      { path: 'services/experts/search', Component: PublicExpertsSearchPage },
      { path: 'services/experts/statistics', Component: PublicExpertsStatisticsPage },
      { path: 'services/posting-board', Component: PublicPostingBoardServicePage },
      { path: 'services/training', Component: PublicTrainingServicePage },
      { path: 'search', Component: SearchDashboard },
      { path: 'search/map', Component: SearchMapPage },
      { path: 'search/projects', Component: SearchProjectsPage },
      { path: 'search/awards', Component: SearchAwardsPage },
      { path: 'search/shortlists', Component: SearchShortlistsPage },
      { path: 'search/organisations', Component: SearchOrganisationsPage },
      { path: 'search/organizations', element: <Navigate to="/search/organisations" replace /> },
      { path: 'search/experts', Component: SearchExpertsPage },
      { path: 'search/my-experts', Component: SearchMyExpertsPage },
      { path: 'search/bid-writers', Component: SearchBidWritersPage },
      { path: 'search/calls/:id', Component: ProjectDetail },
      { path: 'search/projects/:id', Component: ProjectDetail },
      { path: 'search/experts/:id', Component: ExpertPublicProfile },
      { path: 'search/organizations/:id', Component: OrganizationDetail },
      { path: 'search/organisations/:id', Component: OrganizationDetail },
      { path: 'account', Component: ProtectedAccountHome },
      { path: 'compte-utilisateur', Component: ProtectedCompteUtilisateur },
      { path: 'account/security', Component: ProtectedCompteUtilisateurSecurity },
      { path: 'compte-utilisateur/security', Component: ProtectedCompteUtilisateurSecurity },
      { path: 'account/resources', Component: ProtectedCompteUtilisateurResources },
      { path: 'compte-utilisateur/resources', Component: ProtectedCompteUtilisateurResources },
      { path: 'compte-utilisateur/credits', element: <Navigate to="/account/subscription" replace /> },
      { path: 'account/credits', element: <Navigate to="/account/subscription" replace /> },
      { path: 'account/my-selection', Component: ProtectedMySelectionAlerts },
      { path: 'account/teams', Component: ProtectedAccountTeams },
      { path: 'account/messages', Component: ProtectedAccountMessages },
      { path: 'account/profile', Component: ProtectedModifierProfilPage },
      { path: 'compte-utilisateur/profil', Component: ProtectedModifierProfilPage },
      { path: 'compte-utilisateur/messages', Component: ProtectedAccountMessages },
      { path: 'account/my-account', Component: withMonEspaceProtection(MonComptePage) },
      { path: 'compte-utilisateur/mon-compte', Component: withMonEspaceProtection(MonComptePage) },
      { path: 'account/subscription', Component: ProtectedAccountSubscription },
      { path: 'compte-utilisateur/abonnement', Component: ProtectedAccountSubscription },
      { path: 'account/member-area', Component: ProtectedAccountSubscription },
      { path: 'compte-utilisateur/espace-membre', Component: ProtectedAccountSubscription },
      { path: 'account/invitations', Component: withMonEspaceProtection(Invitations) },
      { path: 'compte-utilisateur/invitations', Component: withMonEspaceProtection(Invitations) },
      { path: 'account/invitations/:invitationId/messages', Component: withMonEspaceProtection(InvitationMessaging) },
      { path: 'compte-utilisateur/invitations/:invitationId/messages', Component: withMonEspaceProtection(InvitationMessaging) },
      { path: 'mon-espace', Component: withMonEspaceProtection(MonEspaceDashboardPage) },
      { path: 'mon-espace/offres-projets', Component: withMonEspaceProtection(OffresProjetsPage) },
      { path: 'mon-espace/offres-internes', Component: withMonEspaceProtection(OffresInternesPage) },
      { path: 'mon-espace/enregistrer-cv', Component: withMonEspaceProtection(EnregistrerCVPage) },
      { path: 'mon-espace/mon-compte', element: <Navigate to="/compte-utilisateur/mon-compte" replace /> },
      { path: 'mon-espace/abonnement', element: <Navigate to="/compte-utilisateur/abonnement" replace /> },
      { path: 'mon-espace/mon-cv', Component: withMonEspaceProtection(MonCVPage) },
      { path: 'mon-espace/espace-membre', element: <Navigate to="/compte-utilisateur/espace-membre" replace /> },
      { path: 'mon-espace/changer-plan', Component: withMonEspaceProtection(ChangerPlanPage) },
      { path: 'mon-espace/checkout', Component: withMonEspaceProtection(CheckoutPage) },
      { path: 'mon-espace/modifier-profil', Component: ProtectedModifierProfilPage },
      { path: 'mon-espace/invitations', element: <Navigate to="/compte-utilisateur/invitations" replace /> },
      { path: 'mon-espace/invitations/:invitationId/messages', element: <Navigate to="/compte-utilisateur/invitations" replace /> },
      { path: 'mon-espace/invite', Component: withMonEspaceProtection(OrganizationsInvite) },
      // Posting Board Routes
      { path: 'posting-board', element: <Navigate to="/posting-board/publish" replace /> },
      { path: 'posting-board/publish', Component: withMonEspaceProtection(PublierOffrePage) },
      { path: 'posting-board/vacancies', Component: withMonEspaceProtection(PostesVacantsPage) },
      { path: 'posting-board/detail/:id', Component: withMonEspaceProtection(JobOfferDetailPage) },
      { path: 'posting-board/edit/:id', Component: withMonEspaceProtection(JobOfferEditPage) },
      { path: 'posting-board/detail/:id/applications/:applicationId', Component: withMonEspaceProtection(JobApplicationsPage) },
      { path: 'posting-board/applications/:applicationId', Component: withMonEspaceProtection(ApplicationDetailPage) },
      { path: 'system-states-demo', Component: SystemStatesDemo },
      { path: '*', Component: NotFound },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
