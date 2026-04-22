import { Badge } from '@app/components/ui/badge';
import { useLanguage } from '@app/contexts/LanguageContext';
import { CheckCircle2, Clock3 } from 'lucide-react';

type OrganizationVerificationBadgeProps = {
  status: 'verified' | 'selfDeclared';
};

export function OrganizationVerificationBadge({
  status,
}: OrganizationVerificationBadgeProps) {
  const { t } = useLanguage();

  if (status === 'verified') {
    return (
      <Badge
        variant="outline"
        className="border-green-200 bg-green-50 text-green-700"
      >
        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
        {t('organizations.validation.verified')}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-gray-200 bg-gray-100 text-gray-700"
    >
      <Clock3 className="mr-1 h-3.5 w-3.5" />
      {t('organizations.validation.selfDeclared')}
    </Badge>
  );
}