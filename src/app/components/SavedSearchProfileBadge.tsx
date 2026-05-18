import { Badge } from '@app/components/ui/badge';

interface SavedSearchProfileBadgeProps {
  profileName?: string | null;
  profileEmail?: string | null;
}

export function SavedSearchProfileBadge({ profileName, profileEmail }: SavedSearchProfileBadgeProps) {
  if (!profileName) return null;

  return (
    <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
      Created by Profile: {profileName}{profileEmail ? ` (${profileEmail})` : ''}
    </Badge>
  );
}
