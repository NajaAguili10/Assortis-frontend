import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ProjectsSubMenu } from '@app/components/ProjectsSubMenu';
import { StatCard } from '@app/components/StatCard';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import { Input } from '@app/components/ui/input';
import { Textarea } from '@app/components/ui/textarea';
import { Label } from '@app/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';
import { usePipeline, PIPELINE_STAGES, RESULT_STAGES } from '@app/modules/expert/hooks/usePipeline';
import { useTenders } from '@app/hooks/useTenders';
import { useToRs } from '@app/hooks/useToRs';
import { useProjects } from '@app/hooks/useProjects';
import { CurrencyEnum, SubmissionStatusEnum } from '@app/types/tender.dto';
import { toast } from 'sonner';
import {
  Target,
  TrendingUp,
  DollarSign,
  Calendar,
  Eye,
  ChevronRight,
  AlertCircle,
  Percent,
  Building,
  ArrowRight,
  ArrowUp,
  FileText,
  Edit3,
  Trophy,
  XCircle,
  MinusCircle,
  Filter,
  SortAsc,
  MessageSquare,
  CheckCircle2,
  Award,
  TrendingDown,
  Briefcase,
} from 'lucide-react';

type SortOption = 'newest' | 'oldest' | 'value' | 'deadline' | 'probability';
type ViewMode = 'active' | 'shortlisted' | 'awarded' | 'discarded' | 'all';

// Utility function to get currency symbol
const getCurrencySymbol = (currency: CurrencyEnum): string => {
  switch (currency) {
    case CurrencyEnum.USD:
      return '$';
    case CurrencyEnum.EUR:
      return '€';
    case CurrencyEnum.GBP:
      return '£';
    case CurrencyEnum.CHF:
      return 'CHF ';
    case CurrencyEnum.CAD:
      return 'CA$';
    default:
      return '$';
  }
};

