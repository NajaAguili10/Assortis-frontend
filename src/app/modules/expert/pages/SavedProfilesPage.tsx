import { useState } from 'react';
import { useNavigate } from 'react-router';
import { UserCircle2, Plus, Pencil, Trash2, Layers, Check, X, Bell, BellOff } from 'lucide-react';
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
import { MatchingProfileDTO, AlertFrequency } from '@app/types/matchingOpportunities.dto';

const FREQUENCY_LABELS: Record<AlertFrequency, string> = {
  realtime: 'matching-opportunities.alerts.frequency.realtime',
  daily: 'matching-opportunities.alerts.frequency.daily',
  weekly: 'matching-opportunities.alerts.frequency.weekly',
  none: 'matching-opportunities.alerts.frequency.none',
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
  return value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
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
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              {t('matching-opportunities.profiles.form.sectors')}
            </label>
            <input
              className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.sectors}
              onChange={e => setForm(f => ({ ...f, sectors: e.target.value }))}
              placeholder="AGRICULTURE, HEALTH"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              {t('matching-opportunities.profiles.form.countries')}
            </label>
            <input
              className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.countries}
              onChange={e => setForm(f => ({ ...f, countries: e.target.value }))}
              placeholder="Kenya, Ghana"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              {t('matching-opportunities.profiles.form.donors')}
            </label>
            <input
              className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.donors}
              onChange={e => setForm(f => ({ ...f, donors: e.target.value }))}
              placeholder="World Bank, UNICEF"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              {t('matching-opportunities.profiles.form.keywords')}
            </label>
            <input
              className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.keywords}
              onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))}
              placeholder="agriculture, rural development"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              {t('matching-opportunities.profiles.alert-frequency')}
            </label>
            <Select
              value={form.alertFrequency}
              onValueChange={(v: AlertFrequency) => setForm(f => ({ ...f, alertFrequency: v }))}
            >
              <SelectTrigger className="w-44 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(FREQUENCY_LABELS) as AlertFrequency[]).map(freq => (
                  <SelectItem key={freq} value={freq}>
                    {t(FREQUENCY_LABELS[freq])}
                  </SelectItem>
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
              {form.isActive
                ? t('matching-opportunities.profiles.active')
                : t('matching-opportunities.profiles.inactive')}
            </label>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => onSave(form)}
            disabled={!form.name.trim()}
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            {t('matching-opportunities.profiles.form.save')}
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            <X className="w-3.5 h-3.5 mr-1" />
            {t('matching-opportunities.profiles.form.cancel')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SavedProfilesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profiles, createProfile, updateProfile, deleteProfile, getProfileMatches } =
    useMatchingOpportunities();

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    toast.success(t('matching-opportunities.profiles.toast.created'));
    setShowCreate(false);
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
    toast.success(t('matching-opportunities.profiles.toast.updated'));
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteProfile(id);
    toast.info(t('matching-opportunities.profiles.toast.deleted'));
  };

  const toForm = (p: MatchingProfileDTO): ProfileFormState => ({
    name: p.name,
    sectors: p.sectors.join(', '),
    countries: p.countries.join(', '),
    donors: p.donors.join(', '),
    keywords: p.keywords.join(', '),
    alertFrequency: p.alertFrequency,
    isActive: p.isActive,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        icon={UserCircle2}
        title={t('matching-opportunities.profiles.title')}
        description={t('matching-opportunities.profiles.subtitle')}
      />

      <PageContainer>
        <MatchingOpportunitiesSubMenu />

        <div className="mt-6 flex justify-end">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => { setShowCreate(true); setEditingId(null); }}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('matching-opportunities.profiles.create')}
          </Button>
        </div>

        {showCreate && (
          <div className="mt-4">
            <ProfileForm
              initial={emptyForm}
              onSave={handleCreate}
              onCancel={() => setShowCreate(false)}
              t={t}
            />
          </div>
        )}

        <div className="mt-4 space-y-4">
          {profiles.length === 0 && !showCreate && (
            <div className="py-16 text-center border border-dashed border-gray-200 rounded-lg bg-white">
              <UserCircle2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{t('matching-opportunities.profiles.empty')}</p>
            </div>
          )}

          {profiles.map(profile => {
            const matches = getProfileMatches(profile.id);
            const isEditing = editingId === profile.id;
            const isExpanded = expandedId === profile.id;

            return (
              <Card key={profile.id} className={`${!profile.isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-5">
                  {isEditing ? (
                    <ProfileForm
                      initial={toForm(profile)}
                      onSave={form => handleUpdate(profile.id, form)}
                      onCancel={() => setEditingId(null)}
                      t={t}
                    />
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <UserCircle2 className="w-9 h-9 text-blue-500 shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-gray-900 truncate">{profile.name}</h3>
                              <Badge
                                className={`text-xs ${
                                  profile.isActive
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {profile.isActive
                                  ? t('matching-opportunities.profiles.active')
                                  : t('matching-opportunities.profiles.inactive')}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              {profile.alertFrequency !== 'none' ? (
                                <Bell className="w-3 h-3 text-amber-500" />
                              ) : (
                                <BellOff className="w-3 h-3 text-gray-400" />
                              )}
                              <span className="text-xs text-gray-500">
                                {t(FREQUENCY_LABELS[profile.alertFrequency])}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className="text-sm font-semibold text-blue-600 cursor-pointer hover:underline"
                            onClick={() =>
                              setExpandedId(isExpanded ? null : profile.id)
                            }
                          >
                            {matches.length} {t('matching-opportunities.profiles.matches')}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-500"
                            onClick={() => { setEditingId(profile.id); setShowCreate(false); }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-600"
                            onClick={() => handleDelete(profile.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Criteria chips */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {profile.sectors.map(s => (
                          <Badge key={s} className="bg-blue-50 text-blue-700 text-xs border-0">
                            {s}
                          </Badge>
                        ))}
                        {profile.countries.map(c => (
                          <Badge key={c} className="bg-green-50 text-green-700 text-xs border-0">
                            {c}
                          </Badge>
                        ))}
                        {profile.donors.map(d => (
                          <Badge key={d} className="bg-purple-50 text-purple-700 text-xs border-0">
                            {d}
                          </Badge>
                        ))}
                        {profile.keywords.map(k => (
                          <Badge key={k} className="bg-gray-100 text-gray-600 text-xs border-0">
                            {k}
                          </Badge>
                        ))}
                      </div>

                      {/* Expanded matches list */}
                      {isExpanded && matches.length > 0 && (
                        <div className="mt-4 border-t pt-3 space-y-2">
                          {matches.slice(0, 5).map(opp => (
                            <div
                              key={opp.id}
                              className="flex items-center justify-between gap-3 py-1"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {opp.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {opp.country} · {opp.donor}
                                </p>
                              </div>
                              <span className="text-sm font-bold text-green-600 shrink-0">
                                {opp.relevanceScore}%
                              </span>
                            </div>
                          ))}
                          {matches.length > 5 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 w-full"
                              onClick={() => navigate('/matching-opportunities/projects')}
                            >
                              <Layers className="w-3.5 h-3.5 mr-1" />
                              {t('matching-opportunities.profiles.view-matches')}
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </PageContainer>
    </div>
  );
}
