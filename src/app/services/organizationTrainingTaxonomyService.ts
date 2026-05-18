import {
    API_BASE_URL,
    getAuthHeaders,
    resolveCurrentOrganizationId,
} from './authService';

export interface OrganizationSector {
    id: number;
    code: string;
    name: string;
    description?: string | null;
}

export interface OrganizationSubsector {
    id: number;
    sectorId: number;
    code: string;
    name: string;
    description?: string | null;
}

const assertValidId = (value: number | string | null | undefined, label: string) => {
    if (value === null || value === undefined || value === '') {
        throw new Error(`${label} is missing`);
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue) || numericValue <= 0) {
        throw new Error(`${label} is invalid`);
    }

    return numericValue;
};

const buildHeaders = (): HeadersInit => {
    return {
        ...getAuthHeaders(),
        Accept: 'application/json',
    };
};

export const getOrganizationSectors =
    async (): Promise<OrganizationSector[]> => {
        const organizationId = assertValidId(
            await resolveCurrentOrganizationId(),
            'Organization ID'
        );

        const response = await fetch(
            `${API_BASE_URL}/organizations/${organizationId}/sectors`,
            {
                method: 'GET',
                headers: buildHeaders(),
            }
        );

        if (!response.ok) {
            throw new Error(
                `Unable to load organization sectors. Status: ${response.status}`
            );
        }

        return response.json();
    };

export const getOrganizationSubsectorsBySector =
    async (sectorId: number): Promise<OrganizationSubsector[]> => {
        const organizationId = assertValidId(
            await resolveCurrentOrganizationId(),
            'Organization ID'
        );

        const validSectorId = assertValidId(sectorId, 'Sector ID');

        const response = await fetch(
            `${API_BASE_URL}/organizations/${organizationId}/sectors/${validSectorId}/subsectors`,
            {
                method: 'GET',
                headers: buildHeaders(),
            }
        );

        if (!response.ok) {
            throw new Error(
                `Unable to load organization subsectors. Status: ${response.status}`
            );
        }

        return response.json();
    };