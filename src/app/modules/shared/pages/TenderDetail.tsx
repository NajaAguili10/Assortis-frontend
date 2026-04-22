import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TendersSubMenu } from '@app/components/TendersSubMenu';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { StatusBadge } from '@app/components/StatusBadge';
import { Separator } from '@app/components/ui/separator';
import { useTenders } from '@app/hooks/useTenders';
import {
  Calendar,
  DollarSign,
  FileText,
  Download,
  TrendingUp,
  AlertCircle,
  Building2,
  Clock,
  CheckCircle,
  FileCheck,
  MapPin,
  Target,
  Award,
  Mail,
  ExternalLink,
  Eye,
} from 'lucide-react';

type TabType = 'overview' | 'documents' | 'workflow';

// Fallback translations for missing keys
const fallbackTranslations: Record<string, Record<string, string>> = {
  en: {
    'tenders.detail.descriptionExtended': 'This tender represents a significant opportunity for organizations with proven expertise in the relevant sectors. The selected partner will work closely with stakeholders to deliver impactful results aligned with international development goals.',
    'tenders.detail.objectives': 'Key Objectives',
    'tenders.detail.objective1': 'Deliver high-quality, sustainable results that create lasting impact',
    'tenders.detail.objective2': 'Build capacity of local stakeholders and institutions',
    'tenders.detail.objective3': 'Ensure compliance with international standards and best practices',
    'tenders.detail.objective4': 'Monitor and evaluate progress with data-driven insights',
    'tenders.detail.interestedTitle': 'Interested in this opportunity?',
    'tenders.detail.interestedDesc': 'Submit your proposal before the deadline',
    'tenders.detail.readyToApply': 'Ready to submit your proposal?',
    'tenders.detail.applyDesc': "Don't miss this opportunity. Apply before",
    'tenders.detail.viewOnline': 'View Online',
    'tenders.messages.applicationStarted': 'Application process started',
    'tenders.messages.linkCopied': 'Link copied to clipboard',
  },
  fr: {
    'tenders.detail.descriptionExtended': "Cette opportunité représente un appel d'offres significatif pour les organisations ayant une expertise avérée dans les secteurs concernés. Le partenaire sélectionné travaillera en étroite collaboration avec les parties prenantes pour obtenir des résultats impactants alignés sur les objectifs de développement internationaux.",
    'tenders.detail.objectives': 'Objectifs clés',
    'tenders.detail.objective1': 'Fournir des résultats durables et de qualité avec un impact durable',
    'tenders.detail.objective2': 'Renforcer les capacités des parties prenantes et institutions locales',
    'tenders.detail.objective3': 'Assurer la conformité avec les normes et bonnes pratiques internationales',
    'tenders.detail.objective4': 'Surveiller et évaluer les progrès avec des données analytiques',
    'tenders.detail.interestedTitle': 'Intéressé par cette opportunité ?',
    'tenders.detail.interestedDesc': 'Soumettez votre proposition avant la date limite',
    'tenders.detail.readyToApply': 'Prêt à soumettre votre proposition ?',
    'tenders.detail.applyDesc': "Ne manquez pas cette opportunité. Postulez avant",
    'tenders.detail.viewOnline': 'Voir en ligne',
    'tenders.messages.applicationStarted': 'Processus de candidature démarré',
    'tenders.messages.linkCopied': 'Lien copié dans le presse-papiers',
  },
  es: {
    'tenders.detail.descriptionExtended': 'Esta licitación representa una oportunidad significativa para organizaciones con experiencia demostrada en los sectores relevantes. El socio seleccionado trabajará en estrecha colaboración con las partes interesadas para lograr resultados impactantes alineados con los objetivos de desarrollo internacional.',
    'tenders.detail.objectives': 'Objetivos clave',
    'tenders.detail.objective1': 'Entregar resultados sostenibles y de alta calidad que generen un impacto duradero',
    'tenders.detail.objective2': 'Desarrollar la capacidad de las partes interesadas e instituciones locales',
    'tenders.detail.objective3': 'Garantizar el cumplimiento de normas y mejores prácticas internacionales',
    'tenders.detail.objective4': 'Monitorear y evaluar el progreso con información basada en datos',
    'tenders.detail.interestedTitle': '¿Interesado en esta oportunidad?',
    'tenders.detail.interestedDesc': 'Envíe su propuesta antes de la fecha límite',
    'tenders.detail.readyToApply': '¿Listo para enviar su propuesta?',
    'tenders.detail.applyDesc': 'No pierda esta oportunidad. Aplique antes de',
    'tenders.detail.viewOnline': 'Ver en línea',
    'tenders.messages.applicationStarted': 'Proceso de aplicación iniciado',
    'tenders.messages.linkCopied': 'Enlace copiado al portapapeles',
  },
};

