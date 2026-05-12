import { useEffect, useMemo, useState } from 'react';
import { Bell, BookmarkPlus, Check, RefreshCw, X } from 'lucide-react';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import type {
  SavedSearchAlertFrequency,
  SavedSearchAlertSettings,
  SavedSearchEmailFormat,
  SavedSearchType,
} from '@app/services/savedSearchService';

export interface SavedSearchReviewItem {
  label: string;
  value: string | string[] | number | null | undefined;
}

export interface SavedSearchEditorSavePayload {
  name: string;
  alertSettings: SavedSearchAlertSettings;
  useCurrentCriteria: boolean;
}

interface SavedSearchEditorDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  searchType: SavedSearchType;
  initialName?: string;
  reviewItems: SavedSearchReviewItem[];
  initialAlertSettings?: Partial<SavedSearchAlertSettings>;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: SavedSearchEditorSavePayload) => void;
  isSaving?: boolean;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SEARCH_TYPE_LABELS: Record<SavedSearchType, string> = {
  map: 'Map',
  projects: 'Projects',
  awards: 'Awards',
  shortlists: 'Shortlists',
  organisations: 'Organisations',
  experts: 'Experts',
  'bid-writers': 'Bid Writers',
};

const defaultAlertSettings: SavedSearchAlertSettings = {
  alertFrequency: 'daily',
  alertDays: ['Every day'],
  alertHour: '08:00',
  emailFormat: 'summary',
  status: 'active',
};

const normalizeAlertSettings = (settings?: Partial<SavedSearchAlertSettings>): SavedSearchAlertSettings => {
  const alertFrequency = settings?.alertFrequency || defaultAlertSettings.alertFrequency;
  const alertDays = alertFrequency === 'weekly'
    ? [settings?.alertDays?.[0] || 'Monday']
    : alertFrequency === 'daily'
      ? ['Every day']
      : [];

  return {
    alertFrequency,
    alertDays,
    alertHour: settings?.alertHour || defaultAlertSettings.alertHour,
    emailFormat: settings?.emailFormat || defaultAlertSettings.emailFormat,
    status: settings?.status || (alertFrequency === 'unsubscribe' ? 'paused' : 'active'),
  };
};

const renderValue = (value: SavedSearchReviewItem['value']) => {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (value === null || value === undefined) return '';
  return String(value);
};

const hasValue = (value: SavedSearchReviewItem['value']) => {
  if (Array.isArray(value)) return value.filter(Boolean).length > 0;
  return value !== null && value !== undefined && String(value).trim() !== '';
};

