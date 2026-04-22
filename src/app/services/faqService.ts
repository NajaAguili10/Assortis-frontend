/**
 * Service pour gérer les données FAQ
 * 
 * IMPORTANT: Ce service utilise actuellement des données mock.
 * Lors de l'intégration avec le backoffice, remplacer les fonctions mock
 * par des appels API vers votre backend.
 */

import { FAQContent } from '../types/faq.types';

/**
 * Récupère le contenu FAQ complet
 * TODO: Remplacer par un appel API au backoffice
 */
export const getFAQContent = async (): Promise<FAQContent> => {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 100));

  return {
    categories: [
      {
        id: 'getting-started',
        name: {
          en: 'Getting Started',
          fr: 'Commencer',
          es: 'Comenzar'
        },
        description: {
          en: 'Learn the basics about Assortis',
          fr: 'Découvrez les bases d\'Assortis',
          es: 'Aprenda los conceptos básicos de Assortis'
        },
        iconName: 'Rocket',
        displayOrder: 1,
        isActive: true
      },
      {
        id: 'subscription',
        name: {
          en: 'Subscription & Pricing',
          fr: 'Abonnement & Tarifs',
          es: 'Suscripción y Precios'
        },
        description: {
          en: 'Questions about plans and pricing',
          fr: 'Questions sur les formules et tarifs',
          es: 'Preguntas sobre planes y precios'
        },
        iconName: 'CreditCard',
        displayOrder: 2,
        isActive: true
      },
      {
        id: 'features',
        name: {
          en: 'Features & Services',
          fr: 'Fonctionnalités & Services',
          es: 'Características y Servicios'
        },
        description: {
          en: 'Explore Assortis features',
          fr: 'Découvrez les fonctionnalités d\'Assortis',
          es: 'Explore las características de Assortis'
        },
        iconName: 'Sparkles',
        displayOrder: 3,
        isActive: true
      },
      {
        id: 'account-management',
        name: {
          en: 'Account Management',
          fr: 'Gestion de compte',
          es: 'Gestión de cuenta'
        },
        description: {
          en: 'Manage your account settings',
          fr: 'Gérez les paramètres de votre compte',
          es: 'Administre la configuración de su cuenta'
        },
        iconName: 'Settings',
        displayOrder: 4,
        isActive: true
      }
    ],
    items: [
      // Getting Started
      {
        id: 'faq-1',
        question: {
          en: 'What are the benefits of joining Assortis?',
          fr: 'Quels sont les avantages à rejoindre Assortis ?',
          es: '¿Cuáles son los beneficios de unirse a Assortis?'
        },
        answer: {
          en: 'Assortis informs you in a timely manner and helps you manage projects (calls for tenders and grants) published by over 200 donors, which will save you considerable time and preserve the resources needed to monitor public procurement procedures.',
          fr: 'Assortis vous informe en temps voulu et vous aide à gérer les projets (appels d\'offres et subventions) publiés par +200 bailleurs, ce qui vous permettra d\'économiser un temps considérable et de conserver les ressources nécessaires au suivi des procédures de marché publics.',
          es: 'Assortis le informa oportunamente y le ayuda a gestionar proyectos (licitaciones y subvenciones) publicados por más de 200 donantes, lo que le ahorrará un tiempo considerable y preservará los recursos necesarios para monitorear los procedimientos de contratación pública.'
        },
        category: 'getting-started',
        displayOrder: 1,
        isActive: true,
        tags: ['benefits', 'advantages', 'donors', 'time-saving']
      },
      {
        id: 'faq-2',
        question: {
          en: 'How do I become a member?',
          fr: 'Comment devenir membre ?',
          es: '¿Cómo me convierto en miembro?'
        },
        answer: {
          en: 'Fill out the online form for a no-obligation quote or book a demo with us to better understand the advantages and benefits of joining Assortis. You can also register to post job openings to recruit technical experts for your projects.',
          fr: 'Remplissez le formulaire en ligne pour une demande de devis sans engagement ou réservez une démonstration avec nous afin de mieux comprendre les avantages et les bénéfices de l\'adhésion à Assortis. Vous pouvez également vous inscrire pour publier les postes vacants afin de recruter des experts techniques pour vos projets.',
          es: 'Complete el formulario en línea para obtener un presupuesto sin compromiso o reserve una demostración con nosotros para comprender mejor las ventajas y beneficios de unirse a Assortis. También puede registrarse para publicar vacantes de empleo para reclutar expertos técnicos para sus proyectos.'
        },
        category: 'getting-started',
        displayOrder: 2,
        isActive: true,
        tags: ['membership', 'registration', 'demo', 'quote']
      },
      
      // Subscription & Pricing
      {
        id: 'faq-3',
        question: {
          en: 'How long does it take for my subscription to be activated?',
          fr: 'Combien de temps faut-il pour que mon abonnement soit activé ?',
          es: '¿Cuánto tiempo tarda en activarse mi suscripción?'
        },
        answer: {
          en: 'Normally, subscriptions are activated when the invoice for your service is issued. Payments are due within 15 days from the invoice date.',
          fr: 'Normalement, les abonnements sont activés lors de l\'émission de la facture pour votre service. Les paiements sont dus dans les 15 jours à compter de la date de la facture.',
          es: 'Normalmente, las suscripciones se activan cuando se emite la factura de su servicio. Los pagos vencen dentro de los 15 días desde la fecha de la factura.'
        },
        category: 'subscription',
        displayOrder: 1,
        isActive: true,
        tags: ['activation', 'payment', 'invoice', 'timing']
      },
      {
        id: 'faq-4',
        question: {
          en: 'What should I do if I want to cancel my subscription?',
          fr: 'Que faire si je veux annuler mon abonnement ?',
          es: '¿Qué debo hacer si quiero cancelar mi suscripción?'
        },
        answer: {
          en: 'You can cancel your subscription by writing to info@assortis.com. The subscription period is one year (unless otherwise agreed with the sales manager), renewable by tacit agreement for each subsequent year if no cancellation notice is sent at least 3 months before the subscription expiration date.',
          fr: 'Vous pouvez annuler votre abonnement en écrivant à info@assortis.com. La période d\'abonnement est d\'un an (sauf accord contraire avec le responsable des ventes), renouvelable par tacite reconduction pour chaque année suivante si aucun préavis de résiliation est envoyé au moins 3 mois avant la date d\'expiration de l\'abonnement.',
          es: 'Puede cancelar su suscripción escribiendo a info@assortis.com. El período de suscripción es de un año (a menos que se acuerde lo contrario con el gerente de ventas), renovable por acuerdo tácito para cada año subsiguiente si no se envía un aviso de cancelación al menos 3 meses antes de la fecha de vencimiento de la suscripción.'
        },
        category: 'subscription',
        displayOrder: 2,
        isActive: true,
        tags: ['cancellation', 'termination', 'renewal']
      },
      {
        id: 'faq-5',
        question: {
          en: 'What is your pricing policy?',
          fr: 'Quelle est votre politique de prix ?',
          es: '¿Cuál es su política de precios?'
        },
        answer: {
          en: 'We offer subscriptions for individuals and business organizations on an annual basis. Our quotes are tailored to the specific needs of our members. That\'s why we ask you to fill out the online form for a no-obligation quote.',
          fr: 'Nous proposons des abonnements pour les organisations individuels et les organisation des entreprises sur une base annuelle. Nos devis sont adaptés en fonction des besoins spécifiques de nos membres. C\'est pourquoi nous vous demandons de remplir le formulaire en ligne pour une demande de devis sans engagement.',
          es: 'Ofrecemos suscripciones para individuos y organizaciones empresariales anualmente. Nuestras cotizaciones se adaptan a las necesidades específicas de nuestros miembros. Por eso le pedimos que complete el formulario en línea para obtener un presupuesto sin compromiso.'
        },
        category: 'subscription',
        displayOrder: 3,
        isActive: true,
        tags: ['pricing', 'quote', 'custom', 'annual']
      },
      {
        id: 'faq-6',
        question: {
          en: 'Are network subscriptions for businesses available?',
          fr: 'Des abonnements pour le reseau des entreprises sont-ils disponibles ?',
          es: '¿Están disponibles las suscripciones de red para empresas?'
        },
        answer: {
          en: 'We offer discounts for corporate offices worldwide. Contact info@assortis.com to learn more.',
          fr: 'Nous offrons des réductions pour les bureaux d\'entreprises du monde entier. Contactez info@assortis.com pour en savoir plus.',
          es: 'Ofrecemos descuentos para oficinas corporativas en todo el mundo. Contacte info@assortis.com para obtener más información.'
        },
        category: 'subscription',
        displayOrder: 4,
        isActive: true,
        tags: ['enterprise', 'network', 'discount', 'corporate']
      },
      
      // Features & Services
      {
        id: 'faq-7',
        question: {
          en: 'Do you organize introductory sessions for new users?',
          fr: 'Organisez-vous des séances d\'introduction pour les nouveaux utilisateurs ?',
          es: '¿Organizan sesiones introductorias para nuevos usuarios?'
        },
        answer: {
          en: 'By accessing your account via the "Login" dialog, you can visit our video tutorials page. We can also offer customized training on request, please contact your Assortis account manager or write to info@assortis.com.',
          fr: 'En accédant à votre compte via la boîte de dialogue "Connexion", vous pouvez visiter notre page de tutoriels vidéo. Nous pouvons également proposer des formations personnalisées sur demande, veuillez contacter votre responsable de compte Assortis ou écrire à info@assortis.com.',
          es: 'Al acceder a su cuenta a través del cuadro de diálogo "Iniciar sesión", puede visitar nuestra página de tutoriales en video. También podemos ofrecer capacitación personalizada bajo solicitud, comuníquese con su gerente de cuenta de Assortis o escriba a info@assortis.com.'
        },
        category: 'features',
        displayOrder: 1,
        isActive: true,
        tags: ['training', 'tutorials', 'onboarding', 'videos']
      },
      {
        id: 'faq-8',
        question: {
          en: 'Can Assortis help me find local partners in countries and sectors related to my business?',
          fr: 'Assortis peut-il m\'aider à rechercher des partenaires locaux dans les pays et les secteurs qui sont liés à mon activité commerciale ?',
          es: '¿Puede Assortis ayudarme a encontrar socios locales en países y sectores relacionados con mi negocio?'
        },
        answer: {
          en: 'By subscribing to the Daily Tender Alerts plan, you can access over 130,000 contact profiles of organizations you can do business with (their contracts, sectors, regions and donors, pricing policy).',
          fr: 'En vous abonnant au forfait des Alertes Quotidiennes aux appels d\'offres, vous pouvez accéder à plus de 130 000 profils de contact d\'organisations avec lesquelles vous pouvez faire des affaires (leurs contrats leurs secteurs, régions et donateurs, leur politique de prix).',
          es: 'Al suscribirse al plan de Alertas Diarias de Licitaciones, puede acceder a más de 130,000 perfiles de contacto de organizaciones con las que puede hacer negocios (sus contratos, sectores, regiones y donantes, política de precios).'
        },
        category: 'features',
        displayOrder: 2,
        isActive: true,
        tags: ['partners', 'networking', 'organizations', 'database']
      },
      {
        id: 'faq-9',
        question: {
          en: 'Can I access the reference list/list of awarded contracts of a potential partner?',
          fr: 'Puis-je accéder à la liste de référence/liste des contrats attribués d\'une partenaire potentielle ?',
          es: '¿Puedo acceder a la lista de referencia/lista de contratos adjudicados de un socio potencial?'
        },
        answer: {
          en: 'By subscribing to the Daily Tender Alerts plan, you can access over 130,000 contact profiles of organizations you can do business with (their contracts, sectors, regions and donors, pricing policy).',
          fr: 'En vous abonnant au forfait des Alertes Quotidiennes aux appels d\'offres, vous pouvez accéder à plus de 130 000 profils de contact d\'organisations avec lesquelles vous pouvez faire des affaires (leurs contrats leurs secteurs, régions et donateurs, leur politique de prix).',
          es: 'Al suscribirse al plan de Alertas Diarias de Licitaciones, puede acceder a más de 130,000 perfiles de contacto de organizaciones con las que puede hacer negocios (sus contratos, sectores, regiones y donantes, política de precios).'
        },
        category: 'features',
        displayOrder: 3,
        isActive: true,
        tags: ['contracts', 'references', 'awards', 'partners']
      },
      {
        id: 'faq-10',
        question: {
          en: 'Can I access the list of international and local experts who have worked in specific countries and sectors?',
          fr: 'Puis-je accéder à la liste des experts internationaux et locaux ayant travaillé dans des pays et secteurs spécifiques ?',
          es: '¿Puedo acceder a la lista de expertos internacionales y locales que han trabajado en países y sectores específicos?'
        },
        answer: {
          en: 'By registering for our expert database service, you can access profiles of over 13,000 international and local technical experts who can be engaged in your projects. Consultants registered in our database are selected for their international experience in development projects and our search engine combines over 15 criteria + free field search to ensure you find the right expertise for your needs.',
          fr: 'En vous inscrivant à notre service de base de données d\'experts, vous pouvez accéder aux profils de plus de 13 000 experts techniques internationaux et locaux qui peuvent êtres engagés dans vos projets. Les consultants inscrits dans notre base de données sont sélectionnés pour leur expérience internationale dans des projets de développement et notre moteur de recherche combine plus de 15 critères + une recherche en champ libre pour s\'assurer que vous trouvez l\'expertise qui convient à vos besoins.',
          es: 'Al registrarse en nuestro servicio de base de datos de expertos, puede acceder a perfiles de más de 13,000 expertos técnicos internacionales y locales que pueden participar en sus proyectos. Los consultores registrados en nuestra base de datos son seleccionados por su experiencia internacional en proyectos de desarrollo y nuestro motor de búsqueda combina más de 15 criterios + búsqueda de campo libre para asegurar que encuentre la experiencia adecuada para sus necesidades.'
        },
        category: 'features',
        displayOrder: 4,
        isActive: true,
        tags: ['experts', 'consultants', 'database', 'recruitment']
      },
      {
        id: 'faq-11',
        question: {
          en: 'Can I manage my project pipeline on Assortis?',
          fr: 'Puis-je gérer mon pipeline de projets sur Assortis ?',
          es: '¿Puedo gestionar mi cartera de proyectos en Assortis?'
        },
        answer: {
          en: 'With the Daily Tender Alerts plan subscription, you will have access to a project management tool that we have integrated into your Assortis account: this will allow you to personally track the project and share information with your colleagues.',
          fr: 'Avec l\'abonnement au forfait des Alertes Quotidiennes aux appels d\'offres, vous aurez accès à un outil de gestion de projet que nous avons intégré dans votre compte Assortis: cela vous permettra de faire un suivi personnel du projet et de le partager les info avec vos collègues.',
          es: 'Con la suscripción al plan de Alertas Diarias de Licitaciones, tendrá acceso a una herramienta de gestión de proyectos que hemos integrado en su cuenta de Assortis: esto le permitirá realizar un seguimiento personal del proyecto y compartir información con sus colegas.'
        },
        category: 'features',
        displayOrder: 5,
        isActive: true,
        tags: ['project-management', 'pipeline', 'tracking', 'collaboration']
      },
      {
        id: 'faq-12',
        question: {
          en: 'How does the expert database credit system work?',
          fr: 'Comment fonctionne le système de crédit de la base de données des experts ?',
          es: '¿Cómo funciona el sistema de crédito de la base de datos de expertos?'
        },
        answer: {
          en: 'By registering for our expert database service, you access the complete database of consultant profiles in "preview" to verify if the consultant\'s expertise matches your need. However, to access the expert\'s contact details and fully download the CV, you must have previously purchased some credits (where 1 credit corresponds to 1 downloaded CV). Please contact your Assortis account manager or write to info@assortis.com to purchase your CV credits or for more information.',
          fr: 'En vous inscrivant à notre service de base de données des experts, vous accédez à la base de données complète des profils des consultants en "prévisualisation", pour vérifier si l\'expertise du consultant correspond à votre besoin. Toutefois, pour pouvoir accéder aux coordonnées de l\'expert et télécharger intégralement le CV, vous devez avoir préalablement acheté quelques crédits (où 1 crédit correspond à 1 CV téléchargé). Veuillez contacter votre responsable de compte Assortis ou écrire à info@assortis.com pour acheter vos crédits Cv ou pour plusieurs renseignements.',
          es: 'Al registrarse en nuestro servicio de base de datos de expertos, accede a la base de datos completa de perfiles de consultores en "vista previa" para verificar si la experiencia del consultor coincide con su necesidad. Sin embargo, para acceder a los datos de contacto del experto y descargar completamente el CV, debe haber comprado previamente algunos créditos (donde 1 crédito corresponde a 1 CV descargado). Comuníquese con su gerente de cuenta de Assortis o escriba a info@assortis.com para comprar sus créditos de CV o para obtener más información.'
        },
        category: 'features',
        displayOrder: 6,
        isActive: true,
        tags: ['credits', 'cv', 'download', 'experts']
      },
      {
        id: 'faq-13',
        question: {
          en: 'Will Assortis provide me with suggestions for local and international technical partners regarding a specific tender?',
          fr: 'Assortis me fournira-t-il des suggestions de partenaires techniques locaux et internationaux concernant un appel d\'offre specifique?',
          es: '¿Me proporcionará Assortis sugerencias de socios técnicos locales e internacionales con respecto a una licitación específica?'
        },
        answer: {
          en: 'By subscribing to the Daily Tender Alerts plan, you will have access to our market analysis presenting the top 5 international companies and 2 local companies that have similar experience in the project country that interests you.',
          fr: 'En vous abonnant au forfait des Alertes Quotidiennes aux appels d\'offres, vous aurez accès à notre analyse de marché présentant les 5 premières entreprises internationales et 2 entreprises locales qui ont une expérience similaire dans le pays du projet qui vous intéresse.',
          es: 'Al suscribirse al plan de Alertas Diarias de Licitaciones, tendrá acceso a nuestro análisis de mercado que presenta las 5 principales empresas internacionales y 2 empresas locales que tienen experiencia similar en el país del proyecto que le interesa.'
        },
        category: 'features',
        displayOrder: 7,
        isActive: true,
        tags: ['market-analysis', 'partners', 'suggestions', 'tenders']
      },
      {
        id: 'faq-14',
        question: {
          en: 'Can I find out if my organization has worked with a specific organization in the past?',
          fr: 'Puis-je savoir si mon organisation a déjà travaillé avec une organisation spécifique dans le passé ?',
          es: '¿Puedo saber si mi organización ha trabajado con una organización específica en el pasado?'
        },
        answer: {
          en: 'By subscribing to the Daily Tender Alerts plan, you access our Organization database where you can verify the experience of companies that have won contracts and get information about their successful partnerships.',
          fr: 'En vous abonnant au forfait des Alertes Quotidiennes aux appels d\'offres, vous accédez à notre base de données Organisation où vous pouvez vérifier l\'expérience des entreprises qui ont gagné de contrats et obtenir des informations sur leurs partenariats réussis.',
          es: 'Al suscribirse al plan de Alertas Diarias de Licitaciones, accede a nuestra base de datos de Organizaciones donde puede verificar la experiencia de las empresas que han ganado contratos y obtener información sobre sus asociaciones exitosas.'
        },
        category: 'features',
        displayOrder: 8,
        isActive: true,
        tags: ['organizations', 'partnerships', 'history', 'contracts']
      },
      {
        id: 'faq-15',
        question: {
          en: 'Can I post job openings for a specific project? Even at the tender stage?',
          fr: 'Puis-je publier des offres d\'emploi pour un projet spécifique ? Même au stade de l\'appel d\'offres ?',
          es: '¿Puedo publicar ofertas de empleo para un proyecto específico? ¿Incluso en la etapa de licitación?'
        },
        answer: {
          en: 'We offer a free service to post job openings for short or long-term missions for specific projects. Sign up now and start posting your job openings.',
          fr: 'Nous offrons un service gratuit pour afficher les postes vacants pour des missions de courte ou de longue durée dans le cadre de projets spécifiques. Inscrivez vous dès maintenant et commencez à publier vos postes vacants.',
          es: 'Ofrecemos un servicio gratuito para publicar ofertas de empleo para misiones a corto o largo plazo para proyectos específicos. Regístrese ahora y comience a publicar sus ofertas de empleo.'
        },
        category: 'features',
        displayOrder: 9,
        isActive: true,
        tags: ['job-posting', 'recruitment', 'vacancies', 'free']
      },
      {
        id: 'faq-16',
        question: {
          en: 'How long is a job posting published?',
          fr: 'Quelle est la durée de publication d\'un poste vacant ?',
          es: '¿Cuánto tiempo se publica una oferta de empleo?'
        },
        answer: {
          en: 'The job posting you create will be published publicly online on our job board and will remain online until the expiration date you indicate, with a maximum period of 2 years.',
          fr: 'Le poste vacant que vous créerez sera publié publiquement en ligne sur notre tableau d\'affichage des offres d\'emploi et il sera en ligne jusqu\'à la date de validité que vous indiquerez, avec un délai de maximum 2 ans.',
          es: 'La oferta de empleo que cree se publicará públicamente en línea en nuestra bolsa de trabajo y permanecerá en línea hasta la fecha de vencimiento que indique, con un período máximo de 2 años.'
        },
        category: 'features',
        displayOrder: 10,
        isActive: true,
        tags: ['job-posting', 'duration', 'publication', 'expiration']
      },
      {
        id: 'faq-17',
        question: {
          en: 'Will Assortis provide me with suggestions for the best international and local experts for a specific project?',
          fr: 'Assortis me Fourn ira-t-il des suggestions des meilleurs experts internationaux et locaux pour un projet spécifique?',
          es: '¿Me proporcionará Assortis sugerencias de los mejores expertos internacionales y locales para un proyecto específico?'
        },
        answer: {
          en: 'By registering for our free job posting service, you will be suggested the top 5 most relevant international and local experts whose CV has been registered on the Assortis network.',
          fr: 'En vous inscrivant à notre service gratuit de publication des postes vacants, vous serez suggéré les top 5 experts internationaux et locaux les plus pertinents dont le CV a été enregistré sur le réseau d\'Assortis.',
          es: 'Al registrarse en nuestro servicio gratuito de publicación de empleos, se le sugerirán los 5 expertos internacionales y locales más relevantes cuyo CV ha sido registrado en la red de Assortis.'
        },
        category: 'features',
        displayOrder: 11,
        isActive: true,
        tags: ['expert-suggestions', 'matching', 'ai', 'recruitment']
      },
      {
        id: 'faq-18',
        question: {
          en: 'Can I manage the list of potential candidates I have for my tenders?',
          fr: 'Puis-je gérer la liste de candidats potentiels dont je dispose pour mes appels d\'offres ?',
          es: '¿Puedo gestionar la lista de candidatos potenciales que tengo para mis licitaciones?'
        },
        answer: {
          en: 'By registering for the expert database service and/or our free job posting service, you can store all CVs you receive or find by searching the expert database. You can mark the candidate with different degrees of interest and update your relationship with the expert.',
          fr: 'En vous inscrivant au service de la base de données des experts et/ou à notre service gratuit de publication des postes vacants, vous pouvez stocker tous les CV que vous recevez ou que vous trouvez en effectuant des recherches dans la base de données des experts. Vous pouvez marquer le candidat avec différents degrés d\'intérêt et mettre à jour votre relation avec l\'expert.',
          es: 'Al registrarse en el servicio de base de datos de expertos y/o nuestro servicio gratuito de publicación de empleos, puede almacenar todos los CV que recibe o encuentra al buscar en la base de datos de expertos. Puede marcar al candidato con diferentes grados de interés y actualizar su relación con el experto.'
        },
        category: 'features',
        displayOrder: 12,
        isActive: true,
        tags: ['candidate-management', 'cv-storage', 'tracking', 'crm']
      },
      {
        id: 'faq-19',
        question: {
          en: 'Can Assortis integrate with my company\'s CRM?',
          fr: 'Assortis peut-il établir un lien avec le CRM de mon entreprise ?',
          es: '¿Puede Assortis integrarse con el CRM de mi empresa?'
        },
        answer: {
          en: 'Assortis offers you the possibility to customize its service with integration into the CRM system used by a member company. Please contact your Assortis account manager or write to info@assortis.com for more information.',
          fr: 'Assortis vous offre la possibilité de personnaliser son service avec l\'intégration dans le système CRM utilisé par une entreprise membre. Veuillez contacter votre responsable de compte Assortis ou écrire à info@assortis.com pour plusieurs renseignements.',
          es: 'Assortis le ofrece la posibilidad de personalizar su servicio con integración en el sistema CRM utilizado por una empresa miembro. Comuníquese con su gerente de cuenta de Assortis o escriba a info@assortis.com para obtener más información.'
        },
        category: 'features',
        displayOrder: 13,
        isActive: true,
        tags: ['crm', 'integration', 'api', 'customization']
      },
      
      // Account Management
      {
        id: 'faq-20',
        question: {
          en: 'Can I share my account?',
          fr: 'Puis-je partager mon compte ?',
          es: '¿Puedo compartir mi cuenta?'
        },
        answer: {
          en: 'Access and use rights to Assortis services are exclusive and non-transferable. Your individual account cannot be shared or used by more than one person.',
          fr: 'Les droits d\'accès et d\'utilisation des services assortis sont des droits exclusifs et non transférables. Votre compte individuel ne peut être partagé ou utilisé par plus d\'une personne.',
          es: 'Los derechos de acceso y uso de los servicios de Assortis son exclusivos e intransferibles. Su cuenta individual no puede ser compartida ni utilizada por más de una persona.'
        },
        category: 'account-management',
        displayOrder: 1,
        isActive: true,
        tags: ['account', 'sharing', 'terms', 'restrictions']
      },
      {
        id: 'faq-21',
        question: {
          en: 'How can I modify my email alert settings?',
          fr: 'Comment puis-je modifier les paramètres de mes alertes email ?',
          es: '¿Cómo puedo modificar la configuración de mis alertas por correo electrónico?'
        },
        answer: {
          en: 'As an organization account user, you can manage your email alerts by accessing your account via the "Login" dialog. In the "My Profile" section, you will find the "Edit my DTA preferences" option. Please note that your organization\'s user administrator can also manage your email preferences.',
          fr: 'En tant qu\'utilisateur d\'un compte d\'organisation, vous pouvez gérer vos alertes e-mail en accédant à votre compte via la boîte de dialogue "Se connecter". Dans la section "Mon profil", vous trouverez l\'option "Modifier mes préférences DTA". Veuillez noter que l\'administrateur des utilisateurs de votre organisation peut également gérer vos préférences en matière de courrier électronique.',
          es: 'Como usuario de una cuenta de organización, puede administrar sus alertas de correo electrónico accediendo a su cuenta a través del cuadro de diálogo "Iniciar sesión". En la sección "Mi perfil", encontrará la opción "Editar mis preferencias DTA". Tenga en cuenta que el administrador de usuarios de su organización también puede administrar sus preferencias de correo electrónico.'
        },
        category: 'account-management',
        displayOrder: 2,
        isActive: true,
        tags: ['email', 'alerts', 'notifications', 'preferences', 'settings']
      }
    ],
    settings: {
      enableSearch: true,
      enableCategories: true,
      itemsPerPage: 20
    }
  };
};

/**
 * Recherche dans les FAQ
 * @param query - Terme de recherche
 * @param language - Langue de recherche
 */
export const searchFAQ = async (query: string, language: 'en' | 'fr' | 'es') => {
  const content = await getFAQContent();
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) {
    return content.items.filter(item => item.isActive);
  }
  
  return content.items
    .filter(item => item.isActive)
    .filter(item => {
      const question = item.question[language].toLowerCase();
      const answer = item.answer[language].toLowerCase();
      const tags = (item.tags || []).join(' ').toLowerCase();
      
      return question.includes(searchTerm) || 
             answer.includes(searchTerm) || 
             tags.includes(searchTerm);
    });
};
