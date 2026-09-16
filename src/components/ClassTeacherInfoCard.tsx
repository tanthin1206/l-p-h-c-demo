import React from 'react';
import { 
  Users, 
  Sparkles, 
  Trophy, 
  CheckCircle2, 
  School, 
  Calendar, 
  Wrench,
  Camera
} from 'lucide-react';
import { ClassConfig, Student, AttendanceDay } from '../types';

interface ClassTeacherInfoCardProps {
  config: ClassConfig;
  students: Student[];
  attendanceRecords?: AttendanceDay[];
  customTeacherAvatar?: string;
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
  onOpenTeacherAvatarUpload?: () => void;
}

export const ClassTeacherInfoCard: React.FC<ClassTeacherInfoCardProps> = ({
  config,
  students,
  attendanceRecords = [],
  customTeacherAvatar,
  isEditMode = false,
  onToggleEditMode,
  onOpenTeacherAvatarUpload
}) => {
  const totalPoints = students.reduce((acc, s) => acc + s.points, 0);
  const trangNguyenCount = students.filter(s => s.points >= 400).length;
  
  // Calculate attendance
  const totalAttendanceEntries = attendanceRecords.reduce((acc, day) => acc + (day.records?.length || 0), 0);
  const presentCount = attendanceRecords.reduce(
    (acc, day) => acc + (day.records?.filter(r => r.status === 'present')?.length || 0), 
    0
  );
  const attendanceRate = totalAttendanceEntries > 0 
    ? Math.round((presentCount / totalAttendanceEntries) * 100) 
    : 100;

  return (
    <div
      id="section-class-teacher-info"
      className="bg-white/95 backdrop-blur-xs rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 border-amber-300/80 shadow-md space-y-4"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 sm:gap-4">
          {/* Teacher Avatar */}
          <div className="relative shrink-0 group">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-b from-amber-100 to-yellow-50 border-2 sm:border-3 border-amber-400 p-1 shadow-md overflow-hidden flex items-center justify-center">
              {customTeacherAvatar && customTeacherAvatar.trim() ? (
                <img
                  src={customTeacherAvatar}
                  alt="Teacher Avatar"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-b from-amber-200 to-orange-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="text-2xl sm:text-3xl">👩‍🏫</div>
                  <div className="text-[9px] font-extrabold text-amber-900 leading-none mt-0.5">
                    Cô Giáo
                  </div>
                  <div className="absolute -bottom-1 -right-1 text-amber-500 text-xs">🌸</div>
                </div>
              )}
            </div>
            {isEditMode && onOpenTeacherAvatarUpload && (
              <button
                type="button"
                onClick={onOpenTeacherAvatarUpload}
                className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md transition-transform cursor-pointer border-2 border-white ring-2 ring-red-300 scale-105"
                title="Đổi ảnh đại diện Giáo viên"
              >
                <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            )}
          </div>

          {/* Teacher Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-bold text-amber-950 font-serif flex items-center gap-1.5">
                <span>{config.teacherName}</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300 font-sans">
                {config.teacherTitle || "Giáo viên chủ nhiệm"}
              </span>
            </div>

            <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
              <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-lg border border-red-200 flex items-center gap-1">
                🏫 {config.className}
              </span>
              <span className="text-slate-500 flex items-center gap-1">
                <School className="w-3 h-3 text-slate-400" />
                <span>{config.schoolName}</span>
              </span>
              <span className="text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Năm học: {config.academicYear}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Topic, Motto & Edit mode button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <div className="space-y-1 text-xs">
            {config.topic && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 font-medium">
                <span className="font-bold text-amber-800">🌸 Chủ điểm:</span>
                <span className="italic">{config.topic}</span>
              </div>
            )}
            {config.classMotto && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-50 border border-red-200/80 text-red-900 font-medium ml-1">
                <span className="font-bold text-red-800">📜 Khẩu hiệu:</span>
                <span className="font-semibold text-red-950">{config.classMotto}</span>
              </div>
            )}
          </div>

          <button
            id="btn-toggle-edit-mode"
            type="button"
            onClick={onToggleEditMode}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shrink-0 ${
              isEditMode
                ? "bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-400"
                : "bg-slate-50 hover:bg-amber-50 text-slate-700 border-slate-200 shadow-xs"
            }`}
            title="Bật/Tắt chế độ chỉnh sửa giao diện & hình ảnh"
          >
            <Wrench className="w-4 h-4" />
            <span>{isEditMode ? "Tắt Chỉnh Sửa" : "🛠️ Chế Độ Chỉnh Sửa"}</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-amber-100">
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-2.5 text-center transition-all hover:bg-amber-100/60">
          <div className="text-[10px] uppercase font-bold text-amber-800 flex items-center justify-center gap-1">
            <Users className="w-3 h-3 text-amber-600" />
            <span>Sĩ số</span>
          </div>
          <div className="text-base sm:text-lg font-black text-amber-950">
            {students.length} <span className="text-xs font-semibold text-amber-800">em</span>
          </div>
        </div>

        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-2.5 text-center transition-all hover:bg-amber-100/60">
          <div className="text-[10px] uppercase font-bold text-amber-800 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Hoa Điểm</span>
          </div>
          <div className="text-base sm:text-lg font-black text-yellow-600">
            {totalPoints.toLocaleString()} <span className="text-xs">⭐</span>
          </div>
        </div>

        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-2.5 text-center transition-all hover:bg-amber-100/60">
          <div className="text-[10px] uppercase font-bold text-amber-800 flex items-center justify-center gap-1">
            <Trophy className="w-3 h-3 text-amber-600" />
            <span>Trạng Nguyên</span>
          </div>
          <div className="text-base sm:text-lg font-black text-amber-800">
            {trangNguyenCount} <span className="text-xs font-semibold text-amber-700">em 👑</span>
          </div>
        </div>

        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-2.5 text-center transition-all hover:bg-amber-100/60">
          <div className="text-[10px] uppercase font-bold text-amber-800 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-amber-600" />
            <span>Chuyên cần</span>
          </div>
          <div className="text-base sm:text-lg font-black text-emerald-700">
            {attendanceRate}%
          </div>
        </div>
      </div>
    </div>
  );
};
