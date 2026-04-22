import React, { useMemo, useState } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { isExpertAccountType } from '@app/services/permissions.service';
import { StatisticsSectionLayout } from '@app/components/StatisticsSectionLayout';
import { mapInsights } from '@app/modules/shared/data/statistics.mock';
import { Globe, Users } from 'lucide-react';
import { Button } from '@app/components/ui/button';

export default function StatisticsMapInsights() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isExpert = isExpertAccountType(user?.accountType);

  const [hoveredCountry, setHoveredCountry] = useState<(typeof mapInsights)[number] | null>(null);

  const topCountries = useMemo(
    () => [...mapInsights].sort((a, b) => b.projects - a.projects).slice(0, 5),
    []
  );

  const pageTitle = isExpert ? t('statistics.tabs.peerInsights') : t('statistics.mapInsights.title');
  const mapIcon = isExpert ? Users : Globe;

  return (
    <StatisticsSectionLayout icon={mapIcon}>
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-primary">{pageTitle}</h2>
        {isExpert && (
          <p className="text-sm text-gray-600 mt-2">{t('statistics.expert.peers.description')}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">
              {isExpert ? 'Peer Distribution' : t('statistics.tabs.mapInsights')}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>{t('statistics.map.legend.low')}</span>
              <div className="w-20 h-2 rounded-full bg-gradient-to-r from-sky-100 to-primary" />
              <span>{t('statistics.map.legend.high')}</span>
            </div>
          </div>

          <div className="relative h-[360px] rounded-xl border border-gray-100 overflow-hidden bg-[radial-gradient(circle_at_20%_20%,#f1f5f9,transparent_35%),radial-gradient(circle_at_80%_30%,#e2e8f0,transparent_35%),linear-gradient(135deg,#f8fafc,#eff6ff)]">
            {mapInsights.map((point) => (
              <button
                key={point.country}
                type="button"
                onMouseEnter={() => setHoveredCountry(point)}
                onMouseLeave={() => setHoveredCountry(null)}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow hover:shadow-lg transition-shadow"
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  width: `${12 + point.intensity * 22}px`,
                  height: `${12 + point.intensity * 22}px`,
                  backgroundColor: `rgba(31, 75, 153, ${0.35 + point.intensity * 0.6})`,
                }}
                aria-label={isExpert ? `${point.country}: ${point.experts} experts` : `${point.country}: ${point.projects} projects, ${point.experts} experts`}
                title={isExpert ? `${point.country} - ${t('statistics.map.tooltip.experts')}: ${point.experts}` : `${point.country} - ${t('statistics.map.tooltip.projects')}: ${point.projects}, ${t('statistics.map.tooltip.experts')}: ${point.experts}`}
              />
            ))}

            {hoveredCountry && (
              <div className="absolute right-3 top-3 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[220px]">
                <p className="text-sm font-semibold text-primary mb-1">{hoveredCountry.country}</p>
                {!isExpert && (
                  <p className="text-xs text-gray-600">
                    {t('statistics.map.tooltip.projects')}: {hoveredCountry.projects}
                  </p>
                )}
                <p className="text-xs text-gray-600">
                  {t('statistics.map.tooltip.experts')}: {hoveredCountry.experts}
                </p>
                {isExpert && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 w-full text-xs"
                    onClick={() => console.log(`Request connection with peers in ${hoveredCountry.country}`)}
                  >
                    {t('statistics.expert.peers.requestConnection')}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">
            {isExpert ? 'Top Regions for Your Sector' : t('statistics.highlights.topCountries')}
          </h3>
          <div className="space-y-3">
            {topCountries.map((country, index) => (
              <div key={country.country} className="rounded-lg border border-gray-100 px-3 py-2">
                <p className="text-sm font-semibold text-primary">#{index + 1} {country.country}</p>
                {isExpert ? (
                  <p className="text-xs text-gray-600">
                    {t('statistics.map.tooltip.experts')}: {country.experts} peers
                  </p>
                ) : (
                  <p className="text-xs text-gray-600">
                    {t('statistics.map.tooltip.projects')}: {country.projects} | {t('statistics.map.tooltip.experts')}: {country.experts}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </StatisticsSectionLayout>
  );
}
