import React, { useState } from 'react';
import { 
  BarChart3, 
  Sparkles, 
  Copy, 
  Check, 
  FileText, 
  Users, 
  Award, 
  TrendingUp,
  MessageSquare,
  FileSpreadsheet,
  ShieldCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, Group, Criterion, PointLog, ClassConfig, AttendanceDay } from '../../types';
import { AI_SERVICE } from '../../utils/gemini';
import { soundEngine } from '../../utils/soundEngine';
import { getRankByPoints } from '../../utils/ranks';

interface ReportsViewProps {
  students: Student[];
  groups: Group[];
  criteria: Criterion[];
  pointLogs: PointLog[];
  config: ClassConfig;
  attendance: AttendanceDay[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  students,
  groups,
  criteria,
  pointLogs,
  config,
  attendance
}) => {
  const [weeklyReport, setWeeklyReport] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Top 5 students
  const topStudents = [...students].sort((a, b) => b.points - a.points).slice(0, 5);

  // Total points
  const totalPoints = students.reduce((sum, s) => sum + s.points, 0);

  // Sinh báo cáo tổng kết tuần bằng AI
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    soundEngine.playPointGain();
    const reportText = await AI_SERVICE.generateClassReport(students, config);
    setWeeklyReport(reportText);
    setIsGenerating(false);
  };

  const handleCopyReport = () => {
    if (!weeklyReport) return;
    navigator.clipboard.writeText(weeklyReport);
    setCopied(true);
    soundEngine.playPointGain();
    setTimeout(() => setCopied(false), 2500);
  };

  // Xuất bảng điểm danh sách học sinh ra file Excel (.xlsx)
  const handleExportExcel = () => {
    if (students.length === 0) {
      alert("Chưa có dữ liệu học sinh để xuất Excel!");
      return;
    }
    soundEngine.playPointGain();

    const sorted = [...students].sort((a, b) => b.points - a.points);
    const dataRows = sorted.map((st, idx) => {
      const group = groups.find(g => g.id === st.groupId);
      const rank = getRankByPoints(st.points);
      return {
        "STT": idx + 1,
        "Họ và Tên": st.name,
        "Giới tính": st.gender === 'male' ? 'Nam' : 'Nữ',
        "Tổ thi đua": group ? group.name : 'Chưa xếp tổ',
        "Chức vụ": st.role || 'Học sinh',
        "Hoa Điểm": st.points,
        "Số Sao": st.stars,
        "Cấp Bậc Khoa Bảng": rank.title,
        "Danh Hiệu": rank.tier
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataRows);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 24 },
      { wch: 10 },
      { wch: 22 },
      { wch: 16 },
      { wch: 12 },
      { wch: 10 },
      { wch: 20 },
      { wch: 16 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bảng Điểm Sĩ Tử");

    const today = new Date().toISOString().slice(0, 10);
    const filename = `Bang_Diem_${(config.className || 'Lop').replace(/\s+/g, '_')}_${today}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-md border border-amber-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-amber-950 font-serif flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-600" />
            <span>Thống Kê Lớp Học & Trợ Lý Sư Phạm AI</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tổng hợp dữ liệu thi đua, biểu đồ tiến độ và tạo báo cáo tự động gửi phụ huynh qua Zalo
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md border border-emerald-500 transition-all active:scale-95 cursor-pointer"
            title="Xuất bảng điểm toàn lớp ra file Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>Xuất Excel Bảng Điểm</span>
          </button>

          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md border border-amber-400 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>{isGenerating ? 'Trợ lý AI đang soạn...' : 'Soạn Báo Cáo Tuần (AI)'}</span>
          </button>
        </div>
      </div>

      {/* Safety Backup Reminder Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border border-amber-300/80 rounded-2xl p-3.5 px-4 flex items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2 text-amber-900 font-medium">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <b>Lời khuyên an toàn dữ liệu:</b> Hãy định kỳ vào mục <b>Cài đặt &gt; Sao lưu</b> và bấm <b>Xuất Sao Lưu Tệp JSON</b> để bảo toàn thành tích của các em học sinh trên máy tính của bạn.
          </span>
        </div>
      </div>

      {/* Grid Quick Stats & Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Top 5 Học Sinh */}
        <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-amber-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Top 5 Hoa Điểm Tốt</span>
              </h3>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Dẫn đầu
              </span>
            </div>

            <div className="space-y-3">
              {topStudents.map((s, idx) => (
                <div key={s.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      idx === 0 ? 'bg-yellow-400 text-amber-950 font-black' :
                      idx === 1 ? 'bg-slate-300 text-slate-800' :
                      idx === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800">{s.name}</span>
                  </div>
                  <span className="font-black text-amber-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    🌸 {s.points} đ
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Điểm Thi Đua Các Tổ */}
        <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-amber-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                <span>Thi Đua Giữa 4 Tổ</span>
              </h3>
              <span className="text-xs font-bold text-slate-500">
                Tổng: {totalPoints} đ
              </span>
            </div>

            <div className="space-y-3.5">
              {groups.map(g => {
                const members = students.filter(s => s.groupId === g.id);
                const pts = members.reduce((sum, s) => sum + s.points, 0);
                const percent = totalPoints > 0 ? Math.round((pts / totalPoints) * 100) : 25;

                return (
                  <div key={g.id}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="flex items-center gap-1.5">
                        <span>{g.icon}</span>
                        <span>{g.name.split(':')[0]}</span>
                      </span>
                      <span className="text-amber-900">{pts} đ ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 3: Phân Bổ Tiêu Chí */}
        <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-amber-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <span>Chuyên Cần & Nề Nếp</span>
              </h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Tích cực
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 font-medium">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center">
                <span>Số lượt chấm điểm ghi nhận:</span>
                <b className="text-amber-900 text-sm">{pointLogs.length} lần</b>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
                <span>Số ngày đã điểm danh:</span>
                <b className="text-emerald-900 text-sm">{attendance.length} ngày</b>
              </div>
              <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200 flex justify-between items-center">
                <span>Tổng số Trạng Nguyên đạt mốc:</span>
                <b className="text-yellow-900 text-sm">
                  {students.filter(s => s.points >= 350).length} em
                </b>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI GENERATED WEEKLY REPORT BOX */}
      {weeklyReport && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-amber-400 space-y-4 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
              <MessageSquare className="w-5 h-5 text-amber-600" />
              <span>Nội Dung Báo Cáo Tổng Kết Tuần (Sẵn Sàng Gửi Zalo Phụ Huynh)</span>
            </div>

            <button
              onClick={handleCopyReport}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                copied ? 'bg-emerald-600 text-white' : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã sao chép vào bộ nhớ tạm!' : 'Sao chép nội dung'}</span>
            </button>
          </div>

          <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200 text-xs sm:text-sm font-sans whitespace-pre-wrap leading-relaxed text-slate-800 font-medium">
            {weeklyReport}
          </div>
        </div>
      )}
    </div>
  );
};
