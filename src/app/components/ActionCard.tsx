import React from 'react';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { RestrictedTooltip } from '@app/components/RestrictedTooltip';

interface ActionCardProps {
  title: string;
  icon: LucideIcon;
  badge?: string;
  onClick?: () => void;
  disabled?: boolean;
  disabledMessage?: string;
}

export function ActionCard({ title, icon: Icon, badge, onClick, disabled = false, disabledMessage = '' }: ActionCardProps) {
  const content = (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-between rounded-lg border-2 bg-white p-4 transition-all group ${
        disabled
          ? 'cursor-not-allowed border-accent/20 opacity-60'
          : 'hover:border-accent hover:bg-accent/5'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`rounded-lg p-2 transition-colors ${
            disabled
              ? 'bg-accent/10 text-accent'
              : 'bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-semibold text-primary">{title}</span>
        {badge && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent/10 text-accent border border-accent/20">
            {badge}
          </span>
        )}
      </div>
      <ChevronRight className={`w-5 h-5 transition-colors ${disabled ? 'text-gray-400' : 'text-gray-400 group-hover:text-accent'}`} />
    </button>
  );

  return (
    <RestrictedTooltip disabled={disabled} content={disabledMessage}>
      {content}
    </RestrictedTooltip>
  );
}
