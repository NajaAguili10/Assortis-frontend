// Project Sector & Subsector Filter Component - Symmetric Two-Column Layout
// Simple design with Assortis red (accent) for selections - No sector icons
import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Briefcase, Check, ArrowRight } from 'lucide-react';
import { ProjectSectorEnum, PROJECT_SUBSECTORS } from '../types/project.dto';

interface ProjectSectorSubsectorFilterProps {
  selectedSectors: ProjectSectorEnum[];
  selectedSubSectors: string[];
  hoveredSector: ProjectSectorEnum | null;
  onHoverSector: (sector: ProjectSectorEnum | null) => void;
  onSelectSector: (sector: ProjectSectorEnum) => void;
  onSelectSubSector: (subSector: string) => void;
  onSelectAllSectors: () => void;
  onSelectAllSubSectors: (sector: ProjectSectorEnum) => void;
  t: (key: string) => string;
}

export function ProjectSectorSubsectorFilter({
  selectedSectors,
  selectedSubSectors,
  onSelectSector,
  onSelectSubSector,
  onSelectAllSectors,
  t
}: ProjectSectorSubsectorFilterProps) {
  const [activeSector, setActiveSector] = React.useState<ProjectSectorEnum | null>(null);
  const [showAllSectors, setShowAllSectors] = React.useState(false);
  const totalSelected = selectedSectors.length + selectedSubSectors.length;

  const handleSectorClick = (sector: ProjectSectorEnum) => {
    setActiveSector(sector);
    onSelectSector(sector);
  };

  const handleSelectAllSubsectorsForActiveSector = () => {
    if (!activeSector) return;
    
    const sectorSubs = PROJECT_SUBSECTORS[activeSector] || [];
    const allSelected = sectorSubs.every(sub => selectedSubSectors.includes(sub));
    
    if (allSelected) {
      sectorSubs.forEach(sub => onSelectSubSector(sub));
    } else {
      sectorSubs.filter(sub => !selectedSubSectors.includes(sub)).forEach(sub => onSelectSubSector(sub));
    }
  };

  const sectors = Object.values(ProjectSectorEnum);
  const visibleSectors = showAllSectors ? sectors : sectors.slice(0, 6);
  const hasMoreSectors = sectors.length > 6;

  // Get subsectors for display
  const displayedSubsectors = activeSector ? PROJECT_SUBSECTORS[activeSector] || [] : [];
  const selectedSubsectorsInActiveSector = displayedSubsectors.filter(sub => selectedSubSectors.includes(sub));
  const allSubsectorsSelected = displayedSubsectors.length > 0 && displayedSubsectors.every(sub => selectedSubSectors.includes(sub));

  return (
    <div className="w-full">
      {/* Header with title and counts */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Briefcase className="w-5 h-5 text-gray-600" />
          <label className="text-sm font-medium text-gray-700">
            {t('projects.filters.sector')} {t('common.and')} {t('projects.filters.subsector')}
          </label>
          {totalSelected > 0 && (
            <Badge variant="secondary" className="ml-2">
              {totalSelected}
            </Badge>
          )}
        </div>
      </div>

      {/* Two-column symmetric layout */}
      <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
        {/* LEFT COLUMN - Sectors */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">
              {t('projects.filters.sector')}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSelectAllSectors}
              className="h-7 text-xs text-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10"
            >
              {selectedSectors.length === sectors.length ? t('filters.deselectAll') : t('filters.selectAll')}
            </Button>
          </div>

          <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-2">
            {visibleSectors.map((sector) => {
              const isSelected = selectedSectors.includes(sector);
              const isActive = activeSector === sector;
              const subsectorCount = PROJECT_SUBSECTORS[sector]?.length || 0;
              const selectedCount = PROJECT_SUBSECTORS[sector]?.filter(sub => selectedSubSectors.includes(sub)).length || 0;

              return (
                <div key={sector} className="relative">
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSectorClick(sector)}
                    className={`
                      w-full justify-start text-left text-xs h-9 px-3 gap-2
                      ${isSelected ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 border-[var(--accent)]' : 'hover:border-gray-300'}
                      ${isActive && !isSelected ? 'border-[var(--accent)] bg-[var(--accent)]/5' : ''}
                      transition-all duration-150
                    `}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                    <span className="flex-1 truncate">{t(`projects.sector.${sector}`)}</span>
                    {subsectorCount > 0 && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {selectedCount > 0 && (
                          <Badge 
                            variant="secondary" 
                            className={`h-5 px-1.5 text-[10px] ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100'}`}
                          >
                            {selectedCount}/{subsectorCount}
                          </Badge>
                        )}
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                      </div>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Show more/less toggle */}
          {hasMoreSectors && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllSectors(!showAllSectors)}
              className="w-full mt-2 text-xs text-gray-600 hover:text-[var(--accent)]"
            >
              {showAllSectors ? t('filters.showLess') : `${t('filters.showMore')} (${sectors.length - 6})`}
            </Button>
          )}
        </div>

        {/* RIGHT COLUMN - Subsectors */}
        <div className="space-y-2 border-l border-gray-200 pl-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">
              {t('projects.filters.subsector')}
            </h4>
            {activeSector && displayedSubsectors.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAllSubsectorsForActiveSector}
                className="h-7 text-xs text-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10"
              >
                {allSubsectorsSelected ? t('filters.deselectAll') : t('filters.selectAll')}
              </Button>
            )}
          </div>

          <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-2">
            {!activeSector ? (
              <div className="text-center py-12 text-sm text-gray-400">
                {t('filters.selectSectorFirst')}
              </div>
            ) : displayedSubsectors.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-400">
                {t('filters.noSubSectors')}
              </div>
            ) : (
              displayedSubsectors.map((subsector) => {
                const isSelected = selectedSubSectors.includes(subsector);
                
                return (
                  <Button
                    key={subsector}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSelectSubSector(subsector)}
                    className={`
                      w-full justify-start text-left text-xs h-9 px-3 gap-2
                      ${isSelected ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 border-[var(--accent)]' : 'hover:border-gray-300'}
                      transition-all duration-150
                    `}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                    <span className="flex-1 truncate">{t(`subsectors.${subsector}`)}</span>
                  </Button>
                );
              })
            )}
          </div>

          {/* Help text */}
          {activeSector && selectedSubsectorsInActiveSector.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {selectedSubsectorsInActiveSector.length} {t('filters.subsectorsSelected')} {t('common.in')} {t(`projects.sector.${activeSector}`)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
