import { ShieldAlert, Lock, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';

interface AccessDeniedProps {
  module: string;
  accountType?: 'expert' | 'organization' | 'admin' | 'public';
  subMenuItems?: Array<{ label: string; description: string }>;
}

export function AccessDenied({ module, accountType, subMenuItems = [] }: AccessDeniedProps) {
  const { t } = useLanguage();

  const isPublic = !accountType || accountType === 'public'; // Treat undefined as public
  const isExpert = accountType === 'expert';

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-3xl w-full">
        {/* Main Alert */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200 p-8 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-7 h-7 text-orange-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-primary mb-2">
                {t(`permissions.${module}.accessDenied.title`)}
              </h2>
              <p className="text-gray-700 text-base leading-relaxed">
                {isPublic 
                  ? t(`permissions.${module}.accessDenied.publicUser`)
                  : isExpert
                  ? t(`permissions.${module}.accessDenied.expertUser`)
                  : t(`permissions.${module}.accessDenied.default`)
                }
              </p>
            </div>
          </div>
        </div>

        {/* Module Introduction */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              {t(`permissions.${module}.introduction.title`)}
            </CardTitle>
            <CardDescription>
              {t(`permissions.${module}.introduction.description`)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed">
              {t(`permissions.${module}.introduction.content`)}
            </p>
          </CardContent>
        </Card>

        {/* Sub Menu Features */}
        {subMenuItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-gray-500" />
                {t(`permissions.${module}.features.title`)}
              </CardTitle>
              <CardDescription>
                {t(`permissions.${module}.features.description`)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subMenuItems.map((item, index) => (
                  <div key={index}>
                    {index > 0 && <Separator className="mb-4" />}
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-primary mb-1">{item.label}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upgrade Message */}
        {(isPublic || isExpert) && (
          <Alert className="mt-6 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              {t(`permissions.${module}.upgrade.message`)}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}