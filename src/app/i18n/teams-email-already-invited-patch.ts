// Patch pour ajouter la traduction "emailAlreadyInvited" pour Organizations/Teams
// À importer dans src/app/contexts/LanguageContext.tsx

export const teamsEmailAlreadyInvitedPatch = {
  en: {
    'organizations.teams.invite.error.emailAlreadyInvited': 'This email has already been invited in this session. Please invite a different member.',
  },
  fr: {
    'organizations.teams.invite.error.emailAlreadyInvited': 'Cet email a déjà été invité dans cette session. Veuillez inviter un membre différent.',
  },
  es: {
    'organizations.teams.invite.error.emailAlreadyInvited': 'Este correo ya ha sido invitado en esta sesión. Por favor invite a un miembro diferente.',
  },
};
