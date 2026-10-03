import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, 
  Minus, 
  Search, 
  LayoutGrid, 
  Grid3x3,
  Table as TableIcon, 
  Download, 
  UserPlus, 
  Sparkles, 
  Eye, 
  Edit, 
  Trash2, 
  CheckSquare, 
  Layers, 
  SlidersHorizontal,
  Crown,
  MoreHorizontal
} from 'lucide-react';
import { Student, Group, Criterion, PointLog, ClassConfig } from '../../types';
import { getRankByPoints, RANK_TIERS } from '../../utils/ranks';
import { ChibiAvatar } from '../ChibiAvatar';
import { StudentCard, CardDensity } from '../StudentCard';
import { storage } from '../../utils/storage';
import { HeroMainBanner } from '../HeroMainBanner';
import { TopScholarsStrip } from '../TopScholarsStrip';
import { ClassTeacherInfoCard } from '../ClassTeacherInfoCard';
import { getAssetUrl } from '../../utils/assets';
import { confirmDialog } from '../ui/dialog';

interface StudentsViewProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  groups: Group[];
  criteria: Criterion[];
  pointLogs: PointLog[];
  config: ClassConfig;
  onOpenScoreModalForSingle: (student: Student, category: 'positive' | 'reminder') => void;
  onOpenScoreModalForSelected: (students: Student[], category?: 'positive' | 'reminder') => void;
  onOpenDetailModal: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onOpenAddStudentModal: () => void;
  onOpenBulkImportModal: () => void;
  onOpenCriteriaModal: () => void;
  onOpenHonorBoard: () => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  setStudents,
  groups,
  criteria,
  pointLogs,
  config,
  onOpenScoreModalForSingle,
  onOpenScoreModalForSelected,
  onOpenDetailModal,
  onEditStudent,
  onOpenAddStudentModal,
  onOpenBulkImportModal,
  onOpenCriteriaModal,
  onOpenHonorBoard
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedRankTier, setSelectedRankTier] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'points-desc' | 'points-asc' | 'name'>('points-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [density, setDensity] = useState<CardDensity>(
    () => (localStorage.getItem('tndv_card_density') as CardDensity) || 'comfortable'
  );
  const changeDensity = (d: CardDensity) => {
    setDensity(d);
    localStorage.setItem('tndv_card_density', d);
  };
  const [moreOpen, setMoreOpen] = useState(false);

  // Multi-select state
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState<boolean>(config.isEditMode || false);

  // Thứ hạng toàn lớp (để gắn huy chương top 3)
  const classRankIndex = useMemo(() => {
    const m = new Map<string, number>();
    [...students]
      .filter(s => s.points > 0)
      .sort((a, b) => b.points - a.points)
      .forEach((s, i) => m.set(s.id, i));
    return m;
  }, [students]);

  // Hiệu ứng "+N" bay lên trên thẻ khi điểm thay đổi
  const prevPointsRef = useRef<Map<string, number> | null>(null);
  const [floats, setFloats] = useState<Record<string, { value: number; key: number }>>({});
  useEffect(() => {
    const prev = prevPointsRef.current;
    const next = new Map(students.map(s => [s.id, s.points]));
    prevPointsRef.current = next;
    if (!prev) return;
    const changed: Record<string, { value: number; key: number }> = {};
    students.forEach(s => {
      const before = prev.get(s.id);
      if (before !== undefined && before !== s.points) {
        changed[s.id] = { value: s.points - before, key: Date.now() + Math.random() };
      }
    });
    if (Object.keys(changed).length === 0) return;
    setFloats(f => ({ ...f, ...changed }));
    const t = setTimeout(() => {
      setFloats(f => {
        const copy = { ...f };
        Object.keys(changed).forEach(id => {
          if (copy[id]?.key === changed[id].key) delete copy[id];
        });
        return copy;
      });
    }, 1200);
    return () => clearTimeout(t);
  }, [students]);

  // Filter & sort
  const filteredStudents = students
    .filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGroup = selectedGroup === 'all' || s.groupId === selectedGroup;
      const rank = getRankByPoints(s.points);
      const matchesRank = selectedRankTier === 'all' || rank.tier === selectedRankTier;
      return matchesSearch && matchesGroup && matchesRank;
    })
    .sort((a, b) => {
      if (sortBy === 'points-desc') return b.points - a.points;
      if (sortBy === 'points-asc') return a.points - b.points;
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'vi');
      return 0;
    });

  const toggleSelectStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(i => i !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleSelectAll = () => {
    setSelectedStudentIds(filteredStudents.map(s => s.id));
  };

  const handleClearSelection = () => {
    setSelectedStudentIds([]);
    setIsMultiSelectMode(false);
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (await confirmDialog(`Bạn có chắc muốn xóa học sinh "${name}" khỏi lớp?`)) {
      const updated = students.filter(s => s.id !== id);
      setStudents(updated);
      storage.saveStudents(updated);

      // Cascade: Dọn dẹp nhật ký điểm
      try {
        const updatedLogs = pointLogs.filter(l => l.studentId !== id);
        storage.savePointLogs(updatedLogs);
      } catch (e) {
        console.error("Cascade point logs error:", e);
      }

      // Cascade: Dọn dẹp nộp bài tập
      try {
        const assignments = storage.getAssignments();
        const updatedAssignments = assignments.map(a => ({
          ...a,
          completedStudentIds: a.completedStudentIds.filter(stId => stId !== id)
        }));
        storage.saveAssignments(updatedAssignments);
      } catch (e) {
        console.error("Cascade assignment error:", e);
      }

      // Cascade: Dọn dẹp điểm danh
      try {
        const att = storage.getAttendance();
        const updatedAtt = att.map(day => ({
          ...day,
          records: day.records.filter(r => r.studentId !== id)
        }));
        storage.saveAttendance(updatedAtt);
      } catch (e) {
        console.error("Cascade attendance error:", e);
      }
    }
  };

  return (
    <div className="space-y-3 font-sans">
      {/* 1. CLASS & TEACHER INFO CARD (with 4 stat pills & edit mode toggle) */}
      <ClassTeacherInfoCard
        config={config}
        students={students}
        attendanceRecords={[]}
        customTeacherAvatar={config.teacherAvatar}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
      />

      {/* 2. HERO MAIN BANNER (2K Original Style with Lightbox) */}
      <HeroMainBanner
        customBannerUrl={config.homeBanner}
        onBannerChange={(newUrl) => {
          const updated = { ...config, homeBanner: newUrl };
          storage.saveConfig(updated);
        }}
      />

      {/* 3. TOP SCHOLARS STRIP (Top 3 Bảng Vàng Danh Dự) */}
      <TopScholarsStrip
        students={students}
        onOpenHonorBoard={onOpenHonorBoard}
        onOpenDetailModal={onOpenDetailModal}
      />

      {/* ===== TOOLBAR (dính khi cuộn) ===== */}
      <div className="sticky top-14 z-20 -mx-3 sm:-mx-6 px-3 sm:px-6 py-2.5 bg-paper/90 backdrop-blur-md border-y border-paper-line/80">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              id="input-search-students"
              type="text"
              placeholder="Tìm học sinh theo tên..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input pl-9 h-9 py-0"
            />
          </div>

          {/* Rank filter */}
          <select
            value={selectedRankTier}
            onChange={e => setSelectedRankTier(e.target.value)}
            className="input h-9 py-0 w-auto pr-8 font-semibold cursor-pointer"
            title="Lọc theo cấp bậc"
          >
            <option value="all">Mọi cấp bậc</option>
            {RANK_TIERS.map(t => (
              <option key={t.tier} value={t.tier}>{t.badge} {t.tier}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="input h-9 py-0 w-auto pr-8 font-semibold cursor-pointer"
            title="Sắp xếp"
          >
            <option value="points-desc">Điểm cao → thấp</option>
            <option value="points-asc">Điểm thấp → cao</option>
            <option value="name">Theo tên A → Z</option>
          </select>

          {/* View / density */}
          <div className="flex items-center h-9 p-0.5 rounded-xl bg-white border border-paper-line">
            {([
              { key: 'comfortable', icon: LayoutGrid, title: 'Thẻ lớn' },
              { key: 'compact', icon: Grid3x3, title: 'Thẻ gọn (xem cả lớp)' },
              { key: 'table', icon: TableIcon, title: 'Bảng' },
            ] as const).map(opt => {
              const active = opt.key === 'table' ? viewMode === 'table' : viewMode === 'grid' && density === opt.key;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.key}
                  type="button"
                  title={opt.title}
                  onClick={() => {
                    if (opt.key === 'table') setViewMode('table');
                    else { setViewMode('grid'); changeDensity(opt.key); }
                  }}
                  className={`h-full px-2 rounded-lg flex items-center cursor-pointer transition ${
                    active ? 'bg-primary-800 text-gold-100 shadow-sm' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>

          {/* Multi-select */}
          <button
            id="btn-select-all-students"
            type="button"
            onClick={() => (isMultiSelectMode ? handleClearSelection() : setIsMultiSelectMode(true))}
            className={`h-9 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
              isMultiSelectMode
                ? 'bg-gold-500 border-gold-500 text-primary-950'
                : 'bg-white border-paper-line text-ink-soft hover:border-gold-400 hover:text-ink'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span className="hidden sm:inline">{isMultiSelectMode ? 'Đang chọn' : 'Chọn nhiều'}</span>
          </button>

          {/* More menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen(o => !o)}
              className="h-9 w-9 rounded-xl bg-white border border-paper-line text-ink-soft hover:border-gold-400 hover:text-ink flex items-center justify-center cursor-pointer"
              title="Thêm thao tác"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {moreOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMoreOpen(false)} />
                <div className="absolute right-0 mt-1.5 z-40 w-56 p-1.5 bg-white rounded-2xl border border-paper-line shadow-pop animate-pop-in">
                  {[
                    { id: 'btn-bulk-import-students', icon: Layers, label: 'Nhập danh sách / Excel', onClick: onOpenBulkImportModal },
                    { id: 'btn-open-criteria-modal', icon: SlidersHorizontal, label: 'Cài đặt tiêu chí chấm', onClick: onOpenCriteriaModal },
                    { id: 'btn-open-honor-board-modal', icon: Crown, label: 'Bảng vàng đua top', onClick: onOpenHonorBoard },
                    { id: 'btn-export-excel', icon: Download, label: 'Xuất file Excel', onClick: () => storage.exportStudentsToExcel(students, groups) },
                  ].map(item => (
                    <button
                      key={item.id}
                      id={item.id}
                      type="button"
                      onClick={() => { setMoreOpen(false); item.onClick(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-ink-soft hover:bg-paper-warm hover:text-ink cursor-pointer text-left"
                    >
                      <item.icon className="w-4 h-4 text-gold-700" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Add student */}
          <button
            id="btn-add-new-student"
            type="button"
            onClick={onOpenAddStudentModal}
            className="h-9 px-3.5 rounded-xl bg-primary-700 hover:bg-primary-800 text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Thêm học sinh</span>
          </button>
        </div>

        {/* Group chips */}
        <div className="mt-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedGroup('all')}
            className={`chip ${selectedGroup === 'all' ? 'chip-active' : ''}`}
          >
            Cả lớp <span className="opacity-70 font-semibold">{students.length}</span>
          </button>
          {groups.map(g => {
            const count = students.filter(s => s.groupId === g.id).length;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGroup(g.id)}
                className={`chip flex items-center gap-1 ${selectedGroup === g.id ? 'chip-active' : ''}`}
              >
                <span>{g.icon}</span>
                <span>{g.name.split(':')[0]}</span>
                <span className="opacity-70 font-semibold">{count}</span>
              </button>
            );
          })}
          {selectedGroup !== 'all' && (
            <button
              type="button"
              onClick={() => {
                setIsMultiSelectMode(true);
                const ids = students.filter(s => s.groupId === selectedGroup).map(s => s.id);
                setSelectedStudentIds(prev => Array.from(new Set([...prev, ...ids])));
              }}
              className="ml-auto shrink-0 text-xs font-bold text-gold-800 hover:text-primary-800 px-2 cursor-pointer"
            >
              + Chọn cả {groups.find(g => g.id === selectedGroup)?.name.split(':')[0] || 'tổ'}
            </button>
          )}
          {(searchTerm || selectedRankTier !== 'all') && (
            <span className="ml-auto shrink-0 text-xs text-ink-muted">
              {filteredStudents.length} kết quả
            </span>
          )}
        </div>
      </div>

      {/* ===== THANH CHỌN NHIỀU (nổi dưới màn hình) ===== */}
      {isMultiSelectMode && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(94vw,640px)] bg-primary-900 text-gold-50 px-4 py-3 rounded-2xl shadow-pop border border-gold-500/30 flex flex-wrap items-center gap-3 animate-pop-in">
          <div className="text-sm font-bold">
            Đã chọn <b className="text-gold-300 text-base">{selectedStudentIds.length}</b>
            <span className="opacity-60"> / {students.length}</span>
          </div>
          <button onClick={handleSelectAll} className="text-xs font-bold text-gold-300 hover:underline cursor-pointer">
            Chọn tất cả
          </button>
          <button onClick={handleClearSelection} className="text-xs font-bold text-gold-300/80 hover:underline cursor-pointer">
            Hủy
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button
              disabled={selectedStudentIds.length === 0}
              onClick={() => onOpenScoreModalForSelected(students.filter(s => selectedStudentIds.includes(s.id)), 'reminder')}
              className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Minus className="w-4 h-4" /> Nhắc nhở
            </button>
            <button
              disabled={selectedStudentIds.length === 0}
              onClick={() => onOpenScoreModalForSelected(students.filter(s => selectedStudentIds.includes(s.id)), 'positive')}
              className="h-9 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-40"
            >
              <Sparkles className="w-4 h-4" /> Khen thưởng
            </button>
          </div>
        </div>
      )}

      {/* ===== DANH SÁCH ===== */}
      {students.length === 0 ? (
        <div className="card p-8 sm:p-10 max-w-3xl mx-auto my-6 text-center">
          <div className="relative inline-block mb-5">
            <img
              src={getAssetUrl('/assets/images/empty-classroom.jpg')}
              alt="Lớp học Trạng Nguyên"
              className="w-72 h-48 object-cover rounded-3xl shadow-card"
            />
            <img
              src={getAssetUrl('/assets/images/trang-ti.jpg')}
              alt="Trạng Tí"
              className="absolute -bottom-4 -right-4 w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-card"
            />
          </div>
          <h3 className="text-2xl font-black font-serif text-ink">Lớp học chưa có môn sinh</h3>
          <p className="mt-1 text-sm text-ink-muted max-w-md mx-auto">
            Chào Thầy/Cô! Hãy chọn một cách dưới đây để bắt đầu thiết lập danh sách lớp.
          </p>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-xl mx-auto">
            <button onClick={onOpenAddStudentModal} className="h-11 rounded-xl bg-primary-700 hover:bg-primary-800 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer">
              <UserPlus className="w-4 h-4" /> Thêm học sinh
            </button>
            <button onClick={onOpenBulkImportModal} className="h-11 rounded-xl bg-white border border-paper-line hover:border-gold-400 text-ink text-sm font-bold flex items-center justify-center gap-2 cursor-pointer">
              <Layers className="w-4 h-4 text-gold-700" /> Dán danh sách
            </button>
            <button
              onClick={() => setStudents(storage.loadSampleStudents())}
              className="h-11 rounded-xl bg-gradient-to-b from-gold-300 to-gold-500 text-primary-950 text-sm font-black flex items-center justify-center gap-2 cursor-pointer"
              title="Nạp nhanh 32 học sinh mẫu chia đều 4 tổ"
            >
              <Sparkles className="w-4 h-4" /> 32 học sinh mẫu
            </button>
          </div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="card p-8 text-center my-6 max-w-md mx-auto">
          <div className="text-4xl mb-2">🔍</div>
          <h4 className="text-base font-black text-ink">Không tìm thấy học sinh phù hợp</h4>
          <p className="text-sm text-ink-muted mt-1 mb-4">Thử từ khóa khác hoặc bỏ bộ lọc Tổ / Cấp bậc.</p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedGroup('all'); setSelectedRankTier('all'); }}
            className="px-4 py-2 rounded-xl bg-gold-100 hover:bg-gold-200 text-gold-900 text-sm font-bold cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div
          className={`grid gap-3 sm:gap-4 ${isMultiSelectMode ? 'pb-24' : ''} ${
            density === 'compact'
              ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}
        >
          {filteredStudents.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              group={groups.find(g => g.id === student.groupId)}
              density={density}
              selectable={isMultiSelectMode}
              selected={selectedStudentIds.includes(student.id)}
              rankPosition={classRankIndex.get(student.id)}
              floatDelta={floats[student.id] || null}
              onToggleSelect={() => toggleSelectStudent(student.id)}
              onAward={() => onOpenScoreModalForSingle(student, 'positive')}
              onRemind={() => onOpenScoreModalForSingle(student, 'reminder')}
              onOpenDetail={() => onOpenDetailModal(student)}
              onEdit={() => onEditStudent(student)}
            />
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-amber-100/80 text-amber-950 font-bold border-b border-amber-300">
              <tr>
                <th className="px-4 py-3">STT</th>
                <th className="px-4 py-3">Môn Sinh</th>
                <th className="px-4 py-3">Tổ</th>
                <th className="px-4 py-3">Chức Vụ</th>
                <th className="px-4 py-3">Cấp Bậc Khoa Bảng</th>
                <th className="px-4 py-3 text-center">Hoa Điểm</th>
                <th className="px-4 py-3 text-center">Sao</th>
                <th className="px-4 py-3 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {filteredStudents.map((student, idx) => {
                const rank = getRankByPoints(student.points);
                const groupInfo = groups.find(g => g.id === student.groupId);

                return (
                  <tr key={student.id} className="hover:bg-amber-50/60 transition-colors">
                    <td className="px-4 py-3 text-slate-500 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <ChibiAvatar points={student.points} gender={student.gender} size="sm" />
                        <div>
                          <div className="font-bold text-slate-800 font-serif">{student.name}</div>
                          <div className="text-[11px] text-slate-400">Sinh: {student.birthDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-600">{groupInfo?.name.split(':')[0]}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {student.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold">{rank.badge} {rank.tier}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 font-black text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                        🌸 {student.points}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-yellow-600">
                      ⭐ {student.stars}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenScoreModalForSingle(student, 'positive')}
                          className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg cursor-pointer"
                          title="Thưởng điểm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenScoreModalForSingle(student, 'reminder')}
                          className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg cursor-pointer"
                          title="Nhắc nhở"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenDetailModal(student)}
                          className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg cursor-pointer"
                          title="Xem hồ sơ"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditStudent(student)}
                          className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg cursor-pointer"
                          title="Sửa hồ sơ"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id, student.name)}
                          className="p-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
