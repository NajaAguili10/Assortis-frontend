const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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

export const projectReferenceGenerationService = {
  async getTemplates(): Promise<ProjectReferenceTemplateOption[]> {
    const response = await fetch(`${BASE_URL}/project-references/templates`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    return response.json();
  },

  async downloadReference(projectId: string | number, format: string): Promise<GeneratedReferenceDownload> {
    const response = await fetch(`${BASE_URL}/project-references/${encodeURIComponent(projectId)}/download?format=${encodeURIComponent(format)}`, {
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
