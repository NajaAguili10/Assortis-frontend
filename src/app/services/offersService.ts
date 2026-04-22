/**
 * Service pour gérer les données du module "Nos offres"
 * 
 * IMPORTANT: Ce service utilise actuellement des données mock.
 * Lors de l'intégration avec le backoffice, remplacer les fonctions mock
 * par des appels API vers votre backend.
 * 
 * Exemple d'intégration future:
 * export const getOffersHubContent = async (): Promise<OffersHubContent> => {
 *   const response = await fetch('/api/offers/hub');
 *   return response.json();
 * };
 */

import { 
  OffersHubContent, 
  BecomeMemberContent, 
  MemberAreaContent,
  ContactSalesContent 
} from '../types/offers.types';

// ==========================================
// MOCK DATA - À remplacer par des appels API
// ==========================================

/**
 * Récupère le contenu de la page "Nos offres Hub"
 * TODO: Remplacer par un appel API au backoffice
 */
export const getOffersHubContent = async (): Promise<OffersHubContent> => {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 100));

  return {
    banner: {
      title: {
        en: 'Our Offers',
        fr: 'Nos offres',
        es: 'Nuestras ofertas'
      },
      subtitle: {
        en: 'Discover our subscription plans and exclusive benefits',
        fr: 'Découvrez nos formules d\'abonnement et avantages exclusifs',
        es: 'Descubra nuestros planes de suscripción y beneficios exclusivos'
      }
    },
    ctaCards: [
      {
        id: 'become-member',
        title: {
          en: 'Become a Member',
          fr: 'Devenir membre',
          es: 'Hacerse miembro'
        },
        description: {
          en: 'Join our community and access exclusive opportunities',
          fr: 'Rejoignez notre communauté et accédez à des opportunités exclusives',
          es: 'Únase a nuestra comunidad y acceda a oportunidades exclusivas'
        },
        iconName: 'UserPlus',
        iconBgColor: 'bg-accent/10',
        iconColor: 'text-accent',
        link: '/offers/become-member',
        displayOrder: 1,
        isActive: false
      },
      {
        id: 'member-area',
        title: {
          en: 'Member Area',
          fr: 'Espace membre',
          es: 'Área de miembros'
        },
        description: {
          en: 'Access your personal space and manage your subscription',
          fr: 'Accédez à votre espace personnel et gérez votre abonnement',
          es: 'Acceda a su espacio personal y gestione su suscripción'
        },
        iconName: 'Shield',
        iconBgColor: 'bg-primary/10',
        iconColor: 'text-primary',
        link: '/offers/member-area',
        displayOrder: 2,
        isActive: true
      },
      {
        id: 'faq',
        title: {
          en: 'FAQ',
          fr: 'FAQ',
          es: 'FAQ'
        },
        description: {
          en: 'Find answers to your questions about Assortis',
          fr: 'Trouvez les réponses à vos questions sur Assortis',
          es: 'Encuentre respuestas a sus preguntas sobre Assortis'
        },
        iconName: 'HelpCircle',
        iconBgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
        link: '/faq',
        displayOrder: 3,
        isActive: true
      }
    ],
    plans: [
      // Expert Plans
      {
        id: 'expert-beginner',
        name: {
          en: 'Expert Beginner',
          fr: 'Expert Débutant',
          es: 'Experto Principiante'
        },
        description: {
          en: 'Perfect for individual experts starting out',
          fr: 'Parfait pour les experts individuels qui débutent',
          es: 'Perfecto para expertos individuales que comienzan'
        },
        priceMonthly: 29,
        priceYearly: 290,
        features: [
          {
            id: 'profile-expert',
            textKey: 'offers.features.expertProfile'
          },
          {
            id: 'tenders-access-5',
            textKey: 'offers.features.tendersLimit',
            values: { count: 5 }
          },
          {
            id: 'cv-storage',
            textKey: 'offers.features.cvStorage'
          },
          {
            id: 'applications-basic',
            textKey: 'offers.features.applicationsBasic',
            values: { count: 3 }
          },
          {
            id: 'support-email',
            textKey: 'offers.features.supportEmail'
          }
        ],
        highlighted: false,
        iconName: 'User',
        colorGradient: 'from-blue-500 to-cyan-500',
        displayOrder: 1,
        isActive: true,
        userType: 'expert'
      },
      {
        id: 'expert-professional',
        name: {
          en: 'Expert Professional',
          fr: 'Expert Professionnel',
          es: 'Experto Profesional'
        },
        description: {
          en: 'For experienced consultants and experts',
          fr: 'Pour consultants et experts expérimentés',
          es: 'Para consultores y expertos experimentados'
        },
        priceMonthly: 69,
        priceYearly: 690,
        features: [
          {
            id: 'profile-expert-pro',
            textKey: 'offers.features.expertProfileAdvanced'
          },
          {
            id: 'tenders-access-unlimited',
            textKey: 'offers.features.tendersUnlimited'
          },
          {
            id: 'cv-storage-pro',
            textKey: 'offers.features.cvStorageUnlimited'
          },
          {
            id: 'applications-unlimited',
            textKey: 'offers.features.applicationsUnlimited'
          },
          {
            id: 'ai-matching-expert',
            textKey: 'offers.features.aiMatchingAdvanced'
          },
          {
            id: 'training-access-expert',
            textKey: 'offers.features.trainingAccess'
          },
          {
            id: 'support-priority-expert',
            textKey: 'offers.features.supportPriority'
          }
        ],
        highlighted: true,
        iconName: 'Award',
        colorGradient: 'from-accent to-red-600',
        displayOrder: 2,
        isActive: true,
        userType: 'expert'
      },
      // Organization Plans
      {
        id: 'org-beginner',
        name: {
          en: 'Organization Beginner',
          fr: 'Organisation Débutant',
          es: 'Organización Principiante'
        },
        description: {
          en: 'For small organizations and NGOs',
          fr: 'Pour petites organisations et ONG',
          es: 'Para pequeñas organizaciones y ONG'
        },
        priceMonthly: 49,
        priceYearly: 490,
        features: [
          {
            id: 'org-profile',
            textKey: 'offers.features.organizationProfile'
          },
          {
            id: 'job-posts',
            textKey: 'offers.features.jobPosts',
            values: { count: 5 }
          },
          {
            id: 'experts-search',
            textKey: 'offers.features.expertsLimit',
            values: { count: 10 }
          },
          {
            id: 'projects-basic-org',
            textKey: 'offers.features.projectsBasic'
          },
          {
            id: 'team-members',
            textKey: 'offers.features.teamMembers',
            values: { count: 3 }
          },
          {
            id: 'support-email-org',
            textKey: 'offers.features.supportEmail'
          }
        ],
        highlighted: false,
        iconName: 'Building2',
        colorGradient: 'from-purple-500 to-indigo-500',
        displayOrder: 3,
        isActive: true,
        userType: 'organization'
      },
      {
        id: 'org-professional',
        name: {
          en: 'Organization Professional',
          fr: 'Organisation Professionnel',
          es: 'Organización Profesional'
        },
        description: {
          en: 'For growing organizations',
          fr: 'Pour organisations en croissance',
          es: 'Para organizaciones en crecimiento'
        },
        priceMonthly: 99,
        priceYearly: 990,
        features: [
          {
            id: 'org-profile-advanced',
            textKey: 'offers.features.organizationProfileAdvanced'
          },
          {
            id: 'job-posts-unlimited',
            textKey: 'offers.features.jobPostsUnlimited'
          },
          {
            id: 'experts-unlimited',
            textKey: 'offers.features.expertsUnlimited'
          },
          {
            id: 'projects-advanced-org',
            textKey: 'offers.features.projectsAdvanced'
          },
          {
            id: 'team-members-unlimited',
            textKey: 'offers.features.teamMembersUnlimited'
          },
          {
            id: 'ai-matching-org',
            textKey: 'offers.features.aiMatchingAdvanced'
          },
          {
            id: 'analytics-advanced-org',
            textKey: 'offers.features.analyticsAdvanced'
          },
          {
            id: 'support-priority-org',
            textKey: 'offers.features.supportPriority'
          }
        ],
        highlighted: true,
        iconName: 'Building',
        colorGradient: 'from-green-500 to-emerald-600',
        displayOrder: 4,
        isActive: true,
        userType: 'organization'
      },
      {
        id: 'org-enterprise',
        name: {
          en: 'Organization Enterprise',
          fr: 'Organisation Entreprise',
          es: 'Organización Empresa'
        },
        description: {
          en: 'For large international organizations',
          fr: 'Pour grandes organisations internationales',
          es: 'Para grandes organizaciones internacionales'
        },
        priceMonthly: null,
        priceYearly: null,
        features: [
          {
            id: 'everything-included',
            textKey: 'offers.features.everythingIncluded'
          },
          {
            id: 'custom-branding-org',
            textKey: 'offers.features.customBranding'
          },
          {
            id: 'api-access-org',
            textKey: 'offers.features.apiAccess'
          },
          {
            id: 'sso-org',
            textKey: 'offers.features.sso'
          },
          {
            id: 'dedicated-account',
            textKey: 'offers.features.dedicatedAccount'
          },
          {
            id: 'support-dedicated-org',
            textKey: 'offers.features.supportDedicated'
          },
          {
            id: 'compliance-org',
            textKey: 'offers.features.compliance'
          },
          {
            id: 'sla-guaranteed',
            textKey: 'offers.features.slaGuaranteed'
          }
        ],
        highlighted: false,
        iconName: 'Building2',
        colorGradient: 'from-indigo-600 to-violet-700',
        displayOrder: 5,
        isActive: true,
        userType: 'organization'
      }
    ],
    valuePropositions: [
      {
        id: 'ai-matching',
        title: {
          en: 'AI-Powered Matching',
          fr: 'Matching IA',
          es: 'Emparejamiento con IA'
        },
        description: {
          en: 'Intelligent matching between opportunities and your profile',
          fr: 'Mise en relation intelligente entre les opportunités et votre profil',
          es: 'Emparejamiento inteligente entre oportunidades y su perfil'
        },
        iconName: 'TrendingUp',
        iconBgColor: 'bg-blue-50',
        iconTextColor: 'text-blue-600',
        displayOrder: 1,
        isActive: true
      },
      {
        id: 'priority-support',
        title: {
          en: 'Priority Support',
          fr: 'Support prioritaire',
          es: 'Soporte prioritario'
        },
        description: {
          en: '24/7 dedicated support for all your needs',
          fr: 'Support dédié 24/7 pour tous vos besoins',
          es: 'Soporte dedicado 24/7 para todas sus necesidades'
        },
        iconName: 'Headphones',
        iconBgColor: 'bg-purple-50',
        iconTextColor: 'text-purple-600',
        displayOrder: 2,
        isActive: true
      },
      {
        id: 'training',
        title: {
          en: 'Training & Certifications',
          fr: 'Formations & Certifications',
          es: 'Formación y Certificaciones'
        },
        description: {
          en: 'Access to comprehensive training and certifications',
          fr: 'Accès à des formations et certifications complètes',
          es: 'Acceso a formación y certificaciones completas'
        },
        iconName: 'Zap',
        iconBgColor: 'bg-amber-50',
        iconTextColor: 'text-amber-600',
        displayOrder: 3,
        isActive: true
      }
    ],
    sectionTitles: {
      comparePlans: {
        en: 'Compare Plans',
        fr: 'Comparer les formules',
        es: 'Comparar planes'
      },
      features: {
        en: 'Why Choose Assortis?',
        fr: 'Pourquoi choisir Assortis ?',
        es: '¿Por qué elegir Assortis?'
      }
    }
  };
};

