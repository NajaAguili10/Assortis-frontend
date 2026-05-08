import { NavLink } from 'react-router';
import { Search, Download } from 'lucide-react';

const tabs = [
  { label: 'Search', to: '/experts/search', icon: Search },
  { label: 'Downloaded CVs', to: '/experts/my-experts', icon: Download },
];

export function ExpertWorkspaceTabs() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
      <div className="grid gap-1 sm:grid-cols-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                [
                  'flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold transition',
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary',
                ].join(' ')
              }
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
