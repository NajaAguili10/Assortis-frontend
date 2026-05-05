import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Layers, Bell, BellOff, Settings2, ShieldCheck, UserCircle2, Plus, Check, X, Search, Play, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { AccountSubMenu } from '@app/components/AccountSubMenu';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@app/components/ui/card';
import { Separator } from '@app/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';
import { useMatchingOpportunities } from '@app/modules/expert/hooks/useMatchingOpportunities';
import { AlertFrequency } from '@app/types/matchingOpportunities.dto';
import { savedSearchService, type SavedSearch } from '@app/services/savedSearchService';

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

interface ProfileFormState {
  name: string;
  sectors: string;
  countries: string;
  donors: string;
  keywords: string;
  alertFrequency: AlertFrequency;
  isActive: boolean;
}

const emptyForm: ProfileFormState = {
  name: '',
  sectors: '',
  countries: '',
  donors: '',
  keywords: '',
  alertFrequency: 'daily',
  isActive: true,
};

function splitCSV(value: string): string[] {
  return value.split(',').map(s => s.trim()).filter(Boolean);
}

interface ProfileFormProps {
  initial: ProfileFormState;
  onSave: (data: ProfileFormState) => void;
  onCancel: () => void;
  t: (key: string) => string;
}

function ProfileForm({ initial, onSave, onCancel, t }: ProfileFormProps) {
  const [form, setForm] = useState<ProfileFormState>(initial);
  return (
    <Card className="border-blue-200 bg-blue-50/40">
      <CardContent className="p-4 space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">
            {t('matching-opportunities.profiles.form.name')}
          </label>
          <input
            className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Africa Agriculture Profile"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(['sectors', 'countries', 'donors', 'keywords'] as const).map(field => (
            <div key={field}>
              <label className="text-xs font-medium text-gray-600 block mb-1">
                {t(`matching-opportunities.profiles.form.${field}`)}
              </label>
              <input
                className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              {t('matching-opportunities.profiles.alert-frequency')}
            </label>
            <Select value={form.alertFrequency} onValueChange={(v: AlertFrequency) => setForm(f => ({ ...f, alertFrequency: v }))}>
              <SelectTrigger className="w-44 h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(FREQUENCY_KEYS) as AlertFrequency[]).map(freq => (
                  <SelectItem key={freq} value={freq}>{t(FREQUENCY_KEYS[freq])}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="profile-active"
              checked={form.isActive}
              onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 accent-blue-600"
            />
            <label htmlFor="profile-active" className="text-sm text-gray-700">
              {form.isActive ? t('matching-opportunities.profiles.active') : t('matching-opportunities.profiles.inactive')}
            </label>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => onSave(form)} disabled={!form.name.trim()}>
            <Check className="w-3.5 h-3.5 mr-1" />{t('matching-opportunities.profiles.form.save')}
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            <X className="w-3.5 h-3.5 mr-1" />{t('matching-opportunities.profiles.form.cancel')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MySelectionAlertsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    profiles,
    alertConfig,
    createProfile,
    updateProfile,
    deleteProfile,
    updateAlertConfig,
    updateProfileAlertSettings,
  } = useMatchingOpportunities();

  // Profile state
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Alert state
  const [globalFreq, setGlobalFreq] = useState<AlertFrequency>(alertConfig.globalFrequency);
  const [dedup, setDedup] = useState(alertConfig.deduplicationEnabled);
  const [isDirty, setIsDirty] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => savedSearchService.list(user?.id));
  const [editingSavedSearchId, setEditingSavedSearchId] = useState<string | null>(null);
  const [editingSavedSearchName, setEditingSavedSearchName] = useState('');

  const refreshSavedSearches = () => {
    setSavedSearches(savedSearchService.list(user?.id));
  };

  const runSavedSearch = (search: SavedSearch) => {
    navigate(`${search.context.route}?savedSearchId=${encodeURIComponent(search.id)}`);
  };

  const deleteSavedSearch = (id: string) => {
    savedSearchService.remove(id);
    refreshSavedSearches();
    toast.success('Saved search deleted');
  };

  const toggleSavedSearchAlerts = (id: string) => {
    savedSearchService.toggleAlerts(id);
    refreshSavedSearches();
  };

  const startRenameSavedSearch = (search: SavedSearch) => {
    setEditingSavedSearchId(search.id);
    setEditingSavedSearchName(search.name);
  };

  const saveRenamedSearch = () => {
    if (!editingSavedSearchId || !editingSavedSearchName.trim()) return;
    savedSearchService.update(editingSavedSearchId, { name: editingSavedSearchName });
    setEditingSavedSearchId(null);
    setEditingSavedSearchName('');
    refreshSavedSearches();
    toast.success('Saved search updated');
  };

  useEffect(() => {
    refreshSavedSearches();
  }, [user?.id]);

  const getProfileSetting = (profileId: string) =>
    alertConfig.profileSettings.find(s => s.profileId === profileId) ?? {
      profileId,
      isEnabled: false,
      frequency: 'none' as AlertFrequency,
    };

  // Profile handlers
  const handleCreate = (form: ProfileFormState) => {
    createProfile({
      name: form.name.trim(),
      sectors: splitCSV(form.sectors),
      countries: splitCSV(form.countries),
      donors: splitCSV(form.donors),
      keywords: splitCSV(form.keywords),
      alertFrequency: form.alertFrequency,
      isActive: form.isActive,
    });
    setShowCreate(false);
    toast.success(t('matching-opportunities.profiles.toast.created'));
  };

  const handleUpdate = (id: string, form: ProfileFormState) => {
    updateProfile(id, {
      name: form.name.trim(),
      sectors: splitCSV(form.sectors),
      countries: splitCSV(form.countries),
      donors: splitCSV(form.donors),
      keywords: splitCSV(form.keywords),
      alertFrequency: form.alertFrequency,
      isActive: form.isActive,
    });
    setEditingId(null);
    toast.success(t('matching-opportunities.profiles.toast.updated'));
  };

  const handleDelete = (id: string) => {
    deleteProfile(id);
    toast.success(t('matching-opportunities.profiles.toast.deleted'));
  };

  // Alert handlers
  const handleSaveAlerts = () => {
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
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        icon={Layers}
        title={t('account.mySelection.banner.title')}
        description={t('account.mySelection.banner.description')}
      />

      <AccountSubMenu activeTab="my-selection" onTabChange={() => undefined} mode="profile-settings" />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6 space-y-8">

          {/* ── Profiles section ── */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Search className="h-5 w-5 text-primary" />
                    Saved Searches
                  </CardTitle>
                  <CardDescription className="mt-1">Searches saved from the public search pages, linked to your profile.</CardDescription>
                </div>
                <Badge variant="outline">{savedSearches.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {savedSearches.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No saved searches yet. Use Save Search from a search page to add one here.
                </p>
              ) : (
                <div className="space-y-3">
                  {savedSearches.map((search) => (
                    <div key={search.id} className="rounded-lg border bg-white p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          {editingSavedSearchId === search.id ? (
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <input className="h-9 flex-1 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" value={editingSavedSearchName} onChange={(event) => setEditingSavedSearchName(event.target.value)} />
                              <Button size="sm" onClick={saveRenamedSearch}>Save</Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingSavedSearchId(null)}>Cancel</Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-sm text-primary">{search.name}</p>
                                <Badge variant="outline" className="capitalize">{search.context.label}</Badge>
                                {search.alertsEnabled ? <Badge className="bg-amber-50 text-amber-700 border-0 gap-1"><Bell className="h-3 w-3" /> Alerts on</Badge> : <Badge className="bg-gray-100 text-gray-500 border-0 gap-1"><BellOff className="h-3 w-3" /> Alerts off</Badge>}
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">Saved {new Date(search.created_at).toLocaleString()}</p>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {(search.context.summary?.length ? search.context.summary : ['No filters selected']).slice(0, 8).map((item) => (
                                  <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => runSavedSearch(search)}><Play className="mr-1.5 h-3.5 w-3.5" />Run</Button>
                          <Button size="sm" variant="outline" onClick={() => startRenameSavedSearch(search)}><Pencil className="mr-1.5 h-3.5 w-3.5" />Edit</Button>
                          <Button size="sm" variant="outline" onClick={() => toggleSavedSearchAlerts(search.id)}>
                            {search.alertsEnabled ? <BellOff className="mr-1.5 h-3.5 w-3.5" /> : <Bell className="mr-1.5 h-3.5 w-3.5" />}
                            {search.alertsEnabled ? 'Disable alerts' : 'Enable alerts'}
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteSavedSearch(search.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UserCircle2 className="h-5 w-5 text-primary" />
                    {t('account.mySelection.profiles.title')}
                  </CardTitle>
                  <CardDescription className="mt-1">{t('account.mySelection.profiles.description')}</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => { setShowCreate(true); setEditingId(null); }} disabled={showCreate}>
                  <Plus className="h-4 w-4 mr-1.5" />{t('account.mySelection.profiles.new')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {showCreate && (
                <ProfileForm
                  initial={emptyForm}
                  onSave={handleCreate}
                  onCancel={() => setShowCreate(false)}
                  t={t}
                />
              )}
              {profiles.length === 0 && !showCreate ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  {t('account.mySelection.profiles.empty')}
                </p>
              ) : (
                <div className="space-y-3">
                  {profiles.map(profile => {
                    const setting = getProfileSetting(profile.id);
                    if (editingId === profile.id) {
                      return (
                        <ProfileForm
                          key={profile.id}
                          initial={{
                            name: profile.name,
                            sectors: profile.sectors.join(', '),
                            countries: profile.countries.join(', '),
                            donors: profile.donors.join(', '),
                            keywords: profile.keywords.join(', '),
                            alertFrequency: profile.alertFrequency,
                            isActive: profile.isActive,
                          }}
                          onSave={form => handleUpdate(profile.id, form)}
                          onCancel={() => setEditingId(null)}
                          t={t}
                        />
                      );
                    }
                    return (
                      <div key={profile.id} className="flex items-start justify-between gap-4 rounded-lg border bg-white p-4 flex-wrap">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <UserCircle2 className="h-8 w-8 text-blue-400 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{profile.name}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {profile.sectors.slice(0, 2).map(s => <Badge key={s} className="bg-blue-50 text-blue-600 text-xs border-0">{s}</Badge>)}
                              {profile.countries.slice(0, 2).map(c => <Badge key={c} className="bg-green-50 text-green-600 text-xs border-0">{c}</Badge>)}
                              <Badge className={`text-xs border-0 ${FREQUENCY_COLORS[setting.frequency]}`}>
                                {t(FREQUENCY_KEYS[setting.frequency])}
                              </Badge>
                              {setting.isEnabled
                                ? <Badge className="bg-amber-50 text-amber-700 text-xs border-0 gap-1"><Bell className="h-3 w-3" /> ON</Badge>
                                : <Badge className="bg-gray-100 text-gray-500 text-xs border-0 gap-1"><BellOff className="h-3 w-3" /> OFF</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingId(profile.id); setShowCreate(false); }}>
                            {t('common.edit')}
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(profile.id)}>
                            {t('common.delete')}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* ── Alert settings section ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-5 w-5 text-primary" />
                {t('account.mySelection.alerts.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Global frequency + deduplication row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Global frequency */}
                <div className="rounded-lg border bg-white p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings2 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{t('account.mySelection.alerts.globalFrequency')}</span>
                  </div>
                  <Select value={globalFreq} onValueChange={(v: AlertFrequency) => { setGlobalFreq(v); setIsDirty(true); }}>
                    <SelectTrigger className="w-full text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(FREQUENCY_KEYS) as AlertFrequency[]).map(freq => (
                        <SelectItem key={freq} value={freq}>{t(FREQUENCY_KEYS[freq])}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Badge className={`mt-2 text-xs ${FREQUENCY_COLORS[globalFreq]}`}>{t(FREQUENCY_KEYS[globalFreq])}</Badge>
                </div>

                {/* Deduplication */}
                <div className="rounded-lg border bg-white p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">{t('account.mySelection.alerts.deduplication')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{t('account.mySelection.alerts.deduplication.desc')}</p>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={dedup}
                    onClick={() => { setDedup(d => !d); setIsDirty(true); }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${dedup ? 'bg-blue-600' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${dedup ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {/* Per-profile toggles */}
              {profiles.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3">{t('account.mySelection.alerts.perProfile')}</p>
                  <div className="space-y-2">
                    {profiles.map(profile => {
                      const setting = getProfileSetting(profile.id);
                      return (
                        <div key={profile.id} className="flex items-center justify-between gap-4 rounded-lg border bg-white px-4 py-3 flex-wrap">
                          <div className="flex items-center gap-2 min-w-0">
                            <UserCircle2 className="h-5 w-5 text-blue-400 shrink-0" />
                            <span className="text-sm font-medium truncate">{profile.name}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <Select
                              value={setting.frequency}
                              onValueChange={(v: AlertFrequency) => handleProfileFrequency(profile.id, v)}
                              disabled={!setting.isEnabled}
                            >
                              <SelectTrigger className="w-32 h-7 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {(Object.keys(FREQUENCY_KEYS) as AlertFrequency[]).map(freq => (
                                  <SelectItem key={freq} value={freq}>{t(FREQUENCY_KEYS[freq])}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={setting.isEnabled}
                              onClick={() => handleToggleProfile(profile.id)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${setting.isEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                            >
                              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${setting.isEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                            </button>
                            {setting.isEnabled ? <Bell className="h-4 w-4 text-amber-500" /> : <BellOff className="h-4 w-4 text-gray-400" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {isDirty && (
                <div className="flex justify-end">
                  <Button onClick={handleSaveAlerts}>
                    {t('account.mySelection.alerts.saveSettings')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </PageContainer>
    </div>
  );
}
