import { Card, CardContent } from '@app/components/ui/card';
import { Button } from '@app/components/ui/button';
import { BookOpen } from 'lucide-react';

interface OtherServicesCardProps {
  onTrainingAcademy?: () => void;
}

export function OtherServicesCard({ onTrainingAcademy }: OtherServicesCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Other Services</h3>
            <p className="text-sm text-gray-600">Expand your skills and knowledge</p>
          </div>
          <BookOpen className="w-8 h-8 text-purple-600" />
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-sm text-gray-600">
            Access additional resources and programs to enhance your professional development and stay competitive in your field.
          </p>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-1">📚 Training Academy</p>
              <p className="text-xs text-gray-600">
                Professional courses and certifications to advance your career
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-1">🤝 Networking Hub</p>
              <p className="text-xs text-gray-600">
                Connect with peers and industry leaders in your sector
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-1">💡 Resources</p>
              <p className="text-xs text-gray-600">
                Templates, guides, and best practices for your projects
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="default"
          className="w-full"
          onClick={onTrainingAcademy}
        >
          Training Academy
        </Button>
      </CardContent>
    </Card>
  );
}
