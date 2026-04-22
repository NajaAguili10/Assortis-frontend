import { LucideIcon } from 'lucide-react';
import { Badge } from './ui/badge';

export interface SubMenuItem {
  label: string;
  active?: boolean;
  icon?: LucideIcon;
  badge?: string | number;
  onClick?: () => void;
  disabled?: boolean;
}

interface SubMenuProps {
  items: SubMenuItem[];
}

export function SubMenu({ items }: SubMenuProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <nav className="flex items-center gap-1 overflow-x-auto">
          {items.map((item, index) => {
            const Icon = item.icon;
            const isDisabled = item.disabled || !item.onClick;
            
            return (
              <button
                key={index}
                onClick={isDisabled ? undefined : item.onClick}
                disabled={isDisabled}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                  border-b-2 transition-all duration-200
                  ${
                    isDisabled
                      ? 'border-transparent text-gray-400 cursor-not-allowed opacity-60'
                      : item.active
                      ? 'border-accent text-primary bg-accent/5'
                      : 'border-transparent text-gray-600 hover:text-primary hover:border-gray-300'
                  }
                `}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant="secondary" 
                    className="ml-1 bg-accent text-white text-xs px-1.5 py-0 h-5 min-w-[20px] flex items-center justify-center"
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}