export function SavedSearchEditorDialog({
  open,
  mode,
  searchType,
  initialName = '',
  reviewItems,
  initialAlertSettings,
  onOpenChange,
  onSave,
  isSaving = false,
}: SavedSearchEditorDialogProps) {
  const [name, setName] = useState(initialName);
  const [alertSettings, setAlertSettings] = useState<SavedSearchAlertSettings>(() => normalizeAlertSettings(initialAlertSettings));
  const [useCurrentCriteria, setUseCurrentCriteria] = useState(mode === 'create');
  const [nameTouched, setNameTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setAlertSettings(normalizeAlertSettings(initialAlertSettings));
    setUseCurrentCriteria(mode === 'create');
    setNameTouched(false);
  }, [initialAlertSettings, initialName, mode, open]);

  const visibleReviewItems = useMemo(
    () => reviewItems.filter((item) => hasValue(item.value)),
    [reviewItems],
  );

  const nameError = nameTouched && !name.trim() ? 'Name is required.' : '';

  const updateFrequency = (alertFrequency: SavedSearchAlertFrequency) => {
    setAlertSettings((current) => ({
      ...current,
      alertFrequency,
      alertDays: alertFrequency === 'weekly' ? [current.alertDays?.[0] && current.alertDays[0] !== 'Every day' ? current.alertDays[0] : 'Monday'] : alertFrequency === 'daily' ? ['Every day'] : [],
      status: alertFrequency === 'unsubscribe' ? 'paused' : 'active',
    }));
  };

  const handleSave = () => {
    setNameTouched(true);
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({
      name: trimmed,
      alertSettings,
      useCurrentCriteria,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-hidden p-0 sm:max-w-[860px]">
        <div className="flex max-h-[92vh] flex-col">
          <DialogHeader className="border-b bg-gradient-to-r from-slate-50 to-white px-7 py-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E63462]/10 text-[#E63462]">
                <BookmarkPlus className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl text-primary">
                  {mode === 'create' ? 'Save Search' : 'Edit Saved Search'}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Review criteria and choose how this saved search sends email alerts.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 overflow-y-auto bg-gray-50/60 px-7 py-6">
            <div className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_240px]">
              <div className="space-y-2">
                <Label htmlFor="saved-search-editor-name">Name <span className="text-[#E63462]">*</span></Label>
                <Input
                  id="saved-search-editor-name"
                  value={name}
                  onBlur={() => setNameTouched(true)}
                  onChange={(event) => setName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleSave();
                  }}
                  placeholder="e.g. Kenya education opportunities"
                  aria-invalid={Boolean(nameError)}
                />
                {nameError && <p className="text-xs font-medium text-red-600">{nameError}</p>}
              </div>
              <div className="space-y-2">
                <Label>Search Type</Label>
                <div className="flex min-h-10 items-center rounded-md border bg-slate-50 px-3 text-sm font-semibold text-primary">
                  {SEARCH_TYPE_LABELS[searchType]}
                </div>
              </div>
            </div>

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-primary">Review Search Criteria</h3>
                  <p className="text-xs text-muted-foreground">Only criteria with selected values are shown.</p>
                </div>
                {mode === 'edit' && (
                  <Button
                    type="button"
                    variant={useCurrentCriteria ? 'default' : 'outline'}
                    size="sm"
                    className="min-h-9 shrink-0"
                    onClick={() => setUseCurrentCriteria((current) => !current)}
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    Use current filters
                  </Button>
                )}
              </div>
              {visibleReviewItems.length === 0 ? (
                <div className="px-4 py-6 text-sm text-muted-foreground">
                  No active criteria. This search will save the full result set for this section.
                </div>
              ) : (
                <div className="grid gap-px bg-gray-100 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleReviewItems.map((item) => (
                    <div key={`${item.label}-${renderValue(item.value)}`} className="min-w-0 bg-white px-4 py-3.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
                      <p className="mt-1 break-words text-sm font-medium text-gray-800">{renderValue(item.value)}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#E63462]/10 text-[#E63462]">
                  <Bell className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-primary">Alert Preferences</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Email Schedule</Label>
                  <div className="grid gap-2 sm:grid-cols-3" role="group" aria-label="Email schedule">
                    {(['daily', 'weekly', 'unsubscribe'] as SavedSearchAlertFrequency[]).map((frequency) => (
                      <button
                        key={frequency}
                        type="button"
                        className={`flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors ${
                          alertSettings.alertFrequency === frequency
                            ? 'border-[#E63462] bg-[#E63462] text-white'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-[#E63462]/60 hover:text-[#E63462]'
                        }`}
                        onClick={() => updateFrequency(frequency)}
                      >
                        {alertSettings.alertFrequency === frequency && <Check className="h-3.5 w-3.5" />}
                        {frequency === 'daily' ? 'Daily' : frequency === 'weekly' ? 'Weekly' : 'Unsubscribe'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Email Format</Label>
                    <div className="grid grid-cols-2 gap-2" role="group" aria-label="Email format">
                      {(['summary', 'detailed'] as SavedSearchEmailFormat[]).map((format) => (
                        <button
                          key={format}
                          type="button"
                          disabled={alertSettings.alertFrequency === 'unsubscribe'}
                          className={`min-h-10 rounded-md border px-3 text-sm font-medium capitalize transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                            alertSettings.emailFormat === format && alertSettings.alertFrequency !== 'unsubscribe'
                              ? 'border-primary bg-primary text-white'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-primary/60'
                          }`}
                          onClick={() => setAlertSettings((current) => ({ ...current, emailFormat: format }))}
                        >
                          {format}
                        </button>
                      ))}
                    </div>
                  </div>

                  {alertSettings.alertFrequency === 'weekly' && (
                    <div className="space-y-2">
                      <Label>Weekly Day</Label>
                      <Select
                        value={alertSettings.alertDays[0] || 'Monday'}
                        onValueChange={(weekday) => setAlertSettings((current) => ({ ...current, alertDays: [weekday] }))}
                      >
                        <SelectTrigger className="min-h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {WEEKDAYS.map((weekday) => (
                            <SelectItem key={weekday} value={weekday}>{weekday}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          <DialogFooter className="border-t bg-white px-7 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              <X className="mr-1.5 h-4 w-4" />
              Close
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving || !name.trim()}>
              {isSaving ? 'Saving...' : mode === 'create' ? 'Save Search' : 'Update Search'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
