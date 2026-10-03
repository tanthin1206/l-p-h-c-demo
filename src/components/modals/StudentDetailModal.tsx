import React, { useState } from 'react';
import { Sparkles, Star, Award, Scroll, Edit, RotateCcw, CheckCircle2, BookUser, History } from 'lucide-react';
import { Student, Group, PointLog, ClassConfig } from '../../types';
import { getRankByPoints } from '../../utils/ranks';
import { ChibiAvatar } from '../ChibiAvatar';
import { AI_SERVICE } from '../../utils/gemini';
import { Modal, Button } from '../ui';

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
    <Modal
      open={isOpen}
      onClose={onClose}
      size="xl"
      icon={BookUser}
      title="Hồ Sơ Môn Sinh Khoa Bảng"
      subtitle={<>Văn Miếu Khảo Thí <span className="hidden sm:inline">• Mã sĩ tử: {student.id}</span></>}
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" icon={Edit} onClick={() => onEditStudent(student)}>
            Sửa Hồ Sơ
          </Button>
          <Button variant="primary" icon={Scroll} onClick={() => onOpenCertificate(student)}>
            Trao Chiếu Chỉ Khen Thưởng
          </Button>
        </div>
      }
    >
      <div id="modal-student-dossier" className="grid grid-cols-1 lg:grid-cols-5 gap-5 font-sans">
        {/* LEFT COLUMN: profile, stats, perks */}
        <div className="lg:col-span-2 space-y-4">
          {/* Profile */}
          <div className="flex lg:flex-col items-center lg:text-center gap-4 p-4 rounded-2xl bg-gradient-to-b from-paper-warm to-white border border-paper-line">
            <ChibiAvatar
              points={student.points}
              gender={student.gender}
              size="xl"
              showAura={true}
              animated={true}
              customPhotoUrl={student.customPhotoUrl}
            />
            <div className="min-w-0 flex-1 lg:w-full">
              <h3 className="text-xl sm:text-2xl font-black text-ink font-serif truncate">
                {student.name}
              </h3>
              <div className="flex items-center lg:justify-center gap-1.5 mt-1.5 text-xs flex-wrap">
                <span className="font-bold text-gold-900 bg-gold-100 px-2.5 py-0.5 rounded-full border border-gold-300">
                  {rank.badge} {rank.title}
                </span>
                <span className="text-ink-soft font-semibold bg-white border border-paper-line px-2.5 py-0.5 rounded-full">
                  {group?.name || 'Chưa xếp tổ'}
                </span>
                <span className="text-primary-800 font-bold bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-100">
                  {student.role}
                </span>
              </div>
              <div className="text-xs text-ink-muted mt-2 font-medium">
                Ngày sinh: <b className="text-ink-soft">{student.birthDate}</b> • Giới tính: <b className="text-ink-soft">{student.gender === 'female' ? 'Nữ' : 'Nam'}</b>
              </div>
            </div>
          </div>

          {/* Quick Points & Stars Stats */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-primary-50 p-3 rounded-2xl border border-primary-100">
              <div className="text-[10px] text-primary-800 uppercase font-bold tracking-wider">TỔNG HOA ĐIỂM TỐT</div>
              <div className="text-2xl font-black text-primary-900 flex items-center justify-center gap-1.5 mt-0.5">
                <Sparkles className="w-5 h-5 text-gold-500 fill-gold-400" />
                <span>{student.points}</span>
              </div>
            </div>
            <div className="bg-gold-50 p-3 rounded-2xl border border-gold-200">
              <div className="text-[10px] text-gold-800 uppercase font-bold tracking-wider">SAO TÍCH LŨY</div>
              <div className="text-2xl font-black text-gold-700 flex items-center justify-center gap-1.5 mt-0.5">
                <Star className="w-5 h-5 text-gold-500 fill-gold-400" />
                <span>{student.stars}</span>
              </div>
            </div>
          </div>

          {/* Rank Perks */}
          <div className="bg-paper p-3.5 rounded-2xl border border-paper-line text-xs">
            <div className="font-bold text-ink mb-1.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-gold-600" />
              <span>Đặc quyền học vị {rank.tier}:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-ink-soft">
              {rank.perks.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: AI comment + history */}
        <div className="lg:col-span-3 space-y-4">
          {/* AI Pedagogical Comment */}
          <div className="bg-gradient-to-br from-gold-50 to-paper-warm p-4 rounded-2xl border border-gold-200">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-gold-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-gold-600" />
                <span>Lời Nhận Xét Sổ Liên Lạc (Trợ Lý AI)</span>
              </span>
              <Button
                size="sm"
                variant="gold"
                onClick={handleGenerateAiComment}
                disabled={isGenerating}
                className="shrink-0"
              >
                {isGenerating ? 'Đang soạn...' : 'Soạn Nhận Xét'}
              </Button>
            </div>
            {aiComment ? (
              <div className="space-y-2">
                <div className="p-3 bg-white rounded-xl border border-paper-line text-xs sm:text-sm leading-relaxed text-ink-soft font-serif italic">
                  « {aiComment} »
                </div>
                <div className="flex justify-end">
                  <Button size="sm" variant="outline" onClick={handleCopyComment}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{copiedAi ? 'Đã sao chép vào Clipboard!' : 'Sao chép nhận xét'}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-ink-muted italic font-serif">
                Bấm nút "Soạn Nhận Xét" để tự động tạo tin nhắn sư phạm gửi phụ huynh qua Zalo.
              </p>
            )}
          </div>

          {/* Recent Points History with Undo */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              <span>Lịch Sử Nhận Điểm ({studentLogs.length})</span>
            </h4>
            {studentLogs.length === 0 ? (
              <p className="text-xs text-ink-muted italic text-center py-6 rounded-2xl border border-dashed border-paper-line bg-paper">
                Chưa có lịch sử chấm điểm.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-60 lg:max-h-80 overflow-y-auto pr-1">
                {studentLogs.map(log => (
                  <div key={log.id} className="flex items-center justify-between p-2.5 rounded-xl bg-paper border border-paper-line text-xs">
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="font-bold text-ink truncate block">{log.criterionName}</span>
                      <span className="text-[10px] text-ink-muted">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`font-black px-2 py-0.5 rounded-lg ${log.points > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-primary-700 bg-primary-50'}`}>
                        {log.points > 0 ? `+${log.points}` : log.points}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUndoLog(log.id)}
                        className="p-1 text-ink-muted hover:text-primary-700 rounded-lg hover:bg-primary-50 transition-all cursor-pointer"
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
        </div>
      </div>
    </Modal>
  );
};
