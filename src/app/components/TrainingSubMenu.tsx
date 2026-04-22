import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from '../contexts/LanguageContext';
import { SubMenu } from './SubMenu';
import {
  LayoutDashboard,
  FolderKanban,
  PlayCircle,
  BookOpen,
  Video,
  Award,
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
    if (path.startsWith('/training/live-sessions')) return 'liveSessions';
    if (path.startsWith('/training/live-session-details')) return 'liveSessions';
    if (path.startsWith('/training/session-enroll')) return 'liveSessions';
    if (path.startsWith('/training/recording-player')) return 'liveSessions';
    if (path.startsWith('/training/certifications')) return 'certificationsHistory';
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
    {
      label: t('training.submenu.liveSessions'),
      icon: Video,
      active: activeTab === 'liveSessions',
      onClick: () => navigate('/training/live-sessions'),
    },
    {
      label: t('training.submenu.certificatesHistory'),
      icon: Award,
      active: activeTab === 'certificationsHistory',
      onClick: () => navigate('/training/certifications'),
    },
  ];

  return <SubMenu items={items} />;
}