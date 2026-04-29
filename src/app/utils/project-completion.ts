import { ProjectListDTO } from '@app/types/project.dto';

type CompletableProject = Partial<ProjectListDTO> & {
  relatedTender?: string;
  objectives?: string;
  fundingSource?: string;
  managerName?: string;
  countries?: string[];
  scope?: string;
};

export function calculateProjectCompletion(project: CompletableProject): number {
  const checks = [
    project.title,
    project.code,
    project.description,
    project.objectives,
    project.type,
    project.priority,
    project.scope,
    project.sector,
    project.subsectors?.length,
    project.country || project.countries?.length,
    project.region,
    project.timeline?.startDate,
    project.timeline?.endDate,
    Number(project.budget?.total || 0) > 0,
    project.leadOrganization,
    project.fundingSource,
    project.partners?.length,
    Number(project.teamSize || 0) > 0,
    project.managerName,
    project.tags?.length,
  ];

  const completed = checks.filter(Boolean).length;
  return Math.min(100, Math.max(5, Math.round((completed / checks.length) * 100)));
}
