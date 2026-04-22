import { useState } from 'react';
import Layout from '@app/components/Layout';
import { PageContainer } from '@app/components/PageContainer';
import { PageBanner } from '@app/components/PageBanner';
import { 
  LoadingState, 
  EmptyState, 
  ErrorState, 
  InfoState, 
  SkeletonCard,
  PageLoading 
} from '@app/components/SystemStates';
import { FileText, Search, Users, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@app/contexts/LanguageContext';

export default function SystemStatesDemo() {
  const { t } = useLanguage();
  const [showPageLoading, setShowPageLoading] = useState(false);

  if (showPageLoading) {
    setTimeout(() => setShowPageLoading(false), 2000);
    return <PageLoading />;
  }

  return (
    <Layout>
      <PageBanner
        title="System States Demo"
        subtitle="Exemples des différents états système de la plateforme Assortis"
      />
      
      <PageContainer>
        {/* Loading States */}
        <div className="mb-8">
          <h2 className="mb-4 font-semibold">Loading States</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="mb-4 text-sm font-medium text-gray-700">Small</h3>
              <LoadingState size="sm" />
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="mb-4 text-sm font-medium text-gray-700">Medium (Default)</h3>
              <LoadingState size="md" message={t('loading')} />
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="mb-4 text-sm font-medium text-gray-700">Large</h3>
              <LoadingState size="lg" message="Chargement des données..." />
            </div>
          </div>
        </div>

        {/* Empty States */}
        <div className="mb-8">
          <h2 className="mb-4 font-semibold">Empty States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="mb-4 text-sm font-medium text-gray-700">Sans action</h3>
              <EmptyState
                icon={<FileText className="h-16 w-16" />}
                title={t('empty.noData')}
                description="Aucun appel d'offres n'est disponible pour le moment"
              />
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="mb-4 text-sm font-medium text-gray-700">Avec action</h3>
              <EmptyState
                icon={<Search className="h-16 w-16" />}
                title={t('empty.noResults')}
                description="Essayez de modifier vos critères de recherche"
                action={{
                  label: "Réinitialiser les filtres",
                  onClick: () => alert('Filtres réinitialisés')
                }}
              />
            </div>
          </div>
        </div>

        {/* Error States */}
        <div className="mb-8">
          <h2 className="mb-4 font-semibold">Error States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="mb-4 text-sm font-medium text-gray-700">Erreur simple</h3>
              <ErrorState
                message="Impossible de charger les données"
              />
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="mb-4 text-sm font-medium text-gray-700">Erreur avec retry</h3>
              <ErrorState
                title="Erreur de connexion"
                message="La connexion au serveur a échoué. Veuillez réessayer."
                retry={{
                  label: t('error.retry'),
                  onClick: () => alert('Tentative de reconnexion...')
                }}
              />
            </div>
          </div>
        </div>

        {/* Info States */}
        <div className="mb-8">
          <h2 className="mb-4 font-semibold">Info States</h2>
          <div className="space-y-4">
            <InfoState
              variant="info"
              title="Information"
              description="Votre profil est complet à 85%. Ajoutez vos certifications pour atteindre 100%."
            />
            <InfoState
              icon={<AlertTriangle className="h-5 w-5" />}
              variant="warning"
              title="Attention"
              description="Votre abonnement expire dans 7 jours. Renouvelez-le pour continuer à accéder aux fonctionnalités premium."
            />
            <InfoState
              icon={<Users className="h-5 w-5" />}
              variant="success"
              title="Succès"
              description="Votre organisation a été vérifiée avec succès. Vous pouvez maintenant postuler aux appels d'offres."
            />
          </div>
        </div>

        {/* Skeleton Loading */}
        <div className="mb-8">
          <h2 className="mb-4 font-semibold">Skeleton Loading (Lists)</h2>
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>

        {/* Page Loading Demo */}
        <div className="mb-8">
          <h2 className="mb-4 font-semibold">Full Page Loading</h2>
          <button
            onClick={() => setShowPageLoading(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Afficher le chargement pleine page
          </button>
        </div>
      </PageContainer>
    </Layout>
  );
}