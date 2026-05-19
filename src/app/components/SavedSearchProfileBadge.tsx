import { Badge } from '@app/components/ui/badge';
import { UserCircle2 } from 'lucide-react';

interface SavedSearchProfileBadgeProps {
  profileName?: string | null;
  profileEmail?: string | null;
}

export function SavedSearchProfileBadge({ profileName, profileEmail }: SavedSearchProfileBadgeProps) {
  return (
    <Badge variant="outline" className="gap-1.5 border-sky-200 bg-sky-50 text-sky-700">
      <UserCircle2 className="h-3.5 w-3.5" />
      Profile: {profileName || 'Unassigned'}{profileEmail ? ` (${profileEmail})` : ''}
    </Badge>
  );
}
