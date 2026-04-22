import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { SubMenu } from '@app/components/SubMenu';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Input } from '@app/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';
import {
  Users,
  LayoutDashboard,
  Database,
  UserCircle,
  Zap,
  UserCheck,
  FileText,
  Download,
  Search,
  Star,
  Eye,
  Calendar,
  FileType,
  DollarSign,
  BarChart,
  Presentation,
  ClipboardList,
  CheckSquare,
} from 'lucide-react';
import { toast } from 'sonner';

type TemplateCategory = 'ALL' | 'PROPOSAL' | 'BUDGET' | 'REPORT' | 'PRESENTATION' | 'PLANNING' | 'EVALUATION';
type TemplateFormat = 'DOCX' | 'PDF' | 'XLSX' | 'PPTX';

interface ExpertTemplate {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  format: TemplateFormat;
  fileSize: string;
  downloads: number;
  rating: number;
  reviewCount: number;
  lastUpdated: string;
  previewImage?: string;
  tags: string[];
  language: string;
}

export default function ExpertsTemplates() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL');

  // Mock templates data
  const [templates] = useState<ExpertTemplate[]>([
    {
      id: '1',
      title: 'Professional Proposal Template',
      description: 'Comprehensive proposal template for international tenders with executive summary, methodology, and budget sections',
      category: 'PROPOSAL',
      format: 'DOCX',
      fileSize: '2.4 MB',
      downloads: 1847,
      rating: 4.8,
      reviewCount: 234,
      lastUpdated: '2026-02-15',
      tags: ['Professional', 'Complete', 'Multi-language'],
      language: 'EN/FR/ES',
    },
    {
      id: '2',
      title: 'Budget Planning Spreadsheet',
      description: 'Detailed budget template with cost breakdown, resource allocation, and financial forecasting tools',
      category: 'BUDGET',
      format: 'XLSX',
      fileSize: '1.8 MB',
      downloads: 2134,
      rating: 4.9,
      reviewCount: 312,
      lastUpdated: '2026-02-10',
      tags: ['Excel', 'Formulas', 'Auto-calculate'],
      language: 'EN/FR/ES',
    },
    {
      id: '3',
      title: 'Project Progress Report',
      description: 'Comprehensive monthly/quarterly report template with KPIs, achievements, and risk analysis',
      category: 'REPORT',
      format: 'DOCX',
      fileSize: '1.2 MB',
      downloads: 1623,
      rating: 4.7,
      reviewCount: 189,
      lastUpdated: '2026-02-20',
      tags: ['Monthly', 'Quarterly', 'KPI tracking'],
      language: 'EN/FR/ES',
    },
    {
      id: '4',
      title: 'Stakeholder Presentation Deck',
      description: 'Professional PowerPoint template for project presentations with infographics and data visualization',
      category: 'PRESENTATION',
      format: 'PPTX',
      fileSize: '5.6 MB',
      downloads: 1456,
      rating: 4.6,
      reviewCount: 167,
      lastUpdated: '2026-01-30',
      tags: ['PowerPoint', 'Infographics', 'Modern design'],
      language: 'EN/FR/ES',
    },
    {
      id: '5',
      title: 'Project Planning & Timeline',
      description: 'Gantt chart template and project planning document with milestones, deliverables, and resource management',
      category: 'PLANNING',
      format: 'XLSX',
      fileSize: '2.1 MB',
      downloads: 1789,
      rating: 4.8,
      reviewCount: 201,
      lastUpdated: '2026-02-05',
      tags: ['Gantt', 'Timeline', 'Milestones'],
      language: 'EN/FR/ES',
    },
    {
      id: '6',
      title: 'Impact Evaluation Framework',
      description: 'Comprehensive evaluation template with indicators, measurement tools, and analysis frameworks',
      category: 'EVALUATION',
      format: 'DOCX',
      fileSize: '1.9 MB',
      downloads: 1234,
      rating: 4.7,
      reviewCount: 145,
      lastUpdated: '2026-02-18',
      tags: ['M&E', 'Indicators', 'Impact'],
      language: 'EN/FR/ES',
    },
    {
      id: '7',
      title: 'Technical Proposal Template',
      description: 'Specialized technical proposal for engineering and infrastructure projects',
      category: 'PROPOSAL',
      format: 'DOCX',
      fileSize: '3.1 MB',
      downloads: 987,
      rating: 4.5,
      reviewCount: 98,
      lastUpdated: '2026-01-25',
      tags: ['Technical', 'Engineering', 'Infrastructure'],
      language: 'EN/FR/ES',
    },
    {
      id: '8',
      title: 'Annual Budget Report',
      description: 'Year-end financial report template with expenditure analysis and budget variance',
      category: 'BUDGET',
      format: 'XLSX',
      fileSize: '2.3 MB',
      downloads: 1543,
      rating: 4.8,
      reviewCount: 178,
      lastUpdated: '2026-02-12',
      tags: ['Annual', 'Financial', 'Analysis'],
      language: 'EN/FR/ES',
    },
  ]);

  const categories = [
    { key: 'PROPOSAL' as const, label: t('experts.templates.categories.proposal'), icon: FileText },
    { key: 'BUDGET' as const, label: t('experts.templates.categories.budget'), icon: DollarSign },
    { key: 'REPORT' as const, label: t('experts.templates.categories.report'), icon: BarChart },
    { key: 'PRESENTATION' as const, label: t('experts.templates.categories.presentation'), icon: Presentation },
    { key: 'PLANNING' as const, label: t('experts.templates.categories.planning'), icon: ClipboardList },
    { key: 'EVALUATION' as const, label: t('experts.templates.categories.evaluation'), icon: CheckSquare },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchQuery === '' ||
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || template.category === selectedCategory;
    const matchesFormat = selectedFormat === 'ALL' || template.format === selectedFormat;
    return matchesSearch && matchesCategory && matchesFormat;
  });

  const handleDownload = (template: ExpertTemplate) => {
    toast.success(t('experts.templates.downloadSuccess', { title: template.title }));
    // Simulate download
    console.log('Downloading template:', template.id);
  };

  const getCategoryIcon = (category: TemplateCategory) => {
    const categoryData = categories.find(c => c.key === category);
    return categoryData?.icon || FileText;
  };

  const getCategoryColor = (category: TemplateCategory) => {
    switch (category) {
      case 'PROPOSAL':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'BUDGET':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'REPORT':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'PRESENTATION':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'PLANNING':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'EVALUATION':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getFormatColor = (format: TemplateFormat) => {
    switch (format) {
      case 'DOCX':
        return 'bg-blue-100 text-blue-800';
      case 'PDF':
        return 'bg-red-100 text-red-800';
      case 'XLSX':
        return 'bg-green-100 text-green-800';
      case 'PPTX':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('experts.hub.title')}
        description={t('experts.hub.subtitle')}
        icon={Users}
        stats={[
          { value: '3,847', label: t('experts.stats.available') }
        ]}
      />

      {/* Sub Menu */}
      <SubMenu
        items={[
          { label: t('experts.submenu.database'), icon: Database, onClick: () => navigate('/experts/database') },
          { label: t('experts.submenu.profiles'), icon: UserCircle, onClick: () => navigate('/experts/profiles') },
          { label: t('experts.submenu.matching'), icon: Zap, onClick: () => navigate('/experts/matching') },
          { label: t('experts.submenu.templates'), icon: FileText, onClick: () => navigate('/experts/templates'), isActive: true },
          { label: t('experts.submenu.cvTemplates'), icon: FileText, onClick: () => navigate('/experts/cv-templates') },
        ]}
      />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary mb-2">{t('experts.templates.title')}</h2>
            <p className="text-muted-foreground">{t('experts.templates.subtitle')}</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border p-5 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={t('experts.templates.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('experts.templates.allCategories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('experts.templates.allCategories')}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.key} value={category.key}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue placeholder={t('experts.templates.allFormats')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('experts.templates.allFormats')}</SelectItem>
                  <SelectItem value="DOCX">Word (.docx)</SelectItem>
                  <SelectItem value="PDF">PDF (.pdf)</SelectItem>
                  <SelectItem value="XLSX">Excel (.xlsx)</SelectItem>
                  <SelectItem value="PPTX">PowerPoint (.pptx)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category Quick Filters */}
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  selectedCategory === 'ALL'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-primary/50'
                }`}
              >
                {t('experts.templates.allCategories')} ({templates.length})
              </button>
              {categories.map((category) => {
                const Icon = category.icon;
                const count = templates.filter(t => t.category === category.key).length;
                return (
                  <button
                    key={category.key}
                    onClick={() => setSelectedCategory(category.key)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all flex items-center gap-2 ${
                      selectedCategory === category.key
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-primary/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const CategoryIcon = getCategoryIcon(template.category);
              return (
                <div
                  key={template.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {/* Template Preview/Header */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 border-b relative">
                    <div className="absolute top-4 right-4">
                      <Badge variant="outline" className={getCategoryColor(template.category)}>
                        <CategoryIcon className="w-3 h-3 mr-1" />
                        {t(`experts.templates.categories.${template.category.toLowerCase()}`)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-center h-32">
                      <div className="w-20 h-20 bg-white rounded-lg shadow-md flex items-center justify-center">
                        <FileType className="w-10 h-10 text-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-5">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-primary mb-2 line-clamp-2">
                        {template.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.description}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Download className="w-3 h-3" />
                          <span>{t('experts.templates.downloads')}</span>
                        </div>
                        <div className="text-sm font-semibold text-primary">
                          {template.downloads.toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Star className="w-3 h-3" />
                          <span>{t('experts.templates.rating')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold text-primary">{template.rating}</span>
                          <span className="text-xs text-muted-foreground">({template.reviewCount})</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <FileType className="w-3 h-3" />
                          <span>{t('experts.templates.format')}</span>
                        </div>
                        <Badge className={`text-xs ${getFormatColor(template.format)}`}>
                          {template.format}
                        </Badge>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Calendar className="w-3 h-3" />
                          <span>{t('experts.templates.updated')}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(template.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDownload(template)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {t('experts.templates.download')}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                      <span>{template.fileSize}</span>
                      <span>{template.language}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredTemplates.length === 0 && (
            <div className="bg-white rounded-lg border p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">
                {t('experts.templates.empty.title')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t('experts.templates.empty.message')}
              </p>
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setSelectedFormat('ALL');
              }}>
                {t('experts.templates.clearFilters')}
              </Button>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}