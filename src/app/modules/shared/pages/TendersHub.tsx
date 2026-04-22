import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TendersSubMenu } from '@app/components/TendersSubMenu';
import { OrganizationTendersLanding } from '@app/components/OrganizationTendersLanding';
import { StatCard } from '@app/components/StatCard';
import { TenderFeatureCard } from '@app/components/TenderFeatureCard';
import { TenderMetricsCard } from '@app/components/TenderMetricsCard';
import { AccessDenied } from '@app/components/AccessDenied';
import { Separator } from '@app/components/ui/separator';
import { useTenders } from '@app/hooks/useTenders';
import { hasTendersAccess } from '@app/services/permissions.service';
import {
  FileText,
  Target,
} from 'lucide-react';

export default function TendersHub() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { kpis } = useTenders();
  
  // Vérifier les permissions d'accès
  const hasAccess = hasTendersAccess(user?.accountType);
  const isOrganizationUser = user?.accountType === 'organization';
  
  // Définir les sous-menus et leurs descriptions pour la page d'accès refusé
  const subMenuItems = [
    {
      label: t('tenders.submenu.active'),
      description: t('permissions.tenders.features.active.description')
    },
    {
      label: t('tenders.submenu.tors'),
      description: t('tors.subtitle')
    },
    {
      label: t('tenders.submenu.aiMatching'),
      description: t('permissions.tenders.features.aiMatching.description')
    },
    {
      label: t('tenders.submenu.pipeline'),
      description: t('permissions.tenders.features.pipeline.description')
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <PageBanner
        title={t('tenders.module.title')}
        description={t('tenders.module.subtitle')}
        icon={FileText}
        stats={hasAccess ? [
          { value: kpis.activeTenders.toString(), label: t('tenders.kpis.activeTenders') }
        ] : []}
      />

      {/* Sub Menu */}
      <TendersSubMenu />

      {/* Contenu selon les permissions */}
      {!hasAccess ? (
        <AccessDenied 
          module="tenders" 
          accountType={user?.accountType}
          subMenuItems={subMenuItems}
        />
      ) : isOrganizationUser ? (
        <OrganizationTendersLanding />
      ) : (
        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-6">
            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <StatCard
                title={t('tenders.kpis.active')}
                value={kpis.activeTenders.toString()}
                icon={FileText}
                iconBgColor="bg-red-50"
                iconColor="text-red-500"
              />
              {/* StatCard Pipeline Value supprimée - déplacée vers le module Projets */}
            </div>

            <Separator className="my-6" />

            {/* Feature Cards Section - Métriques dynamiques */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Active Tenders Card */}
                <TenderFeatureCard
                  titleKey="tenders.features.activeCalls.title"
                  descriptionKey="tenders.features.activeCalls.description"
                  icon={FileText}
                  iconBgColor="bg-red-50"
                  iconColor="text-red-500"
                  stats={[
                    { labelKey: 'card.calls.open', value: kpis.activeTenders },
                    { labelKey: 'tenders.kpis.closingSoon', value: Math.floor(kpis.activeTenders * 0.1) },
                  ]}
                  link="/calls/active"
                />

                {/* ToRs Card */}
                <TenderFeatureCard
                  titleKey="tenders.submenu.tors"
                  descriptionKey="tors.subtitle"
                  icon={FileText}
                  iconBgColor="bg-blue-50"
                  iconColor="text-blue-500"
                  stats={[
                    { labelKey: 'tors.stats.active', value: 3 },
                    { labelKey: 'tors.stats.inPipeline', value: 1 },
                  ]}
                  link="/calls/tors"
                />

                {/* Pipeline Card supprimée - déplacée vers le module Projets */}
              </div>
            </div>
          </div>
        </PageContainer>
      )}
    </div>
  );
}