/**
 * Service de gestion du statut des utilisateurs
 * Gère les différents états d'inscription et de paiement
 */

export interface IncompleteSignupData {
  email: string;
  password: string;
  accountType: 'organization' | 'expert' | 'admin' | 'public';
  firstName?: string;
  lastName?: string;
  orgName?: string;
  planType: 'org-beginner' | 'org-professional' | 'expert-beginner' | 'expert-professional' | 'free' | null;
  currentStep: number;
  completedSteps: number[];
  isEmailVerified: boolean;
  hasCompletedPayment: boolean;
  signupDate?: string;
  lastModified?: string;
}

export interface CompleteUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  accountType: 'organization' | 'expert' | 'admin' | 'public';
  planType: string;
  hasCompletedPayment: boolean;
  registrationDate: string;
}

// Mock database - In production, this would be API calls
const INCOMPLETE_SIGNUPS_KEY = 'assortis_incomplete_signups';
const COMPLETE_USERS_KEY = 'assortis_complete_users';

/**
 * Initialise les comptes de test pour démonstration
 */
export const initializeTestAccounts = () => {
  // Comptes de test incomplets (pré-inscription sans paiement)
  const incompleteSignups: IncompleteSignupData[] = [
    {
      email: 'incomplete-expert@test.com',
      password: 'test123',
      accountType: 'expert',
      firstName: 'Jean',
      lastName: 'Dupont',
      planType: 'expert-professional',
      currentStep: 6,
      completedSteps: [1, 2, 3, 4, 5],
      isEmailVerified: true,
      hasCompletedPayment: false,
      signupDate: '2024-03-10T10:00:00Z',
      lastModified: '2024-03-10T10:30:00Z',
    },
    {
      email: 'incomplete-org@test.com',
      password: 'test123',
      accountType: 'organization',
      orgName: 'ACME Corporation',
      planType: 'org-professional',
      currentStep: 6,
      completedSteps: [1, 2, 3, 4, 5],
      isEmailVerified: true,
      hasCompletedPayment: false,
      signupDate: '2024-03-11T14:00:00Z',
      lastModified: '2024-03-11T14:15:00Z',
    },
    {
      email: 'step3-expert@test.com',
      password: 'test123',
      accountType: 'expert',
      firstName: 'Marie',
      lastName: 'Martin',
      planType: null,
      currentStep: 3,
      completedSteps: [1, 2],
      isEmailVerified: false,
      hasCompletedPayment: false,
      signupDate: '2024-03-12T09:00:00Z',
      lastModified: '2024-03-12T09:10:00Z',
    },
  ];

  // Comptes de test complets (inscription + paiement validés)
  const completeUsers: CompleteUser[] = [
    {
      id: 'user-1',
      email: 'expert@example.com',
      password: 'demo123',
      firstName: 'Pierre',
      lastName: 'Expert',
      accountType: 'expert',
      planType: 'expert-professional',
      hasCompletedPayment: true,
      registrationDate: '2024-03-01T10:00:00Z',
    },
    {
      id: 'user-2',
      email: 'organization@example.com',
      password: 'demo123',
      firstName: 'Admin',
      lastName: 'Organization',
      accountType: 'organization',
      planType: 'org-professional',
      hasCompletedPayment: true,
      registrationDate: '2024-03-02T14:00:00Z',
    },
    {
      id: 'user-3',
      email: 'organization@example.com',
      password: 'demo123',
      firstName: 'Sophie',
      lastName: 'Laurent',
      accountType: 'organization',
      planType: 'expert-professional',
      hasCompletedPayment: true,
      registrationDate: '2024-03-05T11:00:00Z',
    },
    {
      id: 'user-4',
      email: 'admin@example.com',
      password: 'demo123',
      firstName: 'Admin',
      lastName: 'System',
      accountType: 'admin',
      planType: 'admin',
      hasCompletedPayment: true,
      registrationDate: '2024-03-01T08:00:00Z',
    },
    {
      id: 'user-5',
      email: 'public@example.com',
      password: 'demo123',
      firstName: 'Public',
      lastName: 'User',
      accountType: 'public',
      planType: 'free',
      hasCompletedPayment: false,
      registrationDate: '2024-03-06T15:00:00Z',
    },
  ];

  // Sauvegarder dans localStorage si pas déjà initialisé
  if (!localStorage.getItem(INCOMPLETE_SIGNUPS_KEY)) {
    localStorage.setItem(INCOMPLETE_SIGNUPS_KEY, JSON.stringify(incompleteSignups));
  }
  if (!localStorage.getItem(COMPLETE_USERS_KEY)) {
    localStorage.setItem(COMPLETE_USERS_KEY, JSON.stringify(completeUsers));
  }
};

/**
 * Vérifie les credentials et retourne le statut de l'utilisateur
 */
