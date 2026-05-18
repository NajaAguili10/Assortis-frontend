import {
    API_BASE_URL,
    getAuthHeaders,
    resolveCurrentOrganizationId,
} from './authService';

export interface LiveSessionLanguage {
    code: string;
    name: string;
    nativeName: string | null;
    isActive: boolean | null;
}

export interface LiveSessionSector {
    id: number;
    code: string;
    name: string;
}

export interface LiveSessionSubsector {
    id: number;
    sectorId: number;
    code: string;
    name: string;
}

export interface LiveSessionModule {
    id: number;
    title: string;
    description: string | null;
    durationMinutes: number | null;
    orderIndex: number | null;
    contentType: string | null;
    contentUrl: string | null;
    createdAt: string | null;
}

export interface LiveSessionCourse {
    id: number;
    title: string;
    description: string | null;
    durationHours: number | null;
    level: string | null;
    price: number | null;
    currency: string | null;
    isFree: boolean;
    status: string | null;
    thumbnailUrl: string | null;
    createdAt: string | null;
    certificationAvailable: boolean;
    certificationPrice: number | null;
    certificationTitle: string | null;
    certificationIssuer: string | null;
    certificationValidityMonths: number | null;
    deliveryMode: string | null;
    modulesCount: number | null;
    startDate: string | null;
    courseLanguage: string | null;
    tags: string | null;
    expert: unknown | null;
    sectors: LiveSessionSector[];
    subsectors: LiveSessionSubsector[];
    modules: LiveSessionModule[];
}

export interface StartingSoonLiveSession {
    id: number;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string | null;
    durationMinutes: number | null;
    maxParticipants: number | null;
    currentParticipants: number | null;
    status: string | null;
    recordingUrl: string | null;
    createdAt: string | null;
    language: LiveSessionLanguage | string | null;
    course: LiveSessionCourse | null;
}

const LIVE_SESSIONS_STARTING_WITHIN_ONE_MONTH_PATH =
    '/training/live-sessions/starting-within-one-month';

const PAST_RECORDED_LIVE_SESSIONS_PATH =
    '/training/live-sessions/recorded/past';

const normalizeBaseUrl = (baseUrl: string): string => {
    return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

const buildApiUrl = (
    baseUrl: string,
    path: string,
    organizationId: number
): string => {
    return `${normalizeBaseUrl(baseUrl)}${path}?organizationId=${encodeURIComponent(
        String(organizationId)
    )}`;
};

const getReadableErrorMessage = async (
    response: Response,
    fallback: string
): Promise<string> => {
    const responseText = await response.text().catch(() => '');

    return responseText || `${fallback}. HTTP status: ${response.status}`;
};

const fetchLiveSessionsFromUrl = async (
    url: string,
    fallbackErrorMessage: string
): Promise<StartingSoonLiveSession[]> => {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            ...getAuthHeaders(),
            Accept: 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(await getReadableErrorMessage(response, fallbackErrorMessage));
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error('Invalid live sessions response: expected an array');
    }

    return data;
};

const fetchOrganizationLiveSessions = async (
    path: string,
    fallbackErrorMessage: string
): Promise<StartingSoonLiveSession[]> => {
    const organizationId = await resolveCurrentOrganizationId();

    const primaryUrl = buildApiUrl(API_BASE_URL, path, organizationId);

    try {
        return await fetchLiveSessionsFromUrl(primaryUrl, fallbackErrorMessage);
    } catch (primaryError: any) {
        const isAlreadyUsingLocalBackend =
            primaryUrl.startsWith('http://localhost:8082/api') ||
            primaryUrl.startsWith('http://127.0.0.1:8082/api');

        if (isAlreadyUsingLocalBackend) {
            throw primaryError;
        }

        const fallbackUrl = buildApiUrl(
            'http://localhost:8082/api',
            path,
            organizationId
        );

        try {
            return await fetchLiveSessionsFromUrl(
                fallbackUrl,
                fallbackErrorMessage
            );
        } catch (fallbackError: any) {
            throw new Error(
                fallbackError?.message ||
                primaryError?.message ||
                fallbackErrorMessage
            );
        }
    }
};

export const getLiveSessionsStartingWithinOneMonth =
    async (): Promise<StartingSoonLiveSession[]> => {
        return fetchOrganizationLiveSessions(
            LIVE_SESSIONS_STARTING_WITHIN_ONE_MONTH_PATH,
            'Unable to load upcoming live sessions'
        );
    };

export const getPastRecordedLiveSessions =
    async (): Promise<StartingSoonLiveSession[]> => {
        return fetchOrganizationLiveSessions(
            PAST_RECORDED_LIVE_SESSIONS_PATH,
            'Unable to load recorded live sessions'
        );
    };

export const resolveLiveSessionLanguageLabel = (
    language: StartingSoonLiveSession['language'],
    fallback?: string | null
): string => {
    if (!language) {
        return fallback || 'EN';
    }

    if (typeof language === 'string') {
        return language;
    }

    return language.name || language.nativeName || language.code || fallback || 'EN';
};