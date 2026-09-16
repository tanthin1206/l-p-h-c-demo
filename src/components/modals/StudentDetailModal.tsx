import React, { useState } from 'react';
import { X, Sparkles, Star, Award, Scroll, Edit, RotateCcw, Calendar, CheckCircle2 } from 'lucide-react';
import { Student, Group, PointLog, ClassConfig } from '../../types';
import { getRankByPoints } from '../../utils/ranks';
import { ChibiAvatar } from '../ChibiAvatar';
import { AI_SERVICE } from '../../utils/gemini';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  group?: Group;
  pointLogs: PointLog[];
  config: ClassConfig;
  onUndoLog: (logId: string) => void;
  onEditStudent: (student: Student) => void;
  onOpenCertificate: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  student,
  group,
  pointLogs,
  config,
  onUndoLog,
  onEditStudent,
  onOpenCertificate
}) => {
  const [aiComment, setAiComment] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const [copiedAi, setCopiedAi] = useState<boolean>(false);

  if (!isOpen || !student) return null;

  const rank = getRankByPoints(student.points);
  const studentLogs = pointLogs.filter(l => l.studentId === student.id).slice(0, 15);

  const handleGenerateAiComment = async () => {
    setIsGenerating(true);
    const comment = await AI_SERVICE.generateStudentComment(student, rank.title, config);
    setAiComment(comment);
    setIsGenerating(false);
  };

  const handleCopyComment = () => {
    if (!aiComment) return;
    navigator.clipboard.writeText(aiComment);
    setCopiedAi(true);
    setTimeout(() => setCopiedAi(false), 2000);
  };

  return (
    <div
      id="modal-student-dossier"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200 font-sans"
    >
      <div className="relative w-full max-w-3xl my-auto bg-[#fffdf4] rounded-2xl sm:rounded-3xl border-4 sm:border-8 border-amber-500 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Imperial Header */}
        <div className="relative bg-gradient-to-r from-red-800 via-amber-800 to-red-900 text-white px-4 py-3.5 sm:px-6 sm:py-4 border-b-4 border-amber-400 shadow-md flex items-center justify-between shrink-0">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-xl sm:text-2xl shadow-md border-2 border-yellow-200 font-bold shrink-0">
              📜
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400/20 text-amber-200 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border border-amber-300/40 uppercase tracking-widest">
                  Văn Miếu Khảo Thí
                </span>
                <span className="text-xs text-amber-200 font-medium hidden sm:inline">
                  Mã sĩ tử: {student.id}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold font-serif text-yellow-300">
                Hồ Sơ Môn Sinh Khoa Bảng
              </h1>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-amber-200 hover:text-white transition-colors cursor-pointer relative z-10"
            title="Đóng (ESC)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-4">
          {/* Profile Top Bar */}
          <div className="flex items-center gap-4 pb-4 border-b border-amber-200/80">
            <ChibiAvatar
              points={student.points}
              gender={student.gender}
              size="xl"
              showAura={true}
              animated={true}
              customPhotoUrl={student.customPhotoUrl}
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif truncate">
                {student.name}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs flex-wrap">
                <span className="font-bold text-amber-900 bg-amber-100 px-3 py-0.5 rounded-full border border-amber-300 shadow-xs">
                  {rank.badge} {rank.title}
                </span>
                <span className="text-slate-600 font-semibold bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {group?.name || 'Chưa xếp tổ'}
                </span>
                <span className="text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {student.role}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1.5 font-medium">
                Ngày sinh: <b>{student.birthDate}</b> • Giới tính: <b>{student.gender === 'female' ? 'Nữ' : 'Nam'}</b>
              </div>
            </div>
          </div>

        {/* Quick Points & Stars Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-center">
          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
            <div className="text-[10px] text-amber-800 uppercase font-bold tracking-wider">TỔNG HOA ĐIỂM TỐT</div>
            <div className="text-2xl font-black text-amber-950 flex items-center justify-center gap-1.5 mt-0.5">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
              <span>{student.points}</span>
            </div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-2xl border border-yellow-200">
            <div className="text-[10px] text-yellow-800 uppercase font-bold tracking-wider">SAO TÍCH LŨY</div>
            <div className="text-2xl font-black text-yellow-700 flex items-center justify-center gap-1.5 mt-0.5">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
              <span>{student.stars}</span>
            </div>
          </div>
        </div>

        {/* Rank Perks */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 mb-4 text-xs">
          <div className="font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Đặc quyền học vị {rank.tier}:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            {rank.perks.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>

        {/* AI Pedagogical Comment */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-300 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Lời Nhận Xét Sổ Liên Lạc (Trợ Lý AI)</span>
            </span>
            <button
              onClick={handleGenerateAiComment}
              disabled={isGenerating}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? 'Đang soạn...' : 'Soạn Nhận Xét'}
            </button>
          </div>
          {aiComment ? (
            <div className="space-y-2">
              <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs leading-relaxed text-slate-700 font-serif italic">
                « {aiComment} »
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCopyComment}
                  className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{copiedAi ? 'Đã sao chép vào Clipboard!' : 'Sao chép nhận xét'}</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic font-serif">
              Bấm nút "Soạn Nhận Xét" để tự động tạo tin nhắn sư phạm gửi phụ huynh qua Zalo.
            </p>
          )}
        </div>

        {/* Recent Points History with Undo */}
        <div className="mb-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Lịch Sử Nhận Điểm ({studentLogs.length})
          </h4>
          {studentLogs.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-3">Chưa có lịch sử chấm điểm.</p>
          ) : (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {studentLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-bold text-slate-800 truncate block">{log.criterionName}</span>
                    <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-black ${log.points > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {log.points > 0 ? `+${log.points}` : log.points}
                    </span>
                    <button
                      onClick={() => onUndoLog(log.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-200/60 transition-all"
                      title="Hoàn tác lượt chấm này"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions Bar */}
        <div className="flex gap-2">
          <button
            onClick={() => onOpenCertificate(student)}
            className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-amber-700 hover:from-red-700 hover:to-amber-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md border border-red-500 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <Scroll className="w-4 h-4" />
            <span>Trao Chiếu Chỉ Khen Thưởng</span>
          </button>
          <button
            onClick={() => onEditStudent(student)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Edit className="w-4 h-4" />
            <span>Sửa Hồ Sơ</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};
