import React, { useState } from 'react';
import { 
  Check, 
  Clock, 
  FileText, 
  AlertCircle, 
  CheckCheck, 
  Calendar, 
  Sparkles,
  Users
} from 'lucide-react';
import { Student, AttendanceDay, AttendanceStatus } from '../../types';
import { soundEngine } from '../../utils/soundEngine';
import { storage } from '../../utils/storage';
import { AVATAR_OPTIONS } from '../../utils/ranks';

interface AttendanceViewProps {
  students: Student[];
  attendance: AttendanceDay[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceDay[]>>;
}

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
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="bg-white/80 backdrop-blur rounded-2xl p-4 sm:p-5 shadow-md border border-amber-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-300 font-bold text-amber-900 text-sm">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>Ngày điểm danh:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-white border border-amber-300 px-2 py-0.5 rounded-lg text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold cursor-pointer"
            />
          </div>

          <button
            onClick={handleMarkAllPresent}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md border border-emerald-400 transition-all active:scale-95"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Điểm Danh Nhanh Cả Lớp (Có Mặt)</span>
          </button>
        </div>

        {/* Stats Strip */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-bold">
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Có mặt: {presentCount}</span>
          </div>
          <div className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Đi trễ: {lateCount}</span>
          </div>
          <div className="bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Có phép: {excusedCount}</span>
          </div>
          <div className="bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>K.Phép: {unexcusedCount}</span>
          </div>
          <div className="bg-amber-100 text-amber-950 border border-amber-300 px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm">
            Tỉ lệ: {attendanceRate}%
          </div>
        </div>
      </div>

      {/* Attendance Student Cards Grid or Empty State */}
      {students.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border-2 border-dashed border-amber-300 text-center max-w-2xl mx-auto my-6">
          <img 
            src="/assets/images/empty-classroom.jpg" 
            alt="Lớp học trống" 
            className="w-64 h-48 sm:w-80 sm:h-56 object-cover rounded-2xl shadow-md border-4 border-amber-300 mx-auto mb-6"
          />
          <h3 className="text-2xl font-black text-slate-800 font-serif mb-2">
            Chưa Có Môn Sinh Để Điểm Danh
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Thầy/Cô hãy thêm danh sách học sinh vào lớp học trước khi thực hiện điểm danh chuyên cần hằng ngày!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {students.map(student => {
            const status = getStudentStatus(student.id);
            const avatarInfo = AVATAR_OPTIONS.find(a => a.id === student.avatar) || AVATAR_OPTIONS[0];

            return (
              <div
                key={student.id}
              className={`bg-white rounded-2xl p-3.5 border-2 transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${
                status === 'present'
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : status === 'late'
                  ? 'border-amber-400 bg-amber-50/30'
                  : status === 'excused'
                  ? 'border-blue-300 bg-blue-50/20'
                  : 'border-rose-400 bg-rose-50/30'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-2xl shrink-0">{avatarInfo.emoji}</span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{student.name}</h4>
                  <div className="text-[11px] text-slate-400 truncate">{student.role}</div>
                </div>
              </div>

              {/* 4 Status Buttons */}
              <div className="grid grid-cols-4 gap-1 pt-2 border-t border-slate-100 text-[11px] font-bold">
                <button
                  onClick={() => setStudentStatus(student.id, 'present')}
                  className={`py-1.5 rounded-lg flex flex-col items-center justify-center transition-all ${
                    status === 'present'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                  title="Có mặt"
                >
                  <Check className="w-3.5 h-3.5 mb-0.5" />
                  <span>Có mặt</span>
                </button>

                <button
                  onClick={() => setStudentStatus(student.id, 'late')}
                  className={`py-1.5 rounded-lg flex flex-col items-center justify-center transition-all ${
                    status === 'late'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                  title="Đi trễ"
                >
                  <Clock className="w-3.5 h-3.5 mb-0.5" />
                  <span>Đi trễ</span>
                </button>

                <button
                  onClick={() => setStudentStatus(student.id, 'excused')}
                  className={`py-1.5 rounded-lg flex flex-col items-center justify-center transition-all ${
                    status === 'excused'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                  }`}
                  title="Nghỉ có phép"
                >
                  <FileText className="w-3.5 h-3.5 mb-0.5" />
                  <span>Có phép</span>
                </button>

                <button
                  onClick={() => setStudentStatus(student.id, 'unexcused')}
                  className={`py-1.5 rounded-lg flex flex-col items-center justify-center transition-all ${
                    status === 'unexcused'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                  }`}
                  title="Nghỉ không phép"
                >
                  <AlertCircle className="w-3.5 h-3.5 mb-0.5" />
                  <span>K.Phép</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
