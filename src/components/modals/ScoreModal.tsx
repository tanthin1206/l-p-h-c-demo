import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, Plus, Minus, Check } from 'lucide-react';
import { Student, Group, Criterion } from '../../types';
import { ChibiAvatar } from '../ChibiAvatar';

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetStudents: Student[];
  allStudents: Student[];
  groups: Group[];
  criteria: Criterion[];
  initialTab?: 'positive' | 'reminder';
  onApplyScore: (students: Student[], criterion: Criterion) => void;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  isOpen,
  onClose,
  targetStudents,
  allStudents,
  groups,
  criteria,
  initialTab = 'positive',
  onApplyScore
}) => {
  const [tab, setTab] = useState<'positive' | 'reminder'>(initialTab);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => targetStudents.map(s => s.id));
  const [customPoint, setCustomPoint] = useState<number>(1);
  const [customName, setCustomName] = useState<string>('');

  if (!isOpen) return null;

  const currentTargets = allStudents.filter(s => selectedIds.includes(s.id));

  const handleApply = (crit: Criterion) => {
    if (currentTargets.length === 0) {
      alert("Vui lòng chọn ít nhất 1 học sinh!");
      return;
    }
    onApplyScore(currentTargets, crit);
    onClose();
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const finalPoints = tab === 'positive' ? Math.abs(customPoint) : -Math.abs(customPoint);
    const customCrit: Criterion = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      points: finalPoints,
      category: tab,
      icon: tab === 'positive' ? '⭐' : '⚠️',
      description: 'Chấm điểm tùy biến nhanh'
    };
    handleApply(customCrit);
  };

  const toggleSelectStudent = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border-4 border-amber-400 relative max-h-[92vh] flex flex-col justify-between overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center pb-3 border-b border-amber-200">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Chấm Điểm & Ghi Nhận Nề Nếp</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 font-serif">
            Khen Thưởng & Nhắc Nhở Học Sinh
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Đang chọn: <b className="text-amber-800">{currentTargets.length} học sinh</b>
          </p>
        </div>

        {/* Selected Students Strip (Chips) */}
        <div className="py-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-slate-100">
          {currentTargets.map(s => (
            <div
              key={s.id}
              className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 shrink-0"
            >
              <ChibiAvatar points={s.points} gender={s.gender} size="xs" />
              <span>{s.name}</span>
              <button
                type="button"
                onClick={() => toggleSelectStudent(s.id)}
                className="text-slate-400 hover:text-red-600 ml-0.5"
              >
                ×
              </button>
            </div>
          ))}
          {currentTargets.length < allStudents.length && (
            <button
              onClick={() => setSelectedIds(allStudents.map(s => s.id))}
              className="text-[11px] font-bold text-amber-800 hover:underline px-2 shrink-0"
            >
              + Chọn cả lớp ({allStudents.length})
            </button>
          )}
        </div>

        {/* Category Tabs: Khen Thưởng vs Nhắc Nhở */}
        <div className="grid grid-cols-2 gap-2 my-3 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setTab('positive')}
            className={`py-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              tab === 'positive'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Khen Thưởng (Cộng Hoa Điểm)</span>
          </button>
          <button
            onClick={() => setTab('reminder')}
            className={`py-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              tab === 'reminder'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>Nhắc Nhở Nề Nếp (Trừ Điểm)</span>
          </button>
        </div>

        {/* Criteria Grid */}
        <div className="flex-1 overflow-y-auto max-h-60 pr-1 space-y-2">
          {criteria
            .filter(c => c.category === tab)
            .map(crit => (
              <button
                key={crit.id}
                onClick={() => handleApply(crit)}
                className={`w-full p-3 rounded-2xl border-2 text-left flex items-center justify-between gap-3 transition-all hover:scale-[1.01] cursor-pointer ${
                  tab === 'positive'
                    ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-100 hover:border-emerald-400'
                    : 'border-rose-200 bg-rose-50/40 hover:bg-rose-100 hover:border-rose-400'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl shrink-0">{crit.icon}</span>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800 text-xs sm:text-sm truncate">{crit.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{crit.description}</div>
                  </div>
                </div>
                <span className={`text-sm font-black px-3 py-1 rounded-xl shrink-0 ${
                  crit.points > 0 ? 'bg-emerald-200 text-emerald-950' : 'bg-rose-200 text-rose-950'
                }`}>
                  {crit.points > 0 ? `+${crit.points}` : crit.points} đ
                </span>
              </button>
            ))}
        </div>

        {/* Quick Custom Entry */}
        <form onSubmit={handleApplyCustom} className="pt-3 border-t border-slate-100 mt-2 flex items-center gap-2 text-xs">
          <input
            type="text"
            placeholder="Lý do khen/nhắc khác..."
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          />
          <input
            type="number"
            min="1"
            max="50"
            value={customPoint}
            onChange={e => setCustomPoint(Number(e.target.value))}
            className="w-16 px-2 py-2 border border-slate-300 rounded-xl text-center font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            className={`px-4 py-2 font-bold text-white rounded-xl shadow cursor-pointer transition-all ${
              tab === 'positive' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            Chấm Nhanh
          </button>
        </form>
      </div>
    </div>
  );
};
