import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface HistoryEntry {
  id: string;
  type: 'contact' | 'assistance' | 'invitation' | 'partnership' | 'commercial' | 
        'general_inquiry' | 'promotion_request' | 'training_enrollment' | 'tender_submission' | 'team-invitation';
  
  // Identifiants
  expertName?: string;
  expertRole?: string;
  organizationName?: string;
  projectName?: string;
  tenderTitle?: string;
  trainingTitle?: string;
  trainingCourse?: string;
  trainingSession?: string;
  trainingDuration?: string;
  trainingInstructor?: string;
  partnershipType?: string;
  
  // Contenu
  title: string;
  message?: string;
  response?: string;
  
  // Statuts
  status: 'pending' | 'accepted' | 'rejected' | 'sent' | 'responded' | 
          'in_progress' | 'closed' | 'submitted' | 'enrolled';
  
  // Dates
  date: Date;
  responseDate?: Date;
  
  // Métadonnées spécifiques
  requestType?: 'technical' | 'methodological' | 'graphic' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  
  // UI
  isNew?: boolean;
  isArchived?: boolean;
}

interface AssistanceHistoryContextType {
  history: HistoryEntry[];
  addHistoryEntry: (entry: Omit<HistoryEntry, 'id' | 'date'>) => void;
  updateHistoryEntry: (id: string, updates: Partial<HistoryEntry>) => void;
  getHistoryById: (id: string) => HistoryEntry | undefined;
}

const AssistanceHistoryContext = createContext<AssistanceHistoryContextType | undefined>(undefined);

export function AssistanceHistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryEntry[]>([
    // Contacts experts (via "Trouver un Expert")
    {
      id: '1',
      type: 'contact',
      expertName: 'Dr. Marie Dubois',
      expertRole: 'Méthodologie Rédaction',
      title: 'Consultation pour projet USAID',
      status: 'responded',
      date: new Date(2024, 2, 1),
      responseDate: new Date(2024, 2, 2),
      message: 'Bonjour, je souhaiterais discuter d\'une opportunité de collaboration pour un projet USAID. Pourriez-vous me contacter?',
      response: 'Merci pour votre message. Je serais ravie de discuter de ce projet avec vous. Quand êtes-vous disponible pour un appel?',
      isNew: true,
    },
    {
      id: '2',
      type: 'contact',
      expertName: 'Sophie Martin',
      expertRole: 'Méthodologie Rédaction',
      title: 'Demande de révision technique AFD',
      status: 'sent',
      date: new Date(2024, 2, 5),
      message: 'Demande de révision d\'une proposition technique pour un appel d\'offre AFD. Disponibilité urgente requise.',
    },
    {
      id: '3',
      type: 'contact',
      expertName: 'Ahmed Hassan',
      expertRole: 'Expert Technique Eau & Assainissement',
      title: 'Collaboration projet AFD Afrique',
      status: 'rejected',
      date: new Date(2024, 1, 28),
      responseDate: new Date(2024, 1, 29),
      message: 'Invitation pour un projet AFD en Afrique de l\'Ouest (secteur eau & assainissement).',
      response: 'Merci pour votre invitation. Malheureusement, je ne suis pas disponible pour ce projet en raison d\'autres engagements.',
    },
    
    // Demandes d'assistance (via "Demande d'assistance")
    {
      id: '4',
      type: 'assistance',
      organizationName: 'Assortis Support Team',
      title: 'Aide technique - Configuration profil expert',
      status: 'in_progress',
      date: new Date(2024, 2, 3),
      responseDate: new Date(2024, 2, 3),
      message: 'Bonjour, j\'ai des difficultés à configurer mon profil expert et à ajouter mes certifications. Pouvez-vous m\'aider?',
      response: 'Bonjour, nous avons bien reçu votre demande. Un de nos techniciens va vous contacter dans les 24h pour vous assister.',
      requestType: 'technical',
      priority: 'medium',
      isNew: true,
    },
    {
      id: '5',
      type: 'assistance',
      organizationName: 'Assortis Support Team',
      title: 'Question facturation abonnement Premium',
      status: 'closed',
      date: new Date(2024, 1, 20),
      responseDate: new Date(2024, 1, 21),
      message: 'J\'ai une question concernant ma facture d\'abonnement Premium. Le montant semble incorrect.',
      response: 'Bonjour, nous avons vérifié votre facture. Il s\'agissait d\'un ajustement automatique suite à votre upgrade. Tout est correct. Merci!',
      requestType: 'other',
      priority: 'high',
    },
    {
      id: '6',
      type: 'assistance',
      organizationName: 'Assortis Support Team',
      title: 'Demande de formation - Méthodologie',
      status: 'pending',
      date: new Date(2024, 2, 6),
      message: 'Je souhaite obtenir plus d\'informations sur les formations méthodologiques disponibles et les modalités d\'inscription.',
      requestType: 'methodological',
      priority: 'low',
    },
    
    // Invitations (collaborations)
    {
      id: '7',
      type: 'invitation',
      expertName: 'John Smith',
      expertRole: 'Révision Technique',
      title: 'Invitation projet UNESCO',
      status: 'accepted',
      date: new Date(2024, 2, 3),
      responseDate: new Date(2024, 2, 4),
      message: 'Invitation à collaborer sur un projet UNESCO de développement éducatif en Asie du Sud-Est.',
      response: 'J\'accepte avec plaisir cette invitation. Merci de me transmettre les détails du projet.',
    },
    {
      id: '8',
      type: 'invitation',
      expertName: 'Elena Petrova',
      expertRole: 'Révision Technique',
      title: 'Collaboration projet EuropeAid',
      status: 'pending',
      date: new Date(2024, 1, 25),
      message: 'Proposition pour révision méthodologique d\'un projet EuropeAid (secteur éducation, Balkans).',
    },
  ]);

  const addHistoryEntry = (entry: Omit<HistoryEntry, 'id' | 'date'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date(),
    };
    
    setHistory(prev => [newEntry, ...prev]);
  };

  const updateHistoryEntry = (id: string, updates: Partial<HistoryEntry>) => {
    setHistory(prev =>
      prev.map(entry =>
        entry.id === id ? { ...entry, ...updates } : entry
      )
    );
  };

  const getHistoryById = (id: string) => {
    return history.find(entry => entry.id === id);
  };

  return (
    <AssistanceHistoryContext.Provider
      value={{
        history,
        addHistoryEntry,
        updateHistoryEntry,
        getHistoryById,
      }}
    >
      {children}
    </AssistanceHistoryContext.Provider>
  );
}

export function useAssistanceHistory() {
  const context = useContext(AssistanceHistoryContext);
  if (context === undefined) {
    throw new Error('useAssistanceHistory must be used within an AssistanceHistoryProvider');
  }
  return context;
}