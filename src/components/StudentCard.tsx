import React from 'react';
import { Plus, Minus, Eye, CheckCircle2, Circle, Star, Pencil } from 'lucide-react';
import { Student, Group } from '../types';
import { getRankByPoints, calcRankProgress } from '../utils/ranks';
import { ChibiAvatar } from './ChibiAvatar';

export type CardDensity = 'comfortable' | 'compact';

interface StudentCardProps {
  student: Student;
  group?: Group;
  density: CardDensity;
  selectable: boolean;
  selected: boolean;
  rankPosition?: number;
  floatDelta?: { value: number; key: number } | null;
  onToggleSelect: () => void;
  onAward: () => void;
  onRemind: () => void;
  onOpenDetail: () => void;
  onEdit: () => void;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  group,
  density,
  selectable,
  selected,
  rankPosition,
  floatDelta,
  onToggleSelect,
  onAward,
  onRemind,
  onOpenDetail,
  onEdit,
}) => {
  const rank = getRankByPoints(student.points);
  const { progressPercent, pointsNeeded, nextRank } = calcRankProgress(student.points);
  const isLeader = student.role !== 'Học sinh';
  const medal = rankPosition !== undefined && rankPosition < 3 ? MEDALS[rankPosition] : null;

  const handleCardClick = () => {
    if (selectable) onToggleSelect();
    else onOpenDetail();
  };

  const floatBadge = floatDelta && (
    <span
      key={floatDelta.key}
      className={`pointer-events-none absolute left-1/2 top-6 z-20 px-2.5 py-1 rounded-full text-sm font-black shadow-lg animate-point-float ${
        floatDelta.value > 0 ? 'bg-emerald-500 text-white' : 'bg-primary-600 text-white'
      }`}
    >
      {floatDelta.value > 0 ? `+${floatDelta.value}` : floatDelta.value} 🌸
    </span>
  );

  const selectMark = selectable && (
    <div className="absolute top-2.5 left-2.5 z-10">
      {selected ? (
        <CheckCircle2 className="w-5 h-5 text-gold-600 fill-gold-100" />
      ) : (
        <Circle className="w-5 h-5 text-ink-muted/40 bg-white rounded-full" />
      )}
    </div>
  );

  const baseCls = `group relative bg-white rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
    selected
      ? 'border-gold-500 ring-2 ring-gold-400/70 shadow-card-hover'
      : 'border-paper-line shadow-card hover:shadow-card-hover hover:-translate-y-0.5 hover:border-gold-300'
  } ${floatDelta ? 'animate-card-bump' : ''}`;

  /* -------------------------- COMPACT -------------------------- */
  if (density === 'compact') {
    return (
      <div className={`${baseCls} p-2.5 flex flex-col items-center text-center`} onClick={handleCardClick}>
        {floatBadge}
        {selectMark}
        {medal && <span className="absolute top-1.5 right-2 text-base">{medal}</span>}
        <ChibiAvatar
          points={student.points}
          gender={student.gender}
          size="sm"
          customPhotoUrl={student.customPhotoUrl}
        />
        <div className="mt-1.5 w-full text-[13px] font-bold text-ink truncate" title={student.name}>
          {student.name.split(' ').slice(-2).join(' ')}
        </div>
        <div className="text-[10px] font-semibold text-ink-muted truncate w-full">
          {rank.badge} {rank.tier}
        </div>
        <div className="mt-1 text-base font-black text-primary-800 leading-none">
          {student.points}
          <span className="text-[10px] font-bold text-ink-muted ml-0.5">đ</span>
        </div>
        <div className="mt-2 w-full grid grid-cols-2 gap-1" onClick={e => e.stopPropagation()}>
          <button
            type="button"
            onClick={onRemind}
            className="h-7 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 flex items-center justify-center cursor-pointer active:scale-95 transition"
            title="Nhắc nhở / trừ điểm"
          >
            <Minus className="w-4 h-4 stroke-[3]" />
          </button>
          <button
            type="button"
            onClick={onAward}
            className="h-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center cursor-pointer active:scale-95 transition"
            title="Khen thưởng / cộng điểm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------ COMFORTABLE ------------------------ */
  return (
    <div className={`${baseCls} p-4 flex flex-col`} onClick={handleCardClick}>
      {floatBadge}
      {selectMark}

      {/* Edit (hover) */}
      {!selectable && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onEdit(); }}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-lg text-ink-muted opacity-0 group-hover:opacity-100 hover:bg-paper-warm hover:text-ink transition cursor-pointer"
          title="Sửa thông tin"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}

      <div className={`flex items-center gap-3 ${selectable ? 'pl-6' : ''}`}>
        <div className="relative shrink-0">
          <ChibiAvatar
            points={student.points}
            gender={student.gender}
            size="md"
            showAura
            animated
            customPhotoUrl={student.customPhotoUrl}
          />
          {medal && <span className="absolute -bottom-1 -right-1 text-lg drop-shadow">{medal}</span>}
        </div>
        <div className="min-w-0 flex-1 pr-5">
          <h3 className="font-black text-ink text-[15px] leading-tight truncate font-serif" title={student.name}>
            {student.name}
          </h3>
          <div className={`text-xs font-bold mt-0.5 truncate ${rank.color}`}>
            {rank.badge} {rank.title}
          </div>
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            <span className="px-1.5 py-0.5 rounded-md bg-paper-warm text-ink-soft text-[10px] font-bold">
              {group?.icon} {group?.name.split(':')[0] || 'Chưa xếp tổ'}
            </span>
            {isLeader && (
              <span className="px-1.5 py-0.5 rounded-md bg-gold-100 text-gold-800 text-[10px] font-bold truncate max-w-[110px]">
                {student.role}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Points */}
      <div className="mt-3 flex items-end justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Hoa điểm</div>
          <div className="text-2xl font-black text-primary-800 leading-none mt-0.5">{student.points}</div>
        </div>
        <div className="flex items-center gap-1 text-sm font-black text-gold-700">
          <Star className="w-4 h-4 fill-gold-400 text-gold-500" />
          {student.stars}
        </div>
      </div>

      {/* Progress */}
      <div className="mt-2">
        <div className="h-1.5 w-full rounded-full bg-paper-warm overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-400 to-primary-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-1 text-[10px] font-semibold text-ink-muted">
          {nextRank ? <>Còn {pointsNeeded}đ lên {nextRank.tier}</> : <span className="text-gold-700 font-black">Trạng Nguyên đỉnh cao!</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto pt-3">
      <div className="pt-3 border-t border-paper-line grid grid-cols-[1fr_auto_1fr] gap-1.5" onClick={e => e.stopPropagation()}>
        <button
          id={`btn-deduct-${student.id}`}
          type="button"
          onClick={onRemind}
          className="h-8 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition"
          title="Nhắc nhở / trừ điểm"
        >
          <Minus className="w-3.5 h-3.5 stroke-[3]" /> Nhắc
        </button>
        <button
          id={`btn-profile-${student.id}`}
          type="button"
          onClick={onOpenDetail}
          className="h-8 w-8 rounded-lg bg-white border border-paper-line hover:border-gold-400 text-ink-soft flex items-center justify-center cursor-pointer active:scale-95 transition"
          title="Xem hồ sơ"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          id={`btn-award-${student.id}`}
          type="button"
          onClick={onAward}
          className="h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition shadow-sm"
          title="Khen thưởng / cộng điểm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" /> Khen
        </button>
      </div>
      </div>
    </div>
  );
};
