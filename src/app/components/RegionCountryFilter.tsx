// Region & Country Filter Component - Symmetric Two-Column Layout
// Same design as SectorSubsectorFilter with Assortis red (accent) for selections
import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Globe, Check, ArrowRight } from 'lucide-react';
import { RegionEnum, CountryEnum, REGION_COUNTRY_MAP } from '../types/tender.dto';
import { CountryDTO } from '../types/organization.dto';

interface RegionCountryFilterProps {
  selectedCountries: CountryDTO[];
  onSelectCountry: (country: CountryDTO) => void;
  allowedCountries?: CountryDTO[];
  t: (key: string) => string;
}

export function RegionCountryFilter({
  selectedCountries,
  onSelectCountry,
  allowedCountries,
  t
}: RegionCountryFilterProps) {
  const [activeRegion, setActiveRegion] = React.useState<RegionEnum | null>(null);
  const [showAllRegions, setShowAllRegions] = React.useState(false);
  const totalSelected = selectedCountries.length;

  const handleRegionClick = (region: RegionEnum) => {
    setActiveRegion(prev => prev === region ? null : region);
  };

  const handleSelectAllCountriesForActiveRegion = () => {
    if (!activeRegion) return;
    
    const regionCountryCodes = REGION_COUNTRY_MAP[activeRegion] || [];
    const filterableCountries = allowedCountries 
      ? allowedCountries.filter(c => regionCountryCodes.includes(c.code as CountryEnum))
      : [];

    const allSelected = filterableCountries.every(country => selectedCountries.some(s => s.id === country.id));
    
    if (allSelected) {
      filterableCountries.forEach(country => onSelectCountry(country));
    } else {
      filterableCountries.filter(country => !selectedCountries.some(s => s.id === country.id)).forEach(country => onSelectCountry(country));
    }
  };

  const activeCountries = React.useMemo(() => {
    if (!activeRegion) return [];
    const regionCountryCodes = REGION_COUNTRY_MAP[activeRegion] || [];
    if (!allowedCountries) return [];
    return allowedCountries.filter(c => regionCountryCodes.includes(c.code as CountryEnum));
  }, [activeRegion, allowedCountries]);

  // Limit regions display to 4 by default
  const allRegions = React.useMemo(() => {
    const regions = Object.values(RegionEnum);
    if (!allowedCountries) return regions;
    return regions.filter(region => {
      const regionCountryCodes = REGION_COUNTRY_MAP[region] || [];
      return allowedCountries.some(c => regionCountryCodes.includes(c.code as CountryEnum));
    });
  }, [allowedCountries]);

  const displayedRegions = showAllRegions ? allRegions : allRegions.slice(0, 4);
  const hasMoreRegions = allRegions.length > 4;

  return (
    <div>
      {/* Header with Total Selection Summary */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {t('tenders.filters.region')} & {t('tenders.filters.country')}
            </h3>
            <p className="text-xs text-gray-600">
              {t('filters.selectRegionToViewCountries') || 'Select a region to view its countries'}
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
        
        {/* LEFT COLUMN - REGIONS */}
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
          {/* Regions Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <Globe className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    {t('tenders.filters.region')}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {allRegions.length} {t('filters.available') || 'available'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Regions List */}
          <div className="p-3 max-h-[420px] overflow-y-auto">
            <div className="space-y-2">
              {displayedRegions.map((region) => {
                const isActive = activeRegion === region;
                const regionCountryCodes = REGION_COUNTRY_MAP[region] || [];
                const countriesCount = allowedCountries 
                  ? allowedCountries.filter(c => regionCountryCodes.includes(c.code as CountryEnum)).length 
                  : 0;
                const selectedCountriesCount = selectedCountries.filter(country => 
                  regionCountryCodes.includes(country.code as CountryEnum)
                ).length;
                
                return (
                  <div
                    key={region}
                    className={`
                      group relative rounded-lg cursor-pointer transition-all duration-200
                      ${isActive 
                        ? 'bg-accent/10 border-2 border-accent shadow-lg ring-2 ring-accent/30' 
                        : 'bg-white border-2 border-gray-200 hover:border-accent/30 hover:shadow-md hover:bg-gray-50'
                      }
                    `}
                    onClick={() => handleRegionClick(region)}
                  >
                    <div className="p-3">
                      <div className="flex items-center gap-3">
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={`
                              text-sm font-bold truncate
                              ${isActive ? 'text-gray-900' : 'text-gray-700'}
                            `}>
                              {t(`regions.${region}`)}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs h-5 px-2 font-medium flex-shrink-0 ${
                                isActive 
                                  ? 'border-accent text-accent' 
                                  : 'border-gray-300 text-gray-600'
                              }`}
                            >
                              {countriesCount}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {selectedCountriesCount > 0 && (
                              <Badge 
                                variant="default" 
                                className="text-xs h-5 px-2 font-bold bg-accent text-white"
                              >
                                {selectedCountriesCount} {t('common.selected')}
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
              {hasMoreRegions && !showAllRegions && (
                <div
                  className="group relative rounded-lg cursor-pointer transition-all duration-200 bg-white border-2 border-gray-200 hover:border-accent/30 hover:shadow-md hover:bg-gray-50"
                  onClick={() => setShowAllRegions(true)}
                >
                  <div className="p-3">
                    <div className="flex items-center gap-3">
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

        {/* RIGHT COLUMN - COUNTRIES */}
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
          {/* Countries Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <Globe className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    {t('tenders.filters.country')}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {activeRegion 
                      ? `${activeCountries.length} ${t('filters.available') || 'available'}`
                      : t('filters.selectRegionFirst') || 'Select a region first'
                    }
                  </p>
                </div>
              </div>
              {activeRegion && activeCountries.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-8 px-3 hover:bg-accent/10 hover:text-accent font-semibold"
                  onClick={handleSelectAllCountriesForActiveRegion}
                >
                  {activeCountries.every(country => selectedCountries.some(s => s.id === country.id))
                    ? t('filters.unselectAll') 
                    : t('filters.selectAll')}
                </Button>
              )}
            </div>

            {/* Active Region Indicator */}
            {activeRegion && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border-2 border-accent/30">
                  <Globe className="w-4 h-4 text-accent flex-shrink-0" />
                  <span className="text-sm font-bold text-gray-900 truncate">
                    {t(`regions.${activeRegion}`)}
                  </span>
                </div>
                {selectedCountries.filter(country => activeCountries.some(s => s.id === country.id)).length > 0 && (
                  <Badge variant="default" className="bg-accent text-white text-xs h-9 px-3 font-bold">
                    {selectedCountries.filter(country => activeCountries.some(s => s.id === country.id)).length} {t('common.selected')}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Countries List */}
          <div className="p-3 max-h-[420px] overflow-y-auto">
            {activeRegion && activeCountries.length > 0 ? (
              <div className="space-y-2">
                {activeCountries.map((country) => {
                  const isSelected = selectedCountries.some(s => s.id === country.id);
                  
                  return (
                    <div
                      key={country.id}
                      className={`
                        group rounded-lg cursor-pointer transition-all duration-200
                        ${isSelected 
                          ? 'bg-accent/5 border-2 border-accent/70 shadow-md' 
                          : 'bg-white border-2 border-gray-200 hover:border-accent/30 hover:shadow-md'
                        }
                      `}
                      onClick={() => onSelectCountry(country)}
                    >
                      <div className="p-3 flex items-center gap-3">
                        <div className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
                          ${isSelected 
                            ? 'bg-accent border-accent' 
                            : 'border-gray-300 bg-white group-hover:border-accent/50'
                          }
                        `}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </div>
                        <span className={`
                          text-sm font-semibold flex-1
                          ${isSelected ? 'text-gray-900' : 'text-gray-700'}
                        `}>
                          {country.name}
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
                    <Globe className="w-10 h-10 text-gray-400" />
                  </div>
                  <h5 className="text-base font-bold text-gray-900 mb-2">
                    {t('filters.selectRegionToViewCountries') || 'Select a region'}
                  </h5>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {t('filters.clickRegionLeftToSeeCountries') || 'Click on a region from the left column to view and select its countries'}
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
