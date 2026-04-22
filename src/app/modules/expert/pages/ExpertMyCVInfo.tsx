import { useMemo, useState } from 'react';
import {
  FileUser,
  Sparkles,
  RefreshCcw,
  Download,
  Printer,
  Upload,
  Link2,
  Settings2,
  FileText,
  Calendar,
  User,
  BarChart3,
} from 'lucide-react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ExpertMyCVSubMenu } from '@app/components/ExpertMyCVSubMenu';
import { AccessDenied } from '@app/components/AccessDenied';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';
import { Switch } from '@app/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@app/components/ui/toggle-group';
import { RadioGroup, RadioGroupItem } from '@app/components/ui/radio-group';
import { hasExpertMyCVAccess } from '@app/services/permissions.service';
import { useMyCV } from '@app/modules/expert/hooks/useMyCV';
import { toast } from 'sonner';

const monthOptions = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
];

const yearOptions = ['2026', '2027', '2028', '2029'];

const sectionTitleKeyMap = {
  'personal-information': 'mycv.section.personalInformation',
  education: 'mycv.section.education',
  training: 'mycv.section.training',
  'professional-experience': 'mycv.section.professionalExperience',
  'employment-record-projects': 'mycv.section.employmentRecordProjects',
  'language-skills': 'mycv.section.languageSkills',
  other: 'mycv.section.other',
  'permanent-address': 'mycv.section.permanentAddress',
  'current-address': 'mycv.section.currentAddress',
} as const;

