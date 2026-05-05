import { useEffect, useMemo, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@app/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@app/components/ui/dialog';
import { Label } from '@app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import {
  ProjectReferenceTemplateOption,
  projectReferenceGenerationService,
} from '@app/services/projectReferenceGenerationService';

interface GenerateProjectReferenceDialogProps {
  open: boolean;
  projectId: string | number | null;
  projectTitle: string;
  onOpenChange: (open: boolean) => void;
}

const slugify = (value: string) => (
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'project'
);

const normalizeError = (message: string) => {
  if (message.includes('Project not found')) return 'Project not found';
  if (message.includes('Template not found')) return 'Template not found';
  return 'Unable to generate reference';
};

export function GenerateProjectReferenceDialog({
  open,
  projectId,
  projectTitle,
  onOpenChange,
}: GenerateProjectReferenceDialogProps) {
  const [templates, setTemplates] = useState<ProjectReferenceTemplateOption[]>([]);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    setIsLoadingTemplates(true);
    projectReferenceGenerationService.getTemplates()
      .then(options => {
        if (!isMounted) return;
        setTemplates(options);
        setSelectedFormat(options[0]?.format || '');
      })
      .catch(error => {
        if (!isMounted) return;
        toast.error(normalizeError(error instanceof Error ? error.message : 'Unable to generate reference'));
      })
      .finally(() => {
        if (isMounted) setIsLoadingTemplates(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open]);

  const selectedTemplate = useMemo(() => (
    templates.find(template => template.format === selectedFormat)
  ), [selectedFormat, templates]);

  const handleDownload = async () => {
    if (!projectId || !selectedFormat) return;

    setIsGenerating(true);
    try {
      const result = await projectReferenceGenerationService.downloadReference(projectId, selectedFormat);
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.fileName || `project-reference-${slugify(projectTitle)}-${selectedFormat}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Generated reference downloaded successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error(normalizeError(error instanceof Error ? error.message : 'Unable to generate reference'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Reference</DialogTitle>
          <DialogDescription>Select the donor-specific DOCX format for this project reference.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label>Donor format</Label>
          <Select value={selectedFormat} onValueChange={setSelectedFormat} disabled={isLoadingTemplates || isGenerating || templates.length === 0}>
            <SelectTrigger className="min-h-11">
              <SelectValue placeholder={isLoadingTemplates ? 'Loading templates...' : 'Select a donor format'} />
            </SelectTrigger>
            <SelectContent>
              {templates.map(template => (
                <SelectItem key={template.format} value={template.format}>
                  {template.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedTemplate && (
            <p className="text-xs text-gray-500">{selectedTemplate.fileName}</p>
          )}
          {!isLoadingTemplates && templates.length === 0 && (
            <p className="text-sm text-red-600">Template not found</p>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
            Cancel
          </Button>
          <Button type="button" onClick={handleDownload} disabled={!selectedFormat || isLoadingTemplates || isGenerating}>
            {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
