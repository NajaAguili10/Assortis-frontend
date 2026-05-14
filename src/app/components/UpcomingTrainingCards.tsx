import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
    Award,
    BookOpen,
    Calendar,
    Clock,
    Globe,
    UserCheck,
} from 'lucide-react';

import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Alert, AlertDescription } from '@app/components/ui/alert';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useTrainingCommerce } from '@app/contexts/TrainingCommerceContext';
import { ProjectSectorEnum } from '@app/types/project.dto';
import {
    TrainingCourseDTO,
    TrainingFormatEnum,
    TrainingLevelEnum,
} from '@app/types/training.dto';
import {
    getUpcomingTrainings,
    type UpcomingTraining,
} from '@app/services/upcomingTrainingService';

const normalizeLabel = (value: string | null | undefined): string => {
    if (!value) return '-';

    return value
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (value: string | null | undefined): string => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString();
};

const splitTags = (tags: string | null | undefined): string[] => {
    if (!tags) return [];

    return tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
};

const mapDeliveryModeToFormat = (
    deliveryMode: string | null | undefined
): TrainingFormatEnum => {
    switch ((deliveryMode || '').toUpperCase()) {
        case 'HYBRID':
            return TrainingFormatEnum.HYBRID;
        case 'IN_PERSON':
        case 'IN PERSON':
        case 'OFFLINE':
            return TrainingFormatEnum.IN_PERSON;
        case 'SELF_PACED':
        case 'SELF PACED':
            return TrainingFormatEnum.SELF_PACED;
        case 'ONLINE':
        default:
            return TrainingFormatEnum.ONLINE;
    }
};

const mapLevel = (level: string | null | undefined): TrainingLevelEnum => {
    switch ((level || '').toUpperCase()) {
        case 'BEGINNER':
            return TrainingLevelEnum.BEGINNER;
        case 'ADVANCED':
            return TrainingLevelEnum.ADVANCED;
        case 'EXPERT':
            return TrainingLevelEnum.EXPERT;
        case 'INTERMEDIATE':
        default:
            return TrainingLevelEnum.INTERMEDIATE;
    }
};

const mapUpcomingTrainingToCartCourse = (
    training: UpcomingTraining
): TrainingCourseDTO => {
    const tags = splitTags(training.tags);

    return {
        id: String(training.id),
        title: training.title,
        description: training.description || '',
        sector: ProjectSectorEnum.EDUCATION,
        subsectors: [],
        level: mapLevel(training.level),
        format: mapDeliveryModeToFormat(training.deliveryMode),
        duration: training.durationHours || 0,
        language: (training.courseLanguage || 'EN') as TrainingCourseDTO['language'],
        instructor: {
            name: training.expertName || '',
            title: '',
        },
        price: training.price || 0,
        rating: 0,
        enrolledCount: 0,
        startDate: training.startDate || undefined,
        modules: training.modulesCount || 0,
        certificate: Boolean(training.certificationAvailable),
        certificationAvailable: Boolean(training.certificationAvailable),
        certificationPrice: training.certificationPrice || undefined,
        certificationTitle: training.certificationTitle || undefined,
        certificationIssuer: training.certificationIssuer || undefined,
        certificationValidityMonths:
            training.certificationValidityMonths ?? undefined,
        tags,
        thumbnail: training.thumbnailUrl || undefined,
    };
};

export function UpcomingTrainingCards() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { addToCart } = useTrainingCommerce();

    const [trainings, setTrainings] = useState<UpcomingTraining[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadUpcomingTrainings = async () => {
            setLoading(true);
            setError('');

            try {
                const data = await getUpcomingTrainings();
                setTrainings(data || []);
            } catch (err: any) {
                setError(err.message || 'Unable to load upcoming trainings');
            } finally {
                setLoading(false);
            }
        };

        loadUpcomingTrainings();
    }, []);

    const sortedTrainings = useMemo(() => {
        return [...trainings].sort((first, second) => {
            const firstDate = first.startDate
                ? new Date(first.startDate).getTime()
                : Number.MAX_SAFE_INTEGER;

            const secondDate = second.startDate
                ? new Date(second.startDate).getTime()
                : Number.MAX_SAFE_INTEGER;

            return firstDate - secondDate;
        });
    }, [trainings]);

    if (loading) {
        return (
            <div className="bg-white rounded-lg border p-5 text-muted-foreground">
                Loading upcoming trainings...
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (sortedTrainings.length === 0) {
        return (
            <div className="bg-white rounded-lg border p-5 text-muted-foreground">
                No upcoming trainings found.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedTrainings.map((training) => {
                const tags = splitTags(training.tags);
                const cartCourse = mapUpcomingTrainingToCartCourse(training);

                return (
                    <div
                        key={`upcoming-training-${training.id}`}
                        className="bg-white rounded-lg border hover:shadow-md transition-shadow flex flex-col"
                    >
                        <div className="p-5 pb-0">
                            <div className="flex items-center gap-2 mb-3 flex-wrap min-h-[28px]">
                                <Badge variant="outline" className="text-xs">
                                    {normalizeLabel(training.level)}
                                </Badge>

                                <Badge variant="secondary" className="text-xs">
                                    {normalizeLabel(training.deliveryMode)}
                                </Badge>

                                {training.certificationAvailable && (
                                    <Badge
                                        variant="outline"
                                        className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                                    >
                                        <Award className="w-3 h-3 mr-1" />
                                        {t('training.catalog.certificate')}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="px-5 pb-3">
                            <h3 className="font-semibold text-primary mb-2 line-clamp-2 min-h-[48px]">
                                {training.title}
                            </h3>

                            <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">
                                {training.description}
                            </p>
                        </div>

                        <div className="px-5 pb-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <UserCheck className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">
                  {training.expertName || 'Assortis Academy'}
                </span>
                            </div>
                        </div>

                        <div className="px-5 pb-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4 flex-shrink-0" />
                                    <span>{training.durationHours ?? 0}h</span>
                                </div>

                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <BookOpen className="w-4 h-4 flex-shrink-0" />
                                    <span>
                    {training.modulesCount ?? 0} {t('training.catalog.modules')}
                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4 flex-shrink-0" />
                                    <span>{formatDate(training.startDate)}</span>
                                </div>

                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Globe className="w-4 h-4 flex-shrink-0" />
                                    <span>{training.courseLanguage || '-'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="px-5 pb-3">
                            <div className="flex flex-wrap gap-1 min-h-[24px]">
                                {training.sectors?.slice(0, 2).map((sector) => (
                                    <Badge
                                        key={`${training.id}-sector-${sector.id}`}
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        {sector.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1" />

                        <div className="px-5 pb-4">
                            <div className="flex items-center justify-between mb-3 pb-3 border-t pt-3">
                <span className="text-sm text-muted-foreground">
                  {t('training.catalog.price')}:
                </span>

                                <span className="text-2xl font-bold text-primary">
                  {training.isFree
                      ? 'Free'
                      : `${training.price ?? 0} ${training.currency || ''}`}
                </span>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-4 min-h-[24px]">
                                {tags.slice(0, 3).map((tag) => (
                                    <Badge
                                        key={`${training.id}-${tag}`}
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addToCart(cartCourse)}
                                >
                                    {t('training.cart.add')}
                                </Button>

                                <Button
                                    variant="default"
                                    size="sm"
                                    className="bg-[#B82547] hover:bg-[#a01f3c] text-white"
                                    onClick={() => navigate(`/training/enroll/${training.id}`)}
                                >
                                    {t('training.actions.enroll')}
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}