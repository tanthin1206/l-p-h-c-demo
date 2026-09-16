import React from 'react';
import { X, Sparkles, Award, Star } from 'lucide-react';

export interface ToastData {
  type: 'success' | 'rankup' | 'warning';
  title: string;
  subtitle: string;
  badge?: string;
}

interface ToastFeedbackProps {
  toast: ToastData | null;
  onClose: () => void;
}

export const ToastFeedback: React.FC<ToastFeedbackProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div
      id="toast-score-feedback"
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto cursor-pointer"
      onClick={onClose}
    >
      <div
        className={`p-3.5 sm:p-4 rounded-2xl shadow-2xl border-2 flex items-center gap-3 backdrop-blur-md ${
          toast.type === "rankup"
            ? "bg-gradient-to-r from-amber-900/95 via-red-900/95 to-amber-900/95 text-white border-amber-400 ring-4 ring-amber-400/30"
            : toast.type === "success"
            ? "bg-amber-900/95 text-white border-amber-400 ring-2 ring-amber-500/20"
            : "bg-slate-900/95 text-white border-rose-400 ring-2 ring-rose-500/20"
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0">
          {toast.badge || (toast.type === "success" ? "⭐" : "📜")}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm sm:text-base text-amber-200 truncate font-sans">
            {toast.title}
          </h4>
          <p className="text-xs text-white/90 truncate mt-0.5 font-sans">
            {toast.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-white/60 hover:text-white p-1 rounded-lg cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
