import React, { useEffect } from 'react';
import { Trophy, Crown, Award, X, Sparkles, Star, Users, Scroll } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student, Group, ClassConfig } from '../../types';
import { ChibiAvatar } from '../ChibiAvatar';
import { soundEngine } from '../../utils/soundEngine';

interface WeeklySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  groups: Group[];
  config: ClassConfig;
  customBg?: string;
  onOpenCertificate: (student: Student) => void;
}

export const WeeklySummaryModal: React.FC<WeeklySummaryModalProps> = ({
  isOpen,
  onClose,
  students,
  groups,
  config,
  onOpenCertificate
}) => {
  useEffect(() => {
    if (isOpen) {
      soundEngine.playRoyalFanfare();
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sortedStudents = [...students].sort((a, b) => b.points - a.points);
  const top1 = sortedStudents[0];
  const top2 = sortedStudents[1];
  const top3 = sortedStudents[2];

  // Group standings
  const groupStandings = groups.map(g => {
    const members = students.filter(s => s.groupId === g.id);
    const total = members.reduce((sum, s) => sum + s.points, 0);
    return { group: g, total, count: members.length };
  }).sort((a, b) => b.total - a.total);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-b from-[#FFFDF7] to-[#FFF5E6] rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border-4 border-amber-400 relative max-h-[92vh] overflow-y-auto font-serif text-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-amber-100 text-amber-900 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-200 text-amber-950 font-sans font-black text-xs uppercase tracking-widest mb-2 border border-amber-400">
            <Crown className="w-4 h-4 text-amber-900 animate-bounce" />
            <span>LỄ TỔNG KẾT & CHỐT ĐIỂM TUẦN</span>
            <Crown className="w-4 h-4 text-amber-900 animate-bounce" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-black font-brand text-red-900 mb-1">
            Bảng Vàng Thi Đua Tuần Này
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-sans">
            Lớp {config.className} • {config.schoolName} • Giáo viên: {config.teacherName}
          </p>
        </div>

        {/* Podium Tam Khôi */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end max-w-xl mx-auto mb-8 pt-4">
          {/* Top 2 */}
          {top2 && (
            <div className="order-2 sm:order-1 flex flex-col items-center">
              <ChibiAvatar points={top2.points} gender={top2.gender} size="lg" />
              <div className="mt-2 font-bold text-slate-800 text-sm">{top2.name}</div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">
                🥈 Bảng Nhãn
              </span>
              <div className="text-xs font-black text-amber-900 mt-0.5">🌸 {top2.points} đ</div>
              <button
                onClick={() => onOpenCertificate(top2)}
                className="mt-2 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-300 flex items-center gap-1 font-sans"
              >
                <Scroll className="w-3 h-3" />
                <span>Chiếu chỉ</span>
              </button>
            </div>
          )}

          {/* Top 1 */}
          {top1 && (
            <div className="order-1 sm:order-2 flex flex-col items-center -mt-4">
              <div className="text-2xl mb-1 animate-bounce">👑</div>
              <ChibiAvatar points={top1.points} gender={top1.gender} size="xl" showAura={true} />
              <div className="mt-2 font-black text-red-900 text-base">{top1.name}</div>
              <span className="text-xs font-black px-3 py-0.5 bg-yellow-300 text-amber-950 rounded-full border border-yellow-500 shadow-xs">
                🏆 Trạng Nguyên
              </span>
              <div className="text-sm font-black text-red-700 mt-1">🌸 {top1.points} đ</div>
              <button
                onClick={() => onOpenCertificate(top1)}
                className="mt-2 px-3 py-1 bg-amber-950 hover:bg-amber-900 text-yellow-300 text-xs font-bold rounded-xl border border-yellow-400 flex items-center gap-1 font-sans"
              >
                <Scroll className="w-3.5 h-3.5" />
                <span>Chiếu chỉ</span>
              </button>
            </div>
          )}

          {/* Top 3 */}
          {top3 && (
            <div className="order-3 sm:order-3 flex flex-col items-center">
              <ChibiAvatar points={top3.points} gender={top3.gender} size="lg" />
              <div className="mt-2 font-bold text-slate-800 text-sm">{top3.name}</div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full">
                🥉 Thám Hoa
              </span>
              <div className="text-xs font-black text-amber-900 mt-0.5">🌸 {top3.points} đ</div>
              <button
                onClick={() => onOpenCertificate(top3)}
                className="mt-2 px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-900 text-[10px] font-bold rounded-lg border border-amber-300 flex items-center gap-1 font-sans"
              >
                <Scroll className="w-3 h-3" />
                <span>Chiếu chỉ</span>
              </button>
            </div>
          )}
        </div>

        {/* Group Standings */}
        <div className="bg-amber-100/60 rounded-2xl p-4 mb-6 border border-amber-300 font-sans">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-3 flex items-center gap-1.5 font-serif">
            <Users className="w-4 h-4 text-amber-700" />
            <span>Xếp Hạng Thi Đua 4 Tổ Tuần Này</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            {groupStandings.map((st, i) => (
              <div key={st.group.id} className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-xs">
                <div className="text-base mb-0.5">{st.group.icon}</div>
                <div className="font-bold text-slate-800">{st.group.name.split(':')[0]}</div>
                <div className="text-[10px] text-amber-700 font-bold mt-0.5">
                  {i === 0 ? '🥇 Dẫn đầu' : `Hạng ${i + 1}`}
                </div>
                <div className="font-black text-amber-950 mt-1">{st.total} điểm</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 font-sans">
          <button
            onClick={() => {
              soundEngine.playFestiveDrum();
              confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
            }}
            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-amber-950 font-black text-xs sm:text-sm rounded-xl shadow-md border border-amber-400 flex items-center justify-center gap-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-950" />
            <span>Tung Pháo Hoa Chúc Mừng</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
