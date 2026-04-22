import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@app/components/ui/tooltip';

interface RestrictedTooltipProps {
  disabled: boolean;
  content: string;
  children: React.ReactNode;
}

export function RestrictedTooltip({ disabled, content, children }: RestrictedTooltipProps) {
  if (!disabled) {
    return <>{children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex w-full cursor-not-allowed">{children}</span>
      </TooltipTrigger>
      <TooltipContent sideOffset={8}>{content}</TooltipContent>
    </Tooltip>
  );
}