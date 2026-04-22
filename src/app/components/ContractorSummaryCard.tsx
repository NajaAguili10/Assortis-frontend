import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import { Progress } from '@app/components/ui/progress';
import { useLanguage } from '@app/contexts/LanguageContext';
import { ContractorSummaryDTO } from '@app/modules/expert/types/expert-projects-scoring.dto';
import { BookmarkMinus, BookmarkPlus, Building2, Star } from 'lucide-react';

interface ContractorSummaryCardProps {
  contractor: ContractorSummaryDTO;
  onToggleBookmark: (contractorId: string) => void;
  onViewDetails: (contractorId: string) => void;
}

const getScoreBadgeClassName = (score: number | null) => {
  if (score === null) return 'bg-gray-100 text-gray-700 border-gray-200';
  if (score >= 8) return 'bg-green-50 text-green-700 border-green-200';
  if (score >= 6) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (score >= 4) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-700 border-red-200';
};

export function ContractorSummaryCard({
  contractor,
  onToggleBookmark,
  onViewDetails,
}: ContractorSummaryCardProps) {
  const { t } = useLanguage();
  const progressValue = contractor.overallScore ? contractor.overallScore * 10 : 0;

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="text-base text-primary flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-500" />
              {contractor.name}
            </CardTitle>
            {contractor.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{contractor.description}</p>
            )}
          </div>

          <Badge variant="outline" className={getScoreBadgeClassName(contractor.overallScore)}>
            <Star className="h-3.5 w-3.5 mr-1" />
            {contractor.overallScore ? `${contractor.overallScore}/10` : t('projects.scoring.labels.noEvaluations')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>{t('projects.contractors.card.overallScore')}</span>
            <span>{contractor.overallScore ? `${contractor.overallScore}/10` : '-'}</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('projects.contractors.card.pastCollaborations')}</span>
          <span className="font-semibold text-primary">{contractor.collaborationCount}</span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          {contractor.bookmarked ? (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onToggleBookmark(contractor.contractorId)}
              aria-label={t('projects.contractors.actions.removeBookmark')}
              title={t('projects.contractors.actions.removeBookmark')}
            >
              <BookmarkMinus className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onToggleBookmark(contractor.contractorId)}
              aria-label={t('projects.contractors.actions.bookmark')}
              title={t('projects.contractors.actions.bookmark')}
            >
              <BookmarkPlus className="h-4 w-4" />
            </Button>
          )}
          <Button className="flex-1" onClick={() => onViewDetails(contractor.contractorId)}>
            {t('projects.contractors.actions.viewDetails')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
