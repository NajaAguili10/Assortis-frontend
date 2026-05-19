import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';

import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TrainingSubMenu } from '@app/components/TrainingSubMenu';

import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Progress } from '@app/components/ui/progress';
import { Alert, AlertDescription } from '@app/components/ui/alert';

import {
    BookOpen,
    GraduationCap,
    RotateCcw,
} from 'lucide-react';

import {
    getTrainingPortfolioOngoingTrainings,
    type OngoingTraining,
} from '@app/services/trainingPortfolioService';

export default function TrainingActivatedPills() {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [ongoingTrainings, setOngoingTrainings] =
        useState<OngoingTraining[]>([]);

    const [loading, setLoading] =
        useState<boolean>(true);

    const [error, setError] =
        useState<string>('');

    useEffect(() => {
        const loadOngoingTrainings = async () => {
            setLoading(true);
            setError('');

            try {
                const data =
                    await getTrainingPortfolioOngoingTrainings();

                setOngoingTrainings(data || []);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Unable to load ongoing trainings'
                );
            } finally {
                setLoading(false);
            }
        };

        loadOngoingTrainings();
    }, []);

    const formatDate = (
        value: string | null | undefined
    ): string => {
        if (!value) {
            return '-';
        }

        return new Date(value).toLocaleDateString();
    };

    const normalizeProgress = (
        value: number | null | undefined
    ): number => {
        if (value === null || value === undefined) {
            return 0;
        }

        return Math.min(
            Math.max(value, 0),
            100
        );
    };

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
                    {error && (
                        <Alert
                            variant="destructive"
                            className="mb-4"
                        >
                            <AlertDescription>
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {loading ? (
                        <div className="bg-white rounded-lg border p-8 text-center text-muted-foreground">
                            Loading ongoing trainings...
                        </div>
                    ) : ongoingTrainings.length === 0 ? (
                        <div className="bg-white rounded-lg border p-8 text-center">
                            <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-3" />

                            <h2 className="text-lg font-semibold text-primary mb-2">
                                {t('training.activated.empty')}
                            </h2>

                            <p className="text-muted-foreground mb-4">
                                {t('training.activated.emptyMessage')}
                            </p>

                            <Button
                                onClick={() => navigate('/training/catalog')}
                            >
                                {t('training.actions.browseCatalog')}
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {ongoingTrainings.map((training) => {
                                const progress =
                                    normalizeProgress(
                                        training.progressPercent
                                    );

                                return (
                                    <div
                                        key={training.enrollmentId}
                                        className="bg-white rounded-lg border p-5"
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-primary">
                                                    {training.title}
                                                </h3>

                                                <p className="text-sm text-muted-foreground">
                                                    {t('training.activated.purchasedOn')}{' '}
                                                    {formatDate(training.enrolledAt)}
                                                </p>
                                            </div>

                                            <Badge variant="secondary">
                                                {t('training.activated.status.active')}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {t('training.myPrograms.progress')}
                        </span>

                                                <span className="font-medium text-primary">
                          {progress}%
                        </span>
                                            </div>

                                            <Progress
                                                value={progress}
                                                className="h-2"
                                            />
                                        </div>

                                        <Button
                                            className="w-full bg-[#B82547] hover:bg-[#a01f3c] text-white"
                                            onClick={() => navigate('/training')}
                                        >
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            {t('training.actions.continue')}
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