export default function ExpertMyCVInfo() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const hasAccess = hasExpertMyCVAccess(user?.accountType);
  const [isCVProLoading, setIsCVProLoading] = useState(false);

  const {
    isReady,
    dashboard,
    info,
    form,
    isEditOpen,
    setIsEditOpen,
    setFormat,
    setLanguage,
    refreshPreview,
    toggleVisibility,
    toggleMatching,
    toggleBroadcasting,
    toggleDownloadNotification,
    updateForm,
    saveUpdate,
    addPrivateDocument,
    downloadCV,
    printCV,
    formattedAvailability,
  } = useMyCV();

  const [privateFileName, setPrivateFileName] = useState('');

  const statusClassName =
    info.metadata.validationStatus === 'validated'
      ? 'bg-emerald-100 text-emerald-700'
      : info.metadata.validationStatus === 'rejected'
      ? 'bg-red-100 text-red-700'
      : 'bg-amber-100 text-amber-700';

  const statusLabelKey =
    info.metadata.validationStatus === 'validated'
      ? 'mycv.status.validated'
      : info.metadata.validationStatus === 'rejected'
      ? 'mycv.status.rejected'
      : 'mycv.status.pending';

  const sectionOrder = useMemo(() => info.sections, [info.sections]);

  const handleCVPro = async () => {
    if (isCVProLoading) {
      return;
    }

    setIsCVProLoading(true);
    const toastId = 'mycv-cv-pro';
    toast.loading(t('mycv.info.cvProLoading'), { id: toastId });
    await new Promise((resolve) => setTimeout(resolve, 2200));

    // Simulate AI enhancement by preparing a richer CV draft before user confirmation.
    updateForm('preferredProjectDurations', ['short_term', 'long_term']);
    updateForm('inHousePositions', 'no');
    updateForm('dailyRate', '720');
    updateForm('torFileNames', Array.from(new Set([...form.torFileNames, 'AI_generated_project_highlights.pdf'])));
    updateForm('reportFileNames', Array.from(new Set([...form.reportFileNames, 'AI_enhanced_project_summary.pdf'])));

    setIsEditOpen(true);
    setIsCVProLoading(false);
    toast.success(t('mycv.info.cvProAlert'), { id: toastId });
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen">
        <PageBanner
          title={t('mycv.info.title')}
          description={t('mycv.info.subtitle')}
          icon={FileUser}
        />
        <ExpertMyCVSubMenu />
        <AccessDenied module="experts" accountType={user?.accountType} />
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageBanner
          title={t('mycv.info.title')}
          description={t('mycv.info.subtitle')}
          icon={FileUser}
        />
        <ExpertMyCVSubMenu />
        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-6">
            <div className="h-56 rounded-lg border border-gray-200 bg-gray-100 animate-pulse" />
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <PageBanner
        title={t('mycv.info.title')}
        description={t('mycv.info.subtitle')}
        icon={FileUser}
      />

      <ExpertMyCVSubMenu />

      <PageContainer className="my-6 print:my-0 print:shadow-none">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {!isEditOpen && (
            <div className="flex flex-wrap justify-end gap-3 mb-6 print:hidden">
              <Button
                variant="outline"
                onClick={handleCVPro}
                disabled={isCVProLoading}
                className="border-accent/40 bg-accent/5 text-accent hover:bg-accent/10 hover:text-accent min-h-11"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="inline-flex items-center gap-2">
                  <span>{t('mycv.info.cvPro')}</span>
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-accent">
                    AI
                  </span>
                  {isCVProLoading && <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />}
                </span>
              </Button>
              <Button onClick={() => setIsEditOpen(true)}>
                <FileText className="w-4 h-4 mr-2" />
                {t('mycv.info.updateMyCV')}
              </Button>
            </div>
          )}

          <div className="bg-white rounded-lg border p-6 mb-6 print:hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Settings2 className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold text-primary">{t('mycv.info.controlsBar')}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-3 space-y-2">
                <Label>{t('mycv.controls.format')}</Label>
                <Select value={info.controls.format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assortis">{t('mycv.format.assortis')}</SelectItem>
                    <SelectItem value="adb">{t('mycv.format.adb')}</SelectItem>
                    <SelectItem value="afdb">{t('mycv.format.afdb')}</SelectItem>
                    <SelectItem value="ec">{t('mycv.format.ec')}</SelectItem>
                    <SelectItem value="europass">{t('mycv.format.europass')}</SelectItem>
                    <SelectItem value="world-bank">{t('mycv.format.worldBank')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-2 space-y-2">
                <Label>{t('mycv.controls.language')}</Label>
                <Select value={info.controls.language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t('lang.english')}</SelectItem>
                    <SelectItem value="fr">{t('lang.french')}</SelectItem>
                    <SelectItem value="es">{t('lang.spanish')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-7 flex flex-wrap gap-2 items-end">
                <Button variant="outline" onClick={refreshPreview}>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  {t('mycv.controls.refresh')}
                </Button>
                <Button variant="outline" onClick={downloadCV}>
                  <Download className="h-4 w-4 mr-2" />
                  {t('mycv.controls.download')}
                </Button>
                <Button variant="outline" onClick={printCV}>
                  <Printer className="h-4 w-4 mr-2" />
                  {t('mycv.controls.print')}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6 mb-6 print:shadow-none print:border-gray-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-purple-500" />
              </div>
              <h2 className="text-xl font-semibold text-primary">{t('mycv.info.title')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">{t('mycv.info.expertId')}</p>
                <p className="text-sm font-semibold text-primary">{info.metadata.expertId}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">{t('mycv.controls.format')}</p>
                <p className="text-sm font-semibold text-primary">
                  {t(`mycv.format.${info.controls.format === 'world-bank' ? 'worldBank' : info.controls.format}`)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">{t('mycv.dashboard.lastUpdated')}</p>
                <p className="text-sm font-semibold text-primary">
                  {new Date(info.metadata.lastUpdatedAt).toLocaleDateString(language)}
                </p>
              </div>
              <div className="md:justify-self-end">
                <p className="text-xs uppercase tracking-wide text-gray-500">{t('mycv.dashboard.validationStatus')}</p>
                <Badge className={statusClassName}>{t(statusLabelKey)}</Badge>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6 mb-6 print:shadow-none print:border-gray-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-500" />
              </div>
              <h2 className="text-xl font-semibold text-primary">{t('mycv.info.cvContent')}</h2>
            </div>

            <div className="space-y-5">
              {sectionOrder.map((section) => (
                <section key={section.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <h3 className="text-base font-semibold text-primary mb-2">
                    {t(sectionTitleKeyMap[section.id])}
                  </h3>
                  <div className="space-y-1">
                    {section.content.map((line) => (
                      <p key={line} className="text-sm text-gray-700 leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 print:hidden">
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-green-500" />
                </div>
                <h2 className="text-xl font-semibold text-primary">{t('mycv.advanced.documentStorage')}</h2>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={privateFileName}
                    onChange={(event) => setPrivateFileName(event.target.value)}
                    placeholder={t('mycv.info.privateDocumentPlaceholder')}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      addPrivateDocument(privateFileName);
                      setPrivateFileName('');
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {t('mycv.info.addDocument')}
                  </Button>
                </div>

                <div className="space-y-2">
                  {info.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-200"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {t(`mycv.documentCategory.${doc.category}`)} - {doc.sizeLabel}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(doc.uploadedAt).toLocaleDateString(language)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-amber-500" />
                </div>
                <h2 className="text-xl font-semibold text-primary">{t('mycv.advanced.experienceLinking')}</h2>
              </div>

              <div className="space-y-3">
                {info.experienceLinks.map((link) => (
                  <div key={link.id} className="rounded-lg border border-gray-200 p-3 space-y-1">
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-accent" />
                      {link.experienceTitle}
                    </p>
                    <p className="text-sm text-gray-600">{link.projectTitle}</p>
                    <p className="text-xs text-gray-500">
                      {t('mycv.advanced.confidence')} {link.confidenceScore}%
                    </p>
                  </div>
                ))}

                <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                  {t('mycv.advanced.linkingHint')}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6 mb-6 print:hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-cyan-500" />
              </div>
              <h2 className="text-xl font-semibold text-primary">{t('mycv.advanced.statisticsInsights')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{t('mycv.kpi.views')}</p>
                <p className="text-2xl font-bold text-primary">{dashboard.kpis.views}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{t('mycv.kpi.downloads')}</p>
                <p className="text-2xl font-bold text-primary">{dashboard.kpis.downloads}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{t('mycv.kpi.relevanceScore')}</p>
                <p className="text-2xl font-bold text-primary">{dashboard.kpis.relevanceScore}%</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{t('mycv.advanced.availability')}</p>
                <p className="text-sm font-semibold text-primary pt-1">{formattedAvailability}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6 mb-6 print:hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center">
                <Settings2 className="w-5 h-5 text-rose-500" />
              </div>
              <h2 className="text-xl font-semibold text-primary">{t('mycv.dashboard.visibilityControls')}</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label htmlFor="visibility-control" className="text-sm font-medium text-gray-900">
                    {t('mycv.controls.visibility')}
                  </Label>
                  <p className="text-xs text-gray-500">{t('mycv.controls.visibilityHelp')}</p>
                </div>
                <Switch
                  id="visibility-control"
                  checked={dashboard.preferences.isVisible}
                  onCheckedChange={toggleVisibility}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label htmlFor="matching-control" className="text-sm font-medium text-gray-900">
                    {t('mycv.controls.matching')}
                  </Label>
                  <p className="text-xs text-gray-500">{t('mycv.controls.matchingHelp')}</p>
                </div>
                <Switch
                  id="matching-control"
                  checked={dashboard.preferences.matchingEnabled}
                  onCheckedChange={toggleMatching}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label htmlFor="broadcast-control" className="text-sm font-medium text-gray-900">
                    {t('mycv.controls.broadcasting')}
                  </Label>
                  <p className="text-xs text-gray-500">{t('mycv.controls.broadcastingHelp')}</p>
                </div>
                <Switch
                  id="broadcast-control"
                  checked={dashboard.preferences.broadcastEnabled}
                  onCheckedChange={toggleBroadcasting}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label htmlFor="notify-download-info" className="text-sm font-medium text-gray-900">
                    {t('mycv.controls.notifyOnDownload')}
                  </Label>
                  <p className="text-xs text-gray-500">{t('mycv.controls.notifyOnDownloadHelp')}</p>
                </div>
                <Switch
                  id="notify-download-info"
                  checked={dashboard.preferences.notifyOnDownload}
                  onCheckedChange={toggleDownloadNotification}
                />
              </div>
            </div>
          </div>

          <form onSubmit={(event) => event.preventDefault()}>
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-xl font-semibold text-primary">{t('mycv.form.personalContact')}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('mycv.form.primaryEmail')}</Label>
                  <Input
                    type="email"
                    value={form.primaryEmail}
                    onChange={(event) => updateForm('primaryEmail', event.target.value)}
                    disabled={!isEditOpen}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('mycv.form.primaryPhone')}</Label>
                  <Input
                    value={form.primaryPhone}
                    onChange={(event) => updateForm('primaryPhone', event.target.value)}
                    disabled={!isEditOpen}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-cyan-500" />
                </div>
                <h2 className="text-xl font-semibold text-primary">{t('mycv.form.availabilityPreferences')}</h2>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('mycv.form.availabilityMonth')}</Label>
                    <Select
                      value={form.availabilityMonth}
                      onValueChange={(value) => updateForm('availabilityMonth', value)}
                      disabled={!isEditOpen}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('mycv.form.availabilityYear')}</Label>
                    <Select
                      value={form.availabilityYear}
                      onValueChange={(value) => updateForm('availabilityYear', value)}
                      disabled={!isEditOpen}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('mycv.form.preferredProjectDuration')}</Label>
                  <ToggleGroup
                    type="multiple"
                    value={form.preferredProjectDurations}
                    onValueChange={(value) =>
                      updateForm('preferredProjectDurations', value as typeof form.preferredProjectDurations)
                    }
                    disabled={!isEditOpen}
                  >
                    <ToggleGroupItem value="short_term">{t('mycv.form.shortTermMissions')}</ToggleGroupItem>
                    <ToggleGroupItem value="long_term">{t('mycv.form.longTermMissions')}</ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <div className="space-y-2">
                  <Label>{t('mycv.form.inHousePositions')}</Label>
                  <RadioGroup
                    value={form.inHousePositions}
                    onValueChange={(value) => updateForm('inHousePositions', value as 'yes' | 'no')}
                    className="flex items-center gap-8"
                    disabled={!isEditOpen}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="inhouse-yes" value="yes" />
                      <Label htmlFor="inhouse-yes">{t('common.yes')}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id="inhouse-no" value="no" />
                      <Label htmlFor="inhouse-no">{t('common.no')}</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-indigo-500" />
                </div>
                <h2 className="text-xl font-semibold text-primary">{t('mycv.form.cvAndEnrichment')}</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('mycv.form.uploadCurrentCV')}</Label>
                  <Input
                    type="file"
                    disabled={!isEditOpen}
                    onChange={(event) =>
                      updateForm('cvFileName', event.target.files?.[0]?.name || undefined)
                    }
                  />
                  {form.cvFileName && <p className="text-xs text-gray-500">{form.cvFileName}</p>}
                </div>

                <div className="space-y-2">
                  <Label>{t('mycv.form.uploadToR')}</Label>
                  <Input
                    type="file"
                    disabled={!isEditOpen}
                    onChange={(event) =>
                      updateForm(
                        'torFileNames',
                        event.target.files ? [event.target.files[0]?.name || ''] : []
                      )
                    }
                  />
                  {form.torFileNames.length > 0 && (
                    <p className="text-xs text-gray-500">{form.torFileNames.join(', ')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('mycv.form.uploadReports')}</Label>
                  <Input
                    type="file"
                    disabled={!isEditOpen}
                    onChange={(event) =>
                      updateForm(
                        'reportFileNames',
                        event.target.files ? [event.target.files[0]?.name || ''] : []
                      )
                    }
                  />
                  {form.reportFileNames.length > 0 && (
                    <p className="text-xs text-gray-500">{form.reportFileNames.join(', ')}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                </div>
                <h2 className="text-xl font-semibold text-primary">{t('mycv.form.fees')}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('mycv.form.dailyRate')}</Label>
                  <Input
                    type="number"
                    value={form.dailyRate}
                    disabled={!isEditOpen}
                    onChange={(event) => updateForm('dailyRate', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('mycv.form.currency')}</Label>
                  <Select
                    value={form.currency}
                    onValueChange={(value) => updateForm('currency', value)}
                    disabled={!isEditOpen}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="MAD">MAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {isEditOpen && (
              <div className="flex justify-end gap-4 print:hidden">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button
                  type="button"
                  onClick={saveUpdate}
                  className="inline-flex items-center"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {t('common.save')}
                </Button>
              </div>
            )}
          </form>
        </div>
      </PageContainer>
    </div>
  );
}
