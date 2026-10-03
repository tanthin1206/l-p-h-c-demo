import React from 'react';
import { Crown, Award, X } from 'lucide-react';
import { Student } from '../../types';
import { getRankByPoints } from '../../utils/ranks';
import { ChibiAvatar } from '../ChibiAvatar';

interface RankUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  rankUpEvent: {
    student: Student;
    prevTier: string;
    newTier: string;
  } | null;
  onOpenHonorBoard: () => void;
}

/** Trục cuộn hai bên sắc phong */
const DecreeRod: React.FC<{ side: 'left' | 'right' }> = ({ side }) => (
  <div
    className={`flex flex-col items-center justify-between py-2 z-20 shrink-0 select-none ${
      side === 'left' ? '-mr-3.5' : '-ml-3.5'
    }`}
  >
    <div className="w-7 sm:w-8 h-10 rounded-t-full bg-gradient-to-r from-gold-400 via-gold-200 to-gold-600 shadow-sm border border-gold-800 flex items-center justify-center">
      <span className="text-xs">🏮</span>
    </div>
    <div className="w-5 sm:w-6 flex-1 bg-gradient-to-r from-gold-600 via-gold-300 to-gold-700 shadow-card border-x border-gold-800 flex flex-col justify-around items-center py-4">
      <div className="w-full h-1.5 bg-gold-900/40 my-2" />
      <div className="w-full h-1.5 bg-gold-900/40 my-2" />
      <div className="w-full h-1.5 bg-gold-900/40 my-2" />
      <div className="w-full h-1.5 bg-gold-900/40 my-2" />
    </div>
    <div className="w-7 sm:w-8 h-10 rounded-b-full bg-gradient-to-r from-gold-400 via-gold-200 to-gold-600 shadow-sm border border-gold-800 flex items-center justify-center">
      <span className="text-xs">🏮</span>
    </div>
  </div>
);

export const RankUpModal: React.FC<RankUpModalProps> = ({
  isOpen,
  onClose,
  rankUpEvent,
  onOpenHonorBoard
}) => {
  if (!isOpen || !rankUpEvent) return null;

  const { student } = rankUpEvent;
  const rank = getRankByPoints(student.points);

  return (
    <div
      id="modal-rankup-decree"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-primary-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in select-none"
    >
      <div className="relative w-full max-w-lg sm:max-w-xl my-auto flex items-stretch animate-pop-in">
        <div className="absolute -inset-4 bg-gradient-to-r from-gold-500/25 via-gold-300/35 to-gold-600/25 rounded-[40px] blur-xl pointer-events-none animate-pulse" />

        <DecreeRod side="left" />

        {/* Center decree canvas */}
        <div className="flex-1 bg-gradient-to-b from-paper via-paper-warm to-gold-50 rounded-3xl border-4 sm:border-[6px] border-gold-400 shadow-pop p-5 sm:p-8 text-center relative overflow-hidden font-serif z-10">
          <button
            id="btn-decree-close"
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-lg text-ink-muted hover:bg-paper-warm hover:text-ink z-10 cursor-pointer"
            title="Đóng (ESC)"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Floating Avatar */}
          <div className="flex justify-center mb-3">
            <div className="relative">
              <ChibiAvatar
                points={student.points}
                gender={student.gender}
                size="2xl"
                showAura={true}
                animated={true}
                customPhotoUrl={student.customPhotoUrl}
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold-100 text-gold-800 font-sans font-black text-[11px] sm:text-xs uppercase tracking-widest mb-2 border border-gold-300">
            <Crown className="w-4 h-4 text-gold-700 animate-bounce" />
            <span>VINH QUY THĂNG HẠNG KHOA BẢNG</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-primary-900 font-brand mb-1 break-words">
            {student.name}
          </h3>
          <p className="text-xs font-sans text-ink-muted mb-4">
            Chúc mừng em đã xuất sắc đỗ học vị:
          </p>

          {/* Rank title highlight box */}
          <div className="bg-white/80 border border-gold-300 rounded-2xl p-4 mb-5 shadow-inner-gold">
            <div className="text-xl sm:text-2xl font-black text-ink flex items-center justify-center gap-2 flex-wrap">
              <span>{rank.badge}</span>
              <span>{rank.title.toUpperCase()}</span>
              <span>{rank.hatIcon}</span>
            </div>
            <p className="text-xs font-sans text-ink-soft mt-1 italic">
              « {rank.description} »
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 font-sans">
            <button
              id="btn-decree-honor"
              type="button"
              onClick={() => {
                onClose();
                onOpenHonorBoard();
              }}
              className="flex-1 py-3 bg-primary-800 hover:bg-primary-900 text-gold-100 font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4 text-gold-300" />
              <span>Xem Bảng Vàng Đua Top</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-white border border-paper-line hover:border-gold-400 text-ink-soft hover:text-ink font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

        <DecreeRod side="right" />
      </div>
    </div>
  );
};
