// Sector & Subsector Filter Component - Symmetric Two-Column Layout
// Simple design with Assortis red (accent) for selections - No sector icons
import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Briefcase, Check, ArrowRight } from 'lucide-react';
import { SectorEnum, SubSectorEnum, SECTOR_SUBSECTOR_MAP } from '../types/tender.dto';

interface SectorSubsectorFilterProps {
  selectedSectors: SectorEnum[];
  selectedSubSectors: SubSectorEnum[];
  hoveredSector: SectorEnum | null;
  onHoverSector: (sector: SectorEnum | null) => void;
  onSelectSector: (sector: SectorEnum) => void;
  onSelectSubSector: (subSector: SubSectorEnum) => void;
  onSelectAllSectors: () => void;
  onSelectAllSubSectors: (sector: SectorEnum) => void;
  t: (key: string) => string;
}

export function SectorSubsectorFilter({
  selectedSectors,
  selectedSubSectors,
  onSelectSector,
  onSelectSubSector,
  onSelectAllSectors,
  t
}: SectorSubsectorFilterProps) {
  const [activeSector, setActiveSector] = React.useState<SectorEnum | null>(null);
  const [showAllSectors, setShowAllSectors] = React.useState(false);
  const totalSelected = selectedSubSectors.length;

  React.useEffect(() => {
    if (selectedSectors.length === 0 || (activeSector && !selectedSectors.includes(activeSector))) {
      setActiveSector(null);
    }
  }, [selectedSectors, activeSector]);

  const handleSectorClick = (sector: SectorEnum) => {
    setActiveSector(sector);
    onSelectSector(sector);
  };

  const handleSelectAllSubsectorsForActiveSector = () => {
    if (!activeSector) return;
    
    const sectorSubs = SECTOR_SUBSECTOR_MAP[activeSector] || [];
    const allSelected = sectorSubs.every(sub => selectedSubSectors.includes(sub));
    
    if (allSelected) {
      sectorSubs.forEach(sub => onSelectSubSector(sub));
    } else {
      sectorSubs.filter(sub => !selectedSubSectors.includes(sub)).forEach(sub => onSelectSubSector(sub));
    }
  };

  const activeSubsectors = activeSector ? (SECTOR_SUBSECTOR_MAP[activeSector] || []) : [];

  // Limit sectors display to 4 by default
  const allSectors = Object.values(SectorEnum);
  const displayedSectors = showAllSectors ? allSectors : allSectors.slice(0, 4);
  const hasMoreSectors = allSectors.length > 4;

  return (
    <div>
      {/* Header with Total Selection Summary */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {t('tenders.filters.sector')} & {t('tenders.filters.subsector')}
            </h3>
            <p className="text-xs text-gray-600">
              {t('filters.selectSectorToViewSubsectors') || 'Select a sector to view its subsectors'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalSelected > 0 && (
            <Badge className="bg-accent text-white px-3 h-8 text-sm font-semibold" variant="default">
              {totalSelected} {t('common.selected')}
            </Badge>
          )}
        </div>
      </div>

      {/* Symmetric Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* LEFT COLUMN - SECTORS */}
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
          {/* Sectors Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    {t('tenders.filters.sector')}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {Object.values(SectorEnum).length} {t('filters.available') || 'available'}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-8 px-3 hover:bg-accent/10 hover:text-accent font-semibold"
                onClick={onSelectAllSectors}
              >
                {selectedSectors.length === Object.values(SectorEnum).length 
                  ? t('filters.unselectAll') 
                  : t('filters.selectAll')}
              </Button>
            </div>
            {selectedSectors.length > 0 && (
              <div className="mt-2">
                <Badge variant="default" className="bg-accent text-white text-xs h-6">
                  {selectedSectors.length} {t('common.selected')}
                </Badge>
              </div>
            )}
          </div>

          {/* Sectors List */}
          <div className="p-3 max-h-[420px] overflow-y-auto">
            <div className="space-y-2">
              {displayedSectors.map((sector) => {
                const isSelected = selectedSectors.includes(sector);
                const isActive = activeSector === sector;
                const subsectorsCount = SECTOR_SUBSECTOR_MAP[sector]?.length || 0;
                const selectedSubsectorsCount = selectedSubSectors.filter(sub => 
                  SECTOR_SUBSECTOR_MAP[sector]?.includes(sub)
                ).length;
                
                return (
                  <div
                    key={sector}
                    className={`
                      group relative rounded-lg cursor-pointer transition-all duration-200
                      ${isActive 
                        ? 'bg-accent/10 border-2 border-accent shadow-lg ring-2 ring-accent/30' 
                        : isSelected
                          ? 'bg-accent/10 border-2 border-accent shadow-md'
                          : 'bg-white border-2 border-gray-200 hover:border-accent/30 hover:shadow-md hover:bg-gray-50'
                      }
                    `}
                    onClick={() => handleSectorClick(sector)}
                  >
                    <div className="p-3">
                      <div className="flex items-center gap-3">
                        {/* Checkbox */}
                        <div className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
                          ${isSelected 
                            ? 'bg-accent border-accent' 
                            : 'border-gray-300 bg-white group-hover:border-accent/50'
                          }
                        `}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={`
                              text-sm font-bold truncate
                              ${isActive || isSelected ? 'text-gray-900' : 'text-gray-700'}
                            `}>
                              {t(`sectors.${sector}`)}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs h-5 px-2 font-medium flex-shrink-0 ${
                                isActive || isSelected 
                                  ? 'border-accent text-accent' 
                                  : 'border-gray-300 text-gray-600'
                              }`}
                            >
                              {subsectorsCount}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {selectedSubsectorsCount > 0 && (
                              <Badge 
                                variant="default" 
                                className="text-xs h-5 px-2 font-bold bg-accent text-white"
                              >
                                {selectedSubsectorsCount} {t('common.selected')}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Active Indicator */}
                        {isActive && (
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                              <ArrowRight className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {hasMoreSectors && !showAllSectors && (
                <div
                  className="group relative rounded-lg cursor-pointer transition-all duration-200 bg-white border-2 border-gray-200 hover:border-accent/30 hover:shadow-md hover:bg-gray-50"
                  onClick={() => setShowAllSectors(true)}
                >
                  <div className="p-3">
                    <div className="flex items-center gap-3">
                      {/* Checkbox */}
                      <div className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all border-gray-300 bg-white group-hover:border-accent/50">
                        {/* No Check */}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-bold truncate text-gray-700">
                            {t('filters.showMore') || 'Show More'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - SUBSECTORS */}
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
          {/* Subsectors Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    {t('tenders.filters.subsector')}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {activeSector 
                      ? `${activeSubsectors.length} ${t('filters.available') || 'available'}`
                      : t('filters.selectSectorFirst') || 'Select a sector first'
                    }
                  </p>
                </div>
              </div>
              {activeSector && activeSubsectors.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-8 px-3 hover:bg-accent/10 hover:text-accent font-semibold"
                  onClick={handleSelectAllSubsectorsForActiveSector}
                >
                  {activeSubsectors.every(sub => selectedSubSectors.includes(sub))
                    ? t('filters.unselectAll') 
                    : t('filters.selectAll')}
                </Button>
              )}
            </div>

            {/* Active Sector Indicator */}
            {activeSector && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border-2 border-accent/30">
                  <Briefcase className="w-4 h-4 text-accent flex-shrink-0" />
                  <span className="text-sm font-bold text-gray-900 truncate">
                    {t(`sectors.${activeSector}`)}
                  </span>
                </div>
                {selectedSubSectors.filter(sub => activeSubsectors.includes(sub)).length > 0 && (
                  <Badge variant="default" className="bg-accent text-white text-xs h-9 px-3 font-bold">
                    {selectedSubSectors.filter(sub => activeSubsectors.includes(sub)).length} {t('common.selected')}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Subsectors List */}
          <div className="p-3 max-h-[420px] overflow-y-auto">
            {activeSector && activeSubsectors.length > 0 ? (
              <div className="space-y-2">
                {activeSubsectors.map((subSector) => {
                  const isSelected = selectedSubSectors.includes(subSector);
                  const parentSectorSelected = activeSector ? selectedSectors.includes(activeSector) : false;
                  const isDisabled = !parentSectorSelected;
                  
                  return (
                    <div
                      key={subSector}
                      className={`
                        group rounded-lg transition-all duration-200
                        ${isDisabled 
                          ? 'cursor-not-allowed opacity-50' 
                          : 'cursor-pointer'
                        }
                        ${isSelected 
                          ? 'bg-accent/5 border-2 border-accent/70 shadow-md' 
                          : 'bg-white border-2 border-gray-200 hover:border-accent/30 hover:shadow-md'
                        }
                      `}
                      onClick={() => {
                        if (!isDisabled) {
                          onSelectSubSector(subSector);
                        }
                      }}
                      title={isDisabled ? t('filters.selectParentSectorFirst') : ''}
                    >
                      <div className="p-3 flex items-center gap-3">
                        <div className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
                          ${isSelected 
                            ? 'bg-accent border-accent' 
                            : isDisabled
                              ? 'border-gray-200 bg-gray-100'
                              : 'border-gray-300 bg-white group-hover:border-accent/50'
                          }
                        `}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </div>
                        <span className={`
                          text-sm font-semibold flex-1
                          ${isSelected ? 'text-gray-900' : isDisabled ? 'text-gray-400' : 'text-gray-700'}
                        `}>
                          {t(`subsectors.${subSector}`)}
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-accent flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="flex items-center justify-center h-[372px]">
                <div className="text-center max-w-xs px-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <Briefcase className="w-10 h-10 text-gray-400" />
                  </div>
                  <h5 className="text-base font-bold text-gray-900 mb-2">
                    {t('filters.selectSectorToViewSubsectors') || 'Select a sector'}
                  </h5>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {t('filters.clickSectorLeftToSeeSubsectors') || 'Click on a sector from the left column to view and select its subsectors'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}