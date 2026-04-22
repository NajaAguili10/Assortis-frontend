import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router';
import { format } from 'date-fns';
import {
  Briefcase,
  CheckCircle,
  Clock,
  Eye,
  History,
  MapPin,
  Sparkles,
  Star,
  TrendingUp,
  Upload,
  UserCheck,
  UserCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useCVCredits } from '@app/contexts/CVCreditsContext';
import { useExperts } from '@app/modules/expert/hooks/useExperts';
import CVCreditsSummaryCard from '@app/components/CVCreditsSummaryCard';
import PillTabs from '@app/components/PillTabs';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';

type MyExpertsTab = 'cvip' | 'cv-up';

type ExpertCardType = 'internal' | 'generated';

interface InternalExpertEntry {
  id: string;
  detailExpertId: string;
  firstName: string;
  lastName: string;
  title: string;
  city: string;
  country: string;
  yearsOfExperience: number;
  clientRating: number;
  verified: boolean;
  availability: 'IMMEDIATE' | 'WITHIN_1_MONTH' | 'WITHIN_3_MONTHS' | 'NOT_AVAILABLE';
  skills: string[];
  completedMissions: number;
  profileCompleteness: number;
  sourceFileName: string;
}

interface GeneratedExpertsHistoryEntry {
  id: string;
  createdAt: string;
  generatedCount: number;
  experts: InternalExpertEntry[];
}

const INTERNAL_STORAGE_KEY = 'search.myexperts.cvip.internal';
const GENERATED_HISTORY_STORAGE_KEY = 'search.myexperts.cvup.history';
const GENERATION_OPTIONS = [1, 4, 8, 12, 16, 20];
const DUMMY_CVIP_EXPERTS: InternalExpertEntry[] = [
  {
    id: 'cvip-dummy-1',
    detailExpertId: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    title: 'Senior Project Manager',
    city: 'London',
    country: 'United Kingdom',
    yearsOfExperience: 12,
    clientRating: 4.8,
    verified: true,
    availability: 'IMMEDIATE',
    skills: ['Project Management', 'M&E', 'Stakeholder Engagement'],
    completedMissions: 34,
    profileCompleteness: 95,
    sourceFileName: 'Private Database',
  },
  {
    id: 'cvip-dummy-2',
    detailExpertId: '2',
    firstName: 'Ahmed',
    lastName: 'Hassan',
    title: 'Agriculture Development Specialist',
    city: 'Cairo',
    country: 'Egypt',
    yearsOfExperience: 15,
    clientRating: 4.9,
    verified: true,
    availability: 'WITHIN_1_MONTH',
    skills: ['Agricultural Economics', 'Rural Development', 'Capacity Building'],
    completedMissions: 42,
    profileCompleteness: 100,
    sourceFileName: 'Private Database',
  },
];

function readInternalExperts(): InternalExpertEntry[] {
  try {
    const raw = localStorage.getItem(INTERNAL_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => {
        return Boolean(item)
          && typeof item.id === 'string'
          && typeof item.firstName === 'string'
          && typeof item.lastName === 'string'
          && typeof item.title === 'string'
          && typeof item.city === 'string'
          && typeof item.country === 'string'
          && typeof item.sourceFileName === 'string';
      })
      .map((item) => ({
        ...item,
        detailExpertId: typeof item.detailExpertId === 'string' ? item.detailExpertId : item.id,
      })) as InternalExpertEntry[];
  } catch {
    return [];
  }
}

function writeInternalExperts(experts: InternalExpertEntry[]) {
  try {
    localStorage.setItem(INTERNAL_STORAGE_KEY, JSON.stringify(experts));
  } catch {
    // Keep UX responsive even if storage is not available.
  }
}

function readGeneratedHistory(): GeneratedExpertsHistoryEntry[] {
  try {
    const raw = localStorage.getItem(GENERATED_HISTORY_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is GeneratedExpertsHistoryEntry => {
      return Boolean(item)
        && typeof item.id === 'string'
        && typeof item.createdAt === 'string'
        && typeof item.generatedCount === 'number'
        && Array.isArray(item.experts);
    });
  } catch {
    return [];
  }
}

function writeGeneratedHistory(history: GeneratedExpertsHistoryEntry[]) {
  try {
    localStorage.setItem(GENERATED_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Keep UX responsive even if storage is not available.
  }
}

function parseFileNameToName(fileName: string): { firstName: string; lastName: string } {
  const withoutExtension = fileName.replace(/\.[^/.]+$/, '');
  const normalized = withoutExtension.replace(/[-_]+/g, ' ').trim();
  const parts = normalized.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: 'New', lastName: 'Expert' };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: 'Expert' };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

