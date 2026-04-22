import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TendersSubMenu } from '@app/components/TendersSubMenu';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { StatusBadge } from '@app/components/StatusBadge';
import { useTenders } from '@app/hooks/useTenders';
import { usePipeline } from '@app/modules/expert/hooks/usePipeline';
import { toast } from 'sonner';
import {
  Calendar,
  MapPin,
  DollarSign,
  Users,
  FileText,
  Building2,
  AlertCircle,
  ListPlus,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

const countryFlags: Record<string, string> = {
  FR: '🇫🇷',
  DE: '🇩🇪',
  GB: '🇬🇧',
  US: '🇺🇸',
  CA: '🇨🇦',
  KE: '🇰🇪',
  TZ: '🇹🇿',
  SN: '🇸🇳',
  CI: '🇨🇮',
  MA: '🇲🇦',
};

export default function AIMatchingTenderDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { allTenders, kpis } = useTenders();
  const { addToPipeline, isInPipeline } = usePipeline();

  // Find tender by ID (ensure string comparison) - use allTenders not tenders.data
  const tender = allTenders.find((t) => String(t.id) === String(id));

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 AIMatchingTenderDetail - Looking for tender:', id);
    console.log('📊 Available tenders:', allTenders.map(t => ({ id: t.id, title: t.title })));
    console.log('✅ Found tender:', tender ? tender.title : 'NOT FOUND');
  }, [id, allTenders, tender]);

  // Document download handler
  const handleDownloadDocument = (docName: string, docUrl?: string) => {
    if (docUrl) {
      // Real download with URL
      const link = document.createElement('a');
      link.href = docUrl;
      link.download = docName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(t('tenders.messages.downloadStarted'));
      console.log('📥 Download started:', docName);
    } else {
      // Mock download for demo purposes
      toast.info(t('tenders.messages.downloadDemo', { fileName: docName }));
      console.log('📥 Download requested for:', docName);
    }
  };

  if (!tender) {
    return (
      <div className="min-h-screen">
        {/* Banner */}
        <PageBanner
          title={t('tenders.module.title')}
          description={t('tenders.module.subtitle')}
          icon={FileText}
          stats={[
            { value: kpis.activeTenders.toString(), label: t('tenders.kpis.active') }
          ]}
        />

        {/* Sub Menu */}
        <TendersSubMenu />

        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-8">
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold text-primary mb-2">
                {t('tenders.detail.notFound')}
              </h2>
              <p className="text-gray-600 mb-6">{t('tenders.detail.notFound.message')}</p>
              <Button onClick={() => navigate('/calls/ai-matching')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back')}
              </Button>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  const isInPipe = isInPipeline(tender.id);
  const isUrgent = tender.daysRemaining <= 7;
  const isToday = tender.daysRemaining === 0;

  const getDeadlineDisplay = () => {
    if (isToday) {
      return t('tenders.detail.deadline.today');
    }
    return t('tenders.detail.deadline.days', { days: tender.daysRemaining.toString() });
  };

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <PageBanner
        title={t('tenders.module.title')}
        description={t('tenders.module.subtitle')}
        icon={FileText}
        stats={[
          { value: kpis.activeTenders.toString(), label: t('tenders.kpis.active') }
        ]}
      />

      {/* Sub Menu */}
      <TendersSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Main Content Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <StatusBadge status={tender.status} />
                    {tender.matchScore && tender.matchScore >= 70 && (
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {tender.matchScore}% {t('tenders.detail.matchScore')}
                      </Badge>
                    )}
                    {isUrgent && (
                      <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {t('tenders.detail.deadline.urgent')}
                      </Badge>
                    )}
                    {isInPipe && (
                      <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                        <ListPlus className="w-3 h-3 mr-1" />
                        {t('tenders.status.inPipeline')}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-primary mb-2">{tender.title}</h1>
                  <p className="text-sm text-muted-foreground">{tender.referenceNumber}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Organization Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('tenders.detail.organization')}</p>
                    <p className="font-semibold text-primary">{tender.organizationName}</p>
                  </div>
                </div>
              </div>

              {/* Key Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Location */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {t('tenders.detail.location')}
                    </p>
                    <p className="font-semibold text-primary">
                      {countryFlags[tender.country] || '🌍'} {tender.country}
                    </p>
                  </div>
                </div>

                {/* Budget */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {t('tenders.detail.budget')}
                    </p>
                    <p className="font-semibold text-primary">{tender.budget.formatted}</p>
                    <p className="text-xs text-muted-foreground">{tender.budget.currency}</p>
                  </div>
                </div>

                {/* Deadline */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className={`w-5 h-5 mt-0.5 ${isUrgent ? 'text-orange-600' : 'text-purple-600'}`} />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {t('tenders.detail.deadline')}
                    </p>
                    <p className={`font-semibold ${isUrgent ? 'text-orange-600' : 'text-primary'}`}>
                      {getDeadlineDisplay()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tender.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Published Date */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {t('tenders.detail.published')}
                    </p>
                    <p className="font-semibold text-primary">
                      {new Date(tender.publishedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sectors */}
              {tender.sectors && tender.sectors.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary mb-3">{t('tenders.detail.sectors')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {tender.sectors.map((sector) => (
                      <Badge key={sector} variant="outline" className="text-sm">
                        {t(`sectors.${sector}`)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {tender.description && (
                <div>
                  <h4 className="font-semibold text-primary mb-3">{t('tenders.detail.description')}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tender.description}</p>
                </div>
              )}

              {/* Eligibility */}
              {tender.eligibility && tender.eligibility.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary mb-3">{t('tenders.detail.eligibility')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {tender.eligibility.map((item, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {tender.documents && tender.documents.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary mb-3">{t('tenders.detail.documents')}</h4>
                  <div className="space-y-2">
                    {tender.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:border-accent transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-primary">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.type}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadDocument(doc.name, doc.url)}
                        >
                          {t('tenders.actions.download')}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              {tender.contactEmail && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-primary mb-2">{t('tenders.detail.contact')}</h4>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">{t('common.email')}:</span> {tender.contactEmail}
                  </p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3 justify-end">
                <Button
                  onClick={() => {
                    addToPipeline(tender.id);
                    toast.success(t('tenders.messages.addedToPipeline'));
                  }}
                  className="gap-2"
                  disabled={isInPipe}
                >
                  <ListPlus className="w-4 h-4" />
                  {isInPipe ? t('tenders.actions.inPipeline') : t('tenders.actions.addToPipeline')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}