import { useLanguage } from '@app/contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { StatCard } from '@app/components/StatCard';
import { ActionCard } from '@app/components/ActionCard';
import { FeatureCard } from '@app/components/FeatureCard';
import { PageContainer } from '@app/components/PageContainer';
import { BANNER_DIMENSIONS } from '@app/types/banner.dto';
import {
  FileText,
  Send,
  Mail,
  TrendingUp,
  Sparkles,
  Download,
  Target,
  FileCheck,
} from 'lucide-react';

export default function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div
        className="bg-primary text-white border-b-4 border-accent flex items-center"
        style={{ height: BANNER_DIMENSIONS.height.default }}
      >
        <div className="mx-auto max-w-6xl w-full px-4 sm:px-5 lg:px-6">
          <div className="flex items-center gap-6">
            <div
              className="bg-accent rounded-xl shadow-lg flex items-center justify-center flex-shrink-0"
              style={{
                width: BANNER_DIMENSIONS.iconSize.width,
                height: BANNER_DIMENSIONS.iconSize.height,
              }}
            >
              <FileText className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{t('dashboard.title')}</h1>
              <p className="text-white/80 text-base">{t('dashboard.subtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Centered Container */}
      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <StatCard
              title={t('dashboard.activeCalls')}
              value="247"
              trend="+12%"
              icon={FileText}
              iconBgColor="bg-red-50"
              iconColor="text-red-500"
            />
            <StatCard
              title={t('dashboard.submissions')}
              value="8"
              subtitle="3 en attente"
              icon={Send}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
            />
            <StatCard
              title={t('dashboard.invitations')}
              value="5"
              badge="2 nouveau"
              icon={Mail}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-500"
            />
            {/* StatCard Pipeline supprimée - déplacée vers le module Projets */}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-primary mb-4">{t('actions.quick')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ActionCard
                title={t('actions.aiMatching')}
                icon={Sparkles}
                badge="IA"
                onClick={() => navigate('/calls/ai-matching')}
              />
              <ActionCard
                title={t('actions.export')}
                icon={Download}
                onClick={() => navigate('/calls/active')}
              />
            </div>
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
              link="/calls"
            />
            <FeatureCard
              title="Mes soumissions"
              description="Suivez vos candidatures aux appels d'offres"
              icon={Send}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
              stats={[
                { label: 'Soumissions totales', value: '8' },
                { label: 'En cours d\'examen', value: '3' },
              ]}
              link="/calls"
            />
            <FeatureCard
              title="Invitations"
              description="Répondez aux demandes de collaboration"
              icon={Mail}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-500"
              badge="2"
              stats={[
                { label: 'Invitations en attente', value: '5' },
              ]}
              link="/calls"
            />
            <FeatureCard
              title="Modèles"
              description="Téléchargez des modèles de propositions et de ToR"
              icon={FileCheck}
              iconBgColor="bg-green-50"
              iconColor="text-green-500"
              link="/calls"
            />
            {/* FeatureCard Pipeline supprimée - déplacée vers le module Projets */}
            <FeatureCard
              title="Analytics"
              description="Analysez vos performances et tendances"
              icon={TrendingUp}
              iconBgColor="bg-orange-50"
              iconColor="text-orange-500"
              link="/calls"
            />
          </div>
        </div>
      </PageContainer>
    </div>
  );
}