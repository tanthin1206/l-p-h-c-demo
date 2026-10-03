import React from 'react';
import { Crown, Sparkles, Trophy } from 'lucide-react';
import { Student } from '../types';
import { getRankByPoints } from '../utils/ranks';
import { ChibiAvatar } from './ChibiAvatar';

interface TopScholarsStripProps {
  students: Student[];
  onOpenHonorBoard: () => void;
  onOpenDetailModal: (student: Student) => void;
}

export const TopScholarsStrip: React.FC<TopScholarsStripProps> = ({
  students,
  onOpenHonorBoard,
  onOpenDetailModal
}) => {
  const top3 = [...students].sort((a, b) => b.points - a.points).slice(0, 3);
  if (top3.length === 0) return null;

  return (
    <div
      id="top-scholars-strip"
      className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 rounded-3xl p-4 sm:p-5 border-2 border-amber-300 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 select-none"
    >
      {/* Left info */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0 border border-amber-300">
          🏆
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-black text-amber-950 font-serif">
              BẢNG VÀNG DANH DỰ
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-400 font-sans">
              TOP 3 DẪN ĐẦU
            </span>
          </div>
          <p className="text-xs text-slate-600 font-sans">
            Vinh danh những Sĩ tử có thành tích thi đua xuất sắc nhất lớp
          </p>
        </div>
      </div>

      {/* Center 3 cards */}
      <div className="flex items-center justify-around sm:justify-center gap-2 sm:gap-4 flex-1">
        {top3.map((student, idx) => {
          const rank = getRankByPoints(student.points);
          const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉";
          const borderClass =
            idx === 0
              ? "border-amber-400 ring-2 ring-yellow-400 bg-yellow-50/90"
              : idx === 1
              ? "border-purple-300 bg-purple-50/90"
              : "border-amber-200 bg-amber-50/90";

          return (
            <div
              key={student.id}
              onClick={() => onOpenDetailModal(student)}
              className={`flex items-center gap-2 p-2 sm:px-3 rounded-2xl border ${borderClass} shadow-xs hover:scale-105 transition-all cursor-pointer bg-white/90`}
              title={`Xem hồ sơ của ${student.name}`}
            >
              <div className="relative shrink-0">
                <ChibiAvatar
                  points={student.points}
                  gender={student.gender}
                  size="sm"
                  customPhotoUrl={student.customPhotoUrl}
                />
                <span className="absolute -top-1.5 -right-1.5 text-xs bg-white rounded-full p-0.5 shadow border border-amber-300">
                  {medal}
                </span>
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 text-xs truncate max-w-[90px] sm:max-w-[120px] font-serif">
                  {student.name}
                </div>
                <div className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                  <span>🌸 {student.points}</span>
                  <span className="text-slate-400 font-normal">| {rank.tier}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right button to open full honor modal */}
      <button
        type="button"
        onClick={onOpenHonorBoard}
        className="px-4 py-2 rounded-2xl bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-800 hover:to-amber-800 text-white font-bold text-xs shadow-md border border-amber-500/50 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-all hover:scale-105"
      >
        <Crown className="w-4 h-4 text-yellow-300" />
        <span>Xem Bảng Vàng</span>
      </button>
    </div>
  );
};