export const authenticateUser = async (
  email: string,
  password: string
): Promise<{
  success: boolean;
  userType: 'complete' | 'incomplete' | null;
  userData?: CompleteUser | IncompleteSignupData;
  error?: string;
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Vérifier d'abord les utilisateurs complets
      const completeUsersJson = localStorage.getItem(COMPLETE_USERS_KEY);
      if (completeUsersJson) {
        try {
          const completeUsers: CompleteUser[] = JSON.parse(completeUsersJson);
          const completeUser = completeUsers.find(
            (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
          );
          
          if (completeUser) {
            resolve({
              success: true,
              userType: 'complete',
              userData: completeUser,
            });
            return;
          }
        } catch (error) {
          console.error('Error parsing complete users:', error);
        }
      }

      // Vérifier les inscriptions incomplètes
      const incompleteSignupsJson = localStorage.getItem(INCOMPLETE_SIGNUPS_KEY);
      if (incompleteSignupsJson) {
        try {
          const incompleteSignups: IncompleteSignupData[] = JSON.parse(incompleteSignupsJson);
          const incompleteUser = incompleteSignups.find(
            (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
          );
          
          if (incompleteUser) {
            resolve({
              success: true,
              userType: 'incomplete',
              userData: incompleteUser,
            });
            return;
          }
        } catch (error) {
          console.error('Error parsing incomplete signups:', error);
        }
      }

      // Credentials invalides
      resolve({
        success: false,
        userType: null,
        error: 'auth.login.invalidCredentials',
      });
    }, 800);
  });
};

/**
 * Récupère les données d'inscription incomplète d'un utilisateur
 */
export const getIncompleteSignupData = (email: string): IncompleteSignupData | null => {
  const incompleteSignupsJson = localStorage.getItem(INCOMPLETE_SIGNUPS_KEY);
  if (!incompleteSignupsJson) return null;

  try {
    const incompleteSignups: IncompleteSignupData[] = JSON.parse(incompleteSignupsJson);
    return incompleteSignups.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    ) || null;
  } catch (error) {
    console.error('Error parsing incomplete signups:', error);
    return null;
  }
};

/**
 * Met à jour les données d'inscription incomplète
 */
export const updateIncompleteSignup = (email: string, data: Partial<IncompleteSignupData>): boolean => {
  const incompleteSignupsJson = localStorage.getItem(INCOMPLETE_SIGNUPS_KEY);
  if (!incompleteSignupsJson) return false;

  try {
    const incompleteSignups: IncompleteSignupData[] = JSON.parse(incompleteSignupsJson);
    const index = incompleteSignups.findIndex(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (index !== -1) {
      incompleteSignups[index] = {
        ...incompleteSignups[index],
        ...data,
        lastModified: new Date().toISOString(),
      };
      localStorage.setItem(INCOMPLETE_SIGNUPS_KEY, JSON.stringify(incompleteSignups));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating incomplete signup:', error);
    return false;
  }
};

/**
 * Déplace un utilisateur de l'état incomplet à complet après paiement
 */
export const completeUserSignup = (email: string): boolean => {
  const incompleteData = getIncompleteSignupData(email);
  if (!incompleteData) return false;

  try {
    // Créer l'utilisateur complet
    const newCompleteUser: CompleteUser = {
      id: `user-${Date.now()}`,
      email: incompleteData.email,
      password: incompleteData.password,
      firstName: incompleteData.firstName || incompleteData.email.split('@')[0],
      lastName: incompleteData.lastName || 'User',
      accountType: incompleteData.accountType,
      planType: incompleteData.planType || 'expert-beginner',
      hasCompletedPayment: true,
      registrationDate: new Date().toISOString(),
    };

    // Ajouter aux utilisateurs complets
    const completeUsersJson = localStorage.getItem(COMPLETE_USERS_KEY) || '[]';
    const completeUsers: CompleteUser[] = JSON.parse(completeUsersJson);
    completeUsers.push(newCompleteUser);
    localStorage.setItem(COMPLETE_USERS_KEY, JSON.stringify(completeUsers));

    // Supprimer des inscriptions incomplètes
    const incompleteSignupsJson = localStorage.getItem(INCOMPLETE_SIGNUPS_KEY) || '[]';
    const incompleteSignups: IncompleteSignupData[] = JSON.parse(incompleteSignupsJson);
    const filtered = incompleteSignups.filter(
      (u) => u.email.toLowerCase() !== email.toLowerCase()
    );
    localStorage.setItem(INCOMPLETE_SIGNUPS_KEY, JSON.stringify(filtered));

    return true;
  } catch (error) {
    console.error('Error completing user signup:', error);
    return false;
  }
};

/**
 * Récupère tous les comptes de test pour affichage
 */
export const getTestAccounts = (): {
  complete: CompleteUser[];
  incomplete: IncompleteSignupData[];
} => {
  const completeUsersJson = localStorage.getItem(COMPLETE_USERS_KEY) || '[]';
  const incompleteSignupsJson = localStorage.getItem(INCOMPLETE_SIGNUPS_KEY) || '[]';

  return {
    complete: JSON.parse(completeUsersJson),
    incomplete: JSON.parse(incompleteSignupsJson),
  };
};