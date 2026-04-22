/**
 * Experts AI Matching Limitation Translations Patch
 * Complete translations for Experts AI Matching limitation system in 3 languages
 */

export const expertsMatchingLimitPatch = {
  en: {
    // Experts Matching Limit
    'expertsMatching.limit.available': 'Available Matchings',
    'expertsMatching.limit.button': 'Run AI Matching',
    'expertsMatching.limit.running': 'Analyzing...',
    'expertsMatching.limit.completed': 'Matching Completed',
    
    // Selection Requirements
    'expertsMatching.selection.title': 'Selection Required',
    'expertsMatching.selection.tor.label': 'Select ToR / Tender',
    'expertsMatching.selection.tor.placeholder': 'Choose a Terms of Reference or Tender',
    'expertsMatching.selection.tor.required': 'Please select a ToR or Tender before running the matching',
    'expertsMatching.selection.experts.label': 'Select Target Experts',
    'expertsMatching.selection.experts.placeholder': 'Search and select experts from database',
    'expertsMatching.selection.experts.required': 'Please select at least one expert before running the matching',
    'expertsMatching.selection.experts.selectAll': 'Select All',
    'expertsMatching.selection.experts.deselectAll': 'Deselect All',
    'expertsMatching.selection.experts.selected': 'expert(s) selected',
    'expertsMatching.selection.noTenders': 'No active tenders available',
    'expertsMatching.selection.noExperts': 'No experts available in database',
    
    // Alerts
    'expertsMatching.limit.reached.title': 'Matching Limit Reached',
    'expertsMatching.limit.reached.description': 'You have used all {max} AI matchings for this session. The limit will reset at the next session.',
    'expertsMatching.limit.warning.title': 'Last Matching Available',
    'expertsMatching.limit.warning.description': 'You have {remaining} matching remaining in this session. Use it wisely to find the best experts.',
    
    // Success Messages - ToR Matching
    'expertsMatching.success.tor.title': 'ToR Matching Completed Successfully',
    'expertsMatching.success.tor.description': 'Analysis completed! We found {count} experts matching your Terms of Reference.',
    'expertsMatching.success.tor.analyzing': 'Analyzing Terms of Reference...',
    'expertsMatching.success.tor.calculating': 'Calculating expert match scores...',
    'expertsMatching.success.tor.filtering': 'Filtering best expert matches...',
    
    // Success Messages - Organization Matching
    'expertsMatching.success.organization.title': 'Organization Matching Completed Successfully',
    'expertsMatching.success.organization.description': 'Analysis completed! We found {count} experts matching your organization profile.',
    'expertsMatching.success.organization.analyzing': 'Analyzing organization requirements...',
    'expertsMatching.success.organization.calculating': 'Calculating expert match scores...',
    'expertsMatching.success.organization.filtering': 'Filtering best expert matches...',
    
    // Info
    'expertsMatching.info.howItWorks': 'How does AI Matching work?',
    'expertsMatching.info.tor.description': 'Our AI analyzes your Terms of Reference and compares them with expert profiles to find the best matches for your project.',
    'expertsMatching.info.organization.description': 'Our AI analyzes your organization profile and matches it with qualified experts who align with your needs.',
    
    // No Matching Yet
    'expertsMatching.noMatching.title': 'Ready to Find the Perfect Expert?',
    'expertsMatching.noMatching.message': 'Click \"Run AI Matching\" to discover experts that perfectly match your requirements. Our AI will analyze profiles and provide you with the best candidates.',
  },
  
  fr: {
    // Experts Matching Limit
    'expertsMatching.limit.available': 'Matchings Disponibles',
    'expertsMatching.limit.button': 'Lancer le Matching IA',
    'expertsMatching.limit.running': 'Analyse en cours...',
    'expertsMatching.limit.completed': 'Matching Terminé',
    
    // Selection Requirements
    'expertsMatching.selection.title': 'Sélection Requise',
    'expertsMatching.selection.tor.label': 'Sélectionner ToR / Marché',
    'expertsMatching.selection.tor.placeholder': 'Choisissez un Termes de Référence ou un Marché',
    'expertsMatching.selection.tor.required': 'Veuillez sélectionner un ToR ou un Marché avant de lancer le matching',
    'expertsMatching.selection.experts.label': 'Sélectionner les Experts Cibles',
    'expertsMatching.selection.experts.placeholder': 'Recherchez et sélectionnez des experts dans la base de données',
    'expertsMatching.selection.experts.required': 'Veuillez sélectionner au moins un expert avant de lancer le matching',
    'expertsMatching.selection.experts.selectAll': 'Tout Sélectionner',
    'expertsMatching.selection.experts.deselectAll': 'Tout Désélectionner',
    'expertsMatching.selection.experts.selected': 'expert(s) sélectionné(s)',
    'expertsMatching.selection.noTenders': 'Aucun marché actif disponible',
    'expertsMatching.selection.noExperts': 'Aucun expert disponible dans la base de données',
    
    // Alerts
    'expertsMatching.limit.reached.title': 'Limite de Matching Atteinte',
    'expertsMatching.limit.reached.description': 'Vous avez utilisé les {max} matchings IA pour cette session. La limite sera réinitialisée à la prochaine session.',
    'expertsMatching.limit.warning.title': 'Dernier Matching Disponible',
    'expertsMatching.limit.warning.description': 'Il vous reste {remaining} matching dans cette session. Utilisez-le judicieusement pour trouver les meilleurs experts.',
    
    // Success Messages - ToR Matching
    'expertsMatching.success.tor.title': 'Matching ToR Terminé avec Succès',
    'expertsMatching.success.tor.description': 'Analyse terminée ! Nous avons trouvé {count} experts correspondant à vos Termes de Référence.',
    'expertsMatching.success.tor.analyzing': 'Analyse des Termes de Référence...',
    'expertsMatching.success.tor.calculating': 'Calcul des scores de correspondance des experts...',
    'expertsMatching.success.tor.filtering': 'Filtrage des meilleurs experts...',
    
    // Success Messages - Organization Matching
    'expertsMatching.success.organization.title': 'Matching Organisation Terminé avec Succès',
    'expertsMatching.success.organization.description': 'Analyse terminée ! Nous avons trouvé {count} experts correspondant au profil de votre organisation.',
    'expertsMatching.success.organization.analyzing': 'Analyse des besoins de l\'organisation...',
    'expertsMatching.success.organization.calculating': 'Calcul des scores de correspondance des experts...',
    'expertsMatching.success.organization.filtering': 'Filtrage des meilleurs experts...',
    
    // Info
    'expertsMatching.info.howItWorks': 'Comment fonctionne le Matching IA ?',
    'expertsMatching.info.tor.description': 'Notre IA analyse vos Termes de Référence et les compare avec les profils d\'experts pour trouver les meilleures correspondances pour votre projet.',
    'expertsMatching.info.organization.description': 'Notre IA analyse le profil de votre organisation et le compare avec des experts qualifiés qui correspondent à vos besoins.',
    
    // No Matching Yet
    'expertsMatching.noMatching.title': 'Prêt à Trouver l\'Expert Parfait ?',
    'expertsMatching.noMatching.message': 'Cliquez sur \"Lancer le Matching IA\" pour découvrir des experts qui correspondent parfaitement à vos besoins. Notre IA analysera les profils et vous proposera les meilleurs candidats.',
  },
  
  es: {
    // Experts Matching Limit
    'expertsMatching.limit.available': 'Matchings Disponibles',
    'expertsMatching.limit.button': 'Ejecutar Matching IA',
    'expertsMatching.limit.running': 'Analizando...',
    'expertsMatching.limit.completed': 'Matching Completado',
    
    // Selection Requirements
    'expertsMatching.selection.title': 'Selección Requerida',
    'expertsMatching.selection.tor.label': 'Seleccionar ToR / Licitación',
    'expertsMatching.selection.tor.placeholder': 'Elija un Término de Referencia o una Licitación',
    'expertsMatching.selection.tor.required': 'Por favor, seleccione un ToR o una Licitación antes de ejecutar el matching',
    'expertsMatching.selection.experts.label': 'Seleccionar Expertos Objetivo',
    'expertsMatching.selection.experts.placeholder': 'Busque y seleccione expertos en la base de datos',
    'expertsMatching.selection.experts.required': 'Por favor, seleccione al menos un experto antes de ejecutar el matching',
    'expertsMatching.selection.experts.selectAll': 'Seleccionar Todo',
    'expertsMatching.selection.experts.deselectAll': 'Deseleccionar Todo',
    'expertsMatching.selection.experts.selected': 'experto(s) seleccionado(s)',
    'expertsMatching.selection.noTenders': 'No hay licitaciones activas disponibles',
    'expertsMatching.selection.noExperts': 'No hay expertos disponibles en la base de datos',
    
    // Alerts
    'expertsMatching.limit.reached.title': 'Límite de Matching Alcanzado',
    'expertsMatching.limit.reached.description': 'Ha utilizado los {max} matchings IA para esta sesión. El límite se reiniciará en la próxima sesión.',
    'expertsMatching.limit.warning.title': 'Último Matching Disponible',
    'expertsMatching.limit.warning.description': 'Le queda {remaining} matching en esta sesión. Úselo sabiamente para encontrar los mejores expertos.',
    
    // Success Messages - ToR Matching
    'expertsMatching.success.tor.title': 'Matching TdR Completado con Éxito',
    'expertsMatching.success.tor.description': '¡Análisis completado! Encontramos {count} expertos que coinciden con sus Términos de Referencia.',
    'expertsMatching.success.tor.analyzing': 'Analizando Términos de Referencia...',
    'expertsMatching.success.tor.calculating': 'Calculando puntuaciones de coincidencia de expertos...',
    'expertsMatching.success.tor.filtering': 'Filtrando mejores expertos...',
    
    // Success Messages - Organization Matching
    'expertsMatching.success.organization.title': 'Matching de Organización Completado con Éxito',
    'expertsMatching.success.organization.description': '¡Análisis completado! Encontramos {count} expertos que coinciden con el perfil de su organización.',
    'expertsMatching.success.organization.analyzing': 'Analizando requisitos de la organización...',
    'expertsMatching.success.organization.calculating': 'Calculando puntuaciones de coincidencia de expertos...',
    'expertsMatching.success.organization.filtering': 'Filtrando mejores expertos...',
    
    // Info
    'expertsMatching.info.howItWorks': '¿Cómo funciona el Matching IA?',
    'expertsMatching.info.tor.description': 'Nuestra IA analiza sus Términos de Referencia y los compara con perfiles de expertos para encontrar las mejores coincidencias para su proyecto.',
    'expertsMatching.info.organization.description': 'Nuestra IA analiza el perfil de su organización y lo compara con expertos calificados que se alinean con sus necesidades.',
    
    // No Matching Yet
    'expertsMatching.noMatching.title': '¿Listo para Encontrar al Experto Perfecto?',
    'expertsMatching.noMatching.message': 'Haga clic en \"Ejecutar Matching IA\" para descubrir expertos que coincidan perfectamente con sus requisitos. Nuestra IA analizará los perfiles y le proporcionará los mejores candidatos.',
  },
};