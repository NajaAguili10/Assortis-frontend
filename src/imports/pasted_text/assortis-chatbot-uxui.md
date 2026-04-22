Bonjour,

Dans le cadre de l’évolution de la plateforme **Assortis**, nous souhaitons concevoir un **AI Chatbot nommé "AssortisBot"** qui assistera les utilisateurs dans la navigation, la compréhension des fonctionnalités et la réponse aux questions.

Merci de prévoir dans Figma la **conception UX/UI complète** de ce module en respectant le **Design System Assortis**, la **compatibilité React** et le **multilingue (FR / EN / ES)**.

OBJECTIF
AssortisBot doit servir d’assistant intelligent pour :

* guider les utilisateurs dans la plateforme
* répondre aux questions fréquentes
* orienter vers les modules et fonctionnalités
* améliorer l’expérience utilisateur

1. WIDGET CHATBOT
   Créer un bouton flottant visible sur toutes les pages de la plateforme.

Fonctionnalités :

* icône chatbot "AssortisBot"
* position en bas à droite
* état fermé / ouvert
* animation d’ouverture
* badge de notification possible

2. INTERFACE DE CONVERSATION

Fenêtre de chat contenant :

Header

* logo AssortisBot
* titre du chatbot
* bouton fermer / réduire
* indicateur "AI Assistant"

Zone de conversation

* messages utilisateur
* réponses du chatbot
* timestamp optionnel
* style différencié utilisateur / bot

Champ de saisie

* zone texte pour poser une question
* bouton envoyer
* suggestions rapides (chips)

Suggestions de questions rapides
Exemples :

* Comment créer un compte ?
* Comment rejoindre une organisation ?
* Comment devenir expert ?
* Comment publier une demande ?

3. COMPORTEMENT SELON TYPE D’UTILISATEUR

Utilisateurs authentifiés (réponses détaillées)

* Expert
* Organization
* Expert-Organization
* Admin

Le chatbot pourra :

* fournir des réponses détaillées
* orienter vers des modules spécifiques
* expliquer les fonctionnalités de la plateforme
* guider les actions utilisateur

Navigants non authentifiés (réponses limitées)

Les visiteurs sans connexion pourront :

* poser des questions générales
* recevoir des réponses informatives uniquement

Le chatbot devra :

* éviter d’afficher des informations internes
* proposer de se connecter ou créer un compte pour plus de détails

4. FONCTIONS INTELLIGENTES

Prévoir dans l’UX les possibilités suivantes :

* assistance à la navigation
* suggestions automatiques
* compréhension des questions utilisateur
* redirection vers pages ou modules

Exemples :
"Aller vers mon profil"
"Créer une organisation"
"Voir mes invitations"

5. ETATS DU CHATBOT

Merci de prévoir les états suivants :

* chatbot fermé
* chatbot ouvert
* chatbot en train de répondre
* chatbot en train d’écrire
* message d’erreur
* conversation vide (message de bienvenue)

6. MESSAGE D’ACCUEIL

Exemple :

"Bonjour, je suis AssortisBot 👋
Je peux vous aider à naviguer dans la plateforme Assortis et répondre à vos questions."

7. VERSION RESPONSIVE

Prévoir :

* version desktop
* version mobile
* adaptation de la fenêtre de chat

8. ELEMENTS A FOURNIR DANS FIGMA

Merci de produire :

* design complet du chatbot
* composants réutilisables
* états UI
* interactions principales
* respect du Design System Assortis

L’objectif est de créer un **assistant intelligent simple, intuitif et intégré à l’écosystème Assortis** afin d’améliorer l’accompagnement des utilisateurs et la navigation dans la plateforme.
