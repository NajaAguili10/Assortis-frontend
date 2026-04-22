import { MatchingOpportunityDTO, OpportunityTypeEnum } from '@app/types/matchingOpportunities.dto';
import { Card, CardContent } from '@app/components/ui/card';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Bookmark, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface MatchingOpportunityCardProps {
  opportunity: MatchingOpportunityDTO;
  isSaved?: boolean;
  onSave?: (opportunityId: string) => void;
  onRemove?: (opportunityId: string) => void;
  onApply?: (opportunityId: string) => void;
  onExpressInterest?: (opportunityId: string) => void;
}

const OPPORTUNITY_TYPE_LABELS: Record<OpportunityTypeEnum, string> = {
  [OpportunityTypeEnum.OPEN_PROJECT]: 'Open Project',
  [OpportunityTypeEnum.CONTRACT_AWARD]: 'Contract Award',
  [OpportunityTypeEnum.SHORTLIST]: 'Shortlist',
  [OpportunityTypeEnum.PROJECT_VACANCY]: 'Project Vacancy',
  [OpportunityTypeEnum.IN_HOUSE_VACANCY]: 'In-house Vacancy',
};

const OPPORTUNITY_TYPE_COLORS: Record<OpportunityTypeEnum, string> = {
  [OpportunityTypeEnum.OPEN_PROJECT]: 'bg-blue-100 text-blue-800',
  [OpportunityTypeEnum.CONTRACT_AWARD]: 'bg-green-100 text-green-800',
  [OpportunityTypeEnum.SHORTLIST]: 'bg-purple-100 text-purple-800',
  [OpportunityTypeEnum.PROJECT_VACANCY]: 'bg-orange-100 text-orange-800',
  [OpportunityTypeEnum.IN_HOUSE_VACANCY]: 'bg-pink-100 text-pink-800',
};

export function MatchingOpportunityCard({
  opportunity,
  isSaved = false,
  onSave,
  onRemove,
  onApply,
  onExpressInterest,
}: MatchingOpportunityCardProps) {
  const [localSaved, setLocalSaved] = useState(isSaved);
  const isDeadlineSoon =
    Math.floor((opportunity.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 7;

  const handleSaveClick = () => {
    if (localSaved && onRemove) {
      onRemove(opportunity.id);
      setLocalSaved(false);
    } else if (!localSaved && onSave) {
      onSave(opportunity.id);
      setLocalSaved(true);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        {/* Header with title and relevance score */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 leading-tight">
              {opportunity.title}
            </h3>
          </div>
          <div className="ml-4 flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-green-600">{opportunity.relevanceScore}</div>
              <div className="text-xs text-gray-500">% Match</div>
            </div>
          </div>
        </div>

        {/* Type and Status badges */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <Badge className={OPPORTUNITY_TYPE_COLORS[opportunity.type]}>
            {OPPORTUNITY_TYPE_LABELS[opportunity.type]}
          </Badge>
          {isDeadlineSoon && (
            <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Closing Soon
            </Badge>
          )}
        </div>

        {/* Keywords */}
        {opportunity.keywords.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {opportunity.keywords.slice(0, 3).map(keyword => (
              <span key={keyword} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {keyword}
              </span>
            ))}
            {opportunity.keywords.length > 3 && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                +{opportunity.keywords.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
          <div>
            <p className="text-gray-500">Donor</p>
            <p className="font-medium text-gray-800">{opportunity.donor}</p>
          </div>
          <div>
            <p className="text-gray-500">Country</p>
            <p className="font-medium text-gray-800">{opportunity.country}</p>
          </div>
          <div>
            <p className="text-gray-500">Sector</p>
            <p className="font-medium text-gray-800 capitalize">
              {opportunity.sector.toLowerCase().replace(/_/g, ' ')}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Deadline</p>
            <p
              className={`font-medium ${isDeadlineSoon ? 'text-red-600' : 'text-gray-800'}`}
            >
              {format(opportunity.deadline, 'MMM dd, yyyy')}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{opportunity.description}</p>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          {opportunity.type === OpportunityTypeEnum.PROJECT_VACANCY ||
          opportunity.type === OpportunityTypeEnum.IN_HOUSE_VACANCY ? (
            <Button
              variant="default"
              size="sm"
              onClick={() => onApply?.(opportunity.id)}
              className="flex-1 sm:flex-none"
            >
              Apply
            </Button>
          ) : null}

          {opportunity.type !== OpportunityTypeEnum.PROJECT_VACANCY &&
          opportunity.type !== OpportunityTypeEnum.IN_HOUSE_VACANCY ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExpressInterest?.(opportunity.id)}
              className="flex-1 sm:flex-none"
            >
              Express Interest
            </Button>
          ) : null}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveClick}
            className={localSaved ? 'text-yellow-600' : 'text-gray-500'}
          >
            <Bookmark className={`w-4 h-4 ${localSaved ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
