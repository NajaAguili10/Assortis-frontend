import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface Tab {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onClick?: () => void;
}

interface PageTabsProps {
  tabs: Tab[];
}

export function PageTabs({ tabs }: PageTabsProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center gap-8 -mb-px">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            return (
              <button
                key={index}
                onClick={tab.onClick}
                className={`flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  tab.active
                    ? 'text-accent border-accent'
                    : 'text-gray-600 hover:text-gray-900 border-transparent'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}