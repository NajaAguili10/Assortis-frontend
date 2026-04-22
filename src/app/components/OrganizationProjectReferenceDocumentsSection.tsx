import { useRef, useState } from 'react';
import { format } from 'date-fns';
import { enUS, es, fr } from 'date-fns/locale';
import { useLanguage } from '@app/contexts/LanguageContext';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import { Label } from '@app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import {
  OrganizationProjectDocumentType,
  OrganizationProjectReferenceDocumentDTO,
} from '@app/modules/organization/types/organizationProjectReference.dto';
import { Download, Eye, FileText, RefreshCw, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface OrganizationProjectReferenceDocumentsSectionProps {
  documents: OrganizationProjectReferenceDocumentDTO[];
  editable?: boolean;
  onAddDocuments?: (documents: OrganizationProjectReferenceDocumentDTO[]) => void;
  onReplaceDocument?: (documentId: string, document: OrganizationProjectReferenceDocumentDTO) => void;
  onRemoveDocument?: (documentId: string) => void;
}

const ACCEPTED_TYPES = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MAX_FILE_SIZE = 8 * 1024 * 1024;

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const buildFallbackContent = (document: OrganizationProjectReferenceDocumentDTO) => {
  return `Document name: ${document.name}\nType: ${document.type}\nUploaded: ${document.uploadedAt}`;
};

const buildObjectUrl = (document: OrganizationProjectReferenceDocumentDTO) => {
  if (document.contentDataUrl) {
    return document.contentDataUrl;
  }

  const blob = new Blob([buildFallbackContent(document)], {
    type: document.mimeType || 'text/plain',
  });

  return URL.createObjectURL(blob);
};

export function OrganizationProjectReferenceDocumentsSection({
  documents,
  editable = false,
  onAddDocuments,
  onReplaceDocument,
  onRemoveDocument,
}: OrganizationProjectReferenceDocumentsSectionProps) {
  const { t, language } = useLanguage();
  const [uploadType, setUploadType] = useState<OrganizationProjectDocumentType>('report');
  const [isDragging, setIsDragging] = useState(false);
  const addInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);

  const dateLocale = language === 'fr' ? fr : language === 'es' ? es : enUS;

  const getDocumentTone = (type: OrganizationProjectDocumentType) => {
    if (type === 'tor') {
      return {
        card: 'border-primary/20 bg-primary/5',
        badge: 'default' as const,
      };
    }

    return {
      card: 'border-blue-200 bg-blue-50/40',
      badge: 'secondary' as const,
    };
  };

  const createStoredDocument = (file: File, type: OrganizationProjectDocumentType) => {
    return new Promise<OrganizationProjectReferenceDocumentDTO>((resolve, reject) => {
      if (file.size > MAX_FILE_SIZE) {
        reject(new Error(t('organizations.projectReferences.documents.validation.size')));
        return;
      }

      const isAccepted = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ].includes(file.type) || /\.(pdf|doc|docx)$/i.test(file.name);

      if (!isAccepted) {
        reject(new Error(t('organizations.projectReferences.documents.validation.type')));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          id: crypto.randomUUID(),
          name: file.name,
          type,
          uploadedAt: new Date().toISOString(),
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          contentDataUrl: typeof reader.result === 'string' ? reader.result : undefined,
        });
      };
      reader.onerror = () => reject(new Error(t('organizations.projectReferences.documents.validation.read')));
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (fileList: FileList | null, mode: 'add' | 'replace') => {
    if (!fileList || fileList.length === 0) {
      return;
    }

    try {
      const files = Array.from(fileList);
      const documentsToStore = await Promise.all(files.map(file => createStoredDocument(file, uploadType)));

      if (mode === 'replace') {
        if (replaceTargetId && documentsToStore[0] && onReplaceDocument) {
          onReplaceDocument(replaceTargetId, documentsToStore[0]);
          toast.success(t('organizations.projectReferences.documents.replaceSuccess'));
        }
      } else if (onAddDocuments) {
        onAddDocuments(documentsToStore);
        toast.success(t('organizations.projectReferences.documents.addSuccess'));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t('organizations.projectReferences.documents.validation.read');
      toast.error(message);
    } finally {
      if (addInputRef.current) {
        addInputRef.current.value = '';
      }
      if (replaceInputRef.current) {
        replaceInputRef.current.value = '';
      }
      setReplaceTargetId(null);
      setIsDragging(false);
    }
  };

  const openDocument = (projectDocument: OrganizationProjectReferenceDocumentDTO, download = false) => {
    const url = buildObjectUrl(projectDocument);

    if (download) {
      const link = window.document.createElement('a');
      link.href = url;
      link.download = projectDocument.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    if (!projectDocument.contentDataUrl) {
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
    }
  };

  return (
    <Card className="border-primary/15 shadow-sm bg-gradient-to-b from-white to-gray-50/40">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base text-primary">
              {t('organizations.projectReferences.documents.title')}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {t('organizations.projectReferences.documents.subtitle')}
            </p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">{documents.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {editable && (
          <div className="rounded-lg border border-primary/20 p-4 bg-gradient-to-br from-primary/5 via-white to-blue-50/60">
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(180px,220px)_minmax(0,1fr)]">
                <div className="space-y-2">
                  <Label>{t('organizations.projectReferences.documents.typeLabel')}</Label>
                  <Select value={uploadType} onValueChange={(value: OrganizationProjectDocumentType) => setUploadType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tor">{t('organizations.projectReferences.documents.type.tor')}</SelectItem>
                      <SelectItem value="report">{t('organizations.projectReferences.documents.type.report')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div
                  className={`rounded-lg border-2 border-dashed p-5 text-center transition-colors min-h-[132px] flex flex-col justify-center ${
                    isDragging ? 'border-accent bg-accent/10' : 'border-primary/30 bg-white/95'
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleFiles(event.dataTransfer.files, 'add');
                  }}
                >
                  <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-800">
                    {t('organizations.projectReferences.documents.dropzoneTitle')}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {t('organizations.projectReferences.documents.dropzoneSubtitle')}
                  </p>
                </div>
              </div>
              <div className="flex xl:justify-end">
                <Button type="button" className="min-h-11 w-full sm:w-auto" onClick={() => addInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  {t('organizations.projectReferences.documents.add')}
                </Button>
              </div>
            </div>
            <input
              ref={addInputRef}
              type="file"
              className="hidden"
              accept={ACCEPTED_TYPES}
              multiple
              onChange={(event) => handleFiles(event.target.files, 'add')}
            />
            <input
              ref={replaceInputRef}
              type="file"
              className="hidden"
              accept={ACCEPTED_TYPES}
              onChange={(event) => handleFiles(event.target.files, 'replace')}
            />
          </div>
        )}

        {documents.length === 0 ? (
          <div className="rounded-lg border border-primary/15 bg-gradient-to-b from-white to-primary/5 px-4 py-8 text-center text-sm text-gray-500">
            <FileText className="w-8 h-8 mx-auto mb-3 text-primary/50" />
            <p className="font-medium text-gray-700 mb-1">
              {t('organizations.projectReferences.documents.emptyTitle')}
            </p>
            <p>{t('organizations.projectReferences.documents.emptySubtitle')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map(projectDocument => {
              const tone = getDocumentTone(projectDocument.type);

              return (
              <div
                key={projectDocument.id}
                className={`rounded-lg border px-4 py-3 shadow-sm ${tone.card}`}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">{projectDocument.name}</p>
                      <Badge variant={tone.badge}>
                        {projectDocument.type === 'tor'
                          ? t('organizations.projectReferences.documents.type.tor')
                          : t('organizations.projectReferences.documents.type.report')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {t('organizations.projectReferences.documents.meta', {
                        date: format(new Date(projectDocument.uploadedAt), 'dd MMM yyyy', { locale: dateLocale }),
                        size: formatFileSize(projectDocument.size),
                      })}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => openDocument(projectDocument)}>
                      <Eye className="w-4 h-4 mr-2" />
                      {t('organizations.projectReferences.documents.view')}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => openDocument(projectDocument, true)}>
                      <Download className="w-4 h-4 mr-2" />
                      {t('organizations.projectReferences.documents.download')}
                    </Button>
                    {editable && onReplaceDocument && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReplaceTargetId(projectDocument.id);
                          replaceInputRef.current?.click();
                        }}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {t('organizations.projectReferences.documents.replace')}
                      </Button>
                    )}
                    {editable && onRemoveDocument && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          onRemoveDocument(projectDocument.id);
                          toast.success(t('organizations.projectReferences.documents.removeSuccess'));
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('organizations.projectReferences.documents.remove')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
