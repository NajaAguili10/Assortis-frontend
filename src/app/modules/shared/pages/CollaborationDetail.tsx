import { useParams, useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useProjects } from '@app/hooks/useProjects';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ProjectsSubMenu } from '@app/components/ProjectsSubMenu';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import {
  Briefcase,
  Handshake,
  FolderOpen,
  CheckSquare,
  Building2,
  Calendar,
  MapPin,
  Clock,
  Mail,
  Phone,
  Globe,
  Users,
  FileText,
  CheckCircle,
} from 'lucide-react';

export default function CollaborationDetail() {
  const { id } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { kpis } = useProjects();

  // Mock collaboration data - simplified for information display only
  const collaboration = {
    id: id,
    projectTitle: 'Rural Education Infrastructure Development',
    projectCode: 'PROJ-2024-001',
    
    // Partnership details
    type: 'IMPLEMENTATION',
    status: 'ACTIVE',
    startDate: '2023-06-01',
    endDate: '2025-05-31',
    duration: 24,
    description: 'Partnership focused on implementing rural education infrastructure with emphasis on community engagement, local capacity building, and sustainable development practices.',
    
    // Location information
    country: 'Kenya',
    region: 'Eastern Province',
    locations: ['Machakos County', 'Kitui County', 'Makueni County'],
    
    // Our organization (simplified)
    myOrganization: {
      name: 'Global Development Partners',
      type: 'INTERNATIONAL_NGO',
      role: 'Lead implementing partner and technical advisor',
      contribution: 'Project management, technical expertise, funding coordination, and quality assurance',
      contactPerson: {
        name: 'Sarah Johnson',
        role: 'Partnership Coordinator',
        email: 's.johnson@globaldevelopment.org',
        phone: '+1 555 123 4567',
      },
    },
    
    // Partner organization (simplified)
    partnerOrganization: {
      name: 'Local NGO Consortium',
      type: 'NGO',
      role: 'Local implementation and community mobilization',
      contribution: 'Community engagement, local project management, stakeholder coordination, and field operations',
      description: 'A consortium of local NGOs focused on community development, education, and social empowerment in rural areas of Eastern Kenya.',
      website: 'www.localngo-kenya.org',
      email: 'contact@localngo-kenya.org',
      phone: '+254 700 123 456',
      established: '2015',
      staffSize: 45,
      contactPerson: {
        name: 'James Mwangi',
        role: 'Partnership Coordinator',
        email: 'j.mwangi@localngo-kenya.org',
        phone: '+254 700 111 222',
      },
    },
    
    // Key objectives
    objectives: [
      'Construct and renovate educational facilities in rural areas',
      'Mobilize local communities for active participation',
      'Build capacity of local educators and administrators',
      'Ensure sustainable maintenance and operation',
    ],
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'FUNDING':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'TECHNICAL':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'IMPLEMENTATION':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ADVISORY':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'COMPLETED':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'SUSPENDED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('projects.hub.title')}
        description={t('projects.hub.subtitle')}
        icon={Briefcase}
        stats={[
          { value: kpis.activeProjects.toString(), label: t('projects.stats.activeProjects') }
        ]}
      />

      {/* Sub Menu */}
      <ProjectsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Header with Badges - Removed Back Button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-primary mb-2">{t('projects.collaborations.partnershipDetails')}</h2>
              <p className="text-base text-muted-foreground">{collaboration.projectTitle}</p>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className={`${getTypeColor(collaboration.type)} px-4 py-2`}>
                {t(`projects.collaborations.type.${collaboration.type}`)}
              </Badge>
              <Badge variant="outline" className={`${getStatusColor(collaboration.status)} px-4 py-2`}>
                {t(`projects.collaborations.status.${collaboration.status}`)}
              </Badge>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-primary">{t('projects.collaborations.projectInformation')}</h3>
                </div>

                <div className="space-y-5">
                  {/* Project Title & Code */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{t('projects.details.projectName')}</p>
                    <h4 className="font-semibold text-primary mb-1">{collaboration.projectTitle}</h4>
                    <p className="text-sm text-muted-foreground">{collaboration.projectCode}</p>
                  </div>

                  <Separator />

                  {/* Description */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{t('projects.collaborations.partnershipDescription')}</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{collaboration.description}</p>
                  </div>

                  <Separator />

                  {/* Timeline */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">{t('projects.collaborations.timeline')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{t('projects.collaborations.startDate')}</p>
                          <p className="text-sm font-semibold text-primary">
                            {new Date(collaboration.startDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{t('projects.collaborations.endDate')}</p>
                          <p className="text-sm font-semibold text-primary">
                            {new Date(collaboration.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                          <Clock className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{t('projects.collaborations.duration')}</p>
                          <p className="text-sm font-semibold text-primary">
                            {collaboration.duration} {t('common.months')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Location */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">{t('projects.collaborations.projectLocation')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{t('common.country')}</p>
                          <p className="text-sm font-semibold text-primary">{collaboration.country}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{t('common.region')}</p>
                          <p className="text-sm font-semibold text-primary">{collaboration.region}</p>
                        </div>
                      </div>
                    </div>

                    {collaboration.locations && collaboration.locations.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-muted-foreground mb-2">{t('projects.collaborations.specificLocations')}</p>
                        <div className="flex flex-wrap gap-2">
                          {collaboration.locations.map((location, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                              {location}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Objectives */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-primary">{t('projects.collaborations.keyObjectives')}</h3>
                </div>

                <div className="space-y-3">
                  {collaboration.objectives.map((objective, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{objective}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Partners Information */}
            <div className="space-y-6">
              {/* My Organization */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-primary">{t('projects.collaborations.myOrganization')}</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-primary mb-1">{collaboration.myOrganization.name}</h4>
                    <Badge variant="secondary" className="text-xs mb-3">
                      {t(`organizations.type.${collaboration.myOrganization.type}`)}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('projects.collaborations.role')}</p>
                    <p className="text-sm font-medium text-gray-700">{collaboration.myOrganization.role}</p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">{t('projects.collaborations.contribution')}</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{collaboration.myOrganization.contribution}</p>
                  </div>

                  <Separator />

                  {/* Contact Person */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-3">{t('projects.collaborations.contactPerson')}</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-semibold text-primary">{collaboration.myOrganization.contactPerson.name}</p>
                        <p className="text-xs text-muted-foreground">{collaboration.myOrganization.contactPerson.role}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a href={`mailto:${collaboration.myOrganization.contactPerson.email}`} className="text-primary hover:underline text-xs">
                          {collaboration.myOrganization.contactPerson.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-muted-foreground text-xs">{collaboration.myOrganization.contactPerson.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Partner Organization */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-primary">{t('projects.collaborations.partnerOrganization')}</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-primary mb-1">{collaboration.partnerOrganization.name}</h4>
                    <Badge variant="secondary" className="text-xs mb-3">
                      {collaboration.partnerOrganization.type}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">{t('common.description')}</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{collaboration.partnerOrganization.description}</p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('projects.collaborations.role')}</p>
                    <p className="text-sm font-medium text-gray-700">{collaboration.partnerOrganization.role}</p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">{t('projects.collaborations.contribution')}</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{collaboration.partnerOrganization.contribution}</p>
                  </div>

                  <Separator />

                  {/* Organization Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('projects.collaborations.established')}</p>
                      <p className="text-sm font-semibold text-primary">{collaboration.partnerOrganization.established}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('projects.collaborations.staffSize')}</p>
                      <p className="text-sm font-semibold text-primary">{collaboration.partnerOrganization.staffSize}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Contact Information */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a href={`https://${collaboration.partnerOrganization.website}`} className="text-primary hover:underline text-xs truncate">
                        {collaboration.partnerOrganization.website}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${collaboration.partnerOrganization.email}`} className="text-primary hover:underline text-xs truncate">
                        {collaboration.partnerOrganization.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-muted-foreground text-xs">{collaboration.partnerOrganization.phone}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Contact Person */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-3">{t('projects.collaborations.contactPerson')}</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-semibold text-primary">{collaboration.partnerOrganization.contactPerson.name}</p>
                        <p className="text-xs text-muted-foreground">{collaboration.partnerOrganization.contactPerson.role}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a href={`mailto:${collaboration.partnerOrganization.contactPerson.email}`} className="text-primary hover:underline text-xs">
                          {collaboration.partnerOrganization.contactPerson.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-muted-foreground text-xs">{collaboration.partnerOrganization.contactPerson.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h4 className="text-sm font-semibold text-blue-900">{t('projects.collaborations.relatedProject')}</h4>
                </div>
                <p className="text-xs text-blue-700 mb-3">
                  {t('projects.collaborations.viewFullProject')}
                </p>
                <Button 
                  variant="default"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/projects/1`)}
                >
                  {t('projects.actions.viewProject')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}