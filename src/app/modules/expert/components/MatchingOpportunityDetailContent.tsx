import { useNavigate } from 'react-router';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Card } from '@app/components/ui/card';
import { MatchingOpportunityDTO, OpportunityTypeEnum } from '@app/types/matchingOpportunities.dto';
import { Building2, Calendar, MapPin, Tag, Target } from 'lucide-react';
import { useTranslation } from '@app/contexts/LanguageContext';

interface MatchingOpportunityDetailContentProps {
  opportunity: MatchingOpportunityDTO;
  variant: 'project' | 'award' | 'shortlist' | 'vacancy';
}

export function MatchingOpportunityDetailContent({ opportunity, variant }: MatchingOpportunityDetailContentProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-primary mb-2">{opportunity.title}</h1>
              <div className="flex items-center text-gray-600">
                <Building2 className="w-4 h-4 mr-2" />
                <span>{opportunity.organization ?? opportunity.donor}</span>
              </div>
            </div>
            <Badge variant="secondary">{opportunity.type.replace(/_/g, ' ')}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span>{opportunity.country}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <Tag className="w-4 h-4 mr-2 text-gray-400" />
              <span>{opportunity.sector.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>{new Date(opportunity.postedDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>{new Date(opportunity.deadline).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">{t('matching-opportunities.details.overview')}</h2>
          <p className="text-sm text-gray-700 leading-7">{opportunity.description}</p>
        </Card>

        {variant === 'award' && (opportunity.awardCompanies || []).length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">{t('matching-opportunities.details.awardedCompanies')}</h2>
            <div className="space-y-2">
              {(opportunity.awardCompanies || []).map(company => (
                <div key={company.name} className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                  <p className="text-sm font-semibold text-gray-900">{company.name}</p>
                  <p className="text-xs text-gray-600">
                    {(company.amount ?? 0).toLocaleString()} {opportunity.currency ?? ''} | {new Date(company.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {variant === 'shortlist' && (opportunity.shortlistCompanies || []).length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">{t('matching-opportunities.details.shortlistedCompanies')}</h2>
            <div className="space-y-2">
              {(opportunity.shortlistCompanies || []).map(company => (
                <div key={company.name} className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                  <p className="text-sm font-semibold text-gray-900">{company.name}</p>
                  <p className="text-xs text-gray-600">{new Date(company.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {variant === 'vacancy' && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">{t('matching-opportunities.details.requirements')}</h2>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              {(opportunity.requirements || [
                t('matching-opportunities.details.defaultRequirement1'),
                t('matching-opportunities.details.defaultRequirement2'),
              ]).map(req => (
                <li key={req}>{req}</li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">{t('matching-opportunities.details.relevanceScore')}</h3>
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-green-100 text-green-700 font-bold text-xl mx-auto mb-3">
            {opportunity.relevanceScore}%
          </div>
          <p className="text-center text-sm text-gray-600">{t('matching-opportunities.details.matchBreakdown')}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">{t('matching-opportunities.details.keywords')}</h3>
          <div className="flex flex-wrap gap-2">
            {opportunity.keywords.map(keyword => (
              <Badge key={keyword} variant="outline">{keyword}</Badge>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">{t('matching-opportunities.list.actions')}</h3>
          <div className="space-y-2">
            {(opportunity.type === OpportunityTypeEnum.PROJECT_VACANCY || opportunity.type === OpportunityTypeEnum.IN_HOUSE_VACANCY) ? (
              <Button className="w-full">{t('matching-opportunities.card.apply')}</Button>
            ) : (
              <Button className="w-full">{t('matching-opportunities.card.expressInterest')}</Button>
            )}
            <Button variant="outline" className="w-full" onClick={() => navigate('/matching-opportunities/opportunities')}>
              {t('matching-opportunities.details.backToList')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
