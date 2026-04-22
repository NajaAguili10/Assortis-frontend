import { Loader2, AlertCircle, FileX, Info } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

// Loading State Component
interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ message, size = 'md' }: LoadingStateProps) {
  const { t } = useTranslation();
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {message && (
        <p className="text-gray-600">{message}</p>
      )}
    </div>
  );
}

// Empty State Component
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 text-gray-400">
        {icon || <FileX className="h-16 w-16" />}
      </div>
      <h3 className="mb-2 font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mb-6 text-gray-600 max-w-md">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// Error State Component
interface ErrorStateProps {
  title?: string;
  message: string;
  retry?: {
    label: string;
    onClick: () => void;
  };
}

export function ErrorState({ title, message, retry }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 p-3 bg-red-50 rounded-full">
        <AlertCircle className="h-12 w-12 text-red-600" />
      </div>
      <h3 className="mb-2 font-semibold text-gray-900">
        {title || t('error.title')}
      </h3>
      <p className="mb-6 text-gray-600 max-w-md">{message}</p>
      {retry && (
        <button
          onClick={retry.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {retry.label}
        </button>
      )}
    </div>
  );
}

// Info State Component
interface InfoStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  variant?: 'info' | 'warning' | 'success';
}

export function InfoState({ icon, title, description, variant = 'info' }: InfoStateProps) {
  const variantStyles = {
    info: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      text: 'text-blue-900'
    },
    warning: {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-600',
      text: 'text-yellow-900'
    },
    success: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      text: 'text-green-900'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg ${styles.bg}`}>
      <div className={styles.icon}>
        {icon || <Info className="h-5 w-5" />}
      </div>
      <div className="flex-1">
        <h4 className={`font-semibold ${styles.text}`}>{title}</h4>
        <p className={`mt-1 text-sm ${styles.text} opacity-80`}>{description}</p>
      </div>
    </div>
  );
}

// Skeleton Card for Loading Lists
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
}

// Page Loading (Full Page)
export function PageLoading() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState message={t('loading')} size="lg" />
    </div>
  );
}