import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertCircle,
  Check,
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Zap
} from 'lucide-react';
import { Student, Group, Criterion } from '../../types';
import { ChibiAvatar } from '../ChibiAvatar';
import { notify } from '../ui/dialog';
import { Modal } from '../ui';

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
      notify("Vui lòng chọn ít nhất 1 học sinh bằng cách bấm vào Cả Lớp, Tổ hoặc chọn học sinh bên dưới!");
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
      notify("Vui lòng chọn ít nhất 1 học sinh trước khi chấm!");
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

  const isPositive = tab === 'positive';

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="lg"
      icon={Sparkles}
      title="Khen Thưởng & Nhắc Nhở Học Sinh"
      subtitle={
        <span>
          Chấm Điểm & Ghi Nhận Nề Nếp • Đang chọn: <b className="text-primary-800 text-sm">{currentTargets.length}</b> / {allStudents.length} học sinh
        </span>
      }
      footer={
        /* Quick Custom Entry */
        <form onSubmit={handleApplyCustom} className="flex-1 flex flex-wrap sm:flex-nowrap items-center gap-2">
          <input
            type="text"
            placeholder="Lý do khen/nhắc khác..."
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            className="input flex-1 min-w-[10rem] font-medium"
          />
          <input
            type="number"
            min="1"
            max="50"
            value={customPoint}
            onChange={e => setCustomPoint(Number(e.target.value))}
            className="input !w-16 text-center font-bold"
            aria-label="Số điểm"
          />
          <button
            type="submit"
            disabled={currentTargets.length === 0}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-sm font-bold text-white rounded-xl shadow-sm cursor-pointer transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed ${
              isPositive ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            <Zap className="w-4 h-4" />
            Chấm Nhanh
          </button>
        </form>
      }
    >
      <div className="font-sans space-y-3">
        {/* Fast Selection by Group & Whole Class */}
        <div className="p-2.5 bg-paper-warm rounded-2xl border border-paper-line">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-ink-soft flex items-center gap-1 shrink-0 mr-1">
              <Users className="w-3.5 h-3.5 text-gold-700" />
              <span>Chọn theo:</span>
            </span>

            {/* Chọn Cả Lớp */}
            <button
              type="button"
              onClick={handleToggleAll}
              className={`chip flex items-center gap-1 ${isAllSelected ? 'chip-active' : ''}`}
            >
              <Check className={`w-3.5 h-3.5 ${isAllSelected ? 'opacity-100' : 'opacity-20'}`} />
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
                  className={`chip flex items-center gap-1 ${
                    isFull ? 'chip-active' : isPartial ? '!bg-gold-100 !border-gold-400 !text-gold-900' : ''
                  }`}
                  title={`Bấm để chọn / bỏ chọn tất cả thành viên ${g.name}`}
                >
                  {isFull ? (
                    <Check className="w-3.5 h-3.5 text-gold-300 stroke-[3]" />
                  ) : isPartial ? (
                    <span className="w-2 h-2 rounded-full bg-gold-600 inline-block" />
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
                className="text-[11px] font-bold text-primary-700 hover:text-primary-900 hover:underline px-2 ml-auto cursor-pointer"
              >
                Bỏ chọn tất cả
              </button>
            )}
          </div>

          {/* Toggle Detail Picker Bar */}
          <div className="mt-2 pt-2 border-t border-paper-line flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsStudentPickerOpen(prev => !prev)}
              className="text-xs font-bold text-primary-800 hover:text-primary-600 flex items-center gap-1 cursor-pointer shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5 text-gold-600" />
              <span>{isStudentPickerOpen ? 'Thu gọn danh sách học sinh' : 'Tùy chọn từng học sinh cụ thể'}</span>
              {isStudentPickerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <span className="text-[11px] text-ink-muted font-medium truncate">
              {currentTargets.length === 0 ? (
                <span className="text-primary-700 font-bold">Chưa chọn em nào</span>
              ) : currentTargets.length === allStudents.length ? (
                <span className="text-emerald-700 font-bold">Đã chọn cả lớp</span>
              ) : (
                <span>Đã chọn: {currentTargets.slice(0, 3).map(s => s.name).join(', ')}{currentTargets.length > 3 ? ` và ${currentTargets.length - 3} em khác` : ''}</span>
              )}
            </span>
          </div>

          {/* Expandable Individual Student Selection Grid */}
          {isStudentPickerOpen && (
            <div className="mt-2 bg-white p-2.5 rounded-xl border border-paper-line animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <input
                    type="text"
                    placeholder="Tìm tên học sinh..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="input !py-1.5 !pl-8 text-xs"
                  />
                </div>

                <div className="flex items-center gap-1 shrink-0 overflow-x-auto scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setPickerGroupFilter('all')}
                    className={`chip !px-2.5 !py-1 !text-[11px] ${pickerGroupFilter === 'all' ? 'chip-active' : ''}`}
                  >
                    Tất cả
                  </button>
                  {groups.map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setPickerGroupFilter(g.id)}
                      className={`chip !px-2.5 !py-1 !text-[11px] ${pickerGroupFilter === g.id ? 'chip-active' : ''}`}
                    >
                      {g.name.split(':')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Chips Grid */}
              <div className="max-h-44 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-1.5 pr-1">
                {filteredPickerStudents.map(student => {
                  const isSelected = selectedIds.includes(student.id);
                  return (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => toggleSelectStudent(student.id)}
                      className={`p-1.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-gold-50 border-gold-400 text-ink font-bold shadow-inner-gold'
                          : 'bg-paper border-paper-line text-ink-soft hover:border-gold-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-primary-800 border-primary-800 text-gold-100' : 'border-paper-line bg-white'
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
          <div className="p-2.5 rounded-xl bg-primary-50 border border-primary-200 text-primary-800 text-xs flex items-center gap-2 font-medium animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-primary-600" />
            <span>Chưa chọn học sinh nào! Hãy bấm <b>Cả lớp</b> hoặc chọn <b>Tổ</b> ở trên để thực hiện chấm điểm.</span>
          </div>
        )}

        {/* Category Tabs: Khen Thưởng vs Nhắc Nhở */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-paper-warm border border-paper-line rounded-2xl">
          <button
            type="button"
            onClick={() => setTab('positive')}
            className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isPositive
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-ink-soft hover:text-ink hover:bg-white'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Khen Thưởng <span className="hidden sm:inline">(Cộng Hoa Điểm)</span></span>
          </button>
          <button
            type="button"
            onClick={() => setTab('reminder')}
            className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              !isPositive
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-ink-soft hover:text-ink hover:bg-white'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Nhắc Nhở <span className="hidden sm:inline">Nề Nếp (Trừ Điểm)</span></span>
          </button>
        </div>

        {/* Criteria Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {criteria
            .filter(c => c.category === tab)
            .map(crit => (
              <button
                key={crit.id}
                type="button"
                onClick={() => handleApply(crit)}
                disabled={currentTargets.length === 0}
                className={`w-full p-2.5 sm:p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                  currentTargets.length === 0
                    ? 'opacity-60 cursor-not-allowed bg-paper border-paper-line'
                    : isPositive
                    ? 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-card active:scale-[0.99]'
                    : 'border-primary-200 bg-primary-50/60 hover:bg-primary-50 hover:border-primary-400 hover:shadow-card active:scale-[0.99]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl shrink-0">{crit.icon}</span>
                  <div className="min-w-0">
                    <div className="font-bold text-ink text-xs sm:text-sm truncate">{crit.name}</div>
                    <div className="text-[11px] text-ink-muted truncate">{crit.description}</div>
                  </div>
                </div>
                <span className={`text-sm font-black px-2.5 py-1 rounded-xl shrink-0 ${
                  crit.points > 0 ? 'bg-emerald-600 text-white' : 'bg-primary-600 text-white'
                }`}>
                  {crit.points > 0 ? `+${crit.points}` : crit.points} đ
                </span>
              </button>
            ))}
        </div>
      </div>
    </Modal>
  );
};
