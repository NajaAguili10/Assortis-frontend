import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

import {
  loginApi,
  saveAuthData,
  clearAuthData,
  getConnectedOrganizationApi,
  saveConnectedOrganization,
  type LoginResponse,
  type ConnectedOrganizationResponse,
} from '@app/services/authService';

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
  connectedOrganization?: ConnectedOrganizationResponse | null;
}

type QuickLoginAccountType =
    | 'expert'
    | 'organization'
    | 'organization-user'
    | 'admin'
    | 'public';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  quickLogin: (accountType: QuickLoginAccountType) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const resolveAccountType = (
    roles: string[] = []
): 'expert' | 'organization' | 'admin' | 'public' => {
  const normalizedRoles = roles.map((role) => role.toLowerCase());

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

const mapLoginResponseToUser = (authData: LoginResponse): User => {
  const primaryRole = authData.roles?.[0] || 'USER';

  return {
    id: String(authData.id),
    email: authData.email,
    firstName: authData.email.split('@')[0],
    lastName: '',
    role: primaryRole,
    accountType: resolveAccountType(authData.roles),
    token: authData.token,
    roles: authData.roles || [],
    permissions: authData.permissions || [],
    connectedOrganization: null,
  };
};

export const AuthProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('assortis_user');

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        setUser(parsedUser);

        setIsAuthenticated(
            Boolean(
                parsedUser?.token ||
                localStorage.getItem('assortis_token')
            )
        );
      } catch (error) {
        console.error(error);
        clearAuthData();
      }
    }
  }, []);

  const login = async (
      email: string,
      password: string
  ): Promise<void> => {
    const authData = await loginApi({
      email,
      password,
    });

    saveAuthData(authData);

    let connectedOrganization: ConnectedOrganizationResponse | null =
        null;

    try {
      connectedOrganization = await getConnectedOrganizationApi();

      saveConnectedOrganization(connectedOrganization);

      console.log(
          'CONNECTED ORGANIZATION:',
          connectedOrganization
      );
    } catch (organizationError) {
      console.warn(
          'NO ORGANIZATION FOUND:',
          organizationError
      );
    }

    const authenticatedUser: User = {
      ...mapLoginResponseToUser(authData),
      connectedOrganization,
    };

    localStorage.setItem(
        'assortis_user',
        JSON.stringify(authenticatedUser)
    );

    setUser(authenticatedUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
  };

  const quickLogin = async (
      accountType: QuickLoginAccountType
  ): Promise<void> => {
    const accounts: Record<
        QuickLoginAccountType,
        { email: string; password: string }
    > = {
      expert: {
        email: 'expert@example.com',
        password: 'expert123',
      },
      organization: {
        email: 'organization@example.com',
        password: 'organization123',
      },
      'organization-user': {
        email: 'org.user03@assortis.test',
        password: 'password123',
      },
      admin: {
        email: 'admin@example.com',
        password: 'admin123',
      },
      public: {
        email: 'public@example.com',
        password: 'public123',
      },
    };

    const selectedAccount = accounts[accountType];

    await login(
        selectedAccount.email,
        selectedAccount.password
    );
  };

  return (
      <AuthContext.Provider
          value={{
            user,
            isAuthenticated,
            login,
            logout,
            quickLogin,
          }}
      >
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
        'useAuth must be used inside AuthProvider'
    );
  }

  return context;
};