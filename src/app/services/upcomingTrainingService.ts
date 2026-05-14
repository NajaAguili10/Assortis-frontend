import { API_BASE_URL } from './authService';

export interface UpcomingTrainingSector {
    id: number;
    code: string;
    name: string;
}

export interface UpcomingTraining {
    id: number;
    title: string;
    description: string | null;
    level: string | null;
    deliveryMode: string | null;
    durationHours: number | null;
    courseLanguage: string | null;
    price: number | null;
    currency: string | null;
    isFree: boolean;
    modulesCount: number | null;
    startDate: string | null;
    status: string | null;
    thumbnailUrl: string | null;
    createdAt: string | null;
    tags: string | null;
    expertId: number | null;
    expertName: string | null;
    certificationAvailable: boolean;
    certificationPrice: number | null;
    certificationTitle: string | null;
    certificationIssuer: string | null;
    certificationValidityMonths: number | null;
    sectors: UpcomingTrainingSector[];
}

export const getUpcomingTrainings = async (): Promise<UpcomingTraining[]> => {
    const response = await fetch(`${API_BASE_URL}/training/upcoming`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Unable to load upcoming trainings');
    }

    return response.json();
};