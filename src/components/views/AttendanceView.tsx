import React, { useState } from 'react';
import {
  Check,
  Clock,
  FileText,
  AlertCircle,
  CheckCheck,
  Calendar,
  ClipboardCheck,
  Percent
} from 'lucide-react';
import { Student, AttendanceDay, AttendanceStatus } from '../../types';
import { soundEngine } from '../../utils/soundEngine';
import { storage } from '../../utils/storage';
import { getAssetUrl } from '../../utils/assets';
import { ChibiAvatar } from '../ChibiAvatar';
import { Button, PageHeader, StatTile, EmptyState } from '../ui';

interface AttendanceViewProps {
  students: Student[];
  attendance: AttendanceDay[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceDay[]>>;
}

/** Thứ tự xoay vòng khi chạm vào thẻ học sinh */
const STATUS_CYCLE: AttendanceStatus[] = ['present', 'late', 'excused', 'unexcused'];

const STATUS_META: Record<
  AttendanceStatus,
  {
    label: string;
    short: string;
    icon: React.ComponentType<{ className?: string }>;
    tile: string;
    badge: string;
    dot: string;
  }
> = {
  present: {
    label: 'Có mặt',
    short: 'Có mặt',
    icon: Check,
    tile: 'border-emerald-300 bg-emerald-50/40',
    badge: 'bg-emerald-600 text-white',
    dot: 'bg-emerald-500'
  },
  late: {
    label: 'Đi trễ',
    short: 'Đi trễ',
    icon: Clock,
    tile: 'border-gold-400 bg-gold-50/60',
    badge: 'bg-gold-500 text-primary-950',
    dot: 'bg-gold-500'
  },
  excused: {
    label: 'Nghỉ có phép',
    short: 'Có phép',
    icon: FileText,
    tile: 'border-sky-300 bg-sky-50/50',
    badge: 'bg-sky-600 text-white',
    dot: 'bg-sky-500'
  },
  unexcused: {
    label: 'Nghỉ không phép',
    short: 'K.Phép',
    icon: AlertCircle,
    tile: 'border-primary-400 bg-primary-50/60',
    badge: 'bg-primary-700 text-white',
    dot: 'bg-primary-600'
  }
};

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  attendance,
  setAttendance
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });

  // Get or initialize record for selected date
  const currentDayRecord = attendance.find(a => a.date === selectedDate) || {
    date: selectedDate,
    records: students.map(s => ({ studentId: s.id, status: 'present' as AttendanceStatus }))
  };

  const getStudentStatus = (studentId: string): AttendanceStatus => {
    const r = currentDayRecord.records.find(rec => rec.studentId === studentId);
    return r ? r.status : 'present';
  };

  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    soundEngine.playAttendanceTing();
    const updatedRecords = currentDayRecord.records.some(r => r.studentId === studentId)
      ? currentDayRecord.records.map(r => r.studentId === studentId ? { ...r, status } : r)
      : [...currentDayRecord.records, { studentId, status }];

    const newDay: AttendanceDay = { date: selectedDate, records: updatedRecords };
    const newAttendance = attendance.some(a => a.date === selectedDate)
      ? attendance.map(a => a.date === selectedDate ? newDay : a)
      : [...attendance, newDay];

    setAttendance(newAttendance);
    storage.saveAttendance(newAttendance);
  };

  // Chạm 1 lần để xoay vòng trạng thái
  const cycleStudentStatus = (studentId: string) => {
    const current = getStudentStatus(studentId);
    const idx = STATUS_CYCLE.indexOf(current);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    setStudentStatus(studentId, next);
  };

  // Điểm danh nhanh cả lớp có mặt
  const handleMarkAllPresent = () => {
    soundEngine.playAttendanceTing();
    const updatedRecords = students.map(s => ({
      studentId: s.id,
      status: 'present' as AttendanceStatus
    }));

    const newDay: AttendanceDay = { date: selectedDate, records: updatedRecords };
    const newAttendance = attendance.some(a => a.date === selectedDate)
      ? attendance.map(a => a.date === selectedDate ? newDay : a)
      : [...attendance, newDay];

    setAttendance(newAttendance);
    storage.saveAttendance(newAttendance);
  };

  // Stats for the day
  const total = students.length;
  const presentCount = students.filter(s => getStudentStatus(s.id) === 'present').length;
  const lateCount = students.filter(s => getStudentStatus(s.id) === 'late').length;
  const excusedCount = students.filter(s => getStudentStatus(s.id) === 'excused').length;
  const unexcusedCount = students.filter(s => getStudentStatus(s.id) === 'unexcused').length;
  const attendanceRate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 100;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={ClipboardCheck}
        title="Điểm Danh Chuyên Cần"
        subtitle="Chạm vào thẻ học sinh để đổi trạng thái: Có mặt → Đi trễ → Có phép → Không phép"
        actions={
          <>
            <label className="flex items-center gap-2 card px-3 py-1.5 text-sm font-bold text-ink-soft cursor-pointer">
              <Calendar className="w-4 h-4 text-primary-700" />
              <span className="hidden sm:inline">Ngày điểm danh:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-transparent text-ink text-sm font-semibold focus:outline-none cursor-pointer"
              />
            </label>
            <Button variant="success" icon={CheckCheck} onClick={handleMarkAllPresent}>
              Điểm Danh Nhanh Cả Lớp (Có Mặt)
            </Button>
          </>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatTile label="Có mặt" value={presentCount} icon={Check} tone="success" hint={`/${total} học sinh`} />
        <StatTile label="Đi trễ" value={lateCount} icon={Clock} tone="gold" />
        <StatTile label="Vắng có phép" value={excusedCount} icon={FileText} tone="neutral" />
        <StatTile label="Vắng không phép" value={unexcusedCount} icon={AlertCircle} tone="danger" />
        <div className="col-span-2 sm:col-span-1">
          <StatTile
            label="Tỉ lệ chuyên cần"
            value={`${attendanceRate}%`}
            icon={Percent}
            tone="primary"
            hint={
              <span className="block h-1.5 w-full mt-1 rounded-full bg-paper-warm overflow-hidden">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-gold-400 to-primary-600 transition-all duration-500"
                  style={{ width: `${attendanceRate}%` }}
                />
              </span>
            }
          />
        </div>
      </div>

      {/* Attendance Student Tiles Grid or Empty State */}
      {students.length === 0 ? (
        <EmptyState
          image={getAssetUrl('/assets/images/empty-classroom.jpg')}
          title="Chưa Có Môn Sinh Để Điểm Danh"
          description="Thầy/Cô hãy thêm danh sách học sinh vào lớp học trước khi thực hiện điểm danh chuyên cần hằng ngày!"
        />
      ) : (
        <>
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-ink-soft">
            {STATUS_CYCLE.map(st => (
              <span key={st} className="chip flex items-center gap-1.5 cursor-default">
                <span className={`w-2 h-2 rounded-full ${STATUS_META[st].dot}`} />
                {STATUS_META[st].label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {students.map(student => {
              const status = getStudentStatus(student.id);
              const meta = STATUS_META[status];
              const StatusIcon = meta.icon;

              return (
                <div
                  key={student.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => cycleStudentStatus(student.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      cycleStudentStatus(student.id);
                    }
                  }}
                  title={`${student.name} — ${meta.label} (chạm để đổi)`}
                  className={`relative rounded-2xl border-2 p-3 pt-4 flex flex-col items-center text-center shadow-card hover:shadow-card-hover transition-all cursor-pointer select-none active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${meta.tile}`}
                >
                  <span
                    className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${meta.badge}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                  </span>

                  <ChibiAvatar
                    points={student.points}
                    gender={student.gender}
                    size="sm"
                    customPhotoUrl={student.customPhotoUrl}
                  />
                  <div className="mt-1.5 w-full text-[13px] font-bold text-ink truncate" title={student.name}>
                    {student.name}
                  </div>
                  <div className="text-[10px] text-ink-muted truncate w-full">{student.role}</div>

                  <span className={`mt-2 px-2 py-0.5 rounded-full text-[11px] font-black ${meta.badge}`}>
                    {meta.short}
                  </span>

                  {/* Chọn trực tiếp trạng thái */}
                  <div
                    className="mt-2 pt-2 w-full border-t border-paper-line/80 grid grid-cols-4 gap-1"
                    onClick={e => e.stopPropagation()}
                  >
                    {STATUS_CYCLE.map(st => {
                      const m = STATUS_META[st];
                      const Ic = m.icon;
                      const active = st === status;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStudentStatus(student.id, st)}
                          title={m.label}
                          className={`h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                            active ? `${m.badge} shadow-sm` : 'bg-white/80 text-ink-muted hover:bg-white hover:text-ink'
                          }`}
                        >
                          <Ic className="w-3.5 h-3.5" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
