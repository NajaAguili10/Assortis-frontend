import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  authService,
  clearAuthData,
  getConnectedOrganizationApi,
  saveAuthData,
  saveConnectedOrganization,
  type ConnectedOrganizationResponse,
  type LoginResponse,
} from '@app/services/authService';
import type { OrganizationProfile } from '@app/services/organizationProfileService';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  accountType?: 'expert' | 'organization' | 'admin' | 'public';
  isSubscribed?: boolean;
  organizationId?: number;
  token?: string;
  roles?: string[];
  permissions?: string[];
  connectedOrganization?: ConnectedOrganizationResponse | null;
}

type QuickLoginAccountType = 'expert' | 'organization' | 'organization-user' | 'admin' | 'public';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (userData: Partial<User> & { email: string; password: string }) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  quickLogin: (accountType: QuickLoginAccountType) => Promise<void>;
  activeOrganizationProfile: OrganizationProfile | null;
  setActiveOrganizationProfile: (profile: OrganizationProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const resolveAccountType = (roles: string[] = []): User['accountType'] => {
  const normalizedRoles = roles.map((role) => role.toLowerCase().replace(/_/g, '-'));

  if (normalizedRoles.some((role) => role.includes('admin'))) {
    return 'admin';
  }

  if (normalizedRoles.some((role) => role.includes('expert'))) {
    return 'expert';
  }

  if (normalizedRoles.some((role) => role.includes('organization'))) {
    return 'organization';
  }

  return 'public';
};

const buildUserFromLoginResponse = (
  response: LoginResponse,
  connectedOrganization: ConnectedOrganizationResponse | null = null,
): User => {
  const roles = response.roles || [];
  const primaryRole = roles[0] || 'public';
  const normalizedRole = primaryRole.toLowerCase().replace(/_/g, '-');

  return {
    id: String(response.id),
    email: response.email,
    firstName: response.email.split('@')[0],
    lastName: 'User',
    role: normalizedRole,
    accountType: resolveAccountType(roles),
    isSubscribed: resolveAccountType(roles) !== 'public',
    organizationId: response.organizationId ?? connectedOrganization?.organizationId,
    token: response.token,
    roles,
    permissions: response.permissions || [],
    connectedOrganization,
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeOrganizationProfileState, setActiveOrganizationProfileState] =
    useState<OrganizationProfile | null>(null);

  const setActiveOrganizationProfile = (profile: OrganizationProfile | null) => {
    setActiveOrganizationProfileState(profile);

    if (profile) {
      localStorage.setItem('assortis_active_organization_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('assortis_active_organization_profile');
    }
  };

  const persistLoginResponse = async (response: LoginResponse, loadOrganization = true) => {
    saveAuthData(response);

    let connectedOrganization: ConnectedOrganizationResponse | null = null;

    if (loadOrganization) {
      try {
        connectedOrganization = await getConnectedOrganizationApi();
        saveConnectedOrganization(connectedOrganization);
      } catch (organizationError) {
        console.warn('NO ORGANIZATION FOUND:', organizationError);
      }
    }

    const authenticatedUser = buildUserFromLoginResponse(response, connectedOrganization);
    localStorage.setItem('assortis_user', JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
    setIsAuthenticated(true);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('assortis_user');
    const storedToken = localStorage.getItem('assortis_token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);

        const storedProfile = localStorage.getItem('assortis_active_organization_profile');
        if (storedProfile) {
          setActiveOrganizationProfileState(JSON.parse(storedProfile));
        }
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        clearAuthData();
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await authService.login({ email, password });
      await persistLoginResponse(response);
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = () => {
    clearAuthData();
    setActiveOrganizationProfile(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const signup = async (userData: Partial<User> & { email: string; password: string }): Promise<void> => {
    await authService.register(userData);
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await authService.forgotPassword(email);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send reset email');
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      await authService.resetPassword(token, newPassword);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to reset password');
    }
  };

  const quickLogin = async (accountType: QuickLoginAccountType): Promise<void> => {
    const response = await authService.demoLogin(accountType);
    await persistLoginResponse(response);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        signup,
        forgotPassword,
        resetPassword,
        quickLogin,
        activeOrganizationProfile: activeOrganizationProfileState,
        setActiveOrganizationProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
