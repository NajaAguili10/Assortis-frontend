import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  CVFormatType,
  CVLanguageType,
  ExpertMyCVDashboardDTO,
  ExpertMyCVFormDTO,
  ExpertMyCVInfoDTO,
} from '@app/modules/expert/types/my-cv.dto';
import { myCVService } from '@app/modules/expert/services/myCV.service';
import { useLanguage } from '@app/contexts/LanguageContext';

const MY_CV_STORAGE_KEY = 'assortis_expert_mycv_state_v1';

type PersistedMyCVState = {
  controls: {
    format: CVFormatType;
    language: CVLanguageType;
  };
  preferences: {
    isVisible: boolean;
    matchingEnabled: boolean;
    notifyOnDownload: boolean;
    broadcastEnabled: boolean;
  };
  form: ExpertMyCVFormDTO;
};

const initialForm: ExpertMyCVFormDTO = {
  primaryEmail: 'aziz.expert@example.com',
  primaryPhone: '+212 600 000 000',
  availabilityMonth: '09',
  availabilityYear: '2026',
  preferredProjectDurations: ['short_term'],
  inHousePositions: 'yes',
  dailyRate: '650',
  currency: 'USD',
  cvFileName: undefined,
  torFileNames: [],
  reportFileNames: [],
};

export function useMyCV() {
  const { t } = useLanguage();
  const [isReady, setIsReady] = useState(false);
  const [dashboard, setDashboard] = useState<ExpertMyCVDashboardDTO>(
    myCVService.getDashboard()
  );
  const [info, setInfo] = useState<ExpertMyCVInfoDTO>(myCVService.getCVInfo());
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [form, setForm] = useState<ExpertMyCVFormDTO>(initialForm);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsReady(true);
      return;
    }

    try {
      const rawState = window.localStorage.getItem(MY_CV_STORAGE_KEY);

      if (rawState) {
        const parsed = JSON.parse(rawState) as PersistedMyCVState;

        if (parsed?.controls) {
          setInfo(myCVService.setControls(parsed.controls.format, parsed.controls.language));
        }

        if (parsed?.preferences) {
          setDashboard(myCVService.updatePreferences(parsed.preferences));
        }

        if (parsed?.form) {
          setForm(parsed.form);
        }
      }
    } catch {
      // Ignore invalid persisted payload and keep defaults.
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady || typeof window === 'undefined') {
      return;
    }

    const payload: PersistedMyCVState = {
      controls: info.controls,
      preferences: dashboard.preferences,
      form,
    };

    window.localStorage.setItem(MY_CV_STORAGE_KEY, JSON.stringify(payload));
  }, [dashboard.preferences, form, info.controls, isReady]);

  const setFormat = (format: CVFormatType) => {
    setInfo(myCVService.setControls(format, info.controls.language));
  };

  const setLanguage = (language: CVLanguageType) => {
    setInfo(myCVService.setControls(info.controls.format, language));
  };

  const refreshPreview = () => {
    setInfo(myCVService.refreshPreview());
    setDashboard(myCVService.getDashboard());
    toast.success(t('mycv.feedback.refreshed'));
  };

  const toggleVisibility = (checked: boolean) => {
    setDashboard(myCVService.updatePreferences({ isVisible: checked }));
  };

  const toggleMatching = (checked: boolean) => {
    setDashboard(myCVService.updatePreferences({ matchingEnabled: checked }));
  };

  const toggleBroadcasting = (checked: boolean) => {
    setDashboard(myCVService.updatePreferences({ broadcastEnabled: checked }));
  };

  const toggleDownloadNotification = (checked: boolean) => {
    setDashboard(myCVService.updatePreferences({ notifyOnDownload: checked }));
  };

  const updateForm = <T extends keyof ExpertMyCVFormDTO>(
    field: T,
    value: ExpertMyCVFormDTO[T]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveUpdate = () => {
    const payload = {
      primaryEmail: form.primaryEmail,
      primaryPhone: form.primaryPhone,
      availabilityMonth: form.availabilityMonth,
      availabilityYear: form.availabilityYear,
      preferredProjectDurations: form.preferredProjectDurations,
      inHousePositions: form.inHousePositions,
      dailyRate: Number(form.dailyRate || 0),
      currency: form.currency,
      cvFileName: form.cvFileName,
      torFileNames: form.torFileNames,
      reportFileNames: form.reportFileNames,
    };

    setInfo(myCVService.updateCVInfo(payload));
    setDashboard(myCVService.getDashboard());
    setIsEditOpen(false);
    toast.success(t('mycv.feedback.updated'));
  };

  const addPrivateDocument = (fileName: string) => {
    if (!fileName) {
      return;
    }
    setInfo(myCVService.addPrivateDocument(fileName));
    toast.success(t('mycv.feedback.privateDocumentAdded'));
  };

  const downloadCV = () => {
    toast.success(t('mycv.feedback.downloadStarted'));
  };

  const printCV = () => {
    window.print();
  };

  const formattedAvailability = useMemo(
    () => `${form.availabilityMonth}/${form.availabilityYear}`,
    [form.availabilityMonth, form.availabilityYear]
  );

  return {
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
  };
}
