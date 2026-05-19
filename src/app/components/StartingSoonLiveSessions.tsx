import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
    Calendar,
    Clock,
    Globe,
    Info,
    Play,
    Users,
    Video,
} from 'lucide-react';

import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Progress } from '@app/components/ui/progress';
import { Alert, AlertDescription } from '@app/components/ui/alert';
import { useLanguage } from '@app/contexts/LanguageContext';

import {
    getLiveSessionsStartingWithinOneMonth,
    type StartingSoonLiveSession,
} from '@app/services/liveSessionService';

const normalizeStatus = (value: string | null | undefined): string => {
    if (!value) return 'Scheduled';

    return value
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (value: string | null | undefined): string => {
    if (!value) return '-';

    return new Date(value).toLocaleDateString();
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

export function StartingSoonLiveSessions() {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [sessions, setSessions] = useState<StartingSoonLiveSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadSessions = async () => {
            setLoading(true);
            setError('');

            try {
                const data = await getLiveSessionsStartingWithinOneMonth();
                setSessions(data || []);
            } catch (err: any) {
                setError(err.message || 'Unable to load upcoming live sessions');
            } finally {
                setLoading(false);
            }
        };

        loadSessions();
    }, []);

    const sortedSessions = useMemo(() => {
        return [...sessions].sort((first, second) => {
            return (
                new Date(first.startTime).getTime() -
                new Date(second.startTime).getTime()
            );
        });
    }, [sessions]);

    if (loading) {
        return (
            <div className="bg-white rounded-lg border p-5 text-muted-foreground">
                Loading live sessions...
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

    if (sortedSessions.length === 0) {
        return (
            <div className="bg-white rounded-lg border p-5 text-muted-foreground">
                No live trainings starting within one month.
            </div>
        );
    }
    return (
        <section className="mt-8">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-primary">
                    {t('training.catalog.liveTrainings') || 'Live Trainings'}
                </h2>

                <p className="text-sm text-muted-foreground">
                    Join interactive live sessions with expert instructors
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {sortedSessions.map((session) => {
                    const progress = getSessionProgress(
                        session.currentParticipants,
                        session.maxParticipants
                    );

                    const isEnded =
                        session.status?.toLowerCase() === 'ended' ||
                        Boolean(session.recordingUrl);

                    return (
                        <div
                            key={`starting-soon-live-session-${session.id}`}
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
                                            className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                                        >
                                            {normalizeStatus(session.status)}
                                        </Badge>
                                    </div>

                                    <h3 className="font-semibold text-primary mb-1 line-clamp-2">
                                        {session.title}
                                    </h3>

                                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                                        {session.course?.title || 'Assortis Academy Live Session'}
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
                                            <span>{session.durationMinutes ?? 0} minutes</span>
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
                                                {session.language ||
                                                    session.course?.courseLanguage ||
                                                    'EN'}
                                            </span>
                                        </div>
                                    </div>

                                    <Progress value={progress} className="h-1 mb-4" />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                navigate(`/training/live-session-details/${session.id}`)
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
                                                    navigate(`/training/recording/${session.id}`)
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
                                                    navigate(`/training/session-enroll/${session.id}`)
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
        </section>
    );
}