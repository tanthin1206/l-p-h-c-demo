import React from 'react';
import { 
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
      className="bg-white/95 backdrop-blur-xs rounded-2xl p-2.5 sm:py-2.5 sm:px-4 border-2 border-amber-300/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3"
    >
      {/* Left: Avatar + Info */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 w-full md:w-auto">
        {/* Avatar */}
        <div className="relative shrink-0 group">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-b from-amber-100 to-yellow-50 border-2 border-amber-400 p-0.5 shadow-xs overflow-hidden flex items-center justify-center">
            {customTeacherAvatar && customTeacherAvatar.trim() ? (
              <img
                src={customTeacherAvatar}
                alt="Teacher Avatar"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full rounded-lg bg-gradient-to-b from-amber-200 to-orange-100 flex items-center justify-center text-xl">
                👩‍🏫
              </div>
            )}
          </div>
          {isEditMode && onOpenTeacherAvatarUpload && (
            <button
              type="button"
              onClick={onOpenTeacherAvatarUpload}
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xs transition-transform cursor-pointer border border-white"
              title="Đổi ảnh đại diện Giáo viên"
            >
              <Camera className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        {/* Text Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-bold text-amber-950 font-serif truncate">
              {config.teacherName}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-300 font-sans">
              {config.teacherTitle || "GVCN"}
            </span>
            <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200 text-[10px]">
              🏫 {config.className}
            </span>
            <span className="hidden xl:inline text-[11px] text-slate-500 font-sans truncate">
              • {config.schoolName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-sans mt-0.5 flex-wrap">
            {config.topic && (
              <span className="text-amber-900 truncate max-w-xs">
                🌸 <span className="italic">{config.topic}</span>
              </span>
            )}
            {config.topic && config.classMotto && (
              <span className="opacity-40 hidden sm:inline">•</span>
            )}
            {config.classMotto && (
              <span className="text-red-900 hidden sm:inline font-medium truncate max-w-xs">
                📜 {config.classMotto}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: 4 compact Stat Pills & Edit Button */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-between md:justify-end w-full md:w-auto shrink-0">
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
          {/* Sĩ số */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl px-2.5 py-1 text-center flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-amber-700">Sĩ số:</span>
            <span className="text-xs sm:text-sm font-black text-amber-950">{students.length}</span>
          </div>

          {/* Hoa điểm */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl px-2.5 py-1 text-center flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-amber-700">Hoa điểm:</span>
            <span className="text-xs sm:text-sm font-black text-yellow-600">{totalPoints.toLocaleString()}⭐</span>
          </div>

          {/* Trạng nguyên */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl px-2.5 py-1 text-center flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-amber-700">Trạng nguyên:</span>
            <span className="text-xs sm:text-sm font-black text-amber-800">{trangNguyenCount}👑</span>
          </div>

          {/* Chuyên cần */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl px-2.5 py-1 text-center flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-amber-700">Chuyên cần:</span>
            <span className="text-xs sm:text-sm font-black text-emerald-700">{attendanceRate}%</span>
          </div>
        </div>

        {/* Edit mode toggle button */}
        <button
          id="btn-toggle-edit-mode"
          type="button"
          onClick={onToggleEditMode}
          className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border shrink-0 ${
            isEditMode
              ? "bg-red-600 text-white border-red-700 shadow-xs ring-2 ring-red-300"
              : "bg-slate-50 hover:bg-amber-50 text-slate-700 border-slate-200 shadow-xs"
          }`}
          title="Bật/Tắt chế độ chỉnh sửa giao diện & hình ảnh"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isEditMode ? "Tắt Sửa" : "Sửa"}</span>
        </button>
      </div>
    </div>
  );
};
