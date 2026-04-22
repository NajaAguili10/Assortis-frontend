import { useTranslation } from '@app/contexts/LanguageContext';

export default function PrivacyPolicy() {
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
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Politique de Confidentialité
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
              <Lock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">
                1. Introduction
              </h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Chez Assortis, nous prenons très au sérieux la protection de vos données personnelles. Cette Politique de Confidentialité explique comment nous collectons, utilisons, partageons et protégeons vos informations personnelles lorsque vous utilisez notre plateforme.
              </p>
              <p>
                En utilisant Assortis, vous acceptez les pratiques décrites dans cette politique. Si vous n'acceptez pas cette politique, veuillez ne pas utiliser nos services.
              </p>
            </div>
          </section>

          {/* Données collectées */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">
                2. Données que Nous Collectons
              </h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Nous collectons différents types d'informations pour fournir et améliorer nos services :
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-primary mb-2">2.1 Informations que vous nous fournissez</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Informations de compte :</strong> Nom, prénom, email, mot de passe, numéro de téléphone</li>
                    <li><strong>Informations professionnelles :</strong> Organisation, poste, domaine d'expertise, années d'expérience</li>
                    <li><strong>Informations de paiement :</strong> Informations de carte de crédit (traitées de manière sécurisée par Stripe)</li>
                    <li><strong>Contenu utilisateur :</strong> Profils, publications, commentaires, documents téléchargés</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-primary mb-2">2.2 Informations collectées automatiquement</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Données de navigation :</strong> Pages visitées, durée des sessions, clics</li>
                    <li><strong>Informations techniques :</strong> Adresse IP, type de navigateur, système d'exploitation</li>
                    <li><strong>Cookies et technologies similaires :</strong> Pour améliorer votre expérience</li>
                    <li><strong>Données d'interaction :</strong> Appels d'offres consultés, recherches effectuées</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Utilisation des données */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">
                3. Comment Nous Utilisons Vos Données
              </h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Nous utilisons vos données personnelles pour :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Fournir, maintenir et améliorer nos services</li>
                <li>Créer et gérer votre compte utilisateur</li>
                <li>Traiter vos paiements et gérer vos abonnements</li>
                <li>Personnaliser votre expérience et vous proposer des recommandations pertinentes</li>
                <li>Vous envoyer des notifications sur les appels d'offres correspondant à votre profil</li>
                <li>Communiquer avec vous concernant votre compte et nos services</li>
                <li>Analyser l'utilisation de la plateforme pour améliorer nos fonctionnalités</li>
                <li>Détecter, prévenir et traiter la fraude ou les activités illégales</li>
                <li>Respecter nos obligations légales et réglementaires</li>
              </ul>
            </div>
          </section>

          {/* Partage des données */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">
              4. Partage de Vos Données
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Nous ne vendons pas vos données personnelles. Nous pouvons partager vos informations dans les cas suivants :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Prestataires de services :</strong> Nous travaillons avec des partenaires de confiance (hébergement, paiement, analytics) qui traitent vos données en notre nom</li>
                <li><strong>Conformité légale :</strong> Si requis par la loi ou pour répondre à des demandes légales</li>
                <li><strong>Protection des droits :</strong> Pour protéger nos droits, notre propriété ou la sécurité d'Assortis, de nos utilisateurs ou du public</li>
                <li><strong>Transfert d'entreprise :</strong> En cas de fusion, acquisition ou vente d'actifs</li>
                <li><strong>Avec votre consentement :</strong> Lorsque vous nous autorisez explicitement à partager vos données</li>
              </ul>
            </div>
          </section>

          {/* Sécurité */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">
                5. Sécurité de Vos Données
              </h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données personnelles :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Chiffrement SSL/TLS pour toutes les transmissions de données</li>
                <li>Stockage sécurisé des mots de passe avec hachage</li>
                <li>Contrôles d'accès stricts aux données personnelles</li>
                <li>Surveillance et audits de sécurité réguliers</li>
                <li>Formation du personnel sur la protection des données</li>
                <li>Plans de réponse aux incidents de sécurité</li>
              </ul>
              <p>
                Toutefois, aucune méthode de transmission ou de stockage électronique n'est totalement sûre. Nous ne pouvons garantir une sécurité absolue.
              </p>
            </div>
          </section>

          {/* Vos droits */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">
                6. Vos Droits
              </h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Conformément au RGPD et aux lois applicables, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Droit d'accès :</strong> Obtenir une copie de vos données personnelles</li>
                <li><strong>Droit de rectification :</strong> Corriger vos données inexactes ou incomplètes</li>
                <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données</li>
                <li><strong>Droit à la limitation :</strong> Restreindre le traitement de vos données</li>
                <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
                <li><strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données</li>
                <li><strong>Droit de retirer votre consentement :</strong> À tout moment, sans affecter la légalité du traitement antérieur</li>
              </ul>
              <p>
                Pour exercer ces droits, contactez-nous à privacy@assortis.com.
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">
              7. Cookies et Technologies de Suivi
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Nous utilisons des cookies et des technologies similaires pour :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Mémoriser vos préférences et paramètres</li>
                <li>Comprendre comment vous utilisez notre plateforme</li>
                <li>Améliorer la performance et la sécurité</li>
                <li>Personnaliser le contenu et les recommandations</li>
              </ul>
              <p>
                Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur. Notez que désactiver certains cookies peut affecter le fonctionnement de la plateforme.
              </p>
            </div>
          </section>

          {/* Transferts internationaux */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">
              8. Transferts Internationaux de Données
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Vos données peuvent être transférées et traitées dans des pays autres que votre pays de résidence. Nous veillons à ce que ces transferts soient effectués conformément aux lois applicables et avec des garanties appropriées (clauses contractuelles types, Privacy Shield, etc.).
              </p>
            </div>
          </section>

          {/* Conservation des données */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">
              9. Conservation des Données
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Nous conservons vos données personnelles aussi longtemps que nécessaire pour :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Fournir nos services et maintenir votre compte</li>
                <li>Respecter nos obligations légales et réglementaires</li>
                <li>Résoudre les litiges et faire respecter nos accords</li>
              </ul>
              <p>
                Après la suppression de votre compte, nous conservons certaines informations pendant une période limitée à des fins légales, de sécurité et de prévention de la fraude.
              </p>
            </div>
          </section>

          {/* Mineurs */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">
              10. Données des Mineurs
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Nos services ne sont pas destinés aux personnes de moins de 18 ans. Nous ne collectons pas sciemment de données personnelles auprès de mineurs. Si vous apprenez qu'un mineur nous a fourni des données personnelles, veuillez nous contacter.
              </p>
            </div>
          </section>

          {/* Modifications */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">
              11. Modifications de Cette Politique
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Nous pouvons mettre à jour cette Politique de Confidentialité périodiquement. Nous vous informerons de tout changement important en publiant la nouvelle politique sur cette page et en vous envoyant un email. Nous vous encourageons à consulter régulièrement cette page.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4">
              12. Contact et Réclamations
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Pour toute question concernant cette Politique de Confidentialité ou pour exercer vos droits, contactez notre Délégué à la Protection des Données :
              </p>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <p className="font-semibold text-primary mb-2">Délégué à la Protection des Données - Assortis</p>
                <p>Email : privacy@assortis.com</p>
                <p>Email : dpo@assortis.com</p>
                <p>Téléphone : +33 1 23 45 67 89</p>
                <p>Adresse : 123 Avenue des Champs-Élysées, 75008 Paris, France</p>
              </div>
              <p className="mt-4">
                Vous avez également le droit de déposer une plainte auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) si vous estimez que vos droits n'ont pas été respectés.
              </p>
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