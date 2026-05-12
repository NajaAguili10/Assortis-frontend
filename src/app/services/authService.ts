export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:8082/api';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    id: number;
    email: string;
    roles: string[];
    permissions?: string[];
}

export interface ConnectedOrganizationResponse {
    userId: number;
    userEmail: string;

    organizationId: number;
    organizationName: string;
    organizationLegalName: string;
    organizationType: string;

    logoUrl: string;
    website: string;

    contactEmail: string;
    contactPhone: string;

    address: string;

    organizationActive: boolean;
    organizationValidated: boolean;

    membershipRole: string;
    isAdmin: boolean;

    department: string;
    membershipStatus: string;

    joinedAt: string;
}

/*
========================================
LOGIN API
========================================
*/

export const loginApi = async (
    data: LoginRequest
): Promise<LoginResponse> => {
    const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
            method: 'POST',

            headers: {
                'Content-Type':
                    'application/json',
            },

            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        const errorText =
            await response.text().catch(() => '');

        throw new Error(
            errorText ||
            'Invalid email or password'
        );
    }

    return response.json();
};

/*
========================================
SAVE AUTH DATA
========================================
*/

export const saveAuthData = (
    authData: LoginResponse
) => {
    localStorage.setItem(
        'assortis_auth_response',
        JSON.stringify(authData)
    );

    localStorage.setItem(
        'assortis_token',
        authData.token
    );

    localStorage.setItem(
        'assortis_user_id',
        String(authData.id)
    );

    localStorage.setItem(
        'assortis_email',
        authData.email
    );

    localStorage.setItem(
        'assortis_roles',
        JSON.stringify(
            authData.roles || []
        )
    );

    localStorage.setItem(
        'assortis_permissions',
        JSON.stringify(
            authData.permissions || []
        )
    );
};

/*
========================================
CLEAR AUTH DATA
========================================
*/

export const clearAuthData = () => {
    localStorage.removeItem(
        'assortis_auth_response'
    );

    localStorage.removeItem(
        'assortis_token'
    );

    localStorage.removeItem(
        'assortis_user_id'
    );

    localStorage.removeItem(
        'assortis_email'
    );

    localStorage.removeItem(
        'assortis_roles'
    );

    localStorage.removeItem(
        'assortis_permissions'
    );

    localStorage.removeItem(
        'assortis_user'
    );

    localStorage.removeItem(
        'assortis_current_user'
    );

    localStorage.removeItem(
        'assortis_connected_organization'
    );

    localStorage.removeItem(
        'assortis_current_organization_id'
    );
};

/*
========================================
TOKEN
========================================
*/

export const getAuthToken = () => {
    return localStorage.getItem(
        'assortis_token'
    );
};

/*
========================================
AUTH HEADERS
========================================
*/

export const getAuthHeaders = (): HeadersInit => {
    const token = getAuthToken();

    return {
        'Content-Type':
            'application/json',

        ...(token
            ? {
                Authorization: `Bearer ${token}`,
            }
            : {}),
    };
};

/*
========================================
CONNECTED ORGANIZATION ENDPOINT
========================================
*/

export const getConnectedOrganizationApi =
    async (): Promise<ConnectedOrganizationResponse> => {
        const response = await fetch(
            `${API_BASE_URL}/profile/organization`,
            {
                method: 'GET',

                headers:
                    getAuthHeaders(),
            }
        );

        if (!response.ok) {
            const errorText =
                await response.text().catch(() => '');

            throw new Error(
                errorText ||
                'Unable to load connected organization'
            );
        }

        return response.json();
    };

/*
========================================
SAVE CONNECTED ORGANIZATION
========================================
*/

export const saveConnectedOrganization =
    (
        organization: ConnectedOrganizationResponse
    ) => {
        localStorage.setItem(
            'assortis_connected_organization',
            JSON.stringify(
                organization
            )
        );

        localStorage.setItem(
            'assortis_current_organization_id',
            String(
                organization.organizationId
            )
        );
    };

/*
========================================
GET STORED ORGANIZATION
========================================
*/

export const getStoredConnectedOrganization =
    (): ConnectedOrganizationResponse | null => {
        const raw =
            localStorage.getItem(
                'assortis_connected_organization'
            );

        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    };

/*
========================================
RESOLVE CURRENT ORGANIZATION ID
========================================
*/

export const resolveCurrentOrganizationId =
    async (): Promise<number> => {
        const storedOrganizationId =
            localStorage.getItem(
                'assortis_current_organization_id'
            );

        if (storedOrganizationId) {
            return Number(
                storedOrganizationId
            );
        }

        const storedOrganization =
            getStoredConnectedOrganization();

        if (
            storedOrganization?.organizationId
        ) {
            saveConnectedOrganization(
                storedOrganization
            );

            return storedOrganization.organizationId;
        }

        const connectedOrganization =
            await getConnectedOrganizationApi();

        saveConnectedOrganization(
            connectedOrganization
        );

        return connectedOrganization.organizationId;
    };