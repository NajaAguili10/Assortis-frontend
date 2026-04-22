import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { SectorEnum, SubSectorEnum } from '../types/tender.dto';

export type OrganizationProfileSectionId =
  | 'information'
  | 'contact'
  | 'operations'
  | 'resources'
  | 'projects'
  | 'subscription';

export type OrganizationVerificationStatus = 'verified' | 'selfDeclared';

export interface OrganizationValidationState {
  pendingValidation: boolean;
  pendingValidationMessage: string | null;
  lastSubmittedAt: string | null;
  sectionStatuses: Record<OrganizationProfileSectionId, OrganizationVerificationStatus>;
}

const defaultSectionStatuses: Record<OrganizationProfileSectionId, OrganizationVerificationStatus> = {
  information: 'verified',
  contact: 'selfDeclared',
  operations: 'verified',
  resources: 'selfDeclared',
  projects: 'verified',
  subscription: 'selfDeclared',
};

const defaultValidationState: OrganizationValidationState = {
  pendingValidation: false,
  pendingValidationMessage: null,
  lastSubmittedAt: null,
  sectionStatuses: defaultSectionStatuses,
};

export interface OrganizationProfile {
  id: string;
  name: string;
  description: string;
  sectors: SectorEnum[];
  subsectors: SubSectorEnum[];
  countries: string[];
  languages: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  teamSize: number;
  yearsOfExperience: number;
  completionRate: number;
  exists: boolean;
  validationState: OrganizationValidationState;
}

interface OrganizationProfileContextType {
  profile: OrganizationProfile;
  updateProfile: (updates: Partial<OrganizationProfile>) => void;
  markSectionsForValidation: (sections: OrganizationProfileSectionId[], message: string) => void;
  calculateCompletionRate: (profile: OrganizationProfile) => number;
}

const OrganizationProfileContext = createContext<OrganizationProfileContextType | undefined>(
  undefined
);

export const useOrganizationProfile = () => {
  const context = useContext(OrganizationProfileContext);
  if (!context) {
    throw new Error('useOrganizationProfile must be used within OrganizationProfileProvider');
  }
  return context;
};

// Default profile with 75% completion
const defaultProfile: OrganizationProfile = {
  id: 'org-001',
  name: 'Global Aid Development',
  description: 'International development organization focused on sustainable solutions',
  sectors: [SectorEnum.EDUCATION, SectorEnum.HEALTH],
  subsectors: [SubSectorEnum.PRIMARY_EDUCATION, SubSectorEnum.MATERNAL_HEALTH],
  countries: ['Kenya', 'Tanzania', 'Uganda'],
  languages: ['English', 'French', 'Swahili'],
  budgetRange: {
    min: 50000,
    max: 500000,
  },
  teamSize: 25,
  yearsOfExperience: 8,
  completionRate: 75,
  exists: true,
  validationState: defaultValidationState,
};

const normalizeProfile = (profile: Partial<OrganizationProfile>): OrganizationProfile => {
  const validationState = profile.validationState ?? defaultValidationState;

  return {
    ...defaultProfile,
    ...profile,
    validationState: {
      ...defaultValidationState,
      ...validationState,
      sectionStatuses: {
        ...defaultSectionStatuses,
        ...(validationState.sectionStatuses ?? {}),
      },
    },
  };
};

export const OrganizationProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<OrganizationProfile>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('organizationProfile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return normalizeProfile(parsed);
      } catch (e) {
        return defaultProfile;
      }
    }
    return defaultProfile;
  });

  // Calculate completion rate based on filled fields
  const calculateCompletionRate = (profile: OrganizationProfile): number => {
    // Define weighted fields for better accuracy
    const fields = [
      // Critical fields (weight 2x) - 5 fields = 10 points
      { value: profile.name && profile.name.trim().length > 0, weight: 2 },
      { value: profile.description && profile.description.trim().length > 0, weight: 2 },
      { value: profile.sectors.length > 0, weight: 2 },
      { value: profile.countries.length > 0, weight: 2 },
      { value: profile.languages.length > 0, weight: 2 },
      
      // Important fields (weight 1.5x) - 3 fields = 4.5 points
      { value: profile.subsectors.length > 0, weight: 1.5 },
      { value: profile.teamSize > 0, weight: 1.5 },
      { value: profile.budgetRange.max > 0, weight: 1.5 },
      
      // Optional fields (weight 1x) - 2 fields = 2 points
      { value: profile.budgetRange.min > 0, weight: 1 },
      { value: profile.yearsOfExperience > 0, weight: 1 },
    ];

    const totalPoints = fields.reduce((sum, field) => sum + (field.value ? field.weight : 0), 0);
    const maxPoints = fields.reduce((sum, field) => sum + field.weight, 0);
    
    return Math.round((totalPoints / maxPoints) * 100);
  };

  // Update profile and persist to localStorage
  const updateProfile = (updates: Partial<OrganizationProfile>) => {
    setProfile((prev) => {
      const updated = normalizeProfile({ ...prev, ...updates });
      const completionRate = calculateCompletionRate(updated);
      const final = { ...updated, completionRate };
      
      // Save to localStorage
      localStorage.setItem('organizationProfile', JSON.stringify(final));
      
      return final;
    });
  };

  const markSectionsForValidation = (
    sections: OrganizationProfileSectionId[],
    message: string,
  ) => {
    setProfile((prev) => {
      const nextSectionStatuses = { ...prev.validationState.sectionStatuses };

      sections.forEach((section) => {
        nextSectionStatuses[section] = 'selfDeclared';
      });

      const updated = normalizeProfile({
        ...prev,
        validationState: {
          ...prev.validationState,
          pendingValidation: true,
          pendingValidationMessage: message,
          lastSubmittedAt: new Date().toISOString(),
          sectionStatuses: nextSectionStatuses,
        },
      });

      localStorage.setItem('organizationProfile', JSON.stringify(updated));
      return updated;
    });
  };

  // Recalculate completion rate on mount and whenever profile changes
  useEffect(() => {
    const completionRate = calculateCompletionRate(profile);
    if (completionRate !== profile.completionRate) {
      setProfile((prev) => {
        const updated = { ...prev, completionRate };
        // Also persist to localStorage when recalculating
        localStorage.setItem('organizationProfile', JSON.stringify(updated));
        return updated;
      });
    }
  }, [profile.name, profile.description, profile.sectors, profile.subsectors, profile.countries, profile.languages, profile.budgetRange, profile.teamSize, profile.yearsOfExperience]);

  return (
    <OrganizationProfileContext.Provider
      value={{
        profile,
        updateProfile,
        markSectionsForValidation,
        calculateCompletionRate,
      }}
    >
      {children}
    </OrganizationProfileContext.Provider>
  );
};