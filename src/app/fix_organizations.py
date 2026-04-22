#!/usr/bin/env python3
import re

# Read the file
with open('src/app/i18n/organizations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix all problematic lines with escaped apostrophes
replacements = [
    # Fix lines with \\'  escaping (need to replace with double quotes)
    ("'organizations.hub.subtitle': 'Réseau complet d\\'organisations partenaires avec gestion de collaborations et équipes',", 
     "'organizations.hub.subtitle': \"Réseau complet d'organisations partenaires avec gestion de collaborations et équipes\","),
    
    ("'organizations.submenu.overview': 'Vue d\\'ensemble',", 
     "'organizations.submenu.overview': \"Vue d'ensemble\","),
    
    ("'organizations.kpis.teamMembers': 'Membres d\\'Équipe',", 
     "'organizations.kpis.teamMembers': \"Membres d'Équipe\","),
    
    ("'organizations.invite.orgType.title': 'Type d\\'invitation',", 
     "'organizations.invite.orgType.title': \"Type d'invitation\","),
    
    ("'organizations.invite.orgType.consortium.description': 'Inviter à rejoindre un consortium pour un appel d\\'offres',",
     "'organizations.invite.orgType.consortium.description': \"Inviter à rejoindre un consortium pour un appel d'offres\","),
    
    ("'organizations.invite.expertType.title': 'Type d\\'invitation',",
     "'organizations.invite.expertType.title': \"Type d'invitation\","),
    
    ("'organizations.invite.expertType.team': 'Membre d\\'Équipe',",
     "'organizations.invite.expertType.team': \"Membre d'Équipe\","),
    
    ("'organizations.invite.message.subject.placeholder': 'Entrer l\\'objet',",
     "'organizations.invite.message.subject.placeholder': \"Entrer l'objet\","),
    
    ("'organizations.invite.action.send': 'Envoyer l\\'Invitation',",
     "'organizations.invite.action.send': \"Envoyer l'Invitation\","),
    
    ("'organizations.card.overview.title': 'Vue d\\'ensemble',",
     "'organizations.card.overview.title': \"Vue d'ensemble\","),
    
    ("'organizations.filters.type': 'Type d\\'Organisation',",
     "'organizations.filters.type': \"Type d'Organisation\","),
    
    ("'organizations.list.noResults.message': 'Essayez d\\'ajuster vos filtres',",
     "'organizations.list.noResults.message': \"Essayez d'ajuster vos filtres\","),
    
    ("'organizations.details.notFound.message': 'L\\'organisation que vous recherchez n\\'existe pas ou a été supprimée.',",
     "'organizations.details.notFound.message': \"L'organisation que vous recherchez n'existe pas ou a été supprimée.\","),
    
    ("'organizations.teams.invite.send': 'Envoyer l\\'Invitation',",
     "'organizations.teams.invite.send': \"Envoyer l'Invitation\","),
    
    ("'organizations.teams.invite.error': 'Échec de l\\'envoi de l\\'invitation',",
     "'organizations.teams.invite.error': \"Échec de l'envoi de l'invitation\","),
    
    ("'organizations.teams.noResults': 'Aucun membre d\\'équipe trouvé',",
     "'organizations.teams.noResults': \"Aucun membre d'équipe trouvé\","),
    
    ("'organizations.partnerships.noResults.description': 'Commencez à créer des partenariats avec d\\'autres organisations',",
     "'organizations.partnerships.noResults.description': \"Commencez à créer des partenariats avec d'autres organisations\","),
    
    ("'organizations.invitations.subtitle': 'Gérer les invitations de partenariat et d\\'équipe',",
     "'organizations.invitations.subtitle': \"Gérer les invitations de partenariat et d'équipe\","),
    
    ("'organizations.invitations.noReceived.description': 'Vous n\\'avez aucune invitation en attente pour le moment',",
     "'organizations.invitations.noReceived.description': \"Vous n'avez aucune invitation en attente pour le moment\","),
    
    ("'organizations.form.orgName': 'Nom de l\\'Organisation',",
     "'organizations.form.orgName': \"Nom de l'Organisation\","),
    
    ("'organizations.form.orgName.placeholder': 'Entrez le nom de l\\'organisation',",
     "'organizations.form.orgName.placeholder': \"Entrez le nom de l'organisation\","),
    
    ("'organizations.form.orgType': 'Type d\\'Organisation',",
     "'organizations.form.orgType': \"Type d'Organisation\","),
    
    ("'organizations.form.orgType.placeholder': 'Sélectionnez le type d\\'organisation',",
     "'organizations.form.orgType.placeholder': \"Sélectionnez le type d'organisation\","),
    
    ("'organizations.form.registrationNumber': 'Numéro d\\'Inscription',",
     "'organizations.form.registrationNumber': \"Numéro d'Inscription\","),
    
    ("'organizations.form.registrationNumber.placeholder': 'Numéro d\\'inscription officiel',",
     "'organizations.form.registrationNumber.placeholder': \"Numéro d'inscription officiel\","),
    
    ("'organizations.form.operatingRegions': 'Régions d\\'Opération',",
     "'organizations.form.operatingRegions': \"Régions d'Opération\","),
    
    ("'organizations.form.subsectors.hint': 'Sélectionnez un secteur d\\'abord pour voir les sous-secteurs disponibles',",
     "'organizations.form.subsectors.hint': \"Sélectionnez un secteur d'abord pour voir les sous-secteurs disponibles\","),
    
    ("'organizations.form.teamSize': 'Taille de l\\'Équipe',",
     "'organizations.form.teamSize': \"Taille de l'Équipe\","),
    
    ("'organizations.form.teamSize.placeholder': 'Nombre d\\'employés',",
     "'organizations.form.teamSize.placeholder': \"Nombre d'employés\","),
    
    ("'organizations.form.experts': 'Nombre d\\'Experts',",
     "'organizations.form.experts': \"Nombre d'Experts\","),
    
    ("'organizations.form.experts.placeholder': 'Nombre d\\'experts',",
     "'organizations.form.experts.placeholder': \"Nombre d'experts\","),
    
    ("'organizations.services.tenders.title': 'Accès aux Appels d\\'Offres',",
     "'organizations.services.tenders.title': \"Accès aux Appels d'Offres\","),
    
    ("'organizations.services.tenders.description': 'Parcourir et postuler à des appels d\\'offres internationaux et opportunités',",
     "'organizations.services.tenders.description': \"Parcourir et postuler à des appels d'offres internationaux et opportunités\","),
    
    ("'organizations.services.tenders.features.1': 'Accès illimité aux appels d\\'offres',",
     "'organizations.services.tenders.features.1': \"Accès illimité aux appels d'offres\","),
    
    ("'organizations.services.experts.description': 'Accédez à notre base de données complète d\\'experts internationaux qualifiés',",
     "'organizations.services.experts.description': \"Accédez à notre base de données complète d'experts internationaux qualifiés\","),
    
    ("'organizations.services.training.features.4': 'Programmes de formation d\\'équipe',",
     "'organizations.services.training.features.4': \"Programmes de formation d'équipe\","),
    
    ("'organizations.services.summary.none': 'Aucun service sélectionné pour l\\'instant',",
     "'organizations.services.summary.none': \"Aucun service sélectionné pour l'instant\","),
    
    # Also fix the line 35 in English section
    ("'organizations.actions.createProfileDesc': 'Set up your organization\\'s complete profile',",
     "'organizations.actions.createProfileDesc': \"Set up your organization's complete profile\","),
]

for old, new in replacements:
    content = content.replace(old, new)

# Write back
with open('src/app/i18n/organizations.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed all apostrophe escaping issues in organizations.ts!")
