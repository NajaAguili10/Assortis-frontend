import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: string;
  trend?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  badge,
  trend,
  icon: Icon,
  iconBgColor = 'bg-accent/10',
  iconColor = 'text-accent',
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm text-gray-600">{title}</h3>
        <div className={`${iconBgColor} ${iconColor} p-2 rounded-lg`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex items-end gap-2 mb-1">
        <p className="text-3xl font-bold text-primary">{value}</p>
        {trend && (
          <span className="text-sm text-green-600 mb-1">{trend}</span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
        {badge && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-white">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
