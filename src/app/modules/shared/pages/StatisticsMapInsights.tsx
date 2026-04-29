import React, { useMemo } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { isExpertAccountType } from '@app/services/permissions.service';
import { StatisticsSectionLayout } from '@app/components/StatisticsSectionLayout';
import { mapInsights } from '@app/modules/shared/data/statistics.mock';
import { Globe, Users } from 'lucide-react';
import { Button } from '@app/components/ui/button';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function StatisticsMapInsights() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isExpert = isExpertAccountType(user?.accountType);

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

          <div className="relative h-[360px] rounded-xl overflow-hidden">
            <MapContainer
              center={[20, 20]}
              zoom={2}
              style={{ height: '360px', width: '100%', borderRadius: '0.75rem' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mapInsights.map((point) => (
                <CircleMarker
                  key={point.country}
                  center={[point.lat, point.lng]}
                  radius={8 + point.intensity * 20}
                  pathOptions={{
                    fillColor: `rgba(31, 75, 153, ${0.35 + point.intensity * 0.6})`,
                    color: '#ffffff',
                    weight: 2,
                    fillOpacity: 1,
                  }}
                >
                  <Popup>
                    <p className="font-semibold text-primary">{point.country}</p>
                    {!isExpert && (
                      <p className="text-xs text-gray-600">
                        {t('statistics.map.tooltip.projects')}: {point.projects}
                      </p>
                    )}
                    <p className="text-xs text-gray-600">
                      {t('statistics.map.tooltip.experts')}: {point.experts}
                    </p>
                    {isExpert && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full text-xs"
                        onClick={() => console.log(`Request connection with peers in ${point.country}`)}
                      >
                        {t('statistics.expert.peers.requestConnection')}
                      </Button>
                    )}
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
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
