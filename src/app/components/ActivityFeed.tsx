import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  badge?: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  title?: string;
}

export function ActivityFeed({ items, title = 'Activité récente' }: ActivityFeedProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-primary mb-6">{title}</h2>
      <div className="space-y-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
              <div className={`${item.iconBgColor || 'bg-gray-50'} ${item.iconColor || 'text-gray-500'} p-2.5 rounded-lg flex-shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-primary text-sm">{item.title}</h3>
                  {item.badge && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium text-white bg-accent rounded-full flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                <p className="text-xs text-gray-400">{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
