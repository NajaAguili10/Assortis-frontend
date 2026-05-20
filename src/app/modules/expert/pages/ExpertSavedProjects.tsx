import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Bookmark, Eye, Heart } from 'lucide-react';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { AccessDenied } from '@app/components/AccessDenied';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ProjectsSubMenu } from '@app/components/ProjectsSubMenu';
import { Button } from '@app/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@app/components/ui/tooltip';
import { useTenders } from '@app/hooks/useTenders';
import { usePipeline } from '../hooks/usePipeline';

const STORAGE_KEY = 'projects.favouriteIds';

function readSavedProjectIds(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return parsed.filter((v): v is string => typeof v === 'string');
    }
    if (parsed && typeof parsed === 'object') {
      return Object.entries(parsed)
        .filter(([, isSaved]) => Boolean(isSaved))
        .map(([id]) => id);
    }
  } catch {
    // ignore
  }
  return [];
}

function writeSavedProjectIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export default function ExpertSavedProjects() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tenders } = useTenders();
  const allTenders = tenders?.data || [];
  const { removeFromPipeline } = usePipeline();

  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set(readSavedProjectIds()));

  const hasAccess = user?.accountType === 'expert';

  const savedProjects = allTenders.filter(tender => savedIds.has(tender.id));

  const handleUnsave = (id: string) => {
    removeFromPipeline(id);
    setSavedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      writeSavedProjectIds(Array.from(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen">
      <PageBanner
        icon={Bookmark}
        title={t('projects.submenu.savedProjects')}
        description={t('activeTenders.title')}
      />

      <ProjectsSubMenu />

      {!hasAccess ? (
        <AccessDenied module="projects" accountType={user?.accountType} />
      ) : (
        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-6">
            {savedProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 gap-4">
                <Bookmark className="h-12 w-12 text-gray-300" />
                <p className="text-lg font-medium">{t('activeTenders.button.addToMyProjects')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedProjects.map(project => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{project.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{project.organizationName}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="min-h-9 w-9 p-0 border-gray-300"
                            aria-label={t('activeTenders.button.viewDetails')}
                            onClick={() => navigate(`/projects/${project.id}`, { state: { fromMyProjects: true, isFavorited: true } })}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={4}>{t('activeTenders.button.viewDetails')}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="min-h-9 w-9 p-0"
                            aria-label={t('activeTenders.button.removeFromMyProjects')}
                            onClick={() => handleUnsave(project.id)}
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={4}>{t('activeTenders.button.removeFromMyProjects')}</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PageContainer>
      )}
    </div>
  );
}
