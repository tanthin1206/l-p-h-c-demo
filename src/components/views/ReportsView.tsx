import React, { useState } from 'react';
import {
  BarChart3,
  Sparkles,
  Copy,
  Check,
  Users,
  Award,
  TrendingUp,
  MessageSquare,
  FileSpreadsheet,
  ShieldCheck,
  Flower2,
  ClipboardCheck,
  CalendarCheck,
  Crown,
  Bot
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, Group, Criterion, PointLog, ClassConfig, AttendanceDay } from '../../types';
import { AI_SERVICE } from '../../utils/gemini';
import { soundEngine } from '../../utils/soundEngine';
import { getRankByPoints, RANK_TIERS } from '../../utils/ranks';
import { notify } from '../ui/dialog';
import { Button, PageHeader, StatTile } from '../ui';

interface ReportsViewProps {
  students: Student[];
  groups: Group[];
  criteria: Criterion[];
  pointLogs: PointLog[];
  config: ClassConfig;
  attendance: AttendanceDay[];
}

// Bảng màu thống nhất cho các thanh biểu đồ tổ
const GROUP_BAR_COLORS = [
  'from-primary-500 to-primary-700',
  'from-gold-400 to-gold-600',
  'from-emerald-400 to-emerald-600',
  'from-sky-400 to-sky-600',
  'from-violet-400 to-violet-600',
  'from-rose-400 to-rose-600',
];

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
  const topMax = Math.max(1, topStudents[0]?.points ?? 1);

  // Total points
  const totalPoints = students.reduce((sum, s) => sum + s.points, 0);
  const trangNguyenCount = students.filter(s => s.points >= 350).length;

  // Điểm các tổ
  const groupStats = groups.map(g => {
    const members = students.filter(s => s.groupId === g.id);
    const pts = members.reduce((sum, s) => sum + s.points, 0);
    const percent = totalPoints > 0 ? Math.round((pts / totalPoints) * 100) : 25;
    return { g, pts, percent, memberCount: members.length };
  });
  const groupMax = Math.max(1, ...groupStats.map(x => x.pts));

  // Phân bổ cấp bậc khoa bảng
  const tierStats = [...RANK_TIERS].reverse().map(tier => ({
    tier,
    count: students.filter(s => getRankByPoints(s.points).tier === tier.tier).length
  }));
  const tierMax = Math.max(1, ...tierStats.map(t => t.count));

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
      notify("Chưa có dữ liệu học sinh để xuất Excel!");
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

  const medalClass = (idx: number) =>
    idx === 0 ? 'bg-gold-400 text-primary-950' :
    idx === 1 ? 'bg-slate-300 text-ink' :
    idx === 2 ? 'bg-gold-700 text-white' : 'bg-paper-warm text-ink-soft border border-paper-line';

  return (
    <div className="space-y-5">
      <PageHeader
        icon={BarChart3}
        title="Thống Kê Lớp Học & Trợ Lý Sư Phạm AI"
        subtitle="Tổng hợp dữ liệu thi đua, biểu đồ tiến độ và tạo báo cáo tự động gửi phụ huynh qua Zalo"
        actions={
          <>
            <Button
              variant="success"
              icon={FileSpreadsheet}
              onClick={handleExportExcel}
              title="Xuất bảng điểm toàn lớp ra file Excel (.xlsx)"
            >
              Xuất Excel Bảng Điểm
            </Button>
            <Button
              variant="gold"
              icon={Sparkles}
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              {isGenerating ? 'Trợ lý AI đang soạn...' : 'Soạn Báo Cáo Tuần (AI)'}
            </Button>
          </>
        }
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <StatTile label="Sĩ số lớp" value={`${students.length} em`} icon={Users} tone="neutral" hint={`${groups.length} tổ thi đua`} />
        <StatTile label="Tổng hoa điểm" value={`${totalPoints} đ`} icon={Flower2} tone="primary" hint={students.length > 0 ? `TB ${Math.round(totalPoints / students.length)} đ/em` : undefined} />
        <StatTile label="Lượt chấm điểm" value={`${pointLogs.length} lần`} icon={ClipboardCheck} tone="gold" hint={`${criteria.length} tiêu chí`} />
        <StatTile label="Ngày điểm danh" value={`${attendance.length} ngày`} icon={CalendarCheck} tone="success" />
        <StatTile label="Trạng Nguyên đạt mốc" value={`${trangNguyenCount} em`} icon={Crown} tone="gold" hint="Từ 350 hoa điểm" />
      </div>

      {/* Safety Backup Reminder Banner */}
      <div className="rounded-2xl border border-gold-200 bg-gold-50 px-4 py-3 flex items-start gap-2.5 text-xs text-gold-900">
        <ShieldCheck className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
        <span>
          <b>Lời khuyên an toàn dữ liệu:</b> Hãy định kỳ vào mục <b>Cài đặt &gt; Sao lưu</b> và bấm <b>Xuất Sao Lưu Tệp JSON</b> để bảo toàn thành tích của các em học sinh trên máy tính của bạn.
        </span>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card 1: Top 5 Học Sinh */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black font-serif text-ink text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-gold-600" />
              <span>Top 5 Hoa Điểm Tốt</span>
            </h3>
            <span className="text-[11px] font-bold text-gold-800 bg-gold-100 px-2.5 py-0.5 rounded-full">
              Dẫn đầu
            </span>
          </div>

          {topStudents.length === 0 ? (
            <p className="text-xs text-ink-muted italic text-center py-6">Chưa có dữ liệu học sinh</p>
          ) : (
            <div className="space-y-3">
              {topStudents.map((s, idx) => (
                <div key={s.id}>
                  <div className="flex items-center justify-between gap-2 text-xs mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center font-black text-[10px] ${medalClass(idx)}`}>
                        {idx + 1}
                      </span>
                      <span className="font-bold text-ink truncate">{s.name}</span>
                    </div>
                    <span className="font-black text-primary-700 shrink-0">🌸 {s.points} đ</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-paper-warm overflow-hidden ml-7">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-500"
                      style={{ width: `${Math.max(2, Math.round((s.points / topMax) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 2: Điểm Thi Đua Các Tổ */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black font-serif text-ink text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-700" />
              <span>Thi Đua Giữa Các Tổ</span>
            </h3>
            <span className="text-[11px] font-bold text-ink-muted">
              Tổng: {totalPoints} đ
            </span>
          </div>

          {groupStats.length === 0 ? (
            <p className="text-xs text-ink-muted italic text-center py-6">Chưa có tổ thi đua</p>
          ) : (
            <div className="space-y-3.5">
              {groupStats.map(({ g, pts, percent, memberCount }, i) => (
                <div key={g.id}>
                  <div className="flex justify-between gap-2 text-xs font-bold mb-1">
                    <span className="flex items-center gap-1.5 text-ink min-w-0">
                      <span>{g.icon}</span>
                      <span className="truncate">{g.name.split(':')[0]}</span>
                      <span className="text-ink-muted font-medium shrink-0">· {memberCount} em</span>
                    </span>
                    <span className="text-primary-800 shrink-0">{pts} đ ({percent}%)</span>
                  </div>
                  <div className="w-full bg-paper-warm rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${GROUP_BAR_COLORS[i % GROUP_BAR_COLORS.length]} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${totalPoints > 0 ? Math.max(2, Math.round((pts / groupMax) * 100)) : percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 3: Phân Bổ Cấp Bậc */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black font-serif text-ink text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>Phân Bổ Cấp Bậc Học Vị</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Tích cực
            </span>
          </div>

          <div className="space-y-2.5">
            {tierStats.map(({ tier, count }) => (
              <div key={tier.tier} className="flex items-center gap-2 text-xs">
                <span className="w-6 text-center text-base shrink-0">{tier.badge}</span>
                <span className="w-24 sm:w-28 font-bold text-ink-soft truncate shrink-0">{tier.title}</span>
                <div className="flex-1 h-2.5 rounded-full bg-paper-warm overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-700 transition-all duration-500"
                    style={{ width: `${count === 0 ? 0 : Math.max(4, Math.round((count / tierMax) * 100))}%` }}
                  />
                </div>
                <span className="w-10 text-right font-black text-ink shrink-0">{count} em</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI WEEKLY REPORT */}
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-paper-line bg-paper-warm">
          <div className="flex items-center gap-2 text-primary-900 font-black font-serif text-base min-w-0">
            <MessageSquare className="w-5 h-5 text-gold-600 shrink-0" />
            <span>Nội Dung Báo Cáo Tổng Kết Tuần (Sẵn Sàng Gửi Zalo Phụ Huynh)</span>
          </div>

          {weeklyReport && (
            <Button
              size="sm"
              variant={copied ? 'success' : 'outline'}
              icon={copied ? Check : Copy}
              onClick={handleCopyReport}
            >
              {copied ? 'Đã sao chép vào bộ nhớ tạm!' : 'Sao chép nội dung'}
            </Button>
          )}
        </div>

        <div className="p-5">
          {weeklyReport ? (
            <div className="bg-paper p-4 sm:p-5 rounded-2xl border border-paper-line text-xs sm:text-sm font-sans whitespace-pre-wrap leading-relaxed text-ink font-medium animate-fade-in">
              {weeklyReport}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-gold-100 text-gold-700 flex items-center justify-center shrink-0">
                <Bot className={`w-7 h-7 ${isGenerating ? 'animate-pulse' : ''}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-ink">
                  {isGenerating ? 'Trợ lý AI đang soạn...' : 'Trợ lý Sư Phạm AI sẵn sàng soạn báo cáo tuần'}
                </p>
                <p className="text-xs text-ink-muted mt-0.5">
                  Bấm nút bên cạnh để AI tổng hợp thành tích thi đua của lớp thành bản tin gửi phụ huynh qua Zalo.
                </p>
              </div>
              <Button variant="primary" icon={Sparkles} onClick={handleGenerateReport} disabled={isGenerating}>
                {isGenerating ? 'Trợ lý AI đang soạn...' : 'Soạn Báo Cáo Tuần (AI)'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