function buildInternalExpert(fileName: string, indexSeed: number, detailExpertId: string): InternalExpertEntry {
  const { firstName, lastName } = parseFileNameToName(fileName);

  return {
    id: `internal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${indexSeed}`,
    detailExpertId,
    firstName,
    lastName,
    title: 'CV Imported Expert',
    city: 'N/A',
    country: 'N/A',
    yearsOfExperience: 5,
    clientRating: 4.4,
    verified: false,
    availability: 'WITHIN_1_MONTH',
    skills: ['CV Analysis', 'Domain Expertise', 'Project Delivery'],
    completedMissions: 0,
    profileCompleteness: 65,
    sourceFileName: fileName,
  };
}

function buildGeneratedExperts(count: number, pool: InternalExpertEntry[]): InternalExpertEntry[] {
  if (pool.length === 0) {
    return Array.from({ length: count }).map((_, index) => ({
      id: `generated-fallback-${Date.now()}-${index}`,
      detailExpertId: '1',
      firstName: `Generated`,
      lastName: `Expert ${index + 1}`,
      title: 'AI Matched Expert',
      city: 'N/A',
      country: 'N/A',
      yearsOfExperience: 8,
      clientRating: 4.6,
      verified: true,
      availability: 'IMMEDIATE',
      skills: ['International Projects', 'Strategic Advisory', 'Proposal Support'],
      completedMissions: 12,
      profileCompleteness: 90,
      sourceFileName: 'AI Generated',
    }));
  }

  return Array.from({ length: count }).map((_, index) => {
    const seed = pool[index % pool.length];
    return {
      ...seed,
      id: `generated-${seed.id}-${Date.now()}-${index}`,
      detailExpertId: seed.detailExpertId || seed.id,
      clientRating: Math.min(5, Number((seed.clientRating + 0.2).toFixed(1))),
      completedMissions: seed.completedMissions + 3 + index,
      profileCompleteness: Math.min(100, seed.profileCompleteness + 5),
      verified: true,
      sourceFileName: 'AI Generated',
      title: seed.title || 'AI Matched Expert',
    };
  });
}

