/**
 * Traductions pour le module AssortisBot (Chatbot AI)
 * Support multilingue : Français (FR), English (EN), Español (ES)
 */

export const chatbotTranslations = {
  fr: {
    // Widget
    'chatbot.widget.tooltip': 'Ouvrir AssortisBot',
    'chatbot.widget.newMessage': 'Nouveau message',
    
    // Header
    'chatbot.header.title': 'AssortisBot',
    'chatbot.header.subtitle': 'Assistant AI',
    'chatbot.header.online': 'En ligne',
    'chatbot.header.close': 'Fermer',
    'chatbot.header.minimize': 'Réduire',
    
    // Welcome Message
    'chatbot.welcome.greeting': 'Bonjour, je suis AssortisBot 👋',
    'chatbot.welcome.message': 'Je peux vous aider à naviguer dans la plateforme Assortis et répondre à vos questions.',
    'chatbot.welcome.authenticated': 'Bonjour {name}, comment puis-je vous aider aujourd\'hui ?',
    'chatbot.welcome.guest': 'Bienvenue ! Je peux répondre à vos questions sur Assortis. Connectez-vous pour accéder à plus de fonctionnalités.',
    
    // Quick Suggestions
    'chatbot.suggestions.title': 'Questions fréquentes',
    'chatbot.suggestions.createAccount': 'Comment créer un compte ?',
    'chatbot.suggestions.joinOrganization': 'Comment rejoindre une organisation ?',
    'chatbot.suggestions.becomeExpert': 'Comment devenir expert ?',
    'chatbot.suggestions.publishRequest': 'Comment publier une demande ?',
    'chatbot.suggestions.findTenders': 'Comment trouver des appels d\'offres ?',
    'chatbot.suggestions.manageProfile': 'Comment gérer mon profil ?',
    'chatbot.suggestions.subscription': 'Comment changer mon abonnement ?',
    'chatbot.suggestions.support': 'Comment contacter le support ?',
    
    // Input
    'chatbot.input.placeholder': 'Posez votre question...',
    'chatbot.input.send': 'Envoyer',
    'chatbot.input.sending': 'Envoi...',
    
    // States
    'chatbot.state.typing': 'AssortisBot écrit',
    'chatbot.state.thinking': 'Réflexion en cours',
    'chatbot.state.error': 'Une erreur est survenue',
    'chatbot.state.offline': 'Hors ligne',
    'chatbot.state.reconnecting': 'Reconnexion...',
    
    // Messages
    'chatbot.message.timestamp': 'Il y a {time}',
    'chatbot.message.retry': 'Réessayer',
    'chatbot.message.copy': 'Copier',
    'chatbot.message.copied': 'Copié !',
    
    // Errors
    'chatbot.error.generic': 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
    'chatbot.error.network': 'Problème de connexion. Vérifiez votre connexion internet.',
    'chatbot.error.rateLimit': 'Trop de requêtes. Veuillez patienter un moment.',
    'chatbot.error.unauthorized': 'Vous devez être connecté pour effectuer cette action.',
    
    // Actions
    'chatbot.action.goToProfile': 'Aller à mon profil',
    'chatbot.action.createOrganization': 'Créer une organisation',
    'chatbot.action.viewInvitations': 'Voir mes invitations',
    'chatbot.action.browseTenders': 'Parcourir les appels d\'offres',
    'chatbot.action.login': 'Se connecter',
    'chatbot.action.signup': 'Créer un compte',
    
    // Responses (Examples for mock)
    'chatbot.response.createAccount': 'Pour créer un compte sur Assortis :\n1. Cliquez sur "Créer un compte" en haut à droite\n2. Choisissez votre type de compte (Expert, Organisation, etc.)\n3. Remplissez le formulaire d\'inscription\n4. Validez votre email\n5. Complétez votre profil',
    'chatbot.response.joinOrganization': 'Pour rejoindre une organisation :\n1. Allez dans la section "Organisations"\n2. Recherchez l\'organisation souhaitée\n3. Cliquez sur "Demander à rejoindre"\n4. Attendez la validation de l\'administrateur',
    'chatbot.response.becomeExpert': 'Pour devenir expert sur Assortis :\n1. Créez un compte de type "Expert"\n2. Complétez votre profil professionnel\n3. Ajoutez vos compétences et expériences\n4. Téléchargez votre CV\n5. Obtenez des certifications pour augmenter votre visibilité',
    'chatbot.response.publishRequest': 'Pour publier une demande :\n1. Connectez-vous à votre compte\n2. Allez dans "Mon Espace"\n3. Cliquez sur "Publier une offre"\n4. Remplissez les informations requises\n5. Validez et publiez',
    'chatbot.response.guestLimited': 'Pour accéder à cette fonctionnalité, vous devez créer un compte ou vous connecter. Souhaitez-vous vous connecter maintenant ?',
    'chatbot.response.profileInfo': 'Votre profil contient vos informations personnelles, vos compétences et votre historique. Vous pouvez le modifier à tout moment.',
    'chatbot.response.tendersInfo': 'Les appels d\'offres sont disponibles dans la section "Appels d\'offres". Vous pouvez filtrer par secteur, date limite et montant.',
    'chatbot.response.fallback': 'Je suis là pour vous aider ! Voici quelques sujets sur lesquels je peux vous renseigner :\n\n• Créer et gérer votre compte\n• Rejoindre ou créer une organisation\n• Publier des offres et demandes\n• Naviguer dans la plateforme\n• Gérer vos abonnements\n\nPosez-moi une question spécifique !',
  },
  en: {
    // Widget
    'chatbot.widget.tooltip': 'Open AssortisBot',
    'chatbot.widget.newMessage': 'New message',
    
    // Header
    'chatbot.header.title': 'AssortisBot',
    'chatbot.header.subtitle': 'AI Assistant',
    'chatbot.header.online': 'Online',
    'chatbot.header.close': 'Close',
    'chatbot.header.minimize': 'Minimize',
    
    // Welcome Message
    'chatbot.welcome.greeting': 'Hello, I\'m AssortisBot 👋',
    'chatbot.welcome.message': 'I can help you navigate the Assortis platform and answer your questions.',
    'chatbot.welcome.authenticated': 'Hello {name}, how can I help you today?',
    'chatbot.welcome.guest': 'Welcome! I can answer your questions about Assortis. Log in to access more features.',
    
    // Quick Suggestions
    'chatbot.suggestions.title': 'Frequently Asked Questions',
    'chatbot.suggestions.createAccount': 'How to create an account?',
    'chatbot.suggestions.joinOrganization': 'How to join an organization?',
    'chatbot.suggestions.becomeExpert': 'How to become an expert?',
    'chatbot.suggestions.publishRequest': 'How to publish a request?',
    'chatbot.suggestions.findTenders': 'How to find tenders?',
    'chatbot.suggestions.manageProfile': 'How to manage my profile?',
    'chatbot.suggestions.subscription': 'How to change my subscription?',
    'chatbot.suggestions.support': 'How to contact support?',
    
    // Input
    'chatbot.input.placeholder': 'Ask your question...',
    'chatbot.input.send': 'Send',
    'chatbot.input.sending': 'Sending...',
    
    // States
    'chatbot.state.typing': 'AssortisBot is typing',
    'chatbot.state.thinking': 'Thinking',
    'chatbot.state.error': 'An error occurred',
    'chatbot.state.offline': 'Offline',
    'chatbot.state.reconnecting': 'Reconnecting...',
    
    // Messages
    'chatbot.message.timestamp': '{time} ago',
    'chatbot.message.retry': 'Retry',
    'chatbot.message.copy': 'Copy',
    'chatbot.message.copied': 'Copied!',
    
    // Errors
    'chatbot.error.generic': 'Sorry, an error occurred. Please try again.',
    'chatbot.error.network': 'Connection problem. Check your internet connection.',
    'chatbot.error.rateLimit': 'Too many requests. Please wait a moment.',
    'chatbot.error.unauthorized': 'You must be logged in to perform this action.',
    
    // Actions
    'chatbot.action.goToProfile': 'Go to my profile',
    'chatbot.action.createOrganization': 'Create an organization',
    'chatbot.action.viewInvitations': 'View my invitations',
    'chatbot.action.browseTenders': 'Browse tenders',
    'chatbot.action.login': 'Log in',
    'chatbot.action.signup': 'Sign up',
    
    // Responses (Examples for mock)
    'chatbot.response.createAccount': 'To create an account on Assortis:\n1. Click "Sign up" in the top right\n2. Choose your account type (Expert, Organization, etc.)\n3. Fill in the registration form\n4. Validate your email\n5. Complete your profile',
    'chatbot.response.joinOrganization': 'To join an organization:\n1. Go to the "Organizations" section\n2. Search for the desired organization\n3. Click "Request to join"\n4. Wait for administrator validation',
    'chatbot.response.becomeExpert': 'To become an expert on Assortis:\n1. Create an "Expert" account\n2. Complete your professional profile\n3. Add your skills and experience\n4. Upload your CV\n5. Get certifications to increase your visibility',
    'chatbot.response.publishRequest': 'To publish a request:\n1. Log in to your account\n2. Go to "My Space"\n3. Click "Publish an offer"\n4. Fill in the required information\n5. Validate and publish',
    'chatbot.response.guestLimited': 'To access this feature, you need to create an account or log in. Would you like to log in now?',
    'chatbot.response.profileInfo': 'Your profile contains your personal information, skills, and history. You can modify it at any time.',
    'chatbot.response.tendersInfo': 'Tenders are available in the "Tenders" section. You can filter by sector, deadline, and amount.',
    'chatbot.response.fallback': 'I\'m here to help! Here are some topics I can inform you about:\n\n• Create and manage your account\n• Join or create an organization\n• Publish offers and requests\n• Navigate the platform\n• Manage your subscriptions\n\nAsk me a specific question!',
  },
  es: {
    // Widget
    'chatbot.widget.tooltip': 'Abrir AssortisBot',
    'chatbot.widget.newMessage': 'Nuevo mensaje',
    
    // Header
    'chatbot.header.title': 'AssortisBot',
    'chatbot.header.subtitle': 'Asistente AI',
    'chatbot.header.online': 'En línea',
    'chatbot.header.close': 'Cerrar',
    'chatbot.header.minimize': 'Minimizar',
    
    // Welcome Message
    'chatbot.welcome.greeting': 'Hola, soy AssortisBot 👋',
    'chatbot.welcome.message': 'Puedo ayudarte a navegar por la plataforma Assortis y responder a tus preguntas.',
    'chatbot.welcome.authenticated': 'Hola {name}, ¿cómo puedo ayudarte hoy?',
    'chatbot.welcome.guest': '¡Bienvenido! Puedo responder a tus preguntas sobre Assortis. Inicia sesión para acceder a más funciones.',
    
    // Quick Suggestions
    'chatbot.suggestions.title': 'Preguntas Frecuentes',
    'chatbot.suggestions.createAccount': '¿Cómo crear una cuenta?',
    'chatbot.suggestions.joinOrganization': '¿Cómo unirse a una organización?',
    'chatbot.suggestions.becomeExpert': '¿Cómo convertirse en experto?',
    'chatbot.suggestions.publishRequest': '¿Cómo publicar una solicitud?',
    'chatbot.suggestions.findTenders': '¿Cómo encontrar licitaciones?',
    'chatbot.suggestions.manageProfile': '¿Cómo gestionar mi perfil?',
    'chatbot.suggestions.subscription': '¿Cómo cambiar mi suscripción?',
    'chatbot.suggestions.support': '¿Cómo contactar soporte?',
    
    // Input
    'chatbot.input.placeholder': 'Haz tu pregunta...',
    'chatbot.input.send': 'Enviar',
    'chatbot.input.sending': 'Enviando...',
    
    // States
    'chatbot.state.typing': 'AssortisBot está escribiendo',
    'chatbot.state.thinking': 'Pensando',
    'chatbot.state.error': 'Ocurrió un error',
    'chatbot.state.offline': 'Desconectado',
    'chatbot.state.reconnecting': 'Reconectando...',
    
    // Messages
    'chatbot.message.timestamp': 'Hace {time}',
    'chatbot.message.retry': 'Reintentar',
    'chatbot.message.copy': 'Copiar',
    'chatbot.message.copied': '¡Copiado!',
    
    // Errors
    'chatbot.error.generic': 'Lo siento, ocurrió un error. Por favor, inténtalo de nuevo.',
    'chatbot.error.network': 'Problema de conexión. Verifica tu conexión a internet.',
    'chatbot.error.rateLimit': 'Demasiadas solicitudes. Por favor, espera un momento.',
    'chatbot.error.unauthorized': 'Debes iniciar sesión para realizar esta acción.',
    
    // Actions
    'chatbot.action.goToProfile': 'Ir a mi perfil',
    'chatbot.action.createOrganization': 'Crear una organización',
    'chatbot.action.viewInvitations': 'Ver mis invitaciones',
    'chatbot.action.browseTenders': 'Explorar licitaciones',
    'chatbot.action.login': 'Iniciar sesión',
    'chatbot.action.signup': 'Crear cuenta',
    
    // Responses (Examples for mock)
    'chatbot.response.createAccount': 'Para crear una cuenta en Assortis:\n1. Haz clic en "Crear cuenta" en la esquina superior derecha\n2. Elige tu tipo de cuenta (Experto, Organización, etc.)\n3. Completa el formulario de registro\n4. Valida tu correo electrónico\n5. Completa tu perfil',
    'chatbot.response.joinOrganization': 'Para unirse a una organización:\n1. Ve a la sección "Organizaciones"\n2. Busca la organización deseada\n3. Haz clic en "Solicitar unirse"\n4. Espera la validación del administrador',
    'chatbot.response.becomeExpert': 'Para convertirse en experto en Assortis:\n1. Crea una cuenta de tipo "Experto"\n2. Completa tu perfil profesional\n3. Agrega tus habilidades y experiencia\n4. Sube tu CV\n5. Obtén certificaciones para aumentar tu visibilidad',
    'chatbot.response.publishRequest': 'Para publicar una solicitud:\n1. Inicia sesión en tu cuenta\n2. Ve a "Mi Espacio"\n3. Haz clic en "Publicar una oferta"\n4. Completa la información requerida\n5. Valida y publica',
    'chatbot.response.guestLimited': 'Para acceder a esta función, debes crear una cuenta o iniciar sesión. ¿Te gustaría iniciar sesión ahora?',
    'chatbot.response.profileInfo': 'Tu perfil contiene tu información personal, habilidades y historial. Puedes modificarlo en cualquier momento.',
    'chatbot.response.tendersInfo': 'Las licitaciones están disponibles en la sección "Licitaciones". Puedes filtrar por sector, fecha límite y monto.',
    'chatbot.response.fallback': '¡Estoy aquí para ayudarte! Aquí hay algunos temas sobre los que puedo informarte:\n\n• Crear y gestionar tu cuenta\n• Unirte o crear una organización\n• Publicar ofertas y solicitudes\n• Navegar por la plataforma\n• Gestionar tus suscripciones\n\n¡Hazme una pregunta específica!',
  },
};