import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TendersSubMenu } from '@app/components/TendersSubMenu';
import { StatCard } from '@app/components/StatCard';
import { ActionCard } from '@app/components/ActionCard';
import { FeatureCard } from '@app/components/FeatureCard';
import { LoadingState, EmptyState, ErrorState, SkeletonCard } from '@app/components/SystemStates';
import {
  FileText,
  Send,
  Mail,
  Sparkles,
  Download,
  Target,
  LayoutDashboard,
  FolderOpen,
  Upload,
  Inbox,
  FileType,
} from 'lucide-react';

type LoadingPhase = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export default function CallsEnhanced() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>('loading');
  const [activeTab, setActiveTab] = useState(0);

  // Simulate data loading
  useEffect(() => {
    setLoadingPhase('loading');
    const timer = setTimeout(() => {
      setLoadingPhase('success');
    }, 1500);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const menuItems = [
    { label: "Vue d'ensemble", active: activeTab === 0, icon: LayoutDashboard },
    { label: "Appels d'offres actifs", active: activeTab === 1, icon: FolderOpen },
    { label: 'Soumissions', active: activeTab === 2, icon: Upload },
    { label: 'Invitations', active: activeTab === 3, icon: Inbox, badge: '5' },
    { label: 'Modèles', active: activeTab === 4, icon: FileType },
  ];

  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  const handleRetry = () => {
    setLoadingPhase('loading');
    setTimeout(() => {
      setLoadingPhase('success');
    }, 1500);
  };

  return (
    <div className="min-h-screen">
      <PageBanner
        title="Appels d'offres Hub"
        description="Plateforme centralisée de gestion des appels d'offres avec matching IA et analytics avancés"
        icon={FileText}
        stats={[
          { value: '247', label: "Appels d'offres actifs" }
        ]}
      />

      {/* Sub Menu */}
      <TendersSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Loading State */}
          {loadingPhase === 'loading' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
              <LoadingState message={t('loading')} size="md" />
            </div>
          )}

          {/* Error State */}
          {loadingPhase === 'error' && (
            <ErrorState
              title={t('error.title')}
              message="Impossible de charger les appels d'offres. Veuillez réessayer."
              retry={{
                label: t('error.retry'),
                onClick: handleRetry
              }}
            />
          )}

          {/* Empty State */}
          {loadingPhase === 'empty' && (
            <EmptyState
              icon={<FileText className="h-16 w-16" />}
              title={t('empty.noData')}
              description="Aucun appel d'offres n'est disponible pour le moment"
              action={{
                label: "Créer un appel d'offres",
                onClick: () => alert('Navigation vers création')
              }}
            />
          )}

          {/* Success State - Display Content */}
          {loadingPhase === 'success' && (
            <>
              {/* Content based on active tab */}
              {activeTab === 0 && (
                <>
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
                      title={t('dashboard.invitations')}
                      value="5"
                      badge="2 nouveau"
                      icon={Mail}
                      iconBgColor="bg-purple-50"
                      iconColor="text-purple-500"
                    />
                    {/* StatCard "Valeur du pipeline" supprimée - déplacée vers le module Projets */}
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

                  {/* Feature Cards */}
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
                </>
              )}

              {/* Tab 1: Appels d'offres actifs */}
              {activeTab === 1 && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Appels d'offres actifs (247)</h2>
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="h-6 w-6 text-red-500" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              Appel d'offres #{i + 1} - Projet de développement international
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                              Organisation internationale recherche experts en développement durable
                            </p>
                            <div className="flex gap-4 text-sm text-gray-500">
                              <span>Deadline: 15 Mars 2026</span>
                              <span>Budget: €250K</span>
                              <span className="text-red-600 font-medium">Clôture dans 5 jours</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Soumissions (Empty State Example) */}
              {activeTab === 2 && (
                <EmptyState
                  icon={<Upload className="h-16 w-16" />}
                  title="Aucune soumission"
                  description="Vous n'avez pas encore soumis de candidature aux appels d'offres"
                  action={{
                    label: "Parcourir les appels d'offres",
                    onClick: () => handleTabChange(1)
                  }}
                />
              )}

              {/* Tab 3: Invitations */}
              {activeTab === 3 && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Invitations (5)</h2>
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Mail className="h-6 w-6 text-purple-500" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">
                                Invitation à collaborer - Projet #{i + 1}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                Organisation XYZ vous invite à rejoindre leur consortium
                              </p>
                              <span className="text-xs text-gray-500">Reçu il y a {i + 1} jours</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                              Accepter
                            </button>
                            <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                              Refuser
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Modèles */}
              {activeTab === 4 && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Modèles disponibles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {['Proposition technique', 'Proposition financière', 'ToR Standard', 'CV Expert', 'Lettre de motivation'].map((model, i) => (
                      <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileType className="h-5 w-5 text-indigo-500" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{model}</h3>
                            <p className="text-sm text-gray-500 mt-1">Format: DOCX</p>
                          </div>
                        </div>
                        <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                          <Download className="h-4 w-4" />
                          Télécharger
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Demo Controls */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-3">Contrôles de démonstration</h3>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setLoadingPhase('loading')}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Loading
              </button>
              <button
                onClick={() => setLoadingPhase('success')}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Success
              </button>
              <button
                onClick={() => setLoadingPhase('error')}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Error
              </button>
              <button
                onClick={() => setLoadingPhase('empty')}
                className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                Empty
              </button>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}