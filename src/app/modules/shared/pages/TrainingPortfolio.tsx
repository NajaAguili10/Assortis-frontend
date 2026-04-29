import { useEffect, useState } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TrainingSubMenu } from '@app/components/TrainingSubMenu';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Alert, AlertDescription } from '@app/components/ui/alert';
import { Award, Download, FolderKanban, Sparkles } from 'lucide-react';
import {
  downloadCertification,
  getTrainingPortfolioCertifications,
  getTrainingPortfolioStats,
  type PortfolioCertification,
  type TrainingPortfolioStats,
} from '@app/services/trainingPortfolioService';

export default function TrainingPortfolio() {
  const { t } = useLanguage();

  const [stats, setStats] = useState<TrainingPortfolioStats>({
    completedTrainings: 0,
    certifications: 0,
    achievements: 0,
  });

  const [certifications, setCertifications] = useState<PortfolioCertification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPortfolioData = async () => {
      setLoading(true);
      setError('');

      try {
        const [statsData, certificationsData] = await Promise.all([
          getTrainingPortfolioStats(),
          getTrainingPortfolioCertifications(),
        ]);

        setStats(statsData);
        setCertifications(certificationsData);
      } catch (err: any) {
        setError(err.message || 'Unable to load training portfolio data');
      } finally {
        setLoading(false);
      }
    };

    loadPortfolioData();
  }, []);

  const handleViewCertificate = (certification: PortfolioCertification) => {
    if (certification.credentialUrl) {
      window.open(certification.credentialUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownloadCertificate = async (certification: PortfolioCertification) => {
    try {
      await downloadCertification(
          certification.downloadUrl,
          `${certification.credentialId || certification.certificationId}.pdf`
      );
    } catch (err: any) {
      setError(err.message || 'Unable to download certificate');
    }
  };

  return (
      <div className="min-h-screen">
        <PageBanner
            title={t('training.portfolio.title')}
            description={t('training.portfolio.subtitle')}
            icon={FolderKanban}
        />

        <TrainingSubMenu />

        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-6 space-y-6">
            {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  {t('training.portfolio.completedTrainings')}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {loading ? '...' : stats.completedTrainings}
                </p>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  {t('training.portfolio.certifications')}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {loading ? '...' : stats.certifications}
                </p>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  {t('training.portfolio.achievements')}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {loading ? '...' : stats.achievements}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-5">
              <h2 className="text-lg font-semibold text-primary mb-4">
                {t('training.portfolio.showcase')}
              </h2>

              {loading ? (
                  <p className="text-muted-foreground">Loading certifications...</p>
              ) : certifications.length === 0 ? (
                  <p className="text-muted-foreground">{t('training.portfolio.empty')}</p>
              ) : (
                  <div className="space-y-4">
                    {certifications.map((certification) => (
                        <div key={certification.certificationId} className="border rounded-lg p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <h3 className="font-semibold text-primary">
                                {certification.courseTitle}
                              </h3>

                              <p className="text-sm text-muted-foreground">
                                {certification.certificationName}
                              </p>

                              <p className="text-sm text-muted-foreground">
                                {t('training.portfolio.completedOn')}{' '}
                                {certification.completedOn
                                    ? new Date(certification.completedOn).toLocaleDateString()
                                    : '-'}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {certification.userFirstName} {certification.userLastName} ·{' '}
                                {certification.userEmail}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {certification.certified && (
                                  <Badge className="bg-green-50 text-green-700 border-green-200" variant="outline">
                                    {t('training.portfolio.certified')}
                                  </Badge>
                              )}

                              <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewCertificate(certification)}
                                  disabled={!certification.credentialUrl}
                              >
                                <Award className="w-4 h-4 mr-2" />
                                {t('training.actions.viewCertificate')}
                              </Button>

                              <Button
                                  size="sm"
                                  className="bg-[#B82547] hover:bg-[#a01f3c] text-white"
                                  onClick={() => handleDownloadCertificate(certification)}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                {t('training.actions.downloadCertificate')}
                              </Button>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
              )}
            </div>

            <div className="bg-white rounded-lg border p-5">
              <h2 className="text-lg font-semibold text-primary mb-3">
                {t('training.portfolio.achievementTitle')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4 bg-pink-50 border-pink-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-pink-700" />
                    <span className="font-medium text-pink-900">
                    {t('training.portfolio.badge.consistent')}
                  </span>
                  </div>
                  <p className="text-sm text-pink-800">
                    {t('training.portfolio.badge.consistentDesc')}
                  </p>
                </div>

                <div className="rounded-lg border p-4 bg-blue-50 border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-blue-700" />
                    <span className="font-medium text-blue-900">
                    {t('training.portfolio.badge.certified')}
                  </span>
                  </div>
                  <p className="text-sm text-blue-800">
                    {t('training.portfolio.badge.certifiedDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </div>
  );
}