/**
 * Récupère le contenu de la page "Devenir membre"
 * TODO: Remplacer par un appel API au backoffice
 */
export const getBecomeMemberContent = async (): Promise<BecomeMemberContent> => {
  await new Promise(resolve => setTimeout(resolve, 100));

  return {
    banner: {
      title: {
        en: 'Become a Member',
        fr: 'Devenir membre',
        es: 'Hacerse miembro'
      },
      subtitle: {
        en: 'Join our community and access exclusive opportunities',
        fr: 'Rejoignez notre communauté et accédez à des opportunités exclusives',
        es: 'Únase a nuestra comunidad y acceda a oportunidades exclusivas'
      }
    },
    benefits: [
      {
        id: 'access',
        title: {
          en: 'Access to Exclusive Opportunities',
          fr: 'Accès aux opportunités exclusives',
          es: 'Acceso a oportunidades exclusivas'
        },
        description: {
          en: 'Get priority access to international tenders and projects',
          fr: 'Accédez en priorité aux appels d\'offres et projets internationaux',
          es: 'Acceda prioritariamente a licitaciones y proyectos internacionales'
        },
        iconName: 'Sparkles',
        displayOrder: 1
      },
      {
        id: 'network',
        title: {
          en: 'Professional Network',
          fr: 'Réseau professionnel',
          es: 'Red profesional'
        },
        description: {
          en: 'Connect with experts and organizations worldwide',
          fr: 'Connectez-vous avec des experts et organisations du monde entier',
          es: 'Conéctese con expertos y organizaciones de todo el mundo'
        },
        iconName: 'Users',
        displayOrder: 2
      },
      {
        id: 'tools',
        title: {
          en: 'Advanced Tools',
          fr: 'Outils avancés',
          es: 'Herramientas avanzadas'
        },
        description: {
          en: 'Use AI-powered matching and analytics tools',
          fr: 'Utilisez des outils de matching IA et d\'analyse avancés',
          es: 'Use herramientas de emparejamiento con IA y análisis'
        },
        iconName: 'Zap',
        displayOrder: 3
      }
    ],
    process: {
      title: {
        en: 'How It Works',
        fr: 'Comment ça marche',
        es: 'Cómo funciona'
      },
      steps: [
        {
          id: 'step-1',
          number: 1,
          title: {
            en: 'Choose Your Plan',
            fr: 'Choisissez votre formule',
            es: 'Elija su plan'
          },
          description: {
            en: 'Select the plan that best fits your needs',
            fr: 'Sélectionnez la formule qui correspond le mieux à vos besoins',
            es: 'Seleccione el plan que mejor se adapte a sus necesidades'
          },
          iconName: 'CheckCircle2'
        },
        {
          id: 'step-2',
          number: 2,
          title: {
            en: 'Complete Registration',
            fr: 'Complétez l\'inscription',
            es: 'Complete el registro'
          },
          description: {
            en: 'Fill in your profile and preferences',
            fr: 'Remplissez votre profil et vos préférences',
            es: 'Complete su perfil y preferencias'
          },
          iconName: 'UserCheck'
        },
        {
          id: 'step-3',
          number: 3,
          title: {
            en: 'Start Exploring',
            fr: 'Commencez à explorer',
            es: 'Comience a explorar'
          },
          description: {
            en: 'Access your member area and discover opportunities',
            fr: 'Accédez à votre espace membre et découvrez les opportunités',
            es: 'Acceda a su área de miembros y descubra oportunidades'
          },
          iconName: 'Rocket'
        }
      ]
    }
  };
};

