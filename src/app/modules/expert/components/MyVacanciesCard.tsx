import { Card, CardContent } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { Briefcase } from 'lucide-react';

interface MyVacanciesCardProps {
  onSeeJobBoard?: () => void;
  onSeeInHouseVacancies?: () => void;
}

export function MyVacanciesCard({ onSeeJobBoard, onSeeInHouseVacancies }: MyVacanciesCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">My Vacancies</h3>
            <p className="text-sm text-gray-600">Job opportunities matching your profile</p>
          </div>
          <Briefcase className="w-8 h-8 text-green-600" />
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-sm text-gray-600">
            Discover vacant positions with organizations and projects that match your expertise and experience.
          </p>

          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <p className="text-sm font-medium text-gray-800 mb-2">Two ways to find positions:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Organization job postings and partnerships</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>In-house platform opportunities</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            variant="default"
            className="w-full"
            onClick={onSeeJobBoard}
          >
            See the Job Posting Board
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={onSeeInHouseVacancies}
          >
            See Your In-house Vacancies
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
