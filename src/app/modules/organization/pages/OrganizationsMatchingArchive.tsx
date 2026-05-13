import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OrganizationsSubMenu } from '@app/components/OrganizationsSubMenu';
import { StatCard } from '@app/components/StatCard';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { Badge } from '@app/components/ui/badge';
import { Card, CardContent } from '@app/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@app/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  Archive,
  Search,
  TrendingUp,
  Star,
  Calendar,
  Eye,
  Trash2,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, es } from 'date-fns/locale';
import {
  organizationMatchingDossierService,
  OrganizationMatchingDossierDTO,
} from '@app/services/organizationMatchingDossierService';

interface SavedMatching {
  id: string;
  name: string;
  date: Date;
  results: any[];
  avgScore: number;
  totalOrganizations: number;
  filters?: any;
}

const mapDossierToSavedMatching = (dossier: OrganizationMatchingDossierDTO): SavedMatching => ({
  id: String(dossier.id),
  name: dossier.name,
  date: new Date(dossier.createdAt),
  results: dossier.results || [],
  avgScore: dossier.avgScore || 0,
  totalOrganizations: dossier.totalOrganizations || (dossier.results || []).length,
  filters: dossier.filters || undefined,
});

export default function OrganizationsMatchingArchive() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMatchingId, setSelectedMatchingId] = useState<string | null>(null);
  const [expandedMatchingId, setExpandedMatchingId] = useState<string | null>(null);
  const [savedMatchings, setSavedMatchings] = useState<SavedMatching[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const dateLocale = language === 'fr' ? fr : language === 'es' ? es : enUS;

  const loadSavedMatchings = async () => {
    setIsLoading(true);
    try {
      const dossiers = await organizationMatchingDossierService.getDossiers();
      setSavedMatchings(dossiers.map(mapDossierToSavedMatching));
    } catch (error) {
      console.error('Error loading matching dossiers:', error);
      setSavedMatchings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSavedMatchings();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      loadSavedMatchings();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const filteredMatchings = useMemo(() => {
    let filtered = [...savedMatchings];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((matching) => matching.name.toLowerCase().includes(query));
    }

    const now = new Date();
    if (dateFilter === 'WEEK') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((matching) => matching.date >= weekAgo);
    } else if (dateFilter === 'MONTH') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((matching) => matching.date >= monthAgo);
    } else if (dateFilter === 'YEAR') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((matching) => matching.date >= yearAgo);
    }

    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [savedMatchings, searchQuery, dateFilter]);

  const stats = useMemo(() => {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const thisMonth = savedMatchings.filter((matching) => matching.date >= monthAgo).length;
    const highMatches = savedMatchings.reduce(
      (sum, matching) => sum + matching.results.filter((result: any) => Number(result?.matchScore || 0) >= 80).length,
      0,
    );
    const totalOrganizations = savedMatchings.reduce((sum, matching) => sum + matching.totalOrganizations, 0);
    const avgScore = totalOrganizations
      ? Math.round(
          savedMatchings.reduce((sum, matching) => sum + matching.avgScore * matching.totalOrganizations, 0) /
            totalOrganizations,
        )
      : 0;
    return {
      total: savedMatchings.length,
      thisMonth,
      highMatches,
      avgScore,
    };
  }, [savedMatchings]);

  const handleDeleteMatching = async () => {
    if (!selectedMatchingId) return;
    await organizationMatchingDossierService.deleteDossier(selectedMatchingId);
    await loadSavedMatchings();
    setDeleteDialogOpen(false);
    setSelectedMatchingId(null);
    toast.success(t('organizations.matchingDossier.card.deleteSuccess'));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        title={t('organizations.matchingDossier.title')}
        description={t('organizations.matchingDossier.subtitle')}
        icon={Archive}
        stats={[{ value: String(stats.total), label: t('organizations.matchingDossier.stats.totalSaved') }]}
      />
      <OrganizationsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
            <StatCard title={t('organizations.matchingDossier.stats.totalSaved')} value={String(stats.total)} icon={Archive} iconBgColor="bg-amber-50" iconColor="text-amber-500" />
            <StatCard title={t('organizations.matchingDossier.stats.thisMonth')} value={String(stats.thisMonth)} icon={Calendar} iconBgColor="bg-blue-50" iconColor="text-blue-500" />
            <StatCard title={t('organizations.matchingDossier.stats.highMatches')} value={String(stats.highMatches)} icon={Star} iconBgColor="bg-green-50" iconColor="text-green-500" />
            <StatCard title={t('organizations.matchingDossier.stats.avgScore')} value={`${stats.avgScore}%`} icon={TrendingUp} iconBgColor="bg-purple-50" iconColor="text-purple-500" />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('organizations.matchingDossier.list.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('organizations.matchingDossier.list.allDates')}</SelectItem>
                  <SelectItem value="WEEK">{t('organizations.matchingDossier.list.thisWeek')}</SelectItem>
                  <SelectItem value="MONTH">{t('organizations.matchingDossier.list.thisMonth')}</SelectItem>
                  <SelectItem value="YEAR">{t('organizations.matchingDossier.list.thisYear')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Archive className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t('common.loading')}</p>
            </div>
          ) : filteredMatchings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Archive className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary mb-2">{t('organizations.matchingDossier.list.empty')}</h3>
              <p className="text-muted-foreground mb-4">{t('organizations.matchingDossier.list.emptyMessage')}</p>
              <Button onClick={() => navigate('/organizations/matching')} className="bg-[#B82547] hover:bg-[#9a1d3a]">
                <Sparkles className="w-4 h-4 mr-2" />
                {t('organizations.submenu.matching')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMatchings.map((matching) => (
                <Card key={matching.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold text-primary">{matching.name}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {t('organizations.matchingDossier.card.savedOn')} {format(matching.date, 'PPP', { locale: dateLocale })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{matching.totalOrganizations}</div>
                      <div className="text-xs text-muted-foreground">{t('organizations.matchingDossier.card.organizations')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{matching.avgScore}%</div>
                      <div className="text-xs text-muted-foreground">{t('organizations.matchingDossier.card.avgMatch')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {matching.results.filter((result: any) => Number(result?.matchScore || 0) >= 80).length}
                      </div>
                      <div className="text-xs text-muted-foreground">{t('organizations.matchingDossier.stats.highMatches')}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Badge variant="outline">
                      <Star className="w-3 h-3 mr-1" />
                      {matching.results.filter((result: any) => Number(result?.matchScore || 0) >= 80).length}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedMatchingId(expandedMatchingId === matching.id ? null : matching.id)}
                      >
                        {expandedMatchingId === matching.id ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-2" />
                            Hide Results
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            {t('organizations.matchingDossier.card.viewResults')}
                          </>
                        )}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => { setSelectedMatchingId(matching.id); setDeleteDialogOpen(true); }}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('organizations.matchingDossier.card.delete')}
                      </Button>
                    </div>
                  </div>

                  {expandedMatchingId === matching.id && (
                    <div className="mt-6 pt-6 border-t space-y-3">
                      {matching.results.map((result: any, index: number) => (
                        <Card key={`${matching.id}-${index}`} className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h5 className="font-semibold text-gray-900">{result?.name || 'Organization'}</h5>
                              <p className="text-sm text-gray-600">{result?.description || ''}</p>
                            </div>
                            <Badge variant="secondary">{result?.matchScore || 0}%</Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </PageContainer>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('organizations.matchingDossier.card.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>{t('organizations.matchingDossier.delete.message')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMatching}>{t('organizations.matchingDossier.delete.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
