import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { tendersTranslations } from '../i18n/tenders';
import { sectorsTranslations } from '../i18n/sectors';
import { organizationsTranslations } from '../i18n/organizations';
import { notificationsTranslations } from '../i18n/notifications';
import { expertsTranslations } from '../i18n/experts';
import { projectsTranslations } from '../i18n/projects';
import { assistanceTranslations } from '../i18n/assistance';
import { trainingTranslations } from '../i18n/training';
import { insightsTranslations } from '../i18n/insights';
import { teamsTranslationsPatch } from '../i18n/teams-translations-patch';
import { trainingSubsectorsTranslations } from '../i18n/training-subsectors-patch';
import { teamsEmailAlreadyInvitedPatch } from '../i18n/teams-email-already-invited-patch';
import { aiMatchingLimitPatch } from '../i18n/ai-matching-limit-patch';
import { expertsMatchingLimitPatch } from '../i18n/experts-matching-limit-patch';
import { expertsMatchingAIPatch } from '../i18n/experts-matching-ai-patch';
import { cvDownloadLimitPatch } from '../i18n/cv-download-limit-patch';
import { tendersFiltersPatch } from '../i18n/tenders-filters-patch';
import { fundingAgenciesComplete } from '../i18n/funding-agencies-full';
import { tendersCardLabels } from '../i18n/tenders-card-labels';
import { activeTendersSearchPatch } from '../i18n/active-tenders-search-patch';
import { filtersShortLabelsPatch } from '../i18n/filters-short-labels-patch';
import { filtersTogglePatch } from '../i18n/filters-toggle-patch';
import { pipelineOpportunitiesPatch } from '../i18n/pipeline-opportunities-patch';
import { searchTranslations } from '../i18n/search';
import { offersTranslations } from '../i18n/offers';
import { accountTranslations } from '../i18n/account';
import { authTranslations } from '../i18n/auth';
import { monEspaceTranslations } from '../i18n/mon-espace';
import { footerTranslations } from '../i18n/footer';
import { aboutTranslations } from '../i18n/about';
import { permissionsTranslations } from '../i18n/permissions';
import { chatbotTranslations } from '../i18n/chatbot';
import { invitationsTranslations } from '../i18n/invitations';
import { matchingArchiveTranslations } from '../i18n/matching-archive';
import { projectsMatchingTranslations } from '../i18n/projects-matching';
import { expertsMatchingOrganisationTranslations } from '../i18n/experts-matching-organisation';
import { organizationsMatchingTranslations } from '../i18n/organizations-matching';
import { expertsOrganizationsMatchingTranslations } from '../i18n/experts-organizations-matching';
import { expertsMatchingTranslations } from '../i18n/experts-matching';
import { expertsMatchingOrganisationV2Translations } from '../i18n/experts-matching-organisation-v2';
import { statisticsTranslations } from '../i18n/statistics';
import { matchingOpportunitiesTranslations } from '../i18n/matching-opportunities';
import { expertMyCVTranslations } from '../i18n/expert-mycv';
import { servicesTranslations } from '../i18n/services';

// Language context for managing multilingual content (FR/EN/ES)
export type Language = 'en' | 'fr' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

