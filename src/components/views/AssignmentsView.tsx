import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Award, 
  Sparkles, 
  X, 
  UserCheck,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Assignment, Student, PointLog } from '../../types';
import { soundEngine } from '../../utils/soundEngine';
import { storage } from '../../utils/storage';
import { AVATAR_OPTIONS } from '../../utils/ranks';

interface AssignmentsViewProps {
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  pointLogs: PointLog[];
  setPointLogs: React.Dispatch<React.SetStateAction<PointLog[]>>;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  assignments,
  setAssignments,
  students,
  setStudents,
  pointLogs,
  setPointLogs
}) => {
  const [newAssignmentModal, setNewAssignmentModal] = useState<boolean>(false);
  const [submissionModal, setSubmissionModal] = useState<Assignment | null>(null);

  const [newHw, setNewHw] = useState<{
    title: string;
    subject: string;
    description: string;
    dueDate: string;
    rewardPoints: number;
  }>({
    title: '',
    subject: 'Toán',
    description: '',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    rewardPoints: 5
  });

  // Tạo bài tập mới
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHw.title) return;

    const assignment: Assignment = {
      id: `hw-${Date.now()}`,
      title: newHw.title,
      subject: newHw.subject,
      description: newHw.description,
      dueDate: newHw.dueDate,
      rewardPoints: Number(newHw.rewardPoints) || 5,
      completedStudentIds: [],
      createdAt: new Date().toISOString().slice(0, 10)
    };

    const updated = [assignment, ...assignments];
    setAssignments(updated);
    storage.saveAssignments(updated);
    soundEngine.playPointGain();

    setNewAssignmentModal(false);
    setNewHw({
      title: '',
      subject: 'Toán',
      description: '',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
      rewardPoints: 5
    });
  };

  // Toggle nộp bài cho học sinh
  const handleToggleSubmission = (assignment: Assignment, student: Student) => {
    const isCompleted = assignment.completedStudentIds.includes(student.id);

    let updatedStudentIds: string[];
    let pointDelta: number;

    if (isCompleted) {
      // Bỏ tích -> trừ lại điểm
      updatedStudentIds = assignment.completedStudentIds.filter(id => id !== student.id);
      pointDelta = -assignment.rewardPoints;
      soundEngine.playPointDeduct();
    } else {
      // Tích hoàn thành -> cộng điểm
      updatedStudentIds = [...assignment.completedStudentIds, student.id];
      pointDelta = assignment.rewardPoints;
      soundEngine.playPointGain();
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    }

    // Cập nhật assignment
    const updatedAssignments = assignments.map(a => 
      a.id === assignment.id ? { ...a, completedStudentIds: updatedStudentIds } : a
    );
    setAssignments(updatedAssignments);
    storage.saveAssignments(updatedAssignments);

    // Cập nhật student
    const newPoints = Math.max(0, student.points + pointDelta);
    const updatedStudents = students.map(s => 
      s.id === student.id ? { ...s, points: newPoints, stars: Math.floor(newPoints / 10) } : s
    );
    setStudents(updatedStudents);
    storage.saveStudents(updatedStudents);

    // Thêm log nếu cộng điểm
    if (pointDelta > 0) {
      const newLog: PointLog = {
        id: `log-${Date.now()}-${student.id}`,
        studentId: student.id,
        criterionId: `hw-${assignment.id}`,
        criterionName: `Hoàn thành bài tập: ${assignment.title}`,
        points: pointDelta,
        timestamp: new Date().toISOString()
      };
      const updatedLogs = [newLog, ...pointLogs];
      setPointLogs(updatedLogs);
      storage.savePointLogs(updatedLogs);
    }

    if (submissionModal && submissionModal.id === assignment.id) {
      setSubmissionModal({ ...submissionModal, completedStudentIds: updatedStudentIds });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white/80 backdrop-blur rounded-2xl p-4 sm:p-5 shadow-md border border-amber-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-amber-950 font-serif flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-600" />
            <span>Nhiệm Vụ Rèn Luyện & Giao Bài Tập</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Giao bài tập về nhà, theo dõi tiến độ và tự động cộng hoa điểm thưởng khi hoàn thành
          </p>
        </div>

        <button
          onClick={() => setNewAssignmentModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-amber-700 hover:from-red-700 hover:to-amber-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md border border-red-500 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Giao Bài Mới</span>
        </button>
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {assignments.map(hw => {
          const completedCount = hw.completedStudentIds.length;
          const totalCount = students.length;
          const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <div
              key={hw.id}
              id={`card-assignment-${hw.id}`}
              className="bg-white rounded-3xl p-5 shadow-md border-2 border-amber-200 hover:border-amber-400 hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                {/* Subject & Points Tag */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-full border border-amber-300">
                    Môn: {hw.subject}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    +{hw.rewardPoints} Điểm
                  </span>
                </div>

                <h3 className="font-black text-lg text-slate-900 mb-2 leading-snug">{hw.title}</h3>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed line-clamp-3 font-serif">
                  {hw.description}
                </p>

                {/* Due Date Tag */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Hạn nộp: <b>{hw.dueDate}</b></span>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                    <span>Đã nộp bài:</span>
                    <span>{completedCount}/{totalCount} ({completionRate}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-green-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action: Check submissions */}
              <button
                onClick={() => setSubmissionModal(hw)}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-amber-950 font-bold rounded-xl text-xs sm:text-sm shadow-md border border-amber-400 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <UserCheck className="w-4 h-4 text-amber-950" />
                <span>Chấm Điểm & Nộp Bài ({completedCount} em)</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: GIAO BÀI TẬP MỚI */}
      {newAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-amber-400 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setNewAssignmentModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-800 text-center mb-4">
              Giao Nhiệm Vụ Mới Cho Lớp
            </h3>

            <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Môn Học</label>
                <select
                  value={newHw.subject}
                  onChange={e => setNewHw({ ...newHw, subject: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Toán">Toán</option>
                  <option value="Tiếng Việt">Tiếng Việt</option>
                  <option value="Mĩ thuật">Mĩ thuật</option>
                  <option value="Tiếng Anh">Tiếng Anh</option>
                  <option value="Tự nhiên & Xã hội">Tự nhiên & Xã hội</option>
                  <option value="Đạo đức">Đạo đức</option>
                  <option value="Hoạt động trải nghiệm">Hoạt động trải nghiệm</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu Đề Bài Tập</label>
                <input
                  type="text"
                  required
                  value={newHw.title}
                  onChange={e => setNewHw({ ...newHw, title: e.target.value })}
                  placeholder="e.g. Ôn tập bảng nhân & câu đố dân gian"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô Tả Chi Tiết Yêu Cầu</label>
                <textarea
                  rows={3}
                  value={newHw.description}
                  onChange={e => setNewHw({ ...newHw, description: e.target.value })}
                  placeholder="Ghi rõ bài tập trang mấy SGK hoặc nhiệm vụ cần làm..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-serif"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hạn Nộp</label>
                  <input
                    type="date"
                    required
                    value={newHw.dueDate}
                    onChange={e => setNewHw({ ...newHw, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hoa Điểm Thưởng</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newHw.rewardPoints}
                    onChange={e => setNewHw({ ...newHw, rewardPoints: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewAssignmentModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md"
                >
                  Tạo Nhiệm Vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CHẤM BÀI VÀ ĐÁNH DẤU NỘP BÀI TẬP */}
      {submissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border-4 border-amber-400 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSubmissionModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                Chấm Điểm: Môn {submissionModal.subject}
              </span>
              <h3 className="text-xl font-black text-slate-800 mt-2">
                {submissionModal.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tích chọn học sinh đã nộp bài để tự động cộng <b>+{submissionModal.rewardPoints} Hoa Điểm</b>
              </p>
            </div>

            {/* Checklist Students */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {students.map(student => {
                const isCompleted = submissionModal.completedStudentIds.includes(student.id);
                const av = AVATAR_OPTIONS.find(a => a.id === student.avatar) || AVATAR_OPTIONS[0];

                return (
                  <div
                    key={student.id}
                    onClick={() => handleToggleSubmission(submissionModal, student)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                      isCompleted
                        ? 'border-emerald-400 bg-emerald-50/70'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                        isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <span className="text-xl">{av.emoji}</span>
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{student.name}</div>
                        <div className="text-[10px] text-slate-400">{student.role}</div>
                      </div>
                    </div>

                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      isCompleted ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isCompleted ? `+${submissionModal.rewardPoints} đ` : 'Chưa nộp'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