export default function TenderDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { allTenders, kpis } = useTenders();
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Helper function to get translation with fallback
  const getTrans = (key: string): string => {
    const translation = t(key);
    if (translation === key && fallbackTranslations[language]?.[key]) {
      return fallbackTranslations[language][key];
    }
    return translation;
  };

  // Helper function to handle file downloads
  const handleDownload = (fileName: string) => {
    // Create a blob with sample content
    const content = `Sample document: ${fileName}\nGenerated on: ${new Date().toLocaleString()}\n\nThis is a demo file download.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Helper function to view document
  const handleViewDocument = (fileName: string) => {
    const documentType = fileName.split('.').pop()?.toLowerCase() || 'txt';
    let docContent = '';
    
    // Generate content based on document type and language
    if (documentType === 'pdf') {
      docContent = language === 'fr' 
        ? `APERÇU PDF - ${fileName}\n\nAperçu de démonstration du document PDF.\nGénéré le: ${new Date().toLocaleString('fr-FR')}\n\nFonctionnalités:\n- Zoom\n- Navigation\n- Recherche\n- Téléchargement\n- Impression\n\nAssortis - Visualisation de document`
        : language === 'es'
        ? `VISTA PREVIA PDF - ${fileName}\n\nVista previa de demostración del documento PDF.\nGenerado el: ${new Date().toLocaleString('es-ES')}\n\nFuncionalidades:\n- Zoom\n- Navegación\n- Búsqueda\n- Descarga\n- Impresión\n\nAssortis - Visualización de documento`
        : `PDF PREVIEW - ${fileName}\n\nDemonstration preview of PDF document.\nGenerated on: ${new Date().toLocaleString('en-US')}\n\nFeatures:\n- Zoom\n- Navigation\n- Search\n- Download\n- Print\n\nAssortis - Document Viewer`;
    } else if (documentType === 'docx') {
      docContent = language === 'fr'
        ? `APERÇU WORD - ${fileName}\n\nFormulaire de candidature\n\nInstructions:\nVeuillez remplir toutes les sections.\n\nSections:\n1. Informations organisation\n2. Expérience\n3. Proposition technique\n4. Proposition financière\n\nAssortis`
        : language === 'es'
        ? `VISTA PREVIA WORD - ${fileName}\n\nFormulario de solicitud\n\nInstrucciones:\nComplete todas las secciones.\n\nSecciones:\n1. Información organización\n2. Experiencia\n3. Propuesta técnica\n4. Propuesta financiera\n\nAssortis`
        : `WORD PREVIEW - ${fileName}\n\nApplication Form\n\nInstructions:\nPlease complete all sections.\n\nSections:\n1. Organization information\n2. Experience\n3. Technical proposal\n4. Financial proposal\n\nAssortis`;
    } else if (documentType === 'xlsx') {
      docContent = language === 'fr'
        ? `APERÇU EXCEL - ${fileName}\n\nModèle de budget\n\nFeuilles:\n1. Résumé budget\n2. Coûts personnel\n3. Équipement\n4. Frais voyage\n5. Autres coûts\n\nAssortis`
        : language === 'es'
        ? `VISTA PREVIA EXCEL - ${fileName}\n\nPlantilla de presupuesto\n\nHojas:\n1. Resumen presupuesto\n2. Costos personal\n3. Equipamiento\n4. Gastos viaje\n5. Otros costos\n\nAssortis`
        : `EXCEL PREVIEW - ${fileName}\n\nBudget Template\n\nSheets:\n1. Budget summary\n2. Personnel costs\n3. Equipment\n4. Travel expenses\n5. Other costs\n\nAssortis`;
    } else {
      docContent = `DOCUMENT: ${fileName}\nDate: ${new Date().toLocaleString()}\n\nDocument preview...`;
    }
    
    const blob = new Blob([docContent], { type: 'text/plain; charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      alert(language === 'fr' 
        ? `Visualisation de: ${fileName}\n\nVeuillez autoriser les popups.` 
        : language === 'es'
        ? `Visualización de: ${fileName}\n\nPermita las ventanas emergentes.`
        : `Viewing: ${fileName}\n\nPlease allow popups.`);
    }
    
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  };

  // Find tender by ID - use allTenders not tenders.data
  const tender = allTenders.find((t) => String(t.id) === String(id));

  if (!tender) {
    return (
      <div className="min-h-screen">
        {/* Banner */}
        <PageBanner
          title={t('tenders.title')}
          description={t('tenders.subtitle')}
          icon={FileText}
          stats={[
            { value: kpis.activeTenders.toString(), label: t('tenders.kpis.active') }
          ]}
        />

        {/* Sub Menu */}
        <TendersSubMenu />

        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-8">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold text-primary mb-2">
                {t('tenders.detail.notFound')}
              </h2>
              <p className="text-gray-600 mb-6">{t('tenders.detail.notFound.message')}</p>
              <Button onClick={() => navigate('/calls')}>
                {t('tenders.detail.backToList')}
              </Button>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  const isUrgent = tender.daysRemaining <= 7;
  const isToday = tender.daysRemaining === 0;

  const getDeadlineDisplay = () => {
    if (isToday) {
      return t('tenders.detail.deadline.today');
    }
    return t('tenders.detail.deadline.days', { days: tender.daysRemaining.toString() });
  };

  const countryFlags: Record<string, string> = {
    FR: '🇫🇷',
    DE: '🇩🇪',
    GB: '🇬🇧',
    US: '🇺🇸',
    CA: '🇨🇦',
    KE: '🇰🇪',
    TZ: '🇹🇿',
    SN: '🇸🇳',
    CI: '🇨🇮',
    MA: '🇲🇦',
  };

  const tabs = [
    { key: 'overview' as TabType, labelKey: 'tenders.detail.tabs.overview', icon: FileText },
    { key: 'documents' as TabType, labelKey: 'tenders.detail.tabs.documents', icon: Download },
    { key: 'workflow' as TabType, labelKey: 'tenders.detail.tabs.workflow', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <PageBanner
        title={t('tenders.module.title')}
        description={t('tenders.module.subtitle')}
        icon={FileText}
        stats={[
          { value: kpis.activeTenders.toString(), label: t('tenders.kpis.active') }
        ]}
      />

      {/* Sub Menu */}
      <TendersSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Hero Card - Commercial & Attractive */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            {/* Header with White Background - Assortis Design System */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  {/* Badges Row */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <StatusBadge status={tender.status} />
                    {tender.matchScore && tender.matchScore >= 70 && (
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {tender.matchScore}% {t('tenders.detail.matchScore')}
                      </Badge>
                    )}
                    {isUrgent && (
                      <Badge className="bg-orange-50 text-orange-700 border-orange-200 animate-pulse">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {t('tenders.detail.deadline.urgent')}
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl md:text-3xl font-bold mb-3 leading-tight text-primary">
                    {tender.title}
                  </h1>
                  
                  {/* Reference Number */}
                  <p className="text-gray-500 text-sm mb-3 font-mono">
                    {t('tenders.detail.reference')}: <span className="text-gray-700 font-medium">{tender.referenceNumber}</span>
                  </p>

                  {/* Organization */}
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-base font-semibold text-gray-700">{tender.organizationName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Info Grid - Attractive Layout */}
            <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Budget */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">{t('tenders.detail.budget')}</p>
                      <p className="text-xl font-bold text-primary truncate">{tender.budget.formatted}</p>
                    </div>
                  </div>
                </div>

                {/* Deadline */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isUrgent ? 'bg-orange-100' : 'bg-blue-100'
                    }`}>
                      <Calendar className={`w-5 h-5 ${isUrgent ? 'text-orange-600' : 'text-blue-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">{t('tenders.detail.deadline')}</p>
                      <p className={`text-xl font-bold ${isUrgent ? 'text-orange-600' : 'text-primary'}`}>
                        {getDeadlineDisplay()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">{t('tenders.detail.location')}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{countryFlags[tender.country] || '🌍'}</span>
                        <span className="font-bold text-primary">{tender.country}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sectors Tags */}
            {tender.sectors && tender.sectors.length > 0 && (
              <div className="px-6 pb-6">
                <p className="text-sm text-gray-500 mb-3 font-medium">
                  {t('tenders.detail.sectors')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tender.sectors.map((sector) => (
                    <Badge 
                      key={sector} 
                      variant="outline" 
                      className="text-sm bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
                    >
                      <Target className="w-3 h-3 mr-1" />
                      {t(`sectors.${sector}`)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tabs Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Tab Headers */}
            <div className="border-b border-gray-200 bg-gray-50/50">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                      activeTab === tab.key
                        ? 'border-accent text-accent bg-white'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {t(tab.labelKey)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6 md:p-8">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Description Section */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-primary">
                        {t('tenders.detail.description')}
                      </h3>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 leading-relaxed">
                        This is a comprehensive {tender.title} focused on {tender.sectors.map(s => t(`sectors.${s}`)).join(', ')}. 
                        The project is implemented by {tender.organizationName} in {tender.country} with a total budget of {tender.budget.formatted}.
                        The deadline for submissions is in {tender.daysRemaining} days.
                      </p>
                      <p className="text-gray-700 leading-relaxed mt-4">
                        {getTrans('tenders.detail.descriptionExtended')}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Objectives Section */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-accent" />
                      </div>
                      <h3 className="text-xl font-bold text-primary">
                        {getTrans('tenders.detail.objectives')}
                      </h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((num) => (
                        <div key={num} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">{num}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-700">
                              {getTrans(`tenders.detail.objective${num}`) || 
                              `Deliver high-quality results in ${tender.sectors[0] || 'the specified sector'}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Requirements Section */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileCheck className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-primary">
                        {t('tenders.detail.requirements')}
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {[
                        `Minimum 5 years of experience in ${tender.sectors.map(s => t(`sectors.${s}`)).join(' and ')}`,
                        `Previous work in ${tender.country} or similar contexts`,
                        'Strong technical and financial proposal',
                        'References from similar projects',
                        'Compliance with all technical specifications',
                        'Demonstrated organizational capacity'
                      ].map((req, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-700">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  {/* Timeline Section */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-bold text-primary">
                        {t('tenders.detail.timeline')}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-green-900 mb-1">
                            {t('tenders.status.published')}
                          </p>
                          <p className="text-sm text-green-700">
                            {new Date(tender.createdAt).toLocaleDateString(language, { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-start gap-4 p-4 rounded-lg border ${
                        isUrgent ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          isUrgent ? 'bg-orange-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className={`font-semibold mb-1 ${
                            isUrgent ? 'text-orange-900' : 'text-blue-900'
                          }`}>
                            {t('tenders.detail.deadline')}
                          </p>
                          <p className={`text-sm ${
                            isUrgent ? 'text-orange-700' : 'text-blue-700'
                          }`}>
                            {new Date(tender.deadline).toLocaleDateString(language, { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                            {' '}({getDeadlineDisplay()})
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Contact Information */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-gray-600" />
                      </div>
                      <h3 className="text-xl font-bold text-primary">
                        {t('tenders.detail.contact')}
                      </h3>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="text-xs text-gray-500">{t('tenders.detail.organization')}</p>
                            <p className="font-semibold text-gray-900">{tender.organizationName}</p>
                          </div>
                        </div>
                        {tender.contactEmail && (
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="text-xs text-gray-500">{t('common.email')}</p>
                              <a href={`mailto:${tender.contactEmail}`} className="font-semibold text-accent hover:underline">
                                {tender.contactEmail}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-primary">
                      {t('tenders.detail.attachments')}
                    </h3>
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => {
                        // Download all documents as a ZIP simulation
                        const allDocuments = [
                          { name: language === 'fr' ? 'Dossier_appel_offres.pdf' : language === 'es' ? 'Documento_licitacion.pdf' : 'Tender_Document.pdf', type: 'pdf' },
                          { name: language === 'fr' ? 'Termes_de_reference.pdf' : language === 'es' ? 'Terminos_de_referencia.pdf' : 'Terms_of_Reference.pdf', type: 'pdf' },
                          { name: language === 'fr' ? 'Formulaire_candidature.docx' : language === 'es' ? 'Formulario_solicitud.docx' : 'Application_Form.docx', type: 'docx' },
                          { name: language === 'fr' ? 'Specifications_techniques.pdf' : language === 'es' ? 'Especificaciones_tecnicas.pdf' : 'Technical_Specifications.pdf', type: 'pdf' },
                          { name: language === 'fr' ? 'Modele_budget.xlsx' : language === 'es' ? 'Plantilla_presupuesto.xlsx' : 'Budget_Template.xlsx', type: 'xlsx' }
                        ];
                        
                        // Create a text file listing all documents
                        const zipContent = `${language === 'fr' ? 'Archive des documents - Appel d\'offres' : language === 'es' ? 'Archivo de documentos - Licitación' : 'Documents Archive - Tender'}
${language === 'fr' ? 'Téléchargé le' : language === 'es' ? 'Descargado el' : 'Downloaded on'}: ${new Date().toLocaleString(language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US')}

${language === 'fr' ? 'Documents inclus' : language === 'es' ? 'Documentos incluidos' : 'Included documents'}:
${allDocuments.map((doc, idx) => `${idx + 1}. ${doc.name}`).join('\n')}

${language === 'fr' ? 'Note: Ceci est une simulation de téléchargement groupé.' : language === 'es' ? 'Nota: Esta es una simulación de descarga agrupada.' : 'Note: This is a batch download simulation.'}`;
                        
                        const blob = new Blob([zipContent], { type: 'text/plain' });
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = language === 'fr' ? 'Documents_Appel_Offres.txt' : language === 'es' ? 'Documentos_Licitacion.txt' : 'Tender_Documents.txt';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                      }}
                    >
                      <Download className="w-4 h-4" />
                      {t('tenders.actions.downloadAll')}
                    </Button>
                  </div>

                  {/* Documents Grid */}
                  <div className="grid gap-4">
                    {/* Tender Document */}
                    <div className="bg-white rounded-lg border-2 border-gray-200 p-5 hover:border-accent hover:shadow-md transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1 truncate">
                            {language === 'fr' ? 'Dossier d\'appel d\'offres complet.pdf' : 
                             language === 'es' ? 'Documento de licitación completo.pdf' : 
                             'Complete Tender Document.pdf'}
                          </h4>
                          <p className="text-sm text-gray-600 mb-3">
                            {language === 'fr' ? 'Document principal contenant toutes les spécifications techniques et les critères d\'évaluation' :
                             language === 'es' ? 'Documento principal que contiene todas las especificaciones técnicas y criterios de evaluación' :
                             'Main document containing all technical specifications and evaluation criteria'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>PDF • 2.4 MB</span>
                            <span>•</span>
                            <span>{language === 'fr' ? 'Mis à jour le' : language === 'es' ? 'Actualizado el' : 'Updated on'} {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US')}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            className="gap-2 flex-shrink-0"
                            style={{ backgroundColor: 'var(--color-accent)' }}
                            onClick={() => {
                              // Simulate download
                              const fileName = language === 'fr' ? 'Dossier_appel_offres.pdf' : 
                                             language === 'es' ? 'Documento_licitacion.pdf' : 
                                             'Tender_Document.pdf';
                              handleDownload(fileName);
                            }}
                          >
                            <Download className="w-4 h-4" />
                            {t('tenders.actions.download')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 flex-shrink-0"
                            onClick={() => {
                              // Simulate view
                              const fileName = language === 'fr' ? 'Dossier_appel_offres.pdf' : 
                                             language === 'es' ? 'Documento_licitacion.pdf' : 
                                             'Tender_Document.pdf';
                              handleViewDocument(fileName);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            {t('tenders.actions.view')}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Terms of Reference */}
                    <div className="bg-white rounded-lg border-2 border-gray-200 p-5 hover:border-accent hover:shadow-md transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileCheck className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1 truncate">
                            {language === 'fr' ? 'Termes de référence (TdR).pdf' :
                             language === 'es' ? 'Términos de referencia (TdR).pdf' :
                             'Terms of Reference (ToR).pdf'}
                          </h4>
                          <p className="text-sm text-gray-600 mb-3">
                            {language === 'fr' ? 'Portée des travaux, livrables attendus et calendrier du projet' :
                             language === 'es' ? 'Alcance del trabajo, entregables esperados y cronograma del proyecto' :
                             'Scope of work, expected deliverables and project timeline'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>PDF • 1.8 MB</span>
                            <span>•</span>
                            <span>{language === 'fr' ? 'Mis à jour le' : language === 'es' ? 'Actualizado el' : 'Updated on'} {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US')}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            className="gap-2 flex-shrink-0"
                            style={{ backgroundColor: 'var(--color-accent)' }}
                            onClick={() => {
                              const fileName = language === 'fr' ? 'Termes_de_reference.pdf' :
                                             language === 'es' ? 'Terminos_de_referencia.pdf' :
                                             'Terms_of_Reference.pdf';
                              handleDownload(fileName);
                            }}
                          >
                            <Download className="w-4 h-4" />
                            {t('tenders.actions.download')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 flex-shrink-0"
                            onClick={() => {
                              const fileName = language === 'fr' ? 'Termes_de_reference.pdf' :
                                             language === 'es' ? 'Terminos_de_referencia.pdf' :
                                             'Terms_of_Reference.pdf';
                              handleViewDocument(fileName);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            {t('tenders.actions.view')}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Application Form */}
                    <div className="bg-white rounded-lg border-2 border-gray-200 p-5 hover:border-accent hover:shadow-md transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1 truncate">
                            {language === 'fr' ? 'Formulaire de candidature.docx' :
                             language === 'es' ? 'Formulario de solicitud.docx' :
                             'Application Form.docx'}
                          </h4>
                          <p className="text-sm text-gray-600 mb-3">
                            {language === 'fr' ? 'Formulaire standard à remplir pour soumettre votre proposition' :
                             language === 'es' ? 'Formulario estándar para completar y enviar su propuesta' :
                             'Standard form to complete and submit your proposal'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>DOCX • 156 KB</span>
                            <span>•</span>
                            <span>{language === 'fr' ? 'Mis à jour le' : language === 'es' ? 'Actualizado el' : 'Updated on'} {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US')}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            className="gap-2 flex-shrink-0"
                            style={{ backgroundColor: 'var(--color-accent)' }}
                            onClick={() => {
                              const fileName = language === 'fr' ? 'Formulaire_candidature.docx' :
                                             language === 'es' ? 'Formulario_solicitud.docx' :
                                             'Application_Form.docx';
                              handleDownload(fileName);
                            }}
                          >
                            <Download className="w-4 h-4" />
                            {t('tenders.actions.download')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 flex-shrink-0"
                            onClick={() => {
                              const fileName = language === 'fr' ? 'Formulaire_candidature.docx' :
                                             language === 'es' ? 'Formulario_solicitud.docx' :
                                             'Application_Form.docx';
                              handleViewDocument(fileName);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            {t('tenders.actions.view')}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Technical Specifications */}
                    <div className="bg-white rounded-lg border-2 border-gray-200 p-5 hover:border-accent hover:shadow-md transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1 truncate">
                            {language === 'fr' ? 'Spécifications techniques.pdf' :
                             language === 'es' ? 'Especificaciones técnicas.pdf' :
                             'Technical Specifications.pdf'}
                          </h4>
                          <p className="text-sm text-gray-600 mb-3">
                            {language === 'fr' ? 'Exigences techniques détaillées et standards de qualité' :
                             language === 'es' ? 'Requisitos técnicos detallados y estándares de calidad' :
                             'Detailed technical requirements and quality standards'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>PDF • 3.1 MB</span>
                            <span>•</span>
                            <span>{language === 'fr' ? 'Mis à jour le' : language === 'es' ? 'Actualizado el' : 'Updated on'} {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US')}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            className="gap-2 flex-shrink-0"
                            style={{ backgroundColor: 'var(--color-accent)' }}
                            onClick={() => {
                              const fileName = language === 'fr' ? 'Specifications_techniques.pdf' :
                                             language === 'es' ? 'Especificaciones_tecnicas.pdf' :
                                             'Technical_Specifications.pdf';
                              handleDownload(fileName);
                            }}
                          >
                            <Download className="w-4 h-4" />
                            {t('tenders.actions.download')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 flex-shrink-0"
                            onClick={() => {
                              const fileName = language === 'fr' ? 'Specifications_techniques.pdf' :
                                             language === 'es' ? 'Especificaciones_tecnicas.pdf' :
                                             'Technical_Specifications.pdf';
                              handleViewDocument(fileName);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            {t('tenders.actions.view')}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Budget Template */}
                    <div className="bg-white rounded-lg border-2 border-gray-200 p-5 hover:border-accent hover:shadow-md transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1 truncate">
                            {language === 'fr' ? 'Modèle de budget.xlsx' :
                             language === 'es' ? 'Plantilla de presupuesto.xlsx' :
                             'Budget Template.xlsx'}
                          </h4>
                          <p className="text-sm text-gray-600 mb-3">
                            {language === 'fr' ? 'Modèle Excel pour la préparation du budget détaillé de votre proposition' :
                             language === 'es' ? 'Plantilla de Excel pour preparar el presupuesto detallado de su propuesta' :
                             'Excel template for preparing your detailed proposal budget'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>XLSX • 245 KB</span>
                            <span>•</span>
                            <span>{language === 'fr' ? 'Mis à jour le' : language === 'es' ? 'Actualizado el' : 'Updated on'} {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US')}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            className="gap-2 flex-shrink-0"
                            style={{ backgroundColor: 'var(--color-accent)' }}
                            onClick={() => {
                              const fileName = language === 'fr' ? 'Modele_budget.xlsx' :
                                             language === 'es' ? 'Plantilla_presupuesto.xlsx' :
                                             'Budget_Template.xlsx';
                              handleDownload(fileName);
                            }}
                          >
                            <Download className="w-4 h-4" />
                            {t('tenders.actions.download')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 flex-shrink-0"
                            onClick={() => {
                              const fileName = language === 'fr' ? 'Modele_budget.xlsx' :
                                             language === 'es' ? 'Plantilla_presupuesto.xlsx' :
                                             'Budget_Template.xlsx';
                              handleViewDocument(fileName);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            {t('tenders.actions.view')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'workflow' && (
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-5 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-green-900 mb-1 text-lg">
                        {t('tenders.status.published')}
                      </h4>
                      <p className="text-sm text-green-700">
                        {t('tenders.detail.workflow.published')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-blue-900 mb-1 text-lg">
                        {t('tenders.detail.workflow.submission')}
                      </h4>
                      <p className="text-sm text-blue-700">
                        {t('tenders.detail.workflow.submission.desc')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileCheck className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1 text-lg">
                        {t('tenders.detail.workflow.evaluation')}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {t('tenders.detail.workflow.evaluation.desc')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1 text-lg">
                        {t('tenders.detail.workflow.award')}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {t('tenders.detail.workflow.award.desc')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}