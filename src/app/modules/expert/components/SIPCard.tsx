import { SIPInfoDTO } from '@app/types/matchingOpportunities.dto';
import { Card, CardContent } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { Award } from 'lucide-react';
import { format } from 'date-fns';

interface SIPCardProps {
  sipInfo: SIPInfoDTO;
  onShowDetails?: () => void;
}

export function SIPCard({ sipInfo, onShowDetails }: SIPCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Special Info Pack (SIP)</h3>
            <p className="text-sm text-gray-600">Your subscription package</p>
          </div>
          <Award className="w-8 h-8 text-yellow-600" />
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <span className="text-sm font-semibold text-blue-600">
              {sipInfo.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Expires</span>
            <span className="text-sm font-semibold text-gray-800">
              {format(sipInfo.expiryDate, 'MMM dd, yyyy')}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="text-center p-2">
              <p className="text-2xl font-bold text-gray-800">{sipInfo.countries}</p>
              <p className="text-xs text-gray-600">Countries</p>
            </div>
            <div className="text-center p-2">
              <p className="text-2xl font-bold text-gray-800">{sipInfo.sectors}</p>
              <p className="text-xs text-gray-600">Sectors</p>
            </div>
            <div className="text-center p-2">
              <p className="text-2xl font-bold text-gray-800">{sipInfo.fundingAgencies}</p>
              <p className="text-xs text-gray-600">Agencies</p>
            </div>
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
