import { useEffect, useState } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TrainingSubMenu } from '@app/components/TrainingSubMenu';
import {
  Award,
  Calendar,
  Download,
  FolderKanban,
  Sparkles,
} from 'lucide-react';

import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import {
  Alert,
  AlertDescription,
} from '@app/components/ui/alert';

import {
  downloadCertification,
  getTrainingPortfolioCertifications,
  getTrainingPortfolioCompletedTrainings,
  getTrainingPortfolioStats,
  type CompletedTraining,
  type PortfolioCertification,
  type TrainingPortfolioStats,
} from '@app/services/trainingPortfolioService';

export default function TrainingPortfolio() {
  const { t } = useLanguage();

  const [stats, setStats] =
      useState<TrainingPortfolioStats>({
        completedTrainings: 0,
        certifications: 0,
        achievements: 0,
      });

  const [completedTrainings, setCompletedTrainings] =
      useState<CompletedTraining[]>([]);

  const [certifications, setCertifications] =
      useState<PortfolioCertification[]>([]);

  const [loading, setLoading] =
      useState(true);

  const [
    downloadingCertificateId,
    setDownloadingCertificateId,
  ] = useState<string | null>(null);

  const [error, setError] =
      useState('');

  useEffect(() => {
    const loadPortfolioData = async () => {
      setLoading(true);
      setError('');

      try {
        const [
          statsData,
          completedTrainingsData,
          certificationsData,
        ] = await Promise.all([
          getTrainingPortfolioStats(),
          getTrainingPortfolioCompletedTrainings(),
          getTrainingPortfolioCertifications(),
        ]);

        setStats({
          completedTrainings:
              statsData.completedTrainings || 0,
          certifications:
              statsData.certifications || 0,
          achievements:
              statsData.achievements || 0,
        });

        setCompletedTrainings(
            completedTrainingsData || []
        );

        setCertifications(
            certificationsData || []
        );
      } catch (err: any) {
        setError(
            err.message ||
            'Unable to load training portfolio data'
        );
      } finally {
        setLoading(false);
      }
    };

    loadPortfolioData();
  }, []);

  const formatDate = (
      dateValue: string | null | undefined
  ): string => {
    if (!dateValue) {
      return '-';
    }

    return new Date(dateValue).toLocaleDateString();
  };

  const getMatchingCertificationForTraining = (
      training: CompletedTraining
  ): PortfolioCertification | undefined => {
    return certifications.find(
        (certification) =>
            certification.courseId === training.courseId &&
            certification.userId === training.userId
    );
  };

  const getCertificateFileUrl = (
      certification: PortfolioCertification | undefined
  ): string | null => {
    if (!certification) {
      return null;
    }

    return (
        certification.credentialUrl ||
        certification.downloadUrl ||
        null
    );
  };

  const getTrainingCertificateFileName = (
      training: CompletedTraining,
      certification?: PortfolioCertification
  ): string => {
    const safeName =
        certification?.credentialId ||
        certification?.certificationName ||
        training.certificationTitle ||
        training.title ||
        `certificate-${training.courseId}`;

    return `${safeName}`.replace(
        /[\\/:*?"<>|]/g,
        '-'
    );
  };

  const getCertificateFileName = (
      certification: PortfolioCertification
  ): string => {
    const safeName =
        certification.credentialId ||
        certification.certificationName ||
        certification.courseTitle ||
        `certificate-${certification.certificationId}`;

    return `${safeName}`.replace(
        /[\\/:*?"<>|]/g,
        '-'
    );
  };

  const handleViewTrainingCertificate = (
      training: CompletedTraining
  ) => {
    const certification =
        getMatchingCertificationForTraining(training);

    const fileUrl =
        getCertificateFileUrl(certification);

    if (fileUrl) {
      window.open(
          fileUrl,
          '_blank',
          'noopener,noreferrer'
      );
      return;
    }

    setError(
        'No certificate file found for this completed training'
    );
  };

  const handleDownloadTrainingCertificate = async (
      training: CompletedTraining
  ) => {
    const certification =
        getMatchingCertificationForTraining(training);

    const fileUrl =
        getCertificateFileUrl(certification);

    if (!fileUrl) {
      setError(
          'No certificate file found for this completed training'
      );
      return;
    }

    setError('');
    setDownloadingCertificateId(
        `training-${training.enrollmentId}`
    );

    try {
      await downloadCertification(
          fileUrl,
          getTrainingCertificateFileName(
              training,
              certification
          )
      );
    } catch (err: any) {
      setError(
          err.message ||
          'Unable to download certificate'
      );
    } finally {
      setDownloadingCertificateId(null);
    }
  };

  const handleViewCertificate = (
      certification: PortfolioCertification
  ) => {
    const fileUrl =
        getCertificateFileUrl(certification);

    if (fileUrl) {
      window.open(
          fileUrl,
          '_blank',
          'noopener,noreferrer'
      );
    }
  };

  const handleDownloadCertificate = async (
      certification: PortfolioCertification
  ) => {
    const fileUrl =
        getCertificateFileUrl(certification);

    if (!fileUrl) {
      setError(
          'No certificate file found for this certificate'
      );
      return;
    }

    setError('');
    setDownloadingCertificateId(
        `certification-${certification.certificationId}`
    );

    try {
      await downloadCertification(
          fileUrl,
          getCertificateFileName(certification)
      );
    } catch (err: any) {
      setError(
          err.message ||
          'Unable to download certificate'
      );
    } finally {
      setDownloadingCertificateId(null);
    }
  };

  return (
      <div className="min-h-screen">
        <PageBanner
            title={t('training.portfolio.title')}
            description={t(
                'training.portfolio.subtitle'
            )}
            icon={FolderKanban}
        />

        <TrainingSubMenu />

        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-6 space-y-6">
            {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  {t(
                      'training.portfolio.completedTrainings'
                  )}
                </p>

                <p className="text-2xl font-bold text-primary">
                  {loading
                      ? '...'
                      : stats.completedTrainings}
                </p>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  {t(
                      'training.portfolio.certifications'
                  )}
                </p>

                <p className="text-2xl font-bold text-primary">
                  {loading
                      ? '...'
                      : stats.certifications}
                </p>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  {t(
                      'training.portfolio.achievements'
                  )}
                </p>

                <p className="text-2xl font-bold text-primary">
                  {loading
                      ? '...'
                      : stats.achievements}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-5">
              <h2 className="text-lg font-semibold text-primary mb-4">
                {t(
                    'training.portfolio.showcase'
                )}
              </h2>

              {loading ? (
                  <p className="text-muted-foreground">
                    Loading completed trainings...
                  </p>
              ) : completedTrainings.length === 0 ? (
                  <p className="text-muted-foreground">
                    {t(
                        'training.portfolio.empty'
                    )}
                  </p>
              ) : (
                  <div className="space-y-4">
                    {completedTrainings.map(
                        (training) => {
                          const certification =
                              getMatchingCertificationForTraining(
                                  training
                              );

                          const fileUrl =
                              getCertificateFileUrl(
                                  certification
                              );

                          const isDownloading =
                              downloadingCertificateId ===
                              `training-${training.enrollmentId}`;

                          return (
                              <div
                                  key={`completed-training-${training.enrollmentId}`}
                                  className="border rounded-lg p-4"
                              >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                  <div>
                                    <h3 className="font-semibold text-primary">
                                      {training.title}
                                    </h3>

                                    <p className="text-sm text-muted-foreground">
                                      Completed on{' '}
                                      {formatDate(
                                          training.completedAt
                                      )}
                                    </p>
                                  </div>

                                  {training.certificationAvailable && (
                                      <div className="flex flex-wrap items-center gap-2">
                                        <Badge
                                            className="bg-green-50 text-green-700 border-green-200"
                                            variant="outline"
                                        >
                                          {t(
                                              'training.portfolio.certified'
                                          )}
                                        </Badge>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                handleViewTrainingCertificate(
                                                    training
                                                )
                                            }
                                            disabled={!fileUrl}
                                        >
                                          <Award className="w-4 h-4 mr-2" />
                                          {t(
                                              'training.actions.viewCertificate'
                                          )}
                                        </Button>

                                        <Button
                                            size="sm"
                                            className="bg-[#B82547] hover:bg-[#a01f3c] text-white"
                                            onClick={() =>
                                                handleDownloadTrainingCertificate(
                                                    training
                                                )
                                            }
                                            disabled={
                                                !fileUrl ||
                                                isDownloading
                                            }
                                        >
                                          <Download className="w-4 h-4 mr-2" />
                                          {isDownloading
                                              ? 'Downloading...'
                                              : t(
                                                  'training.actions.downloadCertificate'
                                              )}
                                        </Button>
                                      </div>
                                  )}
                                </div>
                              </div>
                          );
                        }
                    )}
                  </div>
              )}
            </div>

            <div className="bg-white rounded-lg border p-5">
              <h2 className="text-lg font-semibold text-primary mb-4">
                {t(
                    'training.certificatesHistory.title'
                )}
              </h2>

              {loading ? (
                  <p className="text-muted-foreground">
                    Loading certifications...
                  </p>
              ) : certifications.length === 0 ? (
                  <p className="text-muted-foreground">
                    {t(
                        'training.certifications.noResults.message'
                    )}
                  </p>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certifications.map(
                        (certification) => {
                          const fileUrl =
                              getCertificateFileUrl(
                                  certification
                              );

                          const isDownloading =
                              downloadingCertificateId ===
                              `certification-${certification.certificationId}`;

                          return (
                              <div
                                  key={`history-${certification.certificationId}`}
                                  className="border rounded-lg p-4"
                              >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                  <div>
                                    <h3 className="font-semibold text-primary">
                                      {
                                        certification.certificationName
                                      }
                                    </h3>

                                    <p className="text-sm text-muted-foreground">
                                      {
                                        certification.issuingOrganization
                                      }
                                    </p>
                                  </div>

                                  {certification.certified && (
                                      <Badge
                                          className="bg-green-50 text-green-700 border-green-200"
                                          variant="outline"
                                      >
                                        Passed
                                      </Badge>
                                  )}
                                </div>

                                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                                  {certification.credentialId && (
                                      <p>
                                        {t(
                                            'training.certifications.credentialId'
                                        )}
                                        :{' '}
                                        <span className="font-medium text-primary">
                                          {
                                            certification.credentialId
                                          }
                                        </span>
                                      </p>
                                  )}

                                  {certification.completedOn && (
                                      <p className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {t(
                                            'training.certifications.earnedDate'
                                        )}
                                        :{' '}
                                        {formatDate(
                                            certification.completedOn
                                        )}
                                      </p>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                          handleViewCertificate(
                                              certification
                                          )
                                      }
                                      disabled={!fileUrl}
                                  >
                                    <Award className="w-4 h-4 mr-2" />
                                    {t(
                                        'training.actions.viewCertificate'
                                    )}
                                  </Button>

                                  <Button
                                      size="sm"
                                      className="bg-[#B82547] hover:bg-[#a01f3c] text-white"
                                      onClick={() =>
                                          handleDownloadCertificate(
                                              certification
                                          )
                                      }
                                      disabled={
                                          !fileUrl ||
                                          isDownloading
                                      }
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    {isDownloading
                                        ? 'Downloading...'
                                        : t(
                                            'training.actions.downloadCertificate'
                                        )}
                                  </Button>
                                </div>
                              </div>
                          );
                        }
                    )}
                  </div>
              )}
            </div>

            <div className="bg-white rounded-lg border p-5">
              <h2 className="text-lg font-semibold text-primary mb-3">
                {t(
                    'training.portfolio.achievementTitle'
                )}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4 bg-pink-50 border-pink-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-pink-700" />

                    <span className="font-medium text-pink-900">
                      {t(
                          'training.portfolio.badge.consistent'
                      )}
                    </span>
                  </div>

                  <p className="text-sm text-pink-800">
                    {t(
                        'training.portfolio.badge.consistentDesc'
                    )}
                  </p>
                </div>

                <div className="rounded-lg border p-4 bg-blue-50 border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-blue-700" />

                    <span className="font-medium text-blue-900">
                      {t(
                          'training.portfolio.badge.certified'
                      )}
                    </span>
                  </div>

                  <p className="text-sm text-blue-800">
                    {t(
                        'training.portfolio.badge.certifiedDesc'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </div>
  );
}