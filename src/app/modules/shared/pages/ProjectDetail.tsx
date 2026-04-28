import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { useProjects } from '@app/hooks/useProjects';
import { useExperts } from '@app/modules/expert/hooks/useExperts';
import { usePipeline } from '@app/modules/expert/hooks/usePipeline';
import { useOrganizations } from '@app/modules/organization/hooks/useOrganizations';
import { useOrganizationBookmarks } from '@app/modules/shared/hooks/useOrganizationBookmarks';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ProjectsSubMenu } from '@app/components/ProjectsSubMenu';
import { SearchSectionTabs, type SearchSectionTab } from '@app/components/SearchSectionTabs';
import { TendersSubMenu } from '@app/components/TendersSubMenu';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Progress } from '@app/components/ui/progress';
import { Alert, AlertDescription } from '@app/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@app/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@app/components/ui/accordion';
import { toast } from 'sonner';
import {
  Briefcase,
  Coins,
  FileText,
  MapPin,
  DollarSign,
  Users,
  Building2,
  UserCircle,
  CheckCircle,
  Target,
  Landmark,
  Route,
  Sparkles,
  Lock,
  Star,
  TrendingUp,
  WandSparkles,
  Download,
  Copy,
  Pencil,
  Save,
  RotateCcw,
  Eye,
  History,
  Loader2,
  Search,
  Plus,
  Trash2,
  X,
  Bookmark,
  UserPlus,
} from 'lucide-react';
import { ProjectStatusEnum, ProjectPriorityEnum } from '@app/types/project.dto';
import { canAssignProjectTasks } from '@app/services/permissions.service';

type LifecycleGroupKey = 'early-intelligence' | 'open-procurement' | 'contract-shortlist';

interface LifecycleDocument {
  id: string;
  group: LifecycleGroupKey;
  sectionLabel: string;
  itemLabel: string;
  description: string;
  hasShortlist?: boolean;
  hasContract?: boolean;
}

type ProjectAccessSource = 'my-projects' | 'my-alerts' | 'search-projects' | 'search-awards';

interface ProjectDetailLocationState {
  fromMyProjects?: boolean;
  isFavorited?: boolean;
  accessSource?: ProjectAccessSource;
  fromPipeline?: boolean;
}

interface SuggestedExpert {
  id: string;
  name: string;
  role: string;
  matchScore: number;
  tags: string[];
}

interface ProjectDocument {
  id: string;
  name: string;
  type: string;
  datePublished: string;
}

interface PartnerMatch {
  id: string;
  name: string;
  summary: string;
  category: 'primary' | 'secondary';
  highlight: string;
}

interface SimilarProject {
  id: string;
  name: string;
  sector: string;
  country: string;
}

interface PredictiveInsight {
  id: string;
  labelKey: string;
  value: number;
  tone: 'emerald' | 'amber' | 'blue';
  helper: string;
}

interface ContextualRecommendation {
  id: string;
  title: string;
  subtitle: string;
  ctaHint: string;
}

interface RefProDescriptionSection {
  id: string;
  heading: string;
  paragraphs: string[];
}

interface RefProVersionEntry {
  id: string;
  createdAt: string;
  label: string;
  sections: RefProDescriptionSection[];
}

interface TorSection {
  id: string;
  title: string;
  content: string;
}

type TorHistorySource = 'USER_UPLOADED' | 'AI_GENERATED';

interface TorHistoryEntry {
  id: string;
  projectId: string;
  createdAt: string;
  versionName: string;
  originalFileName: string;
  fileType: string;
  source: TorHistorySource;
  fileUrl: string;
  extractedText?: string;
  sections?: TorSection[];
}

function readSavedProjectIds(): string[] {
  try {
    const stored = localStorage.getItem('projects.favouriteIds');
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return parsed.filter((value): value is string => typeof value === 'string');
    }

    if (parsed && typeof parsed === 'object') {
      return Object.entries(parsed)
        .filter(([, isSaved]) => Boolean(isSaved))
        .map(([projectId]) => projectId);
    }
  } catch (error) {
    return [];
  }

  return [];
}

function writeSavedProjectIds(projectIds: string[]) {
  try {
    localStorage.setItem('projects.favouriteIds', JSON.stringify(projectIds));
  } catch (error) {
    // Ignore storage errors to preserve current mock behavior.
  }
}

function readRefProHistory(projectId?: string): RefProVersionEntry[] {
  if (!projectId) return [];

  try {
    const raw = localStorage.getItem(`projects.refpro.history.${projectId}`);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((entry): entry is RefProVersionEntry => {
      return (
        Boolean(entry) &&
        typeof entry.id === 'string' &&
        typeof entry.createdAt === 'string' &&
        typeof entry.label === 'string' &&
        Array.isArray(entry.sections)
      );
    });
  } catch (error) {
    return [];
  }
}

function writeRefProHistory(projectId: string | undefined, history: RefProVersionEntry[]) {
  if (!projectId) return;

  try {
    localStorage.setItem(`projects.refpro.history.${projectId}`, JSON.stringify(history));
  } catch (error) {
    // Ignore storage errors to preserve current mock behavior.
  }
}

function readTorHistory(projectId?: string): TorHistoryEntry[] {
  if (!projectId) return [];

  try {
    const raw = localStorage.getItem(`projects.tor.history.${projectId}`);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((entry): TorHistoryEntry | null => {
        if (!entry || typeof entry !== 'object' || typeof entry.id !== 'string' || typeof entry.createdAt !== 'string') {
          return null;
        }

        if (
          typeof entry.versionName === 'string' &&
          typeof entry.originalFileName === 'string' &&
          typeof entry.fileType === 'string' &&
          (entry.source === 'USER_UPLOADED' || entry.source === 'AI_GENERATED') &&
          typeof entry.fileUrl === 'string'
        ) {
          return {
            id: entry.id,
            projectId: typeof entry.projectId === 'string' ? entry.projectId : projectId,
            createdAt: entry.createdAt,
            versionName: entry.versionName,
            originalFileName: entry.originalFileName,
            fileType: entry.fileType,
            source: entry.source,
            fileUrl: entry.fileUrl,
            extractedText: typeof entry.extractedText === 'string' ? entry.extractedText : undefined,
            sections: Array.isArray(entry.sections) ? entry.sections : undefined,
          };
        }

        if (typeof entry.label === 'string' && Array.isArray(entry.sections)) {
          const plainText = buildTorPlainText(entry.sections);
          return {
            id: entry.id,
            projectId,
            createdAt: entry.createdAt,
            versionName: entry.label,
            originalFileName: `${entry.label}.txt`,
            fileType: 'txt',
            source: 'AI_GENERATED',
            fileUrl: `data:text/plain;charset=utf-8,${encodeURIComponent(plainText)}`,
            extractedText: plainText,
            sections: entry.sections,
          };
        }

        return null;
      })
      .filter((entry): entry is TorHistoryEntry => Boolean(entry))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    return [];
  }
}

function writeTorHistory(projectId: string | undefined, history: TorHistoryEntry[]) {
  if (!projectId) return;

  try {
    localStorage.setItem(`projects.tor.history.${projectId}`, JSON.stringify(history));
  } catch (error) {
    // Ignore storage errors to preserve current mock behavior.
  }
}

function buildTorPlainText(sections: TorSection[]) {
  return sections.map((section) => `${section.title}\n\n${section.content}`).join('\n\n---\n\n');
}

const PARTNER_VISIBILITY_STORAGE_KEY = 'myProjects.partnerVisibility';

function readPartnerVisibility(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(PARTNER_VISIBILITY_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    return {};
  }
}

function writePartnerVisibility(visibility: Record<string, boolean>) {
  try {
    localStorage.setItem(PARTNER_VISIBILITY_STORAGE_KEY, JSON.stringify(visibility));
  } catch (error) {
    // Ignore storage errors to preserve current mock behavior.
  }
}

function getInsightClasses(tone: PredictiveInsight['tone']) {
  switch (tone) {
    case 'emerald':
      return {
        badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        progress: '[&>div]:bg-emerald-500',
      };
    case 'amber':
      return {
        badge: 'border-amber-200 bg-amber-50 text-amber-700',
        progress: '[&>div]:bg-amber-500',
      };
    default:
      return {
        badge: 'border-sky-200 bg-sky-50 text-sky-700',
        progress: '[&>div]:bg-sky-500',
      };
  }
}

