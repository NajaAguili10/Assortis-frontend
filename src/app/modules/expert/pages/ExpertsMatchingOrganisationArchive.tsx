import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ExpertsSubMenu } from '@app/components/ExpertsSubMenu';
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
  MapPin,
  DollarSign,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Users,
  Award,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, es } from 'date-fns/locale';

// Saved matching data interface
interface SavedMatching {
  id: string;
  name: string;
  date: Date;
  results: any[];
  avgScore: number;
  totalExperts: number;
  filters?: any;
}

export default function ExpertsMatchingOrganisationArchive() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMatchingId, setSelectedMatchingId] = useState<string | null>(null);
  const [expandedMatchingId, setExpandedMatchingId] = useState<string | null>(null);

  // Get date locale
  const dateLocale = language === 'fr' ? fr : language === 'es' ? es : enUS;

  // Load saved matchings from localStorage
  const [savedMatchings, setSavedMatchings] = useState<SavedMatching[]>([]);

  useEffect(() => {
    loadSavedMatchings();
  }, []);

  const loadSavedMatchings = () => {
    try {
      const saved = localStorage.getItem('expertsMatchingOrganisationArchive');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        const matchings = parsed.map((m: any) => ({
          ...m,
          date: new Date(m.date),
        }));
        setSavedMatchings(matchings);
      }
    } catch (error) {
      console.error('Error loading saved matchings:', error);
    }
  };

  // Filter matchings
  const filteredMatchings = useMemo(() => {
    let filtered = [...savedMatchings];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(matching =>
        matching.name.toLowerCase().includes(query) ||
        (matching.filters && matching.filters.notes && matching.filters.notes.toLowerCase().includes(query))
      );
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'WEEK') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(m => m.date >= weekAgo);
    } else if (dateFilter === 'MONTH') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(m => m.date >= monthAgo);
    } else if (dateFilter === 'YEAR') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(m => m.date >= yearAgo);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => b.date.getTime() - a.date.getTime());

    return filtered;
  }, [savedMatchings, searchQuery, dateFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thisMonth = savedMatchings.filter(m => m.date >= monthAgo).length;
    
    const totalHighMatches = savedMatchings.reduce((sum, m) => sum + m.results.filter((r: any) => r.matchScore >= 80).length, 0);
    const totalExperts = savedMatchings.reduce((sum, m) => sum + m.totalExperts, 0);
    const avgScore = savedMatchings.length > 0
      ? Math.round(savedMatchings.reduce((sum, m) => sum + m.avgScore, 0) / savedMatchings.length)
      : 0;

    return {
      totalSaved: savedMatchings.length,
      thisMonth,
      totalExperts,
      avgScore,
    };
  }, [savedMatchings]);

  // Delete matching
  const handleDeleteMatching = (matchingId: string) => {
    setSelectedMatchingId(matchingId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedMatchingId) {
      try {
        const updated = savedMatchings.filter(m => m.id !== selectedMatchingId);
        localStorage.setItem('expertsMatchingOrganisationArchive', JSON.stringify(updated));
        setSavedMatchings(updated);
        toast.success(t('expertsMatchingOrganisation.archive.delete.success'));
      } catch (error) {
        toast.error('Error deleting matching');
      }
    }
    setDeleteDialogOpen(false);
    setSelectedMatchingId(null);
  };

  // Toggle expanded matching
  const toggleExpanded = (matchingId: string) => {
    setExpandedMatchingId(expandedMatchingId === matchingId ? null : matchingId);
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Page Banner */}
      <PageBanner
        title={t('expertsMatchingOrganisation.archive.title')}
        subtitle={t('expertsMatchingOrganisation.archive.subtitle')}
        icon={Archive}
      />

      {/* Sub Menu */}
      <ExpertsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title={t('expertsMatchingOrganisation.archive.stats.totalSaved')}
              value={stats.totalSaved.toString()}
              icon={Archive}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-600"
            />

            <StatCard
              title={t('expertsMatchingOrganisation.archive.stats.thisMonth')}
              value={stats.thisMonth.toString()}
              icon={Calendar}
              iconBgColor="bg-green-50"
              iconColor="text-green-600"
            />

            <StatCard
              title={t('expertsMatchingOrganisation.archive.stats.totalExperts')}
              value={stats.totalExperts.toString()}
              icon={Users}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-600"
            />

            <StatCard
              title={t('expertsMatchingOrganisation.archive.stats.avgScore')}
              value={stats.avgScore > 0 ? `${stats.avgScore}%` : '-'}
              icon={Star}
              iconBgColor="bg-orange-50"
              iconColor="text-orange-600"
            />
          </div>

          {/* Filters */}
          <Card className="mb-6 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-4 h-4 text-gray-500" />
                <h3 className="font-semibold text-gray-900">
                  {t('expertsMatchingOrganisation.archive.filters.title')}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={t('expertsMatchingOrganisation.archive.filters.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Date Filter */}
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">{t('expertsMatchingOrganisation.archive.filters.all')}</SelectItem>
                    <SelectItem value="WEEK">{t('expertsMatchingOrganisation.archive.filters.week')}</SelectItem>
                    <SelectItem value="MONTH">{t('expertsMatchingOrganisation.archive.filters.month')}</SelectItem>
                    <SelectItem value="YEAR">{t('expertsMatchingOrganisation.archive.filters.year')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Matchings List */}
          {filteredMatchings.length > 0 ? (
            <div className="space-y-4">
              {filteredMatchings.map((matching) => (
                <Card key={matching.id} className="border-gray-200">
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {matching.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>{format(matching.date, 'dd MMM yyyy HH:mm', { locale: dateLocale })}</span>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 ml-13">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {matching.totalExperts} {t('expertsMatchingOrganisation.archive.results.experts')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {t('expertsMatchingOrganisation.archive.results.avgScore')}: {matching.avgScore}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleExpanded(matching.id)}
                        >
                          {expandedMatchingId === matching.id ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2" />
                              {t('common.close')}
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              {t('expertsMatchingOrganisation.archive.results.viewMatching')}
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMatching(matching.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedMatchingId === matching.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="space-y-3">
                          {matching.results.slice(0, 5).map((expert: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                  <Users className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">
                                    {expert.firstName} {expert.lastName}
                                  </p>
                                  <p className="text-sm text-gray-500">{expert.title}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-lg border font-semibold ${getScoreColor(expert.matchScore)}`}>
                                  {expert.matchScore}%
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/experts/${expert.id}`)}
                                className="ml-3"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}

                          {matching.results.length > 5 && (
                            <p className="text-sm text-gray-500 text-center pt-2">
                              + {matching.results.length - 5} {t('expertsMatchingOrganisation.archive.results.experts')}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Empty State
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Archive className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('expertsMatchingOrganisation.archive.empty.title')}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {t('expertsMatchingOrganisation.archive.empty.description')}
              </p>
              <Button
                onClick={() => navigate('/experts/matching-organisation')}
                className="bg-[#B82547] hover:bg-[#a01f3d] text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {t('expertsMatchingOrganisation.actions.runMatching')}
              </Button>
            </div>
          )}
        </div>
      </PageContainer>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('expertsMatchingOrganisation.archive.delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('expertsMatchingOrganisation.archive.delete.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>{t('expertsMatchingOrganisation.archive.delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {t('expertsMatchingOrganisation.archive.delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}