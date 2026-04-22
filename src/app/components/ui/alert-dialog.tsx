import * as React from 'react';
import { X } from 'lucide-react';

interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function AlertDialog({ open = false, onOpenChange, children }: AlertDialogProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget && onOpenChange) {
          onOpenChange(false);
        }
      }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-50">{children}</div>
    </div>
  );
}

interface AlertDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogContent({ children, className = '' }: AlertDialogContentProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

interface AlertDialogHeaderProps {
  children: React.ReactNode;
}

export function AlertDialogHeader({ children }: AlertDialogHeaderProps) {
  return <div className="mb-4">{children}</div>;
}

interface AlertDialogTitleProps {
  children: React.ReactNode;
}

export function AlertDialogTitle({ children }: AlertDialogTitleProps) {
  return <h2 className="text-xl font-semibold text-primary mb-2">{children}</h2>;
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode;
}

export function AlertDialogDescription({ children }: AlertDialogDescriptionProps) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

interface AlertDialogFooterProps {
  children: React.ReactNode;
}

export function AlertDialogFooter({ children }: AlertDialogFooterProps) {
  return <div className="mt-6 flex items-center justify-end gap-3">{children}</div>;
}

interface AlertDialogActionProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function AlertDialogAction({ children, onClick, className = '' }: AlertDialogActionProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

interface AlertDialogCancelProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function AlertDialogCancel({ children, onClick }: AlertDialogCancelProps) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
    >
      {children}
    </button>
  );
}
