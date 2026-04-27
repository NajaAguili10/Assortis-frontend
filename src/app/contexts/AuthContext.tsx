import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  accountType?: 'expert' | 'organization' | 'admin' | 'public';
  isSubscribed?: boolean; // true when the user has an active paid subscription
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('assortis_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('assortis_user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // TODO: Replace with actual API call
    // Mock authentication for demo
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simple mock validation
        if (email && password.length >= 6) {
          const mockUser: User = {
            id: '1',
            email,
            firstName: email.split('@')[0],
            lastName: 'User',
            role: 'member',
            accountType: 'organization', // Default to organization for logged-in users
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
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('assortis_user');
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
    // TODO: Replace with actual API call
    // Mock forgot password for demo
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simple mock validation
        if (email) {
          resolve();
        } else {
          reject(new Error('Invalid email'));
        }
      }, 500);
    });
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    // TODO: Replace with actual API call
    // Mock reset password for demo
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simple mock validation
        if (token && newPassword.length >= 6) {
          resolve();
        } else {
          reject(new Error('Invalid token or password'));
        }
      }, 500);
    });
  };

  const quickLogin = async (accountType: QuickLoginAccountType): Promise<void> => {
    // TODO: Replace with actual API call
    // Mock quick login for demo
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simple mock validation
        if (accountType) {
          const isOrganizationUser = accountType === 'organization-user';
          const resolvedAccountType = isOrganizationUser ? 'organization' : accountType;
          const mockUser: User = {
            id: '2',
            email: isOrganizationUser ? 'organization-user@example.com' : `${accountType}@example.com`,
            firstName: isOrganizationUser
              ? 'Organization'
              : accountType.charAt(0).toUpperCase() + accountType.slice(1),
            lastName: 'User',
            role:
              accountType === 'admin'
                ? 'admin'
                : isOrganizationUser
                ? 'organization-user'
                : accountType === 'organization'
                ? 'organization-admin'
                : 'member',
            accountType: resolvedAccountType,
            isSubscribed: resolvedAccountType !== 'public',
          };
          setUser(mockUser);
          setIsAuthenticated(true);
          localStorage.setItem('assortis_user', JSON.stringify(mockUser));
          resolve();
        } else {
          reject(new Error('Invalid account type'));
        }
      }, 500);
    });
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
