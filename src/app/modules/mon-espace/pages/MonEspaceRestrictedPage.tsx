import { useNavigate } from 'react-router';
import { useTranslation } from '../../../contexts/LanguageContext';
import { PageBanner } from '../../../components/PageBanner';
import { MonEspaceSubMenu } from '../../../components/MonEspaceSubMenu';
import { MonEspaceIntroduction } from '../components/MonEspaceIntroduction';
import { Briefcase } from 'lucide-react';

/**
 * Mon Espace Restricted Access Page
 * Displayed to users without proper authentication or role
 */
export default function MonEspaceRestrictedPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bannière Mon Espace */}
      <PageBanner
        icon={Briefcase}
        title={t('monEspace.banner.dashboard.title')}
        description={t('monEspace.banner.dashboard.description')}
      />
      
      {/* Sous-menu Mon Espace (non cliquable pour les non autorisés) */}
      <MonEspaceSubMenu />

      {/* Introduction du module */}
      <MonEspaceIntroduction />
    </div>
  );
}