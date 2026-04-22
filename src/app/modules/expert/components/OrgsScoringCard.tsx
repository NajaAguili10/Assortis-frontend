import { Card, CardContent } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { Star } from 'lucide-react';
import { Badge } from '@app/components/ui/badge';

interface OrgsScoringCardProps {
  onShowDetails?: () => void;
}

export function OrgsScoringCard({ onShowDetails }: OrgsScoringCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Organizations Scoring</h3>
            <p className="text-sm text-gray-600">Rate organizations you've worked with</p>
          </div>
          <Star className="w-8 h-8 text-yellow-600" />
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            Share your experience working with organizations over the last 5 years. Your feedback helps build a transparent ecosystem and helps other experts make informed decisions.
          </p>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-600">Feature Active</Badge>
            </div>
            <p className="text-xs text-gray-600">
              Start rating organizations to contribute to the community index
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={onShowDetails}
        >
          Show Details
        </Button>
      </CardContent>
    </Card>
  );
}
