import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  Search, 
  Filter, 
  LayoutGrid, 
  Table as TableIcon, 
  Download, 
  UserPlus, 
  Award, 
  Sparkles, 
  Star, 
  Eye, 
  Edit, 
  Trash2, 
  Gift, 
  CheckSquare, 
  Square, 
  Layers, 
  SlidersHorizontal,
  Crown
} from 'lucide-react';
import { Student, Group, Criterion, PointLog, ClassConfig } from '../../types';
import { getRankByPoints, calcRankProgress, RANK_TIERS } from '../../utils/ranks';
import { ChibiAvatar } from '../ChibiAvatar';
import { storage } from '../../utils/storage';
import { HeroMainBanner } from '../HeroMainBanner';
import { TopScholarsStrip } from '../TopScholarsStrip';
import { ClassTeacherInfoCard } from '../ClassTeacherInfoCard';
import { getAssetUrl } from '../../utils/assets';

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

  // Multi-select state
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState<boolean>(config.isEditMode || false);

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

  const handleDeleteStudent = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa học sinh "${name}" khỏi lớp?`)) {
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

      {/* Top Action Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-200/80 flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-700/60" />
          <input
            id="input-search-students"
            type="text"
            placeholder="Tìm kiếm môn sinh theo tên..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-amber-50/50 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-800"
          />
        </div>

        {/* Buttons Action Strip */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Multi-select toggle */}
          <button
            id="btn-select-all-students"
            type="button"
            onClick={() => {
              if (isMultiSelectMode) {
                handleClearSelection();
              } else {
                setIsMultiSelectMode(true);
              }
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              isMultiSelectMode
                ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{isMultiSelectMode ? 'Bỏ chọn' : 'Chọn nhiều'}</span>
            {selectedStudentIds.length > 0 && (
              <span className="bg-amber-950 text-yellow-300 px-1.5 py-0.2 rounded-full text-[10px]">
                {selectedStudentIds.length}
              </span>
            )}
          </button>

          {/* Nhập hàng loạt */}
          <button
            id="btn-bulk-import-students"
            type="button"
            onClick={onOpenBulkImportModal}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white border border-amber-600/50 flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            title="Dán danh sách hoặc tải file Excel để nạp tự động"
          >
            <Layers className="w-3.5 h-3.5 text-amber-300" />
            <span>Nhập hàng loạt</span>
          </button>

          {/* Cài đặt tiêu chí */}
          <button
            id="btn-open-criteria-modal"
            type="button"
            onClick={onOpenCriteriaModal}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" />
            <span>Cài đặt tiêu chí</span>
          </button>

          {/* Bảng Vàng Đua Top */}
          <button
            id="btn-open-honor-board-modal"
            type="button"
            onClick={onOpenHonorBoard}
            className="px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-800 hover:to-amber-800 text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 text-yellow-300" />
            <span>Bảng Vàng Đua Top</span>
          </button>

          {/* Xuất Excel */}
          <button
            onClick={() => storage.exportStudentsToExcel(students, groups)}
            className="p-2 rounded-xl text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 transition-all cursor-pointer"
            title="Xuất Excel"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* View toggle */}
          <div className="flex items-center bg-amber-100/70 p-1 rounded-xl border border-amber-300">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-amber-900 shadow-xs' : 'text-amber-700'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-amber-900 shadow-xs' : 'text-amber-700'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Thêm học sinh */}
          <button
            id="btn-add-new-student"
            type="button"
            onClick={onOpenAddStudentModal}
            className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Thêm học sinh</span>
          </button>
        </div>
      </div>

      {/* Multi-select Floating Bar when items selected */}
      {isMultiSelectMode && (
        <div className="bg-amber-950 text-amber-50 p-3 sm:p-3.5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 animate-fadeIn border border-amber-500/40">
          <div className="flex items-center gap-2 text-xs font-bold flex-wrap">
            <span>Đã chọn: <b className="text-yellow-300 text-sm">{selectedStudentIds.length}</b> / {students.length} học sinh</span>
            <button
              onClick={handleSelectAll}
              className="text-amber-300 hover:underline cursor-pointer ml-1"
            >
              Chọn tất cả
            </button>
            <span className="opacity-40">•</span>
            <button
              onClick={handleClearSelection}
              className="text-amber-300 hover:underline cursor-pointer"
            >
              Bỏ chọn
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Khen thưởng button */}
            <button
              disabled={selectedStudentIds.length === 0}
              onClick={() => {
                const selected = students.filter(s => selectedStudentIds.includes(s.id));
                onOpenScoreModalForSelected(selected, 'positive');
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-xs rounded-xl shadow cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-all"
              title="Khen thưởng / Cộng điểm cho các học sinh đã chọn"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Khen thưởng ({selectedStudentIds.length})</span>
            </button>

            {/* Nhắc nhở button */}
            <button
              disabled={selectedStudentIds.length === 0}
              onClick={() => {
                const selected = students.filter(s => selectedStudentIds.includes(s.id));
                onOpenScoreModalForSelected(selected, 'reminder');
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-black text-xs rounded-xl shadow cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-all"
              title="Nhắc nhở / Trừ điểm các học sinh đã chọn"
            >
              <Minus className="w-3.5 h-3.5 text-white" />
              <span>Nhắc nhở ({selectedStudentIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter by Tổ Tabs & Quick Selection by Tổ */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1 shrink-0 mr-1">
            <span>Tổ:</span>
          </span>
          <button
            onClick={() => setSelectedGroup('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedGroup === 'all' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({students.length})
          </button>
          {groups.map(g => {
            const count = students.filter(s => s.groupId === g.id).length;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGroup(g.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  selectedGroup === g.id ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{g.icon}</span>
                <span>{g.name.split(':')[0]}</span>
                <span className="text-[10px] opacity-75 font-normal">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Nút chọn nhanh cả tổ đang lọc */}
        {selectedGroup !== 'all' && (
          <button
            type="button"
            onClick={() => {
              setIsMultiSelectMode(true);
              const groupStudents = students.filter(s => s.groupId === selectedGroup).map(s => s.id);
              setSelectedStudentIds(prev => Array.from(new Set([...prev, ...groupStudents])));
            }}
            className="text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-100/70 hover:bg-amber-200/80 px-2.5 py-1 rounded-lg border border-amber-300 transition-colors cursor-pointer shrink-0"
          >
            + Chọn cả {groups.find(g => g.id === selectedGroup)?.name.split(':')[0] || 'tổ'}
          </button>
        )}
      </div>

      {/* Filter by Cấp bậc Khoa Bảng Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-2">
        <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1 shrink-0 mr-1">
          <span>Cấp bậc:</span>
        </span>
        <button
          onClick={() => setSelectedRankTier('all')}
          className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedRankTier === 'all' ? 'bg-amber-800 text-white shadow-xs' : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
          }`}
        >
          Tất cả
        </button>
        {RANK_TIERS.map(t => (
          <button
            key={t.tier}
            onClick={() => setSelectedRankTier(t.tier)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition-all cursor-pointer ${
              selectedRankTier === t.tier ? 'bg-amber-800 text-white shadow-xs' : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <span>{t.badge}</span>
            <span>{t.tier}</span>
          </button>
        ))}
      </div>

      {/* Empty State when no students at all */}
      {students.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border-2 border-dashed border-amber-300 text-center max-w-3xl mx-auto my-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
            <div className="relative group">
              <img 
                src={getAssetUrl("/assets/images/empty-classroom.jpg")} 
                alt="Lớp học Trạng Nguyên" 
                className="w-64 h-48 sm:w-80 sm:h-56 object-cover rounded-2xl shadow-md border-4 border-amber-300 transition-transform group-hover:scale-105 duration-300"
              />
              <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg bg-amber-100">
                <img 
                  src={getAssetUrl("/assets/images/trang-ti.jpg")} 
                  alt="Trạng Tí" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="text-left max-w-md space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                <span>🏮</span>
                <span>LỚP HỌC KHOA BẢNG ĐÃ SẴN SÀNG</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-800 font-serif">
                Lớp Học Chưa Có Môn Sinh
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Chào Thầy/Cô! Dữ liệu học sinh chưa được khởi tạo để Thầy/Cô tự do thiết lập danh sách lớp thật của mình. Hãy chọn một cách dưới đây để bắt đầu:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
            <button
              onClick={onOpenAddStudentModal}
              className="px-4 py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm học sinh</span>
            </button>

            <button
              onClick={onOpenBulkImportModal}
              className="px-4 py-3 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5"
            >
              <Layers className="w-4 h-4 text-amber-300" />
              <span>Dán danh sách</span>
            </button>

            <button
              onClick={() => {
                const samples = storage.loadSampleStudents();
                setStudents(samples);
              }}
              className="px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-amber-950 font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 border border-amber-400"
              title="Nạp nhanh 32 học sinh mẫu chia đều 4 tổ để trải nghiệm đầy đủ các tính năng"
            >
              <Sparkles className="w-4 h-4 text-amber-950" />
              <span>Nạp 32 học sinh mẫu</span>
            </button>
          </div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-amber-200 shadow-sm my-6 max-w-md mx-auto">
          <div className="text-4xl mb-2">🔍</div>
          <h4 className="text-base font-bold text-slate-800">Không tìm thấy môn sinh phù hợp</h4>
          <p className="text-xs text-slate-500 mt-1 mb-4">Hãy thử tìm kiếm với từ khóa khác hoặc bỏ chọn bộ lọc Tổ / Cấp bậc.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedGroup('all');
              setSelectedRankTier('all');
            }}
            className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-xl transition-colors"
          >
            Xóa bộ lọc tìm kiếm
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-1">
          {filteredStudents.map(student => {
            const rank = getRankByPoints(student.points);
            const { progressPercent, pointsNeeded, nextRank } = calcRankProgress(student.points);
            const groupInfo = groups.find(g => g.id === student.groupId);
            const isSelected = selectedStudentIds.includes(student.id);

            return (
              <div
                key={student.id}
                onClick={() => {
                  if (isMultiSelectMode) toggleSelectStudent(student.id);
                }}
                className={`bg-white rounded-2xl p-4 transition-all duration-300 relative border-2 ${
                  isSelected ? 'border-amber-500 ring-2 ring-amber-400 bg-amber-50/20' : rank.cardBorderClass
                } shadow-sm hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between cursor-pointer`}
              >
                {/* Multi-select check icon */}
                {isMultiSelectMode && (
                  <div className="absolute top-3 left-3 z-10">
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-amber-600 fill-amber-100" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300 bg-white" />
                    )}
                  </div>
                )}

                {/* Top Badge: Role & Group */}
                <div className={`flex items-center justify-between gap-1 text-[11px] mb-2 ${isMultiSelectMode ? 'pl-6' : ''}`}>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold border border-amber-300/70">
                    {groupInfo?.name.split(':')[0] || 'Tổ'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full font-medium ${
                    student.role === 'Học sinh' 
                      ? 'bg-slate-100 text-slate-600' 
                      : 'bg-yellow-100 text-yellow-900 border border-yellow-300 font-bold'
                  }`}>
                    {student.role}
                  </span>
                </div>

                {/* Chibi Avatar & Name */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="shrink-0">
                    <ChibiAvatar
                      points={student.points}
                      gender={student.gender}
                      size="md"
                      showAura={true}
                      animated={true}
                      customPhotoUrl={student.customPhotoUrl}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-900 text-sm sm:text-base truncate font-serif" title={student.name}>
                      {student.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs mt-0.5 font-bold">
                      <span>{rank.badge}</span>
                      <span className={rank.color}>{rank.title}</span>
                    </div>
                  </div>
                </div>

                {/* Points & Stars summary */}
                <div className="bg-amber-50/70 rounded-xl p-2 mb-2.5 border border-amber-200/60 flex items-center justify-around text-center">
                  <div>
                    <div className="text-[10px] text-amber-800 font-bold uppercase">Hoa Điểm</div>
                    <div className="text-lg font-black text-amber-950 flex items-center justify-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      <span>{student.points}</span>
                    </div>
                  </div>
                  <div className="w-[1px] h-6 bg-amber-200" />
                  <div>
                    <div className="text-[10px] text-amber-800 font-bold uppercase">Số Sao</div>
                    <div className="text-lg font-black text-yellow-600 flex items-center justify-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
                      <span>{student.stars}</span>
                    </div>
                  </div>
                </div>

                {/* Rank progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>{rank.tier}</span>
                    {nextRank ? (
                      <span>+{pointsNeeded}đ lên {nextRank.tier}</span>
                    ) : (
                      <span className="text-amber-800 font-black">Trạng Nguyên Đỉnh Cao!</span>
                    )}
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Quick scoring action buttons: -1, Hồ sơ, +1 */}
                <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 font-sans" onClick={e => e.stopPropagation()}>
                  <button
                    id={`btn-deduct-${student.id}`}
                    type="button"
                    onClick={() => onOpenScoreModalForSingle(student, 'reminder')}
                    className="flex-1 py-1.5 px-2.5 bg-pink-100 hover:bg-pink-200 text-red-600 font-bold text-xs rounded-md flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shadow-2xs"
                    title="Trừ điểm / Nhắc nhở"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>- 1</span>
                  </button>

                  <button
                    id={`btn-profile-${student.id}`}
                    type="button"
                    onClick={() => onOpenDetailModal(student)}
                    className="flex-1 py-1.5 px-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-md border border-slate-200 flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shadow-2xs"
                    title="Xem chi tiết hồ sơ môn sinh"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Hồ sơ</span>
                  </button>

                  <button
                    id={`btn-award-${student.id}`}
                    type="button"
                    onClick={() => onOpenScoreModalForSingle(student, 'positive')}
                    className="flex-1 py-1.5 px-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-md flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shadow-2xs"
                    title="Cộng điểm / Khen thưởng"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>+ 1</span>
                  </button>
                </div>
              </div>
            );
          })}
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
