import { CVStatsDTO } from '@app/types/matchingOpportunities.dto';
import { Card, CardContent } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { FileText } from 'lucide-react';
import { format } from 'date-fns';

interface MyCVCardProps {
  cvStats: CVStatsDTO;
  onUpdateCV?: () => void;
}

export function MyCVCard({ cvStats, onUpdateCV }: MyCVCardProps) {
  const totalPreviews = cvStats.previewsEN + cvStats.previewsFR + cvStats.previewsES;
  const totalDownloads = cvStats.downloadsEN + cvStats.downloadsFR + cvStats.downloadsES;

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">My CV</h3>
            <p className="text-sm text-gray-600">
              Registered on {format(cvStats.registeredDate, 'MMM dd, yyyy')}
            </p>
          </div>
          <FileText className="w-8 h-8 text-blue-600" />
        </div>

        <div className="space-y-3 mb-6">
          <div className="border-l-4 border-blue-500 pl-3 py-2">
            <p className="text-xs font-semibold text-gray-600 uppercase">English</p>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-700">Previews: <span className="font-semibold">{cvStats.previewsEN}</span></span>
              <span className="text-gray-700">Downloads: <span className="font-semibold">{cvStats.downloadsEN}</span></span>
            </div>
          </div>

          <div className="border-l-4 border-green-500 pl-3 py-2">
            <p className="text-xs font-semibold text-gray-600 uppercase">French</p>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-700">Previews: <span className="font-semibold">{cvStats.previewsFR}</span></span>
              <span className="text-gray-700">Downloads: <span className="font-semibold">{cvStats.downloadsFR}</span></span>
            </div>
          </div>

          <div className="border-l-4 border-orange-500 pl-3 py-2">
            <p className="text-xs font-semibold text-gray-600 uppercase">Spanish</p>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-700">Previews: <span className="font-semibold">{cvStats.previewsES}</span></span>
              <span className="text-gray-700">Downloads: <span className="font-semibold">{cvStats.downloadsES}</span></span>
            </div>
          </div>

          <div className="bg-gray-100 p-3 rounded-lg mt-4">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">Total Previews</span>
              <span className="font-bold text-gray-800">{totalPreviews}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="font-medium text-gray-700">Total Downloads</span>
              <span className="font-bold text-gray-800">{totalDownloads}</span>
            </div>
          </div>
        </div>

        <Button
          variant="default"
          className="w-full"
          onClick={onUpdateCV}
        >
          Update My CV
        </Button>
      </CardContent>
    </Card>
  );
}
