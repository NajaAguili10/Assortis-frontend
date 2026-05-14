import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useNavigate } from 'react-router';

import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TrainingSubMenu } from '@app/components/TrainingSubMenu';

import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { Alert, AlertDescription } from '@app/components/ui/alert';

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
    Search,
    TrendingUp,
    UserCheck,
    Video,
    X,
} from 'lucide-react';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@app/components/ui/popover';

type CatalogTrainingType = 'recorded';

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTypes, setSelectedTypes] = useState<CatalogTrainingType[]>([
        'recorded',
    ]);
    const [selectedLevels, setSelectedLevels] = useState<TrainingLevelEnum[]>([]);
    const [selectedFormats, setSelectedFormats] = useState<TrainingFormatEnum[]>(
        []
    );
    const [certificationAvailable, setCertificationAvailable] = useState<
        boolean | undefined
    >(undefined);

    useEffect(() => {
        const loadTrainings = async () => {
            setLoading(true);
            setError('');

            try {
                const data = await getUpcomingTrainings();
                setTrainings(data || []);
            } catch (err: any) {
                setError(err.message || 'Unable to load trainings');
            } finally {
                setLoading(false);
            }
        };

        loadTrainings();
    }, []);

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
    };

    const handleTypeFilter = (type: CatalogTrainingType) => {
        setSelectedTypes((current) =>
            current.includes(type) ? current : [...current, type]
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
        setSelectedTypes(['recorded']);
    };

    const activeFiltersCount =
        selectedLevels.length +
        selectedFormats.length +
        (certificationAvailable !== undefined ? 1 : 0) +
        (searchQuery.trim() ? 1 : 0);

    const filteredTrainings = useMemo(() => {
        return trainings
            .filter((training) => {
                const query = searchQuery.trim().toLowerCase();

                if (query) {
                    const searchableText = [
                        training.title,
                        training.description,
                        training.tags,
                        training.level,
                        training.deliveryMode,
                        training.courseLanguage,
                        training.expertName,
                        ...(training.sectors || []).map((sector) => sector.name),
                    ]
                        .filter(Boolean)
                        .join(' ')
                        .toLowerCase();

                    if (!searchableText.includes(query)) {
                        return false;
                    }
                }

                if (selectedLevels.length > 0) {
                    if (!selectedLevels.includes(mapLevel(training.level))) {
                        return false;
                    }
                }

                if (selectedFormats.length > 0) {
                    if (!selectedFormats.includes(mapFormat(training.deliveryMode))) {
                        return false;
                    }
                }

                if (certificationAvailable !== undefined) {
                    if (
                        Boolean(training.certificationAvailable) !== certificationAvailable
                    ) {
                        return false;
                    }
                }

                return true;
            })
            .sort((first, second) => {
                const firstDate = first.startDate
                    ? new Date(first.startDate).getTime()
                    : Number.MAX_SAFE_INTEGER;

                const secondDate = second.startDate
                    ? new Date(second.startDate).getTime()
                    : Number.MAX_SAFE_INTEGER;

                return firstDate - secondDate;
            });
    }, [
        trainings,
        searchQuery,
        selectedLevels,
        selectedFormats,
        certificationAvailable,
    ]);

    const showRecordedTrainings = selectedTypes.includes('recorded');

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
                                                <Badge className="ml-2" variant="secondary">
                                                    {selectedTypes.length}
                                                </Badge>
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
                                                        showRecordedTrainings ? 'default' : 'outline'
                                                    }
                                                    size="sm"
                                                    className="w-full justify-start text-xs"
                                                    onClick={() => handleTypeFilter('recorded')}
                                                >
                                                    {showRecordedTrainings && (
                                                        <CheckCircle className="w-3 h-3 mr-2" />
                                                    )}
                                                    {t('training.catalog.type.recorded')}
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
                        </div>
                    </div>

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
                </div>
            </PageContainer>
        </div>
    );
}