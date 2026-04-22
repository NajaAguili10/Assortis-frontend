/**
 * Service pour gérer les données du module Contact
 * 
 * IMPORTANT: Ce service utilise actuellement des données mock.
 * Lors de l'intégration avec le backoffice, remplacer les fonctions mock
 * par des appels API vers votre backend.
 * 
 * Exemple d'intégration future:
 * export const getContactPageContent = async (): Promise<ContactPageContent> => {
 *   const response = await fetch('/api/contact/page');
 *   return response.json();
 * };
 * 
 * export const submitContactForm = async (data: ContactFormData): Promise<void> => {
 *   const response = await fetch('/api/contact/submit', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(data)
 *   });
 *   if (!response.ok) throw new Error('Submission failed');
 * };
 */

import { ContactPageContent, ContactFormData } from '../types/contact.types';

// ==========================================
// MOCK DATA - À remplacer par des appels API
// ==========================================

/**
 * Récupère le contenu de la page Contact
 * TODO: Remplacer par un appel API au backoffice
 */
export const getContactPageContent = async (): Promise<ContactPageContent> => {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 100));

  return {
    banner: {
      title: {
        en: 'Contact Us',
        fr: 'Contactez-nous',
        es: 'Contáctenos'
      },
      subtitle: {
        en: 'Our team is here to help you succeed with Assortis',
        fr: 'Notre équipe est là pour vous aider à réussir avec Assortis',
        es: 'Nuestro equipo está aquí para ayudarle a tener éxito con Assortis'
      }
    },
    contactMethods: [
      {
        id: 'email',
        type: 'email',
        iconName: 'Mail',
        label: {
          en: 'Email',
          fr: 'Email',
          es: 'Correo electrónico'
        },
        value: 'contact@assortis.io',
        href: 'mailto:contact@assortis.io',
        displayOrder: 1
      },
      {
        id: 'phone',
        type: 'phone',
        iconName: 'Phone',
        label: {
          en: 'Phone',
          fr: 'Téléphone',
          es: 'Teléfono'
        },
        value: '+1 (555) 123-4567',
        href: 'tel:+15551234567',
        displayOrder: 2
      },
      {
        id: 'address',
        type: 'address',
        iconName: 'MapPin',
        label: {
          en: 'Address',
          fr: 'Adresse',
          es: 'Dirección'
        },
        value: '123 Innovation Street, Tech City, TC 12345',
        displayOrder: 3
      }
    ],
    categories: [
      {
        id: 'general',
        title: {
          en: 'General Inquiries',
          fr: 'Demandes générales',
          es: 'Consultas generales'
        },
        description: {
          en: 'For general questions about Assortis platform',
          fr: 'Pour des questions générales sur la plateforme Assortis',
          es: 'Para preguntas generales sobre la plataforma Assortis'
        },
        iconName: 'MessageSquare',
        iconColor: 'text-blue-600',
        iconBgColor: 'bg-blue-50',
        email: 'info@assortis.io',
        displayOrder: 1,
        isActive: true
      },
      {
        id: 'technical',
        title: {
          en: 'Technical Support',
          fr: 'Support technique',
          es: 'Soporte técnico'
        },
        description: {
          en: 'Get help with technical issues and platform usage',
          fr: 'Obtenez de l\'aide pour les problèmes techniques et l\'utilisation de la plateforme',
          es: 'Obtenga ayuda con problemas técnicos y uso de la plataforma'
        },
        iconName: 'Headphones',
        iconColor: 'text-purple-600',
        iconBgColor: 'bg-purple-50',
        email: 'support@assortis.io',
        displayOrder: 2,
        isActive: true
      },
      {
        id: 'sales',
        title: {
          en: 'Sales & Partnerships',
          fr: 'Ventes & Partenariats',
          es: 'Ventas y Asociaciones'
        },
        description: {
          en: 'Discuss enterprise plans and partnership opportunities',
          fr: 'Discutez des formules entreprise et opportunités de partenariat',
          es: 'Discuta planes empresariales y oportunidades de asociación'
        },
        iconName: 'Briefcase',
        iconColor: 'text-accent',
        iconBgColor: 'bg-accent/10',
        email: 'sales@assortis.io',
        displayOrder: 3,
        isActive: true
      },
      {
        id: 'press',
        title: {
          en: 'Press & Media',
          fr: 'Presse & Médias',
          es: 'Prensa y Medios'
        },
        description: {
          en: 'Media inquiries and press relations',
          fr: 'Demandes médias et relations presse',
          es: 'Consultas de medios y relaciones con la prensa'
        },
        iconName: 'Newspaper',
        iconColor: 'text-green-600',
        iconBgColor: 'bg-green-50',
        email: 'press@assortis.io',
        displayOrder: 4,
        isActive: true
      }
    ],
    form: {
      title: {
        en: 'Send us a message',
        fr: 'Envoyez-nous un message',
        es: 'Envíenos un mensaje'
      },
      subtitle: {
        en: 'Fill out the form below and our team will get back to you within 24 hours',
        fr: 'Remplissez le formulaire ci-dessous et notre équipe vous répondra sous 24 heures',
        es: 'Complete el formulario a continuación y nuestro equipo le responderá en 24 horas'
      },
      fields: [
        {
          name: 'fullName',
          label: {
            en: 'Full Name',
            fr: 'Nom complet',
            es: 'Nombre completo'
          },
          placeholder: {
            en: 'Enter your full name',
            fr: 'Entrez votre nom complet',
            es: 'Ingrese su nombre completo'
          },
          type: 'text',
          required: true
        },
        {
          name: 'email',
          label: {
            en: 'Email',
            fr: 'Email',
            es: 'Correo electrónico'
          },
          placeholder: {
            en: 'your.email@example.com',
            fr: 'votre.email@exemple.com',
            es: 'su.correo@ejemplo.com'
          },
          type: 'email',
          required: true
        },
        {
          name: 'phone',
          label: {
            en: 'Phone',
            fr: 'Téléphone',
            es: 'Teléfono'
          },
          placeholder: {
            en: '+1 (555) 123-4567',
            fr: '+33 1 23 45 67 89',
            es: '+34 912 34 56 78'
          },
          type: 'tel',
          required: false
        },
        {
          name: 'subject',
          label: {
            en: 'Subject',
            fr: 'Sujet',
            es: 'Asunto'
          },
          placeholder: {
            en: 'Select a subject',
            fr: 'Sélectionnez un sujet',
            es: 'Seleccione un asunto'
          },
          type: 'select',
          required: true,
          options: [
            {
              value: 'general',
              label: {
                en: 'General Inquiry',
                fr: 'Demande générale',
                es: 'Consulta general'
              }
            },
            {
              value: 'technical',
              label: {
                en: 'Technical Support',
                fr: 'Support technique',
                es: 'Soporte técnico'
              }
            },
            {
              value: 'billing',
              label: {
                en: 'Billing & Subscription',
                fr: 'Facturation & Abonnement',
                es: 'Facturación y Suscripción'
              }
            },
            {
              value: 'partnership',
              label: {
                en: 'Partnership Opportunity',
                fr: 'Opportunité de partenariat',
                es: 'Oportunidad de asociación'
              }
            },
            {
              value: 'feedback',
              label: {
                en: 'Feedback & Suggestions',
                fr: 'Retour & Suggestions',
                es: 'Comentarios y Sugerencias'
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
        },
        {
          name: 'message',
          label: {
            en: 'Message',
            fr: 'Message',
            es: 'Mensaje'
          },
          placeholder: {
            en: 'Tell us how we can help you...',
            fr: 'Dites-nous comment nous pouvons vous aider...',
            es: 'Díganos cómo podemos ayudarle...'
          },
          type: 'textarea',
          required: true
        }
      ],
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
        en: 'Thank you for your message! We\'ll get back to you within 24 hours.',
        fr: 'Merci pour votre message ! Nous vous répondrons sous 24 heures.',
        es: '¡Gracias por su mensaje! Le responderemos en 24 horas.'
      },
      errorMessage: {
        en: 'Please fill in all required fields',
        fr: 'Veuillez remplir tous les champs obligatoires',
        es: 'Por favor complete todos los campos obligatorios'
      }
    },
    workingHours: {
      title: {
        en: 'Working Hours',
        fr: 'Horaires d\'ouverture',
        es: 'Horario de atención'
      },
      schedule: {
        en: 'Monday - Friday: 9:00 AM - 6:00 PM (EST)',
        fr: 'Lundi - Vendredi : 9h00 - 18h00 (CET)',
        es: 'Lunes - Viernes: 9:00 - 18:00 (CET)'
      }
    }
  };
};

/**
 * Envoie les données du formulaire de contact
 * TODO: Remplacer par un appel API au backoffice
 */
export const submitContactForm = async (data: ContactFormData): Promise<void> => {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simuler une validation côté serveur
  if (!data.fullName || !data.email || !data.subject || !data.message) {
    throw new Error('Missing required fields');
  }

  // En production, ceci serait un appel API réel
  console.log('Contact form submitted:', data);
  
  // Simuler une réponse réussie
  return;
};
