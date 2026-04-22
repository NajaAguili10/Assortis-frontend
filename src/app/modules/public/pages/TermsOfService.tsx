import { useTranslation } from '@app/contexts/LanguageContext';

export default function TermsOfService() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Scale className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Conditions d'Utilisation
              </h1>
              <p className="text-gray-600 mt-1">
                Dernière mise à jour : 1er mars 2026
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12 space-y-8">
          {/* Introduction */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">
                1. Introduction
              </h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Bienvenue sur Assortis. En accédant et en utilisant notre plateforme, vous acceptez d'être lié par les présentes Conditions d'Utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
              </p>
              <p>
                Assortis est une plateforme de collecte et publication d'appels d'offres internationaux qui connecte les organisations, les experts et les opportunités de coopération internationale.
              </p>
            </div>
          </section>

          {/* Services */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">
              2. Description des Services
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Assortis fournit les services suivants :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Accès à une base de données d'appels d'offres internationaux</li>
                <li>Système de matching intelligent basé sur l'IA</li>
                <li>Gestion de profils d'organisations et d'experts</li>
                <li>Outils de gestion de projets et de collaborations</li>
                <li>Formations et certifications professionnelles</li>
                <li>Services de notification et d'alertes personnalisées</li>
              </ul>
            </div>
          </section>

          {/* Compte utilisateur */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">
              3. Compte Utilisateur
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Pour accéder à certaines fonctionnalités de la plateforme, vous devez créer un compte. Vous vous engagez à :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Fournir des informations exactes, complètes et à jour</li>
                <li>Maintenir la sécurité de votre mot de passe</li>
                <li>Notifier immédiatement Assortis de toute utilisation non autorisée</li>
                <li>Ne pas partager votre compte avec des tiers</li>
                <li>Être responsable de toutes les activités effectuées via votre compte</li>
              </ul>
            </div>
          </section>

          {/* Abonnements et paiements */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">
              4. Abonnements et Paiements
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <strong>Plans d'Abonnement :</strong> Assortis propose différents plans d'abonnement (Professional, Enterprise) avec des fonctionnalités et des tarifs variables.
              </p>
              <p>
                <strong>Facturation :</strong> Les abonnements sont facturés mensuellement ou annuellement selon votre choix. Les paiements sont traités de manière sécurisée via Stripe.
              </p>
              <p>
                <strong>Renouvellement Automatique :</strong> Votre abonnement sera automatiquement renouvelé à la fin de chaque période, sauf si vous l'annulez avant la date de renouvellement.
              </p>
              <p>
                <strong>Annulation :</strong> Vous pouvez annuler votre abonnement à tout moment depuis votre espace membre. L'annulation prendra effet à la fin de la période de facturation en cours.
              </p>
              <p>
                <strong>Remboursements :</strong> Les paiements ne sont généralement pas remboursables, sauf en cas d'erreur de facturation ou si la loi l'exige.
              </p>
            </div>
          </section>

          {/* Utilisation acceptable */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">
                5. Utilisation Acceptable
              </h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Vous vous engagez à ne pas :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Utiliser la plateforme à des fins illégales ou non autorisées</li>
                <li>Publier du contenu offensant, diffamatoire ou frauduleux</li>
                <li>Tenter d'accéder à des comptes ou données non autorisés</li>
                <li>Interférer avec le bon fonctionnement de la plateforme</li>
                <li>Copier, modifier ou distribuer le contenu d'Assortis sans autorisation</li>
                <li>Utiliser des robots, scrapers ou autres moyens automatisés</li>
              </ul>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">
              6. Propriété Intellectuelle
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Tous les droits de propriété intellectuelle relatifs à la plateforme Assortis, y compris mais sans s'y limiter, les textes, graphiques, logos, icônes, images, clips audio et vidéo, téléchargements numériques et compilations de données, appartiennent à Assortis ou à ses concédants de licence.
              </p>
              <p>
                Vous conservez tous les droits sur le contenu que vous publiez sur la plateforme, mais vous accordez à Assortis une licence mondiale, non exclusive et libre de redevance pour utiliser, reproduire et afficher ce contenu dans le cadre de la fourniture des services.
              </p>
            </div>
          </section>

          {/* Limitation de responsabilité */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">
              7. Limitation de Responsabilité
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Assortis fournit la plateforme "en l'état" et "selon disponibilité". Dans toute la mesure permise par la loi applicable, Assortis décline toute garantie, expresse ou implicite.
              </p>
              <p>
                Assortis ne sera pas responsable des dommages indirects, accessoires, spéciaux, consécutifs ou punitifs résultant de votre utilisation ou de votre incapacité à utiliser les services.
              </p>
            </div>
          </section>

          {/* Protection des données */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">
              8. Protection des Données
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                La collecte et le traitement de vos données personnelles sont régis par notre Politique de Confidentialité. En utilisant Assortis, vous consentez à la collecte et à l'utilisation de vos informations conformément à cette politique.
              </p>
            </div>
          </section>

          {/* Modifications */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">
              9. Modifications des Conditions
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Assortis se réserve le droit de modifier ces Conditions d'Utilisation à tout moment. Nous vous informerons de tout changement important en publiant une notification sur la plateforme ou en vous envoyant un email. Votre utilisation continue de la plateforme après de telles modifications constitue votre acceptation des nouvelles conditions.
              </p>
            </div>
          </section>

          {/* Résiliation */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">
              10. Résiliation
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Vous pouvez fermer votre compte à tout moment. Assortis se réserve le droit de suspendre ou de résilier votre compte si vous violez ces Conditions d'Utilisation ou si nous déterminons, à notre seule discrétion, que votre utilisation de la plateforme pose un risque pour Assortis ou pour d'autres utilisateurs.
              </p>
            </div>
          </section>

          {/* Droit applicable */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">
              11. Droit Applicable et Juridiction
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Ces Conditions d'Utilisation sont régies par les lois françaises. Tout litige découlant de ou en relation avec ces conditions sera soumis à la juridiction exclusive des tribunaux français.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">
              12. Contact
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Pour toute question concernant ces Conditions d'Utilisation, veuillez nous contacter à :
              </p>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <p className="font-semibold text-primary mb-2">Assortis</p>
                <p>Email : legal@assortis.com</p>
                <p>Téléphone : +33 1 23 45 67 89</p>
                <p>Adresse : 123 Avenue des Champs-Élysées, 75008 Paris, France</p>
              </div>
            </div>
          </section>
        </div>

        {/* Back button */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="px-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    </div>
  );
}