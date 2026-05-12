import {
    API_BASE_URL,
    getAuthHeaders,
    getAuthToken,
    resolveCurrentOrganizationId,
} from './authService';

export interface TrainingPortfolioStats {
    completedTrainings: number;
    certifications: number;
    achievements: number;
}

export interface CompletedTraining {
    enrollmentId: number;
    userId: number;
    userEmail: string;
    userFirstName: string;
    userLastName: string;
    enrolledAt: string;
    progressPercent: number;
    lastAccessedAt: string | null;
    deadline: string | null;
    enrollmentStatus: string;
    completedAt: string | null;
    courseId: number;
    title: string;
    description: string;
    expertId: number | null;
    expertFullName: string | null;
    durationHours: number | null;
    level: string | null;
    price: number | null;
    currency: string | null;
    isFree: boolean;
    courseStatus: string | null;
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

    credentialUrl?: string | null;
    downloadUrl?: string | null;
    certificateUrl?: string | null;
}

export interface PortfolioCertification {
    certificationId: number;
    courseId: number;
    courseTitle: string;
    certificationName: string;
    issuingOrganization: string;
    completedOn: string;
    expiryDate: string | null;
    credentialId: string;
    credentialUrl: string | null;
    createdAt: string;
    userId: number;
    userFirstName: string;
    userLastName: string;
    userEmail: string;
    certified: boolean;
    downloadUrl: string | null;
}

export const getTrainingPortfolioStats =
    async (): Promise<TrainingPortfolioStats> => {
        const organizationId =
            await resolveCurrentOrganizationId();

        const response = await fetch(
            `${API_BASE_URL}/training/portfolio/stats?organizationId=${organizationId}`,
            {
                method: 'GET',
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            throw new Error(
                'Unable to load training portfolio statistics'
            );
        }

        return response.json();
    };

export const getTrainingPortfolioCompletedTrainings =
    async (): Promise<CompletedTraining[]> => {
        const organizationId =
            await resolveCurrentOrganizationId();

        const response = await fetch(
            `${API_BASE_URL}/training/portfolio/completed-trainings?organizationId=${organizationId}`,
            {
                method: 'GET',
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            throw new Error(
                'Unable to load completed trainings'
            );
        }

        return response.json();
    };

export const getTrainingPortfolioCertifications =
    async (): Promise<PortfolioCertification[]> => {
        const organizationId =
            await resolveCurrentOrganizationId();

        const response = await fetch(
            `${API_BASE_URL}/training/portfolio/certifications?organizationId=${organizationId}`,
            {
                method: 'GET',
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            return [];
        }

        return response.json();
    };

const isAbsoluteUrl = (url: string): boolean =>
    url.startsWith('http://') ||
    url.startsWith('https://');

const buildApiUrl = (pathOrUrl: string): string => {
    if (isAbsoluteUrl(pathOrUrl)) {
        return pathOrUrl;
    }

    const normalizedBaseUrl =
        API_BASE_URL.replace(/\/$/, '');

    const normalizedPath =
        pathOrUrl.startsWith('/')
            ? pathOrUrl
            : `/${pathOrUrl}`;

    return `${normalizedBaseUrl}${normalizedPath}`;
};

const normalizePdfFileName = (
    fileName: string
): string => {
    return fileName.toLowerCase().endsWith('.pdf')
        ? fileName
        : `${fileName}.pdf`;
};

export const downloadCertification = async (
    certificateUrl: string | null | undefined,
    fallbackFileName: string
): Promise<void> => {
    if (!certificateUrl) {
        throw new Error(
            'No certificate file found for this certificate'
        );
    }

    if (isAbsoluteUrl(certificateUrl)) {
        window.open(
            certificateUrl,
            '_blank',
            'noopener,noreferrer'
        );
        return;
    }

    const token = getAuthToken();
    const finalUrl = buildApiUrl(certificateUrl);

    const response = await fetch(finalUrl, {
        method: 'GET',
        headers: {
            ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                }
                : {}),
        },
    });

    if (!response.ok) {
        throw new Error(
            `Unable to download certificate. Status: ${response.status}`
        );
    }

    const blob = await response.blob();
    const objectUrl =
        window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download =
        normalizePdfFileName(fallbackFileName);

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(objectUrl);
};