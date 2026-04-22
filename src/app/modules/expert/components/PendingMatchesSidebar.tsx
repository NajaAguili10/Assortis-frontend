import { PendingMatchDTO } from '@app/types/matchingOpportunities.dto';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import { Badge } from '@app/components/ui/badge';
import { Briefcase } from 'lucide-react';

interface PendingMatchesSidebarProps {
  pendingMatches: PendingMatchDTO[];
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  interested: 'Interested',
  connected: 'Connected',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  interested: 'bg-blue-100 text-blue-800',
  connected: 'bg-green-100 text-green-800',
};

export function PendingMatchesSidebar({ pendingMatches }: PendingMatchesSidebarProps) {
  return (
    <Card className="sticky top-4 h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Briefcase className="w-5 h-5 text-blue-600" />
          Pending Matches
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingMatches.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No pending matches</p>
        ) : (
          <div className="space-y-3">
            {pendingMatches.map(match => (
              <div
                key={match.id}
                className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-medium text-sm text-gray-800 line-clamp-2">
                    {match.organizationName}
                  </p>
                  {match.mutualInterest && (
                    <span className="text-xs font-semibold text-green-600 whitespace-nowrap">
                      ✓ Mutual
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mb-2">
                  <Badge className={STATUS_COLORS[match.status]}>
                    {STATUS_LABELS[match.status]}
                  </Badge>
                  <span className="text-sm font-semibold text-gray-700">
                    {match.interestPercentage}%
                  </span>
                </div>

                <p className="text-xs text-gray-500">
                  Last activity:{' '}
                  {Math.floor(
                    (Date.now() - match.lastInteractionDate.getTime()) / (1000 * 60 * 60 * 24)
                  )}{' '}
                  days ago
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
