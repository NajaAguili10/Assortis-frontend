import { format } from 'date-fns';
import { useNavigate } from 'react-router';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { MatchingOpportunityDTO, OpportunityTypeEnum } from '@app/types/matchingOpportunities.dto';
import { useTranslation } from '@app/contexts/LanguageContext';

interface MatchingTenderListViewProps {
  opportunities: MatchingOpportunityDTO[];
  type: OpportunityTypeEnum.OPEN_PROJECT | OpportunityTypeEnum.CONTRACT_AWARD | OpportunityTypeEnum.SHORTLIST;
}

function getDetailPath(type: OpportunityTypeEnum, id: string): string {
  if (type === OpportunityTypeEnum.CONTRACT_AWARD) return `/matching-opportunities/opportunities/award/${id}`;
  if (type === OpportunityTypeEnum.SHORTLIST) return `/matching-opportunities/opportunities/shortlist/${id}`;
  return `/matching-opportunities/opportunities/project/${id}`;
}

export function MatchingTenderListView({ opportunities, type }: MatchingTenderListViewProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tableGridClass = 'grid grid-cols-[2.4fr_1.05fr_1.2fr_1fr_0.95fr_1.15fr] gap-2';

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          <div className={`${tableGridClass} items-center px-5 py-3.5 border-b border-gray-200 bg-gray-50/80 text-xs font-semibold tracking-wide text-gray-600`}>
            <span>{t('matching-opportunities.list.title')}</span>
            <span>{t('matching-opportunities.list.location')}</span>
            <span>{t('matching-opportunities.list.donor')}</span>
            <span>{t('matching-opportunities.list.budget')}</span>
            <span>{t('matching-opportunities.list.deadline')}</span>
            <span>{t('matching-opportunities.list.actions')}</span>
          </div>

          {opportunities.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              <p className="font-medium text-gray-700 mb-1">{t('matching-opportunities.opportunities.noOpportunities')}</p>
              <p className="text-sm">{t('matching-opportunities.opportunities.noOpportunitiesDesc')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {opportunities.map((row, rowIndex) => (
                <div key={row.id} className={`px-5 py-4 transition-colors ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-gray-50/80`}>
                  <div className={`${tableGridClass} items-start text-sm`}>
                    <div className="pr-1">
                      <div className="flex items-start gap-2 mb-1.5">
                        <Badge className="bg-green-100 text-green-800">{row.relevanceScore}%</Badge>
                        <div className="font-semibold text-gray-900 leading-snug line-clamp-2 break-words">{row.title}</div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {row.keywords.slice(0, 3).map(keyword => (
                          <Badge key={keyword} variant="outline" className="text-[11px]">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-gray-700 leading-snug break-words">{row.country}</div>
                    <div className="text-gray-700 leading-snug break-words line-clamp-2">{row.donor}</div>
                    <div className="text-gray-700 font-medium whitespace-nowrap">
                      {(row.budget ?? row.contractValue)?.toLocaleString() ?? '-'} {row.currency ?? ''}
                    </div>
                    <div className="text-gray-700 whitespace-nowrap">{format(row.deadline, 'dd MMM yyyy')}</div>
                    <div className="flex flex-wrap gap-2 justify-start">
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-10"
                        onClick={() => navigate(getDetailPath(type, row.id))}
                      >
                        {t('matching-opportunities.list.viewDetails')}
                      </Button>
                    </div>
                  </div>

                  {type === OpportunityTypeEnum.CONTRACT_AWARD && (row.awardCompanies || []).length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {(row.awardCompanies || []).map((company) => (
                        <div key={`${row.id}-${company.name}`} className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5">
                          <p className="text-xs font-semibold text-gray-900">{company.name}</p>
                          <p className="text-[11px] text-gray-600">
                            {(company.amount ?? 0).toLocaleString()} {row.currency ?? ''} | {format(company.date, 'dd MMM yyyy')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {type === OpportunityTypeEnum.SHORTLIST && (row.shortlistCompanies || []).length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {(row.shortlistCompanies || []).map((company) => (
                        <div key={`${row.id}-${company.name}`} className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5">
                          <p className="text-xs font-semibold text-gray-900">{company.name}</p>
                          <p className="text-[11px] text-gray-600">{format(company.date, 'dd MMM yyyy')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
