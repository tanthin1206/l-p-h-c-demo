import React from 'react';
import { 
  Wrench,
  Camera,
  Users,
  Star,
  Crown,
  CalendarCheck
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

const StatPill: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  tone: string;
}> = ({ icon: Icon, label, value, tone }) => (
  <div className="flex items-center gap-1.5 rounded-xl border border-paper-line bg-paper-warm/70 pl-1 pr-2.5 py-1">
    <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${tone}`}>
      <Icon className="w-3.5 h-3.5" />
    </span>
    <span className="text-[10px] uppercase font-bold tracking-wide text-ink-muted whitespace-nowrap">{label}</span>
    <span className="text-xs sm:text-sm font-black text-ink tabular-nums">{value}</span>
  </div>
);

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
      className="card px-3 py-2.5 sm:px-4 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3"
    >
      {/* Left: Avatar + Info */}
      <div className="flex items-center gap-3 min-w-0 w-full md:w-auto md:flex-1">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-gold-50 ring-2 ring-gold-300 ring-offset-1 ring-offset-white overflow-hidden flex items-center justify-center">
            {customTeacherAvatar && customTeacherAvatar.trim() ? (
              <img
                src={customTeacherAvatar}
                alt="Teacher Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-gold-100 to-gold-50 flex items-center justify-center text-xl">
                👩‍🏫
              </div>
            )}
          </div>
          {isEditMode && onOpenTeacherAvatarUpload && (
            <button
              type="button"
              onClick={onOpenTeacherAvatarUpload}
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary-700 hover:bg-primary-800 text-gold-100 flex items-center justify-center shadow-sm cursor-pointer border-2 border-white"
              title="Đổi ảnh đại diện Giáo viên"
            >
              <Camera className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        {/* Text Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-black text-ink font-serif truncate">
              {config.teacherName}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-100 text-gold-800">
              {config.teacherTitle || "GVCN"}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 text-primary-800 border border-primary-100">
              🏫 {config.className}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-ink-muted mt-0.5 min-w-0">
            {config.schoolName && (
              <span className="truncate">{config.schoolName}</span>
            )}
            {config.topic && (
              <>
                {config.schoolName && <span className="opacity-50 hidden sm:inline">•</span>}
                <span className="hidden sm:inline truncate max-w-xs text-ink-soft">
                  🌸 <span className="italic">{config.topic}</span>
                </span>
              </>
            )}
            {config.classMotto && (
              <>
                <span className="opacity-50 hidden lg:inline">•</span>
                <span className="hidden lg:inline text-primary-800 font-medium truncate max-w-xs">
                  📜 {config.classMotto}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: 4 compact Stat Pills & Edit Button */}
      <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1 md:flex-none md:flex-wrap md:justify-end">
          <StatPill icon={Users} label="Sĩ số" value={students.length} tone="bg-primary-50 text-primary-700" />
          <StatPill icon={Star} label="Hoa điểm" value={totalPoints.toLocaleString()} tone="bg-gold-100 text-gold-700" />
          <StatPill icon={Crown} label="Trạng nguyên" value={trangNguyenCount} tone="bg-gold-100 text-gold-800" />
          <StatPill icon={CalendarCheck} label="Chuyên cần" value={`${attendanceRate}%`} tone="bg-emerald-50 text-emerald-700" />
        </div>

        {/* Edit mode toggle button */}
        <button
          id="btn-toggle-edit-mode"
          type="button"
          onClick={onToggleEditMode}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border shrink-0 ${
            isEditMode
              ? "bg-primary-700 text-gold-100 border-primary-800 shadow-sm ring-2 ring-primary-200"
              : "bg-white hover:border-gold-400 text-ink-soft hover:text-ink border-paper-line"
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
