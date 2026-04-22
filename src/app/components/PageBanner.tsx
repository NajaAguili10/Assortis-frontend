import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { BANNER_DIMENSIONS, BannerSize } from '../types/banner.dto';

interface PageBannerProps {
  icon: LucideIcon;
  title: string;
  description: string;
  stats?: Array<{
    value: string | number;
    label: string;
  }>;
  size?: BannerSize;
}

export function PageBanner({ icon: Icon, title, description, stats, size = 'default' }: PageBannerProps) {
  return (
    <div 
      className="bg-primary text-white border-b-4 border-accent flex items-center"
      style={{ height: BANNER_DIMENSIONS.height[size] }}
    >
      <div className="mx-auto max-w-6xl w-full px-4 sm:px-5 lg:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5">
          <div 
            className="bg-accent rounded-xl shadow-lg flex items-center justify-center flex-shrink-0"
            style={{ 
              width: BANNER_DIMENSIONS.iconSize.width,
              height: BANNER_DIMENSIONS.iconSize.height 
            }}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{title}</h1>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed">{description}</p>
          </div>
          {stats && stats.length > 0 && (
            <div className="hidden md:flex items-center gap-6 flex-shrink-0">
              {stats.map((stat) => (
                <div key={`${stat.label}-${stat.value}`} className="text-right">
                  <div className="text-3xl font-bold leading-none mb-1">{stat.value}</div>
                  <div className="text-xs text-white/80 whitespace-nowrap">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}