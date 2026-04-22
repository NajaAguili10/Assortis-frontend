import React, { ReactNode } from 'react';

interface StatisticsFilterBarProps {
  children: ReactNode;
}

export function StatisticsFilterBar({ children }: StatisticsFilterBarProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}
