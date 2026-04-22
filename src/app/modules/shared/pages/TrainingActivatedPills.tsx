import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useTrainingCommerce } from '@app/contexts/TrainingCommerceContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TrainingSubMenu } from '@app/components/TrainingSubMenu';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Progress } from '@app/components/ui/progress';
import { BookOpen, GraduationCap, Play, RotateCcw } from 'lucide-react';

export default function TrainingActivatedPills() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { activatedTrainings, continueTraining } = useTrainingCommerce();

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('training.activated.title')}
        description={t('training.activated.subtitle')}
        icon={BookOpen}
      />

      <TrainingSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {activatedTrainings.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <h2 className="text-lg font-semibold text-primary mb-2">{t('training.activated.empty')}</h2>
              <p className="text-muted-foreground mb-4">{t('training.activated.emptyMessage')}</p>
              <Button onClick={() => navigate('/training/catalog')}>
                {t('training.actions.browseCatalog')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activatedTrainings.map((item) => {
                const isStarted = item.progress > 0;

                return (
                  <div key={item.courseId} className="bg-white rounded-lg border p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-primary">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{t('training.activated.purchasedOn')} {new Date(item.purchaseDate).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="secondary">
                        {isStarted ? t('training.activated.status.active') : t('training.activated.status.ready')}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('training.myPrograms.progress')}</span>
                        <span className="font-medium text-primary">{item.progress}%</span>
                      </div>
                      <Progress value={item.progress} className="h-2" />
                    </div>

                    <Button
                      className="w-full bg-[#B82547] hover:bg-[#a01f3c] text-white"
                      onClick={() => {
                        continueTraining(item.courseId);
                        navigate('/training');
                      }}
                    >
                      {isStarted ? <RotateCcw className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                      {isStarted ? t('training.actions.continue') : t('training.activated.start')}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
