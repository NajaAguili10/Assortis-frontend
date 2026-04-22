import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import { Input } from '@app/components/ui/input';
import { Slider } from '@app/components/ui/slider';
import { useLanguage } from '@app/contexts/LanguageContext';
import {
  ContractorScoreInputDTO,
} from '@app/modules/expert/types/expert-projects-scoring.dto';
import { CalendarDays, Save, SquarePen } from 'lucide-react';
import { useMemo, useState } from 'react';

interface CollaborationScoringRowProps {
  collaborationId: string;
  organizationName: string;
  projectName: string;
  startDate: string;
  endDate: string;
  score?: ContractorScoreInputDTO;
  missingEvaluation: boolean;
  recentlyScored: boolean;
  onSave: (collaborationId: string, score: ContractorScoreInputDTO) => void;
}

const getInitialScores = (score?: ContractorScoreInputDTO): ContractorScoreInputDTO => ({
  financialPackageFairness: score?.financialPackageFairness ?? 7,
  contractualTermsRespect: score?.contractualTermsRespect ?? 7,
  communicationQuality: score?.communicationQuality ?? 7,
  technicalBackstopping: score?.technicalBackstopping ?? 7,
  financialBackstopping: score?.financialBackstopping ?? 7,
  adminLogisticsBackstopping: score?.adminLogisticsBackstopping ?? 7,
});

export function CollaborationScoringRow({
  collaborationId,
  organizationName,
  projectName,
  startDate,
  endDate,
  score,
  missingEvaluation,
  recentlyScored,
  onSave,
}: CollaborationScoringRowProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(missingEvaluation);
  const [form, setForm] = useState<ContractorScoreInputDTO>(getInitialScores(score));

  const categoryConfig: Array<{ key: keyof ContractorScoreInputDTO; labelKey: string }> = [
    { key: 'financialPackageFairness', labelKey: 'projects.scoring.categories.financialPackageFairness' },
    { key: 'contractualTermsRespect', labelKey: 'projects.scoring.categories.contractualTermsRespect' },
    { key: 'communicationQuality', labelKey: 'projects.scoring.categories.communicationQuality' },
    { key: 'technicalBackstopping', labelKey: 'projects.scoring.categories.technicalBackstopping' },
    { key: 'financialBackstopping', labelKey: 'projects.scoring.categories.financialBackstopping' },
    { key: 'adminLogisticsBackstopping', labelKey: 'projects.scoring.categories.adminLogisticsBackstopping' },
  ];

  const averageScore = useMemo(() => {
    const values = Object.values(form);
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    return Number(average.toFixed(1));
  }, [form]);

  const setCategoryValue = (key: keyof ContractorScoreInputDTO, value: number) => {
    const safeValue = Math.max(1, Math.min(10, value));
    setForm((prev) => ({ ...prev, [key]: safeValue }));
  };

  const handleSave = () => {
    onSave(collaborationId, form);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setForm(getInitialScores(score));
    setIsEditing(false);
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base text-primary">{organizationName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{projectName}</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {startDate} - {endDate}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {missingEvaluation && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                {t('projects.scoring.labels.missingEvaluation')}
              </Badge>
            )}
            {recentlyScored && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                {t('projects.scoring.labels.recentlyScored')}
              </Badge>
            )}
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {t('projects.scoring.labels.overallScore')}: {averageScore}/10
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {categoryConfig.map((category) => (
          <div key={category.key} className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <label className="text-muted-foreground">{t(category.labelKey)}</label>
              <span className="font-semibold text-primary">{form[category.key]}</span>
            </div>

            <div className="grid grid-cols-[1fr_76px] gap-3 items-center">
              <Slider
                value={[form[category.key]]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => setCategoryValue(category.key, value[0] ?? 1)}
                disabled={!isEditing}
              />
              <Input
                type="number"
                min={1}
                max={10}
                value={form[category.key]}
                disabled={!isEditing}
                onChange={(event) => setCategoryValue(category.key, Number(event.target.value))}
              />
            </div>
          </div>
        ))}

        <div className="flex items-center justify-end gap-2 pt-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                {t('projects.scoring.actions.cancel')}
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {t('projects.scoring.actions.save')}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <SquarePen className="h-4 w-4 mr-2" />
              {t('projects.scoring.actions.edit')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