/**
 * Récupère le contenu de la page "Espace membre"
 * TODO: Remplacer par un appel API au backoffice
 */
export const getMemberAreaContent = async (): Promise<MemberAreaContent> => {
  await new Promise(resolve => setTimeout(resolve, 100));

  return {
    banner: {
      title: {
        en: 'Member Area',
        fr: 'Espace membre',
        es: 'Área de miembros'
      },
      subtitle: {
        en: 'Access your personal space and manage your subscription',
        fr: 'Accédez à votre espace personnel et gérez votre abonnement',
        es: 'Acceda a su espacio personal y gestione su suscripción'
      }
    },
    benefits: [
      {
        id: 'dashboard',
        title: {
          en: 'Personal Dashboard',
          fr: 'Tableau de bord personnel',
          es: 'Panel personal'
        },
        description: {
          en: 'Track your activity and opportunities',
          fr: 'Suivez votre activité et vos opportunités',
          es: 'Realice un seguimiento de su actividad y oportunidades'
        },
        iconName: 'LayoutDashboard',
        iconColor: 'text-blue-600',
        displayOrder: 1
      },
      {
        id: 'profile',
        title: {
          en: 'Profile Management',
          fr: 'Gestion du profil',
          es: 'Gestión del perfil'
        },
        description: {
          en: 'Update your information and preferences',
          fr: 'Mettez à jour vos informations et préférences',
          es: 'Actualice su información y preferencias'
        },
        iconName: 'User',
        iconColor: 'text-green-600',
        displayOrder: 2
      },
      {
        id: 'subscription',
        title: {
          en: 'Subscription',
          fr: 'Abonnement',
          es: 'Suscripción'
        },
        description: {
          en: 'Manage your plan and billing',
          fr: 'Gérez votre formule et facturation',
          es: 'Gestione su plan y facturación'
        },
        iconName: 'CreditCard',
        iconColor: 'text-purple-600',
        displayOrder: 3
      }
    ]
  };
};

