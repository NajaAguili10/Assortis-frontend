import { API_BASE_URL, getAuthHeaders, getAuthToken, resolveCurrentOrganizationId } from './authService';

export interface TrainingPortfolioStats {
    completedTrainings: number;
    certifications: number;
    achievements: number;
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
    downloadUrl: string;
}

export const getTrainingPortfolioStats = async (): Promise<TrainingPortfolioStats> => {
    const organizationId = await resolveCurrentOrganizationId();

    const response = await fetch(
        `${API_BASE_URL}/api/training/portfolio/stats?organizationId=${organizationId}`,
        {
            method: 'GET',
            headers: getAuthHeaders(),
        }
    );

    if (!response.ok) {
        throw new Error('Unable to load training portfolio statistics');
    }

    return response.json();
};

export const getTrainingPortfolioCertifications = async (): Promise<PortfolioCertification[]> => {
    const organizationId = await resolveCurrentOrganizationId();

    const response = await fetch(
        `${API_BASE_URL}/api/training/portfolio/certifications?organizationId=${organizationId}`,
        {
            method: 'GET',
            headers: getAuthHeaders(),
        }
    );

    if (!response.ok) {
        throw new Error('Unable to load training portfolio certifications');
    }

    return response.json();
};

export const downloadCertification = async (downloadUrl: string, fallbackFileName: string) => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}${downloadUrl}`, {
        method: 'GET',
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        throw new Error('Unable to download certificate');
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fallbackFileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(objectUrl);
};
