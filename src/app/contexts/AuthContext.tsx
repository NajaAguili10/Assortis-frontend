import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { clearAuthData, loginApi, saveAuthData, type LoginResponse } from '@app/services/authService';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  accountType?: 'expert' | 'organization' | 'admin' | 'public';
  token?: string;
  roles?: string[];
  permissions?: string[];
  isSubscribed?: boolean;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapLoginResponseToUser = (authData: LoginResponse): User => {
  const primaryRole = authData.roles?.[0]?.toLowerCase();

  return {
    id: String(authData.id),
    email: authData.email,
    firstName: authData.email.split('@')[0],
    lastName: '',
    role: primaryRole || 'member',
    accountType:
        primaryRole === 'admin'
            ? 'admin'
            : primaryRole === 'expert'
                ? 'expert'
                : primaryRole?.includes('organization')
                    ? 'organization'
                    : 'public',
    token: authData.token,
    roles: authData.roles || [],
    permissions: authData.permissions || [],
    isSubscribed: primaryRole !== 'public',
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('assortis_user');

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(Boolean(parsedUser?.token || localStorage.getItem('assortis_token')));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        clearAuthData();
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const authData = await loginApi({ email, password });
    const authenticatedUser = mapLoginResponseToUser(authData);

    saveAuthData(authData);
    localStorage.setItem('assortis_user', JSON.stringify(authenticatedUser));

    setUser(authenticatedUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    clearAuthData();
  };

  const signup = async (userData: Partial<User> & { email: string; password: string }): Promise<void> => {
    await login(userData.email, userData.password);
  };

  const forgotPassword = async (email: string): Promise<void> => {
    if (!email) {
      throw new Error('Invalid email');
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    if (!token || newPassword.length < 6) {
      throw new Error('Invalid token or password');
    }
  };

  const quickLogin = async (accountType: QuickLoginAccountType): Promise<void> => {
    const accounts: Record<QuickLoginAccountType, { email: string; password: string }> = {
      expert: { email: 'expert@example.com', password: 'expert123' },
      organization: { email: 'organization@example.com', password: 'organization123' },
      'organization-user': { email: 'organization-user@example.com', password: 'organization123' },
      admin: { email: 'admin@example.com', password: 'admin123' },
      public: { email: 'public@example.com', password: 'public123' },
    };

    const selectedAccount = accounts[accountType];
    await login(selectedAccount.email, selectedAccount.password);
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
