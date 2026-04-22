import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TendersSubMenu } from '@app/components/TendersSubMenu';
import { StatCard } from '@app/components/StatCard';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import { useTenders } from '@app/hooks/useTenders';
import { TemplateDTO, TemplateTypeEnum, SectorEnum } from '@app/types/tender.dto';
import { toast } from 'sonner';
import {
  FileType,
  Search,
  Filter,
  Download,
  Eye,
  Copy,
  Edit,
  Trash2,
  Plus,
  AlertCircle,
  Globe,
  Lock,
  TrendingUp,
  FileText,
  X,
  Upload,
} from 'lucide-react';

export default function Templates() {
  const { t } = useLanguage();
  const { kpis } = useTenders();
  const navigate = useNavigate();

  // Mock data
  const [templates, setTemplates] = useState<TemplateDTO[]>([
    {
      id: '1',
      name: 'Standard Technical Proposal Template',
      description: 'Comprehensive template for technical proposals including methodology, team composition, and timeline.',
      type: TemplateTypeEnum.TECHNICAL,
      sectors: [SectorEnum.INFRASTRUCTURE, SectorEnum.ENERGY],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-02-10'),
      usageCount: 45,
      isPublic: true,
      fileSize: 2048000,
      fileUrl: '/templates/technical-proposal.docx',
    },
    {
      id: '2',
      name: 'Budget and Financial Proposal Template',
      description: 'Detailed budget breakdown template with cost justification and financial projections.',
      type: TemplateTypeEnum.FINANCIAL,
      sectors: [SectorEnum.HEALTH, SectorEnum.EDUCATION],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-02-15'),
      usageCount: 38,
      isPublic: false,
      fileSize: 1536000,
      fileUrl: '/templates/financial-proposal.xlsx',
    },
    {
      id: '3',
      name: 'Full Proposal Package Template',
      description: 'Complete proposal template including cover letter, technical approach, and budget.',
      type: TemplateTypeEnum.PROPOSAL,
      sectors: [SectorEnum.AGRICULTURE, SectorEnum.ENVIRONMENT],
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-20'),
      usageCount: 52,
      isPublic: true,
      fileSize: 3072000,
      fileUrl: '/templates/full-proposal.docx',
    },
    {
      id: '4',
      name: 'Cover Letter Template - International Organizations',
      description: 'Professional cover letter template tailored for UN agencies and international organizations.',
      type: TemplateTypeEnum.COVER_LETTER,
      sectors: [SectorEnum.GOVERNANCE, SectorEnum.HUMAN_RIGHTS],
      createdAt: new Date('2024-02-05'),
      updatedAt: new Date('2024-02-18'),
      usageCount: 67,
      isPublic: true,
      fileSize: 512000,
      fileUrl: '/templates/cover-letter.docx',
    },
    {
      id: '5',
      name: 'Budget Template for Multi-Year Projects',
      description: 'Comprehensive budget template for projects spanning multiple years with inflation calculations.',
      type: TemplateTypeEnum.BUDGET,
      sectors: [SectorEnum.WATER_SANITATION, SectorEnum.INFRASTRUCTURE],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-02-12'),
      usageCount: 29,
      isPublic: false,
      fileSize: 2048000,
      fileUrl: '/templates/multi-year-budget.xlsx',
    },
    {
      id: '6',
      name: 'Gender Mainstreaming Proposal Template',
      description: 'Specialized template for proposals focusing on gender equality and women empowerment.',
      type: TemplateTypeEnum.TECHNICAL,
      sectors: [SectorEnum.GENDER],
      createdAt: new Date('2024-02-08'),
      updatedAt: new Date('2024-02-22'),
      usageCount: 21,
      isPublic: true,
      fileSize: 1792000,
      fileUrl: '/templates/gender-proposal.docx',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TemplateTypeEnum | 'all'>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDTO | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: TemplateTypeEnum.PROPOSAL,
    sectors: [] as SectorEnum[],
    isPublic: true,
  });

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || template.type === typeFilter;
    const matchesVisibility =
      visibilityFilter === 'all' ||
      (visibilityFilter === 'public' && template.isPublic) ||
      (visibilityFilter === 'private' && !template.isPublic);

    return matchesSearch && matchesType && matchesVisibility;
  });

  // Calculate KPIs
  const totalTemplates = templates.length;
  const publicTemplates = templates.filter((t) => t.isPublic).length;
  const totalUsage = templates.reduce((acc, t) => acc + t.usageCount, 0);
  const avgUsage = templates.length > 0 ? Math.round(totalUsage / templates.length) : 0;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getTypeIcon = (type: TemplateTypeEnum) => {
    switch (type) {
      case TemplateTypeEnum.PROPOSAL:
        return FileText;
      case TemplateTypeEnum.TECHNICAL:
        return FileType;
      case TemplateTypeEnum.FINANCIAL:
      case TemplateTypeEnum.BUDGET:
        return TrendingUp;
      default:
        return FileText;
    }
  };

  const handleCreate = () => {
    const newTemplate: TemplateDTO = {
      id: `${templates.length + 1}`,
      name: formData.name,
      description: formData.description,
      type: formData.type,
      sectors: formData.sectors,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      isPublic: formData.isPublic,
      fileSize: 2048000,
      fileUrl: `/templates/${formData.name.toLowerCase().replace(/\s+/g, '-')}.docx`,
    };

    setTemplates([...templates, newTemplate]);
    toast.success(t('templates.toast.created'));
    setShowCreateModal(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!selectedTemplate) return;

    setTemplates(
      templates.map((t) =>
        t.id === selectedTemplate.id
          ? {
              ...t,
              name: formData.name,
              description: formData.description,
              type: formData.type,
              sectors: formData.sectors,
              isPublic: formData.isPublic,
              updatedAt: new Date(),
            }
          : t
      )
    );

    toast.success(t('templates.toast.updated'));
    setShowEditModal(false);
    setSelectedTemplate(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedTemplate) return;

    setTemplates(templates.filter((t) => t.id !== selectedTemplate.id));
    toast.success(t('templates.toast.deleted'));
    setShowDeleteModal(false);
    setSelectedTemplate(null);
  };

  const handleCopy = (template: TemplateDTO) => {
    const copiedTemplate: TemplateDTO = {
      ...template,
      id: `${templates.length + 1}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
    };

    setTemplates([...templates, copiedTemplate]);
    toast.success(t('templates.toast.copied'));
  };

  const handleDownload = (template: TemplateDTO) => {
    // Simulate download
    toast.success(t('templates.toast.downloaded'));
    
    // In real implementation, this would trigger actual file download
    const link = document.createElement('a');
    link.href = template.fileUrl;
    link.download = template.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openEditModal = (template: TemplateDTO) => {
    // Navigate to edit page instead of opening modal
    navigate(`/tenders/template-edit/${template.id}`);
  };

  const openViewModal = (template: TemplateDTO) => {
    setSelectedTemplate(template);
    setShowViewModal(true);
  };

  const openDeleteModal = (template: TemplateDTO) => {
    setSelectedTemplate(template);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: TemplateTypeEnum.PROPOSAL,
      sectors: [],
      isPublic: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Banner */}
      <PageBanner
        title={t('tenders.module.title')}
        description={t('tenders.module.subtitle')}
        icon={FileText}
        stats={[
          { value: kpis.activeTenders.toString(), label: t('tenders.kpis.activeTenders') }
        ]}
      />

      {/* Sub Menu */}
      <TendersSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
            <StatCard
              title={t('templates.kpis.total')}
              value={totalTemplates.toString()}
              subtitle={t('templates.kpis.totalSubtitle')}
              icon={FileType}
              iconBgColor="bg-green-50"
              iconColor="text-green-500"
            />
            <StatCard
              title={t('templates.kpis.public')}
              value={publicTemplates.toString()}
              subtitle={t('templates.kpis.publicSubtitle')}
              icon={Globe}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
            />
            <StatCard
              title={t('templates.kpis.totalUsage')}
              value={totalUsage.toString()}
              subtitle={t('templates.kpis.totalUsageSubtitle')}
              icon={TrendingUp}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-500"
            />
            <StatCard
              title={t('templates.kpis.avgUsage')}
              value={avgUsage.toString()}
              subtitle={t('templates.kpis.avgUsageSubtitle')}
              icon={FileText}
              iconBgColor="bg-orange-50"
              iconColor="text-orange-500"
            />
          </div>

          <Separator className="my-6" />

          {/* Create Template Button */}
          <div className="mb-6">
            <Button className="gap-2" onClick={() => navigate('/tenders/template-create')}>
              <Plus className="w-4 h-4" />
              {t('templates.actions.create')}
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-primary">{t('filters.title')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('filters.search')}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={t('templates.search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('templates.filters.type')}
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as TemplateTypeEnum | 'all')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="all">{t('filters.all')}</option>
                  {Object.values(TemplateTypeEnum).map((type) => (
                    <option key={type} value={type}>
                      {t(`templates.types.${type.toLowerCase()}`)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Visibility Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('templates.filters.visibility')}
                </label>
                <select
                  value={visibilityFilter}
                  onChange={(e) => setVisibilityFilter(e.target.value as 'all' | 'public' | 'private')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="all">{t('filters.all')}</option>
                  <option value="public">{t('templates.visibility.public')}</option>
                  <option value="private">{t('templates.visibility.private')}</option>
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {(searchQuery || typeFilter !== 'all' || visibilityFilter !== 'all') && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{t('filters.active')}:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    {searchQuery}
                    <button onClick={() => setSearchQuery('')}>×</button>
                  </Badge>
                )}
                {typeFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {t(`templates.types.${typeFilter.toLowerCase()}`)}
                    <button onClick={() => setTypeFilter('all')}>×</button>
                  </Badge>
                )}
                {visibilityFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {t(`templates.visibility.${visibilityFilter}`)}
                    <button onClick={() => setVisibilityFilter('all')}>×</button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('all');
                    setVisibilityFilter('all');
                  }}
                  className="text-xs ml-auto"
                >
                  {t('filters.clear')}
                </Button>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Templates Grid */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary">
                {t('templates.list.title')} ({filteredTemplates.length})
              </h2>
            </div>

            {filteredTemplates.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('templates.empty.title')}
                </h3>
                <p className="text-gray-600 mb-6">{t('templates.empty.message')}</p>
                <Button onClick={() => navigate('/tenders/template-create')}>
                  <Plus className="w-4 h-4 mr-1" />
                  {t('templates.actions.create')}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTemplates.map((template) => {
                  const TypeIcon = getTypeIcon(template.type);

                  return (
                    <div
                      key={template.id}
                      className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                          <TypeIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex items-center gap-2">
                          {template.isPublic ? (
                            <Badge className="bg-blue-50 text-blue-700">
                              <Globe className="w-3 h-3 mr-1" />
                              {t('templates.visibility.public')}
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-700">
                              <Lock className="w-3 h-3 mr-1" />
                              {t('templates.visibility.private')}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <h3 className="text-base font-semibold text-primary mb-2 line-clamp-2">
                        {template.name}
                      </h3>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {template.description}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <Badge variant="outline" className="text-xs">
                          {t(`templates.types.${template.type.toLowerCase()}`)}
                        </Badge>
                        {template.sectors.slice(0, 2).map((sector) => (
                          <Badge key={sector} variant="outline" className="text-xs">
                            {t(`sectors.${sector}`)}
                          </Badge>
                        ))}
                        {template.sectors.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.sectors.length - 2}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b">
                        <span>{formatFileSize(template.fileSize)}</span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {template.usageCount} {t('templates.uses')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleDownload(template)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          {t('templates.actions.download')}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openViewModal(template)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCopy(template)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 text-xs"
                          onClick={() => openEditModal(template)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          {t('templates.actions.edit')}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 text-xs"
                          onClick={() => openDeleteModal(template)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          {t('templates.actions.delete')}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </PageContainer>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-primary">
                {showCreateModal ? t('templates.modal.create.title') : t('templates.modal.edit.title')}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedTemplate(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('templates.form.name')}
                </label>
                <Input
                  placeholder={t('templates.form.namePlaceholder')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('templates.form.description')}
                </label>
                <textarea
                  placeholder={t('templates.form.descriptionPlaceholder')}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent min-h-[100px]"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('templates.form.type')}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as TemplateTypeEnum })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {Object.values(TemplateTypeEnum).map((type) => (
                    <option key={type} value={type}>
                      {t(`templates.types.${type.toLowerCase()}`)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('templates.form.visibility')}
                </label>
                <select
                  value={formData.isPublic ? 'public' : 'private'}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.value === 'public' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="public">{t('templates.visibility.public')}</option>
                  <option value="private">{t('templates.visibility.private')}</option>
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('templates.form.file')}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-accent transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">DOC, DOCX, PDF, XLS, XLSX (max. 10MB)</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedTemplate(null);
                  resetForm();
                }}
              >
                {t('templates.form.cancel')}
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onClick={showCreateModal ? handleCreate : handleUpdate}
                disabled={!formData.name || !formData.description}
              >
                {showCreateModal ? t('templates.form.submit') : t('templates.form.update')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-primary">
                {t('templates.modal.view.title')}
              </h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTemplate(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{t('templates.details.name')}</p>
                  <p className="text-sm text-gray-900">{selectedTemplate.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{t('templates.details.type')}</p>
                  <Badge variant="outline">
                    {t(`templates.types.${selectedTemplate.type.toLowerCase()}`)}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{t('templates.details.description')}</p>
                <p className="text-sm text-gray-900">{selectedTemplate.description}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{t('templates.details.sectors')}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedTemplate.sectors.map((sector) => (
                    <Badge key={sector} variant="outline" className="text-xs">
                      {t(`sectors.${sector}`)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{t('templates.details.visibility')}</p>
                  <div>
                    {selectedTemplate.isPublic ? (
                      <Badge className="bg-blue-50 text-blue-700">
                        <Globe className="w-3 h-3 mr-1" />
                        {t('templates.visibility.public')}
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-700">
                        <Lock className="w-3 h-3 mr-1" />
                        {t('templates.visibility.private')}
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{t('templates.details.fileSize')}</p>
                  <p className="text-sm text-gray-900">{formatFileSize(selectedTemplate.fileSize)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{t('templates.details.usageCount')}</p>
                  <p className="text-sm text-gray-900">{selectedTemplate.usageCount} {t('templates.uses')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{t('templates.details.createdAt')}</p>
                  <p className="text-sm text-gray-900">{selectedTemplate.createdAt.toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{t('templates.details.updatedAt')}</p>
                <p className="text-sm text-gray-900">{selectedTemplate.updatedAt.toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTemplate(null);
                }}
              >
                {t('common.close')}
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onClick={() => {
                  handleDownload(selectedTemplate);
                  setShowViewModal(false);
                  setSelectedTemplate(null);
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                {t('templates.actions.download')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-primary">
                {t('templates.modal.delete.title')}
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              {t('templates.modal.delete.message')}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-gray-900 mb-1">
                {selectedTemplate.name}
              </p>
              <p className="text-sm text-gray-600">
                {t(`templates.types.${selectedTemplate.type.toLowerCase()}`)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTemplate(null);
                }}
              >
                {t('templates.modal.delete.cancel')}
              </Button>
              <Button
                variant="destructive"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('templates.modal.delete.confirm')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}