interface ExpertDisplayCardProps {
  expert: InternalExpertEntry;
  type: ExpertCardType;
  onView: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

function ExpertDisplayCard({ expert, type, onView, t }: ExpertDisplayCardProps) {
  const isInternal = type === 'internal';

  return (
    <div className="rounded-lg border p-6 hover:shadow-md transition-shadow bg-white border-accent/35 cursor-pointer" onClick={onView}>
      <div className="flex items-center justify-between mb-3 gap-2">
        {isInternal ? (
          <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700 bg-emerald-100/40">
            {t('search.myExperts.internal.badge')}
          </Badge>
        ) : (
          <Badge className="text-xs bg-accent text-white hover:bg-accent">
            {t('search.myExperts.generated.badge')}
          </Badge>
        )}
      </div>

      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <UserCircle className="w-10 h-10 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{expert.firstName} {expert.lastName}</h4>
          <p className="text-sm text-gray-600 truncate">{expert.title}</p>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500 truncate">{expert.city}, {expert.country}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1"><Briefcase className="w-4 h-4 text-primary" /><span className="text-xs text-gray-600">{t('experts.yearsExp')}</span></div>
          <p className="text-lg font-semibold text-primary">{expert.yearsOfExperience}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1"><Star className="w-4 h-4 text-yellow-500" /><span className="text-xs text-gray-600">{t('experts.rating')}</span></div>
          <p className="text-lg font-semibold text-primary">{expert.clientRating.toFixed(1)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {expert.verified && <Badge variant="secondary" className="text-xs"><CheckCircle className="w-3 h-3 mr-1" />{t('experts.verified')}</Badge>}
        <Badge variant="outline" className="text-xs"><UserCheck className="w-3 h-3 mr-1" />{expert.sourceFileName}</Badge>
        <Badge variant="outline" className="text-xs"><Clock className="w-3 h-3 mr-1" />{t(`experts.availability.${expert.availability}`)}</Badge>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-600 mb-2">{t('experts.skills')}:</p>
        <div className="flex flex-wrap gap-1">
          {expert.skills.slice(0, 3).map((skill, index) => (
            <Badge key={`${expert.id}-skill-${index}-${skill}`} variant="outline" className="text-xs">{skill}</Badge>
          ))}
          {expert.skills.length > 3 && <Badge variant="outline" className="text-xs">+{expert.skills.length - 3}</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1"><TrendingUp className="w-3 h-3 text-gray-400" /><span className="text-xs text-gray-600">{t('experts.missions')}</span></div>
          <p className="text-sm font-semibold text-primary">{expert.completedMissions}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1"><CheckCircle className="w-3 h-3 text-gray-400" /><span className="text-xs text-gray-600">{t('experts.profile')}</span></div>
          <p className="text-sm font-semibold text-primary">{expert.profileCompleteness}%</p>
        </div>
      </div>

      <Button variant="outline" size="sm" className="w-full min-h-11" onClick={onView}>
        {t('search.myExperts.actions.view')}
      </Button>
    </div>
  );
}

export default function SearchMyExpertsContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { experts } = useExperts();
  const { availableCredits, spendCredits } = useCVCredits();

  const [activeTab, setActiveTab] = useState<MyExpertsTab>('cvip');
  const [selectedGenerationCount, setSelectedGenerationCount] = useState<string>('4');
  const [isGenerating, setIsGenerating] = useState(false);
  const [internalExperts, setInternalExperts] = useState<InternalExpertEntry[]>(() => {
    const stored = readInternalExperts();
    return stored.length > 0 ? stored : DUMMY_CVIP_EXPERTS;
  });
  const [generatedExperts, setGeneratedExperts] = useState<InternalExpertEntry[]>([]);
  const [generatedHistory, setGeneratedHistory] = useState<GeneratedExpertsHistoryEntry[]>(() => readGeneratedHistory());

  const generationCount = Number(selectedGenerationCount) || 1;

  const expertPool = useMemo<InternalExpertEntry[]>(() => {
    const mappedFromSearch = experts.data.map((expert) => ({
      id: expert.id,
      detailExpertId: expert.id,
      firstName: expert.firstName || 'Expert',
      lastName: expert.lastName || expert.id,
      title: expert.title || 'Expert',
      city: expert.city || 'N/A',
      country: expert.country || 'N/A',
      yearsOfExperience: expert.yearsOfExperience || 0,
      clientRating: expert.clientRating || 0,
      verified: Boolean(expert.verified),
      availability: expert.availability || 'NOT_AVAILABLE',
      skills: expert.skills || [],
      completedMissions: expert.completedMissions || 0,
      profileCompleteness: expert.profileCompleteness || 0,
      sourceFileName: 'Assortis Database',
    }));

    return [...internalExperts, ...mappedFromSearch];
  }, [experts.data, internalExperts]);

  const handleBuyPack = () => {
    navigate('/compte-utilisateur/credits');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const fallbackDetailIds = experts.data.map((expert) => expert.id);
    const additions = files.map((file, index) => {
      const detailExpertId = fallbackDetailIds[index % (fallbackDetailIds.length || 1)] || '1';
      return buildInternalExpert(file.name, index, detailExpertId);
    });
    const next = [...additions, ...internalExperts];

    setInternalExperts(next);
    writeInternalExperts(next);
    toast.success(t('search.myExperts.cvip.upload.success', { count: additions.length }));

    event.target.value = '';
  };

  const handleGenerate = () => {
    const cost = generationCount;

    if (!spendCredits(cost)) {
      toast.error(t('experts.credits.notEnough'), {
        action: {
          label: t('experts.credits.buyMore'),
          onClick: handleBuyPack,
        },
      });
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const results = buildGeneratedExperts(generationCount, expertPool);
      const entry: GeneratedExpertsHistoryEntry = {
        id: `cvup-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        generatedCount: generationCount,
        experts: results,
      };

      const updatedHistory = [entry, ...generatedHistory];

      setGeneratedExperts(results);
      setGeneratedHistory(updatedHistory);
      writeGeneratedHistory(updatedHistory);
      setIsGenerating(false);

      toast.success(t('search.myExperts.cvup.generate.success', { count: generationCount }));
    }, 1200);
  };

  const handleViewHistory = (entry: GeneratedExpertsHistoryEntry) => {
    setGeneratedExperts(entry.experts);
    toast.success(t('search.myExperts.cvup.history.loaded', { count: entry.generatedCount }));
  };

  const handleOpenExpertDetails = (expertId: string) => {
    navigate(`/search/experts/${expertId}`, {
      state: { searchSection: 'my-experts' },
    });
  };

  return (
    <div className="space-y-6">
      <CVCreditsSummaryCard
        label={t('experts.credits.availableLabel')}
        value={t('experts.credits.availableValue', { count: availableCredits })}
        buyLabel={t('experts.credits.buyPack')}
        onBuyPack={handleBuyPack}
      />

      <PillTabs
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as MyExpertsTab)}
        tabs={[
          { id: 'cvip', label: t('search.myExperts.tabs.cvip'), count: internalExperts.length },
          { id: 'cv-up', label: t('search.myExperts.tabs.cvUp'), count: generatedExperts.length },
        ]}
      />

      {activeTab === 'cvip' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-primary">{t('search.myExperts.cvip.title')}</h2>
                <p className="text-sm text-gray-600 mt-1">{t('search.myExperts.cvip.description')}</p>
              </div>
              <Button onClick={handleUploadClick} className="min-h-11">
                <Upload className="w-4 h-4 mr-2" />
                {t('search.myExperts.cvip.upload.cta')}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.rtf,.txt"
                multiple
                onChange={handleFilesSelected}
              />
            </div>
          </div>

          {internalExperts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {internalExperts.map((expert) => (
                <ExpertDisplayCard
                  key={expert.id}
                  expert={expert}
                  type="internal"
                  t={t}
                  onView={() => handleOpenExpertDetails(expert.detailExpertId)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-primary mb-1">{t('search.myExperts.cvip.empty.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('search.myExperts.cvip.empty.description')}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'cv-up' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-slate-50 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-semibold text-accent">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t('search.myExperts.cvup.kicker')}
                </div>
                <h2 className="mt-3 text-xl font-semibold text-primary">{t('search.myExperts.cvup.title')}</h2>
                <p className="mt-1 text-sm text-gray-600">{t('search.myExperts.cvup.description')}</p>
              </div>

              <div className="w-full md:w-auto space-y-2">
                <p className="text-xs font-medium text-gray-600">{t('search.myExperts.cvup.selectLabel')}</p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Select value={selectedGenerationCount} onValueChange={setSelectedGenerationCount}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GENERATION_OPTIONS.map((value) => (
                        <SelectItem key={value} value={String(value)}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Badge variant="secondary" className="text-xs bg-accent/10 text-accent border-accent/20">
                    {t('search.myExperts.cvup.cost', { count: generationCount })}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Button onClick={handleGenerate} className="min-h-11" disabled={isGenerating}>
                {isGenerating ? t('search.myExperts.cvup.generate.loading') : t('search.myExperts.cvup.generate.cta')}
              </Button>
            </div>
          </div>

          {isGenerating && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: Math.min(generationCount, 6) }).map((_, index) => (
                <div key={`loading-card-${index}`} className="rounded-lg border border-gray-200 p-6 bg-white animate-pulse space-y-3">
                  <div className="h-4 w-1/3 rounded bg-gray-200" />
                  <div className="h-6 w-2/3 rounded bg-gray-200" />
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                  <div className="h-20 rounded bg-gray-100" />
                  <div className="h-10 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          )}

          {!isGenerating && generatedExperts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedExperts.map((expert) => (
                <ExpertDisplayCard
                  key={expert.id}
                  expert={expert}
                  type="generated"
                  t={t}
                  onView={() => handleOpenExpertDetails(expert.detailExpertId)}
                />
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-[#4A5568]/15 bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-[#E63462]" />
              <h3 className="text-base font-semibold text-[#4A5568]">{t('search.myExperts.cvup.history.title')}</h3>
            </div>

            {generatedHistory.length > 0 ? (
              <div className="space-y-2">
                {generatedHistory.map((entry, index) => (
                  <div key={entry.id} className={`flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${index === 0 ? 'border-[#E63462]/30 bg-[#FFF1F4]' : 'border-[#4A5568]/10 bg-[#F8FAFC]'}`}>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[#4A5568]">{t('search.myExperts.cvup.history.entryTitle', { count: entry.generatedCount })}</p>
                        {index === 0 && <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">{t('search.myExperts.cvup.history.latestBadge')}</Badge>}
                      </div>
                      <p className="text-xs text-[#4A5568]/75">{format(new Date(entry.createdAt), 'yyyy-MM-dd HH:mm')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewHistory(entry)}>
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        {t('search.myExperts.actions.view')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#4A5568]/20 bg-[#F8FAFC] p-5 text-sm text-[#4A5568]/80">
                {t('search.myExperts.cvup.history.empty')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
