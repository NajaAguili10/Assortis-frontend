import React from 'react';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  stats?: Array<{ label: string; value: string | number }>;
  link?: string;
  badge?: string;
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  iconBgColor = 'bg-accent/10',
  iconColor = 'text-accent',
  stats,
  link,
  badge,
}: FeatureCardProps) {
  const Content = (
    <>
      <div className="relative">
        <div className={`${iconBgColor} ${iconColor} p-3 rounded-lg inline-flex mb-4`}>
          <Icon className="w-6 h-6" />
        </div>
        {badge && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-accent rounded-full">
            {badge}
          </span>
        )}
      </div>
      
      <h3 className="font-semibold text-lg text-primary mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      
      {stats && stats.length > 0 && (
        <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-100">
          {stats.map((stat, index) => (
            <div key={index}>
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
      
      {link && (
        <div className="flex items-center text-sm text-accent font-medium group-hover:gap-2 transition-all">
          Voir les détails
          <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      )}
    </>
  );

  if (link) {
    return (
      <Link
        to={link}
        className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-accent/30 transition-all group"
      >
        {Content}
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {Content}
    </div>
  );
}
