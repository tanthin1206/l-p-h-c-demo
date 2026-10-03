import React from 'react';
import { X } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

type ButtonVariant = 'primary' | 'gold' | 'success' | 'danger' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary-800 hover:bg-primary-900 text-gold-100 shadow-sm',
  gold: 'bg-gradient-to-b from-gold-300 to-gold-500 hover:from-gold-400 hover:to-gold-600 text-primary-950 shadow-sm',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
  danger: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm',
  outline: 'bg-white border border-paper-line hover:border-gold-400 text-ink-soft hover:text-ink',
  ghost: 'text-ink-soft hover:bg-paper-warm hover:text-ink',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-3.5 py-2 text-sm gap-2 rounded-xl',
  lg: 'px-5 py-3 text-base gap-2 rounded-xl',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ComponentType<{ className?: string }>;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'outline',
  size = 'md',
  icon: Icon,
  className = '',
  children,
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    className={`inline-flex items-center justify-center font-bold transition-all active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    {...rest}
  >
    {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
    {children}
  </button>
);

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...rest }) => (
  <div className={`card ${className}`} {...rest} />
);

/* ------------------------------------------------------------------ */
/* Page header                                                         */
/* ------------------------------------------------------------------ */

export const PageHeader: React.FC<{
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ icon: Icon, title, subtitle, actions }) => (
  <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
    <div className="flex items-center gap-3 min-w-0">
      {Icon && (
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-gold-200 flex items-center justify-center shadow-sm shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="min-w-0">
        <h1 className="page-title truncate">{title}</h1>
        {subtitle && <p className="page-subtitle mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

/* ------------------------------------------------------------------ */
/* Stat tile                                                           */
/* ------------------------------------------------------------------ */

export const StatTile: React.FC<{
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: 'primary' | 'gold' | 'success' | 'danger' | 'neutral';
  hint?: React.ReactNode;
}> = ({ label, value, icon: Icon, tone = 'neutral', hint }) => {
  const tones = {
    primary: 'bg-primary-50 text-primary-800',
    gold: 'bg-gold-50 text-gold-800',
    success: 'bg-emerald-50 text-emerald-800',
    danger: 'bg-rose-50 text-rose-700',
    neutral: 'bg-paper-warm text-ink-soft',
  } as const;
  return (
    <div className="card p-3.5 flex items-center gap-3">
      {Icon && (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-wide text-ink-muted truncate">{label}</div>
        <div className="text-xl font-black text-ink leading-tight">{value}</div>
        {hint && <div className="text-[11px] text-ink-muted truncate">{hint}</div>}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Modal shell                                                         */
/* ------------------------------------------------------------------ */

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
  children: React.ReactNode;
}> = ({ open, onClose, title, subtitle, icon: Icon, size = 'md', footer, children }) => {
  if (!open) return null;
  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-primary-950/55 backdrop-blur-[2px] animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`bg-white rounded-3xl w-full ${widths[size]} shadow-pop border border-paper-line flex flex-col max-h-[94vh] overflow-hidden animate-pop-in`}
        onClick={e => e.stopPropagation()}
      >
        {(title || Icon) && (
          <div className="flex items-start gap-3 px-5 sm:px-6 pt-5 pb-4 border-b border-paper-line bg-gradient-to-b from-paper-warm to-white">
            {Icon && (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-gold-200 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && <h2 className="text-lg sm:text-xl font-black font-serif text-ink leading-tight">{title}</h2>}
              {subtitle && <div className="text-xs text-ink-muted mt-0.5">{subtitle}</div>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -mr-1.5 rounded-lg text-ink-muted hover:bg-paper-warm hover:text-ink cursor-pointer"
              title="Đóng (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4">{children}</div>
        {footer && <div className="px-5 sm:px-6 py-3.5 border-t border-paper-line bg-paper-warm flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Empty state                                                         */
/* ------------------------------------------------------------------ */

export const EmptyState: React.FC<{
  image?: string;
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}> = ({ image, icon: Icon, title, description, action }) => (
  <div className="card p-8 sm:p-10 flex flex-col items-center text-center">
    {image ? (
      <img src={image} alt="" className="w-40 h-40 object-cover rounded-3xl mb-4 shadow-card" />
    ) : Icon ? (
      <div className="w-16 h-16 rounded-3xl bg-gold-100 text-gold-700 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
    ) : null}
    <h3 className="text-lg font-black font-serif text-ink">{title}</h3>
    {description && <p className="mt-1 text-sm text-ink-muted max-w-md">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
