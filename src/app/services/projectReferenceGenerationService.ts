import { API_BASE_URL } from '@app/config/api.config';

export interface ProjectReferenceTemplateOption {
  format: string;
  label: string;
  fileName: string;
}

export interface GeneratedReferenceDownload {
  blob: Blob;
  fileName?: string;
}

async function readErrorMessage(response: Response) {
  try {
    const payload = await response.json();
    if (payload?.message) return String(payload.message);
  } catch {
    // Fall back to status text below.
  }

  return response.statusText || 'Unable to generate reference';
}

function readFileName(response: Response) {
  const disposition = response.headers.get('Content-Disposition');
  const match = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  return match ? decodeURIComponent(match[1]) : undefined;
}

const isCvTemplate = (template: ProjectReferenceTemplateOption) => {
  const text = `${template.format} ${template.label} ${template.fileName}`.toLowerCase();
  return /\bcv\b|curriculum vitae|resume|résumé/.test(text);
};

export const projectReferenceGenerationService = {
  async getTemplates(): Promise<ProjectReferenceTemplateOption[]> {
    const response = await fetch(`${API_BASE_URL}/project-references/templates`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    const templates = await response.json();
    return Array.isArray(templates) ? templates.filter((template) => !isCvTemplate(template)) : [];
  },

  async downloadReference(projectId: string | number, format: string): Promise<GeneratedReferenceDownload> {
    if (/\bcv\b|curriculum vitae|resume|résumé/i.test(format)) {
      throw new Error('CV templates are not available for project reference downloads');
    }

    const response = await fetch(`${API_BASE_URL}/project-references/${encodeURIComponent(projectId)}/download?format=${encodeURIComponent(format)}`, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    return {
      blob: await response.blob(),
      fileName: readFileName(response),
    };
  },
};
