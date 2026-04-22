import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ExpertsSubMenu } from '@app/components/ExpertsSubMenu';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import { Input } from '@app/components/ui/input';
import { Progress } from '@app/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';
import {
  Users,
  FileText,
  Download,
  Database,
  UserCircle,
  UserCheck,
  Settings,
  MapPin,
  Briefcase,
  GraduationCap,
  Languages,
  FileDown,
  Award,
  Star,
  Search,
  X,
  Filter,
  ChevronDown,
  CheckCircle,
  Target,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { expertsDataService, ExpertProfile } from '@app/modules/expert/services/expertsData.service';
import { generateCV, CVTemplate, CVFormat } from '@app/modules/expert/services/cvGenerator.service';

// Maximum number of CV downloads allowed per session
const MAX_DOWNLOADS = 5;

// Modèles de CV populaires uniquement - cohérents avec Mon Espace/Mon CV
const cvTemplates = [
  { id: 'world-bank' as CVTemplate, name: 'World Bank CV', popular: true },
  { id: 'giz' as CVTemplate, name: 'GIZ CV', popular: true },
  { id: 'usaid' as CVTemplate, name: 'USAID CV', popular: true },
  { id: 'undp' as CVTemplate, name: 'UNDP CV', popular: true },
  { id: 'standard' as CVTemplate, name: 'Standard Professional CV', popular: true },
];

const availabilityOptions = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'PARTIALLY_AVAILABLE', label: 'Partially Available' },
  { value: 'NOT_AVAILABLE', label: 'Not Available' },
];

