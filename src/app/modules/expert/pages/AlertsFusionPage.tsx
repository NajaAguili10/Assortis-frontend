import { useState } from 'react';
import { Bell, BellOff, ShieldCheck, Settings2, UserCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { MatchingOpportunitiesSubMenu } from '@app/components/MatchingOpportunitiesSubMenu';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Card, CardContent } from '@app/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';
import { useMatchingOpportunities } from '@app/modules/expert/hooks/useMatchingOpportunities';
import { AlertFrequency } from '@app/types/matchingOpportunities.dto';

const FREQUENCY_KEYS: Record<AlertFrequency, string> = {
  realtime: 'matching-opportunities.alerts.frequency.realtime',
  daily: 'matching-opportunities.alerts.frequency.daily',
  weekly: 'matching-opportunities.alerts.frequency.weekly',
  none: 'matching-opportunities.alerts.frequency.none',
};

const FREQUENCY_COLORS: Record<AlertFrequency, string> = {
  realtime: 'bg-red-100 text-red-700',
  daily: 'bg-blue-100 text-blue-700',
  weekly: 'bg-purple-100 text-purple-700',
  none: 'bg-gray-100 text-gray-500',
};

export default function AlertsFusionPage() {
  const { t } = useTranslation();
  const { profiles, alertConfig, updateAlertConfig, updateProfileAlertSettings } =
    useMatchingOpportunities();

  const [globalFreq, setGlobalFreq] = useState<AlertFrequency>(alertConfig.globalFrequency);
  const [dedup, setDedup] = useState(alertConfig.deduplicationEnabled);
  const [isDirty, setIsDirty] = useState(false);

  const getProfileSetting = (profileId: string) =>
    alertConfig.profileSettings.find(s => s.profileId === profileId) ?? {
      profileId,
      isEnabled: false,
      frequency: 'none' as AlertFrequency,
    };

  const handleGlobalFreqChange = (v: AlertFrequency) => {
    setGlobalFreq(v);
    setIsDirty(true);
  };

  const handleDedupToggle = () => {
    setDedup(prev => !prev);
    setIsDirty(true);
  };

  const handleSave = () => {
    updateAlertConfig({ globalFrequency: globalFreq, deduplicationEnabled: dedup });
    setIsDirty(false);
    toast.success(t('matching-opportunities.alerts.toast.saved'));
  };

  const handleToggleProfile = (profileId: string) => {
    const current = getProfileSetting(profileId);
    updateProfileAlertSettings(profileId, current.frequency, !current.isEnabled);
  };

  const handleProfileFrequency = (profileId: string, frequency: AlertFrequency) => {
    const current = getProfileSetting(profileId);
    updateProfileAlertSettings(profileId, frequency, current.isEnabled);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        icon={Bell}
        title={t('matching-opportunities.alerts.title')}
        description={t('matching-opportunities.alerts.subtitle')}
      />

      <PageContainer>
        <MatchingOpportunitiesSubMenu />

        {/* Global settings card */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Global frequency */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                  <Settings2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {t('matching-opportunities.alerts.global-frequency')}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {t('matching-opportunities.alerts.frequency.label')}
                  </p>
                </div>
              </div>
              <Select
                value={globalFreq}
                onValueChange={(v: AlertFrequency) => handleGlobalFreqChange(v)}
              >
                <SelectTrigger className="w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(FREQUENCY_KEYS) as AlertFrequency[]).map(freq => (
                    <SelectItem key={freq} value={freq}>
                      {t(FREQUENCY_KEYS[freq])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge className={`mt-3 text-xs ${FREQUENCY_COLORS[globalFreq]}`}>
                {t(FREQUENCY_KEYS[globalFreq])}
              </Badge>
            </CardContent>
          </Card>

          {/* Deduplication */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {t('matching-opportunities.alerts.dedup.title')}
                  </h3>
                  <p className="text-xs text-gray-500 max-w-xs">
                    {t('matching-opportunities.alerts.dedup.description')}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  {dedup ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={dedup}
                  onClick={handleDedupToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    dedup ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      dedup ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save global settings */}
        {isDirty && (
          <div className="mt-3 flex justify-end">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSave}
            >
              {t('matching-opportunities.alerts.toast.saved').replace('saved', 'Save settings')}
            </Button>
          </div>
        )}

        {/* Per-profile alert settings */}
        <div className="mt-6">
          <h2 className="text-base font-semibold text-gray-800 mb-3">
            {t('matching-opportunities.alerts.per-profile')}
          </h2>

          {profiles.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-gray-200 rounded-lg bg-white">
              <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{t('matching-opportunities.alerts.empty')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {profiles.map(profile => {
                const setting = getProfileSetting(profile.id);
                return (
                  <Card key={profile.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3 min-w-0">
                          <UserCircle2 className="w-8 h-8 text-blue-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {profile.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              {profile.sectors.slice(0, 2).map(s => (
                                <Badge key={s} className="bg-blue-50 text-blue-600 text-xs border-0">
                                  {s}
                                </Badge>
                              ))}
                              {profile.countries.slice(0, 2).map(c => (
                                <Badge key={c} className="bg-green-50 text-green-600 text-xs border-0">
                                  {c}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {/* Per-profile frequency */}
                          <Select
                            value={setting.frequency}
                            onValueChange={(v: AlertFrequency) =>
                              handleProfileFrequency(profile.id, v)
                            }
                            disabled={!setting.isEnabled}
                          >
                            <SelectTrigger className="w-36 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(Object.keys(FREQUENCY_KEYS) as AlertFrequency[]).map(freq => (
                                <SelectItem key={freq} value={freq}>
                                  {t(FREQUENCY_KEYS[freq])}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Enable / Disable toggle */}
                          <button
                            type="button"
                            role="switch"
                            aria-checked={setting.isEnabled}
                            onClick={() => handleToggleProfile(profile.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              setting.isEnabled ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                            title={
                              setting.isEnabled
                                ? t('matching-opportunities.alerts.disable')
                                : t('matching-opportunities.alerts.enable')
                            }
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                setting.isEnabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>

                          {setting.isEnabled ? (
                            <Bell className="w-4 h-4 text-amber-500" />
                          ) : (
                            <BellOff className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Dedup info */}
        {dedup && profiles.filter(p => getProfileSetting(p.id).isEnabled).length > 1 && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <p className="text-xs text-green-700">
              {t('matching-opportunities.alerts.dedup.description')}
              {' '}
              <span className="font-medium">
                {profiles.filter(p => getProfileSetting(p.id).isEnabled).length} active profiles
              </span>{' '}
              will share deduplicated alerts.
            </p>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
