import { LucideIcon, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

export interface WorkflowStep {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  disabled?: boolean;
}

export interface MethodologyWorkflowCardProps {
  title: string;
  description: string;
  steps: WorkflowStep[];
  ctaLabel: string;
  onCtaClick: () => void;
}

export function MethodologyWorkflowCard({
  title,
  description,
  steps,
  ctaLabel,
  onCtaClick,
}: MethodologyWorkflowCardProps) {
  return (
    <div className="bg-white rounded-lg border p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-primary mb-2">{title}</h2>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {/* Workflow Steps */}
      <div className={ctaLabel ? 'mb-6' : ''}>
        <div
          className={`grid grid-cols-1 ${
            steps.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
          } gap-6`}
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isDisabled = step.disabled;
            return (
              <div key={index} className="relative">
                {/* Step */}
                <div
                  className={`flex flex-col items-start ${
                    isDisabled ? 'opacity-50' : ''
                  }`}
                >
                  {/* Icon & Number */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isDisabled ? 'bg-gray-100' : 'bg-primary/10'
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          isDisabled ? 'text-gray-400' : 'text-primary'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-2xl font-bold ${
                        isDisabled ? 'text-gray-300' : 'text-primary/20'
                      }`}
                    >
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <h3
                    className={`font-semibold mb-2 ${
                      isDisabled ? 'text-gray-400' : 'text-primary'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed mb-3 ${
                      isDisabled ? 'text-gray-400' : 'text-muted-foreground'
                    }`}
                  >
                    {step.description}
                  </p>

                  {/* Action Button */}
                  {step.actionLabel && step.onAction && (
                    <Button
                      onClick={step.onAction}
                      variant="outline"
                      size="sm"
                      disabled={isDisabled}
                      className={`mt-auto transition-colors ${
                        isDisabled
                          ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                          : 'border-primary text-primary hover:bg-primary hover:text-white'
                      }`}
                    >
                      {step.actionLabel}
                    </Button>
                  )}
                </div>

                {/* Arrow (desktop only, not after last step) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 -right-3 z-10">
                    <ArrowRight className="w-5 h-5 text-primary/30" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      {ctaLabel && (
        <div className="flex justify-center pt-4 border-t">
          <Button onClick={onCtaClick} className="bg-primary hover:bg-primary/90">
            {ctaLabel}
          </Button>
        </div>
      )}
    </div>
  );
}