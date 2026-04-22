// Sector Icons and Colors
// Maps each sector to its icon component
// Uses Assortis red/black color scheme for consistency
import {
  GraduationCap,
  Heart,
  Sprout,
  Building,
  Scale,
  Leaf,
  Droplet,
  Zap,
  Users,
  Shield,
  UserCheck,
  AlertTriangle,
  MoreHorizontal,
  type LucideIcon
} from 'lucide-react';
import { SectorEnum } from '../types/tender.dto';

export interface SectorStyle {
  icon: LucideIcon;
}

export const SECTOR_ICONS: Record<SectorEnum, SectorStyle> = {
  [SectorEnum.EDUCATION]: {
    icon: GraduationCap,
  },
  [SectorEnum.HEALTH]: {
    icon: Heart,
  },
  [SectorEnum.AGRICULTURE]: {
    icon: Sprout,
  },
  [SectorEnum.INFRASTRUCTURE]: {
    icon: Building,
  },
  [SectorEnum.GOVERNANCE]: {
    icon: Scale,
  },
  [SectorEnum.ENVIRONMENT]: {
    icon: Leaf,
  },
  [SectorEnum.WATER_SANITATION]: {
    icon: Droplet,
  },
  [SectorEnum.ENERGY]: {
    icon: Zap,
  },
  [SectorEnum.GENDER]: {
    icon: Users,
  },
  [SectorEnum.HUMAN_RIGHTS]: {
    icon: Shield,
  },
  [SectorEnum.YOUTH]: {
    icon: UserCheck,
  },
  [SectorEnum.EMERGENCY_RESPONSE]: {
    icon: AlertTriangle,
  },
  [SectorEnum.OTHER]: {
    icon: MoreHorizontal,
  }
};

export function getSectorIcon(sector: SectorEnum): LucideIcon {
  return SECTOR_ICONS[sector].icon;
}

export function getSectorStyle(sector: SectorEnum): SectorStyle {
  return SECTOR_ICONS[sector];
}