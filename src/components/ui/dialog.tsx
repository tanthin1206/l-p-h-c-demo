import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

/**
 * Hộp thoại & thông báo đồng bộ phong cách, thay cho window.alert / window.confirm.
 *
 *   notify('Đã lưu!', 'success')               // thông báo nhỏ, tự tắt
 *   if (await confirmDialog('Xóa học sinh?')) { ... }
 *
 * Cần gắn <DialogHost /> một lần ở gốc ứng dụng.
 */

type NotifyType = 'success' | 'error' | 'info' | 'warning';

interface NotifyItem {
  id: number;
  message: string;
  type: NotifyType;
}

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (ok: boolean) => void;
}

type Listener = () => void;

let notifyItems: NotifyItem[] = [];
let confirmState: ConfirmState | null = null;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach(l => l());
let seq = 0;

const inferType = (message: string): NotifyType => {
  const m = message.toLowerCase();
  if (m.includes('lỗi') || m.includes('không đúng') || m.includes('không tìm thấy')) return 'error';
  if (m.includes('vui lòng') || m.includes('phải có') || m.includes('chưa có')) return 'warning';
  if (m.includes('thành công') || m.startsWith('đã ')) return 'success';
  return 'info';
};

export const notify = (message: string, type?: NotifyType) => {
  const id = ++seq;
  notifyItems = [...notifyItems, { id, message, type: type || inferType(message) }];
  emit();
  setTimeout(() => {
    notifyItems = notifyItems.filter(n => n.id !== id);
    emit();
  }, 3800);
};

export const confirmDialog = (opts: ConfirmOptions | string): Promise<boolean> => {
  const o: ConfirmOptions = typeof opts === 'string' ? { message: opts } : opts;
  const danger = o.danger ?? /xóa|đặt lại|cảnh báo/i.test(o.message);
  return new Promise(resolve => {
    // Nếu đang có hộp thoại khác, coi như hủy cái cũ
    confirmState?.resolve(false);
    confirmState = { ...o, danger, resolve };
    emit();
  });
};

const closeConfirm = (ok: boolean) => {
  if (!confirmState) return;
  const { resolve } = confirmState;
  confirmState = null;
  emit();
  resolve(ok);
};

const ICONS: Record<NotifyType, { icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  success: { icon: CheckCircle2, cls: 'bg-emerald-600 text-white' },
  error: { icon: XCircle, cls: 'bg-primary-700 text-white' },
  warning: { icon: AlertTriangle, cls: 'bg-gold-500 text-primary-950' },
  info: { icon: Info, cls: 'bg-primary-900 text-gold-100' },
};

export const DialogHost: React.FC = () => {
  const [, force] = useState(0);

  useEffect(() => {
    const l = () => force(x => x + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  useEffect(() => {
    if (!confirmState) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); closeConfirm(false); }
      if (e.key === 'Enter') { e.preventDefault(); closeConfirm(true); }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  });

  const c = confirmState;

  return (
    <>
      {/* Notifications */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none w-[min(92vw,440px)]">
        {notifyItems.map(n => {
          const { icon: Icon, cls } = ICONS[n.type];
          return (
            <div
              key={n.id}
              className={`pointer-events-auto w-full flex items-start gap-2.5 px-4 py-3 rounded-2xl shadow-pop text-sm font-semibold animate-pop-in ${cls}`}
              role="status"
            >
              <Icon className="w-5 h-5 shrink-0 mt-px" />
              <span className="flex-1 leading-snug">{n.message}</span>
              <button
                type="button"
                className="opacity-70 hover:opacity-100 cursor-pointer"
                onClick={() => {
                  notifyItems = notifyItems.filter(x => x.id !== n.id);
                  emit();
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirm */}
      {c && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-primary-950/55 backdrop-blur-[2px] animate-fade-in"
          onClick={() => closeConfirm(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className="bg-white rounded-3xl w-full max-w-md shadow-pop border border-paper-line overflow-hidden animate-pop-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 flex gap-4">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  c.danger ? 'bg-primary-100 text-primary-700' : 'bg-gold-100 text-gold-700'
                }`}
              >
                {c.danger ? <AlertTriangle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-black font-serif text-ink">
                  {c.title || (c.danger ? 'Xác nhận thao tác' : 'Xác nhận')}
                </h3>
                <p className="mt-1 text-sm text-ink-soft whitespace-pre-line leading-relaxed">{c.message}</p>
              </div>
            </div>
            <div className="px-6 py-4 bg-paper-warm flex justify-end gap-2 border-t border-paper-line">
              <button
                type="button"
                onClick={() => closeConfirm(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-ink-soft bg-white border border-paper-line hover:bg-paper cursor-pointer"
              >
                {c.cancelText || 'Hủy'}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => closeConfirm(true)}
                className={`px-4 py-2 rounded-xl text-sm font-black text-white shadow-sm cursor-pointer ${
                  c.danger ? 'bg-primary-700 hover:bg-primary-800' : 'bg-gold-600 hover:bg-gold-700'
                }`}
              >
                {c.confirmText || (c.danger ? 'Đồng ý' : 'OK')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
