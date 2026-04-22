import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ProjectsSubMenu } from '@app/components/ProjectsSubMenu';
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
import { ContactOrganizationDialog } from '@app/components/ContactOrganizationDialog';
import { toast } from 'sonner';
import { projectsMatchingTranslations } from '@app/i18n/projects-matching';
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
  Mail,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageSquare,
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
  totalProjects: number;
  filters?: any;
}

export default function ProjectsMatchingArchive() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();

  // Merge translations
  const translations = {
    ...projectsMatchingTranslations[language],
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMatchingId, setSelectedMatchingId] = useState<string | null>(null);
  const [expandedMatchingId, setExpandedMatchingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render after contact
  
  // Contact Dialog
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<{
    id: string;
    name: string;
    projectTitle?: string;
  } | null>(null);

  // Get date locale
  const dateLocale = language === 'fr' ? fr : language === 'es' ? es : enUS;

  // Load saved matchings from localStorage
  const [savedMatchings, setSavedMatchings] = useState<SavedMatching[]>([]);

  useEffect(() => {
    loadSavedMatchings();
  }, []);

  const loadSavedMatchings = () => {
    try {
      const saved = localStorage.getItem('projectsMatchingArchive');
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
    const totalProjects = savedMatchings.reduce((sum, m) => sum + m.totalProjects, 0);
    const avgScore = totalProjects > 0
      ? Math.round(savedMatchings.reduce((sum, m) => sum + (m.avgScore * m.totalProjects), 0) / totalProjects)
      : 0;

    return {
      total: savedMatchings.length,
      thisMonth,
      highMatches: totalHighMatches,
      avgScore,
    };
  }, [savedMatchings]);

  // Delete matching
  const handleDeleteMatching = () => {
    if (!selectedMatchingId) return;

    const updatedMatchings = savedMatchings.filter(m => m.id !== selectedMatchingId);
    setSavedMatchings(updatedMatchings);
    
    // Persist to localStorage
    try {
      localStorage.setItem('projectsMatchingArchive', JSON.stringify(updatedMatchings));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
    
    toast.success(translations['projects.matchingDossier.card.deleteSuccess']);
    setDeleteDialogOpen(false);
    setSelectedMatchingId(null);
  };

  const confirmDelete = (matchingId: string) => {
    setSelectedMatchingId(matchingId);
    setDeleteDialogOpen(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    return 'text-orange-600';
  };

  // Get contact history for a project
  const getProjectContactHistory = (projectId: string) => {
    try {
      const history = JSON.parse(localStorage.getItem('projectContactHistory') || '[]');
      return history
        .filter((h: any) => h.projectId === projectId)
        .map((h: any) => ({...h, date: new Date(h.date)}))
        .sort((a: any, b: any) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      console.error('Error loading contact history:', error);
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        title={translations['projects.matchingDossier.title']}
        description={translations['projects.matchingDossier.subtitle']}
        icon={Archive}
        stats={[
          { value: stats.total.toString(), label: translations['projects.matchingDossier.stats.totalSaved'] },
        ]}
      />

      {/* Sub Menu */}
      <ProjectsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* KPIs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
            <StatCard
              title={translations['projects.matchingDossier.stats.totalSaved']}
              value={stats.total.toString()}
              icon={Archive}
              iconBgColor="bg-amber-50"
              iconColor="text-amber-500"
            />
            <StatCard
              title={translations['projects.matchingDossier.stats.thisMonth']}
              value={stats.thisMonth.toString()}
              icon={Calendar}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
            />
            <StatCard
              title={translations['projects.matchingDossier.stats.highMatches']}
              value={stats.highMatches.toString()}
              icon={Star}
              iconBgColor="bg-green-50"
              iconColor="text-green-500"
            />
            <StatCard
              title={translations['projects.matchingDossier.stats.avgScore']}
              value={`${stats.avgScore}%`}
              icon={TrendingUp}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-500"
            />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={translations['projects.matchingDossier.list.searchPlaceholder']}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Date Filter */}
              <div>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">{translations['projects.matchingDossier.list.allDates']}</SelectItem>
                    <SelectItem value="WEEK">{translations['projects.matchingDossier.list.thisWeek']}</SelectItem>
                    <SelectItem value="MONTH">{translations['projects.matchingDossier.list.thisMonth']}</SelectItem>
                    <SelectItem value="YEAR">{translations['projects.matchingDossier.list.thisYear']}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Saved Matchings List */}
          {filteredMatchings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Archive className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary mb-2">
                {translations['projects.matchingDossier.list.empty']}
              </h3>
              <p className="text-muted-foreground mb-4">
                {translations['projects.matchingDossier.list.emptyMessage']}
              </p>
              <Button onClick={() => navigate('/projects/matching')} className="bg-[#B82547] hover:bg-[#9a1d3a]">
                <Sparkles className="w-4 h-4 mr-2" />
                {t('projects.submenu.matching')}
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
                      {matching.filters && matching.filters.notes && (
                        <p className="text-sm text-muted-foreground mb-2">{matching.filters.notes}</p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {translations['projects.matchingDossier.card.savedOn']}{' '}
                          {format(matching.date, 'PPP', { locale: dateLocale })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{matching.totalProjects}</div>
                      <div className="text-xs text-muted-foreground">
                        {translations['projects.matchingDossier.card.projects']}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(matching.avgScore)}`}>
                        {matching.avgScore}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {translations['projects.matchingDossier.card.avgMatch']}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{matching.results.filter((r: any) => r.matchScore >= 80).length}</div>
                      <div className="text-xs text-muted-foreground">High Matches (≥80%)</div>
                    </div>
                  </div>

                  {/* Sample Projects */}
                  {matching.results.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-primary mb-2">Sample Projects:</h4>
                      <div className="space-y-1">
                        {matching.results.slice(0, 2).map((project) => (
                          <div key={project.id} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground truncate flex-1">{project.title}</span>
                            <Badge variant="secondary" className="ml-2">
                              {project.matchScore}%
                            </Badge>
                          </div>
                        ))}
                        {matching.totalProjects > 2 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            + {matching.totalProjects - 2} more projects
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <Star className="w-3 h-3 mr-1" />
                        {matching.results.filter((r: any) => r.matchScore >= 80).length} high matches
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (expandedMatchingId === matching.id) {
                            setExpandedMatchingId(null);
                          } else {
                            setExpandedMatchingId(matching.id);
                          }
                        }}
                      >
                        {expandedMatchingId === matching.id ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-2" />
                            Hide Results
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            {translations['projects.matchingDossier.card.viewResults']}
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => confirmDelete(matching.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {translations['projects.matchingDossier.card.delete']}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Results - Shown directly on the page */}
                  {expandedMatchingId === matching.id && (
                    <div className="mt-6 pt-6 border-t space-y-4">
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{matching.totalProjects}</div>
                          <div className="text-xs text-muted-foreground">
                            {translations['projects.matchingDossier.card.projects']}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getScoreColor(matching.avgScore)}`}>
                            {matching.avgScore}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {translations['projects.matchingDossier.card.avgMatch']}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {matching.results.filter((r: any) => r.matchScore >= 80).length}
                          </div>
                          <div className="text-xs text-muted-foreground">High Matches (≥80%)</div>
                        </div>
                      </div>

                      {/* All Projects List */}
                      <div className="space-y-3" key={refreshKey}>
                        <h4 className="text-sm font-semibold text-gray-900">All Matching Projects:</h4>
                        {matching.results.map((project: any) => {
                          const contactHistory = getProjectContactHistory(project.id);
                          
                          return (
                          <Card key={project.id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900 mb-1">{project.title}</h5>
                                <div className="text-sm text-gray-600 mb-2">{project.description}</div>
                                
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                  <div className="flex items-center gap-1 text-gray-500">
                                    <MapPin className="w-3 h-3" />
                                    <span>{project.location}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-gray-500">
                                    <DollarSign className="w-3 h-3" />
                                    <span>{project.budget?.toLocaleString()} {project.currency}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-gray-500">
                                    <Briefcase className="w-3 h-3" />
                                    <span>{project.type}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
                                    {project.sector}
                                  </Badge>
                                  <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">
                                    {project.status}
                                  </Badge>
                                </div>

                                {/* Contact History Section */}
                                {contactHistory.length > 0 && (
                                  <div className="mt-4 pt-4 border-t">
                                    <div className="flex items-center gap-2 mb-3">
                                      <MessageSquare className="w-4 h-4 text-[#B82547]" />
                                      <h6 className="text-sm font-semibold text-gray-900">
                                        {translations['projects.contact.history.title']}
                                      </h6>
                                      <Badge variant="secondary" className="text-xs">
                                        {contactHistory.length}
                                      </Badge>
                                    </div>
                                    <div className="space-y-3">
                                      {contactHistory.map((contact: any, idx: number) => (
                                        <div
                                          key={idx}
                                          className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                          <div className="flex items-center gap-2 mb-2">
                                            <Clock className="w-3 h-3 text-gray-500" />
                                            <span className="text-xs text-gray-500">
                                              {translations['projects.contact.history.sentOn']}{' '}
                                              {format(contact.date, 'PPP', { locale: dateLocale })}
                                            </span>
                                          </div>
                                          <div className="space-y-1">
                                            <p className="text-sm">
                                              <span className="font-medium text-gray-700">
                                                {translations['projects.contact.history.subject']}
                                              </span>{' '}
                                              <span className="text-gray-900">{contact.subject}</span>
                                            </p>
                                            <p className="text-sm">
                                              <span className="font-medium text-gray-700">
                                                {translations['projects.contact.history.message']}
                                              </span>{' '}
                                              <span className="text-gray-600">{contact.message}</span>
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col items-center gap-2">
                                <div
                                  className={`px-3 py-1 rounded-md border font-bold text-lg ${
                                    project.matchScore >= 80
                                      ? 'text-green-600 bg-green-50 border-green-200'
                                      : project.matchScore >= 60
                                      ? 'text-orange-600 bg-orange-50 border-orange-200'
                                      : 'text-gray-600 bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  {project.matchScore}%
                                </div>
                                <Button
                                  size="sm"
                                  className="bg-[#B82547] hover:bg-[#9a1d3a]"
                                  onClick={() => {
                                    setSelectedOrganization({
                                      id: project.id,
                                      name: project.organizationName || 'World Bank',
                                      projectTitle: project.title,
                                    });
                                    setContactDialogOpen(true);
                                  }}
                                >
                                  <Mail className="w-3 h-3 mr-2" />
                                  {translations['projects.contact.buttonContact']}
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </PageContainer>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{translations['projects.matchingDossier.card.deleteConfirm']}</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this matching from your archive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMatching}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {translations['projects.matchingDossier.card.delete']}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Contact Organization Dialog */}
      <ContactOrganizationDialog
        open={contactDialogOpen}
        onClose={() => setContactDialogOpen(false)}
        onContactSent={() => setRefreshKey(prev => prev + 1)}
        organization={selectedOrganization}
      />
    </div>
  );
}