/**
 * Récupère le contenu de la page "Contact commercial"
 * TODO: Remplacer par un appel API au backoffice
 */
export const getContactSalesContent = async (): Promise<ContactSalesContent> => {
  await new Promise(resolve => setTimeout(resolve, 100));

  return {
    banner: {
      title: {
        en: 'Contact Sales',
        fr: 'Contact commercial',
        es: 'Contacto comercial'
      },
      subtitle: {
        en: 'Our team will contact you within 24 hours to discuss your needs',
        fr: 'Notre équipe vous contactera sous 24h pour discuter de vos besoins',
        es: 'Nuestro equipo le contactará en 24 horas para discutir sus necesidades'
      }
    },
    form: {
      title: {
        en: 'Request Information',
        fr: 'Demander des informations',
        es: 'Solicitar información'
      },
      fields: {
        name: {
          label: {
            en: 'Full Name',
            fr: 'Nom complet',
            es: 'Nombre completo'
          },
          placeholder: {
            en: 'Enter your full name',
            fr: 'Entrez votre nom complet',
            es: 'Ingrese su nombre completo'
          }
        },
        email: {
          label: {
            en: 'Email',
            fr: 'Email',
            es: 'Correo electrónico'
          },
          placeholder: {
            en: 'your.email@company.com',
            fr: 'votre.email@entreprise.com',
            es: 'su.correo@empresa.com'
          }
        },
        company: {
          label: {
            en: 'Company',
            fr: 'Entreprise',
            es: 'Empresa'
          },
          placeholder: {
            en: 'Your company name',
            fr: 'Nom de votre entreprise',
            es: 'Nombre de su empresa'
          }
        },
        companySize: {
          label: {
            en: 'Company Size',
            fr: 'Taille de l\'entreprise',
            es: 'Tamaño de la empresa'
          },
          placeholder: {
            en: 'Select company size',
            fr: 'Sélectionnez la taille',
            es: 'Seleccione el tamaño'
          }
        },
        industry: {
          label: {
            en: 'Industry',
            fr: 'Secteur d\'activité',
            es: 'Sector'
          },
          placeholder: {
            en: 'Select industry',
            fr: 'Sélectionnez le secteur',
            es: 'Seleccione el sector'
          }
        },
        message: {
          label: {
            en: 'Message',
            fr: 'Message',
            es: 'Mensaje'
          },
          placeholder: {
            en: 'Tell us about your needs and requirements...',
            fr: 'Parlez-nous de vos besoins et exigences...',
            es: 'Cuéntenos sobre sus necesidades y requisitos...'
          }
        }
      },
      submitButton: {
        en: 'Send Message',
        fr: 'Envoyer le message',
        es: 'Enviar mensaje'
      },
      submittingButton: {
        en: 'Sending...',
        fr: 'Envoi en cours...',
        es: 'Enviando...'
      },
      successMessage: {
        en: 'Thank you! Our team will contact you within 24 hours.',
        fr: 'Merci ! Notre équipe vous contactera sous 24 heures.',
        es: '¡Gracias! Nuestro equipo le contactará en 24 horas.'
      }
    },
    companySizes: [
      {
        value: '1-10',
        label: {
          en: '1-10 employees',
          fr: '1-10 employés',
          es: '1-10 empleados'
        }
      },
      {
        value: '11-50',
        label: {
          en: '11-50 employees',
          fr: '11-50 employés',
          es: '11-50 empleados'
        }
      },
      {
        value: '51-200',
        label: {
          en: '51-200 employees',
          fr: '51-200 employés',
          es: '51-200 empleados'
        }
      },
      {
        value: '201-500',
        label: {
          en: '201-500 employees',
          fr: '201-500 employés',
          es: '201-500 empleados'
        }
      },
      {
        value: '501+',
        label: {
          en: '501+ employees',
          fr: '501+ employés',
          es: '501+ empleados'
        }
      }
    ],
    industries: [
      {
        value: 'technology',
        label: {
          en: 'Technology',
          fr: 'Technologie',
          es: 'Tecnología'
        }
      },
      {
        value: 'finance',
        label: {
          en: 'Finance',
          fr: 'Finance',
          es: 'Finanzas'
        }
      },
      {
        value: 'healthcare',
        label: {
          en: 'Healthcare',
          fr: 'Santé',
          es: 'Salud'
        }
      },
      {
        value: 'education',
        label: {
          en: 'Education',
          fr: 'Éducation',
          es: 'Educación'
        }
      },
      {
        value: 'manufacturing',
        label: {
          en: 'Manufacturing',
          fr: 'Fabrication',
          es: 'Manufactura'
        }
      },
      {
        value: 'retail',
        label: {
          en: 'Retail',
          fr: 'Commerce de détail',
          es: 'Comercio minorista'
        }
      },
      {
        value: 'construction',
        label: {
          en: 'Construction',
          fr: 'Construction',
          es: 'Construcción'
        }
      },
      {
        value: 'consulting',
        label: {
          en: 'Consulting',
          fr: 'Conseil',
          es: 'Consultoría'
        }
      },
      {
        value: 'ngo',
        label: {
          en: 'NGO / Non-profit',
          fr: 'ONG / Association',
          es: 'ONG / Sin fines de lucro'
        }
      },
      {
        value: 'other',
        label: {
          en: 'Other',
          fr: 'Autre',
          es: 'Otro'
        }
      }
    ]
  };
};

/**
 * Récupère un plan spécifique par son ID
 * TODO: Remplacer par un appel API au backoffice
 */
export const getPlanById = async (planId: string) => {
  const content = await getOffersHubContent();
  return content.plans.find(plan => plan.id === planId);
};