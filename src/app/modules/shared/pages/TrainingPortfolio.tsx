import { useLanguage } from '@app/contexts/LanguageContext';
import { useTrainingCommerce } from '@app/contexts/TrainingCommerceContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TrainingSubMenu } from '@app/components/TrainingSubMenu';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { useTraining } from '@app/hooks/useTraining';
import { CertificationStatusEnum } from '@app/types/training.dto';
import { Award, Calendar, Download, FolderKanban, Sparkles } from 'lucide-react';

export default function TrainingPortfolio() {
  const { t } = useLanguage();
  const { completedTrainings } = useTrainingCommerce();
  const { certifications } = useTraining();

  const earnedCertifications = certifications.filter(
    (cert) => cert.status === CertificationStatusEnum.PASSED || cert.credentialId,
  );

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t('training.portfolio.completedTrainings')}</p>
              <p className="text-2xl font-bold text-primary">{completedTrainings.length}</p>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t('training.portfolio.certifications')}</p>
              <p className="text-2xl font-bold text-primary">{earnedCertifications.length}</p>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t('training.portfolio.achievements')}</p>
              <p className="text-2xl font-bold text-primary">{Math.max(earnedCertifications.length + completedTrainings.length, 1)}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-5">
            <h2 className="text-lg font-semibold text-primary mb-4">{t('training.portfolio.showcase')}</h2>
            {completedTrainings.length === 0 ? (
              <p className="text-muted-foreground">{t('training.portfolio.empty')}</p>
            ) : (
              <div className="space-y-4">
                {completedTrainings.map((item) => (
                  <div key={item.courseId} className="border rounded-lg p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-primary">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t('training.portfolio.completedOn')} {item.completionDate ? new Date(item.completionDate).toLocaleDateString() : '-'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-50 text-green-700 border-green-200" variant="outline">
                          {t('training.portfolio.certified')}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Award className="w-4 h-4 mr-2" />
                          {t('training.actions.viewCertificate')}
                        </Button>
                        <Button size="sm" className="bg-[#B82547] hover:bg-[#a01f3c] text-white">
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
            <h2 className="text-lg font-semibold text-primary mb-4">{t('training.certificatesHistory.title')}</h2>
            {earnedCertifications.length === 0 ? (
              <p className="text-muted-foreground">{t('training.certifications.noResults.message')}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {earnedCertifications.map((cert) => (
                  <div key={cert.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-semibold text-primary">{cert.title}</h3>
                        <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                      </div>
                      <Badge className="bg-green-50 text-green-700 border-green-200" variant="outline">
                        {t(`training.certStatus.${cert.status}`)}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      {cert.credentialId && (
                        <p>
                          {t('training.certifications.credentialId')}: <span className="font-medium text-primary">{cert.credentialId}</span>
                        </p>
                      )}
                      {cert.earnedDate && (
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {t('training.certifications.earnedDate')}: {new Date(cert.earnedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline">
                        <Award className="w-4 h-4 mr-2" />
                        {t('training.actions.viewCertificate')}
                      </Button>
                      <Button size="sm" className="bg-[#B82547] hover:bg-[#a01f3c] text-white">
                        <Download className="w-4 h-4 mr-2" />
                        {t('training.actions.downloadCertificate')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border p-5">
            <h2 className="text-lg font-semibold text-primary mb-3">{t('training.portfolio.achievementTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 bg-pink-50 border-pink-100">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-pink-700" />
                  <span className="font-medium text-pink-900">{t('training.portfolio.badge.consistent')}</span>
                </div>
                <p className="text-sm text-pink-800">{t('training.portfolio.badge.consistentDesc')}</p>
              </div>
              <div className="rounded-lg border p-4 bg-blue-50 border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-blue-700" />
                  <span className="font-medium text-blue-900">{t('training.portfolio.badge.certified')}</span>
                </div>
                <p className="text-sm text-blue-800">{t('training.portfolio.badge.certifiedDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
