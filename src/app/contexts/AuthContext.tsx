import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authService, LoginResponse } from '@app/services/authService';
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
}

type QuickLoginAccountType = 'expert' | 'organization' | 'organization-user' | 'admin' | 'public';

const QUICK_LOGIN_CREDENTIALS: Record<QuickLoginAccountType, { email: string; password: string }> = {
  expert: { email: 'expert@example.com', password: 'password123' },
  organization: { email: 'organization@example.com', password: 'password12345' },
  'organization-user': { email: 'organization-user@example.com', password: 'password1234' },
  admin: { email: 'admin@example.com', password: 'password1234' },
  public: { email: 'public@example.com', password: 'password123' },
};

const buildUserFromLoginResponse = (response: LoginResponse): User => {
  const { id, email: userEmail, roles } = response;
  const primaryRole = roles && roles.length > 0 ? roles[0] : 'public';
  const normalizedRole = primaryRole.toLowerCase().replace(/_/g, '-');
  const accountType = normalizedRole === 'organization-user'
    ? 'organization'
    : normalizedRole as User['accountType'];

  return {
    id: String(id),
    email: userEmail,
    firstName: userEmail.split('@')[0],
    lastName: 'User',
    role: normalizedRole,
    accountType,
    organizationId: response.organizationId,
  };
};

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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeOrganizationProfileState, setActiveOrganizationProfileState] = useState<OrganizationProfile | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('assortis_user');
    const storedToken = localStorage.getItem('assortis_token');
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        const storedProfile = localStorage.getItem('assortis_active_organization_profile');
        if (storedProfile) {
          setActiveOrganizationProfileState(JSON.parse(storedProfile));
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('assortis_user');
        localStorage.removeItem('assortis_token');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    /* OLD STATIC AUTH (disabled for dynamic backend auth)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password.length >= 6) {
          const mockUser: User = {
            id: '1',
            email,
            firstName: email.split('@')[0],
            lastName: 'User',
            role: 'member',
            accountType: 'organization',
          };
          setUser(mockUser);
          setIsAuthenticated(true);
          localStorage.setItem('assortis_user', JSON.stringify(mockUser));
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
    */

    try {
      const response: LoginResponse = await authService.login(email, password);
      const { token } = response;
      const loggedInUser = buildUserFromLoginResponse(response);

      setUser(loggedInUser);
      setIsAuthenticated(true);
      localStorage.setItem('assortis_token', token);
      localStorage.setItem('assortis_user', JSON.stringify(loggedInUser));
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const setActiveOrganizationProfile = (profile: OrganizationProfile | null) => {
    setActiveOrganizationProfileState(profile);
    if (profile) {
      localStorage.setItem('assortis_active_organization_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('assortis_active_organization_profile');
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setActiveOrganizationProfile(null);
    authService.logout();
  };

  const signup = async (userData: Partial<User> & { email: string; password: string }): Promise<void> => {
    // TODO: Replace with actual API call
    // Mock signup for demo
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userData.email && userData.password.length >= 6) {
          const mockUser: User = {
            id: Date.now().toString(),
            email: userData.email,
            firstName: userData.firstName || userData.email.split('@')[0],
            lastName: userData.lastName || 'User',
            role: 'member',
            accountType: 'organization', // Default to organization for new signups
          };
          setUser(mockUser);
          setIsAuthenticated(true);
          localStorage.setItem('assortis_user', JSON.stringify(mockUser));
          resolve();
        } else {
          reject(new Error('Invalid signup data'));
        }
      }, 500);
    });
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
    const credentials = QUICK_LOGIN_CREDENTIALS[accountType];
    if (!credentials) {
      throw new Error('Quick login account is not available');
    }

    await login(credentials.email, credentials.password);
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