export default function ExpertsCVTemplates() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [generatingExpert, setGeneratingExpert] = useState<string | null>(null);
  const [downloadCount, setDownloadCount] = useState(0);

  // Load experts from service
  useEffect(() => {
    const loadedExperts = expertsDataService.getAllExperts();
    setExperts(loadedExperts);
  }, []);

  const filteredExperts = experts.filter(expert => {
    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const fullName = `${expert.firstName} ${expert.lastName}`.toLowerCase();
      const titleMatch = expert.title?.toLowerCase().includes(query);
      const locationMatch = expert.location?.toLowerCase().includes(query);
      
      if (!fullName.includes(query) && !titleMatch && !locationMatch) {
        return false;
      }
    }

    // Availability filter
    if (selectedAvailability.length > 0) {
      if (!selectedAvailability.includes(expert.availability)) {
        return false;
      }
    }

    return true;
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleAvailabilityFilter = (availability: string) => {
    const newAvailability = selectedAvailability.includes(availability)
      ? selectedAvailability.filter(a => a !== availability)
      : [...selectedAvailability, availability];
    setSelectedAvailability(newAvailability);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedAvailability([]);
  };

  const activeFiltersCount = selectedAvailability.length;

  const handleGenerateCV = (expertId: string, templateId: string, format: CVFormat) => {
    const expert = experts.find(e => e.id === expertId);
    const template = cvTemplates.find(t => t.id === templateId);
    if (!expert || !template) return;

    setGeneratingExpert(expertId);

    const formatLabel = format === 'pdf' ? 'PDF' : 'Word';
    const expertName = `${expert.firstName} ${expert.lastName}`;
    
    toast.success(t('experts.cvTemplates.generate.started'), {
      description: t('experts.cvTemplates.generate.expertTemplate', { 
        expert: expertName, 
        template: template.name,
        format: formatLabel 
      }),
    });

    // Small delay to show the loading state
    setTimeout(() => {
      try {
        // Generate and download CV
        generateCV(expert, templateId as CVTemplate, format);
        
        setGeneratingExpert(null);
        toast.success(t('experts.cvTemplates.generate.ready'), {
          description: t('experts.cvTemplates.generate.downloadReady'),
          icon: <Download className="w-4 h-4" />,
        });
        setDownloadCount(downloadCount + 1);
      } catch (error: any) {
        setGeneratingExpert(null);
        toast.error('Generation Error', {
          description: error?.message || 'Failed to generate CV',
        });
      }
    }, 500);
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'AVAILABLE':
        return {
          label: t('experts.cvTemplates.availability.available'),
          className: 'bg-green-50 text-green-700 border-green-200'
        };
      case 'PARTIALLY_AVAILABLE':
        return {
          label: t('experts.cvTemplates.availability.partiallyAvailable'),
          className: 'bg-yellow-50 text-yellow-700 border-yellow-200'
        };
      case 'NOT_AVAILABLE':
        return {
          label: t('experts.cvTemplates.availability.notAvailable'),
          className: 'bg-orange-50 text-orange-700 border-orange-200'
        };
      default:
        return {
          label: availability,
          className: 'bg-gray-50 text-gray-700 border-gray-200'
        };
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'JUNIOR':
        return { label: 'Junior', className: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'INTERMEDIATE':
        return { label: 'Intermediate', className: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      case 'SENIOR':
        return { label: 'Senior', className: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'EXPERT':
        return { label: 'Expert', className: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: level, className: 'bg-gray-50 text-gray-700 border-gray-200' };
    }
  };

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <PageBanner
        title={t('experts.hub.title')}
        description={t('experts.hub.subtitle')}
        icon={Users}
        stats={[
          { value: '3,847', label: t('experts.stats.available') },
          { value: '2,891', label: t('experts.stats.activeProfiles') },
          { value: '34', label: t('experts.stats.pendingInvitations') }
        ]}
      />

      {/* Sub Menu */}
      <ExpertsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <Separator className="my-6" />

          {/* Horizontal Filters Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-primary">
                  {t('tenders.list.filters')}
                </h3>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">{activeFiltersCount}</Badge>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="w-4 h-4 mr-1" />
                  {t('filters.clear')}
                </Button>
              )}
            </div>

            {/* Search Row */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t('common.search')}
              </label>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={t('experts.cvTemplates.filters.search')}
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            </div>

            {/* Filters Row - Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Availability Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {t('experts.filters.availability')}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <UserCheck className="w-4 h-4 mr-2" />
                      {selectedAvailability.length > 0 
                        ? t(`experts.cvTemplates.availability.${selectedAvailability[0].toLowerCase()}`)
                        : t('experts.filters.availability')}
                      {selectedAvailability.length > 0 && (
                        <Badge className="ml-auto" variant="secondary">
                          {selectedAvailability.length}
                        </Badge>
                      )}
                      <ChevronDown className="w-4 h-4 ml-auto" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72" align="start">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm mb-3">{t('experts.filters.availability')}</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {availabilityOptions.map((option) => (
                          <Button
                            key={option.value}
                            variant={selectedAvailability.includes(option.value) ? "default" : "outline"}
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => handleAvailabilityFilter(option.value)}
                          >
                            {selectedAvailability.includes(option.value) && <CheckCircle className="w-3 h-3 mr-2" />}
                            {t(`experts.cvTemplates.availability.${option.value.toLowerCase()}`)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Results Count */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {t('common.results')}
                </label>
                <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center text-sm text-muted-foreground">
                  {filteredExperts.length} {t('experts.cvTemplates.filters.expertsFound')}
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="mt-5 pt-5 border-t border-gray-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-700">
                    {t('filters.active')}:
                  </span>
                  {selectedAvailability.map((availability) => (
                    <Badge key={availability} variant="secondary" className="gap-1">
                      {t(`experts.cvTemplates.availability.${availability.toLowerCase()}`)}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-destructive"
                        onClick={() => handleAvailabilityFilter(availability)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* CV Download Limit Information Panel */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <Download className="w-5 h-5 text-[#B82547]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#3d4654]">
                    {t('cvDownload.limit.available')}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {MAX_DOWNLOADS - downloadCount} / {MAX_DOWNLOADS} {t('cvDownload.limit.remaining').toLowerCase()}
                  </p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={`
                  ${downloadCount >= MAX_DOWNLOADS 
                    ? 'bg-red-50 text-red-700 border-red-200' 
                    : downloadCount >= MAX_DOWNLOADS - 1
                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'}
                `}
              >
                {downloadCount} {t('cvDownload.limit.used')}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <Progress 
                value={(downloadCount / MAX_DOWNLOADS) * 100} 
                className="h-2"
              />
            </div>

            {/* Status Messages */}
            {downloadCount >= MAX_DOWNLOADS && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-red-700">
                    {t('cvDownload.limit.reached.title')}
                  </p>
                  <p className="text-xs text-red-600 mt-0.5">
                    {t('cvDownload.limit.reached.description').replace('{max}', MAX_DOWNLOADS.toString())}
                  </p>
                </div>
              </div>
            )}
            
            {downloadCount === MAX_DOWNLOADS - 1 && downloadCount > 0 && (
              <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-orange-700">
                    {t('cvDownload.limit.warning.title')}
                  </p>
                  <p className="text-xs text-orange-600 mt-0.5">
                    {t('cvDownload.limit.warning.description').replace('{remaining}', (MAX_DOWNLOADS - downloadCount).toString())}
                  </p>
                </div>
              </div>
            )}

            {downloadCount < MAX_DOWNLOADS - 1 && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-blue-700">
                    {t('cvDownload.limit.info.title')}
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    {t('cvDownload.limit.info.description')
                      .replace('{max}', MAX_DOWNLOADS.toString())
                      .replace('{remaining}', (MAX_DOWNLOADS - downloadCount).toString())}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Expert Profiles Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredExperts.map((expert) => {
              const availabilityBadge = getAvailabilityBadge(expert.availability);
              const levelBadge = getLevelBadge(expert.level);
              
              return (
                <div
                  key={expert.id}
                  className="bg-white rounded-lg border hover:border-primary/50 hover:shadow-md transition-all duration-200"
                >
                  <div className="p-5">
                    {/* Expert Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center flex-shrink-0">
                        {expert.profilePhoto ? (
                          <img 
                            src={expert.profilePhoto} 
                            alt="Expert profile"
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <UserCircle className="w-10 h-10 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-foreground mb-1 truncate">
                          {/* Nom masqué pour confidentialité */}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2 truncate">{expert.title}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge 
                            variant="outline" 
                            className={availabilityBadge.className}
                          >
                            {availabilityBadge.label}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={levelBadge.className}
                          >
                            {levelBadge.label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Expert Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground truncate">{expert.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground">{expert.yearsExperience} {t('experts.cvTemplates.profile.experience')}</span>
                      </div>
                      {expert.education.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <GraduationCap className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-foreground truncate">
                            {expert.education[0].degree} - {expert.education[0].field}
                          </span>
                        </div>
                      )}
                      {expert.languages.length > 0 && (
                        <div className="flex items-start gap-2 text-sm">
                          <Languages className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <span className="text-foreground">
                            {expert.languages.map(lang => lang.name).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {expert.skills.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          {t('experts.cvTemplates.profile.skills')}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {expert.skills.slice(0, 4).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              {skill}
                            </Badge>
                          ))}
                          {expert.skills.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{expert.skills.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    {(expert.rating !== undefined || expert.completedProjects !== undefined) && (
                      <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                        {expert.rating !== undefined && (
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">{t('experts.cvTemplates.profile.rating')}</p>
                            <p className="text-lg font-bold text-foreground flex items-center justify-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              {expert.rating.toFixed(1)}
                            </p>
                          </div>
                        )}
                        {expert.completedProjects !== undefined && (
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">{t('experts.cvTemplates.profile.projects')}</p>
                            <p className="text-lg font-bold text-foreground">{expert.completedProjects}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Sectors */}
                    {expert.sectors.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          {t('experts.cvTemplates.profile.sectors')}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {expert.sectors.map((sector, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                              {sector}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator className="my-4" />

                    {/* CV Generation Section */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-foreground">
                        {t('experts.cvTemplates.generate.title')}
                      </p>

                      {/* Template Selection with Dropdown */}
                      <Select 
                        onValueChange={(templateId) => handleGenerateCV(expert.id, templateId, 'pdf')}
                        disabled={generatingExpert === expert.id || downloadCount >= MAX_DOWNLOADS}
                      >
                        <SelectTrigger className="w-full">
                          <FileText className="w-4 h-4 mr-2" />
                          <SelectValue placeholder={t('experts.cvTemplates.generate.selectTemplate')} />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                            {t('experts.cvTemplates.generate.popularTemplates')}
                          </div>
                          {cvTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => handleGenerateCV(expert.id, 'world-bank', 'pdf')}
                          variant="outline"
                          size="sm"
                          disabled={generatingExpert === expert.id || downloadCount >= MAX_DOWNLOADS}
                          className="w-full"
                        >
                          {generatingExpert === expert.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                              {t('experts.cvTemplates.action.generating')}
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              PDF
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleGenerateCV(expert.id, 'world-bank', 'word')}
                          className="w-full bg-primary hover:bg-primary/90"
                          size="sm"
                          disabled={generatingExpert === expert.id || downloadCount >= MAX_DOWNLOADS}
                        >
                          {generatingExpert === expert.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              {t('experts.cvTemplates.action.generating')}
                            </>
                          ) : (
                            <>
                              <FileDown className="w-4 h-4 mr-2" />
                              Word
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredExperts.length === 0 && (
            <div className="bg-white rounded-lg border p-12 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t('experts.cvTemplates.empty.title')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('experts.cvTemplates.empty.description')}
              </p>
              <Button
                onClick={() => navigate('/experts/create-account')}
                className="bg-primary hover:bg-primary/90"
              >
                {t('experts.cvTemplates.empty.createExpert')}
              </Button>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}