import React, { ReactNode } from 'react';

interface StatisticsChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function StatisticsChartCard({
  title,
  description,
  children,
  className = '',
}: StatisticsChartCardProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-primary mb-1">{title}</h3>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      {children}
    </div>
  );
}
