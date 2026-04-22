import { Calendar, Briefcase, Building2, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { MatchingOpportunityDTO, OpportunityTypeEnum } from '@app/types/matchingOpportunities.dto';
import { useTranslation } from '@app/contexts/LanguageContext';

interface MatchingVacancyListViewProps {
  opportunities: MatchingOpportunityDTO[];
  type: OpportunityTypeEnum.PROJECT_VACANCY | OpportunityTypeEnum.IN_HOUSE_VACANCY;
  onApply: (opportunityId: string) => void;
  onSave: (opportunityId: string) => void;
  isSaved: (opportunityId: string) => boolean;
}

export function MatchingVacancyListView({
  opportunities,
  type,
  onApply,
  onSave,
  isSaved,
}: MatchingVacancyListViewProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      {opportunities.length === 0 ? (
        <div className="bg-white rounded-xl border p-10 text-center text-gray-500">
          <p className="font-medium text-gray-700 mb-1">{t('matching-opportunities.opportunities.noOpportunities')}</p>
          <p className="text-sm">{t('matching-opportunities.opportunities.noOpportunitiesDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {opportunities.map((job) => {
            const daysRemaining = Math.floor((job.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const isUrgent = daysRemaining <= 7 && daysRemaining >= 0;

            return (
              <div key={job.id} className="bg-white rounded-lg border hover:shadow-md transition-shadow flex flex-col">
                <div className="p-5 pb-0">
                  <div className="flex items-center gap-2 mb-3 flex-wrap min-h-[28px]">
                    <Badge variant="secondary">{type === OpportunityTypeEnum.PROJECT_VACANCY ? t('matching-opportunities.types.projectVacancy') : t('matching-opportunities.types.inHouseVacancy')}</Badge>
                    <Badge className="bg-green-100 text-green-800">{job.relevanceScore}%</Badge>
                    {isUrgent && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                        {t('matching-opportunities.card.closingSoon')}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-3">
                  <h3 className="font-semibold text-primary mb-2 line-clamp-2 min-h-[48px]">{job.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">{job.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {job.keywords.slice(0, 3).map(keyword => (
                      <Badge key={keyword} variant="outline" className="text-[11px]">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="px-5 pb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {type === OpportunityTypeEnum.PROJECT_VACANCY ? (
                      <Briefcase className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <Building2 className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span className="truncate">{job.organization}</span>
                  </div>
                </div>

                <div className="px-5 pb-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{job.location ?? job.country}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{job.position ?? '-'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground col-span-2">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1" />

                <div className="px-5 pb-4">
                  <div className="pt-3 border-t space-y-2">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => navigate(`/matching-opportunities/opportunities/vacancy/${job.id}`)}>
                      {t('matching-opportunities.list.viewDetails')}
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" onClick={() => onApply(job.id)}>{t('matching-opportunities.card.apply')}</Button>
                      <Button variant="outline" size="sm" onClick={() => onSave(job.id)}>
                        {isSaved(job.id) ? t('matching-opportunities.saved.title') : t('matching-opportunities.card.save')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
