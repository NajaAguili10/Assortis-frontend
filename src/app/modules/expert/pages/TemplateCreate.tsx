import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TendersSubMenu } from '@app/components/TendersSubMenu';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import { useTenders } from '@app/hooks/useTenders';
import { TemplateTypeEnum, SectorEnum, SubSectorEnum, SECTOR_SUBSECTOR_MAP } from '@app/types/tender.dto';
import { toast } from 'sonner';
import {
  FileText,
  ArrowLeft,
  Upload,
  X,
  Check,
  FileType,
} from 'lucide-react';

export default function TemplateCreate() {
  const { t } = useLanguage();
  const { kpis } = useTenders();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: TemplateTypeEnum.PROPOSAL,
    sectors: [] as SectorEnum[],
    subSectors: [] as SubSectorEnum[],
    isPublic: true,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleCreate = () => {
    if (!formData.name || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    // In real app, send data to backend
    toast.success(t('templates.toast.created'));
    navigate('/tenders/templates');
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload DOC, DOCX, PDF, XLS, or XLSX files.');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    setSelectedFile(file);
    toast.success(t('templates.form.fileSelected') + ': ' + file.name);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleSectorToggle = (sector: SectorEnum) => {
    setFormData((prev) => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter((s) => s !== sector)
        : [...prev.sectors, sector],
    }));
  };

  const handleSubSectorToggle = (subSector: SubSectorEnum) => {
    setFormData((prev) => ({
      ...prev,
      subSectors: prev.subSectors.includes(subSector)
        ? prev.subSectors.filter((s) => s !== subSector)
        : [...prev.subSectors, subSector],
    }));
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
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/tenders/templates')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('templates.edit.backToList')}
            </Button>
          </div>

          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-primary mb-2">
              {t('templates.modal.create.title')}
            </h1>
            <p className="text-gray-600">{t('templates.create.subtitle')}</p>
          </div>

          <Separator className="my-6" />

          {/* Create Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-6">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

              {/* Sectors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('templates.form.sectors')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(SectorEnum).slice(0, 12).map((sector) => (
                    <Badge
                      key={sector}
                      variant={formData.sectors.includes(sector) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handleSectorToggle(sector)}
                    >
                      {formData.sectors.includes(sector) && (
                        <Check className="w-3 h-3 mr-1" />
                      )}
                      {t(`sectors.${sector}`)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Sub Sectors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('templates.form.subSectors')}
                </label>
                {formData.sectors.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    {t('templates.form.selectSectorFirst')}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.sectors.flatMap((sector) =>
                      SECTOR_SUBSECTOR_MAP[sector].map((subSector) => (
                        <Badge
                          key={subSector}
                          variant={formData.subSectors.includes(subSector) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => handleSubSectorToggle(subSector)}
                        >
                          {formData.subSectors.includes(subSector) && (
                            <Check className="w-3 h-3 mr-1" />
                          )}
                          {t(`subsectors.${subSector}`)}
                        </Badge>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('templates.form.file')}
                </label>
                
                {selectedFile ? (
                  <div className="border-2 border-green-300 bg-green-50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <FileType className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {t('templates.form.changeFile')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                      isDragging
                        ? 'border-accent bg-accent/5'
                        : 'border-gray-300 hover:border-accent'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {t('templates.form.fileUploadTitle')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t('templates.form.fileUploadSubtitle')}
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".doc,.docx,.pdf,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleFileInputChange}
                />
              </div>

              <Separator className="my-6" />

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/tenders/templates')}
                >
                  {t('templates.form.cancel')}
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={handleCreate}
                  disabled={!formData.name || !formData.description}
                >
                  {t('templates.form.submit')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}