// Centralized translations object for all languages
const translations: Record<Language, Record<string, string>> = {
  en: {
    ...tendersTranslations.en,
    ...sectorsTranslations.en,
    ...organizationsTranslations.en,
    ...notificationsTranslations.en,
    ...expertsTranslations.en,
    ...projectsTranslations.en,
    ...assistanceTranslations.en,
    ...trainingTranslations.en,
    ...insightsTranslations.en,
    ...teamsTranslationsPatch.en,
    ...trainingSubsectorsTranslations.en,
    ...teamsEmailAlreadyInvitedPatch.en,
    ...aiMatchingLimitPatch.en,
    ...expertsMatchingLimitPatch.en,
    ...expertsMatchingAIPatch.en,
    ...cvDownloadLimitPatch.en,
    ...tendersFiltersPatch.en,
    ...fundingAgenciesComplete.en,
    ...tendersCardLabels.en,
    ...activeTendersSearchPatch.en,
    ...filtersShortLabelsPatch.en,
    ...filtersTogglePatch.en,
    ...pipelineOpportunitiesPatch.en,
    ...searchTranslations.en,
    ...offersTranslations.en,
    ...accountTranslations.en,
    ...authTranslations.en,
    ...monEspaceTranslations.en,
    ...footerTranslations.en,
    ...aboutTranslations.en,
    ...permissionsTranslations.en,
    ...chatbotTranslations.en,
    ...invitationsTranslations.en,
    ...matchingArchiveTranslations.en,
    ...projectsMatchingTranslations.en,
    ...expertsMatchingOrganisationTranslations.en,
    ...organizationsMatchingTranslations.en,
    ...expertsOrganizationsMatchingTranslations.en,
    ...expertsMatchingTranslations.en,
    ...expertsMatchingOrganisationV2Translations.en,
    ...statisticsTranslations.en,
    ...matchingOpportunitiesTranslations.en,
    ...expertMyCVTranslations.en,
    ...servicesTranslations.en,
    // Navigation
    'nav.calls': 'Matching Projects',
    'nav.projects': 'My Projects',
    'nav.experts': 'Experts',
    'nav.organizations': 'Organizations',
    'nav.myOrganization': 'My Organization',
    'nav.insights': 'Insights',
    'nav.assistance': 'Assistance',
    'nav.training': 'Training',
    'nav.certifications': 'Certifications',
    'nav.matching': 'Smart Matching',
    'nav.excellence': 'Excellence & Assistance',
    'nav.search': 'Search',
    'nav.faq': 'FAQ',
    'nav.offers': 'Our Offers',
    'nav.jobs': 'My Space',
    'nav.memberArea': 'Member Area',
    
    // Language selector
    'lang.select': 'SELECT LANGUAGE',
    'lang.change': 'Change language',
    'lang.english': 'English',
    'lang.french': 'French',
    'lang.spanish': 'Spanish',
    
    // User Menu
    'userMenu.myAccount': 'My Account',
    'userMenu.profile': 'Profile & Settings',
    'userMenu.messages': 'Messages',
    'userMenu.mySpace': 'My Space',
    'userMenu.savedItems': 'Saved Items',
    'userMenu.preferences': 'Preferences',
    'userMenu.help': 'Help & Support',
    'userMenu.logout': 'Logout',
    
    // Dashboard
    'dashboard.title': 'Calls for Offers Hub',
    'dashboard.subtitle': 'Centralized platform for managing calls for offers with AI matching and advanced analytics',
    'dashboard.activeCalls': 'Active calls for offers',
    'dashboard.submissions': 'My submissions',
    'dashboard.invitations': 'Invitations',
    'dashboard.pipeline': 'Pipeline value',
    'dashboard.overview': 'Overview',
    'dashboard.waiting': 'awaiting',
    'dashboard.inProgress': 'In progress',
    'dashboard.candidates': 'candidates',
    
    // Common
    'common.search': 'Search...',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.close': 'Close',
    'common.badge.new': 'NEW',
    'common.notFound': 'Not Found',
    'common.optional': 'Optional',
    'common.total': 'Total',
    'common.match': 'match',
    
    // Actions
    'actions.quick': 'Quick Actions',
    'actions.aiMatching': 'AI Matching',
    'actions.export': 'Export Data',
    'actions.viewDetails': 'View Details',
    'actions.back': 'Back',
    'actions.downloadTemplates': 'Download Templates',
    'actions.search': 'Advanced Search',
    
    // Descriptions for actions
    'matching.description': 'Find opportunities that match your profile',
    'templates.description': 'Access proposal and submission templates',
    'search.description': 'Search and filter opportunities',
    
    // System States
    'loading': 'Loading...',
    'error.title': 'An error occurred',
    'error.retry': 'Retry',
    'empty.noData': 'No data available',
    'empty.noResults': 'No results found',
    'empty.createFirst': 'Create your first item to get started',
    'account.messages.title': 'Messages',
    'account.messages.subtitle': 'Review organization updates and manage your private conversations in one place.',
    'account.messages.inbox': 'Conversations',
    'account.messages.inboxDescription': 'Switch between organisation-wide updates and your private chats.',
    'account.messages.organisationSection': 'Organisation Messages',
    'account.messages.privateSection': 'Private Messages',
    'account.messages.organisationLabel': 'Organisation',
    'account.messages.privateLabel': 'Private',
    'account.messages.readOnlyShort': 'Read only',
    'account.messages.readOnlyTitle': 'Replies are limited in this thread',
    'account.messages.readOnlyDescription': 'Organisation messages are visible to everyone, but only admins can reply here.',
    'account.messages.privatePlaceholder': 'Write a private message...',
    'account.messages.organisationPlaceholder': 'Write an organisation reply...',
    'account.messages.send': 'Send',
    'account.messages.back': 'Back to conversations',
    'account.messages.adminBadge': 'Admin',
    'account.messages.emptyTitle': 'No conversation selected',
    'account.messages.emptyDescription': 'Choose a thread from the left to open the chat.',
  },
  fr: {
    ...tendersTranslations.fr,
    ...sectorsTranslations.fr,
    ...organizationsTranslations.fr,
    ...notificationsTranslations.fr,
    ...expertsTranslations.fr,
    ...projectsTranslations.fr,
    ...assistanceTranslations.fr,
    ...trainingTranslations.fr,
    ...insightsTranslations.fr,
    ...teamsTranslationsPatch.fr,
    ...trainingSubsectorsTranslations.fr,
    ...teamsEmailAlreadyInvitedPatch.fr,
    ...aiMatchingLimitPatch.fr,
    ...expertsMatchingLimitPatch.fr,
    ...expertsMatchingAIPatch.fr,
    ...cvDownloadLimitPatch.fr,
    ...tendersFiltersPatch.fr,
    ...fundingAgenciesComplete.fr,
    ...tendersCardLabels.fr,
    ...activeTendersSearchPatch.fr,
    ...filtersShortLabelsPatch.fr,
    ...filtersTogglePatch.fr,
    ...pipelineOpportunitiesPatch.fr,
    ...searchTranslations.fr,
    ...offersTranslations.fr,
    ...accountTranslations.fr,
    ...authTranslations.fr,
    ...monEspaceTranslations.fr,
    ...footerTranslations.fr,
    ...aboutTranslations.fr,
    ...permissionsTranslations.fr,
    ...chatbotTranslations.fr,
    ...invitationsTranslations.fr,
    ...matchingArchiveTranslations.fr,
    ...projectsMatchingTranslations.fr,
    ...expertsMatchingOrganisationTranslations.fr,
    ...organizationsMatchingTranslations.fr,
    ...expertsOrganizationsMatchingTranslations.fr,
    ...expertsMatchingTranslations.fr,
    ...expertsMatchingOrganisationV2Translations.fr,
    ...statisticsTranslations.fr,
    ...matchingOpportunitiesTranslations.fr,
    ...expertMyCVTranslations.fr,
    ...servicesTranslations.fr,
    // Navigation
    'nav.calls': 'Matching Projects',
    'nav.projects': 'Mes Projets',
    'nav.experts': 'Experts',
    'nav.organizations': 'Organisations',
    'nav.myOrganization': 'Mon Organisation',
    'nav.insights': 'Insights',
    'nav.assistance': 'Assistance',
    'nav.training': 'Formations',
    'nav.certifications': 'Certifications',
    'nav.matching': 'Matching Intelligent',
    'nav.excellence': 'Excellence & Assistance',
    'nav.search': 'Rechercher',
    'nav.faq': 'FAQ',
    'nav.offers': 'Nos Offres',
    'nav.jobs': 'Mon Espace',
    'nav.memberArea': 'Espace Membre',
    
    // Language selector
    'lang.select': 'SÉLECTIONNER LA LANGUE',
    'lang.change': 'Changer de langue',
    'lang.english': 'Anglais',
    'lang.french': 'Français',
    'lang.spanish': 'Espagnol',
    
    // User Menu
    'userMenu.myAccount': 'Mon Compte',
    'userMenu.profile': 'Profil & Paramètres',
    'userMenu.messages': 'Messages',
    'userMenu.mySpace': 'Mon Espace',
    'userMenu.savedItems': 'Éléments Sauvegardés',
    'userMenu.preferences': 'Préférences',
    'userMenu.help': 'Aide & Support',
    'userMenu.logout': 'Déconnexion',
    
    // Dashboard
    'dashboard.title': 'Hub des Appels d\'Offres',
    'dashboard.subtitle': 'Plateforme centralisée pour gérer les appels d\'offres avec matching IA et analyses avancées',
    'dashboard.activeCalls': 'Appels d\'offres actifs',
    'dashboard.submissions': 'Mes soumissions',
    'dashboard.invitations': 'Invitations',
    'dashboard.pipeline': 'Valeur du pipeline',
    'dashboard.overview': 'Vue d\'ensemble',
    'dashboard.waiting': 'en attente',
    'dashboard.inProgress': 'En cours',
    'dashboard.candidates': 'candidats',
    
    // Common
    'common.search': 'Rechercher...',
    'common.filter': 'Filtrer',
    'common.sort': 'Trier',
    'common.export': 'Exporter',
    'common.import': 'Importer',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.close': 'Fermer',
    'common.badge.new': 'NOUVEAU',
    'common.notFound': 'Non trouvé',
    'common.optional': 'Optionnel',
    'common.total': 'Total',
    'common.match': 'match',
    
    // Actions
    'actions.quick': 'Actions Rapides',
    'actions.aiMatching': 'Matching IA',
    'actions.export': 'Exporter les Données',
    'actions.viewDetails': 'Voir les Détails',
    'actions.back': 'Retour',
    'actions.downloadTemplates': 'Télécharger les Modèles',
    'actions.search': 'Recherche Avancée',
    
    // Descriptions for actions
    'matching.description': 'Trouvez des opportunités qui correspondent à votre profil',
    'templates.description': 'Accédez aux modèles de propositions et de soumissions',
    'search.description': 'Recherchez et filtrez les opportunités',
    
    // System States
    'loading': 'Chargement...',
    'error.title': 'Une erreur est survenue',
    'error.retry': 'Réessayer',
    'empty.noData': 'Aucune donnée disponible',
    'empty.noResults': 'Aucun résultat trouvé',
    'empty.createFirst': 'Créez votre premier élément pour commencer',
    'account.messages.title': 'Messages',
    'account.messages.subtitle': 'Consultez les messages d organisation et gerez vos conversations privees au meme endroit.',
    'account.messages.inbox': 'Conversations',
    'account.messages.inboxDescription': 'Passez des fils d organisation a vos messages prives.',
    'account.messages.organisationSection': 'Messages organisation',
    'account.messages.privateSection': 'Messages prives',
    'account.messages.organisationLabel': 'Organisation',
    'account.messages.privateLabel': 'Prive',
    'account.messages.readOnlyShort': 'Lecture seule',
    'account.messages.readOnlyTitle': 'Les reponses sont limitees ici',
    'account.messages.readOnlyDescription': 'Les messages d organisation sont visibles par tous, mais seuls les admins peuvent repondre ici.',
    'account.messages.privatePlaceholder': 'Ecrire un message prive...',
    'account.messages.organisationPlaceholder': 'Ecrire une reponse organisation...',
    'account.messages.send': 'Envoyer',
    'account.messages.back': 'Retour aux conversations',
    'account.messages.adminBadge': 'Admin',
    'account.messages.emptyTitle': 'Aucune conversation selectionnee',
    'account.messages.emptyDescription': 'Choisissez un fil a gauche pour ouvrir la discussion.',
  },
  es: {
    ...tendersTranslations.es,
    ...sectorsTranslations.es,
    ...organizationsTranslations.es,
    ...notificationsTranslations.es,
    ...expertsTranslations.es,
    ...projectsTranslations.es,
    ...assistanceTranslations.es,
    ...trainingTranslations.es,
    ...insightsTranslations.es,
    ...teamsTranslationsPatch.es,
    ...trainingSubsectorsTranslations.es,
    ...teamsEmailAlreadyInvitedPatch.es,
    ...aiMatchingLimitPatch.es,
    ...expertsMatchingLimitPatch.es,
    ...expertsMatchingAIPatch.es,
    ...cvDownloadLimitPatch.es,
    ...tendersFiltersPatch.es,
    ...fundingAgenciesComplete.es,
    ...tendersCardLabels.es,
    ...activeTendersSearchPatch.es,
    ...filtersShortLabelsPatch.es,
    ...filtersTogglePatch.es,
    ...pipelineOpportunitiesPatch.es,
    ...searchTranslations.es,
    ...offersTranslations.es,
    ...accountTranslations.es,
    ...authTranslations.es,
    ...monEspaceTranslations.es,
    ...footerTranslations.es,
    ...aboutTranslations.es,
    ...permissionsTranslations.es,
    ...chatbotTranslations.es,
    ...invitationsTranslations.es,
    ...matchingArchiveTranslations.es,
    ...projectsMatchingTranslations.es,
    ...expertsMatchingOrganisationTranslations.es,
    ...organizationsMatchingTranslations.es,
    ...expertsOrganizationsMatchingTranslations.es,
    ...expertsMatchingTranslations.es,
    ...expertsMatchingOrganisationV2Translations.es,
    ...statisticsTranslations.es,
    ...matchingOpportunitiesTranslations.es,
    ...expertMyCVTranslations.es,
    ...servicesTranslations.es,
    // Navigation
    'nav.calls': 'Matching Projects',
    'nav.projects': 'Mis Proyectos',
    'nav.experts': 'Expertos',
    'nav.organizations': 'Organizaciones',
    'nav.myOrganization': 'Mi Organización',
    'nav.insights': 'Insights',
    'nav.assistance': 'Asistencia',
    'nav.training': 'Formaciones',
    'nav.certifications': 'Certificaciones',
    'nav.matching': 'Matching Inteligente',
    'nav.excellence': 'Excelencia & Asistencia',
    'nav.search': 'Buscar',
    'nav.faq': 'FAQ',
    'nav.offers': 'Nuestras Ofertas',
    'nav.jobs': 'Mi Espacio',
    'nav.memberArea': 'Área de Miembros',
    
    // Language selector
    'lang.select': 'SELECCIONAR IDIOMA',
    'lang.change': 'Cambiar idioma',
    'lang.english': 'Inglés',
    'lang.french': 'Francés',
    'lang.spanish': 'Español',
    
    // User Menu
    'userMenu.myAccount': 'Mi Cuenta',
    'userMenu.profile': 'Perfil y Configuración',
    'userMenu.messages': 'Mensajes',
    'userMenu.mySpace': 'Mi Espacio',
    'userMenu.savedItems': 'Elementos Guardados',
    'userMenu.preferences': 'Preferencias',
    'userMenu.help': 'Ayuda y Soporte',
    'userMenu.logout': 'Cerrar Sesión',
    
    // Dashboard
    'dashboard.title': 'Hub de Licitaciones',
    'dashboard.subtitle': 'Plataforma centralizada para gestionar licitaciones con matching IA y análisis avanzados',
    'dashboard.activeCalls': 'Licitaciones activas',
    'dashboard.submissions': 'Mis envíos',
    'dashboard.invitations': 'Invitaciones',
    'dashboard.pipeline': 'Valor del pipeline',
    'dashboard.overview': 'Resumen',
    'dashboard.waiting': 'en espera',
    'dashboard.inProgress': 'En progreso',
    'dashboard.candidates': 'candidatos',
    
    // Common
    'common.search': 'Buscar...',
    'common.filter': 'Filtrar',
    'common.sort': 'Ordenar',
    'common.export': 'Exportar',
    'common.import': 'Importar',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.close': 'Cerrar',
    'common.badge.new': 'NUEVO',
    'common.notFound': 'No encontrado',
    'common.optional': 'Opcional',
    'common.total': 'Total',
    'common.match': 'match',
    
    // Actions
    'actions.quick': 'Acciones Rápidas',
    'actions.aiMatching': 'Matching IA',
    'actions.export': 'Exportar Datos',
    'actions.viewDetails': 'Ver Detalles',
    'actions.back': 'Atrás',
    'actions.downloadTemplates': 'Descargar Plantillas',
    'actions.search': 'Búsqueda Avanzada',
    
    // Descriptions for actions
    'matching.description': 'Encuentre oportunidades que coincidan con su perfil',
    'templates.description': 'Acceda a plantillas de propuestas y envíos',
    'search.description': 'Busque y filtre oportunidades',
    
    // System States
    'loading': 'Cargando...',
    'error.title': 'Ocurrió un error',
    'error.retry': 'Reintentar',
    'empty.noData': 'No hay datos disponibles',
    'empty.noResults': 'No se encontraron resultados',
    'empty.createFirst': 'Cree su primer elemento para comenzar',
    'account.messages.title': 'Mensajes',
    'account.messages.subtitle': 'Revise los mensajes de la organizacion y gestione sus conversaciones privadas en un solo lugar.',
    'account.messages.inbox': 'Conversaciones',
    'account.messages.inboxDescription': 'Cambie entre mensajes de organizacion y chats privados.',
    'account.messages.organisationSection': 'Mensajes de organizacion',
    'account.messages.privateSection': 'Mensajes privados',
    'account.messages.organisationLabel': 'Organizacion',
    'account.messages.privateLabel': 'Privado',
    'account.messages.readOnlyShort': 'Solo lectura',
    'account.messages.readOnlyTitle': 'Las respuestas estan limitadas aqui',
    'account.messages.readOnlyDescription': 'Los mensajes de organizacion son visibles para todos, pero solo los administradores pueden responder aqui.',
    'account.messages.privatePlaceholder': 'Escriba un mensaje privado...',
    'account.messages.organisationPlaceholder': 'Escriba una respuesta de organizacion...',
    'account.messages.send': 'Enviar',
    'account.messages.back': 'Volver a conversaciones',
    'account.messages.adminBadge': 'Admin',
    'account.messages.emptyTitle': 'No hay conversacion seleccionada',
    'account.messages.emptyDescription': 'Elija un hilo a la izquierda para abrir el chat.',
  },
};

// Create context with a default value
const defaultContextValue: LanguageContextType = {
  language: 'en' as Language,
  setLanguage: () => {},
  t: (key: string) => key,
};

const LanguageContext = createContext<LanguageContextType>(defaultContextValue);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>): string => {
      const normalizedLanguage = (language || 'en').toLowerCase().slice(0, 2) as Language;
      const currentLanguageMap = translations[normalizedLanguage] || translations.en;
      let translation =
        currentLanguageMap[key] ||
        translations.en[key] ||
        translations.fr[key] ||
        translations.es[key] ||
        key;
      if (params) {
        Object.keys(params).forEach(paramKey => {
          translation = translation.replace(`{${paramKey}}`, params[paramKey].toString());
        });
      }
      return translation;
    };
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  return context;
};

// Alias pour useTranslation (convention du projet)
export const useTranslation = useLanguage;

// Export par défaut pour compatibilité
export default LanguageContext;
