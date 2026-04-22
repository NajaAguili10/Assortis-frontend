import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TrainingSubMenu } from '@app/components/TrainingSubMenu';
import { SectorSubsectorFilter } from '@app/components/SectorSubsectorFilter';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import { useTraining } from '@app/hooks/useTraining';
import { useTrainingCommerce } from '@app/contexts/TrainingCommerceContext';
import { TrainingLevelEnum, CertificationStatusEnum } from '@app/types/training.dto';
import { SectorEnum, SubSectorEnum, SECTOR_SUBSECTOR_MAP } from '@app/types/tender.dto';
import {
  GraduationCap,
  BookOpen,
  FolderKanban,
  Video,
  Award,
  Search,
  ChevronDown,
  CheckCircle,
  X,
  Calendar,
  TrendingUp,
  Download,
  Target,
  Repeat,
  AlertCircle,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

export default function TrainingCertifications() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { certifications, kpis, filters, updateFilters, clearFilters, activeFiltersCount } = useTraining();
  const { completedTrainings } = useTrainingCommerce();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<SectorEnum[]>([]);
  const [selectedSubSectors, setSelectedSubSectors] = useState<SubSectorEnum[]>([]);
  const [hoveredSector, setHoveredSector] = useState<SectorEnum | null>(null);

  const availableSubsectors = useMemo(() => {
    if (!hoveredSector) return [];
    return SECTOR_SUBSECTOR_MAP[hoveredSector] || [];
  }, [hoveredSector]);

  // Real-time search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ searchQuery: searchQuery.trim() || undefined });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, updateFilters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ searchQuery: searchQuery.trim() || undefined });
  };

  const handleLevelFilter = (level: TrainingLevelEnum) => {
    const currentLevels = filters.level || [];
    const newLevels = currentLevels.includes(level)
      ? currentLevels.filter(l => l !== level)
      : [...currentLevels, level];
    updateFilters({ level: newLevels.length > 0 ? newLevels : undefined });
  };

  const handleSectorFilter = (sector: SectorEnum) => {
    const currentSectors = filters.sector || [];
    const newSectors = currentSectors.includes(sector)
      ? currentSectors.filter(s => s !== sector)
      : [...currentSectors, sector];
    updateFilters({ sector: newSectors.length > 0 ? newSectors : undefined });
    
    if (currentSectors.includes(sector)) {
      setSelectedSectors(selectedSectors.filter(s => s !== sector));
    } else {
      setSelectedSectors([...selectedSectors, sector]);
    }
  };

  const handleSubsectorFilter = (subsector: SubSectorEnum) => {
    const currentSubsectors = filters.subsector || [];
    const newSubsectors = currentSubsectors.includes(subsector)
      ? currentSubsectors.filter(s => s !== subsector)
      : [...currentSubsectors, subsector];
    updateFilters({ subsector: newSubsectors.length > 0 ? newSubsectors : undefined });
  };

  const handleStatusFilter = (status: CertificationStatusEnum) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    updateFilters({ status: newStatuses.length > 0 ? newStatuses : undefined });
  };

  const getCertStatusColor = (status: CertificationStatusEnum | undefined) => {
    if (!status) return '';
    switch (status) {
      case CertificationStatusEnum.NOT_STARTED:
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case CertificationStatusEnum.IN_PROGRESS:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case CertificationStatusEnum.PASSED:
        return 'bg-green-50 text-green-700 border-green-200';
      case CertificationStatusEnum.FAILED:
        return 'bg-red-50 text-red-700 border-red-200';
      case CertificationStatusEnum.EXPIRED:
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return '';
    }
  };

  const handleDownloadCertificate = async (cert: any) => {
    const loadingToast = toast.loading(t('training.certifications.download.loading'));

    try {
      // Simuler le téléchargement (dans un cas réel, appel API)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simuler la création d'un PDF
      const blob = new Blob(['PDF Certificate Content'], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificate_${cert.title.replace(/\s+/g, '_')}_${cert.credentialId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(t('training.certifications.download.success'), {
        id: loadingToast,
        duration: 3000,
      });
    } catch (error) {
      toast.error(t('training.certifications.download.error'), {
        id: loadingToast,
        duration: 4000,
      });
    }
  };

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('training.hub.title')}
        description={t('training.hub.subtitle')}
        icon={GraduationCap}
        stats={[
          { value: kpis.enrolledPrograms.toString(), label: t('training.stats.enrolledPrograms') }
        ]}
      />

      {/* Sub Menu */}
      <TrainingSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">{t('training.certificatesHistory.title')}</h2>
            <p className="text-muted-foreground">{t('training.certificatesHistory.subtitle')}</p>
          </div>

          <div className="bg-white rounded-lg border p-5 mb-6">
            <h3 className="text-lg font-semibold text-primary mb-3">{t('training.certificatesHistory.completedTrainings')}</h3>
            {completedTrainings.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('training.certificatesHistory.noCompleted')}</p>
            ) : (
              <div className="space-y-3">
                {completedTrainings.map((item) => (
                  <div key={item.courseId} className="border rounded-lg p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-primary">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('training.certificatesHistory.completedOn')} {item.completionDate ? new Date(item.completionDate).toLocaleDateString() : '-'}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {t('training.status.COMPLETED')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Horizontal Filters */}
          <div className="bg-white rounded-lg border p-4 mb-6">
            <div className="flex flex-col gap-4">
              {/* Search + Filter Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <form onSubmit={handleSearch} className="flex gap-2 flex-1 w-full sm:max-w-md">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('training.filters.search')}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Search className="w-4 h-4" />
                  </Button>
                </form>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Level Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Target className="w-4 h-4 mr-2" />
                        {t('training.filters.level')}
                        {filters.level && filters.level.length > 0 && (
                          <Badge className="ml-2" variant="secondary">{filters.level.length}</Badge>
                        )}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="start">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm mb-3">{t('training.filters.level')}</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {Object.values(TrainingLevelEnum).map((level) => (
                            <Button
                              key={level}
                              variant={filters.level?.includes(level) ? "default" : "outline"}
                              size="sm"
                              className="w-full justify-start text-xs"
                              onClick={() => handleLevelFilter(level)}
                            >
                              {filters.level?.includes(level) && <CheckCircle className="w-3 h-3 mr-2" />}
                              {t(`training.level.${level}`)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Status Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Award className="w-4 h-4 mr-2" />
                        {t('training.filters.status')}
                        {filters.status && filters.status.length > 0 && (
                          <Badge className="ml-2" variant="secondary">{filters.status.length}</Badge>
                        )}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="start">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm mb-3">{t('training.filters.status')}</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {Object.values(CertificationStatusEnum).map((status) => (
                            <Button
                              key={status}
                              variant={filters.status?.includes(status) ? "default" : "outline"}
                              size="sm"
                              className="w-full justify-start text-xs"
                              onClick={() => handleStatusFilter(status)}
                            >
                              {filters.status?.includes(status) && <CheckCircle className="w-3 h-3 mr-2" />}
                              {t(`training.certStatus.${status}`)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-1" />
                      {t('training.filters.clear')}
                    </Button>
                  )}
                </div>
              </div>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">{t('common.filter')}:</span>
                  {filters.level?.map((level) => (
                    <Badge key={level} variant="secondary" className="gap-1">
                      {t(`training.level.${level}`)}
                      <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleLevelFilter(level)} />
                    </Badge>
                  ))}
                  {filters.status?.map((status) => (
                    <Badge key={status} variant="secondary" className="gap-1">
                      {t(`training.certStatus.${status}`)}
                      <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleStatusFilter(status)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sector & Subsector Filter - NEW ASSORTIS DESIGN */}
          <div className="mb-6">
            <SectorSubsectorFilter
              selectedSectors={selectedSectors}
              selectedSubSectors={selectedSubSectors}
              hoveredSector={hoveredSector}
              onHoverSector={setHoveredSector}
              onSelectSector={handleSectorFilter}
              onSelectSubSector={handleSubsectorFilter}
              onSelectAllSectors={() => {
                const allSectors = Object.values(SectorEnum);
                const allSelected = allSectors.every(s => selectedSectors.includes(s));
                if (allSelected) {
                  allSectors.forEach(s => handleSectorFilter(s));
                } else {
                  allSectors.filter(s => !selectedSectors.includes(s)).forEach(s => handleSectorFilter(s));
                }
              }}
              onSelectAllSubSectors={(sector: SectorEnum) => {
                const sectorSubs = SECTOR_SUBSECTOR_MAP[sector] || [];
                const allSelected = sectorSubs.every(sub => selectedSubSectors.includes(sub));
                if (allSelected) {
                  sectorSubs.forEach(sub => handleSubsectorFilter(sub));
                } else {
                  sectorSubs.filter(sub => !selectedSubSectors.includes(sub)).forEach(sub => handleSubsectorFilter(sub));
                }
              }}
              t={t}
            />
          </div>

          {/* Certifications Grid */}
          {certifications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications.map((cert) => (
                <div key={cert.id} className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {t(`training.level.${cert.level}`)}
                      </Badge>
                      {cert.status && (
                        <Badge variant="outline" className={getCertStatusColor(cert.status)}>
                          {t(`training.certStatus.${cert.status}`)}
                        </Badge>
                      )}
                    </div>
                    <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mb-3">
                      <Award className="w-6 h-6 text-yellow-500" />
                    </div>
                    <h3 className="font-semibold text-primary mb-2">{cert.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{cert.description}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('training.certifications.issuer')}:</span>
                      <span className="text-primary font-medium text-xs">{cert.issuer}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {t('training.certifications.validity')}:
                      </span>
                      <span className="text-primary font-medium">
                        {cert.validityPeriod === 0 ? t('training.certifications.lifetime') : `${cert.validityPeriod} ${t('training.certifications.months')}`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {t('training.certifications.passingScore')}:
                      </span>
                      <span className="text-primary font-semibold">{cert.passingScore}%</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {t('training.certifications.examDuration')}:
                      </span>
                      <span className="text-primary">{cert.examDuration} {t('training.certifications.minutes')}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Repeat className="w-4 h-4" />
                        {t('training.certifications.attempts')}:
                      </span>
                      <span className="text-primary">{cert.attempts}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <span className="text-2xl font-bold text-primary">${cert.price}</span>
                    </div>
                  </div>

                  {/* Requirements */}
                  {cert.requirements.length > 0 && (
                    <div className="mb-4">
                      <span className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {t('training.certifications.requirements')}:
                      </span>
                      <ul className="space-y-1 mt-2">
                        {cert.requirements.slice(0, 2).map((req, index) => (
                          <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Earned Certification Details */}
                  {cert.status === CertificationStatusEnum.PASSED && cert.credentialId && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                      <p className="text-xs font-medium text-green-700 mb-1">{t('training.certifications.credentialId')}:</p>
                      <p className="text-sm font-semibold text-green-900">{cert.credentialId}</p>
                      {cert.earnedDate && (
                        <p className="text-xs text-green-600 mt-1">
                          {t('training.certifications.earnedDate')}: {new Date(cert.earnedDate).toLocaleDateString()}
                        </p>
                      )}
                      {cert.expiryDate && (
                        <p className="text-xs text-green-600">
                          {t('training.certifications.expiryDate')}: {new Date(cert.expiryDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {cert.status === CertificationStatusEnum.PASSED ? (
                      <>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex-1 bg-[#B82547] hover:bg-[#a01f3c] text-white" 
                          onClick={() => handleDownloadCertificate(cert)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {t('training.actions.downloadCertificate')}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate(`/training/certification-details/${cert.id}`)}
                        >
                          {t('actions.viewDetails')}
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="w-full bg-[#B82547] hover:bg-[#a01f3c] text-white"
                        onClick={() => navigate(`/training/certification-enroll/${cert.id}`)}
                      >
                        {t('training.actions.enroll')}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-primary mb-1">{t('training.certifications.noResults')}</h3>
              <p className="text-sm text-muted-foreground">{t('training.certifications.noResults.message')}</p>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}