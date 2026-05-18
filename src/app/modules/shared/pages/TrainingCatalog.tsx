import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TrainingSubMenu } from '@app/components/TrainingSubMenu';
import { searchCatalogCourses } from '@app/services/trainingCatalogSearchService';
import {
    getLiveSessionsStartingWithinOneMonth,
    getPastRecordedLiveSessions,
    resolveLiveSessionLanguageLabel,
    type StartingSoonLiveSession,
} from '@app/services/liveSessionService';
import { TrainingSectorSubsectorSelector } from '@app/components/TrainingSectorSubsectorSelector';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { Alert, AlertDescription } from '@app/components/ui/alert';
import { Progress } from '@app/components/ui/progress';

import { useTrainingCommerce } from '@app/contexts/TrainingCommerceContext';

import {
    TrainingCourseDTO,
    TrainingFormatEnum,
    TrainingLevelEnum,
} from '@app/types/training.dto';

import { ProjectSectorEnum } from '@app/types/project.dto';

import {
    getUpcomingTrainings,
    type UpcomingTraining,
} from '@app/services/upcomingTrainingService';


import {
    Award,
    BookOpen,
    Calendar,
    CheckCircle,
    ChevronDown,
    Clock,
    Globe,
    GraduationCap,
    Info,
    Play,
    Search,
    TrendingUp,
    UserCheck,
    Users,
    Video,
    X,
} from 'lucide-react';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@app/components/ui/popover';

type CatalogTrainingType = 'recorded' | 'live';