function MatchingAiCard({
  title,
  description,
  accentClassName,
  icon,
  className,
  children,
}: {
  title: string;
  description: string;
  accentClassName: string;
  icon: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <article className={`min-w-0 rounded-2xl border bg-white/90 p-5 shadow-sm backdrop-blur ${accentClassName} ${className || ''}`}>
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-tight text-primary sm:text-lg">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </article>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { kpis, allProjects } = useProjects();
  const { experts } = useExperts();
  const { allOrganizations } = useOrganizations();
  const { isBookmarked, toggleBookmark } = useOrganizationBookmarks();
  const { addToPipeline, removeFromPipeline } = usePipeline();
  const location = useLocation();
  const locationState = ((location && location.state) || {}) as ProjectDetailLocationState;
  const fromMyProjects = locationState.fromMyProjects === true;
  const fromPipeline = locationState.fromPipeline === true;
  const stateFavorited = locationState.isFavorited === true;
  const pathAccessSource: ProjectAccessSource = location.pathname.startsWith('/projects/')
    ? 'my-projects'
    : location.pathname.startsWith('/search/calls/')
    ? 'search-awards'
    : location.pathname.startsWith('/search/projects/')
    ? 'search-projects'
    : 'my-alerts';
  const initialAccessSource = locationState.accessSource || (fromMyProjects ? 'my-projects' : pathAccessSource);
  const [activeLifecycleDocId, setActiveLifecycleDocId] = useState('early-intelligence-notice');
  const [activeDetailTab, setActiveDetailTab] = useState('overview');
  const [projectAccessSource, setProjectAccessSource] = useState<ProjectAccessSource>(initialAccessSource);
  const [generatedResponses, setGeneratedResponses] = useState<Record<string, string>>({});
  const [isGeneratingRefPro, setIsGeneratingRefPro] = useState(false);
  const [refProHistory, setRefProHistory] = useState<RefProVersionEntry[]>([]);
  const [refProCurrentVersionId, setRefProCurrentVersionId] = useState<string | null>(null);
  const [refProDraftSections, setRefProDraftSections] = useState<RefProDescriptionSection[] | null>(null);
  const [refProDraftGeneratedAt, setRefProDraftGeneratedAt] = useState<string | null>(null);
  const [isGeneratingTor, setIsGeneratingTor] = useState(false);
  const [torHistory, setTorHistory] = useState<TorHistoryEntry[]>([]);
  const [torCurrentVersionId, setTorCurrentVersionId] = useState<string | null>(null);
  const [torDraftSections, setTorDraftSections] = useState<TorSection[] | null>(null);
  const [torDraftGeneratedAt, setTorDraftGeneratedAt] = useState<string | null>(null);
  const [isTorEditMode, setIsTorEditMode] = useState(false);
  const [isTorUploadDialogOpen, setIsTorUploadDialogOpen] = useState(false);
  const [torUploadVersionName, setTorUploadVersionName] = useState('');
  const [torUploadFile, setTorUploadFile] = useState<File | null>(null);
  const [torUploadError, setTorUploadError] = useState('');
  const [isUploadingTor, setIsUploadingTor] = useState(false);
  const [isProjectActionDialogOpen, setIsProjectActionDialogOpen] = useState(false);
  const [pendingProjectAction, setPendingProjectAction] = useState<'add' | 'remove'>('add');
  const [availableCredits, setAvailableCredits] = useState(120);
  const [purchasedCvExpertIds, setPurchasedCvExpertIds] = useState<Set<string>>(new Set());
  const [isProjectSaved, setIsProjectSaved] = useState<boolean>(() => {
    if (!id) return stateFavorited;
    const savedIds = readSavedProjectIds();
    return savedIds.includes(id) || stateFavorited;
  });
  const [partnerVisibility, setPartnerVisibility] = useState<Record<string, boolean>>(() => readPartnerVisibility());
  const showAlertsHeader = projectAccessSource === 'my-alerts';

  useEffect(() => {
    if (!id) {
      setRefProHistory([]);
      setRefProCurrentVersionId(null);
      setRefProDraftSections(null);
      setRefProDraftGeneratedAt(null);
      setTorHistory([]);
      setTorCurrentVersionId(null);
      setTorDraftSections(null);
      setTorDraftGeneratedAt(null);
      setIsTorEditMode(false);
      setIsTorUploadDialogOpen(false);
      setTorUploadVersionName('');
      setTorUploadFile(null);
      setTorUploadError('');
      return;
    }

    const storedHistory = readRefProHistory(id);
    const storedTorHistory = readTorHistory(id);
    setRefProHistory(storedHistory);
    setRefProCurrentVersionId(storedHistory[0]?.id ?? null);
    setTorHistory(storedTorHistory);
    setTorCurrentVersionId(storedTorHistory[0]?.id ?? null);
  }, [id]);

  useEffect(() => {
    writeRefProHistory(id, refProHistory);
  }, [id, refProHistory]);

  useEffect(() => {
    writeTorHistory(id, torHistory);
  }, [id, torHistory]);

  const fallbackOrganizationId = allOrganizations[0]?.id || '1';
  const fallbackExpertId = experts.data[0]?.id || '1';
  const fallbackProjectId = allProjects[0]?.id || '1';

  const resolveOrganizationId = (organizationName: string) => {
    const normalizedName = organizationName.trim().toLowerCase();
    const match = allOrganizations.find((org) => {
      const byName = org.name.trim().toLowerCase() === normalizedName;
      const byAcronym = org.acronym?.trim().toLowerCase() === normalizedName;
      const byId = org.id === organizationName;
      return byId || byName || byAcronym;
    });

    return match?.id || fallbackOrganizationId;
  };

  const resolveOrganizationBookmarkId = (organizationName: string) => {
    const normalizedName = organizationName.trim().toLowerCase();
    const match = allOrganizations.find((org) => {
      const byName = org.name.trim().toLowerCase() === normalizedName;
      const byAcronym = org.acronym?.trim().toLowerCase() === normalizedName;
      const byId = org.id === organizationName;
      return byId || byName || byAcronym;
    });

    return match?.id || organizationName;
  };

  const resolveExpertId = (expertId: string) => {
    const match = experts.data.find((expert) => expert.id === expertId);
    return match?.id || fallbackExpertId;
  };

  const resolveProjectId = (projectReference: string) => {
    const normalizedReference = projectReference.trim().toLowerCase();
    const match = allProjects.find((projectItem) => {
      const byId = projectItem.id === projectReference;
      const byTitle = projectItem.title.trim().toLowerCase() === normalizedReference;
      const byCode = projectItem.code.trim().toLowerCase() === normalizedReference;
      return byId || byTitle || byCode;
    });

    return match?.id || fallbackProjectId;
  };

  const renderOrganizationBookmarkButton = (organizationName: string) => {
    const organizationId = resolveOrganizationBookmarkId(organizationName);
    const bookmarked = isBookmarked(organizationId);

    return (
      <Button
        type="button"
        size="sm"
        variant={bookmarked ? 'default' : 'outline'}
        className="h-8"
        aria-label={bookmarked ? t('projects.actions.viewPartners') : t('projects.actions.addOrgToPartners')}
        onClick={() => {
          if (bookmarked) {
            navigate('/projects/collaborations');
            return;
          }
          toggleBookmark(organizationId);
        }}
      >
        <Bookmark className="mr-1.5 h-3.5 w-3.5" />
        {bookmarked ? t('projects.actions.viewPartners') : t('projects.actions.addOrgToPartners')}
      </Button>
    );
  };

  // Mock project data - will be replaced with actual data from API
  const project = {
    id: id,
    code: 'PROJ-2024-001',
    title: 'Rural Education Infrastructure Development',
    description: 'Construction and renovation of primary schools in rural communities to improve access to quality education. The project aims to build 15 new schools and renovate 25 existing facilities across rural regions, providing quality education infrastructure for over 10,000 students.',
    status: ProjectStatusEnum.ACTIVE,
    priority: ProjectPriorityEnum.HIGH,
    type: 'INFRASTRUCTURE',
    scope: 'REGIONAL',
    sector: 'EDUCATION',
    sectors: ['EDUCATION', 'INFRASTRUCTURE'],
    subsectors: ['PRIMARY_EDUCATION', 'INFRASTRUCTURE'],
    objectives: 'Improve access to quality education in rural communities by constructing modern school facilities equipped with necessary amenities including classrooms, libraries, laboratories, and sanitation facilities. Ensure sustainable and inclusive education infrastructure that meets international standards.',
    
    // Related Tender
    relatedTender: 'Rural Infrastructure Development - East Africa Region',
    projectSource: 'TENDER',
    
    // Location
    country: 'Kenya',
    countries: [
      'Afghanistan',
      'Armenia',
      'Azerbaijan',
      'Bangladesh',
      'Bhutan',
      'Cambodia',
      'China',
      'India',
      'Indonesia',
      'Kazakhstan',
      'Malaysia',
      'Nepal',
      'Pakistan',
      'Philippines',
      'Sri Lanka',
      'Thailand',
      'Uzbekistan',
      'Vietnam',
    ],
    region: 'Eastern Province',
    city: 'Kitui County',
    
    // Timeline
    timeline: {
      startDate: '2023-06-01',
      endDate: '2025-05-31',
      duration: 24,
      completionPercentage: 74,
    },
    
    // Budget
    budget: {
      total: 2500000,
      spent: 1850000,
      remaining: 650000,
      currency: 'USD',
    },
    
    // Organizations
    leadOrganization: 'World Bank',
    donor: 'USAID',
    partners: [
      'Ministry of Education Kenya',
      'Local NGO Consortium',
      'Community Development Foundation',
    ],
    mostRelevantIcaPartners: [
      'Education Development Trust',
      'African School Builders Initiative',
      'Global Infrastructure Partners',
    ],
    otherPossiblePartners: [
      'Rural Teachers Network',
      'Learning Spaces Alliance',
      'Community Builders East Africa',
    ],
    shortlistedCompanies: [
      { name: 'EduBuild Consortium', date: '2024-01-15' },
      { name: 'SchoolWorks International', date: '2024-01-15' },
      { name: 'Kijani Infra Ltd', date: '2024-01-15' },
    ],
    contractAwardedCompanies: [
      { name: 'EduBuild Consortium', date: '2024-02-20', budget: '$1,200,000' },
      { name: 'Kijani Infra Ltd', date: '2024-02-20', budget: '$980,000' },
    ],
    
    // Team
    projectManager: 'Sarah Johnson',
    technicalLead: 'Michael Chen',
    teamSize: 45,
    teamMembers: [
      { id: '1', name: 'Sarah Johnson', role: 'Project Manager', allocation: '100%' },
      { id: '2', name: 'Michael Chen', role: 'Technical Lead', allocation: '100%' },
      { id: '3', name: 'Aisha Ndlovu', role: 'Infrastructure Specialist', allocation: '80%' },
      { id: '4', name: 'Carlos Rodriguez', role: 'M&E Officer', allocation: '60%' },
      { id: '5', name: 'Dr. Fatima Hassan', role: 'Education Consultant', allocation: '40%' },
    ],
    
    // Tasks
    totalTasks: 172,
    tasksCompleted: 128,
    tasks: [
      { id: '1', title: 'Complete site assessments', status: 'COMPLETED', priority: 'HIGH', dueDate: '2023-07-15' },
      { id: '2', title: 'Finalize architectural designs', status: 'COMPLETED', priority: 'HIGH', dueDate: '2023-08-30' },
      { id: '3', title: 'Procurement of construction materials', status: 'IN_PROGRESS', priority: 'URGENT', dueDate: '2024-03-15' },
      { id: '4', title: 'Community stakeholder engagement', status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: '2024-04-10' },
      { id: '5', title: 'Quarterly progress reporting', status: 'TODO', priority: 'MEDIUM', dueDate: '2024-05-01' },
    ],
    
    // Milestones
    milestones: [
      { id: '1', title: 'Project Initiation', date: '2023-06-01', status: 'COMPLETED' },
      { id: '2', title: 'Site Surveys Completed', date: '2023-08-15', status: 'COMPLETED' },
      { id: '3', title: 'Construction Phase 1', date: '2023-12-01', status: 'COMPLETED' },
      { id: '4', title: 'Construction Phase 2', date: '2024-06-01', status: 'IN_PROGRESS' },
      { id: '5', title: 'Facility Handover', date: '2025-05-31', status: 'PENDING' },
    ],
    
    createdDate: '2023-05-15',
    updatedDate: '2024-02-20',
  };

  const [projectTasks, setProjectTasks] = useState(() =>
    project.tasks.map((task) => ({ ...task, assignedTo: [] as { id: string; name: string; role?: string }[] }))
  );
  const [taskToAssign, setTaskToAssign] = useState<(typeof projectTasks)[number] | null>(null);
  const [selectedTaskMemberId, setSelectedTaskMemberId] = useState('');
  const canAssignTasks = canAssignProjectTasks(user?.accountType);
  const assignmentMembers = project.teamMembers.map((member) => ({
    id: member.id,
    name: member.name,
    role: member.role,
  }));

  const lifecycleDocuments: LifecycleDocument[] = [
    {
      id: 'early-intelligence-notice',
      group: 'early-intelligence',
      sectionLabel: 'Early Intelligence',
      itemLabel: 'Early Intelligence Notice',
      description: 'The donor has signaled a planned intervention focused on education infrastructure expansion in under-served regions. Preliminary budget envelopes and strategic objectives are now available for partner alignment.',
    },
    {
      id: 'action-plan-procurement-plan',
      group: 'early-intelligence',
      sectionLabel: 'Early Intelligence',
      itemLabel: 'Action Plan / Procurement Plan',
      description: 'The action plan outlines phased procurement lots, timeline dependencies, and prequalification steps. It highlights coordination windows for consortium setup and compliance preparation.',
    },
    {
      id: 'request-invitation-eoi',
      group: 'open-procurement',
      sectionLabel: 'Open Procurement',
      itemLabel: 'Request / Invitation for Expression of Interest',
      description: 'The request for expression of interest defines technical eligibility, minimum experience thresholds, and expected implementation methodology for qualified organizations.',
    },
    {
      id: 'contract',
      group: 'contract-shortlist',
      sectionLabel: 'Contract / Shortlist',
      itemLabel: 'Contract',
      description: 'The contract package confirms awarded scopes, deliverable schedule, and financial commitments per awarded entity. It also specifies reporting obligations and quality assurance milestones.',
      hasContract: true,
    },
    {
      id: 'shortlist',
      group: 'contract-shortlist',
      sectionLabel: 'Contract / Shortlist',
      itemLabel: 'Shortlist',
      description: 'The shortlist announces organizations selected after technical and administrative screening. The final round focuses on detailed financial and operational capacity validation.',
      hasShortlist: true,
    },
  ];

  const activeLifecycleDoc = useMemo(
    () => lifecycleDocuments.find((doc) => doc.id === activeLifecycleDocId) || lifecycleDocuments[0],
    [activeLifecycleDocId]
  );

  const suggestedExperts: SuggestedExpert[] = [
    {
      id: 'expert-1',
      name: 'Amina Diallo',
      role: 'Senior Bid Writer',
      matchScore: 94,
      tags: ['Education', 'Procurement', 'Consortium building'],
    },
    {
      id: 'expert-2',
      name: 'Daniel Mwangi',
      role: 'Infrastructure Proposal Lead',
      matchScore: 89,
      tags: ['School construction', 'Donor compliance', 'Budget narratives'],
    },
    {
      id: 'expert-3',
      name: 'Sofia Alvarez',
      role: 'Monitoring and Evaluation Specialist',
      matchScore: 82,
      tags: ['Results frameworks', 'Education KPIs', 'Reporting'],
    },
  ];

  const suggestedBidWriters: SuggestedExpert[] = [
    {
      id: 'writer-1',
      name: 'Nadia Laurent',
      role: 'Lead Proposal Strategist',
      matchScore: 96,
      tags: ['Donor storytelling', 'EOI strategy', 'Compliance review'],
    },
    {
      id: 'writer-2',
      name: 'Peter Kamau',
      role: 'Senior Bid Manager',
      matchScore: 88,
      tags: ['Capture planning', 'Proposal coordination', 'Pricing inputs'],
    },
    {
      id: 'writer-3',
      name: 'Lucia Romero',
      role: 'Technical Writer',
      matchScore: 83,
      tags: ['Education programs', 'Editing', 'Executive summaries'],
    },
  ];

  const partnerMatches: PartnerMatch[] = [
    {
      id: 'partner-1',
      name: 'Education Development Trust',
      summary: 'Strong implementation footprint in East Africa with recent donor-funded education wins.',
      category: 'primary',
      highlight: 'High delivery fit',
    },
    {
      id: 'partner-2',
      name: 'African School Builders Initiative',
      summary: 'Operationally aligned on rural school infrastructure and community engagement.',
      category: 'primary',
      highlight: 'Best consortium complement',
    },
    {
      id: 'partner-3',
      name: 'Learning Spaces Alliance',
      summary: 'Relevant references in education environments, but lighter in-country depth.',
      category: 'secondary',
      highlight: 'Good technical backup',
    },
    {
      id: 'partner-4',
      name: 'Community Builders East Africa',
      summary: 'Useful local relationships and mobilization capacity for field execution.',
      category: 'secondary',
      highlight: 'Local access advantage',
    },
  ];

  const similarPastProjects: SimilarProject[] = [
    { id: 'past-1', name: 'County School Upgrades Program', sector: 'Education infrastructure', country: 'Kenya' },
    { id: 'past-2', name: 'Rural Classrooms Expansion', sector: 'Primary education', country: 'Uganda' },
    { id: 'past-3', name: 'Learning Facilities Modernization', sector: 'School rehabilitation', country: 'Tanzania' },
  ];

  const predictiveInsights: PredictiveInsight[] = [
    {
      id: 'insight-1',
      labelKey: 'projects.matchingAI.insights.winLikelihood',
      value: 78,
      tone: 'emerald',
      helper: 'Strong thematic alignment and solid donor relevance.',
    },
    {
      id: 'insight-2',
      labelKey: 'projects.matchingAI.insights.competitionLevel',
      value: 64,
      tone: 'amber',
      helper: 'Expect several credible regional competitors in the shortlist.',
    },
    {
      id: 'insight-3',
      labelKey: 'projects.matchingAI.insights.consortiumReadiness',
      value: 86,
      tone: 'blue',
      helper: 'Partner mix is already close to a bid-ready configuration.',
    },
  ];

  const contextualRecommendations: ContextualRecommendation[] = [
    {
      id: 'rec-1',
      title: 'Eastern Province Teacher Support Initiative',
      subtitle: 'Education · Kenya',
      ctaHint: 'High overlap in donor priorities and delivery geography.',
    },
    {
      id: 'rec-2',
      title: 'Regional School Resilience Facility',
      subtitle: 'Infrastructure · Uganda',
      ctaHint: 'Relevant reference project for positioning and consortium reuse.',
    },
    {
      id: 'rec-3',
      title: 'Inclusive Learning Campuses Program',
      subtitle: 'Education · Rwanda',
      ctaHint: 'Aligned on accessibility and multi-site implementation scope.',
    },
  ];

  const similarContracts = [
    { id: 'contract-1', projectName: 'County School Upgrades Program', donor: 'World Bank', budget: '$1,100,000' },
    { id: 'contract-2', projectName: 'Rural Classrooms Expansion', donor: 'UNICEF', budget: '$950,000' },
    { id: 'contract-3', projectName: 'Education Facilities Modernization', donor: 'USAID', budget: '$1,350,000' },
  ];

  const topCompanies = [
    { id: 'company-1', name: 'EduBuild Consortium', count: 11 },
    { id: 'company-2', name: 'SchoolWorks International', count: 9 },
    { id: 'company-3', name: 'Kijani Infra Ltd', count: 8 },
    { id: 'company-4', name: 'African Learning Facilities', count: 7 },
    { id: 'company-5', name: 'Nova Development Group', count: 6 },
  ];

  const localCompanies = [
    { id: 'local-1', name: 'Nairobi Infrastructure Partners', info: 'Strong public infrastructure track record' },
    { id: 'local-2', name: 'Eastern BuildCo', info: 'Regional education projects' },
    { id: 'local-3', name: 'Kenya Development Engineering', info: 'School construction specialization' },
  ];

  const topExperts = [
    { id: 'top-expert-1', name: 'Dr. Fatima Hassan', profession: 'Education Infrastructure Specialist', seniority: 'Senior' },
    { id: 'top-expert-2', name: 'Michael Chen', profession: 'Technical Lead Engineer', seniority: 'Lead' },
    { id: 'top-expert-3', name: 'Aisha Ndlovu', profession: 'Civil Works Manager', seniority: 'Senior' },
    { id: 'top-expert-4', name: 'Jean-Paul Nsimba', profession: 'Procurement Advisor', seniority: 'Intermediate' },
    { id: 'top-expert-5', name: 'Lina Ortega', profession: 'M&E Specialist', seniority: 'Senior' },
  ];

  const projectDocuments: ProjectDocument[] = [
    { id: 'doc-1', name: 'Early Intelligence Notice', type: 'Notice', datePublished: '2023-05-18' },
    { id: 'doc-2', name: 'Procurement Plan', type: 'Planning Document', datePublished: '2023-06-02' },
    { id: 'doc-3', name: 'Expression of Interest Package', type: 'EOI', datePublished: '2023-08-11' },
    { id: 'doc-4', name: 'Shortlist Announcement', type: 'Shortlist', datePublished: '2024-01-15' },
    { id: 'doc-5', name: 'Awarded Contract Summary', type: 'Contract', datePublished: '2024-02-20' },
  ];

  const getStatusColor = (status: ProjectStatusEnum) => {
    switch (status) {
      case ProjectStatusEnum.PLANNING:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case ProjectStatusEnum.ACTIVE:
        return 'bg-green-50 text-green-700 border-green-200';
      case ProjectStatusEnum.ON_HOLD:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case ProjectStatusEnum.COMPLETED:
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return '';
    }
  };

  const getPriorityColor = (priority: ProjectPriorityEnum) => {
    switch (priority) {
      case ProjectPriorityEnum.LOW:
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case ProjectPriorityEnum.MEDIUM:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case ProjectPriorityEnum.HIGH:
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case ProjectPriorityEnum.URGENT:
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return '';
    }
  };

  const formatLabel = (value: string) =>
    value
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const budgetUtilization = Math.round((project.budget.spent / project.budget.total) * 100);
  const remainingTasks = Math.max(project.totalTasks - project.tasksCompleted, 0);
  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isSearchContext = projectAccessSource === 'search-awards' || projectAccessSource === 'search-projects';
  const showPipelineContext = fromPipeline && projectAccessSource !== 'my-projects';
  const searchSection: SearchSectionTab = projectAccessSource === 'search-awards' ? 'awards' : 'projects';
  const isAlertsContext = projectAccessSource === 'my-alerts' && !isProjectSaved;
  const showSensitiveSections = projectAccessSource === 'my-projects' || isProjectSaved;
  const projectDeadline = new Date(project.timeline.endDate);
  const isProjectClosed = Number.isFinite(projectDeadline.getTime()) && projectDeadline.getTime() < Date.now();
  const projectOpenClosedLabel = isProjectClosed ? 'Closed' : 'Open';
  const projectDetailBasePath = isSearchContext ? '/search/projects' : '/projects';
  const buildOrganizationDetailPath = (organizationName: string) => `/search/organisations/${encodeURIComponent(resolveOrganizationId(organizationName))}`;
  const isPartnerVisible = (partnerName: string) => partnerVisibility[partnerName] !== false;
  const setPartnerVisible = (partnerName: string, visible: boolean) => {
    setPartnerVisibility((current) => {
      const next = { ...current, [partnerName]: visible };
      writePartnerVisibility(next);
      return next;
    });
  };
  const renderPartnerVisibilityToggle = (partnerName: string) => (
    <label className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-[#4A5568]/15 bg-white px-2 py-1 text-[11px] font-medium text-[#4A5568]">
      <input
        type="checkbox"
        className="h-3.5 w-3.5"
        checked={isPartnerVisible(partnerName)}
        onChange={(event) => setPartnerVisible(partnerName, event.target.checked)}
        aria-label={`${isPartnerVisible(partnerName) ? 'Hide' : 'Show'} ${partnerName}`}
      />
      {isPartnerVisible(partnerName) ? 'Visible' : 'Hidden'}
    </label>
  );
  const projectPartnerNames = Array.from(new Set([
    ...project.partners,
    ...project.otherPossiblePartners,
    ...project.mostRelevantIcaPartners,
    ...partnerMatches.map((partner) => partner.name),
  ]));
  const hiddenProjectPartnerCount = projectPartnerNames.filter((partnerName) => !isPartnerVisible(partnerName)).length;
  const showAllProjectPartners = () => {
    setPartnerVisibility((current) => {
      const next = { ...current };
      projectPartnerNames.forEach((partnerName) => {
        next[partnerName] = true;
      });
      writePartnerVisibility(next);
      return next;
    });
  };
  const buildExpertDetailPath = (expertId: string) => `/search/experts/${encodeURIComponent(resolveExpertId(expertId))}`;
  const buildProjectDetailPath = (projectReference: string) => `${projectDetailBasePath}/${encodeURIComponent(resolveProjectId(projectReference))}`;
  const CV_UNLOCK_COST = 1;
  const getExpertPublicId = (expertId: string) => {
    const trailingDigits = expertId.match(/(\d+)$/)?.[1];
    return trailingDigits || expertId;
  };
  const hasCvAccess = (expertId: string) => purchasedCvExpertIds.has(expertId);
  const getExpertDisplayName = (expertId: string, expertName: string) => {
    if (hasCvAccess(expertId)) return expertName;
    return `Expert ${getExpertPublicId(expertId)}`;
  };
  const unlockExpertCv = (expertId: string) => {
    if (hasCvAccess(expertId)) return;

    if (availableCredits < CV_UNLOCK_COST) {
      toast.error('Not enough credits to unlock this CV.');
      return;
    }

    setAvailableCredits((prev) => prev - CV_UNLOCK_COST);
    setPurchasedCvExpertIds((prev) => new Set(prev).add(expertId));
    toast.success(`CV unlocked for Expert ${getExpertPublicId(expertId)}`);
  };

  const handleAddToMyProjects = () => {
    if (!project.id) return;

    const savedIds = new Set(readSavedProjectIds());
    savedIds.add(project.id);
    writeSavedProjectIds(Array.from(savedIds));
    addToPipeline(project.id);
    setIsProjectSaved(true);
    setProjectAccessSource('my-projects');
    toast.success(t('projects.matchingAI.addedToast'));
  };

  const handleRemoveFromMyProjects = () => {
    if (!project.id) return;

    const savedIds = new Set(readSavedProjectIds());
    savedIds.delete(project.id);
    writeSavedProjectIds(Array.from(savedIds));
    removeFromPipeline(project.id);
    setIsProjectSaved(false);
    setProjectAccessSource('my-alerts');
    toast.success('Project removed from My Projects');
  };

  const openProjectActionDialog = (action: 'add' | 'remove') => {
    setPendingProjectAction(action);
    setIsProjectActionDialogOpen(true);
  };

  const confirmProjectAction = () => {
    if (pendingProjectAction === 'add') {
      handleAddToMyProjects();
    } else {
      handleRemoveFromMyProjects();
    }
    setIsProjectActionDialogOpen(false);
  };

  const generateSectionResponse = (sectionKey: string) => {
    const sectionResponses: Record<string, string> = {
      experts: 'AI recommendation: Prioritize experts with direct education infrastructure delivery and strong donor compliance experience for a higher technical score.',
      bidWriters: 'AI recommendation: Assemble one strategic lead writer and one compliance-focused writer to strengthen clarity, structure, and scoring alignment.',
      partnerMatching: 'AI recommendation: Build your consortium around the two primary matches and use secondary matches as backup for local access and surge capacity.',
      similarProjects: 'AI recommendation: Reuse execution and reporting patterns from similar country projects to reduce delivery risk and improve proposal credibility.',
      predictiveInsights: 'AI recommendation: Win likelihood is competitive when consortium readiness remains above 80% and your differentiators are explicit in the technical narrative.',
      recommendations: 'AI recommendation: Review related opportunities now and save at least one adjacent project to support cross-reference positioning in your submission.',
    };

    setGeneratedResponses((prev) => ({
      ...prev,
      [sectionKey]: sectionResponses[sectionKey],
    }));
    toast.success(t('projects.matchingAI.generateToast'));
  };

  const generateRefProSections = (): RefProDescriptionSection[] => {
    const lifecycleSummary = lifecycleDocuments
      .map((document) => `${document.sectionLabel}: ${document.itemLabel}`)
      .join(' · ');

    const documentsSummary = projectDocuments
      .map((document) => `${document.name} (${document.type}, ${formatDate(document.datePublished)})`)
      .join(', ');

    return [
      {
        id: 'executive-overview',
        heading: t('projects.refPro.sections.executiveOverview'),
        paragraphs: [
          `${project.title} is structured as a high-priority ${formatLabel(project.type)} intervention in ${project.country}, focused on ${project.objectives.toLowerCase()}.`,
          `The intervention combines ToR objectives, implementation constraints, and measurable impact commitments to deliver a scalable and compliance-ready execution pathway over ${project.timeline.duration} months.`,
        ],
      },
      {
        id: 'scope-and-approach',
        heading: t('projects.refPro.sections.scopeAndApproach'),
        paragraphs: [
          `The technical scope covers ${project.description.toLowerCase()} Delivery phases are sequenced across ${lifecycleSummary} to reduce procurement risk and align with donor timing expectations.`,
          `The implementation approach prioritizes early mobilization, standards-based quality controls, and locally anchored execution partnerships to protect timeline and budget discipline.`,
        ],
      },
      {
        id: 'evidence-and-documents',
        heading: t('projects.refPro.sections.evidenceAndDocuments'),
        paragraphs: [
          `Reference materials informing this enhanced narrative include: ${documentsSummary}.`,
          `These documents provide sufficient coverage for technical packaging, consortium positioning, and downstream proposal artifacts such as workplans, staffing assumptions, and risk matrices.`,
        ],
      },
      {
        id: 'delivery-and-risk',
        heading: t('projects.refPro.sections.deliveryAndRisk'),
        paragraphs: [
          `Current delivery metrics indicate ${project.timeline.completionPercentage}% timeline completion with budget utilization at ${budgetUtilization}%, suggesting stable implementation momentum with controllable residual risk.`,
          `Primary execution risks remain concentrated around procurement lead times and multi-stakeholder coordination windows; mitigation should maintain rolling milestone reviews, escalation thresholds, and targeted partner accountability.`,
        ],
      },
      {
        id: 'expected-outcomes',
        heading: t('projects.refPro.sections.expectedOutcomes'),
        paragraphs: [
          `Expected outcomes include improved infrastructure readiness, stronger local service capacity, and measurable beneficiary reach consistent with project KPIs and donor reporting frameworks.`,
          `The proposed narrative can be directly reused as a baseline for executive summaries, methodology chapters, and technical annexes, then adapted per submission context without restarting content development.`,
        ],
      },
    ];
  };

  const handleGenerateRefProDescription = () => {
    if (!isProjectSaved) return;

    setIsGeneratingRefPro(true);

    window.setTimeout(() => {
      const generatedAt = new Date().toISOString();
      setRefProDraftSections(generateRefProSections());
      setRefProDraftGeneratedAt(generatedAt);
      setRefProCurrentVersionId(null);
      setIsGeneratingRefPro(false);
      toast.success(t('projects.refPro.generatedToast'));
    }, 750);
  };

  const handleSaveRefProDescription = () => {
    if (!refProDraftSections) return;

    const versionId = `refpro-${Date.now()}`;
    const versionNumber = refProHistory.length + 1;

    const newVersion: RefProVersionEntry = {
      id: versionId,
      createdAt: refProDraftGeneratedAt || new Date().toISOString(),
      label: `${t('projects.refPro.versionLabel')} ${versionNumber}`,
      sections: refProDraftSections,
    };

    setRefProHistory((previous) => [newVersion, ...previous].slice(0, 20));
    setRefProCurrentVersionId(versionId);
    setRefProDraftSections(null);
    setRefProDraftGeneratedAt(null);
    toast.success(t('projects.refPro.savedToast'));
  };

  const handleViewRefProVersion = (versionId: string) => {
    setRefProCurrentVersionId(versionId);
  };

  const handleDeleteRefProVersion = (versionId: string) => {
    if (!window.confirm(t('projects.refPro.deleteConfirm'))) {
      return;
    }

    setRefProHistory((previous) => {
      const updated = previous.filter((entry) => entry.id !== versionId);

      setRefProCurrentVersionId((current) => {
        if (current !== versionId) return current;
        return updated[0]?.id ?? null;
      });

      return updated;
    });
  };

  const generateTorSections = (): TorSection[] => {
    const startDateLabel = formatDate(project.timeline.startDate);
    const endDateLabel = formatDate(project.timeline.endDate);
    const sectorsLabel = (project.sectors && project.sectors.length > 0 ? project.sectors : [project.sector])
      .map(formatLabel)
      .join(', ');
    const subsectorsLabel = project.subsectors
      .map((subsector) => subsector.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()))
      .join(', ');
    const historySummary = torHistory.length > 0
      ? torHistory
          .slice(0, 5)
          .map((entry) => {
            const sourceLabel = entry.source === 'USER_UPLOADED' ? 'user uploaded' : 'AI generated';
            const sectionSummary = entry.sections?.map((section) => `${section.title}: ${section.content}`).join(' ');
            const documentContext = entry.extractedText || sectionSummary || entry.originalFileName;
            return `${entry.versionName} (${sourceLabel}, ${entry.originalFileName}): ${documentContext}`;
          })
          .join(' ')
      : 'No previous ToR documents are available yet.';
    const generatedInputSummary = Object.values(generatedResponses).filter(Boolean).join(' ');

    return [
      {
        id: 'tor-background',
        title: t('projects.torAI.sections.background'),
        content: `${project.title} is a ${formatLabel(project.type).toLowerCase()} intervention focused on ${project.description.toLowerCase()} The project is located in ${project.country} and funded by ${project.donor}, with ${project.leadOrganization} as lead organization. This version consolidates available project context with prior ToR history: ${historySummary}`,
      },
      {
        id: 'tor-objectives',
        title: t('projects.torAI.sections.objectives'),
        content: `The ToR aims to define implementation expectations, technical quality standards, governance approach, and measurable outcomes for the project. The core objective is to ${project.objectives.toLowerCase()} ${generatedInputSummary ? `Additional workspace inputs indicate: ${generatedInputSummary}` : ''}`,
      },
      {
        id: 'tor-scope',
        title: t('projects.torAI.sections.scope'),
        content: `Scope covers sector focus areas (${sectorsLabel}) and sub-sectors (${subsectorsLabel}), with activities planned across ${project.countries.join(', ')}. The implementation horizon runs from ${startDateLabel} to ${endDateLabel} (${project.timeline.duration} months).`,
      },
      {
        id: 'tor-deliverables',
        title: t('projects.torAI.sections.deliverables'),
        content: `Expected deliverables include inception and planning documents, phased technical outputs, milestone progress reports, quality and compliance evidence, and final delivery documentation aligned with donor requirements.`,
      },
      {
        id: 'tor-governance',
        title: t('projects.torAI.sections.governanceAndReporting'),
        content: `Governance should include a clear project management structure led by ${project.projectManager}, technical oversight by ${project.technicalLead}, periodic stakeholder coordination, and KPI-based reporting cadence for donor and partner accountability.`,
      },
      {
        id: 'tor-budget',
        title: t('projects.torAI.sections.budgetAndTimeline'),
        content: `Total budget is ${project.budget.total.toLocaleString()} ${project.budget.currency}, with ${project.budget.spent.toLocaleString()} ${project.budget.currency} already spent and ${project.budget.remaining.toLocaleString()} ${project.budget.currency} remaining. Resource planning should maintain delivery quality while controlling timeline and budget risk.`,
      },
    ];
  };

  const handleGenerateTor = () => {
    if (!isProjectSaved) return;

    setIsGeneratingTor(true);

    window.setTimeout(() => {
      const generatedAt = new Date().toISOString();
      const generatedSections = generateTorSections();
      const versionNumber = torHistory.length + 1;
      const versionName = `${t('projects.torAI.versionLabel')} ${versionNumber}`;
      const originalFileName = `${project.title.replace(/\s+/g, '_')}_ToR_${versionNumber}.txt`;
      const plainText = buildTorPlainText(generatedSections);
      const versionId = `tor-${Date.now()}`;
      const newVersion: TorHistoryEntry = {
        id: versionId,
        projectId: id || project.id || 'project',
        createdAt: generatedAt,
        versionName,
        originalFileName,
        fileType: 'txt',
        source: 'AI_GENERATED',
        fileUrl: `data:text/plain;charset=utf-8,${encodeURIComponent(plainText)}`,
        extractedText: plainText,
        sections: generatedSections,
      };

      setTorHistory((previous) => [newVersion, ...previous].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 20));
      setTorDraftSections(null);
      setTorDraftGeneratedAt(null);
      setTorCurrentVersionId(versionId);
      setIsTorEditMode(false);
      setIsGeneratingTor(false);
      toast.success(t('projects.torAI.generatedToast'));
    }, 800);
  };

  const handleSaveTor = () => {
    if (!torDraftSections) return;

    const versionId = `tor-${Date.now()}`;
    const versionNumber = torHistory.length + 1;
    const versionName = `${t('projects.torAI.versionLabel')} ${versionNumber}`;
    const originalFileName = `${project.title.replace(/\s+/g, '_')}_ToR_${versionNumber}.txt`;
    const plainText = buildTorPlainText(torDraftSections);

    const newVersion: TorHistoryEntry = {
      id: versionId,
      projectId: id || project.id || 'project',
      createdAt: torDraftGeneratedAt || new Date().toISOString(),
      versionName,
      originalFileName,
      fileType: 'txt',
      source: 'AI_GENERATED',
      fileUrl: `data:text/plain;charset=utf-8,${encodeURIComponent(plainText)}`,
      extractedText: plainText,
      sections: torDraftSections,
    };

    setTorHistory((previous) => [newVersion, ...previous].slice(0, 20));
    setTorCurrentVersionId(versionId);
    setTorDraftSections(null);
    setTorDraftGeneratedAt(null);
    setIsTorEditMode(false);
    toast.success(t('projects.torAI.savedToast'));
  };

  const handleViewTorVersion = (versionId: string) => {
    setTorCurrentVersionId(versionId);
    setIsTorEditMode(false);
  };

  const handleDeleteTorVersion = (versionId: string) => {
    if (!window.confirm(t('projects.torAI.deleteConfirm'))) {
      return;
    }

    setTorHistory((previous) => {
      const updated = previous.filter((entry) => entry.id !== versionId);

      setTorCurrentVersionId((current) => {
        if (current !== versionId) return current;
        return updated[0]?.id ?? null;
      });

      return updated;
    });
  };

  const handleReuseTorVersion = (versionId: string) => {
    const selected = torHistory.find((entry) => entry.id === versionId);
    if (!selected?.sections) return;

    setTorDraftSections(selected.sections.map((section) => ({ ...section })));
    setTorDraftGeneratedAt(new Date().toISOString());
    setTorCurrentVersionId(null);
    setIsTorEditMode(false);
    toast.success(t('projects.torAI.reusedToast'));
  };

  const handleEditTor = () => {
    if (!displayedTorSections) return;
    setTorDraftSections(displayedTorSections.map((section) => ({ ...section })));
    setTorDraftGeneratedAt(new Date().toISOString());
    setTorCurrentVersionId(null);
    setIsTorEditMode(true);
  };

  const handleUpdateTorSection = (sectionId: string, value: string) => {
    setTorDraftSections((previous) => {
      if (!previous) return previous;
      return previous.map((section) => (section.id === sectionId ? { ...section, content: value } : section));
    });
  };

  const buildTorPlainText = (sections: TorSection[]) => {
    return sections.map((section) => `${section.title}\n\n${section.content}`).join('\n\n---\n\n');
  };

  const handleCopyTor = async () => {
    if (!displayedTorSections) return;
    try {
      await navigator.clipboard.writeText(buildTorPlainText(displayedTorSections));
      toast.success(t('projects.torAI.copyToast'));
    } catch (error) {
      toast.error(t('projects.torAI.copyErrorToast'));
    }
  };

  const handleDownloadTor = () => {
    const activeUploadedTor = activeSavedTorVersion && !activeSavedTorVersion.sections ? activeSavedTorVersion : null;
    if (activeUploadedTor) {
      const link = document.createElement('a');
      link.href = activeUploadedTor.fileUrl;
      link.download = activeUploadedTor.originalFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    if (!displayedTorSections) return;

    const fileName = `${project.title.replace(/\s+/g, '_')}_ToR.txt`;
    const blob = new Blob([buildTorPlainText(displayedTorSections)], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const isAllowedTorFile = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '',
    ];

    return Boolean(extension && allowedExtensions.includes(extension) && allowedMimeTypes.includes(file.type));
  };

  const resetTorUploadForm = () => {
    setTorUploadVersionName('');
    setTorUploadFile(null);
    setTorUploadError('');
  };

  const handleOpenTorUploadDialog = () => {
    resetTorUploadForm();
    setIsTorUploadDialogOpen(true);
  };

  const handleUploadTor = () => {
    const versionName = torUploadVersionName.trim();

    if (!versionName) {
      setTorUploadError('Enter a version name before uploading.');
      return;
    }

    if (!torUploadFile) {
      setTorUploadError('Choose a .pdf, .doc, or .docx file.');
      return;
    }

    if (!isAllowedTorFile(torUploadFile)) {
      setTorUploadError('Only .pdf, .doc, and .docx files are accepted.');
      return;
    }

    setIsUploadingTor(true);
    setTorUploadError('');

    const reader = new FileReader();
    reader.onload = () => {
      const fileUrl = typeof reader.result === 'string' ? reader.result : '';
      const extension = torUploadFile.name.split('.').pop()?.toLowerCase() || torUploadFile.type || 'file';
      const newEntry: TorHistoryEntry = {
        id: `tor-upload-${Date.now()}`,
        projectId: id || project.id || 'project',
        versionName,
        originalFileName: torUploadFile.name,
        fileType: extension,
        source: 'USER_UPLOADED',
        createdAt: new Date().toISOString(),
        fileUrl,
      };

      setTorHistory((previous) => [newEntry, ...previous].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 20));
      setTorCurrentVersionId(newEntry.id);
      setTorDraftSections(null);
      setTorDraftGeneratedAt(null);
      setIsTorEditMode(false);
      setIsUploadingTor(false);
      setIsTorUploadDialogOpen(false);
      resetTorUploadForm();
      toast.success('ToR uploaded to history.');
    };
    reader.onerror = () => {
      setIsUploadingTor(false);
      setTorUploadError('Unable to read this file. Please try another document.');
    };
    reader.readAsDataURL(torUploadFile);
  };

  const latestRefProVersion = refProHistory[0] ?? null;
  const activeSavedRefProVersion = refProHistory.find((entry) => entry.id === refProCurrentVersionId) ?? latestRefProVersion;
  const hasDraftRefProPreview = Boolean(refProDraftSections) && refProCurrentVersionId === null;
  const displayedRefProSections = hasDraftRefProPreview ? refProDraftSections : activeSavedRefProVersion?.sections;
  const viewingOldRefProVersion = Boolean(
    !hasDraftRefProPreview &&
    activeSavedRefProVersion &&
    latestRefProVersion &&
    activeSavedRefProVersion.id !== latestRefProVersion.id
  );
  const latestTorVersion = torHistory[0] ?? null;
  const activeSavedTorVersion = torHistory.find((entry) => entry.id === torCurrentVersionId) ?? latestTorVersion;
  const hasTorDraftPreview = Boolean(torDraftSections) && torCurrentVersionId === null;
  const displayedTorSections = hasTorDraftPreview ? torDraftSections : activeSavedTorVersion?.sections;
  const viewingOldTorVersion = Boolean(
    !hasTorDraftPreview &&
    activeSavedTorVersion &&
    latestTorVersion &&
    activeSavedTorVersion.id !== latestTorVersion.id
  );

  const downloadProjectDocument = (doc: ProjectDocument) => {
    const fileName = `${doc.name.replace(/\s+/g, '_')}.pdf`;
    const fileContent = `Document name: ${doc.name}\nType: ${doc.type}\nPublished: ${doc.datePublished}`;
    const blob = new Blob([fileContent], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const downloadExpertCv = (expertId: string, expertName: string, format: 'pdf' | 'docx') => {
    if (!hasCvAccess(expertId)) return;
    const safeName = expertName.replace(/\s+/g, '_');
    const extension = format === 'pdf' ? 'pdf' : 'docx';
    const mimeType = format === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const content = `CV – ${expertName}\nFormat: ${format.toUpperCase()}\nGenerated: ${new Date().toISOString()}`;
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CV_${safeName}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const hasAssignedMember = (task: (typeof projectTasks)[number]) =>
    Boolean(task.assignedTo?.some((member) => member.id !== 'unassigned'));

  const openTaskAssignmentDialog = (task: (typeof projectTasks)[number]) => {
    setTaskToAssign(task);
    setSelectedTaskMemberId(task.assignedTo[0]?.id || '');
  };

  const handleAssignTaskToMember = () => {
    if (!taskToAssign || !selectedTaskMemberId) return;

    const member = assignmentMembers.find((item) => item.id === selectedTaskMemberId);
    if (!member) return;

    setProjectTasks((prev) =>
      prev.map((task) =>
        task.id === taskToAssign.id ? { ...task, assignedTo: [member] } : task
      )
    );
    setTaskToAssign(null);
    setSelectedTaskMemberId('');
    toast.success(t('projects.tasks.memberAssigned'));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        title={
          showPipelineContext
            ? t('pipeline.title')
            : showAlertsHeader
            ? t('activeTenders.title')
            : isSearchContext
            ? t(`search.section.${searchSection}.title`)
            : t('projects.submenu.active')
        }
        description={
          showPipelineContext
            ? t('pipeline.subtitle')
            : showAlertsHeader
            ? t('activeTenders.subtitle')
            : isSearchContext
            ? t(`search.section.${searchSection}.description`)
            : t('projects.active.subtitle')
        }
        icon={showPipelineContext ? Target : isSearchContext ? Search : Briefcase}
        stats={
          showPipelineContext || showAlertsHeader || isSearchContext
            ? undefined
            : [{ value: kpis.activeProjects.toString(), label: t('projects.stats.activeProjects') }]
        }
      />

      {isSearchContext ? <SearchSectionTabs activeTab={searchSection} /> : showAlertsHeader ? <TendersSubMenu /> : <ProjectsSubMenu />}

      <PageContainer className="my-6">
        <main role="main" className="px-4 sm:px-5 lg:px-6 py-6">
          <Dialog open={isProjectActionDialogOpen} onOpenChange={setIsProjectActionDialogOpen}>
            <DialogContent className="max-w-lg w-full">
              <DialogHeader>
                <DialogTitle>{pendingProjectAction === 'add' ? 'Add To My Projects?' : 'Remove From My Projects?'}</DialogTitle>
                <DialogDescription>
                  {pendingProjectAction === 'add'
                    ? 'Add this project to My Projects to unlock the AI workspace and actively work on partners, documents, and proposal strategy.'
                    : 'Remove this project from My Projects? You can add it again anytime from Project Details.'}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsProjectActionDialogOpen(false)}>Cancel</Button>
                <Button onClick={confirmProjectAction}>
                  {pendingProjectAction === 'add' ? 'Confirm Add' : 'Confirm Remove'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <section
            className={`mb-6 overflow-hidden rounded-2xl border p-6 shadow-sm ${
              isProjectSaved
                ? 'border-[#4A5568]/25 bg-gradient-to-r from-[#EEF2F7] via-white to-[#F5F7FA]'
                : 'border-[#E63462]/25 bg-gradient-to-r from-[#FFF1F4] via-white to-[#F7FAFC]'
            }`}
          >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <div
                    className={`mb-3 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm font-medium ${
                      isProjectSaved
                        ? 'border-[#4A5568]/25 text-[#4A5568]'
                        : 'border-[#E63462]/25 text-[#E63462]'
                    }`}
                  >
                    {isProjectSaved ? <CheckCircle className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                    {isProjectSaved ? 'In My Projects' : t('projects.matchingAI.previewBadge')}
                  </div>
                  <h2 className="text-2xl font-semibold text-[#4A5568]">
                    {isProjectSaved ? 'Project Workspace Ready' : t('projects.matchingAI.addToProjects')}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#4A5568]/85">
                    {isProjectSaved
                      ? 'This project is in My Projects. Use the AI workspace to continue working on matching, planning, and proposal execution.'
                      : 'Add this project to My Projects to open the AI workspace and work directly on matching, planning, and proposal execution.'}
                  </p>
                </div>
                <Button
                  className={`min-h-11 gap-2 self-start lg:self-center ${
                    isProjectSaved ? 'bg-[#4A5568] text-white hover:bg-[#3F4859]' : 'bg-[#E63462] text-white hover:bg-[#D42F5A]'
                  }`}
                  onClick={() => openProjectActionDialog(isProjectSaved ? 'remove' : 'add')}
                >
                  {isProjectSaved ? 'Remove from My Projects' : t('projects.matchingAI.addToProjects')}
                  {isProjectSaved ? <Trash2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
            </section>

          <section aria-label="Project summary" className="rounded-lg border bg-white p-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-4xl">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className={`px-3 py-1 ${isProjectClosed ? 'border-slate-300 bg-slate-100 text-slate-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                      {projectOpenClosedLabel}
                    </Badge>
                    <Badge variant="outline" className={`${getPriorityColor(project.priority)} px-3 py-1`}>
                      {t(`projects.priority.${project.priority}`)}
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1">{t(`projects.type.${project.type}`)}</Badge>
                    <Badge variant="secondary" className="px-3 py-1">{t(`projects.create.scope.${project.scope}`)}</Badge>
                  </div>
                  <h1 className="text-2xl font-bold leading-tight text-primary sm:text-3xl">{project.title}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">{project.code}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-6 space-y-6">
            <div className="space-y-6">
              <section id="project-overview-card" aria-labelledby="project-overview-heading" className="rounded-lg border bg-white p-6" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                <div className="mb-4 flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-[#E63462]" />
                  <h2 id="project-overview-heading" className="text-lg font-bold text-[#1E293B]">{t('projects.details.overview')}</h2>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <article className="rounded-xl border bg-[#F8FAFC] p-4 shadow-sm" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                      <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] text-[#4A5568]"><FileText className="h-3.5 w-3.5 text-[#E63462]" aria-hidden />Published</p>
                      <p className="mt-2 text-sm font-semibold text-[#1E293B]">{formatDate(project.timeline.startDate)}</p>
                    </article>
                    <article className="rounded-xl border bg-[#F8FAFC] p-4 shadow-sm" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                      <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] text-[#4A5568]"><Target className="h-3.5 w-3.5 text-[#E63462]" aria-hidden />Deadline</p>
                      <p className="mt-2 text-sm font-semibold text-[#1E293B]">{formatDate(project.timeline.endDate)}</p>
                    </article>
                    <article className="rounded-xl border bg-[#F8FAFC] p-4 shadow-sm" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                      <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] text-[#4A5568]"><DollarSign className="h-3.5 w-3.5 text-[#E63462]" aria-hidden />Budget</p>
                      <p className="mt-2 text-sm font-semibold text-[#1E293B]">{project.budget.total.toLocaleString()} {project.budget.currency}</p>
                    </article>
                    <article className="rounded-xl border bg-[#F8FAFC] p-4 shadow-sm" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                      <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] text-[#4A5568]"><TrendingUp className="h-3.5 w-3.5 text-[#E63462]" aria-hidden />Total Cost</p>
                      <p className="mt-2 text-sm font-semibold text-[#1E293B]">${project.budget.spent.toLocaleString()}</p>
                    </article>
                  </div>

                <div className="mt-4 h-0.5 w-full bg-gradient-to-r from-[#4A5568]/20 via-[#E63462]/25 to-transparent" />

                <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <div className="space-y-4 rounded-xl border bg-white p-4" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] text-[#4A5568]"><Briefcase className="h-3.5 w-3.5 text-[#E63462]" aria-hidden />Procurement Type</p>
                          <p className="mt-1 text-sm font-semibold text-[#1E293B]">{t(`projects.type.${project.type}`)}</p>
                        </div>
                        <div>
                          <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] text-[#4A5568]"><FileText className="h-3.5 w-3.5 text-[#E63462]" aria-hidden />{t('projects.create.projectSource')}</p>
                          <p className="mt-1 text-sm font-semibold text-[#1E293B]">{t(`projects.create.source.${project.projectSource}`)}</p>
                        </div>
                        <div>
                          <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] text-[#4A5568]"><FileText className="h-3.5 w-3.5 text-[#E63462]" aria-hidden />Reference</p>
                          <p className="mt-1 text-sm font-semibold text-[#1E293B]">{project.code}</p>
                        </div>
                        <div>
                          <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] text-[#4A5568]"><Target className="h-3.5 w-3.5 text-[#E63462]" aria-hidden />{t('projects.create.relatedTender')}</p>
                          <p className="mt-1 text-sm font-semibold text-[#1E293B]">{project.relatedTender}</p>
                        </div>
                      </div>

                      <div>
                        <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] text-[#4A5568]"><Building2 className="h-3.5 w-3.5 text-[#E63462]" aria-hidden />{t('projects.create.leadOrganization')}</p>
                        <p className="mt-1 text-sm font-semibold text-[#1E293B]">{project.leadOrganization}</p>
                      </div>

                      <div>
                        <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] text-[#4A5568]"><Building2 className="h-3.5 w-3.5 text-[#E63462]" aria-hidden />Funding Agency</p>
                        <p className="mt-1 text-sm font-semibold text-[#1E293B]">{project.donor}</p>
                      </div>

                      <div>
                        <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] text-[#4A5568]"><MapPin className="h-3.5 w-3.5 text-[#E63462]" aria-hidden />Countries</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {project.countries.map((country) => (
                            <Badge key={country} variant="outline" className="border-[#4A5568]/20 bg-[#F8FAFC] text-[#1E293B]">
                              {country}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-xl border bg-white p-4" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                      <div>
                        <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] text-[#4A5568]"><Target className="h-3.5 w-3.5 text-[#E63462]" aria-hidden />Sectors</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(project.sectors && project.sectors.length > 0 ? project.sectors : [project.sector]).map((sector) => (
                            <Badge key={sector} variant="outline" className="border-[#4A5568]/20 bg-[#F8FAFC] text-[#1E293B]">
                              {formatLabel(sector)}
                            </Badge>
                          ))}
                        </div>
                        <ul className="mt-2 space-y-1 text-sm text-[#4A5568]/90">
                          {project.subsectors.map((subsector) => (
                            <li key={subsector} className="flex items-start gap-2">
                              <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#E63462' }} />
                              <span className="text-[#1E293B]">{subsector.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-2xl border p-4" style={{ borderColor: 'rgba(0, 0, 0, 0.1)', background: '#F8FAFC' }}>
                        <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] text-[#4A5568]"><FileText className="h-3.5 w-3.5 text-[#E63462]" aria-hidden />{t('projects.create.projectObjectives')}</p>
                        <p className="mt-2 text-sm leading-relaxed text-[#1E293B]">{project.objectives}</p>
                      </div>

                      <div className="rounded-2xl border p-4" style={{ borderColor: 'rgba(0, 0, 0, 0.1)', background: '#FFFFFF' }}>
                        <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] text-[#4A5568]"><Users className="h-3.5 w-3.5 text-[#E63462]" aria-hidden />{t('projects.create.partnerOrganizations')}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {project.partners.filter(isPartnerVisible).map((partner) => (
                            <div key={partner} className="inline-flex items-center gap-1.5">
                              <Link to={buildOrganizationDetailPath(partner)} className="inline-flex">
                                <Badge variant="secondary" className="cursor-pointer border-[#4A5568]/15 bg-white text-[#1E293B] transition-colors hover:border-[#E63462]/30 hover:bg-[#E63462]/10 hover:text-[#E63462]">
                                  {partner}
                                </Badge>
                              </Link>
                              {renderPartnerVisibilityToggle(partner)}
                            </div>
                          ))}
                          {hiddenProjectPartnerCount > 0 && (
                            <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={showAllProjectPartners}>
                              Show all partners ({hiddenProjectPartnerCount} hidden)
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border p-4" style={{ borderColor: 'rgba(0, 0, 0, 0.1)', background: '#F8FAFC' }}>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="border-[#E63462]/30 bg-[#E63462]/10 text-[#E63462] text-[11px]">
                            Technical
                          </Badge>
                          <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] text-[#4A5568]"><Users className="h-3.5 w-3.5 text-[#E63462]" aria-hidden />Most Relevant Technical Partners</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {project.otherPossiblePartners.filter(isPartnerVisible).map((partner) => (
                            <div key={partner} className="inline-flex items-center gap-1.5">
                              <Link to={buildOrganizationDetailPath(partner)} className="inline-flex">
                                <Badge variant="secondary" className="cursor-pointer border-[#4A5568]/15 bg-white text-[#1E293B] transition-colors hover:border-[#E63462]/30 hover:bg-[#E63462]/10 hover:text-[#E63462]">
                                  {partner}
                                </Badge>
                              </Link>
                              {renderPartnerVisibilityToggle(partner)}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border p-4" style={{ borderColor: 'rgba(0, 0, 0, 0.1)', background: '#FFFFFF' }}>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="border-[#4A5568]/30 bg-[#4A5568]/10 text-[#4A5568] text-[11px]">
                            ICA
                          </Badge>
                          <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.08em] text-[#4A5568]"><Users className="h-3.5 w-3.5 text-[#E63462]" aria-hidden />Most Relevant Matching ICA Partners</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {project.mostRelevantIcaPartners.filter(isPartnerVisible).map((partner) => (
                            <div key={partner} className="inline-flex items-center gap-1.5">
                              <Link to={buildOrganizationDetailPath(partner)} className="inline-flex">
                                <Badge variant="secondary" className="cursor-pointer border-[#4A5568]/15 bg-white text-[#1E293B] transition-colors hover:border-[#E63462]/30 hover:bg-[#E63462]/10 hover:text-[#E63462]">
                                  {partner}
                                </Badge>
                              </Link>
                              {renderPartnerVisibilityToggle(partner)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
              </section>

              <section id="project-lifecycle-card" className="rounded-lg border bg-white p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Route className="h-5 w-5 text-[#E63462]" />
                  <h2 className="text-lg font-bold text-primary">Project Lifecycle</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_1fr]">
                  <nav aria-label="Project lifecycle navigation" className="space-y-4 rounded-lg border bg-slate-50 p-3">
                    {[
                      { key: 'early-intelligence' as const, title: 'Early Intelligence', items: lifecycleDocuments.filter((doc) => doc.group === 'early-intelligence') },
                      { key: 'open-procurement' as const, title: 'Open Procurement', items: lifecycleDocuments.filter((doc) => doc.group === 'open-procurement') },
                      { key: 'contract-shortlist' as const, title: 'Contract / Shortlist', items: lifecycleDocuments.filter((doc) => doc.group === 'contract-shortlist') },
                    ].map((section) => (
                      <div key={section.key}>
                        <p className="mb-2 text-xs font-semibold capitalize tracking-[0.08em] text-muted-foreground">{section.title}</p>
                        <div className="space-y-1">
                          {section.items.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              aria-pressed={activeLifecycleDocId === item.id}
                              onClick={() => {
                                setActiveLifecycleDocId(item.id);
                                setActiveDetailTab('overview');
                              }}
                              className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
                                activeLifecycleDocId === item.id
                                  ? 'border-accent/20 bg-secondary text-accent'
                                  : 'bg-white hover:bg-gray-50'
                              }`}
                            >
                              {item.itemLabel}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </nav>

                  <div className="rounded-lg border p-4">
                    <p className="text-xs capitalize tracking-[0.08em] text-muted-foreground">{activeLifecycleDoc.sectionLabel}</p>
                    <h3 className="mt-1 text-base font-semibold text-primary">{activeLifecycleDoc.itemLabel}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{activeLifecycleDoc.description}</p>

                    {activeLifecycleDoc.hasShortlist && (
                      <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/60 p-3">
                        <p className="mb-2 text-sm font-semibold text-primary">Shortlisted Companies / Organizations</p>
                        <div className="space-y-2">
                          {project.shortlistedCompanies.map((item, index) => (
                            <div key={index} className="rounded-md border bg-white p-3 text-sm">
                              <div className="flex items-center justify-between gap-2">
                                <Link to={buildOrganizationDetailPath(item.name)} className="font-semibold text-primary underline-offset-2 hover:text-accent hover:underline">
                                  {item.name}
                                </Link>
                                {renderOrganizationBookmarkButton(item.name)}
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">Shortlisted on: {formatDate(item.date)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeLifecycleDoc.hasContract && (
                      <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
                        <p className="mb-2 text-sm font-semibold text-primary">Contract Awarded Companies</p>
                        <div className="space-y-2">
                          {project.contractAwardedCompanies.map((item, index) => (
                            <div key={index} className="rounded-md border bg-white p-3 text-sm">
                              <div className="flex items-center justify-between gap-2">
                                <Link to={buildOrganizationDetailPath(item.name)} className="font-semibold text-primary underline-offset-2 hover:text-accent hover:underline">
                                  {item.name}
                                </Link>
                                {renderOrganizationBookmarkButton(item.name)}
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                <span>Date: {formatDate(item.date)}</span>
                                <span>Budget: {item.budget}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section id="project-market-analysis-card" className="rounded-lg border bg-white p-6">
                <Tabs value={activeDetailTab} onValueChange={setActiveDetailTab}>
                  <TabsList className="mb-4 h-auto w-fit flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1" aria-label="Project detail tabs">
                    <TabsTrigger value="overview" className="h-auto flex-none rounded-lg border-0 bg-transparent px-6 py-2.5 text-sm font-bold text-slate-700 shadow-none transition-all hover:bg-accent hover:text-white data-[state=active]:bg-white data-[state=active]:text-accent data-[state=active]:shadow-sm">
                      <span className="inline-flex items-center gap-2">
                        <Landmark className="h-4 w-4" aria-hidden />
                        {t('projects.details.overview')}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="tasks" className="h-auto flex-none rounded-lg border-0 bg-transparent px-6 py-2.5 text-sm font-bold text-slate-700 shadow-none transition-all hover:bg-accent hover:text-white data-[state=active]:bg-white data-[state=active]:text-accent data-[state=active]:shadow-sm">
                      <span className="inline-flex items-center gap-2"><CheckCircle className="h-4 w-4" aria-hidden />{t('projects.details.tasks')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="team-members" className="h-auto flex-none rounded-lg border-0 bg-transparent px-6 py-2.5 text-sm font-bold text-slate-700 shadow-none transition-all hover:bg-accent hover:text-white data-[state=active]:bg-white data-[state=active]:text-accent data-[state=active]:shadow-sm">
                      <span className="inline-flex items-center gap-2"><Users className="h-4 w-4" aria-hidden />{t('projects.details.teamMembers')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="h-auto flex-none rounded-lg border-0 bg-transparent px-6 py-2.5 text-sm font-bold text-slate-700 shadow-none transition-all hover:bg-accent hover:text-white data-[state=active]:bg-white data-[state=active]:text-accent data-[state=active]:shadow-sm"><span className="inline-flex items-center gap-2"><FileText className="h-4 w-4" aria-hidden />{t('projects.details.documents')}</span></TabsTrigger>
                    <TabsTrigger value="market-analysis" className="h-auto flex-none rounded-lg border-0 bg-transparent px-6 py-2.5 text-sm font-bold text-slate-700 shadow-none transition-all hover:bg-accent hover:text-white data-[state=active]:bg-white data-[state=active]:text-accent data-[state=active]:shadow-sm">
                      <span className="inline-flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" aria-hidden />
                        {t('projects.details.tabs.marketAnalysis')}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="matching-ai" className="h-auto flex-none rounded-lg border-0 bg-transparent px-6 py-2.5 text-sm font-bold text-slate-700 shadow-none transition-all hover:bg-accent hover:text-white data-[state=active]:bg-white data-[state=active]:text-accent data-[state=active]:shadow-sm">
                      <span className="inline-flex items-center gap-2">
                        <Sparkles className="h-4 w-4" aria-hidden />
                        Matching AI
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="ref-pro" className="h-auto flex-none rounded-lg border-0 bg-transparent px-6 py-2.5 text-sm font-bold text-slate-700 shadow-none transition-all hover:bg-accent hover:text-white data-[state=active]:bg-white data-[state=active]:text-accent data-[state=active]:shadow-sm">
                      <span className="inline-flex items-center gap-2">
                        <WandSparkles className="h-4 w-4" aria-hidden />
                        {t('projects.details.tabs.refPro')}
                      </span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-0">
                    <h3 className="text-base font-semibold text-primary">{t('common.description')}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{activeLifecycleDoc.sectionLabel} · {activeLifecycleDoc.itemLabel}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{activeLifecycleDoc.description}</p>

                  </TabsContent>

                  <TabsContent value="market-analysis" className="mt-0">
                    {isAlertsContext && (
                      <Alert className="mb-4 border-amber-200 bg-white/85 text-amber-900">
                        <Lock className="h-4 w-4 text-amber-700" />
                        <AlertDescription>{t('projects.marketAnalysis.lockedMessage')}</AlertDescription>
                      </Alert>
                    )}
                    {!isAlertsContext && (
                    <div className="rounded-2xl border border-[#4A5568]/15 bg-gradient-to-br from-[#F5F7FA] via-white to-[#FFF1F4] p-4 sm:p-5">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-[#E63462]" />
                          <h3 className="text-base font-semibold text-[#4A5568]">{t('projects.details.tabs.marketAnalysis')}</h3>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#E63462]/20 bg-white px-3 py-1 text-xs font-semibold text-[#4A5568]">
                          <Coins className="h-3.5 w-3.5 text-[#E63462]" />
                          Credits: {availableCredits}
                        </div>
                      </div>

                      <Accordion type="multiple" className="w-full space-y-3">
                      <AccordionItem value="similar-contracts" className="rounded-xl border border-[#4A5568]/15 bg-white px-3">
                        <AccordionTrigger>
                          <span className="inline-flex items-center gap-2 text-[#4A5568]">
                            <Briefcase className="h-4 w-4 text-[#E63462]" />
                            {t('projects.details.tabs.similarContracts')}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {similarContracts.map((item) => (
                              <div key={item.id} className="rounded-xl border border-[#4A5568]/15 bg-[#F8FAFC] p-3">
                                <Link to={buildProjectDetailPath(item.projectName)} className="text-sm font-medium text-[#4A5568] underline-offset-2 hover:text-[#E63462] hover:underline">{item.projectName}</Link>
                                <div className="mt-1 flex items-center gap-2 text-xs text-[#4A5568]/80">
                                  <span>Donor:</span>
                                  <Link to={buildOrganizationDetailPath(item.donor)} className="font-medium text-[#4A5568] underline-offset-2 hover:text-[#E63462] hover:underline">{item.donor}</Link>
                                  {renderOrganizationBookmarkButton(item.donor)}
                                </div>
                                <p className="text-xs text-[#4A5568]/80">Budget: {item.budget}</p>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="top-companies" className="rounded-xl border border-[#4A5568]/15 bg-white px-3">
                        <AccordionTrigger>
                          <span className="inline-flex items-center gap-2 text-[#4A5568]">
                            <Building2 className="h-4 w-4 text-[#E63462]" />
                            {t('projects.details.tabs.topCompanies')}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {topCompanies.map((company) => (
                              <div key={company.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#4A5568]/15 bg-[#F8FAFC] p-3">
                                <div className="flex items-center gap-2">
                                  <Link to={buildOrganizationDetailPath(company.name)} className="text-sm font-medium text-[#4A5568] underline-offset-2 hover:text-[#E63462] hover:underline">{company.name}</Link>
                                  {renderOrganizationBookmarkButton(company.name)}
                                </div>
                                <p className="text-xs text-right text-[#4A5568]/80">{company.count} contracts/shortlists</p>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="local-companies" className="rounded-xl border border-[#4A5568]/15 bg-white px-3">
                        <AccordionTrigger>
                          <span className="inline-flex items-center gap-2 text-[#4A5568]">
                            <MapPin className="h-4 w-4 text-[#E63462]" />
                            {t('projects.details.tabs.localCompanies')}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {localCompanies.map((company) => (
                              <div key={company.id} className="rounded-xl border border-[#4A5568]/15 bg-[#F8FAFC] p-3">
                                <div className="flex items-center gap-2">
                                  <Link to={buildOrganizationDetailPath(company.name)} className="text-sm font-medium text-[#4A5568] underline-offset-2 hover:text-[#E63462] hover:underline">{company.name}</Link>
                                  {renderOrganizationBookmarkButton(company.name)}
                                </div>
                                <p className="text-xs text-[#4A5568]/80">{company.info}</p>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="top-experts" className="rounded-xl border border-[#4A5568]/15 bg-white px-3">
                        <AccordionTrigger>
                          <span className="inline-flex items-center gap-2 text-[#4A5568]">
                            <UserCircle className="h-4 w-4 text-[#E63462]" />
                            {t('projects.details.tabs.topExperts')}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {topExperts.map((expert) => (
                              <div key={expert.id} className="rounded-xl border border-[#4A5568]/15 bg-[#F8FAFC] p-3">
                                <div className="flex items-center justify-between gap-2">
                                  {hasCvAccess(expert.id) ? (
                                    <Link to={buildExpertDetailPath(expert.id)} className="text-sm font-medium text-[#4A5568] underline-offset-2 hover:text-[#E63462] hover:underline">{getExpertDisplayName(expert.id, expert.name)}</Link>
                                  ) : (
                                    <p className="text-sm font-medium text-[#4A5568]">{getExpertDisplayName(expert.id, expert.name)}</p>
                                  )}
                                  {!hasCvAccess(expert.id) && <Badge variant="outline" className="border-[#E63462]/30 bg-[#E63462]/10 text-[#E63462]">CV Locked</Badge>}
                                </div>
                                <p className="text-xs text-[#4A5568]/80">{expert.profession}</p>
                                <p className="text-xs text-[#4A5568]/80">Seniority: {expert.seniority}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {hasCvAccess(expert.id) ? (
                                    <>
                                      <Button size="sm" variant="outline" asChild>
                                        <Link to={buildExpertDetailPath(expert.id)}>View Profile</Link>
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => downloadExpertCv(expert.id, expert.name, 'pdf')}>
                                        <Download className="mr-1.5 h-4 w-4" />PDF
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => downloadExpertCv(expert.id, expert.name, 'docx')}>
                                        <Download className="mr-1.5 h-4 w-4" />DOCX
                                      </Button>
                                    </>
                                  ) : (
                                    <Button size="sm" variant="outline" className="border-[#E63462]/30 text-[#E63462] hover:bg-[#FFF1F4]" onClick={() => unlockExpertCv(expert.id)} disabled={availableCredits < CV_UNLOCK_COST}>
                                      <Coins className="mr-2 h-4 w-4" />Unlock CV ({CV_UNLOCK_COST})
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    </div>
                    )}
                  </TabsContent>

                  <TabsContent value="ref-pro" className="mt-0">
                    {!isProjectSaved ? (
                      <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-full bg-amber-100 p-2 text-amber-700">
                            <Lock className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-base font-semibold text-[#4A5568]">{t('projects.refPro.lockedTitle')}</p>
                            <p className="mt-1 text-sm leading-relaxed text-[#4A5568]/85">{t('projects.refPro.lockedMessage')}</p>
                            <Button className="mt-4 bg-[#E63462] text-white hover:bg-[#D42F5A]" onClick={() => openProjectActionDialog('add')}>
                              <Plus className="mr-2 h-4 w-4" />
                              {t('projects.matchingAI.addToProjects')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-[#4A5568]/15 bg-gradient-to-br from-[#F5F7FA] via-white to-[#FFF1F4] p-4 sm:p-5">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="inline-flex items-center gap-2 rounded-full border border-[#E63462]/20 bg-white px-3 py-1 text-xs font-semibold text-[#4A5568]">
                                <WandSparkles className="h-3.5 w-3.5 text-[#E63462]" />
                                {t('projects.refPro.badge')}
                              </div>
                              <h3 className="mt-3 text-base font-semibold text-[#4A5568]">{t('projects.refPro.title')}</h3>
                              <p className="mt-1 text-sm text-[#4A5568]/85">{t('projects.refPro.subtitle')}</p>
                            </div>
                            <Button
                              className="min-h-11 bg-[#4A5568] text-white hover:bg-[#3F4859]"
                              onClick={handleGenerateRefProDescription}
                              disabled={isGeneratingRefPro}
                            >
                              {isGeneratingRefPro ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  {t('projects.refPro.generating')}
                                </>
                              ) : (
                                <>
                                  <WandSparkles className="mr-2 h-4 w-4" />
                                  {t('projects.refPro.generateAction')}
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              className="min-h-11 border-[#E63462]/30 text-[#E63462] hover:bg-[#FFF1F4] hover:text-[#E63462]"
                              onClick={handleSaveRefProDescription}
                              disabled={!refProDraftSections || isGeneratingRefPro}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              {t('projects.refPro.saveAction')}
                            </Button>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#4A5568]/15 bg-white p-4 sm:p-5 transition-all duration-200">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="border-[#4A5568]/25 bg-[#F8FAFC] text-[#4A5568]">
                              {hasDraftRefProPreview ? t('projects.refPro.unsavedBadge') : activeSavedRefProVersion ? activeSavedRefProVersion.label : t('projects.refPro.latestBadge')}
                            </Badge>
                            {hasDraftRefProPreview && refProDraftGeneratedAt && (
                              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                                {new Date(refProDraftGeneratedAt).toLocaleString()}
                              </Badge>
                            )}
                            {!hasDraftRefProPreview && latestRefProVersion && (
                              <Badge variant="outline" className="border-[#E63462]/20 bg-[#FFF1F4] text-[#E63462]">
                                {new Date(latestRefProVersion.createdAt).toLocaleString()}
                              </Badge>
                            )}
                          </div>

                          {viewingOldRefProVersion && latestRefProVersion && (
                            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                              <History className="h-3.5 w-3.5" />
                              {t('projects.refPro.viewingOldVersion')}
                              <button
                                type="button"
                                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-amber-700 hover:bg-amber-100"
                                aria-label={t('projects.refPro.returnToLatest')}
                                onClick={() => setRefProCurrentVersionId(latestRefProVersion.id)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}

                          <div className="mt-4 max-h-[30rem] space-y-4 overflow-y-auto pr-1">
                            {displayedRefProSections ? (
                              displayedRefProSections.map((section) => (
                                <article key={section.id} className="rounded-xl border border-[#4A5568]/10 bg-[#F8FAFC] p-4">
                                  <h4 className="text-sm font-semibold text-[#4A5568]">{section.heading}</h4>
                                  <div className="mt-2 space-y-2">
                                    {section.paragraphs.map((paragraph, paragraphIndex) => (
                                      <p key={`${section.id}-${paragraphIndex}`} className="text-sm leading-relaxed text-[#4A5568]/85">
                                        {paragraph}
                                      </p>
                                    ))}
                                  </div>
                                </article>
                              ))
                            ) : (
                              <div className="rounded-xl border border-dashed border-[#4A5568]/20 bg-[#F8FAFC] p-5 text-sm text-[#4A5568]/80">
                                {t('projects.refPro.emptyState')}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#4A5568]/15 bg-white p-4 sm:p-5">
                          <div className="mb-4 flex items-center gap-2">
                            <History className="h-5 w-5 text-[#E63462]" />
                            <h3 className="text-base font-semibold text-[#4A5568]">{t('projects.refPro.historyTitle')}</h3>
                          </div>

                          {refProHistory.length > 0 ? (
                            <div className="space-y-2">
                              {refProHistory.map((entry) => {
                                const isLatest = latestRefProVersion?.id === entry.id;
                                const isActive = !hasDraftRefProPreview && activeSavedRefProVersion?.id === entry.id;

                                return (
                                  <div key={entry.id} className={`flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${isActive ? 'border-[#E63462]/30 bg-[#FFF1F4]' : 'border-[#4A5568]/10 bg-[#F8FAFC]'}`}>
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-semibold text-[#4A5568]">{entry.label}</p>
                                        {isLatest && <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">{t('projects.refPro.latestBadge')}</Badge>}
                                      </div>
                                      <p className="text-xs text-[#4A5568]/75">{new Date(entry.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button size="sm" variant="outline" onClick={() => handleViewRefProVersion(entry.id)}>
                                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                                        View
                                      </Button>
                                      <Button size="sm" variant="outline" className="border-[#E63462]/30 text-[#E63462] hover:bg-[#FFF1F4] hover:text-[#E63462]" onClick={() => handleDeleteRefProVersion(entry.id)}>
                                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="rounded-xl border border-dashed border-[#4A5568]/20 bg-[#F8FAFC] p-5 text-sm text-[#4A5568]/80">
                              {t('projects.refPro.historyEmpty')}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="team-members" className="mt-0">
                      <div className="rounded-2xl border border-[#4A5568]/15 bg-gradient-to-br from-[#F5F7FA] via-white to-[#FFF1F4] p-4 sm:p-5">
                        <div className="mb-4 flex items-center gap-2">
                          <Users className="h-5 w-5 text-[#E63462]" />
                          <h3 className="text-base font-semibold text-[#4A5568]">{t('projects.details.teamMembers')}</h3>
                        </div>

                        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div className="rounded-xl border border-[#4A5568]/15 bg-white p-4">
                            <p className="text-xs text-[#4A5568]/70">{t('projects.details.projectManager')}</p>
                            <p className="mt-1 text-sm font-semibold text-[#4A5568]">{project.projectManager}</p>
                          </div>
                          <div className="rounded-xl border border-[#4A5568]/15 bg-white p-4">
                            <p className="text-xs text-[#4A5568]/70">{t('projects.details.technicalLead')}</p>
                            <p className="mt-1 text-sm font-semibold text-[#4A5568]">{project.technicalLead}</p>
                          </div>
                        </div>

                        <div>
                          <p className="mb-2 text-xs text-[#4A5568]/70">{t('projects.create.teamMembers')} ({project.teamSize})</p>
                          <ul role="list" className="space-y-2">
                            {project.teamMembers.map((member) => (
                              <li key={member.id} className="flex items-center justify-between rounded-xl border border-[#4A5568]/15 bg-white p-3 text-sm">
                                <div className="flex items-center gap-2">
                                  <UserCircle className="h-4 w-4 text-[#E63462]" aria-hidden />
                                  <div>
                                    <p className="font-medium text-[#4A5568]">{member.name}</p>
                                    <p className="text-xs text-[#4A5568]/80">{member.role}</p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="border-[#E63462]/30 bg-[#E63462]/10 text-[#E63462]">{member.allocation}</Badge>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </TabsContent>

                  {showSensitiveSections && (
                    <TabsContent value="tasks" className="mt-0">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="rounded-lg border bg-slate-50 p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm font-medium text-primary">Progress</span>
                              <span className="text-sm font-semibold text-primary">{project.tasksCompleted}/{project.totalTasks}</span>
                            </div>
                            <Progress value={Math.round((project.tasksCompleted / project.totalTasks) * 100)} className="h-2.5" />
                          </div>
                        </div>
                        <Button size="sm" className="ml-4 gap-1.5" onClick={() => navigate('/projects/tasks/new')}>
                          <Plus className="h-4 w-4" />
                          {t('projects.tasks.new')}
                        </Button>
                      </div>

                      <ul role="list" className="space-y-3">
                        {projectTasks.map((task) => (
                          <li key={task.id} className="rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                              <div className="flex flex-1 items-start gap-3">
                              <CheckCircle className={`mt-1 h-5 w-5 ${task.status === 'COMPLETED' ? 'text-green-500' : 'text-gray-300'}`} aria-hidden />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-primary">{task.title}</p>
                                <p className="text-xs text-muted-foreground">{t(`projects.tasks.status.${task.status}`)}</p>
                                {task.assignedTo && task.assignedTo.length > 0 && (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {t('projects.tasks.assignedTo')}: {task.assignedTo.map((a) => a.name).join(', ')}
                                  </p>
                                )}
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <Badge variant="outline" className="text-xs">{t(`projects.priority.${task.priority}`)}</Badge>
                                  <span className="text-xs text-muted-foreground">{formatDate(task.dueDate)}</span>
                                </div>
                              </div>
                              </div>
                              {canAssignTasks && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="self-start gap-1.5"
                                  onClick={() => openTaskAssignmentDialog(task)}
                                >
                                  <UserPlus className="h-4 w-4" />
                                  {hasAssignedMember(task)
                                    ? t('projects.actions.manageMember')
                                    : t('projects.actions.assignToMember')}
                                </Button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                  )}

                  <TabsContent value="documents" className="mt-0">
                    <div className="rounded-2xl border border-[#4A5568]/15 bg-gradient-to-br from-[#F5F7FA] via-white to-[#FFF1F4] p-4 sm:p-5">
                      <div className="mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#E63462]" />
                        <h3 className="text-base font-semibold text-[#4A5568]">{t('projects.details.documents')}</h3>
                      </div>

                    <div className="space-y-3">
                      {projectDocuments.map((document) => (
                        <div key={document.id} className="rounded-xl border border-[#4A5568]/15 bg-white p-4 shadow-sm">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:items-center">
                            <div>
                              <p className="text-xs text-[#4A5568]/70">{t('projects.documents.name')}</p>
                              <p className="mt-1 text-sm font-semibold text-[#4A5568]">{document.name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[#4A5568]/70">{t('projects.documents.type')}</p>
                              <p className="mt-1 text-sm text-[#4A5568]/90">{document.type}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[#4A5568]/70">{t('projects.documents.datePublished')}</p>
                              <p className="mt-1 text-sm text-[#4A5568]/90">{formatDate(document.datePublished)}</p>
                            </div>
                            <div className="flex items-center justify-start sm:justify-end">
                              <Button size="sm" variant="outline" className="border-[#E63462]/30 text-[#E63462] hover:bg-[#FFF1F4] hover:text-[#E63462]" onClick={() => downloadProjectDocument(document)}>
                                <Download className="mr-2 h-4 w-4" />
                                {t('projects.documents.download')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="matching-ai" className="mt-0">
                    <section id="project-matching-ai-card" className="overflow-hidden rounded-2xl border border-[#4A5568]/20 bg-gradient-to-br from-[#F5F7FA] via-white to-[#FFF1F4] p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E63462]/20 bg-white/90 px-3 py-1 text-sm font-medium text-[#E63462] shadow-sm">
                      <Sparkles className="h-4 w-4" />
                      {t('projects.matchingAI.previewBadge')}
                    </div>
                    <h2 className="text-2xl font-semibold text-[#4A5568]">{t('projects.matchingAI.title')}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-[#4A5568]/80">{t('projects.matchingAI.subtitle')}</p>
                  </div>
                  <div className="rounded-2xl border border-[#4A5568]/15 bg-white/90 px-4 py-3 shadow-sm">
                    <p className="text-xs text-[#4A5568]/70">{t('projects.matchingAI.insightLabel')}</p>
                    <p className="mt-1 text-lg font-semibold text-[#4A5568]">{t('projects.matchingAI.sections.predictiveInsights')}</p>
                    <p className="text-xs text-[#4A5568]/80">{t('projects.matchingAI.insightHelper')}</p>
                  </div>
                </div>

                {isAlertsContext && (
                  <Alert className="mt-6 border-amber-200 bg-white/85 text-amber-900">
                    <Lock className="h-4 w-4 text-amber-700" />
                    <AlertDescription>{t('projects.matchingAI.lockedMessage')}</AlertDescription>
                  </Alert>
                )}

                <div className="mt-6">
                  {!isAlertsContext && (
                    <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E63462]/20 bg-white px-3 py-1 text-xs font-semibold text-[#4A5568]">
                      <Coins className="h-3.5 w-3.5 text-[#E63462]" />
                      Credits: {availableCredits}
                    </div>
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                      <MatchingAiCard
                        title={t('projects.matchingAI.sections.experts')}
                        description={t('projects.matchingAI.descriptions.experts')}
                        accentClassName="border-rose-100"
                        icon={<UserCircle className="h-5 w-5 text-rose-500" />}
                      >
                        <div className="mb-3 flex justify-end">
                          <Button size="sm" variant="outline" onClick={() => generateSectionResponse('experts')} disabled={isAlertsContext}>
                            <WandSparkles className="mr-2 h-4 w-4" />
                            {t('projects.matchingAI.actions.generateResponse')}
                          </Button>
                        </div>
                        {generatedResponses.experts ? (
                          <>
                            <div className="mb-3 rounded-lg border border-rose-100 bg-white p-3 text-sm text-muted-foreground">{generatedResponses.experts}</div>
                            <div className="space-y-3">
                              {suggestedExperts.map((expert) => (
                                <div key={expert.id} className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        {hasCvAccess(expert.id) ? (
                                          <Link to={buildExpertDetailPath(expert.id)} className="text-sm font-semibold text-primary underline-offset-2 hover:text-[#E63462] hover:underline">{getExpertDisplayName(expert.id, expert.name)}</Link>
                                        ) : (
                                          <p className="text-sm font-semibold text-primary">{getExpertDisplayName(expert.id, expert.name)}</p>
                                        )}
                                        {!hasCvAccess(expert.id) && <Badge variant="outline" className="border-[#E63462]/30 bg-[#E63462]/10 text-[#E63462]">CV Locked</Badge>}
                                      </div>
                                      <p className="text-sm text-muted-foreground">{expert.role}</p>
                                    </div>
                                    <Badge variant="outline" className="w-fit border-rose-200 bg-white text-rose-700">
                                      {t('projects.matchingAI.labels.matchRelevance')} {expert.matchScore}%
                                    </Badge>
                                  </div>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {expert.tags.map((tag) => (
                                      <Badge key={tag} variant="secondary" className="bg-white/90 text-slate-700">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                  <div className="mt-4 flex flex-wrap gap-2">
                                    {hasCvAccess(expert.id) ? (
                                      <>
                                        <Button size="sm" variant="outline" asChild>
                                          <Link to={buildExpertDetailPath(expert.id)}>{t('projects.matchingAI.actions.viewProfile')}</Link>
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => downloadExpertCv(expert.id, expert.name, 'pdf')}>
                                          <Download className="mr-1.5 h-4 w-4" />PDF
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => downloadExpertCv(expert.id, expert.name, 'docx')}>
                                          <Download className="mr-1.5 h-4 w-4" />DOCX
                                        </Button>
                                      </>
                                    ) : (
                                      <Button size="sm" variant="outline" className="border-[#E63462]/30 text-[#E63462] hover:bg-[#FFE6E8] hover:text-[#E63462]" onClick={() => unlockExpertCv(expert.id)} disabled={availableCredits < CV_UNLOCK_COST}>
                                        <Coins className="mr-2 h-4 w-4" />Unlock CV ({CV_UNLOCK_COST})
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="rounded-lg border border-rose-100 bg-white/80 p-3 text-sm text-muted-foreground">
                            {t('projects.matchingAI.generateHint')}
                          </div>
                        )}
                      </MatchingAiCard>

                      <MatchingAiCard
                        title={t('projects.matchingAI.sections.bidWriters')}
                        description={t('projects.matchingAI.descriptions.bidWriters')}
                        accentClassName="border-fuchsia-100"
                        icon={<FileText className="h-5 w-5 text-fuchsia-500" />}
                      >
                        <div className="mb-3 flex justify-end">
                          <Button size="sm" variant="outline" onClick={() => generateSectionResponse('bidWriters')} disabled={isAlertsContext}>
                            <WandSparkles className="mr-2 h-4 w-4" />
                            {t('projects.matchingAI.actions.generateResponse')}
                          </Button>
                        </div>
                        {generatedResponses.bidWriters ? (
                          <>
                            <div className="mb-3 rounded-lg border border-fuchsia-100 bg-white p-3 text-sm text-muted-foreground">{generatedResponses.bidWriters}</div>
                            <div className="space-y-3">
                              {suggestedBidWriters.map((writer) => (
                                <div key={writer.id} className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50/50 p-4">
                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        {hasCvAccess(writer.id) ? (
                                          <Link to={buildExpertDetailPath(writer.id)} className="text-sm font-semibold text-primary underline-offset-2 hover:text-[#E63462] hover:underline">{getExpertDisplayName(writer.id, writer.name)}</Link>
                                        ) : (
                                          <p className="text-sm font-semibold text-primary">{getExpertDisplayName(writer.id, writer.name)}</p>
                                        )}
                                        {!hasCvAccess(writer.id) && <Badge variant="outline" className="border-[#E63462]/30 bg-[#E63462]/10 text-[#E63462]">CV Locked</Badge>}
                                      </div>
                                      <p className="text-sm text-muted-foreground">{writer.role}</p>
                                    </div>
                                    <Badge variant="outline" className="w-fit border-fuchsia-200 bg-white text-fuchsia-700">
                                      {t('projects.matchingAI.labels.matchRelevance')} {writer.matchScore}%
                                    </Badge>
                                  </div>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {writer.tags.map((tag) => (
                                      <Badge key={tag} variant="secondary" className="bg-white/90 text-slate-700">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                  <div className="mt-4 flex flex-wrap gap-2">
                                    {hasCvAccess(writer.id) ? (
                                      <>
                                        <Button size="sm" variant="outline" asChild>
                                          <Link to={buildExpertDetailPath(writer.id)}>{t('projects.matchingAI.actions.viewProfile')}</Link>
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => downloadExpertCv(writer.id, writer.name, 'pdf')}>
                                          <Download className="mr-1.5 h-4 w-4" />PDF
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => downloadExpertCv(writer.id, writer.name, 'docx')}>
                                          <Download className="mr-1.5 h-4 w-4" />DOCX
                                        </Button>
                                      </>
                                    ) : (
                                      <Button size="sm" variant="outline" className="border-[#E63462]/30 text-[#E63462] hover:bg-[#FFE6E8] hover:text-[#E63462]" onClick={() => unlockExpertCv(writer.id)} disabled={availableCredits < CV_UNLOCK_COST}>
                                        <Coins className="mr-2 h-4 w-4" />Unlock CV ({CV_UNLOCK_COST})
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="rounded-lg border border-fuchsia-100 bg-white/80 p-3 text-sm text-muted-foreground">
                            {t('projects.matchingAI.generateHint')}
                          </div>
                        )}
                      </MatchingAiCard>

                      <MatchingAiCard
                        title={t('projects.matchingAI.sections.partnerMatching')}
                        description={t('projects.matchingAI.descriptions.partnerMatching')}
                        accentClassName="border-sky-100"
                        icon={<Building2 className="h-5 w-5 text-sky-500" />}
                        className="xl:col-span-2"
                      >
                        <div className="mb-3 flex justify-end">
                          <Button size="sm" variant="outline" onClick={() => generateSectionResponse('partnerMatching')} disabled={isAlertsContext}>
                            <WandSparkles className="mr-2 h-4 w-4" />
                            {t('projects.matchingAI.actions.generateResponse')}
                          </Button>
                        </div>
                        {generatedResponses.partnerMatching ? (
                          <>
                            <div className="mb-3 rounded-lg border border-sky-100 bg-white p-3 text-sm text-muted-foreground">{generatedResponses.partnerMatching}</div>
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                                  <p className="text-sm font-semibold text-primary">{t('projects.matchingAI.sections.primaryMatches')}</p>
                                  <Badge variant="outline" className="border-emerald-200 bg-white text-emerald-700">{partnerMatches.filter((partner) => partner.category === 'primary' && isPartnerVisible(partner.name)).length}</Badge>
                                </div>
                                <div className="space-y-3">
                                  {partnerMatches.filter((partner) => partner.category === 'primary' && isPartnerVisible(partner.name)).map((partner) => (
                                    <div key={partner.id} className="rounded-xl border border-emerald-100 bg-white/90 p-3">
                                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0 flex-1">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <Link to={buildOrganizationDetailPath(partner.name)} className="text-sm font-semibold text-primary underline-offset-2 hover:text-[#E63462] hover:underline">{partner.name}</Link>
                                            {renderOrganizationBookmarkButton(partner.name)}
                                            {renderPartnerVisibilityToggle(partner.name)}
                                          </div>
                                          <p className="mt-1 text-xs text-muted-foreground">{partner.summary}</p>
                                        </div>
                                        <Badge className="w-fit shrink-0 bg-emerald-600 text-white hover:bg-emerald-600">{partner.highlight}</Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                                  <p className="text-sm font-semibold text-primary">{t('projects.matchingAI.sections.secondaryMatches')}</p>
                                  <Badge variant="outline" className="border-amber-200 bg-white text-amber-700">{partnerMatches.filter((partner) => partner.category === 'secondary' && isPartnerVisible(partner.name)).length}</Badge>
                                </div>
                                <div className="space-y-3">
                                  {partnerMatches.filter((partner) => partner.category === 'secondary' && isPartnerVisible(partner.name)).map((partner) => (
                                    <div key={partner.id} className="rounded-xl border border-amber-100 bg-white/90 p-3">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <Link to={buildOrganizationDetailPath(partner.name)} className="text-sm font-semibold leading-tight text-primary underline-offset-2 hover:text-[#E63462] hover:underline">{partner.name}</Link>
                                        {renderOrganizationBookmarkButton(partner.name)}
                                        {renderPartnerVisibilityToggle(partner.name)}
                                      </div>
                                      <p className="mt-1 text-xs text-muted-foreground">{partner.summary}</p>
                                      <p className="mt-2 text-xs font-medium text-amber-700">{partner.highlight}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="rounded-lg border border-sky-100 bg-white/80 p-3 text-sm text-muted-foreground">
                            {t('projects.matchingAI.generateHint')}
                          </div>
                        )}
                      </MatchingAiCard>

                      <MatchingAiCard
                        title={t('projects.matchingAI.sections.similarProjects')}
                        description={t('projects.matchingAI.descriptions.similarProjects')}
                        accentClassName="border-violet-100"
                        icon={<Briefcase className="h-5 w-5 text-violet-500" />}
                      >
                        <div className="mb-3 flex justify-end">
                          <Button size="sm" variant="outline" onClick={() => generateSectionResponse('similarProjects')} disabled={isAlertsContext}>
                            <WandSparkles className="mr-2 h-4 w-4" />
                            {t('projects.matchingAI.actions.generateResponse')}
                          </Button>
                        </div>
                        {generatedResponses.similarProjects ? (
                          <>
                            <div className="mb-3 rounded-lg border border-violet-100 bg-white p-3 text-sm text-muted-foreground">{generatedResponses.similarProjects}</div>
                            <div className="space-y-3">
                              {similarPastProjects.map((similarProject) => (
                                <div key={similarProject.id} className="flex flex-col gap-3 rounded-2xl border border-violet-100 bg-white/90 p-4 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <Link to={buildProjectDetailPath(similarProject.name)} className="text-sm font-semibold text-primary underline-offset-2 hover:text-[#E63462] hover:underline">{similarProject.name}</Link>
                                    <p className="mt-1 text-xs text-muted-foreground">{similarProject.sector}</p>
                                  </div>
                                  <Badge variant="outline" className="w-fit border-violet-200 bg-violet-50 text-violet-700">{similarProject.country}</Badge>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="rounded-lg border border-violet-100 bg-white/80 p-3 text-sm text-muted-foreground">
                            {t('projects.matchingAI.generateHint')}
                          </div>
                        )}
                      </MatchingAiCard>

                      <MatchingAiCard
                        title={t('projects.matchingAI.sections.predictiveInsights')}
                        description={t('projects.matchingAI.descriptions.predictiveInsights')}
                        accentClassName="border-sky-100"
                        icon={<TrendingUp className="h-5 w-5 text-sky-500" />}
                      >
                        <div className="mb-3 flex justify-end">
                          <Button size="sm" variant="outline" onClick={() => generateSectionResponse('predictiveInsights')} disabled={isAlertsContext}>
                            <WandSparkles className="mr-2 h-4 w-4" />
                            {t('projects.matchingAI.actions.generateResponse')}
                          </Button>
                        </div>
                        {generatedResponses.predictiveInsights ? (
                          <>
                            <div className="mb-3 rounded-lg border border-sky-100 bg-white p-3 text-sm text-muted-foreground">{generatedResponses.predictiveInsights}</div>
                            <div className="space-y-4">
                              {predictiveInsights.map((insight) => {
                                const insightClasses = getInsightClasses(insight.tone);

                                return (
                                  <div key={insight.id} className="rounded-2xl border border-slate-100 bg-white/90 p-4">
                                    <div className="mb-2 flex items-center justify-between gap-3">
                                      <p className="text-sm font-semibold text-primary">{t(insight.labelKey)}</p>
                                      <Badge variant="outline" className={insightClasses.badge}>{insight.value}%</Badge>
                                    </div>
                                    <Progress value={insight.value} className={`h-2.5 bg-slate-100 ${insightClasses.progress}`} />
                                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{insight.helper}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        ) : (
                          <div className="rounded-lg border border-sky-100 bg-white/80 p-3 text-sm text-muted-foreground">
                            {t('projects.matchingAI.generateHint')}
                          </div>
                        )}
                      </MatchingAiCard>
                    </div>

                    <div className="mt-5">
                      <MatchingAiCard
                        title={t('projects.matchingAI.sections.recommendations')}
                        description={t('projects.matchingAI.descriptions.recommendations')}
                        accentClassName="border-amber-100"
                        icon={<Target className="h-5 w-5 text-amber-500" />}
                      >
                        <div className="mb-3 flex justify-end">
                          <Button size="sm" variant="outline" onClick={() => generateSectionResponse('recommendations')} disabled={isAlertsContext}>
                            <WandSparkles className="mr-2 h-4 w-4" />
                            {t('projects.matchingAI.actions.generateResponse')}
                          </Button>
                        </div>
                        {generatedResponses.recommendations ? (
                          <>
                            <div className="mb-3 rounded-lg border border-amber-100 bg-white p-3 text-sm text-muted-foreground">{generatedResponses.recommendations}</div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                              {contextualRecommendations.map((recommendation) => (
                                <div key={recommendation.id} className="rounded-2xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/80 p-4">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                      <Link to={buildProjectDetailPath(recommendation.id)} className="text-sm font-semibold text-primary underline-offset-2 hover:text-[#E63462] hover:underline">{recommendation.title}</Link>
                                      <p className="mt-1 text-xs text-muted-foreground">{recommendation.subtitle}</p>
                                    </div>
                                    <Star className="h-4 w-4 shrink-0 text-amber-500" />
                                  </div>
                                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{recommendation.ctaHint}</p>
                                  <div className="mt-4 flex flex-wrap gap-2">
                                    <Button size="sm" variant="outline" asChild>
                                      <Link to={buildProjectDetailPath(recommendation.id)}>{t('projects.matchingAI.actions.viewProject')}</Link>
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="rounded-lg border border-amber-100 bg-white/80 p-3 text-sm text-muted-foreground">
                            {t('projects.matchingAI.generateHint')}
                          </div>
                        )}
                      </MatchingAiCard>
                    </div>
                    </div>
                  )}
                </div>
                    </section>
                  </TabsContent>
                </Tabs>
              </section>

              <section id="project-tor-ai-card" className="rounded-lg border bg-white p-6">
                <div className="rounded-2xl border border-[#4A5568]/15 bg-gradient-to-br from-[#F5F7FA] via-white to-[#FFF1F4] p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#E63462]/20 bg-white px-3 py-1 text-xs font-semibold text-[#4A5568]">
                        <WandSparkles className="h-3.5 w-3.5 text-[#E63462]" />
                        {t('projects.torAI.badge')}
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-[#4A5568]">{t('projects.torAI.title')}</h3>
                      <p className="mt-1 text-sm text-[#4A5568]/85">{t('projects.torAI.subtitle')}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        className="min-h-11 border-[#E63462]/30 text-[#E63462] hover:bg-[#FFF1F4] hover:text-[#E63462]"
                        onClick={handleOpenTorUploadDialog}
                        disabled={!isProjectSaved || isUploadingTor || isGeneratingTor}
                      >
                        {isUploadingTor ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Upload ToR
                          </>
                        )}
                      </Button>
                      <Button
                        className="min-h-11 bg-[#4A5568] text-white hover:bg-[#3F4859]"
                        onClick={handleGenerateTor}
                        disabled={!isProjectSaved || isGeneratingTor}
                      >
                        {isGeneratingTor ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('projects.torAI.generating')}
                          </>
                        ) : (
                          <>
                            <WandSparkles className="mr-2 h-4 w-4" />
                            {t('projects.torAI.generateAction')}
                          </>
                        )}
                      </Button>
                      {torDraftSections && (
                        <Button
                          variant="outline"
                          className="min-h-11 border-[#E63462]/30 text-[#E63462] hover:bg-[#FFF1F4] hover:text-[#E63462]"
                          onClick={handleSaveTor}
                          disabled={!isProjectSaved || isGeneratingTor}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {t('projects.torAI.saveAction')}
                        </Button>
                      )}
                    </div>
                  </div>

                  {!isProjectSaved ? (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full bg-amber-100 p-2 text-amber-700">
                          <Lock className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-semibold text-[#4A5568]">{t('projects.torAI.lockedTitle')}</p>
                          <p className="mt-1 text-sm text-[#4A5568]/85">{t('projects.torAI.lockedMessage')}</p>
                          <Button className="mt-4 bg-[#E63462] text-white hover:bg-[#D42F5A]" onClick={() => openProjectActionDialog('add')}>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('projects.matchingAI.addToProjects')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-4">
                      <div className="rounded-2xl border border-[#4A5568]/15 bg-white p-4 sm:p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="border-[#4A5568]/25 bg-[#F8FAFC] text-[#4A5568]">
                            {hasTorDraftPreview ? t('projects.torAI.unsavedBadge') : activeSavedTorVersion ? activeSavedTorVersion.versionName : t('projects.torAI.latestBadge')}
                          </Badge>
                          {hasTorDraftPreview && torDraftGeneratedAt && (
                            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                              {new Date(torDraftGeneratedAt).toLocaleString()}
                            </Badge>
                          )}
                          {!hasTorDraftPreview && latestTorVersion && (
                            <Badge variant="outline" className="border-[#E63462]/20 bg-[#FFF1F4] text-[#E63462]">
                              {new Date(latestTorVersion.createdAt).toLocaleString()}
                            </Badge>
                          )}
                        </div>

                        {viewingOldTorVersion && latestTorVersion && (
                          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                            <History className="h-3.5 w-3.5" />
                            {t('projects.torAI.viewingOldVersion')}
                            <button
                              type="button"
                              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-amber-700 hover:bg-amber-100"
                              aria-label={t('projects.torAI.returnToLatest')}
                              onClick={() => setTorCurrentVersionId(latestTorVersion.id)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <Button size="sm" variant="outline" onClick={handleGenerateTor} disabled={isGeneratingTor}>
                            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                            {t('projects.torAI.regenerateAction')}
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleEditTor} disabled={!displayedTorSections}>
                            <Pencil className="mr-1.5 h-3.5 w-3.5" />
                            {t('projects.torAI.editAction')}
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCopyTor} disabled={!displayedTorSections}>
                            <Copy className="mr-1.5 h-3.5 w-3.5" />
                            {t('projects.torAI.copyAction')}
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleDownloadTor} disabled={!displayedTorSections && !activeSavedTorVersion?.fileUrl}>
                            <Download className="mr-1.5 h-3.5 w-3.5" />
                            {t('projects.torAI.downloadAction')}
                          </Button>
                        </div>

                        <div className="mt-4 max-h-[34rem] space-y-4 overflow-y-auto pr-1">
                          {displayedTorSections ? (
                            displayedTorSections.map((section) => (
                              <article key={section.id} className="rounded-xl border border-[#4A5568]/10 bg-[#F8FAFC] p-4">
                                <h4 className="text-sm font-semibold text-[#4A5568]">{section.title}</h4>
                                {isTorEditMode && hasTorDraftPreview ? (
                                  <textarea
                                    className="mt-2 min-h-28 w-full rounded-md border border-[#4A5568]/20 bg-white p-3 text-sm leading-relaxed text-[#4A5568] focus:border-[#E63462]/50 focus:outline-none focus:ring-2 focus:ring-[#E63462]/20"
                                    value={section.content}
                                    onChange={(event) => handleUpdateTorSection(section.id, event.target.value)}
                                  />
                                ) : (
                                  <p className="mt-2 text-sm leading-relaxed text-[#4A5568]/85">{section.content}</p>
                                )}
                              </article>
                            ))
                          ) : (
                            <div className="rounded-xl border border-dashed border-[#4A5568]/20 bg-[#F8FAFC] p-5 text-sm text-[#4A5568]/80">
                              {activeSavedTorVersion?.source === 'USER_UPLOADED'
                                ? 'This uploaded ToR is stored as a source document. Use Download to open the original file.'
                                : t('projects.torAI.emptyState')}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#4A5568]/15 bg-white p-4 sm:p-5">
                        <div className="mb-4 flex items-center gap-2">
                          <History className="h-5 w-5 text-[#E63462]" />
                          <h3 className="text-base font-semibold text-[#4A5568]">{t('projects.torAI.historyTitle')}</h3>
                        </div>

                        {torHistory.length > 0 ? (
                          <div className="space-y-2">
                            {torHistory.map((entry) => {
                              const isLatest = latestTorVersion?.id === entry.id;
                              const isActive = !hasTorDraftPreview && activeSavedTorVersion?.id === entry.id;
                              const previewText = entry.sections?.[0]?.content || entry.extractedText || entry.originalFileName;
                              const sourceLabel = entry.source === 'USER_UPLOADED' ? 'User uploaded' : 'AI generated';

                              return (
                                <div key={entry.id} className={`flex flex-col gap-3 rounded-xl border p-3 ${isActive ? 'border-[#E63462]/30 bg-[#FFF1F4]' : 'border-[#4A5568]/10 bg-[#F8FAFC]'}`}>
                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-semibold text-[#4A5568]">{entry.versionName}</p>
                                        {isLatest && <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">{t('projects.torAI.latestBadge')}</Badge>}
                                        <Badge variant="outline" className={entry.source === 'USER_UPLOADED' ? 'border-sky-200 bg-sky-50 text-sky-700' : 'border-[#E63462]/20 bg-[#FFF1F4] text-[#E63462]'}>
                                          {sourceLabel}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-[#4A5568]/75">{entry.originalFileName} - {new Date(entry.createdAt).toLocaleString()}</p>
                                      <p className="mt-2 line-clamp-2 text-xs text-[#4A5568]/85">
                                        {previewText}
                                      </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Button size="sm" variant="outline" onClick={() => handleViewTorVersion(entry.id)}>
                                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                                        {t('projects.torAI.viewAction')}
                                      </Button>
                                      {entry.sections ? (
                                        <Button size="sm" variant="outline" onClick={() => handleReuseTorVersion(entry.id)}>
                                          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                          {t('projects.torAI.reuseAction')}
                                        </Button>
                                      ) : (
                                        <Button size="sm" variant="outline" asChild>
                                          <a href={entry.fileUrl} download={entry.originalFileName}>
                                            <Download className="mr-1.5 h-3.5 w-3.5" />
                                            {t('projects.torAI.downloadAction')}
                                          </a>
                                        </Button>
                                      )}
                                      <Button size="sm" variant="outline" className="border-[#E63462]/30 text-[#E63462] hover:bg-[#FFF1F4] hover:text-[#E63462]" onClick={() => handleDeleteTorVersion(entry.id)}>
                                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                        {t('projects.torAI.deleteAction')}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-[#4A5568]/20 bg-[#F8FAFC] p-5 text-sm text-[#4A5568]/80">
                            No ToR history uploaded or generated yet.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>

            </div>
          </div>
        </main>
      </PageContainer>

      <Dialog open={isTorUploadDialogOpen} onOpenChange={(open) => {
        if (!open && !isUploadingTor) {
          setIsTorUploadDialogOpen(false);
          resetTorUploadForm();
        } else {
          setIsTorUploadDialogOpen(open);
        }
      }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Upload ToR</DialogTitle>
            <DialogDescription>
              Add a PDF, DOC, or DOCX source document to this project&apos;s ToR History.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#4A5568]" htmlFor="tor-upload-version-name">
                Version name
              </label>
              <input
                id="tor-upload-version-name"
                className="min-h-10 w-full rounded-md border border-[#4A5568]/20 bg-white px-3 py-2 text-sm text-[#4A5568] focus:border-[#E63462]/50 focus:outline-none focus:ring-2 focus:ring-[#E63462]/20"
                value={torUploadVersionName}
                onChange={(event) => setTorUploadVersionName(event.target.value)}
                placeholder="e.g. Client ToR v1"
                disabled={isUploadingTor}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#4A5568]" htmlFor="tor-upload-file">
                ToR file
              </label>
              <input
                id="tor-upload-file"
                className="min-h-10 w-full rounded-md border border-[#4A5568]/20 bg-white px-3 py-2 text-sm text-[#4A5568] file:mr-3 file:rounded-md file:border-0 file:bg-[#F8FAFC] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#4A5568]"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setTorUploadFile(file);
                  if (file && !isAllowedTorFile(file)) {
                    setTorUploadError('Only .pdf, .doc, and .docx files are accepted.');
                  } else {
                    setTorUploadError('');
                  }
                }}
                disabled={isUploadingTor}
              />
            </div>
            {torUploadError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {torUploadError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsTorUploadDialogOpen(false)} disabled={isUploadingTor}>
              {t('common.cancel')}
            </Button>
            <Button type="button" onClick={handleUploadTor} disabled={isUploadingTor}>
              {isUploadingTor ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload ToR'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(taskToAssign)} onOpenChange={(open) => !open && setTaskToAssign(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {taskToAssign && hasAssignedMember(taskToAssign)
                ? t('projects.actions.manageMember')
                : t('projects.tasks.assignMemberDialogTitle')}
            </DialogTitle>
            <DialogDescription>{t('projects.tasks.assignMemberDialogDescription')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Select value={selectedTaskMemberId} onValueChange={setSelectedTaskMemberId}>
              <SelectTrigger
                aria-label={taskToAssign && hasAssignedMember(taskToAssign)
                  ? t('projects.actions.manageMember')
                  : t('projects.actions.assignToMember')}
              >
                <SelectValue placeholder={t('common.select')} />
              </SelectTrigger>
              <SelectContent>
                {assignmentMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} - {member.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTaskToAssign(null)}>
              {t('common.cancel')}
            </Button>
            <Button type="button" onClick={handleAssignTaskToMember} disabled={!selectedTaskMemberId}>
              {taskToAssign && hasAssignedMember(taskToAssign)
                ? t('projects.actions.manageMember')
                : t('projects.actions.assignToMember')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
