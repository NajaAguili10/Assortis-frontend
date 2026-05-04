import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OrganizationsSubMenu } from '@app/components/OrganizationsSubMenu';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { partnershipService, type PartnershipListItem } from '@app/services/partnershipService';
import {
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  Briefcase,
  FileText,
  Target,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Users,
  TrendingUp,
  Handshake,
} from 'lucide-react';

export default function OrganizationsPartnershipDetail() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [partnership, setPartnership] = useState<PartnershipListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadPartnership = async () => {
      setIsLoading(true);

      try {
        const partnerships = await partnershipService.getPartnerships();

        if (!isMounted) {
          return;
        }

        setPartnership(partnerships.find((item) => item.id === id) ?? null);
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching partnership detail:', error);
          setPartnership(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPartnership();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <PageBanner
          title={t('common.loading')}
          description=""
          icon={Building2}
        />
        <PageContainer>
          <OrganizationsSubMenu />
          <div className="text-center py-12">
            <Handshake className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </PageContainer>
      </div>
    );
  }

  if (!partnership) {
    return (
      <div className="min-h-screen">
        <PageBanner
          title={t('organizations.partnerships.detail.notFound')}
          description=""
          icon={Building2}
        />
        <PageContainer>
          <OrganizationsSubMenu />
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">{t('organizations.partnerships.detail.notFoundDescription')}</p>
            <Button className="mt-6" onClick={() => navigate('/organizations/partnerships')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>
          </div>
        </PageContainer>
      </div>
    );
  }

  const getStatusConfig = (status: PartnershipListItem['status']) => {
    switch (status) {
      case 'active':
        return {
          label: t('organizations.partnerships.status.active'),
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          iconColor: 'text-green-600',
          borderColor: 'border-green-200',
        };
      case 'pending':
        return {
          label: t('organizations.partnerships.status.pending'),
          icon: Clock,
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          iconColor: 'text-yellow-600',
          borderColor: 'border-yellow-200',
        };
      case 'completed':
        return {
          label: t('organizations.partnerships.status.completed'),
          icon: CheckCircle,
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          iconColor: 'text-blue-600',
          borderColor: 'border-blue-200',
        };
      case 'terminated':
        return {
          label: t('organizations.partnerships.status.terminated'),
          icon: XCircle,
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          iconColor: 'text-red-600',
          borderColor: 'border-red-200',
        };
    }
  };

  const getPartnershipTypeConfig = (type: PartnershipListItem['partnershipType']) => {
    switch (type) {
      case 'consortium':
        return {
          label: t('organizations.partnerships.type.consortium'),
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
        };
      case 'collaboration':
        return {
          label: t('organizations.partnerships.type.collaboration'),
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
        };
      case 'strategic':
        return {
          label: t('organizations.partnerships.type.strategic'),
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200',
        };
      case 'operational':
        return {
          label: t('organizations.partnerships.type.operational'),
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200',
        };
    }
  };

  const statusConfig = getStatusConfig(partnership.status);
  const typeConfig = getPartnershipTypeConfig(partnership.partnershipType);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen">
      <PageBanner
        title={partnership.organizationName}
        description={partnership.organizationType}
        icon={Building2}
      />

      <PageContainer>
        <OrganizationsSubMenu />

        <div className="grid gap-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#3d4654]">
                {t('organizations.partnerships.detail.overview')}
              </h3>
              <div className="flex gap-2">
                <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}>
                  <StatusIcon className={`w-3 h-3 mr-1 ${statusConfig.iconColor}`} />
                  {statusConfig.label}
                </Badge>
                <Badge className={`${typeConfig.bgColor} ${typeConfig.textColor} border ${typeConfig.borderColor}`}>
                  {typeConfig.label}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    {t('organizations.partnerships.detail.organizationName')}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <p className="text-base text-[#3d4654] font-medium">{partnership.organizationName}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    {t('organizations.partnerships.detail.organizationType')}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <p className="text-base text-[#3d4654]">{partnership.organizationType}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    {t('organizations.partnerships.detail.sector')}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <p className="text-base text-[#3d4654]">{partnership.sector}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    {t('organizations.partnerships.detail.region')}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <p className="text-base text-[#3d4654]">{partnership.region}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    {t('organizations.partnerships.detail.startDate')}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-base text-[#3d4654]">
                      {new Date(partnership.startDate).toLocaleDateString(t('common.locale'), {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {partnership.endDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      {t('organizations.partnerships.detail.endDate')}
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-base text-[#3d4654]">
                        {new Date(partnership.endDate).toLocaleDateString(t('common.locale'), {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    {t('organizations.partnerships.detail.projectsCount')}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <p className="text-base text-[#3d4654] font-semibold">{partnership.projectsCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {partnership.description && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-[#3d4654] mb-4">
                {t('organizations.partnerships.detail.description')}
              </h3>
              <p className="text-gray-600 leading-relaxed">{partnership.description}</p>
            </div>
          )}

          {(partnership.tenderReference || partnership.projectCode) && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-[#3d4654] mb-4">
                {t('organizations.partnerships.detail.reference')}
              </h3>

              {partnership.partnershipType === 'consortium' && partnership.tenderReference && (
                <div className="p-4 rounded-lg bg-blue-50 border-2 border-blue-200">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          {t('organizations.partnerships.detail.tenderReference')}
                        </span>
                      </div>
                      <Badge className="bg-blue-600 text-white hover:bg-blue-700 mb-2">
                        {partnership.tenderReference}
                      </Badge>
                      <p className="text-sm text-blue-900 font-medium">{partnership.tenderTitle}</p>
                    </div>
                  </div>
                </div>
              )}

              {partnership.partnershipType === 'collaboration' && partnership.projectCode && (
                <div className="p-4 rounded-lg bg-green-50 border-2 border-green-200">
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">
                          {t('organizations.partnerships.detail.projectReference')}
                        </span>
                      </div>
                      <Badge className="bg-green-600 text-white hover:bg-green-700 mb-2">
                        {partnership.projectCode}
                      </Badge>
                      <p className="text-sm text-green-900 font-medium">{partnership.projectTitle}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