const normalizeText = (value: string | null | undefined) => {
    if (!value) return '-';

    return value
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const splitTags = (tags: string | null | undefined): string[] => {
    if (!tags) return [];

    return tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
};

const formatDate = (value: string | null | undefined): string => {
    if (!value) return '-';

    return new Date(value).toLocaleDateString();
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

const mapFormat = (
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

const getSessionProgress = (
    currentParticipants: number | null | undefined,
    maxParticipants: number | null | undefined
): number => {
    if (!currentParticipants || !maxParticipants || maxParticipants <= 0) {
        return 0;
    }

    return Math.min((currentParticipants / maxParticipants) * 100, 100);
};
const normalizeComparableText = (value: string | null | undefined): string =>
    (value || '').trim().toLowerCase();

const normalizeComparableEnum = (value: string | null | undefined): string =>
    normalizeComparableText(value).replace(/[\s-]+/g, '_');

const getTrainingId = (training: Pick<UpcomingTraining, 'id'>): number =>
    Number(training.id);

const buildAllowedTrainingIdSet = (
    organizationTrainings: UpcomingTraining[]
): Set<number> => {
    return new Set(
        organizationTrainings
            .map((training) => getTrainingId(training))
            .filter((id) => Number.isFinite(id))
    );
};

const keepOnlyOrganizationTrainings = (
    searchedTrainings: UpcomingTraining[],
    organizationTrainings: UpcomingTraining[]
): UpcomingTraining[] => {
    const allowedTrainingIds = buildAllowedTrainingIdSet(organizationTrainings);

    return searchedTrainings.filter((training) =>
        allowedTrainingIds.has(getTrainingId(training))
    );
};

const buildLiveSessionCourseIdSet = (
    liveSessions: StartingSoonLiveSession[]
): Set<number> => {
    return new Set(
        liveSessions
            .map((session) => Number(session.course?.id))
            .filter((id) => Number.isFinite(id))
    );
};

const containsSearchQuery = (
    values: Array<string | null | undefined>,
    rawSearchQuery: string
): boolean => {
    const searchQuery = normalizeComparableText(rawSearchQuery);

    if (!searchQuery) return true;

    return values.some((value) =>
        normalizeComparableText(value).includes(searchQuery)
    );
};

const hasAnySelectedSector = (
    items: Array<{ id: number }> | null | undefined,
    selectedIds: number[]
): boolean => {
    if (selectedIds.length === 0) return true;

    const selectedIdSet = new Set(selectedIds.map(Number));

    return items?.some((item) => selectedIdSet.has(Number(item.id))) ?? false;
};

const liveSessionMatchesActiveFilters = (
    session: StartingSoonLiveSession,
    organizationTrainings: UpcomingTraining[],
    searchQuery: string,
    selectedLevels: TrainingLevelEnum[],
    selectedFormats: TrainingFormatEnum[],
    certificationAvailable: boolean | undefined,
    selectedSectorIds: number[],
    selectedSubsectorIds: number[]
): boolean => {
    const course = session.course;

    if (!course) return false;

    const isRecordedSession = session.status?.toLowerCase() === 'recorded';

    if (!isRecordedSession) {
        const allowedTrainingIds = buildAllowedTrainingIdSet(organizationTrainings);
        const courseId = Number(course.id);

        if (!Number.isFinite(courseId) || !allowedTrainingIds.has(courseId)) {
            return false;
        }
    }

    if (
        !containsSearchQuery(
            [
                session.title,
                session.description,
                course.title,
                course.description,
                course.tags,
            ],
            searchQuery
        )
    ) {
        return false;
    }

    if (
        selectedLevels.length > 0 &&
        !selectedLevels
            .map((level) => normalizeComparableEnum(level))
            .includes(normalizeComparableEnum(course.level))
    ) {
        return false;
    }

    if (
        selectedFormats.length > 0 &&
        !selectedFormats
            .map((format) => normalizeComparableEnum(format))
            .includes(normalizeComparableEnum(course.deliveryMode))
    ) {
        return false;
    }

    if (
        certificationAvailable !== undefined &&
        Boolean(course.certificationAvailable) !== certificationAvailable
    ) {
        return false;
    }

    if (!hasAnySelectedSector(course.sectors, selectedSectorIds)) return false;

    if (!hasAnySelectedSector(course.subsectors, selectedSubsectorIds)) {
        return false;
    }

    return true;
};
const mapUpcomingToCartCourse = (
    training: UpcomingTraining
): TrainingCourseDTO => {
    return {
        id: String(training.id),
        title: training.title,
        description: training.description || '',
        sector: ProjectSectorEnum.EDUCATION,
        subsectors: [],
        level: mapLevel(training.level),
        format: mapFormat(training.deliveryMode),
        duration: training.durationHours || 0,
        language: (training.courseLanguage || 'EN') as TrainingCourseDTO['language'],
        instructor: {
            name: training.expertName || 'Assortis Academy',
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
        tags: splitTags(training.tags),
        thumbnail: training.thumbnailUrl || undefined,
    };
};

export default function TrainingCatalog() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { addToCart } = useTrainingCommerce();

    const [trainings, setTrainings] = useState<UpcomingTraining[]>([]);
    const [liveSessions, setLiveSessions] = useState<StartingSoonLiveSession[]>([]);
    const [recordedLiveSessions, setRecordedLiveSessions] = useState<
        StartingSoonLiveSession[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [liveSessionsLoading, setLiveSessionsLoading] = useState(true);
    const [recordedLiveSessionsLoading, setRecordedLiveSessionsLoading] =
        useState(true);
    const [error, setError] = useState('');
    const [liveSessionsError, setLiveSessionsError] = useState('');
    const [recordedLiveSessionsError, setRecordedLiveSessionsError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedTypes, setSelectedTypes] = useState<CatalogTrainingType[]>([]);
    const [selectedLevels, setSelectedLevels] = useState<TrainingLevelEnum[]>([]);
    const [selectedFormats, setSelectedFormats] = useState<TrainingFormatEnum[]>([]);
    const [certificationAvailable, setCertificationAvailable] = useState<
        boolean | undefined
    >(undefined);

    const [selectedSectorIds, setSelectedSectorIds] = useState<number[]>([]);

    const [selectedSubsectorIds, setSelectedSubsectorIds] = useState<number[]>([]);

    const [baseTrainings, setBaseTrainings] = useState<UpcomingTraining[]>([]);

    useEffect(() => {
        const loadTrainings = async () => {
            setLoading(true);
            setError('');

            try {
                const data = await getUpcomingTrainings();
                setBaseTrainings(data || []);
                setTrainings(data || []);         } catch (err: any) {
                setError(err.message || 'Unable to load trainings');
            } finally {
                setLoading(false);
            }
        };

        const loadLiveSessions = async () => {
            setLiveSessionsLoading(true);
            setRecordedLiveSessionsLoading(true);
            setLiveSessionsError('');
            setRecordedLiveSessionsError('');

            try {
                const upcomingData = await getLiveSessionsStartingWithinOneMonth().catch(
                    (err: any) => {
                        console.error('Unable to load upcoming live sessions:', err);
                        setLiveSessionsError(
                            err?.message || 'Unable to load upcoming live sessions'
                        );
                        return [];
                    }
                );

                const recordedData = await getPastRecordedLiveSessions().catch(
                    (err: any) => {
                        console.error('Unable to load recorded live sessions:', err);
                        setRecordedLiveSessionsError(
                            err?.message || 'Unable to load recorded live sessions'
                        );
                        return [];
                    }
                );

                setLiveSessions(upcomingData || []);
                setRecordedLiveSessions(recordedData || []);
            } finally {
                setLiveSessionsLoading(false);
                setRecordedLiveSessionsLoading(false);
            }
        };


        loadTrainings();
        loadLiveSessions();
    }, []);

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
    };

    const handleTypeFilter = (type: CatalogTrainingType) => {
        setSelectedTypes((current) =>
            current.includes(type)
                ? current.filter((item) => item !== type)
                : [...current, type]
        );
    };

    const handleLevelFilter = (level: TrainingLevelEnum) => {
        setSelectedLevels((current) =>
            current.includes(level)
                ? current.filter((item) => item !== level)
                : [...current, level]
        );
    };

    const handleFormatFilter = (format: TrainingFormatEnum) => {
        setSelectedFormats((current) =>
            current.includes(format)
                ? current.filter((item) => item !== format)
                : [...current, format]
        );
    };

    const handleCertificationFilter = (value: boolean | undefined) => {
        setCertificationAvailable(value);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedLevels([]);
        setSelectedFormats([]);
        setCertificationAvailable(undefined);
        setSelectedTypes([]);
        setSelectedSectorIds([]);
        setSelectedSubsectorIds([]);
        setTrainings(baseTrainings);
    };

    const activeFiltersCount =
        selectedTypes.length +
        selectedLevels.length +
        selectedFormats.length +
        selectedSectorIds.length +
        selectedSubsectorIds.length +
        (certificationAvailable !== undefined ? 1 : 0) +
        (searchQuery.trim() ? 1 : 0);
    useEffect(() => {
        const hasBackendFilters =
            searchQuery.trim() ||
            selectedLevels.length > 0 ||
            selectedFormats.length > 0 ||
            certificationAvailable !== undefined ||
            selectedSectorIds.length > 0 ||
            selectedSubsectorIds.length > 0;

        if (!hasBackendFilters) {
            setTrainings(baseTrainings);
            return;
        }

        const timeoutId = window.setTimeout(async () => {
            setLoading(true);
            setError('');

            try {
                const data = await searchCatalogCourses({
                    sectorIds: selectedSectorIds,
                    subsectorIds: selectedSubsectorIds,
                    body: {
                        keyWord: searchQuery.trim() || undefined,
                        level:
                            selectedLevels.length === 1
                                ? selectedLevels[0]
                                : undefined,
                        deliveryMode:
                            selectedFormats.length === 1
                                ? selectedFormats[0]
                                : undefined,
                        certificationAvailable,
                        contentType:
                            selectedTypes.length === 1
                                ? selectedTypes[0] === 'recorded'
                                    ? 'video'
                                    : undefined
                                : undefined,
                    },
                });

                setTrainings(
                    keepOnlyOrganizationTrainings(data || [], baseTrainings)
                );            } catch (err: any) {
                setError(err.message || 'Unable to search trainings');
                setTrainings([]);
            } finally {
                setLoading(false);
            }
        }, 350);

        return () => window.clearTimeout(timeoutId);
    }, [
        searchQuery,
        selectedLevels,
        selectedFormats,
        certificationAvailable,
        selectedSectorIds,
        selectedSubsectorIds,
        selectedTypes,
        baseTrainings,
    ]);
    const filteredTrainings = useMemo(() => {
        const liveSessionCourseIds = buildLiveSessionCourseIdSet([
            ...liveSessions,
            ...recordedLiveSessions,
        ]);

        return trainings
            .filter((training) => !liveSessionCourseIds.has(Number(training.id)))
            .sort((first, second) => {
                const firstDate = first.startDate
                    ? new Date(first.startDate).getTime()
                    : Number.MAX_SAFE_INTEGER;

                const secondDate = second.startDate
                    ? new Date(second.startDate).getTime()
                    : Number.MAX_SAFE_INTEGER;

                return firstDate - secondDate;
            });
    }, [trainings, liveSessions, recordedLiveSessions]);

    const sortedLiveSessions = useMemo(() => {
        return liveSessions
            .filter((session) =>
                liveSessionMatchesActiveFilters(
                    session,
                    baseTrainings,
                    searchQuery,
                    selectedLevels,
                    selectedFormats,
                    certificationAvailable,
                    selectedSectorIds,
                    selectedSubsectorIds
                )
            )
            .sort((first, second) => {
                return (
                    new Date(first.startTime).getTime() -
                    new Date(second.startTime).getTime()
                );
            });
    }, [
        liveSessions,
        baseTrainings,
        searchQuery,
        selectedLevels,
        selectedFormats,
        certificationAvailable,
        selectedSectorIds,
        selectedSubsectorIds,
    ]);
    const sortedRecordedLiveSessions = useMemo(() => {
        return recordedLiveSessions
            .filter((session) =>
                liveSessionMatchesActiveFilters(
                    session,
                    baseTrainings,
                    searchQuery,
                    selectedLevels,
                    selectedFormats,
                    certificationAvailable,
                    selectedSectorIds,
                    selectedSubsectorIds
                )
            )
            .sort((first, second) => {
                return (
                    new Date(second.startTime).getTime() -
                    new Date(first.startTime).getTime()
                );
            });
    }, [
        recordedLiveSessions,
        baseTrainings,
        searchQuery,
        selectedLevels,
        selectedFormats,
        certificationAvailable,
        selectedSectorIds,
        selectedSubsectorIds,
    ]);

    const visibleLiveSessions = [
        ...sortedLiveSessions,
        ...sortedRecordedLiveSessions,
    ];

    const allLiveSessionsLoading =
        liveSessionsLoading || recordedLiveSessionsLoading;
    const noTypeSelected = selectedTypes.length === 0;

    const showRecordedTrainings =
        noTypeSelected || selectedTypes.includes('recorded');

    const showLiveTrainings =
        noTypeSelected || selectedTypes.includes('live');

    return (
        <div className="min-h-screen">
            <PageBanner
                title={t('training.hub.title')}
                description={t('training.hub.subtitle')}
                icon={GraduationCap}
                stats={[
                    {
                        value: trainings.length.toString(),
                        label: t('training.catalog.title'),
                    },
                ]}
            />

            <TrainingSubMenu />

            <PageContainer className="my-6">
                <div className="px-4 sm:px-5 lg:px-6 py-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-primary mb-2">
                            {t('training.catalog.title')}
                        </h2>

                        <p className="text-muted-foreground">
                            {t('training.catalog.subtitle')}
                        </p>
                    </div>

                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="bg-white rounded-lg border p-4 mb-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <form
                                    onSubmit={handleSearch}
                                    className="flex gap-2 flex-1 w-full sm:max-w-md"
                                >
                                    <Input
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        placeholder={t('training.catalog.search')}
                                        className="flex-1"
                                    />

                                    <Button type="submit" size="icon">
                                        <Search className="w-4 h-4" />
                                    </Button>
                                </form>

                                <div className="flex items-center gap-2 flex-wrap">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <BookOpen className="w-4 h-4 mr-2" />
                                                {t('training.catalog.type')}
                                                {selectedTypes.length > 0 && (
                                                    <Badge className="ml-2" variant="secondary">
                                                        {selectedTypes.length}
                                                    </Badge>
                                                )}
                                                <ChevronDown className="w-4 h-4 ml-2" />
                                            </Button>
                                        </PopoverTrigger>

                                        <PopoverContent className="w-72" align="start">
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-sm mb-3">
                                                    {t('training.catalog.type')}
                                                </h4>

                                                <Button
                                                    variant={
                                                        selectedTypes.includes('recorded') ? 'default' : 'outline'
                                                    }
                                                    size="sm"
                                                    className="w-full justify-start text-xs"
                                                    onClick={() => handleTypeFilter('recorded')}
                                                >
                                                    {selectedTypes.includes('recorded') && (
                                                        <CheckCircle className="w-3 h-3 mr-2" />
                                                    )}

                                                    {t('training.catalog.type.recorded')}
                                                </Button>

                                                <Button
                                                    variant={
                                                        selectedTypes.includes('live') ? 'default' : 'outline'
                                                    }
                                                    size="sm"
                                                    className="w-full justify-start text-xs"
                                                    onClick={() => handleTypeFilter('live')}
                                                >
                                                    {selectedTypes.includes('live') && (
                                                        <CheckCircle className="w-3 h-3 mr-2" />
                                                    )}

                                                    Live Training
                                                </Button>
                                            </div>
                                        </PopoverContent>

                                    </Popover>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <TrendingUp className="w-4 h-4 mr-2" />
                                                {t('training.filters.level')}
                                                {selectedLevels.length > 0 && (
                                                    <Badge className="ml-2" variant="secondary">
                                                        {selectedLevels.length}
                                                    </Badge>
                                                )}
                                                <ChevronDown className="w-4 h-4 ml-2" />
                                            </Button>
                                        </PopoverTrigger>

                                        <PopoverContent className="w-72" align="start">
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-sm mb-3">
                                                    {t('training.filters.level')}
                                                </h4>

                                                <div className="grid grid-cols-1 gap-2">
                                                    {Object.values(TrainingLevelEnum).map((level) => (
                                                        <Button
                                                            key={level}
                                                            variant={
                                                                selectedLevels.includes(level)
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                            size="sm"
                                                            className="w-full justify-start text-xs"
                                                            onClick={() => handleLevelFilter(level)}
                                                        >
                                                            {selectedLevels.includes(level) && (
                                                                <CheckCircle className="w-3 h-3 mr-2" />
                                                            )}
                                                            {t(`training.level.${level}`)}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Video className="w-4 h-4 mr-2" />
                                                {t('training.filters.format')}
                                                {selectedFormats.length > 0 && (
                                                    <Badge className="ml-2" variant="secondary">
                                                        {selectedFormats.length}
                                                    </Badge>
                                                )}
                                                <ChevronDown className="w-4 h-4 ml-2" />
                                            </Button>
                                        </PopoverTrigger>

                                        <PopoverContent className="w-72" align="start">
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-sm mb-3">
                                                    {t('training.filters.format')}
                                                </h4>

                                                <div className="grid grid-cols-1 gap-2">
                                                    {Object.values(TrainingFormatEnum).map((format) => (
                                                        <Button
                                                            key={format}
                                                            variant={
                                                                selectedFormats.includes(format)
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                            size="sm"
                                                            className="w-full justify-start text-xs"
                                                            onClick={() => handleFormatFilter(format)}
                                                        >
                                                            {selectedFormats.includes(format) && (
                                                                <CheckCircle className="w-3 h-3 mr-2" />
                                                            )}
                                                            {t(`training.format.${format}`)}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Award className="w-4 h-4 mr-2" />
                                                {t('training.filters.certification')}
                                                {certificationAvailable !== undefined && (
                                                    <Badge className="ml-2" variant="secondary">
                                                        1
                                                    </Badge>
                                                )}
                                                <ChevronDown className="w-4 h-4 ml-2" />
                                            </Button>
                                        </PopoverTrigger>

                                        <PopoverContent className="w-72" align="start">
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-sm mb-3">
                                                    {t('training.filters.certification')}
                                                </h4>

                                                <Button
                                                    variant={
                                                        certificationAvailable === true
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                    className="w-full justify-start text-xs"
                                                    onClick={() => handleCertificationFilter(true)}
                                                >
                                                    {certificationAvailable === true && (
                                                        <CheckCircle className="w-3 h-3 mr-2" />
                                                    )}
                                                    {t(
                                                        'training.filters.certification.withCertification'
                                                    )}
                                                </Button>

                                                <Button
                                                    variant={
                                                        certificationAvailable === false
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                    className="w-full justify-start text-xs"
                                                    onClick={() => handleCertificationFilter(false)}
                                                >
                                                    {certificationAvailable === false && (
                                                        <CheckCircle className="w-3 h-3 mr-2" />
                                                    )}
                                                    {t(
                                                        'training.filters.certification.withoutCertification'
                                                    )}
                                                </Button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>

                                    {activeFiltersCount > 0 && (
                                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                                            <X className="w-4 h-4 mr-1" />
                                            {t('training.filters.clear')}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {activeFiltersCount > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {selectedTypes.map((type) => (
                                        <Badge
                                            key={`selected-type-${type}`}
                                            variant="secondary"
                                            className="flex items-center gap-1"
                                        >
                                            {type === 'recorded'
                                                ? t('training.catalog.type.recorded')
                                                : 'Live Training'}

                                            <button
                                                type="button"
                                                onClick={() => handleTypeFilter(type)}
                                                className="ml-1 rounded-full hover:bg-muted-foreground/20"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}

                                    {selectedLevels.map((level) => (
                                        <Badge
                                            key={`selected-level-${level}`}
                                            variant="secondary"
                                            className="flex items-center gap-1"
                                        >
                                            {t(`training.level.${level}`)}

                                            <button
                                                type="button"
                                                onClick={() => handleLevelFilter(level)}
                                                className="ml-1 rounded-full hover:bg-muted-foreground/20"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}

                                    {selectedFormats.map((format) => (
                                        <Badge
                                            key={`selected-format-${format}`}
                                            variant="secondary"
                                            className="flex items-center gap-1"
                                        >
                                            {t(`training.format.${format}`)}

                                            <button
                                                type="button"
                                                onClick={() => handleFormatFilter(format)}
                                                className="ml-1 rounded-full hover:bg-muted-foreground/20"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}

                                    {certificationAvailable !== undefined && (
                                        <Badge
                                            variant="secondary"
                                            className="flex items-center gap-1"
                                        >
                                            {certificationAvailable
                                                ? t('training.filters.certification.withCertification')
                                                : t('training.filters.certification.withoutCertification')}

                                            <button
                                                type="button"
                                                onClick={() => handleCertificationFilter(undefined)}
                                                className="ml-1 rounded-full hover:bg-muted-foreground/20"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    )}

                                    {searchQuery.trim() && (
                                        <Badge
                                            variant="secondary"
                                            className="flex items-center gap-1"
                                        >
                                            {searchQuery.trim()}

                                            <button
                                                type="button"
                                                onClick={() => setSearchQuery('')}
                                                className="ml-1 rounded-full hover:bg-muted-foreground/20"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <TrainingSectorSubsectorSelector
                        trainings={baseTrainings}
                        selectedSectorIds={selectedSectorIds}
                        selectedSubsectorIds={selectedSubsectorIds}
                        onSelectionChange={({ sectorIds, subsectorIds }) => {
                            setSelectedSectorIds(sectorIds);
                            setSelectedSubsectorIds(subsectorIds);
                        }}
                    />
                    {loading ? (
                        <div className="text-center py-12 bg-white rounded-lg border">
                            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-primary mb-1">
                                Loading trainings...
                            </h3>
                        </div>
                    ) : showRecordedTrainings && filteredTrainings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTrainings.map((training) => {
                                const cartCourse = mapUpcomingToCartCourse(training);
                                const tags = splitTags(training.tags);

                                return (
                                    <div
                                        key={training.id}
                                        className="bg-white rounded-lg border hover:shadow-md transition-shadow flex flex-col"
                                    >
                                        <div className="p-5 pb-0">
                                            <div className="flex items-center gap-2 mb-3 flex-wrap min-h-[28px]">
                                                <Badge variant="outline" className="text-xs">
                                                    {normalizeText(training.level)}
                                                </Badge>

                                                <Badge variant="secondary" className="text-xs">
                                                    {normalizeText(training.deliveryMode)}
                                                </Badge>

                                                <Badge
                                                    variant="outline"
                                                    className="bg-slate-50 text-slate-700 border-slate-200 text-xs"
                                                >
                                                    {t('training.catalog.type.recorded')}
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
                                                        {training.modulesCount ?? 0}{' '}
                                                        {t('training.catalog.modules')}
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
                                                        key={`${training.id}-${sector.id}`}
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {sector.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="px-5 pb-3">
                                            {training.certificationAvailable ? (
                                                <div className="bg-blue-50 rounded-md p-3 border border-blue-100">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-medium text-blue-900 flex items-center gap-1">
                                                            <Award className="w-3 h-3" />
                                                            {t('training.catalog.certificationOptional')}
                                                        </span>

                                                        <span className="text-sm font-bold text-blue-900">
                                                            +{training.certificationPrice ?? 0}{' '}
                                                            {training.currency || ''}
                                                        </span>
                                                    </div>

                                                    {training.certificationValidityMonths !== null &&
                                                        training.certificationValidityMonths !==
                                                        undefined && (
                                                            <div className="text-xs text-blue-700">
                                                                {t('training.catalog.validFor')}:{' '}
                                                                {training.certificationValidityMonths === 0
                                                                    ? t('training.catalog.lifetime')
                                                                    : `${training.certificationValidityMonths} ${t(
                                                                        'training.catalog.months'
                                                                    )}`}
                                                            </div>
                                                        )}
                                                </div>
                                            ) : (
                                                <div className="h-[72px]" />
                                            )}
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
                                                        : `${training.price ?? 0} ${
                                                            training.currency || ''
                                                        }`}
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
                                                    onClick={() =>
                                                        navigate(`/training/enroll/${training.id}`)
                                                    }
                                                >
                                                    {t('training.actions.enroll')}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg border">
                            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-primary mb-1">
                                {t('training.catalog.noResults')}
                            </h3>

                            <p className="text-sm text-muted-foreground">
                                {t('training.catalog.noResults.message')}
                            </p>
                        </div>
                    )}

                    {showLiveTrainings && (
                        <section className="mt-8">
                            <div className="mb-4">
                            <h2 className="text-lg font-semibold text-primary">
                                Live Trainings
                            </h2>

                            <p className="text-sm text-muted-foreground">
                                Join interactive live sessions with expert instructors
                            </p>
                        </div>

                            {(liveSessionsError || recordedLiveSessionsError) && (
                                <Alert variant="destructive" className="mb-6">
                                    <AlertDescription>
                                        {liveSessionsError || recordedLiveSessionsError}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {allLiveSessionsLoading ? (                            <div className="text-center py-10 bg-white rounded-lg border">
                                <Video className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-primary mb-1">
                                    Loading live sessions...
                                </h3>
                            </div>
                            ) : visibleLiveSessions.length > 0 ? (                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                    {visibleLiveSessions.map((session) => {                                    const progress = getSessionProgress(
                                        session.currentParticipants,
                                        session.maxParticipants
                                    );

                                        const isRecorded =
                                            session.status?.toLowerCase() === 'recorded';

                                        const isEnded =
                                            isRecorded ||
                                            session.status?.toLowerCase() === 'ended' ||
                                            Boolean(session.recordingUrl);

                                    return (
                                        <div
                                            key={session.id}
                                            className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">
                                                    <Video className="w-6 h-6 text-pink-500" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-pink-50 text-pink-700 border-pink-200 text-xs"
                                                        >
                                                            Live Training
                                                        </Badge>

                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                session.status?.toLowerCase() === 'recorded'
                                                                    ? 'bg-green-50 text-green-700 border-green-200 text-xs'
                                                                    : 'bg-blue-50 text-blue-700 border-blue-200 text-xs'
                                                            }
                                                        >
                                                            {session.status?.toLowerCase() === 'recorded'
                                                                ? 'Ended'
                                                                : normalizeText(session.status)}
                                                        </Badge>

                                                        {session.status?.toLowerCase() === 'recorded' && (
                                                            <Badge
                                                                variant="outline"
                                                                className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                                                            >
                                                                Recording available
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <h3 className="font-semibold text-primary mb-1 line-clamp-2">
                                                        {session.title}
                                                    </h3>

                                                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                                                        {session.course?.title ||
                                                            'Assortis Academy Live Session'}
                                                    </p>

                                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                        {session.description}
                                                    </p>

                                                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>{formatDate(session.startTime)}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4" />
                                                            <span>
                                                                {session.durationMinutes ?? 0} minutes
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Users className="w-4 h-4" />
                                                            <span>
                                                                {session.currentParticipants ?? 0} /{' '}
                                                                {session.maxParticipants ?? 0}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Globe className="w-4 h-4" />
                                                            <span>
                                                                {resolveLiveSessionLanguageLabel(
                                                                    session.language,
                                                                    session.course?.courseLanguage
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <Progress value={progress} className="h-1 mb-4" />

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/training/live-session-details/${session.id}`
                                                                )
                                                            }
                                                        >
                                                            <Info className="w-4 h-4 mr-2" />
                                                            {t('training.actions.viewDetails')}
                                                        </Button>

                                                        {isEnded ? (
                                                            <Button
                                                                size="sm"
                                                                className="bg-[#B82547] hover:bg-[#a01f3c] text-white"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/training/recording/${session.id}`
                                                                    )
                                                                }
                                                            >
                                                                <Play className="w-4 h-4 mr-2" />
                                                                Watch Recording
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                className="bg-[#B82547] hover:bg-[#a01f3c] text-white"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/training/session-enroll/${session.id}`
                                                                    )
                                                                }
                                                            >
                                                                {t('training.actions.register')}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-white rounded-lg border">
                                <Video className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-primary mb-1">
                                    No live trainings or recorded sessions found                                </h3>
                            </div>
                        )}
                        </section>
                    )}
                </div>
            </PageContainer>
        </div>
    );
}