// Utility function to format currency value
const formatCurrencyValue = (amount: number, currency: CurrencyEnum): string => {
  const symbol = getCurrencySymbol(currency);
  if (amount >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(0)}K`;
  } else {
    return `${symbol}${amount.toFixed(0)}`;
  }
};

// Utility function to calculate and format multi-currency pipeline value
interface CurrencyTotal {
  currency: CurrencyEnum;
  amount: number;
}

const calculateMultiCurrencyTotal = (
  opportunities: any[],
  allTenders: any[],
  allToRs: any[],
  allProjects: any[]
): CurrencyTotal[] => {
  const currencyTotals = new Map<CurrencyEnum, number>();

  opportunities.forEach((item) => {
    // Try to find in tenders first
    let tender = allTenders.find((t) => t.id === item.tenderId);
    
    // If not found in tenders, try ToRs
    if (!tender) {
      tender = allToRs.find((t) => t.id === item.tenderId);
    }
    
    // If still not found and ID is numeric, try projects
    if (!tender && /^\d+$/.test(item.tenderId)) {
      const project = allProjects.find((p) => p.id === item.tenderId);
      if (project) {
        tender = {
          budget: project.estimatedBudget || { amount: 0, currency: 'USD' as any, formatted: '$0' },
        };
      }
    }
    
    if (!tender) return;

    const currency = tender.budget.currency;
    const weightedValue = (tender.budget.amount * (item.probability || 50)) / 100;

    currencyTotals.set(currency, (currencyTotals.get(currency) || 0) + weightedValue);
  });

  return Array.from(currencyTotals.entries())
    .map(([currency, amount]) => ({ currency, amount }))
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending
};

const formatMultiCurrencyValue = (currencyTotals: CurrencyTotal[]): string => {
  if (currencyTotals.length === 0) {
    return '$0';
  }

  return currencyTotals
    .map((ct) => formatCurrencyValue(ct.amount, ct.currency))
    .join(' + ');
};

export default function Pipeline() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const openPipelineDetail = (tender: { isProject: boolean; isToR: boolean; tenderId: string }) => {
    if (tender.isToR) {
      navigate(`/calls/tors/${tender.tenderId}`, {
        state: {
          fromPipeline: true,
          fromMyProjects: true,
          accessSource: 'my-projects',
        },
      });
      return;
    }

    navigate(`/projects/${tender.tenderId}`, {
      state: {
        fromPipeline: true,
        fromMyProjects: true,
        accessSource: 'my-projects',
      },
    });
  };

  // Use pipeline hook to get real data
  const { 
    pipelineItems,
    removeFromPipeline,
    updatePipelineStage,
    updatePipelineNotes,
    updateProbability,
    markAsWon,
    markAsLost,
    markAsWithdrawn,
    markAsDiscarded,
    restoreFromDiscarded,
    getActiveOpportunities,
    getWonOpportunities,
    getLostOpportunities,
    getDiscardedOpportunities,
    getOpportunitiesByResult,
  } = usePipeline();
  
  // Use tenders hook to get tender details
  const { allTenders } = useTenders();

  // Use ToRs hook to get ToRs details
  const { allToRs } = useToRs();

  // Use projects hook to get project details
  const { projects: allProjects } = useProjects();

  // State for filters and dialogs
  const [selectedStage, setSelectedStage] = useState<string | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('active');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [moveStageDialogOpen, setMoveStageDialogOpen] = useState(false);
  const [probabilityDialogOpen, setProbabilityDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState<any | null>(null);
  const [newProbability, setNewProbability] = useState<number>(50);
  const [newNotes, setNewNotes] = useState<string>('');
  const [resultType, setResultType] = useState<'won' | 'lost' | 'withdrawn' | 'discarded'>('won');
  const [awardValue, setAwardValue] = useState<string>('');

  // Get real tenders from pipeline based on view mode
  const pipelineTenders = useMemo(() => {
    let itemsToShow = pipelineItems;
    
    // Filter by view mode (active/won/lost/withdrawn)
    if (viewMode === 'active') {
      itemsToShow = getActiveOpportunities();
    } else if (viewMode === 'awarded') {
      itemsToShow = getWonOpportunities();
    } else if (viewMode === 'shortlisted') {
      itemsToShow = pipelineItems.filter((item) => item.submissionStatus === SubmissionStatusEnum.SHORTLISTED);
    } else if (viewMode === 'discarded') {
      itemsToShow = pipelineItems.filter((item) => item.resultStage === 'discarded');
    }

    return itemsToShow
      .map(item => {
        // Try to find in tenders first (My Alerts items)
        let tender = allTenders.find(t => t.id === item.tenderId);
        let isToR = false;
        let isProject = false;
        
        // If not found in tenders, try to find in ToRs
        if (!tender) {
          tender = allToRs.find(t => t.id === item.tenderId);
          isToR = true;
        }
        
        // If still not found and ID is numeric, try to find in projects
        if (!tender && /^\d+$/.test(item.tenderId)) {
          const project = allProjects.find(p => p.id === item.tenderId);
          if (project) {
            isProject = true;
            // Map project data to tender-like structure for consistent rendering
            tender = {
              id: project.id,
              title: project.title,
              referenceNumber: project.code,
              organizationName: project.leadOrganization || 'N/A',
              budget: project.budget
                ? { amount: project.budget.total, currency: project.budget.currency as any, formatted: '' }
                : { amount: 0, currency: 'USD' as any, formatted: '$0' },
              deadline: project.timeline?.endDate ? new Date(project.timeline.endDate) : new Date(),
              status: project.status,
              sectors: project.subsectors || [],
            } as any;
          }
        }
        
        if (!tender) return null;
        
        return {
          id: item.tenderId,
          tenderId: tender.id,
          tenderTitle: tender.title,
          tenderReference: tender.referenceNumber,
          organizationName: isToR ? (tender as any).tenderTitle : tender.organizationName,
          stage: item.stage,
          probability: item.probability || 50,
          expectedValue: tender.budget,
          deadline: tender.deadline,
          lastActivity: new Date(item.lastModified || item.addedAt),
          addedAt: new Date(item.addedAt),
          status: tender.status,
          sectors: tender.sectors,
          notes: item.notes,
          resultStage: item.resultStage,
          resultDate: item.resultDate ? new Date(item.resultDate) : undefined,
          awardValue: item.awardValue,
          isToR,
          isProject,
        };
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);
  }, [pipelineItems, allTenders, allToRs, allProjects, viewMode, getActiveOpportunities, getWonOpportunities]);

  // Calculate stages with real data (only for active opportunities)
  const stages = useMemo(() => {
    const activeItems = getActiveOpportunities();
    const activeTenders = activeItems.map(item => {
      // Try to find in tenders first
      let tender = allTenders.find(t => t.id === item.tenderId);
      
      // If not found in tenders, try ToRs
      if (!tender) {
        tender = allToRs.find(t => t.id === item.tenderId);
      }
      
      // If still not found and ID is numeric, try projects
      if (!tender && /^\d+$/.test(item.tenderId)) {
        const project = allProjects.find(p => p.id === item.tenderId);
        if (project) {
          tender = {
            budget: project.budget
              ? { amount: project.budget.total, currency: project.budget.currency as any, formatted: '' }
              : { amount: 0, currency: 'USD' as any, formatted: '$0' },
          } as any;
        }
      }
      
      if (!tender) return null;
      return {
        stage: item.stage,
        value: tender.budget.amount,
        probability: item.probability || 50,
      };
    }).filter((t): t is NonNullable<typeof t> => t !== null);

    const stageData = PIPELINE_STAGES.map(stage => {
      const stageTenders = activeTenders.filter(t => t.stage === stage.id);
      const totalValue = stageTenders.reduce((acc, t) => acc + t.value, 0);
      const weightedValue = stageTenders.reduce((acc, t) => acc + (t.value * t.probability / 100), 0);
      
      return {
        id: stage.id,
        name: stage.name,
        color: stage.color === 'blue' ? 'bg-blue-200' :
               stage.color === 'purple' ? 'bg-purple-200' :
               stage.color === 'orange' ? 'bg-orange-200' :
               stage.color === 'green' ? 'bg-green-200' :
               stage.color === 'teal' ? 'bg-teal-200' : 'bg-gray-200',
        tenderCount: stageTenders.length,
        totalValue: {
          amount: totalValue,
          currency: 'USD' as const,
          formatted: `$${(totalValue / 1000).toFixed(0)}K`,
        },
        weightedValue: {
          amount: weightedValue,
          formatted: `$${(weightedValue / 1000).toFixed(0)}K`,
        },
      };
    });
    return stageData;
  }, [pipelineItems, allTenders, allToRs, allProjects, getActiveOpportunities]);

  // Filter tenders by stage and search
  const filteredTenders = useMemo(() => {
    let filtered = pipelineTenders;
    
    // Filter by stage (only for active view)
    if (viewMode === 'active' && selectedStage !== 'all') {
      filtered = filtered.filter((t) => t.stage === selectedStage);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((t) => 
        t.tenderTitle.toLowerCase().includes(query) ||
        t.tenderReference.toLowerCase().includes(query) ||
        t.organizationName.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === 'newest') {
      filtered = [...filtered].sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
    } else if (sortBy === 'oldest') {
      filtered = [...filtered].sort((a, b) => a.lastActivity.getTime() - b.lastActivity.getTime());
    } else if (sortBy === 'value') {
      filtered = [...filtered].sort((a, b) => b.expectedValue.amount - a.expectedValue.amount);
    } else if (sortBy === 'deadline') {
      filtered = [...filtered].sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
    } else if (sortBy === 'probability') {
      filtered = [...filtered].sort((a, b) => b.probability - a.probability);
    }

    return filtered;
  }, [selectedStage, pipelineTenders, searchQuery, sortBy, viewMode]);

  // Calculate KPIs
  const activeOpportunities = getActiveOpportunities();
  const wonOpportunities = getWonOpportunities();
  const shortlistedOpportunities = useMemo(
    () => pipelineItems.filter((item) => item.submissionStatus === SubmissionStatusEnum.SHORTLISTED),
    [pipelineItems]
  );
  const discardedOpportunities = useMemo(
    () => pipelineItems.filter((item) => item.resultStage === 'discarded'),
    [pipelineItems]
  );
  
  // Calculate multi-currency pipeline value
  const pipelineValueByCurrency = useMemo(() => {
    return calculateMultiCurrencyTotal(activeOpportunities, allTenders, allToRs, allProjects);
  }, [activeOpportunities, allTenders, allToRs, allProjects]);

  const formattedPipelineValue = useMemo(() => {
    return formatMultiCurrencyValue(pipelineValueByCurrency);
  }, [pipelineValueByCurrency]);

  const totalTenders = activeOpportunities.length;
  const totalAllOpportunities = pipelineItems.length;
  const avgProbability = totalTenders > 0 
    ? Math.round(activeOpportunities.reduce((acc, t) => acc + (t.probability || 50), 0) / totalTenders)
    : 0;
  const highProbabilityCount = activeOpportunities.filter((t) => (t.probability || 50) >= 70).length;

  const wonCount = wonOpportunities.length;
  const shortlistedCount = shortlistedOpportunities.length;
  const totalResults = wonCount + getLostOpportunities().length;
  const successRate = totalResults > 0 ? Math.round((wonCount / totalResults) * 100) : 0;

  const getProbabilityColor = (probability: number) => {
    if (probability >= 71) return 'text-green-600 bg-green-50 border-green-200';
    if (probability >= 41) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  const getStageColor = (stageId: string) => {
    const stage = stages.find((s) => s.id === stageId);
    return stage?.color || 'bg-gray-200';
  };

  const getStageName = (stageId: string) => {
    const stage = PIPELINE_STAGES.find((s) => s.id === stageId);
    return stage?.name || stageId;
  };

  const getDaysRemaining = (deadline: Date) => {
    const days = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleMoveStage = (tender: any) => {
    setSelectedTender(tender);
    setMoveStageDialogOpen(true);
  };

  const handleUpdateProbability = (tender: any) => {
    setSelectedTender(tender);
    setNewProbability(tender.probability);
    setProbabilityDialogOpen(true);
  };

  const handleAddNotes = (tender: any) => {
    setSelectedTender(tender);
    setNewNotes(tender.notes || '');
    setNotesDialogOpen(true);
  };

  const handleMarkResult = (tender: any, type: 'won' | 'lost' | 'withdrawn' | 'discarded') => {
    // Handle discarded immediately without dialog
    if (type === 'discarded') {
      markAsDiscarded(tender.tenderId);
      toast.success('Marked as discarded');
      setViewMode('all');
      return;
    }
    
    setSelectedTender(tender);
    setResultType(type);
    setAwardValue('');
    setResultDialogOpen(true);
  };

  const confirmProbabilityUpdate = () => {
    if (selectedTender) {
      updateProbability(selectedTender.tenderId, newProbability);
      toast.success(t('pipeline.probability.success'));
      setProbabilityDialogOpen(false);
    }
  };

  const confirmNotesUpdate = () => {
    if (selectedTender) {
      updatePipelineNotes(selectedTender.tenderId, newNotes);
      toast.success(t('pipeline.notes.success'));
      setNotesDialogOpen(false);
    }
  };

  const confirmResultUpdate = () => {
    if (selectedTender) {
      if (resultType === 'won') {
        const value = awardValue ? parseFloat(awardValue.replace(/[^0-9.]/g, '')) : undefined;
        markAsWon(selectedTender.tenderId, value);
        toast.success(t('pipeline.actions.markAsWon') + ' ✓');
      } else if (resultType === 'lost') {
        markAsLost(selectedTender.tenderId);
        toast.success(t('pipeline.actions.markAsLost') + ' ✓');
      } else {
        markAsWithdrawn(selectedTender.tenderId);
        toast.success('Withdrawn successfully');
      }
      setResultDialogOpen(false);
      setViewMode(resultType === 'won' ? 'awarded' : 'all');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <PageBanner
        title={t('pipeline.title')}
        description={t('pipeline.subtitle')}
        icon={Target}
        stats={[
          { value: totalTenders.toString(), label: t('pipeline.kpis.opportunities') }
        ]}
      />

      {/* Sub Menu */}
      <ProjectsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard
              title={t('pipeline.kpis.totalValue')}
              value={formattedPipelineValue}
              subtitle={t('pipeline.kpis.totalValueSubtitle')}
              icon={DollarSign}
              iconBgColor="bg-green-50"
              iconColor="text-green-500"
            />
            <StatCard
              title={t('pipeline.kpis.opportunities')}
              value={totalTenders.toString()}
              subtitle={t('pipeline.kpis.opportunitiesSubtitle')}
              icon={Target}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
            />
            <StatCard
              title={t('pipeline.kpis.avgProbability')}
              value={`${avgProbability}%`}
              subtitle={t('pipeline.kpis.avgProbabilitySubtitle')}
              icon={Percent}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-500"
            />
            <StatCard
              title={t('pipeline.kpis.won')}
              value={wonCount.toString()}
              subtitle={`${successRate}% ${t('pipeline.insights.successRate')}`}
              icon={Trophy}
              iconBgColor="bg-emerald-50"
              iconColor="text-emerald-500"
            />
            <StatCard
              title={t('pipeline.kpis.highProbability')}
              value={highProbabilityCount.toString()}
              subtitle={t('pipeline.kpis.highProbabilitySubtitle')}
              icon={TrendingUp}
              iconBgColor="bg-orange-50"
              iconColor="text-orange-500"
            />
          </div>

          {/* View Mode Tabs */}
          <div className="mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Button
                variant={viewMode === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('active')}
                className="whitespace-nowrap"
              >
                <Target className="w-4 h-4 mr-2" />
                {t('pipeline.stages.active')} ({activeOpportunities.length})
              </Button>
              <Button
                variant={viewMode === 'shortlisted' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('shortlisted')}
                className="whitespace-nowrap"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {t('submissions.status.shortlisted')} ({shortlistedCount})
              </Button>
              <Button
                variant={viewMode === 'awarded' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('awarded')}
                className="whitespace-nowrap"
              >
                <Trophy className="w-4 h-4 mr-2" />
                {t('tenders.status.awarded')} ({wonCount})
              </Button>
              <Button
                variant={viewMode === 'discarded' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('discarded')}
                className="whitespace-nowrap"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Discarded ({discardedOpportunities.length})
              </Button>
              <Button
                variant={viewMode === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('all')}
                className="whitespace-nowrap"
              >
                <FileText className="w-4 h-4 mr-2" />
                {t('pipeline.filter.all')} ({pipelineItems.length})
              </Button>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Pipeline Stages Overview - Only show for active view */}
          {viewMode === 'active' && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-primary mb-4">{t('pipeline.stages.title')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {stages.map((stage) => (
                    <button
                      key={stage.id}
                      onClick={() => setSelectedStage(selectedStage === stage.id ? 'all' : stage.id)}
                      className={`bg-white rounded-lg border-2 p-4 hover:shadow-md transition-all ${
                        selectedStage === stage.id ? 'border-accent shadow-md' : 'border-gray-200'
                      }`}
                    >
                      <div className={`w-12 h-12 ${stage.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                        <span className="text-2xl font-bold text-gray-700">{stage.tenderCount}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">{stage.name}</h3>
                      <p className="text-xs text-gray-600 mb-1">{stage.totalValue.formatted}</p>
                      <p className="text-xs text-green-600 font-semibold">
                        ⚖ {stage.weightedValue.formatted}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />
            </>
          )}

          {/* Filters and Search */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 w-full sm:w-auto">
                <Input
                  type="search"
                  placeholder={t('activeTenders.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SortAsc className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{t('pipeline.sort.newest')}</SelectItem>
                    <SelectItem value="oldest">{t('pipeline.sort.oldest')}</SelectItem>
                    <SelectItem value="value">{t('pipeline.sort.value')}</SelectItem>
                    <SelectItem value="deadline">{t('pipeline.sort.deadline')}</SelectItem>
                    <SelectItem value="probability">{t('pipeline.sort.probability')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pipeline Tenders List */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary">
                {viewMode === 'active' && selectedStage !== 'all'
                  ? `${getStageName(selectedStage)} (${filteredTenders.length})`
                  : viewMode === 'active' && selectedStage === 'all'
                  ? `${t('pipeline.list.title')} (${activeOpportunities.length})`
                  : viewMode === 'shortlisted'
                  ? `${t('submissions.status.shortlisted')} (${shortlistedCount})`
                  : viewMode === 'awarded'
                  ? `${t('tenders.status.awarded')} (${wonCount})`
                  : `${t('pipeline.list.title')} (${totalAllOpportunities})`}
                {searchQuery.trim() && filteredTenders.length !== (
                  viewMode === 'active' ? activeOpportunities.length :
                  viewMode === 'shortlisted' ? shortlistedCount :
                  viewMode === 'awarded' ? wonCount :
                  totalAllOpportunities
                ) && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    — {filteredTenders.length} filtered
                  </span>
                )}
              </h2>
              {selectedStage !== 'all' && viewMode === 'active' && (
                <Button variant="outline" size="sm" onClick={() => setSelectedStage('all')}>
                  {t('pipeline.viewAll')}
                </Button>
              )}
            </div>

            {filteredTenders.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {viewMode === 'active' ? t('pipeline.empty.title') : t('pipeline.results.empty')}
                </h3>
                <p className="text-gray-600 mb-6">{t('pipeline.empty.message')}</p>
                <Button onClick={() => navigate('/calls/active')}>
                  {t('pipeline.empty.action')}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredTenders.map((tender) => {
                  const daysRemaining = getDaysRemaining(tender.deadline);
                  const isUrgent = daysRemaining <= 14 && daysRemaining >= 0;
                  const weightedValue = (tender.expectedValue.amount * tender.probability) / 100;
                  const isResult = !!tender.resultStage;

                  return (
                    <div
                      key={tender.id}
                      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-primary">
                              {tender.tenderTitle}
                            </h3>
                            {!isResult && (
                              <>
                                <Badge className={getStageColor(tender.stage)}>
                                  {getStageName(tender.stage)}
                                </Badge>
                                <Badge className={`${getProbabilityColor(tender.probability)} border`}>
                                  <Percent className="w-3 h-3 mr-1" />
                                  {tender.probability}%
                                </Badge>
                              </>
                            )}
                            {tender.resultStage === RESULT_STAGES.WON && (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border">
                                <Trophy className="w-3 h-3 mr-1" />
                                {t('tenders.status.awarded')}
                              </Badge>
                            )}
                            {tender.resultStage === RESULT_STAGES.LOST && (
                              <Badge className="bg-red-50 text-red-700 border-red-200 border">
                                <XCircle className="w-3 h-3 mr-1" />
                                {t('pipeline.results.lost.title')}
                              </Badge>
                            )}
                            {tender.resultStage === RESULT_STAGES.WITHDRAWN && (
                              <Badge className="bg-gray-50 text-gray-700 border-gray-200 border">
                                <MinusCircle className="w-3 h-3 mr-1" />
                                {t('pipeline.results.withdrawn.title')}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              {tender.organizationName}
                            </span>
                            <span>•</span>
                            <span>{tender.tenderReference}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {tender.sectors.map((sector) => (
                              <Badge key={sector} variant="outline" className="text-xs">
                                {t(`sectors.${sector}`)}
                              </Badge>
                            ))}
                          </div>
                          {tender.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2 mb-1">
                                <MessageSquare className="w-4 h-4 text-gray-500" />
                                <span className="text-xs font-semibold text-gray-700">Notes:</span>
                              </div>
                              <p className="text-sm text-gray-600">{tender.notes}</p>
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm text-gray-600 mb-1">
                            {t('pipeline.expectedValue')}
                          </div>
                          <div className="text-lg font-bold text-primary mb-1">
                            {tender.expectedValue.formatted}
                          </div>
                          {!isResult && (
                            <div className="text-sm text-green-600 font-semibold mb-3">
                              {t('pipeline.weighted')}: ${(weightedValue / 1000).toFixed(0)}K
                            </div>
                          )}
                          {tender.resultStage === RESULT_STAGES.WON && tender.awardValue && (
                            <div className="text-sm text-emerald-600 font-semibold flex items-center gap-1 justify-end mb-3">
                              <Award className="w-4 h-4" />
                              ${(tender.awardValue / 1000).toFixed(0)}K
                            </div>
                          )}
                          
                          {/* Action buttons under Weighted */}
                          {!isResult && (
                            <div className="flex items-center gap-2 justify-end flex-wrap">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => openPipelineDetail(tender)}
                                title="View details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => handleUpdateProbability(tender)}
                                title="Update probability"
                              >
                                <Percent className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-gray-600 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleMarkResult(tender, 'discarded')}
                                title="Mark as discarded"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-4 pb-4 border-b flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className={`w-4 h-4 ${isUrgent ? 'text-red-500' : ''}`} />
                          <span className={isUrgent ? 'text-red-600 font-semibold' : ''}>
                            {t('pipeline.deadline')}: {tender.deadline.toLocaleDateString()} ({daysRemaining}d)
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {t('pipeline.lastActivity')}: {tender.lastActivity.toLocaleDateString()}
                        </span>
                        {tender.resultDate && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            Result: {tender.resultDate.toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => openPipelineDetail(tender)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {t('pipeline.actions.viewDetails')}
                        </Button>
                        
                        {!isResult && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMoveStage(tender)}
                            >
                              <ChevronRight className="w-4 h-4 mr-1" />
                              {t('pipeline.actions.moveStage')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateProbability(tender)}
                            >
                              <Percent className="w-4 h-4 mr-1" />
                              {t('pipeline.actions.updateProbability')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddNotes(tender)}
                            >
                              <Edit3 className="w-4 h-4 mr-1" />
                              {t('pipeline.actions.addNotes')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkResult(tender, 'won')}
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            >
                              <Trophy className="w-4 h-4 mr-1" />
                              {t('pipeline.actions.markAsWon')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkResult(tender, 'lost')}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              {t('pipeline.actions.markAsLost')}
                            </Button>
                          </>
                        )}
                        
                        {tender.resultStage === RESULT_STAGES.DISCARDED && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              restoreFromDiscarded(tender.tenderId);
                              toast.success('Project restored');
                            }}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <ArrowUp className="w-4 h-4 mr-1" />
                            Restore
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </PageContainer>

      {/* Move Stage Dialog */}
      <Dialog open={moveStageDialogOpen} onOpenChange={setMoveStageDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('pipeline.moveStage.title')}</DialogTitle>
            <DialogDescription>
              {selectedTender && (
                <span className="text-sm">
                  {t('pipeline.moveStage.description')} <strong>{selectedTender.tenderTitle}</strong>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-2">
              {PIPELINE_STAGES.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => {
                    if (selectedTender) {
                      updatePipelineStage(selectedTender.tenderId, stage.id);
                      setMoveStageDialogOpen(false);
                      toast.success(t('pipeline.moveStage.success'));
                    }
                  }}
                  disabled={selectedTender?.stage === stage.id}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                    selectedTender?.stage === stage.id
                      ? 'border-accent bg-accent/10 cursor-not-allowed'
                      : 'border-gray-200 hover:border-accent hover:shadow-md'
                  }`}
                >
                  <div className={`w-12 h-12 ${
                    stage.color === 'blue' ? 'bg-blue-200' :
                    stage.color === 'purple' ? 'bg-purple-200' :
                    stage.color === 'orange' ? 'bg-orange-200' :
                    stage.color === 'green' ? 'bg-green-200' :
                    stage.color === 'teal' ? 'bg-teal-200' : 'bg-gray-200'
                  } rounded-lg flex items-center justify-center flex-shrink-0`}>
                    {selectedTender?.stage === stage.id ? (
                      <ArrowRight className="w-6 h-6 text-accent" />
                    ) : (
                      <span className="text-lg font-bold text-gray-700">
                        {stages.find(s => s.id === stage.id)?.tenderCount || 0}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                    <p className="text-xs text-gray-600">
                      {stages.find(s => s.id === stage.id)?.totalValue.formatted || '$0K'}
                    </p>
                  </div>
                  {selectedTender?.stage === stage.id && (
                    <Badge variant="secondary" className="text-xs">
                      {t('pipeline.moveStage.current')}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Probability Dialog */}
      <Dialog open={probabilityDialogOpen} onOpenChange={setProbabilityDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('pipeline.probability.title')}</DialogTitle>
            <DialogDescription>
              {t('pipeline.probability.description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="probability">{t('pipeline.probability.label')}</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={newProbability}
                onChange={(e) => setNewProbability(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="mt-2"
              />
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => setNewProbability(25)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  newProbability <= 40 ? 'border-orange-300 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <div className="font-semibold text-orange-700">{t('pipeline.probability.low')}</div>
                <div className="text-xs text-gray-600">Initial interest, low certainty</div>
              </button>
              <button
                onClick={() => setNewProbability(55)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  newProbability > 40 && newProbability <= 70 ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="font-semibold text-blue-700">{t('pipeline.probability.medium')}</div>
                <div className="text-xs text-gray-600">Proposal in progress, good fit</div>
              </button>
              <button
                onClick={() => setNewProbability(85)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  newProbability > 70 ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="font-semibold text-green-700">{t('pipeline.probability.high')}</div>
                <div className="text-xs text-gray-600">Strong position, likely to win</div>
              </button>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Current Probability:</span>
                <Badge className={getProbabilityColor(newProbability)}>
                  {newProbability}%
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    newProbability > 70 ? 'bg-green-500' : 
                    newProbability > 40 ? 'bg-blue-500' : 
                    'bg-orange-500'
                  }`}
                  style={{ width: `${newProbability}%` }}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProbabilityDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmProbabilityUpdate}>
              Save Probability
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('pipeline.notes.title')}</DialogTitle>
            <DialogDescription>
              {selectedTender && (
                <span className="text-sm">
                  {t('pipeline.notes.description')} <strong>{selectedTender.tenderTitle}</strong>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder={t('pipeline.notes.placeholder')}
              rows={6}
              className="w-full"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmNotesUpdate}>
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark Result Dialog */}
      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {resultType === 'won' ? t('pipeline.actions.markAsWon') :
               resultType === 'lost' ? t('pipeline.actions.markAsLost') :
               'Mark as Withdrawn'}
            </DialogTitle>
            <DialogDescription>
              {selectedTender && (
                <span className="text-sm">
                  Confirm the final result for <strong>{selectedTender.tenderTitle}</strong>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {resultType === 'won' && (
              <div>
                <Label htmlFor="awardValue">Award Value (optional)</Label>
                <Input
                  id="awardValue"
                  type="text"
                  placeholder="e.g., $150,000"
                  value={awardValue}
                  onChange={(e) => setAwardValue(e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-gray-600 mt-1">Enter the actual contract value if known</p>
              </div>
            )}
            
            <div className={`mt-4 p-4 rounded-lg border-2 ${
              resultType === 'won' ? 'bg-emerald-50 border-emerald-200' :
              resultType === 'lost' ? 'bg-red-50 border-red-200' :
              'bg-gray-50 border-gray-200'
            }`}>
              <p className="text-sm">
                {resultType === 'won' && 'This opportunity will be marked as won and moved to the Won section.'}
                {resultType === 'lost' && 'This opportunity will be marked as lost and moved to the Lost section.'}
                {resultType === 'withdrawn' && 'This opportunity will be marked as withdrawn.'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResultDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmResultUpdate}
              className={
                resultType === 'won' ? 'bg-emerald-600 hover:bg-emerald-700' :
                resultType === 'lost' ? 'bg-red-600 hover:bg-red-700' :
                ''
              }
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}