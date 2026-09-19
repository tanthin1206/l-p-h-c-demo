import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  AlertCircle, 
  Plus, 
  Minus, 
  Check, 
  Users, 
  Search, 
  ChevronDown, 
  ChevronUp,
  UserCheck
} from 'lucide-react';
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [customPoint, setCustomPoint] = useState<number>(1);
  const [customName, setCustomName] = useState<string>('');
  const [isStudentPickerOpen, setIsStudentPickerOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pickerGroupFilter, setPickerGroupFilter] = useState<string>('all');

  // Synchronize state when modal opens or targetStudents changes
  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      if (targetStudents && targetStudents.length > 0) {
        setSelectedIds(targetStudents.map(s => s.id));
        // If single student, keep picker collapsed; if 0 or all, keep accessible
        setIsStudentPickerOpen(false);
      } else {
        // Default to all students if opened from header with no preselection
        setSelectedIds(allStudents.map(s => s.id));
        setIsStudentPickerOpen(false);
      }
      setSearchTerm('');
      setPickerGroupFilter('all');
    }
  }, [isOpen, targetStudents, initialTab, allStudents]);

  if (!isOpen) return null;

  const currentTargets = allStudents.filter(s => selectedIds.includes(s.id));
  const isAllSelected = allStudents.length > 0 && selectedIds.length === allStudents.length;

  // Toggle selection of all students
  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allStudents.map(s => s.id));
    }
  };

  // Toggle selection of all students in a specific group
  const handleToggleGroup = (groupId: string) => {
    const groupStudentIds = allStudents.filter(s => s.groupId === groupId).map(s => s.id);
    if (groupStudentIds.length === 0) return;

    const allInGroupSelected = groupStudentIds.every(id => selectedIds.includes(id));
    if (allInGroupSelected) {
      // Remove all members of this group
      setSelectedIds(prev => prev.filter(id => !groupStudentIds.includes(id)));
    } else {
      // Add all members of this group
      setSelectedIds(prev => Array.from(new Set([...prev, ...groupStudentIds])));
    }
  };

  // Toggle individual student
  const toggleSelectStudent = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Apply chosen criterion
  const handleApply = (crit: Criterion) => {
    if (currentTargets.length === 0) {
      alert("Vui lòng chọn ít nhất 1 học sinh bằng cách bấm vào Cả Lớp, Tổ hoặc chọn học sinh bên dưới!");
      return;
    }
    onApplyScore(currentTargets, crit);
    onClose();
  };

  // Apply custom quick score
  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    if (currentTargets.length === 0) {
      alert("Vui lòng chọn ít nhất 1 học sinh trước khi chấm!");
      return;
    }
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

  // Filtered students for detailed picker
  const filteredPickerStudents = allStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = pickerGroupFilter === 'all' || s.groupId === pickerGroupFilter;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border-4 border-amber-400 relative max-h-[94vh] flex flex-col justify-between overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer z-10"
          title="Đóng cửa sổ"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center pb-2 border-b border-amber-200">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Chấm Điểm & Ghi Nhận Nề Nếp</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-800 font-serif">
            Khen Thưởng & Nhắc Nhở Học Sinh
          </h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-xs text-slate-600 font-medium">
              Đang chọn: <b className="text-amber-800 font-bold text-sm">{currentTargets.length}</b> / {allStudents.length} học sinh
            </span>
          </div>
        </div>

        {/* Fast Selection by Group & Whole Class */}
        <div className="mt-2.5 p-2 bg-amber-50/80 rounded-2xl border border-amber-200/80">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1 shrink-0 mr-1">
              <Users className="w-3.5 h-3.5 text-amber-700" />
              <span>Chọn theo:</span>
            </span>

            {/* Chọn Cả Lớp */}
            <button
              type="button"
              onClick={handleToggleAll}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs ${
                isAllSelected
                  ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-400'
                  : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Check className={`w-3.5 h-3.5 ${isAllSelected ? 'opacity-100 text-white' : 'opacity-20'}`} />
              <span>Cả lớp ({allStudents.length})</span>
            </button>

            {/* Các Tổ Thi Đua */}
            {groups.map(g => {
              const gStudents = allStudents.filter(s => s.groupId === g.id);
              const selCount = gStudents.filter(s => selectedIds.includes(s.id)).length;
              const isFull = gStudents.length > 0 && selCount === gStudents.length;
              const isPartial = selCount > 0 && !isFull;

              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleToggleGroup(g.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs ${
                    isFull
                      ? 'bg-amber-700 text-yellow-200 shadow-xs border border-amber-800 ring-2 ring-amber-400'
                      : isPartial
                      ? 'bg-amber-200 text-amber-950 border border-amber-400 font-extrabold'
                      : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
                  }`}
                  title={`Bấm để chọn / bỏ chọn tất cả thành viên ${g.name}`}
                >
                  {isFull ? (
                    <Check className="w-3.5 h-3.5 text-yellow-300 stroke-[3]" />
                  ) : isPartial ? (
                    <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />
                  ) : null}
                  <span>{g.name.split(':')[0]}</span>
                  <span className="text-[10px] opacity-80 font-normal">({selCount}/{gStudents.length})</span>
                </button>
              );
            })}

            {/* Nút Bỏ chọn nhanh */}
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-[11px] font-bold text-red-600 hover:text-red-800 hover:underline px-2 ml-auto cursor-pointer"
              >
                Bỏ chọn tất cả
              </button>
            )}
          </div>

          {/* Toggle Detail Picker Bar */}
          <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsStudentPickerOpen(prev => !prev)}
              className="text-xs font-bold text-amber-900 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>{isStudentPickerOpen ? 'Thu gọn danh sách học sinh' : 'Tùy chọn từng học sinh cụ thể'}</span>
              {isStudentPickerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <span className="text-[11px] text-slate-500 font-medium truncate">
              {currentTargets.length === 0 ? (
                <span className="text-red-600 font-bold">Chưa chọn em nào</span>
              ) : currentTargets.length === allStudents.length ? (
                <span className="text-emerald-700 font-bold">Đã chọn cả lớp</span>
              ) : (
                <span>Đã chọn: {currentTargets.slice(0, 3).map(s => s.name).join(', ')}{currentTargets.length > 3 ? ` và ${currentTargets.length - 3} em khác` : ''}</span>
              )}
            </span>
          </div>

          {/* Expandable Individual Student Selection Grid */}
          {isStudentPickerOpen && (
            <div className="mt-2 pt-2 border-t border-amber-200 bg-white p-2.5 rounded-xl animate-fadeIn">
              <div className="flex items-center gap-2 mb-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm tên học sinh..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center gap-1 shrink-0 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setPickerGroupFilter('all')}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold ${
                      pickerGroupFilter === 'all' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Tất cả
                  </button>
                  {groups.map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setPickerGroupFilter(g.id)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${
                        pickerGroupFilter === g.id ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {g.name.split(':')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Chips Grid */}
              <div className="max-h-36 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-1.5 pr-1 scrollbar-thin">
                {filteredPickerStudents.map(student => {
                  const isSelected = selectedIds.includes(student.id);
                  return (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => toggleSelectStudent(student.id)}
                      className={`p-1.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-amber-600 border-amber-700 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <ChibiAvatar points={student.points} gender={student.gender} size="xs" />
                      <span className="text-xs truncate flex-1">{student.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Warning if 0 students selected */}
        {currentTargets.length === 0 && (
          <div className="my-2 p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>Chưa chọn học sinh nào! Hãy bấm <b>Cả lớp</b> hoặc chọn <b>Tổ</b> ở trên để thực hiện chấm điểm.</span>
          </div>
        )}

        {/* Category Tabs: Khen Thưởng vs Nhắc Nhở */}
        <div className="grid grid-cols-2 gap-2 my-2.5 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
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
            type="button"
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
        <div className="flex-1 overflow-y-auto max-h-56 pr-1 space-y-2 scrollbar-thin">
          {criteria
            .filter(c => c.category === tab)
            .map(crit => (
              <button
                key={crit.id}
                type="button"
                onClick={() => handleApply(crit)}
                disabled={currentTargets.length === 0}
                className={`w-full p-2.5 sm:p-3 rounded-2xl border-2 text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                  currentTargets.length === 0
                    ? 'opacity-60 cursor-not-allowed bg-slate-50 border-slate-200'
                    : tab === 'positive'
                    ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 hover:border-emerald-400 active:scale-[0.99]'
                    : 'border-rose-200 bg-rose-50/50 hover:bg-rose-100 hover:border-rose-400 active:scale-[0.99]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl shrink-0">{crit.icon}</span>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800 text-xs sm:text-sm truncate">{crit.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{crit.description}</div>
                  </div>
                </div>
                <span className={`text-sm font-black px-3 py-1 rounded-xl shrink-0 shadow-2xs ${
                  crit.points > 0 ? 'bg-emerald-200 text-emerald-950' : 'bg-rose-200 text-rose-950'
                }`}>
                  {crit.points > 0 ? `+${crit.points}` : crit.points} đ
                </span>
              </button>
            ))}
        </div>

        {/* Quick Custom Entry */}
        <form onSubmit={handleApplyCustom} className="pt-2.5 border-t border-slate-100 mt-2 flex items-center gap-2 text-xs">
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
            disabled={currentTargets.length === 0}
            className={`px-4 py-2 font-bold text-white rounded-xl shadow cursor-pointer transition-all disabled:opacity-50 ${
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
