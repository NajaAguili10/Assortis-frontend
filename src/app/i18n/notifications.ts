export const notificationsTranslations = {
  en: {
    // Notification Panel
    'notifications.title': 'Notifications',
    'notifications.empty': 'No notifications',
    'notifications.emptyMessage': 'You\'re all caught up!',
    'notifications.markAllRead': 'Mark all as read',
    'notifications.viewAll': 'View all notifications',
    'notifications.unread': '{count} unread',
    'notifications.delete': 'Delete',
    'notifications.archive': 'Archive',
    'notifications.settings': 'Notification settings',
    
    // Notification Types
    'notifications.type.TENDER': 'Tender',
    'notifications.type.INVITATION': 'Invitation',
    'notifications.type.SUBMISSION': 'Submission',
    'notifications.type.SUCCESS': 'Success',
    'notifications.type.ALERT': 'Alert',
    'notifications.type.MESSAGE': 'Message',
    'notifications.type.PARTNERSHIP': 'Partnership',
    'notifications.type.TEAM': 'Team',
    'notifications.type.SYSTEM': 'System',
    
    // Notification Priority
    'notifications.priority.LOW': 'Low',
    'notifications.priority.MEDIUM': 'Medium',
    'notifications.priority.HIGH': 'High',
    'notifications.priority.URGENT': 'Urgent',
    
    // Notification Messages - Tenders
    'notifications.tender.new.title': 'New tender',
    'notifications.tender.new.message': 'A new tender matches your profile',
    'notifications.tender.match.title': 'Tender match',
    'notifications.tender.match.message': 'Tender "{title}" matches your expertise',
    'notifications.tender.deadline.title': 'Deadline approaching',
    'notifications.tender.deadline.message': 'Tender "{title}" closes in {days} days',
    'notifications.tender.urgent.title': 'Urgent deadline',
    'notifications.tender.urgent.message': 'Tender "{title}" closes in 24 hours',
    'notifications.tender.awarded.title': 'Tender awarded',
    'notifications.tender.awarded.message': 'Congratulations! You won tender "{title}"',
    
    // Notification Messages - Invitations
    'notifications.invitation.received.title': 'Invitation received',
    'notifications.invitation.received.message': '{organization} invites you to join their consortium',
    'notifications.invitation.accepted.title': 'Invitation accepted',
    'notifications.invitation.accepted.message': '{organization} accepted your invitation',
    'notifications.invitation.declined.title': 'Invitation declined',
    'notifications.invitation.declined.message': '{organization} declined your invitation',
    'notifications.invitation.pending.title': 'Pending invitation',
    'notifications.invitation.pending.message': 'Your invitation to {organization} is pending review',
    
    // Notification Messages - Submissions
    'notifications.submission.submitted.title': 'Submission sent',
    'notifications.submission.submitted.message': 'Your application for "{title}" has been submitted',
    'notifications.submission.validated.title': 'Submission validated',
    'notifications.submission.validated.message': 'Your application for "{title}" has been accepted',
    'notifications.submission.rejected.title': 'Submission rejected',
    'notifications.submission.rejected.message': 'Your application for "{title}" was not retained',
    'notifications.submission.shortlisted.title': 'Shortlisted',
    'notifications.submission.shortlisted.message': 'You\'ve been shortlisted for "{title}"',
    
    // Notification Messages - Success
    'notifications.success.profile.title': 'Profile updated',
    'notifications.success.profile.message': 'Your profile has been successfully updated',
    'notifications.success.verification.title': 'Organization verified',
    'notifications.success.verification.message': 'Your organization has been verified',
    'notifications.success.payment.title': 'Payment received',
    'notifications.success.payment.message': 'Your payment has been processed successfully',
    
    // Notification Messages - Partnerships
    'notifications.partnership.new.title': 'New partnership',
    'notifications.partnership.new.message': 'Partnership established with {organization}',
    'notifications.partnership.request.title': 'Partnership request',
    'notifications.partnership.request.message': '{organization} wants to partner with you',
    'notifications.partnership.ended.title': 'Partnership ended',
    'notifications.partnership.ended.message': 'Partnership with {organization} has ended',
    
    // Notification Messages - Team
    'notifications.team.member.title': 'New team member',
    'notifications.team.member.message': '{name} joined your team',
    'notifications.team.invite.title': 'Team invitation sent',
    'notifications.team.invite.message': 'Invitation sent to {name} ({email}) as {role}',
    'notifications.team.removed.title': 'Member removed',
    'notifications.team.removed.message': '{name} has been removed from the team',
    'notifications.team.role.title': 'Role updated',
    'notifications.team.role.message': 'Your role has been updated to {role}',
    
    // Notification Messages - System
    'notifications.system.maintenance.title': 'Scheduled maintenance',
    'notifications.system.maintenance.message': 'System maintenance scheduled for {date}',
    'notifications.system.update.title': 'System update',
    'notifications.system.update.message': 'New features available! Check out what\'s new',
    'notifications.system.security.title': 'Security alert',
    'notifications.system.security.message': 'Unusual activity detected on your account',
    
    // Time Formats
    'notifications.time.now': 'Just now',
    'notifications.time.minutes': '{count} minutes ago',
    'notifications.time.hour': '1 hour ago',
    'notifications.time.hours': '{count} hours ago',
    'notifications.time.yesterday': 'Yesterday',
    'notifications.time.days': '{count} days ago',
    'notifications.time.week': '1 week ago',
    'notifications.time.weeks': '{count} weeks ago',
    'notifications.time.month': '1 month ago',
    'notifications.time.months': '{count} months ago',
    
    // Actions
    'notifications.action.view': 'View',
    'notifications.action.respond': 'Respond',
    'notifications.action.accept': 'Accept',
    'notifications.action.decline': 'Decline',
    'notifications.action.apply': 'Apply now',
    'notifications.action.review': 'Review',
    'notifications.action.dismiss': 'Dismiss',
    'notifications.action.reply': 'Reply',
    'notifications.action.access': 'Access',
    'notifications.action.download': 'Download',
    'notifications.action.join': 'Join',
    
    // Filters
    'notifications.filters.type': 'Type',
    'notifications.filters.status': 'Status',
    'notifications.filters.priority': 'Priority',
    'notifications.filters.unread': 'Unread only',
    'notifications.filters.read': 'Read only',
    
    // Stats
    'notifications.stats.total': 'Total',
    'notifications.stats.unread': 'Unread',
    'notifications.stats.urgent': 'Urgent',
    
    // Additional Notifications
    'notifications.message.new.title': 'New message',
    'notifications.message.new.message': 'You received a message from {sender}',
    'notifications.training.enrollment.title': 'Training enrollment confirmed',
    'notifications.training.enrollment.message': 'You are enrolled in "{course}"',
    'notifications.certification.awarded.title': 'Certification awarded',
    'notifications.certification.awarded.message': 'Congratulations! You earned "{certification}"',
    'notifications.session.reminder.title': 'Session reminder',
    'notifications.session.reminder.message': '"{session}" starts in {time}',
  },
  
  fr: {
    // Notification Panel
    'notifications.title': 'Notifications',
    'notifications.empty': 'Aucune notification',
    'notifications.emptyMessage': 'Vous êtes à jour !',
    'notifications.markAllRead': 'Tout marquer comme lu',
    'notifications.viewAll': 'Voir toutes les notifications',
    'notifications.unread': '{count} non lue(s)',
    'notifications.delete': 'Supprimer',
    'notifications.archive': 'Archiver',
    'notifications.settings': 'Paramètres de notification',
    
    // Notification Types
    'notifications.type.TENDER': 'Appel d\'offres',
    'notifications.type.INVITATION': 'Invitation',
    'notifications.type.SUBMISSION': 'Soumission',
    'notifications.type.SUCCESS': 'Succès',
    'notifications.type.ALERT': 'Alerte',
    'notifications.type.MESSAGE': 'Message',
    'notifications.type.PARTNERSHIP': 'Partenariat',
    'notifications.type.TEAM': 'Équipe',
    'notifications.type.SYSTEM': 'Système',
    
    // Notification Priority
    'notifications.priority.LOW': 'Faible',
    'notifications.priority.MEDIUM': 'Moyen',
    'notifications.priority.HIGH': 'Élevé',
    'notifications.priority.URGENT': 'Urgent',
    
    // Notification Messages - Tenders
    'notifications.tender.new.title': 'Nouvel appel d\'offres',
    'notifications.tender.new.message': 'Un nouvel appel d\'offres correspond à votre profil',
    'notifications.tender.match.title': 'Correspondance appel d\'offres',
    'notifications.tender.match.message': 'L\'appel d\'offres "{title}" correspond à votre expertise',
    'notifications.tender.deadline.title': 'Deadline approche',
    'notifications.tender.deadline.message': 'L\'appel d\'offres "{title}" clôture dans {days} jours',
    'notifications.tender.urgent.title': 'Deadline urgente',
    'notifications.tender.urgent.message': 'L\'appel d\'offres "{title}" clôture dans 24 heures',
    'notifications.tender.awarded.title': 'Appel d\'offres remporté',
    'notifications.tender.awarded.message': 'Félicitations ! Vous avez remporté l\'appel d\'offres "{title}"',
    
    // Notification Messages - Invitations
    'notifications.invitation.received.title': 'Invitation reçue',
    'notifications.invitation.received.message': '{organization} vous invite à rejoindre leur consortium',
    'notifications.invitation.accepted.title': 'Invitation acceptée',
    'notifications.invitation.accepted.message': '{organization} a accepté votre invitation',
    'notifications.invitation.declined.title': 'Invitation refusée',
    'notifications.invitation.declined.message': '{organization} a refusé votre invitation',
    'notifications.invitation.pending.title': 'Invitation en attente',
    'notifications.invitation.pending.message': 'Votre invitation à {organization} est en attente de révision',
    
    // Notification Messages - Submissions
    'notifications.submission.submitted.title': 'Soumission envoyée',
    'notifications.submission.submitted.message': 'Votre candidature pour "{title}" a été soumise',
    'notifications.submission.validated.title': 'Soumission validée',
    'notifications.submission.validated.message': 'Votre candidature pour "{title}" a été acceptée',
    'notifications.submission.rejected.title': 'Soumission rejetée',
    'notifications.submission.rejected.message': 'Votre candidature pour "{title}" n\'a pas été retenue',
    'notifications.submission.shortlisted.title': 'Présélectionné',
    'notifications.submission.shortlisted.message': 'Vous avez été présélectionné pour "{title}"',
    
    // Notification Messages - Success
    'notifications.success.profile.title': 'Profil mis à jour',
    'notifications.success.profile.message': 'Votre profil a été mis à jour avec succès',
    'notifications.success.verification.title': 'Organisation vérifiée',
    'notifications.success.verification.message': 'Votre organisation a été vérifiée',
    'notifications.success.payment.title': 'Paiement reçu',
    'notifications.success.payment.message': 'Votre paiement a été traité avec succès',
    
    // Notification Messages - Partnerships
    'notifications.partnership.new.title': 'Nouveau partenariat',
    'notifications.partnership.new.message': 'Partenariat établi avec {organization}',
    'notifications.partnership.request.title': 'Demande de partenariat',
    'notifications.partnership.request.message': '{organization} souhaite s\'associer avec vous',
    'notifications.partnership.ended.title': 'Partenariat terminé',
    'notifications.partnership.ended.message': 'Le partenariat avec {organization} a pris fin',
    
    // Notification Messages - Team
    'notifications.team.member.title': 'Nouveau membre',
    'notifications.team.member.message': '{name} a rejoint votre équipe',
    'notifications.team.invite.title': 'Invitation d\'équipe envoyée',
    'notifications.team.invite.message': 'Invitation envoyée à {name} ({email}) en tant que {role}',
    'notifications.team.removed.title': 'Membre retiré',
    'notifications.team.removed.message': '{name} a été retiré de l\'équipe',
    'notifications.team.role.title': 'Rôle mis à jour',
    'notifications.team.role.message': 'Votre rôle a été mis à jour en {role}',
    
    // Notification Messages - System
    'notifications.system.maintenance.title': 'Maintenance programmée',
    'notifications.system.maintenance.message': 'Maintenance système programmée pour le {date}',
    'notifications.system.update.title': 'Mise à jour système',
    'notifications.system.update.message': 'Nouvelles fonctionnalités disponibles ! Découvrez les nouveautés',
    'notifications.system.security.title': 'Alerte de sécurité',
    'notifications.system.security.message': 'Activité inhabituelle détectée sur votre compte',
    
    // Time Formats
    'notifications.time.now': 'À l\'instant',
    'notifications.time.minutes': 'Il y a {count} minutes',
    'notifications.time.hour': 'Il y a 1 heure',
    'notifications.time.hours': 'Il y a {count} heures',
    'notifications.time.yesterday': 'Hier',
    'notifications.time.days': 'Il y a {count} jours',
    'notifications.time.week': 'Il y a 1 semaine',
    'notifications.time.weeks': 'Il y a {count} semaines',
    'notifications.time.month': 'Il y a 1 mois',
    'notifications.time.months': 'Il y a {count} mois',
    
    // Actions
    'notifications.action.view': 'Voir',
    'notifications.action.respond': 'Répondre',
    'notifications.action.accept': 'Accepter',
    'notifications.action.decline': 'Refuser',
    'notifications.action.apply': 'Postuler',
    'notifications.action.review': 'Examiner',
    'notifications.action.dismiss': 'Ignorer',
    'notifications.action.reply': 'Répondre',
    'notifications.action.access': 'Accéder',
    'notifications.action.download': 'Télécharger',
    'notifications.action.join': 'Rejoindre',
    
    // Filters
    'notifications.filters.type': 'Type',
    'notifications.filters.status': 'Statut',
    'notifications.filters.priority': 'Priorité',
    'notifications.filters.unread': 'Non lues seulement',
    'notifications.filters.read': 'Lues seulement',
    
    // Stats
    'notifications.stats.total': 'Total',
    'notifications.stats.unread': 'Non lues',
    'notifications.stats.urgent': 'Urgentes',
    
    // Additional Notifications
    'notifications.message.new.title': 'Nouveau message',
    'notifications.message.new.message': 'Vous avez reçu un message de {sender}',
    'notifications.training.enrollment.title': 'Inscription à la formation confirmée',
    'notifications.training.enrollment.message': 'Vous êtes inscrit à "{course}"',
    'notifications.certification.awarded.title': 'Certification obtenue',
    'notifications.certification.awarded.message': 'Félicitations ! Vous avez obtenu "{certification}"',
    'notifications.session.reminder.title': 'Rappel de session',
    'notifications.session.reminder.message': '"{session}" commence dans {time}',
  },
  
  es: {
    // Notification Panel
    'notifications.title': 'Notificaciones',
    'notifications.empty': 'Sin notificaciones',
    'notifications.emptyMessage': '¡Estás al día!',
    'notifications.markAllRead': 'Marcar todo como leído',
    'notifications.viewAll': 'Ver todas las notificaciones',
    'notifications.unread': '{count} sin leer',
    'notifications.delete': 'Eliminar',
    'notifications.archive': 'Archivar',
    'notifications.settings': 'Configuración de notificaciones',
    
    // Notification Types
    'notifications.type.TENDER': 'Licitación',
    'notifications.type.INVITATION': 'Invitación',
    'notifications.type.SUBMISSION': 'Presentación',
    'notifications.type.SUCCESS': 'Éxito',
    'notifications.type.ALERT': 'Alerta',
    'notifications.type.MESSAGE': 'Mensaje',
    'notifications.type.PARTNERSHIP': 'Asociación',
    'notifications.type.TEAM': 'Equipo',
    'notifications.type.SYSTEM': 'Sistema',
    
    // Notification Priority
    'notifications.priority.LOW': 'Bajo',
    'notifications.priority.MEDIUM': 'Medio',
    'notifications.priority.HIGH': 'Alto',
    'notifications.priority.URGENT': 'Urgente',
    
    // Notification Messages - Tenders
    'notifications.tender.new.title': 'Nueva licitación',
    'notifications.tender.new.message': 'Una nueva licitación coincide con su perfil',
    'notifications.tender.match.title': 'Coincidencia de licitación',
    'notifications.tender.match.message': 'La licitación "{title}" coincide con su experiencia',
    'notifications.tender.deadline.title': 'Fecha límite próxima',
    'notifications.tender.deadline.message': 'La licitación "{title}" cierra en {days} días',
    'notifications.tender.urgent.title': 'Fecha límite urgente',
    'notifications.tender.urgent.message': 'La licitación "{title}" cierra en 24 horas',
    'notifications.tender.awarded.title': 'Licitación ganada',
    'notifications.tender.awarded.message': '¡Felicitaciones! Ganó la licitación "{title}"',
    
    // Notification Messages - Invitations
    'notifications.invitation.received.title': 'Invitación recibida',
    'notifications.invitation.received.message': '{organization} le invita a unirse a su consorcio',
    'notifications.invitation.accepted.title': 'Invitación aceptada',
    'notifications.invitation.accepted.message': '{organization} aceptó su invitación',
    'notifications.invitation.declined.title': 'Invitación rechazada',
    'notifications.invitation.declined.message': '{organization} rechazó su invitación',
    'notifications.invitation.pending.title': 'Invitación pendiente',
    'notifications.invitation.pending.message': 'Su invitación a {organization} está pendiente de revisión',
    
    // Notification Messages - Submissions
    'notifications.submission.submitted.title': 'Presentación enviada',
    'notifications.submission.submitted.message': 'Su solicitud para "{title}" ha sido enviada',
    'notifications.submission.validated.title': 'Presentación validada',
    'notifications.submission.validated.message': 'Su solicitud para "{title}" ha sido aceptada',
    'notifications.submission.rejected.title': 'Presentación rechazada',
    'notifications.submission.rejected.message': 'Su solicitud para "{title}" no fue seleccionada',
    'notifications.submission.shortlisted.title': 'Preseleccionado',
    'notifications.submission.shortlisted.message': 'Ha sido preseleccionado para "{title}"',
    
    // Notification Messages - Success
    'notifications.success.profile.title': 'Perfil actualizado',
    'notifications.success.profile.message': 'Su perfil ha sido actualizado con éxito',
    'notifications.success.verification.title': 'Organización verificada',
    'notifications.success.verification.message': 'Su organización ha sido verificada',
    'notifications.success.payment.title': 'Pago recibido',
    'notifications.success.payment.message': 'Su pago ha sido procesado con éxito',
    
    // Notification Messages - Partnerships
    'notifications.partnership.new.title': 'Nueva asociación',
    'notifications.partnership.new.message': 'Asociación establecida con {organization}',
    'notifications.partnership.request.title': 'Solicitud de asociación',
    'notifications.partnership.request.message': '{organization} quiere asociarse con usted',
    'notifications.partnership.ended.title': 'Asociación finalizada',
    'notifications.partnership.ended.message': 'La asociación con {organization} ha finalizado',
    
    // Notification Messages - Team
    'notifications.team.member.title': 'Nuevo miembro',
    'notifications.team.member.message': '{name} se unió a su equipo',
    'notifications.team.invite.title': 'Invitación de equipo enviada',
    'notifications.team.invite.message': 'Invitación enviada a {name} ({email}) como {role}',
    'notifications.team.removed.title': 'Miembro eliminado',
    'notifications.team.removed.message': '{name} ha sido eliminado del equipo',
    'notifications.team.role.title': 'Rol actualizado',
    'notifications.team.role.message': 'Su rol ha sido actualizado a {role}',
    
    // Notification Messages - System
    'notifications.system.maintenance.title': 'Mantenimiento programado',
    'notifications.system.maintenance.message': 'Mantenimiento del sistema programado para {date}',
    'notifications.system.update.title': 'Actualización del sistema',
    'notifications.system.update.message': '¡Nuevas funciones disponibles! Descubra las novedades',
    'notifications.system.security.title': 'Alerta de seguridad',
    'notifications.system.security.message': 'Actividad inusual detectada en su cuenta',
    
    // Time Formats
    'notifications.time.now': 'Justo ahora',
    'notifications.time.minutes': 'Hace {count} minutos',
    'notifications.time.hour': 'Hace 1 hora',
    'notifications.time.hours': 'Hace {count} horas',
    'notifications.time.yesterday': 'Ayer',
    'notifications.time.days': 'Hace {count} días',
    'notifications.time.week': 'Hace 1 semana',
    'notifications.time.weeks': 'Hace {count} semanas',
    'notifications.time.month': 'Hace 1 mes',
    'notifications.time.months': 'Hace {count} meses',
    
    // Actions
    'notifications.action.view': 'Ver',
    'notifications.action.respond': 'Responder',
    'notifications.action.accept': 'Aceptar',
    'notifications.action.decline': 'Rechazar',
    'notifications.action.apply': 'Aplicar ahora',
    'notifications.action.review': 'Revisar',
    'notifications.action.dismiss': 'Descartar',
    'notifications.action.reply': 'Responder',
    'notifications.action.access': 'Acceder',
    'notifications.action.download': 'Descargar',
    'notifications.action.join': 'Unirse',
    
    // Filters
    'notifications.filters.type': 'Tipo',
    'notifications.filters.status': 'Estado',
    'notifications.filters.priority': 'Prioridad',
    'notifications.filters.unread': 'Solo no leídas',
    'notifications.filters.read': 'Solo leídas',
    
    // Stats
    'notifications.stats.total': 'Total',
    'notifications.stats.unread': 'No leídas',
    'notifications.stats.urgent': 'Urgentes',
    
    // Additional Notifications
    'notifications.message.new.title': 'Nuevo mensaje',
    'notifications.message.new.message': 'Recibió un mensaje de {sender}',
    'notifications.training.enrollment.title': 'Inscripción a la formación confirmada',
    'notifications.training.enrollment.message': 'Está inscrito en "{course}"',
    'notifications.certification.awarded.title': 'Certificación obtenida',
    'notifications.certification.awarded.message': '¡Felicitaciones! Ha obtenido "{certification}"',
    'notifications.session.reminder.title': 'Recordatorio de sesión',
    'notifications.session.reminder.message': '"{session}" comienza en {time}',
  },
};