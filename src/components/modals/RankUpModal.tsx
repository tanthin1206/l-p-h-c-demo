import React, { useEffect } from 'react';
import { Crown, Sparkles, Award, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student } from '../../types';
import { getRankByPoints } from '../../utils/ranks';
import { ChibiAvatar } from '../ChibiAvatar';
import { soundEngine } from '../../utils/soundEngine';

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

export const RankUpModal: React.FC<RankUpModalProps> = ({
  isOpen,
  onClose,
  rankUpEvent,
  onOpenHonorBoard
}) => {
  if (!isOpen || !rankUpEvent) return null;

  const { student, newTier } = rankUpEvent;
  const rank = getRankByPoints(student.points);

  return (
    <div
      id="modal-rankup-decree"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-300 select-none"
    >
      <div className="relative w-full max-w-lg sm:max-w-xl my-auto flex items-stretch animate-in zoom-in-95 duration-300">
        <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/30 via-yellow-400/40 to-amber-600/30 rounded-[40px] blur-xl pointer-events-none animate-pulse" />

        {/* Left rod */}
        <div className="flex flex-col items-center justify-between py-2 -mr-3.5 z-20 shrink-0 select-none">
          <div className="w-8 h-10 rounded-t-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-600 shadow-lg border border-amber-800 flex items-center justify-center">
            <span className="text-xs">🏮</span>
          </div>
          <div className="w-6 flex-1 bg-gradient-to-r from-amber-600 via-yellow-300 to-amber-700 shadow-xl border-x border-amber-800 flex flex-col justify-around items-center py-4">
            <div className="w-full h-1.5 bg-amber-950/40 my-2" />
            <div className="w-full h-1.5 bg-amber-950/40 my-2" />
            <div className="w-full h-1.5 bg-amber-950/40 my-2" />
            <div className="w-full h-1.5 bg-amber-950/40 my-2" />
          </div>
          <div className="w-8 h-10 rounded-b-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-600 shadow-lg border border-amber-800 flex items-center justify-center">
            <span className="text-xs">🏮</span>
          </div>
        </div>

        {/* Center decree canvas */}
        <div className="flex-1 bg-gradient-to-b from-[#FFFDF7] via-[#FFF9EA] to-[#FFF4D4] rounded-2xl sm:rounded-3xl border-4 sm:border-8 border-amber-500 shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden font-serif z-10">
          <button
            id="btn-decree-close"
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-amber-100 text-amber-900 z-10 cursor-pointer"
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

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-200 text-amber-950 font-sans font-black text-xs uppercase tracking-widest mb-2 border border-amber-400 shadow-xs">
            <Crown className="w-4 h-4 text-amber-900 animate-bounce" />
            <span>VINH QUY THĂNG HẠNG KHOA BẢNG</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-red-900 font-brand mb-1">
            {student.name}
          </h3>
          <p className="text-xs font-sans text-slate-600 mb-4">
            Chúc mừng em đã xuất sắc đỗ học vị:
          </p>

          {/* Rank title highlight box */}
          <div className="bg-amber-100/90 border-2 border-amber-400 rounded-2xl p-4 mb-5 shadow-inner">
            <div className="text-xl sm:text-2xl font-black text-amber-950 flex items-center justify-center gap-2">
              <span>{rank.badge}</span>
              <span>{rank.title.toUpperCase()}</span>
              <span>{rank.hatIcon}</span>
            </div>
            <p className="text-xs font-sans text-slate-700 mt-1 italic">
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
              className="flex-1 py-3 bg-gradient-to-r from-red-600 to-amber-700 hover:from-red-700 hover:to-amber-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg border border-red-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Xem Bảng Vàng Đua Top</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-xs sm:text-sm rounded-xl cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

        {/* Right rod */}
        <div className="flex flex-col items-center justify-between py-2 -ml-3.5 z-20 shrink-0 select-none">
          <div className="w-8 h-10 rounded-t-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-600 shadow-lg border border-amber-800 flex items-center justify-center">
            <span className="text-xs">🏮</span>
          </div>
          <div className="w-6 flex-1 bg-gradient-to-r from-amber-600 via-yellow-300 to-amber-700 shadow-xl border-x border-amber-800 flex flex-col justify-around items-center py-4">
            <div className="w-full h-1.5 bg-amber-950/40 my-2" />
            <div className="w-full h-1.5 bg-amber-950/40 my-2" />
            <div className="w-full h-1.5 bg-amber-950/40 my-2" />
            <div className="w-full h-1.5 bg-amber-950/40 my-2" />
          </div>
          <div className="w-8 h-10 rounded-b-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-600 shadow-lg border border-amber-800 flex items-center justify-center">
            <span className="text-xs">🏮</span>
          </div>
        </div>
      </div>
    </div>
  );
};
