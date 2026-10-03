import React from 'react';
import { Crown, ChevronRight } from 'lucide-react';
import { Student } from '../types';
import { getRankByPoints } from '../utils/ranks';
import { ChibiAvatar } from './ChibiAvatar';

interface TopScholarsStripProps {
  students: Student[];
  onOpenHonorBoard: () => void;
  onOpenDetailModal: (student: Student) => void;
}

const PODIUM = [
  { medal: '🥇', ring: 'ring-gold-400 bg-gradient-to-b from-gold-50 to-white border-gold-300' },
  { medal: '🥈', ring: 'ring-slate-300 bg-gradient-to-b from-slate-50 to-white border-slate-200' },
  { medal: '🥉', ring: 'ring-orange-300 bg-gradient-to-b from-orange-50 to-white border-orange-200' },
];

export const TopScholarsStrip: React.FC<TopScholarsStripProps> = ({
  students,
  onOpenHonorBoard,
  onOpenDetailModal
}) => {
  const top3 = [...students].filter(s => s.points > 0).sort((a, b) => b.points - a.points).slice(0, 3);
  if (top3.length === 0) return null;

  return (
    <div
      id="top-scholars-strip"
      className="card p-3 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center gap-3 sm:gap-4 select-none"
    >
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gold-300 to-gold-600 flex items-center justify-center text-xl shadow-sm">
          🏆
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-black font-serif text-primary-900 leading-tight">Bảng Vàng Danh Dự</h3>
          <p className="text-xs text-ink-muted">Top 3 môn sinh dẫn đầu lớp</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-3">
        {top3.map((student, idx) => {
          const rank = getRankByPoints(student.points);
          const p = PODIUM[idx];
          return (
            <button
              key={student.id}
              type="button"
              onClick={() => onOpenDetailModal(student)}
              className={`flex items-center gap-2 sm:gap-2.5 p-2 rounded-2xl border ring-1 ${p.ring} hover:-translate-y-0.5 hover:shadow-card transition cursor-pointer text-left min-w-0`}
              title={`Xem hồ sơ của ${student.name}`}
            >
              <div className="relative shrink-0">
                <ChibiAvatar points={student.points} gender={student.gender} size="sm" customPhotoUrl={student.customPhotoUrl} />
                <span className="absolute -top-1 -left-1 text-base drop-shadow">{p.medal}</span>
              </div>
              <div className="min-w-0">
                <div className="font-bold text-ink text-xs sm:text-sm truncate">{student.name}</div>
                <div className="text-[11px] text-ink-muted truncate">
                  <b className="text-primary-700">{student.points}đ</b> · {rank.tier}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onOpenHonorBoard}
        className="shrink-0 h-10 px-4 rounded-xl bg-primary-800 hover:bg-primary-900 text-gold-100 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition"
      >
        <Crown className="w-4 h-4 text-gold-300" />
        Xem bảng vàng
        <ChevronRight className="w-4 h-4 opacity-70" />
      </button>
    </div>
  );
};
