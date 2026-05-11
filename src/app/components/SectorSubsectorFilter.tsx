// Sector & Subsector Filter Component - Symmetric Two-Column Layout
// Simple design with Assortis red (accent) for selections - No sector icons
import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Briefcase, Check, ArrowRight } from 'lucide-react';
import { SectorEnum, SubSectorEnum, SECTOR_SUBSECTOR_MAP } from '../types/tender.dto';
import { SectorDTO, SubsectorDTO } from '../types/organization.dto';

interface SectorSubsectorFilterProps {
  selectedSectors: SectorDTO[];
  selectedSubSectors: SubsectorDTO[];
  hoveredSector: SectorDTO | null;
  onHoverSector: (sector: SectorDTO | null) => void;
  onSelectSector: (sector: SectorDTO) => void;
  onSelectSubSector: (subSector: SubsectorDTO) => void;
  onSelectAllSectors: () => void;
  onSelectAllSubSectors: (sector: SectorDTO) => void;
  allowedSectors?: SectorDTO[];
  dynamicSubsectorsMap: Record<number, SubsectorDTO[]>;
  t: (key: string) => string;
}

export function SectorSubsectorFilter({
  selectedSectors,
  selectedSubSectors,
  onSelectSector,
  onSelectSubSector,
  onSelectAllSectors,
  dynamicSubsectorsMap,
  allowedSectors,
  
  t
}: SectorSubsectorFilterProps) {
  const [activeSector, setActiveSector] = React.useState<SectorDTO | null>(null);
  const [showAllSectors, setShowAllSectors] = React.useState(false);
  const totalSelected = selectedSubSectors.length;


  React.useEffect(() => {
    if (selectedSectors.length === 0 || (activeSector && !selectedSectors.some(s => s.id === activeSector.id))) {
      setActiveSector(null);
    }
  }, [selectedSectors, activeSector]);

  const handleSectorClick = (sector: SectorDTO) => {
    setActiveSector(sector);
    onSelectSector(sector);
  };

  const handleSelectAllSubsectorsForActiveSector = () => {
    if (!activeSector) return;
    
    const sectorSubs = (dynamicSubsectorsMap && dynamicSubsectorsMap[activeSector.id]) || [];
    const allSelected = sectorSubs.every(sub => selectedSubSectors.some(s => s.id === sub.id));
    
    if (allSelected) {
      sectorSubs.forEach(sub => onSelectSubSector(sub));
    } else {
      sectorSubs.filter(sub => !selectedSubSectors.some(s => s.id === sub.id)).forEach(sub => onSelectSubSector(sub));
    }
  };

  const activeSubsectors = React.useMemo(() => {
    if (!activeSector) return [];
    return (dynamicSubsectorsMap && dynamicSubsectorsMap[activeSector.id]) || [];
  }, [activeSector, dynamicSubsectorsMap]);

  // Limit sectors display to 4 by default
  const allSectors = allowedSectors || [];
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
                    {allSectors.length} {t('filters.available') || 'available'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 px-3 hover:bg-accent/10 hover:text-accent font-semibold"
                onClick={onSelectAllSectors}
              >
                {selectedSectors.length === allSectors.length
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
                const isSelected = selectedSectors.some(s => s.id === sector.id);
                const isActive = activeSector?.id === sector.id;
                const subs = (dynamicSubsectorsMap && dynamicSubsectorsMap[sector.id]) || [];
                const subsectorsCount = subs.length;
                const selectedSubsectorsCount = selectedSubSectors.filter(sub =>
                  subs.some(s => s.id === sub.id)
                ).length;

                return (
                  <div
                    key={sector.id}
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
                              {sector.name}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-xs h-5 px-2 font-medium flex-shrink-0 ${isActive || isSelected
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
                  {activeSubsectors.every(sub => selectedSubSectors.some(s => s.id === sub.id))
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
                    {activeSector.name}
                  </span>
                </div>
                {selectedSubSectors.filter(sub => activeSubsectors.some(s => s.id === sub.id)).length > 0 && (
                  <Badge variant="default" className="bg-accent text-white text-xs h-9 px-3 font-bold">
                    {selectedSubSectors.filter(sub => activeSubsectors.some(s => s.id === sub.id)).length} {t('common.selected')}
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
                  const isSelected = selectedSubSectors.some(s => s.id === subSector.id);
                  const parentSectorSelected = activeSector ? selectedSectors.some(s => s.id === activeSector.id) : false;
                  const isDisabled = !parentSectorSelected;

                  return (
                    <div
                      key={subSector.id}
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
                          {subSector.name}
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