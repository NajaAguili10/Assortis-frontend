import { PageContainer } from '@app/components/PageContainer';
import { TendersSubMenu } from '@app/components/TendersSubMenu';
import { StatCard } from '@app/components/StatCard';
import { FeatureCard } from '@app/components/FeatureCard';
import {
  FileText,
  Send,
  Mail,
  Download,
  Target,
  LayoutDashboard,
  FolderOpen,
  Upload,
  Inbox,
  FileType,
} from 'lucide-react';

export default function Calls() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <PageBanner
        title="Appels d'offres Hub"
        description="Plateforme centralisée de gestion des appels d'offres avec matching IA et analytics avancés"
        icon={FileText}
        stats={[
          { value: '247', label: 'Appels d\'offres actifs' }
        ]}
      />

      {/* Sub Menu */}
      <TendersSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <StatCard
              title="Appels d'offres actifs"
              value="247"
              trend="+12%"
              icon={FileText}
              iconBgColor="bg-red-50"
              iconColor="text-red-500"
            />
            <StatCard
              title="Mes soumissions"
              value="8"
              subtitle="3 en attente"
              icon={Send}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
            />
            <StatCard
              title="Invitations"
              value="5"
              badge="2 nouveau"
              icon={Mail}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-500"
            />
            <StatCard
              title="Valeur du pipeline"
              value="€4.5M"
              subtitle="12 candidatures"
              icon={Target}
              iconBgColor="bg-cyan-50"
              iconColor="text-cyan-500"
            />
          </div>

          {/* Feature Cards - 3 per row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              title="Appels d'offres actifs"
              description="Parcourir et rechercher les opportunités actuelles"
              icon={FileText}
              iconBgColor="bg-red-50"
              iconColor="text-red-500"
              stats={[
                { label: 'Open tenders', value: '247' },
                { label: 'Closing soon', value: '23' },
              ]}
              link="#"
            />
            <FeatureCard
              title="Mes soumissions"
              description="Suivez vos candidatures aux appels d'offres"
              icon={Send}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
              stats={[
                { label: 'Soumissions totales', value: '8' },
                { label: 'En cours', value: '3' },
              ]}
              link="#"
            />
            <FeatureCard
              title="Invitations"
              description="Répondez aux demandes de collaboration"
              icon={Mail}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-500"
              badge="2"
              stats={[
                { label: 'En attente', value: '5' },
              ]}
              link="#"
            />
            <FeatureCard
              title="Modèles"
              description="Téléchargez des modèles de propositions et de TdR"
              icon={FileType}
              iconBgColor="bg-indigo-50"
              iconColor="text-indigo-500"
              link="#"
            />
            {/* Carte Pipeline supprimée - déplacée vers le module Projets */}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}