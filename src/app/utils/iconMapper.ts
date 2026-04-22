/**
 * Utilitaire pour mapper les noms d'icônes (strings) vers les composants Lucide React
 * Permet de gérer dynamiquement les icônes depuis le backoffice
 */

import {
  Gift,
  Users,
  Building2,
  Check,
  Sparkles,
  Shield,
  Headphones,
  TrendingUp,
  Zap,
  UserPlus,
  CheckCircle2,
  UserCheck,
  Rocket,
  LayoutDashboard,
  User,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Star,
  Award,
  Target,
  Briefcase,
  FileText,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Bell,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Heart,
  Share2,
  MessageSquare,
  Send,
  Edit,
  Trash2,
  Plus,
  Minus,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Globe,
  Home,
  Menu,
  MoreVertical,
  MoreHorizontal,
  type LucideIcon
} from 'lucide-react';

/**
 * Map des icônes disponibles
 * Ajouter de nouvelles icônes ici selon les besoins
 */
const iconMap: Record<string, LucideIcon> = {
  Gift,
  Users,
  Building2,
  Check,
  Sparkles,
  Shield,
  Headphones,
  TrendingUp,
  Zap,
  UserPlus,
  CheckCircle2,
  UserCheck,
  Rocket,
  LayoutDashboard,
  User,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Star,
  Award,
  Target,
  Briefcase,
  FileText,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Bell,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Heart,
  Share2,
  MessageSquare,
  Send,
  Edit,
  Trash2,
  Plus,
  Minus,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Globe,
  Home,
  Menu,
  MoreVertical,
  MoreHorizontal
};

/**
 * Récupère un composant d'icône par son nom
 * @param iconName - Nom de l'icône (ex: 'Users', 'Sparkles')
 * @returns Le composant d'icône ou une icône par défaut
 */
export const getIconByName = (iconName: string): LucideIcon => {
  return iconMap[iconName] || iconMap.Star; // Icône par défaut si non trouvée
};

/**
 * Vérifie si une icône existe dans le map
 * @param iconName - Nom de l'icône à vérifier
 * @returns true si l'icône existe, false sinon
 */
export const iconExists = (iconName: string): boolean => {
  return iconName in iconMap;
};

/**
 * Récupère la liste de tous les noms d'icônes disponibles
 * Utile pour l'interface d'administration du backoffice
 * @returns Tableau des noms d'icônes disponibles
 */
export const getAvailableIconNames = (): string[] => {
  return Object.keys(iconMap).sort();
};
