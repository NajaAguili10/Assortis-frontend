export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://192.168.100.33:8082';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    id: number;
    email: string;
    roles: string[];
    permissions: string[];
}

export interface UserOrganization {
    id: number;
    name: string | null;
    legalName: string | null;
    membershipStatus: string | null;
    userIsAdminInOrganization: boolean | null;
}

export interface CurrentUserResponse {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    organizations: UserOrganization[];
}

export const loginApi = async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Invalid email or password');
    }

    return response.json();
};

export const saveAuthData = (authData: LoginResponse) => {
    localStorage.setItem('assortis_auth_response', JSON.stringify(authData));
    localStorage.setItem('assortis_token', authData.token);
    localStorage.setItem('assortis_user_id', String(authData.id));
    localStorage.setItem('assortis_email', authData.email);
    localStorage.setItem('assortis_roles', JSON.stringify(authData.roles || []));
    localStorage.setItem('assortis_permissions', JSON.stringify(authData.permissions || []));
};

export const clearAuthData = () => {
    localStorage.removeItem('assortis_auth_response');
    localStorage.removeItem('assortis_token');
    localStorage.removeItem('assortis_user_id');
    localStorage.removeItem('assortis_email');
    localStorage.removeItem('assortis_roles');
    localStorage.removeItem('assortis_permissions');
    localStorage.removeItem('assortis_user');
    localStorage.removeItem('assortis_current_user');
    localStorage.removeItem('assortis_current_organization_id');
};

export const getAuthToken = () => localStorage.getItem('assortis_token');

export const getAuthHeaders = () => {
    const token = getAuthToken();

    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const getCurrentUserApi = async (): Promise<CurrentUserResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Unable to load current user information');
    }

    return response.json();
};

export const resolveCurrentOrganizationId = async (): Promise<number> => {
    const storedOrganizationId = localStorage.getItem('assortis_current_organization_id');

    if (storedOrganizationId) {
        return Number(storedOrganizationId);
    }

    const currentUser = await getCurrentUserApi();
    localStorage.setItem('assortis_current_user', JSON.stringify(currentUser));

    const activeOrganization =
        currentUser.organizations?.find(
            (org) => org.membershipStatus?.toLowerCase() === 'active'
        ) || currentUser.organizations?.[0];

    if (!activeOrganization?.id) {
        throw new Error('No organization found for the connected user');
    }

    localStorage.setItem('assortis_current_organization_id', String(activeOrganization.id));
    return activeOrganization.id;
};
