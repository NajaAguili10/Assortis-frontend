import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';

interface PillTabItem {
  id: string;
  label: string;
  count?: number;
}

interface PillTabsProps {
  tabs: PillTabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export default function PillTabs({ tabs, activeTab, onTabChange, className }: PillTabsProps) {
  return (
    <div className={`flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit ${className || ''}`.trim()}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <Button
            key={tab.id}
            variant="ghost"
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              isActive
                ? 'bg-white text-accent shadow-sm hover:bg-white hover:text-accent'
                : 'bg-transparent text-slate-700 hover:bg-accent hover:text-white'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
            {typeof tab.count === 'number' && (
              <Badge
                variant="secondary"
                className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-accent/10 text-accent' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {tab.count}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
}
