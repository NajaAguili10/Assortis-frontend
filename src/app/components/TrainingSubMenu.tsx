import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from '../contexts/LanguageContext';
import { SubMenu } from './SubMenu';
import {
  FolderKanban,
  PlayCircle,
  BookOpen,
} from 'lucide-react';

export function TrainingSubMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const getCurrentActive = () => {
    const path = location.pathname;
    if (path.startsWith('/training/portfolio')) return 'portfolio';
    if (path.startsWith('/training/activated-pills')) return 'activatedPills';
    if (path.startsWith('/training/catalog')) return 'catalog';
    if (path.startsWith('/training/live-session-details')) return 'catalog';
    if (path.startsWith('/training/session-enroll')) return 'catalog';
    if (path.startsWith('/training/recording-player')) return 'catalog';
    if (path.startsWith('/training/enroll')) return 'catalog';
    if (path.startsWith('/training/program-details')) return 'catalog';
    if (path.startsWith('/training/certifications')) return 'portfolio';
    if (path.startsWith('/training/certification-details')) return 'portfolio';
    if (path.startsWith('/training/certification-enroll')) return 'portfolio';
    return null;
  };

  const activeTab = getCurrentActive();

  const items = [
    {
      label: t('training.submenu.portfolio'),
      icon: FolderKanban,
      active: activeTab === 'portfolio',
      onClick: () => navigate('/training/portfolio'),
    },
    {
      label: t('training.submenu.activatedPills'),
      icon: PlayCircle,
      active: activeTab === 'activatedPills',
      onClick: () => navigate('/training/activated-pills'),
    },
    {
      label: t('training.submenu.catalog'),
      icon: BookOpen,
      active: activeTab === 'catalog',
      onClick: () => navigate('/training/catalog'),
    },
  ];

  return <SubMenu items={items} />;
}
